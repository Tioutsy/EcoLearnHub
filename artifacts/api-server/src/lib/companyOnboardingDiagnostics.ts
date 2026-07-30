import {
  db,
  companiesTable,
  employeesTable,
  companySubscriptionsTable,
  employeeBandsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { getCompanyOnboardingStatus } from "./companyOnboardingService";

export interface OnboardingDiagnosticIssue {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category:
    | "COMPANY_WITHOUT_ADMIN"
    | "COMPANY_WITHOUT_SUBSCRIPTION"
    | "COMPANY_EXCEEDED_BAND"
    | "DUPLICATE_PENDING_INVITATION"
    | "ACCEPTED_INVITATION_STILL_PENDING";
  companyId: number;
  message: string;
}

export interface OnboardingDiagnosticReport {
  timestamp: string;
  totalCompaniesAudited: number;
  totalEmployeesAudited: number;
  criticalIssuesCount: number;
  highIssuesCount: number;
  mediumIssuesCount: number;
  lowIssuesCount: number;
  valid: boolean;
  issues: OnboardingDiagnosticIssue[];
}

export async function runCompanyOnboardingDiagnostics(): Promise<OnboardingDiagnosticReport> {
  const issues: OnboardingDiagnosticIssue[] = [];

  const companies = await db.select().from(companiesTable);
  const employees = await db.select().from(employeesTable);

  for (const comp of companies) {
    const compEmps = employees.filter((e) => e.companyId === comp.id);

    // 1. Admin check
    const hasAdmin = compEmps.some((e) => e.role === "admin");
    if (!hasAdmin) {
      issues.push({
        severity: "MEDIUM",
        category: "COMPANY_WITHOUT_ADMIN",
        companyId: comp.id,
        message: `Company ${comp.name} (ID ${comp.id}) has no assigned administrator.`,
      });
    }

    // 2. Subscription check
    const subs = await db
      .select({
        status: companySubscriptionsTable.status,
        maxEmployees: employeeBandsTable.maximumEmployees,
      })
      .from(companySubscriptionsTable)
      .leftJoin(employeeBandsTable, eq(companySubscriptionsTable.employeeBandId, employeeBandsTable.id))
      .where(eq(companySubscriptionsTable.companyId, comp.id));

    const activeSub = subs.find((s) => s.status === "ACTIVE" || s.status === "PENDING");
    if (!activeSub && !comp.planId) {
      issues.push({
        severity: "MEDIUM",
        category: "COMPANY_WITHOUT_SUBSCRIPTION",
        companyId: comp.id,
        message: `Company ${comp.name} (ID ${comp.id}) has no active subscription record.`,
      });
    } else if (activeSub?.maxEmployees !== null && activeSub?.maxEmployees !== undefined && compEmps.length > activeSub.maxEmployees) {
      issues.push({
        severity: "HIGH",
        category: "COMPANY_EXCEEDED_BAND",
        companyId: comp.id,
        message: `Company ${comp.name} (ID ${comp.id}) employee count (${compEmps.length}) exceeds band limit (${activeSub.maxEmployees}).`,
      });
    }

    // 3. Duplicate pending invitations check
    const seenEmails = new Set<string>();
    for (const emp of compEmps) {
      if (emp.invitationStatus === "invited") {
        const lower = emp.email.toLowerCase();
        if (seenEmails.has(lower)) {
          issues.push({
            severity: "MEDIUM",
            category: "DUPLICATE_PENDING_INVITATION",
            companyId: comp.id,
            message: `Company ${comp.name} (ID ${comp.id}) has duplicate pending invitations for email ${emp.email}.`,
          });
        }
        seenEmails.add(lower);
      }

      if (emp.clerkUserId && emp.invitationStatus === "invited") {
        issues.push({
          severity: "MEDIUM",
          category: "ACCEPTED_INVITATION_STILL_PENDING",
          companyId: comp.id,
          message: `Employee ID ${emp.id} in Company ${comp.name} has clerkUserId set but invitationStatus is still 'invited'.`,
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
