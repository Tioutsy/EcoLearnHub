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

const API_BASE = "http://localhost:8085/api";
const TEST_USER_ID = "c13_e2e_user";
const TEST_EMAIL = "c13-e2e@ecolearn.mu";

const HEADERS = {
  "x-test-user-id": TEST_USER_ID,
  "x-test-user-email": TEST_EMAIL,
  "Content-Type": "application/json",
};

// Admin headers to bypass prerequisites or manage reporting
const ADMIN_HEADERS = {
  "x-test-user-id": "admin_user",
  "x-test-user-email": "admin@ecolearn.mu",
  "x-test-user-role": "company_admin",
  "x-test-company-id": "1",
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
  await db.delete(courseCommitmentsTable).where(eq(courseCommitmentsTable.courseId, 13));

  if (employeeId) {
    await db.delete(employeesTable).where(eq(employeesTable.id, employeeId));
  }

  const [employee] = await db
    .insert(employeesTable)
    .values({
      name: "E2E Course 13 Learner",
      email: TEST_EMAIL,
      clerkUserId: TEST_USER_ID,
      companyId: 1, // Assume Tenant 1
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

test("Course 13 Full E2E Integration and Prerequisite Verification", async () => {
  let devServer: ChildProcess | undefined;

  try {
    // Start the API server on port 8085
    devServer = spawn(process.execPath, ["./dist/index.mjs"], {
      env: {
        ...process.env,
        NODE_ENV: "development",
        ENABLE_TEST_AUTH_BYPASS: "true",
        PORT: "8085",
      },
      cwd: process.cwd(),
    });

    devServer.stdout?.on("data", (data) => {
      console.log(`[SERVER STDOUT] ${data.toString().trim()}`);
    });
    devServer.stderr?.on("data", (data) => {
      console.error(`[SERVER STDERR] ${data.toString().trim()}`);
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
      throw new Error("Server failed to start");
    }

    const employee = await cleanDb();

    // 1. Resolve Course 13 in the DB
    const c13Rows = await db.select().from(coursesTable).where(eq(coursesTable.slug, "sustainability-action-planning"));
    assert.equal(c13Rows.length, 1, "Course 13 does not exist in DB");
    const course13 = c13Rows[0];
    const course13Id = course13.id;

    assert.equal(course13.courseCode, "ELH-13", "Course 13 code should be ELH-13");
    assert.equal(course13.level, "Applied Workplace Practice", "Course 13 level should be Applied Workplace Practice");

    // 2. Course 13 contains 6 lessons and 6 questions
    const c13Lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, course13Id));
    assert.equal(c13Lessons.length, 6, "Course 13 should have exactly 6 lessons");

    const c13Questions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, course13Id));
    assert.equal(c13Questions.length, 6, "Course 13 should have exactly 6 quiz questions");

    // 3. Prerequisite: Learner who has NOT completed Course 12 cannot enrol in Course 13
    let enrollRes = await fetch(`${API_BASE}/enrollments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ courseId: course13Id }),
    });
    assert.equal(enrollRes.status, 403, "Expected 403 Forbidden when enrolling in Course 13 without prerequisites");

    // 4. Incomplete learner cannot fetch Course 13 quiz
    let quizFetchRes = await fetch(`${API_BASE}/courses/${course13Id}/quiz`, { headers: HEADERS });
    assert.equal(quizFetchRes.status, 403, "Expected 403 Forbidden when fetching quiz without prerequisites");

    // 5. Setup Course 12 and prerequisites completion directly in DB
    const course12Rows = await db.select().from(coursesTable).where(eq(coursesTable.slug, "final-sustainability-certification"));
    assert.equal(course12Rows.length, 1, "Course 12 does not exist");
    const course12Id = course12Rows[0].id;

    // Complete Courses 1-11
    for (let i = 1; i <= 11; i++) {
      const [existingCourse] = await db.select().from(coursesTable).where(eq(coursesTable.id, i));
      if (existingCourse) {
        await db.insert(enrollmentsTable).values({
          userId: TEST_USER_ID,
          employeeId: employee.id,
          courseId: i,
          status: "completed",
          completedAt: new Date(),
          progressPct: 100,
        });
      }
    }

    // Complete Course 12
    await db.insert(enrollmentsTable).values({
      userId: TEST_USER_ID,
      employeeId: employee.id,
      courseId: course12Id,
      status: "completed",
      completedAt: new Date(),
      progressPct: 100,
    });

    // 6. Complete learner can now enrol in Course 13
    enrollRes = await fetch(`${API_BASE}/enrollments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ courseId: course13Id }),
    });
    assert.equal(enrollRes.status, 201, "Expected 201 Created for Course 13 enrollment after meeting prerequisites");
    const enrollData = (await enrollRes.json()) as any;
    const enrollmentId = enrollData.id;

    // 7. Verify lesson progress updating
    for (const lesson of c13Lessons) {
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

    // 8. Fetch quiz successfully and verify feedback structures
    quizFetchRes = await fetch(`${API_BASE}/courses/${course13Id}/quiz`, { headers: HEADERS });
    assert.equal(quizFetchRes.status, 200, "Expected 200 OK fetching quiz after meeting prerequisites");
    const quizData = (await quizFetchRes.json()) as any;
    assert.equal(quizData.questions.length, 6, "Expected 6 quiz questions returned");

    // 9. Fail the quiz (< 80% passing, i.e., 2 out of 6 correct)
    let answers = c13Questions.map((q, idx) => ({
      questionId: q.id,
      selectedOption: idx < 2 ? q.correctOption : (q.correctOption === 0 ? 1 : 0), // 2 correct, 4 incorrect
    }));

    let submitRes = await fetch(`${API_BASE}/courses/${course13Id}/quiz/submit`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ answers }),
    });
    assert.equal(submitRes.status, 200, "Expected 200 OK submitting quiz");
    let submitData = (await submitRes.json()) as any;
    assert.equal(submitData.passed, false, "Expected passed to be false for < 80% score");
    assert.equal(submitData.score, Math.round((2 / 6) * 100), "Expected score to be 33%");

    // Verify option feedbacks and explanations are returned
    assert.ok(submitData.feedback && submitData.feedback.length === 6, "Feedback array should contain results for 6 questions");
    submitData.feedback.forEach((det: any, idx: number) => {
      assert.ok(det.optionFeedback && det.optionFeedback.length > 0, `Expected optionFeedback to exist for question index ${idx}`);
      assert.ok(det.correctExplanation, `Expected correctExplanation to exist for question index ${idx}`);
      assert.ok(det.incorrectExplanation, `Expected incorrectExplanation to exist for question index ${idx}`);
      assert.ok(det.practicalTakeaway, `Expected practicalTakeaway to exist for question index ${idx}`);
    });

    // 10. Pass the quiz (>= 80%, i.e., 6 out of 6 correct)
    answers = c13Questions.map((q) => ({
      questionId: q.id,
      selectedOption: q.correctOption,
    }));

    submitRes = await fetch(`${API_BASE}/courses/${course13Id}/quiz/submit`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ answers }),
    });
    assert.equal(submitRes.status, 200, "Expected 200 OK submitting quiz");
    submitData = (await submitRes.json()) as any;
    assert.equal(submitData.passed, true, "Expected passed to be true for 100% score");

    // 11. Verify badge is awarded automatically
    const badgeDef = await db.query.badgeDefinitionsTable.findFirst({
      where: eq(badgeDefinitionsTable.slug, "sustainability-action-planner")
    });
    assert.ok(badgeDef, "Badge definition not found");

    const employeeBadge = await db.query.employeeBadgesTable.findFirst({
      where: and(
        eq(employeeBadgesTable.employeeId, employee.id),
        eq(employeeBadgesTable.badgeId, badgeDef.id)
      ),
    });
    assert.ok(employeeBadge, "Expected Sustainability Action Planner badge to be awarded to employee");

    // 12. Verify repeated attempts do not duplicate badge
    submitRes = await fetch(`${API_BASE}/courses/${course13Id}/quiz/submit`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ answers }),
    });
    assert.equal(submitRes.status, 200);
    const badgesCount = await db.query.employeeBadgesTable.findMany({
      where: and(
        eq(employeeBadgesTable.employeeId, employee.id),
        eq(employeeBadgesTable.badgeId, badgeDef.id)
      ),
    });
    assert.equal(badgesCount.length, 1, "Expected only 1 badge record to exist (no duplicates on retries)");

    // 13. Verify commitment persistence via existing commitments API
    // GET /api/courses/:courseId/commitments
    let commitmentsRes = await fetch(`${API_BASE}/courses/${course13Id}/commitments`, { headers: HEADERS });
    assert.equal(commitmentsRes.status, 200);
    let commitmentsData = (await commitmentsRes.json()) as any;
    assert.equal(commitmentsData.commitments.length, 0, "Initially commitments should be empty");

    // POST /api/courses/:courseId/commitments
    const testCommitments = ["identify-specific-issue", "check-evidence"];
    let saveCommitmentsRes = await fetch(`${API_BASE}/courses/${course13Id}/commitments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ commitments: testCommitments }),
    });
    assert.equal(saveCommitmentsRes.status, 200, "Expected 200 OK saving commitments");

    commitmentsRes = await fetch(`${API_BASE}/courses/${course13Id}/commitments`, { headers: HEADERS });
    commitmentsData = (await commitmentsRes.json()) as any;
    assert.deepEqual(commitmentsData.commitments, testCommitments, "Expected saved commitments to match");

    // 14. Verify Manager training reports
    // GET /api/manager/training/overview
    const overviewRes = await fetch(`${API_BASE}/manager/training/overview`, { headers: ADMIN_HEADERS });
    assert.equal(overviewRes.status, 200, "Expected 200 OK loading manager training overview");
    const overviewData = (await overviewRes.json()) as any;
    assert.ok(overviewData.courseBreakdown, "Expected courseBreakdown to exist in overview");
    const c13Report = overviewData.courseBreakdown.find((c: any) => c.slug === "sustainability-action-planning");
    assert.ok(c13Report, "Course 13 should appear in manager overview course breakdown");

    // GET /api/manager/training/employees
    const employeesReportRes = await fetch(`${API_BASE}/manager/training/employees?courseId=${course13Id}`, { headers: ADMIN_HEADERS });
    assert.equal(employeesReportRes.status, 200, "Expected 200 OK loading manager training employees list");
    const employeesReportData = (await employeesReportRes.json()) as any;
    assert.ok(employeesReportData.records, "Expected records array to exist");
    const learnerRecord = employeesReportData.records.find((r: any) => r.email === TEST_EMAIL);
    assert.ok(learnerRecord, "Learner should appear in manager training employee records");

    // GET /api/manager/training/export.csv
    const csvRes = await fetch(`${API_BASE}/manager/training/export.csv`, { headers: ADMIN_HEADERS });
    assert.equal(csvRes.status, 200, "Expected 200 OK exporting manager audit CSV");
    const csvText = await csvRes.text();
    assert.ok(csvText.includes("Sustainability Action Planning"), "CSV should contain Course 13 completion reference");
    assert.ok(csvText.includes(TEST_EMAIL), "CSV should contain test employee email");

  } finally {
    if (devServer) {
      devServer.kill("SIGTERM");
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
});
