import assert from "node:assert/strict";
import test from "node:test";
import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { ensureEsgInMyJobCourse } from "./ensureEsgInMyJobCourse";

test("Course 34 (ELH-34) Seeding & Integrity Unit Tests", async () => {
  // 1. Initial seed execution
  console.log("- Running Course 34 seeder...");
  await ensureEsgInMyJobCourse();

  // Verify course exists with correct metadata
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.courseCode, "ELH-34"))
    .limit(1);

  assert.ok(course, "ELH-34 course must exist");
  assert.equal(course.slug, "esg-in-my-job-from-policy-to-everyday-action");
  assert.equal(course.passingScore, 80);
  assert.equal(course.status, "published");
  assert.equal(course.title, "ESG in My Job: From Policy to Everyday Action");

  // Verify exactly 6 lessons
  const lessons = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, course.id));
  assert.equal(lessons.length, 6, "Must have exactly 6 lessons");

  // Verify every lesson has non-empty contentBlocks
  for (const lesson of lessons) {
    assert.ok(
      Array.isArray(lesson.contentBlocks) &&
        lesson.contentBlocks.length > 0,
      `Lesson "${lesson.title}" must have populated contentBlocks`
    );
  }

  // Verify exactly 5 quiz questions
  const quizQuestions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.courseId, course.id));
  assert.equal(
    quizQuestions.length,
    5,
    "Must have exactly 5 quiz questions"
  );

  // Verify badge definition
  const [badge] = await db
    .select()
    .from(badgeDefinitionsTable)
    .where(eq(badgeDefinitionsTable.slug, "esg-action-practitioner"))
    .limit(1);
  assert.ok(badge, "ESG Action Practitioner badge must exist");

  // Verify system seed marker was recorded
  const [seedMarker] = await db
    .select()
    .from(systemSeedsTable)
    .where(eq(systemSeedsTable.name, "esg-in-my-job-from-policy-to-everyday-action-v1"))
    .limit(1);
  assert.ok(seedMarker, "Seed marker esg-in-my-job-from-policy-to-everyday-action-v1 must be recorded");

  // 2. Idempotency test — run seeder again; counts must not change
  console.log("- Running seeder again for idempotency check...");
  await ensureEsgInMyJobCourse();

  const lessonsRetry = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, course.id));
  assert.equal(
    lessonsRetry.length,
    6,
    "Second run must not duplicate lessons"
  );

  const quizRetry = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.courseId, course.id));
  assert.equal(
    quizRetry.length,
    5,
    "Second run must not duplicate quiz questions"
  );
});
