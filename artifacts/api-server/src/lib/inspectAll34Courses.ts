import { db, coursesTable } from "@workspace/db";
import { ensureWorkplaceSustainabilityInitiativesCourse } from "./ensureWorkplaceSustainabilityInitiativesCourse";
import { ensureClimateRiskCourse } from "./ensureClimateRiskCourse";
import { eq, inArray } from "drizzle-orm";

async function fixAndVerify() {
  console.log("Running ELH-23 and ELH-30 course seeders...");
  await ensureWorkplaceSustainabilityInitiativesCourse();
  await ensureClimateRiskCourse();

  console.log("Ensuring all courses ELH-01 through ELH-34 have isPublished=true and status='published'...");
  const codes = [];
  for (let i = 1; i <= 34; i++) {
    codes.push(`ELH-${String(i).padStart(2, "0")}`);
  }

  await db
    .update(coursesTable)
    .set({
      isPublished: true,
      status: "published",
      updatedAt: new Date()
    })
    .where(inArray(coursesTable.courseCode, codes));

  const allCourses = await db.select().from(coursesTable);
  allCourses.sort((a, b) => {
    const numA = parseInt((a.courseCode || "").replace(/[^0-9]/g, ""), 10) || 0;
    const numB = parseInt((b.courseCode || "").replace(/[^0-9]/g, ""), 10) || 0;
    return numA - numB;
  });

  const unpublished = allCourses.filter(c => c.courseCode?.startsWith("ELH-") && (!c.isPublished || c.status !== "published"));

  console.log(`Verified ${allCourses.length} total courses in DB.`);
  console.log(`Unpublished ELH courses count: ${unpublished.length}`);

  for (let i = 1; i <= 34; i++) {
    const code = `ELH-${String(i).padStart(2, "0")}`;
    const course = allCourses.find(c => c.courseCode === code);
    if (course) {
      console.log(`${code}: ID ${course.id} | title "${course.title}" | status: ${course.status} | isPublished: ${course.isPublished}`);
    } else {
      console.error(`MISSING COURSE: ${code}`);
    }
  }

  process.exit(0);
}

fixAndVerify().catch(err => {
  console.error(err);
  process.exit(1);
});
