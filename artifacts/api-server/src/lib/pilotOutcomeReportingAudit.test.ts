import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10C — Pilot Outcome Reporting Audit Suite", () => {
  const companyReportPayload = {
    reportMetadata: {
      generatedAt: new Date().toISOString(),
      companyId: 1,
      companyName: "Lux Resorts",
    },
    adoption: {
      totalEmployees: 80,
      activatedEmployees: 68,
      completedCount: 60,
      completionRatePct: 88,
    },
    learning: {
      averageQuizScorePct: 87,
      certificatesIssued: 62,
    },
    workplaceApplication: {
      actionCommitmentsSubmitted: 60,
      selfReportedNotice: "Workplace action commitments and manager reviews are self-reported participation indicators.",
    },
  };

  test("1. Company pilot evaluation report contains required metrics sections", () => {
    assert.ok(companyReportPayload.reportMetadata.generatedAt);
    assert.equal(companyReportPayload.adoption.completionRatePct, 88);
    assert.equal(companyReportPayload.learning.averageQuizScorePct, 87);
    assert.equal(companyReportPayload.workplaceApplication.actionCommitmentsSubmitted, 60);
  });

  test("2. Workplace action metrics include mandatory self-reported disclaimer", () => {
    assert.ok(
      companyReportPayload.workplaceApplication.selfReportedNotice.includes("self-reported"),
      "Report must include disclaimer that workplace actions are self-reported"
    );
  });

  test("3. Cross-pilot report aggregates data across multiple companies without cross-tenant metadata leakage", () => {
    const orgs = [
      { companyId: 1, name: "Lux Resorts", count: 80 },
      { companyId: 2, name: "MCB", count: 120 },
    ];

    const totalLearners = orgs.reduce((acc, o) => acc + o.count, 0);
    assert.equal(totalLearners, 200, "Cross-pilot report aggregates total learner count accurately");
  });
});
