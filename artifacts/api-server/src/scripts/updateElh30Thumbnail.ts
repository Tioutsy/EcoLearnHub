import { db, coursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Updating ELH-30 thumbnail URL in production database...");
  const updated = await db
    .update(coursesTable)
    .set({ thumbnailUrl: "/images/courses/climate-risk-and-workplace-resilience.jpg" })
    .where(eq(coursesTable.courseCode, "ELH-30"))
    .returning();

  console.log("Successfully updated ELH-30 database record:", updated);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
