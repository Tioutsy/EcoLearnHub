import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  planCourseEntitlementsTable,
  subscriptionPlansTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import fs from "fs";

async function run() {
  const courses = await db
    .select({
      id: coursesTable.id,
      code: coursesTable.courseCode,
      title: coursesTable.title,
      slug: coursesTable.slug,
      status: coursesTable.status,
      isPublished: coursesTable.isPublished,
      description: coursesTable.description,
      fullDescription: coursesTable.fullDescription,
      durationMinutes: coursesTable.durationMinutes,
      level: coursesTable.level,
      passingScore: coursesTable.passingScore,
      badgeName: coursesTable.badgeName,
      badgeDescription: coursesTable.badgeDescription,
      learningObjectives: coursesTable.learningObjectives,
      recommendedNextCourseId: coursesTable.recommendedNextCourseId,
      categoryId: coursesTable.categoryId,
    })
    .from(coursesTable)
    .orderBy(coursesTable.id);

  let output = `# Active Database Course Audit Raw Log\nTotal Courses: ${courses.length}\n\n`;

  for (const c of courses) {
    const lessons = await db
      .select({
        id: lessonsTable.id,
        title: lessonsTable.title,
        orderIndex: lessonsTable.orderIndex,
        blocks: lessonsTable.contentBlocks,
      })
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, c.id))
      .orderBy(lessonsTable.orderIndex);

    const questions = await db
      .select({
        id: quizQuestionsTable.id,
        question: quizQuestionsTable.question,
        options: quizQuestionsTable.options,
        correctOption: quizQuestionsTable.correctOption,
        correctExplanation: quizQuestionsTable.correctExplanation,
        incorrectExplanation: quizQuestionsTable.incorrectExplanation,
      })
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, c.id));

    let emptyLessons = 0;
    for (const l of lessons) {
      const blockCount = Array.isArray(l.blocks) ? l.blocks.length : 0;
      if (blockCount === 0) emptyLessons++;
    }

    let invalidQuestions = 0;
    for (const q of questions) {
      const opts = Array.isArray(q.options) ? q.options : [];
      if (
        !q.question ||
        opts.length === 0 ||
        q.correctOption === null ||
        q.correctOption === undefined ||
        q.correctOption < 0 ||
        q.correctOption >= opts.length ||
        !q.correctExplanation ||
        !q.incorrectExplanation
      ) {
        invalidQuestions++;
      }
    }

    output += `## ID: ${c.id} | Code: ${c.code || "NONE"} | Slug: ${c.slug}\n`;
    output += `- Title: ${c.title}\n`;
    output += `- Published: ${c.isPublished} | Status: ${c.status} | Level: ${c.level} | Duration: ${c.durationMinutes}m | PassScore: ${c.passingScore}%\n`;
    output += `- Badge: "${c.badgeName || ""}" — "${c.badgeDescription || ""}"\n`;
    output += `- Objectives Count: ${c.learningObjectives?.length || 0}\n`;
    output += `- Lessons Count: ${lessons.length} (Empty: ${emptyLessons})\n`;
    output += `- Quiz Questions Count: ${questions.length} (Invalid: ${invalidQuestions})\n`;
    output += `\n`;
  }

  fs.writeFileSync("./course_audit_raw_log.txt", output);
  console.log("Wrote full audit log to course_audit_raw_log.txt");
}

run().catch(console.error).then(() => process.exit(0));
