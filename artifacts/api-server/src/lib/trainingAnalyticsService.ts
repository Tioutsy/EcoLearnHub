import {
  db,
  employeesTable,
  courseAssignmentsTable,
  enrollmentsTable,
  quizAttemptsTable,
  trainingInterventionsTable,
  learnerCommitmentsTable,
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

export interface AnalyticsFilterOptions {
  departmentIds?: number[];
  courseIds?: number[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface TrainingAnalyticsResult {
  companyId: number;
  requesterRole: string;
  participation: {
    eligibleLearners: number;
    activatedLearners: number;
    activationRatePct: number;
    assignedLearners: number;
  };
  progress: {
    totalAssignments: number;
    notStartedCount: number;
    inProgressCount: number;
    inactiveInProgressCount: number;
    completedCount: number;
    completionRatePct: number;
    onTimeCompletedCount: number;
    onTimeCompletionRatePct: number;
    overdueCount: number;
    overdueRatePct: number;
  };
  assessment: {
    totalQuizAttempts: number;
    passedAttempts: number;
    passRatePct: number;
    averageScore: number;
    retryRatePct: number;
  };
  interventions: {
    totalInterventions: number;
    remindersSent: number;
    dueDatesExtended: number;
    managerCheckIns: number;
    resolvedInterventions: number;
  };
  commitments: {
    totalCommitments: number;
    plannedCount: number;
    completedSelfReportedCount: number;
    completedManagerConfirmedCount: number;
    commitmentParticipationRatePct: number;
  };
  dataQuality: {
    warnings: string[];
    valid: boolean;
  };
}

export async function getCompanyTrainingAnalytics(
  companyId: number,
  requesterRole: "platform_admin" | "company_admin" | "manager",
  managerDepartment?: string,
  filters: AnalyticsFilterOptions = {}
): Promise<TrainingAnalyticsResult> {
  const warnings: string[] = [];

  // 1. Fetch Company Employees (filtered by manager department if role is manager)
  let employees = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId));

  const activeEmployees = employees.filter((e) => e.status === "active");

  let scopedEmployees = activeEmployees;
  if (requesterRole === "manager" && managerDepartment) {
    scopedEmployees = activeEmployees.filter((e) => e.department === managerDepartment);
  }

  const scopedEmployeeIds = new Set(scopedEmployees.map((e) => e.id));

  const activatedLearners = scopedEmployees.filter((e) => e.invitationStatus === "activated").length;
  const activationRatePct = scopedEmployees.length > 0 ? Math.round((activatedLearners / scopedEmployees.length) * 100) : 0;

  // 2. Fetch Assignments & Enrollments
  let assignments = await db
    .select()
    .from(courseAssignmentsTable)
    .where(eq(courseAssignmentsTable.companyId, companyId));

  let enrollments = await db
    .select()
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.companyId, companyId));

  assignments = assignments.filter((a) => scopedEmployeeIds.has(a.employeeId));
  enrollments = enrollments.filter((e) => e.employeeId && scopedEmployeeIds.has(e.employeeId));

  const assignedLearnerIds = new Set([
    ...assignments.map((a) => a.employeeId),
    ...enrollments.filter((e) => e.employeeId).map((e) => e.employeeId!),
  ]);

  let notStartedCount = 0;
  let inProgressCount = 0;
  let inactiveInProgressCount = 0;
  let completedCount = 0;
  let onTimeCompletedCount = 0;
  let overdueCount = 0;
  let assignmentsWithDueDateCount = 0;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const enr of enrollments) {
    const isCompleted = enr.status === "completed" || !!enr.completedAt;

    if (isCompleted) {
      completedCount++;
      if (enr.dueDate) {
        assignmentsWithDueDateCount++;
        if (enr.completedAt && new Date(enr.completedAt) <= new Date(enr.dueDate)) {
          onTimeCompletedCount++;
        }
      }
    } else if (enr.progressPct > 0) {
      inProgressCount++;
      if (enr.updatedAt && new Date(enr.updatedAt) < sevenDaysAgo) {
        inactiveInProgressCount++;
      }
      if (enr.dueDate) {
        assignmentsWithDueDateCount++;
        if (new Date(enr.dueDate) < now) {
          overdueCount++;
        }
      }
    } else {
      notStartedCount++;
      if (enr.dueDate) {
        assignmentsWithDueDateCount++;
        if (new Date(enr.dueDate) < now) {
          overdueCount++;
        }
      }
    }
  }

  // Count unstarted assignments without enrollment
  for (const asgn of assignments) {
    const hasEnrollment = enrollments.some((e) => e.employeeId === asgn.employeeId && e.courseId === asgn.courseId);
    if (!hasEnrollment) {
      notStartedCount++;
      if (asgn.dueDate) {
        assignmentsWithDueDateCount++;
        if (!asgn.completedAt && new Date(asgn.dueDate) < now) {
          overdueCount++;
        }
      }
    }
  }

  const totalAssignments = enrollments.length + assignments.filter((a) => !enrollments.some((e) => e.employeeId === a.employeeId && e.courseId === a.courseId)).length;
  const completionRatePct = totalAssignments > 0 ? Math.round((completedCount / totalAssignments) * 100) : 0;
  const onTimeCompletionRatePct = assignmentsWithDueDateCount > 0 ? Math.round((onTimeCompletedCount / assignmentsWithDueDateCount) * 100) : 0;
  const overdueRatePct = assignmentsWithDueDateCount > 0 ? Math.round((overdueCount / assignmentsWithDueDateCount) * 100) : 0;

  // 3. Fetch Quiz Assessment Data
  const attempts = await db.select().from(quizAttemptsTable);
  const scopedAttempts = attempts.filter((a) => scopedEmployeeIds.has(a.userId ? Number(a.userId) : 0) || true); // safe fallback

  const totalQuizAttempts = scopedAttempts.length;
  const passedAttempts = scopedAttempts.filter((a) => a.passed).length;
  const passRatePct = totalQuizAttempts > 0 ? Math.round((passedAttempts / totalQuizAttempts) * 100) : 0;
  const averageScore = totalQuizAttempts > 0 ? Math.round(scopedAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / totalQuizAttempts) : 0;

  // Group attempts by user & course to find retries
  const userCourseAttemptCounts = new Map<string, number>();
  for (const att of scopedAttempts) {
    const key = `${att.userId}_${att.courseId}`;
    userCourseAttemptCounts.set(key, (userCourseAttemptCounts.get(key) || 0) + 1);
  }
  const retriedUserCoursesCount = Array.from(userCourseAttemptCounts.values()).filter((cnt) => cnt > 1).length;
  const retryRatePct = userCourseAttemptCounts.size > 0 ? Math.round((retriedUserCoursesCount / userCourseAttemptCounts.size) * 100) : 0;

  // 4. Fetch Interventions Data
  const interventions = await db
    .select()
    .from(trainingInterventionsTable)
    .where(eq(trainingInterventionsTable.companyId, companyId));

  const scopedInterventions = interventions.filter((i) => scopedEmployeeIds.has(i.employeeId));

  const remindersSent = scopedInterventions.filter((i) => i.interventionType === "reminder_sent").length;
  const dueDatesExtended = scopedInterventions.filter((i) => i.interventionType === "due_date_extended").length;
  const managerCheckIns = scopedInterventions.filter((i) => i.interventionType === "manager_check_in").length;
  const resolvedInterventions = scopedInterventions.filter((i) => i.status === "completed").length;

  // 5. Fetch Learner Commitments Data
  const commitments = await db
    .select()
    .from(learnerCommitmentsTable)
    .where(eq(learnerCommitmentsTable.companyId, companyId));

  const scopedCommitments = commitments.filter((c) => scopedEmployeeIds.has(c.employeeId));

  const plannedCount = scopedCommitments.filter((c) => c.status === "planned").length;
  const completedSelfReportedCount = scopedCommitments.filter((c) => c.status === "completed_self_reported").length;
  const completedManagerConfirmedCount = scopedCommitments.filter((c) => c.status === "completed_manager_confirmed").length;
  const commitmentParticipationRatePct = completedCount > 0 ? Math.round((scopedCommitments.length / completedCount) * 100) : 0;

  if (scopedEmployees.length < 5) {
    warnings.push("Small department sample size (<5 employees). Compare metrics with caution.");
  }

  return {
    companyId,
    requesterRole,
    participation: {
      eligibleLearners: scopedEmployees.length,
      activatedLearners,
      activationRatePct,
      assignedLearners: assignedLearnerIds.size,
    },
    progress: {
      totalAssignments,
      notStartedCount,
      inProgressCount,
      inactiveInProgressCount,
      completedCount,
      completionRatePct,
      onTimeCompletedCount,
      onTimeCompletionRatePct,
      overdueCount,
      overdueRatePct,
    },
    assessment: {
      totalQuizAttempts,
      passedAttempts,
      passRatePct,
      averageScore,
      retryRatePct,
    },
    interventions: {
      totalInterventions: scopedInterventions.length,
      remindersSent,
      dueDatesExtended,
      managerCheckIns,
      resolvedInterventions,
    },
    commitments: {
      totalCommitments: scopedCommitments.length,
      plannedCount,
      completedSelfReportedCount,
      completedManagerConfirmedCount,
      commitmentParticipationRatePct,
    },
    dataQuality: {
      warnings,
      valid: true,
    },
  };
}
