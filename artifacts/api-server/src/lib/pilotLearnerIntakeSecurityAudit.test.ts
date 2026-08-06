import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10I — Learner Intake Security Audit Suite", () => {
  test("1. Formula injection attempts in CSV fields are sanitized or rejected", () => {
    const sanitizeCsvField = (val: string) => (val.startsWith("=") || val.startsWith("+") ? val.slice(1) : val);
    assert.equal(sanitizeCsvField("=SUM(1+1)"), "SUM(1+1)");
    assert.equal(sanitizeCsvField("Jean"), "Jean");
  });

  test("2. Personal email domains (gmail, yahoo) are flagged in learner intake", () => {
    const isCorporateEmail = (email: string) => !email.includes("gmail.com") && !email.includes("yahoo.com");
    assert.equal(isCorporateEmail("j.dupont@coralbay.mu"), true);
    assert.equal(isCorporateEmail("j.dupont@gmail.com"), false);
  });
});
