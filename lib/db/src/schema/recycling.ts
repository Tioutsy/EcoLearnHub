import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recyclingCollectionsTable = pgTable(
  "recycling_collections",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id").notNull(),
    siteName: text("site_name").notNull(),
    collectionDate: timestamp("collection_date", { withTimezone: true }).notNull(),
    reportingMonth: text("reporting_month").notNull(),
    paperCardboardKg: numeric("paper_cardboard_kg", {
      precision: 12,
      scale: 3,
    })
      .notNull()
      .default("0"),
    plasticKg: numeric("plastic_kg", { precision: 12, scale: 3 })
      .notNull()
      .default("0"),
    glassKg: numeric("glass_kg", { precision: 12, scale: 3 })
      .notNull()
      .default("0"),
    aluminiumMetalKg: numeric("aluminium_metal_kg", {
      precision: 12,
      scale: 3,
    })
      .notNull()
      .default("0"),
    otherKg: numeric("other_kg", { precision: 12, scale: 3 })
      .notNull()
      .default("0"),
    totalKg: numeric("total_kg", { precision: 12, scale: 3 }).notNull(),
    internalComment: text("internal_comment"),
    createdByUserId: text("created_by_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    companyMonthIdx: index("recycling_collections_company_month_idx").on(
      table.companyId,
      table.reportingMonth,
    ),
    companyDateIdx: index("recycling_collections_company_date_idx").on(
      table.companyId,
      table.collectionDate,
    ),
    companySiteIdx: index("recycling_collections_company_site_idx").on(
      table.companyId,
      table.siteName,
    ),
  }),
);

export const recyclingConversionFactorsTable = pgTable(
  "recycling_conversion_factors",
  {
    id: serial("id").primaryKey(),
    materialType: text("material_type").notNull().default("total"),
    metricName: text("metric_name").notNull(),
    metricLabel: text("metric_label").notNull(),
    factorValue: numeric("factor_value", { precision: 16, scale: 6 }).notNull(),
    factorUnit: text("factor_unit").notNull(),
    sourceName: text("source_name").notNull(),
    sourceReference: text("source_reference"),
    effectiveDate: timestamp("effective_date", { withTimezone: true }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    internalNotes: text("internal_notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    activeMetricIdx: index("recycling_conversion_factors_active_metric_idx").on(
      table.metricName,
      table.isActive,
    ),
  }),
);

export const recyclingEnquiriesTable = pgTable(
  "recycling_enquiries",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id"),
    companyName: text("company_name").notNull(),
    contactName: text("contact_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    siteLocation: text("site_location"),
    currentArrangement: text("current_arrangement"),
    message: text("message"),
    status: text("status").notNull().default("new"),
    createdByUserId: text("created_by_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    companyIdx: index("recycling_enquiries_company_idx").on(table.companyId),
    statusIdx: index("recycling_enquiries_status_idx").on(table.status),
  }),
);

export const insertRecyclingCollectionSchema = createInsertSchema(
  recyclingCollectionsTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRecyclingConversionFactorSchema = createInsertSchema(
  recyclingConversionFactorsTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRecyclingEnquirySchema = createInsertSchema(
  recyclingEnquiriesTable,
).omit({ id: true, status: true, createdAt: true, updatedAt: true });

export type RecyclingCollection =
  typeof recyclingCollectionsTable.$inferSelect;
export type InsertRecyclingCollection = z.infer<
  typeof insertRecyclingCollectionSchema
>;
export type RecyclingConversionFactor =
  typeof recyclingConversionFactorsTable.$inferSelect;
export type RecyclingEnquiry = typeof recyclingEnquiriesTable.$inferSelect;
