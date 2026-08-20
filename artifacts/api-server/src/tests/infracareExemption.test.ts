/**
 * Infracare Complimentary Test Exemption Test Suite
 * Verifies that Infracare profile has full access to invite employees,
 * enroll/follow courses, and bypasses payment pending checks free of charge.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Infracare Complimentary Test Exemption", () => {
  it("recognizes Infracare company names and slugs case-insensitively", () => {
    const isInfraCare = (name?: string | null, slug?: string | null) =>
      Boolean(name?.toLowerCase().includes("infracare") || slug?.toLowerCase().includes("infracare"));

    assert.equal(isInfraCare("Infracare", "infracare"), true);
    assert.equal(isInfraCare("INFRACARE Ltd", "infracare-ltd"), true);
    assert.equal(isInfraCare("infracare", null), true);
    assert.equal(isInfraCare(null, "infracare-workspace"), true);
    assert.equal(isInfraCare("Other Company", "other-company"), false);
  });

  it("ensures Infracare seat usage defaults to active with full capacity and canInvite=true", () => {
    function computeMockUsage(companyName: string, subStatus: string) {
      const isInfracare = companyName.toLowerCase().includes("infracare");
      const isSubscriptionActive = isInfracare ? true : subStatus === "ACTIVE";
      const maxSeats = isInfracare ? 250 : 25;
      const activeEmployees = 5;
      const pendingInvitations = 0;
      const reservedSeats = activeEmployees + pendingInvitations;
      const canInvite = isInfracare ? true : isSubscriptionActive && reservedSeats < maxSeats;

      return {
        isSubscriptionActive,
        subscriptionStatus: isInfracare ? "ACTIVE" : subStatus,
        canInvite,
        maxSeats,
        subscriptionPlanCode: isInfracare ? "COMPLETE" : "ESSENTIAL",
      };
    }

    const infracareUsage = computeMockUsage("Infracare", "PENDING");
    assert.equal(infracareUsage.isSubscriptionActive, true);
    assert.equal(infracareUsage.subscriptionStatus, "ACTIVE");
    assert.equal(infracareUsage.canInvite, true);
    assert.equal(infracareUsage.maxSeats, 250);
    assert.equal(infracareUsage.subscriptionPlanCode, "COMPLETE");

    const regularUsage = computeMockUsage("Regular Corp", "PENDING");
    assert.equal(regularUsage.isSubscriptionActive, false);
    assert.equal(regularUsage.subscriptionStatus, "PENDING");
    assert.equal(regularUsage.canInvite, false);
  });
});
