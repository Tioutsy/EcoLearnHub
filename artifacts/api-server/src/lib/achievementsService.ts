import { db } from "@workspace/db";
import {
  badgeDefinitionsTable,
  employeeBadgesTable,
  enrollmentsTable,
  quizAttemptsTable,
  challengeParticipantsTable,
  type Employee,
  type BadgeDefinition,
} from "@workspace/db";
import { eq, and, asc, inArray, sql } from "drizzle-orm";
import { logger } from "./logger";

// Category mappings
export type AchievementCategory = "course" | "challenge" | "milestone" | "certification";
export type AwardSource =
  | "course_completion"
  | "challenge_approval"
  | "learning_milestone"
  | "certification_completion"
  | "historical_backfill";

export interface AchievementProgressItem {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  earned: boolean;
  earnedAt: string | null;
  progressCurrent: number;
  progressTarget: number;
  progressLabel: string | null;
  unlockInstruction: string | null;
  orderIndex: number;
  relatedCourseId: number | null;
}

// 1. Idempotently seed achievements definitions
export async function ensureAchievementDefinitions() {
  logger.info("Synchronizing achievements and milestones definitions...");

  const milestonesAndChallenges = [
    {
      code: "CHALLENGE_APPROVED_1",
      slug: "first-workplace-action",
      name: "First Workplace Action",
      description: "Earned by completing a first approved sustainability action at work.",
      icon: "award",
      criteriaType: "challenge",
      threshold: 1,
      orderIndex: 20,
    },
    {
      code: "CHALLENGE_APPROVED_3",
      slug: "active-contributor",
      name: "Active Contributor",
      description: "Earned by completing three approved workplace sustainability challenges.",
      icon: "zap",
      criteriaType: "challenge",
      threshold: 3,
      orderIndex: 21,
    },
    {
      code: "CHALLENGE_APPROVED_5",
      slug: "sustainability-in-practice",
      name: "Sustainability in Practice",
      description: "Earned by applying sustainability learning through five approved workplace actions.",
      icon: "recycle",
      criteriaType: "challenge",
      threshold: 5,
      orderIndex: 22,
    },
    {
      code: "CHALLENGE_APPROVED_10",
      slug: "challenge-pathway-complete",
      name: "Challenge Pathway Complete",
      description: "Earned by successfully completing the full EcoLearnHub workplace challenge pathway.",
      icon: "target",
      criteriaType: "challenge",
      threshold: 10,
      orderIndex: 23,
    },
    {
      code: "CORE_COURSES_COMPLETE_3",
      slug: "learning-momentum",
      name: "Learning Momentum",
      description: "Earned by successfully completing three courses in the Core Sustainability pathway.",
      icon: "book-open",
      criteriaType: "milestone",
      threshold: 3,
      orderIndex: 30,
    },
    {
      code: "CORE_COURSES_COMPLETE_6",
      slug: "core-progress",
      name: "Core Progress",
      description: "Earned by reaching the halfway point of the Core Sustainability pathway.",
      icon: "bar-chart-3",
      criteriaType: "milestone",
      threshold: 6,
      orderIndex: 31,
    },
    {
      code: "CORE_COURSES_COMPLETE_11",
      slug: "core-curriculum-complete",
      name: "Core Curriculum Complete",
      description: "Earned by completing all learning courses required before the Final Sustainability Certification.",
      icon: "trophy",
      criteriaType: "milestone",
      threshold: 11,
      orderIndex: 32,
    },
  ];

  for (const item of milestonesAndChallenges) {
    try {
      const [existing] = await db
        .select()
        .from(badgeDefinitionsTable)
        .where(eq(badgeDefinitionsTable.code, item.code))
        .limit(1);

      if (existing) {
        // Update to make sure it matches
        await db
          .update(badgeDefinitionsTable)
          .set({
            slug: item.slug,
            name: item.name,
            description: item.description,
            icon: item.icon,
            criteriaType: item.criteriaType,
            threshold: item.threshold,
            orderIndex: item.orderIndex,
          })
          .where(eq(badgeDefinitionsTable.id, existing.id));
      } else {
        await db.insert(badgeDefinitionsTable).values({
          code: item.code,
          slug: item.slug,
          name: item.name,
          description: item.description,
          icon: item.icon,
          criteriaType: item.criteriaType,
          threshold: item.threshold,
          orderIndex: item.orderIndex,
          courseIds: [],
        });
      }
    } catch (err) {
      logger.error({ err, item }, "Failed to seed achievement definition");
    }
  }

  logger.info("Achievements and milestones definitions synced successfully.");
}

// 2. Award badge linked to course completion
export async function awardCourseBadge(
  employee: Employee,
  courseId: number,
  tx: any = db
): Promise<AchievementProgressItem | null> {
  const definitions = await tx
    .select()
    .from(badgeDefinitionsTable)
    .orderBy(asc(badgeDefinitionsTable.orderIndex));

  // Find badge linked to this course
  const badge = definitions.find(
    (d: BadgeDefinition) =>
      d.criteriaType === "all_courses" && d.courseIds.includes(courseId)
  );

  if (!badge) return null;

  const source: AwardSource = courseId === 12 ? "certification_completion" : "course_completion";
  const result = await awardAchievementIdempotently(employee, badge.id, source, tx);
  return result;
}

// 3. Evaluate core course learning milestones (thresholds: 3, 6, 11)
export async function evaluateCourseMilestones(
  employee: Employee,
  tx: any = db
): Promise<AchievementProgressItem[]> {
  const userId = employee.clerkUserId || employee.email;

  // Count distinct completed core courses (IDs 1-11)
  const completedEnrollments = await tx
    .select({ courseId: enrollmentsTable.courseId })
    .from(enrollmentsTable)
    .where(
      and(
        eq(enrollmentsTable.userId, userId),
        eq(enrollmentsTable.status, "completed"),
        sql`${enrollmentsTable.courseId} >= 1`,
        sql`${enrollmentsTable.courseId} <= 11`
      )
    );

  const passedAttempts = await tx
    .select({ courseId: quizAttemptsTable.courseId })
    .from(quizAttemptsTable)
    .where(
      and(
        eq(quizAttemptsTable.userId, userId),
        eq(quizAttemptsTable.passed, true)
      )
    );

  const passedCourseIds = new Set(passedAttempts.map((a: any) => a.courseId));
  const completedCoreIds = new Set(
    completedEnrollments
      .map((c: any) => c.courseId)
      .filter((id: number) => passedCourseIds.has(id))
  );

  const completedCoreCount = completedCoreIds.size;

  const definitions = await tx
    .select()
    .from(badgeDefinitionsTable)
    .where(eq(badgeDefinitionsTable.criteriaType, "milestone"));

  const newlyEarned: AchievementProgressItem[] = [];

  for (const def of definitions) {
    if (completedCoreCount >= def.threshold) {
      const res = await awardAchievementIdempotently(
        employee,
        def.id,
        "learning_milestone",
        tx
      );
      if (res) newlyEarned.push(res);
    }
  }

  return newlyEarned;
}

// 4. Evaluate challenge achievements (thresholds: 1, 3, 5, 10)
export async function evaluateChallengeAchievements(
  employee: Employee,
  tx: any = db
): Promise<AchievementProgressItem[]> {
  const userId = employee.clerkUserId || employee.email;

  // Count distinct approved challenges
  const approvedParticipations = await tx
    .select({ challengeId: challengeParticipantsTable.challengeId })
    .from(challengeParticipantsTable)
    .where(
      and(
        eq(challengeParticipantsTable.userId, userId),
        eq(challengeParticipantsTable.status, "approved")
      )
    );

  const distinctApproved = new Set(approvedParticipations.map((p: any) => p.challengeId));
  const approvedCount = distinctApproved.size;

  const definitions = await tx
    .select()
    .from(badgeDefinitionsTable)
    .where(eq(badgeDefinitionsTable.criteriaType, "challenge"));

  const newlyEarned: AchievementProgressItem[] = [];

  for (const def of definitions) {
    if (approvedCount >= def.threshold) {
      const res = await awardAchievementIdempotently(
        employee,
        def.id,
        "challenge_approval",
        tx
      );
      if (res) newlyEarned.push(res);
    }
  }

  return newlyEarned;
}

// Helper: Award achievement idempotently
export async function awardAchievementIdempotently(
  employee: Employee,
  badgeId: number,
  source: AwardSource,
  tx: any = db
): Promise<AchievementProgressItem | null> {
  try {
    // Check if already earned
    const [existing] = await tx
      .select()
      .from(employeeBadgesTable)
      .where(
        and(
          eq(employeeBadgesTable.employeeId, employee.id),
          eq(employeeBadgesTable.badgeId, badgeId)
        )
      )
      .limit(1);

    if (existing) return null;

    // Award badge
    const [inserted] = await tx
      .insert(employeeBadgesTable)
      .values({
        employeeId: employee.id,
        companyId: employee.companyId,
        badgeId,
        awardSource: source,
        earnedAt: new Date(),
      })
      .returning();

    const [def] = await tx
      .select()
      .from(badgeDefinitionsTable)
      .where(eq(badgeDefinitionsTable.id, badgeId))
      .limit(1);

    const category = getCategory(def);

    return {
      id: def.id,
      code: def.code || def.slug.toUpperCase(),
      name: def.name,
      description: def.description,
      icon: def.icon,
      category,
      earned: true,
      earnedAt: inserted.earnedAt.toISOString(),
      progressCurrent: def.threshold,
      progressTarget: def.threshold,
      progressLabel: "Completed",
      unlockInstruction: null,
      orderIndex: def.orderIndex,
      relatedCourseId: def.courseIds[0] || null,
    };
  } catch (err: any) {
    // Ignore unique constraint conflict
    if (err.code === "23505") {
      return null;
    }
    throw err;
  }
}

// 5. Get complete achievements progress structure
export async function getEmployeeAchievementProgress(
  employee: Employee
): Promise<{
  earnedAchievementCount: number;
  completedCoreCourseCount: number;
  approvedChallengeCount: number;
  courseBadgeCount: number;
  challengeAchievementCount: number;
  milestoneAchievementCount: number;
  certificationEarned: boolean;
  achievements: AchievementProgressItem[];
}> {
  const userId = employee.clerkUserId || employee.email;

  // Load earned awards
  const awards = await db
    .select()
    .from(employeeBadgesTable)
    .where(eq(employeeBadgesTable.employeeId, employee.id));

  const earnedBadgeIds = new Set(awards.map((a) => a.badgeId));
  const earnedAtByBadge = new Map(awards.map((a) => [a.badgeId, a.earnedAt.toISOString()]));

  // Load definitions
  const definitions = await db
    .select()
    .from(badgeDefinitionsTable)
    .orderBy(asc(badgeDefinitionsTable.orderIndex));

  // Count core courses completed
  const completedEnrollments = await db
    .select({ courseId: enrollmentsTable.courseId })
    .from(enrollmentsTable)
    .where(
      and(
        eq(enrollmentsTable.userId, userId),
        eq(enrollmentsTable.status, "completed"),
        sql`${enrollmentsTable.courseId} >= 1`,
        sql`${enrollmentsTable.courseId} <= 11`
      )
    );

  const passedAttempts = await db
    .select({ courseId: quizAttemptsTable.courseId })
    .from(quizAttemptsTable)
    .where(
      and(
        eq(quizAttemptsTable.userId, userId),
        eq(quizAttemptsTable.passed, true)
      )
    );

  const passedCourseIds = new Set(passedAttempts.map((a) => a.courseId));
  const completedCoreIds = new Set(
    completedEnrollments
      .map((c) => c.courseId)
      .filter((id) => passedCourseIds.has(id))
  );

  const completedCoreCount = completedCoreIds.size;

  // Count distinct approved challenges
  const approvedParticipations = await db
    .select({ challengeId: challengeParticipantsTable.challengeId })
    .from(challengeParticipantsTable)
    .where(
      and(
        eq(challengeParticipantsTable.userId, userId),
        eq(challengeParticipantsTable.status, "approved")
      )
    );

  const distinctApproved = new Set(approvedParticipations.map((p) => p.challengeId));
  const approvedChallengeCount = distinctApproved.size;

  // Map progress for each badge definition
  const items: AchievementProgressItem[] = definitions.map((def) => {
    const earned = earnedBadgeIds.has(def.id);
    const earnedAt = earnedAtByBadge.get(def.id) ?? null;
    const category = getCategory(def);

    let progressCurrent = 0;
    let progressTarget = 1;
    let progressLabel = null;
    let unlockInstruction = null;

    if (category === "course" || category === "certification") {
      const targetCourseId = def.courseIds[0] || 0;
      const isComplete = completedCoreIds.has(targetCourseId) || (targetCourseId === 12 && passedCourseIds.has(12));
      progressCurrent = isComplete ? 1 : 0;
      progressTarget = 1;
      progressLabel = isComplete ? "Completed" : "Locked";
      
      if (!isComplete) {
        unlockInstruction = `Complete ${def.name.replace(" Badge", "")} and achieve the required passing score to earn this badge.`;
      }
    } else if (category === "milestone") {
      progressTarget = def.threshold;
      progressCurrent = Math.min(completedCoreCount, def.threshold);
      progressLabel = earned ? "Completed" : `${progressCurrent} of ${progressTarget} courses completed`;
      if (!earned) {
        const diff = def.threshold - progressCurrent;
        unlockInstruction = `Complete ${diff} more core courses successfully.`;
      }
    } else if (category === "challenge") {
      progressTarget = def.threshold;
      progressCurrent = Math.min(approvedChallengeCount, def.threshold);
      progressLabel = earned ? "Completed" : `${progressCurrent} of ${progressTarget} approved challenges`;
      if (!earned) {
        const diff = def.threshold - progressCurrent;
        unlockInstruction = `Complete ${diff} more approved workplace challenges.`;
      }
    }

    return {
      id: def.id,
      code: def.code || def.slug.toUpperCase(),
      name: def.name,
      description: def.description,
      icon: def.icon,
      category,
      earned,
      earnedAt,
      progressCurrent,
      progressTarget,
      progressLabel,
      unlockInstruction,
      orderIndex: def.orderIndex,
      relatedCourseId: def.courseIds[0] || null,
    };
  });

  const courseBadgeCount = items.filter((i) => i.category === "course" && i.earned).length;
  const challengeAchievementCount = items.filter((i) => i.category === "challenge" && i.earned).length;
  const milestoneAchievementCount = items.filter((i) => i.category === "milestone" && i.earned).length;
  const certificationEarned = items.some((i) => i.category === "certification" && i.earned);

  return {
    earnedAchievementCount: awards.length,
    completedCoreCourseCount: completedCoreCount,
    approvedChallengeCount,
    courseBadgeCount,
    challengeAchievementCount,
    milestoneAchievementCount,
    certificationEarned,
    achievements: items,
  };
}

function getCategory(def: BadgeDefinition): AchievementCategory {
  if (def.criteriaType === "milestone") return "milestone";
  if (def.criteriaType === "challenge") return "challenge";
  if (def.criteriaType === "all_courses" && def.courseIds.includes(12)) return "certification";
  return "course";
}
