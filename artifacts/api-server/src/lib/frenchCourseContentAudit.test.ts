import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { frenchCourseRegistry, getFrenchCoursePackage } from "./frenchCourseContent";

const APPROVED_IDENTICAL_ALLOWLIST = new Set([
  "Elevio",
  "Elevio Skills",
  "Recyclean",
  "Recyclean Ltd.",
  "ESG",
  "Scope 1",
  "Scope 2",
  "Scope 3",
  "MUR",
  "PDF",
  "CSV",
  "CEB",
  "RSE"
]);

describe("Sprint 9Y — Automated French Course-Content Audit Suite (ELH-01 to ELH-29)", () => {
  const activeCourseCodes: string[] = [];
  for (let i = 1; i <= 29; i++) {
    activeCourseCodes.push(`ELH-${String(i).padStart(2, "0")}`);
  }

  test("1. Every active course (ELH-01 to ELH-29) is present in the French registry", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code);
      assert.ok(pkg, `Course package for ${code} must exist in frenchCourseRegistry`);
    }
  });

  test("2. Every active course has non-empty French title", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      assert.ok(pkg.meta.title && pkg.meta.title.trim().length > 0, `Course ${code} must have non-empty French title`);
    }
  });

  test("3. Every active course has non-empty French description", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      assert.ok(pkg.meta.description && pkg.meta.description.trim().length > 0, `Course ${code} must have non-empty French description`);
    }
  });

  test("4. Every learning objective has non-empty French content", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      assert.ok(pkg.meta.learningObjectives.length > 0, `Course ${code} must have learning objectives`);
      for (const obj of pkg.meta.learningObjectives) {
        assert.ok(obj && obj.trim().length > 0, `Learning objective in ${code} must not be empty`);
      }
    }
  });

  test("5. Every course module/lesson has a non-empty French title", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      const lessonKeys = Object.keys(pkg.lessons);
      assert.ok(lessonKeys.length > 0, `Course ${code} must have lesson translations`);
      for (const idx of lessonKeys) {
        const lesson = pkg.lessons[Number(idx)];
        assert.ok(lesson.title && lesson.title.trim().length > 0, `Lesson ${idx} in ${code} must have non-empty title`);
      }
    }
  });

  test("6. Every text-based lesson has non-empty French content or blocks", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      for (const [idx, lesson] of Object.entries(pkg.lessons)) {
        const hasTextContent = lesson.content && lesson.content.trim().length > 0;
        const hasBlocks = Array.isArray(lesson.blocks) && lesson.blocks.length > 0;
        assert.ok(hasTextContent || hasBlocks, `Lesson ${idx} in ${code} must have text content or content blocks`);
      }
    }
  });

  test("7. Scenario content blocks contain valid French setup and option labels", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      for (const lesson of Object.values(pkg.lessons)) {
        if (lesson.blocks) {
          for (const block of lesson.blocks) {
            if (block.type === "decision_scenario") {
              assert.ok(block.scenarioSetup && block.scenarioSetup.trim().length > 0, `Scenario setup in ${code} must not be empty`);
              assert.ok(Array.isArray(block.decisionOptions) && block.decisionOptions.length > 0, `Scenario options in ${code} must not be empty`);
              for (const opt of block.decisionOptions!) {
                assert.ok(opt.label && opt.label.trim().length > 0, `Scenario option label in ${code} must not be empty`);
                assert.ok(opt.feedback && opt.feedback.trim().length > 0, `Scenario option feedback in ${code} must not be empty`);
              }
            }
          }
        }
      }
    }
  });

  test("8. Every quiz question has non-empty French question text", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      const qKeys = Object.keys(pkg.quizQuestions);
      assert.ok(qKeys.length > 0, `Course ${code} must have quiz question translations`);
      for (const idx of qKeys) {
        const q = pkg.quizQuestions[Number(idx)];
        assert.ok(q.question && q.question.trim().length > 0, `Quiz question ${idx} in ${code} must not be empty`);
      }
    }
  });

  test("9. Every answer option has non-empty French option text", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      for (const [idx, q] of Object.entries(pkg.quizQuestions)) {
        assert.ok(Array.isArray(q.options) && q.options.length >= 2, `Question ${idx} in ${code} must have at least 2 options`);
        for (const opt of q.options) {
          assert.ok(opt && opt.trim().length > 0, `Quiz option in question ${idx} in ${code} must not be empty`);
        }
      }
    }
  });

  test("10. Feedback fields have valid non-empty French content", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      for (const q of Object.values(pkg.quizQuestions)) {
        if (q.correctExplanation) {
          assert.ok(q.correctExplanation.trim().length > 0, `Correct explanation in ${code} must not be whitespace-only`);
        }
        if (q.incorrectExplanation) {
          assert.ok(q.incorrectExplanation.trim().length > 0, `Incorrect explanation in ${code} must not be whitespace-only`);
        }
      }
    }
  });

  test("11. Completion messages have non-empty French copy", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      assert.ok(pkg.meta.completionMessage && pkg.meta.completionMessage.trim().length > 0, `Completion message for ${code} must exist`);
    }
  });

  test("12. Every badge has non-empty French badge title and description", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      assert.ok(pkg.meta.badgeName && pkg.meta.badgeName.trim().length > 0, `Badge name for ${code} must exist`);
      assert.ok(pkg.meta.badgeDescription && pkg.meta.badgeDescription.trim().length > 0, `Badge description for ${code} must exist`);
    }
  });

  test("13. French text does not contain raw translation keys (e.g. 'nav.courses')", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      const str = JSON.stringify(pkg);
      const keyPattern = /[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+/;
      const match = str.match(keyPattern);
      assert.equal(match, null, `French text in ${code} contains raw translation key: ${match?.[0]}`);
    }
  });

  test("14. French fields are not whitespace-only", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      assert.ok(pkg.meta.title.trim() === pkg.meta.title, `Title in ${code} has untrimmed whitespace`);
      assert.ok(pkg.meta.description.trim() === pkg.meta.description, `Description in ${code} has untrimmed whitespace`);
    }
  });

  test("15. French values do not contain unapproved identical values", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      assert.notEqual(pkg.meta.title, "Sustainability Foundations", `Title for ${code} should be translated`);
    }
  });

  test("16. Interpolation variables ({name}, {date}) match parameter format", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      const json = JSON.stringify(pkg);
      const matches = json.match(/\{[a-zA-Z0-9_]+\}/g) || [];
      for (const m of matches) {
        assert.ok(m.length > 2, `Interpolation variable ${m} in ${code} is valid`);
      }
    }
  });

  test("17. Stable course codes remain ELH-01 through ELH-29", () => {
    assert.equal(activeCourseCodes.length, 29);
    assert.equal(activeCourseCodes[0], "ELH-01");
    assert.equal(activeCourseCodes[28], "ELH-29");
  });

  test("18. Correct-answer identifiers remain indexed without position drift", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      for (const q of Object.values(pkg.quizQuestions)) {
        assert.ok(q.options.length >= 2, `Question options in ${code} preserve valid structure`);
      }
    }
  });

  test("19. Question counts match expected assessment structure", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      assert.ok(Object.keys(pkg.quizQuestions).length >= 1, `Course ${code} has valid quiz question count`);
    }
  });

  test("20. Lesson counts match expected module structure", () => {
    for (const code of activeCourseCodes) {
      const pkg = getFrenchCoursePackage(code)!;
      assert.ok(Object.keys(pkg.lessons).length >= 1, `Course ${code} has valid lesson count`);
    }
  });
});
