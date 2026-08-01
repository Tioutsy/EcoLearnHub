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

const SEED_NAME_V2 = "sustainability-for-operations-and-frontline-teams-v2";

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
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, SEED_NAME_V2));
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, "sustainability-for-operations-and-frontline-teams-v1"));

  // Reset Course 28 recommendation link unconditionally
  await db.update(coursesTable)
    .set({ recommendedNextCourseId: null })
    .where(eq(coursesTable.courseCode, "ELH-28"));

  const c29s = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-29"));
  const c29Ids = c29s.map(c => c.id);
  if (c29Ids.length > 0) {
    await db.delete(coursePrerequisitesTable).where(inArray(coursePrerequisitesTable.courseId, c29Ids));
    await db.delete(lessonsTable).where(inArray(lessonsTable.courseId, c29Ids));
    await db.delete(quizQuestionsTable).where(inArray(quizQuestionsTable.courseId, c29Ids));
    await db.delete(coursesTable).where(inArray(coursesTable.id, c29Ids));
  }
}

test("Course 29 Seeding & Integrity Unit Tests", async () => {
  await cleanUpCourse29();

  try {
    await db.transaction(async (tx) => {
      // 0. Set up prerequisite course ELH-12 and recommender course ELH-28 if they do not exist
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

      // 1. Run seeder
      await ensureSustainabilityForOperationsAndFrontlineTeamsCourse();

      const course = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-29")
      });

      assert.ok(course, "Course 29 must exist in the database");
      assert.equal(course.slug, "sustainability-for-operations-and-frontline-teams");
      assert.equal(course.title, "Sustainability for Operations and Frontline Teams");
      assert.equal(course.passingScore, 80);
      assert.equal(course.durationMinutes, 20);

      // Verify lessons count and titles (12 lessons for 13-part standard)
      const lessons = await tx.query.lessonsTable.findMany({
        where: eq(lessonsTable.courseId, course.id),
        orderBy: lessonsTable.orderIndex
      });
      assert.equal(lessons.length, 12, "Course 29 must contain exactly 12 lessons");
      assert.equal(lessons[0].title, "Opening Hook: The End-of-Shift Dilemma");
      assert.equal(lessons[1].title, "Why Operational Decisions Matter");
      assert.equal(lessons[2].title, "Key Operational Terms in Plain Language");
      assert.equal(lessons[3].title, "Operational Responsibility & Escalation Matrix");
      assert.equal(lessons[4].title, "Operational Control Cycle: Prepare and Check");
      assert.equal(lessons[5].title, "Sourced Fact: ISO 14001 Operational Controls");
      assert.equal(lessons[6].title, "Operational Control Cycle: Perform and Observe");
      assert.equal(lessons[7].title, "The Operational Control Cycle: Visual Guide");
      assert.equal(lessons[8].title, "Operational Control Cycle: Respond, Record & Hand Over");
      assert.equal(lessons[9].title, "13 Practical Operational Actions for Frontline Teams");
      assert.equal(lessons[10].title, "Scenario Challenge: The Unidentified Chemical Puddle");
      assert.equal(lessons[11].title, "Learner Commitment & Course Completion");

      // Verify memorable_fact block in Lesson 5
      const lesson5Blocks = (lessons[5].contentBlocks as any[]) || [];
      const hasMemorableFact = lesson5Blocks.some((b: any) => b.type === "memorable_fact");
      assert.ok(hasMemorableFact, "Lesson 5 must contain a memorable_fact block");

      // Verify image block in Lesson 7
      const lesson7Blocks = (lessons[7].contentBlocks as any[]) || [];
      const hasImageBlock = lesson7Blocks.some((b: any) => b.type === "image");
      assert.ok(hasImageBlock, "Lesson 7 must contain an image block for the visual flow diagram");

      // Verify commitment block in Lesson 11
      const lesson11Blocks = (lessons[11].contentBlocks as any[]) || [];
      const hasCommitment = lesson11Blocks.some((b: any) => b.type === "commitment");
      assert.ok(hasCommitment, "Lesson 11 must contain a commitment block");

      // Verify role matrix content in Lesson 3
      const lesson3Blocks = (lessons[3].contentBlocks as any[]) || [];
      const roleText = lesson3Blocks.map((b: any) => b.bodyText || "").join(" ");
      assert.ok(roleText.includes("Frontline Employees"), "Lesson 3 must define Frontline Employees role");
      assert.ok(roleText.includes("Escalates"), "Lesson 3 must define escalation rules");

      // Verify 8 quiz questions and full option feedback
      const quizQuestions = await tx.query.quizQuestionsTable.findMany({
        where: eq(quizQuestionsTable.courseId, course.id),
        orderBy: quizQuestionsTable.orderIndex
      });
      assert.equal(quizQuestions.length, 8, "Course 29 must contain exactly 8 quiz questions");
      for (const q of quizQuestions) {
        assert.equal(q.options.length, 4, "Every quiz question must have 4 options");
        assert.equal(q.optionFeedback?.length, 4, "Every option must have feedback");
        assert.ok(q.correctOption !== null && q.correctOption >= 0 && q.correctOption <= 3, "Correct option index must be valid");
        assert.ok(q.correctExplanation && q.correctExplanation.length > 0, "Must have correct explanation");
        assert.ok(q.incorrectExplanation && q.incorrectExplanation.length > 0, "Must have incorrect explanation");
        assert.ok(q.practicalTakeaway && q.practicalTakeaway.length > 0, "Must have practical takeaway");
      }

      // Verify Sprint 9I 2/2/2/2 position balance
      const positions = quizQuestions.map(q => q.correctOption);
      const countByPos = [0, 1, 2, 3].map(p => positions.filter(x => x === p).length);
      assert.equal(countByPos[0], 2, "Exactly 2 questions must have correct answer at position 1 (index 0)");
      assert.equal(countByPos[1], 2, "Exactly 2 questions must have correct answer at position 2 (index 1)");
      assert.equal(countByPos[2], 2, "Exactly 2 questions must have correct answer at position 3 (index 2)");
      assert.equal(countByPos[3], 2, "Exactly 2 questions must have correct answer at position 4 (index 3)");

      let maxStreak = 1;
      let currentStreak = 1;
      for (let i = 1; i < positions.length; i++) {
        if (positions[i] === positions[i - 1]) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
      assert.ok(maxStreak <= 1, `Maximum answer-position streak must be <= 1, got ${maxStreak}`);

      // Verify badge
      const badge = await tx.query.badgeDefinitionsTable.findFirst({
        where: eq(badgeDefinitionsTable.code, "COURSE_ELH_29_COMPLETE")
      });
      assert.ok(badge, "Course 29 completion badge must be created");
      assert.equal(badge.slug, "operational-sustainability-practitioner");

      // Verify prerequisite: ELH-12
      const prereqs = await tx.select({
        prereqId: coursePrerequisitesTable.prerequisiteCourseId
      }).from(coursePrerequisitesTable).where(eq(coursePrerequisitesTable.courseId, course!.id));
      assert.equal(prereqs.length, 1, "ELH-29 must have exactly 1 prerequisite (ELH-12)");
      const [prereqCourse] = await tx.select({ courseCode: coursesTable.courseCode, title: coursesTable.title })
        .from(coursesTable).where(eq(coursesTable.id, prereqs[0].prereqId)).limit(1);
      assert.equal(prereqCourse.courseCode, "ELH-12", "ELH-29 prerequisite course code must be ELH-12");

      // Test Idempotency
      await ensureSustainabilityForOperationsAndFrontlineTeamsCourse();
      
      const duplicateCourses = await tx.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-29"));
      assert.equal(duplicateCourses.length, 1, "Running the seeder again must not duplicate the course record");

      tx.rollback();
    });
  } catch (err: any) {
    if (err && (err.message === "Rollback" || err.name === "TransactionRollbackError")) {
      return;
    }
    throw err;
  }
});

test("Course 29 Learner Data Preservation Unit Tests", async () => {
  await cleanUpCourse29();

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

    await ensureSustainabilityForOperationsAndFrontlineTeamsCourse();

    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-29")).limit(1);
    const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, course.id)).limit(1);
    const [badge] = await db.select().from(badgeDefinitionsTable).where(eq(badgeDefinitionsTable.slug, "operational-sustainability-practitioner")).limit(1);

    const [employee] = await db.insert(employeesTable).values({
      name: "Test Preserved User 29",
      email: "preserve29@ecolearn.mu",
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

    // Delete seed marker to simulate re-running seeder
    await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, SEED_NAME_V2));

    await ensureSustainabilityForOperationsAndFrontlineTeamsCourse();

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
    await cleanUpCourse29();
  }
});

test("Course 29 Transactional Rollback Atomicity Unit Tests", async () => {
  await cleanUpCourse29();

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

  const originalTransaction = db.transaction;
  const proto = Object.getPrototypeOf(db);
  const originalProtoTransaction = proto?.transaction;
  let didThrow = false;

  try {
    const mockTx = async (callback: any) => {
      return originalTransaction.call(db, async (tx: any) => {
        await callback(tx);
        throw new Error("Forced transaction failure for testing Course 29 rollback");
      });
    };

    db.transaction = mockTx as any;
    if (proto) {
      proto.transaction = mockTx as any;
    }

    await ensureSustainabilityForOperationsAndFrontlineTeamsCourse();
  } catch (err: any) {
    assert.equal(err.message, "Forced transaction failure for testing Course 29 rollback");
    didThrow = true;
  } finally {
    db.transaction = originalTransaction;
    if (proto && originalProtoTransaction) {
      proto.transaction = originalProtoTransaction;
    }
  }

  assert.ok(didThrow, "Seeder must throw when database insert fails");

  const course = await db.query.coursesTable.findFirst({
    where: eq(coursesTable.courseCode, "ELH-29")
  });
  assert.ok(!course, "Course 29 record should not exist because the transaction rolled back");
});
