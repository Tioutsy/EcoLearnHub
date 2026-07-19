import assert from "node:assert/strict";
import test from "node:test";
import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
  enrollmentsTable,
  quizAttemptsTable,
  courseCommitmentsTable,
  certificatesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ensureEnergyEfficiencyCourse } from "./ensureEnergyEfficiencyCourse";
import { calculateEmployeeAverageScore } from "./lms";

test("Course 3 Seeding & Integrity Unit Tests", async () => {
  await db.transaction(async (tx) => {
    // 1. Initial Course 3 seed execution
    console.log("- Running seeder...");
    await ensureEnergyEfficiencyCourse(tx);

    // Verify course exists
    const [course] = await tx
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.id, 3))
      .limit(1);

    assert.ok(course);
    assert.equal(course.slug, "energy-efficiency-at-work");
    assert.equal(course.passingScore, 80);

    // Verify exactly 6 lessons exist
    const lessons = await tx
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, 3));
    assert.equal(lessons.length, 6);

    // Verify exactly 8 quiz questions exist
    const quizQuestions = await tx
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, 3));
    assert.equal(quizQuestions.length, 8);

    // Verify badge definition
    const [badge] = await tx
      .select()
      .from(badgeDefinitionsTable)
      .where(eq(badgeDefinitionsTable.slug, "energy-saver"))
      .limit(1);
    assert.ok(badge);
    assert.equal(badge.name, "Energy Saver");

    // 2. Idempotency test (repeated seeding without duplication)
    console.log("- Running seeder again for idempotency check...");
    await ensureEnergyEfficiencyCourse(tx);

    const lessonsRetry = await tx
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, 3));
    assert.equal(lessonsRetry.length, 6);

    const quizRetry = await tx
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, 3));
    assert.equal(quizRetry.length, 8);

    // 3. Integrity guard checks: Repair content when missing
    console.log("- Testing integrity guard (deleting all quiz questions to trigger repair)...");
    await tx.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, 3));
    await tx.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "energy-efficiency-at-work-v1"));

    // Run seeder to repair missing questions
    await ensureEnergyEfficiencyCourse(tx);

    const quizRepaired = await tx
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, 3));
    assert.equal(quizRepaired.length, 8);

    // 4. Preservation of administrator edits
    console.log("- Testing preservation of legitimate administrator edits...");
    // Update a lesson title manually to simulate admin edit
    await tx
      .update(lessonsTable)
      .set({ title: "Custom Admin Title" })
      .where(and(eq(lessonsTable.courseId, 3), eq(lessonsTable.orderIndex, 0)));

    // Re-run seeder. Since there are no missing lessons, empty blocks, or skeleton markers, it should skip repair and preserve the admin edit!
    await ensureEnergyEfficiencyCourse(tx);

    const [adminLesson] = await tx
      .select()
      .from(lessonsTable)
      .where(and(eq(lessonsTable.courseId, 3), eq(lessonsTable.orderIndex, 0)))
      .limit(1);
    assert.equal(adminLesson?.title, "Custom Admin Title");

    // 5. Average score rollup logic tests (highest passing score)
    console.log("- Testing average score rollup rules...");
    const attempts = [
      { courseId: 3, score: 50, passed: false },
      { courseId: 3, score: 70, passed: false },
      { courseId: 3, score: 90, passed: true },
      { courseId: 3, score: 100, passed: true },
    ];
    const rollupResult = calculateEmployeeAverageScore(attempts);
    assert.equal(rollupResult, 100); // Should select the highest passing score (100) and ignore fails (50, 70)

    // Force rollback of this test transaction so we do not pollute the database
    tx.rollback();
  }).catch((err) => {
    // If it's a manual rollback, that's expected and successful!
    if (err && err.message === "Rollback") {
      console.log("- Test transaction rolled back cleanly.");
    } else if (err && err.name === "TransactionRollbackError") {
      console.log("- Test transaction rolled back cleanly.");
    } else {
      throw err;
    }
  });
});
