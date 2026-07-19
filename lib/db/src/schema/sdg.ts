import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { coursesTable } from "./courses";
import { learningPathsTable } from "./learningPaths";
import { blogPostsTable } from "./blog";
import { companiesTable } from "./companies";

export const sdgGoalsTable = pgTable("sdg_goals", {
  id: serial("id").primaryKey(),
  goalNumber: integer("goal_number").notNull().unique(), // 1 to 17
  title: text("title").notNull(),
  officialReference: text("official_reference"),
  sourceVersion: text("source_version"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertSdgGoalSchema = createInsertSchema(sdgGoalsTable).omit({ id: true });
export type InsertSdgGoal = z.infer<typeof insertSdgGoalSchema>;
export type SdgGoal = typeof sdgGoalsTable.$inferSelect;

export const sdgTargetsTable = pgTable("sdg_targets", {
  id: serial("id").primaryKey(),
  sdgGoalId: integer("sdg_goal_id").notNull(),
  targetCode: text("target_code").notNull().unique(), // e.g. "12.5"
  officialOrApprovedSummary: text("official_or_approved_summary").notNull(),
  officialReference: text("official_reference"),
  sourceVersion: text("source_version"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
}, (t) => ({
  goalFk: foreignKey({
    columns: [t.sdgGoalId],
    foreignColumns: [sdgGoalsTable.id],
    name: "sdg_targets_sdg_goal_id_fk"
  }).onDelete("cascade")
}));

export const insertSdgTargetSchema = createInsertSchema(sdgTargetsTable).omit({ id: true });
export type InsertSdgTarget = z.infer<typeof insertSdgTargetSchema>;
export type SdgTarget = typeof sdgTargetsTable.$inferSelect;

export const sdgContributionsTable = pgTable("sdg_contributions", {
  id: serial("id").primaryKey(),
  sdgTargetId: integer("sdg_target_id").notNull(),
  contributionCategory: text("contribution_category").notNull(), // education_awareness, capacity_building, operational_output, operational_outcome, self_reported_action, calculated_estimate
  rationale: text("rationale").notNull(),
  evidenceRequired: text("evidence_required"),
  evidenceStrength: text("evidence_strength").notNull().default("medium"), // weak, medium, strong
  isDirect: boolean("is_direct").notNull().default(false),
  sourceReference: text("source_reference"),
  methodologyVersion: text("methodology_version"),
  limitations: text("limitations"),
  status: text("status").notNull().default("active"), // active, inactive, archived
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
  targetFk: foreignKey({
    columns: [t.sdgTargetId],
    foreignColumns: [sdgTargetsTable.id],
    name: "sdg_contributions_sdg_target_id_fk"
  }).onDelete("cascade")
}));

export const insertSdgContributionSchema = createInsertSchema(sdgContributionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSdgContribution = z.infer<typeof insertSdgContributionSchema>;
export type SdgContribution = typeof sdgContributionsTable.$inferSelect;

// Link tables many-to-many:
// 1. Course SDG contributions
export const courseSdgContributionsTable = pgTable("course_sdg_contributions", {
  courseId: integer("course_id").notNull(),
  sdgContributionId: integer("sdg_contribution_id").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.courseId, t.sdgContributionId] }),
  courseFk: foreignKey({
    columns: [t.courseId],
    foreignColumns: [coursesTable.id],
    name: "course_sdg_contributions_course_id_fk"
  }).onDelete("cascade"),
  contributionFk: foreignKey({
    columns: [t.sdgContributionId],
    foreignColumns: [sdgContributionsTable.id],
    name: "course_sdg_contributions_contribution_id_fk"
  }).onDelete("cascade")
}));

// 2. Learning Path SDG contributions
export const learningPathSdgContributionsTable = pgTable("learning_path_sdg_contributions", {
  pathId: integer("path_id").notNull(),
  sdgContributionId: integer("sdg_contribution_id").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.pathId, t.sdgContributionId] }),
  pathFk: foreignKey({
    columns: [t.pathId],
    foreignColumns: [learningPathsTable.id],
    name: "learning_path_sdg_contributions_path_id_fk"
  }).onDelete("cascade"),
  contributionFk: foreignKey({
    columns: [t.sdgContributionId],
    foreignColumns: [sdgContributionsTable.id],
    name: "learning_path_sdg_contributions_contribution_id_fk"
  }).onDelete("cascade")
}));

// 3. Blog Post (Insight) SDG contributions
export const blogPostSdgContributionsTable = pgTable("blog_post_sdg_contributions", {
  blogPostId: integer("blog_post_id").notNull(),
  sdgContributionId: integer("sdg_contribution_id").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.blogPostId, t.sdgContributionId] }),
  blogPostFk: foreignKey({
    columns: [t.blogPostId],
    foreignColumns: [blogPostsTable.id],
    name: "blog_post_sdg_contributions_blog_post_id_fk"
  }).onDelete("cascade"),
  contributionFk: foreignKey({
    columns: [t.sdgContributionId],
    foreignColumns: [sdgContributionsTable.id],
    name: "blog_post_sdg_contributions_contribution_id_fk"
  }).onDelete("cascade")
}));

// 4. Recycling SDG contributions
export const recyclingSdgContributionsTable = pgTable("recycling_sdg_contributions", {
  materialKey: text("material_key").notNull(), // e.g. 'plasticKg', 'paperCardboardKg', 'glassKg', 'aluminiumMetalKg'
  sdgContributionId: integer("sdg_contribution_id").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.materialKey, t.sdgContributionId] }),
  contributionFk: foreignKey({
    columns: [t.sdgContributionId],
    foreignColumns: [sdgContributionsTable.id],
    name: "recycling_sdg_contributions_contribution_id_fk"
  }).onDelete("cascade")
}));

// 5. Company Actions & SDG contributions
export const companyActionsTable = pgTable("company_actions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
  companyFk: foreignKey({
    columns: [t.companyId],
    foreignColumns: [companiesTable.id],
    name: "company_actions_company_id_fk"
  }).onDelete("cascade")
}));

export const insertCompanyActionSchema = createInsertSchema(companyActionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCompanyAction = z.infer<typeof insertCompanyActionSchema>;
export type CompanyAction = typeof companyActionsTable.$inferSelect;

export const companyActionSdgContributionsTable = pgTable("company_action_sdg_contributions", {
  actionId: integer("action_id").notNull(),
  sdgContributionId: integer("sdg_contribution_id").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.actionId, t.sdgContributionId] }),
  actionFk: foreignKey({
    columns: [t.actionId],
    foreignColumns: [companyActionsTable.id],
    name: "company_action_sdg_contributions_action_id_fk"
  }).onDelete("cascade"),
  contributionFk: foreignKey({
    columns: [t.sdgContributionId],
    foreignColumns: [sdgContributionsTable.id],
    name: "company_action_sdg_contributions_contribution_id_fk"
  }).onDelete("cascade")
}));
