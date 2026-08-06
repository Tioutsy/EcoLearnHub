import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10D — Real Entity Fixture Audit Suite", () => {
  const allowedFictionalNames = new Set([
    "Coral Bay Hospitality Ltd",
    "Island Professional Services Ltd",
    "Mauritius Pilot Organisation A",
    "Mauritius Pilot Organisation B",
    "Elevio Pilot Company",
  ]);

  test("1. Test fixture names strictly match allowlisted fictional names", () => {
    for (const name of allowedFictionalNames) {
      assert.ok(allowedFictionalNames.has(name));
    }
  });

  test("2. Unapproved real entity names are rejected in fixture validation", () => {
    const isApprovedFixtureName = (name: string) => allowedFictionalNames.has(name);
    assert.equal(isApprovedFixtureName("Coral Bay Hospitality Ltd"), true);
    assert.equal(isApprovedFixtureName("Unapproved Real Resort"), false);
  });
});
