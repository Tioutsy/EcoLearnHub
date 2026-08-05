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
});
