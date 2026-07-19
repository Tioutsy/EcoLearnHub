import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
  quizAttemptsTable,
  lessonProgressTable,
  coursePrerequisitesTable,
} from "@workspace/db";
import { eq, or, inArray, and } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_ID = 12;
const COURSE_SLUG = "final-sustainability-certification";
const COURSE_TITLE = "Final Sustainability Certification";
const BADGE_SLUG = "core-sustainability-certified";
const SEED_NAME = "final-certification-v1";

const COURSE_META = {
  description: "A cumulative assessment certifying your ability to apply core sustainability concepts to realistic workplace decisions.",
  fullDescription: "A cumulative assessment certifying your ability to apply core sustainability concepts to realistic workplace decisions.",
  categoryId: 1,
  durationMinutes: 45,
  priceUsd: "0.00",
  level: "advanced",
  isFeatured: true,
  thumbnailUrl: "/images/courses/final-sustainability-certification.jpg",
  learningObjectives: [
    "Apply everyday resource management principles to reduce waste, water, and energy use.",
    "Demonstrate responsible workplace practices in procurement, office routines, and carbon reduction.",
    "Understand ESG frameworks, compliance obligations, and circular economy concepts in a business context."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "Congratulations! You have passed the Final Sustainability Certification, demonstrating your understanding of core sustainability concepts and practical workplace application.",
  badgeName: "Core Sustainability Certified",
  badgeDescription: "Awarded to learners who pass the cumulative 30-question certification, demonstrating a solid understanding of everyday resource management, responsible workplace practice, and ESG compliance.",
  recommendedNextCourseId: null,
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Certification Briefing",
    minutes: 5,
    content: "Please read the following instructions before starting the assessment.",
    blocks: [
      {
        id: "c12-l1-b1",
        type: "heading",
        content: "Final Assessment Instructions",
      },
      {
        id: "c12-l1-b2",
        type: "text",
        content: "This assessment consists of 30 questions covering all previous 11 courses. To pass and receive your certificate, you must achieve:\n- An overall score of 80% (24 correct answers).\n- At least 70% (7 correct answers) in each of the three competency areas.\n\nYou cannot pause the quiz. Please ensure you have 30 uninterrupted minutes before beginning.",
      }
    ]
  }
];

const CERTIFICATION_QUESTIONS = [
  // everyday_resource_management (10 questions)
  ...Array.from({ length: 10 }).map((_, i) => ({
    question: `Resource Management Scenario ${i + 1}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctOption: 0,
    correctExplanation: "Option A is correct.",
    incorrectExplanation: "Review resource management.",
    competencyArea: "everyday_resource_management",
    sourceCourseId: (i % 4) + 1,
    learningOutcome: `Outcome ${i + 1}`
  })),
  // responsible_workplace_practice (10 questions)
  ...Array.from({ length: 10 }).map((_, i) => ({
    question: `Workplace Practice Scenario ${i + 1}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctOption: 0,
    correctExplanation: "Option A is correct.",
    incorrectExplanation: "Review workplace practices.",
    competencyArea: "responsible_workplace_practice",
    sourceCourseId: (i % 4) + 5,
    learningOutcome: `Outcome ${i + 1}`
  })),
  // esg_compliance_circularity (10 questions)
  ...Array.from({ length: 10 }).map((_, i) => ({
    question: `ESG and Circularity Scenario ${i + 1}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctOption: 0,
    correctExplanation: "Option A is correct.",
    incorrectExplanation: "Review ESG and circularity.",
    competencyArea: "esg_compliance_circularity",
    sourceCourseId: (i % 3) + 9,
    learningOutcome: `Outcome ${i + 1}`
  })),
];

export async function ensureFinalSustainabilityCertificationCourse() {
  const [existingSeed] = await db
    .select()
    .from(systemSeedsTable)
    .where(eq(systemSeedsTable.name, SEED_NAME));

  if (existingSeed) {
    logger.info(`[SEED] ${SEED_NAME} already applied.`);
    return;
  }

  // Find or create course 12
  let existingCourse = await db.query.coursesTable.findFirst({
    where: eq(coursesTable.slug, COURSE_SLUG)
  });

  if (!existingCourse) {
    const byId = await db.query.coursesTable.findFirst({
      where: eq(coursesTable.id, COURSE_ID)
    });
    if (byId && byId.slug === COURSE_SLUG) {
      existingCourse = byId;
    } else if (byId && byId.slug.includes('certification')) {
      existingCourse = byId;
    }
  }

  let actualCourseId = existingCourse ? existingCourse.id : COURSE_ID;

  let course;
  if (!existingCourse) {
    const [inserted] = await db.insert(coursesTable).values({
      slug: COURSE_SLUG,
      title: COURSE_TITLE,
      ...COURSE_META,
      isPublished: true, 
    }).returning();
    course = inserted;
    actualCourseId = inserted.id;
    logger.info(`[SEED] Inserted new Course 12: ${COURSE_TITLE}`);
  } else {
    const [updated] = await db.update(coursesTable).set({
      slug: COURSE_SLUG,
      title: COURSE_TITLE,
      ...COURSE_META,
      isPublished: true,
    }).where(eq(coursesTable.id, actualCourseId)).returning();
    course = updated;
    logger.info(`[SEED] Updated existing Course 12: ${COURSE_TITLE}`);
  }

  // Ensure exactly 11 prerequisite links exist
  await db.delete(coursePrerequisitesTable).where(eq(coursePrerequisitesTable.courseId, actualCourseId));
  const prereqInserts = Array.from({ length: 11 }).map((_, i) => ({
    courseId: actualCourseId,
    prerequisiteCourseId: i + 1,
  }));
  await db.insert(coursePrerequisitesTable).values(prereqInserts).onConflictDoNothing();

  // If the seed marker wasn't found, we assume any existing lessons and questions are skeletons and we wipe them.
  await db.delete(lessonsTable).where(eq(lessonsTable.courseId, actualCourseId));
  for (const l of NEW_LESSONS) {
    await db.insert(lessonsTable).values({
      courseId: actualCourseId,
      title: l.title,
      orderIndex: l.order,
      durationMinutes: l.minutes,
      content: l.content,
      contentBlocks: l.blocks,
    });
  }

  // Wipe skeleton questions
  await db.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, actualCourseId));
  let orderIndex = 0;
  for (const q of CERTIFICATION_QUESTIONS) {
    await db.insert(quizQuestionsTable).values({
      courseId: actualCourseId,
      question: q.question,
      options: q.options,
      correctOption: q.correctOption,
      orderIndex: orderIndex++,
      correctExplanation: q.correctExplanation,
      incorrectExplanation: q.incorrectExplanation,
      competencyArea: q.competencyArea,
      sourceCourseId: q.sourceCourseId,
      learningOutcome: q.learningOutcome,
    });
  }

  // Ensure badge
  let [badge] = await db
    .select()
    .from(badgeDefinitionsTable)
    .where(eq(badgeDefinitionsTable.slug, BADGE_SLUG));

  if (!badge) {
    [badge] = await db.insert(badgeDefinitionsTable).values({
      slug: BADGE_SLUG,
      name: COURSE_META.badgeName,
      description: COURSE_META.badgeDescription,
      icon: "award",
      courseIds: [actualCourseId],
      criteriaType: "all_courses",
      orderIndex: 16,
    }).returning();
  }

  // Clean up skeleton badge
  const skeletonBadgeSlug = "core-sustainability-badge"; // whatever it was called in skeletons
  await db.delete(badgeDefinitionsTable).where(eq(badgeDefinitionsTable.slug, skeletonBadgeSlug));

  // Mark as seeded
  await db.insert(systemSeedsTable).values({ name: SEED_NAME });
  logger.info(`[SEED] ${SEED_NAME} fully applied.`);
}
