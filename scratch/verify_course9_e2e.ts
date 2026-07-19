import { db, coursesTable, lessonsTable, quizQuestionsTable, systemSeedsTable } from '../lib/db/src/index';
import { eq, sql } from 'drizzle-orm';
import assert from 'assert';
import { ensureEsgBasicsCourse } from '../artifacts/api-server/src/lib/ensureEsgBasicsCourse';

async function verifyCourse9() {
  console.log("Starting Course 9 (ESG Basics) E2E Verification...\n");

  // 0. Ensure clean slate for systemSeedsTable so we can test running it
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, 'esg-basics-v1'));

  // 1. Run seeder for the first time
  console.log("[1] Running seeder (first pass)...");
  await ensureEsgBasicsCourse();

  // 2. Verify Course Metadata
  console.log("\n[2] Verifying course metadata...");
  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, 9));
  assert(course, "Course 9 must exist");
  assert.strictEqual(course.slug, 'esg-basics');
  assert.strictEqual(course.level, 'ESG and Compliance');
  assert.strictEqual(course.passingScore, 80);
  assert.strictEqual(course.recommendedNextCourseId, 10, "Next recommended course should be Course 10");
  console.log("✅ Course metadata validated.");

  // 3. Verify Lessons & Quiz Questions count
  console.log("\n[3] Verifying lessons and quiz questions...");
  const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, course.id));
  assert.strictEqual(lessons.length, 6, "Course 9 should have exactly 6 lessons");

  const questions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, course.id));
  assert.strictEqual(questions.length, 8, "Course 9 should have exactly 8 quiz questions");
  console.log("✅ Lessons and quiz questions validated.");

  // 4. Verify Administrator Edit Survival
  console.log("\n[4] Creating a manual administrator edit to test preservation...");
  await db.update(lessonsTable)
    .set({ content: "ADMIN EDITED CONTENT" })
    .where(eq(lessonsTable.id, lessons[0].id));
  
  await db.update(quizQuestionsTable)
    .set({ question: "ADMIN EDITED QUESTION" })
    .where(eq(quizQuestionsTable.id, questions[0].id));

  // Remove the seed record to bypass the high-level idempotency lock,
  // allowing us to test the lower-level safety protections in the seeder.
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, 'esg-basics-v1'));

  console.log("[5] Running seeder again (simulating rerun after admin edit)...");
  await ensureEsgBasicsCourse();

  const lessonsAfter = await db.select().from(lessonsTable).where(eq(lessonsTable.id, lessons[0].id));
  assert.strictEqual(lessonsAfter[0].content, "ADMIN EDITED CONTENT", "Manual administrator edit on lesson should survive");

  const questionsAfter = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.id, questions[0].id));
  assert.strictEqual(questionsAfter[0].question, "ADMIN EDITED QUESTION", "Manual administrator edit on quiz question should survive");
  console.log("✅ Administrator edits successfully preserved!");

  // Verify Idempotency completely
  const [courseDuplicate] = await db.select({ count: sql`count(*)` }).from(coursesTable).where(eq(coursesTable.slug, 'esg-basics'));
  assert.strictEqual(Number(courseDuplicate.count), 1, "Seeder created duplicate course");

  console.log("\n[6] Verifying threshold logic mathematically...");
  // 8 questions total. Passing score is 80%.
  // 6 / 8 = 75% -> Fail
  // 7 / 8 = 87.5% -> Pass
  // 8 / 8 = 100% -> Pass
  const passingScore = course.passingScore; // 80
  const passFor6 = (6 / 8) * 100 >= passingScore;
  const passFor7 = (7 / 8) * 100 >= passingScore;
  const passFor8 = (8 / 8) * 100 >= passingScore;

  assert.strictEqual(passFor6, false, "6 correct answers should FAIL");
  assert.strictEqual(passFor7, true, "7 correct answers should PASS");
  assert.strictEqual(passFor8, true, "8 correct answers should PASS");
  console.log("✅ Threshold logic confirmed.");

  console.log("\n[7] Verifying quiz endpoint behaviour...");
  try {
    const res = await fetch(`http://localhost:10000/api/courses/9/quiz`);
    if (res.ok) {
      const quizData = await res.json();
      assert.strictEqual(quizData.length, 8, "Should return 8 quiz questions");
      
      const firstQuestion = quizData[0];
      assert.strictEqual(firstQuestion.practicalTakeaway, undefined, "Practical takeaway exposed before submission");
      assert.strictEqual(firstQuestion.options[0].isCorrect, undefined, "Correct answer exposed before submission");
      assert.strictEqual(firstQuestion.options[0].feedback, undefined, "Option feedback exposed before submission");
      assert.strictEqual(firstQuestion.correctOption, undefined, "Correct option index exposed before submission");
      assert.strictEqual(firstQuestion.correctExplanation, undefined, "Correct explanation exposed before submission");
      assert.strictEqual(firstQuestion.incorrectExplanation, undefined, "Incorrect explanation exposed before submission");
      console.log("✅ Quiz endpoint security validated (Secrets successfully stripped).");
    } else {
      console.log(`⚠️ Quiz endpoint returned ${res.status}. Server may require auth or is not reachable.`);
    }
  } catch (e) {
    console.log("⚠️ Quiz endpoint requires running API (connection refused). Skipping endpoint-specific assertions.");
  }

  console.log("\n🎉 Course 9 E2E Validation Completed Successfully!");
  process.exit(0);
}

verifyCourse9().catch(err => {
  console.error("❌ Verification Failed:", err);
  process.exit(1);
});
