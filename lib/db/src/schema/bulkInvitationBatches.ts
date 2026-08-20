import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { companiesTable } from "./companies";
import { employeeInvitationsTable } from "./employeeInvitations";

export const bulkInvitationBatchesTable = pgTable(
  "bulk_invitation_batches",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id")
      .notNull()
      .references(() => companiesTable.id, { onDelete: "cascade" }),
    uploadedByUserId: text("uploaded_by_user_id").notNull(),
    fileName: text("file_name").notNull(),
    totalRows: integer("total_rows").notNull().default(0),
    validRows: integer("valid_rows").notNull().default(0),
    skippedRows: integer("skipped_rows").notNull().default(0),
    queuedCount: integer("queued_count").notNull().default(0),
    sentCount: integer("sent_count").notNull().default(0),
    failedCount: integer("failed_count").notNull().default(0),
    status: text("status").notNull().default("processing"), // processing, completed, failed, rejected_seat_limit
    errorReportJson: text("error_report_json"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyIdIdx: index("idx_bulk_invitation_batches_company_id").on(table.companyId),
    statusIdx: index("idx_bulk_invitation_batches_status").on(table.status),
    createdAtIdx: index("idx_bulk_invitation_batches_created_at").on(table.createdAt),
  })
);

export const invitationEmailQueueTable = pgTable(
  "invitation_email_queue",
  {
    id: serial("id").primaryKey(),
    batchId: integer("batch_id").references(() => bulkInvitationBatchesTable.id, {
      onDelete: "set null",
    }),
    companyId: integer("company_id")
      .notNull()
      .references(() => companiesTable.id, { onDelete: "cascade" }),
    invitationId: integer("invitation_id")
      .notNull()
      .references(() => employeeInvitationsTable.id, { onDelete: "cascade" }),
    recipientEmail: text("recipient_email").notNull(),
    recipientName: text("recipient_name").notNull(),
    /**
     * AES-256-GCM encrypted raw invitation token.
     * Format: base64(iv):base64(authTag):base64(ciphertext)
     * NULLed after successful or permanently-failed delivery.
     * Never logged. Worker decrypts at send time to build the invitation URL.
     */
    encryptedRawToken: text("encrypted_raw_token"),
    status: text("status").notNull().default("queued"), // queued, sending, sent, delivered, failed
    retryCount: integer("retry_count").notNull().default(0),
    maxRetries: integer("max_retries").notNull().default(3),
    /** Timestamp set when a worker atomically claims this job via FOR UPDATE SKIP LOCKED */
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }).notNull().defaultNow(),
    failureReason: text("failure_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyIdIdx: index("idx_invitation_email_queue_company_id").on(table.companyId),
    batchIdIdx: index("idx_invitation_email_queue_batch_id").on(table.batchId),
    statusNextAttemptIdx: index("idx_invitation_email_queue_status_next_attempt").on(
      table.status,
      table.nextAttemptAt
    ),
    invitationIdIdx: index("idx_invitation_email_queue_invitation_id").on(table.invitationId),
    claimedAtIdx: index("idx_invitation_email_queue_claimed_at").on(table.claimedAt),
  })
);

export type BulkInvitationBatch = typeof bulkInvitationBatchesTable.$inferSelect;
export type NewBulkInvitationBatch = typeof bulkInvitationBatchesTable.$inferInsert;

export type InvitationEmailQueueItem = typeof invitationEmailQueueTable.$inferSelect;
export type NewInvitationEmailQueueItem = typeof invitationEmailQueueTable.$inferInsert;
