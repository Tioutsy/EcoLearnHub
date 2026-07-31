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
import { ensureEnergyEfficiencyCourse } from "./ensureEnergyEfficiencyCourse";

test("Course 3 Seeding & Integrity Unit Tests", async () => {
  // 1. Initial Course 3 seed execution
  console.log("- Running seeder...");
  await ensureEnergyEfficiencyCourse();

  // Verify course exists
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, 3))
    .limit(1);

  assert.ok(course);
  assert.equal(course.slug, "energy-efficiency-at-work");
  assert.equal(course.passingScore, 80);

  // Verify exactly 6 lessons exist
  const lessons = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, 3));
  assert.equal(lessons.length, 6);

  // Verify exactly 5 quiz questions exist
  const quizQuestions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.courseId, 3));
  assert.equal(quizQuestions.length, 5);

  // Verify badge definition
  const [badge] = await db
    .select()
    .from(badgeDefinitionsTable)
    .where(eq(badgeDefinitionsTable.slug, "energy-saver"))
    .limit(1);
  assert.ok(badge);
  assert.equal(badge.name, "Energy Saver");

  // 2. Idempotency test (repeated seeding without duplication)
  console.log("- Running seeder again for idempotency check...");
  await ensureEnergyEfficiencyCourse();

  const lessonsRetry = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, 3));
  assert.equal(lessonsRetry.length, 6);

  const quizRetry = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.courseId, 3));
  assert.equal(quizRetry.length, 5);

  // 3. Integrity guard checks: Repair content when missing
  console.log("- Testing integrity guard (deleting all quiz questions to trigger repair)...");
  await db.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, 3));
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "energy-efficiency-at-work-v2"));

  // Run seeder to repair missing questions
  await ensureEnergyEfficiencyCourse();

  const quizRepaired = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.courseId, 3));
  assert.equal(quizRepaired.length, 5);
});
