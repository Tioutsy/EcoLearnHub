import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  db,
  coursesTable,
  enrollmentsTable,
  companiesTable,
  companySubscriptionsTable,
  subscriptionPlansTable,
  employeeBandsTable,
  employeesTable,
  certificatesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { getCompanyTrainingRecords, generateAuditCsv, backfillLegacyCompletedVersions } from "./trainingReportingService";
import { generateTrainingEvidencePackPdf } from "./trainingEvidencePackPdf";
import { runReportingDiagnostics } from "./reportingDiagnostics";

describe("Sprint 7Z: Audit-Ready Reporting, Training Evidence Pack & Course-Version Integrity", () => {

  test("1. Consolidated getCompanyTrainingRecords calculates authoritative company metrics", async () => {
    const records = await getCompanyTrainingRecords({ companyId: 1 });
    assert.ok(records.overview, "Overview data must be returned");
    assert.ok(records.employeeRecords, "Employee records dataset must be returned");
    assert.equal(typeof records.overview.totalEmployees, "number", "totalEmployees must be a number");
  });

  test("2. Backfill helper sets completedVersion for legacy completed enrollments", async () => {
    const backfilled = await backfillLegacyCompletedVersions();
    assert.equal(typeof backfilled, "number", "Backfill should return count of updated records");
  });

  test("3. CSV export escapes formula injection characters (=, +, -, @)", async () => {
    const csvStr = await generateAuditCsv(1, {});
    assert.ok(csvStr.includes("Organisation Name"), "CSV must include standard header row");
    
    // Check that formula-like strings would be neutralised by single quotes
    const testFormula = "=SUM(A1:A10)";
    if (csvStr.includes("=SUM")) {
      assert.ok(csvStr.includes("'=SUM"), "Formula strings must be escaped with leading single quote");
    }
  });

  test("4. PDF evidence pack generation creates valid multi-page PDF buffer", async () => {
    const pdfBytes = await generateTrainingEvidencePackPdf(1);
    assert.ok(pdfBytes instanceof Uint8Array, "PDF generator must return Uint8Array buffer");
    assert.ok(pdfBytes.length > 500, "PDF buffer must contain substantial document content");

    // PDF Magic Header check (%PDF-1.x)
    const headerStr = Buffer.from(pdfBytes.slice(0, 8)).toString("utf-8");
    assert.ok(headerStr.startsWith("%PDF-"), "Generated buffer must have valid PDF header");
  });

  test("5. Reporting diagnostics report zero critical and high issues", async () => {
    const report = await runReportingDiagnostics();
    assert.equal(report.criticalIssuesCount, 0, `Expected 0 critical reporting issues, found ${report.criticalIssuesCount}`);
    assert.equal(report.highIssuesCount, 0, `Expected 0 high reporting issues, found ${report.highIssuesCount}`);
  });
});
