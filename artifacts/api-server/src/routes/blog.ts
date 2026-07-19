import { Router } from "express";
import { db } from "@workspace/db";
import { blogPostsTable, testimonialsTable, mauritiusResourcesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

// Public Articles list (Insights)
router.get("/insights/articles", async (_req, res): Promise<void> => {
  try {
    const posts = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.status, "published"))
      .orderBy(blogPostsTable.publishedAt);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Public Single Article (Insights)
router.get("/insights/articles/:slug", async (req, res): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const [post] = await db
      .select()
      .from(blogPostsTable)
      .where(
        and(
          eq(blogPostsTable.slug, raw),
          eq(blogPostsTable.status, "published")
        )
      );
    if (!post) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Public Mauritius resources list
router.get("/insights/mauritius-resources", async (req, res): Promise<void> => {
  try {
    const { resourceType, sector, authority } = req.query;
    const conditions = [eq(mauritiusResourcesTable.status, "published")];

    if (resourceType) {
      conditions.push(eq(mauritiusResourcesTable.resourceType, resourceType as string));
    }
    if (sector) {
      conditions.push(eq(mauritiusResourcesTable.relevantSector, sector as string));
    }
    if (authority) {
      conditions.push(eq(mauritiusResourcesTable.responsibleAuthority, authority as string));
    }

    const resources = await db
      .select()
      .from(mauritiusResourcesTable)
      .where(and(...conditions))
      .orderBy(mauritiusResourcesTable.createdAt);

    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Public Single Mauritius resource
router.get("/insights/mauritius-resources/:slug", async (req, res): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const [resource] = await db
      .select()
      .from(mauritiusResourcesTable)
      .where(
        and(
          eq(mauritiusResourcesTable.slug, raw),
          eq(mauritiusResourcesTable.status, "published")
        )
      );

    if (!resource) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Deprecated /blog legacy compatibility endpoint
router.get("/blog", async (_req, res): Promise<void> => {
  const posts = await db
    .select()
    .from(blogPostsTable)
    .where(eq(blogPostsTable.status, "published"))
    .orderBy(blogPostsTable.publishedAt);
  res.json(posts);
});

router.get("/blog/:slug", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const [post] = await db
    .select()
    .from(blogPostsTable)
    .where(
      and(
        eq(blogPostsTable.slug, raw),
        eq(blogPostsTable.status, "published")
      )
    );
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(post);
});

router.get("/testimonials", async (_req, res): Promise<void> => {
  const testimonials = await db
    .select()
    .from(testimonialsTable)
    .where(eq(testimonialsTable.isPublished, true));
  res.json(testimonials);
});

export default router;
