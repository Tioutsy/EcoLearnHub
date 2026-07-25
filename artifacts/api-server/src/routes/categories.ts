import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, courseCategoryAssignmentsTable } from "@workspace/db";
import { eq, count, asc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res): Promise<void> => {
  const categories = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.isVisible, true))
    .orderBy(asc(categoriesTable.displayOrder), asc(categoriesTable.name));

  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const [result] = await db
        .select({ count: count() })
        .from(courseCategoryAssignmentsTable)
        .where(eq(courseCategoryAssignmentsTable.categoryId, cat.id));

      return {
        ...cat,
        courseCount: result?.count ?? cat.courseCount ?? 0,
      };
    })
  );

  res.json(withCounts);
});

export default router;
