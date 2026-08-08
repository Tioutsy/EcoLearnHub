import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { translations, Language } from "./translations";

describe("English-Only Architecture & Resource Audit", () => {
  test("1. 'en' locale dictionary is defined", () => {
    assert.ok(translations.en, "English dictionary must exist");
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

  test("3. Safe fallback: translation key resolves to English", () => {
    const fallbackFn = (key: string, lang: Language): string => {
      const langDict = translations[lang] || translations.en;
      return langDict[key] || translations.en[key] || key;
    };

    const enNavCourses = fallbackFn("nav.courses", "en");
    assert.equal(enNavCourses, "Courses");

    // Non-existent key falls back to raw key
    const missingKey = fallbackFn("non.existent.key", "en");
    assert.equal(missingKey, "non.existent.key");
  });

  test("4. Brand lockup and operator notices preserve 'Elevio by Recyclean'", () => {
    const enOperator = translations.en["footer.operator"];
    assert.ok(enOperator.includes("Recyclean Ltd."), "Operator notice must mention Recyclean Ltd.");
  });
});
