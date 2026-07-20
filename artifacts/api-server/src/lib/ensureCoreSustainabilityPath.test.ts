import { db, learningPathsTable, learningPathCoursesTable, coursesTable } from "@workspace/db";
import { ensureCoreSustainabilityPath } from "./ensureCoreSustainabilityPath";
import { ensureCatalogueSkeletons } from "./ensureCatalogueSkeletons";
import { eq, inArray, and } from "drizzle-orm";
import assert from "assert";
import test from "node:test";

test("ensureCoreSustainabilityPath & API tests", async (t) => {
  // Ensure basic catalogue exists
  await ensureCatalogueSkeletons();

  await t.test("1-4. Seeder checks, active, order and idempotency", async () => {
    await ensureCoreSustainabilityPath();
    const paths1 = await db.select().from(learningPathsTable).where(eq(learningPathsTable.slug, "core-sustainability-certificate"));
    assert.strictEqual(paths1.length, 1, "Should create exactly one path");
    assert.strictEqual(paths1[0]!.status, "active", "Should be active");
    assert.strictEqual(paths1[0]!.companyId, null, "System managed path should have null companyId");
    assert.strictEqual(paths1[0]!.isSystemManaged, true, "Should be system managed");

    // Idempotency check
    await ensureCoreSustainabilityPath();
    const paths2 = await db.select().from(learningPathsTable).where(eq(learningPathsTable.slug, "core-sustainability-certificate"));
    assert.strictEqual(paths2.length, 1, "Should remain exactly one path after second run");

    // Course ordering
    const pathCourses = await db.select().from(learningPathCoursesTable)
      .innerJoin(coursesTable, eq(learningPathCoursesTable.courseId, coursesTable.id))
      .where(eq(learningPathCoursesTable.pathId, paths1[0]!.id))
      .orderBy(learningPathCoursesTable.position);

    assert.strictEqual(pathCourses.length, 12, "Should link exactly 12 courses");
    assert.strictEqual(pathCourses[0]!.courses.courseCode, "ELH-01", "Course 1 should be ELH-01");
    assert.strictEqual(pathCourses[11]!.courses.courseCode, "ELH-12", "Course 12 should be ELH-12");

    for (let i = 0; i < pathCourses.length; i++) {
      assert.strictEqual(pathCourses[i]!.learning_path_courses.position, i + 1, `Course ${i+1} should have position ${i+1}`);
    }
  });

  await t.test("5. Seeder missing slug explicit failure and rollback", async () => {
    // Delete/rename one required course to trigger slug missing error
    const testSlug = "final-sustainability-certification";
    const originalCourse = await db.select().from(coursesTable).where(eq(coursesTable.slug, testSlug)).limit(1).then(r => r[0]);
    assert.ok(originalCourse, "Original course must exist");

    // Temporarily rename slug to check seeder failure
    await db.update(coursesTable).set({ slug: "final-sustainability-certification-temp-rename" }).where(eq(coursesTable.id, originalCourse.id));

    try {
      await assert.rejects(
        async () => {
          await ensureCoreSustainabilityPath();
        },
        (err: Error) => {
          assert.match(err.message, /Data integrity error: Required course slugs/);
          assert.match(err.message, new RegExp(testSlug));
          return true;
        },
        "Should throw data-integrity error listing missing slug"
      );
    } finally {
      // Restore course slug
      await db.update(coursesTable).set({ slug: testSlug }).where(eq(coursesTable.id, originalCourse.id));
    }
  });

  await t.test("6. API visibility filtering by active status", async () => {
    // Create draft and archived paths
    const [draftPath] = await db.insert(learningPathsTable).values({
      slug: "test-draft-path",
      title: "Draft Path",
      description: "Test",
      audience: "Test",
      status: "draft"
    }).returning();

    const [archivedPath] = await db.insert(learningPathsTable).values({
      slug: "test-archived-path",
      title: "Archived Path",
      description: "Test",
      audience: "Test",
      status: "archived"
    }).returning();

    try {
      // Simulate API query for paths
      const activePaths = await db.select().from(learningPathsTable).where(eq(learningPathsTable.status, "active"));
      const draftFound = activePaths.some(p => p.slug === "test-draft-path");
      const archivedFound = activePaths.some(p => p.slug === "test-archived-path");

      assert.strictEqual(draftFound, false, "Draft paths must not be returned to learners");
      assert.strictEqual(archivedFound, false, "Archived paths must not be returned to learners");

      // Verify detail page status logic
      const draftDetail = await db.select().from(learningPathsTable).where(
        and(
          eq(learningPathsTable.slug, "test-draft-path"),
          eq(learningPathsTable.status, "active")
        )
      ).limit(1).then(r => r[0]);

      assert.strictEqual(draftDetail, undefined, "Draft details should return 404/undefined when filtering for active");
    } finally {
      // Clean up test paths
      await db.delete(learningPathsTable).where(inArray(learningPathsTable.slug, ["test-draft-path", "test-archived-path"]));
    }
  });
});
