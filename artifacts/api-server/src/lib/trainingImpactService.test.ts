import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  ALLOWED_ACTION_CATEGORIES,
  ESG_MAPPING,
  MINIMUM_PRIVACY_THRESHOLD,
  escapeCsvCell,
} from "./learnerCommitmentService.js";
import { generateDeterministicImpactNarrative } from "./ai/trainingImpactNarrativeService.js";

describe("Sprint 11D — Workplace Action & Training Impact Unit Suite", () => {
  test("1. Action Categories and Deterministic ESG Mapping", () => {
    assert.strictEqual(ALLOWED_ACTION_CATEGORIES.length, 9);
    assert.strictEqual(ESG_MAPPING["waste"], "environmental");
    assert.strictEqual(ESG_MAPPING["energy"], "environmental");
    assert.strictEqual(ESG_MAPPING["water"], "environmental");
    assert.strictEqual(ESG_MAPPING["procurement"], "environmental");
    assert.strictEqual(ESG_MAPPING["biodiversity"], "environmental");
    assert.strictEqual(ESG_MAPPING["workplace-practice"], "social");
    assert.strictEqual(ESG_MAPPING["social"], "social");
    assert.strictEqual(ESG_MAPPING["governance"], "governance");
    assert.strictEqual(ESG_MAPPING["other"], "governance");
  });

  test("2. CSV Anti-Formula Injection Protection", () => {
    // Standard safe strings
    assert.strictEqual(escapeCsvCell("Standard text"), '"Standard text"');
    assert.strictEqual(escapeCsvCell(123), '"123"');
    assert.strictEqual(escapeCsvCell(null), '""');

    // Dangerous formula injection prefixes
    assert.strictEqual(escapeCsvCell("=CMD('calc')"), '"\'=CMD(\'calc\')"');
    assert.strictEqual(escapeCsvCell("+1+2"), '"\'+1+2"');
    assert.strictEqual(escapeCsvCell("-1-2"), '"\'-1-2"');
    assert.strictEqual(escapeCsvCell("@SUM(A1:A10)"), '"\'@SUM(A1:A10)"');
  });

  test("3. Privacy Threshold Standard Constant", () => {
    assert.strictEqual(MINIMUM_PRIVACY_THRESHOLD, 5);
  });

  test("4. Deterministic Impact Narrative Fallback", () => {
    const mockSummary = {
      companyId: 101,
      eligibleCompletions: 20,
      commitmentsCreated: 10,
      commitmentRate: 0.5,
      actionsReported: 4,
      actionFollowThroughRate: 0.4,
      managerConfirmedActions: 2,
      followUpRequested: 1,
      outstandingManagerReviews: 1,
      categoryDistribution: {
        waste: 2,
        energy: 2,
        water: 1,
        procurement: 1,
        biodiversity: 0,
        "workplace-practice": 2,
        governance: 1,
        social: 1,
        other: 0,
      },
      esgBreakdown: {
        environmental: 6,
        social: 3,
        governance: 1,
      },
      departmentSummary: {
        Engineering: { employeeCount: 10, commitmentCount: 6, suppressed: false },
        Sales: { employeeCount: 3, commitmentCount: 0, suppressed: true },
      },
      disclaimer: "Manager review confirms receipt only. Not an environmental audit.",
    };

    const narrative = generateDeterministicImpactNarrative(mockSummary);

    assert.strictEqual(narrative.isAiGenerated, false);
    assert.ok(narrative.summaryInterpretation.includes("10 commitments"));
    assert.ok(narrative.suggestedManagementActions.length > 0);
    assert.ok(narrative.disclaimer.includes("Does not constitute an environmental audit"));
  });
});
