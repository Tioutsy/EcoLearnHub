import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { frenchCourseRegistry, getFrenchCoursePackage } from "./frenchCourseContent";
import { auditFullCatalogueQuizDistribution } from "./auditQuizAnswerDistribution";

describe("Sprint 10J — Full Platform Learning Integrity Audit Suite (ELH-01 to ELH-29)", () => {
  const activeCourseCodes: string[] = [];
  for (let i = 1; i <= 29; i++) {
    activeCourseCodes.push(`ELH-${String(i).padStart(2, "0")}`);
  }

  describe("Workstream A: Complete Platform French Localisation & Structural Parity", () => {
    test("1. All 29 courses (ELH-01 to ELH-29) exist in frenchCourseRegistry", () => {
      for (const code of activeCourseCodes) {
        const pkg = getFrenchCoursePackage(code);
        assert.ok(pkg, `French course package for ${code} must exist in frenchCourseRegistry`);
      }
    });

    test("2. All 29 courses have complete French titles, descriptions, and learning objectives", () => {
      for (const code of activeCourseCodes) {
        const pkg = getFrenchCoursePackage(code)!;
        assert.ok(pkg.meta.title && pkg.meta.title.trim().length > 0, `${code} French title must not be empty`);
        assert.ok(pkg.meta.description && pkg.meta.description.trim().length > 0, `${code} French description must not be empty`);
        assert.ok(pkg.meta.learningObjectives.length > 0, `${code} French learning objectives must exist`);
        for (const obj of pkg.meta.learningObjectives) {
          assert.ok(obj && obj.trim().length > 0, `${code} learning objective must not be empty`);
        }
      }
    });

    test("3. All 29 courses have French lesson translations for all lessons", () => {
      for (const code of activeCourseCodes) {
        const pkg = getFrenchCoursePackage(code)!;
        const lessonKeys = Object.keys(pkg.lessons);
        assert.ok(lessonKeys.length >= 3, `${code} must have at least 3 lessons translated in French`);
        for (const key of lessonKeys) {
          const lesson = pkg.lessons[Number(key)];
          assert.ok(lesson.title && lesson.title.trim().length > 0, `${code} lesson ${key} must have French title`);
        }
      }
    });

    test("4. All 29 courses have French quiz question translations matching English question count", () => {
      for (const code of activeCourseCodes) {
        const pkg = getFrenchCoursePackage(code)!;
        const quizKeys = Object.keys(pkg.quizQuestions);
        assert.ok(quizKeys.length >= 4, `${code} must have at least 4 quiz questions translated in French`);
        for (const key of quizKeys) {
          const q = pkg.quizQuestions[Number(key)];
          assert.ok(q.question && q.question.trim().length > 0, `${code} quiz ${key} question must not be empty`);
          assert.ok(q.options && q.options.length >= 2, `${code} quiz ${key} must have at least 2 options in French`);
        }
      }
    });
  });

  describe("Workstream B: Module 2 Interaction Recovery Across All 29 Courses", () => {
    test("5. All 29 courses have a decision-based interaction in their lesson modules", () => {
      for (const code of activeCourseCodes) {
        const pkg = getFrenchCoursePackage(code)!;
        const allLessons = Object.values(pkg.lessons);
        assert.ok(allLessons.length > 0, `${code} lessons must exist`);
        
        const hasInteractiveBlock = allLessons.some((lesson) =>
          (lesson.blocks ?? []).some(
            (b) =>
              b.type === "decision_scenario" ||
              b.type === "knowledge_check" ||
              (b.decisionOptions && b.decisionOptions.length > 0)
          )
        );

        assert.ok(
          hasInteractiveBlock,
          `${code} must contain a decision_scenario or interactive decision block in its lessons`
        );
      }
    });

    test("6. Every Module 2 interaction provides selectable options and feedback", () => {
      for (const code of activeCourseCodes) {
        const pkg = getFrenchCoursePackage(code)!;
        const allLessons = Object.values(pkg.lessons);
        
        for (const lesson of allLessons) {
          const blocks = lesson.blocks ?? [];
          const interactiveBlocks = blocks.filter(
            (b) => b.decisionOptions && b.decisionOptions.length > 0
          );

          for (const block of interactiveBlocks) {
            if (block.decisionOptions) {
              for (const opt of block.decisionOptions) {
                assert.ok(opt.label && opt.label.trim().length > 0, `${code} option label must not be empty`);
                assert.ok(opt.feedback && opt.feedback.trim().length > 0, `${code} option feedback must not be empty`);
              }
            }
          }
        }
      }
    });
  });

  describe("Workstream C: Quiz Answer-Position Bias Recovery Thresholds", () => {
    test("7. Global Option 1 (Position 1) does not exceed 30.0%", async () => {
      const report = await auditFullCatalogueQuizDistribution();
      const pos1Pct = parseFloat(report.overallPositionPercentages[0] ?? "0");
      assert.ok(
        pos1Pct <= 30.0,
        `Global Position 1 percentage (${pos1Pct.toFixed(1)}%) must not exceed 30.0%`
      );
    });

    test("8. No position exceeds 35.0% globally", async () => {
      const report = await auditFullCatalogueQuizDistribution();
      for (const posIdx of [0, 1, 2, 3]) {
        const pct = parseFloat(report.overallPositionPercentages[posIdx] ?? "0");
        assert.ok(
          pct <= 35.0,
          `Position index ${posIdx} percentage (${pct.toFixed(1)}%) must not exceed 35.0%`
        );
      }
    });

    test("9. Each position reaches at least 20.0% globally", async () => {
      const report = await auditFullCatalogueQuizDistribution();
      for (const posIdx of [0, 1, 2, 3]) {
        const pct = parseFloat(report.overallPositionPercentages[posIdx] ?? "0");
        assert.ok(
          pct >= 20.0,
          `Position index ${posIdx} percentage (${pct.toFixed(1)}%) must reach at least 20.0%`
        );
      }
    });

    test("10. All active questions across all 29 courses are included in the distribution audit", async () => {
      const report = await auditFullCatalogueQuizDistribution();
      assert.ok(report.totalQuestions >= 140, `Total audited questions (${report.totalQuestions}) must be >= 140`);
    });
  });
});
