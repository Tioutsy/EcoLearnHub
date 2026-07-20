import { Router } from "express";
import { db } from "@workspace/db";
import {
  coursesTable,
  lessonsTable,
  categoriesTable,
} from "@workspace/db";
import { eq, like, and, desc } from "drizzle-orm";
import {
  ListCoursesQueryParams,
  CreateCourseBody,
  UpdateCourseBody,
} from "@workspace/api-zod";
import { getCompanyAccess, CompanyAccess } from "../lib/access";
import { checkCourseEligibility } from "../lib/prerequisites";

const router = Router();

router.get("/", async (req, res): Promise<void> => {
  const cleanQuery = Object.fromEntries(
    Object.entries(req.query).filter(([, v]) => v !== "null" && v !== "undefined" && v !== "")
  );
  const params = ListCoursesQueryParams.safeParse(cleanQuery);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { categoryId, search, featured } = params.data;

  let query = db
    .select({
      id: coursesTable.id,
      title: coursesTable.title,
      description: coursesTable.description,
      categoryId: coursesTable.categoryId,
      categoryName: categoriesTable.name,
      durationMinutes: coursesTable.durationMinutes,
      priceUsd: coursesTable.priceUsd,
      level: coursesTable.level,
      isFeatured: coursesTable.isFeatured,
      thumbnailUrl: coursesTable.thumbnailUrl,
      previewVideoUrl: coursesTable.previewVideoUrl,
      learningObjectives: coursesTable.learningObjectives,
      enrollmentCount: coursesTable.enrollmentCount,
      rating: coursesTable.rating,
      includesCertificate: coursesTable.includesCertificate,
      passingScore: coursesTable.passingScore,
      createdAt: coursesTable.createdAt,
      status: coursesTable.status,
    })
    .from(coursesTable)
    .leftJoin(categoriesTable, eq(coursesTable.categoryId, categoriesTable.id))
    .where(
      and(
        eq(coursesTable.isPublished, true),
        categoryId ? eq(coursesTable.categoryId, categoryId) : undefined,
        search ? like(coursesTable.title, `%${search}%`) : undefined,
        featured === true ? eq(coursesTable.isFeatured, true) : undefined,
      ),
    )
    .orderBy(desc(coursesTable.isFeatured), desc(coursesTable.enrollmentCount));

  const courses = await query;
  res.json(
    courses.map((c) => ({
      ...c,
      priceUsd: parseFloat(c.priceUsd),
      rating: c.rating ? parseFloat(c.rating) : null,
    })),
  );
});

router.get("/featured", async (_req, res): Promise<void> => {
  const courses = await db
    .select({
      id: coursesTable.id,
      title: coursesTable.title,
      description: coursesTable.description,
      categoryId: coursesTable.categoryId,
      categoryName: categoriesTable.name,
      durationMinutes: coursesTable.durationMinutes,
      priceUsd: coursesTable.priceUsd,
      level: coursesTable.level,
      isFeatured: coursesTable.isFeatured,
      thumbnailUrl: coursesTable.thumbnailUrl,
      previewVideoUrl: coursesTable.previewVideoUrl,
      learningObjectives: coursesTable.learningObjectives,
      enrollmentCount: coursesTable.enrollmentCount,
      rating: coursesTable.rating,
      includesCertificate: coursesTable.includesCertificate,
      passingScore: coursesTable.passingScore,
      createdAt: coursesTable.createdAt,
    })
    .from(coursesTable)
    .leftJoin(categoriesTable, eq(coursesTable.categoryId, categoriesTable.id))
    .where(and(eq(coursesTable.isPublished, true), eq(coursesTable.isFeatured, true)))
    .orderBy(desc(coursesTable.enrollmentCount))
    .limit(6);

  res.json(
    courses.map((c) => ({
      ...c,
      priceUsd: parseFloat(c.priceUsd),
      rating: c.rating ? parseFloat(c.rating) : null,
    })),
  );
});

router.get("/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  // Load access context if present to allow platform admins to preview unpublished courses
  let accessContext: CompanyAccess | null = null;
  let bypassFilter = false;
  try {
    const access = await getCompanyAccess(req);
    accessContext = access;
    if (access && access.role === "platform_admin") {
      bypassFilter = true;
    }
  } catch (e) {
    // Ignore auth errors for guest/learner accesses
  }

  const whereClause = bypassFilter 
    ? eq(coursesTable.id, id)
    : and(eq(coursesTable.id, id), eq(coursesTable.isPublished, true));

  const [course] = await db
    .select({
      id: coursesTable.id,
      title: coursesTable.title,
      description: coursesTable.description,
      categoryId: coursesTable.categoryId,
      categoryName: categoriesTable.name,
      durationMinutes: coursesTable.durationMinutes,
      priceUsd: coursesTable.priceUsd,
      level: coursesTable.level,
      isFeatured: coursesTable.isFeatured,
      thumbnailUrl: coursesTable.thumbnailUrl,
      previewVideoUrl: coursesTable.previewVideoUrl,
      learningObjectives: coursesTable.learningObjectives,
      enrollmentCount: coursesTable.enrollmentCount,
      rating: coursesTable.rating,
      includesCertificate: coursesTable.includesCertificate,
      passingScore: coursesTable.passingScore,
      createdAt: coursesTable.createdAt,
      recommendedNextCourseId: coursesTable.recommendedNextCourseId,
    })
    .from(coursesTable)
    .leftJoin(categoriesTable, eq(coursesTable.categoryId, categoriesTable.id))
    .where(whereClause);

  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const lessons = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, id))
    .orderBy(lessonsTable.orderIndex);

  const eligibility = await checkCourseEligibility(id, accessContext);

  res.json({
    ...course,
    priceUsd: parseFloat(course.priceUsd),
    rating: course.rating ? parseFloat(course.rating) : null,
    lessons,
    prerequisites: eligibility.prerequisites,
  });
});

router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [course] = await db
    .insert(coursesTable)
    .values({
      ...parsed.data,
      priceUsd: String(parsed.data.priceUsd),
    })
    .returning();
  res.status(201).json({ ...course, priceUsd: parseFloat(course.priceUsd) });
});

router.patch("/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.priceUsd != null) {
    updateData.priceUsd = String(parsed.data.priceUsd);
  }

  const [updated] = await db
    .update(coursesTable)
    .set(updateData)
    .where(eq(coursesTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  res.json({ ...updated, priceUsd: parseFloat(updated.priceUsd) });
});

router.delete("/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(coursesTable).where(eq(coursesTable.id, id));
  res.status(204).send();
});

export default router;
