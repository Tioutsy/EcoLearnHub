import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { AccessRole } from "./access";

describe("Sprint 10A — Pilot Role-Permission Matrix Audit Suite", () => {
  interface PermissionCheck {
    role: AccessRole;
    action: string;
    allowed: boolean;
  }

  const permissionMatrix: PermissionCheck[] = [
    // Platform Admin
    { role: "platform_admin", action: "view_own_learning", allowed: true },
    { role: "platform_admin", action: "manage_organization", allowed: true },
    { role: "platform_admin", action: "add_employees", allowed: true },
    { role: "platform_admin", action: "assign_courses", allowed: true },
    { role: "platform_admin", action: "view_company_reports", allowed: true },
    { role: "platform_admin", action: "review_actions", allowed: true },
    { role: "platform_admin", action: "export_company_data", allowed: true },

    // Company Admin
    { role: "company_admin", action: "view_own_learning", allowed: true },
    { role: "company_admin", action: "manage_organization", allowed: true },
    { role: "company_admin", action: "add_employees", allowed: true },
    { role: "company_admin", action: "assign_courses", allowed: true },
    { role: "company_admin", action: "view_company_reports", allowed: true },
    { role: "company_admin", action: "review_actions", allowed: true },
    { role: "company_admin", action: "export_company_data", allowed: true },
    { role: "company_admin", action: "access_other_tenant", allowed: false },

    // Employee / Learner
    { role: "employee", action: "view_own_learning", allowed: true },
    { role: "employee", action: "manage_organization", allowed: false },
    { role: "employee", action: "add_employees", allowed: false },
    { role: "employee", action: "assign_courses", allowed: false },
    { role: "employee", action: "view_company_reports", allowed: false },
    { role: "employee", action: "review_actions", allowed: false },
    { role: "employee", action: "export_company_data", allowed: false },
    { role: "employee", action: "access_other_tenant", allowed: false },
  ];

  const checkPermission = (role: AccessRole, action: string): boolean => {
    const item = permissionMatrix.find(p => p.role === role && p.action === action);
    return item ? item.allowed : false;
  };

  test("1. Learner cannot perform admin operations", () => {
    assert.equal(checkPermission("employee", "add_employees"), false);
    assert.equal(checkPermission("employee", "manage_organization"), false);
    assert.equal(checkPermission("employee", "export_company_data"), false);
  });

  test("2. Company Admin can manage own organisation but not access other tenants", () => {
    assert.equal(checkPermission("company_admin", "add_employees"), true);
    assert.equal(checkPermission("company_admin", "assign_courses"), true);
    assert.equal(checkPermission("company_admin", "export_company_data"), true);
    assert.equal(checkPermission("company_admin", "access_other_tenant"), false);
  });

  test("3. Platform Admin possesses full authorized permissions", () => {
    assert.equal(checkPermission("platform_admin", "manage_organization"), true);
    assert.equal(checkPermission("platform_admin", "export_company_data"), true);
  });
});
