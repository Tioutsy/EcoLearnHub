import { Router } from "express";
import { db } from "@workspace/db";
import { enrollmentsTable, coursesTable, lessonsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateEnrollmentBody } from "@workspace/api-zod";

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

  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, enrollment.courseId));

  const lessons = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, enrollment.courseId))
    .orderBy(lessonsTable.orderIndex);

  res.json({
    ...enrollment,
    course: course
      ? {
          ...course,
          priceUsd: parseFloat(course.priceUsd),
          rating: course.rating != null ? parseFloat(course.rating) : null,
          lessons,
        }
      : null,
  });
});

export default router;
