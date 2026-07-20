import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { coursesTable } from "./courses";
import { companiesTable } from "./companies";

export const challengesTable = pgTable("challenges", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  code: text("code").unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  theme: text("theme").notNull().default("green"),
  focus: text("focus").notNull(),
  unit: text("unit").notNull().default("actions"),
  goalTarget: integer("goal_target").notNull().default(1),
  points: integer("points").notNull().default(0),
  badgeName: text("badge_name"),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  category: text("category").notNull().default(""),
  linkedCourseId: integer("linked_course_id").references(() => coursesTable.id, { onDelete: "set null" }),
  durationLabel: text("duration_label").notNull().default(""),
  instructions: text("instructions").notNull().default(""),
  evidencePrompt: text("evidence_prompt").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const challengeParticipantsTable = pgTable(
  "challenge_participants",
  {
    id: serial("id").primaryKey(),
    challengeId: integer("challenge_id")
      .notNull()
      .references(() => challengesTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    companyId: integer("company_id")
      .notNull()
      .references(() => companiesTable.id, { onDelete: "cascade" }),
    progress: integer("progress").notNull().default(0),
    completed: boolean("completed").notNull().default(false),
    pointsEarned: integer("points_earned").notNull().default(0),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    status: text("status").notNull().default("in_progress"),
    evidenceText: text("evidence_text"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: text("reviewed_by"),
    reviewNote: text("review_note"),
    pointsAwarded: integer("points_awarded").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (t) => ({
    uniqParticipantCompany: unique().on(t.challengeId, t.userId, t.companyId),
  }),
);

export const insertChallengeSchema = createInsertSchema(challengesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challengesTable.$inferSelect;
export type ChallengeParticipant =
  typeof challengeParticipantsTable.$inferSelect;
