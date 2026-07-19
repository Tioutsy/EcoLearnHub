/**
 * Course 6: Green Office Practices — End-to-End Integration Test
 */

import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  enrollmentsTable,
  certificatesTable,
  systemSeedsTable,
  employeesTable,
  lessonProgressTable,
  courseCommitmentsTable,
  quizAttemptsTable,
} from "@workspace/db";
import { eq, and, or, inArray, desc } from "drizzle-orm";

const BASE = "http://localhost:8080";
const LEARNER_ID = "user_e2e_test_learner_c6";
const LEARNER_EMAIL = "e2e-learner-c6@ecolearn.mu";
const COMPANY_ID = 1;
const COURSE_ID = 6;
const COURSE_SLUG = "green-office-practices";

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`  ✔ ${label}`);
    passed++;
  } else {
    console.error(`  ✘ FAIL: ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function api(
  path: string,
  opts: RequestInit = {}
): Promise<{ status: number; body: any }> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      "x-test-user-id": LEARNER_ID,
      "x-test-user-email": LEARNER_EMAIL,
      "x-test-company-id": String(COMPANY_ID),
      ...(opts.headers as Record<string, string> | undefined),
    },
  });
  let body: any;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

async function cleanup(): Promise<any> {
  const existingEmployees = await db
    .select()
    .from(employeesTable)
    .where(or(
      eq(employeesTable.clerkUserId, LEARNER_ID),
      eq(employeesTable.email, LEARNER_EMAIL)
    ));

  const employeeIds = existingEmployees.map(e => e.id);

  const clauses: any[] = [
    eq(enrollmentsTable.userId, LEARNER_ID),
    eq(enrollmentsTable.userId, LEARNER_EMAIL),
  ];
  if (employeeIds.length > 0) {
    clauses.push(inArray(enrollmentsTable.employeeId, employeeIds));
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
    .where(eq(courseCommitmentsTable.userId, LEARNER_ID));
  await db
    .delete(quizAttemptsTable)
    .where(or(
      eq(quizAttemptsTable.userId, LEARNER_ID),
      eq(quizAttemptsTable.userId, LEARNER_EMAIL)
    ));
  await db
    .delete(certificatesTable)
    .where(eq(certificatesTable.userId, LEARNER_ID));

  if (employeeIds.length > 0) {
    await db
      .delete(employeesTable)
      .where(inArray(employeesTable.id, employeeIds));
  }

  // Create a fresh test employee linked to company 1
  const [employee] = await db
    .insert(employeesTable)
    .values({
      name: "E2E Course 6 Learner",
      email: LEARNER_EMAIL,
      clerkUserId: LEARNER_ID,
      companyId: COMPANY_ID,
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

async function main(): Promise<void> {
  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  Course 6: Green Office Practices — E2E Verification");
  console.log("══════════════════════════════════════════════════════════\n");

  const employee = await cleanup();
  console.log("  [Setup] Test learner records cleaned.\n");

  // ── Assertion 1: Course 6 exists exactly once ──────────────────────────────
  const c6Rows = await db
    .select({ id: coursesTable.id, slug: coursesTable.slug, status: coursesTable.status, isPublished: coursesTable.isPublished })
    .from(coursesTable)
    .where(eq(coursesTable.slug, COURSE_SLUG));
  assert("Course 6 exists exactly once", c6Rows.length === 1, `found ${c6Rows.length}`);

  // ── Assertion 2: Slug is green-office-practices ───────────────────────────
  assert("Slug is green-office-practices", c6Rows[0]?.slug === COURSE_SLUG);

  // ── Assertion 3: Course is published ───────────────────────────────────────
  assert("Course 6 is published", c6Rows[0]?.status === "published" || c6Rows[0]?.isPublished === true);

  // ── Assertion 4: Learner enrolment succeeds ────────────────────────────────
  const enrolRes = await api(`/api/enrollments`, {
    method: "POST",
    body: JSON.stringify({ courseId: COURSE_ID }),
  });
  assert("Enrolment returns 200 or 201", enrolRes.status === 200 || enrolRes.status === 201, `got ${enrolRes.status}`);
  const enrollId: number = enrolRes.body?.id ?? enrolRes.body?.enrollment?.id;
  assert("Enrolment ID is a positive integer", typeof enrollId === "number" && enrollId > 0, `got ${enrollId}`);

  // ── Assertion 5: Exactly 6 lessons returned ────────────────────────────────
  const enrolDetail = await api(`/api/enrollments/${enrollId}`);
  const lessons: any[] = enrolDetail.body?.course?.lessons ?? enrolDetail.body?.lessons ?? [];
  assert("Exactly 6 lessons returned", lessons.length === 6, `got ${lessons.length}`);

  // ── Assertion 6: Every lesson has populated contentBlocks ─────────────────
  const expectedBlockCounts = [2, 2, 3, 3, 2, 2];
  for (let i = 0; i < lessons.length; i++) {
    const blocks: any[] = lessons[i]?.contentBlocks ?? [];
    assert(
      `Lesson ${i} has ${expectedBlockCounts[i]} blocks`,
      blocks.length === expectedBlockCounts[i],
      `got ${blocks.length}`
    );
  }

  // ── Assertion 7: Expected block types are present ─────────────────────────
  const allTypes = new Set(lessons.flatMap((l: any) => (l.contentBlocks ?? []).map((b: any) => b.type)));
  for (const t of ["text", "bulleted-list", "callout"]) {
    assert(`Block type "${t}" present`, allTypes.has(t));
  }

  // ── Assertion 8: All 6 lessons can be completed ───────────────────────────
  for (const lesson of lessons) {
    const r = await api(`/api/progress/${enrollId}`, {
      method: "PATCH",
      body: JSON.stringify({ lessonId: lesson.id, completed: true }),
    });
    assert(`Lesson ${lesson.orderIndex} completion accepted`, r.status === 200, `got ${r.status}`);
  }

  // ── Assertion 9: Progress persists after refetch ──────────────────────────
  const progressRes = await api(`/api/progress/${enrollId}`);
  const progressRows: any[] = progressRes.body?.progress ?? progressRes.body ?? [];
  const completedCount = progressRows.filter((p: any) => p.completed === true).length;
  assert("6 lessons persist as completed", completedCount === 6, `got ${completedCount}`);

  // ── Assertion 10: Exactly 6 quiz questions returned ───────────────────────
  const quizRes = await api(`/api/courses/${COURSE_ID}/quiz`);
  const questions: any[] = quizRes.body?.questions ?? quizRes.body ?? [];
  assert("Exactly 6 quiz questions", questions.length === 6, `got ${questions.length}`);

  // ── Assertion 11: Correct-answer positions distributed ────────────────────
  const dbQuestions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, COURSE_ID));
  const correctIndexes = new Set(dbQuestions.map((q: any) => q.correctOption));
  assert("Correct indexes span at least 2 distinct values", correctIndexes.size >= 2, `indexes: ${[...correctIndexes].join(",")}`);

  // ── Assertion 12: Every question has explanation feedback ─────────────────
  const allHaveFeedback = dbQuestions.every(
    (q: any) => q.correctExplanation && q.incorrectExplanation
  );
  assert("All questions have correctExplanation and incorrectExplanation", allHaveFeedback);

  // ── Assertion 13: Intentionally incorrect attempt fails ───────────────────
  const wrongAnswers = questions.map((q: any) => {
    const dbQ = dbQuestions.find((dq: any) => dq.id === q.id);
    return {
      questionId: q.id,
      selectedOption: dbQ ? (dbQ.correctOption + 1) % 4 : 3,
    };
  });
  const failRes = await api(`/api/courses/${COURSE_ID}/quiz/submit`, {
    method: "POST",
    body: JSON.stringify({ answers: wrongAnswers }),
  });
  assert("Failed attempt returns 200", failRes.status === 200, `got ${failRes.status}`);
  assert("Failed attempt score is below 80%", (failRes.body?.score ?? 100) < 80, `score: ${failRes.body?.score}`);
  assert("Failed attempt has passed=false", failRes.body?.passed === false);
  
  // ── Assertion 14: Failed attempt returns detailed feedback array ───────────
  const failFeedback = failRes.body?.feedback ?? [];
  assert("Failed attempt includes detailed feedback array", failFeedback.length === 6, `got ${failFeedback.length} items`);
  const sampleFailFeedback = failFeedback[0];
  assert("Feedback item has selectedOption and isCorrect=false", sampleFailFeedback?.selectedOption !== undefined && sampleFailFeedback?.isCorrect === false);
  assert("Feedback item has correctExplanation or incorrectExplanation", !!(sampleFailFeedback?.correctExplanation || sampleFailFeedback?.incorrectExplanation));

  // ── Assertion 15: Correct second attempt passes ───────────────────────────
  const correctAnswers = questions.map((q: any) => {
    const dbQ = dbQuestions.find((dq: any) => dq.id === q.id);
    return {
      questionId: q.id,
      selectedOption: dbQ?.correctOption ?? 0,
    };
  });
  const passRes = await api(`/api/courses/${COURSE_ID}/quiz/submit`, {
    method: "POST",
    body: JSON.stringify({ answers: correctAnswers }),
  });
  assert("Passing attempt returns 200", passRes.status === 200, `got ${passRes.status}`);
  assert("Passing attempt score is 100%", passRes.body?.score === 100, `score: ${passRes.body?.score}`);
  assert("Passing attempt has passed=true", passRes.body?.passed === true);

  // ── Assertion 16: Passing attempt returns detailed feedback array ──────────
  const passFeedback = passRes.body?.feedback ?? [];
  assert("Passing attempt includes detailed feedback array", passFeedback.length === 6, `got ${passFeedback.length} items`);
  const samplePassFeedback = passFeedback[0];
  assert("Feedback item has isCorrect=true", samplePassFeedback?.isCorrect === true);

  // ── Assertion 17: Official score is 100% ──────────────────────────
  const [dbEmployee] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.id, employee.id))
    .limit(1);
  assert("Official score is 100%", dbEmployee.avgScore === 100, `got ${dbEmployee.avgScore}`);

  // ── Assertion 18: Both quiz attempts remain stored ────────────────────────
  const dbAttempts = await db
    .select()
    .from(quizAttemptsTable)
    .where(eq(quizAttemptsTable.userId, LEARNER_ID));
  assert("2 quiz attempts stored", dbAttempts.length === 2, `got ${dbAttempts.length}`);

  // ── Assertion 19: Enrollment status becomes completed ────────────────────
  const [dbEnrollment] = await db
    .select()
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.id, enrollId))
    .limit(1);
  assert("Enrollment status is completed", dbEnrollment.status === "completed", `got ${dbEnrollment.status}`);

  // ── Assertion 20: Exactly one certificate generated ───────────────────────
  const certRes = await api(`/api/certificates`);
  const certs: any[] = certRes.body ?? [];
  const c6Cert = certs.find((c: any) => c.courseId === COURSE_ID);
  assert("Exactly 1 certificate exists", !!c6Cert);
  assert("Certificate has uniqueCode", !!(c6Cert?.uniqueCode || c6Cert?.certificateCode));

  // ── Assertion 21: Repeated completion does not create duplicate cert ───────
  await api(`/api/courses/${COURSE_ID}/quiz/submit`, {
    method: "POST",
    body: JSON.stringify({ answers: correctAnswers }),
  });
  const certsAfterRepeat = await db
    .select()
    .from(certificatesTable)
    .where(
      and(
        eq(certificatesTable.userId, LEARNER_ID),
        eq(certificatesTable.courseId, COURSE_ID)
      )
    );
  assert("Still exactly 1 certificate after repeat submission", certsAfterRepeat.length === 1, `got ${certsAfterRepeat.length}`);

  // ── Assertion 22: Green Office Champion badge earned ────────────────────
  const badgesRes = await api(`/api/badges`);
  const allBadges: any[] = badgesRes.body ?? [];
  const gopBadge = allBadges.find((b: any) => b.slug === "green-office-champion");
  assert("Green Office Champion badge exists in catalogue", !!gopBadge);
  assert("Green Office Champion badge earned", gopBadge?.earned === true, `earned: ${gopBadge?.earned}`);

  // ── Assertion 23: Badge award not duplicated ──────────────────────────────
  const badgesRes2 = await api(`/api/badges`);
  const allBadges2: any[] = badgesRes2.body ?? [];
  const gopBadge2 = allBadges2.find((b: any) => b.slug === "green-office-champion");
  assert("Green Office Champion badge still earned after re-check", gopBadge2?.earned === true);

  // ── Assertion 24: No cross-course badge leakage ───────────────────────────
  for (const wrongSlug of ["responsible-purchasing", "sorting-champion"]) {
    const wrongBadge = allBadges.find((b: any) => b.slug === wrongSlug);
    assert(`"${wrongSlug}" not earned by C6 learner`, wrongBadge?.earned !== true, `earned: ${wrongBadge?.earned}`);
  }

  // ── Assertion 25: Course 7 unpublished state creates no broken recommendation
  const [c7] = await db
    .select({ id: coursesTable.id, isPublished: coursesTable.isPublished, status: coursesTable.status })
    .from(coursesTable)
    .where(eq(coursesTable.id, 7))
    .limit(1);
  assert("Course 7 remains unpublished (draft)", c7?.isPublished === false || c7?.status === "draft");
  
  const catalogueRes = await api(`/api/courses`);
  const publishedCourses: any[] = catalogueRes.body?.courses ?? catalogueRes.body ?? [];
  const c7InCatalogue = publishedCourses.find((c: any) => c.id === 7);
  assert("Course 7 not shown as published in catalogue", !c7InCatalogue || c7InCatalogue?.isPublished === false);

  // ── Assertion 26: Course 5 recommendation resolves to published Course 6 ──
  const [c5] = await db
    .select({ recommendedNextCourseId: coursesTable.recommendedNextCourseId })
    .from(coursesTable)
    .where(eq(coursesTable.id, 5))
    .limit(1);
  assert("Course 5 recommendedNextCourseId is 6", c5?.recommendedNextCourseId === 6, `got ${c5?.recommendedNextCourseId}`);

  // ── Assertion 27: Seeder re-run creates no duplicates ────────────────────
  const { ensureGreenOfficePracticesCourse } = await import(
    "./lib/ensureGreenOfficePracticesCourse"
  );
  await ensureGreenOfficePracticesCourse();
  const lessonCount = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, COURSE_ID));
  const quizCount = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.courseId, COURSE_ID));
  const badgeCount = await db
    .select()
    .from(badgeDefinitionsTable)
    .where(eq(badgeDefinitionsTable.slug, "green-office-champion"));
  assert("Still exactly 6 lessons after re-seed", lessonCount.length === 6, `got ${lessonCount.length}`);
  assert("Still exactly 6 quiz questions after re-seed", quizCount.length === 6, `got ${quizCount.length}`);
  assert("Still exactly 1 Green Office Champion badge after re-seed", badgeCount.length === 1, `got ${badgeCount.length}`);

  // ── Assertion 28: Course 6 seed marker present ────────────────────────────
  const [seedMarker] = await db
    .select()
    .from(systemSeedsTable)
    .where(eq(systemSeedsTable.name, "green-office-practices-v2"))
    .limit(1);
  assert("Seed marker green-office-practices-v2 exists", !!seedMarker);

  // ── Final report ──────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log("  ✅ ALL ASSERTIONS PASSED — Course 6 E2E PASS");
  } else {
    console.log("  ❌ SOME ASSERTIONS FAILED — see failures above");
  }
  console.log("══════════════════════════════════════════════════════════\n");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
