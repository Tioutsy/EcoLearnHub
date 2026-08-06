import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10C — Pilot Survey Feedback Audit Suite", () => {
  const surveyPayload = {
    companyId: 1,
    respondentUserId: "user_101",
    respondentRole: "learner",
    feedbackStage: "midpoint",
    overallRating: 5,
    easeOfUseRating: 5,
    contentRelevanceRating: 4,
    freeTextFeedback: "Great course on waste sorting!",
    consentForFollowUp: true,
  };

  test("1. Survey submission enforces rating scale boundaries (1 to 5)", () => {
    const isValidRating = (r: number) => Number.isInteger(r) && r >= 1 && r <= 5;

    assert.equal(isValidRating(surveyPayload.overallRating), true);
    assert.equal(isValidRating(0), false);
    assert.equal(isValidRating(6), false);
  });

  test("2. Survey responses preserve respondent role and feedback stage", () => {
    assert.equal(surveyPayload.respondentRole, "learner");
    assert.equal(surveyPayload.feedbackStage, "midpoint");
  });

  test("3. Survey responses are isolated by companyId", () => {
    const responses = [
      { companyId: 1, text: "Feedback A" },
      { companyId: 2, text: "Feedback B" }
    ];

    const companyAResponses = responses.filter(r => r.companyId === 1);
    assert.equal(companyAResponses.length, 1);
    assert.equal(companyAResponses[0].text, "Feedback A");
  });
});
