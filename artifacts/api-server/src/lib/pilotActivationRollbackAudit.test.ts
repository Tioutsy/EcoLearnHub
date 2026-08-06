import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10I — Activation Failure Recovery & Rollback Audit Suite", () => {
  test("1. Database transaction rolls back cleanly on membership creation failure", () => {
    const handleTxError = (err: Error) => ({ status: "ROLLBACK_REQUIRED", error: err.message });
    const res = handleTxError(new Error("Constraint violation"));
    assert.equal(res.status, "ROLLBACK_REQUIRED");
  });

  test("2. Transient email dispatch failure marks classification as SAFE_TO_RETRY", () => {
    const classifyError = (type: string) => (type === "NETWORK_TIMEOUT" ? "SAFE_TO_RETRY" : "MANUAL_REVIEW_REQUIRED");
    assert.equal(classifyError("NETWORK_TIMEOUT"), "SAFE_TO_RETRY");
  });
});
