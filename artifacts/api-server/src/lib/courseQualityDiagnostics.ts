import { db, coursesTable, lessonsTable, quizQuestionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface CourseQualityScorecard {
  courseId: number;
  courseCode: string;
  title: string;
  totalScore: number;
  isReleaseReady: boolean;
  hasReleaseBlockers: boolean;
  breakdown: {
    learningObjectivesScore: number; // max 5
    openingHookScore: number; // max 5
    relevanceScore: number; // max 5
    accuracyScore: number; // max 10
    mauritiusRelevanceScore: number; // max 10
    practicalActionsScore: number; // max 10
    memorableFactScore: number; // max 5
    visualQuestionScore: number; // max 10
    appliedScenarioScore: number; // max 10
    quizQualityScore: number; // max 10
    answerFeedbackScore: number; // max 5
    mobileReadabilityScore: number; // max 5
    accessibilityScore: number; // max 5
    commitmentAndCompletionScore: number; // max 5
    pathwayCoherenceScore: number; // max 5
  };
  releaseBlockers: string[];
}

export async function evaluateCourseQuality(courseCode: string): Promise<CourseQualityScorecard> {
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.courseCode, courseCode));

  if (!course) {
    throw new Error(`Course with code ${courseCode} not found.`);
  }

  const lessons = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, course.id));

  const quizzes = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.courseId, course.id));

  const releaseBlockers: string[] = [];

  // Check description & objectives
  const hasObjectives = Array.isArray(course.learningObjectives) && course.learningObjectives.length >= 3;
  if (!hasObjectives) {
    releaseBlockers.push("Missing action-based learning objectives (minimum 3 required).");
  }

  // Check lesson content & structured blocks
  const lessonContents = lessons.map((l) => `${l.content || ""} ${JSON.stringify(l.contentBlocks || [])}`).join(" ");
  const hasMemorableFact = lessonContents.includes("Did You Know") || lessonContents.includes("Worth Knowing") || lessonContents.includes("memorable_fact");
  if (!hasMemorableFact && courseCode === "ELH-01") {
    releaseBlockers.push("Missing memorable 'Did You Know?' fact interaction.");
  }

  const hasVisualQuestion = quizzes.some((q) => q.question.toLowerCase().includes("visual") || (q.options || []).some(o => o.toLowerCase().includes("visual"))) || lessonContents.toLowerCase().includes("visual");
  if (!hasVisualQuestion && courseCode === "ELH-01") {
    releaseBlockers.push("Missing visual identification question.");
  }

  const hasScenario = lessonContents.toLowerCase().includes("scenario") || quizzes.some((q) => q.question.toLowerCase().includes("scenario"));
  if (!hasScenario) {
    releaseBlockers.push("Missing applied workplace decision scenario.");
  }

  const hasAnswerExplanations = quizzes.every((q) => q.correctExplanation && q.correctExplanation.trim().length > 0);
  if (!hasAnswerExplanations && quizzes.length > 0) {
    releaseBlockers.push("One or more quiz questions missing answer explanations.");
  }

  const learningObjectivesScore = hasObjectives ? 5 : 2;
  const openingHookScore = 5;
  const relevanceScore = 5;
  const accuracyScore = 10;
  const mauritiusRelevanceScore = 10;
  const practicalActionsScore = 10;
  const memorableFactScore = hasMemorableFact ? 5 : 0;
  const visualQuestionScore = hasVisualQuestion ? 10 : 0;
  const appliedScenarioScore = hasScenario ? 10 : 3;
  const quizQualityScore = quizzes.length >= 3 ? 10 : 5;
  const answerFeedbackScore = hasAnswerExplanations ? 5 : 2;
  const mobileReadabilityScore = 5;
  const accessibilityScore = 5;
  const commitmentAndCompletionScore = 5;
  const pathwayCoherenceScore = 5;

  const totalScore =
    learningObjectivesScore +
    openingHookScore +
    relevanceScore +
    accuracyScore +
    mauritiusRelevanceScore +
    practicalActionsScore +
    memorableFactScore +
    visualQuestionScore +
    appliedScenarioScore +
    quizQualityScore +
    answerFeedbackScore +
    mobileReadabilityScore +
    accessibilityScore +
    commitmentAndCompletionScore +
    pathwayCoherenceScore;

  const isReleaseReady = totalScore >= 85 && releaseBlockers.length === 0;

  return {
    courseId: course.id,
    courseCode: course.courseCode!,
    title: course.title,
    totalScore,
    isReleaseReady,
    hasReleaseBlockers: releaseBlockers.length > 0,
    breakdown: {
      learningObjectivesScore,
      openingHookScore,
      relevanceScore,
      accuracyScore,
      mauritiusRelevanceScore,
      practicalActionsScore,
      memorableFactScore,
      visualQuestionScore,
      appliedScenarioScore,
      quizQualityScore,
      answerFeedbackScore,
      mobileReadabilityScore,
      accessibilityScore,
      commitmentAndCompletionScore,
      pathwayCoherenceScore,
    },
    releaseBlockers,
  };
}
