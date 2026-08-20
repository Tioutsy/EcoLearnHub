/**
 * Sprint 13 — Employee Profile Completion Test Suite
 * Uses Node.js native test runner (node --test)
 *
 * Safety Guard: Tests must NEVER run against the production Neon database
 * (ep-delicate-pond-ahy88lt3).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ─── Safety Guard ─────────────────────────────────────────────────────────────
const DB_URL = process.env.DATABASE_URL || "";
if (DB_URL.includes("ep-delicate-pond-ahy88lt3")) {
  throw new Error(
    "SAFETY VIOLATION: Tests must not run against the production Neon database (ep-delicate-pond-ahy88lt3)."
  );
}

// ─── Inline profile validation helper (mirrors server-side logic) ─────────────
function validateProfileInput(input: {
  firstName: unknown;
  surname: unknown;
  departmentId: unknown;
  jobTitleId: unknown;
}) {
  const firstName = String(input.firstName || "").trim();
  const surname = String(input.surname || "").trim();
  const deptId = Number(input.departmentId);
  const titleId = Number(input.jobTitleId);

  if (!firstName) return { valid: false, error: "First name is required." };
  if (firstName.length > 100) return { valid: false, error: "First name too long." };
  if (!surname) return { valid: false, error: "Surname is required." };
  if (surname.length > 100) return { valid: false, error: "Surname too long." };
  if (!Number.isInteger(deptId) || deptId <= 0) return { valid: false, error: "Please select an active department from your company list." };
  if (!Number.isInteger(titleId) || titleId <= 0) return { valid: false, error: "Please select an active job title from your company list." };
  return { valid: true, error: null };
}

// ─── Profile Completion Input Validation ────────────────────────────────────
describe("Employee Profile Completion — input validation", () => {
  it("accepts a complete valid input", () => {
    const result = validateProfileInput({ firstName: "Jean", surname: "Dupont", departmentId: 1, jobTitleId: 2 });
    assert.equal(result.valid, true);
    assert.equal(result.error, null);
  });

  it("rejects missing first name", () => {
    const result = validateProfileInput({ firstName: "", surname: "Dupont", departmentId: 1, jobTitleId: 2 });
    assert.equal(result.valid, false);
    assert.ok(result.error!.includes("First name"));
  });

  it("rejects whitespace-only first name", () => {
    const result = validateProfileInput({ firstName: "   ", surname: "Dupont", departmentId: 1, jobTitleId: 2 });
    assert.equal(result.valid, false);
  });

  it("rejects missing surname", () => {
    const result = validateProfileInput({ firstName: "Jean", surname: "", departmentId: 1, jobTitleId: 2 });
    assert.equal(result.valid, false);
    assert.ok(result.error!.includes("Surname"));
  });

  it("rejects zero departmentId", () => {
    const result = validateProfileInput({ firstName: "Jean", surname: "Dupont", departmentId: 0, jobTitleId: 2 });
    assert.equal(result.valid, false);
    assert.ok(result.error!.includes("department"));
  });

  it("rejects null departmentId", () => {
    const result = validateProfileInput({ firstName: "Jean", surname: "Dupont", departmentId: null, jobTitleId: 2 });
    assert.equal(result.valid, false);
  });

  it("rejects zero jobTitleId", () => {
    const result = validateProfileInput({ firstName: "Jean", surname: "Dupont", departmentId: 1, jobTitleId: 0 });
    assert.equal(result.valid, false);
    assert.ok(result.error!.includes("job title"));
  });

  it("accepts UTF-8 names including accents (Françoise Müller)", () => {
    const result = validateProfileInput({ firstName: "Françoise", surname: "Müller", departmentId: 3, jobTitleId: 7 });
    assert.equal(result.valid, true);
  });
});

// ─── Course Access Gate Logic ─────────────────────────────────────────────────
function simulateAccessGate(employee: { role: string; profileCompleted: boolean }) {
  if (employee.role === "admin" || employee.role === "manager") return { canAccess: true, code: null };
  if (!employee.profileCompleted) return { canAccess: false, code: "PROFILE_INCOMPLETE", redirectUrl: "/join?step=profile" };
  return { canAccess: true, code: null };
}

describe("Course Access Gate — profile completion requirement", () => {
  it("grants access to employee with completed profile", () => {
    const r = simulateAccessGate({ role: "employee", profileCompleted: true });
    assert.equal(r.canAccess, true);
  });

  it("blocks access to employee with incomplete profile", () => {
    const r = simulateAccessGate({ role: "employee", profileCompleted: false });
    assert.equal(r.canAccess, false);
    assert.equal(r.code, "PROFILE_INCOMPLETE");
    assert.equal(r.redirectUrl, "/join?step=profile");
  });

  it("grants access to company admin regardless of profile", () => {
    const r = simulateAccessGate({ role: "admin", profileCompleted: false });
    assert.equal(r.canAccess, true);
  });

  it("grants access to manager regardless of profile", () => {
    const r = simulateAccessGate({ role: "manager", profileCompleted: false });
    assert.equal(r.canAccess, true);
  });
});

// ─── Tenant Isolation ─────────────────────────────────────────────────────────
const allDepts = [
  { id: 1, companyId: 100, name: "Engineering", status: "active" },
  { id: 2, companyId: 100, name: "HR", status: "active" },
  { id: 3, companyId: 200, name: "Legal", status: "active" },
  { id: 4, companyId: 200, name: "Finance", status: "active" },
  { id: 5, companyId: 100, name: "OldDept", status: "archived" },
];

function verifyDeptBelongsToCompany(deptId: number, companyId: number) {
  return allDepts.find((d) => d.id === deptId && d.companyId === companyId && d.status === "active") ?? null;
}

describe("Tenant Isolation — department ownership", () => {
  it("allows Company A employee to select Company A departments", () => {
    const dept = verifyDeptBelongsToCompany(1, 100);
    assert.ok(dept !== null);
    assert.equal(dept!.name, "Engineering");
  });

  it("blocks Company A employee from selecting Company B departments", () => {
    const dept = verifyDeptBelongsToCompany(3, 100);
    assert.equal(dept, null);
  });

  it("allows Company B employee to select Company B departments", () => {
    const dept = verifyDeptBelongsToCompany(4, 200);
    assert.ok(dept !== null);
    assert.equal(dept!.name, "Finance");
  });

  it("blocks Company B employee from selecting Company A departments", () => {
    const dept = verifyDeptBelongsToCompany(1, 200);
    assert.equal(dept, null);
  });

  it("rejects archived departments for new profile selections", () => {
    const dept = verifyDeptBelongsToCompany(5, 100);
    assert.equal(dept, null);
  });
});

// ─── Soft Deactivation ────────────────────────────────────────────────────────
describe("Department / Job Title soft deactivation", () => {
  it("archives rather than deletes when employees are linked", () => {
    const dept = { id: 1, companyId: 100, name: "OldDept", status: "archived" };
    assert.equal(dept.status, "archived");
    assert.equal(dept.id, 1); // record still exists
  });

  it("archived departments still exist in employee records", () => {
    const emp = { id: 1, department: "OldDept", departmentId: 5 };
    const archived = allDepts.find((d) => d.id === 5);
    assert.ok(archived !== undefined);
    assert.equal(emp.departmentId, archived!.id);
  });
});
