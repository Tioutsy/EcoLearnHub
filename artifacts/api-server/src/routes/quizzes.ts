import { Router } from "express";
import { db } from "@workspace/db";
import {
  quizQuestionsTable,
  quizAttemptsTable,
  certificatesTable,
  coursesTable,
  enrollmentsTable,
  employeesTable,
  companiesTable,
  courseAssignmentsTable,
} from "@workspace/db";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { SubmitQuizBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";
import { getCompanyAccess, sendHttpError } from "../lib/access";
import { syncEmployeeLearningStats } from "../lib/lmsData";

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
  try {
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

    const access = await getCompanyAccess(req);
    const enrollmentClauses = [eq(enrollmentsTable.userId, access.userId)];
    if (access.employee) {
      enrollmentClauses.push(eq(enrollmentsTable.employeeId, access.employee.id));
      enrollmentClauses.push(inArray(enrollmentsTable.userId, [access.employee.email]));
    } else if (access.email) {
      enrollmentClauses.push(eq(enrollmentsTable.userId, access.email));
    }

    const [enrollment] = await db
      .select()
      .from(enrollmentsTable)
      .where(and(eq(enrollmentsTable.courseId, courseId), or(...enrollmentClauses)))
      .orderBy(desc(enrollmentsTable.id))
      .limit(1);

    if (!enrollment) {
      res.status(403).json({ error: "This course has not been assigned to you" });
      return;
    }

    const questions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, courseId));

    let correctAnswers = 0;
    for (const answer of parsed.data.answers) {
      const question = questions.find((q) => q.id === answer.questionId);
      if (question && question.correctOption === answer.selectedOption) {
        correctAnswers++;
      }
    }

    const [course] = await db
      .select({
        passingScore: coursesTable.passingScore,
        title: coursesTable.title,
        version: coursesTable.version,
      })
      .from(coursesTable)
      .where(eq(coursesTable.id, courseId));
    const passingScore = course?.passingScore ?? 70;
    const courseVersion = course?.version ?? 1;

    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = score >= passingScore;

    const userId = access.userId;
    await db.insert(quizAttemptsTable).values({
      userId,
      courseId,
      courseVersion,
      score,
      totalQuestions,
      correctAnswers,
      passed,
    });

    let employee = access.employee;
    if (!employee && enrollment.employeeId) {
      const [found] = await db
        .select()
        .from(employeesTable)
        .where(eq(employeesTable.id, enrollment.employeeId))
        .limit(1);
      employee = found ?? null;
    }

    let certificateId: number | null = null;
    if (passed) {
      const companyId = employee?.companyId ?? enrollment.companyId ?? access.companyId;
      const [company] = await db
        .select()
        .from(companiesTable)
        .where(eq(companiesTable.id, companyId))
        .limit(1);
      const certClauses = [eq(certificatesTable.userId, userId)];
      if (employee) certClauses.push(eq(certificatesTable.employeeId, employee.id));

      const [existingCert] = await db
        .select()
        .from(certificatesTable)
        .where(and(eq(certificatesTable.courseId, courseId), or(...certClauses)))
        .orderBy(desc(certificatesTable.id))
        .limit(1);

      if (existingCert) {
        certificateId = existingCert.id;
      } else {
        const code = `ECO-${randomUUID().slice(0, 8).toUpperCase()}`;
        const [cert] = await db
          .insert(certificatesTable)
          .values({
            userId,
            companyId,
            employeeId: employee?.id,
            employeeName: employee?.name ?? "EcoLearn Learner",
            companyName: company?.name ?? "EcoLearn Mauritius",
            courseId,
            courseVersion,
            uniqueCode: code,
          })
          .returning();
        certificateId = cert.id;
      }

      const completedAt = new Date();
      await db
        .update(enrollmentsTable)
        .set({
          status: "completed",
          progressPct: 100,
          completedAt,
          completedVersion: courseVersion,
          lastAccessedAt: completedAt,
        })
        .where(eq(enrollmentsTable.id, enrollment.id));

      if (employee) {
        await db
          .update(courseAssignmentsTable)
          .set({ completedAt })
          .where(
            and(
              eq(courseAssignmentsTable.employeeId, employee.id),
              eq(courseAssignmentsTable.courseId, courseId),
            ),
          );
        await syncEmployeeLearningStats(employee.id);
      }
    }

    res.json({ score, passed, totalQuestions, correctAnswers, certificateId });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to submit quiz");
      res.status(500).json({ error: "Failed to submit quiz" });
    }
  }
});

export default router;
