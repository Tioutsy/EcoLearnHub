import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

// Idempotent bootstrap for the "Sustainability Foundations" interactive course.
// Runs on server startup so the required course content exists in whatever
// database this server connects to (development and production alike). It keys
// off the course slug and only creates rows that are missing, so it is safe to
// run on every boot and never overwrites authored data.
//
// Race safety: the underlying tables have unique constraints (courses.slug,
// lessons (course_id, order_index), quiz_questions (course_id, order_index),
// badge_definitions.slug). Every insert uses onConflictDoNothing/onConflictDoUpdate
// so concurrent cold starts (e.g. multiple autoscale instances) cannot create
// duplicates.
//
// The rich interactive content (scenarios, knowledge checks, commitments) lives
// in the web app at artifacts/ecolearn/src/pages/learn/foundations/content.ts
// and is matched to these lesson rows by order. The standalone seed script at
// lib/db/seed-foundations.mjs mirrors this data for manual seeding.

const COURSE_SLUG = "sustainability-foundations";
const COURSE_TITLE = "Sustainability Foundations";
const BADGE_SLUG = "sustainability-starter";

const COURSE = {
  description:
    "A short, practical introduction to sustainability for every employee. In about 20 minutes you will learn what sustainability really means, why it matters for Mauritius, and the simple actions you can take at work every day. No jargon, just clear ideas and real local examples.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "1400.00",
  level: "beginner",
  isFeatured: true,
  thumbnailUrl: "/images/courses/sustainability-foundations.png",
  learningObjectives: [
    "Understand what sustainability means in everyday terms",
    "See why sustainability matters for people, business, and Mauritius",
    "Recognise local environmental realities and your part in them",
    "Choose practical actions you can take at work",
    "Make a personal sustainability commitment you can act on",
  ],
  includesCertificate: true,
  passingScore: 80,
  isPublished: true,
};

const LESSONS = [
  { order: 0, title: "Welcome to Sustainability", minutes: 3, content: "Sustainability means meeting our needs today without taking away from future generations. This lesson introduces the idea in plain terms." },
  { order: 1, title: "Why Sustainability Matters", minutes: 4, content: "Sustainability rests on three connected ideas: caring for the environment, supporting people, and keeping business healthy." },
  { order: 2, title: "Sustainability in Mauritius", minutes: 4, content: "Mauritius has limited land for waste, growing plastic pollution, and pressure on fresh water. Local realities shape why this matters here." },
  { order: 3, title: "Your Role as an Employee", minutes: 3, content: "Every role can help, from office staff and receptionists to housekeepers and technicians. Small actions add up." },
  { order: 4, title: "Everyday Sustainability Actions", minutes: 3, content: "Small daily choices around energy, water, waste, paper, and travel make a real difference at work." },
  { order: 5, title: "Your Sustainability Commitment", minutes: 3, content: "Knowledge becomes change when you commit to act. In this final lesson you choose practical commitments to carry forward." },
];

const QUIZ = [
  { order: 0, question: "What does sustainability mean in simple terms?", options: ["Using resources today in a way that still leaves enough for future generations", "Spending as much as possible right now", "A concern only for large factories", "A rule that applies only to government offices"], correct: 0 },
  { order: 1, question: "Which statement best describes the pillars of sustainability?", options: ["Only making more profit", "Balancing environmental, social, and economic needs", "Ignoring community needs", "Using more energy every year"], correct: 1 },
  { order: 2, question: "Why does sustainability matter for a business in Mauritius?", options: ["It has no effect on costs", "It only matters for tourists", "It protects the island resources, lowers costs, and builds reputation", "It slows down every company"], correct: 2 },
  { order: 3, question: "Where does most household waste in Mauritius end up?", options: ["The Mare Chicose landfill", "The sea near Port Louis", "A recycling plant in every village", "Reunion Island"], correct: 0 },
  { order: 4, question: "Which is a real environmental challenge for Mauritius?", options: ["Too much unused farmland", "No coastline to protect", "Unlimited landfill space", "Limited land for waste and pressure on fresh water"], correct: 3 },
  { order: 5, question: "As an office employee, a simple sustainable action is to:", options: ["Leave the air conditioning on overnight", "Switch off lights and screens when leaving a room", "Print every email", "Keep taps running while working"], correct: 1 },
  { order: 6, question: "How can a housekeeper or technician support sustainability?", options: ["Report leaks quickly and use cleaning products carefully", "Ignore dripping taps", "Throw all waste into one bin", "Leave equipment running when not needed"], correct: 0 },
  { order: 7, question: "You find a plastic bottle in the general waste bin. What is best?", options: ["Leave it, it does not matter", "Throw more waste on top", "Move it to the recycling stream where available", "Take it home only"], correct: 2 },
  { order: 8, question: "Which everyday habit saves water at work?", options: ["Let taps run during breaks", "Turn off the tap when it is not in use and report leaks", "Wash single items under running water for a long time", "Ignore a running toilet"], correct: 1 },
  { order: 9, question: "What is the most useful first step after this course?", options: ["Wait for someone else to start", "Do nothing until next year", "Assume sustainability is not your job", "Choose one or two practical commitments and act on them"], correct: 3 },
];

const BADGE = {
  name: "Sustainability Starter",
  description: "Awarded for completing the Sustainability Foundations course and making your first workplace commitment.",
  icon: "sprout",
  criteriaType: "all_courses",
  threshold: 0,
  orderIndex: 6,
};

// Resolve the course id, creating or migrating the row as needed. Race-safe via
// the unique constraint on courses.slug.
async function resolveCourseId(): Promise<number> {
  const bySlug = await db
    .select({ id: coursesTable.id })
    .from(coursesTable)
    .where(eq(coursesTable.slug, COURSE_SLUG))
    .limit(1);
  if (bySlug.length > 0) return bySlug[0]!.id;

  // Legacy row created before the slug column existed: adopt it by setting slug.
  const byTitle = await db
    .select({ id: coursesTable.id })
    .from(coursesTable)
    .where(eq(coursesTable.title, COURSE_TITLE))
    .limit(1);
  if (byTitle.length > 0) {
    const id = byTitle[0]!.id;
    await db
      .update(coursesTable)
      .set({ slug: COURSE_SLUG, passingScore: COURSE.passingScore })
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
      priceUsd: COURSE.priceUsd,
      level: COURSE.level,
      isFeatured: COURSE.isFeatured,
      thumbnailUrl: COURSE.thumbnailUrl,
      learningObjectives: COURSE.learningObjectives,
      includesCertificate: COURSE.includesCertificate,
      passingScore: COURSE.passingScore,
      isPublished: COURSE.isPublished,
    })
    .onConflictDoNothing({ target: coursesTable.slug })
    .returning({ id: coursesTable.id });
  if (inserted.length > 0) return inserted[0]!.id;

  // A concurrent boot won the insert; read the row it created.
  const raced = await db
    .select({ id: coursesTable.id })
    .from(coursesTable)
    .where(eq(coursesTable.slug, COURSE_SLUG))
    .limit(1);
  if (raced.length > 0) return raced[0]!.id;
  throw new Error("Could not resolve Foundations course id after insert");
}

export async function ensureFoundationsCourse(): Promise<void> {
  try {
    const courseId = await resolveCourseId();

    await db
      .insert(lessonsTable)
      .values(
        LESSONS.map((lesson) => ({
          courseId,
          title: lesson.title,
          orderIndex: lesson.order,
          durationMinutes: lesson.minutes,
          content: lesson.content,
        })),
      )
      .onConflictDoNothing({
        target: [lessonsTable.courseId, lessonsTable.orderIndex],
      });

    await db
      .insert(quizQuestionsTable)
      .values(
        QUIZ.map((q) => ({
          courseId,
          question: q.question,
          options: q.options,
          correctOption: q.correct,
          orderIndex: q.order,
        })),
      )
      .onConflictDoNothing({
        target: [quizQuestionsTable.courseId, quizQuestionsTable.orderIndex],
      });

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

    logger.info({ courseId, slug: COURSE_SLUG }, "Foundations course ready");
  } catch (err) {
    // Never let a content-seed failure prevent the server from starting.
    logger.error({ err }, "Failed to ensure Foundations course content");
  }
}
