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

const SEED_NAME_V2 = "sustainability-for-procurement-and-purchasing-teams-v2";

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
  await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, SEED_NAME_V2));
  // Also clean up v1 seed record in case it exists from previous sprints
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
      assert.equal(course.durationMinutes, 20);
      assert.equal(course.passingScore, 80);
      assert.equal(course.courseCode, "ELH-26");

      // Verify lessons count and order (12 lessons for 13-part standard)
      const lessons = await tx
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, course.id))
        .orderBy(lessonsTable.orderIndex);
      assert.equal(lessons.length, 12, "Should seed exactly 12 lessons");
      for (let i = 0; i < 12; i++) {
        assert.equal(lessons[i].orderIndex, i, `Lesson ${i} order index must be ${i}`);
      }

      // Verify key lesson titles covering the 13-part quality standard
      assert.equal(lessons[0].title, "Opening Hook: The Urgent Request", "Lesson 0 must be the opening hook");
      assert.equal(lessons[1].title, "Why Procurement Decisions Matter", "Lesson 1 must be Why It Matters");
      assert.equal(lessons[2].title, "Key Terms in Procurement and Purchasing", "Lesson 2 must be vocabulary");
      assert.equal(lessons[3].title, "Procurement Role and Responsibility Boundaries", "Lesson 3 must be role boundaries");
      assert.equal(lessons[4].title, "Start With the Need, Not the Product");
      assert.equal(lessons[5].title, "Write Clear Requirements and Evaluate Evidence");
      assert.equal(lessons[6].title, "Compare Whole-Life Value, Not Price Alone");
      assert.equal(lessons[7].title, "The Procurement Cycle: A Visual Guide", "Lesson 7 must be the visual element");
      assert.equal(lessons[8].title, "Test Supplier Claims and Evidence");
      assert.equal(lessons[9].title, "Scenario Challenge: The Cleaning Contract Renewal", "Lesson 9 must be the applied scenario");
      assert.equal(lessons[10].title, "Make and Record a Defensible Decision");
      assert.equal(lessons[11].title, "Manage the Supplier After Award", "Lesson 11 must include commitment and completion");

      // Verify memorable_fact block exists in lesson 5
      const lesson5Blocks = (lessons[5].contentBlocks as any[]) || [];
      const hasMemorableFact = lesson5Blocks.some((b: any) => b.type === "memorable_fact");
      assert.ok(hasMemorableFact, "Lesson 5 must contain a memorable_fact block");

      // Verify image block exists in lesson 7 (visual element)
      const lesson7Blocks = (lessons[7].contentBlocks as any[]) || [];
      const hasImageBlock = lesson7Blocks.some((b: any) => b.type === "image");
      assert.ok(hasImageBlock, "Lesson 7 must contain an image block for the visual element");

      // Verify commitment block exists in lesson 11
      const lesson11Blocks = (lessons[11].contentBlocks as any[]) || [];
      const hasCommitment = lesson11Blocks.some((b: any) => b.type === "commitment");
      assert.ok(hasCommitment, "Lesson 11 must contain a commitment block");

      // Verify role boundary content in lesson 3
      const lesson3Blocks = (lessons[3].contentBlocks as any[]) || [];
      const boundaryText = lesson3Blocks.map((b: any) => b.bodyText || "").join(" ");
      assert.ok(boundaryText.includes("Procurement owns"), "Lesson 3 must define what procurement owns");
      assert.ok(boundaryText.includes("escalates"), "Lesson 3 must define escalation responsibilities");

      // Verify quiz questions count and structural feedback
      const quizQuestions = await tx
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, course.id))
        .orderBy(quizQuestionsTable.orderIndex);
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

      // Verify Sprint 9I answer-position safeguards (2/2/2/2, max streak 1)
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
      assert.ok(maxStreak <= 1, `Maximum answer-position streak must be 1, got ${maxStreak}`);

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
    await db.delete(systemSeedsTable).where(eq(systemSeedsTable.name, SEED_NAME_V2));

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
