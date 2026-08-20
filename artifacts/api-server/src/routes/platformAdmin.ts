import { Router } from "express";
import { db } from "@workspace/db";
import {
  sectorsTable,
  companySectorsTable,
  courseSectorsTable,
  learningPathSectorsTable,
  blogPostSectorsTable,
  workplaceScenariosTable,
  scenarioSectorsTable,
  sdgGoalsTable,
  sdgTargetsTable,
  sdgContributionsTable,
  courseSdgContributionsTable,
  learningPathSdgContributionsTable,
  blogPostSdgContributionsTable,
  recyclingSdgContributionsTable,
  companyActionsTable,
  companyActionSdgContributionsTable,
  coursePrerequisitesTable,
  companyServicesTable,
  insightCategoriesTable,
  blogPostsTable,
  mauritiusResourcesTable,
  learningPathsTable,
  learningPathCoursesTable,
  coursesTable,
  categoriesTable,
  lessonsTable,
  quizQuestionsTable,
  companiesTable,
  employeesTable
} from "@workspace/db";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { requirePlatformAdmin, getCompanyAccess, sendHttpError } from "../lib/access";

const router = Router();

// Helper to seed initial sectors if they don't exist
export async function seedInitialSectors() {
  const initialSectors = [
    { slug: "office-services", name: "Office & Professional Services", description: "Office environments and professional activities" },
    { slug: "hospitality-tourism", name: "Hospitality & Tourism", description: "Hotels, restaurants, and tourism operations" },
    { slug: "retail-distribution", name: "Retail & Distribution", description: "Shops, supermarkets, and wholesale distribution" },
    { slug: "construction-property", name: "Construction, Property & Facilities", description: "Real estate development, construction, and facilities" },
    { slug: "manufacturing-industrial", name: "Manufacturing & Industrial", description: "Manufacturing plants and industrial processes" },
    { slug: "logistics-transport", name: "Logistics & Transport", description: "Transport services, warehousing, and shipping" }
  ];

  for (const sector of initialSectors) {
    const [existing] = await db.select().from(sectorsTable).where(eq(sectorsTable.slug, sector.slug)).limit(1);
    if (!existing) {
      await db.insert(sectorsTable).values(sector);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTORS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/sectors", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const result = await db.select().from(sectorsTable).orderBy(sectorsTable.name);
    res.json(result);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.post("/sectors", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const { slug, name, description } = req.body;
    if (!slug || !name) {
      res.status(400).json({ error: "slug and name are required" });
      return;
    }
    const [sector] = await db.insert(sectorsTable).values({ slug, name, description }).returning();
    res.status(201).json(sector);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.get("/sectors/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const [sector] = await db.select().from(sectorsTable).where(eq(sectorsTable.id, id)).limit(1);
    if (!sector) {
      res.status(404).json({ error: "Sector not found" });
      return;
    }
    res.json(sector);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.patch("/sectors/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const { name, description } = req.body;
    const [sector] = await db
      .update(sectorsTable)
      .set({ name, description, updatedAt: new Date() })
      .where(eq(sectorsTable.id, id))
      .returning();
    if (!sector) {
      res.status(404).json({ error: "Sector not found" });
      return;
    }
    res.json(sector);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.patch("/sectors/:id/status", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (status !== "active" && status !== "inactive") {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    const [sector] = await db
      .update(sectorsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(sectorsTable.id, id))
      .returning();
    if (!sector) {
      res.status(404).json({ error: "Sector not found" });
      return;
    }
    res.json(sector);
  } catch (err) {
    sendHttpError(res, err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// INSIGHT CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

router.get("/insights/categories", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const result = await db.select().from(insightCategoriesTable).orderBy(insightCategoriesTable.name);
    res.json(result);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.post("/insights/categories", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const { slug, name, description } = req.body;
    if (!slug || !name) {
      res.status(400).json({ error: "slug and name are required" });
      return;
    }
    const [cat] = await db.insert(insightCategoriesTable).values({ slug, name, description }).returning();
    res.status(201).json(cat);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.get("/insights/categories/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const [cat] = await db.select().from(insightCategoriesTable).where(eq(insightCategoriesTable.id, id)).limit(1);
    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(cat);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.patch("/insights/categories/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const { name, description } = req.body;
    const [cat] = await db
      .update(insightCategoriesTable)
      .set({ name, description, updatedAt: new Date() })
      .where(eq(insightCategoriesTable.id, id))
      .returning();
    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(cat);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.patch("/insights/categories/:id/status", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (status !== "active" && status !== "inactive") {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    const [cat] = await db
      .update(insightCategoriesTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(insightCategoriesTable.id, id))
      .returning();
    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(cat);
  } catch (err) {
    sendHttpError(res, err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// INSIGHT ARTICLES (BLOG POSTS)
// ─────────────────────────────────────────────────────────────────────────────

router.get("/insights/articles", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const result = await db.select().from(blogPostsTable).orderBy(blogPostsTable.createdAt);
    res.json(result);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.post("/insights/articles", async (req, res): Promise<void> => {
  let access;
  try {
    access = await requirePlatformAdmin(req);
  } catch (err) {
    sendHttpError(res, err);
    return;
  }

  try {
    const {
      title,
      slug,
      excerpt,
      content,
      authorName,
      authorTitle,
      thumbnailUrl,
      imageAlt,
      sourceReferences,
      readingTimeMinutes,
      seoTitle,
      seoDescription,
      tags,
      status,
      insightCategoryId,
      scheduledAt,
      publishedAt,
      archivedAt,
      reviewDate,
      linkedResourceSlugs,
      lastVerifiedAt,
      nextReviewAt
    } = req.body;

    if (!title || !slug || !excerpt || !content || !authorName) {
      res.status(400).json({ error: "Missing required article fields" });
      return;
    }

    const [article] = await db
      .insert(blogPostsTable)
      .values({
        title,
        slug,
        excerpt,
        content,
        authorName,
        authorTitle,
        thumbnailUrl,
        imageAlt,
        sourceReferences: sourceReferences || [],
        readingTimeMinutes: readingTimeMinutes || 5,
        seoTitle,
        seoDescription,
        tags: tags || [],
        status: status || "draft",
        insightCategoryId,
        scheduledAt,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        archivedAt,
        reviewDate,
        linkedResourceSlugs: linkedResourceSlugs || [],
        lastVerifiedAt: lastVerifiedAt ? new Date(lastVerifiedAt) : new Date(),
        nextReviewAt: nextReviewAt ? new Date(nextReviewAt) : null,
        createdBy: access.userId
      })
      .returning();

    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get("/insights/articles/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const [article] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);
    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    res.json(article);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.patch("/insights/articles/:id", async (req, res): Promise<void> => {
  let access;
  try {
    access = await requirePlatformAdmin(req);
  } catch (err) {
    sendHttpError(res, err);
    return;
  }

  try {
    const id = parseInt(req.params.id);
    const updateData = { ...req.body, updatedBy: access.userId, updatedAt: new Date() };
    if (updateData.lastVerifiedAt) updateData.lastVerifiedAt = new Date(updateData.lastVerifiedAt);
    if (updateData.nextReviewAt) updateData.nextReviewAt = new Date(updateData.nextReviewAt);
    const [article] = await db
      .update(blogPostsTable)
      .set(updateData)
      .where(eq(blogPostsTable.id, id))
      .returning();
    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.patch("/insights/articles/:id/status", async (req, res): Promise<void> => {
  let access;
  try {
    access = await requirePlatformAdmin(req);
  } catch (err) {
    sendHttpError(res, err);
    return;
  }

  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const allowed = ["draft", "review", "scheduled", "published", "archived"];
    if (!allowed.includes(status)) {
      res.status(400).json({ error: "Invalid status value" });
      return;
    }

    const setObj: Record<string, any> = { status, updatedBy: access.userId, updatedAt: new Date() };
    if (status === "published") {
      setObj.publishedAt = new Date();
    } else if (status === "archived") {
      setObj.archivedAt = new Date();
    }

    const [article] = await db
      .update(blogPostsTable)
      .set(setObj)
      .where(eq(blogPostsTable.id, id))
      .returning();

    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// MAURITIUS RULES & RESOURCES
// ─────────────────────────────────────────────────────────────────────────────

router.get("/insights/mauritius-resources", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const result = await db.select().from(mauritiusResourcesTable).orderBy(mauritiusResourcesTable.createdAt);
    res.json(result);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.post("/insights/mauritius-resources", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
  } catch (err) {
    sendHttpError(res, err);
    return;
  }

  try {
    const {
      title,
      slug,
      resourceType,
      shortSummary,
      mainExplanation,
      officialName,
      resourceNumber,
      responsibleAuthority,
      relevantSector,
      dateIssued,
      effectiveDate,
      officialSourceLink,
      downloadableDocLink,
      complianceRelevance,
      practicalImplications,
      status,
      disclaimer,
      isFeatured,
      relatedResources,
      legalStatus,
      lastVerifiedAt,
      nextReviewAt
    } = req.body;

    if (!title || !slug || !resourceType || !shortSummary || !mainExplanation) {
      res.status(400).json({ error: "Missing required resource fields" });
      return;
    }

    const [resource] = await db
      .insert(mauritiusResourcesTable)
      .values({
        title,
        slug,
        resourceType,
        shortSummary,
        mainExplanation,
        officialName: officialName || null,
        resourceNumber: resourceNumber || null,
        responsibleAuthority: responsibleAuthority || null,
        relevantSector: relevantSector || null,
        dateIssued: dateIssued ? new Date(dateIssued) : null,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        officialSourceLink: officialSourceLink || null,
        downloadableDocLink: downloadableDocLink || null,
        complianceRelevance: complianceRelevance || null,
        practicalImplications: practicalImplications || null,
        status: status || "draft",
        disclaimer: disclaimer || undefined,
        isFeatured: isFeatured === true,
        relatedResources: relatedResources || [],
        legalStatus: legalStatus || "active",
        lastVerifiedAt: lastVerifiedAt ? new Date(lastVerifiedAt) : new Date(),
        nextReviewAt: nextReviewAt ? new Date(nextReviewAt) : null,
      })
      .returning();

    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get("/insights/mauritius-resources/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const [resource] = await db.select().from(mauritiusResourcesTable).where(eq(mauritiusResourcesTable.id, id)).limit(1);
    if (!resource) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
    res.json(resource);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.patch("/insights/mauritius-resources/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
  } catch (err) {
    sendHttpError(res, err);
    return;
  }

  try {
    const id = parseInt(req.params.id);
    const bodyCopy = { ...req.body };
    if (bodyCopy.dateIssued) bodyCopy.dateIssued = new Date(bodyCopy.dateIssued);
    if (bodyCopy.effectiveDate) bodyCopy.effectiveDate = new Date(bodyCopy.effectiveDate);
    if (bodyCopy.lastVerifiedAt) bodyCopy.lastVerifiedAt = new Date(bodyCopy.lastVerifiedAt);
    if (bodyCopy.nextReviewAt) bodyCopy.nextReviewAt = new Date(bodyCopy.nextReviewAt);
    bodyCopy.updatedAt = new Date();

    const [resource] = await db
      .update(mauritiusResourcesTable)
      .set(bodyCopy)
      .where(eq(mauritiusResourcesTable.id, id))
      .returning();
    if (!resource) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.patch("/insights/mauritius-resources/:id/status", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
  } catch (err) {
    sendHttpError(res, err);
    return;
  }

  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const allowed = ["draft", "published", "archived"];
    if (!allowed.includes(status)) {
      res.status(400).json({ error: "Invalid status value" });
      return;
    }

    const [resource] = await db
      .update(mauritiusResourcesTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(mauritiusResourcesTable.id, id))
      .returning();

    if (!resource) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// LEARNING PATHS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/learning-paths", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const paths = await db.select().from(learningPathsTable);
    res.json(paths);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.post("/learning-paths", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const {
      slug,
      title,
      description,
      audience,
      icon,
      difficulty,
      intendedRoles,
      estimatedDurationMinutes,
      status,
      completionCriteria,
      certificateEligibility,
      recommendedNextPathId
    } = req.body;

    if (!slug || !title || !description || !audience) {
      res.status(400).json({ error: "Missing required learning path fields" });
      return;
    }

    const [path] = await db
      .insert(learningPathsTable)
      .values({
        slug,
        title,
        description,
        audience,
        icon: icon || "route",
        difficulty: difficulty || "beginner",
        intendedRoles: intendedRoles || [],
        estimatedDurationMinutes: estimatedDurationMinutes || 0,
        status: status || "draft",
        completionCriteria,
        certificateEligibility: !!certificateEligibility,
        recommendedNextPathId
      })
      .returning();

    res.status(201).json(path);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get("/learning-paths/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const [path] = await db.select().from(learningPathsTable).where(eq(learningPathsTable.id, id)).limit(1);
    if (!path) {
      res.status(404).json({ error: "Learning path not found" });
      return;
    }
    res.json(path);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.patch("/learning-paths/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const [path] = await db
      .update(learningPathsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(learningPathsTable.id, id))
      .returning();
    if (!path) {
      res.status(404).json({ error: "Learning path not found" });
      return;
    }
    res.json(path);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.patch("/learning-paths/:id/status", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (status !== "draft" && status !== "active" && status !== "archived") {
      res.status(400).json({ error: "Invalid status value" });
      return;
    }
    const [path] = await db
      .update(learningPathsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(learningPathsTable.id, id))
      .returning();
    if (!path) {
      res.status(404).json({ error: "Learning path not found" });
      return;
    }
    res.json(path);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.put("/learning-paths/:id/courses", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const pathId = parseInt(req.params.id);
    const { courses } = req.body; // Array of { courseId, position, isRequired }

    if (!Array.isArray(courses)) {
      res.status(400).json({ error: "courses must be an array" });
      return;
    }

    // Check for duplicate course IDs or positions in the payload
    const courseIds = courses.map(c => c.courseId);
    const positions = courses.map(c => c.position);
    if (new Set(courseIds).size !== courseIds.length) {
      res.status(400).json({ error: "Duplicate course assignment in learning path" });
      return;
    }
    if (new Set(positions).size !== positions.length) {
      res.status(400).json({ error: "Duplicate course position in learning path" });
      return;
    }

    // Wrap in transaction for integrity
    await db.transaction(async (tx) => {
      // Clear current assignments
      await tx.delete(learningPathCoursesTable).where(eq(learningPathCoursesTable.pathId, pathId));

      // Insert new assignments
      for (const item of courses) {
        await tx.insert(learningPathCoursesTable).values({
          pathId,
          courseId: item.courseId,
          position: item.position,
          isRequired: item.isRequired !== false
        });
      }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SDG GOALS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/sdg-goals", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const result = await db.select().from(sdgGoalsTable).orderBy(sdgGoalsTable.goalNumber);
    res.json(result);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.post("/sdg-goals", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const { goalNumber, title, officialReference, sourceVersion, isActive } = req.body;
    if (!goalNumber || !title) {
      res.status(400).json({ error: "goalNumber and title are required" });
      return;
    }
    const [goal] = await db
      .insert(sdgGoalsTable)
      .values({
        goalNumber,
        title,
        officialReference,
        sourceVersion,
        isActive: isActive !== false
      })
      .returning();
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get("/sdg-goals/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const [goal] = await db.select().from(sdgGoalsTable).where(eq(sdgGoalsTable.id, id)).limit(1);
    if (!goal) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }
    res.json(goal);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.patch("/sdg-goals/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const [goal] = await db
      .update(sdgGoalsTable)
      .set(req.body)
      .where(eq(sdgGoalsTable.id, id))
      .returning();
    if (!goal) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.patch("/sdg-goals/:id/status", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (status !== "active" && status !== "inactive") {
      res.status(400).json({ error: "Invalid status value" });
      return;
    }
    const [goal] = await db
      .update(sdgGoalsTable)
      .set({ isActive: status === "active" })
      .where(eq(sdgGoalsTable.id, id))
      .returning();
    if (!goal) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SDG TARGETS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/sdg-targets", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const result = await db.select().from(sdgTargetsTable).orderBy(sdgTargetsTable.targetCode);
    res.json(result);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.post("/sdg-targets", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const { sdgGoalId, targetCode, officialOrApprovedSummary, officialReference, sourceVersion, isActive } = req.body;
    if (!sdgGoalId || !targetCode || !officialOrApprovedSummary) {
      res.status(400).json({ error: "Missing required target fields" });
      return;
    }
    const [target] = await db
      .insert(sdgTargetsTable)
      .values({
        sdgGoalId,
        targetCode,
        officialOrApprovedSummary,
        officialReference,
        sourceVersion,
        isActive: isActive !== false
      })
      .returning();
    res.status(201).json(target);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get("/sdg-targets/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const [target] = await db.select().from(sdgTargetsTable).where(eq(sdgTargetsTable.id, id)).limit(1);
    if (!target) {
      res.status(404).json({ error: "Target not found" });
      return;
    }
    res.json(target);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.patch("/sdg-targets/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const [target] = await db
      .update(sdgTargetsTable)
      .set(req.body)
      .where(eq(sdgTargetsTable.id, id))
      .returning();
    if (!target) {
      res.status(404).json({ error: "Target not found" });
      return;
    }
    res.json(target);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.patch("/sdg-targets/:id/status", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (status !== "active" && status !== "inactive") {
      res.status(400).json({ error: "Invalid status value" });
      return;
    }
    const [target] = await db
      .update(sdgTargetsTable)
      .set({ isActive: status === "active" })
      .where(eq(sdgTargetsTable.id, id))
      .returning();
    if (!target) {
      res.status(404).json({ error: "Target not found" });
      return;
    }
    res.json(target);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SDG CONTRIBUTIONS MAPPINGS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/sdg-contributions", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const result = await db.select().from(sdgContributionsTable);
    res.json(result);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.post("/sdg-contributions", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const {
      sdgTargetId,
      contributionCategory,
      rationale,
      evidenceRequired,
      evidenceStrength,
      isDirect,
      sourceReference,
      methodologyVersion,
      limitations,
      status
    } = req.body;

    if (!sdgTargetId || !contributionCategory || !rationale) {
      res.status(400).json({ error: "Missing required contribution fields" });
      return;
    }

    const categories = ["education_awareness", "capacity_building", "operational_output", "operational_outcome", "self_reported_action", "calculated_estimate"];
    if (!categories.includes(contributionCategory)) {
      res.status(400).json({ error: "Invalid contribution category value" });
      return;
    }

    const strengths = ["weak", "medium", "strong"];
    if (evidenceStrength && !strengths.includes(evidenceStrength)) {
      res.status(400).json({ error: "Invalid evidence strength value" });
      return;
    }

    const [contrib] = await db
      .insert(sdgContributionsTable)
      .values({
        sdgTargetId,
        contributionCategory,
        rationale,
        evidenceRequired,
        evidenceStrength: evidenceStrength || "medium",
        isDirect: !!isDirect,
        sourceReference,
        methodologyVersion,
        limitations,
        status: status || "active"
      })
      .returning();

    res.status(201).json(contrib);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get("/sdg-contributions/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const [contrib] = await db.select().from(sdgContributionsTable).where(eq(sdgContributionsTable.id, id)).limit(1);
    if (!contrib) {
      res.status(404).json({ error: "Contribution not found" });
      return;
    }
    res.json(contrib);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.patch("/sdg-contributions/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const [contrib] = await db
      .update(sdgContributionsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(sdgContributionsTable.id, id))
      .returning();
    if (!contrib) {
      res.status(404).json({ error: "Contribution not found" });
      return;
    }
    res.json(contrib);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.patch("/sdg-contributions/:id/status", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (status !== "active" && status !== "inactive" && status !== "archived") {
      res.status(400).json({ error: "Invalid status value" });
      return;
    }
    const [contrib] = await db
      .update(sdgContributionsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(sdgContributionsTable.id, id))
      .returning();
    if (!contrib) {
      res.status(404).json({ error: "Contribution not found" });
      return;
    }
    res.json(contrib);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// COURSE METADATA & ASSOCIATIONS
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/courses/:id/metadata", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const courseId = parseInt(req.params.id);
    const {
      title,
      slug,
      description,
      fullDescription,
      level,
      durationMinutes,
      priceUsd,
      thumbnailUrl,
      learningObjectives,
      includesCertificate,
      passingScore,
      status,
      badgeName,
      badgeDescription,
      intendedRoles,
      version,
      reviewDate,
      recommendedNextCourseId,
      prerequisites, // Array of prerequisite course IDs
      sectors,       // Array of sector IDs
      sdgContributions // Array of contribution IDs
    } = req.body;

    // 1. Prerequisites self-reference check
    if (Array.isArray(prerequisites)) {
      if (prerequisites.includes(courseId)) {
        res.status(400).json({ error: "A course cannot be its own prerequisite" });
        return;
      }
    }

    // 2. SDG Association Category Validation Checks
    if (Array.isArray(sdgContributions)) {
      for (const contribId of sdgContributions) {
        const [contrib] = await db
          .select()
          .from(sdgContributionsTable)
          .where(eq(sdgContributionsTable.id, contribId))
          .limit(1);
        if (!contrib) {
          res.status(404).json({ error: `SDG contribution mapping ID ${contribId} not found` });
          return;
        }

        // Restrict courses from linking to anything other than education_awareness or capacity_building
        const permitted = ["education_awareness", "capacity_building"];
        if (!permitted.includes(contrib.contributionCategory)) {
          res.status(400).json({ error: `Courses cannot link to SDG contribution mapping of category '${contrib.contributionCategory}'` });
          return;
        }
      }
    }

    // Wrap updates in transaction
    const [updatedCourse] = await db.transaction(async (tx) => {
      // A. Update course metadata fields
      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (title !== undefined) updateData.title = title;
      if (slug !== undefined) updateData.slug = slug;
      if (description !== undefined) updateData.description = description;
      if (fullDescription !== undefined) updateData.fullDescription = fullDescription;
      if (level !== undefined) updateData.level = level;
      if (durationMinutes !== undefined) updateData.durationMinutes = durationMinutes;
      if (priceUsd !== undefined) updateData.priceUsd = priceUsd;
      if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
      if (learningObjectives !== undefined) updateData.learningObjectives = learningObjectives;
      if (includesCertificate !== undefined) updateData.includesCertificate = includesCertificate;
      if (passingScore !== undefined) updateData.passingScore = passingScore;
      if (status !== undefined) {
        updateData.status = status;
        updateData.isPublished = status === "published";
      }
      if (badgeName !== undefined) updateData.badgeName = badgeName;
      if (badgeDescription !== undefined) updateData.badgeDescription = badgeDescription;
      if (intendedRoles !== undefined) updateData.intendedRoles = intendedRoles;
      if (version !== undefined) updateData.version = version;
      if (reviewDate !== undefined) updateData.reviewDate = reviewDate ? new Date(reviewDate) : null;
      if (recommendedNextCourseId !== undefined) updateData.recommendedNextCourseId = recommendedNextCourseId;

      const [course] = await tx
        .update(coursesTable)
        .set(updateData)
        .where(eq(coursesTable.id, courseId))
        .returning();

      if (!course) {
        throw new Error("Course not found");
      }

      // B. Sync Prerequisites
      if (Array.isArray(prerequisites)) {
        await tx.delete(coursePrerequisitesTable).where(eq(coursePrerequisitesTable.courseId, courseId));
        for (const prereqId of prerequisites) {
          await tx.insert(coursePrerequisitesTable).values({
            courseId,
            prerequisiteCourseId: prereqId
          });
        }
      }

      // C. Sync Sectors
      if (Array.isArray(sectors)) {
        await tx.delete(courseSectorsTable).where(eq(courseSectorsTable.courseId, courseId));
        for (const sectorId of sectors) {
          await tx.insert(courseSectorsTable).values({
            courseId,
            sectorId
          });
        }
      }

      // D. Sync SDG Contributions
      if (Array.isArray(sdgContributions)) {
        await tx.delete(courseSdgContributionsTable).where(eq(courseSdgContributionsTable.courseId, courseId));
        for (const contribId of sdgContributions) {
          await tx.insert(courseSdgContributionsTable).values({
            courseId,
            sdgContributionId: contribId
          });
        }
      }

      return [course];
    });

    res.json(updatedCourse);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});


// =============================================================================
// PLATFORM ADMIN COURSES ROUTE
// =============================================================================

router.get("/courses", async (req, res): Promise<void> => {
  try {
    console.log("[DIAG] GET /platform-admin/courses - Received request");
    await requirePlatformAdmin(req);
    console.log("[DIAG] GET /platform-admin/courses - Auth checks passed");
    
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
        status: coursesTable.status,
      })
      .from(coursesTable)
      .leftJoin(categoriesTable, eq(coursesTable.categoryId, categoriesTable.id))
      .orderBy(desc(coursesTable.isFeatured), desc(coursesTable.enrollmentCount));

    console.log("[DIAG] GET /platform-admin/courses - Database query completed, length:", courses.length);

    res.json(
      courses.map((c) => ({
        ...c,
        priceUsd: parseFloat(c.priceUsd),
        rating: c.rating ? parseFloat(c.rating) : null,
      })),
    );
    console.log("[DIAG] GET /platform-admin/courses - Response sent");
  } catch (err) {
    console.log("[DIAG] GET /platform-admin/courses - Error occurred:", err);
    sendHttpError(res, err);
  }
});


// =============================================================================
// PLATFORM ADMIN LESSON AUTHORING ROUTES
// =============================================================================

// A. List all lessons of a course, including archived ones (sorted by orderIndex)
router.get("/courses/:id/lessons", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const courseId = parseInt(req.params.id);
    const rows = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, courseId))
      .orderBy(lessonsTable.orderIndex);
    res.json(rows);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// B. Create a new lesson under a course
router.post("/courses/:id/lessons", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const courseId = parseInt(req.params.id);
    const { title, durationMinutes, videoUrl, pdfUrl, content, contentBlocks } = req.body;

    // Get current max orderIndex
    const existing = await db
      .select({ orderIndex: lessonsTable.orderIndex })
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, courseId))
      .orderBy(lessonsTable.orderIndex);
    const nextOrder = existing.length > 0 ? existing[existing.length - 1]!.orderIndex + 1 : 0;

    const [inserted] = await db
      .insert(lessonsTable)
      .values({
        courseId,
        title,
        durationMinutes: durationMinutes ?? 10,
        videoUrl: videoUrl || null,
        pdfUrl: pdfUrl || null,
        content: content || null,
        isArchived: false,
        contentBlocks: contentBlocks || [],
        orderIndex: nextOrder,
      })
      .returning();

    res.json(inserted);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// C. Update a lesson properties (PATCH semantics)
router.patch("/lessons/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const lessonId = parseInt(req.params.id);
    const { title, durationMinutes, videoUrl, pdfUrl, content, isArchived, contentBlocks } = req.body;

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (durationMinutes !== undefined) updateData.durationMinutes = durationMinutes;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl || null;
    if (pdfUrl !== undefined) updateData.pdfUrl = pdfUrl || null;
    if (content !== undefined) updateData.content = content || null;
    if (isArchived !== undefined) updateData.isArchived = isArchived;
    if (contentBlocks !== undefined) {
      // Validate block schema if blocks present
      if (Array.isArray(contentBlocks)) {
        for (const block of contentBlocks) {
          if (!block.id || !block.type || typeof block.position !== 'number') {
            res.status(400).json({ error: "Malformed content block structure. Required: id, type, position" });
            return;
          }
          const validTypes = ["heading", "short_text", "key_message", "workplace_example", "mauritian_example", "practical_action", "image", "expandable", "multiple_choice", "decision_scenario", "reflection", "commitment"];
          if (!validTypes.includes(block.type)) {
            res.status(400).json({ error: `Unknown content block type '${block.type}'` });
            return;
          }
        }
      }
      updateData.contentBlocks = contentBlocks;
    }

    const [updated] = await db
      .update(lessonsTable)
      .set(updateData)
      .where(eq(lessonsTable.id, lessonId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// D. Reorder course lessons (transactional)
router.put("/courses/:id/lessons/reorder", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const courseId = parseInt(req.params.id);
    const submittedIds = req.body;

    if (!Array.isArray(submittedIds)) {
      res.status(400).json({ error: "Body must be an array of lesson IDs" });
      return;
    }

    await db.transaction(async (tx) => {
      // 1. Fetch active (non-archived) lessons from DB
      const dbActive = await tx
        .select({ id: lessonsTable.id })
        .from(lessonsTable)
        .where(and(eq(lessonsTable.courseId, courseId), eq(lessonsTable.isArchived, false)));
      const activeIds = dbActive.map((l) => l.id);

      // Verify lengths match
      if (submittedIds.length !== activeIds.length) {
        throw new Error("Submitted list must contain all active course lessons");
      }

      // Verify ID set equivalence (no duplicates, no foreign items, no archived items)
      const activeSet = new Set(activeIds);
      for (const id of submittedIds) {
        if (!activeSet.has(id)) {
          throw new Error(`Invalid lesson ID: ${id} (archived, foreign, or duplicate)`);
        }
      }

      // 2. Perform updates
      for (let idx = 0; idx < submittedIds.length; idx++) {
        const id = submittedIds[idx]!;
        await tx
          .update(lessonsTable)
          .set({ orderIndex: idx })
          .where(eq(lessonsTable.id, id));
      }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// =============================================================================
// PLATFORM ADMIN QUIZ QUESTION ROUTES
// =============================================================================

// E. List all quiz questions of a course, including archived ones
router.get("/courses/:id/quiz-questions", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const courseId = parseInt(req.params.id);
    const rows = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, courseId))
      .orderBy(quizQuestionsTable.orderIndex);
    res.json(rows);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// F. Create a new quiz question under a course
router.post("/courses/:id/quiz-questions", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const courseId = parseInt(req.params.id);
    const { question, options, correctOption, correctExplanation, incorrectExplanation, optionFeedback } = req.body;

    // Get current max orderIndex
    const existing = await db
      .select({ orderIndex: quizQuestionsTable.orderIndex })
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, courseId))
      .orderBy(quizQuestionsTable.orderIndex);
    const nextOrder = existing.length > 0 ? existing[existing.length - 1]!.orderIndex + 1 : 0;

    const [inserted] = await db
      .insert(quizQuestionsTable)
      .values({
        courseId,
        question,
        options: options || [],
        correctOption: correctOption ?? 0,
        orderIndex: nextOrder,
        isArchived: false,
        correctExplanation: correctExplanation || null,
        incorrectExplanation: incorrectExplanation || null,
        optionFeedback: optionFeedback || null,
      })
      .returning();

    res.json(inserted);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// G. Update a quiz question properties (PATCH semantics)
router.patch("/quiz-questions/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const questionId = parseInt(req.params.id);
    const { question, options, correctOption, isArchived, correctExplanation, incorrectExplanation, optionFeedback } = req.body;

    const updateData: Record<string, any> = {};
    if (question !== undefined) updateData.question = question;
    if (options !== undefined) updateData.options = options;
    if (correctOption !== undefined) updateData.correctOption = correctOption;
    if (isArchived !== undefined) updateData.isArchived = isArchived;
    if (correctExplanation !== undefined) updateData.correctExplanation = correctExplanation || null;
    if (incorrectExplanation !== undefined) updateData.incorrectExplanation = incorrectExplanation || null;
    if (optionFeedback !== undefined) updateData.optionFeedback = optionFeedback || null;

    const [updated] = await db
      .update(quizQuestionsTable)
      .set(updateData)
      .where(eq(quizQuestionsTable.id, questionId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Quiz question not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// H. Reorder quiz questions (transactional)
router.put("/courses/:id/quiz-questions/reorder", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const courseId = parseInt(req.params.id);
    const submittedIds = req.body;

    if (!Array.isArray(submittedIds)) {
      res.status(400).json({ error: "Body must be an array of question IDs" });
      return;
    }

    await db.transaction(async (tx) => {
      // 1. Fetch active (non-archived) questions from DB
      const dbActive = await tx
        .select({ id: quizQuestionsTable.id })
        .from(quizQuestionsTable)
        .where(and(eq(quizQuestionsTable.courseId, courseId), eq(quizQuestionsTable.isArchived, false)));
      const activeIds = dbActive.map((q) => q.id);

      // Verify lengths match
      if (submittedIds.length !== activeIds.length) {
        throw new Error("Submitted list must contain all active quiz questions");
      }

      // Verify ID set equivalence
      const activeSet = new Set(activeIds);
      for (const id of submittedIds) {
        if (!activeSet.has(id)) {
          throw new Error(`Invalid question ID: ${id} (archived, foreign, or duplicate)`);
        }
      }

      // 2. Perform updates
      for (let idx = 0; idx < submittedIds.length; idx++) {
        const id = submittedIds[idx]!;
        await tx
          .update(quizQuestionsTable)
          .set({ orderIndex: idx })
          .where(eq(quizQuestionsTable.id, id));
      }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});


router.get("/insights/review-dashboard", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const articles = await db.select().from(blogPostsTable);
    const resources = await db.select().from(mauritiusResourcesTable);
    const now = new Date();

    const overdueArticles = articles.filter(a => a.status !== "archived" && (
      (a.nextReviewAt && new Date(a.nextReviewAt) < now) ||
      (a.reviewDate && new Date(a.reviewDate) < now)
    ));

    const overdueResources = resources.filter(r => r.status !== "archived" && r.nextReviewAt && new Date(r.nextReviewAt) < now);

    const brokenLinks = resources.filter(r => !r.officialSourceLink || !r.officialSourceLink.startsWith("http"));

    const unsourcedArticles = articles.filter(a => !a.sourceReferences || a.sourceReferences.length === 0);

    const supersededSlugs = new Set(resources.filter(r => r.legalStatus === "superseded" || r.legalStatus === "revoked").map(r => r.slug));
    const articlesWithSupersededLinks = articles.filter(a => a.linkedResourceSlugs && a.linkedResourceSlugs.some(slug => supersededSlugs.has(slug)));

    res.json({
      overdueArticles,
      overdueResources,
      brokenLinks,
      unsourcedArticles,
      articlesWithSupersededLinks
    });
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.get("/me/access", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const isPlatform = access.role === "platform_admin";
    const platformRole = isPlatform ? "PLATFORM_ADMIN" : "USER";
    
    let organisationRole: string | null = null;
    let organisationId: number | null = null;

    if (!isPlatform) {
      organisationId = access.companyId;
      organisationRole = access.role === "company_admin" ? "COMPANY_ADMIN" : access.role === "manager" ? "MANAGER" : "LEARNER";
    } else if (access.employee) {
      organisationId = access.companyId;
      organisationRole = access.employee.role === "admin" ? "COMPANY_ADMIN" : access.employee.role === "manager" ? "MANAGER" : "LEARNER";
    }

    res.json({
      userId: access.userId,
      email: access.email,
      platformRole,
      organisationId,
      organisationRole,
      effectiveRole: access.role,
      permissions: {
        canViewPlatformAdmin: isPlatform,
        canViewOrganisations: isPlatform,
        canViewGlobalAccounts: isPlatform,
        canAddEmployees: isPlatform || access.role === "company_admin",
        canManageCompany: isPlatform || access.role === "company_admin",
        canViewCompanyReports: isPlatform || access.role === "company_admin",
        canViewTeamReports: isPlatform || access.role === "company_admin" || access.role === "manager"
      }
    });
  } catch (err) {
    sendHttpError(res, err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM OVERSIGHT, REGISTRY, ACCOUNTS & HEALTH WARNINGS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/overview-stats", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const companies = await db.select().from(companiesTable);
    const employees = await db.select().from(employeesTable);

    const totalCompanies = companies.length;
    const activeCompanies = companies.length; // all registered
    const totalUsers = employees.length;
    const companyAdmins = employees.filter((e) => e.role === "admin").length;

    // Orphaned users / warnings calculation
    const companyIds = new Set(companies.map((c) => c.id));
    const companyAdminCounts = new Map<number, number>();
    for (const emp of employees) {
      if (emp.role === "admin") {
        companyAdminCounts.set(emp.companyId, (companyAdminCounts.get(emp.companyId) || 0) + 1);
      }
    }

    const missingAdmins = companies.filter((c) => !companyAdminCounts.get(c.id)).length;
    const orphanedUsers = employees.filter((e) => !companyIds.has(e.companyId)).length;

    res.json({
      totalCompanies,
      activeCompanies,
      totalUsers,
      activeLearners: totalUsers,
      companyAdmins,
      requiresAttentionCount: missingAdmins + orphanedUsers
    });
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.get("/organisations", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);

    // Guarantee Infracare exists
    const existingInfracare = await db
      .select({ id: companiesTable.id })
      .from(companiesTable)
      .where(sql`lower(${companiesTable.name}) LIKE '%infracare%' OR lower(${companiesTable.slug}) LIKE '%infracare%'`)
      .limit(1);

    if (existingInfracare.length === 0) {
      try {
        const [newComp] = await db
          .insert(companiesTable)
          .values({
            name: "Infracare",
            slug: "infracare",
            industry: "Facilities & Infrastructure",
            maxEmployees: 250,
          })
          .returning();

        if (newComp) {
          await db
            .insert(employeesTable)
            .values({
              companyId: newComp.id,
              name: "Infracare Administrator",
              email: "infracare.mu@gmail.com",
              role: "admin",
              status: "active",
              profileCompleted: true,
            })
            .onConflictDoNothing();
        }
      } catch {
        // ignore duplicate
      }
    }

    const rawCompanies = await db.select().from(companiesTable).orderBy(desc(companiesTable.createdAt));
    const companies = rawCompanies.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const slug = (c.slug || "").toLowerCase();
      const isTestOrSprint =
        name.includes("sprint") ||
        slug.includes("sprint") ||
        name.includes("mock") ||
        slug.includes("mock") ||
        (name.includes("test company") && !name.includes("infracare"));
      return !isTestOrSprint;
    });

    const employees = await db.select().from(employeesTable);

    const userCountMap = new Map<number, number>();
    const adminCountMap = new Map<number, number>();
    for (const emp of employees) {
      userCountMap.set(emp.companyId, (userCountMap.get(emp.companyId) || 0) + 1);
      if (emp.role === "admin") {
        adminCountMap.set(emp.companyId, (adminCountMap.get(emp.companyId) || 0) + 1);
      }
    }

    const registry = companies.map((c) => {
      const users = userCountMap.get(c.id) || 0;
      let band = "Up to 25";
      if (c.maxEmployees) {
        if (c.maxEmployees <= 25) band = "Up to 25";
        else if (c.maxEmployees <= 50) band = "26–50";
        else if (c.maxEmployees <= 80) band = "51–80";
        else if (c.maxEmployees <= 120) band = "81–120";
        else band = "Over 120 / Tailored";
      }

      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        status: "Active",
        planBand: band,
        maxEmployees: c.maxEmployees ?? 25,
        userCount: users,
        companyAdminCount: adminCountMap.get(c.id) || 0,
        onboardingComplete: true,
        createdAt: c.createdAt
      };
    });

    res.json(registry);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.post("/organisations", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const { name, industry, maxEmployees, adminEmail, adminName } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "Company name is required" });
      return;
    }

    const baseSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const [newComp] = await db
      .insert(companiesTable)
      .values({
        name: name.trim(),
        slug,
        industry: industry?.trim() || "Corporate",
        maxEmployees: maxEmployees ? parseInt(maxEmployees) : 25,
      })
      .returning();

    if (adminEmail && typeof adminEmail === "string" && adminEmail.trim()) {
      await db
        .insert(employeesTable)
        .values({
          companyId: newComp.id,
          name: adminName?.trim() || "Company Administrator",
          email: adminEmail.trim().toLowerCase(),
          role: "admin",
          status: "active",
          profileCompleted: true,
        })
        .onConflictDoNothing();
    }

    res.status(201).json(newComp);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.delete("/organisations/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const orgId = parseInt(req.params.id);
    if (!orgId || isNaN(orgId)) {
      res.status(400).json({ error: "Invalid organisation ID" });
      return;
    }

    await db.execute(sql`
      DELETE FROM "company_subscriptions" WHERE "company_id" = ${orgId};
      DELETE FROM "employee_invitations" WHERE "company_id" = ${orgId};
      DELETE FROM "departments" WHERE "company_id" = ${orgId};
      DELETE FROM "job_titles" WHERE "company_id" = ${orgId};
      DELETE FROM "employees" WHERE "company_id" = ${orgId};
      DELETE FROM "companies" WHERE "id" = ${orgId};
    `);

    res.json({ success: true, message: `Organisation #${orgId} deleted successfully` });
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.get("/organisations/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const orgId = parseInt(req.params.id);
    const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, orgId)).limit(1);
    if (!company) {
      res.status(404).json({ error: "Organisation not found" });
      return;
    }

    const employees = await db.select().from(employeesTable).where(eq(employeesTable.companyId, orgId));
    const companyAdmins = employees.filter((e) => e.role === "admin");
    const learners = employees.filter((e) => e.role !== "admin");

    res.json({
      organisation: company,
      companyAdmins,
      users: employees,
      trainingSummary: {
        totalLearners: learners.length,
        totalEnrolled: learners.reduce((sum, e) => sum + (e.enrolledCourses || 0), 0),
        totalCompleted: learners.reduce((sum, e) => sum + (e.completedCourses || 0), 0),
        certificatesIssued: company.certificatesIssued || 0
      }
    });
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.get("/accounts", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const employees = await db.select().from(employeesTable).orderBy(desc(employeesTable.createdAt));
    const companies = await db.select().from(companiesTable);
    const companyMap = new Map(companies.map((c) => [c.id, c.name]));

    const accounts = employees.map((e) => ({
      id: e.id,
      clerkUserId: e.clerkUserId,
      name: e.name,
      email: e.email,
      role: e.role === "admin" ? "COMPANY_ADMIN" : e.role === "manager" ? "MANAGER" : "LEARNER",
      companyId: e.companyId,
      companyName: companyMap.get(e.companyId) || "Unassigned / Orphaned",
      status: e.status,
      createdAt: e.createdAt,
      lastActiveAt: e.lastActiveAt
    }));

    res.json(accounts);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.get("/health", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const companies = await db.select().from(companiesTable);
    const employees = await db.select().from(employeesTable);
    const companyIds = new Set(companies.map((c) => c.id));

    const warnings: Array<{ id: string; type: string; severity: "HIGH" | "MEDIUM" | "LOW"; title: string; message: string }> = [];

    // 1. Missing Company Administrator
    const companyAdminCounts = new Map<number, number>();
    for (const emp of employees) {
      if (emp.role === "admin") {
        companyAdminCounts.set(emp.companyId, (companyAdminCounts.get(emp.companyId) || 0) + 1);
      }
    }
    for (const company of companies) {
      if (!companyAdminCounts.get(company.id)) {
        warnings.push({
          id: `missing-admin-${company.id}`,
          type: "MISSING_COMPANY_ADMIN",
          severity: "HIGH",
          title: `No Company Administrator assigned to ${company.name}`,
          message: `Organisation ID ${company.id} has no registered Company Administrator account.`
        });
      }
    }

    // 2. Orphaned users
    for (const emp of employees) {
      if (!companyIds.has(emp.companyId)) {
        warnings.push({
          id: `orphaned-user-${emp.id}`,
          type: "ORPHANED_USER",
          severity: "MEDIUM",
          title: `Orphaned User Account: ${emp.email}`,
          message: `User ${emp.name} (ID ${emp.id}) belongs to non-existent company ID ${emp.companyId}.`
        });
      }
    }

    res.json(warnings);
  } catch (err) {
    sendHttpError(res, err);
  }
});

router.get("/activity", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const companies = await db.select().from(companiesTable).orderBy(desc(companiesTable.createdAt)).limit(10);
    const employees = await db.select().from(employeesTable).orderBy(desc(employeesTable.createdAt)).limit(10);

    const logs: Array<{ id: string; eventType: string; timestamp: string; details: string }> = [];

    for (const c of companies) {
      logs.push({
        id: `org-created-${c.id}`,
        eventType: "ORGANISATION_CREATED",
        timestamp: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
        details: `Client organisation '${c.name}' (ID ${c.id}) was created.`
      });
    }

    for (const e of employees) {
      logs.push({
        id: `user-created-${e.id}`,
        eventType: e.role === "admin" ? "COMPANY_ADMIN_ASSIGNED" : "USER_CREATED",
        timestamp: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
        details: `User ${e.name} (${e.email}) registered under company ID ${e.companyId}.`
      });
    }

    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json(logs);
  } catch (err) {
    sendHttpError(res, err);
  }
});

export default router;

