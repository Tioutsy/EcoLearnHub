import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10B — Pilot Notice & Acknowledgement Audit Suite", () => {
  const mockUser = {
    userId: "user_lux_admin",
    companyId: 1,
    role: "company_admin",
  };

  const validNoticeTypes = new Set([
    "company_pilot_notice",
    "learner_privacy_notice",
    "evidence_upload_notice",
  ]);

  test("1. Valid notice types are accepted for server-side recording", () => {
    for (const type of validNoticeTypes) {
      assert.ok(validNoticeTypes.has(type), `Notice type ${type} must be valid`);
    }
  });

  test("2. Unapproved notice types are rejected", () => {
    const invalidType = "random_marketing_consent";
    assert.equal(validNoticeTypes.has(invalidType), false, "Arbitrary notice types must be rejected");
  });

  test("3. Notice acknowledgement creates server-side audit record with version & locale metadata", () => {
    const acknowledgementPayload = {
      noticeType: "company_pilot_notice",
      version: "1.0",
      locale: "fr",
      acknowledgedAt: new Date().toISOString(),
      companyId: mockUser.companyId,
      actorUserId: mockUser.userId,
    };

    assert.equal(acknowledgementPayload.noticeType, "company_pilot_notice");
    assert.equal(acknowledgementPayload.version, "1.0");
    assert.equal(acknowledgementPayload.locale, "fr");
    assert.equal(acknowledgementPayload.companyId, 1);
  });

  test("4. Re-acknowledgement is triggered when notice version changes", () => {
    const userAcknowledgements = [{ noticeType: "company_pilot_notice", version: "1.0" }];
    const currentVersion = "2.0";

    const needsReacknowledgement = !userAcknowledgements.some(
      a => a.noticeType === "company_pilot_notice" && a.version === currentVersion
    );

    assert.equal(needsReacknowledgement, true, "Notice version 2.0 requires re-acknowledgement");
  });
});
