import { Router } from "express";
import { db } from "@workspace/db";
import {
  enrollmentsTable,
  lessonProgressTable,
  lessonsTable,
  quizAttemptsTable,
  certificatesTable,
  badgeDefinitionsTable,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

const MODULE_POINTS = 50;
const QUIZ_PASS_POINTS = 100;
const PERFECT_QUIZ_BONUS = 50;

router.get("/points", async (req, res): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId ?? "demo-user";

    const enrollments = await db
      .select({ id: enrollmentsTable.id })
      .from(enrollmentsTable)
      .where(eq(enrollmentsTable.userId, userId));

    let completedModules = 0;
    for (const e of enrollments) {
      const rows = await db
        .select({ lessonId: lessonProgressTable.lessonId })
        .from(lessonProgressTable)
        .where(
          and(
            eq(lessonProgressTable.enrollmentId, e.id),
            eq(lessonProgressTable.completed, 1),
          ),
        );
      // Count distinct lessons so any duplicate progress rows cannot inflate points.
      completedModules += new Set(rows.map((r) => r.lessonId)).size;
    }

    const attempts = await db
      .select({
        courseId: quizAttemptsTable.courseId,
        score: quizAttemptsTable.score,
        passed: quizAttemptsTable.passed,
      })
      .from(quizAttemptsTable)
      .where(eq(quizAttemptsTable.userId, userId));

    const bestByCourse = new Map<number, { score: number; passed: boolean }>();
    for (const a of attempts) {
      const prev = bestByCourse.get(a.courseId);
      if (!prev || a.score > prev.score) {
        bestByCourse.set(a.courseId, { score: a.score, passed: a.passed });
      }
    }

    let quizPoints = 0;
    let bonusPoints = 0;
    for (const best of bestByCourse.values()) {
      if (best.passed) quizPoints += QUIZ_PASS_POINTS;
      if (best.score >= 100) bonusPoints += PERFECT_QUIZ_BONUS;
    }

    const modulePoints = completedModules * MODULE_POINTS;
    res.json({
      modulePoints,
      quizPoints,
      bonusPoints,
      totalPoints: modulePoints + quizPoints + bonusPoints,
    });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to compute points");
    res.status(500).json({ error: "Failed to compute points" });
  }
});

router.get("/courses/:courseId/summary", async (req, res): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
    const courseId = parseInt(raw, 10);
    if (isNaN(courseId)) {
      res.status(400).json({ error: "Invalid courseId" });
      return;
    }

    const userId = (req as any).auth?.userId ?? "demo-user";

    const allLessons = await db
      .select({ id: lessonsTable.id })
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, courseId));
    const totalModules = allLessons.length;

    const [enrollment] = await db
      .select()
      .from(enrollmentsTable)
      .where(
        and(
          eq(enrollmentsTable.userId, userId),
          eq(enrollmentsTable.courseId, courseId),
        ),
      )
      .orderBy(desc(enrollmentsTable.id))
      .limit(1);

    let modulesCompleted = 0;
    let completionPct = 0;
    if (enrollment) {
      const completedRows = await db
        .select({ lessonId: lessonProgressTable.lessonId })
        .from(lessonProgressTable)
        .where(
          and(
            eq(lessonProgressTable.enrollmentId, enrollment.id),
            eq(lessonProgressTable.completed, 1),
          ),
        );
      // Distinct + clamped so duplicate/stray progress rows cannot exceed the module total.
      modulesCompleted = Math.min(new Set(completedRows.map((r) => r.lessonId)).size, totalModules);
      completionPct = enrollment.progressPct ?? 0;
    }

    const attempts = await db
      .select({
        score: quizAttemptsTable.score,
        passed: quizAttemptsTable.passed,
      })
      .from(quizAttemptsTable)
      .where(
        and(
          eq(quizAttemptsTable.userId, userId),
          eq(quizAttemptsTable.courseId, courseId),
        ),
      );

    let bestScore: number | null = null;
    let quizPassed = false;
    for (const a of attempts) {
      if (bestScore === null || a.score > bestScore) bestScore = a.score;
      if (a.passed) quizPassed = true;
    }

    const [certificate] = await db
      .select({ id: certificatesTable.id })
      .from(certificatesTable)
      .where(
        and(
          eq(certificatesTable.userId, userId),
          eq(certificatesTable.courseId, courseId),
        ),
      )
      .orderBy(desc(certificatesTable.id))
      .limit(1);

    const courseCompleted = enrollment?.status === "completed";

    const courseBadges = await db
      .select()
      .from(badgeDefinitionsTable)
      .where(eq(badgeDefinitionsTable.criteriaType, "all_courses"));
    // Pick the badge tied to THIS course, not just the first all_courses badge.
    const badge = courseBadges.find((b) => b.courseIds.includes(courseId));
    let badgeName: string | null = null;
    let badgeEarned = false;
    if (badge) {
      badgeName = badge.name;
      badgeEarned = courseCompleted;
    }

    const modulePoints = modulesCompleted * MODULE_POINTS;
    const quizPoints = quizPassed ? QUIZ_PASS_POINTS : 0;
    const bonusPoints = bestScore !== null && bestScore >= 100 ? PERFECT_QUIZ_BONUS : 0;

    res.json({
      courseId,
      modulesCompleted,
      totalModules,
      completionPct,
      bestScore,
      quizPassed,
      certificateId: certificate?.id ?? null,
      badgeName,
      badgeEarned,
      points: {
        modulePoints,
        quizPoints,
        bonusPoints,
        totalPoints: modulePoints + quizPoints + bonusPoints,
      },
    });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to compute course summary");
    res.status(500).json({ error: "Failed to compute course summary" });
  }
});

export default router;
