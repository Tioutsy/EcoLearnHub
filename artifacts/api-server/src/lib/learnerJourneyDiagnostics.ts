import {
  db,
  enrollmentsTable,
  quizAttemptsTable,
  certificatesTable,
  employeeBadgesTable,
  coursesTable,
} from "@workspace/db";
import { eq, and, sql, or } from "drizzle-orm";
import { logger } from "./logger";

export interface JourneyDiagnosticIssue {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category:
    | "COMPLETION_MISSING_TIMESTAMP"
    | "COMPLETION_WITHOUT_PASSING_QUIZ"
    | "CERTIFICATE_WITHOUT_COMPLETION"
    | "DUPLICATE_ENROLLMENT"
    | "DUPLICATE_CERTIFICATE"
    | "PROGRESS_OUT_OF_BOUNDS";
  entityId: number | string;
  message: string;
}

export interface JourneyDiagnosticReport {
  timestamp: string;
  totalEnrollmentsAudited: number;
  totalCertificatesAudited: number;
  criticalIssuesCount: number;
  highIssuesCount: number;
  mediumIssuesCount: number;
  lowIssuesCount: number;
  valid: boolean;
  issues: JourneyDiagnosticIssue[];
}

export async function runLearnerJourneyDiagnostics(): Promise<JourneyDiagnosticReport> {
  const issues: JourneyDiagnosticIssue[] = [];

  const enrollments = await db
    .select()
    .from(enrollmentsTable);

  const certificates = await db
    .select()
    .from(certificatesTable);

  const passedAttempts = await db
    .select()
    .from(quizAttemptsTable)
    .where(eq(quizAttemptsTable.passed, true));

  const passedMap = new Set(passedAttempts.map(a => `${a.userId}_${a.courseId}`));

  // 1. Audit Enrollments
  for (const enr of enrollments) {
    // Bounds check
    if (enr.progressPct < 0 || enr.progressPct > 100) {
      issues.push({
        severity: "HIGH",
        category: "PROGRESS_OUT_OF_BOUNDS",
        entityId: enr.id,
        message: `Enrollment ID ${enr.id} has invalid progressPct: ${enr.progressPct}%.`,
      });
    }

    // Completed without timestamp
    if (enr.status === "completed" && !enr.completedAt) {
      issues.push({
        severity: "HIGH",
        category: "COMPLETION_MISSING_TIMESTAMP",
        entityId: enr.id,
        message: `Enrollment ID ${enr.id} is marked completed but has null completedAt.`,
      });
    }

    // Completed without passing quiz (except non-quiz courses)
    if (enr.status === "completed" && enr.courseId !== 0) {
      const key = `${enr.userId}_${enr.courseId}`;
      if (!passedMap.has(key)) {
        issues.push({
          severity: "MEDIUM",
          category: "COMPLETION_WITHOUT_PASSING_QUIZ",
          entityId: enr.id,
          message: `Enrollment ID ${enr.id} (Course ${enr.courseId}, User ${enr.userId}) is marked completed without a recorded passing quiz attempt.`,
        });
      }
    }
  }

  // 2. Audit Certificates
  const completedKeys = new Set(enrollments.filter(e => e.status === "completed").map(e => `${e.userId}_${e.courseId}`));

  for (const cert of certificates) {
    const key = `${cert.userId}_${cert.courseId}`;
    if (!completedKeys.has(key)) {
      issues.push({
        severity: "HIGH",
        category: "CERTIFICATE_WITHOUT_COMPLETION",
        entityId: cert.id,
        message: `Certificate ID ${cert.id} (Code ${cert.uniqueCode}) exists for Course ${cert.courseId} but no completed enrollment record was found.`,
      });
    }
  }

  // 3. Duplicate Certificate check
  const certCodes = new Set<string>();
  for (const cert of certificates) {
    if (certCodes.has(cert.uniqueCode)) {
      issues.push({
        severity: "CRITICAL",
        category: "DUPLICATE_CERTIFICATE",
        entityId: cert.id,
        message: `Duplicate certificate unique code detected: ${cert.uniqueCode}.`,
      });
    }
    certCodes.add(cert.uniqueCode);
  }

  const criticalIssuesCount = issues.filter(i => i.severity === "CRITICAL").length;
  const highIssuesCount = issues.filter(i => i.severity === "HIGH").length;
  const mediumIssuesCount = issues.filter(i => i.severity === "MEDIUM").length;
  const lowIssuesCount = issues.filter(i => i.severity === "LOW").length;

  const report: JourneyDiagnosticReport = {
    timestamp: new Date().toISOString(),
    totalEnrollmentsAudited: enrollments.length,
    totalCertificatesAudited: certificates.length,
    criticalIssuesCount,
    highIssuesCount,
    mediumIssuesCount,
    lowIssuesCount,
    valid: criticalIssuesCount === 0 && highIssuesCount === 0,
    issues,
  };

  if (!report.valid) {
    logger.warn({ critical: criticalIssuesCount, high: highIssuesCount }, "Learner journey diagnostics identified potential issues.");
  } else {
    logger.info({ enrollments: enrollments.length, certs: certificates.length }, "Learner journey diagnostics completed cleanly.");
  }

  return report;
}
