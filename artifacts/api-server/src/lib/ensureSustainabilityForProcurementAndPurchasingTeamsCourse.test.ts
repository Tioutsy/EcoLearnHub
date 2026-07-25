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
import { ensureSustainabilityForProcurementAndPurchasingTeamsCourse } from "./ensureSustainabilityForProcurementAndPurchasingTeamsCourse";

// Thorough cleanup of Course 26 data, recommendations, and orphans
async function cleanUpCourse26() {
  const [emp] = await db.select().from(employeesTable).where(eq(employeesTable.clerkUserId, "preserve_user_id_26")).limit(1);
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
  await db.delete(quizAttemptsTable).where(eq(quizAttemptsTable.userId, "preserve_user_id_26"));
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "sustainability-for-procurement-and-purchasing-teams-v1"));

  // Reset ELH-25 recommendation link unconditionally
  await db.update(coursesTable)
    .set({ recommendedNextCourseId: null })
    .where(eq(coursesTable.courseCode, "ELH-25"));

  const c26s = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-26"));
  const c26Ids = c26s.map(c => c.id);
  if (c26Ids.length > 0) {
    await db.delete(coursePrerequisitesTable).where(inArray(coursePrerequisitesTable.courseId, c26Ids));
    await db.delete(lessonsTable).where(inArray(lessonsTable.courseId, c26Ids));
    await db.delete(quizQuestionsTable).where(inArray(quizQuestionsTable.courseId, c26Ids));
    await db.delete(coursesTable).where(inArray(coursesTable.id, c26Ids));
  }
}

test("Course 26 Seeding & Integrity Unit Tests", async () => {
  await cleanUpCourse26();

  try {
    await db.transaction(async (tx) => {
      // 0. Set up ELH-05 (recommended prerequisite) and ELH-25 (recommender) if they do not exist
      let c05 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-05")
      });
      if (!c05) {
        [c05] = await tx.insert(coursesTable).values({
          courseCode: "ELH-05",
          slug: "sustainable-procurement",
          title: "Sustainable Procurement",
          level: "Applied Workplace Practice",
          passingScore: 80,
          status: "published",
          isPublished: true,
          description: "ELH-05 Recommended Prerequisite",
          categoryId: 1,
        }).returning();
      }

      let c25 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-25")
      });
      if (!c25) {
        [c25] = await tx.insert(coursesTable).values({
          courseCode: "ELH-25",
          slug: "sustainability-for-finance-teams",
          title: "Sustainability for Finance Teams",
          level: "Applied Workplace Practice",
          passingScore: 80,
          status: "published",
          isPublished: true,
          description: "Recommending Course 25",
          categoryId: 1,
        }).returning();
      }

      // Run seeder
      await ensureSustainabilityForProcurementAndPurchasingTeamsCourse();

      // Verify course exists and matches metadata
      const [course] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-26"))
        .limit(1);

      assert.ok(course, "Course 26 must be created");
      assert.equal(course.slug, "sustainability-for-procurement-and-purchasing-teams");
      assert.equal(course.title, "Sustainability for Procurement and Purchasing Teams");
      assert.equal(course.level, "Applied Workplace Practice");
      assert.equal(course.durationMinutes, 18);
      assert.equal(course.passingScore, 80);
      assert.equal(course.courseCode, "ELH-26");

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
      assert.equal(lessons[0].title, "Start With the Need, Not the Product");
      assert.equal(lessons[1].title, "Write Clear and Proportionate Requirements");
      assert.equal(lessons[2].title, "Compare Whole-Life Value, Not Price Alone");
      assert.equal(lessons[3].title, "Test Supplier Claims and Evidence");
      assert.equal(lessons[4].title, "Make and Record a Defensible Decision");
      assert.equal(lessons[5].title, "Manage the Supplier After Award");

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
        .where(eq(badgeDefinitionsTable.slug, "responsible-procurement-practitioner"))
        .limit(1);
      assert.ok(badge, "Badge must be created");
      assert.equal(badge.code, "COURSE_ELH_26_COMPLETE");
      assert.equal(badge.name, "Responsible Procurement Practitioner");

      // Verify ELH-05 recommended prerequisite exists
      const prereqs = await tx
        .select()
        .from(coursePrerequisitesTable)
        .where(eq(coursePrerequisitesTable.courseId, course.id));
      assert.equal(prereqs.length, 1, "Should have exactly 1 prerequisite (ELH-05 recommended)");
      const prereqRecord = prereqs[0];
      assert.equal(prereqRecord.requirementType, "recommended", "ELH-05 prerequisite must be requirementType='recommended'");
      const [prereqCourse] = await tx
        .select({ courseCode: coursesTable.courseCode })
        .from(coursesTable)
        .where(eq(coursesTable.id, prereqRecord.prerequisiteCourseId))
        .limit(1);
      assert.equal(prereqCourse.courseCode, "ELH-05", "ELH-26 recommended prerequisite must be ELH-05");

      // Verify ELH-25 recommendation link points to ELH-26
      const [c25Post] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-25"))
        .limit(1);
      assert.equal(c25Post.recommendedNextCourseId, course.id, "ELH-25 should recommend ELH-26");

      // Idempotency: running again should not duplicate
      await ensureSustainabilityForProcurementAndPurchasingTeamsCourse();
      const coursesPost = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-26"));
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

test("Course 26 Learner Data Preservation Unit Tests", async () => {
  await cleanUpCourse26();

  try {
    let c05 = await db.query.coursesTable.findFirst({ where: eq(coursesTable.courseCode, "ELH-05") });
    if (!c05) {
      [c05] = await db.insert(coursesTable).values({
        courseCode: "ELH-05",
        slug: "sustainable-procurement",
        title: "Sustainable Procurement",
        level: "Applied Workplace Practice",
        passingScore: 80,
        status: "published",
        isPublished: true,
        description: "ELH-05 Recommended Prerequisite",
        categoryId: 1,
      }).returning();
    }

    await ensureSustainabilityForProcurementAndPurchasingTeamsCourse();

    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-26")).limit(1);
    const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, course.id)).limit(1);
    const [badge] = await db.select().from(badgeDefinitionsTable).where(eq(badgeDefinitionsTable.slug, "responsible-procurement-practitioner")).limit(1);

    const [employee] = await db.insert(employeesTable).values({
      name: "Test Preserved User 26",
      email: "preserve26@ecolearn.mu",
      clerkUserId: "preserve_user_id_26",
      companyId: 1,
      role: "employee",
      enrolledCourses: 1,
      completedCourses: 1,
      certificates: 0,
      learningMinutes: 10,
      avgScore: 85,
    }).returning();

    const [enrollment] = await db.insert(enrollmentsTable).values({
      userId: "preserve_user_id_26",
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
      userId: "preserve_user_id_26",
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

    // Delete seed record to simulate re-run
    await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "sustainability-for-procurement-and-purchasing-teams-v1"));

    await ensureSustainabilityForProcurementAndPurchasingTeamsCourse();

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
      where: eq(quizAttemptsTable.userId, "preserve_user_id_26")
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
    await cleanUpCourse26();
  }
});

test("Course 26 Transactional Rollback Atomicity Unit Tests", async () => {
  await cleanUpCourse26();

  let c05 = await db.query.coursesTable.findFirst({ where: eq(coursesTable.courseCode, "ELH-05") });
  if (!c05) {
    [c05] = await db.insert(coursesTable).values({
      courseCode: "ELH-05",
      slug: "sustainable-procurement",
      title: "Sustainable Procurement",
      level: "Applied Workplace Practice",
      passingScore: 80,
      status: "published",
      isPublished: true,
      description: "ELH-05 Recommended Prerequisite",
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
        throw new Error("Forced transaction failure for testing Course 26 rollback");
      });
    };

    db.transaction = mockTx as any;
    if (proto) {
      proto.transaction = mockTx as any;
    }

    await ensureSustainabilityForProcurementAndPurchasingTeamsCourse();
  } catch (err: any) {
    assert.equal(err.message, "Forced transaction failure for testing Course 26 rollback");
    didThrow = true;
  } finally {
    db.transaction = originalTransaction;
    if (proto && originalProtoTransaction) {
      proto.transaction = originalProtoTransaction;
    }
  }

  assert.ok(didThrow, "Seeder must throw when database insert fails");

  const course = await db.query.coursesTable.findFirst({
    where: eq(coursesTable.courseCode, "ELH-26")
  });
  assert.ok(!course, "Course 26 record should not exist because the transaction rolled back");
});
