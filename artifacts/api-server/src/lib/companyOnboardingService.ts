import {
  db,
  companiesTable,
  employeesTable,
  companySubscriptionsTable,
  employeeBandsTable,
  courseAssignmentsTable,
  enrollmentsTable,
} from "@workspace/db";
import { eq, and, count } from "drizzle-orm";

export type OnboardingStage =
  | "company_created"
  | "profile_incomplete"
  | "subscription_required"
  | "admin_ready"
  | "employees_pending"
  | "course_assignment_pending"
  | "ready_for_learning"
  | "active";

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
  const isProfileComplete = Boolean(company.name && company.slug && company.industry);
  if (isProfileComplete) {
    completedSteps.push("profile_complete");
  } else {
    incompleteSteps.push("profile_complete");
    blockingIssues.push("Company profile details (industry or name) are incomplete.");
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
  const hasActiveSubscription = Boolean(activeSub);

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

  const hasAdmin = employees.some((e) => e.role === "admin");
  if (hasAdmin) {
    completedSteps.push("admin_assigned");
  } else {
    incompleteSteps.push("admin_assigned");
    blockingIssues.push("No company administrator has been assigned.");
  }

  const currentCount = employees.length;
  const remaining = Math.max(0, limit - currentCount);

  // 4. Employee pending vs accepted check
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
  let stage: OnboardingStage = "company_created";
  let recommendedNextAction = "Complete company profile details.";

  if (!isProfileComplete) {
    stage = "profile_incomplete";
    recommendedNextAction = "Complete company profile details.";
  } else if (!hasActiveSubscription) {
    stage = "subscription_required";
    recommendedNextAction = "Select a subscription plan and employee band.";
  } else if (!hasAdmin) {
    stage = "admin_ready";
    recommendedNextAction = "Assign a company administrator.";
  } else if (!hasEmployees) {
    stage = "employees_pending";
    recommendedNextAction = "Invite employees individually or bulk-import via CSV.";
  } else if (!hasAssignedCourses) {
    stage = "course_assignment_pending";
    recommendedNextAction = "Assign Sustainability Foundations (ELH-01) to your team.";
  } else if (acceptedEmployees.length === 0) {
    stage = "ready_for_learning";
    recommendedNextAction = "Share activation links with invited team members.";
  } else {
    stage = "active";
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
