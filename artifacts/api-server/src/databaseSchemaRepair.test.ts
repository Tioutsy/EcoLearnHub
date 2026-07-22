import assert from "node:assert/strict";
import test, { after } from "node:test";
import {
  db,
  companiesTable,
  employeesTable,
  badgeDefinitionsTable,
  employeeBadgesTable,
  challengesTable,
  challengeParticipantsTable,
  coursesTable,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { verifyDatabaseIntegrity } from "./lib/verifyDatabaseIntegrity";
import fs from "node:fs";
import path from "node:path";

// Helper to run migration 0011 SQL directly on the test DB
async function applyRepairMigration() {
  const sqlPath = path.resolve(process.cwd(), "../../drizzle/0011_repair_constraints_and_schema_integrity.sql");
  const sqlText = fs.readFileSync(sqlPath, "utf8");
  await db.transaction(async (tx) => {
    await tx.execute(sql.raw(sqlText));
  });
}

test("Sprint 7B Database Schema Repair and Integrity Verification Tests", async (t) => {
  // Setup clean state
  await db.delete(employeeBadgesTable);
  await db.delete(challengeParticipantsTable);
  await db.delete(employeesTable);
  
  // Clear any seeded challenges/badges for test isolation if needed,
  // but let's keep them and just delete those inserted by tests.
  await db.delete(challengesTable).where(eq(challengesTable.code, "TEST-CH-01"));
  await db.delete(badgeDefinitionsTable).where(eq(badgeDefinitionsTable.code, "TEST_BADGE_CODE"));

  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.id, 1))
    .limit(1);

  assert.ok(company, "Company with id=1 must exist for tests.");

  // SCENARIO 3 & 1: Already-Correct / Fresh Database
  await t.test("Scenario 1 & 3: Run verifier and repair on a healthy database", async () => {
    // Apply migration (safe/idempotent check)
    await applyRepairMigration();
    
    // Verifier must run clean
    const report = await verifyDatabaseIntegrity();
    assert.equal(report.valid, true, "Verifier should pass on clean database.");
  });

  // SCENARIO 2 & 5 & 6: Existing Production-Like Database (with repairable duplicates/invalid states)
  await t.test("Scenario 2, 5, 6: Repair invalid status, duplicate badges, and consolidate challenge participants", async () => {
    // Drop constraints temporarily to allow seeding duplicate/invalid test data
    await db.execute(sql`ALTER TABLE challenge_participants DROP CONSTRAINT IF EXISTS uniq_participant_company`);
    await db.execute(sql`ALTER TABLE challenge_participants DROP CONSTRAINT IF EXISTS challenge_participants_challenge_id_user_id_company_id_unique`);
    await db.execute(sql`ALTER TABLE challenge_participants DROP CONSTRAINT IF EXISTS chk_status`);
    await db.execute(sql`ALTER TABLE challenge_participants DROP CONSTRAINT IF EXISTS chk_points_awarded`);
    await db.execute(sql`ALTER TABLE badge_definitions DROP CONSTRAINT IF EXISTS badge_definitions_code_key`);
    await db.execute(sql`ALTER TABLE badge_definitions DROP CONSTRAINT IF EXISTS badge_definitions_code_unique`);
    await db.execute(sql`ALTER TABLE employee_badges DROP CONSTRAINT IF EXISTS uniq_employee_badge`);
    await db.execute(sql`ALTER TABLE employee_badges DROP CONSTRAINT IF EXISTS employee_badges_employee_id_badge_id_unique`);

    // 1. Seed two employees
    const [emp1] = await db
      .insert(employeesTable)
      .values({
        name: "Test Employee 1",
        email: "test1@ecolearn.mu",
        clerkUserId: "user_test_1",
        companyId: 1,
        role: "employee",
        enrolledCourses: 0,
        completedCourses: 0,
        certificates: 0,
        learningMinutes: 0,
        avgScore: 0,
      })
      .returning();

    // 2. Seed a test challenge
    const [challenge] = await db
      .insert(challengesTable)
      .values({
        code: "TEST-CH-01",
        slug: "test-challenge",
        title: "Test Challenge",
        summary: "Test summary",
        description: "Test description",
        category: "Waste",
        durationLabel: "1 day",
        points: 10,
        instructions: "Do things.",
        evidencePrompt: "Show things.",
        icon: "zap",
        focus: "Reduce waste",
        startDate: new Date("2025-01-01T00:00:00Z"),
        endDate: new Date("2030-01-01T00:00:00Z"),
      } as any)
      .returning();

    // 3. Seed duplicate challenge participations with varying status/points to consolidate
    // Row A: in_progress, 0 points, older updated_at
    const [cpA] = await db
      .insert(challengeParticipantsTable)
      .values({
        challengeId: challenge.id,
        userId: "user_test_1",
        companyId: 1,
        status: "in_progress",
        pointsAwarded: 0,
        evidenceText: "First draft",
        updatedAt: new Date("2026-01-01T00:00:00Z"),
      } as any)
      .returning();

    // Row B: submitted, 0 points, newer updated_at
    const [cpB] = await db
      .insert(challengeParticipantsTable)
      .values({
        challengeId: challenge.id,
        userId: "user_test_1",
        companyId: 1,
        status: "submitted",
        pointsAwarded: 0,
        evidenceText: "Final submission",
        updatedAt: new Date("2026-02-01T00:00:00Z"),
      } as any)
      .returning();

    // 4. Seed duplicate badge definitions and duplicate employee badge awards to merge
    const [badgeDef1] = await db
      .insert(badgeDefinitionsTable)
      .values({
        code: "TEST_BADGE_CODE",
        slug: "test-badge-1",
        name: "Test Badge 1",
        description: "Test badge 1 desc",
        criteriaType: "all_courses",
        criteriaValue: {},
      } as any)
      .returning();

    const [badgeDef2] = await db
      .insert(badgeDefinitionsTable)
      .values({
        code: "TEST_BADGE_CODE",
        slug: "test-badge-2",
        name: "Test Badge 2",
        description: "Test badge 2 desc",
        criteriaType: "all_courses",
        criteriaValue: {},
      } as any)
      .returning();

    // Earned same badge definition twice
    const [award1] = await db
      .insert(employeeBadgesTable)
      .values({
        employeeId: emp1.id,
        companyId: 1,
        badgeId: badgeDef1.id,
        earnedAt: new Date("2026-01-01T00:00:00Z"),
        awardSource: "course_completion",
      })
      .returning();

    const [award2] = await db
      .insert(employeeBadgesTable)
      .values({
        employeeId: emp1.id,
        companyId: 1,
        badgeId: badgeDef2.id,
        earnedAt: new Date("2026-02-01T00:00:00Z"),
        awardSource: "course_completion",
      })
      .returning();

    // Run repair migration
    await applyRepairMigration();

    // Check challenge participants consolidation
    const cpRows = await db
      .select()
      .from(challengeParticipantsTable)
      .where(eq(challengeParticipantsTable.userId, "user_test_1"));

    assert.equal(cpRows.length, 1, "Duplicate challenge participant rows should be merged into exactly 1 row.");
    assert.equal(cpRows[0].status, "submitted", "Should prefer status 'submitted' over 'in_progress'.");
    assert.equal(cpRows[0].evidenceText, "Final submission", "Should keep latest evidence text.");

    // Check badge definitions consolidation & employee badges repointing
    const badgesCount = await db
      .select()
      .from(employeeBadgesTable)
      .where(eq(employeeBadgesTable.employeeId, emp1.id));

    assert.equal(badgesCount.length, 1, "Duplicate employee badge awards should be consolidated into exactly 1 row.");
    assert.equal(badgesCount[0].earnedAt.toISOString(), new Date("2026-01-01T00:00:00Z").toISOString(), "Should preserve earliest earned date.");

    const remainingDefs = await db
      .select()
      .from(badgeDefinitionsTable)
      .where(eq(badgeDefinitionsTable.code, "TEST_BADGE_CODE"));

    assert.equal(remainingDefs.length, 1, "Duplicate badge definitions should be consolidated into 1 definition.");

    // Cleanup test data
    await db.delete(employeeBadgesTable).where(eq(employeeBadgesTable.employeeId, emp1.id));
    await db.delete(challengeParticipantsTable).where(eq(challengeParticipantsTable.userId, "user_test_1"));
    await db.delete(employeesTable).where(eq(employeesTable.id, emp1.id));
    await db.delete(challengesTable).where(eq(challengesTable.id, challenge.id));
    await db.delete(badgeDefinitionsTable).where(eq(badgeDefinitionsTable.code, "TEST_BADGE_CODE"));
  });

  // SCENARIO 4: Unsafe Data (Ambiguous Orphan reference)
  await t.test("Scenario 4: Detect and block critical orphan data", async () => {
    // Insert a badge award pointing to non-existent employee (orphaned reference)
    // First disable foreign key check temporarily (or insert with raw sql bypassing constraints, 
    // but constraints are already enforced, so we can temporarily insert it or mock verification check)
    // Wait, since pg constraints are now active, we can't insert an invalid employee_id directly using drizzle insert
    // unless we drop constraints, insert, and verify.
    // Instead of dropping constraints, we can verify that if we find an orphaned record, the verifier reports critical.
    // Let's do a raw sql insert bypassing constraints by temporarily disabling constraints or dropping them,
    // or just testing the verifyDatabaseIntegrity logic by mock/stub or simply asserting it.
    // Let's see: we can test if the verifier returns invalid if there's any critical issue.
    // Since constraints prevent orphans, how did orphans arise in production?
    // Because production did NOT have the constraints active!
    // So if we temporarily drop the constraint, insert an orphan, run the verifier, it should report invalid!
    // Let's do that:
    await db.execute(sql`ALTER TABLE employee_badges DROP CONSTRAINT IF EXISTS employee_badges_employee_id_fk`);
    await db.execute(sql`ALTER TABLE employee_badges DROP CONSTRAINT IF EXISTS employee_badges_employee_id_fkey`);
    
    try {
      // Fetch a valid badge definition id to satisfy foreign key
      const badgesList = await db.select({ id: badgeDefinitionsTable.id }).from(badgeDefinitionsTable).limit(1);
      const validBadgeId = badgesList[0]?.id ?? 1;

      // Insert orphan
      await db.execute(sql`
        INSERT INTO employee_badges (employee_id, company_id, badge_id, award_source)
        VALUES (999999, 1, ${validBadgeId}, 'course_completion')
      `);

      const report = await verifyDatabaseIntegrity();
      assert.equal(report.valid, false, "Verifier should report invalid when orphaned records are present.");
      const orphanIssue = report.issues.find(i => i.message.includes("Orphaned employee"));
      assert.ok(orphanIssue, "Should report orphaned employee issue.");

    } finally {
      // Cleanup orphan and restore constraint
      await db.execute(sql`DELETE FROM employee_badges WHERE employee_id = 999999`);
      await db.execute(sql`
        ALTER TABLE employee_badges 
        ADD CONSTRAINT employee_badges_employee_id_fk 
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      `);
    }
  });

  after(async () => {
    await applyRepairMigration();
  });
});
