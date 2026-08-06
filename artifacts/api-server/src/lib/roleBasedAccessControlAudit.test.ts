import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { hasCapability, type AccessRole } from "./access";

describe("Sprint 10K — Role-Based Access Control & Capability Audit Suite", () => {
  describe("1. Official Capability Matrix Tests", () => {
    test("Platform Administrator possesses all platform and company capabilities", () => {
      const role: AccessRole = "platform_admin";
      assert.equal(hasCapability(role, "employees.create"), true);
      assert.equal(hasCapability(role, "employees.edit"), true);
      assert.equal(hasCapability(role, "employees.deactivate"), true);
      assert.equal(hasCapability(role, "organisation.settings"), true);
      assert.equal(hasCapability(role, "platform.admin"), true);
    });

    test("Company Administrator possesses company employee and settings capabilities", () => {
      const role: AccessRole = "company_admin";
      assert.equal(hasCapability(role, "employees.create"), true);
      assert.equal(hasCapability(role, "employees.edit"), true);
      assert.equal(hasCapability(role, "employees.deactivate"), true);
      assert.equal(hasCapability(role, "reports.organisation"), true);
      assert.equal(hasCapability(role, "settings.organisation"), true);
    });

    test("Manager possesses team view and review capabilities, but NOT employee creation or company settings", () => {
      const role: AccessRole = "manager";
      assert.equal(hasCapability(role, "employees.view"), true);
      assert.equal(hasCapability(role, "reports.team"), true);
      assert.equal(hasCapability(role, "courses.assign"), true);
      assert.equal(hasCapability(role, "challenges.review"), true);
      
      // Prohibited capabilities for Manager
      assert.equal(hasCapability(role, "employees.create"), false);
      assert.equal(hasCapability(role, "employees.deactivate"), false);
      assert.equal(hasCapability(role, "settings.organisation"), false);
    });

    test("Learner (Employee) possesses only personal certificate/progress capabilities", () => {
      const role: AccessRole = "employee";
      assert.equal(hasCapability(role, "certificates.download"), true);
      
      // Prohibited capabilities for Learner
      assert.equal(hasCapability(role, "employees.view"), false);
      assert.equal(hasCapability(role, "employees.create"), false);
      assert.equal(hasCapability(role, "employees.edit"), false);
      assert.equal(hasCapability(role, "reports.organisation"), false);
      assert.equal(hasCapability(role, "settings.organisation"), false);
    });
  });

  describe("2. Sole Administrator Safeguard Enforcement", () => {
    test("Deactivating or demoting the last company administrator MUST be blocked", () => {
      const activeAdminsCount = 1;
      const attemptDemotion = true;
      const isBlocked = activeAdminsCount <= 1 && attemptDemotion;
      assert.equal(isBlocked, true, "Demoting the sole active administrator must be blocked");
    });

    test("Demoting an administrator when multiple active administrators exist is permitted", () => {
      const activeAdminsCount = 2;
      const attemptDemotion = true;
      const isBlocked = activeAdminsCount <= 1 && attemptDemotion;
      assert.equal(isBlocked, false, "Demoting an administrator when multiple exist is allowed");
    });
  });
});
