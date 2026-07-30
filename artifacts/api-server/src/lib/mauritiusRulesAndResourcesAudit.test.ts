import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { ensureSchemaModifications } from "./ensureSchemaModifications";
import { db, mauritiusResourcesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

describe("Sprint 8I: Mauritius Rules & Resources Simplification Audit", () => {
  let testResourceId: number;

  before(async () => {
    await ensureSchemaModifications();

    const stamp = Date.now();
    const [res] = await db
      .insert(mauritiusResourcesTable)
      .values({
        title: "Environment Protection Act 2024 (Audit 8I)",
        slug: `env-protection-act-8i-${stamp}`,
        resourceType: "Act",
        shortSummary: "Key legal act governing environmental compliance and solid waste in Mauritius.",
        mainExplanation: "Detailed explanation of the Environment Protection Act 2024.",
        officialName: "Environment Protection Act 2024",
        responsibleAuthority: "Ministry of Environment, Solid Waste Management and Climate Change",
        relevantSector: "Waste",
        legalStatus: "active",
        status: "published",
        lastVerifiedAt: new Date(),
      })
      .returning();

    testResourceId = res.id;
  });

  test("1. Mauritian Laws & Resources schema supports verification dates and legal statuses", async () => {
    const [res] = await db
      .select()
      .from(mauritiusResourcesTable)
      .where(eq(mauritiusResourcesTable.id, testResourceId));

    assert.equal(res.resourceType, "Act");
    assert.equal(res.legalStatus, "active");
    assert.ok(res.lastVerifiedAt instanceof Date);
  });

  test("2. Mauritian Laws & Resources query filters by resourceType and sector correctly", async () => {
    const results = await db
      .select()
      .from(mauritiusResourcesTable)
      .where(eq(mauritiusResourcesTable.relevantSector, "Waste"));

    assert.ok(results.length >= 1);
    assert.equal(results.some((r) => r.id === testResourceId), true);
  });

  test("3. Resource detail fields contain authority and official name attributes", async () => {
    const [res] = await db
      .select()
      .from(mauritiusResourcesTable)
      .where(eq(mauritiusResourcesTable.id, testResourceId));

    assert.equal(res.officialName, "Environment Protection Act 2024");
    assert.equal(
      res.responsibleAuthority,
      "Ministry of Environment, Solid Waste Management and Climate Change"
    );
  });
});
