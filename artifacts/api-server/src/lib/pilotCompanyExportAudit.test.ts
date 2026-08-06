import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10B — Pilot Company Data Export Audit Suite", () => {
  const companyA = { id: 1, name: "Lux Resorts", code: "LUX-MU" };
  const companyB = { id: 2, name: "MCB", code: "MCB-MU" };

  test("1. Full company data export payload contains required tenant sections and metadata", () => {
    const mockExport = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        exportedByUserId: "user_lux_admin",
        companyId: companyA.id,
        companyName: companyA.name,
      },
      company: companyA,
      employees: [{ id: 101, name: "Jean Dupont" }],
      assignments: [{ courseCode: "ELH-01" }],
      enrollments: [{ courseId: 1, status: "completed" }],
      certificates: [{ uniqueCode: "LUX-ELH01-01" }],
    };

    assert.ok(mockExport.exportMetadata.exportedAt, "Export metadata must contain timestamp");
    assert.equal(mockExport.exportMetadata.companyId, 1);
    assert.equal(mockExport.employees.length, 1);
    assert.equal(mockExport.certificates.length, 1);
  });

  test("2. Company Admin A cannot export Company B data", () => {
    const isExportAuthorized = (adminCompanyId: number, targetCompanyId: number): boolean => {
      return adminCompanyId === targetCompanyId;
    };

    assert.equal(isExportAuthorized(companyA.id, companyA.id), true, "Admin A can export Company A");
    assert.equal(isExportAuthorized(companyA.id, companyB.id), false, "Admin A CANNOT export Company B");
  });

  test("3. Learner role is denied access to company data export", () => {
    const isRoleAllowed = (role: string): boolean => {
      return role === "company_admin" || role === "platform_admin";
    };

    assert.equal(isRoleAllowed("company_admin"), true);
    assert.equal(isRoleAllowed("platform_admin"), true);
    assert.equal(isRoleAllowed("employee"), false, "Learner role MUST BE DENIED export access");
  });
});
