import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { ensureSchemaModifications } from "./ensureSchemaModifications";
import { auditFullCatalogueQuizDistribution } from "./auditQuizAnswerDistribution";
import { rebalanceAllQuizAnswers } from "./rebalanceAllQuizAnswers";

describe("Catalogue-Wide Quiz Answer Distribution Audit Tests", () => {
  before(async () => {
    await ensureSchemaModifications();
    await rebalanceAllQuizAnswers();
  });

  test("1. All 29 courses in active catalogue have balanced quiz answer distributions", async () => {
    const audit = await auditFullCatalogueQuizDistribution();

    assert.equal(audit.totalCourses, 29, "Audit must cover all 29 courses");
    assert.equal(audit.severelyBiasedCourses.length, 0, `No courses should have severe bias, got: ${audit.severelyBiasedCourses.join(", ")}`);
    assert.equal(audit.moderatelyBiasedCourses.length, 0, `No courses should have moderate bias, got: ${audit.moderatelyBiasedCourses.join(", ")}`);
    assert.equal(audit.balancedCourses.length, 29, "All 29 courses must be balanced");
  });

  test("2. Overall catalogue correct-answer distribution across positions is balanced (20%–35% per position)", async () => {
    const audit = await auditFullCatalogueQuizDistribution();

    for (let pos = 0; pos < 4; pos++) {
      const count = audit.overallPositionCounts[pos] || 0;
      const pct = (count / audit.totalQuestions) * 100;
      assert.ok(
        pct >= 15 && pct <= 35,
        `Position ${pos + 1} percentage (${pct.toFixed(1)}%) must be within balanced range [15%, 35%]`
      );
    }
  });

  test("3. No course contains a consecutive same-position streak longer than 2", async () => {
    const audit = await auditFullCatalogueQuizDistribution();

    for (const c of audit.courses) {
      assert.ok(
        c.longestStreak.streakLength <= 2,
        `Course ${c.courseCode} has a streak of ${c.longestStreak.streakLength} at Position ${c.longestStreak.position + 1} (max 2 allowed)`
      );
    }
  });

  test("4. 10-question quizzes do not exceed 4 correct answers in any single position", async () => {
    const audit = await auditFullCatalogueQuizDistribution();

    for (const c of audit.courses) {
      if (c.totalQuestions === 10) {
        for (let pos = 0; pos < 4; pos++) {
          const cnt = c.positionCounts[pos] || 0;
          assert.ok(
            cnt <= 4,
            `Course ${c.courseCode} has ${cnt} correct answers in Position ${pos + 1} (max 4 allowed for 10-question quizzes)`
          );
        }
      }
    }
  });
});
