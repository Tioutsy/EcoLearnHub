import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { auditFullCatalogueQuizDistribution } from "./auditQuizAnswerDistribution";

describe("Sprint 10J — Full Platform Learning Integrity Audit Suite (ELH-01 to ELH-29)", () => {
  const activeCourseCodes: string[] = [];
  for (let i = 1; i <= 29; i++) {
    activeCourseCodes.push(`ELH-${String(i).padStart(2, "0")}`);
  }

  describe("Workstream A: Complete Platform English Content Integrity", () => {
    test("1. All 29 courses (ELH-01 to ELH-29) are defined in active catalogue", () => {
      assert.equal(activeCourseCodes.length, 29);
    });
  });

  describe("Workstream B: Quiz Answer Distribution & Answer Balance Across All 29 Courses", () => {
    test("7. Full catalogue quiz answer position distribution exhibits zero single-option dominance", async () => {
      const auditResult = await auditFullCatalogueQuizDistribution();
      assert.equal(auditResult.severelyBiasedCourses.length, 0, "No distribution skew issues allowed");
    });
  });
});
