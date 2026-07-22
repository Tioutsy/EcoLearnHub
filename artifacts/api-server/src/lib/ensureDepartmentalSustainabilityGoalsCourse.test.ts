import assert from "node:assert/strict";
import test from "node:test";
import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  coursePrerequisitesTable,
  systemSeedsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { ensureDepartmentalSustainabilityGoalsCourse } from "./ensureDepartmentalSustainabilityGoalsCourse";

test("Course 14 Seeding & Integrity Unit Tests", async () => {
  try {
    await db.transaction(async (tx) => {
      // Clean seed record if it exists to force execution
      await tx.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "departmental-sustainability-goals-v1"));

      // Run seeder
      await ensureDepartmentalSustainabilityGoalsCourse();

      // Verify course exists
      const [course] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.slug, "setting-departmental-sustainability-goals"))
        .limit(1);

      assert.ok(course, "Course 14 must be created");
      assert.equal(course.courseCode, "ELH-14");
      assert.equal(course.passingScore, 80);

      // Verify exactly 6 lessons exist
      const lessons = await tx
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, course.id));
      assert.equal(lessons.length, 6, "Should seed exactly 6 lessons");

      // Verify exactly 8 quiz questions exist
      const quizQuestions = await tx
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, course.id));
      assert.equal(quizQuestions.length, 8, "Should seed exactly 8 quiz questions");

      // Verify badge definition
      const [badge] = await tx
        .select()
        .from(badgeDefinitionsTable)
        .where(eq(badgeDefinitionsTable.slug, "departmental-sustainability-goal-setter"))
        .limit(1);
      assert.ok(badge, "Badge must be created");
      assert.equal(badge.name, "Departmental Sustainability Goal Setter");

      // Verify prerequisites
      const prereqs = await tx
        .select()
        .from(coursePrerequisitesTable)
        .where(eq(coursePrerequisitesTable.courseId, course.id));
      assert.equal(prereqs.length, 2, "Should have 2 prerequisite entries (Course 12 and Course 13)");

      // Run again for idempotency check
      await ensureDepartmentalSustainabilityGoalsCourse();

      const coursesPost = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.slug, "setting-departmental-sustainability-goals"));
      assert.equal(coursesPost.length, 1, "Idempotency: Should not duplicate course");

      // Trigger rollback to clean up test database changes
      tx.rollback();
    });
  } catch (err: any) {
    // Drizzle uses custom error throwing for transaction rollbacks
    if (err && (err.message === "Rollback" || err.name === "TransactionRollbackError")) {
      // Expected rollback to keep DB clean
      return;
    }
    throw err;
  }
});
