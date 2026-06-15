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

export const challengesTable = pgTable("challenges", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
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
});

export const challengeParticipantsTable = pgTable(
  "challenge_participants",
  {
    id: serial("id").primaryKey(),
    challengeId: integer("challenge_id")
      .notNull()
      .references(() => challengesTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    progress: integer("progress").notNull().default(0),
    completed: boolean("completed").notNull().default(false),
    pointsEarned: integer("points_earned").notNull().default(0),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => ({
    uniqParticipant: unique().on(t.challengeId, t.userId),
  }),
);

export const insertChallengeSchema = createInsertSchema(challengesTable).omit({
  id: true,
});
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challengesTable.$inferSelect;
export type ChallengeParticipant =
  typeof challengeParticipantsTable.$inferSelect;
