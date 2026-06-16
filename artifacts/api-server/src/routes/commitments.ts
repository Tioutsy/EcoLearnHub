import { Router } from "express";
import { db } from "@workspace/db";
import { courseCommitmentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { SaveCommitmentsBody } from "@workspace/api-zod";

const router = Router();

router.get("/:courseId/commitments", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
  const courseId = parseInt(raw, 10);
  if (isNaN(courseId)) {
    res.status(400).json({ error: "Invalid courseId" });
    return;
  }

  const userId = (req as any).auth?.userId ?? "demo-user";
  const rows = await db
    .select({ commitment: courseCommitmentsTable.commitment })
    .from(courseCommitmentsTable)
    .where(
      and(
        eq(courseCommitmentsTable.userId, userId),
        eq(courseCommitmentsTable.courseId, courseId),
      ),
    );

  res.json({ courseId, commitments: rows.map((r) => r.commitment) });
});

router.post("/:courseId/commitments", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
  const courseId = parseInt(raw, 10);
  if (isNaN(courseId)) {
    res.status(400).json({ error: "Invalid courseId" });
    return;
  }

  const parsed = SaveCommitmentsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = (req as any).auth?.userId ?? "demo-user";
  const unique = Array.from(
    new Set(parsed.data.commitments.map((c) => c.trim()).filter((c) => c.length > 0)),
  );

  await db.transaction(async (tx) => {
    await tx
      .delete(courseCommitmentsTable)
      .where(
        and(
          eq(courseCommitmentsTable.userId, userId),
          eq(courseCommitmentsTable.courseId, courseId),
        ),
      );
    if (unique.length > 0) {
      await tx
        .insert(courseCommitmentsTable)
        .values(unique.map((commitment) => ({ userId, courseId, commitment })))
        .onConflictDoNothing();
    }
  });

  res.json({ courseId, commitments: unique });
});

export default router;
