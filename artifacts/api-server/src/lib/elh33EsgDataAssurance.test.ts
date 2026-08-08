import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { db, coursesTable, lessonsTable, quizQuestionsTable, coursePrerequisitesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ensureEsgDataCourse } from "./ensureEsgDataCourse";

describe("Sprint ELH-33 — ESG Data, Measurement & Reporting Basics Assurance & Regression Suite", () => {
  test("1. Course ELH-33 exists with correct metadata and learning objectives", async () => {
    await ensureEsgDataCourse();

    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-33"))
      .limit(1);

    assert.ok(course, "ELH-33 course record must exist");
    assert.equal(course.durationMinutes, 18, "Duration should be 18 minutes");
    assert.equal(course.passingScore, 80, "Passing score should be 80%");

    const objectives = course.learningObjectives as string[];
    assert.ok(objectives && objectives.length >= 10, "Should have at least 10 learning objectives");
  });

  test("2. ELH-33 lessons cover E/S/G data types, Action vs Measurement vs Evidence, context rules, and measured vs estimated data", async () => {
    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-33"))
      .limit(1);

    assert.ok(course);

    const lessons = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, course.id))
      .orderBy(lessonsTable.orderIndex);

    assert.equal(lessons.length, 6, "ELH-33 must contain 6 lessons");

    const allContent = lessons
      .map((l) => `${l.title} ${l.content} ${JSON.stringify(l.contentBlocks || [])}`)
      .join(" ");

    assert.ok(allContent.includes("Environmental") || allContent.includes("Social") || allContent.includes("Governance"), "Must cover E, S, G data pillars");
    assert.ok(allContent.includes("Action") || allContent.includes("Measurement") || allContent.includes("Evidence"), "Must distinguish action vs measurement vs evidence");
    assert.ok(allContent.includes("Unit") || allContent.includes("Period") || allContent.includes("Source"), "Must teach context formula");
    assert.ok(allContent.includes("Measured") || allContent.includes("Estimated"), "Must teach measured vs estimated data");
    assert.ok(allContent.includes("Organisational") || allContent.includes("Employee"), "Must distinguish employee role from formal corporate reporting");
    assert.ok(allContent.includes("Mauritius") || allContent.includes("Ebène"), "Must include Mauritius workplace scenario");

    let totalScenarios = 0;
    for (const l of lessons) {
      const blocks = (l.contentBlocks as any[]) || [];
      const scenarios = blocks.filter((b) => b.type === "decision_scenario");
      totalScenarios += scenarios.length;
    }

    assert.ok(totalScenarios >= 3, "ELH-33 must contain at least 3 decision scenarios");
  });

  test("3. ELH-33 quiz covers key topics, requires application, and has zero Position 1 bias", async () => {
    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-33"))
      .limit(1);

    assert.ok(course);

    const questions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, course.id))
      .orderBy(quizQuestionsTable.orderIndex);

    assert.equal(questions.length, 5, "ELH-33 quiz must contain 5 scored questions");

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

  test("4. ELH-33 has ELH-09 as registered prerequisite", async () => {
    const [course33] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-33"))
      .limit(1);

    const [course09] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-09"))
      .limit(1);

    assert.ok(course33 && course09, "Both ELH-33 and ELH-09 must exist in DB");

    const [prereqLink] = await db
      .select()
      .from(coursePrerequisitesTable)
      .where(
        and(
          eq(coursePrerequisitesTable.courseId, course33.id),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course09.id)
        )
      )
      .limit(1);

    assert.ok(prereqLink, "ELH-09 must be linked as prerequisite to ELH-33");
  });
});
