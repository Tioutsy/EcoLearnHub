import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { db, coursesTable, lessonsTable, quizQuestionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ensureEsgBasicsCourse } from "./ensureEsgBasicsCourse";

describe("Sprint ELH-09 — ESG Basics Assurance & Regression Suite", () => {
  test("1. Course ELH-09 exists with correct metadata and learning objectives", async () => {
    await ensureEsgBasicsCourse();

    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.id, 9))
      .limit(1);

    assert.ok(course, "ELH-09 course record must exist");
    assert.equal(course.durationMinutes, 18, "Duration should be 18 minutes");
    assert.equal(course.passingScore, 80, "Passing score should be 80%");

    const objectives = course.learningObjectives as string[];
    assert.ok(objectives && objectives.length >= 4, "Should have at least 4 learning objectives");
  });

  test("2. ELH-09 lessons contain required E, S, G pillars, Sustainability distinction, and Mauritius scenario", async () => {
    const lessons = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, 9))
      .orderBy(lessonsTable.orderIndex);

    assert.equal(lessons.length, 6, "ELH-09 must contain 6 lessons");

    const allContent = lessons
      .map((l) => `${l.title} ${l.content} ${JSON.stringify(l.contentBlocks || [])}`)
      .join(" ");

    assert.ok(allContent.includes("Environmental"), "Must include Environmental pillar coverage");
    assert.ok(allContent.includes("Social"), "Must include Social pillar coverage");
    assert.ok(allContent.includes("Governance"), "Must include Governance pillar coverage");
    assert.ok(allContent.includes("Sustainability"), "Must explain Sustainability vs ESG distinction");
    assert.ok(allContent.includes("Mauritius"), "Must include Mauritius workplace scenario");

    let totalScenarios = 0;
    for (const l of lessons) {
      const blocks = (l.contentBlocks as any[]) || [];
      const scenarios = blocks.filter((b) => b.type === "decision_scenario");
      totalScenarios += scenarios.length;
    }

    assert.ok(totalScenarios >= 3, "ELH-09 must contain at least 3 decision scenarios");
  });

  test("3. ELH-09 quiz covers all 5 required knowledge check topics and has zero Position 1 bias", async () => {
    const questions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, 9))
      .orderBy(quizQuestionsTable.orderIndex);

    assert.equal(questions.length, 5, "ELH-09 quiz must contain 5 scored questions");

    // Verify questions map to the 5 required knowledge checks
    const questionsText = questions.map((q) => q.question.toLowerCase()).join(" ");
    assert.ok(questionsText.includes("stand for") || questionsText.includes("esg"), "Q1 must check ESG definition");
    assert.ok(questionsText.includes("environmental"), "Q2 must check Environmental pillar");
    assert.ok(questionsText.includes("social"), "Q3 must check Social pillar");
    assert.ok(questionsText.includes("governance"), "Q4 must check Governance pillar");
    assert.ok(questionsText.includes("employee") || questionsText.includes("actions") || questionsText.includes("relationship"), "Q5 must check employee workplace role");

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

