import {
  db,
  companiesTable,
  employeesTable,
  companySubscriptionsTable,
  employeeBandsTable,
  departmentsTable,
  courseAssignmentsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { evaluateCourseAccess } from "./courseAccessService";

export interface WorkspaceDiagnosticIssue {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category:
    | "MISSING_COMPANY_ADMIN"
    | "CAPACITY_EXCEEDED"
    | "DUPLICATE_INVITATION"
    | "EMPLOYEE_WITHOUT_TRAINING"
    | "UNENTITLED_ASSIGNMENT"
    | "PREREQUISITE_VIOLATION";
  companyId: number;
  message: string;
}

export interface WorkspaceDiagnosticReport {
  timestamp: string;
  totalCompaniesAudited: number;
  totalEmployeesAudited: number;
  criticalIssuesCount: number;
  highIssuesCount: number;
  mediumIssuesCount: number;
  lowIssuesCount: number;
  valid: boolean;
  issues: WorkspaceDiagnosticIssue[];
}

export async function runCompanyAdminWorkspaceDiagnostics(): Promise<WorkspaceDiagnosticReport> {
  const issues: WorkspaceDiagnosticIssue[] = [];

  const companies = await db.select().from(companiesTable);
  const employees = await db.select().from(employeesTable);
  const assignments = await db.select().from(courseAssignmentsTable);

  for (const comp of companies) {
    const compEmps = employees.filter((e) => e.companyId === comp.id);
    const activeEmps = compEmps.filter((e) => e.status !== "deactivated");

    // 1. Admin check
    const hasAdmin = activeEmps.some((e) => e.role === "admin");
    if (!hasAdmin) {
      issues.push({
        severity: "MEDIUM",
        category: "MISSING_COMPANY_ADMIN",
        companyId: comp.id,
        message: `Company '${comp.name}' (ID ${comp.id}) has no active administrator assigned.`,
      });
    }

    // 2. Capacity check
    const subs = await db
      .select({
        status: companySubscriptionsTable.status,
        maxEmployees: employeeBandsTable.maximumEmployees,
      })
      .from(companySubscriptionsTable)
      .leftJoin(employeeBandsTable, eq(companySubscriptionsTable.employeeBandId, employeeBandsTable.id))
      .where(eq(companySubscriptionsTable.companyId, comp.id));

    const activeSub = subs.find((s) => s.status === "ACTIVE" || s.status === "PENDING");
    const limit = activeSub?.maxEmployees ?? comp.maxEmployees ?? 50;

    if (activeEmps.length > limit) {
      issues.push({
        severity: "HIGH",
        category: "CAPACITY_EXCEEDED",
        companyId: comp.id,
        message: `Company '${comp.name}' (ID ${comp.id}) active employee count (${activeEmps.length}) exceeds subscribed band limit (${limit}).`,
      });
    }

    // 3. Employee without training check
    const compAssignments = assignments.filter((a) => a.companyId === comp.id);
    const assignedEmpIds = new Set(compAssignments.map((a) => a.employeeId));

    for (const emp of activeEmps) {
      if (!assignedEmpIds.has(emp.id) && emp.invitationStatus === "accepted") {
        issues.push({
          severity: "LOW",
          category: "EMPLOYEE_WITHOUT_TRAINING",
          companyId: comp.id,
          message: `Active learner '${emp.name}' (ID ${emp.id}) has no assigned training courses.`,
        });
      }
    }

    // 4. Assignment entitlement & prerequisite check
    for (const asgn of compAssignments) {
      const emp = compEmps.find((e) => e.id === asgn.employeeId);
      if (emp) {
        const empAccess = {
          userId: emp.clerkUserId ?? String(emp.id),
          email: emp.email,
          companyId: comp.id,
          role: "employee" as const,
          employee: emp,
          isDemo: false,
        };
        const entitlement = await evaluateCourseAccess(asgn.courseId, empAccess);
        if (!entitlement.allowed) {
          issues.push({
            severity: "MEDIUM",
            category: "UNENTITLED_ASSIGNMENT",
            companyId: comp.id,
            message: `Employee '${emp.name}' (ID ${emp.id}) has assignment for course ${asgn.courseId} which is not included in company subscription plan.`,
          });
        }
      }
    }
  }

  const criticalIssuesCount = issues.filter((i) => i.severity === "CRITICAL").length;
  const highIssuesCount = issues.filter((i) => i.severity === "HIGH").length;
  const mediumIssuesCount = issues.filter((i) => i.severity === "MEDIUM").length;
  const lowIssuesCount = issues.filter((i) => i.severity === "LOW").length;

  return {
    timestamp: new Date().toISOString(),
    totalCompaniesAudited: companies.length,
    totalEmployeesAudited: employees.length,
    criticalIssuesCount,
    highIssuesCount,
    mediumIssuesCount,
    lowIssuesCount,
    valid: criticalIssuesCount === 0 && highIssuesCount === 0,
    issues,
  };
}
