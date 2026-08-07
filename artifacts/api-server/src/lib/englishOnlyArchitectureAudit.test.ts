import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Architecture Guard: English-Only Platform Architecture (Sprint 10T)", () => {
  const rootDir = path.resolve(__dirname, "../../../");

  test("1. Ensure obsolete translation files remain deleted", () => {
    const forbiddenFiles = [
      "artifacts/ecolearn/src/components/layout/LanguageSelector.tsx",
      "artifacts/ecolearn/src/config/translations.ts",
      "artifacts/api-server/src/lib/frenchCourseContent.ts",
      "artifacts/api-server/src/lib/frenchLocalizationAudit.test.ts",
      "artifacts/api-server/src/lib/liveFrenchE2eAudit.test.ts",
      "artifacts/api-server/src/lib/bilingualQuizEquivalenceAudit.test.ts",
      "artifacts/api-server/src/lib/frenchCourseContentAudit.test.ts",
    ];

    for (const relPath of forbiddenFiles) {
      const fullPath = path.join(rootDir, relPath);
      assert.equal(
        fs.existsSync(fullPath),
        false,
        `Forbidden translation file re-introduced: ${relPath}`
      );
    }
  });

  test("2. Ensure Navbar does not import LanguageSelector", () => {
    const navbarPath = path.join(rootDir, "artifacts/ecolearn/src/components/layout/Navbar.tsx");
    const content = fs.readFileSync(navbarPath, "utf8");
    assert.equal(
      content.includes("LanguageSelector"),
      false,
      "Navbar.tsx must not import or render LanguageSelector"
    );
  });
});
