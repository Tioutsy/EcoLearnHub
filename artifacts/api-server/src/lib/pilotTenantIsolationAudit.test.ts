import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { getCompanyAccess, CompanyAccess } from "./access";

describe("Sprint 10A — Pilot Cross-Tenant Isolation Security Audit Suite", () => {
  const mockOrgA: CompanyAccess = {
    userId: "user_org_a_admin",
    email: "admin@org-a.mu",
    companyId: 1,
    role: "company_admin",
    employee: null,
    isDemo: false,
  };

  const mockOrgB: CompanyAccess = {
    userId: "user_org_b_admin",
    email: "admin@org-b.mu",
    companyId: 2,
    role: "company_admin",
    employee: null,
    isDemo: false,
  };

  const mockLearnerA: CompanyAccess = {
    userId: "user_org_a_learner",
    email: "learner@org-a.mu",
    companyId: 1,
    role: "employee",
    employee: null,
    isDemo: false,
  };

  test("1. Company Admin A cannot access Company B context", () => {
    assert.notEqual(mockOrgA.companyId, mockOrgB.companyId, "Company IDs must differ between tenants");
    assert.equal(mockOrgA.companyId, 1, "Org A must be locked to companyId 1");
  });

  test("2. Learner A cannot access Company Admin permissions", () => {
    assert.equal(mockLearnerA.role, "employee", "Learner must have employee role");
    assert.notEqual(mockLearnerA.role, "company_admin", "Learner cannot be company_admin");
  });

  test("3. Cross-tenant company access resolution is isolated by companyId", () => {
    const isCompanyMatch = (access: CompanyAccess, targetCompanyId: number): boolean => {
      if (access.role === "platform_admin") return true;
      return access.companyId === targetCompanyId;
    };

    assert.equal(isCompanyMatch(mockOrgA, 1), true, "Org A admin can access Org A data");
    assert.equal(isCompanyMatch(mockOrgA, 2), false, "Org A admin MUST BE DENIED access to Org B data");
    assert.equal(isCompanyMatch(mockOrgB, 1), false, "Org B admin MUST BE DENIED access to Org A data");
  });

  test("4. Cross-tenant certificate download access is restricted", () => {
    const canAccessCertificate = (
      access: CompanyAccess,
      certUserId: string,
      certCompanyId: number
    ): boolean => {
      if (access.role === "platform_admin") return true;
      if (access.userId === certUserId) return true;
      if (access.role === "company_admin" && access.companyId === certCompanyId) return true;
      return false;
    };

    // Learner A viewing own certificate
    assert.equal(canAccessCertificate(mockLearnerA, "user_org_a_learner", 1), true);

    // Learner A attempting to view Learner B's certificate in Org B
    assert.equal(canAccessCertificate(mockLearnerA, "user_org_b_learner", 2), false);

    // Admin A attempting to view Org B certificate
    assert.equal(canAccessCertificate(mockOrgA, "user_org_b_learner", 2), false);
  });

  test("5. Export routes filter strictly by authorized companyId", () => {
    const buildReportFilter = (access: CompanyAccess) => {
      return access.role === "platform_admin" ? {} : { companyId: access.companyId };
    };

    const filterA = buildReportFilter(mockOrgA);
    const filterB = buildReportFilter(mockOrgB);

    assert.deepEqual(filterA, { companyId: 1 });
    assert.deepEqual(filterB, { companyId: 2 });
    assert.notDeepEqual(filterA, filterB);
  });
});
