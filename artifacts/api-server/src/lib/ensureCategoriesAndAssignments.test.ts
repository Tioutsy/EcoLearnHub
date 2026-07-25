import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { db, categoriesTable, courseCategoryAssignmentsTable, coursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ensureSchemaModifications } from "./ensureSchemaModifications";
import { ensureCategoriesAndAssignments } from "./ensureCategoriesAndAssignments";
import { checkCourseEligibility } from "./prerequisites";
import { getRecommendedNextCourse } from "./recommendationService";

describe("Sprint 7S: Course Catalogue Categories, Prerequisites and Learning Flow", () => {
  it("should create the 4 required categories idempotently", async () => {
    // Apply schema modifications first
    await ensureSchemaModifications();

    // Run category seeder twice to test idempotency
    await ensureCategoriesAndAssignments();
    await ensureCategoriesAndAssignments();

    const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.displayOrder);
    assert.ok(categories.length >= 4);

    const slugs = categories.map(c => c.slug);
    assert.ok(slugs.includes("core-sustainability-certificate"));
    assert.ok(slugs.includes("sustainability-in-action"));
    assert.ok(slugs.includes("sustainability-by-department"));
    assert.ok(slugs.includes("leadership-and-sustainability-management"));
  });

  it("should cross-list Leadership courses without duplicating course records", async () => {
    const leadershipCategory = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, "leadership-and-sustainability-management"))
      .limit(1)
      .then(rows => rows[0]);

    assert.ok(leadershipCategory);

    const assignments = await db
      .select({
        courseId: courseCategoryAssignmentsTable.courseId,
        isPrimary: courseCategoryAssignmentsTable.isPrimary,
      })
      .from(courseCategoryAssignmentsTable)
      .where(eq(courseCategoryAssignmentsTable.categoryId, leadershipCategory.id));

    assert.ok(assignments.length >= 6);
    // Leadership cross-listed courses must have isPrimary = false
    assert.ok(assignments.every(a => a.isPrimary === false));
  });

  it("should distinguish required vs recommended prerequisites", async () => {
    const elh23 = await db
      .select({ id: coursesTable.id })
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-23"))
      .limit(1)
      .then(rows => rows[0]);

    if (elh23) {
      const eligibility = await checkCourseEligibility(elh23.id, null);
      const recommendedPrereq = eligibility.prerequisites.find(p => p.slug === "sustainability-action-planning");
      const requiredPrereq = eligibility.prerequisites.find(p => p.slug === "final-sustainability-certification");

      assert.ok(recommendedPrereq);
      assert.strictEqual(recommendedPrereq?.requirementType, "recommended");

      if (requiredPrereq) {
        assert.strictEqual(requiredPrereq.requirementType, "required");
      }
    }
  });

  it("should calculate recommended next course for guest user", async () => {
    const recommendation = await getRecommendedNextCourse(null);
    assert.ok(recommendation);
    assert.ok(recommendation?.reasonHeading.includes("journey"));
    assert.strictEqual(recommendation?.actionText, "Start course");
  });
});
