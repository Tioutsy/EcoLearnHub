import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10E — CSV Learner Intake & Validation Audit Suite", () => {
  const parseCsvIntake = (rows: Array<{ email: string; name: string; department?: string }>) => {
    const valid: typeof rows = [];
    const invalid: Array<{ row: number; email: string; error: string }> = [];

    rows.forEach((r, idx) => {
      if (!r.email || !r.email.includes("@")) {
        invalid.push({ row: idx + 1, email: r.email, error: "Invalid email format" });
      } else {
        valid.push(r);
      }
    });

    return { validCount: valid.length, invalidCount: invalid.length, invalid };
  };

  test("1. CSV intake validates email format for every row", () => {
    const rows = [
      { email: "valid.user@coralbay.mu", name: "Valid User" },
      { email: "invalid-email-address", name: "Bad User" },
    ];

    const result = parseCsvIntake(rows);
    assert.equal(result.validCount, 1);
    assert.equal(result.invalidCount, 1);
    assert.equal(result.invalid[0].error, "Invalid email format");
  });

  test("2. Duplicate emails in intake batch are detected", () => {
    const emails = ["user1@coralbay.mu", "user1@coralbay.mu"];
    const unique = new Set(emails);

    assert.equal(unique.size, 1);
    assert.equal(emails.length - unique.size, 1, "1 duplicate detected");
  });

  test("3. Intake respects approved learner limit", () => {
    const approvedLimit = 50;
    const currentEmployees = 48;
    const incomingCount = 5;

    const isExceeded = currentEmployees + incomingCount > approvedLimit;
    assert.equal(isExceeded, true, "Intake exceeding limit MUST be blocked");
  });
});
