import { db, coursesTable, categoriesTable } from '../lib/db/src/index';
import { eq, and, desc } from 'drizzle-orm';

async function check() {
  const q = await db
    .select({
      id: coursesTable.id,
      title: coursesTable.title,
      categoryId: coursesTable.categoryId,
      categoryName: categoriesTable.name,
      isPublished: coursesTable.isPublished,
      status: coursesTable.status,
    })
    .from(coursesTable)
    .leftJoin(categoriesTable, eq(coursesTable.categoryId, categoriesTable.id))
    .where(
      and(
        eq(coursesTable.isPublished, true)
      )
    );
  
  console.log(q);
  process.exit(0);
}

check().catch(console.error);
