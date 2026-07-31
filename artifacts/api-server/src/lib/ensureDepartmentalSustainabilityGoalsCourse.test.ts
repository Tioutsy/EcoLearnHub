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
import { ensureDepartmentalSustainabilityGoalsCourse } from "./ensureDepartmentalSustainabilityGoalsCourse";

test("Course 14 (ELH-14) Seeding & Integrity Unit Tests", async () => {
  // 1. Initial seed execution
  console.log("- Running Course 14 seeder...");
  await ensureDepartmentalSustainabilityGoalsCourse();

  // Verify course exists with correct metadata
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.courseCode, "ELH-14"))
    .limit(1);

  assert.ok(course, "Course ELH-14 must exist");
  assert.equal(course.slug, "setting-departmental-sustainability-goals");
  assert.equal(course.passingScore, 80);
  assert.equal(course.status, "published");
  assert.equal(course.title, "Setting Departmental Sustainability Goals");

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

  // Verify exactly 10 quiz questions
  const quizQuestions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.courseId, course.id));
  assert.equal(
    quizQuestions.length,
    10,
    "Must have exactly 10 quiz questions"
  );

  // Verify badge definition
  const [badge] = await db
    .select()
    .from(badgeDefinitionsTable)
    .where(eq(badgeDefinitionsTable.slug, "departmental-sustainability-goal-setter"))
    .limit(1);
  assert.ok(badge, "Departmental Sustainability Goal Setter badge must exist");
  assert.equal(badge.name, "Departmental Sustainability Goal Setter");

  // Verify system seed marker was recorded
  const [seedMarker] = await db
    .select()
    .from(systemSeedsTable)
    .where(eq(systemSeedsTable.name, "departmental-sustainability-goals-v2"))
    .limit(1);
  assert.ok(seedMarker, "Seed marker departmental-sustainability-goals-v2 must be recorded");

  // 2. Idempotency test — run seeder again; counts must not change
  console.log("- Running seeder again for idempotency check...");
  await ensureDepartmentalSustainabilityGoalsCourse();

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
    10,
    "Second run must not duplicate quiz questions"
  );

  // 3. Integrity guard check — repair missing questions
  console.log("- Testing integrity guard (deleting quiz questions to trigger repair)...");
  await db.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, course.id));
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "departmental-sustainability-goals-v2"));

  await ensureDepartmentalSustainabilityGoalsCourse();

  const quizRepaired = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.courseId, course.id));
  assert.equal(quizRepaired.length, 10, "Repaired course must contain 10 questions");
});
