import { db, challengeParticipantsTable, coursesTable, quizAttemptsTable } from "@workspace/db";
import { and, eq, desc } from "drizzle-orm";

export interface SustainabilityScoreCard {
  certificationExamScore: number | null;
  certificationPassed: boolean;
  approvedChallengeCount: number;
  challengePoints: number;
  challengeBonus: number;
  finalSustainabilityScore: number | null;
}

export async function calculateSustainabilityScore(userId: string): Promise<SustainabilityScoreCard> {
  // 1. Get approved challenges count
  const approvedSubmissions = await db
    .select()
    .from(challengeParticipantsTable)
    .where(
      and(
        eq(challengeParticipantsTable.userId, userId),
        eq(challengeParticipantsTable.status, "approved")
      )
    );

  const approvedChallengeCount = approvedSubmissions.length;
  const challengePoints = approvedChallengeCount * 10;
  const challengeBonus = Math.min(approvedChallengeCount, 10);

  // 2. Find Course 12 ID and pass threshold
  const [course12] = await db
    .select({
      id: coursesTable.id,
      passingScore: coursesTable.passingScore,
    })
    .from(coursesTable)
    .where(eq(coursesTable.slug, "final-sustainability-certification"))
    .limit(1);

  const course12Id = course12?.id ?? 12;

  // 3. Find highest passed attempt on Course 12
  const [bestAttempt] = await db
    .select({ score: quizAttemptsTable.score })
    .from(quizAttemptsTable)
    .where(
      and(
        eq(quizAttemptsTable.userId, userId),
        eq(quizAttemptsTable.courseId, course12Id),
        eq(quizAttemptsTable.passed, true)
      )
    )
    .orderBy(desc(quizAttemptsTable.score))
    .limit(1);

  const certificationPassed = !!bestAttempt;
  const certificationExamScore = bestAttempt ? bestAttempt.score : null;
  const finalSustainabilityScore = certificationPassed
    ? Math.min(100, (certificationExamScore || 0) + challengeBonus)
    : null;

  return {
    certificationExamScore,
    certificationPassed,
    approvedChallengeCount,
    challengePoints,
    challengeBonus,
    finalSustainabilityScore,
  };
}
