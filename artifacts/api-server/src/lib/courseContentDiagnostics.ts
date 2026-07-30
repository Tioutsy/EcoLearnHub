import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  coursePrerequisitesTable,
} from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { logger } from "./logger";

export interface DiagnosticIssue {
  courseId: number;
  courseCode: string;
  courseTitle: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: "EMPTY_CONTENT" | "METADATA" | "OBJECTIVES" | "QUIZ_QUALITY" | "EXPLANATIONS" | "BADGE_CERT" | "PREREQUISITE" | "RECOMMENDATION";
  message: string;
}

export interface DiagnosticReport {
  timestamp: string;
  totalCoursesAudited: number;
  criticalIssuesCount: number;
  highIssuesCount: number;
  mediumIssuesCount: number;
  lowIssuesCount: number;
  valid: boolean;
  issues: DiagnosticIssue[];
}

export async function runCourseContentDiagnostics(): Promise<DiagnosticReport> {
  const issues: DiagnosticIssue[] = [];

  const allCourses = await db
    .select()
    .from(coursesTable)
    .orderBy(coursesTable.id);

  // Only audit platform catalogue courses (ELH-01..29) and ignore transient test suite dummy courses
  const courses = allCourses.filter(
    (c) => c.courseCode && c.courseCode.startsWith("ELH-")
  );

  for (const c of courses) {
    const code = c.courseCode || `ID-${c.id}`;
    const title = c.title;

    // 1. Metadata check
    if (!c.courseCode) {
      issues.push({
        courseId: c.id,
        courseCode: code,
        courseTitle: title,
        severity: "HIGH",
        category: "METADATA",
        message: `Course ID ${c.id} missing course_code.`,
      });
    }
    if (!c.description || c.description.trim().length === 0) {
      issues.push({
        courseId: c.id,
        courseCode: code,
        courseTitle: title,
        severity: "HIGH",
        category: "METADATA",
        message: "Missing course description.",
      });
    }
    if (!c.durationMinutes || c.durationMinutes <= 0) {
      issues.push({
        courseId: c.id,
        courseCode: code,
        courseTitle: title,
        severity: "MEDIUM",
        category: "METADATA",
        message: `Invalid course duration: ${c.durationMinutes} minutes.`,
      });
    }
    if (!c.passingScore || c.passingScore < 70 || c.passingScore > 100) {
      issues.push({
        courseId: c.id,
        courseCode: code,
        courseTitle: title,
        severity: "HIGH",
        category: "METADATA",
        message: `Invalid passing score threshold: ${c.passingScore}%.`,
      });
    }

    // 2. Learning Objectives check
    const objectives = Array.isArray(c.learningObjectives) ? c.learningObjectives : [];
    if (objectives.length < 3) {
      issues.push({
        courseId: c.id,
        courseCode: code,
        courseTitle: title,
        severity: "HIGH",
        category: "OBJECTIVES",
        message: `Insufficient learning objectives (${objectives.length} defined, minimum 3 required).`,
      });
    }

    // 3. Lessons Content check
    const lessons = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, c.id))
      .orderBy(lessonsTable.orderIndex);

    if (lessons.length === 0 && c.isPublished) {
      issues.push({
        courseId: c.id,
        courseCode: code,
        courseTitle: title,
        severity: "CRITICAL",
        category: "EMPTY_CONTENT",
        message: "Published course has 0 lessons.",
      });
    }

    for (const l of lessons) {
      const blocks = (Array.isArray(l.contentBlocks) ? l.contentBlocks : []) as any[];
      if (blocks.length === 0) {
        issues.push({
          courseId: c.id,
          courseCode: code,
          courseTitle: title,
          severity: "CRITICAL",
          category: "EMPTY_CONTENT",
          message: `Lesson "${l.title}" (ID ${l.id}) has 0 content blocks.`,
        });
      }
    }

    // 4. Quiz Questions check
    const questions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, c.id))
      .orderBy(quizQuestionsTable.orderIndex);

    if (questions.length === 0 && c.isPublished && code !== "ELH-00") {
      issues.push({
        courseId: c.id,
        courseCode: code,
        courseTitle: title,
        severity: "CRITICAL",
        category: "QUIZ_QUALITY",
        message: "Published course has 0 quiz questions.",
      });
    }

    for (const q of questions) {
      const options = (Array.isArray(q.options) ? q.options : []) as string[];
      if (!q.question || q.question.trim().length === 0) {
        issues.push({
          courseId: c.id,
          courseCode: code,
          courseTitle: title,
          severity: "CRITICAL",
          category: "QUIZ_QUALITY",
          message: `Quiz Question ID ${q.id} has an empty question stem.`,
        });
      }
      if (options.length < 2) {
        issues.push({
          courseId: c.id,
          courseCode: code,
          courseTitle: title,
          severity: "CRITICAL",
          category: "QUIZ_QUALITY",
          message: `Quiz Question ID ${q.id} has fewer than 2 answer options.`,
        });
      }
      if (
        q.correctOption === null ||
        q.correctOption === undefined ||
        q.correctOption < 0 ||
        q.correctOption >= options.length
      ) {
        issues.push({
          courseId: c.id,
          courseCode: code,
          courseTitle: title,
          severity: "CRITICAL",
          category: "QUIZ_QUALITY",
          message: `Quiz Question ID ${q.id} has an out-of-bounds correctOption (${q.correctOption}).`,
        });
      }
      if (!q.correctExplanation || q.correctExplanation.trim().length === 0) {
        issues.push({
          courseId: c.id,
          courseCode: code,
          courseTitle: title,
          severity: "HIGH",
          category: "EXPLANATIONS",
          message: `Quiz Question ID ${q.id} is missing correctExplanation.`,
        });
      }
    }

    // 5. Badge check
    if (!c.badgeName || c.badgeName.trim().length === 0) {
      issues.push({
        courseId: c.id,
        courseCode: code,
        courseTitle: title,
        severity: "HIGH",
        category: "BADGE_CERT",
        message: "Course is missing badgeName metadata.",
      });
    }

    // 6. Recommendation self-reference check
    if (c.recommendedNextCourseId === c.id) {
      issues.push({
        courseId: c.id,
        courseCode: code,
        courseTitle: title,
        severity: "HIGH",
        category: "RECOMMENDATION",
        message: "Course recommendation is self-referencing.",
      });
    }
  }

  const criticalIssuesCount = issues.filter(i => i.severity === "CRITICAL").length;
  const highIssuesCount = issues.filter(i => i.severity === "HIGH").length;
  const mediumIssuesCount = issues.filter(i => i.severity === "MEDIUM").length;
  const lowIssuesCount = issues.filter(i => i.severity === "LOW").length;

  const report: DiagnosticReport = {
    timestamp: new Date().toISOString(),
    totalCoursesAudited: courses.length,
    criticalIssuesCount,
    highIssuesCount,
    mediumIssuesCount,
    lowIssuesCount,
    valid: criticalIssuesCount === 0 && highIssuesCount === 0,
    issues,
  };

  if (!report.valid) {
    logger.warn({ critical: criticalIssuesCount, high: highIssuesCount }, "Course content diagnostics identified issues.");
  } else {
    logger.info({ totalCourses: courses.length }, "All course content diagnostics passed 100%.");
  }

  return report;
}
