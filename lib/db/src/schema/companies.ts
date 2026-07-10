import { pgTable, text, serial, integer, boolean, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const companiesTable = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  industry: text("industry"),
  logoUrl: text("logo_url"),
  planId: integer("plan_id"),
  employeeCount: integer("employee_count").notNull().default(0),
  maxEmployees: integer("max_employees"),
  completionRate: numeric("completion_rate", { precision: 5, scale: 2 }),
  certificatesIssued: integer("certificates_issued").notNull().default(0),
  badges: text("badges").array().notNull().default([]),
  isPublicProfile: boolean("is_public_profile").notNull().default(false),
  leaderboardEnabled: boolean("leaderboard_enabled").notNull().default(true),
  stripeCustomerId: text("stripe_customer_id"),
  recyclingServiceStatus: text("recycling_service_status").notNull().default("NOT_CLIENT"),
  recycleanCustomerRef: text("recyclean_customer_ref"),
  recyclingServiceStartDate: timestamp("recycling_service_start_date", { withTimezone: true }),
  defaultCollectionSiteName: text("default_collection_site_name"),
  recyclingServiceFrequency: text("recycling_service_frequency"),
  recyclingInternalNotes: text("recycling_internal_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCompanySchema = createInsertSchema(companiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companiesTable.$inferSelect;
