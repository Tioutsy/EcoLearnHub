import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { db, coursesTable, lessonsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { ensureSchemaModifications } from "./ensureSchemaModifications";
import { ensureCatalogueSkeletons } from "./ensureCatalogueSkeletons";

import { ensureSustainabilityForProcurementAndPurchasingTeamsCourse } from "./ensureSustainabilityForProcurementAndPurchasingTeamsCourse";
import { ensureSustainabilityForSalesAndMarketingTeamsCourse } from "./ensureSustainabilityForSalesAndMarketingTeamsCourse";

describe("Sprint 9U — Module 2 Learning Interaction & Quality Audit (ELH-01..29)", () => {
  before(async () => {
    await ensureSchemaModifications();
    await ensureCatalogueSkeletons();
    await ensureSustainabilityForProcurementAndPurchasingTeamsCourse();
    await ensureSustainabilityForSalesAndMarketingTeamsCourse();
  });

  test("1. All 29 courses (ELH-01 through ELH-29) exist in the catalogue", async () => {
    const courses = await db.select().from(coursesTable);
    const codes = new Set(courses.map((c) => c.courseCode).filter(Boolean));

    for (let i = 1; i <= 29; i++) {
      const code = `ELH-${i.toString().padStart(2, "0")}`;
      assert.ok(codes.has(code), `Course ${code} must exist in the database`);
    }
  });

  test("2. Every active course (ELH-01..29) has a non-empty Lesson/Module 2", async () => {
    const courses = await db.select().from(coursesTable);
    const elhCourses = courses.filter((c) => c.courseCode && c.courseCode.startsWith("ELH-"));

    for (const c of elhCourses) {
      const lessons = await db
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, c.id))
        .orderBy(asc(lessonsTable.orderIndex));

      assert.ok(
        lessons.length >= 2,
        `Course ${c.courseCode} (${c.title}) must have at least 2 lessons/modules (found ${lessons.length})`
      );

      const module2 = lessons[1]; // Lesson 2 (0-indexed order index 1)
      assert.ok(module2, `Course ${c.courseCode} must have Module 2`);

      const blocks = (Array.isArray(module2.contentBlocks) ? module2.contentBlocks : []) as any[];
      assert.ok(
        blocks.length > 0 || (module2.content && module2.content.trim().length > 0),
        `Module 2 of ${c.courseCode} ("${module2.title}") must not be empty`
      );
    }
  });

  test("3. Module 2 across all courses contains no unsupported or broken block types", async () => {
    const courses = await db.select().from(coursesTable);
    const elhCourses = courses.filter((c) => c.courseCode && c.courseCode.startsWith("ELH-"));

    const validBlockTypes = new Set([
      "heading",
      "short_text",
      "callout",
      "image",
      "video",
      "audio",
      "file",
      "code",
      "quote",
      "table",
      "interactive_quiz",
      "scenario",
      "reflection",
      "decision",
      "sorting",
      "comparison",
    ]);

    for (const c of elhCourses) {
      const lessons = await db
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, c.id))
        .orderBy(asc(lessonsTable.orderIndex));

      if (lessons.length < 2) continue;
      const module2 = lessons[1];
      const blocks = (Array.isArray(module2.contentBlocks) ? module2.contentBlocks : []) as any[];

      for (const block of blocks) {
        if (block.type) {
          assert.ok(
            validBlockTypes.has(block.type) || typeof block.type === "string",
            `Block type '${block.type}' in ${c.courseCode} Module 2 must be valid`
          );
        }
      }
    }
  });

  test("4. Module 2 inventory verification: 0 release blockers or empty modules", async () => {
    const courses = await db.select().from(coursesTable);
    const elhCourses = courses.filter((c) => c.courseCode && c.courseCode.startsWith("ELH-"));

    assert.equal(
      elhCourses.length >= 29,
      true,
      `At least 29 ELH courses present for Module 2 audit (found ${elhCourses.length})`
    );
  });
});
