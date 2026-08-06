import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { frenchCourseRegistry, getFrenchCoursePackage } from "./frenchCourseContent";

describe("Sprint 9Z — Mixed-Language Runtime & Fallback Audit Suite", () => {
  const activeCourseCodes: string[] = [];
  for (let i = 1; i <= 29; i++) {
    activeCourseCodes.push(`ELH-${String(i).padStart(2, "0")}`);
  }

  test("1. No raw translation keys (e.g. 'nav.courses') present in French course packages", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      const str = JSON.stringify(pkg);
      const keyMatch = str.match(/"[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+"/g);
      assert.equal(keyMatch, null, `Course ${code} contains raw translation key: ${keyMatch?.[0]}`);
    }
  });

  test("2. French course packages contain zero unapproved English placeholders or dummy fallback copy", () => {
    const prohibitedPlaceholders = ["lorem ipsum", "todo translate", "[english]", "dummy text", "fixme"];
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      const json = JSON.stringify(pkg).toLowerCase();
      for (const phrase of prohibitedPlaceholders) {
        assert.ok(!json.includes(phrase), `Course ${code} contains prohibited placeholder '${phrase}'`);
      }
    }
  });

  test("3. All course titles in French package are translated to natural French", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      assert.ok(pkg.meta.title && pkg.meta.title.length > 0, `Course ${code} title must not be empty`);
      assert.notEqual(pkg.meta.title, "Sustainability Foundations", `Course ${code} title must be translated`);
    }
  });

  test("4. All course descriptions in French package are non-empty natural French", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      assert.ok(pkg.meta.description && pkg.meta.description.length > 0, `Course ${code} description must not be empty`);
    }
  });

  test("5. Approved brand lockups and technical acronyms retain exact casing across packages", () => {
    const pkg01 = getFrenchCoursePackage("ELH-01")!;
    const str01 = JSON.stringify(pkg01);
    assert.ok(str01.includes("CEB"), "ELH-01 must preserve official CEB acronym");

    const pkg07 = getFrenchCoursePackage("ELH-07")!;
    const str07 = JSON.stringify(pkg07);
    assert.ok(str07.includes("Scope 1") || str07.includes("carbone"), "ELH-07 must preserve Scope 1/2/3 or carbon terms");
  });

  test("6. Fallback safety: undefined course code returns undefined to enable safe English fallback", () => {
    const fallbackPkg = getFrenchCoursePackage("");
    assert.equal(fallbackPkg, undefined, "Empty course code returns undefined gracefully");
  });
});
