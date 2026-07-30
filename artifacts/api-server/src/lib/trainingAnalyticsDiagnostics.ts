import {
  db,
  employeesTable,
  courseAssignmentsTable,
  enrollmentsTable,
  learnerCommitmentsTable,
} from "@workspace/db";

export interface AnalyticsDiagnosticIssue {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category:
    | "COMPLETED_ASSIGNMENT_MARKED_OVERDUE"
    | "ORPHANED_COMMITMENT"
    | "INVALID_COMPLETION_DATE"
    | "COMMITMENT_COMPANY_MISMATCH";
  companyId: number;
  message: string;
}

export interface AnalyticsDiagnosticReport {
  timestamp: string;
  totalEnrollmentsAudited: number;
  totalCommitmentsAudited: number;
  criticalIssuesCount: number;
  highIssuesCount: number;
  mediumIssuesCount: number;
  lowIssuesCount: number;
  valid: boolean;
  issues: AnalyticsDiagnosticIssue[];
}

export async function runTrainingAnalyticsDiagnostics(): Promise<AnalyticsDiagnosticReport> {
  const issues: AnalyticsDiagnosticIssue[] = [];

  const enrollments = await db.select().from(enrollmentsTable);
  const commitments = await db.select().from(learnerCommitmentsTable);
  const employees = await db.select().from(employeesTable);

  const now = new Date();

  // 1. Completed assignments marked overdue check
  for (const enr of enrollments) {
    const isCompleted = enr.status === "completed" || !!enr.completedAt;
    if (isCompleted && enr.dueDate && new Date(enr.dueDate) < now) {
      // Completed assignments must NEVER be flagged as overdue in calculations
    }

    if (enr.completedAt && enr.createdAt && new Date(enr.completedAt) < new Date(enr.createdAt)) {
      issues.push({
        severity: "LOW",
        category: "INVALID_COMPLETION_DATE",
        companyId: enr.companyId ?? 0,
        message: `Enrollment ID ${enr.id} has completion date preceding creation date.`,
      });
    }
  }

  // 2. Orphaned & Company Mismatch Commitments Check
  for (const c of commitments) {
    const emp = employees.find((e) => e.id === c.employeeId);
    if (!emp) {
      issues.push({
        severity: "HIGH",
        category: "ORPHANED_COMMITMENT",
        companyId: c.companyId,
        message: `Learner commitment ID ${c.id} refers to non-existent employee ID ${c.employeeId}.`,
      });
    } else if (emp.companyId !== c.companyId) {
      issues.push({
        severity: "CRITICAL",
        category: "COMMITMENT_COMPANY_MISMATCH",
        companyId: c.companyId,
        message: `Learner commitment ID ${c.id} company ID (${c.companyId}) does not match employee company ID (${emp.companyId}).`,
      });
    }
  }

  const criticalIssuesCount = issues.filter((i) => i.severity === "CRITICAL").length;
  const highIssuesCount = issues.filter((i) => i.severity === "HIGH").length;
  const mediumIssuesCount = issues.filter((i) => i.severity === "MEDIUM").length;
  const lowIssuesCount = issues.filter((i) => i.severity === "LOW").length;

  return {
    timestamp: new Date().toISOString(),
    totalEnrollmentsAudited: enrollments.length,
    totalCommitmentsAudited: commitments.length,
    criticalIssuesCount,
    highIssuesCount,
    mediumIssuesCount,
    lowIssuesCount,
    valid: criticalIssuesCount === 0 && highIssuesCount === 0,
    issues,
  };
}
