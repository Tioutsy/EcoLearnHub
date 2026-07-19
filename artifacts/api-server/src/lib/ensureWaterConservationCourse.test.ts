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
import { eq, and } from "drizzle-orm";
import { ensureWaterConservationCourse } from "./ensureWaterConservationCourse";
import { calculateEmployeeAverageScore } from "./lms";

test("Course 4 Seeding & Integrity Unit Tests", async () => {
  await db
    .transaction(async (tx) => {
      // 1. Initial seed execution
      console.log("- Running Course 4 seeder...");
      await ensureWaterConservationCourse(tx);

      // Verify course exists with correct metadata
      const [course] = await tx
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
      const lessons = await tx
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

      // Verify exactly 8 quiz questions
      const quizQuestions = await tx
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, 4));
      assert.equal(
        quizQuestions.length,
        8,
        "Must have exactly 8 quiz questions"
      );

      // Verify correct-answer positions are distributed (not all the same index)
      const correctPositions = quizQuestions.map((q: any) => q.correctOption);
      const uniquePositions = new Set(correctPositions);
      assert.ok(
        uniquePositions.size >= 3,
        `Correct answer positions should be distributed across at least 3 distinct indexes. Got: ${correctPositions.join(", ")}`
      );

      // Verify badge definition
      const [badge] = await tx
        .select()
        .from(badgeDefinitionsTable)
        .where(eq(badgeDefinitionsTable.slug, "water-wise-at-work"))
        .limit(1);
      assert.ok(badge, "Water Wise at Work badge must exist");
      assert.equal(badge.name, "Water Wise at Work");

      // Verify system seed marker was recorded
      const [seedMarker] = await tx
        .select()
        .from(systemSeedsTable)
        .where(eq(systemSeedsTable.name, "water-conservation-v1"))
        .limit(1);
      assert.ok(seedMarker, "Seed marker water-conservation-v1 must be recorded");

      // 2. Idempotency test — run seeder again; counts must not change
      console.log("- Running seeder again for idempotency check...");
      await ensureWaterConservationCourse(tx);

      const lessonsRetry = await tx
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, 4));
      assert.equal(
        lessonsRetry.length,
        6,
        "Second run must not duplicate lessons"
      );

      const quizRetry = await tx
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, 4));
      assert.equal(
        quizRetry.length,
        8,
        "Second run must not duplicate quiz questions"
      );

      // 3. Integrity guard — delete all quiz questions to trigger repair
      console.log(
        "- Testing integrity guard (deleting all quiz questions to trigger repair)..."
      );
      await tx
        .delete(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, 4));
      await tx
        .delete(systemSeedsTable)
        .where(eq(systemSeedsTable.name, "water-conservation-v1"));

      await ensureWaterConservationCourse(tx);

      const quizRepaired = await tx
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, 4));
      assert.equal(
        quizRepaired.length,
        8,
        "Seeder must repair missing quiz questions"
      );

      // 4. Admin-edit preservation — simulate admin title change
      console.log(
        "- Testing preservation of legitimate administrator edits..."
      );
      await tx
        .update(lessonsTable)
        .set({ title: "Admin Custom Water Title" })
        .where(
          and(eq(lessonsTable.courseId, 4), eq(lessonsTable.orderIndex, 0))
        );

      // Re-run seeder. All content is complete so it should skip and preserve the edit.
      await ensureWaterConservationCourse(tx);

      const [adminLesson] = await tx
        .select()
        .from(lessonsTable)
        .where(
          and(eq(lessonsTable.courseId, 4), eq(lessonsTable.orderIndex, 0))
        )
        .limit(1);
      assert.equal(
        adminLesson?.title,
        "Admin Custom Water Title",
        "Seeder must not overwrite valid admin edits when content is complete"
      );

      // 5. Badge idempotency — run again; must not create duplicate badge definitions
      console.log("- Testing badge idempotency...");
      await ensureWaterConservationCourse(tx);

      const badgeCount = await tx
        .select()
        .from(badgeDefinitionsTable)
        .where(eq(badgeDefinitionsTable.slug, "water-wise-at-work"));
      assert.equal(
        badgeCount.length,
        1,
        "Badge definition must not be duplicated by repeated seeder runs"
      );

      // 6. Official score rollup — highest passing score wins
      console.log("- Testing average score rollup rules...");
      const attempts = [
        { courseId: 4, score: 0, passed: false },
        { courseId: 4, score: 62, passed: false },
        { courseId: 4, score: 87, passed: true },
        { courseId: 4, score: 100, passed: true },
      ];
      const rollupResult = calculateEmployeeAverageScore(attempts);
      assert.equal(
        rollupResult,
        100,
        "Score rollup must return the highest passing score (100), ignoring failures"
      );

      // Force rollback so this test does not pollute the production database
      tx.rollback();
    })
    .catch((err) => {
      if (
        err &&
        (err.message === "Rollback" ||
          err.name === "TransactionRollbackError")
      ) {
        console.log("- Test transaction rolled back cleanly.");
      } else {
        throw err;
      }
    });
});
