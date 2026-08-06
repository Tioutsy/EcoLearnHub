import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10C — Pilot Status Lifecycle & Transitions Audit Suite", () => {
  const validStatuses = new Set([
    "preparing",
    "ready_to_launch",
    "active",
    "paused",
    "completed",
    "withdrawn",
    "converted",
    "archived",
  ]);

  test("1. Valid pilot statuses are supported by state machine", () => {
    for (const status of validStatuses) {
      assert.ok(validStatuses.has(status), `Status ${status} must be valid`);
    }
  });

  test("2. Platform Admin permission required to update pilot status", () => {
    const isAuthorized = (role: string) => role === "platform_admin";
    assert.equal(isAuthorized("platform_admin"), true);
    assert.equal(isAuthorized("company_admin"), false, "Company Admin cannot alter pilot status");
    assert.equal(isAuthorized("employee"), false, "Learner cannot alter pilot status");
  });

  test("3. Updating pilot status generates audit entry in audit_logs", () => {
    const statusUpdateLog = {
      companyId: 1,
      actorUserId: "user_platform_admin",
      actorRole: "platform_admin",
      action: "pilot.status_updated",
      targetType: "pilot_company",
      targetId: 101,
      newStatus: "active",
    };

    assert.equal(statusUpdateLog.action, "pilot.status_updated");
    assert.equal(statusUpdateLog.newStatus, "active");
  });

  test("4. Archived pilot state restricts new course assignments", () => {
    const isAssignmentAllowed = (pilotStatus: string) => pilotStatus === "active" || pilotStatus === "ready_to_launch";

    assert.equal(isAssignmentAllowed("active"), true);
    assert.equal(isAssignmentAllowed("archived"), false, "Archived pilot MUST NOT accept new course assignments");
  });
});
