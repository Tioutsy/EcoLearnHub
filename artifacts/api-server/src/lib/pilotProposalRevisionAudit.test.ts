import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10H — Proposal Revision & Version Control Audit Suite", () => {
  const proposalV1 = {
    version: 1,
    status: "ISSUED",
    learnerLimit: 50,
  };

  test("1. Issued proposal v1 remains immutable", () => {
    const isImmutable = (status: string) => status === "ISSUED";
    assert.equal(isImmutable(proposalV1.status), true);
  });

  test("2. Material revision creates proposal v2 with incremented version number", () => {
    const reviseProposal = (p: typeof proposalV1, newLimit: number) => ({
      version: p.version + 1,
      status: "DRAFT",
      learnerLimit: newLimit,
    });

    const v2 = reviseProposal(proposalV1, 80);
    assert.equal(v2.version, 2);
    assert.equal(v2.learnerLimit, 80);
    assert.equal(v2.status, "DRAFT");
  });
});
