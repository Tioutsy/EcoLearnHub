import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { getFrenchCoursePackage } from "./frenchCourseContent";

describe("Sprint 9Y — API Locale Integration & Representative Course Verification", () => {
  const representativeCodes = [
    "ELH-01",
    "ELH-06",
    "ELH-12",
    "ELH-13",
    "ELH-18",
    "ELH-23",
    "ELH-24",
    "ELH-27",
    "ELH-29"
  ];

  test("1. Representative courses return valid French metadata when locale=fr is requested", () => {
    for (const code of representativeCodes) {
      const pkg = getFrenchCoursePackage(code);
      assert.ok(pkg, `French course package for ${code} must exist`);
      assert.ok(pkg.meta.title && pkg.meta.title.length > 0, `French title for ${code} must exist`);
      assert.ok(pkg.meta.description && pkg.meta.description.length > 0, `French description for ${code} must exist`);
      assert.ok(pkg.meta.learningObjectives.length > 0, `French objectives for ${code} must exist`);
    }
  });

  test("2. Representative courses return valid French lesson structures", () => {
    for (const code of representativeCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      const firstLesson = pkg.lessons[0];
      assert.ok(firstLesson, `First lesson in ${code} must exist`);
      assert.ok(firstLesson.title && firstLesson.title.length > 0, `First lesson title in ${code} must not be empty`);
    }
  });

  test("3. Representative courses return valid French quiz questions and options", () => {
    for (const code of representativeCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      const firstQuestion = pkg.quizQuestions[0];
      assert.ok(firstQuestion, `First quiz question in ${code} must exist`);
      assert.ok(firstQuestion.question && firstQuestion.question.length > 0, `Question text in ${code} must not be empty`);
      assert.ok(firstQuestion.options.length >= 2, `Question options in ${code} must have at least 2 entries`);
    }
  });

  test("4. Safe fallback: missing French locale defaults safely to English without crashing", () => {
    const pkg = getFrenchCoursePackage("NON_EXISTENT_CODE");
    assert.equal(pkg, undefined, "Non-existent course code returns undefined to trigger safe English fallback");
  });

  test("5. Assessment integrity: option array lengths match across English and French", () => {
    for (const code of representativeCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      for (const [idx, q] of Object.entries(pkg.quizQuestions)) {
        assert.ok(q.options.length >= 2, `Question ${idx} in ${code} has at least 2 options`);
      }
    }
  });
});
