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
} from "@workspace/db";
import { eq, or, inArray, and } from "drizzle-orm";

const API_BASE = "http://localhost:8086/api";
const TEST_USER_ID = "c29_e2e_user";
const TEST_EMAIL = "c29-e2e@ecolearn.mu";

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
  
  if (employeeId) {
    await db.delete(employeeBadgesTable).where(eq(employeeBadgesTable.employeeId, employeeId));
  }

  if (employeeId) {
    await db.delete(employeesTable).where(eq(employeesTable.id, employeeId));
  }

  const [employee] = await db
    .insert(employeesTable)
    .values({
      name: "E2E Course 29 Learner",
      email: TEST_EMAIL,
      clerkUserId: TEST_USER_ID,
      companyId: 1,
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

test("Course 29 Full E2E Integration, Access Control, and Prerequisites Verification", async () => {
  let devServer: ChildProcess | undefined;

  try {
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

    // Wait for the backend server to launch and complete seed check
    let healthy = false;
    for (let i = 0; i < 300; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        const res = await fetch("http://localhost:8086/api/healthz");
        if (res.status === 200) {
          healthy = true;
          break;
        }
      } catch {}
    }

    assert.ok(healthy, "Expected test API server to start and pass health check on port 8086");

    const employee = await cleanDb();

    // Retrieve dynamically created course and prerequisites IDs
    const [course29] = await db
      .select({ id: coursesTable.id })
      .from(coursesTable)
      .where(eq(coursesTable.slug, "sustainability-for-operations-and-frontline-teams"))
      .limit(1);
    assert.ok(course29, "Course 29 must exist in DB");
    const course29Id = course29.id;

    const [course12] = await db
      .select({ id: coursesTable.id })
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-12"))
      .limit(1);
    assert.ok(course12, "Course 12 must exist in DB");
    const course12Id = course12.id;

    const [course17] = await db
      .select({ id: coursesTable.id })
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-17"))
      .limit(1);
    assert.ok(course17, "Course 17 must exist in DB");
    const course17Id = course17.id;

    const [badge] = await db
      .select()
      .from(badgeDefinitionsTable)
      .where(eq(badgeDefinitionsTable.slug, "operational-sustainability-practitioner"))
      .limit(1);
    assert.ok(badge, "Badge Operational Sustainability Practitioner must exist in DB");

    // Ensure clean state: delete any existing enrollments for the test user to start from fresh
    const clauses: any[] = [
      eq(enrollmentsTable.userId, TEST_USER_ID),
      eq(enrollmentsTable.userId, TEST_EMAIL),
    ];
    const enrollments = await db
      .select({ id: enrollmentsTable.id })
      .from(enrollmentsTable)
      .where(or(...clauses));
    const enrollmentIds = enrollments.map((e) => e.id);
    if (enrollmentIds.length > 0) {
      await db.delete(lessonProgressTable).where(inArray(lessonProgressTable.enrollmentId, enrollmentIds));
      await db.delete(enrollmentsTable).where(inArray(enrollmentsTable.id, enrollmentIds));
    }

    // Step 1. Ineligible Learner (No prerequisites completed) -> Expect 403 when enrolling
    let enrollRes = await fetch(`${API_BASE}/enrollments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ courseId: course29Id }),
    });
    assert.equal(enrollRes.status, 403, "Expected 403 Forbidden enrolling without prerequisites");
    let errBody = (await enrollRes.json()) as any;
    assert.equal(errBody.error, "PREREQUISITES_INCOMPLETE", "Expected prerequisites incomplete error code");

    // Expect course detail lesson content to be locked/null
    const detailsRes = await fetch(`${API_BASE}/courses/${course29Id}`, {
      headers: HEADERS,
    });
    assert.equal(detailsRes.status, 200, "Expected 200 OK retrieving course metadata (public metadata is open)");
    const detailsData = (await detailsRes.json()) as any;
    for (const l of detailsData.lessons) {
      assert.equal(l.content, null, "Locked lesson content must be null");
      assert.equal(l.contentBlocks.length, 0, "Locked lesson contentBlocks must be empty array");
    }

    // Attempt to update lesson progress using a mock enrollment ID -> expect 403 Forbidden
    const [mockEnrollment] = await db.insert(enrollmentsTable).values({
      userId: TEST_USER_ID,
      employeeId: employee.id,
      courseId: course29Id,
      status: "in_progress",
      progressPct: 0
    }).returning();

    const progressRes = await fetch(`${API_BASE}/progress/${mockEnrollment.id}`, {
      method: "PATCH",
      headers: HEADERS,
      body: JSON.stringify({ lessonIndex: 0, progressPct: 100 }),
    });
    assert.equal(progressRes.status, 403, "Expected 403 Forbidden updating progress when prerequisites are incomplete");
    const progressErrBody = (await progressRes.json()) as any;
    assert.equal(progressErrBody.error, "PREREQUISITES_INCOMPLETE", "Expected prerequisites incomplete error code");

    await db.delete(enrollmentsTable).where(eq(enrollmentsTable.id, mockEnrollment.id));

    const quizGetRes = await fetch(`${API_BASE}/courses/${course29Id}/quiz`, {
      headers: HEADERS,
    });
    assert.equal(quizGetRes.status, 403, "Expected 403 Forbidden retrieving quiz without enrollment");

    const quizSubmitRes = await fetch(`${API_BASE}/courses/${course29Id}/quiz/submit`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ answers: [] }),
    });
    assert.equal(quizSubmitRes.status, 403, "Expected 403 Forbidden submitting quiz without enrollment");

    // Step 2. Partially Eligible Learner (Complete ELH-12 but NOT ELH-17) -> Expect 403 when enrolling
    await db.insert(enrollmentsTable).values({
      userId: TEST_USER_ID,
      employeeId: employee.id,
      courseId: course12Id,
      status: "completed",
      completedAt: new Date(),
      progressPct: 100,
    }).onConflictDoNothing();

    enrollRes = await fetch(`${API_BASE}/enrollments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ courseId: course29Id }),
    });
    assert.equal(enrollRes.status, 403, "Expected 403 Forbidden enrolling with only one prerequisite completed");
    errBody = (await enrollRes.json()) as any;
    assert.equal(errBody.error, "PREREQUISITES_INCOMPLETE", "Expected prerequisites incomplete error code");

    // Step 3. Eligible Learner (Complete ELH-12 AND ELH-17) -> Expect 201 Created when enrolling
    await db.insert(enrollmentsTable).values({
      userId: TEST_USER_ID,
      employeeId: employee.id,
      courseId: course17Id,
      status: "completed",
      completedAt: new Date(),
      progressPct: 100,
    }).onConflictDoNothing();

    // Retry enrolling
    enrollRes = await fetch(`${API_BASE}/enrollments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ courseId: course29Id }),
    });
    assert.equal(enrollRes.status, 201, "Expected 201 Created enrolling with all prerequisites completed");
    const enrollData = (await enrollRes.json()) as any;
    assert.ok(enrollData.id, "Expected enrollment ID to be returned");
    const activeEnrollmentId = enrollData.id;

    // Step 4. Retrieve course metadata -> Verify lessons content is populated/unlocked
    const detailsRes2 = await fetch(`${API_BASE}/courses/${course29Id}`, {
      headers: HEADERS,
    });
    assert.equal(detailsRes2.status, 200, "Expected 200 OK retrieving course details");
    const detailsData2 = (await detailsRes2.json()) as any;
    for (const l of detailsData2.lessons) {
      assert.ok(l.content !== null && l.content.length > 0, "Lesson content must be visible");
      assert.ok(l.contentBlocks.length > 0, "Lesson contentBlocks must be visible");
    }

    // Step 5. Progress through lessons sequentially
    const lessons = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, course29Id))
      .orderBy(lessonsTable.orderIndex);

    for (const lesson of lessons) {
      const progRes = await fetch(`${API_BASE}/progress/${activeEnrollmentId}`, {
        method: "PATCH",
        headers: HEADERS,
        body: JSON.stringify({
          lessonId: lesson.id,
          completed: true,
        }),
      });
      assert.equal(progRes.status, 200, `Expected 200 OK updating progress for lesson ${lesson.title}`);
    }

    // Step 6. Complete quiz and earn certificate & badge
    // First, verify we can retrieve quiz questions without answers
    const quizGetRes2 = await fetch(`${API_BASE}/courses/${course29Id}/quiz`, {
      headers: HEADERS,
    });
    assert.equal(quizGetRes2.status, 200, "Expected 200 OK retrieving quiz");
    const quizPayload = (await quizGetRes2.json()) as any;
    const quizQuestions = quizPayload.questions;
    assert.equal(quizQuestions.length, 8, "Expected 8 questions");
    for (const q of quizQuestions) {
      assert.ok(!("correctOption" in q), "Quiz questions payload must not leak correct answers");
    }

    // Step 6a. Submit failing quiz attempt -> expect passed: false
    const questionsDb = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, course29Id))
      .orderBy(quizQuestionsTable.orderIndex);

    const answersFail = questionsDb.map((q) => ({
      questionId: q.id,
      selectedOption: (q.correctOption + 1) % 4, // Intentionally incorrect
    }));

    let submitRes = await fetch(`${API_BASE}/courses/${course29Id}/quiz/submit`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ answers: answersFail }),
    });
    assert.equal(submitRes.status, 200, "Expected 200 OK submitting failing quiz");
    const submitDataFail = (await submitRes.json()) as any;
    assert.equal(submitDataFail.passed, false, "Quiz should fail with incorrect answers");

    let badgeAwards = await db
      .select()
      .from(employeeBadgesTable)
      .where(
        and(
          eq(employeeBadgesTable.employeeId, employee.id),
          eq(employeeBadgesTable.badgeId, badge.id)
        )
      );
    assert.equal(badgeAwards.length, 0, "No badge should be awarded for a failing quiz attempt");

    // Step 6b. Submit passing quiz attempt -> expect passed: true, and badge is awarded
    const answersPass = questionsDb.map((q) => ({
      questionId: q.id,
      selectedOption: q.correctOption,
    }));

    submitRes = await fetch(`${API_BASE}/courses/${course29Id}/quiz/submit`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ answers: answersPass }),
    });
    assert.equal(submitRes.status, 200, "Expected 200 OK submitting quiz");
    const submitDataPass = (await submitRes.json()) as any;
    assert.equal(submitDataPass.passed, true, "Quiz should pass with correct answers");

    badgeAwards = await db
      .select()
      .from(employeeBadgesTable)
      .where(
        and(
          eq(employeeBadgesTable.employeeId, employee.id),
          eq(employeeBadgesTable.badgeId, badge.id)
        )
      );
    assert.equal(badgeAwards.length, 1, "Should have awarded exactly 1 badge for Course 29 completion");
    assert.equal(badgeAwards[0].employeeId, employee.id, "Badge award must belong to the correct employee");

    // Step 6c. Submit passing quiz attempt a second time -> expect passed: true, and badge is not duplicated
    submitRes = await fetch(`${API_BASE}/courses/${course29Id}/quiz/submit`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ answers: answersPass }),
    });
    assert.equal(submitRes.status, 200, "Expected 200 OK submitting quiz a second time");

    badgeAwards = await db
      .select()
      .from(employeeBadgesTable)
      .where(
        and(
          eq(employeeBadgesTable.employeeId, employee.id),
          eq(employeeBadgesTable.badgeId, badge.id)
        )
      );
    assert.equal(badgeAwards.length, 1, "Re-submitting a passing quiz should not award duplicate badges");

  } finally {
    // Shutdown server
    if (devServer) {
      devServer.kill("SIGTERM");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    await cleanDb();
  }
});
