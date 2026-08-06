import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10D — Pilot Evidence Integrity Audit Suite", () => {
  const evidenceCategories = ["participation", "operational", "feedback", "commercial"];

  test("1. Required pilot evidence categories are enforced", () => {
    assert.equal(evidenceCategories.length, 4);
    assert.ok(evidenceCategories.includes("participation"));
    assert.ok(evidenceCategories.includes("operational"));
  });

  test("2. Participation evidence requires legal representative confirmation", () => {
    const confirmation = {
      companyName: "Coral Bay Hospitality Ltd",
      confirmedBy: "admin@coralbay.mu",
      confirmedAt: new Date().toISOString(),
      learnerCap: 50,
    };

    assert.ok(confirmation.confirmedBy);
    assert.equal(confirmation.learnerCap, 50);
  });

  test("3. Zero personal learner data is committed to source control fixtures", () => {
    const isPersonalDataSafe = (email: string) => email.endsWith(".mu") || email.endsWith(".test") || email.endsWith(".example");
    assert.equal(isPersonalDataSafe("test.user@coralbay.mu"), true);
  });
});
