import {
  db,
  coursesTable,
  learningPathsTable,
  learningPathCoursesTable,
} from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { logger } from "./logger";

const PATH_SLUG = "core-sustainability-certificate";

const RESOLUTION_SLUGS = [
  ["sustainability-foundations"],
  ["waste-sorting", "waste-sorting-mauritian-bin-system"],
  ["energy-efficiency-at-work"],
  ["water-conservation"],
  ["sustainable-procurement"],
  ["green-office-practices"],
  ["carbon-footprint-awareness"],
  ["biodiversity-in-mauritius"],
  ["esg-basics"],
  ["environmental-compliance"],
  ["circular-economy"],
  ["final-sustainability-certification"]
];

const ALL_SLUGS_TO_QUERY = [
  "sustainability-foundations",
  "waste-sorting",
  "waste-sorting-mauritian-bin-system",
  "energy-efficiency-at-work",
  "water-conservation",
  "sustainable-procurement",
  "green-office-practices",
  "carbon-footprint-awareness",
  "biodiversity-in-mauritius",
  "esg-basics",
  "environmental-compliance",
  "circular-economy",
  "final-sustainability-certification"
];

export async function ensureCoreSustainabilityPath(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Find the required courses by slug
      const courses = await tx
        .select({
          id: coursesTable.id,
          slug: coursesTable.slug,
          durationMinutes: coursesTable.durationMinutes,
        })
        .from(coursesTable)
        .where(inArray(coursesTable.slug, ALL_SLUGS_TO_QUERY));

      const courseMap = new Map<string, typeof courses[0]>();
      for (const c of courses) {
        if (c.slug) {
          courseMap.set(c.slug, c);
        }
      }

      const resolvedCourses: typeof courses = [];
      const missingSlugs: string[] = [];

      for (let i = 0; i < RESOLUTION_SLUGS.length; i++) {
        const group = RESOLUTION_SLUGS[i]!;
        let found = null;
        for (const slug of group) {
          if (courseMap.has(slug)) {
            found = courseMap.get(slug)!;
            break;
          }
        }
        if (!found) {
          missingSlugs.push(group[0]); // report the primary canonical slug
        } else {
          resolvedCourses.push(found);
        }
      }

      if (missingSlugs.length > 0) {
        throw new Error(
          `Data integrity error: Required course slugs [${missingSlugs.join(
            ", "
          )}] not found. Cannot seed Core Sustainability Certificate.`
        );
      }

      // Calculate total duration for metadata
      const totalDuration = resolvedCourses.reduce((sum, c) => sum + (c.durationMinutes || 0), 0);

      // 2. Insert or update the learning path
      const existingPath = await tx
        .select()
        .from(learningPathsTable)
        .where(eq(learningPathsTable.slug, PATH_SLUG))
        .limit(1)
        .then((rows) => rows[0]);

      let pathId: number;

      if (existingPath) {
        await tx
          .update(learningPathsTable)
          .set({
            title: "Core Sustainability Certificate",
            description: "Build practical sustainability knowledge across everyday workplace habits, responsible operations, ESG and environmental compliance, then complete the cumulative certification assessment.",
            audience: "All employees",
            level: "Core Curriculum",
            providerLabel: "EcoLearnHub Recommended",
            isSystemManaged: true,
            status: "active",
            estimatedDurationMinutes: totalDuration,
          })
          .where(eq(learningPathsTable.id, existingPath.id));
        pathId = existingPath.id;
        logger.info(`Updated existing Core Sustainability Certificate path (ID: ${pathId})`);
      } else {
        const inserted = await tx
          .insert(learningPathsTable)
          .values({
            slug: PATH_SLUG,
            title: "Core Sustainability Certificate",
            description: "Build practical sustainability knowledge across everyday workplace habits, responsible operations, ESG and environmental compliance, then complete the cumulative certification assessment.",
            audience: "All employees",
            level: "Core Curriculum",
            providerLabel: "EcoLearnHub Recommended",
            isSystemManaged: true,
            status: "active",
            icon: "route",
            estimatedDurationMinutes: totalDuration,
          })
          .returning({ id: learningPathsTable.id });
        pathId = inserted[0]!.id;
        logger.info(`Created Core Sustainability Certificate path (ID: ${pathId})`);
      }

      // 3. Attach courses safely (reconcile courses transactionally)
      // Clear existing associations just to ensure correct order/no duplicates
      await tx
        .delete(learningPathCoursesTable)
        .where(eq(learningPathCoursesTable.pathId, pathId));

      for (let i = 0; i < resolvedCourses.length; i++) {
        const c = resolvedCourses[i]!;

        await tx.insert(learningPathCoursesTable).values({
          pathId: pathId,
          courseId: c.id,
          position: i + 1,
          orderIndex: i, // maintain deprecated field for compatibility
          isRequired: true,
        });
      }

      logger.info(`Successfully linked 12 courses to the Core Sustainability Certificate.`);
    });
  } catch (err) {
    logger.error({ err }, "Failed to seed Core Sustainability Certificate path. Transaction rolled back.");
    throw err;
  }
}
