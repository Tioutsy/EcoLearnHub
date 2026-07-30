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

describe("Sprint 8G: Controlled Pilot Execution, Feedback & Commercial Validation Audit", () => {
  let testCompanyId: number;
  let testPilotId: number;

  before(async () => {
    await ensureSchemaModifications();

    // Seed test pilot company
    const stamp = Date.now();
    const [c] = await db
      .insert(companiesTable)
      .values({
        name: "Pilot Test Corp 8G",
        slug: `pilot-test-corp-8g-${stamp}`,
      })
      .returning();

    testCompanyId = c.id;

    const pilot = await createPilotCompany({
      companyId: testCompanyId,
      targetLearnerCount: 25,
      approvedLearnerLimit: 60,
      primaryContactName: "Jane Doe",
      primaryContactEmail: "jane@example.com",
    });

    testPilotId = pilot.id;
  });

  test("1. Pilot creation and platform admin approval enforce status stages and learner limits", async () => {
    const [initial] = await db.select().from(pilotCompaniesTable).where(eq(pilotCompaniesTable.id, testPilotId));
    assert.equal(initial.pilotStatus, "candidate");
    assert.equal(initial.pilotStage, "initial_contact");

    const approved = await approvePilotCompany(testPilotId, "admin_user_8g", 75);
    assert.equal(approved.pilotStatus, "approved");
    assert.equal(approved.pilotStage, "configuration");
    assert.equal(approved.approvedLearnerLimit, 75);
  });

  test("2. submitPilotFeedback records respondent ratings and consent cleanly", async () => {
    const fb = await submitPilotFeedback({
      pilotCompanyId: testPilotId,
      companyId: testCompanyId,
      respondentUserId: "learner_8g_1",
      respondentRole: "learner",
      overallRating: 5,
      easeOfUseRating: 4,
      contentRelevanceRating: 5,
      freeTextFeedback: "Great practical course on sustainability!",
      consentForFollowUp: true,
    });

    assert.equal(fb.overallRating, 5);
    assert.equal(fb.respondentRole, "learner");
    assert.equal(fb.consentForFollowUp, true);
  });

  test("3. logPilotIssue records triage tickets with severity and release blocking flags", async () => {
    const issue = await logPilotIssue({
      pilotCompanyId: testPilotId,
      companyId: testCompanyId,
      reportedByUserId: "admin_8g",
      issueType: "content",
      severity: "high",
      title: "Typo in Lesson 2 text",
      description: "Minor spelling correction needed.",
    });

    assert.equal(issue.severity, "high");
    assert.equal(issue.releaseBlocking, true);
    assert.equal(issue.status, "new");
  });

  test("4. generatePilotOutcomeReport compiles comprehensive analytics, feedback, and issue metrics", async () => {
    const report = await generatePilotOutcomeReport(testPilotId);
    assert.equal(report.companyId, testCompanyId);
    assert.equal(report.feedbackSummary.totalResponses, 1);
    assert.equal(report.feedbackSummary.averageOverallRating, 5);
    assert.equal(report.issueSummary.totalIssues, 1);
  });
});
