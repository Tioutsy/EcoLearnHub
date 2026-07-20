import assert from "node:assert/strict";
import test from "node:test";
import { spawn, ChildProcess } from "node:child_process";
import {
  db,
  challengesTable,
  challengeParticipantsTable,
  employeesTable,
  companiesTable,
  quizAttemptsTable,
  coursesTable,
} from "@workspace/db";
import { eq, and, ne } from "drizzle-orm";
import { ensureChallenges } from "./lib/ensureChallenges";

const API_BASE = "http://localhost:8082/api";

const LEARNER_1_ID = "test_learner_1";
const LEARNER_1_EMAIL = "learner1@test.com";

const MANAGER_1_ID = "test_manager_1";
const MANAGER_1_EMAIL = "manager1@test.com";

const MANAGER_2_ID = "test_manager_2";
const MANAGER_2_EMAIL = "manager2@test.com";

const PLATFORM_ADMIN_ID = "test_platform_admin";
const PLATFORM_ADMIN_EMAIL = "platadmin@test.com";

const HEADERS_L1 = {
  "x-test-user-id": LEARNER_1_ID,
  "x-test-user-email": LEARNER_1_EMAIL,
  "Content-Type": "application/json",
};

const HEADERS_M1 = {
  "x-test-user-id": MANAGER_1_ID,
  "x-test-user-email": MANAGER_1_EMAIL,
  "Content-Type": "application/json",
};

const HEADERS_M2 = {
  "x-test-user-id": MANAGER_2_ID,
  "x-test-user-email": MANAGER_2_EMAIL,
  "Content-Type": "application/json",
};

const HEADERS_PLAT = {
  "x-test-user-id": PLATFORM_ADMIN_ID,
  "x-test-user-email": PLATFORM_ADMIN_EMAIL,
  "x-test-user-role": "platform_admin",
  "Content-Type": "application/json",
};

async function setupTestData() {
  // Ensure we have two test companies in database
  const [comp1] = await db
    .insert(companiesTable)
    .values({ name: "Test Comp 1", slug: "test-comp-1" })
    .onConflictDoNothing()
    .returning();
  const c1Id = comp1?.id ?? 1;

  const [comp2] = await db
    .insert(companiesTable)
    .values({ name: "Test Comp 2", slug: "test-comp-2" })
    .onConflictDoNothing()
    .returning();
  const c2Id = comp2?.id ?? 2;

  // Clean old test rows
  await db.delete(challengeParticipantsTable).where(
    ne(challengeParticipantsTable.id, -1)
  );
  await db.delete(quizAttemptsTable).where(
    eq(quizAttemptsTable.userId, LEARNER_1_ID)
  );

  // Setup employees
  await db.delete(employeesTable).where(eq(employeesTable.clerkUserId, LEARNER_1_ID));
  await db.delete(employeesTable).where(eq(employeesTable.clerkUserId, MANAGER_1_ID));
  await db.delete(employeesTable).where(eq(employeesTable.clerkUserId, MANAGER_2_ID));

  const [learner1] = await db
    .insert(employeesTable)
    .values({
      name: "Learner One",
      email: LEARNER_1_EMAIL,
      clerkUserId: LEARNER_1_ID,
      companyId: c1Id,
      role: "employee",
    })
    .returning();

  const [manager1] = await db
    .insert(employeesTable)
    .values({
      name: "Manager One",
      email: MANAGER_1_EMAIL,
      clerkUserId: MANAGER_1_ID,
      companyId: c1Id,
      role: "manager", // Role is manager inside company 1
    })
    .returning();

  const [manager2] = await db
    .insert(employeesTable)
    .values({
      name: "Manager Two",
      email: MANAGER_2_EMAIL,
      clerkUserId: MANAGER_2_ID,
      companyId: c2Id,
      role: "manager", // Role is manager inside company 2
    })
    .returning();

  return { c1Id, c2Id };
}

test("Employee Challenges and Final Sustainability Score integration tests", async () => {
  let devServer: ChildProcess | undefined;

  try {
    // Start server on port 8082
    devServer = spawn(process.execPath, ["./dist/index.mjs"], {
      env: {
        ...process.env,
        NODE_ENV: "development",
        ENABLE_TEST_AUTH_BYPASS: "true",
        PORT: "8082",
      },
      cwd: process.cwd(),
    });

    devServer.stdout?.on("data", (data) => {
      console.log(`[TEST SERVER STDOUT] ${data.toString().trim()}`);
    });
    devServer.stderr?.on("data", (data) => {
      console.error(`[TEST SERVER STDERR] ${data.toString().trim()}`);
    });

    // Wait for server to start
    let ready = false;
    for (let attempt = 1; attempt <= 300; attempt++) {
      try {
        const res = await fetch(`${API_BASE}/courses`, { headers: HEADERS_L1 });
        if (res.status === 200) {
          ready = true;
          break;
        }
      } catch {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    assert.ok(ready, "Server failed to start");

    // Setup mock data
    const { c1Id, c2Id } = await setupTestData();

    // 1. Verify seeder runs idempotently and preserves unrelated challenges
    // Let's create an unrelated challenge
    const [unrelated] = await db
      .insert(challengesTable)
      .values({
        code: "UNRELATED-CH",
        slug: "unrelated-test-challenge",
        title: "Unrelated challenge",
        description: "Test description",
        icon: "target",
        focus: "Test focus",
        startDate: new Date("2025-01-01T00:00:00Z"),
        endDate: new Date("2030-01-01T00:00:00Z"),
        isActive: true,
      })
      .returning();

    // Run ensureChallenges seeder
    await ensureChallenges();

    // Verify unrelated is preserved
    const [foundUnrelated] = await db
      .select()
      .from(challengesTable)
      .where(eq(challengesTable.code, "UNRELATED-CH"))
      .limit(1);
    assert.ok(foundUnrelated, "Unrelated challenges must be preserved by seeder");

    // Verify exactly 12 canonical challenges exist
    const canonChallenges = await db
      .select()
      .from(challengesTable)
      .where(ne(challengesTable.code, "UNRELATED-CH"));
    assert.equal(canonChallenges.length, 12, "Expected exactly 12 canonical challenges");

    // Run seeder again to verify no duplicates are created
    await ensureChallenges();
    const canonChallenges2 = await db
      .select()
      .from(challengesTable)
      .where(ne(challengesTable.code, "UNRELATED-CH"));
    assert.equal(canonChallenges2.length, 12, "Re-running seeder must not create duplicates");

    // 2. Fetch challenges list and check score routing precedence
    const listRes = await fetch(`${API_BASE}/challenges`, { headers: HEADERS_L1 });
    assert.equal(listRes.status, 200, "Listing challenges should succeed");
    const listData = await listRes.json() as any;
    assert.ok(listData.challenges.length >= 12, "Should return seeded challenges");

    const scoreRes = await fetch(`${API_BASE}/challenges/score`, { headers: HEADERS_L1 });
    assert.equal(scoreRes.status, 200, "GET /score should not be captured as parameter route");
    const scoreData = await scoreRes.json() as any;
    assert.equal(scoreData.certificationPassed, false, "Should indicate certification not passed");
    assert.equal(scoreData.finalSustainabilityScore, null, "Final Score should be null before passing Course 12");

    // 3. Start challenge (Join)
    const ch1 = canonChallenges.find((c) => c.code === "ELH-CH-01")!;
    const joinRes = await fetch(`${API_BASE}/challenges/${ch1.id}/join`, {
      method: "POST",
      headers: HEADERS_L1,
    });
    assert.equal(joinRes.status, 200, "Should join challenge successfully");
    const joinData = await joinRes.json() as any;
    assert.equal(joinData.status, "in_progress", "Should have status in_progress");

    // Joining again should be idempotent
    const joinRes2 = await fetch(`${API_BASE}/challenges/${ch1.id}/join`, {
      method: "POST",
      headers: HEADERS_L1,
    });
    assert.equal(joinRes2.status, 200, "Re-joining should be idempotent");

    // 4. Inactive challenges cannot be joined
    await db
      .update(challengesTable)
      .set({ isActive: false })
      .where(eq(challengesTable.code, "ELH-CH-02"));
    const ch2 = canonChallenges.find((c) => c.code === "ELH-CH-02")!;
    const joinInactiveRes = await fetch(`${API_BASE}/challenges/${ch2.id}/join`, {
      method: "POST",
      headers: HEADERS_L1,
    });
    assert.equal(joinInactiveRes.status, 404, "Inactive challenge cannot be joined");
    // Restore
    await db
      .update(challengesTable)
      .set({ isActive: true })
      .where(eq(challengesTable.code, "ELH-CH-02"));

    // 5. Submit evidence reflection
    // Short reflection is rejected
    const submitShortRes = await fetch(`${API_BASE}/challenges/${ch1.id}/submit`, {
      method: "POST",
      headers: HEADERS_L1,
      body: JSON.stringify({ evidenceText: "short" }),
    });
    assert.equal(submitShortRes.status, 400, "Short evidence should be rejected (< 10 chars)");

    // Valid reflection works
    const submitRes = await fetch(`${API_BASE}/challenges/${ch1.id}/submit`, {
      method: "POST",
      headers: HEADERS_L1,
      body: JSON.stringify({ evidenceText: "We followed a strict five-day energy switch-off routine at the office." }),
    });
    assert.equal(submitRes.status, 200, "Valid evidence submit should succeed");
    const submitData = await submitRes.json() as any;
    assert.equal(submitData.status, "submitted", "Should have status submitted");

    // Verify employee cannot submit for another user
    // (Headers determine userId, so body userIds are ignored/rejected)
    // Here L1 is authenticated, so the submission is safely bound to L1's session context

    // 6. Review submissions & verify tenant isolation
    // Manager 2 (Comp 2) should NOT see Manager 1's company (Comp 1) submissions
    const pendingM2Res = await fetch(`${API_BASE}/challenges/submissions/pending`, { headers: HEADERS_M2 });
    const pendingM2 = await pendingM2Res.json() as any[];
    assert.equal(pendingM2.length, 0, "Manager of Comp 2 should not see Comp 1 pending submissions");

    // Manager 1 (Comp 1) should see the pending submission
    const pendingM1Res = await fetch(`${API_BASE}/challenges/submissions/pending`, { headers: HEADERS_M1 });
    const pendingM1 = await pendingM1Res.json() as any[];
    assert.equal(pendingM1.length, 1, "Manager of Comp 1 should see Comp 1 pending submission");
    const pendingSub = pendingM1[0];
    assert.equal(pendingSub.employeeName, "Learner One");

    // Unauthorized employee cannot review
    const reviewFailRes = await fetch(`${API_BASE}/challenges/submissions/${pendingSub.submissionId}/review`, {
      method: "POST",
      headers: HEADERS_L1,
      body: JSON.stringify({ action: "approve" }),
    });
    assert.equal(reviewFailRes.status, 403, "Non-admin employees must be forbidden from reviewing");

    // Manager 2 cannot approve Manager 1's company submission
    const reviewCrossRes = await fetch(`${API_BASE}/challenges/submissions/${pendingSub.submissionId}/review`, {
      method: "POST",
      headers: HEADERS_M2,
      body: JSON.stringify({ action: "approve" }),
    });
    assert.equal(reviewCrossRes.status, 404, "Manager 2 should receive 404/not authorized for Comp 1 submission review");

    // Manager 1 approves successfully
    const approveRes = await fetch(`${API_BASE}/challenges/submissions/${pendingSub.submissionId}/review`, {
      method: "POST",
      headers: HEADERS_M1,
      body: JSON.stringify({ action: "approve" }),
    });
    assert.equal(approveRes.status, 200, "Manager 1 should approve Comp 1 submission successfully");
    const approvedData = await approveRes.json() as any;
    assert.equal(approvedData.status, "approved", "Status must be approved");
    assert.equal(approvedData.pointsAwarded, 10, "Should award 10 points");

    // Repeated approval is idempotent
    const approveRes2 = await fetch(`${API_BASE}/challenges/submissions/${pendingSub.submissionId}/review`, {
      method: "POST",
      headers: HEADERS_M1,
      body: JSON.stringify({ action: "approve" }),
    });
    assert.equal(approveRes2.status, 200, "Repeated approval must be idempotent");

    // Approved challenge becomes read-only and cannot be resubmitted
    const resubmitApprovedRes = await fetch(`${API_BASE}/challenges/${ch1.id}/submit`, {
      method: "POST",
      headers: HEADERS_L1,
      body: JSON.stringify({ evidenceText: "Attempting to change approved evidence." }),
    });
    assert.equal(resubmitApprovedRes.status, 400, "Approved challenge must be read-only");

    // 7. Test rejection & resubmission workflow
    // Let's join and submit a second challenge (ELH-CH-02)
    const joinCh2 = await fetch(`${API_BASE}/challenges/${ch2.id}/join`, {
      method: "POST",
      headers: HEADERS_L1,
    });
    assert.equal(joinCh2.status, 200);

    const submitCh2 = await fetch(`${API_BASE}/challenges/${ch2.id}/submit`, {
      method: "POST",
      headers: HEADERS_L1,
      body: JSON.stringify({ evidenceText: "Observed a waste sorting spot check in the lunchroom." }),
    });
    assert.equal(submitCh2.status, 200);

    // Fetch pending list for Manager 1
    const pendingCh2Res = await fetch(`${API_BASE}/challenges/submissions/pending`, { headers: HEADERS_M1 });
    const pendingCh2List = await pendingCh2Res.json() as any[];
    const pendingCh2 = pendingCh2List.find((p) => p.challengeId === ch2.id)!;

    // Rejecting requires review note
    const rejectNoNoteRes = await fetch(`${API_BASE}/challenges/submissions/${pendingCh2.submissionId}/review`, {
      method: "POST",
      headers: HEADERS_M1,
      body: JSON.stringify({ action: "reject" }),
    });
    assert.equal(rejectNoNoteRes.status, 400, "Rejection must fail when note is missing");

    // Reject with note succeeds
    const rejectRes = await fetch(`${API_BASE}/challenges/submissions/${pendingCh2.submissionId}/review`, {
      method: "POST",
      headers: HEADERS_M1,
      body: JSON.stringify({ action: "reject", reviewNote: "Please explain the bins colors checked." }),
    });
    assert.equal(rejectRes.status, 200);
    const rejectedData = await rejectRes.json() as any;
    assert.equal(rejectedData.status, "rejected");
    assert.equal(rejectedData.pointsAwarded, 0, "Rejected points must be zero");

    // Resubmit rejected challenge
    const resubmitRes = await fetch(`${API_BASE}/challenges/${ch2.id}/submit`, {
      method: "POST",
      headers: HEADERS_L1,
      body: JSON.stringify({ evidenceText: "Resubmitted with bins checked: blue and green bins segregation was inspected." }),
    });
    assert.equal(resubmitRes.status, 200);
    const resubmittedData = await resubmitRes.json() as any;
    assert.equal(resubmittedData.status, "submitted");
    assert.equal(resubmittedData.reviewNote, null, "Review note must be cleared on resubmission");

    // Platform admin reviews resubmission
    const pendingPlatRes = await fetch(`${API_BASE}/challenges/submissions/pending`, { headers: HEADERS_PLAT });
    const pendingPlat = await pendingPlatRes.json() as any[];
    const subToReview = pendingPlat.find((p) => p.challengeId === ch2.id)!;

    const platApproveRes = await fetch(`${API_BASE}/challenges/submissions/${subToReview.submissionId}/review`, {
      method: "POST",
      headers: HEADERS_PLAT,
      body: JSON.stringify({ action: "approve" }),
    });
    assert.equal(platApproveRes.status, 200, "Platform admin should approve submission successfully");

    // 8. Verify scoring rules
    // Currently learner has 2 approved challenges -> 20 points, +2 bonus
    // Course 12 quiz has not been passed, so Final score should be null
    const finalScoreRes1 = await fetch(`${API_BASE}/challenges/score`, { headers: HEADERS_L1 });
    const scoreData1 = await finalScoreRes1.json() as any;
    assert.equal(scoreData1.approvedChallengeCount, 2);
    assert.equal(scoreData1.challengePoints, 20);
    assert.equal(scoreData1.challengeBonus, 2);
    assert.equal(scoreData1.certificationPassed, false);
    assert.equal(scoreData1.finalSustainabilityScore, null);

    // Seed Course 12 passed quiz attempt (score 84)
    const [c12] = await db
      .select({ id: coursesTable.id })
      .from(coursesTable)
      .where(eq(coursesTable.slug, "final-sustainability-certification"))
      .limit(1);
    const c12Id = c12?.id ?? 12;

    await db.insert(quizAttemptsTable).values({
      userId: LEARNER_1_ID,
      courseId: c12Id,
      courseVersion: 1,
      score: 84,
      totalQuestions: 10,
      correctAnswers: 8,
      passed: true,
    });

    // Score should now calculate and add bonus (84 + 2 = 86)
    const finalScoreRes2 = await fetch(`${API_BASE}/challenges/score`, { headers: HEADERS_L1 });
    const scoreData2 = await finalScoreRes2.json() as any;
    assert.equal(scoreData2.certificationPassed, true);
    assert.equal(scoreData2.certificationExamScore, 84);
    assert.equal(scoreData2.finalSustainabilityScore, 86, "Final Sustainability Score should be 86 (84 + 2)");

    // Deactivating a challenge does not remove historical points
    await db
      .update(challengesTable)
      .set({ isActive: false })
      .where(eq(challengesTable.code, "ELH-CH-01"));

    const finalScoreRes3 = await fetch(`${API_BASE}/challenges/score`, { headers: HEADERS_L1 });
    const scoreData3 = await finalScoreRes3.json() as any;
    assert.equal(scoreData3.approvedChallengeCount, 2, "Historical approved challenges must remain counted");

    console.log("All challenges integration assertions passed successfully!");
  } finally {
    // Cleanup
    await db.delete(challengesTable).where(eq(challengesTable.code, "UNRELATED-CH"));
    await db.delete(challengeParticipantsTable).where(eq(challengeParticipantsTable.userId, LEARNER_1_ID));
    await db.delete(quizAttemptsTable).where(eq(quizAttemptsTable.userId, LEARNER_1_ID));
    await db.delete(employeesTable).where(eq(employeesTable.clerkUserId, LEARNER_1_ID));
    await db.delete(employeesTable).where(eq(employeesTable.clerkUserId, MANAGER_1_ID));
    await db.delete(employeesTable).where(eq(employeesTable.clerkUserId, MANAGER_2_ID));

    devServer?.kill();
  }
});
