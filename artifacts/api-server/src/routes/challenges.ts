import { Router } from "express";
import { db } from "@workspace/db";
import { challengesTable, challengeParticipantsTable } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";

const router = Router();

type ChallengeStatus = "upcoming" | "active" | "ended";

function statusFor(start: Date, end: Date, now: Date): ChallengeStatus {
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "active";
}

function parseId(raw: string | string[]): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!/^\d+$/.test(value)) return null;
  const id = parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
}

router.get("/", async (req, res): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId ?? "demo-user";
    const now = new Date();

    const challenges = await db
      .select()
      .from(challengesTable)
      .orderBy(asc(challengesTable.orderIndex));

    const participations = await db
      .select()
      .from(challengeParticipantsTable)
      .where(eq(challengeParticipantsTable.userId, userId));

    const byChallenge = new Map(participations.map((p) => [p.challengeId, p]));

    let totalPoints = 0;
    let completedCount = 0;

    const items = challenges.map((c) => {
      const p = byChallenge.get(c.id);
      const status = statusFor(c.startDate, c.endDate, now);
      const progress = p?.progress ?? 0;
      const completed = p?.completed ?? false;
      const pointsEarned = p?.pointsEarned ?? 0;
      totalPoints += pointsEarned;
      if (completed) completedCount += 1;

      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
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
        status,
        joined: p != null,
        progress,
        completed,
        pointsEarned,
        progressPct:
          c.goalTarget > 0
            ? Math.min(100, Math.round((progress / c.goalTarget) * 100))
            : 0,
      };
    });

    res.json({
      totalPoints,
      completedCount,
      challenges: items,
    });
  } catch (err) {
    (req as any).log?.error?.({ err }, "Failed to list challenges");
    res.status(500).json({ error: "Failed to load challenges" });
  }
});

router.post("/:id/join", async (req, res): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId ?? "demo-user";
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid challenge id" });
      return;
    }

    const [challenge] = await db
      .select()
      .from(challengesTable)
      .where(eq(challengesTable.id, id));
    if (!challenge) {
      res.status(404).json({ error: "Challenge not found" });
      return;
    }

    const now = new Date();
    if (statusFor(challenge.startDate, challenge.endDate, now) === "ended") {
      res.status(400).json({ error: "This challenge has already ended" });
      return;
    }

    // Race-safe join: insert-or-ignore, then return whichever row exists.
    const inserted = await db
      .insert(challengeParticipantsTable)
      .values({ challengeId: id, userId })
      .onConflictDoNothing()
      .returning();

    if (inserted.length > 0) {
      res.status(201).json(inserted[0]);
      return;
    }

    const [existing] = await db
      .select()
      .from(challengeParticipantsTable)
      .where(
        and(
          eq(challengeParticipantsTable.challengeId, id),
          eq(challengeParticipantsTable.userId, userId),
        ),
      );
    res.json(existing);
  } catch (err) {
    (req as any).log?.error?.({ err }, "Failed to join challenge");
    res.status(500).json({ error: "Failed to join challenge" });
  }
});

router.post("/:id/progress", async (req, res): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId ?? "demo-user";
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid challenge id" });
      return;
    }

    const rawAmount = (req.body ?? {}).amount;
    const amount =
      rawAmount === undefined ? 1 : Number.parseInt(String(rawAmount), 10);
    if (!Number.isFinite(amount) || amount < 1) {
      res.status(400).json({ error: "amount must be a positive integer" });
      return;
    }

    const [challenge] = await db
      .select()
      .from(challengesTable)
      .where(eq(challengesTable.id, id));
    if (!challenge) {
      res.status(404).json({ error: "Challenge not found" });
      return;
    }

    const now = new Date();
    if (statusFor(challenge.startDate, challenge.endDate, now) !== "active") {
      res
        .status(400)
        .json({ error: "Progress can only be logged while a challenge is active" });
      return;
    }

    // Atomic read-modify-write: lock the participant row so concurrent
    // progress submissions cannot drop increments.
    const outcome = await db.transaction(async (tx) => {
      const [participant] = await tx
        .select()
        .from(challengeParticipantsTable)
        .where(
          and(
            eq(challengeParticipantsTable.challengeId, id),
            eq(challengeParticipantsTable.userId, userId),
          ),
        )
        .for("update");

      if (!participant) return { kind: "not_joined" as const };
      if (participant.completed) return { kind: "ok" as const, row: participant };

      const newProgress = Math.min(
        participant.progress + amount,
        challenge.goalTarget,
      );
      const nowCompleted = newProgress >= challenge.goalTarget;

      const [updated] = await tx
        .update(challengeParticipantsTable)
        .set({
          progress: newProgress,
          completed: nowCompleted,
          pointsEarned: nowCompleted
            ? challenge.points
            : participant.pointsEarned,
          completedAt: nowCompleted ? now : participant.completedAt,
        })
        .where(eq(challengeParticipantsTable.id, participant.id))
        .returning();

      return { kind: "ok" as const, row: updated };
    });

    if (outcome.kind === "not_joined") {
      res
        .status(400)
        .json({ error: "Join the challenge before logging progress" });
      return;
    }

    res.json(outcome.row);
  } catch (err) {
    (req as any).log?.error?.({ err }, "Failed to update challenge progress");
    res.status(500).json({ error: "Failed to update challenge progress" });
  }
});

export default router;
