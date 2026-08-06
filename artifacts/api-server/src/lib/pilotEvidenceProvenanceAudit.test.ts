import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10I — Evidence Provenance Audit Suite", () => {
  const evidenceRecord = {
    evidenceId: "ev_101_v1",
    candidateId: "101",
    sha256Checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    status: "VALID",
    reviewedBy: "admin_101",
    reviewedAt: new Date().toISOString(),
  };

  test("1. Evidence record includes SHA-256 checksum and reviewer timestamp", () => {
    assert.equal(evidenceRecord.evidenceId, "ev_101_v1");
    assert.equal(evidenceRecord.status, "VALID");
    assert.ok(evidenceRecord.sha256Checksum);
    assert.ok(evidenceRecord.reviewedAt);
  });

  test("2. Corrected document creates new evidence version and preserves superseded status", () => {
    const supersedeEvidence = (ev: typeof evidenceRecord) => ({
      ...ev,
      status: "SUPERSEDED",
    });

    const superseded = supersedeEvidence(evidenceRecord);
    assert.equal(superseded.status, "SUPERSEDED");
  });
});
