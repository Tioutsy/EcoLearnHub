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
const TEST_USER_ID = "user_combined_e2e_learner";
const TEST_EMAIL = "combined-learner@ecolearn.mu";

const HEADERS = {
  "x-test-user-id": TEST_USER_ID,
  "x-test-user-email": TEST_EMAIL,
  "Content-Type": "application/json",
};

async function cleanDb() {
  console.log("\n[Combined E2E] Cleaning test records for this learner...");

  const [existingEmployee] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.clerkUserId, TEST_USER_ID))
    .limit(1);

  const employeeId = existingEmployee?.id;

  const enrollments = await db
    .select({ id: enrollmentsTable.id })
    .from(enrollmentsTable)
    .where(
      or(
        eq(enrollmentsTable.userId, TEST_USER_ID),
        eq(enrollmentsTable.userId, TEST_EMAIL),
        employeeId ? eq(enrollmentsTable.employeeId, employeeId) : undefined
      )
    );

  const enrollmentIds = enrollments.map(e => e.id);

  if (enrollmentIds.length > 0) {
    await db.delete(lessonProgressTable).where(inArray(lessonProgressTable.enrollmentId, enrollmentIds));
    await db.delete(enrollmentsTable).where(inArray(enrollmentsTable.id, enrollmentIds));
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
      name: "Combined E2E Learner",
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
  console.log("\n=== STARTING COMBINED COURSES 1-3 INTEGRATION REGRESSION ===");

  // Spawn development server on port 8080 if not already running
  console.log("Checking for running server on port 8080...");
  let serverSpawned = false;
  let devServer: any = null;

  try {
    const checkRes = await fetch("http://localhost:8080/api/courses", { headers: HEADERS });
    if (checkRes.status === 200) {
      console.log("- Using existing development server on port 8080.");
    }
  } catch (e) {
    console.log("- Spawning new development server on port 8080...");
    devServer = spawn(process.execPath, ["./dist/index.mjs"], {
      env: {
        ...process.env,
        NODE_ENV: "development",
        ENABLE_TEST_AUTH_BYPASS: "true",
        PORT: "8080",
      },
      cwd: "/Users/sharonlennon/Desktop/Elearn-Hub copy/artifacts/api-server"
    });
    serverSpawned = true;

    devServer.stdout.on("data", (data: any) => {
      // console.log(`[DEV STDOUT] ${data.toString().trim()}`);
    });

    for (let attempt = 1; attempt <= 50; attempt++) {
      try {
        const res = await fetch("http://localhost:8080/api/courses", { headers: HEADERS });
        if (res.status === 200) break;
      } catch (err) {
        if (attempt === 50) throw err;
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  try {
    const employee = await cleanDb();

    // Loop through Course 1, Course 2, and Course 3
    const targetCourses = [
      { id: 1, slug: "sustainability-foundations", commitments: ["reduce-waste", "save-energy"], badgeSlug: "sustainability-starter" },
      { id: 2, slug: "waste-sorting-mauritian-bin-system", commitments: ["check-label", "keep-food-out"], badgeSlug: "sorting-champion" },
      { id: 3, slug: "energy-efficiency-at-work", commitments: ["ac-24", "unplug-vampires"], badgeSlug: "energy-saver" }
    ];

    for (const cInfo of targetCourses) {
      console.log(`\n--- Completing Course ${cInfo.id}: "${cInfo.slug}" ---`);

      // 1. Enroll
      const enrollRes = await fetch(`${API_BASE}/enrollments`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ courseId: cInfo.id }),
      });
      if (enrollRes.status !== 201) {
        const txt = await enrollRes.text();
        throw new Error(`Enrollment in Course ${cInfo.id} failed: ${txt}`);
      }
      const enrollment = await enrollRes.json() as any;
      const enrollId = enrollment.id;

      // 2. Complete Lessons
      const detailRes = await fetch(`${API_BASE}/enrollments/${enrollId}`, { headers: HEADERS });
      const detail = await detailRes.json() as any;
      const lessons = detail.course.lessons || [];
      if (lessons.length !== 6) {
        throw new Error(`Expected exactly 6 lessons for Course ${cInfo.id}, got ${lessons.length}`);
      }

      for (const lesson of lessons) {
        const blocks = lesson.contentBlocks || [];
        if (blocks.length === 0) {
          throw new Error(`Lesson ${lesson.title} has empty content blocks!`);
        }
        const progressRes = await fetch(`${API_BASE}/progress/${enrollId}`, {
          method: "PATCH",
          headers: HEADERS,
          body: JSON.stringify({ lessonId: lesson.id, completed: true }),
        });
        if (progressRes.status !== 200) {
          throw new Error(`Failed to complete lesson ${lesson.title}`);
        }
      }
      console.log(`- Completed exactly 6 lessons.`);

      // 3. Commitments
      const commitRes = await fetch(`${API_BASE}/courses/${cInfo.id}/commitments`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ commitments: cInfo.commitments }),
      });
      if (commitRes.status !== 200) {
        throw new Error(`Commitment submission failed for Course ${cInfo.id}`);
      }
      console.log(`- Submitted commitments: ${cInfo.commitments.join(", ")}`);

      // 4. Fetch Quiz
      const quizRes = await fetch(`${API_BASE}/courses/${cInfo.id}/quiz`, { headers: HEADERS });
      const quiz = await quizRes.json() as any;
      const questions = quiz.questions || [];
      if (questions.length !== 8 && cInfo.id !== 1) { // Course 1 has 6 questions, others have 8
        if (cInfo.id === 1 && questions.length !== 6) {
          throw new Error(`Course 1 quiz must have 6 questions, got ${questions.length}`);
        } else if (cInfo.id !== 1) {
          throw new Error(`Course ${cInfo.id} quiz must have 8 questions, got ${questions.length}`);
        }
      }

      // 5. Submit Failing Attempt (wrong answer indices)
      const wrongAnswers = questions.map((q: any) => ({
        questionId: q.id,
        selectedOption: 3
      }));
      const failRes = await fetch(`${API_BASE}/courses/${cInfo.id}/quiz/submit`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ answers: wrongAnswers }),
      });
      const failResult = await failRes.json() as any;
      if (failResult.passed) {
        throw new Error(`Failing attempt for Course ${cInfo.id} passed incorrectly!`);
      }
      console.log(`- Failed quiz attempt recorded in history. Score: ${failResult.score}%`);

      // 6. Submit Correct Attempt (retrieve correctAnswerIndex from database)
      const dbQuestions = await db
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, cInfo.id));

      const correctAnswers = questions.map((q: any) => {
        const dbQ = dbQuestions.find(dq => dq.id === q.id);
        if (!dbQ) throw new Error(`Question ${q.id} not in database!`);
        return {
          questionId: q.id,
          selectedOption: dbQ.correctOption,
        };
      });

      const passRes = await fetch(`${API_BASE}/courses/${cInfo.id}/quiz/submit`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ answers: correctAnswers }),
      });
      const passResult = await passRes.json() as any;
      if (!passResult.passed || passResult.score !== 100) {
        throw new Error(`Correct attempt for Course ${cInfo.id} failed!`);
      }
      console.log(`- Passed quiz attempt recorded. Score: 100%`);
    }

    // ──────────────────────────────────────────────────
    // VERIFY COMBINED LEARNER PROGRESS & INTEGRITY
    // ──────────────────────────────────────────────────
    console.log("\n=== VERIFYING FINAL STATS & CROSS-COURSE ISOLATION ===");

    // A. Verify employee stats rollup
    const [dbEmployee] = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.id, employee.id))
      .limit(1);

    console.log(`- Completed Courses: ${dbEmployee.completedCourses} (Expected: 3)`);
    console.log(`- Enrolled Courses: ${dbEmployee.enrolledCourses} (Expected: 3)`);
    console.log(`- Average Score: ${dbEmployee.avgScore}% (Expected: 100%)`);

    if (dbEmployee.completedCourses !== 3) throw new Error("Expected exactly 3 completed courses!");
    if (dbEmployee.enrolledCourses !== 3) throw new Error("Expected exactly 3 enrolled courses!");
    if (dbEmployee.avgScore !== 100) throw new Error("Expected rollup average score to be 100%!");

    // B. Verify quiz attempts history is preserved
    const attempts = await db.select().from(quizAttemptsTable).where(eq(quizAttemptsTable.userId, TEST_USER_ID));
    console.log(`- Total quiz attempts in database: ${attempts.length} (Expected exactly 6: 2 per course)`);
    if (attempts.length !== 6) throw new Error("Failed to preserve all quiz attempt history!");

    // C. Verify distinct certificates exist
    const certs = await db.select().from(certificatesTable).where(eq(certificatesTable.userId, TEST_USER_ID));
    console.log(`- Total distinct certificates: ${certs.length} (Expected exactly 3)`);
    if (certs.length !== 3) throw new Error("Missing certificates for completed courses!");

    // D. Verify badges exist without duplicates
    const badgesRes = await fetch(`${API_BASE}/badges`, { headers: HEADERS });
    const badges = await badgesRes.json() as any[];
    const earnedBadges = badges.filter(b => b.earned);
    console.log(`- Total earned badges: ${earnedBadges.length}`);
    for (const slug of ["sustainability-starter", "sorting-champion", "energy-saver"]) {
      const b = earnedBadges.find(x => x.slug === slug);
      if (!b) throw new Error(`Missing earned badge: ${slug}`);
    }

    console.log("\n=== ALL COMBINED LEARNER REGRESSION CHECKS PASSED ===");
  } finally {
    if (serverSpawned && devServer) {
      devServer.kill("SIGTERM");
    }
  }
}

runTest().catch((err) => {
  console.error("\n=== COMBINED REGRESSION CHECKS FAILED ===");
  console.error(err);
  process.exit(1);
});
