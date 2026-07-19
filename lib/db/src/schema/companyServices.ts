import { pgTable, text, serial, integer, timestamp, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";

export const companyServicesTable = pgTable("company_services", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
  serviceType: text("service_type").notNull(), // ecolearn, recyclean
  status: text("status").notNull().default("active"), // active, inactive, pending
  startDate: timestamp("start_date", { withTimezone: true }).notNull().defaultNow(),
  inactiveDate: timestamp("inactive_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
  companyServiceIdx: index("company_services_company_id_idx").on(t.companyId),
  serviceTypeIdx: index("company_services_service_type_idx").on(t.serviceType),
  statusIdx: index("company_services_status_idx").on(t.status),
  // Uniqueness rule preventing duplicate relationships for the same company and service type
  uniqueCompanyService: unique("company_services_unique_company_service").on(t.companyId, t.serviceType),
}));

export const insertCompanyServiceSchema = createInsertSchema(companyServicesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCompanyService = z.infer<typeof insertCompanyServiceSchema>;
export type CompanyService = typeof companyServicesTable.$inferSelect;
