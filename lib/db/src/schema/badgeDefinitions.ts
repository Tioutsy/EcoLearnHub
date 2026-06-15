import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

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
});

export const insertBadgeDefinitionSchema = createInsertSchema(badgeDefinitionsTable).omit({ id: true });
export type InsertBadgeDefinition = z.infer<typeof insertBadgeDefinitionSchema>;
export type BadgeDefinition = typeof badgeDefinitionsTable.$inferSelect;
