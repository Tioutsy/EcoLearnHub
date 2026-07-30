import { pgTable, text, serial, integer, numeric, boolean, timestamp, foreignKey, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";
import { coursesTable } from "./courses";

export const subscriptionPlansTable = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // 'ESSENTIAL' | 'PROFESSIONAL' | 'COMPLETE'
  name: text("name").notNull(),
  description: text("description").notNull(),
  tagline: text("tagline"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const employeeBandsTable = pgTable("employee_bands", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // 'UP_TO_25' | 'FROM_26_TO_50' | 'FROM_51_TO_80' | 'FROM_81_TO_120' | 'OVER_120'
  label: text("label").notNull(),
  minimumEmployees: integer("minimum_employees").notNull(),
  maximumEmployees: integer("maximum_employees"), // null for OVER_120
  displayOrder: integer("display_order").notNull().default(0),
  requiresTailoredQuote: boolean("requires_tailored_quote").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const planPricesTable = pgTable("plan_prices", {
  id: serial("id").primaryKey(),
  subscriptionPlanId: integer("subscription_plan_id").notNull().references(() => subscriptionPlansTable.id, { onDelete: "cascade" }),
  employeeBandId: integer("employee_band_id").notNull().references(() => employeeBandsTable.id, { onDelete: "cascade" }),
  currency: text("currency").notNull().default("MUR"),
  monthlyAmount: numeric("monthly_amount", { precision: 10, scale: 2 }), // null for OVER_120 tailored quote
  requiresTailoredQuote: boolean("requires_tailored_quote").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull().defaultNow(),
  effectiveUntil: timestamp("effective_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
  uniquePlanBandActive: unique("unique_plan_band_active").on(t.subscriptionPlanId, t.employeeBandId, t.effectiveFrom),
}));

export const planCourseEntitlementsTable = pgTable("plan_course_entitlements", {
  id: serial("id").primaryKey(),
  subscriptionPlanId: integer("subscription_plan_id").notNull().references(() => subscriptionPlansTable.id, { onDelete: "cascade" }),
  courseId: integer("course_id").notNull().references(() => coursesTable.id, { onDelete: "cascade" }),
  accessType: text("access_type").notNull().default("INCLUDED"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniquePlanCourse: unique("unique_plan_course").on(t.subscriptionPlanId, t.courseId),
}));

export const planFeatureEntitlementsTable = pgTable("plan_feature_entitlements", {
  id: serial("id").primaryKey(),
  subscriptionPlanId: integer("subscription_plan_id").notNull().references(() => subscriptionPlansTable.id, { onDelete: "cascade" }),
  featureCode: text("feature_code").notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  limitsJson: text("limits_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniquePlanFeature: unique("unique_plan_feature").on(t.subscriptionPlanId, t.featureCode),
}));

export const companySubscriptionsTable = pgTable("company_subscriptions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
  subscriptionPlanId: integer("subscription_plan_id").notNull().references(() => subscriptionPlansTable.id, { onDelete: "cascade" }),
  employeeBandId: integer("employee_band_id").notNull().references(() => employeeBandsTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("ACTIVE"), // 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED'
  currency: text("currency").notNull().default("MUR"),
  agreedMonthlyAmount: numeric("agreed_monthly_amount", { precision: 10, scale: 2 }),
  pricingSource: text("pricing_source").notNull().default("STANDARD"), // 'STANDARD' | 'TAILORED' | 'LEGACY'
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull().defaultNow(),
  currentPeriodStartsAt: timestamp("current_period_starts_at", { withTimezone: true }),
  currentPeriodEndsAt: timestamp("current_period_ends_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  accessEndsAt: timestamp("access_ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
  uniqueCompanySubscription: unique("unique_company_subscription").on(t.companyId),
}));

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlansTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlansTable.$inferSelect;

export const insertEmployeeBandSchema = createInsertSchema(employeeBandsTable).omit({ id: true, createdAt: true });
export type InsertEmployeeBand = z.infer<typeof insertEmployeeBandSchema>;
export type EmployeeBand = typeof employeeBandsTable.$inferSelect;

export const insertPlanPriceSchema = createInsertSchema(planPricesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPlanPrice = z.infer<typeof insertPlanPriceSchema>;
export type PlanPrice = typeof planPricesTable.$inferSelect;

export const insertPlanCourseEntitlementSchema = createInsertSchema(planCourseEntitlementsTable).omit({ id: true, createdAt: true });
export type InsertPlanCourseEntitlement = z.infer<typeof insertPlanCourseEntitlementSchema>;
export type PlanCourseEntitlement = typeof planCourseEntitlementsTable.$inferSelect;

export const insertCompanySubscriptionSchema = createInsertSchema(companySubscriptionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCompanySubscription = z.infer<typeof insertCompanySubscriptionSchema>;
export type CompanySubscription = typeof companySubscriptionsTable.$inferSelect;
