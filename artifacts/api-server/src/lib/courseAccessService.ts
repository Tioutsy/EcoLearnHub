import {
  db,
  coursesTable,
  companySubscriptionsTable,
  subscriptionPlansTable,
  planCourseEntitlementsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CompanyAccess } from "./access";
import { checkCourseEligibility } from "./prerequisites";

export interface CourseAccessDecision {
  allowed: boolean;
  reason:
    | "INCLUDED_IN_PLAN"
    | "PLAN_UPGRADE_REQUIRED"
    | "SUBSCRIPTION_INACTIVE"
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
  // 1. Platform admins always have full access
  if (accessContext && accessContext.role === "platform_admin") {
    const eligibility = await checkCourseEligibility(courseId, accessContext);
    if (!eligibility.eligible) {
      const missingIds = eligibility.prerequisites.filter(p => p.requirementType === "required" && !p.completed).map(p => p.courseId);
      return {
        allowed: false,
        reason: "PREREQUISITE_REQUIRED",
        missingPrerequisiteCourseIds: missingIds,
        prerequisiteDetails: eligibility.prerequisites,
      };
    }
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

  // 3. Resolve Company Subscription
  let companyPlanCode: string = "COMPLETE"; // Default for guest or individual learners if no company ID bound
  let isSubscriptionActive = true;

  if (accessContext && accessContext.companyId) {
    const subscription = await db
      .select({
        status: companySubscriptionsTable.status,
        planCode: subscriptionPlansTable.code,
        planOrder: subscriptionPlansTable.displayOrder,
      })
      .from(companySubscriptionsTable)
      .innerJoin(subscriptionPlansTable, eq(companySubscriptionsTable.subscriptionPlanId, subscriptionPlansTable.id))
      .where(eq(companySubscriptionsTable.companyId, accessContext.companyId))
      .limit(1)
      .then(r => r[0]);

    if (subscription) {
      companyPlanCode = subscription.planCode;
      if (subscription.status !== "ACTIVE" && subscription.status !== "PENDING") {
        isSubscriptionActive = false;
      }
    }
  }

  if (!isSubscriptionActive) {
    return {
      allowed: false,
      reason: "SUBSCRIPTION_INACTIVE",
      requiredPlanCode,
      requiredPlanName,
    };
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

  // 5. Hard Prerequisites Check
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
