import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { companiesTable } from "./companies";

export const pilotCompaniesTable = pgTable("pilot_companies", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
  pilotStatus: text("pilot_status").notNull().default("candidate"), // candidate, approved, active, completed, declined
  pilotStage: text("pilot_stage").notNull().default("initial_contact"), // initial_contact, configuration, active_learning, final_review
  candidateStatus: text("candidate_status").notNull().default("PROSPECT"), // PROSPECT, CONTACTED, DISCOVERY_SCHEDULED, INTEREST_CONFIRMED, TERMS_SENT, TERMS_ACCEPTED, ACTIVATION_READY, ACTIVE, COMPLETED, CONVERTED, DECLINED, WITHDRAWN, ON_HOLD
  qualificationStatus: text("qualification_status").notNull().default("UNREVIEWED"), // UNREVIEWED, QUALIFICATION_IN_PROGRESS, QUALIFIED, CONDITIONALLY_QUALIFIED, NOT_QUALIFIED, DUPLICATE, DEFERRED
  qualificationScore: integer("qualification_score").notNull().default(0),
  proposalVersion: integer("proposal_version").notNull().default(1),
  proposalStatus: text("proposal_status").notNull().default("DRAFT"), // DRAFT, INTERNAL_REVIEW, APPROVED_FOR_ISSUE, ISSUED, ACCEPTED, DECLINED, EXPIRED
  proposalIssuedAt: timestamp("proposal_issued_at", { withTimezone: true }),
  proposalAcceptedAt: timestamp("proposal_accepted_at", { withTimezone: true }),
  handoverStatus: text("handover_status").notNull().default("PENDING"), // PENDING, GENERATED, HANDED_OVER
  outreachStatus: text("outreach_status").notNull().default("NOT_STARTED"), // NOT_STARTED, PREPARED, SENT, REPLIED, DISCOVERY_SCHEDULED, PROPOSAL_ISSUED, ACCEPTED, DECLINED
  legitimacyVerified: boolean("legitimacy_verified").notNull().default(false),
  discoveryCompleted: boolean("discovery_completed").notNull().default(false),
  candidateDesignation: text("candidate_designation").notNull().default("PRIMARY"), // PRIMARY, BACKUP
  decisionStatus: text("decision_status").notNull().default("PROPOSAL_UNDER_REVIEW"), // PROPOSAL_UNDER_REVIEW, FOLLOW_UP_DUE, CLARIFICATION_REQUESTED, REVISION_REQUESTED, ACCEPTANCE_PENDING_EVIDENCE, PARTICIPATION_CONFIRMED, DECLINED, WITHDRAWN
  decisionLifecycleStatus: text("decision_lifecycle_status").notNull().default("PROPOSAL_UNDER_REVIEW"), // PROPOSAL_NOT_ISSUED, PROPOSAL_ISSUED, PROPOSAL_DELIVERED, PROPOSAL_UNDER_REVIEW, FOLLOW_UP_DUE, FOLLOW_UP_SENT, RESPONSE_RECEIVED, REVISION_REQUESTED, DECISION_DEFERRED, PARTICIPATION_CONFIRMED, DECLINED, NO_RESPONSE, CLOSED
  legitimacyEvaluated: boolean("legitimacy_evaluated").notNull().default(false),
  decisionDeadline: timestamp("decision_deadline", { withTimezone: true }),
  declineReason: text("decline_reason"),
  authorityVerified: boolean("authority_verified").notNull().default(false),
  readiness18GateStatus: text("readiness_18_gate_status").notNull().default("NOT_READY_PARTICIPATION_UNCONFIRMED"),
  activationLifecycleStatus: text("activation_lifecycle_status").notNull().default("DECISION_PENDING"), // DECISION_PENDING, ACCEPTANCE_RECEIVED, ACCEPTANCE_UNDER_REVIEW, EVIDENCE_INCOMPLETE, ACTIVATION_READY, ACTIVATION_APPROVED, ACTIVATING, ACTIVE, ACTIVATION_FAILED, SUSPENDED, CANCELLED
  acceptanceValidated: boolean("acceptance_validated").notNull().default(false),
  activationBlockedReason: text("activation_blocked_reason").default("Written participation confirmation pending"),
  activationRunId: text("activation_run_id"),
  evidenceStatus: text("evidence_status").notNull().default("NO_EVIDENCE"), // NO_EVIDENCE, EVIDENCE_SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED, EXPIRED, WITHDRAWN
  evidenceDetails: text("evidence_details"), // Evidence document reference or summary
  confirmedBy: text("confirmed_by"), // Authorised representative name / role
  participationConfirmedAt: timestamp("participation_confirmed_at", { withTimezone: true }),
  readinessGateStatus: text("readiness_gate_status").notNull().default("NOT_READY_NO_EXTERNAL_COMPANY"),
  isTestRecord: boolean("is_test_record").notNull().default(false),
  recordEnvironment: text("record_environment").notNull().default("test"), // test, demo, external_pilot, commercial
  externalValidationStage: text("external_validation_stage").notNull().default("stage_0_internal_technical_validation"), // stage_0 .. stage_8
  approvedByUserId: text("approved_by_user_id"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  plannedStartDate: timestamp("planned_start_date", { withTimezone: true }),
  actualStartDate: timestamp("actual_start_date", { withTimezone: true }),
  plannedEndDate: timestamp("planned_end_date", { withTimezone: true }),
  actualEndDate: timestamp("actual_end_date", { withTimezone: true }),
  targetLearnerCount: integer("target_learner_count").notNull().default(20),
  approvedLearnerLimit: integer("approved_learner_limit").notNull().default(50),
  selectedCourseIds: integer("selected_course_ids").array().notNull().default([]),
  primaryContactName: text("primary_contact_name"),
  primaryContactEmail: text("primary_contact_email"),
  internalOwnerUserId: text("internal_owner_user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PilotCompany = typeof pilotCompaniesTable.$inferSelect;
