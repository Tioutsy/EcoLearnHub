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
import { ensureWorkplaceSustainabilityInitiativesCourse } from "./ensureWorkplaceSustainabilityInitiativesCourse";

// Thorough cleanup of Course 23 data, recommendations, and orphans
async function cleanUpCourse23() {
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
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "workplace-sustainability-initiatives-v2"));
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "workplace-sustainability-initiatives-v1"));

  const c23s = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-23"));
  const c23Ids = c23s.map(c => c.id);
  if (c23Ids.length > 0) {
    await db.delete(lessonsTable).where(inArray(lessonsTable.courseId, c23Ids));
    await db.delete(quizQuestionsTable).where(inArray(quizQuestionsTable.courseId, c23Ids));
    await db.delete(coursesTable).where(inArray(coursesTable.id, c23Ids));
  }
}

test("Course 23 Seeding & Integrity Unit Tests", async () => {
  await cleanUpCourse23();

  try {
    // 0. Set up prerequisite courses (ELH-12 and ELH-22) if they do not exist
    let c12 = await db.query.coursesTable.findFirst({
      where: eq(coursesTable.courseCode, "ELH-12")
    });
    if (!c12) {
      [c12] = await db.insert(coursesTable).values({
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

    let c22 = await db.query.coursesTable.findFirst({
      where: eq(coursesTable.courseCode, "ELH-22")
    });
    if (!c22) {
      [c22] = await db.insert(coursesTable).values({
        courseCode: "ELH-22",
        slug: "creating-and-running-effective-green-teams",
        title: "Creating and Running Effective Green Teams",
        level: "Applied Workplace Practice",
        passingScore: 80,
        status: "published",
        isPublished: true,
        description: "Prerequisite Course 22",
        categoryId: 1,
      }).returning();
    }

    // Run seeder
    await ensureWorkplaceSustainabilityInitiativesCourse();

    // Verify course exists and matches metadata
    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-23"))
      .limit(1);

    assert.ok(course, "Course 23 must be created");
    assert.equal(course.slug, "planning-and-delivering-workplace-sustainability-initiatives");
    assert.equal(course.title, "Planning and Delivering Workplace Sustainability Initiatives");
    assert.equal(course.level, "Applied Workplace Practice");
    assert.equal(course.durationMinutes, 20);
    assert.equal(course.passingScore, 80);

    // Verify lessons count and order
    const lessons = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, course.id))
      .orderBy(lessonsTable.orderIndex);
    assert.equal(lessons.length, 12, "Should seed exactly 12 lessons");
    for (let i = 0; i < 12; i++) {
      assert.equal(lessons[i].orderIndex, i, `Lesson ${i} order index must be ${i}`);
    }

    // Verify quiz questions count and structural feedback
    const quizQuestions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, course.id));
    assert.equal(quizQuestions.length, 10, "Should seed exactly 10 quiz questions");

    for (const q of quizQuestions) {
      assert.equal(q.options.length, 4, "Question must have exactly 4 options");
      assert.ok(q.correctOption >= 0 && q.correctOption < 4, "Correct option index must be valid (0-3)");
      assert.ok(q.correctExplanation && q.correctExplanation.length > 0, "Correct explanation must be defined");
    }

    // Verify badge definition
    const [badge] = await db
      .select()
      .from(badgeDefinitionsTable)
      .where(eq(badgeDefinitionsTable.slug, "workplace-sustainability-initiative-practitioner"))
      .limit(1);
    assert.ok(badge, "Badge must be created");
    assert.equal(badge.code, "COURSE_ELH_23_COMPLETE");

    // Verify prerequisites
    const prereqs = await db
      .select()
      .from(coursePrerequisitesTable)
      .where(eq(coursePrerequisitesTable.courseId, course.id));
    assert.ok(prereqs.length >= 2, "Should have prerequisites linked");

    // 2. Repeated execution does not duplicate course
    await ensureWorkplaceSustainabilityInitiativesCourse();
    const coursesPost = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-23"));
    assert.equal(coursesPost.length, 1, "Idempotency: Should not duplicate course record");

  } finally {
    await cleanUpCourse23();
  }
});
