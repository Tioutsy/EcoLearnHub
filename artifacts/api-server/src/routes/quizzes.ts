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
import { awardCourseBadge, evaluateCourseMilestones } from "../lib/achievementsService";

const router = Router();

router.get("/:courseId/quiz", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.courseId) ? req.params.courseId[0] : req.params.courseId;
  const courseId = parseInt(raw, 10);
  if (isNaN(courseId)) {
    res.status(400).json({ error: "Invalid courseId" });
    return;
  }

  const [course] = await db
    .select({ isPublished: coursesTable.isPublished })
    .from(coursesTable)
    .where(eq(coursesTable.id, courseId));

  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  let accessContext = null;
  let bypassFilter = false;
  try {
    const access = await getCompanyAccess(req);
    accessContext = access;
    if (access && access.role === "platform_admin") {
      bypassFilter = true;
    }
  } catch (e) {
    // Ignore auth errors for guest/learner accesses
  }

  if (!course.isPublished && !bypassFilter) {
    res.status(403).json({ error: "Cannot access quiz for an unpublished course" });
    return;
  }

  if (!bypassFilter) {
    const { checkCourseEligibility } = await import("../lib/prerequisites");
    const eligibility = await checkCourseEligibility(courseId, accessContext);
    if (!eligibility.eligible) {
      res.status(403).json({ 
        error: "PREREQUISITES_INCOMPLETE",
        message: "You must complete all prerequisite courses before accessing this quiz.",
        completedCount: eligibility.completedCount,
        totalCount: eligibility.totalCount,
        prerequisites: eligibility.prerequisites,
      });
      return;
    }
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

    let bypassFilter = false;
    if (access && access.role === "platform_admin") {
      bypassFilter = true;
    }

    if (!bypassFilter) {
      const { checkCourseEligibility } = await import("../lib/prerequisites");
      const eligibility = await checkCourseEligibility(courseId, access);
      if (!eligibility.eligible) {
        res.status(403).json({ 
          error: "PREREQUISITES_INCOMPLETE",
          message: "You must complete all prerequisite courses before submitting this quiz."
        });
        return;
      }
    }

    const questions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, courseId));

    const competencyScores: Record<string, { correct: number, total: number, percentage: number, passed: boolean }> = {};
    let isCertification = false;
    for (const q of questions) {
      if (q.competencyArea) {
        isCertification = true;
        if (!competencyScores[q.competencyArea]) {
          competencyScores[q.competencyArea] = { correct: 0, total: 0, percentage: 0, passed: false };
        }
        competencyScores[q.competencyArea].total++;
      }
    }

    let correctAnswers = 0;
    const incorrectSourceCourseIds: Record<number, number> = {};

    for (const answer of parsed.data.answers) {
      const question = questions.find((q) => q.id === answer.questionId);
      if (question) {
        const isCorrect = question.correctOption === answer.selectedOption;
        if (isCorrect) {
          correctAnswers++;
          if (question.competencyArea) {
            competencyScores[question.competencyArea].correct++;
          }
        } else {
          if (question.sourceCourseId) {
            incorrectSourceCourseIds[question.sourceCourseId] = (incorrectSourceCourseIds[question.sourceCourseId] || 0) + 1;
          }
        }
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

    let allCompetenciesPassed = true;
    for (const key of Object.keys(competencyScores)) {
       const comp = competencyScores[key];
       comp.percentage = comp.total > 0 ? Math.round((comp.correct / comp.total) * 100) : 0;
       // We use >= 7 for pass threshold for 10 questions. If total is not 10, use 70%
       comp.passed = comp.percentage >= 70;
       if (!comp.passed) allCompetenciesPassed = false;
    }

    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    let passed = score >= passingScore;
    if (isCertification) {
        // Enforce certification rules: overall >= 80 and all areas >= 70
        passed = score >= 80 && allCompetenciesPassed;
    }

    const userId = access.userId;
    const dbAttempt = await db.insert(quizAttemptsTable).values({
      userId,
      courseId,
      courseVersion,
      score,
      totalQuestions,
      correctAnswers,
      passed,
      competencyScores: isCertification ? competencyScores : null,
    }).returning();

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
        const certificateTitle = isCertification ? "EcoLearnHub Core Sustainability Certificate" : null;
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
            certificateTitle,
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

    const feedback = parsed.data.answers.map((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      return {
        questionId: answer.questionId,
        question: question?.question ?? "",
        selectedOption: answer.selectedOption,
        correctOption: question?.correctOption ?? 0,
        isCorrect: question?.correctOption === answer.selectedOption,
        correctExplanation: question?.correctExplanation ?? null,
        incorrectExplanation: question?.incorrectExplanation ?? null,
        practicalTakeaway: question?.practicalTakeaway ?? null,
        optionFeedback: question?.optionFeedback ?? [],
        options: question?.options ?? [],
        competencyArea: question?.competencyArea ?? null,
        sourceCourseId: question?.sourceCourseId ?? null,
        learningOutcome: question?.learningOutcome ?? null,
      };
    });

    let recommendations: number[] = [];
    let weakestCompetencyArea: string | null = null;

    if (isCertification && !passed) {
       recommendations = Object.entries(incorrectSourceCourseIds)
           .sort((a, b) => b[1] - a[1])
           .slice(0, 3)
           .map(e => parseInt(e[0]));
           
       let lowestScore = 100;
       for (const key of Object.keys(competencyScores)) {
          if (competencyScores[key].percentage < lowestScore) {
             lowestScore = competencyScores[key].percentage;
             weakestCompetencyArea = key;
          }
       }
    }

    const newAchievements: any[] = [];
    if (passed && employee) {
      const newBadge = await awardCourseBadge(employee, courseId);
      const newMilestones = await evaluateCourseMilestones(employee);
      if (newBadge) newAchievements.push(newBadge);
      newAchievements.push(...newMilestones);
    }

    res.json({ 
      score, 
      passed, 
      totalQuestions, 
      correctAnswers, 
      certificateId, 
      feedback,
      competencyScores: isCertification ? competencyScores : null,
      recommendations: recommendations.length > 0 ? recommendations : null,
      weakestCompetencyArea,
      newAchievements
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      req.log?.error({ err }, "Failed to submit quiz");
      res.status(500).json({ error: "Failed to submit quiz" });
    }
  }
});

export default router;
