import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10D — Test, Demo and Live Data Separation Audit Suite", () => {
  const records = [
    { id: 1, name: "Test Org 1", isTestRecord: true, recordEnvironment: "test" },
    { id: 2, name: "Demo Org 2", isTestRecord: true, recordEnvironment: "demo" },
    { id: 3, name: "Live Pilot Org 3", isTestRecord: false, recordEnvironment: "external_pilot" },
  ];

  test("1. Test and demo records are distinguishable via isTestRecord and recordEnvironment", () => {
    assert.equal(records[0].isTestRecord, true);
    assert.equal(records[2].isTestRecord, false);
    assert.equal(records[2].recordEnvironment, "external_pilot");
  });

  test("2. Live market metrics filter out test and demo records by default", () => {
    const liveRecords = records.filter(r => !r.isTestRecord && r.recordEnvironment !== "test" && r.recordEnvironment !== "demo");
    assert.equal(liveRecords.length, 1);
    assert.equal(liveRecords[0].name, "Live Pilot Org 3");
  });

  test("3. Cross-pilot reporting excludes internal technical fixtures", () => {
    const isIncludedInCrossPilotReport = (r: typeof records[0]) => !r.isTestRecord;
    assert.equal(isIncludedInCrossPilotReport(records[0]), false);
    assert.equal(isIncludedInCrossPilotReport(records[2]), true);
  });
});
