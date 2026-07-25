import { Router } from "express";
import { db } from "@workspace/db";
import {
  coursesTable,
  lessonsTable,
  categoriesTable,
  courseCategoryAssignmentsTable,
  coursePrerequisitesTable,
  planCourseEntitlementsTable,
  subscriptionPlansTable,
} from "@workspace/db";
import { eq, like, and, desc, asc, inArray } from "drizzle-orm";
import {
  ListCoursesQueryParams,
  CreateCourseBody,
  UpdateCourseBody,
} from "@workspace/api-zod";
import { getCompanyAccess, CompanyAccess } from "../lib/access";
import { checkCourseEligibility } from "../lib/prerequisites";
import { getRecommendedNextCourse } from "../lib/recommendationService";
import { evaluateCourseAccess } from "../lib/courseAccessService";

const router = Router();

// Recommended next course endpoint for current learner
router.get("/recommendation", async (req, res): Promise<void> => {
  let access: CompanyAccess | null = null;
  try {
    access = await getCompanyAccess(req);
  } catch (e) {
    // Guest access allowed
  }

  const recommendation = await getRecommendedNextCourse(access);
  res.json({ recommendation });
});

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

  let allowedCourseIds: number[] | null = null;
  if (categoryId) {
    const assignments = await db
      .select({ courseId: courseCategoryAssignmentsTable.courseId })
      .from(courseCategoryAssignmentsTable)
      .where(eq(courseCategoryAssignmentsTable.categoryId, categoryId));

    allowedCourseIds = assignments.map(a => a.courseId);

    if (allowedCourseIds.length === 0) {
      const primaryCourses = await db
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.categoryId, categoryId));
      allowedCourseIds = primaryCourses.map(c => c.id);
    }
  }

  const queryConditions = [
    eq(coursesTable.isPublished, true),
    search ? like(coursesTable.title, `%${search}%`) : undefined,
    featured === true ? eq(coursesTable.isFeatured, true) : undefined,
  ];

  if (allowedCourseIds !== null) {
    if (allowedCourseIds.length === 0) {
      res.json([]);
      return;
    }
    queryConditions.push(inArray(coursesTable.id, allowedCourseIds));
  }

  const courses = await db
    .select({
      id: coursesTable.id,
      courseCode: coursesTable.courseCode,
      slug: coursesTable.slug,
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
    .where(and(...queryConditions.filter((c): c is NonNullable<typeof c> => c !== undefined)))
    .orderBy(asc(coursesTable.id));

  const courseIds = courses.map(c => c.id);
  let allAssignments: { courseId: number; categoryId: number; categoryName: string | null; isPrimary: boolean }[] = [];
  let allPrereqs: {
    courseId: number;
    prerequisiteCourseId: number;
    prerequisiteCourseCode: string | null;
    prerequisiteTitle: string;
    prerequisiteSlug: string | null;
    requirementType: "required" | "recommended";
  }[] = [];
  let planEntitlementMap = new Map<number, { requiredPlanCode: string; requiredPlanName: string }>();

  if (courseIds.length > 0) {
    allAssignments = await db
      .select({
        courseId: courseCategoryAssignmentsTable.courseId,
        categoryId: courseCategoryAssignmentsTable.categoryId,
        categoryName: categoriesTable.name,
        isPrimary: courseCategoryAssignmentsTable.isPrimary,
      })
      .from(courseCategoryAssignmentsTable)
      .leftJoin(categoriesTable, eq(courseCategoryAssignmentsTable.categoryId, categoriesTable.id))
      .where(inArray(courseCategoryAssignmentsTable.courseId, courseIds));

    const rawPrereqs = await db
      .select({
        courseId: coursePrerequisitesTable.courseId,
        prerequisiteCourseId: coursePrerequisitesTable.prerequisiteCourseId,
        prerequisiteCourseCode: coursesTable.courseCode,
        prerequisiteTitle: coursesTable.title,
        prerequisiteSlug: coursesTable.slug,
        requirementType: coursePrerequisitesTable.requirementType,
      })
      .from(coursePrerequisitesTable)
      .leftJoin(coursesTable, eq(coursePrerequisitesTable.prerequisiteCourseId, coursesTable.id))
      .where(inArray(coursePrerequisitesTable.courseId, courseIds));

    allPrereqs = rawPrereqs.map(p => ({
      courseId: p.courseId,
      prerequisiteCourseId: p.prerequisiteCourseId,
      prerequisiteCourseCode: p.prerequisiteCourseCode,
      prerequisiteTitle: p.prerequisiteTitle || "Prerequisite Course",
      prerequisiteSlug: p.prerequisiteSlug,
      requirementType: (p.requirementType === "recommended" ? "recommended" : "required") as "required" | "recommended",
    }));

    // Entitlement plans mapping
    const rawEntitlements = await db
      .select({
        courseId: planCourseEntitlementsTable.courseId,
        planCode: subscriptionPlansTable.code,
        planName: subscriptionPlansTable.name,
        displayOrder: subscriptionPlansTable.displayOrder,
      })
      .from(planCourseEntitlementsTable)
      .innerJoin(subscriptionPlansTable, eq(planCourseEntitlementsTable.subscriptionPlanId, subscriptionPlansTable.id))
      .where(inArray(planCourseEntitlementsTable.courseId, courseIds))
      .orderBy(asc(subscriptionPlansTable.displayOrder));

    for (const e of rawEntitlements) {
      if (!planEntitlementMap.has(e.courseId)) {
        planEntitlementMap.set(e.courseId, { requiredPlanCode: e.planCode, requiredPlanName: e.planName });
      }
    }
  }

  const assignmentsMap = new Map<number, { categoryId: number; categoryName: string; isPrimary: boolean }[]>();
  for (const a of allAssignments) {
    if (!assignmentsMap.has(a.courseId)) {
      assignmentsMap.set(a.courseId, []);
    }
    if (a.categoryName) {
      assignmentsMap.get(a.courseId)!.push({
        categoryId: a.categoryId,
        categoryName: a.categoryName,
        isPrimary: a.isPrimary,
      });
    }
  }

  const prereqsMap = new Map<number, typeof allPrereqs>();
  for (const p of allPrereqs) {
    if (!prereqsMap.has(p.courseId)) {
      prereqsMap.set(p.courseId, []);
    }
    prereqsMap.get(p.courseId)!.push(p);
  }

  res.json(
    courses.map((c) => {
      const assignedCats = assignmentsMap.get(c.id) || [];
      const primaryCat = assignedCats.find(a => a.isPrimary) || (c.categoryId && c.categoryName ? { categoryId: c.categoryId, categoryName: c.categoryName, isPrimary: true } : null);
      const coursePrereqs = prereqsMap.get(c.id) || [];
      const entitlement = planEntitlementMap.get(c.id) || { requiredPlanCode: "COMPLETE", requiredPlanName: "Complete" };

      return {
        ...c,
        categoryName: primaryCat?.categoryName || c.categoryName || "General Sustainability",
        primaryCategory: primaryCat,
        categoryAssignments: assignedCats,
        prerequisites: coursePrereqs,
        requiredPlanCode: entitlement.requiredPlanCode,
        requiredPlanName: entitlement.requiredPlanName,
        priceUsd: parseFloat(c.priceUsd),
        rating: c.rating ? parseFloat(c.rating) : null,
      };
    })
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
    }))
  );
});

router.get("/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  let accessContext: CompanyAccess | null = null;
  let bypassFilter = false;
  try {
    const access = await getCompanyAccess(req);
    accessContext = access;
    if (access && access.role === "platform_admin") {
      bypassFilter = true;
    }
  } catch (e) {
    // Guest access
  }

  const whereClause = bypassFilter 
    ? eq(coursesTable.id, id)
    : and(eq(coursesTable.id, id), eq(coursesTable.isPublished, true));

  const [course] = await db
    .select({
      id: coursesTable.id,
      courseCode: coursesTable.courseCode,
      slug: coursesTable.slug,
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

  const accessDecision = await evaluateCourseAccess(id, accessContext);

  let safeLessons = lessons;
  if (!accessDecision.allowed && accessContext?.role !== "platform_admin") {
    safeLessons = lessons.map((l) => ({
      ...l,
      content: null,
      contentBlocks: [],
    }));
  }

  res.json({
    ...course,
    priceUsd: parseFloat(course.priceUsd),
    rating: course.rating ? parseFloat(course.rating) : null,
    lessons: safeLessons,
    accessDecision,
    isEligible: accessDecision.allowed,
    prerequisites: accessDecision.prerequisiteDetails || [],
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
