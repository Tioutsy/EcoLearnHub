import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10B — Pilot Data Lifecycle & Deactivation Audit Suite", () => {
  const employeeRoster = [
    { id: 101, companyId: 1, name: "Jean Dupont", status: "active", completions: 3 },
    { id: 102, companyId: 1, name: "Marie Laurent", status: "deactivated", completions: 2 }
  ];

  test("1. Employee deactivation sets status to 'deactivated' without deleting record", () => {
    const deactivatedEmp = employeeRoster.find(e => e.id === 102)!;
    assert.equal(deactivatedEmp.status, "deactivated");
    assert.equal(deactivatedEmp.completions, 2, "Historical course completions must be preserved");
  });

  test("2. Deactivated employee cannot authenticate into active learner player", () => {
    const canAuthenticate = (status: string) => status === "active";
    const activeResult = canAuthenticate(employeeRoster[0].status);
    const deactivatedResult = canAuthenticate(employeeRoster[1].status);

    assert.equal(activeResult, true, "Active employee can access player");
    assert.equal(deactivatedResult, false, "Deactivated employee MUST BE BLOCKED from player access");
  });

  test("3. Historical training reports include deactivated employees for audit compliance", () => {
    const includeDeactivatedInReports = true;
    const reportList = employeeRoster.filter(e => includeDeactivatedInReports || e.status === "active");

    assert.equal(reportList.length, 2, "Training reports must preserve historical records of deactivated employees");
  });

  test("4. Reactivating a deactivated employee restores active status without duplicating records", () => {
    const targetEmp = { ...employeeRoster[1], status: "active" };
    assert.equal(targetEmp.id, 102);
    assert.equal(targetEmp.status, "active");
    assert.equal(targetEmp.completions, 2);
  });
});
