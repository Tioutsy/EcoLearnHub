import {
  db,
  categoriesTable,
  courseCategoryAssignmentsTable,
  coursePrerequisitesTable,
  coursesTable,
  systemSeedsTable,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { logger } from "./logger";

const SEED_NAME = "categories-and-assignments-v1";

interface CategoryDefinition {
  slug: string;
  name: string;
  description: string;
  displayOrder: number;
  iconName: string;
}

const INITIAL_CATEGORIES: CategoryDefinition[] = [
  {
    slug: "core-sustainability-certificate",
    name: "Core Sustainability Certificate",
    description: "Build the essential sustainability knowledge and practical workplace habits relevant across every role.",
    displayOrder: 1,
    iconName: "award",
  },
  {
    slug: "sustainability-in-action",
    name: "Sustainability in Action",
    description: "Turn sustainability knowledge into organised actions, responsibilities, evidence and measurable workplace improvement.",
    displayOrder: 2,
    iconName: "activity",
  },
  {
    slug: "sustainability-by-department",
    name: "Sustainability by Department",
    description: "Apply sustainability principles to the decisions, responsibilities and everyday work of specific departments.",
    displayOrder: 3,
    iconName: "building-2",
  },
  {
    slug: "leadership-and-sustainability-management",
    name: "Leadership and Sustainability Management",
    description: "Lead workplace initiatives, clarify responsibilities, engage employees and review sustainability performance.",
    displayOrder: 4,
    iconName: "users",
  },
];

// Mapping course codes to category assignments
const CORE_CODES = [
  "ELH-01", "ELH-02", "ELH-03", "ELH-04", "ELH-05", "ELH-06",
  "ELH-07", "ELH-08", "ELH-09", "ELH-10", "ELH-11", "ELH-12"
];

const ACTION_CODES = [
  "ELH-13", "ELH-14", "ELH-15", "ELH-16", "ELH-17",
  "ELH-18", "ELH-19", "ELH-20", "ELH-21", "ELH-22", "ELH-23", "ELH-31", "ELH-32", "ELH-33", "ELH-34"
];

const DEPARTMENT_CODES = [
  "ELH-24", "ELH-25", "ELH-26", "ELH-27", "ELH-28", "ELH-29", "ELH-30", "ELH-31", "ELH-32", "ELH-33", "ELH-34"
];

const LEADERSHIP_CODES = [
  "ELH-13", "ELH-19", "ELH-20", "ELH-21", "ELH-22", "ELH-23", "ELH-32"
];

// Recommended prerequisites (soft recommendations, requirementType: 'recommended')
const RECOMMENDED_PREREQUISITES: { targetCode: string; prereqCode: string }[] = [
  { targetCode: "ELH-23", prereqCode: "ELH-13" },
  { targetCode: "ELH-19", prereqCode: "ELH-18" },
  { targetCode: "ELH-22", prereqCode: "ELH-21" },
  { targetCode: "ELH-26", prereqCode: "ELH-05" },
];

export async function ensureCategoriesAndAssignments(): Promise<void> {
  try {
    // 1. Ensure Categories exist or update their metadata
    const categoryIdMap = new Map<string, number>();

    for (const catDef of INITIAL_CATEGORIES) {
      const existing = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.slug, catDef.slug))
        .limit(1)
        .then(rows => rows[0]);

      if (existing) {
        await db
          .update(categoriesTable)
          .set({
            name: catDef.name,
            description: catDef.description,
            displayOrder: catDef.displayOrder,
            iconName: catDef.iconName,
            isVisible: true,
          })
          .where(eq(categoriesTable.id, existing.id));
        categoryIdMap.set(catDef.slug, existing.id);
      } else {
        const inserted = await db
          .insert(categoriesTable)
          .values({
            slug: catDef.slug,
            name: catDef.name,
            description: catDef.description,
            displayOrder: catDef.displayOrder,
            iconName: catDef.iconName,
            isVisible: true,
          })
          .returning({ id: categoriesTable.id });
        categoryIdMap.set(catDef.slug, inserted[0]!.id);
      }
    }

    // 2. Load all existing courses
    const allCourses = await db.select({
      id: coursesTable.id,
      courseCode: coursesTable.courseCode,
    }).from(coursesTable);

    const courseMapByCode = new Map<string, number>();
    for (const c of allCourses) {
      if (c.courseCode) {
        courseMapByCode.set(c.courseCode, c.id);
      }
    }

    // Helper to upsert category assignment
    const assignCourse = async (courseCode: string, catSlug: string, isPrimary: boolean, displayOrder: number) => {
      const courseId = courseMapByCode.get(courseCode);
      const categoryId = categoryIdMap.get(catSlug);

      if (!courseId || !categoryId) {
        logger.warn({ courseCode, catSlug }, "Skipping category assignment — course or category not found");
        return;
      }

      const existingAssignment = await db
        .select()
        .from(courseCategoryAssignmentsTable)
        .where(
          and(
            eq(courseCategoryAssignmentsTable.courseId, courseId),
            eq(courseCategoryAssignmentsTable.categoryId, categoryId)
          )
        )
        .limit(1)
        .then(rows => rows[0]);

      if (!existingAssignment) {
        await db.insert(courseCategoryAssignmentsTable).values({
          courseId,
          categoryId,
          isPrimary,
          displayOrder,
        });
      } else {
        await db
          .update(courseCategoryAssignmentsTable)
          .set({ isPrimary, displayOrder })
          .where(eq(courseCategoryAssignmentsTable.id, existingAssignment.id));
      }

      // Also set categoryId on coursesTable if this is the primary category
      if (isPrimary) {
        await db
          .update(coursesTable)
          .set({ categoryId })
          .where(eq(coursesTable.id, courseId));
      }
    };

    // Category 1: Core Sustainability Certificate
    for (let i = 0; i < CORE_CODES.length; i++) {
      const code = CORE_CODES[i]!;
      await assignCourse(code, "core-sustainability-certificate", true, i + 1);
    }

    // Category 2: Sustainability in Action
    for (let i = 0; i < ACTION_CODES.length; i++) {
      const code = ACTION_CODES[i]!;
      await assignCourse(code, "sustainability-in-action", true, i + 1);
    }

    // Category 3: Sustainability by Department
    for (let i = 0; i < DEPARTMENT_CODES.length; i++) {
      const code = DEPARTMENT_CODES[i]!;
      await assignCourse(code, "sustainability-by-department", true, i + 1);
    }

    // Category 4: Leadership (Cross-listed, isPrimary = false)
    for (let i = 0; i < LEADERSHIP_CODES.length; i++) {
      const code = LEADERSHIP_CODES[i]!;
      await assignCourse(code, "leadership-and-sustainability-management", false, i + 1);
    }

    // 3. Update Category Course Counts
    for (const [slug, catId] of categoryIdMap.entries()) {
      const countRes = await db
        .select({ id: courseCategoryAssignmentsTable.id })
        .from(courseCategoryAssignmentsTable)
        .where(eq(courseCategoryAssignmentsTable.categoryId, catId));

      await db
        .update(categoriesTable)
        .set({ courseCount: countRes.length })
        .where(eq(categoriesTable.id, catId));
    }

    // 4. Seed Recommended Prerequisites (requirementType: 'recommended')
    for (const rec of RECOMMENDED_PREREQUISITES) {
      const targetId = courseMapByCode.get(rec.targetCode);
      const prereqId = courseMapByCode.get(rec.prereqCode);

      if (targetId && prereqId) {
        const existing = await db
          .select()
          .from(coursePrerequisitesTable)
          .where(
            and(
              eq(coursePrerequisitesTable.courseId, targetId),
              eq(coursePrerequisitesTable.prerequisiteCourseId, prereqId)
            )
          )
          .limit(1)
          .then(rows => rows[0]);

        if (existing) {
          await db
            .update(coursePrerequisitesTable)
            .set({ requirementType: "recommended" })
            .where(
              and(
                eq(coursePrerequisitesTable.courseId, targetId),
                eq(coursePrerequisitesTable.prerequisiteCourseId, prereqId)
              )
            );
        } else {
          await db.insert(coursePrerequisitesTable).values({
            courseId: targetId,
            prerequisiteCourseId: prereqId,
            requirementType: "recommended",
          });
        }
      }
    }

    logger.info("Successfully seeded course categories and assignments.");
  } catch (err) {
    logger.error({ err }, "Error seeding categories and course assignments");
    throw err;
  }
}
