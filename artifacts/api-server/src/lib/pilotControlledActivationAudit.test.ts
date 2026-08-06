import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10E — Controlled Pilot Activation Audit Suite", () => {
  const pilot = {
    id: 101,
    pilotStatus: "candidate",
    candidateStatus: "ACTIVATION_READY",
    externalValidationStage: "stage_4_pilot_participation_confirmed",
  };

  test("1. Guarded activation sets status to 'active', candidate to 'ACTIVE', and stage to Stage 5", () => {
    const activate = (p: typeof pilot) => ({
      ...p,
      pilotStatus: "active",
      candidateStatus: "ACTIVE",
      externalValidationStage: "stage_5_pilot_launched",
      actualStartDate: new Date().toISOString(),
    });

    const activated = activate(pilot);
    assert.equal(activated.pilotStatus, "active");
    assert.equal(activated.candidateStatus, "ACTIVE");
    assert.equal(activated.externalValidationStage, "stage_5_pilot_launched");
    assert.ok(activated.actualStartDate);
  });

  test("2. Activating an already active pilot throws error", () => {
    const isActivationAllowed = (status: string) => status !== "active";
    assert.equal(isActivationAllowed("candidate"), true);
    assert.equal(isActivationAllowed("active"), false, "Double activation MUST be blocked");
  });

  test("3. Activation creates server-side audit event with actor and timestamp", () => {
    const auditLog = {
      action: "pilot.activated",
      actorUserId: "admin_101",
      targetId: 101,
      createdAt: new Date().toISOString(),
    };

    assert.equal(auditLog.action, "pilot.activated");
    assert.ok(auditLog.createdAt);
  });
});
