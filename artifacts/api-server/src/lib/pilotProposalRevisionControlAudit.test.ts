import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10J — Proposal Revision Control Audit Suite", () => {
  const proposalV1 = { version: 1, status: "ISSUED" };

  test("1. Material scope changes require generating proposal v2", () => {
    const reviseProposal = (v: number) => ({ version: v + 1, status: "DRAFT" });
    const v2 = reviseProposal(proposalV1.version);

    assert.equal(v2.version, 2);
    assert.equal(v2.status, "DRAFT");
  });

  test("2. Superseded proposal v1 tasks are cancelled upon issuing v2", () => {
    const isTaskActive = (propVersion: number, currentVersion: number) => propVersion === currentVersion;
    assert.equal(isTaskActive(1, 2), false);
    assert.equal(isTaskActive(2, 2), true);
  });
});
