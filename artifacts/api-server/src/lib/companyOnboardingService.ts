import {
  db,
  companiesTable,
  employeesTable,
  companySubscriptionsTable,
  employeeBandsTable,
  courseAssignmentsTable,
  enrollmentsTable,
} from "@workspace/db";
import { eq, and, or, sql } from "drizzle-orm";

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

  // Determine stage & next action
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
