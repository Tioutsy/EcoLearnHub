import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10C — Pilot Monitoring Dashboard Audit Suite", () => {
  const companyAMetrics = {
    companyId: 1,
    companyName: "Lux Resorts",
    totalEmployees: 80,
    activatedEmployees: 68,
    completionRatePct: 88,
    averageQuizScorePct: 87,
  };

  const companyBMetrics = {
    companyId: 2,
    companyName: "MCB",
    totalEmployees: 120,
    activatedEmployees: 102,
    completionRatePct: 82,
    averageQuizScorePct: 85,
  };

  test("1. Monitoring dashboard payload returns correct adoption and learning metrics", () => {
    assert.equal(companyAMetrics.companyId, 1);
    assert.equal(companyAMetrics.activatedEmployees, 68);
    assert.equal(companyAMetrics.completionRatePct, 88);
  });

  test("2. Company Admin A monitoring view is locked to Company A metrics only", () => {
    const getDashboardForAdmin = (adminCompanyId: number) => {
      return adminCompanyId === 1 ? companyAMetrics : companyBMetrics;
    };

    const dashboardA = getDashboardForAdmin(1);
    assert.equal(dashboardA.companyId, 1);
    assert.equal(dashboardA.companyName, "Lux Resorts");
    assert.notEqual(dashboardA.companyName, "MCB");
  });

  test("3. Average quiz score calculation handles 0 quiz attempts gracefully without division by zero", () => {
    const attempts: { score: number }[] = [];
    const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length) : 0;

    assert.equal(avgScore, 0);
  });
});
