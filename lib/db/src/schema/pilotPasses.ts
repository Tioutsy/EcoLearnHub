import { pgTable, text, serial, integer, timestamp, varchar, unique, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";
import { companySubscriptionsTable } from "./subscriptionPlans";

export const companyPilotPassesTable = pgTable(
  "company_pilot_passes",
  {
    id: serial("id").primaryKey(),
    codeHash: text("code_hash").notNull().unique(),
    codeLastFour: varchar("code_last_four", { length: 4 }).notNull(),
    companyName: text("company_name").notNull(),
    intendedContactName: text("intended_contact_name").notNull(),
    intendedContactEmail: text("intended_contact_email").notNull(),
    intendedEmailDomain: text("intended_email_domain"),
    status: text("status").notNull().default("issued"), // 'issued' | 'active' | 'expired' | 'revoked' | 'converted'
    durationDays: integer("duration_days").notNull().default(30),
    learnerSeatLimit: integer("learner_seat_limit").notNull().default(10),
    administratorSeatLimit: integer("administrator_seat_limit").notNull().default(1),
    permittedCourseIds: integer("permitted_course_ids").array().notNull().default([]),
    internalSalesNote: text("internal_sales_note"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    retentionEndsAt: timestamp("retention_ends_at", { withTimezone: true }),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
    redeemedByUserId: text("redeemed_by_user_id"),
    companyId: integer("company_id").references(() => companiesTable.id, { onDelete: "set null" }),
    createdByPlatformAdminId: text("created_by_platform_admin_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokedBy: text("revoked_by"),
    revocationReason: text("revocation_reason"),
    extendedAt: timestamp("extended_at", { withTimezone: true }),
    extensionReason: text("extension_reason"),
    convertedAt: timestamp("converted_at", { withTimezone: true }),
    convertedSubscriptionId: integer("converted_subscription_id").references(() => companySubscriptionsTable.id, { onDelete: "set null" }),
  },
  (t) => ({
    uidxPilotCodeHash: unique("uidx_company_pilot_passes_code_hash").on(t.codeHash),
    idxPilotCompanyStatus: index("idx_company_pilot_passes_company_status").on(t.companyId, t.status),
    idxPilotStatus: index("idx_company_pilot_passes_status").on(t.status),
  })
);

export const pilotPassAuditLogsTable = pgTable(
  "pilot_pass_audit_logs",
  {
    id: serial("id").primaryKey(),
    pilotPassId: integer("pilot_pass_id").notNull().references(() => companyPilotPassesTable.id, { onDelete: "cascade" }),
    action: text("action").notNull(), // 'created' | 'revealed' | 'redeemed' | 'activated' | 'extended' | 'revoked' | 'expired' | 'converted'
    performedBy: text("performed_by").notNull(),
    details: text("details"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    idxAuditPilotPassId: index("idx_pilot_pass_audit_logs_pass_id").on(t.pilotPassId),
  })
);

export const insertCompanyPilotPassSchema = createInsertSchema(companyPilotPassesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCompanyPilotPass = z.infer<typeof insertCompanyPilotPassSchema>;
export type CompanyPilotPass = typeof companyPilotPassesTable.$inferSelect;

export const insertPilotPassAuditLogSchema = createInsertSchema(pilotPassAuditLogsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertPilotPassAuditLog = z.infer<typeof insertPilotPassAuditLogSchema>;
export type PilotPassAuditLog = typeof pilotPassAuditLogsTable.$inferSelect;
