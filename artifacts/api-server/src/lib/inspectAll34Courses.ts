import { db, coursesTable, quizQuestionsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

async function runQuizSummary() {
  const allCourses = await db.select().from(coursesTable);
  allCourses.sort((a, b) => {
    const numA = parseInt((a.courseCode || "").replace(/[^0-9]/g, ""), 10) || 0;
    const numB = parseInt((b.courseCode || "").replace(/[^0-9]/g, ""), 10) || 0;
    return numA - numB;
  });

  const allQuestions = await db.select().from(quizQuestionsTable);

  console.log("| Course | Total Qs | Position 1 | Position 2 | Position 3 | Position 4 | Max Pos % | Bias Status |");
  console.log("|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|");

  for (const course of allCourses) {
    const code = course.courseCode || course.slug;
    const questions = allQuestions.filter(q => q.courseId === course.id);
    if (questions.length === 0) continue;

    const counts = { pos1: 0, pos2: 0, pos3: 0, pos4: 0 };
    questions.forEach(q => {
      const idx = q.correctOption ?? 0;
      if (idx === 0) counts.pos1++;
      else if (idx === 1) counts.pos2++;
      else if (idx === 2) counts.pos3++;
      else if (idx === 3) counts.pos4++;
    });

    const total = questions.length;
    const p1Pct = ((counts.pos1 / total) * 100).toFixed(1);
    const p2Pct = ((counts.pos2 / total) * 100).toFixed(1);
    const p3Pct = ((counts.pos3 / total) * 100).toFixed(1);
    const p4Pct = ((counts.pos4 / total) * 100).toFixed(1);

    const maxPct = Math.max(counts.pos1, counts.pos2, counts.pos3, counts.pos4) / total * 100;
    const isBiased = maxPct > 50;

    console.log(`| **${code}** | ${total} | ${counts.pos1} (${p1Pct}%) | ${counts.pos2} (${p2Pct}%) | ${counts.pos3} (${p3Pct}%) | ${counts.pos4} (${p4Pct}%) | ${maxPct.toFixed(1)}% | ${isBiased ? "**BIASED**" : "BALANCED"} |`);
  }
  process.exit(0);
}

runQuizSummary().catch(console.error);
