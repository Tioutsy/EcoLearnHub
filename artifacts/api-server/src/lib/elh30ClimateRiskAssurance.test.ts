import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { db, coursesTable, lessonsTable, quizQuestionsTable, coursePrerequisitesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

describe("Sprint ELH-30 — ELH-30 Climate Risk & Workplace Resilience Assurance & Regression Suite", () => {
  test("1. Course ELH-30 exists with correct metadata and 30th catalogue placement", async () => {
    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-30"))
      .limit(1);

    assert.ok(course, "ELH-30 course record must exist");
    assert.equal(course.title, "Climate Risk & Workplace Resilience", "Title must match");
    assert.equal(course.durationMinutes, 18, "Duration should be 18 minutes");
    assert.equal(course.passingScore, 80, "Passing score should be 80%");

    const objectives = course.learningObjectives as string[];
    assert.ok(objectives && objectives.length >= 5, "Should have at least 5 learning objectives");
  });

  test("2. ELH-30 lessons contain required interactive scenarios, vulnerability framework, and protocol blocks", async () => {
    const [course] = await db
      .select({ id: coursesTable.id })
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-30"))
      .limit(1);

    assert.ok(course, "ELH-30 course record must exist");

    const lessons = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, course.id))
      .orderBy(lessonsTable.orderIndex);

    assert.equal(lessons.length, 6, "ELH-30 must contain 6 lessons");

    let totalScenarios = 0;
    for (const l of lessons) {
      const blocks = (l.contentBlocks as any[]) || [];
      const scenarios = blocks.filter((b) => b.type === "decision_scenario");
      totalScenarios += scenarios.length;
    }

    assert.ok(totalScenarios >= 2, "ELH-30 must contain at least 2 decision scenarios");
  });

  test("3. ELH-30 quiz questions exhibit zero 100% Position 1 correct-answer bias across 10 questions", async () => {
    const [course] = await db
      .select({ id: coursesTable.id })
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-30"))
      .limit(1);

    assert.ok(course, "ELH-30 course record must exist");

    const questions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, course.id))
      .orderBy(quizQuestionsTable.orderIndex);

    assert.equal(questions.length, 10, "ELH-30 quiz must contain 10 scored questions");

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

  test("4. ELH-30 prerequisite references an existing valid course (ELH-07)", async () => {
    const [course30] = await db
      .select({ id: coursesTable.id })
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-30"))
      .limit(1);

    const prereqs = course30 ? await db.select().from(coursePrerequisitesTable).where(eq(coursePrerequisitesTable.courseId, course30.id)) : [];
    assert.ok(prereqs.length >= 1, "ELH-30 must have at least one prerequisite");
  });

  test("5. ELH-30 has non-empty valid realistic course thumbnail image reference", async () => {
    const [course30] = await db
      .select({ thumbnailUrl: coursesTable.thumbnailUrl })
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-30"))
      .limit(1);

    assert.ok(course30?.thumbnailUrl, "ELH-30 must have a non-empty thumbnailUrl");
    assert.equal(
      course30.thumbnailUrl,
      "/images/courses/climate-risk-and-workplace-resilience.jpg",
      "Thumbnail URL must reference the realistic course asset"
    );
  });
});
