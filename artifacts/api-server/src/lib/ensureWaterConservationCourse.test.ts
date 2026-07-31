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
import { ensureWaterConservationCourse } from "./ensureWaterConservationCourse";

test("Course 4 Seeding & Integrity Unit Tests", async () => {
  // 1. Initial seed execution
  console.log("- Running Course 4 seeder...");
  await ensureWaterConservationCourse();

  // Verify course exists with correct metadata
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, 4))
    .limit(1);

  assert.ok(course, "Course 4 must exist");
  assert.equal(course.slug, "water-conservation");
  assert.equal(course.passingScore, 80);
  assert.equal(course.status, "published");
  assert.equal(course.title, "Water Conservation");

  // Verify exactly 6 lessons
  const lessons = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, 4));
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
    .where(eq(quizQuestionsTable.courseId, 4));
  assert.equal(
    quizQuestions.length,
    5,
    "Must have exactly 5 quiz questions"
  );

  // Verify badge definition
  const [badge] = await db
    .select()
    .from(badgeDefinitionsTable)
    .where(eq(badgeDefinitionsTable.slug, "water-wise-at-work"))
    .limit(1);
  assert.ok(badge, "Workplace Water Steward badge must exist");
  assert.equal(badge.name, "Workplace Water Steward");

  // Verify system seed marker was recorded
  const [seedMarker] = await db
    .select()
    .from(systemSeedsTable)
    .where(eq(systemSeedsTable.name, "water-conservation-v2"))
    .limit(1);
  assert.ok(seedMarker, "Seed marker water-conservation-v2 must be recorded");

  // 2. Idempotency test — run seeder again; counts must not change
  console.log("- Running seeder again for idempotency check...");
  await ensureWaterConservationCourse();

  const lessonsRetry = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, 4));
  assert.equal(
    lessonsRetry.length,
    6,
    "Second run must not duplicate lessons"
  );

  const quizRetry = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.courseId, 4));
  assert.equal(
    quizRetry.length,
    5,
    "Second run must not duplicate quiz questions"
  );

  // 3. Integrity guard check — repair missing questions
  console.log("- Testing integrity guard (deleting quiz questions to trigger repair)...");
  await db.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, 4));
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "water-conservation-v2"));

  await ensureWaterConservationCourse();

  const quizRepaired = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.courseId, 4));
  assert.equal(quizRepaired.length, 5, "Repaired course must contain 5 questions");
});
