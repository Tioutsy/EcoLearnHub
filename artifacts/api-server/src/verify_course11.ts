import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { ensureCircularEconomyCourse } from "./lib/ensureCircularEconomyCourse";

async function verifyCourse11() {
  console.log("Running Course 11 seeder...");
  await ensureCircularEconomyCourse();

  console.log("Verifying Course 11 (Circular Economy)...");

  // 1. Course record
  const course = await db.query.coursesTable.findFirst({
    where: eq(coursesTable.slug, "circular-economy"),
  });

  if (!course) {
    console.error("❌ Course not found!");
    process.exit(1);
  }

  console.log("✅ Course found:", course.title);
  console.log("  - ID:", course.id);
  console.log("  - Passing Score:", course.passingScore);
  console.log("  - Next Course ID:", course.recommendedNextCourseId);
  console.log("  - Is Published:", course.isPublished);
  console.log("  - Status:", course.status);

  if (course.passingScore !== 80) console.error("❌ Passing score is not 80");
  if (course.recommendedNextCourseId !== 12) console.error("❌ Next course is not 12");

  // 2. Lessons
  const lessons = await db.query.lessonsTable.findMany({
    where: eq(lessonsTable.courseId, course.id),
  });
  console.log(`✅ Lessons found: ${lessons.length} (Expected 6)`);
  if (lessons.length !== 6) console.error("❌ Invalid lesson count!");

  // 3. Quizzes
  const quizzes = await db.query.quizQuestionsTable.findMany({
    where: eq(quizQuestionsTable.courseId, course.id),
  });
  console.log(`✅ Quiz questions found: ${quizzes.length} (Expected 10)`);
  if (quizzes.length !== 10) console.error("❌ Invalid quiz count!");

  // 4. Badge
  const badges = await db.query.badgeDefinitionsTable.findMany({
    where: eq(badgeDefinitionsTable.slug, "circular-economy-practitioner"),
  });
  console.log(`✅ Badge definitions found: ${badges.length} (Expected 1)`);
  if (badges.length !== 1) console.error("❌ Invalid badge count!");
  if (badges.length === 1 && badges[0].courseIds[0] !== course.id) {
    console.error(`❌ Badge is linked to course ID ${badges[0].courseIds[0]} instead of ${course.id}`);
  }

  // 5. Check if placeholder badge is gone
  const skeletonBadges = await db.query.badgeDefinitionsTable.findMany({
    where: eq(badgeDefinitionsTable.slug, "circular-economy-badge"),
  });
  console.log(`✅ Skeleton badge definitions found: ${skeletonBadges.length} (Expected 0)`);
  if (skeletonBadges.length > 0) console.error("❌ Skeleton badge was not deleted!");

  const seed = await db.query.systemSeedsTable.findFirst({
    where: eq(systemSeedsTable.name, "circular-economy-v1"),
  });
  console.log(`✅ Seeder record: ${seed ? "Found" : "Missing"}`);

  console.log("\nDone.");
  process.exit(0);
}

verifyCourse11().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
