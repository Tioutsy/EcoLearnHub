import {
  db,
  coursesTable,
  companySubscriptionsTable,
  subscriptionPlansTable,
  planCourseEntitlementsTable,
  companyPilotPassesTable,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { CompanyAccess } from "./access";
import { checkCourseEligibility } from "./prerequisites";
import { logger } from "./logger";

export interface CourseAccessDecision {
  allowed: boolean;
  reason:
    | "INCLUDED_IN_PLAN"
    | "PLAN_UPGRADE_REQUIRED"
    | "SUBSCRIPTION_INACTIVE"
    | "COMPANY_NOT_ASSIGNED"
    | "PREREQUISITE_REQUIRED"
    | "COURSE_UNAVAILABLE"
    | "UNAUTHORISED";
  requiredPlanCode?: "ESSENTIAL" | "PROFESSIONAL" | "COMPLETE";
  requiredPlanName?: string;
  missingPrerequisiteCourseIds?: number[];
  prerequisiteDetails?: any[];
}

export async function evaluateCourseAccess(
  courseId: number,
  accessContext: CompanyAccess | null
): Promise<CourseAccessDecision> {
  // 1. Authenticated platform administrators have immediate, full course access override
  if (accessContext && accessContext.role === "platform_admin") {
    return { allowed: true, reason: "INCLUDED_IN_PLAN" };
  }

  // 2. Check if course exists and is published
  const [course] = await db
    .select({
      id: coursesTable.id,
      courseCode: coursesTable.courseCode,
      isPublished: coursesTable.isPublished,
    })
    .from(coursesTable)
    .where(eq(coursesTable.id, courseId));

  if (!course || !course.isPublished) {
    return { allowed: false, reason: "COURSE_UNAVAILABLE" };
  }

  // Determine minimum required plan for this course across all entitlements
  const entitlements = await db
    .select({
      planId: planCourseEntitlementsTable.subscriptionPlanId,
      planCode: subscriptionPlansTable.code,
      planName: subscriptionPlansTable.name,
      displayOrder: subscriptionPlansTable.displayOrder,
    })
    .from(planCourseEntitlementsTable)
    .innerJoin(subscriptionPlansTable, eq(planCourseEntitlementsTable.subscriptionPlanId, subscriptionPlansTable.id))
    .where(eq(planCourseEntitlementsTable.courseId, courseId))
    .orderBy(subscriptionPlansTable.displayOrder);

  // Lowest plan that includes this course is the required plan
  const lowestEntitledPlan = entitlements[0];
  const requiredPlanCode = (lowestEntitledPlan?.planCode || "COMPLETE") as "ESSENTIAL" | "PROFESSIONAL" | "COMPLETE";
  const requiredPlanName = lowestEntitledPlan?.planName || "Complete";

  // 3. Resolve Company & Subscription (Fail closed: No implicit COMPLETE fallback)
  if (!accessContext || !accessContext.companyId) {
    return {
      allowed: false,
      reason: "COMPANY_NOT_ASSIGNED",
      requiredPlanCode,
      requiredPlanName,
    };
  }

  const matchingSubs = await db
    .select({
      status: companySubscriptionsTable.status,
      planCode: subscriptionPlansTable.code,
      planOrder: subscriptionPlansTable.displayOrder,
    })
    .from(companySubscriptionsTable)
    .innerJoin(subscriptionPlansTable, eq(companySubscriptionsTable.subscriptionPlanId, subscriptionPlansTable.id))
    .where(eq(companySubscriptionsTable.companyId, accessContext.companyId))
    .orderBy(
      desc(companySubscriptionsTable.updatedAt),
      desc(companySubscriptionsTable.id)
    );

  if (matchingSubs.length > 1) {
    logger.warn(
      { companyId: accessContext.companyId, count: matchingSubs.length },
      "Multiple company subscriptions found during course access evaluation. Selecting deterministic latest record."
    );
  }

  const activeSub = matchingSubs.find(
    (s) => s.status && (s.status.toUpperCase() === "ACTIVE" || s.status.toUpperCase() === "TRIAL")
  );

  if (!activeSub) {
    return {
      allowed: false,
      reason: "SUBSCRIPTION_INACTIVE",
      requiredPlanCode,
      requiredPlanName,
    };
  }

  const subscription = activeSub;
  const companyPlanCode = subscription.planCode;

  // 3b. Pilot Pass Verification (Expiry & Permitted Course Gating via central resolver)
  const { resolveCompanyPilotEntitlement } = await import("./pilotPassService");
  const pilotEntitlement = await resolveCompanyPilotEntitlement(accessContext.companyId);

  if (pilotEntitlement.isPilot && !pilotEntitlement.isConverted) {
    if (pilotEntitlement.isExpired || pilotEntitlement.isRevoked) {
      return {
        allowed: false,
        reason: "SUBSCRIPTION_INACTIVE",
        requiredPlanCode,
        requiredPlanName,
      };
    }

    if (pilotEntitlement.permittedCourseIds && pilotEntitlement.permittedCourseIds.length > 0) {
      if (!pilotEntitlement.permittedCourseIds.includes(courseId)) {
        return {
          allowed: false,
          reason: "PLAN_UPGRADE_REQUIRED",
          requiredPlanCode,
          requiredPlanName,
        };
      }
    }
  }

  // 4. Commercial Plan Entitlement Check
  const hasCommercialEntitlement = entitlements.some(e => e.planCode === companyPlanCode) || companyPlanCode === "COMPLETE";

  if (!hasCommercialEntitlement) {
    return {
      allowed: false,
      reason: "PLAN_UPGRADE_REQUIRED",
      requiredPlanCode,
      requiredPlanName,
    };
  }

  // 5. Learner Prerequisites Check
  const eligibility = await checkCourseEligibility(courseId, accessContext);
  if (!eligibility.eligible) {
    const missingIds = eligibility.prerequisites.filter(p => p.requirementType === "required" && !p.completed).map(p => p.courseId);
    return {
      allowed: false,
      reason: "PREREQUISITE_REQUIRED",
      requiredPlanCode,
      requiredPlanName,
      missingPrerequisiteCourseIds: missingIds,
      prerequisiteDetails: eligibility.prerequisites,
    };
  }

  return {
    allowed: true,
    reason: "INCLUDED_IN_PLAN",
    requiredPlanCode,
    requiredPlanName,
  };
}
