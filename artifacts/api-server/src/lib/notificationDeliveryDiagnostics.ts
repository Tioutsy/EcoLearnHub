import {
  db,
  employeesTable,
  courseAssignmentsTable,
  notificationDeliveryLogsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

export interface DeliveryDiagnosticIssue {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category:
    | "STUCK_PROCESSING"
    | "EXCESSIVE_FAILURES"
    | "MISSING_PROVIDER_MESSAGE_ID"
    | "DEACTIVATED_RECIPIENT_QUEUED"
    | "COMPLETED_ASSIGNMENT_REMINDER_PENDING";
  companyId: number;
  message: string;
}

export interface DeliveryDiagnosticReport {
  timestamp: string;
  totalLogsAudited: number;
  totalEmployeesAudited: number;
  criticalIssuesCount: number;
  highIssuesCount: number;
  mediumIssuesCount: number;
  lowIssuesCount: number;
  valid: boolean;
  issues: DeliveryDiagnosticIssue[];
}

export async function runNotificationDeliveryDiagnostics(): Promise<DeliveryDiagnosticReport> {
  const issues: DeliveryDiagnosticIssue[] = [];

  const logs = await db.select().from(notificationDeliveryLogsTable);
  const employees = await db.select().from(employeesTable);
  const assignments = await db.select().from(courseAssignmentsTable);

  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

  // 1. Stuck Processing Check
  for (const log of logs) {
    if (log.status === "processing" && log.attemptedAt && new Date(log.attemptedAt) < tenMinutesAgo) {
      issues.push({
        severity: "HIGH",
        category: "STUCK_PROCESSING",
        companyId: log.companyId,
        message: `Delivery log ID ${log.id} has been stuck in 'processing' status for over 10 minutes.`,
      });
    }

    // 2. Excessive Failures Check
    if (log.status === "failed" && log.retryCount >= 3) {
      issues.push({
        severity: "MEDIUM",
        category: "EXCESSIVE_FAILURES",
        companyId: log.companyId,
        message: `Delivery log ID ${log.id} failed after ${log.retryCount} attempts (Recipient: ${log.recipient}).`,
      });
    }

    // 3. Delivered without provider message ID
    if (log.status === "delivered" && !log.providerMessageId) {
      issues.push({
        severity: "LOW",
        category: "MISSING_PROVIDER_MESSAGE_ID",
        companyId: log.companyId,
        message: `Delivered log ID ${log.id} is missing provider message ID confirmation.`,
      });
    }

    // 4. Deactivated recipient queued
    if (log.employeeId && log.status === "pending") {
      const emp = employees.find((e) => e.id === log.employeeId);
      if (emp && emp.status === "deactivated") {
        issues.push({
          severity: "HIGH",
          category: "DEACTIVATED_RECIPIENT_QUEUED",
          companyId: log.companyId,
          message: `Pending delivery log ID ${log.id} is queued for a deactivated employee (ID ${emp.id}).`,
        });
      }
    }

    // 5. Completed assignment reminder pending
    if (log.assignmentId && log.status === "pending") {
      const asgn = assignments.find((a) => a.id === log.assignmentId);
      if (asgn && asgn.completedAt) {
        issues.push({
          severity: "HIGH",
          category: "COMPLETED_ASSIGNMENT_REMINDER_PENDING",
          companyId: log.companyId,
          message: `Pending reminder log ID ${log.id} exists for an assignment that is already completed.`,
        });
      }
    }
  }

  const criticalIssuesCount = issues.filter((i) => i.severity === "CRITICAL").length;
  const highIssuesCount = issues.filter((i) => i.severity === "HIGH").length;
  const mediumIssuesCount = issues.filter((i) => i.severity === "MEDIUM").length;
  const lowIssuesCount = issues.filter((i) => i.severity === "LOW").length;

  return {
    timestamp: new Date().toISOString(),
    totalLogsAudited: logs.length,
    totalEmployeesAudited: employees.length,
    criticalIssuesCount,
    highIssuesCount,
    mediumIssuesCount,
    lowIssuesCount,
    valid: criticalIssuesCount === 0 && highIssuesCount === 0,
    issues,
  };
}
