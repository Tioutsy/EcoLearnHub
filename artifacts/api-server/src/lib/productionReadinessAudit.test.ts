import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { ensureSchemaModifications } from "./ensureSchemaModifications";
import { validateProductionEnvironment } from "./productionEnvironmentValidator";
import { runProductionSmokeTest } from "./productionSmokeTest";

describe("Sprint 8F: Production Launch Readiness & Security Hardening Audit", () => {
  before(async () => {
    await ensureSchemaModifications();
  });

  test("1. validateProductionEnvironment checks configuration without exposing secrets", async () => {
    const res = validateProductionEnvironment();
    assert.equal(typeof res.valid, "boolean");
    assert.ok(Array.isArray(res.warnings));
    assert.ok(Array.isArray(res.blockers));
  });

  test("2. runProductionSmokeTest validates API, DB connectivity, and catalogue integrity", async () => {
    const smoke = await runProductionSmokeTest();
    assert.equal(smoke.databaseCheck, true, "Database check must pass");
    assert.ok(smoke.coursesCount >= 29, "Catalogue should contain all active EcoLearnHub courses");
    assert.equal(smoke.passed, true, "Overall smoke test should pass");
  });
});
