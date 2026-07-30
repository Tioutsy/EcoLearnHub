import {
  db,
  enrollmentsTable,
  certificatesTable,
  employeesTable,
  coursesTable,
  companiesTable,
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { getTrainingOverviewData } from "./trainingReportingService";

export interface ReportingDiagnosticIssue {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category:
    | "COMPLETION_MISSING_VERSION"
    | "CERTIFICATE_COMPANY_MISMATCH"
    | "REPORT_SUMMARY_DISCREPANCY"
    | "DUPLICATE_COMPLETION_EVIDENCE";
  entityId: number | string;
  message: string;
}

export interface ReportingDiagnosticReport {
  timestamp: string;
  totalCompaniesAudited: number;
  totalEnrollmentsAudited: number;
  totalCertificatesAudited: number;
  criticalIssuesCount: number;
  highIssuesCount: number;
  mediumIssuesCount: number;
  lowIssuesCount: number;
  valid: boolean;
  issues: ReportingDiagnosticIssue[];
}

export async function runReportingDiagnostics(): Promise<ReportingDiagnosticReport> {
  const issues: ReportingDiagnosticIssue[] = [];

  const companies = await db.select().from(companiesTable);
  const enrollments = await db.select().from(enrollmentsTable);
  const certificates = await db.select().from(certificatesTable);
  const employees = await db.select().from(employeesTable);

  const empMap = new Map(employees.map(e => [e.id, e]));

  // 1. Audit enrollments for completedVersion
  for (const enr of enrollments) {
    if (enr.status === "completed" && enr.completedVersion === null) {
      issues.push({
        severity: "MEDIUM",
        category: "COMPLETION_MISSING_VERSION",
        entityId: enr.id,
        message: `Enrollment ID ${enr.id} (Course ${enr.courseId}) is completed but has null completedVersion.`,
      });
    }
  }

  // 2. Audit certificate company matching
  for (const cert of certificates) {
    if (cert.employeeId) {
      const emp = empMap.get(cert.employeeId);
      if (emp && emp.companyId && cert.companyId && emp.companyId !== cert.companyId) {
        issues.push({
          severity: "HIGH",
          category: "CERTIFICATE_COMPANY_MISMATCH",
          entityId: cert.id,
          message: `Certificate ID ${cert.id} companyId (${cert.companyId}) does not match employee companyId (${emp.companyId}).`,
        });
      }
    }
  }

  // 3. Audit overview metrics for each company
  for (const comp of companies) {
    const overview = await getTrainingOverviewData(comp.id);
    const compEmps = employees.filter(e => e.companyId === comp.id);
    if (overview.totalEmployees !== compEmps.length) {
      issues.push({
        severity: "HIGH",
        category: "REPORT_SUMMARY_DISCREPANCY",
        entityId: comp.id,
        message: `Company ID ${comp.id} overview reported ${overview.totalEmployees} employees, but database contains ${compEmps.length}.`,
      });
    }
  }

  const criticalIssuesCount = issues.filter(i => i.severity === "CRITICAL").length;
  const highIssuesCount = issues.filter(i => i.severity === "HIGH").length;
  const mediumIssuesCount = issues.filter(i => i.severity === "MEDIUM").length;
  const lowIssuesCount = issues.filter(i => i.severity === "LOW").length;

  return {
    timestamp: new Date().toISOString(),
    totalCompaniesAudited: companies.length,
    totalEnrollmentsAudited: enrollments.length,
    totalCertificatesAudited: certificates.length,
    criticalIssuesCount,
    highIssuesCount,
    mediumIssuesCount,
    lowIssuesCount,
    valid: criticalIssuesCount === 0 && highIssuesCount === 0,
    issues,
  };
}
