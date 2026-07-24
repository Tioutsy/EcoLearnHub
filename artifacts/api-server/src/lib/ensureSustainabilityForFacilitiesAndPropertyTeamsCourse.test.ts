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
import { ensureSustainabilityForFacilitiesAndPropertyTeamsCourse } from "./ensureSustainabilityForFacilitiesAndPropertyTeamsCourse";

// Thorough cleanup of Course 27 data, recommendations, and orphans
async function cleanUpCourse27() {
  const [emp] = await db.select().from(employeesTable).where(eq(employeesTable.clerkUserId, "preserve_facilities_user_id")).limit(1);
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
  await db.delete(quizAttemptsTable).where(eq(quizAttemptsTable.userId, "preserve_facilities_user_id"));
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "sustainability-for-facilities-and-property-teams-v1"));

  // Reset Course 26 recommendation link unconditionally
  await db.update(coursesTable)
    .set({ recommendedNextCourseId: null })
    .where(eq(coursesTable.courseCode, "ELH-26"));

  const c27s = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-27"));
  const c27Ids = c27s.map(c => c.id);
  if (c27Ids.length > 0) {
    await db.delete(lessonsTable).where(inArray(lessonsTable.courseId, c27Ids));
    await db.delete(quizQuestionsTable).where(inArray(quizQuestionsTable.courseId, c27Ids));
    await db.delete(coursesTable).where(inArray(coursesTable.id, c27Ids));
  }
}

test("Course 27 Seeding & Integrity Unit Tests", async () => {
  await cleanUpCourse27();

  try {
    await db.transaction(async (tx) => {
      // 0. Set up prerequisite courses (ELH-12 and ELH-26) if they do not exist
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

      let c26 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-26")
      });
      if (!c26) {
        [c26] = await tx.insert(coursesTable).values({
          courseCode: "ELH-26",
          slug: "sustainability-for-operations-teams",
          title: "Sustainability for Operations Teams",
          level: "Applied Workplace Practice",
          passingScore: 80,
          status: "published",
          isPublished: true,
          description: "Prerequisite Course 26",
          categoryId: 1,
        }).returning();
      }

      // Run seeder
      await ensureSustainabilityForFacilitiesAndPropertyTeamsCourse();

      // Verify course exists and matches metadata
      const [course] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-27"))
        .limit(1);

      assert.ok(course, "Course 27 must be created");
      assert.equal(course.slug, "sustainability-for-facilities-and-property-teams");
      assert.equal(course.title, "Sustainability for Facilities and Property Teams");
      assert.equal(course.level, "Applied Workplace Practice");
      assert.equal(course.durationMinutes, 19);
      assert.equal(course.passingScore, 80);

      // Verify lessons count and order
      const lessons = await tx
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, course.id))
        .orderBy(lessonsTable.orderIndex);
      assert.equal(lessons.length, 6, "Should seed exactly 6 lessons");
      for (let i = 0; i < 6; i++) {
        assert.equal(lessons[i].orderIndex, i, `Lesson ${i} order index must be ${i}`);
      }

      // Verify quiz questions count and structural feedback
      const quizQuestions = await tx
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, course.id));
      assert.equal(quizQuestions.length, 8, "Should seed exactly 8 quiz questions");

      for (const q of quizQuestions) {
        assert.equal(q.options.length, 4, "Question must have exactly 4 options");
        assert.ok(q.correctOption >= 0 && q.correctOption < 4, "Correct option index must be valid (0-3)");
        assert.ok(q.optionFeedback, "Option feedback must be defined");
        assert.equal(q.optionFeedback.length, 4, "Must have feedback for all 4 options");
        
        for (const f of q.optionFeedback) {
          assert.ok(f && f.length > 0, "Each option feedback must be a populated string");
        }

        assert.ok(q.correctExplanation && q.correctExplanation.length > 0, "Must have correct explanation");
        assert.ok(q.incorrectExplanation && q.incorrectExplanation.length > 0, "Must have incorrect explanation");
        assert.ok(q.practicalTakeaway && q.practicalTakeaway.length > 0, "Must have practical takeaway");
      }

      // Verify badge definition
      const [badge] = await tx
        .select()
        .from(badgeDefinitionsTable)
        .where(eq(badgeDefinitionsTable.slug, "sustainable-facilities-practitioner"))
        .limit(1);
      assert.ok(badge, "Badge must be created");
      assert.equal(badge.code, "COURSE_ELH_27_COMPLETE");

      // Verify prerequisites (ELH-12 and ELH-26)
      const prereqs = await tx
        .select()
        .from(coursePrerequisitesTable)
        .where(eq(coursePrerequisitesTable.courseId, course.id));
      assert.equal(prereqs.length, 2, "Should have exactly 2 prerequisites");
      const prereqIds = prereqs.map(p => p.prerequisiteCourseId);
      assert.ok(prereqIds.includes(c12.id), "Prerequisite should include Course 12");
      assert.ok(prereqIds.includes(c26.id), "Prerequisite should include Course 26");

      // Verify Course 26 recommendation link points to Course 27
      const [c26Post] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.id, c26.id))
        .limit(1);
      assert.equal(c26Post.recommendedNextCourseId, course.id, "Course 26 should recommend Course 27");

      // 2. Repeated execution does not duplicate course
      await ensureSustainabilityForFacilitiesAndPropertyTeamsCourse();
      const coursesPost = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-27"));
      assert.equal(coursesPost.length, 1, "Idempotency: Should not duplicate course record");

      tx.rollback();
    });
  } catch (err: any) {
    if (err && (err.message === "Rollback" || err.name === "TransactionRollbackError")) {
      return;
    }
    throw err;
  }
});

test("Course 27 Learner Data Preservation Unit Tests", async () => {
  await cleanUpCourse27();

  try {
    let c12 = await db.query.coursesTable.findFirst({ where: eq(coursesTable.courseCode, "ELH-12") });
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
    let c26 = await db.query.coursesTable.findFirst({ where: eq(coursesTable.courseCode, "ELH-26") });
    if (!c26) {
      [c26] = await db.insert(coursesTable).values({
        courseCode: "ELH-26",
        slug: "sustainability-for-operations-teams",
        title: "Sustainability for Operations Teams",
        level: "Applied Workplace Practice",
        passingScore: 80,
        status: "published",
        isPublished: true,
        description: "Prerequisite Course 26",
        categoryId: 1,
      }).returning();
    }

    await ensureSustainabilityForFacilitiesAndPropertyTeamsCourse();

    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-27")).limit(1);
    const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, course.id)).limit(1);
    const [badge] = await db.select().from(badgeDefinitionsTable).where(eq(badgeDefinitionsTable.slug, "sustainable-facilities-practitioner")).limit(1);

    const [employee] = await db.insert(employeesTable).values({
      name: "Test Preserved Facilities User",
      email: "preserve27@ecolearn.mu",
      clerkUserId: "preserve_facilities_user_id",
      companyId: 1,
      role: "employee",
      enrolledCourses: 1,
      completedCourses: 1,
      certificates: 0,
      learningMinutes: 10,
      avgScore: 85,
    }).returning();

    const [enrollment] = await db.insert(enrollmentsTable).values({
      userId: "preserve_facilities_user_id",
      employeeId: employee.id,
      courseId: course.id,
      status: "completed",
      progressPct: 100,
      completedAt: new Date(),
    }).returning();

    await db.insert(lessonProgressTable).values({
      enrollmentId: enrollment.id,
      lessonId: lesson.id,
      completed: 1,
      completedAt: new Date(),
    });

    await db.insert(quizAttemptsTable).values({
      userId: "preserve_facilities_user_id",
      courseId: course.id,
      score: 90,
      totalQuestions: 8,
      correctAnswers: 7,
      passed: true,
    });

    await db.insert(employeeBadgesTable).values({
      employeeId: employee.id,
      companyId: employee.companyId,
      badgeId: badge.id,
      earnedAt: new Date(),
      awardSource: "course_completion",
    });

    await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "sustainability-for-facilities-and-property-teams-v1"));

    await ensureSustainabilityForFacilitiesAndPropertyTeamsCourse();

    const enrollmentPost = await db.query.enrollmentsTable.findFirst({
      where: eq(enrollmentsTable.id, enrollment.id)
    });
    assert.ok(enrollmentPost, "Enrollment must be preserved");
    assert.equal(enrollmentPost.status, "completed", "Enrollment status must remain 'completed'");

    const progressPost = await db.query.lessonProgressTable.findFirst({
      where: eq(lessonProgressTable.enrollmentId, enrollment.id)
    });
    assert.ok(progressPost, "Lesson progress must be preserved");

    const attemptPost = await db.query.quizAttemptsTable.findFirst({
      where: eq(quizAttemptsTable.userId, "preserve_facilities_user_id")
    });
    assert.ok(attemptPost, "Quiz attempt must be preserved");

    const badgePost = await db.query.employeeBadgesTable.findFirst({
      where: and(
        eq(employeeBadgesTable.employeeId, employee.id),
        eq(employeeBadgesTable.badgeId, badge.id)
      )
    });
    assert.ok(badgePost, "Badge award must be preserved");

  } finally {
    await cleanUpCourse27();
  }
});

test("Course 27 Transactional Rollback Atomicity Unit Tests", async () => {
  await cleanUpCourse27();

  let c12 = await db.query.coursesTable.findFirst({ where: eq(coursesTable.courseCode, "ELH-12") });
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
  let c26 = await db.query.coursesTable.findFirst({ where: eq(coursesTable.courseCode, "ELH-26") });
  if (!c26) {
    [c26] = await db.insert(coursesTable).values({
      courseCode: "ELH-26",
      slug: "sustainability-for-operations-teams",
      title: "Sustainability for Operations Teams",
      level: "Applied Workplace Practice",
      passingScore: 80,
      status: "published",
      isPublished: true,
      description: "Prerequisite Course 26",
      categoryId: 1,
    }).returning();
  }

  const originalTransaction = db.transaction;
  const proto = Object.getPrototypeOf(db);
  const originalProtoTransaction = proto?.transaction;
  let didThrow = false;

  try {
    const mockTx = async (callback: any) => {
      return originalTransaction.call(db, async (tx: any) => {
        await callback(tx);
        throw new Error("Forced transaction failure for testing Course 27 rollback");
      });
    };

    db.transaction = mockTx as any;
    if (proto) {
      proto.transaction = mockTx as any;
    }

    await ensureSustainabilityForFacilitiesAndPropertyTeamsCourse();
  } catch (err: any) {
    assert.equal(err.message, "Forced transaction failure for testing Course 27 rollback");
    didThrow = true;
  } finally {
    db.transaction = originalTransaction;
    if (proto && originalProtoTransaction) {
      proto.transaction = originalProtoTransaction;
    }
  }

  assert.ok(didThrow, "Seeder must throw when database insert fails");

  const course = await db.query.coursesTable.findFirst({
    where: eq(coursesTable.courseCode, "ELH-27")
  });
  assert.ok(!course, "Course 27 record should not exist because the transaction rolled back");
});
