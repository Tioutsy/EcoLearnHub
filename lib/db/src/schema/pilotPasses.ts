import { pgTable, text, serial, integer, timestamp, varchar, unique, index, jsonb } from "drizzle-orm/pg-core";
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

// ── Company Upgrade Requests (Sprint 12.3) ───────────────────────────────────
export const companyUpgradeRequestsTable = pgTable(
  "company_upgrade_requests",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
    pilotPassId: integer("pilot_pass_id").references(() => companyPilotPassesTable.id, { onDelete: "set null" }),
    selectedPlanCode: text("selected_plan_code").notNull(), // 'COMPLETE' | 'PROFESSIONAL' | 'ESSENTIAL'
    selectedEmployeeBandCode: text("selected_employee_band_code").notNull(), // 'UP_TO_25' | 'FROM_26_TO_50' | 'FROM_51_TO_100' | 'FROM_101_TO_250' | 'CUSTOM_ENTERPRISE'
    billingInterval: text("billing_interval").notNull().default("MONTHLY"), // 'MONTHLY' | 'YEARLY'
    billingContactName: text("billing_contact_name").notNull(),
    billingContactEmail: text("billing_contact_email").notNull(),
    companyNote: text("company_note"),
    status: text("status").notNull().default("REQUESTED"), // 'REQUESTED' | 'AWAITING_PAYMENT' | 'PAYMENT_UNDER_REVIEW' | 'PAYMENT_CONFIRMED' | 'CONVERTED' | 'CANCELLED' | 'REJECTED'
    requestedByUserId: text("requested_by_user_id").notNull(),
    requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
    paymentReference: text("payment_reference"),
    paymentDate: timestamp("payment_date", { withTimezone: true }),
    paymentAmountMUR: integer("payment_amount_mur"),
    paymentMethod: text("payment_method"), // 'BANK_TRANSFER' | 'CREDIT_CARD' | 'MANUAL_INVOICE'
    paymentInternalNote: text("payment_internal_note"),
    paymentConfirmedByPlatformAdminId: text("payment_confirmed_by_platform_admin_id"),
    paymentConfirmedAt: timestamp("payment_confirmed_at", { withTimezone: true }),
    convertedSubscriptionId: integer("converted_subscription_id").references(() => companySubscriptionsTable.id, { onDelete: "set null" }),
    convertedAt: timestamp("converted_at", { withTimezone: true }),
    convertedBy: text("converted_by"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelledBy: text("cancelled_by"),
    cancellationReason: text("cancellation_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (t) => ({
    idxUpgradeCompanyStatus: index("idx_company_upgrade_requests_company_status").on(t.companyId, t.status),
    idxUpgradeStatus: index("idx_company_upgrade_requests_status").on(t.status),
  })
);

export const insertCompanyUpgradeRequestSchema = createInsertSchema(companyUpgradeRequestsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCompanyUpgradeRequest = z.infer<typeof insertCompanyUpgradeRequestSchema>;
export type CompanyUpgradeRequest = typeof companyUpgradeRequestsTable.$inferSelect;

// ── Pilot Expiry & Milestone Notifications (Sprint 12.3) ─────────────────────
export const pilotNotificationsTable = pgTable(
  "pilot_notifications",
  {
    id: serial("id").primaryKey(),
    pilotPassId: integer("pilot_pass_id").notNull().references(() => companyPilotPassesTable.id, { onDelete: "cascade" }),
    companyId: integer("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
    notificationType: text("notification_type").notNull(), // '7_DAYS_WARNING' | '3_DAYS_WARNING' | '1_DAY_WARNING' | 'EXPIRED' | 'EXTENDED' | 'CONVERTED'
    recipientEmail: text("recipient_email").notNull(),
    recipientName: text("recipient_name"),
    milestoneCycleKey: text("milestone_cycle_key").notNull().unique(), // e.g. `${passId}-${type}-${expiresAtDateIso}`
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    deliveryStatus: text("delivery_status").notNull().default("PENDING"), // 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED'
    providerReference: text("provider_reference"),
    sanitizedError: text("sanitized_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uidxPilotNotificationCycle: unique("uidx_pilot_notifications_milestone_cycle").on(t.milestoneCycleKey),
    idxPilotNotificationStatus: index("idx_pilot_notifications_status").on(t.deliveryStatus),
    idxPilotNotificationPass: index("idx_pilot_notifications_pass_id").on(t.pilotPassId),
  })
);

export const insertPilotNotificationSchema = createInsertSchema(pilotNotificationsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertPilotNotification = z.infer<typeof insertPilotNotificationSchema>;
export type PilotNotification = typeof pilotNotificationsTable.$inferSelect;

// ── Upgrade Request Audit Logs (Sprint 12.3) ─────────────────────────────────
export const upgradeRequestAuditLogsTable = pgTable(
  "upgrade_request_audit_logs",
  {
    id: serial("id").primaryKey(),
    upgradeRequestId: integer("upgrade_request_id").notNull().references(() => companyUpgradeRequestsTable.id, { onDelete: "cascade" }),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    action: text("action").notNull(), // 'requested' | 'status_changed' | 'payment_confirmed' | 'converted' | 'cancelled'
    performedBy: text("performed_by").notNull(),
    details: text("details"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    idxUpgradeAuditRequestId: index("idx_upgrade_request_audit_logs_request_id").on(t.upgradeRequestId),
  })
);

export const insertUpgradeRequestAuditLogSchema = createInsertSchema(upgradeRequestAuditLogsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertUpgradeRequestAuditLog = z.infer<typeof insertUpgradeRequestAuditLogSchema>;
export type UpgradeRequestAuditLog = typeof upgradeRequestAuditLogsTable.$inferSelect;

export const catalogueRemediationAuditLogsTable = pgTable(
  "catalogue_remediation_audit_logs",
  {
    id: serial("id").primaryKey(),
    batchId: text("batch_id").notNull().default("batch-sprint-12-3-1"),
    entityType: text("entity_type").notNull(), // 'enrollment' | 'certificate' | 'pilot_pass' | 'course'
    entityId: integer("entity_id"),
    originalData: jsonb("original_data").notNull(),
    actionTaken: text("action_taken").notNull(), // 'deleted_orphan' | 'revoked_certificate' | 'pruned_courses' | 'suspended_pilot_pass' | 'deleted_obsolete_draft'
    reason: text("reason").notNull(),
    source: text("source").notNull().default("system:remediation"),
    performedBy: text("performed_by").notNull().default("system:remediation"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    idxRemediationBatchId: index("idx_catalogue_remediation_batch_id").on(t.batchId),
    idxRemediationEntityType: index("idx_catalogue_remediation_entity_type").on(t.entityType),
    idxRemediationActionTaken: index("idx_catalogue_remediation_action_taken").on(t.actionTaken),
  })
);

export const insertCatalogueRemediationAuditLogSchema = createInsertSchema(catalogueRemediationAuditLogsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertCatalogueRemediationAuditLog = z.infer<typeof insertCatalogueRemediationAuditLogSchema>;
export type CatalogueRemediationAuditLog = typeof catalogueRemediationAuditLogsTable.$inferSelect;
