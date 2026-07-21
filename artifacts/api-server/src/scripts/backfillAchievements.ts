import { db, employeesTable, enrollmentsTable, quizAttemptsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import {
  awardCourseBadge,
  evaluateCourseMilestones,
  evaluateChallengeAchievements,
  ensureAchievementDefinitions,
} from "../lib/achievementsService";
import { logger } from "../lib/logger";

async function runBackfill() {
  console.log("Starting Sprint 6D Historical Achievements Backfill...");
  
  // 1. Synchronize badge definitions first
  await ensureAchievementDefinitions();

  // 2. Fetch all employees
  const employees = await db.select().from(employeesTable);
  console.log(`Discovered ${employees.length} employees to evaluate.`);

  let employeesEvaluated = 0;
  let courseBadgesAdded = 0;
  let challengeAchievementsAdded = 0;
  let milestoneAchievementsAdded = 0;
  let duplicateAwardsSkipped = 0;
  let inconsistentRecordsFound = 0;

  for (const emp of employees) {
    try {
      employeesEvaluated++;
      console.log(`Evaluating Employee: ${emp.name} (${emp.email})...`);

      // Retrieve all completed courses for course badges
      // In progress/completed courses are derived from enrollments where status is completed
      // We will simulate award logic using the 'historical_backfill' source
      const coreCoursesCount = emp.completedCourses;
      
      // Query completed courses directly using Drizzle
      const completedEnrollments = await db
        .select({ courseId: enrollmentsTable.courseId })
        .from(enrollmentsTable)
        .innerJoin(
          quizAttemptsTable,
          and(
            eq(enrollmentsTable.userId, quizAttemptsTable.userId),
            eq(enrollmentsTable.courseId, quizAttemptsTable.courseId)
          )
        )
        .where(
          and(
            eq(enrollmentsTable.userId, emp.clerkUserId || emp.email),
            eq(enrollmentsTable.status, "completed"),
            eq(quizAttemptsTable.passed, true)
          )
        );
      
      const courseIds = completedEnrollments.map((r) => r.courseId);

      for (const courseId of courseIds) {
        const badgeAward = await awardCourseBadge(emp, courseId);
        if (badgeAward) {
          courseBadgesAdded++;
          console.log(`  -> Awarded Course Badge: ${badgeAward.name}`);
        } else {
          duplicateAwardsSkipped++;
        }
      }

      // Evaluate core milestones (3, 6, 11)
      const milestones = await evaluateCourseMilestones(emp);
      for (const m of milestones) {
        milestoneAchievementsAdded++;
        console.log(`  -> Awarded Learning Milestone: ${m.name}`);
      }

      // Evaluate challenge milestones (1, 3, 5, 10)
      const challenges = await evaluateChallengeAchievements(emp);
      for (const c of challenges) {
        challengeAchievementsAdded++;
        console.log(`  -> Awarded Challenge Achievement: ${c.name}`);
      }

    } catch (err) {
      inconsistentRecordsFound++;
      logger.error({ err, employeeId: emp.id }, "Failed to evaluate employee during historical backfill");
    }
  }

  console.log("\n==========================================");
  console.log("Historical Backfill Complete!");
  console.log(`* Employees Evaluated: ${employeesEvaluated}`);
  console.log(`* Course Badges Added: ${courseBadgesAdded}`);
  console.log(`* Challenge Achievements Added: ${challengeAchievementsAdded}`);
  console.log(`* Milestone Achievements Added: ${milestoneAchievementsAdded}`);
  console.log(`* Duplicate Awards Skipped: ${duplicateAwardsSkipped}`);
  console.log(`* Inconsistent Records Found: ${inconsistentRecordsFound}`);
  console.log("==========================================\n");

  process.exit(0);
}

runBackfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
