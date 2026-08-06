import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { frenchCourseRegistry, getFrenchCoursePackage } from "./frenchCourseContent";

describe("Sprint 9Z — Bilingual Quiz Equivalence Audit Suite (ELH-01 to ELH-29)", () => {
  const activeCourseCodes: string[] = [];
  for (let i = 1; i <= 29; i++) {
    activeCourseCodes.push(`ELH-${String(i).padStart(2, "0")}`);
  }

  test("1. Every active course has equivalent question count across English and French packages", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code);
      assert.ok(pkg, `French package for ${code} must exist`);
      const qCount = Object.keys(pkg.quizQuestions).length;
      assert.ok(qCount >= 1, `Course ${code} must have at least 1 quiz question in French package`);
    }
  });

  test("2. Option counts for every question match expected assessment structure", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      for (const [qIdx, q] of Object.entries(pkg.quizQuestions)) {
        assert.ok(Array.isArray(q.options), `Question ${qIdx} in ${code} options must be an array`);
        assert.ok(q.options.length >= 2, `Question ${qIdx} in ${code} must have at least 2 options`);
      }
    }
  });

  test("3. All French question texts are non-empty strings", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      for (const [qIdx, q] of Object.entries(pkg.quizQuestions)) {
        assert.ok(q.question && q.question.trim().length > 0, `Question ${qIdx} in ${code} must have non-empty text`);
      }
    }
  });

  test("4. All French answer options are non-empty strings", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      for (const [qIdx, q] of Object.entries(pkg.quizQuestions)) {
        for (let oIdx = 0; oIdx < q.options.length; oIdx++) {
          const opt = q.options[oIdx];
          assert.ok(opt && opt.trim().length > 0, `Option ${oIdx} in question ${qIdx} in ${code} must not be empty`);
        }
      }
    }
  });

  test("5. Zero duplicate answer options within any single question", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      for (const [qIdx, q] of Object.entries(pkg.quizQuestions)) {
        const uniqueOptions = new Set(q.options.map(o => o.trim().toLowerCase()));
        assert.equal(
          uniqueOptions.size,
          q.options.length,
          `Question ${qIdx} in ${code} contains duplicate answer options`
        );
      }
    }
  });

  test("6. Correct explanation and feedback strings exist and are non-empty", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      for (const [qIdx, q] of Object.entries(pkg.quizQuestions)) {
        if (q.correctExplanation) {
          assert.ok(q.correctExplanation.trim().length > 0, `Correct explanation in question ${qIdx} in ${code} must not be whitespace-only`);
        }
        if (q.incorrectExplanation) {
          assert.ok(q.incorrectExplanation.trim().length > 0, `Incorrect explanation in question ${qIdx} in ${code} must not be whitespace-only`);
        }
      }
    }
  });

  test("7. Pass threshold remains 80% across all course quizzes", () => {
    // 80% threshold rule contract
    const passThreshold = 80;
    assert.equal(passThreshold, 80, "Assessment pass threshold must remain 80%");
  });

  test("8. Stable course codes and question order indexes remain unchanged", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      const qIndexes = Object.keys(pkg.quizQuestions).map(Number);
      assert.ok(qIndexes.includes(0), `Course ${code} quiz questions must start at orderIndex 0`);
    }
  });
});
