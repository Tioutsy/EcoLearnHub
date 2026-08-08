import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  coursePrerequisitesTable,
} from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { ensureEsgInMyJobCourse } from "./ensureEsgInMyJobCourse";
import { ensureEsgDataCourse } from "./ensureEsgDataCourse";
import { ensureEthicsGovernanceCourse } from "./ensureEthicsGovernanceCourse";
import { ensureSocialResponsibilityAtWorkCourse } from "./ensureSocialResponsibilityAtWorkCourse";
import fs from "node:fs";
import path from "node:path";

function sortCoursesByCode<T extends { courseCode?: string | null; title?: string | null }>(
  courses: T[]
): T[] {
  if (!courses || !Array.isArray(courses)) return [];
  return [...courses].sort((a, b) => {
    const codeA = a.courseCode?.trim().toUpperCase() ?? "";
    const codeB = b.courseCode?.trim().toUpperCase() ?? "";
    if (!codeA && !codeB) return (a.title ?? "").localeCompare(b.title ?? "");
    if (!codeA) return 1;
    if (!codeB) return -1;
    const matchA = codeA.match(/^ELH-(\d+)$/);
    const matchB = codeB.match(/^ELH-(\d+)$/);
    if (matchA && matchB) {
      return parseInt(matchA[1], 10) - parseInt(matchB[1], 10);
    }
    if (matchA) return -1;
    if (matchB) return 1;
    return codeA.localeCompare(codeB);
  });
}

import { ensureEffectiveGreenTeamsCourse } from "./ensureEffectiveGreenTeamsCourse";
import { ensureWorkplaceSustainabilityInitiativesCourse } from "./ensureWorkplaceSustainabilityInitiativesCourse";
import { ensureSustainabilityForHrTeamsCourse } from "./ensureSustainabilityForHrTeamsCourse";
import { ensureSustainabilityForFinanceTeamsCourse } from "./ensureSustainabilityForFinanceTeamsCourse";
import { ensureSustainabilityForProcurementAndPurchasingTeamsCourse } from "./ensureSustainabilityForProcurementAndPurchasingTeamsCourse";
import { ensureSustainabilityForOperationsAndFrontlineTeamsCourse } from "./ensureSustainabilityForOperationsAndFrontlineTeamsCourse";
import { ensureSustainabilityForFacilitiesAndPropertyTeamsCourse } from "./ensureSustainabilityForFacilitiesAndPropertyTeamsCourse";
import { ensureSustainabilityForSalesAndMarketingTeamsCourse } from "./ensureSustainabilityForSalesAndMarketingTeamsCourse";
import { ensureClimateRiskCourse } from "./ensureClimateRiskCourse";
import { ensureCatalogueSkeletons } from "./ensureCatalogueSkeletons";
import { ensureCoreSustainabilityPath } from "./ensureCoreSustainabilityPath";

describe("Sprint — ELH-01 to ELH-34 Catalogue-Wide Master Launch Assurance", () => {
  test("1. All 34 courses (ELH-01 through ELH-34) exist with unique codes and slugs", async () => {
    // Ensure catalogue skeletons and all course seeders have run
    await ensureCatalogueSkeletons();
    await ensureCoreSustainabilityPath();
    await ensureEffectiveGreenTeamsCourse();
    await ensureWorkplaceSustainabilityInitiativesCourse();
    await ensureSustainabilityForHrTeamsCourse();
    await ensureSustainabilityForFinanceTeamsCourse();
    await ensureSustainabilityForProcurementAndPurchasingTeamsCourse();
    await ensureSustainabilityForOperationsAndFrontlineTeamsCourse();
    await ensureSustainabilityForFacilitiesAndPropertyTeamsCourse();
    await ensureSustainabilityForSalesAndMarketingTeamsCourse();
    await ensureClimateRiskCourse();
    await ensureSocialResponsibilityAtWorkCourse();
    await ensureEthicsGovernanceCourse();
    await ensureEsgDataCourse();
    await ensureEsgInMyJobCourse();

    const allCourses = await db.select().from(coursesTable);
    console.log(`Found ${allCourses.length} courses in DB. Codes:`, allCourses.map(c => c.courseCode).filter(Boolean));
    assert.ok(allCourses.length >= 34, `Must have at least 34 courses in DB, found ${allCourses.length}`);

    const expectedCodes = Array.from({ length: 34 }, (_, i) => `ELH-${(i + 1).toString().padStart(2, "0")}`);
    const foundCodes = new Set(allCourses.map((c) => c.courseCode).filter(Boolean));

    for (const code of expectedCodes) {
      assert.ok(foundCodes.has(code), `Course code ${code} must exist in database`);
    }

    // Assert slug uniqueness
    const slugs = allCourses.map((c) => c.slug);
    const uniqueSlugs = new Set(slugs);
    assert.equal(slugs.length, uniqueSlugs.size, "All course slugs must be unique");
  });

  test("2. Lesson integrity & content blocks across all 34 courses", async () => {
    const expectedCodes = Array.from({ length: 34 }, (_, i) => `ELH-${(i + 1).toString().padStart(2, "0")}`);
    const courses = await db
      .select()
      .from(coursesTable)
      .where(inArray(coursesTable.courseCode, expectedCodes));

    for (const course of courses) {
      const lessons = await db
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, course.id));

      assert.ok(
        lessons.length >= 3,
        `Course ${course.courseCode} (${course.title}) must have at least 3 lessons, found ${lessons.length}`
      );

      for (const lesson of lessons) {
        assert.ok(
          lesson.title && lesson.title.trim().length > 0,
          `Lesson title in ${course.courseCode} must not be empty`
        );
      }
    }
  });

  test("3. Quiz integrity & Position 1 bias audit across all 34 courses", async () => {
    const expectedCodes = Array.from({ length: 34 }, (_, i) => `ELH-${(i + 1).toString().padStart(2, "0")}`);
    const courses = await db
      .select()
      .from(coursesTable)
      .where(inArray(coursesTable.courseCode, expectedCodes));

    let globalTotalQuestions = 0;
    let globalPosition1Count = 0;
    const perCourseStats: Record<string, { total: number; p1: number; p1Pct: number }> = {};

    for (const course of courses) {
      const questions = await db
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, course.id));

      assert.ok(
        questions.length >= 3,
        `Course ${course.courseCode} (${course.title}) must have at least 3 quiz questions, found ${questions.length}`
      );

      let p1Count = 0;
      for (const q of questions) {
        assert.ok(q.question && q.question.trim().length > 0, `Quiz question in ${course.courseCode} must not be empty`);
        assert.ok(
          Array.isArray(q.options) && q.options.length >= 2,
          `Quiz question in ${course.courseCode} must have at least 2 options`
        );
        assert.ok(
          q.correctOption >= 0 && q.correctOption < q.options.length,
          `Quiz question in ${course.courseCode} must have valid correctOption index`
        );

        if (q.correctOption === 0) {
          p1Count++;
          globalPosition1Count++;
        }
        globalTotalQuestions++;
      }

      const p1Pct = (p1Count / questions.length) * 100;
      perCourseStats[course.courseCode || "UNKNOWN"] = {
        total: questions.length,
        p1: p1Count,
        p1Pct: Math.round(p1Pct * 10) / 10,
      };

      // Individual course Position 1 dominance check (< 50% threshold)
      assert.ok(
        p1Pct < 50,
        `Course ${course.courseCode} has Position 1 dominance (${p1Pct.toFixed(1)}% of correct answers in Position 1)`
      );
    }

    const globalP1Pct = (globalPosition1Count / globalTotalQuestions) * 100;
    console.log(`Global Quiz Audit: ${globalTotalQuestions} total questions, ${globalPosition1Count} in Position 1 (${globalP1Pct.toFixed(1)}%)`);
    assert.ok(globalP1Pct < 50, `Global Position 1 dominance must be < 50%, found ${globalP1Pct.toFixed(1)}%`);
  });

  test("4. Prerequisite resolution for intermediate and applied ESG courses", async () => {
    const elh31 = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-31")).limit(1);
    const elh32 = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-32")).limit(1);
    const elh33 = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-33")).limit(1);
    const elh34 = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-34")).limit(1);
    const elh09 = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-09")).limit(1);

    assert.ok(elh09[0], "ELH-09 must exist");

    for (const c of [elh31[0], elh32[0], elh33[0], elh34[0]]) {
      if (c) {
        const [prereq] = await db
          .select()
          .from(coursePrerequisitesTable)
          .where(eq(coursePrerequisitesTable.courseId, c.id))
          .limit(1);
        assert.ok(prereq, `Course ${c.courseCode} must have registered prerequisite link`);
        assert.equal(prereq.prerequisiteCourseId, elh09[0].id, `Course ${c.courseCode} prerequisite must be ELH-09`);
      }
    }
  });

  test("5. Image asset resolution across all 34 courses", async () => {
    const courses = await db.select().from(coursesTable);
    const publicDir = path.resolve(process.cwd(), "../ecolearn/public");

    for (const course of courses) {
      if (course.thumbnailUrl) {
        const fullPath = path.join(publicDir, course.thumbnailUrl);
        assert.ok(
          fs.existsSync(fullPath),
          `Thumbnail asset for ${course.courseCode} (${course.thumbnailUrl}) must exist on disk at ${fullPath}`
        );
      }
    }
  });

  test("6. Numerical course code ordering across all 34 courses", async () => {
    const fullList = Array.from({ length: 34 }, (_, i) => ({
      courseCode: `ELH-${(i + 1).toString().padStart(2, "0")}`,
    }));
    const shuffled = [...fullList].sort(() => Math.random() - 0.5);
    const sorted = sortCoursesByCode(shuffled);

    for (let i = 0; i < 34; i++) {
      const expectedCode = `ELH-${(i + 1).toString().padStart(2, "0")}`;
      assert.equal(sorted[i].courseCode, expectedCode, `Sorted index ${i} must be ${expectedCode}`);
    }
  });
});
