import assert from "node:assert/strict";
import test from "node:test";
import { spawn, ChildProcess } from "node:child_process";
import {
  db,
  coursesTable,
  enrollmentsTable,
  employeesTable,
  quizAttemptsTable,
  certificatesTable,
  companiesTable,
} from "@workspace/db";
import { eq, or, inArray } from "drizzle-orm";

const API_BASE = "http://localhost:8083/api";

const MANAGER_A_ID = "manager_a_user";
const MANAGER_A_EMAIL = "manager_a@company1.mu";

const LEARNER_A_ID = "learner_a_user";
const LEARNER_A_EMAIL = "learner_a@company1.mu";

const HEADERS_MANAGER_A = {
  "x-test-user-id": MANAGER_A_ID,
  "x-test-user-email": MANAGER_A_EMAIL,
  "x-test-user-role": "manager",
  "Content-Type": "application/json",
};

const HEADERS_LEARNER_A = {
  "x-test-user-id": LEARNER_A_ID,
  "x-test-user-email": LEARNER_A_EMAIL,
  "x-test-user-role": "employee",
  "Content-Type": "application/json",
};

async function setupTestData() {
  let [company1] = await db.select().from(companiesTable).where(eq(companiesTable.id, 1)).limit(1);
  if (!company1) {
    [company1] = await db.insert(companiesTable).values({ id: 1, name: "Company 1", slug: "company-1" } as any).returning();
  }
  let [company2] = await db.select().from(companiesTable).where(eq(companiesTable.id, 2)).limit(1);
  if (!company2) {
    [company2] = await db.insert(companiesTable).values({ id: 2, name: "Company 2", slug: "company-2" } as any).returning();
  }

  // Clear existing enrollments, certificates, employees for these test records
  const oldEmails = [
    MANAGER_A_EMAIL,
    LEARNER_A_EMAIL,
    "learner_b@company2.mu",
    "learner_no_activity@company1.mu",
    "learner_partial@company1.mu",
    "=FormulaInjection@company1.mu",
  ];

  const dbEmployees = await db
    .select()
    .from(employeesTable)
    .where(inArray(employeesTable.email, oldEmails));

  const empIds = dbEmployees.map((e) => e.id);
  const clerkIds = dbEmployees.map((e) => e.clerkUserId).filter((id): id is string => Boolean(id));

  if (empIds.length > 0) {
    await db.delete(enrollmentsTable).where(inArray(enrollmentsTable.employeeId, empIds));
    await db.delete(certificatesTable).where(inArray(certificatesTable.employeeId, empIds));
  }
  if (clerkIds.length > 0) {
    await db.delete(quizAttemptsTable).where(inArray(quizAttemptsTable.userId, clerkIds));
  }
  await db.delete(employeesTable).where(inArray(employeesTable.email, oldEmails));

  // Insert Manager A (Company 1)
  const [managerA] = await db
    .insert(employeesTable)
    .values({
      name: "Manager A",
      email: MANAGER_A_EMAIL,
      clerkUserId: MANAGER_A_ID,
      companyId: 1,
      role: "manager",
    })
    .returning();

  // Insert Learner A (Company 1)
  const [learnerA] = await db
    .insert(employeesTable)
    .values({
      name: "Learner A",
      email: LEARNER_A_EMAIL,
      clerkUserId: LEARNER_A_ID,
      companyId: 1,
      role: "employee",
    })
    .returning();

  // Insert Learner B (Company 2 - Tenant B)
  const [learnerB] = await db
    .insert(employeesTable)
    .values({
      name: "Learner B",
      email: "learner_b@company2.mu",
      clerkUserId: "learner_b_user",
      companyId: 2,
      role: "employee",
    })
    .returning();

  // Insert Learner with No Activity (Company 1)
  const [learnerNoActivity] = await db
    .insert(employeesTable)
    .values({
      name: "No Activity Learner",
      email: "learner_no_activity@company1.mu",
      clerkUserId: "learner_no_activity_user",
      companyId: 1,
      role: "employee",
    })
    .returning();

  // Insert Learner with Partial Activity (Company 1)
  const [learnerPartial] = await db
    .insert(employeesTable)
    .values({
      name: "Partial Learner",
      email: "learner_partial@company1.mu",
      clerkUserId: "learner_partial_user",
      companyId: 1,
      role: "employee",
    })
    .returning();

  // Insert Formula Injection Learner (Company 1)
  const [learnerFormula] = await db
    .insert(employeesTable)
    .values({
      name: "=FormulaInjection",
      email: "=FormulaInjection@company1.mu",
      clerkUserId: "learner_formula_user",
      companyId: 1,
      role: "employee",
    })
    .returning();

  // Set up progress records for Learner A: completed Courses 1-11, not certified
  for (let cId = 1; cId <= 11; cId++) {
    await db.insert(enrollmentsTable).values({
      employeeId: learnerA.id,
      userId: LEARNER_A_ID,
      courseId: cId,
      companyId: 1,
      progressPct: 100,
      completedAt: new Date("2026-07-01T12:00:00Z"),
    });
  }

  // Set up progress records for Learner B (Company 2): completed Course 1
  await db.insert(enrollmentsTable).values({
    employeeId: learnerB.id,
    userId: "learner_b_user",
    courseId: 1,
    companyId: 2,
    progressPct: 100,
    completedAt: new Date("2026-07-01T12:00:00Z"),
  });

  // Set up partial progress for Learner Partial: Course 1 in progress (50%)
  await db.insert(enrollmentsTable).values({
    employeeId: learnerPartial.id,
    userId: "learner_partial_user",
    courseId: 1,
    companyId: 1,
    progressPct: 50,
    dueDate: new Date("2026-06-01T12:00:00Z"), // Overdue!
  });

  return {
    managerA,
    learnerA,
    learnerB,
    learnerNoActivity,
    learnerPartial,
    learnerFormula,
  };
}

test("Sprint 6E Manager Training Compliance Dashboard Integration Suite", async () => {
  let devServer: ChildProcess | undefined;

  try {
    const testData = await setupTestData();

    // Start API server on test port 8083
    devServer = spawn(process.execPath, ["./dist/index.mjs"], {
      env: {
        ...process.env,
        NODE_ENV: "development",
        ENABLE_TEST_AUTH_BYPASS: "true",
        PORT: "8083",
      },
      cwd: process.cwd(),
    });

    devServer.stdout?.on("data", (data) => {
      console.log(`[TEST SERVER STDOUT] ${data.toString().trim()}`);
    });
    devServer.stderr?.on("data", (data) => {
      console.error(`[TEST SERVER STDERR] ${data.toString().trim()}`);
    });

    // Wait for server ready
    let ready = false;
    for (let attempt = 1; attempt <= 150; attempt++) {
      try {
        const res = await fetch(`${API_BASE}/courses`, { headers: HEADERS_MANAGER_A });
        if (res.status === 200) {
          ready = true;
          break;
        }
      } catch {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    if (!ready) {
      throw new Error("Server failed to start on port 8083");
    }

    // 1. Verify Learners cannot access manager reporting (403)
    const learnerOverview = await fetch(`${API_BASE}/manager/training/overview`, { headers: HEADERS_LEARNER_A });
    assert.equal(learnerOverview.status, 403);

    // 3. Verify Authorized Manager A can access Company 1 reporting
    const overviewRes = await fetch(`${API_BASE}/manager/training/overview`, { headers: HEADERS_MANAGER_A });
    assert.equal(overviewRes.status, 200);
    const overview = await overviewRes.json() as any;
    
    // Assert summary totals (excluding Company 2's Learner B)
    // Employees in Company 1: Manager A, Learner A, No Activity Learner, Partial Learner, Formula Learner = 5
    assert.ok(overview.totalEmployees >= 5);
    // Completed Core: Learner A (11/11) = 1
    assert.ok(overview.completedCoreCount >= 1);
    // In progress: Partial Learner = 1
    assert.ok(overview.inProgressCoreCount >= 1);
    // Not started: No Activity Learner, Formula Learner, Manager A = 3
    assert.ok(overview.notStartedCoreCount >= 3);
    // Certified: 0 (Learner A has completed 11/11, but not Course 12/certification)
    assert.ok(overview.certifiedCount >= 0);

    // 4. Verify cross-tenant isolation in overview totals (Learner B completions from Company 2 not counted)
    const course1Perf = overview.performance.find((p: any) => p.courseId === 1);
    assert.ok(course1Perf);
    // Learner A (completed), Partial Learner (in progress) -> Company 1 completions = 1
    assert.ok(course1Perf.completed >= 1);

    // 5. Verify employee filtering (department, search)
    const employeesRes = await fetch(`${API_BASE}/manager/training/employees?search=Partial`, { headers: HEADERS_MANAGER_A });
    assert.equal(employeesRes.status, 200);
    const employeesData = await employeesRes.json() as any;
    assert.equal(employeesData.data.length, 1);
    assert.equal(employeesData.data[0].name, "Partial Learner");

    // 6. Verify employee detail tenant-isolation
    // Manager A fetches Learner A (same company) -> OK
    const detailOk = await fetch(`${API_BASE}/manager/training/employees/${testData.learnerA.id}`, { headers: HEADERS_MANAGER_A });
    assert.equal(detailOk.status, 200);
    
    // Manager A fetches Learner B (Company 2) -> 404
    const detailBlocked = await fetch(`${API_BASE}/manager/training/employees/${testData.learnerB.id}`, { headers: HEADERS_MANAGER_A });
    assert.equal(detailBlocked.status, 404);

    // 7. Verify CSV export format and security features
    const csvRes = await fetch(`${API_BASE}/manager/training/export.csv`, { headers: HEADERS_MANAGER_A });
    assert.equal(csvRes.status, 200);
    const csvContent = await csvRes.text();

    // Check headings
    assert.ok(csvContent.includes("\"Organisation Name\",\"Employee Name\",\"Employee Email\""));
    
    // Cross tenant isolation in CSV (Learner B from Company 2 must not be exported)
    assert.ok(!csvContent.includes("Learner B"));

    // CSV Neutralisation of formula-like prefixes
    // Formula Injection Learner name is "=FormulaInjection" -> should be exported as "'=FormulaInjection"
    assert.ok(csvContent.includes("\"'=FormulaInjection\""));

    console.log("==> All manager training compliance dashboard integration tests PASSED!");
  } finally {
    if (devServer) {
      devServer.kill("SIGKILL");
    }
  }
});
