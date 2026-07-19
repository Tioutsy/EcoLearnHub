import { db, coursesTable } from '../lib/db/src/index';

async function run() {
  const courses = await db.select().from(coursesTable);
  console.log("Existing Courses:");
  courses.forEach(c => {
    console.log(`- ID: ${c.id}, Code: ${c.code}, Slug: ${c.slug}, Title: ${c.title}, Status: ${c.status}`);
  });
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
