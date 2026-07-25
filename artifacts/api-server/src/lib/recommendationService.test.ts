import test from "node:test";
import assert from "node:assert/strict";
import { getRecommendedNextCourse } from "./recommendationService";
import { ensureCategoriesAndAssignments } from "./ensureCategoriesAndAssignments";
import { ensureHybridSubscriptions } from "./ensureHybridSubscriptions";

test("Recommendation Engine — Default New Learner", async () => {
  await ensureCategoriesAndAssignments();
  await ensureHybridSubscriptions();

  // Test unauthenticated default recommendation
  const defaultRec = await getRecommendedNextCourse(null);
  assert.ok(defaultRec, "Default recommendation should be present");
  assert.equal(defaultRec.courseCode, "ELH-01");
  assert.equal(defaultRec.actionText, "Start course");
});

test("Recommendation Engine — Authenticated Learner Recommendation", async () => {
  await ensureCategoriesAndAssignments();
  await ensureHybridSubscriptions();

  const mockAccess = {
    userId: "test_rec_user",
    email: "rec@example.com",
    companyId: 1,
    role: "employee" as const,
    employee: null,
    isDemo: false,
  };

  const rec = await getRecommendedNextCourse(mockAccess);
  assert.ok(rec, "Learner recommendation should be present");
  assert.ok(rec.reasonHeading, "Reason heading should be populated");
  assert.ok(rec.actionText, "Action text should be populated");
});
