import { Router } from "express";
import { db } from "@workspace/db";
import { quizQuestionsTable, quizAttemptsTable, certificatesTable, coursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SubmitQuizBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();

router.get("/:courseId/quiz", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
  const courseId = parseInt(raw, 10);
  if (isNaN(courseId)) {
    res.status(400).json({ error: "Invalid courseId" });
    return;
  }

  const questions = await db
    .select({
      id: quizQuestionsTable.id,
      question: quizQuestionsTable.question,
      options: quizQuestionsTable.options,
    })
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.courseId, courseId))
    .orderBy(quizQuestionsTable.orderIndex);

  res.json({ courseId, questions });
});

router.post("/:courseId/quiz/submit", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
  const courseId = parseInt(raw, 10);
  if (isNaN(courseId)) {
    res.status(400).json({ error: "Invalid courseId" });
    return;
  }

  const parsed = SubmitQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = (req as any).auth?.userId ?? "demo-user";
  const questions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, courseId));

  let correctAnswers = 0;
  for (const answer of parsed.data.answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (question && question.correctOption === answer.selectedOption) {
      correctAnswers++;
    }
  }

  const [course] = await db
    .select({ passingScore: coursesTable.passingScore })
    .from(coursesTable)
    .where(eq(coursesTable.id, courseId));
  const passingScore = course?.passingScore ?? 70;

  const totalQuestions = questions.length;
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const passed = score >= passingScore;

  await db.insert(quizAttemptsTable).values({
    userId,
    courseId,
    score,
    totalQuestions,
    correctAnswers,
    passed,
  });

  let certificateId: number | null = null;
  if (passed) {
    const code = `ECO-${randomUUID().slice(0, 8).toUpperCase()}`;
    const [cert] = await db
      .insert(certificatesTable)
      .values({ userId, courseId, uniqueCode: code })
      .returning();
    certificateId = cert.id;
  }

  res.json({ score, passed, totalQuestions, correctAnswers, certificateId });
});

export default router;
