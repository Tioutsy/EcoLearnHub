import {
  db,
  companiesTable,
  employeesTable,
  courseAssignmentsTable,
  enrollmentsTable,
  companySubscriptionsTable,
  employeeBandsTable,
  subscriptionPlansTable,
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { getCompanyOnboardingStatus } from "./companyOnboardingService";

export interface CompanyAdminOverview {
  companyId: number;
  companyName: string;
  planName: string;
  employeeBandLimit: number;
  seatsUsed: number;
  seatsRemaining: number;
  activeEmployeesCount: number;
  pendingInvitationsCount: number;
  deactivatedEmployeesCount: number;
  employeesWithoutTrainingCount: number;
  totalAssignedCoursesCount: number;
  notStartedCoursesCount: number;
  inProgressCoursesCount: number;
  completedCoursesCount: number;
  overdueAssignmentsCount: number;
  onboardingStatus: any;
  recommendedActions: string[];
}

export async function getCompanyAdminOverview(companyId: number): Promise<CompanyAdminOverview> {
  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.id, companyId))
    .limit(1);

  if (!company) {
    throw new Error(`Company with ID ${companyId} not found`);
  }

  // 1. Subscription & Capacity
  const subs = await db
    .select({
      status: companySubscriptionsTable.status,
      planName: subscriptionPlansTable.name,
      maxEmployees: employeeBandsTable.maximumEmployees,
    })
    .from(companySubscriptionsTable)
    .leftJoin(subscriptionPlansTable, eq(companySubscriptionsTable.subscriptionPlanId, subscriptionPlansTable.id))
    .leftJoin(employeeBandsTable, eq(companySubscriptionsTable.employeeBandId, employeeBandsTable.id))
    .where(eq(companySubscriptionsTable.companyId, companyId));

  const activeSub = subs.find((s) => s.status === "ACTIVE" || s.status === "PENDING");
  const planName = activeSub?.planName ?? "Essential Tier";
  const employeeBandLimit = activeSub?.maxEmployees ?? company.maxEmployees ?? 50;

  // 2. Employees breakdown
  const employees = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId));

  const activeEmployees = employees.filter((e) => e.status !== "deactivated");
  const deactivatedEmployees = employees.filter((e) => e.status === "deactivated");
  const pendingInvitations = activeEmployees.filter((e) => e.invitationStatus === "invited");

  const seatsUsed = activeEmployees.length;
  const seatsRemaining = Math.max(0, employeeBandLimit - seatsUsed);

  // 3. Assignments & Enrollments
  const assignments = await db
    .select()
    .from(courseAssignmentsTable)
    .where(eq(courseAssignmentsTable.companyId, companyId));

  const enrollments = await db
    .select()
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.companyId, companyId));

  const assignedEmployeeIds = new Set([
    ...assignments.map((a) => a.employeeId),
    ...enrollments.filter((e) => e.employeeId).map((e) => e.employeeId!),
  ]);

  const employeesWithoutTrainingCount = activeEmployees.filter((e) => !assignedEmployeeIds.has(e.id)).length;

  let notStartedCoursesCount = 0;
  let inProgressCoursesCount = 0;
  let completedCoursesCount = 0;
  let overdueAssignmentsCount = 0;

  const now = new Date();

  for (const enr of enrollments) {
    if (enr.status === "completed" || enr.completedAt) {
      completedCoursesCount++;
    } else if (enr.progressPct > 0) {
      inProgressCoursesCount++;
    } else {
      notStartedCoursesCount++;
    }

    if (enr.dueDate && new Date(enr.dueDate) < now && !enr.completedAt && enr.status !== "completed") {
      overdueAssignmentsCount++;
    }
  }

  // Count unstarted assignments that have no enrollment record yet
  for (const asgn of assignments) {
    const hasEnrollment = enrollments.some((e) => e.employeeId === asgn.employeeId && e.courseId === asgn.courseId);
    if (!hasEnrollment) {
      notStartedCoursesCount++;
      if (asgn.dueDate && new Date(asgn.dueDate) < now && !asgn.completedAt) {
        overdueAssignmentsCount++;
      }
    }
  }

  const onboardingStatus = await getCompanyOnboardingStatus(companyId);

  const recommendedActions: string[] = [onboardingStatus.recommendedNextAction];
  if (overdueAssignmentsCount > 0) {
    recommendedActions.push(`Send training reminders to learners with ${overdueAssignmentsCount} overdue course assignments.`);
  }
  if (employeesWithoutTrainingCount > 0) {
    recommendedActions.push(`Assign Sustainability Foundations (ELH-01) to ${employeesWithoutTrainingCount} employees without assigned training.`);
  }

  return {
    companyId,
    companyName: company.name,
    planName,
    employeeBandLimit,
    seatsUsed,
    seatsRemaining,
    activeEmployeesCount: activeEmployees.length,
    pendingInvitationsCount: pendingInvitations.length,
    deactivatedEmployeesCount: deactivatedEmployees.length,
    employeesWithoutTrainingCount,
    totalAssignedCoursesCount: assignments.length + enrollments.length,
    notStartedCoursesCount,
    inProgressCoursesCount,
    completedCoursesCount,
    overdueAssignmentsCount,
    onboardingStatus,
    recommendedActions,
  };
}
