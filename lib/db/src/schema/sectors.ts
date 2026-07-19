import { pgTable, text, serial, integer, timestamp, primaryKey, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";
import { coursesTable } from "./courses";
import { learningPathsTable } from "./learningPaths";
import { blogPostsTable } from "./blog";

export const sectorsTable = pgTable("sectors", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"), // active, inactive
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSectorSchema = createInsertSchema(sectorsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSector = z.infer<typeof insertSectorSchema>;
export type Sector = typeof sectorsTable.$inferSelect;

// 1. Company Sectors many-to-many
export const companySectorsTable = pgTable("company_sectors", {
  companyId: integer("company_id").notNull(),
  sectorId: integer("sector_id").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.companyId, t.sectorId] }),
  companyFk: foreignKey({
    columns: [t.companyId],
    foreignColumns: [companiesTable.id],
    name: "company_sectors_company_id_fk"
  }).onDelete("cascade"),
  sectorFk: foreignKey({
    columns: [t.sectorId],
    foreignColumns: [sectorsTable.id],
    name: "company_sectors_sector_id_fk"
  }).onDelete("cascade")
}));

// 2. Course Sectors many-to-many
export const courseSectorsTable = pgTable("course_sectors", {
  courseId: integer("course_id").notNull(),
  sectorId: integer("sector_id").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.courseId, t.sectorId] }),
  courseFk: foreignKey({
    columns: [t.courseId],
    foreignColumns: [coursesTable.id],
    name: "course_sectors_course_id_fk"
  }).onDelete("cascade"),
  sectorFk: foreignKey({
    columns: [t.sectorId],
    foreignColumns: [sectorsTable.id],
    name: "course_sectors_sector_id_fk"
  }).onDelete("cascade")
}));

// 3. Learning Path Sectors many-to-many
export const learningPathSectorsTable = pgTable("learning_path_sectors", {
  pathId: integer("path_id").notNull(),
  sectorId: integer("sector_id").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.pathId, t.sectorId] }),
  pathFk: foreignKey({
    columns: [t.pathId],
    foreignColumns: [learningPathsTable.id],
    name: "learning_path_sectors_path_id_fk"
  }).onDelete("cascade"),
  sectorFk: foreignKey({
    columns: [t.sectorId],
    foreignColumns: [sectorsTable.id],
    name: "learning_path_sectors_sector_id_fk"
  }).onDelete("cascade")
}));

// 4. Blog Post (Insight) Sectors many-to-many
export const blogPostSectorsTable = pgTable("blog_post_sectors", {
  blogPostId: integer("blog_post_id").notNull(),
  sectorId: integer("sector_id").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.blogPostId, t.sectorId] }),
  blogPostFk: foreignKey({
    columns: [t.blogPostId],
    foreignColumns: [blogPostsTable.id],
    name: "blog_post_sectors_blog_post_id_fk"
  }).onDelete("cascade"),
  sectorFk: foreignKey({
    columns: [t.sectorId],
    foreignColumns: [sectorsTable.id],
    name: "blog_post_sectors_sector_id_fk"
  }).onDelete("cascade")
}));

// 5. Workplace Scenarios
export const workplaceScenariosTable = pgTable("workplace_scenarios", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Markdown format
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWorkplaceScenarioSchema = createInsertSchema(workplaceScenariosTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWorkplaceScenario = z.infer<typeof insertWorkplaceScenarioSchema>;
export type WorkplaceScenario = typeof workplaceScenariosTable.$inferSelect;

// 6. Scenario Sectors many-to-many
export const scenarioSectorsTable = pgTable("scenario_sectors", {
  scenarioId: integer("scenario_id").notNull(),
  sectorId: integer("sector_id").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.scenarioId, t.sectorId] }),
  scenarioFk: foreignKey({
    columns: [t.scenarioId],
    foreignColumns: [workplaceScenariosTable.id],
    name: "scenario_sectors_scenario_id_fk"
  }).onDelete("cascade"),
  sectorFk: foreignKey({
    columns: [t.sectorId],
    foreignColumns: [sectorsTable.id],
    name: "scenario_sectors_sector_id_fk"
  }).onDelete("cascade")
}));
