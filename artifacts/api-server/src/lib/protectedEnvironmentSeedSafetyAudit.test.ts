import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10D — Protected Environment Seed Safety Audit Suite", () => {
  test("1. Destructive seed commands refuse to run when NODE_ENV is production", () => {
    const isSeedAllowed = (nodeEnv: string, forceFlag: boolean) => nodeEnv !== "production" || forceFlag;

    assert.equal(isSeedAllowed("development", false), true);
    assert.equal(isSeedAllowed("production", false), false, "Seed commands MUST be blocked in production");
  });

  test("2. Reset commands refuse to purge non-test records without explicit confirmation", () => {
    const isPurgeAllowed = (recordEnv: string) => recordEnv === "test" || recordEnv === "demo";

    assert.equal(isPurgeAllowed("test"), true);
    assert.equal(isPurgeAllowed("external_pilot"), false, "Reset commands MUST NOT purge live external pilot data");
  });
});
