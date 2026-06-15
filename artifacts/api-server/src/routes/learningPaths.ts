import { Router } from "express";
import { db } from "@workspace/db";
import {
  learningPathsTable,
  learningPathCoursesTable,
  coursesTable,
  enrollmentsTable,
} from "@workspace/db";
import { eq, asc, and } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId ?? "demo-user";

    const paths = await db
      .select()
      .from(learningPathsTable)
      .orderBy(asc(learningPathsTable.orderIndex));

    const pathCourses = await db
      .select({
        pathId: learningPathCoursesTable.pathId,
        orderIndex: learningPathCoursesTable.orderIndex,
        courseId: coursesTable.id,
        courseTitle: coursesTable.title,
        durationMinutes: coursesTable.durationMinutes,
        level: coursesTable.level,
      })
      .from(learningPathCoursesTable)
      .innerJoin(coursesTable, eq(learningPathCoursesTable.courseId, coursesTable.id))
      .orderBy(asc(learningPathCoursesTable.pathId), asc(learningPathCoursesTable.orderIndex));

    const completedRows = await db
      .select({ courseId: enrollmentsTable.courseId })
      .from(enrollmentsTable)
      .where(
        and(
          eq(enrollmentsTable.userId, userId),
          eq(enrollmentsTable.status, "completed"),
        ),
      );
    const completedSet = new Set(completedRows.map((r) => r.courseId));

    const result = paths.map((path) => {
      const modules = pathCourses
        .filter((c) => c.pathId === path.id)
        .map((c) => ({
          courseId: c.courseId,
          courseTitle: c.courseTitle,
          durationMinutes: c.durationMinutes,
          level: c.level,
          orderIndex: c.orderIndex,
          completed: completedSet.has(c.courseId),
        }));

      const totalModules = modules.length;
      const completedModules = modules.filter((m) => m.completed).length;
      const progressPct =
        totalModules > 0
          ? Math.round((completedModules / totalModules) * 100)
          : 0;
      const totalMinutes = modules.reduce((sum, m) => sum + m.durationMinutes, 0);

      return {
        id: path.id,
        slug: path.slug,
        title: path.title,
        description: path.description,
        audience: path.audience,
        icon: path.icon,
        totalModules,
        completedModules,
        progressPct,
        totalMinutes,
        modules,
      };
    });

    res.json(result);
  } catch (err) {
    req.log?.error?.({ err }, "Failed to list learning paths");
    res.status(500).json({ error: "Failed to load learning paths" });
  }
});

export default router;
