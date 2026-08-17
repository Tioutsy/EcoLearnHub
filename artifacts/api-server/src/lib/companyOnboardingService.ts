import {
  db,
  companiesTable,
  employeesTable,
  companySubscriptionsTable,
  subscriptionPlansTable,
  employeeBandsTable,
  planPricesTable,
  coursesTable,
  enrollmentsTable,
  courseAssignmentsTable,
} from "@workspace/db";
import { eq, and, or, sql } from "drizzle-orm";
import { assignTrainingToCompanyEmployees } from "./assignmentService.js";
import {
  calculateSubscriptionPricing,
  calculateAuthoritativePricing,
  PricingCalculationResult,
  EnterprisePricingBreakdown,
} from "./subscriptionPricingService";

export type OnboardingStage =
  | "DRAFT"
  | "PENDING_ADMIN_INVITATION"
  | "ADMIN_INVITED"
  | "ADMIN_INVITATION_ACCEPTED"
  | "ORGANISATION_SETUP_IN_PROGRESS"
  | "READY_FOR_EMPLOYEE_SETUP"
  | "READY_FOR_COURSE_ASSIGNMENT"
  | "ACTIVE"
  | "company_created"
  | "profile_incomplete"
  | "subscription_required"
  | "admin_ready"
  | "employees_pending"
  | "course_assignment_pending"
  | "ready_for_learning";

export interface CompanyOnboardingStatus {
  companyId: number;
  companyName: string;
  stage: OnboardingStage;
  completedSteps: string[];
  incompleteSteps: string[];
  blockingIssues: string[];
  recommendedNextAction: string;
  employeeCapacity: {
    currentCount: number;
    limit: number;
    remaining: number;
  };
  hasAdmin: boolean;
  hasActiveSubscription: boolean;
  hasAssignedCourses: boolean;
  activeLearnerCount: number;
}

export async function getCompanyOnboardingStatus(companyId: number): Promise<CompanyOnboardingStatus> {
  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.id, companyId))
    .limit(1);

  if (!company) {
    throw new Error(`Company with ID ${companyId} not found`);
  }

  const completedSteps: string[] = [];
  const incompleteSteps: string[] = [];
  const blockingIssues: string[] = [];

  // 1. Profile check
  const isProfileComplete = Boolean(company.name && company.slug);
  if (isProfileComplete) {
    completedSteps.push("profile_complete");
  } else {
    incompleteSteps.push("profile_complete");
    blockingIssues.push("Company profile details (name or slug) are incomplete.");
  }

  // 2. Subscription & Band check
  const subscriptions = await db
    .select({
      status: companySubscriptionsTable.status,
      maxEmployees: employeeBandsTable.maximumEmployees,
    })
    .from(companySubscriptionsTable)
    .leftJoin(employeeBandsTable, eq(companySubscriptionsTable.employeeBandId, employeeBandsTable.id))
    .where(eq(companySubscriptionsTable.companyId, companyId));

  const activeSub = subscriptions.find((s) => s.status === "ACTIVE" || s.status === "PENDING");
  const hasActiveSubscription = Boolean(activeSub) || Boolean(company.planId);

  const limit = activeSub?.maxEmployees ?? company.maxEmployees ?? 50;

  if (hasActiveSubscription) {
    completedSteps.push("subscription_active");
  } else {
    incompleteSteps.push("subscription_active");
    blockingIssues.push("Company has no active subscription plan.");
  }

  // 3. Admin check
  const employees = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId));

  const hasAdmin = employees.some((e) => e.role === "admin" && e.status === "active");
  if (hasAdmin) {
    completedSteps.push("admin_assigned");
  } else {
    incompleteSteps.push("admin_assigned");
    blockingIssues.push("No active company administrator has been assigned.");
  }

  const currentCount = employees.length;
  const remaining = Math.max(0, limit - currentCount);

  // 4. Employee check
  const acceptedEmployees = employees.filter((e) => e.invitationStatus === "accepted");
  const hasEmployees = employees.length > 0;
  if (hasEmployees) {
    completedSteps.push("employees_invited");
  } else {
    incompleteSteps.push("employees_invited");
  }

  // 5. Course Assignment check
  const assignments = await db
    .select({ id: courseAssignmentsTable.id })
    .from(courseAssignmentsTable)
    .where(eq(courseAssignmentsTable.companyId, companyId));

  const enrollments = await db
    .select({ id: enrollmentsTable.id, status: enrollmentsTable.status })
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.companyId, companyId));

  const hasAssignedCourses = assignments.length > 0 || enrollments.length > 0;
  if (hasAssignedCourses) {
    completedSteps.push("courses_assigned");
  } else {
    incompleteSteps.push("courses_assigned");
  }

  const activeLearnerCount = acceptedEmployees.length;

  let stage: OnboardingStage = "DRAFT";
  let recommendedNextAction = "Complete company profile details.";

  if (!isProfileComplete) {
    stage = "DRAFT";
    recommendedNextAction = "Complete company profile details.";
  } else if (!hasActiveSubscription) {
    stage = "ORGANISATION_SETUP_IN_PROGRESS";
    recommendedNextAction = "Select a subscription plan and employee band.";
  } else if (!hasAdmin) {
    stage = "PENDING_ADMIN_INVITATION";
    recommendedNextAction = "Assign a company administrator.";
  } else if (!hasEmployees) {
    stage = "READY_FOR_EMPLOYEE_SETUP";
    recommendedNextAction = "Invite employees individually or bulk-import via CSV.";
  } else if (!hasAssignedCourses) {
    stage = "READY_FOR_COURSE_ASSIGNMENT";
    recommendedNextAction = "Assign Sustainability Foundations (ELH-01) to your team.";
  } else {
    stage = "ACTIVE";
    recommendedNextAction = "Monitor team training progress on your Company Dashboard.";
  }

  return {
    companyId,
    companyName: company.name,
    stage,
    completedSteps,
    incompleteSteps,
    blockingIssues,
    recommendedNextAction,
    employeeCapacity: {
      currentCount,
      limit,
      remaining,
    },
    hasAdmin,
    hasActiveSubscription,
    hasAssignedCourses,
    activeLearnerCount,
  };
}

export async function validateEmployeeCapacity(
  companyId: number,
  countToAdd: number = 1
): Promise<{ allowed: boolean; limit: number; currentCount: number; remaining: number }> {
  const status = await getCompanyOnboardingStatus(companyId);
  const allowed = status.employeeCapacity.remaining >= countToAdd;
  return {
    allowed,
    limit: status.employeeCapacity.limit,
    currentCount: status.employeeCapacity.currentCount,
    remaining: status.employeeCapacity.remaining,
  };
}

export async function reconcileTenantIdentity(
  clerkUserId: string,
  email: string,
  companyId: number
): Promise<{ reconciled: boolean; role: string }> {
  const clauses = [eq(employeesTable.clerkUserId, clerkUserId)];
  if (email) {
    clauses.push(sql`lower(${employeesTable.email}) = ${email.toLowerCase()}`);
  }

  const [existing] = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.companyId, companyId), or(...clauses)))
    .limit(1);

  if (existing) {
    if (!existing.clerkUserId) {
      await db
        .update(employeesTable)
        .set({ clerkUserId, invitationStatus: "accepted", invitationAcceptedAt: new Date() })
        .where(eq(employeesTable.id, existing.id));
    }
    return { reconciled: true, role: existing.role };
  }

  return { reconciled: false, role: "employee" };
}

export interface OnboardCompanyInput {
  userId: string;
  email: string | null;
  adminName: string;
  companyName: string;
  employeeCount?: number;
  employeeBandCode?: string; // 'UP_TO_25' | 'FROM_26_TO_50' | 'FROM_51_TO_80' | 'FROM_81_TO_120' | 'OVER_120'
  planCode?: string; // 'ESSENTIAL' | 'PROFESSIONAL' | 'COMPLETE'
  billingInterval?: string; // 'MONTHLY' | 'YEARLY'
}

export interface OnboardCompanyResult {
  outcome: "success" | "tailored_contact_required" | "already_onboarded";
  message?: string;
  company?: any;
  employee?: any;
  subscription?: any;
  monthlyAmount?: number | null;
  pricingBreakdown?: PricingCalculationResult | EnterprisePricingBreakdown;
  onboardingStage?: string;
}

export async function onboardCompany(input: OnboardCompanyInput): Promise<OnboardCompanyResult> {
  const { userId, email, adminName, companyName, employeeCount: rawCount, employeeBandCode, planCode = "ESSENTIAL" } = input;

  if (!userId) {
    throw new Error("Authentication required");
  }
  if (!companyName || !companyName.trim()) {
    throw new Error("Company name is required");
  }

  // 1. Check if user already has an employee record
  const [existingEmp] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.clerkUserId, userId))
    .limit(1);

  if (existingEmp) {
    if (existingEmp.role === "admin") {
      const [existingComp] = await db
        .select()
        .from(companiesTable)
        .where(eq(companiesTable.id, existingEmp.companyId))
        .limit(1);

      const [existingSub] = await db
        .select()
        .from(companySubscriptionsTable)
        .where(eq(companySubscriptionsTable.companyId, existingEmp.companyId))
        .limit(1);

      return {
        outcome: "already_onboarded",
        message: "Account is already linked to an active company as administrator",
        company: existingComp,
        employee: existingEmp,
        subscription: existingSub,
        onboardingStage: "onboarding-complete",
      };
    } else {
      throw new Error("Existing employee membership found. Contact your company administrator.");
    }
  }

  // 2. Resolve Employee Band & Headcount
  let bandCode = employeeBandCode;
  let employeeCount = rawCount;

  if (!bandCode) {
    const countToCheck = employeeCount || 10;
    if (countToCheck <= 25) bandCode = "UP_TO_25";
    else if (countToCheck <= 50) bandCode = "FROM_26_TO_50";
    else if (countToCheck <= 80) bandCode = "FROM_51_TO_80";
    else if (countToCheck <= 120) bandCode = "FROM_81_TO_120";
    else bandCode = "OVER_120";
  }

  if (employeeCount === undefined) {
    if (bandCode === "UP_TO_25") employeeCount = 25;
    else if (bandCode === "FROM_26_TO_50") employeeCount = 50;
    else if (bandCode === "FROM_51_TO_80") employeeCount = 80;
    else if (bandCode === "FROM_81_TO_120") employeeCount = 120;
    else employeeCount = 150;
  }

  // 3. Resolve Employee Band Record & Subscription Plan Record from DB
  const [band] = await db
    .select()
    .from(employeeBandsTable)
    .where(eq(employeeBandsTable.code, bandCode))
    .limit(1);

  if (!band) {
    throw new Error(`Invalid employee band code: ${bandCode}`);
  }

  const [plan] = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.code, planCode))
    .limit(1);

  const planId = plan?.id ?? 1;

  // 4. Derive Authoritative Pricing Server-Side
  const pricingBreakdown = calculateAuthoritativePricing({
    planCode: plan?.code ?? "ESSENTIAL",
    employeeCount,
    bandCode: band.code,
    billingInterval: input.billingInterval,
  });

  const includedCapacity = pricingBreakdown.includedMaxEmployees;

  // 5. Real Database Transaction: Company -> First Admin Employee -> Subscription
  const slugBase = companyName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  return await db.transaction(async (tx) => {
    const [company] = await tx
      .insert(companiesTable)
      .values({
        name: companyName.trim(),
        slug,
        employeeCount: employeeCount,
        maxEmployees: includedCapacity,
        planId,
      })
      .returning();

    const [adminEmployee] = await tx
      .insert(employeesTable)
      .values({
        companyId: company.id,
        clerkUserId: userId,
        email: email ? email.toLowerCase() : `admin_${company.id}@example.com`,
        name: adminName || "Company Admin",
        role: "admin",
        status: "active",
        invitationStatus: "accepted",
        invitationAcceptedAt: new Date(),
      })
      .returning();

    const [subscription] = await tx
      .insert(companySubscriptionsTable)
      .values({
        companyId: company.id,
        subscriptionPlanId: planId,
        employeeBandId: band.id,
        status: "PENDING", // Initialized as PENDING until commercial payment confirmation
        currency: "MUR",
        billingInterval: pricingBreakdown.billingInterval,
        discountPercentage: String(pricingBreakdown.discountPercentage),
        agreedMonthlyAmount: pricingBreakdown.finalMonthlyAmount.toFixed(2),
        agreedYearlyAmount: pricingBreakdown.finalYearlyAmount.toFixed(2),
        pricingSource: "STANDARD",
        startsAt: new Date(),
      })
      .returning();

    return {
      outcome: "success",
      company,
      employee: adminEmployee,
      subscription,
      monthlyAmount: pricingBreakdown.finalMonthlyAmount,
      pricingBreakdown,
      onboardingStage: "onboarding-complete",
    };
  });
}

export async function assignStarterCourse(
  companyId: number,
  adminUserId: string,
  courseCode: string = "ELH-01",
  dueDateDays: number = 30
): Promise<{ assignedCount: number; courseTitle: string }> {
  const [adminEmp] = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.clerkUserId, adminUserId), eq(employeesTable.companyId, companyId)))
    .limit(1);

  if (!adminEmp || adminEmp.role !== "admin") {
    throw new Error("Company administrator access required");
  }

  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.courseCode, courseCode))
    .limit(1);

  if (!course) {
    throw new Error(`Starter course ${courseCode} not found`);
  }

  // Get active employees in company
  const activeEmployees = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.companyId, companyId), eq(employeesTable.status, "active")));

  if (activeEmployees.length === 0) {
    return { assignedCount: 0, courseTitle: course.title };
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + dueDateDays);

  const summary = await assignTrainingToCompanyEmployees({
    companyId,
    assignedByUserId: adminUserId,
    assignedByRole: "admin",
    courseIds: [course.id],
    employeeIds: activeEmployees.map((e) => e.id),
    dueDate: dueDate,
    assignmentSource: "required",
  });

  return {
    assignedCount: summary.assignedCount,
    courseTitle: course.title,
  };
}
