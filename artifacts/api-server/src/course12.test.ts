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
} from "@workspace/db";
import { eq, or, inArray } from "drizzle-orm";

const API_BASE = "http://localhost:8081/api";
const TEST_USER_ID = "c12_e2e_user";
const TEST_EMAIL = "c12-e2e@ecolearn.mu";

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
    await db.delete(employeesTable).where(eq(employeesTable.id, employeeId));
  }

  const [employee] = await db
    .insert(employeesTable)
    .values({
      name: "E2E Course 12 Learner",
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

test("Course 12 Full E2E Integration and Prerequisite Verification", async () => {
  let devServer: ChildProcess | undefined;

  try {
    // Start the API server
    devServer = spawn(process.execPath, ["./dist/index.mjs"], {
      env: {
        ...process.env,
        NODE_ENV: "development",
        ENABLE_TEST_AUTH_BYPASS: "true",
        PORT: "8081",
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

    // 1. All 12 courses exist
    const c12Rows = await db.select().from(coursesTable).where(eq(coursesTable.id, 12));
    assert.equal(c12Rows.length, 1, "Course 12 does not exist in DB");
    const course12 = c12Rows[0];

    // 2. Course 12 contains one lesson and 30 questions
    const c12Lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, 12));
    assert.equal(c12Lessons.length, 1, "Course 12 should have exactly 1 lesson");

    const c12Questions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, 12));
    assert.equal(c12Questions.length, 30, "Course 12 should have exactly 30 quiz questions");

    // 3. Course 12 has 10 questions per competency
    let comp1 = 0, comp2 = 0, comp3 = 0;
    c12Questions.forEach(q => {
      if (q.competencyArea === "everyday_resource_management") comp1++;
      if (q.competencyArea === "responsible_workplace_practice") comp2++;
      if (q.competencyArea === "esg_compliance_circularity") comp3++;
    });
    assert.equal(comp1, 10, "Expected 10 questions for competency 1");
    assert.equal(comp2, 10, "Expected 10 questions for competency 2");
    assert.equal(comp3, 10, "Expected 10 questions for competency 3");

    // 4. Incomplete learners cannot enrol in Course 12
    let enrollRes = await fetch(`${API_BASE}/enrollments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ courseId: 12 }),
    });
    assert.equal(enrollRes.status, 403, "Expected 403 Forbidden when enrolling in Course 12 without prerequisites");

    // 5. Incomplete learners cannot fetch Course 12 quiz questions
    let quizFetchRes = await fetch(`${API_BASE}/courses/12/quiz`, { headers: HEADERS });
    assert.equal(quizFetchRes.status, 403, "Expected 403 Forbidden when fetching quiz without prerequisites");

    // 6. Complete all prerequisites natively in the database to bypass manual clicking
    for (let i = 1; i <= 11; i++) {
      const [enr] = await db.insert(enrollmentsTable).values({
        userId: TEST_USER_ID,
        employeeId: employee.id,
        courseId: i,
        status: "completed",
        completedAt: new Date(),
        progressPct: 100
      }).returning();
    }

    // 7. Complete learner can now enrol in Course 12
    enrollRes = await fetch(`${API_BASE}/enrollments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ courseId: 12 }),
    });
    assert.equal(enrollRes.status, 201, "Expected 201 Created for Course 12 enrolment after meeting prerequisites");

    // 8. Fetch quiz successfully and verify answers are not leaked
    quizFetchRes = await fetch(`${API_BASE}/courses/12/quiz`, { headers: HEADERS });
    assert.equal(quizFetchRes.status, 200, "Expected 200 OK fetching quiz after meeting prerequisites");
    const quizData = await quizFetchRes.json() as any;
    assert.ok(quizData.questions.length > 0, "Quiz questions returned");
    assert.equal(quizData.questions[0].correctOption, undefined, "Correct option should not be leaked in quiz fetch");
    assert.equal(quizData.questions[0].explanation, undefined, "Explanation should not be leaked in quiz fetch");

    // 9. Fail the assessment overall (< 80%) but pass competencies
    // We will simulate submitting incorrect answers
    let answers = c12Questions.map(q => ({
      questionId: q.id,
      selectedOption: q.correctOption === 0 ? 1 : 0 // All incorrect
    }));

    let submitRes = await fetch(`${API_BASE}/courses/12/quiz/submit`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ answers }),
    });
    let submitData = await submitRes.json() as any;
    assert.equal(submitData.passed, false, "Expected to fail with all incorrect answers");
    assert.equal(submitData.score, 0, "Expected score of 0");
    assert.ok(submitData.competencyScores.everyday_resource_management.passed === false);

    // 10. Fail the assessment due to one competency area < 70%
    // Pass overall (say 80% total) but one competency gets 60%
    // Comp1: 10/10, Comp2: 10/10, Comp3: 4/10 -> Total 24/30 (80%) but Comp3 fails (40%)
    answers = [];
    c12Questions.forEach(q => {
      if (q.competencyArea === "everyday_resource_management") {
        answers.push({ questionId: q.id, selectedOption: q.correctOption! });
      } else if (q.competencyArea === "responsible_workplace_practice") {
        answers.push({ questionId: q.id, selectedOption: q.correctOption! });
      } else {
        if (answers.filter(a => a.selectedOption !== 99).length < 24) {
          answers.push({ questionId: q.id, selectedOption: q.correctOption! }); // first 4 correct
        } else {
          answers.push({ questionId: q.id, selectedOption: q.correctOption === 0 ? 1 : 0 }); // last 6 wrong
        }
      }
    });

    submitRes = await fetch(`${API_BASE}/courses/12/quiz/submit`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ answers }),
    });
    submitData = await submitRes.json() as any;
    assert.equal(submitData.passed, false, "Expected to fail because one competency is < 70%");
    assert.equal(submitData.score, 80, "Expected score of 80");
    assert.equal(submitData.competencyScores.esg_compliance_circularity.passed, false, "Expected Comp3 to fail");
    assert.ok(submitData.recommendations.length > 0, "Expected recommended courses to review");

    // 11. Pass the assessment (100%)
    answers = c12Questions.map(q => ({
      questionId: q.id,
      selectedOption: q.correctOption!
    }));
    submitRes = await fetch(`${API_BASE}/courses/12/quiz/submit`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ answers }),
    });
    submitData = await submitRes.json() as any;
    assert.equal(submitData.passed, true, "Expected to pass with 100%");
    assert.ok(submitData.certificateId, "Certificate should be generated");

    // 12. Certificates check (only one certificate should exist despite multiple attempts)
    const certs = await db.select().from(certificatesTable).where(eq(certificatesTable.userId, TEST_USER_ID));
    assert.equal(certs.length, 1, "Expected exactly 1 certificate to be generated");
    assert.equal(certs[0].certificateTitle, "EcoLearnHub Core Sustainability Certificate", "Expected correct certificate title");

  } finally {
    devServer?.kill();
  }
});
