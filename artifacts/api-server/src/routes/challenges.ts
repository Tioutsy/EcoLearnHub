import { Router } from "express";
import { db } from "@workspace/db";
import { challengesTable, challengeParticipantsTable, employeesTable, coursesTable } from "@workspace/db";
import { eq, and, asc, or, desc } from "drizzle-orm";
import { getCompanyAccess, requireCompanyAdmin, sendHttpError } from "../lib/access";
import { calculateSustainabilityScore } from "../lib/scoring";
import { logger } from "../lib/logger";

const router = Router();

function parseId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const id = parseInt(raw, 10);
  return Number.isNaN(id) ? null : id;
}

// Helper to determine status based on date range
type ChallengeDateStatus = "upcoming" | "active" | "ended";
function dateStatusFor(start: Date, end: Date, now: Date): ChallengeDateStatus {
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "active";
}

// 1. GET /score (User detailed score card)
router.get("/score", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const scoreCard = await calculateSustainabilityScore(access.userId);
    res.json(scoreCard);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      logger.error({ err }, "Failed to get user score card");
      res.status(500).json({ error: "Failed to load score card" });
    }
  }
});

// 2. GET /submissions/pending (Manager review queue)
router.get("/submissions/pending", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);

    const whereClauses = [eq(challengeParticipantsTable.status, "submitted")];
    if (access.role !== "platform_admin") {
      whereClauses.push(eq(challengeParticipantsTable.companyId, access.companyId));
    }

    const pending = await db
      .select({
        submissionId: challengeParticipantsTable.id,
        challengeId: challengeParticipantsTable.challengeId,
        challengeTitle: challengesTable.title,
        challengeCode: challengesTable.code,
        userId: challengeParticipantsTable.userId,
        employeeName: employeesTable.name,
        employeeDepartment: employeesTable.department,
        evidenceText: challengeParticipantsTable.evidenceText,
        submittedAt: challengeParticipantsTable.submittedAt,
        status: challengeParticipantsTable.status,
      })
      .from(challengeParticipantsTable)
      .innerJoin(challengesTable, eq(challengeParticipantsTable.challengeId, challengesTable.id))
      .innerJoin(employeesTable, eq(challengeParticipantsTable.userId, employeesTable.clerkUserId))
      .where(and(...whereClauses))
      .orderBy(desc(challengeParticipantsTable.submittedAt));

    res.json(pending);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      logger.error({ err }, "Failed to get pending challenge submissions");
      res.status(500).json({ error: "Failed to load pending submissions" });
    }
  }
});

// 3. POST /submissions/:submissionId/review (Approve or Reject a submission)
router.post("/submissions/:submissionId/review", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const submissionId = parseId(req.params.submissionId);
    if (submissionId === null) {
      res.status(400).json({ error: "Invalid submission id" });
      return;
    }

    const { action, reviewNote } = req.body;
    if (action !== "approve" && action !== "reject") {
      res.status(400).json({ error: "Action must be approve or reject" });
      return;
    }

    if (action === "reject" && (!reviewNote || !reviewNote.trim())) {
      res.status(400).json({ error: "Reviewer note is required for rejection" });
      return;
    }

    // Execute in a transaction
    const outcome = await db.transaction(async (tx) => {
      // Find the submission. Enforce company boundaries if not platform admin.
      const clauses = [eq(challengeParticipantsTable.id, submissionId)];
      if (access.role !== "platform_admin") {
        clauses.push(eq(challengeParticipantsTable.companyId, access.companyId));
      }

      const [submission] = await tx
        .select()
        .from(challengeParticipantsTable)
        .where(and(...clauses))
        .for("update");

      if (!submission) {
        return { kind: "not_found" as const };
      }

      // If already processed, return existing result (idempotency check)
      if (submission.status !== "submitted") {
        return { kind: "already_processed" as const, row: submission };
      }

      const newStatus = action === "approve" ? "approved" : "rejected";
      const points = action === "approve" ? 10 : 0;

      const [updated] = await tx
        .update(challengeParticipantsTable)
        .set({
          status: newStatus,
          pointsAwarded: points,
          pointsEarned: points, // Keep synchronized with legacy column
          completed: action === "approve", // Sync legacy completed flag
          completedAt: action === "approve" ? new Date() : null,
          reviewedBy: access.userId,
          reviewedAt: new Date(),
          reviewNote: reviewNote || null,
          updatedAt: new Date(),
        })
        .where(eq(challengeParticipantsTable.id, submissionId))
        .returning();

      return { kind: "success" as const, row: updated };
    });

    if (outcome.kind === "not_found") {
      res.status(404).json({ error: "Submission not found or unauthorized" });
      return;
    }

    if (outcome.kind === "already_processed") {
      res.json({ message: "Submission already reviewed", row: outcome.row });
      return;
    }

    // Audit log
    logger.info({
      actor: access.userId,
      employee: outcome.row.userId,
      company: outcome.row.companyId,
      challenge: outcome.row.challengeId,
      previousStatus: "submitted",
      newStatus: outcome.row.status,
      points: outcome.row.pointsAwarded,
    }, `Challenge ${outcome.row.status === "approved" ? "approved" : "rejected"}`);

    res.json(outcome.row);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      logger.error({ err }, "Failed to review challenge submission");
      res.status(500).json({ error: "Failed to submit challenge review" });
    }
  }
});

// 4. GET / (List challenges with user state)
router.get("/", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const now = new Date();

    const challenges = await db
      .select()
      .from(challengesTable)
      .where(eq(challengesTable.isActive, true))
      .orderBy(asc(challengesTable.orderIndex));

    const participations = await db
      .select()
      .from(challengeParticipantsTable)
      .where(
        and(
          eq(challengeParticipantsTable.userId, access.userId),
          eq(challengeParticipantsTable.companyId, access.companyId)
        )
      );

    const byChallenge = new Map(participations.map((p) => [p.challengeId, p]));

    const items = challenges.map((c) => {
      const p = byChallenge.get(c.id);
      const dateStatus = dateStatusFor(c.startDate, c.endDate, now);

      return {
        id: c.id,
        code: c.code,
        slug: c.slug,
        title: c.title,
        summary: c.summary,
        description: c.description,
        icon: c.icon,
        theme: c.theme,
        focus: c.focus,
        unit: c.unit,
        goalTarget: c.goalTarget,
        points: c.points,
        badgeName: c.badgeName,
        startDate: c.startDate.toISOString(),
        endDate: c.endDate.toISOString(),
        category: c.category,
        linkedCourseId: c.linkedCourseId,
        durationLabel: c.durationLabel,
        instructions: c.instructions,
        evidencePrompt: c.evidencePrompt,
        status: dateStatus, // standard UI date-status
        joined: p != null,
        participationStatus: p?.status ?? null,
        evidenceText: p?.evidenceText ?? null,
        reviewNote: p?.reviewNote ?? null,
        progress: p?.progress ?? 0,
        completed: p?.status === "approved",
        pointsEarned: p?.pointsAwarded ?? 0,
        submittedAt: p?.submittedAt ? p.submittedAt.toISOString() : null,
        progressPct:
          c.goalTarget > 0
            ? Math.min(100, Math.round(((p?.progress ?? 0) / c.goalTarget) * 100))
            : 0,
      };
    });

    // Score calculations
    const scoreCard = await calculateSustainabilityScore(access.userId);

    res.json({
      totalPoints: scoreCard.challengePoints,
      completedCount: scoreCard.approvedChallengeCount,
      challenges: items,
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      logger.error({ err }, "Failed to list challenges");
      res.status(500).json({ error: "Failed to load challenges" });
    }
  }
});

// 5. POST /:challengeId/join (Join an active challenge)
router.post("/:challengeId/join", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const challengeId = parseId(req.params.challengeId);
    if (challengeId === null) {
      res.status(400).json({ error: "Invalid challenge id" });
      return;
    }

    const [challenge] = await db
      .select()
      .from(challengesTable)
      .where(and(eq(challengesTable.id, challengeId), eq(challengesTable.isActive, true)))
      .limit(1);

    if (!challenge) {
      res.status(404).json({ error: "Active challenge not found" });
      return;
    }

    const now = new Date();
    if (dateStatusFor(challenge.startDate, challenge.endDate, now) === "ended") {
      res.status(400).json({ error: "This challenge has already ended" });
      return;
    }

    // Race-safe insert or find existing
    const inserted = await db
      .insert(challengeParticipantsTable)
      .values({
        challengeId,
        userId: access.userId,
        companyId: access.companyId,
        status: "in_progress",
        progress: challenge.goalTarget, // Set progress to completion goal immediately
      })
      .onConflictDoNothing()
      .returning();

    let record = inserted[0] ?? null;

    if (!record) {
      const [existing] = await db
        .select()
        .from(challengeParticipantsTable)
        .where(
          and(
            eq(challengeParticipantsTable.challengeId, challengeId),
            eq(challengeParticipantsTable.userId, access.userId),
            eq(challengeParticipantsTable.companyId, access.companyId)
          )
        )
        .limit(1);
      record = existing;
    }

    // Audit log
    logger.info({
      actor: access.userId,
      employee: access.userId,
      company: access.companyId,
      challenge: challengeId,
      previousStatus: null,
      newStatus: "in_progress",
    }, "Challenge joined");

    res.json(record);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      logger.error({ err }, "Failed to join challenge");
      res.status(500).json({ error: "Failed to join challenge" });
    }
  }
});

// 6. POST /:challengeId/submit (Submit challenge evidence/reflection)
router.post("/:challengeId/submit", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const challengeId = parseId(req.params.challengeId);
    if (challengeId === null) {
      res.status(400).json({ error: "Invalid challenge id" });
      return;
    }

    const { evidenceText } = req.body;
    if (!evidenceText || typeof evidenceText !== "string" || evidenceText.trim().length < 10) {
      res.status(400).json({ error: "Evidence reflection must be at least 10 characters long" });
      return;
    }

    if (evidenceText.trim().length > 1000) {
      res.status(400).json({ error: "Evidence reflection must not exceed 1000 characters" });
      return;
    }

    // Execute in a transaction to safely handle read-modify-write
    const outcome = await db.transaction(async (tx) => {
      const [participant] = await tx
        .select()
        .from(challengeParticipantsTable)
        .where(
          and(
            eq(challengeParticipantsTable.challengeId, challengeId),
            eq(challengeParticipantsTable.userId, access.userId),
            eq(challengeParticipantsTable.companyId, access.companyId)
          )
        )
        .for("update");

      if (!participant) {
        return { kind: "not_found" as const };
      }

      if (participant.status === "approved") {
        return { kind: "approved" as const };
      }

      const isResubmission = participant.status === "rejected";

      const [updated] = await tx
        .update(challengeParticipantsTable)
        .set({
          status: "submitted",
          evidenceText: evidenceText.trim(),
          submittedAt: new Date(),
          // Clear review state on resubmission/submission
          reviewedBy: null,
          reviewedAt: null,
          reviewNote: null,
          updatedAt: new Date(),
        })
        .where(eq(challengeParticipantsTable.id, participant.id))
        .returning();

      return { kind: "success" as const, row: updated, isResubmission };
    });

    if (outcome.kind === "not_found") {
      res.status(404).json({ error: "Participation record not found. Please join the challenge first." });
      return;
    }

    if (outcome.kind === "approved") {
      res.status(400).json({ error: "An approved challenge is read-only and cannot be updated." });
      return;
    }

    // Audit log
    logger.info({
      actor: access.userId,
      employee: access.userId,
      company: access.companyId,
      challenge: challengeId,
      previousStatus: outcome.isResubmission ? "rejected" : "in_progress",
      newStatus: "submitted",
    }, outcome.isResubmission ? "Challenge resubmitted" : "Challenge submitted");

    res.json(outcome.row);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      logger.error({ err }, "Failed to submit challenge reflection");
      res.status(500).json({ error: "Failed to submit reflection" });
    }
  }
});

export default router;
