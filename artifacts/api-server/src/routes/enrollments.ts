import { Router } from "express";
import { db } from "@workspace/db";
import { enrollmentsTable, coursesTable, lessonProgressTable, lessonsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateEnrollmentBody, UpdateProgressBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res): Promise<void> => {
  const userId = (req as any).auth?.userId ?? "demo-user";
  const enrollments = await db
    .select({
      id: enrollmentsTable.id,
      userId: enrollmentsTable.userId,
      courseId: enrollmentsTable.courseId,
      courseName: coursesTable.title,
      courseThumbnail: coursesTable.thumbnailUrl,
      status: enrollmentsTable.status,
      progressPct: enrollmentsTable.progressPct,
      lastAccessedAt: enrollmentsTable.lastAccessedAt,
      completedAt: enrollmentsTable.completedAt,
      createdAt: enrollmentsTable.createdAt,
    })
    .from(enrollmentsTable)
    .leftJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
    .where(eq(enrollmentsTable.userId, userId));
  res.json(enrollments);
});

router.post("/", async (req, res): Promise<void> => {
  const userId = (req as any).auth?.userId ?? "demo-user";
  const parsed = CreateEnrollmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(enrollmentsTable)
    .where(and(eq(enrollmentsTable.userId, userId), eq(enrollmentsTable.courseId, parsed.data.courseId)));

  if (existing.length > 0) {
    res.status(400).json({ error: "Already enrolled in this course" });
    return;
  }

  const [enrollment] = await db
    .insert(enrollmentsTable)
    .values({ userId, courseId: parsed.data.courseId })
    .returning();
  res.status(201).json(enrollment);
});

router.get("/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [enrollment] = await db
    .select({
      id: enrollmentsTable.id,
      userId: enrollmentsTable.userId,
      courseId: enrollmentsTable.courseId,
      courseName: coursesTable.title,
      courseThumbnail: coursesTable.thumbnailUrl,
      status: enrollmentsTable.status,
      progressPct: enrollmentsTable.progressPct,
      lastAccessedAt: enrollmentsTable.lastAccessedAt,
      completedAt: enrollmentsTable.completedAt,
      createdAt: enrollmentsTable.createdAt,
    })
    .from(enrollmentsTable)
    .leftJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
    .where(eq(enrollmentsTable.id, id));

  if (!enrollment) {
    res.status(404).json({ error: "Enrollment not found" });
    return;
  }
  res.json(enrollment);
});

// Progress sub-routes
router.get("/progress/:enrollmentId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.enrollmentId) ? req.params.enrollmentId[0] : req.params.enrollmentId;
  const enrollmentId = parseInt(raw, 10);
  if (isNaN(enrollmentId)) {
    res.status(400).json({ error: "Invalid enrollmentId" });
    return;
  }

  const progressRows = await db
    .select({
      id: lessonProgressTable.id,
      enrollmentId: lessonProgressTable.enrollmentId,
      lessonId: lessonProgressTable.lessonId,
      lessonTitle: lessonsTable.title,
      completed: lessonProgressTable.completed,
      watchedSeconds: lessonProgressTable.watchedSeconds,
      completedAt: lessonProgressTable.completedAt,
    })
    .from(lessonProgressTable)
    .leftJoin(lessonsTable, eq(lessonProgressTable.lessonId, lessonsTable.id))
    .where(eq(lessonProgressTable.enrollmentId, enrollmentId));

  res.json(progressRows.map((p) => ({ ...p, completed: p.completed === 1 })));
});

router.patch("/progress/:enrollmentId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.enrollmentId) ? req.params.enrollmentId[0] : req.params.enrollmentId;
  const enrollmentId = parseInt(raw, 10);
  if (isNaN(enrollmentId)) {
    res.status(400).json({ error: "Invalid enrollmentId" });
    return;
  }

  const parsed = UpdateProgressBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { lessonId, completed, watchedSeconds } = parsed.data;

  const existing = await db
    .select()
    .from(lessonProgressTable)
    .where(and(eq(lessonProgressTable.enrollmentId, enrollmentId), eq(lessonProgressTable.lessonId, lessonId)));

  let progress;
  if (existing.length > 0) {
    const [updated] = await db
      .update(lessonProgressTable)
      .set({
        completed: completed ? 1 : 0,
        watchedSeconds: watchedSeconds ?? existing[0].watchedSeconds,
        completedAt: completed ? new Date() : null,
      })
      .where(eq(lessonProgressTable.id, existing[0].id))
      .returning();
    progress = updated;
  } else {
    const [created] = await db
      .insert(lessonProgressTable)
      .values({
        enrollmentId,
        lessonId,
        completed: completed ? 1 : 0,
        watchedSeconds: watchedSeconds ?? 0,
        completedAt: completed ? new Date() : null,
      })
      .returning();
    progress = created;
  }

  // Update overall enrollment progress
  const [enrollment] = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.id, enrollmentId));
  if (enrollment) {
    const allLessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, enrollment.courseId));
    const completedLessons = await db
      .select()
      .from(lessonProgressTable)
      .where(and(eq(lessonProgressTable.enrollmentId, enrollmentId), eq(lessonProgressTable.completed, 1)));
    const pct = allLessons.length > 0 ? Math.round((completedLessons.length / allLessons.length) * 100) : 0;
    await db
      .update(enrollmentsTable)
      .set({
        progressPct: pct,
        lastAccessedAt: new Date(),
        status: pct === 100 ? "completed" : "active",
        completedAt: pct === 100 ? new Date() : null,
      })
      .where(eq(enrollmentsTable.id, enrollmentId));
  }

  const [withLesson] = await db
    .select({
      id: lessonProgressTable.id,
      enrollmentId: lessonProgressTable.enrollmentId,
      lessonId: lessonProgressTable.lessonId,
      lessonTitle: lessonsTable.title,
      completed: lessonProgressTable.completed,
      watchedSeconds: lessonProgressTable.watchedSeconds,
      completedAt: lessonProgressTable.completedAt,
    })
    .from(lessonProgressTable)
    .leftJoin(lessonsTable, eq(lessonProgressTable.lessonId, lessonsTable.id))
    .where(eq(lessonProgressTable.id, progress.id));

  res.json({ ...withLesson, completed: withLesson!.completed === 1 });
});

export default router;
