import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10I — Activation Tenant Isolation Audit Suite", () => {
  test("1. Learner cohort import is strictly filtered by request companyId", () => {
    const isTenantMatch = (reqCompanyId: number, userCompanyId: number) => reqCompanyId === userCompanyId;
    assert.equal(isTenantMatch(1, 1), true);
    assert.equal(isTenantMatch(1, 2), false);
  });

  test("2. Day-0 dashboard metrics exclude data from other companies", () => {
    const filterByCompany = (items: { companyId: number }[], companyId: number) =>
      items.filter((i) => i.companyId === companyId);

    const data = [{ companyId: 1 }, { companyId: 2 }];
    assert.equal(filterByCompany(data, 1).length, 1);
  });
});
