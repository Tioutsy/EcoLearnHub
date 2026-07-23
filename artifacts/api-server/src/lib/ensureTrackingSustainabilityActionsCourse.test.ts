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
import { ensureTrackingSustainabilityActionsCourse } from "./ensureTrackingSustainabilityActionsCourse";

// Thorough cleanup of Course 17 data, recommendations, and orphans
async function cleanUpCourse17() {
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
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "tracking-sustainability-actions-and-progress-v1"));

  // Reset Course 16 recommendation link unconditionally
  await db.update(coursesTable)
    .set({ recommendedNextCourseId: null })
    .where(eq(coursesTable.courseCode, "ELH-16"));

  const c17s = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-17"));
  const c17Ids = c17s.map(c => c.id);
  if (c17Ids.length > 0) {
    await db.delete(lessonsTable).where(inArray(lessonsTable.courseId, c17Ids));
    await db.delete(quizQuestionsTable).where(inArray(quizQuestionsTable.courseId, c17Ids));
    await db.delete(coursesTable).where(inArray(coursesTable.id, c17Ids));
  }
}

test("Course 17 Seeding & Integrity Unit Tests", async () => {
  await cleanUpCourse17();

  try {
    await db.transaction(async (tx) => {
      // 0. Set up prerequisite courses (ELH-12 and ELH-16) if they do not exist
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

      let c16 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-16")
      });
      if (!c16) {
        [c16] = await tx.insert(coursesTable).values({
          courseCode: "ELH-16",
          slug: "communicating-sustainability-at-work",
          title: "Communicating Sustainability at Work",
          level: "Applied Workplace Practice",
          passingScore: 80,
          status: "published",
          isPublished: true,
          description: "Prerequisite Course 16",
          categoryId: 1,
        }).returning();
      }

      // Run seeder
      await ensureTrackingSustainabilityActionsCourse();

      // Verify course exists and matches metadata
      const [course] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-17"))
        .limit(1);

      assert.ok(course, "Course 17 must be created");
      assert.equal(course.slug, "tracking-sustainability-actions-and-progress");
      assert.equal(course.title, "Tracking Sustainability Actions and Progress");
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
        
        // Check that all feedbacks are non-empty strings
        for (const f of q.optionFeedback) {
          assert.ok(f && f.length > 0, "Each option feedback must be a populated string");
        }

        // Check takeaways and explanations
        assert.ok(q.correctExplanation && q.correctExplanation.length > 0, "Must have correct explanation");
        assert.ok(q.incorrectExplanation && q.incorrectExplanation.length > 0, "Must have incorrect explanation");
        assert.ok(q.practicalTakeaway && q.practicalTakeaway.length > 0, "Must have practical takeaway");
      }

      // Verify badge definition
      const [badge] = await tx
        .select()
        .from(badgeDefinitionsTable)
        .where(eq(badgeDefinitionsTable.slug, "sustainability-progress-tracker"))
        .limit(1);
      assert.ok(badge, "Badge must be created");
      assert.equal(badge.code, "COURSE_ELH_17_COMPLETE");

      // Verify prerequisites (ELH-12 and ELH-16)
      const prereqs = await tx
        .select()
        .from(coursePrerequisitesTable)
        .where(eq(coursePrerequisitesTable.courseId, course.id));
      assert.equal(prereqs.length, 2, "Should have exactly 2 prerequisites");
      const prereqIds = prereqs.map(p => p.prerequisiteCourseId);
      assert.ok(prereqIds.includes(c12.id), "Prerequisite should include Course 12");
      assert.ok(prereqIds.includes(c16.id), "Prerequisite should include Course 16");

      // Verify Course 16 recommendation link points to Course 17
      const [c16Post] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.id, c16.id))
        .limit(1);
      assert.equal(c16Post.recommendedNextCourseId, course.id, "Course 16 should recommend Course 17");

      // 2. Repeated execution does not duplicate course
      await ensureTrackingSustainabilityActionsCourse();
      const coursesPost = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-17"));
      assert.equal(coursesPost.length, 1, "Idempotency: Should not duplicate course record");

      // Trigger rollback to clean up test database changes
      tx.rollback();
    });
  } catch (err: any) {
    if (err && (err.message === "Rollback" || err.name === "TransactionRollbackError")) {
      return;
    }
    throw err;
  }
});

test("Course 17 Learner Data Preservation Unit Tests", async () => {
  await cleanUpCourse17();

  try {
    // 0. Ensure prerequisite courses exist
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
    let c16 = await db.query.coursesTable.findFirst({ where: eq(coursesTable.courseCode, "ELH-16") });
    if (!c16) {
      [c16] = await db.insert(coursesTable).values({
        courseCode: "ELH-16",
        slug: "communicating-sustainability-at-work",
        title: "Communicating Sustainability at Work",
        level: "Applied Workplace Practice",
        passingScore: 80,
        status: "published",
        isPublished: true,
        description: "Prerequisite Course 16",
        categoryId: 1,
      }).returning();
    }

    // 1. Run seeder initially to create Course 17
    await ensureTrackingSustainabilityActionsCourse();

    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-17")).limit(1);
    const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, course.id)).limit(1);
    const [badge] = await db.select().from(badgeDefinitionsTable).where(eq(badgeDefinitionsTable.slug, "sustainability-progress-tracker")).limit(1);

    // 2. Create mock employee, enrollment, progress, attempts, badge
    const [employee] = await db.insert(employeesTable).values({
      name: "Test Preserved User",
      email: "preserve@ecolearn.mu",
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

    // 3. Delete system seeds physically to force execution of seeder checks again
    await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "tracking-sustainability-actions-and-progress-v1"));

    // 4. Run seeder again
    await ensureTrackingSustainabilityActionsCourse();

    // 5. Verify user progress and completions are fully intact
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
    // 6. Clean up database state
    await cleanUpCourse17();
  }
});

test("Course 17 Transactional Rollback Atomicity Unit Tests", async () => {
  await cleanUpCourse17();

  // 2. Ensure prerequisites exist physically
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
  let c16 = await db.query.coursesTable.findFirst({ where: eq(coursesTable.courseCode, "ELH-16") });
  if (!c16) {
    [c16] = await db.insert(coursesTable).values({
      courseCode: "ELH-16",
      slug: "communicating-sustainability-at-work",
      title: "Communicating Sustainability at Work",
      level: "Applied Workplace Practice",
      passingScore: 80,
      status: "published",
      isPublished: true,
      description: "Prerequisite Course 16",
      categoryId: 1,
    }).returning();
  }

  // 3. Intercept and throw inside seeder transaction to trigger rollback
  const originalTransaction = db.transaction;
  const proto = Object.getPrototypeOf(db);
  const originalProtoTransaction = proto?.transaction;
  let didThrow = false;

  try {
    const mockTx = async (callback: any) => {
      return originalTransaction.call(db, async (tx: any) => {
        // Run the seeder's migration callback
        await callback(tx);
        // Force rollback at the end of the transaction
        throw new Error("Forced transaction failure for testing rollback");
      });
    };

    db.transaction = mockTx as any;
    if (proto) {
      proto.transaction = mockTx as any;
    }

    // This should throw because of our intercepted transaction callback
    await ensureTrackingSustainabilityActionsCourse();
  } catch (err: any) {
    assert.equal(err.message, "Forced transaction failure for testing rollback");
    didThrow = true;
  } finally {
    db.transaction = originalTransaction;
    if (proto && originalProtoTransaction) {
      proto.transaction = originalProtoTransaction;
    }
  }

  assert.ok(didThrow, "Seeder must throw when database insert fails");

  // 4. Verify that Course 17 is not left partially seeded in the physical DB
  const course = await db.query.coursesTable.findFirst({
    where: eq(coursesTable.courseCode, "ELH-17")
  });
  assert.ok(!course, "Course 17 record should not exist because the transaction rolled back");
});
