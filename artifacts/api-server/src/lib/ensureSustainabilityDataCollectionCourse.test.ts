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
import { ensureSustainabilityDataCollectionCourse } from "./ensureSustainabilityDataCollectionCourse";

test("Course 18 (ELH-18) Seeding & Integrity Unit Tests", async () => {
  // 1. Initial seed execution
  console.log("- Running Course 18 seeder...");
  await ensureSustainabilityDataCollectionCourse();

  // Verify course exists with correct metadata
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.courseCode, "ELH-18"))
    .limit(1);

  assert.ok(course, "Course ELH-18 must exist");
  assert.equal(course.slug, "sustainability-data-collection-and-evidence");
  assert.equal(course.passingScore, 80);
  assert.equal(course.status, "published");
  assert.equal(course.title, "Sustainability Data Collection and Evidence");

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
    .where(eq(badgeDefinitionsTable.slug, "sustainability-evidence-contributor"))
    .limit(1);
  assert.ok(badge, "Sustainability Data Collector badge must exist");
  assert.equal(badge.name, "Sustainability Data Collector");

  // Verify system seed marker was recorded
  const [seedMarker] = await db
    .select()
    .from(systemSeedsTable)
    .where(eq(systemSeedsTable.name, "sustainability-data-collection-and-evidence-v2"))
    .limit(1);
  assert.ok(seedMarker, "Seed marker sustainability-data-collection-and-evidence-v2 must be recorded");

  // 2. Idempotency test — run seeder again; counts must not change
  console.log("- Running seeder again for idempotency check...");
  await ensureSustainabilityDataCollectionCourse();

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
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "sustainability-data-collection-and-evidence-v2"));

  await ensureSustainabilityDataCollectionCourse();

  const quizRepaired = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.courseId, course.id));
  assert.equal(quizRepaired.length, 10, "Repaired course must contain 10 questions");
});
