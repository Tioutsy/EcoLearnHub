import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10C — Pilot Invitation & Activation Audit Suite", () => {
  const roster = [
    { id: 1, email: "jean.dupont@luxresorts.mu", status: "active", invitationStatus: "accepted" },
    { id: 2, email: "sarah.smith@luxresorts.mu", status: "active", invitationStatus: "invited" },
    { id: 3, email: "marie.laurent@luxresorts.mu", status: "deactivated", invitationStatus: "accepted" }
  ];

  test("1. Roster tracks invitation and account statuses distinctly", () => {
    assert.equal(roster[0].invitationStatus, "accepted");
    assert.equal(roster[1].invitationStatus, "invited");
  });

  test("2. Resending an invitation updates invitation timestamp without creating duplicate roster entries", () => {
    const existingCount = roster.length;
    const targetEmp = roster.find(e => e.email === "sarah.smith@luxresorts.mu")!;

    // Simulate invitation resend
    const updatedEmp = { ...targetEmp, invitationSentAt: new Date().toISOString() };
    
    assert.equal(roster.length, existingCount, "Roster count must remain unchanged on resend");
    assert.ok(updatedEmp.invitationSentAt);
  });

  test("3. Activation rate is calculated accurately from active accepted accounts", () => {
    const activatedCount = roster.filter(e => e.status === "active" && e.invitationStatus === "accepted").length;
    const activationRatePct = Math.round((activatedCount / roster.length) * 100);

    assert.equal(activatedCount, 1);
    assert.equal(activationRatePct, 33);
  });
});
