import { pgTable, text, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { employeesTable } from "./employees";
import { companiesTable } from "./companies";

export const badgeDefinitionsTable = pgTable("badge_definitions", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("award"),
  criteriaType: text("criteria_type").notNull(),
  threshold: integer("threshold").notNull().default(0),
  courseIds: integer("course_ids").array().notNull().default([]),
  orderIndex: integer("order_index").notNull().default(0),
  code: text("code").unique(),
});

export const insertBadgeDefinitionSchema = createInsertSchema(badgeDefinitionsTable).omit({ id: true });
export type InsertBadgeDefinition = z.infer<typeof insertBadgeDefinitionSchema>;
export type BadgeDefinition = typeof badgeDefinitionsTable.$inferSelect;

export const employeeBadgesTable = pgTable("employee_badges", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employeesTable.id, { onDelete: "cascade" }),
  companyId: integer("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
  badgeId: integer("badge_id").notNull().references(() => badgeDefinitionsTable.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
  awardSource: text("award_source").notNull(),
}, (t) => [
  unique("uniq_employee_badge").on(t.employeeId, t.badgeId),
]);

export const insertEmployeeBadgeSchema = createInsertSchema(employeeBadgesTable).omit({ id: true, earnedAt: true });
export type InsertEmployeeBadge = z.infer<typeof insertEmployeeBadgeSchema>;
export type EmployeeBadge = typeof employeeBadgesTable.$inferSelect;

