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
  enrollmentsTable,
  lessonProgressTable,
  quizAttemptsTable,
  employeeBadgesTable,
  employeesTable,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { ensureSustainabilityForOperationsAndFrontlineTeamsCourse } from "./ensureSustainabilityForOperationsAndFrontlineTeamsCourse";

// Thorough cleanup of Course 29 data, recommendations, and orphans
async function cleanUpCourse29() {
  const [emp] = await db.select().from(employeesTable).where(eq(employeesTable.clerkUserId, "preserve_user_id")).limit(1);
  if (emp) {
    await db.delete(employeeBadgesTable).where(eq(employeeBadgesTable.employeeId, emp.id));
    const enrolls = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.employeeId, emp.id));
    const enrollIds = enrolls.map(e => e.id);
    if (enrollIds.length > 0) {
      await db.delete(lessonProgressTable).where(inArray(lessonProgressTable.enrollmentId, enrollIds));
      await db.delete(enrollmentsTable).where(inArray(enrollmentsTable.id, enrollIds));
    }
    await db.delete(employeesTable).where(eq(employeesTable.id, emp.id));
  }
  await db.delete(quizAttemptsTable).where(eq(quizAttemptsTable.userId, "preserve_user_id"));
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "sustainability-for-operations-and-frontline-teams-v1"));

  // Reset Course 28 recommendation link unconditionally
  await db.update(coursesTable)
    .set({ recommendedNextCourseId: null })
    .where(eq(coursesTable.courseCode, "ELH-28"));

  const c29s = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-29"));
  const c29Ids = c29s.map(c => c.id);
  if (c29Ids.length > 0) {
    await db.delete(lessonsTable).where(inArray(lessonsTable.courseId, c29Ids));
    await db.delete(quizQuestionsTable).where(inArray(quizQuestionsTable.courseId, c29Ids));
    await db.delete(coursesTable).where(inArray(coursesTable.id, c29Ids));
  }
}

test("Course 29 Seeding & Integrity Unit Tests", async () => {
  await cleanUpCourse29();

  try {
    await db.transaction(async (tx) => {
      // 0. Set up prerequisite courses (ELH-12 and ELH-17) and recommender course (ELH-28) if they do not exist
      let c12 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-12")
      });
      if (!c12) {
        [c12] = await tx.insert(coursesTable).values({
          courseCode: "ELH-12",
          slug: "final-sustainability-certification",
          title: "Final Sustainability Certification",
          level: "advanced",
          passingScore: 80,
          status: "published",
          isPublished: true,
          description: "Prerequisite Course 12",
          categoryId: 1,
        }).returning();
      }

      let c28 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-28")
      });
      if (!c28) {
        [c28] = await tx.insert(coursesTable).values({
          courseCode: "ELH-28",
          slug: "sustainability-for-sales-and-marketing-teams",
          title: "Sustainability for Sales and Marketing Teams",
          level: "Applied Workplace Practice",
          passingScore: 80,
          status: "published",
          isPublished: true,
          description: "Recommending Course 28",
          categoryId: 1,
        }).returning();
      }
    });

    // 1. Run the seeder to populate the course data
    await ensureSustainabilityForOperationsAndFrontlineTeamsCourse();

    const course = await db.query.coursesTable.findFirst({
      where: eq(coursesTable.courseCode, "ELH-29")
    });

    assert.ok(course, "Course 29 must exist in the database");
    assert.equal(course.slug, "sustainability-for-operations-and-frontline-teams");
    assert.equal(course.title, "Sustainability for Operations and Frontline Teams");
    assert.equal(course.passingScore, 80);

    const lessons = await db.query.lessonsTable.findMany({
      where: eq(lessonsTable.courseId, course.id),
      orderBy: lessonsTable.orderIndex
    });
    assert.equal(lessons.length, 6, "Course 29 must contain exactly 6 lessons");
    assert.equal(lessons[0].title, "Daily Operations Shape Environmental Performance");
    assert.equal(lessons[1].title, "Recognise Waste and Abnormal Conditions");
    assert.equal(lessons[2].title, "Act Within Your Role and Escalate Clearly");
    assert.equal(lessons[3].title, "Follow Procedures Without Losing Practical Judgement");
    assert.equal(lessons[4].title, "Report Problems With Useful Evidence");
    assert.equal(lessons[5].title, "Contribute to Improvements and Check Results");

    const quizQuestions = await db.query.quizQuestionsTable.findMany({
      where: eq(quizQuestionsTable.courseId, course.id),
      orderBy: quizQuestionsTable.orderIndex
    });
    assert.equal(quizQuestions.length, 8, "Course 29 must contain exactly 8 quiz questions");
    for (const q of quizQuestions) {
      assert.equal(q.options.length, 4, "Every quiz question must have 4 options");
      assert.equal(q.optionFeedback?.length, 4, "Every option must have feedback");
      assert.ok(q.correctOption !== null && q.correctOption >= 0 && q.correctOption <= 3, "Correct option index must be valid");
    }

    const badge = await db.query.badgeDefinitionsTable.findFirst({
      where: eq(badgeDefinitionsTable.code, "COURSE_ELH_29_COMPLETE")
    });
    assert.ok(badge, "Course 29 completion badge must be created");
    assert.equal(badge.slug, "operational-sustainability-practitioner");
    assert.equal(badge.name, "Operational Sustainability Practitioner");

    // Verify prerequisite: exactly ELH-12 (Final Sustainability Certification), nothing else
    const prereqs = await db.select({
      prereqId: coursePrerequisitesTable.prerequisiteCourseId
    }).from(coursePrerequisitesTable).where(eq(coursePrerequisitesTable.courseId, course!.id));
    assert.equal(prereqs.length, 1, "ELH-29 must have exactly 1 prerequisite (ELH-12)");
    const [prereqCourse] = await db.select({ courseCode: coursesTable.courseCode, title: coursesTable.title })
      .from(coursesTable).where(eq(coursesTable.id, prereqs[0].prereqId)).limit(1);
    assert.equal(prereqCourse.courseCode, "ELH-12", "ELH-29 prerequisite course code must be ELH-12");
    assert.equal(prereqCourse.title, "Final Sustainability Certification", "ELH-29 prerequisite must be Final Sustainability Certification");

    // 2. Test Idempotency: Running it twice shouldn't duplicate entries
    await ensureSustainabilityForOperationsAndFrontlineTeamsCourse();
    
    const duplicateCourses = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-29"));
    assert.equal(duplicateCourses.length, 1, "Running the seeder again must not duplicate the course record");

    const duplicateLessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, course.id));
    assert.equal(duplicateLessons.length, 6, "Running the seeder again must not duplicate the lessons");

    const duplicateQuestions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, course.id));
    assert.equal(duplicateQuestions.length, 8, "Running the seeder again must not duplicate quiz questions");

    // 3. Test Data Preservation: Seeder does not run again if seed record exists
    // Modify one lesson title
    await db.update(lessonsTable).set({ title: "Admin Edited Lesson Title" }).where(eq(lessonsTable.id, lessons[0].id));
    await ensureSustainabilityForOperationsAndFrontlineTeamsCourse();

    const checkLesson = await db.query.lessonsTable.findFirst({
      where: eq(lessonsTable.id, lessons[0].id)
    });
    assert.equal(checkLesson?.title, "Admin Edited Lesson Title", "Subsequent seeder runs must preserve administrator edits");

  } finally {
    await cleanUpCourse29();
  }
});
