import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  enrollmentsTable,
  employeesTable,
  lessonProgressTable,
  courseCommitmentsTable,
  quizAttemptsTable,
  certificatesTable,
  badgeDefinitionsTable,
} from "@workspace/db";
import { eq, and, or, inArray } from "drizzle-orm";
import { spawn } from "child_process";

const API_BASE = "http://localhost:8080/api";
const TEST_USER_ID = "user_e2e_test_learner_c2";
const TEST_EMAIL = "e2e-learner-c2@ecolearn.mu";

const HEADERS = {
  "x-test-user-id": TEST_USER_ID,
  "x-test-user-email": TEST_EMAIL,
  "Content-Type": "application/json",
};

async function cleanDb() {
  console.log("\n[E2E] Cleaning up existing test records for Course 2...");

  // Find test employee
  const [existingEmployee] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.clerkUserId, TEST_USER_ID))
    .limit(1);

  const employeeId = existingEmployee?.id;

  // Find all enrollments linked to this user/employee
  const clauses = [
    eq(enrollmentsTable.userId, TEST_USER_ID),
    eq(enrollmentsTable.userId, TEST_EMAIL)
  ];
  if (employeeId) {
    clauses.push(eq(enrollmentsTable.employeeId, employeeId));
  }

  const enrollments = await db
    .select({ id: enrollmentsTable.id })
    .from(enrollmentsTable)
    .where(or(...clauses));

  const enrollmentIds = enrollments.map(e => e.id);

  if (enrollmentIds.length > 0) {
    await db.delete(lessonProgressTable).where(
      inArray(lessonProgressTable.enrollmentId, enrollmentIds)
    );
    await db.delete(enrollmentsTable).where(
      inArray(enrollmentsTable.id, enrollmentIds)
    );
  }

  await db.delete(courseCommitmentsTable).where(eq(courseCommitmentsTable.userId, TEST_USER_ID));
  await db.delete(quizAttemptsTable).where(eq(quizAttemptsTable.userId, TEST_USER_ID));
  await db.delete(certificatesTable).where(eq(certificatesTable.userId, TEST_USER_ID));

  if (employeeId) {
    await db.delete(employeesTable).where(eq(employeesTable.id, employeeId));
  }

  // Insert a fresh test employee record
  const [employee] = await db
    .insert(employeesTable)
    .values({
      name: "E2E Course 2 Learner",
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

  console.log(`- Created clean test employee. ID: ${employee.id}`);
  return employee;
}

async function runTest() {
  console.log("\n=== STARTING COURSE 2 E2E INTEGRATION TESTS ===");

  // Spawn development server on port 8080
  console.log("Starting development server on port 8080...");
  const devServer = spawn(process.execPath, ["./dist/index.mjs"], {
    env: {
      ...process.env,
      NODE_ENV: "development",
      ENABLE_TEST_AUTH_BYPASS: "true",
      PORT: "8080",
    },
    cwd: "/Users/sharonlennon/Desktop/Elearn-Hub copy/artifacts/api-server"
  });

  devServer.stdout.on("data", (data) => {
    console.log(`[SERVER STDOUT] ${data.toString().trim()}`);
  });
  devServer.stderr.on("data", (data) => console.error(`[SERVER STDERR] ${data.toString().trim()}`));

  // Wait for the dev server to boot and start listening
  console.log("- Waiting for development server to start listening on port 8080...");
  for (let attempt = 1; attempt <= 50; attempt++) {
    try {
      const res = await fetch("http://localhost:8080/api/courses", { headers: HEADERS });
      if (res.status === 200) break;
    } catch (e) {
      if (attempt === 50) throw e;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  try {
    const employee = await cleanDb();

    // 1. Enrollment
    console.log("\n1. Enrolling in Course 2 (Waste Sorting)...");
    const enrollRes = await fetch(`${API_BASE}/enrollments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ courseId: 2 }),
    });
    if (enrollRes.status !== 201) {
      const txt = await enrollRes.text();
      throw new Error(`Course 2 enrollment failed: ${enrollRes.status} | ${txt}`);
    }
    const enrollment = await enrollRes.json() as any;
    const enrollId = enrollment.id;
    console.log(`- Enrolled! Enrollment ID: ${enrollId}`);

    // 2. Verify Lessons & Content Blocks
    console.log("\n2. Verifying Lessons structure and block types...");
    const detailRes = await fetch(`${API_BASE}/enrollments/${enrollId}`, { headers: HEADERS });
    const detail = await detailRes.json() as any;
    const lessons = detail.course.lessons || [];
    
    console.log(`- Found ${lessons.length} lessons. (Expected exactly 6)`);
    if (lessons.length !== 6) {
      throw new Error(`Expected exactly 6 lessons, got ${lessons.length}`);
    }

    for (let i = 0; i < 6; i++) {
      const lesson = lessons[i];
      console.log(`  - Lesson ${lesson.orderIndex + 1}: "${lesson.title}"`);
      const blocks = lesson.contentBlocks || [];
      console.log(`    Blocks count: ${blocks.length}`);
      if (blocks.length === 0) {
        throw new Error(`Lesson ${i + 1} has empty content blocks!`);
      }

      // Complete lesson
      const progressRes = await fetch(`${API_BASE}/progress/${enrollId}`, {
        method: "PATCH",
        headers: HEADERS,
        body: JSON.stringify({ lessonId: lesson.id, completed: true }),
      });
      if (progressRes.status !== 200) {
        throw new Error(`Failed to update progress for lesson ${lesson.title}`);
      }
    }

    // 3. Commitments
    console.log("\n3. Submitting commitments...");
    const commitments = ["check-label", "keep-food-out"];
    const commitRes = await fetch(`${API_BASE}/courses/2/commitments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ commitments }),
    });
    if (commitRes.status !== 200) {
      throw new Error(`Commitments submission failed: ${commitRes.status}`);
    }

    // 4. Quiz Verification
    console.log("\n4. Fetching Quiz questions...");
    const quizRes = await fetch(`${API_BASE}/courses/2/quiz`, { headers: HEADERS });
    if (quizRes.status !== 200) {
      throw new Error(`Failed to fetch quiz: ${quizRes.status}`);
    }
    const quiz = await quizRes.json() as any;
    const questions = quiz.questions || [];
    console.log(`- Found ${questions.length} quiz questions. (Expected exactly 8)`);
    if (questions.length !== 8) {
      throw new Error(`Expected exactly 8 quiz questions, got ${questions.length}`);
    }

    console.log("\n5. Submitting correct quiz attempt...");
    const dbQuestions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, 2));

    const correctAnswers = questions.map((q: any) => {
      const dbQ = dbQuestions.find(dq => dq.id === q.id);
      if (!dbQ) throw new Error(`Could not find question ${q.id} in DB!`);
      return {
        questionId: q.id,
        selectedOption: dbQ.correctOption,
      };
    });

    const submitPassRes = await fetch(`${API_BASE}/courses/2/quiz/submit`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ answers: correctAnswers }),
    });
    if (submitPassRes.status !== 200) {
      const errTxt = await submitPassRes.text();
      throw new Error(`Failed to submit correct answers: ${errTxt}`);
    }
    const passResult = await submitPassRes.json() as any;
    console.log(`- Passed quiz attempt result: Score: ${passResult.score}%, Passed: ${passResult.passed}`);
    if (!passResult.passed || passResult.score !== 100) {
      throw new Error("Quiz should have passed with 100% score!");
    }

    // 5. Verify Certificate & Badge
    console.log("\n7. Verifying Badge and Certificate awards...");
    const badgesRes = await fetch(`${API_BASE}/badges`, { headers: HEADERS });
    const badges = await badgesRes.json() as any[];
    const championBadge = badges.find(b => b.slug === "sorting-champion");
    if (!championBadge) {
      throw new Error("Sorting Champion badge not found!");
    }
    console.log(`- Badge name: "${championBadge.name}", Earned: ${championBadge.earned}`);
    if (!championBadge.earned) {
      throw new Error("Sorting Champion badge was not awarded!");
    }

    const certRes = await fetch(`${API_BASE}/certificates`, { headers: HEADERS });
    const certs = await certRes.json() as any[];
    const c2Cert = certs.find(c => c.courseId === 2);
    if (!c2Cert) {
      throw new Error("Course 2 Certificate was not generated!");
    }
    console.log(`- Certificate ID: ${c2Cert.id}, Code: "${c2Cert.certificateCode}"`);

    console.log("\n=== ALL COURSE 2 E2E INTEGRATION TESTS PASSED ===");
  } finally {
    devServer.kill("SIGTERM");
  }
}

runTest().catch((err) => {
  console.error("\n=== COURSE 2 E2E INTEGRATION TESTS FAILED ===");
  console.error(err);
  process.exit(1);
});
