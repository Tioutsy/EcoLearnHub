import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
} from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { logger } from "./logger";

// Idempotent bootstrap for the "Waste Sorting and the Mauritian Bin System"
// interactive course. This course replaces a simpler legacy course of the same
// topic, so it adopts the existing row (by slug, or by one of its known legacy
// titles) and upgrades it in place: a durable slug, an 80 percent pass mark, six
// rich modules, and a twenty question final assessment. It runs on every server
// boot and converges the content deterministically, so development and
// production stay in sync.
//
// Race safety: the underlying tables have unique constraints (courses.slug,
// lessons (course_id, order_index), quiz_questions (course_id, order_index),
// badge_definitions.slug). Inserts use onConflictDoUpdate so concurrent cold
// starts cannot create duplicates.
//
// The rich interactive content (scenarios, bin sorting, knowledge checks, the
// pledge) lives in the web app at
// artifacts/ecolearn/src/pages/learn/waste-sorting/content.ts and is matched to
// these lesson rows by order.

const COURSE_SLUG = "waste-sorting";
const COURSE_TITLE = "Waste Sorting and the Mauritian Bin System";
const LEGACY_TITLES = [
  "Waste Sorting & the Mauritian Bin System",
  "Waste Sorting and the Mauritian Bin System",
];
const BADGE_SLUG = "bin-expert";

const COURSE = {
  description:
    "A practical, interactive guide to sorting waste the right way in Mauritius. In about an hour you will learn the four waste categories, the colour bin system, the most common sorting mistakes, and how to cut waste before it is even created. Full of local examples and hands on activities.",
  categoryId: 1,
  durationMinutes: 60,
  learningObjectives: [
    "Understand why waste sorting matters for a small island like Mauritius",
    "Recognise the four main categories of waste",
    "Match each type of waste to the correct colour bin",
    "Avoid the most common sorting mistakes and contamination",
    "Reduce waste at home, at work, and in public spaces",
  ],
  includesCertificate: true,
  passingScore: 80,
  isPublished: true,
};

const LESSONS = [
  { order: 1, title: "Why Waste Sorting Matters", minutes: 8, content: "On a small island, waste has to go somewhere, and most of it is buried at the Mare Chicose landfill. This module explains why sorting is the first step to keeping materials in use and out of the ground." },
  { order: 2, title: "Understanding Waste Categories", minutes: 10, content: "Most waste falls into four groups: recyclable, organic, residual, and special. This module helps you tell them apart with hands on practice." },
  { order: 3, title: "The Mauritian Bin System", minutes: 12, content: "A simple colour system makes sorting easy: green for organic, yellow for recyclables, black for general waste, and special points for batteries and electronics. Practice putting the right item in the right bin." },
  { order: 4, title: "Common Sorting Mistakes", minutes: 10, content: "Small mistakes like food residue or mixed items can spoil a whole bin of recycling. Learn to spot and avoid contamination." },
  { order: 5, title: "Waste Sorting at Home and Work", minutes: 10, content: "Sorting works best as a daily habit in every setting. See how it fits at home, in the office, and in public spaces." },
  { order: 6, title: "Reducing Waste Before Sorting", minutes: 10, content: "The best waste is the waste we never create. Learn the waste hierarchy and make your personal pledge to reduce, reuse, and sort." },
];

const QUIZ = [
  { order: 1, question: "Where does most household waste in Mauritius end up?", options: ["The Mare Chicose landfill", "A recycling plant in every village", "Exported to other countries", "Burned out at sea"], correct: 0 },
  { order: 2, question: "Why is waste sorting so important on a small island like Mauritius?", options: ["It has no real effect", "Landfill space is limited, so recovering materials matters", "It only matters for tourists", "It slows down every business"], correct: 1 },
  { order: 3, question: "Which of these is a recyclable material?", options: ["A banana peel", "A used paper tissue", "A clean plastic bottle", "A used battery"], correct: 2 },
  { order: 4, question: "Which item belongs in the organic category?", options: ["A glass jar", "Fruit and vegetable peels", "A plastic container", "A light bulb"], correct: 1 },
  { order: 5, question: "A used paper tissue should be treated as:", options: ["Recyclable waste", "Organic waste", "Residual or general waste", "Special waste"], correct: 2 },
  { order: 6, question: "Batteries and electronics are examples of:", options: ["Recyclable waste", "Organic waste", "Residual waste", "Special waste"], correct: 3 },
  { order: 7, question: "In the colour bin system used here, the green bin is for:", options: ["General waste", "Organic and food waste", "Glass only", "Batteries"], correct: 1 },
  { order: 8, question: "The yellow bin is for:", options: ["Clean recyclable materials", "Food scraps", "Hazardous waste", "Garden cuttings"], correct: 0 },
  { order: 9, question: "The black bin is for:", options: ["Clean recyclables", "Organic waste", "General non recyclable waste", "Batteries and paint"], correct: 2 },
  { order: 10, question: "Where should used batteries go?", options: ["The green bin", "The yellow bin", "The black bin", "A special collection point"], correct: 3 },
  { order: 11, question: "A clean glass bottle should go in the:", options: ["Green bin", "Yellow bin", "Black bin", "Special point"], correct: 1 },
  { order: 12, question: "A food soiled pizza box should go in the:", options: ["Yellow recycling bin", "Green organic bin", "Black general waste bin", "Special collection point"], correct: 2 },
  { order: 13, question: "What is contamination of recycling?", options: ["Sorting waste too carefully", "Mixing dirty or non recyclable items into the recycling", "Using too many bins", "Rinsing containers"], correct: 1 },
  { order: 14, question: "Why does contamination matter so much?", options: ["It only looks untidy", "It can spoil a whole batch of recycling", "It has no effect", "It only matters for special waste"], correct: 1 },
  { order: 15, question: "Before recycling a yoghurt pot you should:", options: ["Leave the food in it", "Empty and rinse it", "Add the spoon and lid inside", "Put it in the green bin"], correct: 1 },
  { order: 16, question: "A good first step to set up sorting at work is to:", options: ["Hide the bins away", "Use one bin for everything", "Place clearly labelled bins together as a station", "Wait for a yearly clean up"], correct: 2 },
  { order: 17, question: "At a community event, the responsible habit is to:", options: ["Leave waste in a pile", "Burn the rubbish", "Use the correct bins and avoid littering", "Mix everything together"], correct: 2 },
  { order: 18, question: "Which step of the waste hierarchy is most preferred?", options: ["Dispose in a landfill", "Recover energy", "Refuse and reduce", "Recycle"], correct: 2 },
  { order: 19, question: "Composting food scraps helps mainly by:", options: ["Filling the landfill faster", "Keeping organic waste out of the landfill", "Making recycling dirty", "Using more plastic"], correct: 1 },
  { order: 20, question: "The single most useful habit after this course is to:", options: ["Wait for someone else to sort", "Put everything in one bin", "Check which bin each item belongs in and sort correctly", "Stop recycling altogether"], correct: 2 },
];

const BADGE = {
  name: "Bin Expert",
  description: "Awarded for completing the Waste Sorting course and making a pledge to sort and reduce waste.",
  icon: "recycle",
  criteriaType: "all_courses",
  threshold: 0,
  orderIndex: 7,
};

// Resolve the course id, adopting the legacy row if present. Race-safe via the
// unique constraint on courses.slug.
async function resolveCourseId(): Promise<number> {
  const bySlug = await db
    .select({ id: coursesTable.id })
    .from(coursesTable)
    .where(eq(coursesTable.slug, COURSE_SLUG))
    .limit(1);
  if (bySlug.length > 0) {
    const id = bySlug[0]!.id;
    await db
      .update(coursesTable)
      .set({
        title: COURSE_TITLE,
        description: COURSE.description,
        durationMinutes: COURSE.durationMinutes,
        learningObjectives: COURSE.learningObjectives,
        includesCertificate: COURSE.includesCertificate,
        passingScore: COURSE.passingScore,
        isPublished: COURSE.isPublished,
      })
      .where(eq(coursesTable.id, id));
    return id;
  }

  // Legacy row created before the slug column or before this richer rebuild:
  // adopt it by title and upgrade it in place.
  const byTitle = await db
    .select({ id: coursesTable.id })
    .from(coursesTable)
    .where(inArray(coursesTable.title, LEGACY_TITLES))
    .limit(1);
  if (byTitle.length > 0) {
    const id = byTitle[0]!.id;
    await db
      .update(coursesTable)
      .set({
        slug: COURSE_SLUG,
        title: COURSE_TITLE,
        description: COURSE.description,
        durationMinutes: COURSE.durationMinutes,
        learningObjectives: COURSE.learningObjectives,
        includesCertificate: COURSE.includesCertificate,
        passingScore: COURSE.passingScore,
        isPublished: COURSE.isPublished,
      })
      .where(eq(coursesTable.id, id));
    return id;
  }

  const inserted = await db
    .insert(coursesTable)
    .values({
      title: COURSE_TITLE,
      slug: COURSE_SLUG,
      description: COURSE.description,
      categoryId: COURSE.categoryId,
      durationMinutes: COURSE.durationMinutes,
      priceUsd: "1400.00",
      level: "beginner",
      isFeatured: false,
      learningObjectives: COURSE.learningObjectives,
      includesCertificate: COURSE.includesCertificate,
      passingScore: COURSE.passingScore,
      isPublished: true,
      status: "published",
    })
    .onConflictDoNothing({ target: coursesTable.slug })
    .returning({ id: coursesTable.id });
  if (inserted.length > 0) return inserted[0]!.id;

  const raced = await db
    .select({ id: coursesTable.id })
    .from(coursesTable)
    .where(eq(coursesTable.slug, COURSE_SLUG))
    .limit(1);
  if (raced.length > 0) return raced[0]!.id;
  throw new Error("Could not resolve Waste Sorting course id after insert");
}

export async function ensureWasteSortingCourse(): Promise<void> {
  try {
    const courseId = await resolveCourseId();

    for (const lesson of LESSONS) {
      await db
        .insert(lessonsTable)
        .values({
          courseId,
          title: lesson.title,
          orderIndex: lesson.order,
          durationMinutes: lesson.minutes,
          content: lesson.content,
        })
        .onConflictDoUpdate({
          target: [lessonsTable.courseId, lessonsTable.orderIndex],
          set: {
            title: lesson.title,
            durationMinutes: lesson.minutes,
            content: lesson.content,
          },
        });
    }

    for (const q of QUIZ) {
      await db
        .insert(quizQuestionsTable)
        .values({
          courseId,
          question: q.question,
          options: q.options,
          correctOption: q.correct,
          orderIndex: q.order,
        })
        .onConflictDoUpdate({
          target: [quizQuestionsTable.courseId, quizQuestionsTable.orderIndex],
          set: {
            question: q.question,
            options: q.options,
            correctOption: q.correct,
          },
        });
    }

    await db
      .insert(badgeDefinitionsTable)
      .values({
        slug: BADGE_SLUG,
        name: BADGE.name,
        description: BADGE.description,
        icon: BADGE.icon,
        criteriaType: BADGE.criteriaType,
        threshold: BADGE.threshold,
        courseIds: [courseId],
        orderIndex: BADGE.orderIndex,
      })
      .onConflictDoUpdate({
        target: badgeDefinitionsTable.slug,
        set: { courseIds: [courseId] },
      });

    logger.info({ courseId, slug: COURSE_SLUG }, "Waste Sorting course ready");
  } catch (err) {
    // Never let a content-seed failure prevent the server from starting.
    logger.error({ err }, "Failed to ensure Waste Sorting course content");
  }
}
