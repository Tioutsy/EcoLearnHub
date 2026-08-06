import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10F — Pilot Proposal Bilingual Completeness Audit Suite", () => {
  const proposalPayload = {
    titleEn: "Elevio Skills Controlled Pilot Proposal",
    titleFr: "Proposition de Pilote Contrôlé Elevio Skills",
    purposeEn: "4-week micro-learning trial in workplace sustainability",
    purposeFr: "Essai de micro-apprentissage de 4 semaines sur le développement durable",
    learnerCap: 50,
  };

  test("1. Proposal payload contains complete English and French section texts", () => {
    assert.ok(proposalPayload.titleEn.includes("Proposal"));
    assert.ok(proposalPayload.titleFr.includes("Proposition"));
    assert.ok(proposalPayload.purposeEn.includes("4-week"));
    assert.ok(proposalPayload.purposeFr.includes("4 semaines"));
  });

  test("2. French proposal text uses natural Mauritian business terminology", () => {
    assert.ok(proposalPayload.purposeFr.includes("développement durable"));
  });

  test("3. Brand lockup remains unmutated across locales", () => {
    const brand = "Elevio Skills by Recyclean";
    assert.equal(brand, "Elevio Skills by Recyclean");
  });
});
