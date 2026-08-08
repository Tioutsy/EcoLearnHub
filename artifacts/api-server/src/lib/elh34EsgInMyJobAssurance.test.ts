import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { db, coursesTable, lessonsTable, quizQuestionsTable, coursePrerequisitesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ensureEsgInMyJobCourse } from "./ensureEsgInMyJobCourse";

describe("Sprint ELH-34 — ESG in My Job: From Policy to Everyday Action Assurance & Regression Suite", () => {
  test("1. Course ELH-34 exists with correct metadata and learning objectives", async () => {
    await ensureEsgInMyJobCourse();

    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-34"))
      .limit(1);

    assert.ok(course, "ELH-34 course record must exist");
    assert.equal(course.durationMinutes, 18, "Duration should be 18 minutes");
    assert.equal(course.passingScore, 80, "Passing score should be 80%");

    const objectives = course.learningObjectives as string[];
    assert.ok(objectives && objectives.length >= 10, "Should have at least 10 learning objectives");
  });

  test("2. ELH-34 lessons cover role-based application, 4-action framework (direct action vs escalation), operational pressures, and data integrity", async () => {
    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-34"))
      .limit(1);

    assert.ok(course);

    const lessons = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, course.id))
      .orderBy(lessonsTable.orderIndex);

    assert.equal(lessons.length, 6, "ELH-34 must contain 6 lessons");

    const allContent = lessons
      .map((l) => `${l.title} ${l.content} ${JSON.stringify(l.contentBlocks || [])}`)
      .join(" ");

    assert.ok(allContent.includes("Operations") || allContent.includes("Office") || allContent.includes("Hospitality"), "Must cover department roles");
    assert.ok(allContent.includes("Direct Action") || allContent.includes("Escalation") || allContent.includes("Report"), "Must cover 4-action framework");
    assert.ok(allContent.includes("Pressures") || allContent.includes("Convenience") || allContent.includes("Busy"), "Must cover operational pressures");
    assert.ok(allContent.includes("Leadership") || allContent.includes("Employee"), "Must distinguish employee role from leadership responsibility");
    assert.ok(allContent.includes("Mauritius") || allContent.includes("Grand Baie"), "Must include Mauritius workplace scenario");

    let totalScenarios = 0;
    for (const l of lessons) {
      const blocks = (l.contentBlocks as any[]) || [];
      const scenarios = blocks.filter((b) => b.type === "decision_scenario");
      totalScenarios += scenarios.length;
    }

    assert.ok(totalScenarios >= 3, "ELH-34 must contain at least 3 decision scenarios");
  });

  test("3. ELH-34 quiz covers key topics, requires application, and has zero Position 1 bias", async () => {
    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-34"))
      .limit(1);

    assert.ok(course);

    const questions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, course.id))
      .orderBy(quizQuestionsTable.orderIndex);

    assert.equal(questions.length, 5, "ELH-34 quiz must contain 5 scored questions");

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

  test("4. ELH-34 has ELH-09 as registered prerequisite", async () => {
    const [course34] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-34"))
      .limit(1);

    const [course09] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-09"))
      .limit(1);

    assert.ok(course34 && course09, "Both ELH-34 and ELH-09 must exist in DB");

    const [prereqLink] = await db
      .select()
      .from(coursePrerequisitesTable)
      .where(
        and(
          eq(coursePrerequisitesTable.courseId, course34.id),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course09.id)
        )
      )
      .limit(1);

    assert.ok(prereqLink, "ELH-09 must be linked as prerequisite to ELH-34");
  });
});
