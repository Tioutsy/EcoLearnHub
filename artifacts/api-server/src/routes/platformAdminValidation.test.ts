import test from "node:test";
import assert from "node:assert";
import {
  isValidSectorSlug,
  hasDuplicateCourses,
  hasDuplicatePositions,
  isSelfPrerequisite,
  isAllowedSdgContribution
} from "../lib/validationHelpers.js";

test("frontend form validation - sector slug rules", () => {
  assert.strictEqual(isValidSectorSlug("hospitality-tourism"), true);
  assert.strictEqual(isValidSectorSlug("retail_trade_123"), true);
  assert.strictEqual(isValidSectorSlug("Hospitality"), false); // uppercase invalid
  assert.strictEqual(isValidSectorSlug("tourism space"), false); // spaces invalid
  assert.strictEqual(isValidSectorSlug("retail!"), false); // special characters invalid
});

test("frontend form validation - learning path course duplicates blocker", () => {
  assert.strictEqual(hasDuplicateCourses([1, 2, 3]), false);
  assert.strictEqual(hasDuplicateCourses([1, 2, 2]), true);
});

test("frontend form validation - learning path course positions blocker", () => {
  assert.strictEqual(hasDuplicatePositions([1, 2, 3]), false);
  assert.strictEqual(hasDuplicatePositions([1, 2, 2]), true);
});

test("frontend form validation - course self-prerequisite blocker", () => {
  assert.strictEqual(isSelfPrerequisite(1, [2, 3]), false);
  assert.strictEqual(isSelfPrerequisite(1, [1, 2]), true);
});

test("frontend form validation - SDG contribution categories rules", () => {
  assert.strictEqual(isAllowedSdgContribution("education_awareness"), true);
  assert.strictEqual(isAllowedSdgContribution("capacity_building"), true);
  assert.strictEqual(isAllowedSdgContribution("operational_outcome"), false);
  assert.strictEqual(isAllowedSdgContribution("operational_output"), false);
});
