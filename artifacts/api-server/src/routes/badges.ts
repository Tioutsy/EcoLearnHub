import { Router } from "express";
import { db } from "@workspace/db";
import { badgeDefinitionsTable, enrollmentsTable } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId ?? "demo-user";

    const definitions = await db
      .select()
      .from(badgeDefinitionsTable)
      .orderBy(asc(badgeDefinitionsTable.orderIndex));

    const completed = await db
      .select({
        courseId: enrollmentsTable.courseId,
        completedAt: enrollmentsTable.completedAt,
      })
      .from(enrollmentsTable)
      .where(
        and(
          eq(enrollmentsTable.userId, userId),
          eq(enrollmentsTable.status, "completed"),
        ),
      );

    const completedCourseIds = new Set(completed.map((c) => c.courseId));
    const completedDateByCourse = new Map<number, Date | null>(
      completed.map((c) => [c.courseId, c.completedAt]),
    );
    const totalCompleted = completed.length;

    const result = definitions.map((def) => {
      let earned = false;
      let current = 0;
      let target = 1;
      let earnedAt: string | null = null;

      if (def.criteriaType === "min_courses") {
        // Guard against malformed definitions: a threshold below 1 must never
        // auto-award (the column defaults to 0), so treat it as not earnable.
        target = Math.max(def.threshold, 1);
        current = Math.min(totalCompleted, target);
        earned = def.threshold >= 1 && totalCompleted >= def.threshold;
        if (earned) {
          // earnedAt = completion date of the Nth completed course (chronological)
          const sortedDates = completed
            .map((c) => c.completedAt)
            .filter((d): d is Date => d != null)
            .sort((a, b) => a.getTime() - b.getTime());
          const nth = sortedDates[def.threshold - 1];
          earnedAt = nth ? nth.toISOString() : null;
        }
      } else if (def.criteriaType === "all_courses") {
        target = def.courseIds.length;
        current = def.courseIds.filter((id) => completedCourseIds.has(id)).length;
        earned = target > 0 && current === target;
        if (earned) {
          // earnedAt = latest completion among the required courses
          const dates = def.courseIds
            .map((id) => completedDateByCourse.get(id) ?? null)
            .filter((d): d is Date => d != null);
          if (dates.length > 0) {
            earnedAt = new Date(
              Math.max(...dates.map((d) => d.getTime())),
            ).toISOString();
          }
        }
      }

      return {
        id: def.id,
        slug: def.slug,
        name: def.name,
        description: def.description,
        icon: def.icon,
        earned,
        earnedAt,
        progressCurrent: current,
        progressTarget: target,
      };
    });

    res.json(result);
  } catch (err) {
    req.log?.error?.({ err }, "Failed to list badges");
    res.status(500).json({ error: "Failed to load badges" });
  }
});

export default router;
