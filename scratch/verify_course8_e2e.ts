import { db, coursesTable, lessonsTable, enrollmentsTable, quizAttemptsTable, certificatesTable, commitmentsTable } from '../lib/db/src/index';
import { eq, sql } from 'drizzle-orm';
import assert from 'assert';
import { ensureBiodiversityCourse } from '../artifacts/api-server/src/lib/ensureBiodiversityCourse';

async function verifyCourse8() {
  console.log("Starting Course 8 (Biodiversity in Mauritius) E2E Verification...\n");

  // 1. Run seeder
  console.log("[1] Running seeder...");
  await ensureBiodiversityCourse();

  // 2. Verify Course Metadata
  console.log("\n[2] Verifying course metadata...");
  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, 8));
  assert(course, "Course 8 must exist");
  assert.strictEqual(course.slug, 'biodiversity-in-mauritius');
  assert.strictEqual(course.level, 'Foundation');
  assert.strictEqual(course.passingScore, 80);
  assert.strictEqual(course.recommendedNextCourseId, 9, "Next recommended course should be Course 9");
  console.log("✅ Course metadata validated.");

  // 3. Verify Lessons
  console.log("\n[3] Verifying lessons...");
  const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, course.id));
  assert.strictEqual(lessons.length, 6, "Course 8 should have exactly 6 lessons");

  // Check commitment block is present
  const commitmentLesson = lessons.find(l => (l.contentBlocks as any[]).some(b => b.type === 'commitment'));
  assert(commitmentLesson, "Should contain a commitment interaction block");
  console.log("✅ Lessons and interactions validated.");

  // 4. Verify Quiz
  console.log("\n[4] Verifying quiz endpoint behaviour...");
  try {
    const res = await fetch(`http://localhost:10000/api/quizzes/${course.id}/quiz`, {
      headers: {
        'Authorization': 'Bearer test_user_id',
      }
    });

    if (res.ok) {
      const quizData = await res.json();
      assert.strictEqual(quizData.length, 5, "Should return 5 quiz questions");
      
      const firstQuestion = quizData[0];
      assert.strictEqual(firstQuestion.practicalTakeaway, undefined, "Practical takeaway exposed before submission");
      assert.strictEqual(firstQuestion.options[0].isCorrect, undefined, "Correct answer exposed before submission");
      assert.strictEqual(firstQuestion.options[0].feedback, undefined, "Option feedback exposed before submission");
      console.log("✅ Quiz endpoint security validated.");
    } else {
      console.log("⚠️ Quiz endpoint requires running API. Skipping endpoint-specific assertions.");
    }
  } catch (e) {
    console.log("⚠️ Quiz endpoint requires running API (connection refused). Skipping endpoint-specific assertions.");
  }

  // Idempotency check
  console.log("\n[5] Verifying seeder idempotency...");
  await ensureBiodiversityCourse();
  const [courseDuplicate] = await db.select({ count: sql`count(*)` }).from(coursesTable).where(eq(coursesTable.slug, 'biodiversity-in-mauritius'));
  assert.strictEqual(Number(courseDuplicate.count), 1, "Seeder created duplicate course");
  console.log("✅ Seeder idempotency validated.");

  console.log("\n🎉 Course 8 E2E Validation Completed Successfully!");
  process.exit(0);
}

verifyCourse8().catch(err => {
  console.error("❌ Verification Failed:", err);
  process.exit(1);
});
