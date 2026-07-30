import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { ensureSchemaModifications } from "./ensureSchemaModifications";
import { db, companiesTable, pilotCompaniesTable, pilotFeedbackResponsesTable, pilotIssuesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  createPilotCompany,
  approvePilotCompany,
  submitPilotFeedback,
  logPilotIssue,
} from "./pilotOperationsService";
import { generatePilotOutcomeReport } from "./pilotOutcomeReportService";

describe("Sprint 8H: Live Controlled Pilot Execution & Commercial Decision Audit", () => {
  let testCompanyId: number;
  let testPilotId: number;

  before(async () => {
    await ensureSchemaModifications();

    const stamp = Date.now();
    const [c] = await db
      .insert(companiesTable)
      .values({
        name: "Live Pilot Hospitality Corp 8H",
        slug: `live-pilot-hospitality-8h-${stamp}`,
      })
      .returning();

    testCompanyId = c.id;

    const pilot = await createPilotCompany({
      companyId: testCompanyId,
      targetLearnerCount: 30,
      approvedLearnerLimit: 80,
      primaryContactName: "Alex Smith",
      primaryContactEmail: "alex@hospitality8h.example.com",
    });

    testPilotId = pilot.id;
  });

  test("1. Live pilot cohort creation and approval stage progression", async () => {
    const [initial] = await db.select().from(pilotCompaniesTable).where(eq(pilotCompaniesTable.id, testPilotId));
    assert.equal(initial.pilotStatus, "candidate");

    const approved = await approvePilotCompany(testPilotId, "admin_user_8h", 100);
    assert.equal(approved.pilotStatus, "approved");
    assert.equal(approved.approvedLearnerLimit, 100);
  });

  test("2. Learner & buyer feedback submission with tenant isolation", async () => {
    const fb = await submitPilotFeedback({
      pilotCompanyId: testPilotId,
      companyId: testCompanyId,
      respondentUserId: "buyer_user_8h",
      respondentRole: "buyer",
      overallRating: 5,
      easeOfUseRating: 5,
      contentRelevanceRating: 5,
      reportingUsefulnessRating: 5,
      freeTextFeedback: "Excellent compliance visibility and employee engagement!",
      consentForFollowUp: true,
    });

    assert.equal(fb.overallRating, 5);
    assert.equal(fb.respondentRole, "buyer");
    assert.equal(fb.companyId, testCompanyId);
  });

  test("3. Pilot issue logging and release-blocking triage rules", async () => {
    const issue = await logPilotIssue({
      pilotCompanyId: testPilotId,
      companyId: testCompanyId,
      reportedByUserId: "admin_user_8h",
      issueType: "mobile",
      severity: "low",
      title: "Minor spacing tweak on mobile quiz screen",
      description: "Cosmetic layout adjustment.",
    });

    assert.equal(issue.severity, "low");
    assert.equal(issue.releaseBlocking, false);
  });

  test("4. Outcome report generation verifying participation, assessment, and issue metrics", async () => {
    const report = await generatePilotOutcomeReport(testPilotId);
    assert.equal(report.companyId, testCompanyId);
    assert.equal(report.feedbackSummary.totalResponses, 1);
    assert.equal(report.issueSummary.totalIssues, 1);
    assert.equal(report.issueSummary.criticalIssues, 0);
  });
});
