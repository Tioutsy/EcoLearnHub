import {
  db,
  coursesTable,
  lessonsTable,
  quizAttemptsTable,
  lessonProgressTable,
  enrollmentsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { ensureCircularEconomyCourse } from "./lib/ensureCircularEconomyCourse";

async function verifyIdempotency() {
  console.log("==> Simulating learner data for Course 11...");

  const course = await db.query.coursesTable.findFirst({
    where: eq(coursesTable.slug, "circular-economy"),
  });
  if (!course) { console.error("❌ Course 11 not found!"); process.exit(1); }

  const lesson = await db.query.lessonsTable.findFirst({
    where: eq(lessonsTable.courseId, course.id),
  });
  if (!lesson) { console.error("❌ Lesson not found!"); process.exit(1); }

  const FAKE_USER_ID = "fake-learner-123";

  // Cleanup old if exists
  await db.delete(quizAttemptsTable).where(eq(quizAttemptsTable.userId, FAKE_USER_ID));
  await db.delete(lessonProgressTable).where(eq(lessonProgressTable.enrollmentId, 99999));
  await db.delete(enrollmentsTable).where(eq(enrollmentsTable.userId, FAKE_USER_ID));

  // Insert Enrollment
  const [enrollment] = await db.insert(enrollmentsTable).values({
    userId: FAKE_USER_ID,
    courseId: course.id,
  }).returning();

  // Insert fake quiz attempt
  await db.insert(quizAttemptsTable).values({
    userId: FAKE_USER_ID,
    courseId: course.id,
    score: 80,
    passed: true,
    responses: { "q1": "opt-1" },
  });

  // Insert fake lesson progress
  await db.insert(lessonProgressTable).values({
    enrollmentId: enrollment.id,
    lessonId: lesson.id,
    completed: 1,
  });

  console.log("✅ Inserted fake quiz attempt and lesson progress.");

  console.log("==> Running Seeder Again...");
  await ensureCircularEconomyCourse();

  console.log("==> Verifying learner data survived...");

  const attempt = await db.query.quizAttemptsTable.findFirst({
    where: eq(quizAttemptsTable.userId, FAKE_USER_ID),
  });
  if (!attempt) {
    console.error("❌ Quiz attempt was destroyed!");
    process.exit(1);
  } else {
    console.log("✅ Quiz attempt preserved!");
  }

  const progress = await db.query.lessonProgressTable.findFirst({
    where: eq(lessonProgressTable.enrollmentId, enrollment.id),
  });
  if (!progress) {
    console.error("❌ Lesson progress was destroyed!");
    process.exit(1);
  } else {
    console.log("✅ Lesson progress preserved!");
  }

  // Cleanup
  await db.delete(quizAttemptsTable).where(eq(quizAttemptsTable.userId, FAKE_USER_ID));
  await db.delete(lessonProgressTable).where(eq(lessonProgressTable.enrollmentId, enrollment.id));
  await db.delete(enrollmentsTable).where(eq(enrollmentsTable.userId, FAKE_USER_ID));

  console.log("\nDone.");
  process.exit(0);
}

verifyIdempotency().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
