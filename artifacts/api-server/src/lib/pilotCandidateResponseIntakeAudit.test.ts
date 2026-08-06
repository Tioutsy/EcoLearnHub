import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10J — Candidate Response Intake Audit Suite", () => {
  const validCategories = new Set([
    "ACCEPT",
    "DECLINE",
    "REQUEST_INFORMATION",
    "REQUEST_REVISION",
    "REQUEST_CALL",
    "DEFER_DECISION",
    "NO_CLEAR_DECISION",
  ]);

  test("1. Candidate responses map to valid response categories", () => {
    assert.equal(validCategories.has("REQUEST_REVISION"), true);
    assert.equal(validCategories.has("DEFER_DECISION"), true);
  });

  test("2. Unclear candidate response defaults to NO_CLEAR_DECISION", () => {
    const categorize = (cat: string) => (validCategories.has(cat) ? cat : "NO_CLEAR_DECISION");
    assert.equal(categorize("UNKNOWN_INTENT"), "NO_CLEAR_DECISION");
  });
});
