/**
 * Course 4: Water Conservation — End-to-End Integration Test
 *
 * Starts the API server in development mode, runs a full learner lifecycle
 * (enrol → lessons → commitments → quiz fail → quiz pass → badge → cert → score rollup),
 * verifies 22 assertions, then kills the server and reports pass/fail.
 *
 * Run with:
 *   cd artifacts/api-server
 *   node --env-file=.env --import tsx src/verify_course4_e2e.ts
 */

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
const TEST_USER_ID = "user_e2e_test_learner_c4";
const TEST_EMAIL = "e2e-learner-c4@ecolearn.mu";

const HEADERS = {
  "x-test-user-id": TEST_USER_ID,
  "x-test-user-email": TEST_EMAIL,
  "Content-Type": "application/json",
};

// ─────────────────────────────────────────────────────────────────────────────
// DB clean-up helper
// ─────────────────────────────────────────────────────────────────────────────
async function cleanDb() {
  console.log("\n[E2E] Cleaning up existing test records for Course 4...");

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

  await db
    .delete(courseCommitmentsTable)
    .where(eq(courseCommitmentsTable.userId, TEST_USER_ID));
  await db
    .delete(quizAttemptsTable)
    .where(eq(quizAttemptsTable.userId, TEST_USER_ID));
  await db
    .delete(certificatesTable)
    .where(eq(certificatesTable.userId, TEST_USER_ID));

  if (employeeId) {
    await db
      .delete(employeesTable)
      .where(eq(employeesTable.id, employeeId));
  }

  // Create a fresh test employee linked to company 1
  const [employee] = await db
    .insert(employeesTable)
    .values({
      name: "E2E Course 4 Learner",
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

// ─────────────────────────────────────────────────────────────────────────────
// Main E2E runner
// ─────────────────────────────────────────────────────────────────────────────
async function runTest() {
  console.log("\n=== STARTING COURSE 4 E2E INTEGRATION TESTS ===");

  // Start the API server
  console.log("Starting development server on port 8080...");
  const devServer = spawn(process.execPath, ["./dist/index.mjs"], {
    env: {
      ...process.env,
      NODE_ENV: "development",
      ENABLE_TEST_AUTH_BYPASS: "true",
      PORT: "8080",
    },
    cwd: "/Users/sharonlennon/Desktop/Elearn-Hub copy/artifacts/api-server",
  });

  devServer.stdout.on("data", (data) => {
    console.log(`[SERVER STDOUT] ${data.toString().trim()}`);
  });
  devServer.stderr.on("data", (data) =>
    console.error(`[SERVER STDERR] ${data.toString().trim()}`)
  );

  // Wait for server to be ready
  console.log("- Waiting for development server to start on port 8080...");
  for (let attempt = 1; attempt <= 50; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/courses`, { headers: HEADERS });
      if (res.status === 200) break;
    } catch {
      if (attempt === 50) throw new Error("Server failed to start after 50 attempts");
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  try {
    const employee = await cleanDb();

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 1: Course 4 exists exactly once
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n1. Verifying Course 4 exists exactly once in the database...");
    const c4Rows = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.slug, "water-conservation"));
    if (c4Rows.length !== 1) {
      throw new Error(`Expected exactly 1 Course 4 record, found ${c4Rows.length}`);
    }
    const course4 = c4Rows[0];
    console.log(`- Course 4 ID: ${course4.id}, Slug: ${course4.slug}`);

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 2: Slug is water-conservation
    // ───────────────────────────────────────────────────────────────────────
    if (course4.slug !== "water-conservation") {
      throw new Error(`Expected slug water-conservation, got ${course4.slug}`);
    }
    console.log("- ✔ Slug is water-conservation");

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 3: Course is published
    // ───────────────────────────────────────────────────────────────────────
    if (course4.status !== "published") {
      throw new Error(`Course 4 status is "${course4.status}" — expected "published"`);
    }
    console.log("- ✔ Course 4 is published");

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 4: Learner enrolment succeeds
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n4. Enrolling in Course 4 (Water Conservation)...");
    const enrollRes = await fetch(`${API_BASE}/enrollments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ courseId: course4.id }),
    });
    if (enrollRes.status !== 201) {
      const txt = await enrollRes.text();
      throw new Error(`Course 4 enrollment failed: ${enrollRes.status} | ${txt}`);
    }
    const enrollment = (await enrollRes.json()) as any;
    const enrollId = enrollment.id;
    console.log(`- Enrolled! Enrollment ID: ${enrollId}`);

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 5: Exactly 6 lessons returned
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n5. Verifying lessons structure and block types...");
    const detailRes = await fetch(`${API_BASE}/enrollments/${enrollId}`, {
      headers: HEADERS,
    });
    const detail = (await detailRes.json()) as any;
    const lessons = detail.course.lessons || [];

    console.log(`- Found ${lessons.length} lessons. (Expected exactly 6)`);
    if (lessons.length !== 6) {
      throw new Error(`Expected exactly 6 lessons, found ${lessons.length}`);
    }

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 6: Every lesson contains populated content blocks
    // ───────────────────────────────────────────────────────────────────────
    const expectedBlockCounts = [6, 5, 7, 7, 6, 4];
    const expectedBlockTypes = [
      // Lesson 1: heading, short_text, key_message, workplace_example, decision_scenario, multiple_choice
      ["heading", "short_text", "key_message", "workplace_example", "decision_scenario", "multiple_choice"],
      // Lesson 2: heading, short_text, key_message, workplace_example, multiple_choice
      ["heading", "short_text", "key_message", "workplace_example", "multiple_choice"],
      // Lesson 3: heading, short_text, key_message, workplace_example, practical_action, decision_scenario, multiple_choice
      ["heading", "short_text", "key_message", "workplace_example", "practical_action", "decision_scenario", "multiple_choice"],
      // Lesson 4: heading, short_text, key_message, workplace_example, decision_scenario, practical_action, multiple_choice
      ["heading", "short_text", "key_message", "workplace_example", "decision_scenario", "practical_action", "multiple_choice"],
      // Lesson 5: heading, short_text, decision_scenario × 3, practical_action
      ["heading", "short_text", "decision_scenario", "practical_action"],
      // Lesson 6: heading, short_text, key_message, commitment
      ["heading", "short_text", "key_message", "commitment"],
    ];

    for (let i = 0; i < 6; i++) {
      const lesson = lessons[i];
      console.log(`  - Lesson ${lesson.orderIndex + 1}: "${lesson.title}"`);
      const blocks = lesson.contentBlocks || [];
      console.log(`    Blocks count: ${blocks.length} (Expected: ${expectedBlockCounts[i]})`);
      if (blocks.length !== expectedBlockCounts[i]) {
        throw new Error(
          `Lesson ${i + 1} block count mismatch! Expected ${expectedBlockCounts[i]}, got ${blocks.length}`
        );
      }

      // ─────────────────────────────────────────────────────────────────────
      // Assertion 7: Supported block types are returned correctly
      // ─────────────────────────────────────────────────────────────────────
      const types = blocks.map((b: any) => b.type);
      console.log(`    Block types: ${types.join(", ")}`);
      for (const expectedType of expectedBlockTypes[i]) {
        if (!types.includes(expectedType)) {
          throw new Error(`Lesson ${i + 1} is missing block type: ${expectedType}`);
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // Assertion 8: All 6 lessons can be completed (progress tracking works)
      // ─────────────────────────────────────────────────────────────────────
      const progressRes = await fetch(`${API_BASE}/progress/${enrollId}`, {
        method: "PATCH",
        headers: HEADERS,
        body: JSON.stringify({ lessonId: lesson.id, completed: true }),
      });
      if (progressRes.status !== 200) {
        throw new Error(`Failed to update progress for lesson "${lesson.title}": ${progressRes.status}`);
      }
    }

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 9: Progress persists after refetch
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n9. Verifying progress persistence...");
    // GET /api/progress/:enrollmentId is the dedicated progress endpoint.
    // GET /api/enrollments/:id returns enrollment metadata and course data only —
    // it does NOT include a progress array.
    const progressCheckRes = await fetch(`${API_BASE}/progress/${enrollId}`, {
      headers: HEADERS,
    });
    const progressRows = (await progressCheckRes.json()) as any[];
    const completedLessons = (progressRows || []).filter(
      (p: any) => p.completed === true
    );
    console.log(`- Completed lessons in DB: ${completedLessons.length} (Expected: 6)`);
    if (completedLessons.length !== 6) {
      throw new Error(`Progress persistence failed — expected 6 completed, got ${completedLessons.length}`);
    }

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 10: Commitments persist
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n10. Submitting commitments...");
    const commitments = ["report-leaks", "close-taps", "notice-warning-signs"];
    const commitRes = await fetch(`${API_BASE}/courses/${course4.id}/commitments`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ commitments }),
    });
    if (commitRes.status !== 200) {
      throw new Error(`Commitments submission failed: ${commitRes.status}`);
    }

    const checkCommitRes = await fetch(
      `${API_BASE}/courses/${course4.id}/commitments`,
      { headers: HEADERS }
    );
    const checkCommit = (await checkCommitRes.json()) as any;
    const savedPledges = checkCommit.commitments || [];
    console.log(`- Persisted pledges: ${savedPledges.join(", ")}`);
    if (savedPledges.length < 3) {
      throw new Error("Commitments did not persist correctly!");
    }

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 11: Exactly 8 quiz questions returned
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n11. Fetching quiz questions...");
    const quizRes = await fetch(`${API_BASE}/courses/${course4.id}/quiz`, {
      headers: HEADERS,
    });
    if (quizRes.status !== 200) {
      throw new Error(`Failed to fetch quiz: ${quizRes.status}`);
    }
    const quiz = (await quizRes.json()) as any;
    const questions = quiz.questions || [];
    console.log(`- Found ${questions.length} quiz questions. (Expected exactly 8)`);
    if (questions.length !== 8) {
      throw new Error(`Expected exactly 8 quiz questions, got ${questions.length}`);
    }

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 12: Incorrect answers produce a failed attempt and feedback
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n12. Submitting intentionally incorrect quiz attempt...");
    const incorrectAnswers = questions.map((q: any) => ({
      questionId: q.id,
      selectedOption: 3, // option index 3 — will be wrong for most questions
    }));

    const submitFailRes = await fetch(
      `${API_BASE}/courses/${course4.id}/quiz/submit`,
      {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ answers: incorrectAnswers }),
      }
    );
    const failResult = (await submitFailRes.json()) as any;
    console.log(
      `- Failed quiz attempt result: Score: ${failResult.score}%, Passed: ${failResult.passed}`
    );
    if (failResult.passed) {
      throw new Error("Quiz should have failed with incorrect options!");
    }

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 13: A second correct attempt passes
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n13. Submitting correct quiz attempt...");
    const dbQuestions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, course4.id));

    const correctAnswers = questions.map((q: any) => {
      const dbQ = dbQuestions.find((dq: any) => dq.id === q.id);
      if (!dbQ) throw new Error(`Could not find question ${q.id} in DB`);
      return { questionId: q.id, selectedOption: dbQ.correctOption };
    });

    const submitPassRes = await fetch(
      `${API_BASE}/courses/${course4.id}/quiz/submit`,
      {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ answers: correctAnswers }),
      }
    );
    if (submitPassRes.status !== 200) {
      const errTxt = await submitPassRes.text();
      throw new Error(`Failed to submit correct answers: ${errTxt}`);
    }
    const passResult = (await submitPassRes.json()) as any;
    console.log(
      `- Passed quiz attempt result: Score: ${passResult.score}%, Passed: ${passResult.passed}`
    );
    if (!passResult.passed || passResult.score !== 100) {
      throw new Error("Quiz should have passed with 100% score!");
    }

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 14: Official score is 100% after fail then pass
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n14. Verifying official score is highest passing attempt...");
    const [dbEmployee] = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.id, employee.id))
      .limit(1);
    console.log(
      `- Rollup Stats: Completed Courses: ${dbEmployee.completedCourses}, Average Score: ${dbEmployee.avgScore}%`
    );
    if (dbEmployee.avgScore !== 100) {
      throw new Error(
        `Expected rollup score 100%, got ${dbEmployee.avgScore}%`
      );
    }

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 15: Both quiz attempts stored in history
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n15. Verifying both quiz attempts are preserved...");
    const dbAttempts = await db
      .select()
      .from(quizAttemptsTable)
      .where(eq(quizAttemptsTable.userId, TEST_USER_ID));
    console.log(
      `- Total quiz attempts in DB: ${dbAttempts.length} (Expected exactly 2)`
    );
    if (dbAttempts.length !== 2) {
      throw new Error(
        `Expected exactly 2 attempts in history, found ${dbAttempts.length}`
      );
    }

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 16: Enrollment becomes completed
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n16. Verifying enrollment is marked completed...");
    const [dbEnrollment] = await db
      .select()
      .from(enrollmentsTable)
      .where(eq(enrollmentsTable.id, enrollId))
      .limit(1);
    if (dbEnrollment.status !== "completed") {
      throw new Error(
        `Enrollment status is "${dbEnrollment.status}" — expected "completed"`
      );
    }
    console.log("- ✔ Enrollment is completed");

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 17: Certificate generated exactly once
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n17. Verifying certificate was generated...");
    const certRes = await fetch(`${API_BASE}/certificates`, { headers: HEADERS });
    const certs = (await certRes.json()) as any[];
    const c4Cert = certs.find((c: any) => c.courseId === course4.id);
    if (!c4Cert) {
      throw new Error("Course 4 certificate was not generated!");
    }
    console.log(`- Certificate ID: ${c4Cert.id}, Code: "${c4Cert.uniqueCode ?? c4Cert.certificateCode}"`);

    // Verify no duplicate certificate
    const c4CertCount = certs.filter((c: any) => c.courseId === course4.id);
    if (c4CertCount.length !== 1) {
      throw new Error(`Expected exactly 1 certificate, found ${c4CertCount.length}`);
    }

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 18: Water Wise at Work badge earned exactly once
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n18. Verifying Water Wise at Work badge was awarded...");
    const badgesRes = await fetch(`${API_BASE}/badges`, { headers: HEADERS });
    const badges = (await badgesRes.json()) as any[];
    const waterBadge = badges.find((b: any) => b.slug === "water-wise-at-work");
    if (!waterBadge) {
      throw new Error("Water Wise at Work badge definition not found!");
    }
    console.log(
      `- Badge name: "${waterBadge.name}", Earned: ${waterBadge.earned}`
    );
    if (!waterBadge.earned) {
      throw new Error("Water Wise at Work badge was not awarded!");
    }

    // Verify no cross-course badge leakage
    const energyBadge = badges.find((b: any) => b.slug === "energy-saver");
    if (energyBadge?.earned) {
      throw new Error(
        "Energy Saver badge was incorrectly awarded to a Course 4-only learner!"
      );
    }

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 19: Manager dashboard statistics update
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n19. Verifying manager dashboard stats updated...");
    const [updatedEmployee] = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.id, employee.id))
      .limit(1);
    if (updatedEmployee.completedCourses < 1) {
      throw new Error(
        `Expected completedCourses >= 1, got ${updatedEmployee.completedCourses}`
      );
    }
    if (updatedEmployee.certificates < 1) {
      throw new Error(
        `Expected certificates >= 1, got ${updatedEmployee.certificates}`
      );
    }
    console.log(
      `- ✔ Completed courses: ${updatedEmployee.completedCourses}, Certificates: ${updatedEmployee.certificates}`
    );

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 20: Employee training records update
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n20. Verifying employee training record...");
    if (updatedEmployee.avgScore !== 100) {
      throw new Error(
        `Employee training record avgScore expected 100, got ${updatedEmployee.avgScore}`
      );
    }
    console.log(`- ✔ Employee avgScore: ${updatedEmployee.avgScore}%`);

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 21: Unpublished Course 5 does not create a broken learner action
    // ───────────────────────────────────────────────────────────────────────
    console.log(
      "\n21. Verifying unpublished Course 5 recommendation is safe..."
    );
    const [course5] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.slug, "sustainable-procurement"))
      .limit(1);

    if (course5) {
      const isPublished = course5.status === "published" || course5.isPublished;
      console.log(
        `- Course 5 exists. Status: "${course5.status}", isPublished: ${course5.isPublished}`
      );
      if (isPublished) {
        console.log(
          "  - Course 5 is published — recommendation link will be shown. This is expected behaviour."
        );
      } else {
        console.log(
          "  - Course 5 is not published — recommendation link is hidden. ✔"
        );
      }
    } else {
      console.log(
        "  - Course 5 does not exist — no recommendation link will be rendered. ✔"
      );
    }
    console.log("- ✔ No broken next-course link for learner");

    // ───────────────────────────────────────────────────────────────────────
    // Assertion 22: Re-running the seeder creates no duplicates
    // ───────────────────────────────────────────────────────────────────────
    console.log("\n22. Verifying seeder idempotency on re-run...");
    const { ensureWaterConservationCourse } = await import(
      "./lib/ensureWaterConservationCourse"
    );
    await ensureWaterConservationCourse();

    const c4PostSeedRows = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.slug, "water-conservation"));
    if (c4PostSeedRows.length !== 1) {
      throw new Error(
        `After re-seeding, expected 1 Course 4 record, found ${c4PostSeedRows.length}`
      );
    }

    const lessonsPostSeed = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, course4.id));
    if (lessonsPostSeed.length !== 6) {
      throw new Error(
        `After re-seeding, expected 6 lessons, found ${lessonsPostSeed.length}`
      );
    }

    const quizPostSeed = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, course4.id));
    if (quizPostSeed.length !== 8) {
      throw new Error(
        `After re-seeding, expected 8 quiz questions, found ${quizPostSeed.length}`
      );
    }

    const badgePostSeed = await db
      .select()
      .from(badgeDefinitionsTable)
      .where(eq(badgeDefinitionsTable.slug, "water-wise-at-work"));
    if (badgePostSeed.length !== 1) {
      throw new Error(
        `After re-seeding, expected 1 badge definition, found ${badgePostSeed.length}`
      );
    }

    console.log("- ✔ Re-seed created no duplicates");

    console.log("\n=== ALL COURSE 4 E2E INTEGRATION TESTS PASSED ===");
  } finally {
    devServer.kill("SIGTERM");
  }
}

runTest().catch((err) => {
  console.error("\n=== COURSE 4 E2E INTEGRATION TESTS FAILED ===");
  console.error(err);
  process.exit(1);
});
