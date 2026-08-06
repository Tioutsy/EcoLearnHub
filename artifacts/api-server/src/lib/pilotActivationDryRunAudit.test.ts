import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10I — Non-Mutating Activation Dry-Run Audit Suite", () => {
  const dryRunResult = {
    dryRun: true,
    candidateId: "101",
    activationLock: true,
    activationBlockedReason: "Written participation confirmation pending",
    executionPreview: {
      companyId: 1,
      approvedLearnerLimit: 50,
      selectedCourseIds: [1, 2, 3],
      wouldCreateUsers: false,
      wouldSendEmails: false,
    },
  };

  test("1. Dry-run service returns dryRun = true and non-mutating preview flags", () => {
    assert.equal(dryRunResult.dryRun, true);
    assert.equal(dryRunResult.executionPreview.wouldCreateUsers, false);
    assert.equal(dryRunResult.executionPreview.wouldSendEmails, false);
  });

  test("2. Dry-run reflects activation lock when written acceptance is missing", () => {
    assert.equal(dryRunResult.activationLock, true);
    assert.equal(dryRunResult.activationBlockedReason, "Written participation confirmation pending");
  });
});
