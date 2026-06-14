import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, coursesTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res): Promise<void> => {
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const [result] = await db
        .select({ count: count() })
        .from(coursesTable)
        .where(eq(coursesTable.categoryId, cat.id));
      return { ...cat, courseCount: result?.count ?? 0 };
    }),
  );
  res.json(withCounts);
});

export default router;
