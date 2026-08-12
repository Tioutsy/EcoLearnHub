import { CompanyAccess, HttpError } from "../access";
import { db } from "@workspace/db";
import {
  companiesTable,
  employeesTable,
  courseAssignmentsTable,
  enrollmentsTable,
  quizAttemptsTable,
  coursesTable,
  notificationDeliveryLogsTable,
  auditLogsTable,
} from "@workspace/db";
import { eq, and, gte } from "drizzle-orm";
import { calculateDeterministicTrainingMetrics } from "./trainingInsightsService";
import { dispatchNotificationDelivery } from "../notificationDeliveryService";
import { assignTrainingToCompanyEmployees } from "../assignmentService";
import { logAuditEvent } from "../auditLogService";

export type TrainingManagementActionType =
  | "VIEW_OVERDUE"
  | "VIEW_NOT_STARTED"
  | "VIEW_STRUGGLING_LEARNERS"
  | "SEND_REMINDER"
  | "RECOMMEND_REFRESHER"
  | "ASSIGN_REFRESHER"
  | "VIEW_COURSE_PERFORMANCE"
  | "VIEW_DEPARTMENT_PERFORMANCE";

export interface TrainingManagementAction {
  actionType: TrainingManagementActionType;
  targetType: "overdue_assignments" | "unstarted_assignments" | "struggling_learners" | "course" | "department" | "company";
  targetCount?: number;
  courseId?: number;
  courseCode?: string;
  courseTitle?: string;
  departmentName?: string;
  employeeIds?: number[];
  label: string;
  description: string;
  requiresConfirmation: boolean;
  confirmationPrompt?: string;
  targetUrl: string;
}

export interface OverdueLearnerRecord {
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  department: string;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  assignmentDate: string | null;
  dueDate: string | null;
  daysOverdue: number;
  status: "overdue";
}

export interface NotStartedLearnerRecord {
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  department: string;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  assignmentDate: string | null;
  dueDate: string | null;
  status: "not_started";
}

export interface StrugglingLearnerRecord {
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  department: string;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  totalAttempts: number;
  maxQuizScore: number;
  passed: boolean;
  supportRecommendation: string;
  status: "needs_support";
}

export interface SendReminderBatchOptions {
  employeeIds?: number[];
  courseId?: number;
  category: "overdue" | "not_started" | "manual";
  customNote?: string;
  source: "training-insight" | "manual" | "AI-copilot";
}

export interface ReminderDispatchDetail {
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  courseTitle: string;
  status: "delivered" | "skipped" | "failed";
  reason?: string;
}

export interface SendReminderBatchResult {
  attemptedCount: number;
  deliveredCount: number;
  skippedCount: number;
  failedCount: number;
  details: ReminderDispatchDetail[];
}

export interface AssignRefresherBatchOptions {
  employeeIds: number[];
  courseId: number;
  dueDate?: string;
  source: "training-insight" | "manual" | "AI-copilot";
}

export interface FollowUpAuditRecord {
  id: number | string;
  action: string;
  actorUserId: string;
  actorRole: string;
  targetType: string;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  timestamp: string;
}

/**
 * Validates role and department scope for manager or admin.
 * Employees are denied access to management actions.
 */
function assertManagementAccess(access: CompanyAccess): void {
  if (access.role === "employee") {
    throw new HttpError(403, "Access denied: Management actions are available to company administrators and managers only.");
  }
}

/**
 * Filter employee list based on manager department scope if applicable.
 * Prevents managers from accessing employees outside their department.
 */
function filterEmployeesByRoleScope(employees: any[], access: CompanyAccess): any[] {
  if (access.role === "manager" && access.employee?.department) {
    const mgrDept = access.employee.department.trim().toLowerCase();
    return employees.filter((e) => e.department && e.department.trim().toLowerCase() === mgrDept);
  }
  return employees;
}

/**
 * Resolves available allowlisted management actions based on company metrics.
 * Actions are deterministic and data-driven — not invented by AI.
 */
export async function resolveCompanyManagementActions(access: CompanyAccess): Promise<{
  companyId: number;
  resolvedAt: string;
  actions: TrainingManagementAction[];
}> {
  assertManagementAccess(access);
  const companyId = access.companyId;

  const metrics = await calculateDeterministicTrainingMetrics(companyId);
  const actions: TrainingManagementAction[] = [];

  // Action 1: Overdue Training Actions
  if (metrics.organisationSummary.overdueLearnersCount > 0) {
    actions.push({
      actionType: "VIEW_OVERDUE",
      targetType: "overdue_assignments",
      targetCount: metrics.organisationSummary.overdueLearnersCount,
      label: `View ${metrics.organisationSummary.overdueLearnersCount} Overdue Learners`,
      description: "Inspect active learners with overdue course assignments.",
      requiresConfirmation: false,
      targetUrl: "/company/training-follow-up?tab=overdue",
    });

    actions.push({
      actionType: "SEND_REMINDER",
      targetType: "overdue_assignments",
      targetCount: metrics.organisationSummary.overdueLearnersCount,
      label: `Send Reminders to ${metrics.organisationSummary.overdueLearnersCount} Overdue Learners`,
      description: "Dispatch automated email notifications encouraging learners to complete overdue training.",
      requiresConfirmation: true,
      confirmationPrompt: `Send training reminders to ${metrics.organisationSummary.overdueLearnersCount} employee(s) with overdue assignments?`,
      targetUrl: "/company/training-follow-up?tab=overdue",
    });
  }

  // Action 2: Not-Started Training Actions
  if (metrics.learnerRiskSummary.assignedNotStartedCount > 0) {
    actions.push({
      actionType: "VIEW_NOT_STARTED",
      targetType: "unstarted_assignments",
      targetCount: metrics.learnerRiskSummary.assignedNotStartedCount,
      label: `View ${metrics.learnerRiskSummary.assignedNotStartedCount} Unstarted Assignments`,
      description: "Review employees who have been assigned courses but have not initiated study.",
      requiresConfirmation: false,
      targetUrl: "/company/training-follow-up?tab=not-started",
    });

    actions.push({
      actionType: "SEND_REMINDER",
      targetType: "unstarted_assignments",
      targetCount: metrics.learnerRiskSummary.assignedNotStartedCount,
      label: `Send Welcome Reminders (${metrics.learnerRiskSummary.assignedNotStartedCount} unstarted)`,
      description: "Send initial engagement reminders to learners with unstarted course assignments.",
      requiresConfirmation: true,
      confirmationPrompt: `Send welcome reminders to ${metrics.learnerRiskSummary.assignedNotStartedCount} employee(s) with unstarted courses?`,
      targetUrl: "/company/training-follow-up?tab=not-started",
    });
  }

  // Action 3: Struggling Learners & Course Refresher Actions
  const strugglingCourse = metrics.coursePerformance.find(
    (c) => c.failureRatePct >= 25 || c.avgQuizAttempts >= 2.0 || c.overdueAssignmentsCount > 0
  );

  if (metrics.learnerRiskSummary.repeatQuizFailuresCount > 0 || strugglingCourse) {
    actions.push({
      actionType: "VIEW_STRUGGLING_LEARNERS",
      targetType: "struggling_learners",
      targetCount: metrics.learnerRiskSummary.repeatQuizFailuresCount || 1,
      label: "View Learners Needing Support",
      description: "Review employees showing multiple quiz retries or low quiz scores.",
      requiresConfirmation: false,
      targetUrl: "/company/training-follow-up?tab=struggling",
    });

    if (strugglingCourse) {
      actions.push({
        actionType: "RECOMMEND_REFRESHER",
        targetType: "course",
        courseId: strugglingCourse.courseId,
        courseCode: strugglingCourse.courseCode,
        courseTitle: strugglingCourse.title,
        label: `Recommend Refresher: ${strugglingCourse.courseCode}`,
        description: `Consider assigning a refresher module for ${strugglingCourse.courseCode} (${strugglingCourse.title}) due to ${strugglingCourse.failureRatePct}% failure rate.`,
        requiresConfirmation: true,
        confirmationPrompt: `Assign a refresher course for ${strugglingCourse.courseCode} to selected employees?`,
        targetUrl: `/company/training-follow-up?tab=refresher&courseId=${strugglingCourse.courseId}`,
      });
    }
  }

  // Action 4: Department Gaps View
  const laggingDept = metrics.departmentPerformance.find((d) => d.overdueCount > 0);
  if (laggingDept) {
    actions.push({
      actionType: "VIEW_DEPARTMENT_PERFORMANCE",
      targetType: "department",
      departmentName: laggingDept.departmentName,
      targetCount: laggingDept.overdueCount,
      label: `View Department Gaps: ${laggingDept.departmentName}`,
      description: `Inspect learning compliance bottlenecks in ${laggingDept.departmentName}.`,
      requiresConfirmation: false,
      targetUrl: "/company/training-follow-up?tab=departments",
    });
  }

  // Always include general course performance action
  actions.push({
    actionType: "VIEW_COURSE_PERFORMANCE",
    targetType: "company",
    label: "View All Course Performance Metrics",
    description: "Inspect completion rates, average scores, and quiz attempts across all catalog courses.",
    requiresConfirmation: false,
    targetUrl: "/courses",
  });

  return {
    companyId,
    resolvedAt: new Date().toISOString(),
    actions,
  };
}

/**
 * Returns detailed records of overdue learners for a company.
 * Scoped to manager's department if role is manager.
 */
export async function getOverdueLearnersForCompany(
  access: CompanyAccess,
  filterCourseId?: number
): Promise<OverdueLearnerRecord[]> {
  assertManagementAccess(access);
  const companyId = access.companyId;
  const now = new Date();

  const rawEmployees = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.companyId, companyId), eq(employeesTable.status, "active")));

  const employees = filterEmployeesByRoleScope(rawEmployees, access);
  const empMap = new Map(employees.map((e) => [e.id, e]));
  const empIds = Array.from(empMap.keys());

  if (empIds.length === 0) return [];

  const catalog = await db.select().from(coursesTable);
  const courseMap = new Map(catalog.map((c) => [c.id, c]));

  const enrollments = await db
    .select()
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.companyId, companyId));

  const assignments = await db
    .select()
    .from(courseAssignmentsTable)
    .where(eq(courseAssignmentsTable.companyId, companyId));

  const records: OverdueLearnerRecord[] = [];
  const processedKeys = new Set<string>();

  for (const enr of enrollments) {
    if (!enr.employeeId || !empMap.has(enr.employeeId)) continue;
    if (filterCourseId && enr.courseId !== filterCourseId) continue;

    const isCompleted = enr.status === "completed" || !!enr.completedAt;
    if (isCompleted) continue;

    if (enr.dueDate && new Date(enr.dueDate) < now) {
      const emp = empMap.get(enr.employeeId)!;
      const course = courseMap.get(enr.courseId);
      const key = `${emp.id}_${enr.courseId}`;
      processedKeys.add(key);

      const dueDateTime = new Date(enr.dueDate).getTime();
      const daysOverdue = Math.max(1, Math.floor((now.getTime() - dueDateTime) / (1000 * 60 * 60 * 24)));

      records.push({
        employeeId: emp.id,
        employeeName: emp.name,
        employeeEmail: emp.email,
        department: emp.department || "General",
        courseId: enr.courseId,
        courseCode: course?.courseCode || `CRS-${enr.courseId}`,
        courseTitle: course?.title || "Assigned Course",
        assignmentDate: enr.createdAt ? new Date(enr.createdAt).toISOString() : null,
        dueDate: new Date(enr.dueDate).toISOString(),
        daysOverdue,
        status: "overdue",
      });
    }
  }

  for (const asgn of assignments) {
    if (!empMap.has(asgn.employeeId)) continue;
    if (filterCourseId && asgn.courseId !== filterCourseId) continue;
    if (asgn.completedAt) continue;

    const key = `${asgn.employeeId}_${asgn.courseId}`;
    if (processedKeys.has(key)) continue;

    if (asgn.dueDate && new Date(asgn.dueDate) < now) {
      const emp = empMap.get(asgn.employeeId)!;
      const course = courseMap.get(asgn.courseId);

      const dueDateTime = new Date(asgn.dueDate).getTime();
      const daysOverdue = Math.max(1, Math.floor((now.getTime() - dueDateTime) / (1000 * 60 * 60 * 24)));

      records.push({
        employeeId: emp.id,
        employeeName: emp.name,
        employeeEmail: emp.email,
        department: emp.department || "General",
        courseId: asgn.courseId,
        courseCode: course?.courseCode || `CRS-${asgn.courseId}`,
        courseTitle: course?.title || "Assigned Course",
        assignmentDate: asgn.createdAt ? new Date(asgn.createdAt).toISOString() : null,
        dueDate: new Date(asgn.dueDate).toISOString(),
        daysOverdue,
        status: "overdue",
      });
    }
  }

  return records.sort((a, b) => b.daysOverdue - a.daysOverdue);
}

/**
 * Returns detailed records of unstarted assigned training for a company.
 */
export async function getNotStartedLearnersForCompany(
  access: CompanyAccess,
  filterCourseId?: number
): Promise<NotStartedLearnerRecord[]> {
  assertManagementAccess(access);
  const companyId = access.companyId;

  const rawEmployees = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.companyId, companyId), eq(employeesTable.status, "active")));

  const employees = filterEmployeesByRoleScope(rawEmployees, access);
  const empMap = new Map(employees.map((e) => [e.id, e]));

  if (empMap.size === 0) return [];

  const catalog = await db.select().from(coursesTable);
  const courseMap = new Map(catalog.map((c) => [c.id, c]));

  const enrollments = await db
    .select()
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.companyId, companyId));

  const assignments = await db
    .select()
    .from(courseAssignmentsTable)
    .where(eq(courseAssignmentsTable.companyId, companyId));

  const records: NotStartedLearnerRecord[] = [];
  const processedKeys = new Set<string>();

  for (const enr of enrollments) {
    if (!enr.employeeId || !empMap.has(enr.employeeId)) continue;
    if (filterCourseId && enr.courseId !== filterCourseId) continue;

    if (enr.progressPct === 0 && enr.status !== "completed" && !enr.completedAt) {
      const emp = empMap.get(enr.employeeId)!;
      const course = courseMap.get(enr.courseId);
      const key = `${emp.id}_${enr.courseId}`;
      processedKeys.add(key);

      records.push({
        employeeId: emp.id,
        employeeName: emp.name,
        employeeEmail: emp.email,
        department: emp.department || "General",
        courseId: enr.courseId,
        courseCode: course?.courseCode || `CRS-${enr.courseId}`,
        courseTitle: course?.title || "Assigned Course",
        assignmentDate: enr.createdAt ? new Date(enr.createdAt).toISOString() : null,
        dueDate: enr.dueDate ? new Date(enr.dueDate).toISOString() : null,
        status: "not_started",
      });
    }
  }

  for (const asgn of assignments) {
    if (!empMap.has(asgn.employeeId)) continue;
    if (filterCourseId && asgn.courseId !== filterCourseId) continue;
    if (asgn.completedAt) continue;

    const key = `${asgn.employeeId}_${asgn.courseId}`;
    if (processedKeys.has(key)) continue;

    const emp = empMap.get(asgn.employeeId)!;
    const course = courseMap.get(asgn.courseId);

    records.push({
      employeeId: emp.id,
      employeeName: emp.name,
      employeeEmail: emp.email,
      department: emp.department || "General",
      courseId: asgn.courseId,
      courseCode: course?.courseCode || `CRS-${asgn.courseId}`,
      courseTitle: course?.title || "Assigned Course",
      assignmentDate: asgn.createdAt ? new Date(asgn.createdAt).toISOString() : null,
      dueDate: asgn.dueDate ? new Date(asgn.dueDate).toISOString() : null,
      status: "not_started",
    });
  }

  return records;
}

/**
 * Returns struggling learners needing support (quiz retries / low scores).
 */
export async function getStrugglingLearnersForCompany(
  access: CompanyAccess,
  filterCourseId?: number
): Promise<StrugglingLearnerRecord[]> {
  assertManagementAccess(access);
  const companyId = access.companyId;

  const rawEmployees = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.companyId, companyId), eq(employeesTable.status, "active")));

  const employees = filterEmployeesByRoleScope(rawEmployees, access);
  const empMap = new Map(employees.map((e) => [e.id, e]));
  const activeEmpIdsStr = new Set(employees.map((e) => String(e.id)));

  if (empMap.size === 0) return [];

  const catalog = await db.select().from(coursesTable);
  const courseMap = new Map(catalog.map((c) => [c.id, c]));

  const quizAttempts = await db.select().from(quizAttemptsTable);
  const scopedAttempts = quizAttempts.filter((att) => att.userId && activeEmpIdsStr.has(String(att.userId)));

  const userCourseStatsMap = new Map<string, { userId: string; courseId: number; attempts: number; maxScore: number; passed: boolean }>();

  for (const att of scopedAttempts) {
    if (filterCourseId && att.courseId !== filterCourseId) continue;

    const key = `${att.userId}_${att.courseId}`;
    const existing = userCourseStatsMap.get(key) || {
      userId: String(att.userId),
      courseId: att.courseId,
      attempts: 0,
      maxScore: 0,
      passed: false,
    };
    existing.attempts += 1;
    if (att.passed) existing.passed = true;
    if ((att.score || 0) > existing.maxScore) existing.maxScore = att.score || 0;
    userCourseStatsMap.set(key, existing);
  }

  const records: StrugglingLearnerRecord[] = [];

  for (const [_, stats] of userCourseStatsMap.entries()) {
    // Criteria: 2+ attempts and either failed or low score (<65%)
    if (stats.attempts >= 2 && (!stats.passed || stats.maxScore < 65)) {
      const empId = Number(stats.userId);
      const emp = empMap.get(empId);
      if (!emp) continue;

      const course = courseMap.get(stats.courseId);

      records.push({
        employeeId: emp.id,
        employeeName: emp.name,
        employeeEmail: emp.email,
        department: emp.department || "General",
        courseId: stats.courseId,
        courseCode: course?.courseCode || `CRS-${stats.courseId}`,
        courseTitle: course?.title || "Assigned Course",
        totalAttempts: stats.attempts,
        maxQuizScore: stats.maxScore,
        passed: stats.passed,
        supportRecommendation: "Additional training support or 1-on-1 review may be useful.",
        status: "needs_support",
      });
    }
  }

  return records.sort((a, b) => b.totalAttempts - a.totalAttempts);
}

/**
 * Dispatches training reminders in controlled batch with 24-hour duplicate protection.
 * State-changing action — requires explicit confirmation from the frontend before invocation.
 */
export async function sendTrainingReminderBatch(
  access: CompanyAccess,
  options: SendReminderBatchOptions
): Promise<SendReminderBatchResult> {
  assertManagementAccess(access);
  const companyId = access.companyId;
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Determine target employees
  let targetLearners: { employeeId: number; courseId: number }[] = [];

  if (options.employeeIds && options.employeeIds.length > 0) {
    const targetSet = new Set(options.employeeIds);

    if (options.category === "overdue") {
      const overdueList = await getOverdueLearnersForCompany(access, options.courseId);
      targetLearners = overdueList
        .filter((r) => targetSet.has(r.employeeId))
        .map((r) => ({ employeeId: r.employeeId, courseId: r.courseId }));
    } else if (options.category === "not_started") {
      const unstartedList = await getNotStartedLearnersForCompany(access, options.courseId);
      targetLearners = unstartedList
        .filter((r) => targetSet.has(r.employeeId))
        .map((r) => ({ employeeId: r.employeeId, courseId: r.courseId }));
    } else {
      // Manual list
      const rawEmployees = await db
        .select()
        .from(employeesTable)
        .where(and(eq(employeesTable.companyId, companyId), eq(employeesTable.status, "active")));
      const employees = filterEmployeesByRoleScope(rawEmployees, access);
      const matchedEmps = employees.filter((e) => targetSet.has(e.id));
      targetLearners = matchedEmps.map((e) => ({ employeeId: e.id, courseId: options.courseId || 1 }));
    }
  } else {
    if (options.category === "overdue") {
      const overdueList = await getOverdueLearnersForCompany(access, options.courseId);
      targetLearners = overdueList.map((r) => ({ employeeId: r.employeeId, courseId: r.courseId }));
    } else if (options.category === "not_started") {
      const unstartedList = await getNotStartedLearnersForCompany(access, options.courseId);
      targetLearners = unstartedList.map((r) => ({ employeeId: r.employeeId, courseId: r.courseId }));
    }
  }

  if (targetLearners.length === 0) {
    return {
      attemptedCount: 0,
      deliveredCount: 0,
      skippedCount: 0,
      failedCount: 0,
      details: [],
    };
  }

  const activeEmployees = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.companyId, companyId), eq(employeesTable.status, "active")));

  const empMap = new Map(activeEmployees.map((e) => [e.id, e]));

  const catalog = await db.select().from(coursesTable);
  const courseMap = new Map(catalog.map((c) => [c.id, c]));

  // Check recent delivery logs for 24-hour duplicate reminder protection
  const recentLogs = await db
    .select()
    .from(notificationDeliveryLogsTable)
    .where(
      and(
        eq(notificationDeliveryLogsTable.companyId, companyId),
        gte(notificationDeliveryLogsTable.attemptedAt, twentyFourHoursAgo)
      )
    );

  let deliveredCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const details: ReminderDispatchDetail[] = [];

  for (const target of targetLearners) {
    const emp = empMap.get(target.employeeId);
    if (!emp) {
      skippedCount++;
      details.push({
        employeeId: target.employeeId,
        employeeName: "Unknown",
        employeeEmail: "",
        courseTitle: "N/A",
        status: "skipped",
        reason: "Employee record not active or not found in company.",
      });
      continue;
    }

    const course = courseMap.get(target.courseId);
    const courseTitle = course?.title || "Sustainability Training Course";

    // Deduplication key — deterministic per employee/course/category/day
    const todayStr = now.toISOString().slice(0, 10);
    const dedupKey = `remind_comp_${companyId}_emp_${emp.id}_crs_${target.courseId}_cat_${options.category}_date_${todayStr}`;

    // 24-hour rate-limit duplicate check
    const recentDuplicate = recentLogs.find(
      (l) => l.employeeId === emp.id && l.deduplicationKey === dedupKey
    );

    if (recentDuplicate) {
      skippedCount++;
      details.push({
        employeeId: emp.id,
        employeeName: emp.name,
        employeeEmail: emp.email,
        courseTitle,
        status: "skipped",
        reason: "A reminder was already sent to this employee recently (within 24 hours).",
      });
      continue;
    }

    // Deterministic Email Subject & Body
    const customNoteText = options.customNote ? `\n\nAdministrator Note: ${options.customNote}` : "";
    const bodyText = `Hello ${emp.name},

This is a reminder that your assigned ELEVIO SKILLS course "${courseTitle}" is currently outstanding.

Please log in to your ELEVIO SKILLS account to continue your training.${customNoteText}

Thank you.

ELEVIO SKILLS
by Recyclean`;

    const dispatchRes = await dispatchNotificationDelivery({
      companyId,
      recipientEmployeeId: emp.id,
      recipientEmail: emp.email,
      recipientName: emp.name,
      notificationType: options.category === "overdue" ? "course_overdue" : "due_soon",
      deduplicationKey: dedupKey,
      relatedCourseId: target.courseId,
      templateData: {
        title: `Training reminder — ${courseTitle}`,
        message: bodyText,
        courseTitle,
      },
    });

    if (dispatchRes.delivered) {
      deliveredCount++;
      details.push({
        employeeId: emp.id,
        employeeName: emp.name,
        employeeEmail: emp.email,
        courseTitle,
        status: "delivered",
      });

      await logAuditEvent({
        companyId,
        actorUserId: access.userId,
        actorRole: access.role,
        action: "training.reminder_dispatched",
        targetType: "employee",
        targetId: emp.id,
        metadata: {
          recipientEmail: emp.email,
          courseId: target.courseId,
          courseTitle,
          category: options.category,
          source: options.source,
        },
      });
    } else if (dispatchRes.status === "skipped") {
      skippedCount++;
      details.push({
        employeeId: emp.id,
        employeeName: emp.name,
        employeeEmail: emp.email,
        courseTitle,
        status: "skipped",
        reason: dispatchRes.reason || "Reminder skipped.",
      });
    } else {
      failedCount++;
      details.push({
        employeeId: emp.id,
        employeeName: emp.name,
        employeeEmail: emp.email,
        courseTitle,
        status: "failed",
        reason: dispatchRes.reason || "Delivery failed via notification provider.",
      });
    }
  }

  return {
    attemptedCount: targetLearners.length,
    deliveredCount,
    skippedCount,
    failedCount,
    details,
  };
}

/**
 * Assigns refresher training to selected employees.
 * Preserves historical completions and certificates — does not delete past completion records.
 */
export async function assignRefresherTrainingBatch(
  access: CompanyAccess,
  options: AssignRefresherBatchOptions
): Promise<any> {
  assertManagementAccess(access);
  const companyId = access.companyId;

  // Validate course exists
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, options.courseId))
    .limit(1);

  if (!course) {
    throw new HttpError(404, "Target course for refresher assignment was not found.");
  }

  // Validate employees belong to company and are in manager scope
  const companyEmployees = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.companyId, companyId), eq(employeesTable.status, "active")));

  const empScope = filterEmployeesByRoleScope(companyEmployees, access);
  const validEmpIds = new Set(empScope.map((e) => e.id));

  const targetEmpIds = options.employeeIds.filter((id) => validEmpIds.has(id));
  if (targetEmpIds.length === 0) {
    throw new HttpError(400, "No valid active company employees selected for refresher assignment.");
  }

  const dueDateObj = options.dueDate ? new Date(options.dueDate) : null;

  // Assign training using the real application assignment service
  const summary = await assignTrainingToCompanyEmployees({
    companyId,
    assignedByUserId: access.userId,
    assignedByRole: access.role,
    courseIds: [options.courseId],
    employeeIds: targetEmpIds,
    dueDate: dueDateObj,
    assignmentSource: "refresher",
  });

  await logAuditEvent({
    companyId,
    actorUserId: access.userId,
    actorRole: access.role,
    action: "training.refresher_assigned",
    targetType: "course",
    targetId: options.courseId,
    metadata: {
      courseCode: course.courseCode,
      courseTitle: course.title,
      assignedCount: summary.assignedCount,
      skippedCount: summary.skippedCount,
      targetEmployeeIds: targetEmpIds,
      source: options.source,
    },
  });

  return {
    courseId: course.id,
    courseCode: course.courseCode,
    courseTitle: course.title,
    summary,
  };
}

/**
 * Retrieves audit history of management follow-up actions for a company.
 * Returns last 50 training-related audit events, most recent first.
 */
export async function getManagementFollowUpHistory(
  access: CompanyAccess
): Promise<FollowUpAuditRecord[]> {
  assertManagementAccess(access);
  const companyId = access.companyId;

  const logs = await db
    .select()
    .from(auditLogsTable)
    .where(eq(auditLogsTable.companyId, companyId));

  const followUpLogs = logs.filter(
    (l) =>
      l.action.startsWith("training.") ||
      l.action.startsWith("reminder.") ||
      l.action === "course.assigned"
  );

  followUpLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return followUpLogs.slice(0, 50).map((l) => ({
    id: l.id,
    action: l.action,
    actorUserId: l.actorUserId,
    actorRole: l.actorRole,
    targetType: l.targetType,
    targetId: l.targetId,
    metadata: l.metadata
      ? (typeof l.metadata === "string" ? JSON.parse(l.metadata) : (l.metadata as Record<string, unknown>))
      : null,
    timestamp: new Date(l.createdAt).toISOString(),
  }));
}
