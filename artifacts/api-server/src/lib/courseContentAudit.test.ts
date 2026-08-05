import { test, before, describe } from "node:test";
import assert from "node:assert/strict";
import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { runCourseContentDiagnostics } from "./courseContentDiagnostics";
import { ensureFoundationsCourse } from "./ensureFoundationsCourse";
import { ensureCarbonFootprintCourse } from "./ensureCarbonFootprintCourse";
import { ensureAppliedCourseBadges } from "./ensureAppliedCourseBadges";

import { ensureCatalogueSkeletons } from "./ensureCatalogueSkeletons";

describe("Sprint 7X: Full Course Content, Quiz & Learning Experience Audit", () => {
  before(async () => {
    // Ensure critical seeders and catalogue skeletons have run
    await ensureCatalogueSkeletons();
    await ensureCarbonFootprintCourse();
    await ensureAppliedCourseBadges();
  });

  test("Database contains all 29 courses (ELH-01 through ELH-29)", async () => {
    const courses = await db
      .select({ id: coursesTable.id, code: coursesTable.courseCode, title: coursesTable.title })
      .from(coursesTable);

    assert.ok(courses.length >= 29, `Expected at least 29 courses in database, found ${courses.length}`);

    // Verify ELH-01..29 presence
    const codes = new Set(courses.map(c => c.code));
    for (let i = 1; i <= 29; i++) {
      const expectedCode = `ELH-${String(i).padStart(2, "0")}`;
      assert.ok(codes.has(expectedCode), `Expected course code ${expectedCode} to exist in database`);
    }
  });

  test("ELH-07 (Carbon Footprint Awareness) lessons contain non-empty content blocks", async () => {
    const [elh07] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-07"))
      .limit(1);

    assert.ok(elh07, "Course ELH-07 must exist in database");

    const lessons = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, elh07.id));

    assert.ok(lessons.length > 0, "ELH-07 must have lessons");

    for (const lesson of lessons) {
      const blocks = (Array.isArray(lesson.contentBlocks) ? lesson.contentBlocks : []) as any[];
      assert.ok(blocks.length > 0, `Lesson '${lesson.title}' in ELH-07 must not be empty`);
    }
  });

  test("All published courses (ELH-01..29) have valid badge metadata", async () => {
    const allCourses = await db
      .select()
      .from(coursesTable);

    const courses = allCourses.filter(c => c.courseCode && c.courseCode.startsWith("ELH-"));

    for (const c of courses) {
      assert.ok(
        c.badgeName && c.badgeName.trim().length > 0,
        `Course ${c.courseCode} (${c.title}) must have non-empty badgeName`
      );
    }
  });

  test("Course content diagnostics pass with 0 critical issues across all courses", async () => {
    const report = await runCourseContentDiagnostics();

    const criticals = report.issues.filter(i => i.severity === "CRITICAL");
    if (criticals.length > 0) {
      console.error("Critical Diagnostic Failures:", criticals);
    }

    assert.equal(report.criticalIssuesCount, 0, `Expected 0 critical issues, found ${report.criticalIssuesCount}`);
  });
});
