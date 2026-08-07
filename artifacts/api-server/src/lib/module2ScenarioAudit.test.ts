import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { frenchCourseRegistry } from "./frenchCourseContent";

describe("Audit: Module 2 Decision Scenarios Across All 29 Courses (ELH-01 to ELH-29)", () => {
  test("Verify every single course from ELH-01 to ELH-29 contains an interactive decision scenario in Module 2", () => {
    const missingScenarios: string[] = [];

    for (let i = 1; i <= 29; i++) {
      const code = `ELH-${String(i).padStart(2, "0")}`;
      const pkg = frenchCourseRegistry[code];

      if (!pkg) {
        missingScenarios.push(`${code}: Missing course package in registry`);
        continue;
      }

      // Check all lessons in course package for decision scenario block
      let foundScenario = false;
      for (const [lessonIndex, lesson] of Object.entries(pkg.lessons)) {
        const blocks = lesson.blocks || [];
        const scenarioBlock = blocks.find(
          (b) => b.type === "decision_scenario" || b.type === "scenario"
        );

        if (scenarioBlock && scenarioBlock.decisionOptions && scenarioBlock.decisionOptions.length >= 2) {
          foundScenario = true;
          break;
        }
      }

      if (!foundScenario) {
        missingScenarios.push(`${code}: No interactive decision_scenario found in Module 2 or lessons`);
      }
    }

    if (missingScenarios.length > 0) {
      console.error("Module 2 Audit Failures:", missingScenarios);
    }

    assert.equal(
      missingScenarios.length,
      0,
      `Expected 0 courses lacking Module 2 decision scenario questions, found ${missingScenarios.length}: ${missingScenarios.join(", ")}`
    );
  });
});
