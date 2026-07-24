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
import { ensureSustainabilityForHrTeamsCourse } from "./ensureSustainabilityForHrTeamsCourse";

// Thorough cleanup of Course 24 data, recommendations, and orphans
async function cleanUpCourse24() {
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
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "sustainability-for-hr-teams-v1"));

  // Reset Course 23 recommendation link unconditionally
  await db.update(coursesTable)
    .set({ recommendedNextCourseId: null })
    .where(eq(coursesTable.courseCode, "ELH-23"));

  const c24s = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-24"));
  const c24Ids = c24s.map(c => c.id);
  if (c24Ids.length > 0) {
    await db.delete(lessonsTable).where(inArray(lessonsTable.courseId, c24Ids));
    await db.delete(quizQuestionsTable).where(inArray(quizQuestionsTable.courseId, c24Ids));
    await db.delete(coursesTable).where(inArray(coursesTable.id, c24Ids));
  }
}

test("Course 24 Seeding & Integrity Unit Tests", async () => {
  await cleanUpCourse24();

  try {
    await db.transaction(async (tx) => {
      // 0. Set up prerequisite courses (ELH-12 and ELH-21) if they do not exist
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

      let c21 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-21")
      });
      if (!c21) {
        [c21] = await tx.insert(coursesTable).values({
          courseCode: "ELH-21",
          slug: "building-employee-engagement-in-sustainability",
          title: "Building Employee Engagement in Sustainability",
          level: "Applied Workplace Practice",
          passingScore: 80,
          status: "published",
          isPublished: true,
          description: "Prerequisite Course 21",
          categoryId: 1,
        }).returning();
      }

      let c23 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-23")
      });
      if (!c23) {
        [c23] = await tx.insert(coursesTable).values({
          courseCode: "ELH-23",
          slug: "planning-and-delivering-workplace-sustainability-initiatives",
          title: "Planning and Delivering Workplace Sustainability Initiatives",
          level: "Applied Workplace Practice",
          passingScore: 80,
          status: "published",
          isPublished: true,
          description: "Prerequisite Course 23",
          categoryId: 1,
        }).returning();
      }

      // Run seeder
      await ensureSustainabilityForHrTeamsCourse();

      // Verify course exists and matches metadata
      const [course] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-24"))
        .limit(1);

      assert.ok(course, "Course 24 must be created");
      assert.equal(course.slug, "sustainability-for-hr-teams");
      assert.equal(course.title, "Sustainability for HR Teams");
      assert.equal(course.level, "Applied Workplace Practice");
      assert.equal(course.durationMinutes, 18);
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
        .where(eq(badgeDefinitionsTable.slug, "sustainability-aware-hr"))
        .limit(1);
      assert.ok(badge, "Badge must be created");
      assert.equal(badge.code, "COURSE_ELH_24_COMPLETE");

      // Verify prerequisites (ELH-12 and ELH-21)
      const prereqs = await tx
        .select()
        .from(coursePrerequisitesTable)
        .where(eq(coursePrerequisitesTable.courseId, course.id));
      assert.equal(prereqs.length, 2, "Should have exactly 2 prerequisites");
      const prereqIds = prereqs.map(p => p.prerequisiteCourseId);
      assert.ok(prereqIds.includes(c12.id), "Prerequisite should include Course 12");
      assert.ok(prereqIds.includes(c21.id), "Prerequisite should include Course 21");

      // Verify Course 23 recommendation link points to Course 24
      const [c23Post] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.id, c23.id))
        .limit(1);
      assert.equal(c23Post.recommendedNextCourseId, course.id, "Course 23 should recommend Course 24");

      // 2. Repeated execution does not duplicate course
      await ensureSustainabilityForHrTeamsCourse();
      const coursesPost = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-24"));
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

test("Course 24 Learner Data Preservation Unit Tests", async () => {
  await cleanUpCourse24();

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
    let c21 = await db.query.coursesTable.findFirst({ where: eq(coursesTable.courseCode, "ELH-21") });
    if (!c21) {
      [c21] = await db.insert(coursesTable).values({
        courseCode: "ELH-21",
        slug: "building-employee-engagement-in-sustainability",
        title: "Building Employee Engagement in Sustainability",
        level: "Applied Workplace Practice",
        passingScore: 80,
        status: "published",
        isPublished: true,
        description: "Prerequisite Course 21",
        categoryId: 1,
      }).returning();
    }

    await ensureSustainabilityForHrTeamsCourse();

    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-24")).limit(1);
    const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, course.id)).limit(1);
    const [badge] = await db.select().from(badgeDefinitionsTable).where(eq(badgeDefinitionsTable.slug, "sustainability-aware-hr")).limit(1);

    const [employee] = await db.insert(employeesTable).values({
      name: "Test Preserved User",
      email: "preserve24@ecolearn.mu",
      clerkUserId: "preserve_user_id",
      companyId: 1,
      role: "employee",
      enrolledCourses: 1,
      completedCourses: 1,
      certificates: 0,
      learningMinutes: 10,
      avgScore: 85,
    }).returning();

    const [enrollment] = await db.insert(enrollmentsTable).values({
      userId: "preserve_user_id",
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
      userId: "preserve_user_id",
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

    await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "sustainability-for-hr-teams-v1"));

    await ensureSustainabilityForHrTeamsCourse();

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
      where: eq(quizAttemptsTable.userId, "preserve_user_id")
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
    await cleanUpCourse24();
  }
});

test("Course 24 Transactional Rollback Atomicity Unit Tests", async () => {
  await cleanUpCourse24();

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
  let c21 = await db.query.coursesTable.findFirst({ where: eq(coursesTable.courseCode, "ELH-21") });
  if (!c21) {
    [c21] = await db.insert(coursesTable).values({
      courseCode: "ELH-21",
      slug: "building-employee-engagement-in-sustainability",
      title: "Building Employee Engagement in Sustainability",
      level: "Applied Workplace Practice",
      passingScore: 80,
      status: "published",
      isPublished: true,
      description: "Prerequisite Course 21",
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
        throw new Error("Forced transaction failure for testing Course 24 rollback");
      });
    };

    db.transaction = mockTx as any;
    if (proto) {
      proto.transaction = mockTx as any;
    }

    await ensureSustainabilityForHrTeamsCourse();
  } catch (err: any) {
    assert.equal(err.message, "Forced transaction failure for testing Course 24 rollback");
    didThrow = true;
  } finally {
    db.transaction = originalTransaction;
    if (proto && originalProtoTransaction) {
      proto.transaction = originalProtoTransaction;
    }
  }

  assert.ok(didThrow, "Seeder must throw when database insert fails");

  const course = await db.query.coursesTable.findFirst({
    where: eq(coursesTable.courseCode, "ELH-24")
  });
  assert.ok(!course, "Course 24 record should not exist because the transaction rolled back");
});
