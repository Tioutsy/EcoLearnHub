import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { ensureSchemaModifications } from "./ensureSchemaModifications";
import { ensureFoundationsCourse } from "./ensureFoundationsCourse";
import { ensureWasteSortingCourse } from "./ensureWasteSortingCourse";
import { ensureEnergyEfficiencyCourse } from "./ensureEnergyEfficiencyCourse";
import { ensureWaterConservationCourse } from "./ensureWaterConservationCourse";
import { ensureSustainableProcurementCourse } from "./ensureSustainableProcurementCourse";
import { ensureGreenOfficePracticesCourse } from "./ensureGreenOfficePracticesCourse";
import { ensureCarbonFootprintCourse } from "./ensureCarbonFootprintCourse";
import { ensureBiodiversityCourse } from "./ensureBiodiversityCourse";
import { ensureEsgBasicsCourse } from "./ensureEsgBasicsCourse";
import { ensureEnvironmentalComplianceCourse } from "./ensureEnvironmentalComplianceCourse";
import { ensureCircularEconomyCourse } from "./ensureCircularEconomyCourse";
import { ensureFinalSustainabilityCertificationCourse } from "./ensureFinalSustainabilityCertificationCourse";
import { ensureActionPlanningCourse } from "./ensureActionPlanningCourse";
import { ensureDepartmentalSustainabilityGoalsCourse } from "./ensureDepartmentalSustainabilityGoalsCourse";
import { ensureWorkplaceSustainabilityTeamCourse } from "./ensureWorkplaceSustainabilityTeamCourse";
import { evaluateCourseQuality } from "./courseQualityDiagnostics";
import { db, coursesTable } from "@workspace/db";

describe("Course Quality Standard Audit (ELH-01 through ELH-15)", () => {
  before(async () => {
    await ensureSchemaModifications();
    await ensureFoundationsCourse();
    await ensureWasteSortingCourse();
    await ensureEnergyEfficiencyCourse();
    await ensureWaterConservationCourse();
    await ensureSustainableProcurementCourse();
    await ensureGreenOfficePracticesCourse();
    await ensureCarbonFootprintCourse();
    await ensureBiodiversityCourse();
    await ensureEsgBasicsCourse();
    await ensureEnvironmentalComplianceCourse();
    await ensureCircularEconomyCourse();
    await ensureFinalSustainabilityCertificationCourse();
    await ensureActionPlanningCourse();
    await ensureDepartmentalSustainabilityGoalsCourse();
    await ensureWorkplaceSustainabilityTeamCourse();
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

  test("5. ELH-03 energy efficiency course reaches release quality score threshold (>= 85)", async () => {
    const scorecard = await evaluateCourseQuality("ELH-03");
    assert.ok(scorecard.totalScore >= 85, `ELH-03 score must be >= 85, got ${scorecard.totalScore}`);
    assert.equal(scorecard.releaseBlockers.length, 0, `ELH-03 must have 0 release blockers, got ${scorecard.releaseBlockers.join("; ")}`);
    assert.equal(scorecard.isReleaseReady, true, "ELH-03 must be flagged as release ready");
  });

  test("6. ELH-03 diagnostic breakdown includes memorable fact, visual question, and scenario scores", async () => {
    const scorecard = await evaluateCourseQuality("ELH-03");
    assert.ok(scorecard.breakdown.memorableFactScore > 0, "ELH-03 must score points for memorable fact");
    assert.ok(scorecard.breakdown.visualQuestionScore > 0, "ELH-03 must score points for visual question");
    assert.ok(scorecard.breakdown.appliedScenarioScore > 0, "ELH-03 must score points for applied scenario");
  });

  test("7. ELH-04 water conservation course reaches target quality score threshold (>= 95)", async () => {
    const scorecard = await evaluateCourseQuality("ELH-04");
    assert.ok(scorecard.totalScore >= 95, `ELH-04 score must be >= 95, got ${scorecard.totalScore}`);
    assert.equal(scorecard.releaseBlockers.length, 0, `ELH-04 must have 0 release blockers, got ${scorecard.releaseBlockers.join("; ")}`);
    assert.equal(scorecard.isReleaseReady, true, "ELH-04 must be flagged as release ready");
  });

  test("8. ELH-04 diagnostic breakdown includes memorable fact, visual question, and scenario scores", async () => {
    const scorecard = await evaluateCourseQuality("ELH-04");
    assert.ok(scorecard.breakdown.memorableFactScore > 0, "ELH-04 must score points for memorable fact");
    assert.ok(scorecard.breakdown.visualQuestionScore > 0, "ELH-04 must score points for visual question");
    assert.ok(scorecard.breakdown.appliedScenarioScore > 0, "ELH-04 must score points for applied scenario");
  });

  test("9. ELH-05 sustainable procurement course reaches target quality score threshold (>= 95)", async () => {
    const scorecard = await evaluateCourseQuality("ELH-05");
    assert.ok(scorecard.totalScore >= 95, `ELH-05 score must be >= 95, got ${scorecard.totalScore}`);
    assert.equal(scorecard.releaseBlockers.length, 0, `ELH-05 must have 0 release blockers, got ${scorecard.releaseBlockers.join("; ")}`);
    assert.equal(scorecard.isReleaseReady, true, "ELH-05 must be flagged as release ready");
  });

  test("10. ELH-05 diagnostic breakdown includes memorable fact, visual question, and scenario scores", async () => {
    const scorecard = await evaluateCourseQuality("ELH-05");
    assert.ok(scorecard.breakdown.memorableFactScore > 0, "ELH-05 must score points for memorable fact");
    assert.ok(scorecard.breakdown.visualQuestionScore > 0, "ELH-05 must score points for visual question");
    assert.ok(scorecard.breakdown.appliedScenarioScore > 0, "ELH-05 must score points for applied scenario");
  });

  test("11. ELH-06 green office practices course reaches target quality score threshold (>= 95)", async () => {
    const scorecard = await evaluateCourseQuality("ELH-06");
    assert.ok(scorecard.totalScore >= 95, `ELH-06 score must be >= 95, got ${scorecard.totalScore}`);
    assert.equal(scorecard.releaseBlockers.length, 0, `ELH-06 must have 0 release blockers, got ${scorecard.releaseBlockers.join("; ")}`);
    assert.equal(scorecard.isReleaseReady, true, "ELH-06 must be flagged as release ready");
  });

  test("12. ELH-06 diagnostic breakdown includes memorable fact, visual question, and scenario scores", async () => {
    const scorecard = await evaluateCourseQuality("ELH-06");
    assert.ok(scorecard.breakdown.memorableFactScore > 0, "ELH-06 must score points for memorable fact");
    assert.ok(scorecard.breakdown.visualQuestionScore > 0, "ELH-06 must score points for visual question");
    assert.ok(scorecard.breakdown.appliedScenarioScore > 0, "ELH-06 must score points for applied scenario");
  });

  test("13. ELH-07 carbon footprint awareness course reaches target quality score threshold (>= 95)", async () => {
    const scorecard = await evaluateCourseQuality("ELH-07");
    assert.ok(scorecard.totalScore >= 95, `ELH-07 score must be >= 95, got ${scorecard.totalScore}`);
    assert.equal(scorecard.releaseBlockers.length, 0, `ELH-07 must have 0 release blockers, got ${scorecard.releaseBlockers.join("; ")}`);
    assert.equal(scorecard.isReleaseReady, true, "ELH-07 must be flagged as release ready");
  });

  test("14. ELH-07 diagnostic breakdown includes memorable fact, visual question, and scenario scores", async () => {
    const scorecard = await evaluateCourseQuality("ELH-07");
    assert.ok(scorecard.breakdown.memorableFactScore > 0, "ELH-07 must score points for memorable fact");
    assert.ok(scorecard.breakdown.visualQuestionScore > 0, "ELH-07 must score points for visual question");
    assert.ok(scorecard.breakdown.appliedScenarioScore > 0, "ELH-07 must score points for applied scenario");
  });

  test("15. ELH-08 biodiversity in mauritius course reaches target quality score threshold (>= 95)", async () => {
    const scorecard = await evaluateCourseQuality("ELH-08");
    assert.ok(scorecard.totalScore >= 95, `ELH-08 score must be >= 95, got ${scorecard.totalScore}`);
    assert.equal(scorecard.releaseBlockers.length, 0, `ELH-08 must have 0 release blockers, got ${scorecard.releaseBlockers.join("; ")}`);
    assert.equal(scorecard.isReleaseReady, true, "ELH-08 must be flagged as release ready");
  });

  test("16. ELH-08 diagnostic breakdown includes memorable fact, visual question, and scenario scores", async () => {
    const scorecard = await evaluateCourseQuality("ELH-08");
    assert.ok(scorecard.breakdown.memorableFactScore > 0, "ELH-08 must score points for memorable fact");
    assert.ok(scorecard.breakdown.visualQuestionScore > 0, "ELH-08 must score points for visual question");
    assert.ok(scorecard.breakdown.appliedScenarioScore > 0, "ELH-08 must score points for applied scenario");
  });

  test("17. ELH-09 esg basics course reaches target quality score threshold (>= 95)", async () => {
    const scorecard = await evaluateCourseQuality("ELH-09");
    assert.ok(scorecard.totalScore >= 95, `ELH-09 score must be >= 95, got ${scorecard.totalScore}`);
    assert.equal(scorecard.releaseBlockers.length, 0, `ELH-09 must have 0 release blockers, got ${scorecard.releaseBlockers.join("; ")}`);
    assert.equal(scorecard.isReleaseReady, true, "ELH-09 must be flagged as release ready");
  });

  test("18. ELH-09 diagnostic breakdown includes memorable fact, visual question, and scenario scores", async () => {
    const scorecard = await evaluateCourseQuality("ELH-09");
    assert.ok(scorecard.breakdown.memorableFactScore > 0, "ELH-09 must score points for memorable fact");
    assert.ok(scorecard.breakdown.visualQuestionScore > 0, "ELH-09 must score points for visual question");
    assert.ok(scorecard.breakdown.appliedScenarioScore > 0, "ELH-09 must score points for applied scenario");
  });

  test("19. ELH-10 environmental compliance course reaches target quality score threshold (>= 95)", async () => {
    const scorecard = await evaluateCourseQuality("ELH-10");
    assert.ok(scorecard.totalScore >= 95, `ELH-10 score must be >= 95, got ${scorecard.totalScore}`);
    assert.equal(scorecard.releaseBlockers.length, 0, `ELH-10 must have 0 release blockers, got ${scorecard.releaseBlockers.join("; ")}`);
    assert.equal(scorecard.isReleaseReady, true, "ELH-10 must be flagged as release ready");
  });

  test("20. ELH-10 diagnostic breakdown includes memorable fact, visual question, and scenario scores", async () => {
    const scorecard = await evaluateCourseQuality("ELH-10");
    assert.ok(scorecard.breakdown.memorableFactScore > 0, "ELH-10 must score points for memorable fact");
    assert.ok(scorecard.breakdown.visualQuestionScore > 0, "ELH-10 must score points for visual question");
    assert.ok(scorecard.breakdown.appliedScenarioScore > 0, "ELH-10 must score points for applied scenario");
  });

  test("21. ELH-11 circular economy course reaches target quality score threshold (>= 95)", async () => {
    const scorecard = await evaluateCourseQuality("ELH-11");
    assert.ok(scorecard.totalScore >= 95, `ELH-11 score must be >= 95, got ${scorecard.totalScore}`);
    assert.equal(scorecard.releaseBlockers.length, 0, `ELH-11 must have 0 release blockers, got ${scorecard.releaseBlockers.join("; ")}`);
    assert.equal(scorecard.isReleaseReady, true, "ELH-11 must be flagged as release ready");
  });

  test("22. ELH-11 diagnostic breakdown includes memorable fact, visual question, and scenario scores", async () => {
    const scorecard = await evaluateCourseQuality("ELH-11");
    assert.ok(scorecard.breakdown.memorableFactScore > 0, "ELH-11 must score points for memorable fact");
    assert.ok(scorecard.breakdown.visualQuestionScore > 0, "ELH-11 must score points for visual question");
    assert.ok(scorecard.breakdown.appliedScenarioScore > 0, "ELH-11 must score points for applied scenario");
  });

  test("23. ELH-12 final sustainability certification course reaches target quality score threshold (>= 95)", async () => {
    const scorecard = await evaluateCourseQuality("ELH-12");
    assert.ok(scorecard.totalScore >= 95, `ELH-12 score must be >= 95, got ${scorecard.totalScore}`);
    assert.equal(scorecard.releaseBlockers.length, 0, `ELH-12 must have 0 release blockers, got ${scorecard.releaseBlockers.join("; ")}`);
    assert.equal(scorecard.isReleaseReady, true, "ELH-12 must be flagged as release ready");
  });

  test("24. ELH-12 diagnostic breakdown includes memorable fact, visual question, and scenario scores", async () => {
    const scorecard = await evaluateCourseQuality("ELH-12");
    assert.ok(scorecard.breakdown.memorableFactScore > 0, "ELH-12 must score points for memorable fact");
    assert.ok(scorecard.breakdown.visualQuestionScore > 0, "ELH-12 must score points for visual question");
    assert.ok(scorecard.breakdown.appliedScenarioScore > 0, "ELH-12 must score points for applied scenario");
  });

  test("25. ELH-13 sustainability action planning course reaches target quality score threshold (>= 95)", async () => {
    const scorecard = await evaluateCourseQuality("ELH-13");
    assert.ok(scorecard.totalScore >= 95, `ELH-13 score must be >= 95, got ${scorecard.totalScore}`);
    assert.equal(scorecard.releaseBlockers.length, 0, `ELH-13 must have 0 release blockers, got ${scorecard.releaseBlockers.join("; ")}`);
    assert.equal(scorecard.isReleaseReady, true, "ELH-13 must be flagged as release ready");
  });

  test("26. ELH-13 diagnostic breakdown includes memorable fact, visual question, and scenario scores", async () => {
    const scorecard = await evaluateCourseQuality("ELH-13");
    assert.ok(scorecard.breakdown.memorableFactScore > 0, "ELH-13 must score points for memorable fact");
    assert.ok(scorecard.breakdown.visualQuestionScore > 0, "ELH-13 must score points for visual question");
    assert.ok(scorecard.breakdown.appliedScenarioScore > 0, "ELH-13 must score points for applied scenario");
  });

  test("27. ELH-14 setting departmental sustainability goals course reaches target quality score threshold (>= 95)", async () => {
    const scorecard = await evaluateCourseQuality("ELH-14");
    assert.ok(scorecard.totalScore >= 95, `ELH-14 score must be >= 95, got ${scorecard.totalScore}`);
    assert.equal(scorecard.releaseBlockers.length, 0, `ELH-14 must have 0 release blockers, got ${scorecard.releaseBlockers.join("; ")}`);
    assert.equal(scorecard.isReleaseReady, true, "ELH-14 must be flagged as release ready");
  });

  test("28. ELH-14 diagnostic breakdown includes memorable fact, visual question, and scenario scores", async () => {
    const scorecard = await evaluateCourseQuality("ELH-14");
    assert.ok(scorecard.breakdown.memorableFactScore > 0, "ELH-14 must score points for memorable fact");
    assert.ok(scorecard.breakdown.visualQuestionScore > 0, "ELH-14 must score points for visual question");
    assert.ok(scorecard.breakdown.appliedScenarioScore > 0, "ELH-14 must score points for applied scenario");
  });

  test("29. ELH-15 building workplace sustainability team course reaches target quality score threshold (>= 95)", async () => {
    const scorecard = await evaluateCourseQuality("ELH-15");
    assert.ok(scorecard.totalScore >= 95, `ELH-15 score must be >= 95, got ${scorecard.totalScore}`);
    assert.equal(scorecard.releaseBlockers.length, 0, `ELH-15 must have 0 release blockers, got ${scorecard.releaseBlockers.join("; ")}`);
    assert.equal(scorecard.isReleaseReady, true, "ELH-15 must be flagged as release ready");
  });

  test("30. ELH-15 diagnostic breakdown includes memorable fact, visual question, and scenario scores", async () => {
    const scorecard = await evaluateCourseQuality("ELH-15");
    assert.ok(scorecard.breakdown.memorableFactScore > 0, "ELH-15 must score points for memorable fact");
    assert.ok(scorecard.breakdown.visualQuestionScore > 0, "ELH-15 must score points for visual question");
    assert.ok(scorecard.breakdown.appliedScenarioScore > 0, "ELH-15 must score points for applied scenario");
  });
});
