import {
  db,
  companiesTable,
  employeesTable,
  courseAssignmentsTable,
  enrollmentsTable,
  notificationDeliveryLogsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

export interface EngagementDiagnosticIssue {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category:
    | "INCONSISTENT_INVITATION"
    | "DUPLICATE_ASSIGNMENT"
    | "COMPLETED_MARKED_OVERDUE"
    | "DEACTIVATED_REMINDED"
    | "MISSING_COMPLETION_VERSION";
  companyId: number;
  message: string;
}

export interface EngagementDiagnosticReport {
  timestamp: string;
  totalEmployeesAudited: number;
  totalAssignmentsAudited: number;
  totalDeliveryLogsAudited: number;
  criticalIssuesCount: number;
  highIssuesCount: number;
  mediumIssuesCount: number;
  lowIssuesCount: number;
  valid: boolean;
  issues: EngagementDiagnosticIssue[];
}

export async function runLearnerEngagementDiagnostics(): Promise<EngagementDiagnosticReport> {
  const issues: EngagementDiagnosticIssue[] = [];

  const employees = await db.select().from(employeesTable);
  const assignments = await db.select().from(courseAssignmentsTable);
  const enrollments = await db.select().from(enrollmentsTable);
  const deliveryLogs = await db.select().from(notificationDeliveryLogsTable);

  const now = new Date();

  // 1. Employee Invitation Consistency Check
  for (const emp of employees) {
    if (emp.invitationStatus === "accepted" && !emp.clerkUserId && emp.role !== "employee") {
      issues.push({
        severity: "MEDIUM",
        category: "INCONSISTENT_INVITATION",
        companyId: emp.companyId,
        message: `Employee '${emp.name}' (ID ${emp.id}) accepted invitation but has missing clerkUserId context.`,
      });
    }
  }

  // 2. Duplicate Assignment Check
  const assignmentMap = new Map<string, number>();
  for (const asgn of assignments) {
    const key = `${asgn.companyId}_${asgn.employeeId}_${asgn.courseId}`;
    const count = (assignmentMap.get(key) ?? 0) + 1;
    assignmentMap.set(key, count);
    if (count > 1) {
      issues.push({
        severity: "HIGH",
        category: "DUPLICATE_ASSIGNMENT",
        companyId: asgn.companyId,
        message: `Employee ID ${asgn.employeeId} has duplicate active assignments for course ${asgn.courseId}.`,
      });
    }
  }

  // 3. Completed Course Marked Overdue Check
  for (const asgn of assignments) {
    const enr = enrollments.find((e) => e.employeeId === asgn.employeeId && e.courseId === asgn.courseId);
    const isCompleted = asgn.completedAt || (enr && (enr.status === "completed" || enr.completedAt));

    if (isCompleted && asgn.dueDate && new Date(asgn.dueDate) < now) {
      // Completed assignments must never be treated as overdue
      if (enr && enr.status === "overdue") {
        issues.push({
          severity: "HIGH",
          category: "COMPLETED_MARKED_OVERDUE",
          companyId: asgn.companyId,
          message: `Completed assignment for employee ID ${asgn.employeeId} course ${asgn.courseId} is invalidly marked overdue in enrollments.`,
        });
      }
    }
  }

  // 4. Deactivated Employee Reminder Check
  const deactivatedEmpIds = new Set(employees.filter((e) => e.status === "deactivated").map((e) => e.id));
  for (const log of deliveryLogs) {
    if (log.employeeId && deactivatedEmpIds.has(log.employeeId) && log.status === "delivered") {
      // Low diagnostic alert for past dispatches on deactivated employees
      issues.push({
        severity: "LOW",
        category: "DEACTIVATED_REMINDED",
        companyId: log.companyId,
        message: `Reminder log ${log.id} was dispatched for employee ${log.employeeId} who is currently deactivated.`,
      });
    }
  }

  const criticalIssuesCount = issues.filter((i) => i.severity === "CRITICAL").length;
  const highIssuesCount = issues.filter((i) => i.severity === "HIGH").length;
  const mediumIssuesCount = issues.filter((i) => i.severity === "MEDIUM").length;
  const lowIssuesCount = issues.filter((i) => i.severity === "LOW").length;

  return {
    timestamp: new Date().toISOString(),
    totalEmployeesAudited: employees.length,
    totalAssignmentsAudited: assignments.length,
    totalDeliveryLogsAudited: deliveryLogs.length,
    criticalIssuesCount,
    highIssuesCount,
    mediumIssuesCount,
    lowIssuesCount,
    valid: criticalIssuesCount === 0 && highIssuesCount === 0,
    issues,
  };
}
