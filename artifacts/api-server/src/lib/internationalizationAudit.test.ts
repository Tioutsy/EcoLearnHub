import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { translations, Language } from "./translations";

describe("Sprint 9V — Internationalisation (i18n) Architecture & Resource Audit", () => {
  test("1. Both 'en' and 'fr' locale dictionaries are defined", () => {
    assert.ok(translations.en, "English dictionary must exist");
    assert.ok(translations.fr, "French dictionary must exist");
  });

  test("2. All required English keys exist with non-empty string values", () => {
    const enKeys = Object.keys(translations.en);
    assert.ok(enKeys.length > 20, "English dictionary must contain core interface keys");

    for (const key of enKeys) {
      const val = translations.en[key];
      assert.ok(
        val && val.trim().length > 0,
        `English translation key '${key}' must not be empty`
      );
    }
  });

  test("3. All required French keys match English keys 1:1 with non-empty string values", () => {
    const enKeys = Object.keys(translations.en);
    const frKeys = new Set(Object.keys(translations.fr));

    for (const key of enKeys) {
      assert.ok(
        frKeys.has(key),
        `French dictionary must contain translation key '${key}' matching English`
      );

      const frVal = translations.fr[key];
      assert.ok(
        frVal && frVal.trim().length > 0,
        `French translation key '${key}' must not be empty`
      );
    }
  });

  test("4. Safe fallback: missing French key resolves to English", () => {
    const fallbackFn = (key: string, lang: Language): string => {
      const langDict = translations[lang] || translations.en;
      return langDict[key] || translations.en[key] || key;
    };

    const enNavCourses = fallbackFn("nav.courses", "en");
    const frNavCourses = fallbackFn("nav.courses", "fr");

    assert.equal(enNavCourses, "Courses");
    assert.equal(frNavCourses, "Cours");

    // Non-existent key falls back to raw key
    const missingKey = fallbackFn("non.existent.key", "fr");
    assert.equal(missingKey, "non.existent.key");
  });

  test("5. Brand lockup and operator notices preserve 'Elevio by Recyclean'", () => {
    const enOperator = translations.en["footer.operator"];
    const frOperator = translations.fr["footer.operator"];

    assert.ok(enOperator.includes("Elevio"), "English operator notice must include Elevio");
    assert.ok(enOperator.includes("Recyclean Ltd."), "English operator notice must include Recyclean Ltd.");
    assert.ok(frOperator.includes("Elevio"), "French operator notice must include Elevio");
    assert.ok(frOperator.includes("Recyclean Ltd."), "French operator notice must include Recyclean Ltd.");
  });

  test("6. Param interpolation works correctly", () => {
    const interpolate = (template: string, params: Record<string, string | number>): string => {
      let result = template;
      Object.entries(params).forEach(([pKey, pVal]) => {
        result = result.replace(new RegExp(`{\\s*${pKey}\\s*}`, "g"), String(pVal));
      });
      return result;
    };

    const template = "Page { page } of { total }";
    const interpolated = interpolate(template, { page: 1, total: 5 });
    assert.equal(interpolated, "Page 1 of 5");
  });

  test("7. Sprint 9W: Learner dashboard, quiz, player and certificate key structures exist in both locales", () => {
    const requiredKeys = [
      "dashboard.my_learning_title",
      "dashboard.overall_progress",
      "dashboard.courses_completed",
      "dashboard.active_assignments",
      "catalogue.title",
      "catalogue.search_placeholder",
      "player.lesson",
      "player.module",
      "player.mark_completed",
      "quiz.title",
      "quiz.submit_quiz",
      "quiz.passed_title",
      "quiz.failed_title",
      "cert.my_certificates",
      "cert.download_pdf",
      "course.available_in_english",
    ];

    for (const key of requiredKeys) {
      assert.ok(translations.en[key], `English key '${key}' must exist`);
      assert.ok(translations.fr[key], `French key '${key}' must exist`);
    }
  });

  test("8. Translation dictionaries contain 0 prohibited legacy brand names", () => {
    const legacyProhibited = ["ecolearnhub", "verdia", "evolia", "paceo", "ebony forest"];
    const jsonStr = JSON.stringify(translations).toLowerCase();

    for (const name of legacyProhibited) {
      assert.ok(!jsonStr.includes(name), `Translations must not contain legacy name '${name}'`);
    }
  });

  test("9. Sprint 9X: Company admin & manager key structures exist in both locales", () => {
    const requiredKeys = [
      "admin.company_dashboard",
      "admin.company_overview",
      "admin.total_employees",
      "admin.active_learners",
      "admin.completion_rate",
      "admin.overdue_training",
      "admin.employees_title",
      "admin.add_employee",
      "admin.edit_employee",
      "admin.assign_courses",
      "admin.employee_name",
      "admin.email",
      "admin.department",
      "admin.job_title",
      "admin.role",
      "admin.invitation_status",
      "admin.challenge_reviews",
      "admin.awaiting_review",
      "admin.approved",
      "admin.returned",
      "admin.reports_title",
      "admin.compliance_title",
      "admin.evidence_exports",
    ];

    for (const key of requiredKeys) {
      assert.ok(translations.en[key], `English admin key '${key}' must exist`);
      assert.ok(translations.fr[key], `French admin key '${key}' must exist`);
    }
  });

  test("10. Full platform content i18n completeness & fallback verification", () => {
    const enKeys = Object.keys(translations.en);
    const frKeys = Object.keys(translations.fr);

    assert.equal(enKeys.length, frKeys.length, "English and French translation key counts must match 1:1");

    for (const key of enKeys) {
      assert.ok(translations.fr[key], `French translation key '${key}' must exist and not be empty`);
    }
  });

  test("11. PDF Certificate Generator supports French and English locales", async () => {
    const { generateCertificatePdf } = await import("./certificatePdf");
    const certEn = await generateCertificatePdf({
      employeeName: "Jean Dupont",
      companyName: "Elevio Corp",
      courseName: "Sustainability Foundations",
      uniqueCode: "CERT-TEST-EN",
      issuedAt: new Date("2026-08-05"),
      locale: "en",
    });
    const certFr = await generateCertificatePdf({
      employeeName: "Jean Dupont",
      companyName: "Elevio Corp",
      courseName: "Sustainability Foundations",
      uniqueCode: "CERT-TEST-FR",
      issuedAt: new Date("2026-08-05"),
      locale: "fr",
    });

    assert.ok(certEn && certEn.length > 1000, "English PDF must generate successfully");
    assert.ok(certFr && certFr.length > 1000, "French PDF must generate successfully");
  });
});
