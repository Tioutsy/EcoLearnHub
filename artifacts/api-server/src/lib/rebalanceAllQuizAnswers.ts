import { db, coursesTable, quizQuestionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

// Balanced target position patterns based on question index
const PATTERN_10 = [1, 2, 0, 3, 1, 3, 0, 2, 1, 3]; // 2 P1, 3 P2, 2 P3, 3 P4
const PATTERN_5  = [1, 2, 0, 3, 1];                // 1 P1, 2 P2, 1 P3, 1 P4
const PATTERN_7  = [1, 2, 0, 3, 1, 2, 0];             // 2 P1, 2 P2, 2 P3, 1 P4
const PATTERN_8  = [1, 2, 0, 3, 1, 3, 0, 2];          // 2 P1, 2 P2, 2 P3, 2 P4
const PATTERN_15 = [1, 2, 0, 3, 1, 3, 0, 2, 1, 3, 0, 2, 1, 2, 0]; // 4 P1, 4 P2, 3 P3, 4 P4

export function getTargetPositionPattern(totalQuestions: number): number[] {
  if (totalQuestions === 5) return PATTERN_5;
  if (totalQuestions === 7) return PATTERN_7;
  if (totalQuestions === 8) return PATTERN_8;
  if (totalQuestions === 10) return PATTERN_10;
  if (totalQuestions === 15) return PATTERN_15;

  // Fallback pattern repeating [1, 2, 0, 3]
  const pattern: number[] = [];
  const seq = [1, 2, 0, 3];
  for (let i = 0; i < totalQuestions; i++) {
    pattern.push(seq[i % seq.length]);
  }
  return pattern;
}

export async function rebalanceAllQuizAnswers(): Promise<void> {
  const courses = await db.select().from(coursesTable);
  courses.sort((a, b) => {
    const codeA = a.courseCode || "";
    const codeB = b.courseCode || "";
    const numA = parseInt(codeA.replace(/[^0-9]/g, ""), 10) || 0;
    const numB = parseInt(codeB.replace(/[^0-9]/g, ""), 10) || 0;
    return numA - numB;
  });

  logger.info(`Starting catalogue-wide quiz answer rebalancing across ${courses.length} courses...`);

  for (const course of courses) {
    const questions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, course.id))
      .orderBy(quizQuestionsTable.orderIndex);

    if (questions.length === 0) continue;

    const targetPattern = getTargetPositionPattern(questions.length);

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const targetPos = targetPattern[i % targetPattern.length];
      const currentPos = q.correctOption ?? 0;

      if (currentPos === targetPos) continue;

      const options = [...(q.options || [])];
      let optionFeedback = Array.isArray(q.optionFeedback) ? [...(q.optionFeedback as string[])] : undefined;

      if (options.length > Math.max(currentPos, targetPos)) {
        // Swap option strings
        const tempOpt = options[currentPos];
        options[currentPos] = options[targetPos];
        options[targetPos] = tempOpt;

        // Swap option feedback if array exists
        if (optionFeedback && optionFeedback.length > Math.max(currentPos, targetPos)) {
          const tempFb = optionFeedback[currentPos];
          optionFeedback[currentPos] = optionFeedback[targetPos];
          optionFeedback[targetPos] = tempFb;
        }

        // Update database record
        await db
          .update(quizQuestionsTable)
          .set({
            options,
            correctOption: targetPos,
            ...(optionFeedback ? { optionFeedback } : {}),
          })
          .where(eq(quizQuestionsTable.id, q.id));
      }
    }
  }

  logger.info("Catalogue-wide quiz answer rebalancing complete.");
}
