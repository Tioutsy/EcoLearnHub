import { db, coursesTable, quizQuestionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface CourseQuizAuditResult {
  courseCode: string;
  title: string;
  totalQuestions: number;
  positionCounts: { [positionIndex: number]: number };
  positionPercentages: { [positionIndex: number]: string };
  longestStreak: { position: number; streakLength: number };
  isBiased: boolean;
  warnings: string[];
}

export interface FullCatalogueAuditResult {
  totalCourses: number;
  totalQuestions: number;
  overallPositionCounts: { [positionIndex: number]: number };
  overallPositionPercentages: { [positionIndex: number]: string };
  courses: CourseQuizAuditResult[];
  severelyBiasedCourses: string[];
  moderatelyBiasedCourses: string[];
  balancedCourses: string[];
}

export async function auditFullCatalogueQuizDistribution(): Promise<FullCatalogueAuditResult> {
  const courses = await db.select().from(coursesTable);
  // Sort courses by courseCode numerical suffix (ELH-01 to ELH-29)
  courses.sort((a, b) => {
    const codeA = a.courseCode || "";
    const codeB = b.courseCode || "";
    const numA = parseInt(codeA.replace(/[^0-9]/g, ""), 10) || 0;
    const numB = parseInt(codeB.replace(/[^0-9]/g, ""), 10) || 0;
    return numA - numB;
  });

  const courseResults: CourseQuizAuditResult[] = [];
  const overallPositionCounts: { [positionIndex: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0 };
  let totalQuestionsCount = 0;

  const severelyBiased: string[] = [];
  const moderatelyBiased: string[] = [];
  const balanced: string[] = [];

  for (const course of courses) {
    const questions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, course.id))
      .orderBy(quizQuestionsTable.orderIndex);

    if (questions.length === 0) continue;

    totalQuestionsCount += questions.length;
    const counts: { [positionIndex: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0 };
    let currentPos = -1;
    let currentStreak = 0;
    let maxStreakPos = -1;
    let maxStreakLength = 0;
    const warnings: string[] = [];

    for (const q of questions) {
      const correctIdx = q.correctOption ?? 0;
      counts[correctIdx] = (counts[correctIdx] || 0) + 1;
      overallPositionCounts[correctIdx] = (overallPositionCounts[correctIdx] || 0) + 1;

      if (correctIdx === currentPos) {
        currentStreak++;
      } else {
        currentPos = correctIdx;
        currentStreak = 1;
      }

      if (currentStreak > maxStreakLength) {
        maxStreakLength = currentStreak;
        maxStreakPos = currentPos;
      }
    }

    const pPct: { [positionIndex: number]: string } = {};
    for (let pos = 0; pos < 4; pos++) {
      const cnt = counts[pos] || 0;
      pPct[pos] = ((cnt / questions.length) * 100).toFixed(1) + "%";
    }

    let isBiased = false;
    // Bias checks:
    // 1. If any single position has > 4 correct answers in a 10-question quiz (or >40% of total)
    if (questions.length >= 8) {
      for (let pos = 0; pos < 4; pos++) {
        if (counts[pos] > 4) {
          isBiased = true;
          warnings.push(`Position ${pos + 1} has ${counts[pos]} correct answers (max 4 allowed).`);
        }
      }
    }
    // 2. If longest streak > 2
    if (maxStreakLength > 2) {
      isBiased = true;
      warnings.push(`Longest streak is ${maxStreakLength} consecutive questions at Position ${maxStreakPos + 1}.`);
    }

    const cCode = course.courseCode || "";
    if (counts[0] >= 6) {
      severelyBiased.push(cCode);
    } else if (isBiased) {
      moderatelyBiased.push(cCode);
    } else {
      balanced.push(cCode);
    }

    courseResults.push({
      courseCode: cCode,
      title: course.title,
      totalQuestions: questions.length,
      positionCounts: counts,
      positionPercentages: pPct,
      longestStreak: { position: maxStreakPos, streakLength: maxStreakLength },
      isBiased,
      warnings,
    });
  }

  const overallPercentages: { [positionIndex: number]: string } = {};
  for (let pos = 0; pos < 4; pos++) {
    const cnt = overallPositionCounts[pos] || 0;
    overallPercentages[pos] = ((cnt / (totalQuestionsCount || 1)) * 100).toFixed(1) + "%";
  }

  return {
    totalCourses: courseResults.length,
    totalQuestions: totalQuestionsCount,
    overallPositionCounts,
    overallPositionPercentages: overallPercentages,
    courses: courseResults,
    severelyBiasedCourses: severelyBiased,
    moderatelyBiasedCourses: moderatelyBiased,
    balancedCourses: balanced,
  };
}
