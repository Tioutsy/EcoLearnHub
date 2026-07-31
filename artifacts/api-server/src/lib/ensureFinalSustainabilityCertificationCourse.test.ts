import assert from "node:assert/strict";
import test from "node:test";
import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
  coursePrerequisitesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { ensureFinalSustainabilityCertificationCourse } from "./ensureFinalSustainabilityCertificationCourse";

test("Course 12 (ID 12) Capstone Seeding & Integrity Unit Tests", async () => {
  // 1. Initial seed execution
  console.log("- Running Course 12 capstone seeder...");
  await ensureFinalSustainabilityCertificationCourse();

  // Verify course exists with correct metadata
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, 12))
    .limit(1);

  assert.ok(course, "Course 12 must exist");
  assert.equal(course.slug, "final-sustainability-certification");
  assert.equal(course.passingScore, 80);
  assert.equal(course.status, "published");
  assert.equal(course.title, "Final Sustainability Certification");

  // Verify exactly 6 lessons
  const lessons = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, 12));
  assert.equal(lessons.length, 6, "Must have exactly 6 lessons");

  // Verify every lesson has non-empty contentBlocks
  for (const lesson of lessons) {
    assert.ok(
      Array.isArray(lesson.contentBlocks) &&
        lesson.contentBlocks.length > 0,
      `Lesson "${lesson.title}" must have populated contentBlocks`
    );
  }

  // Verify exactly 15 quiz questions
  const quizQuestions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.courseId, 12));
  assert.equal(
    quizQuestions.length,
    15,
    "Must have exactly 15 capstone quiz questions"
  );

  // Verify no dummy questions remain
  const dummyQuestions = quizQuestions.filter((q) => q.question.includes("Resource Management Scenario") || q.options.includes("Option A"));
  assert.equal(dummyQuestions.length, 0, "No dummy questions must remain in capstone assessment");

  // Verify badge definition
  const [badge] = await db
    .select()
    .from(badgeDefinitionsTable)
    .where(eq(badgeDefinitionsTable.slug, "core-sustainability-certified"))
    .limit(1);
  assert.ok(badge, "Core Sustainability Certificate badge must exist");
  assert.equal(badge.name, "Core Sustainability Certificate");

  // Verify system seed marker was recorded
  const [seedMarker] = await db
    .select()
    .from(systemSeedsTable)
    .where(eq(systemSeedsTable.name, "final-certification-v2"))
    .limit(1);
  assert.ok(seedMarker, "Seed marker final-certification-v2 must be recorded");

  // 2. Idempotency test — run seeder again; counts must not change
  console.log("- Running seeder again for idempotency check...");
  await ensureFinalSustainabilityCertificationCourse();

  const lessonsRetry = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, 12));
  assert.equal(
    lessonsRetry.length,
    6,
    "Second run must not duplicate lessons"
  );

  const quizRetry = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.courseId, 12));
  assert.equal(
    quizRetry.length,
    15,
    "Second run must not duplicate quiz questions"
  );

  // 3. Integrity guard check — repair missing questions
  console.log("- Testing integrity guard (deleting quiz questions to trigger repair)...");
  await db.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, 12));
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "final-certification-v2"));

  await ensureFinalSustainabilityCertificationCourse();

  const quizRepaired = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.courseId, 12));
  assert.equal(quizRepaired.length, 15, "Repaired course must contain 15 questions");
});
