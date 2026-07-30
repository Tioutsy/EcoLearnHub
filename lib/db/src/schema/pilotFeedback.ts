import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { companiesTable } from "./companies";

export const pilotFeedbackResponsesTable = pgTable("pilot_feedback_responses", {
  id: serial("id").primaryKey(),
  pilotCompanyId: integer("pilot_company_id"),
  companyId: integer("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
  respondentUserId: text("respondent_user_id").notNull(),
  respondentRole: text("respondent_role").notNull().default("learner"), // learner, manager, buyer
  feedbackStage: text("feedback_stage").notNull().default("midpoint"), // post_onboarding, midpoint, final
  overallRating: integer("overall_rating").notNull().default(5), // 1-5
  easeOfUseRating: integer("ease_of_use_rating").notNull().default(5),
  contentRelevanceRating: integer("content_relevance_rating").notNull().default(5),
  reportingUsefulnessRating: integer("reporting_usefulness_rating"),
  freeTextFeedback: text("free_text_feedback"),
  consentForFollowUp: boolean("consent_for_follow_up").notNull().default(false),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PilotFeedbackResponse = typeof pilotFeedbackResponsesTable.$inferSelect;
