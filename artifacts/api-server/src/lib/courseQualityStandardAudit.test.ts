import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { ensureSchemaModifications } from "./ensureSchemaModifications";
import { ensureFoundationsCourse } from "./ensureFoundationsCourse";
import { ensureWasteSortingCourse } from "./ensureWasteSortingCourse";
import { evaluateCourseQuality } from "./courseQualityDiagnostics";
import { db, coursesTable } from "@workspace/db";

describe("Course Quality Standard Audit (ELH-01 & ELH-02)", () => {
  before(async () => {
    await ensureSchemaModifications();
    await ensureFoundationsCourse();
    await ensureWasteSortingCourse();
  });

  test("1. Active catalogue contains all 29 courses (ELH-01 through ELH-29)", async () => {
    const courses = await db.select().from(coursesTable);
    const codes = courses.map((c) => c.courseCode).filter(Boolean);

    for (let i = 1; i <= 29; i++) {
      const code = `ELH-${i.toString().padStart(2, "0")}`;
      assert.ok(codes.includes(code), `Course code ${code} must exist in catalogue`);
    }
  });

  test("2. ELH-01 benchmark reference course reaches release quality score threshold (>= 85)", async () => {
    const scorecard = await evaluateCourseQuality("ELH-01");
    assert.ok(scorecard.totalScore >= 85, `ELH-01 score must be >= 85, got ${scorecard.totalScore}`);
    assert.equal(scorecard.releaseBlockers.length, 0, `ELH-01 must have 0 release blockers, got ${scorecard.releaseBlockers.join("; ")}`);
    assert.equal(scorecard.isReleaseReady, true, "ELH-01 must be flagged as release ready");
  });

  test("3. ELH-02 waste sorting course reaches release quality score threshold (>= 85)", async () => {
    const scorecard = await evaluateCourseQuality("ELH-02");
    assert.ok(scorecard.totalScore >= 85, `ELH-02 score must be >= 85, got ${scorecard.totalScore}`);
    assert.equal(scorecard.releaseBlockers.length, 0, `ELH-02 must have 0 release blockers, got ${scorecard.releaseBlockers.join("; ")}`);
    assert.equal(scorecard.isReleaseReady, true, "ELH-02 must be flagged as release ready");
  });

  test("4. ELH-02 diagnostic breakdown includes memorable fact, visual question, and scenario scores", async () => {
    const scorecard = await evaluateCourseQuality("ELH-02");
    assert.ok(scorecard.breakdown.memorableFactScore > 0, "ELH-02 must score points for memorable fact");
    assert.ok(scorecard.breakdown.visualQuestionScore > 0, "ELH-02 must score points for visual question");
    assert.ok(scorecard.breakdown.appliedScenarioScore > 0, "ELH-02 must score points for applied scenario");
  });
});
