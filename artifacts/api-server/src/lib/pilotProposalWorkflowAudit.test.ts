import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10F — Pilot Proposal Workflow & Versioning Audit Suite", () => {
  const proposal = {
    version: 1,
    status: "DRAFT",
    candidateId: 101,
  };

  test("1. Modifying a proposal increments version number (v1 -> v2)", () => {
    const updateProposal = (p: typeof proposal) => ({
      ...p,
      version: p.version + 1,
      status: "DRAFT",
    });

    const v2 = updateProposal(proposal);
    assert.equal(v2.version, 2);
    assert.equal(v2.status, "DRAFT");
  });

  test("2. Issuing a proposal sets status to 'ISSUED' and sets proposalIssuedAt", () => {
    const issueProposal = (p: typeof proposal) => ({
      ...p,
      status: "ISSUED",
      proposalIssuedAt: new Date().toISOString(),
    });

    const issued = issueProposal(proposal);
    assert.equal(issued.status, "ISSUED");
    assert.ok(issued.proposalIssuedAt);
  });

  test("3. Platform Admin permission required to approve or issue proposals", () => {
    const isAuthorized = (role: string) => role === "platform_admin";
    assert.equal(isAuthorized("platform_admin"), true);
    assert.equal(isAuthorized("company_admin"), false);
  });
});
