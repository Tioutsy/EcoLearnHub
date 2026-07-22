import assert from "node:assert/strict";
import test from "node:test";
import { spawn, ChildProcess } from "node:child_process";
import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  enrollmentsTable,
  employeesTable,
  lessonProgressTable,
  quizAttemptsTable,
  certificatesTable,
  badgeDefinitionsTable,
  employeeBadgesTable,
  courseCommitmentsTable,
} from "@workspace/db";
import { eq, or, inArray, and } from "drizzle-orm";

const API_BASE = "http://localhost:8086/api";
const TEST_USER_ID = "c14_e2e_user";
const TEST_EMAIL = "c14-e2e@ecolearn.mu";

const HEADERS = {
  "x-test-user-id": TEST_USER_ID,
  "x-test-user-email": TEST_EMAIL,
  "Content-Type": "application/json",
};

async function cleanDb() {
  const [existingEmployee] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.clerkUserId, TEST_USER_ID))
    .limit(1);

  const employeeId = existingEmployee?.id;

  const clauses: any[] = [
    eq(enrollmentsTable.userId, TEST_USER_ID),
    eq(enrollmentsTable.userId, TEST_EMAIL),
  ];
  if (employeeId) {
    clauses.push(eq(enrollmentsTable.employeeId, employeeId));
  }

  const enrollments = await db
    .select({ id: enrollmentsTable.id })
    .from(enrollmentsTable)
    .where(or(...clauses));

  const enrollmentIds = enrollments.map((e) => e.id);

  if (enrollmentIds.length > 0) {
    await db
      .delete(lessonProgressTable)
      .where(inArray(lessonProgressTable.enrollmentId, enrollmentIds));
    await db
      .delete(enrollmentsTable)
      .where(inArray(enrollmentsTable.id, enrollmentIds));
  }

  await db.delete(quizAttemptsTable).where(eq(quizAttemptsTable.userId, TEST_USER_ID));
  await db.delete(certificatesTable).where(eq(certificatesTable.userId, TEST_USER_ID));
  await db.delete(employeeBadgesTable).where(eq(employeeBadgesTable.employeeId, employeeId ?? 0));
  await db.delete(courseCommitmentsTable).where(eq(courseCommitmentsTable.courseId, 14));

  if (employeeId) {
    await db.delete(employeesTable).where(eq(employeesTable.id, employeeId));
  }

  const [employee] = await db
    .insert(employeesTable)
    .values({
      name: "E2E Course 14 Learner",
      email: TEST_EMAIL,
      clerkUserId: TEST_USER_ID,
      companyId: 1, // Tenant 1
      role: "employee",
      enrolledCourses: 0,
      completedCourses: 0,
      certificates: 0,
      learningMinutes: 0,
      avgScore: 0,
    })
    .returning();

  return employee;
}

test("Course 14 Full E2E Integration and Prerequisite Verification", async () => {
  let devServer: ChildProcess | undefined;

  try {
    // Start the API server on port 8086
    devServer = spawn(process.execPath, ["./dist/index.mjs"], {
      env: {
        ...process.env,
        NODE_ENV: "development",
        ENABLE_TEST_AUTH_BYPASS: "true",
        PORT: "8086",
      },
      cwd: process.cwd(),
    });

    devServer.stdout?.on("data", (data) => {
      console.log(`[TEST SERVER STDOUT] ${data.toString().trim()}`);
    });
    devServer.stderr?.on("data", (data) => {
      console.error(`[TEST SERVER STDERR] ${data.toString().trim()}`);
    });

    // Wait for server to be ready
    let ready = false;
    for (let attempt = 1; attempt <= 150; attempt++) {
      try {
        const res = await fetch(`${API_BASE}/courses`, { headers: HEADERS });
        if (res.status === 200) {
          ready = true;
          break;
        }
      } catch {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    if (!ready) {
      throw new Error("Server failed to start on port 8086");
    }

    const employee = await cleanDb();

    // 1. Resolve Course 14 in the DB
    const c14Rows = await db.select().from(coursesTable).where(eq(coursesTable.slug, "setting-departmental-sustainability-goals"));
    assert.equal(c14Rows.length, 1, "Course 14 does not exist in DB");
    const course14 = c14Rows[0];
    const course14Id = course14.id;

    assert.equal(course14.courseCode, "ELH-14", "Course 14 code should be ELH-14");
    assert.equal(course14.level, "Applied Workplace Practice", "Course 14 level should be Applied Workplace Practice");

    // 2. Course 14 contains 6 lessons and 8 questions
    const c14Lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, course14Id));
    assert.equal(c14Lessons.length, 6, "Course 14 should have exactly 6 lessons");

    const c14Questions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, course14Id));
    assert.equal(c14Questions.length, 8, "Course 14 should have exactly 8 quiz questions");

    // 3. Prerequisite: Learner who has NOT completed Course 13 cannot enroll in Course 14
    let enrollRes = await fetch(`${API_BASE}/enrollments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ courseId: course14Id }),
    });
    assert.equal(enrollRes.status, 403, "Expected 403 Forbidden when enrolling in Course 14 without prerequisites");

    // 4. Setup prerequisites directly in DB (Complete Course 1 to 13)
    const course13Rows = await db.select().from(coursesTable).where(eq(coursesTable.slug, "sustainability-action-planning"));
    assert.equal(course13Rows.length, 1, "Course 13 does not exist");
    const course13Id = course13Rows[0].id;

    // Complete Courses 1 to 12
    const course12Rows = await db.select().from(coursesTable).where(eq(coursesTable.slug, "final-sustainability-certification"));
    assert.equal(course12Rows.length, 1, "Course 12 does not exist");
    const course12Id = course12Rows[0].id;

    const coursesToSeedCompletion = [course12Id, course13Id];
    for (let i = 1; i <= 11; i++) {
      coursesToSeedCompletion.push(i);
    }

    for (const cid of coursesToSeedCompletion) {
      await db.insert(enrollmentsTable).values({
        userId: TEST_USER_ID,
        employeeId: employee.id,
        courseId: cid,
        status: "completed",
        completedAt: new Date(),
        progressPct: 100,
      }).onConflictDoNothing();
    }

    // 5. Complete learner can now enroll in Course 14
    enrollRes = await fetch(`${API_BASE}/enrollments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ courseId: course14Id }),
    });
    assert.equal(enrollRes.status, 201, "Expected 201 Created for Course 14 enrollment after meeting prerequisites");
    const enrollData = (await enrollRes.json()) as any;
    const enrollmentId = enrollData.id;

    // 6. Verify lesson progress updating
    for (const lesson of c14Lessons) {
      const progressRes = await fetch(`${API_BASE}/progress/${enrollmentId}`, {
        method: "PATCH",
        headers: HEADERS,
        body: JSON.stringify({
          lessonId: lesson.id,
          completed: true,
        }),
      });
      assert.equal(progressRes.status, 200, `Expected 200 OK updating progress for lesson ${lesson.title}`);
    }

    // 7. Verify quiz submission
    // First fetch quiz questions
    const quizRes = await fetch(`${API_BASE}/courses/${course14Id}/quiz`, { headers: HEADERS });
    assert.equal(quizRes.status, 200, "Expected 200 OK fetching quiz");
    const quizData = (await quizRes.json()) as any;
    assert.equal(quizData.questions.length, 8, "Should return exactly 8 questions");

    // Fetch quiz questions from DB directly to get the correctOptions for the test
    const dbQuestions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, course14Id));
    assert.equal(dbQuestions.length, 8, "Course 14 should have exactly 8 quiz questions in DB");

    // Submit failing quiz score (e.g. 0%)
    const answersFail = dbQuestions.map((q) => ({
      questionId: q.id,
      selectedOption: (q.correctOption + 1) % 4, // incorrect choice
    }));

    let submitRes = await fetch(`${API_BASE}/courses/${course14Id}/quiz/submit`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ answers: answersFail }),
    });
    assert.equal(submitRes.status, 200, "Expected 200 OK submitting quiz");
    const submitDataFail = (await submitRes.json()) as any;
    assert.equal(submitDataFail.passed, false, "Quiz should fail with incorrect answers");

    // Submit passing quiz score (e.g. 100%)
    const answersPass = dbQuestions.map((q) => ({
      questionId: q.id,
      selectedOption: q.correctOption,
    }));

    submitRes = await fetch(`${API_BASE}/courses/${course14Id}/quiz/submit`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ answers: answersPass }),
    });
    assert.equal(submitRes.status, 200, "Expected 200 OK submitting quiz");
    const submitDataPass = (await submitRes.json()) as any;
    assert.equal(submitDataPass.passed, true, "Quiz should pass with correct answers");

    // 8. Verify badge award exists
    const [badge] = await db
      .select()
      .from(badgeDefinitionsTable)
      .where(eq(badgeDefinitionsTable.slug, "departmental-sustainability-goal-setter"))
      .limit(1);

    const awards = await db
      .select()
      .from(employeeBadgesTable)
      .where(
        and(
          eq(employeeBadgesTable.employeeId, employee.id),
          eq(employeeBadgesTable.badgeId, badge.id)
        )
      );
    assert.equal(awards.length, 1, "Should have awarded exactly 1 badge for Course 14 completion");

  } finally {
    if (devServer) {
      devServer.kill("SIGTERM");
    }
  }
});
