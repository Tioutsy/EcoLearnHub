import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { db, coursesTable, lessonsTable, quizQuestionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

describe("Sprint 11C — ELH-03 Energy Efficiency Assurance & Regression Suite", () => {
  test("1. Course ELH-03 exists with correct metadata and learning objectives", async () => {
    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.id, 3))
      .limit(1);

    assert.ok(course, "ELH-03 course record must exist");
    assert.equal(course.durationMinutes, 20, "Duration should be 20 minutes");
    assert.equal(course.passingScore, 80, "Passing score should be 80%");

    const objectives = course.learningObjectives as string[];
    assert.ok(objectives && objectives.length >= 4, "Should have at least 4 learning objectives");
  });

  test("2. ELH-03 lessons contain required interactive scenarios and visual inspection blocks", async () => {
    const lessons = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, 3))
      .orderBy(lessonsTable.orderIndex);

    assert.equal(lessons.length, 6, "ELH-03 must contain 6 lessons");

    let totalScenarios = 0;
    for (const l of lessons) {
      const blocks = (l.contentBlocks as any[]) || [];
      const scenarios = blocks.filter((b) => b.type === "decision_scenario");
      totalScenarios += scenarios.length;
    }

    assert.ok(totalScenarios >= 3, "ELH-03 must contain at least 3 decision scenarios");
  });

  test("3. ELH-03 quiz questions exhibit zero 100% Position 1 correct-answer bias", async () => {
    const questions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, 3))
      .orderBy(quizQuestionsTable.orderIndex);

    assert.equal(questions.length, 5, "ELH-03 quiz must contain 5 scored questions");

    const positionCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    for (const q of questions) {
      const correctIdx = q.correctOption;
      assert.ok(correctIdx >= 0 && correctIdx <= 3, "Correct option index must be valid");
      positionCounts[correctIdx] = (positionCounts[correctIdx] || 0) + 1;
    }

    // Position 1 (index 0) must NOT dominate (< 50% of questions)
    const position1Percentage = (positionCounts[0] / questions.length) * 100;
    assert.ok(
      position1Percentage < 50,
      `Position 1 dominance detected: ${position1Percentage.toFixed(1)}% of questions have correct answer in Position 1`
    );
  });
});
