import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const insightCategoriesTable = pgTable("insight_categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"), // active, inactive
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertInsightCategorySchema = createInsertSchema(insightCategoriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInsightCategory = z.infer<typeof insertInsightCategorySchema>;
export type InsightCategory = typeof insightCategoriesTable.$inferSelect;

export const blogPostsTable = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(), // Markdown format strictly
  authorName: text("author_name").notNull(),
  authorTitle: text("author_title"),
  thumbnailUrl: text("thumbnail_url"),
  imageAlt: text("image_alt"),
  sourceReferences: jsonb("source_references").$type<Array<{
    title: string;
    publisher?: string;
    url?: string;
    publicationDate?: string;
    accessDate?: string;
  }>>().notNull().default([]),
  readingTimeMinutes: integer("reading_time_minutes").notNull().default(5),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  tags: text("tags").array().notNull().default([]),
  isPublished: boolean("is_published").notNull().default(true), // deprecated compatibility flag
  status: text("status").notNull().default("draft"), // draft, review, scheduled, published, archived
  insightCategoryId: integer("insight_category_id").references(() => insightCategoriesTable.id, { onDelete: "set null" }),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  reviewDate: timestamp("review_date", { withTimezone: true }),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const testimonialsTable = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  authorName: text("author_name").notNull(),
  authorTitle: text("author_title").notNull(),
  company: text("company").notNull(),
  text: text("text").notNull(),
  rating: serial("rating").notNull(),
  avatarUrl: text("avatar_url"),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBlogPostSchema = createInsertSchema(blogPostsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPostsTable.$inferSelect;

export const insertTestimonialSchema = createInsertSchema(testimonialsTable).omit({ id: true, createdAt: true });
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonialsTable.$inferSelect;

export const mauritiusResourcesTable = pgTable("mauritius_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  resourceType: text("resource_type").notNull(), // Act, Regulation, Rule, Policy, Government guideline, Code, Official notice, Authority, Compliance resource
  shortSummary: text("short_summary").notNull(),
  mainExplanation: text("main_explanation").notNull(), // Simplified EcoLearnHub explanation
  officialName: text("official_name"),
  resourceNumber: text("resource_number"),
  responsibleAuthority: text("responsible_authority"),
  relevantSector: text("relevant_sector"), // Waste, Energy, Water, Biodiversity, Pollution, Climate, Workplace, Procurement, ESG, General environmental compliance
  dateIssued: timestamp("date_issued", { withTimezone: true }),
  effectiveDate: timestamp("effective_date", { withTimezone: true }),
  officialSourceLink: text("official_source_link"),
  downloadableDocLink: text("downloadable_doc_link"),
  complianceRelevance: text("compliance_relevance"), // Compliance relevance
  practicalImplications: text("practical_implications"), // Practical implications for organisations
  status: text("status").notNull().default("draft"), // draft, published, archived
  disclaimer: text("disclaimer").notNull().default("This content is provided for general educational purposes and does not constitute legal advice. Users should refer to the official legislation and seek professional advice where required."),
  isFeatured: boolean("is_featured").notNull().default(false),
  relatedResources: jsonb("related_resources").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMauritiusResourceSchema = createInsertSchema(mauritiusResourcesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMauritiusResource = z.infer<typeof insertMauritiusResourceSchema>;
export type MauritiusResource = typeof mauritiusResourcesTable.$inferSelect;


