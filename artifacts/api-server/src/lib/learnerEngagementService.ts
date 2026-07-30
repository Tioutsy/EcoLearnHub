import {
  db,
  employeesTable,
  courseAssignmentsTable,
  enrollmentsTable,
  coursesTable,
  learningPathsTable,
  learningPathCoursesTable,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { checkCourseEligibility } from "./prerequisites";
import { evaluateCourseAccess } from "./courseAccessService";

export type LearnerEngagementState =
  | "invited"
  | "invitation_expired"
  | "invitation_revoked"
  | "deactivated"
  | "activated"
  | "assigned_not_started"
  | "in_progress"
  | "inactive_in_progress"
  | "due_soon"
  | "overdue"
  | "quiz_failed"
  | "completed"
  | "pathway_in_progress"
  | "pathway_completed";

export interface LearnerEngagementSummary {
  employeeId: number;
  companyId: number;
  email: string;
  name: string;
  primaryState: LearnerEngagementState;
  primaryNextAction: {
    action: "start_course" | "continue_course" | "retry_quiz" | "view_certificate" | "continue_pathway" | "catalog";
    courseId?: number;
    courseCode?: string;
    courseTitle?: string;
    reason: string;
  };
  totalAssigned: number;
  totalCompleted: number;
  totalOverdue: number;
  totalDueSoon: number;
  lastActiveAt?: Date | null;
}

export async function getLearnerEngagementSummary(
  companyId: number,
  employeeId: number
): Promise<LearnerEngagementSummary> {
  const [emp] = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.id, employeeId), eq(employeesTable.companyId, companyId)))
    .limit(1);

  if (!emp) {
    throw new Error(`Employee with ID ${employeeId} not found in company ${companyId}`);
  }

  // 1. Account / Invitation status checks
  if (emp.status === "deactivated") {
    return {
      employeeId: emp.id,
      companyId,
      email: emp.email,
      name: emp.name,
      primaryState: "deactivated",
      primaryNextAction: { action: "catalog", reason: "Employee account is deactivated" },
      totalAssigned: 0,
      totalCompleted: emp.completedCourses ?? 0,
      totalOverdue: 0,
      totalDueSoon: 0,
      lastActiveAt: emp.lastActiveAt,
    };
  }

  if (emp.invitationStatus === "revoked") {
    return {
      employeeId: emp.id,
      companyId,
      email: emp.email,
      name: emp.name,
      primaryState: "invitation_revoked",
      primaryNextAction: { action: "catalog", reason: "Invitation has been revoked by admin" },
      totalAssigned: 0,
      totalCompleted: 0,
      totalOverdue: 0,
      totalDueSoon: 0,
    };
  }

  if (emp.invitationStatus === "invited") {
    // Check if expired (e.g. 14 days)
    const expiryWindow = 14 * 24 * 60 * 60 * 1000;
    const isExpired = emp.invitationSentAt && Date.now() - new Date(emp.invitationSentAt).getTime() > expiryWindow;
    const state: LearnerEngagementState = isExpired ? "invitation_expired" : "invited";

    return {
      employeeId: emp.id,
      companyId,
      email: emp.email,
      name: emp.name,
      primaryState: state,
      primaryNextAction: { action: "catalog", reason: isExpired ? "Invitation expired" : "Accept invitation to begin" },
      totalAssigned: 0,
      totalCompleted: 0,
      totalOverdue: 0,
      totalDueSoon: 0,
    };
  }

  // 2. Fetch assignments & enrollments
  const assignments = await db
    .select()
    .from(courseAssignmentsTable)
    .where(and(eq(courseAssignmentsTable.companyId, companyId), eq(courseAssignmentsTable.employeeId, emp.id)));

  const enrollments = await db
    .select()
    .from(enrollmentsTable)
    .where(and(eq(enrollmentsTable.companyId, companyId), eq(enrollmentsTable.employeeId, emp.id)));

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  let totalCompleted = 0;
  let totalOverdue = 0;
  let totalDueSoon = 0;

  // Classify course statuses
  const evaluatedCourses: Array<{
    courseId: number;
    state: LearnerEngagementState;
    dueDate?: Date | null;
    progressPct: number;
    lastActiveAt?: Date | null;
  }> = [];

  for (const asgn of assignments) {
    const enr = enrollments.find((e) => e.courseId === asgn.courseId);
    const isCompleted = (enr && (enr.status === "completed" || enr.completedAt)) || asgn.completedAt;

    if (isCompleted) {
      totalCompleted++;
      evaluatedCourses.push({
        courseId: asgn.courseId,
        state: "completed",
        progressPct: 100,
      });
      continue;
    }

    const dueDate = asgn.dueDate ?? enr?.dueDate;
    const progressPct = enr?.progressPct ?? 0;

    let crsState: LearnerEngagementState = "assigned_not_started";

    if (progressPct > 0) {
      crsState = "in_progress";
      // Inactivity check (7+ days without activity)
      if (emp.lastActiveAt && now.getTime() - new Date(emp.lastActiveAt).getTime() > 7 * 24 * 60 * 60 * 1000) {
        crsState = "inactive_in_progress";
      }
    }

    if (dueDate) {
      const dueTime = new Date(dueDate).getTime();
      if (dueTime < now.getTime()) {
        crsState = "overdue";
        totalOverdue++;
      } else if (dueTime <= sevenDaysFromNow.getTime()) {
        totalDueSoon++;
        crsState = "due_soon";
      }
    }

    evaluatedCourses.push({
      courseId: asgn.courseId,
      state: crsState,
      dueDate: dueDate ? new Date(dueDate) : null,
      progressPct,
    });
  }

  // Determine Primary Engagement State & Primary Next Action
  let primaryState: LearnerEngagementState = "activated";
  let primaryNextAction: LearnerEngagementSummary["primaryNextAction"] = {
    action: "catalog",
    reason: "No active assignments pending",
  };

  // Prioritization order:
  // 1. Overdue required assignment
  // 2. Due soon required assignment
  // 3. In progress assignment
  // 4. Assigned not started
  // 5. Default ELH-01 starting course
  // 6. Catalogue / Completed
  const overdueItem = evaluatedCourses.find((c) => c.state === "overdue");
  const dueSoonItem = evaluatedCourses.find((c) => c.state === "due_soon");
  const inProgressItem = evaluatedCourses.find((c) => c.state === "in_progress" || c.state === "inactive_in_progress");
  const notStartedItem = evaluatedCourses.find((c) => c.state === "assigned_not_started");

  if (overdueItem) {
    primaryState = "overdue";
    primaryNextAction = {
      action: inProgressItem ? "continue_course" : "start_course",
      courseId: overdueItem.courseId,
      reason: "Urgent: Assignment is past due date",
    };
  } else if (dueSoonItem) {
    primaryState = "due_soon";
    primaryNextAction = {
      action: inProgressItem ? "continue_course" : "start_course",
      courseId: dueSoonItem.courseId,
      reason: "Assignment due in next 7 days",
    };
  } else if (inProgressItem) {
    primaryState = inProgressItem.state;
    primaryNextAction = {
      action: "continue_course",
      courseId: inProgressItem.courseId,
      reason: "Continue your active training module",
    };
  } else if (notStartedItem) {
    primaryState = "assigned_not_started";
    primaryNextAction = {
      action: "start_course",
      courseId: notStartedItem.courseId,
      reason: "Start your newly assigned course",
    };
  } else if (totalCompleted > 0) {
    primaryState = "completed";
    primaryNextAction = {
      action: "view_certificate",
      reason: "View your earned certificates",
    };
  }

  // Hydrate course title for primary next action if courseId present
  if (primaryNextAction.courseId) {
    const [crs] = await db
      .select({ courseCode: coursesTable.courseCode, title: coursesTable.title })
      .from(coursesTable)
      .where(eq(coursesTable.id, primaryNextAction.courseId))
      .limit(1);

    if (crs) {
      primaryNextAction.courseCode = crs.courseCode ?? undefined;
      primaryNextAction.courseTitle = crs.title;
    }
  }

  return {
    employeeId: emp.id,
    companyId,
    email: emp.email,
    name: emp.name,
    primaryState,
    primaryNextAction,
    totalAssigned: assignments.length,
    totalCompleted,
    totalOverdue,
    totalDueSoon,
    lastActiveAt: emp.lastActiveAt,
  };
}
