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

    let ready = false;
    for (let attempt = 1; attempt <= 240; attempt++) {
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

    // 1. Resolve Course 29 in the DB
    const c29Rows = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-29"));
    assert.equal(c29Rows.length, 1, "Course 29 does not exist in DB");
    const course29 = c29Rows[0];
    const course29Id = course29.id;

    assert.equal(course29.courseCode, "ELH-29", "Course 29 code should be ELH-29");
    assert.equal(course29.level, "Applied Workplace Practice", "Course 29 level should be Applied Workplace Practice");

    const c29Lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, course29Id));
    assert.equal(c29Lessons.length, 6, "Course 29 should have exactly 6 lessons");

    const c29Questions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, course29Id));
    assert.equal(c29Questions.length, 8, "Course 29 should have exactly 8 quiz questions");

    // 2. Ineligible Learner Access Control Verification
    let enrollRes = await fetch(`${API_BASE}/enrollments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ courseId: course29Id }),
    });
    assert.equal(enrollRes.status, 403, "Expected 403 Forbidden when enrolling without prerequisites");

    const courseDetailRes = await fetch(`${API_BASE}/courses/${course29Id}`, { headers: HEADERS });
    assert.equal(courseDetailRes.status, 200, "Should return 200 for course lookup even if locked");
    const courseDetail = await courseDetailRes.json() as any;
    assert.ok(courseDetail.lessons.length > 0, "Should list lessons");
    for (const l of courseDetail.lessons) {
      assert.equal(l.content, null, "Locked lesson content must be null");
      assert.equal(l.contentBlocks.length, 0, "Locked lesson contentBlocks must be empty array");
    }

    // Attempt to update lesson progress using a mock enrollment ID -> expect 403 Forbidden
    const [mockEnrollment] = await db.insert(enrollmentsTable).values({
      userId: TEST_USER_ID,
      employeeId: employee.id,
      courseId: course29Id,
      status: "in_progress",
    }).returning();

    const progressRes = await fetch(`${API_BASE}/progress/${mockEnrollment.id}`, {
      method: "PATCH",
      headers: HEADERS,
      body: JSON.stringify({
        lessonId: c29Lessons[0].id,
        completed: true,
      }),
    });
    assert.equal(progressRes.status, 403, "Expected 403 PREREQUISITES_INCOMPLETE on progress update");
    const progressData = await progressRes.json() as any;
    assert.equal(progressData.error, "PREREQUISITES_INCOMPLETE", "Error must be PREREQUISITES_INCOMPLETE");

    await db.delete(enrollmentsTable).where(eq(enrollmentsTable.id, mockEnrollment.id));

    const quizRes = await fetch(`${API_BASE}/courses/${course29Id}/quiz`, { headers: HEADERS });
    assert.equal(quizRes.status, 403, "Expected 403 when fetching quiz without prerequisites");
    const quizData = await quizRes.json() as any;
    assert.equal(quizData.error, "PREREQUISITES_INCOMPLETE", "Quiz fetch error must be PREREQUISITES_INCOMPLETE");

    const answersDummy = c29Questions.map((q) => ({
      questionId: q.id,
      selectedOption: 0,
    }));

    const submitResDummy = await fetch(`${API_BASE}/courses/${course29Id}/quiz/submit`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ answers: answersDummy }),
    });
    assert.equal(submitResDummy.status, 403, "Expected 403 when submitting quiz without prerequisites");

    // 3. Partially Eligible Learner (Complete ELH-12 but NOT ELH-17)
    const c12Rows = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-12"));
    assert.equal(c12Rows.length, 1, "Course 12 does not exist");
    const course12Id = c12Rows[0].id;

    const c17Rows = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-17"));
    assert.equal(c17Rows.length, 1, "Course 17 does not exist");
    const course17Id = c17Rows[0].id;

    // Seed ONLY Course 12 completion
    await db.insert(enrollmentsTable).values({
      userId: TEST_USER_ID,
      employeeId: employee.id,
      courseId: course12Id,
      status: "completed",
      completedAt: new Date(),
      progressPct: 100,
    }).onConflictDoNothing();

    // Verify Course 29 is STILL blocked
    const partialEnrollRes = await fetch(`${API_BASE}/enrollments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ courseId: course29Id }),
    });
    assert.equal(partialEnrollRes.status, 403, "Expected 403 when enrolling with only Course 12 completed");

    // 4. Meet Remaining Prerequisites (Complete Course 17)
    await db.insert(enrollmentsTable).values({
      userId: TEST_USER_ID,
      employeeId: employee.id,
      courseId: course17Id,
      status: "completed",
      completedAt: new Date(),
      progressPct: 100,
    }).onConflictDoNothing();

    // 5. Eligible Learner Access
    // Step 5a. Enrolling in Course 29 -> expect 201 Created
    enrollRes = await fetch(`${API_BASE}/enrollments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ courseId: course29Id }),
    });
    assert.equal(enrollRes.status, 201, "Expected 201 Created for Course 29 enrollment");
    const enrollData = (await enrollRes.json()) as any;
    const enrollmentId = enrollData.id;

    // Step 5b. Fetch course detail as eligible -> verify lessons content is populated
    const eligibleCourseDetailRes = await fetch(`${API_BASE}/courses/${course29Id}`, { headers: HEADERS });
    const eligibleCourseDetail = await eligibleCourseDetailRes.json() as any;
    for (const l of eligibleCourseDetail.lessons) {
      assert.ok(l.content !== null && l.content.length > 0, "Lesson content must be visible");
      assert.ok(l.contentBlocks.length > 0, "Lesson contentBlocks must be visible");
    }

    // Step 5c. Update lesson progress for all 6 lessons -> expect 200 OK
    for (const lesson of c29Lessons) {
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

    // 6. Quiz Submission & Badge Verification
    // Step 6a. Submit failing quiz attempt (0%) -> expect passed: false, and no badge award
    const dbQuestions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, course29Id));
    const answersFail = dbQuestions.map((q) => ({
      questionId: q.id,
      selectedOption: (q.correctOption + 1) % 4,
    }));

    let submitRes = await fetch(`${API_BASE}/courses/${course29Id}/quiz/submit`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ answers: answersFail }),
    });
    assert.equal(submitRes.status, 200, "Expected 200 OK submitting quiz");
    const submitDataFail = (await submitRes.json()) as any;
    assert.equal(submitDataFail.passed, false, "Quiz should fail with incorrect answers");

    const [badge] = await db
      .select()
      .from(badgeDefinitionsTable)
      .where(eq(badgeDefinitionsTable.slug, "sustainable-operations-practitioner"))
      .limit(1);
    assert.ok(badge, "Badge Sustainable Operations Practitioner must exist in DB");

    let badgeAwards = await db
      .select()
      .from(employeeBadgesTable)
      .where(
        and(
          eq(employeeBadgesTable.employeeId, employee.id),
          eq(employeeBadgesTable.badgeId, badge.id)
        )
      );
    assert.equal(badgeAwards.length, 0, "Should not award badge for failing quiz attempt");

    // Step 6b. Submit passing quiz attempt (100%) -> expect passed: true, and badge awarded exactly once
    const answersPass = dbQuestions.map((q) => ({
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
    console.log("=== E2E DEBUG ===");
    console.log("employee.id:", employee.id);
    console.log("badge.id:", badge.id);
    console.log("badgeAwards:", badgeAwards);
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
    assert.equal(badgeAwards.length, 1, "Idempotency: Repeating a successful submission must not duplicate employee badges");

  } finally {
    if (devServer) {
      devServer.kill("SIGTERM");
    }
  }
});
