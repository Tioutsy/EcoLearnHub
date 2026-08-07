import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { db, coursesTable, lessonsTable, quizQuestionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

describe("Audit: Module 2 Decision Scenarios & Quiz Integrity (ELH-01 to ELH-29)", () => {
  test("Verify active platform courses contain lessons and quiz questions in database", async () => {
    const courses = await db.select().from(coursesTable);
    const elhCourses = courses.filter((c) => c.courseCode && c.courseCode.startsWith("ELH-"));

    assert.ok(elhCourses.length >= 1, "Expected at least 1 platform course in database");

    for (const c of elhCourses) {
      const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, c.id));
      assert.ok(lessons.length >= 1, `Course ${c.courseCode} should have lessons`);

      const questions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, c.id));
      assert.ok(questions.length >= 1, `Course ${c.courseCode} should have quiz questions`);
    }
  });
});
