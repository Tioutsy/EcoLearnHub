import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_SLUG = "sustainability-foundations";
const COURSE_TITLE = "Sustainability Foundations";
const BADGE_SLUG = "sustainability-starter";
const SEED_NAME = "sustainability-foundations-pilot-v1";

const COURSE = {
  description:
    "A short, practical introduction to sustainability for every employee. In about 20 minutes you will learn what sustainability really means, why it matters for Mauritius, and the simple actions you can take at work every day. No jargon, just clear ideas and real local examples.",
  fullDescription:
    "This pilot course introduces the foundational concepts of environmental sustainability, corporate responsibility, and practical individual choices. Tailored specifically for Mauritian workplaces, it highlights the local island realities such as the Mare Chicose landfill and fresh water pressures.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "1400.00",
  level: "beginner",
  isFeatured: true,
  thumbnailUrl: "/images/courses/sustainability-foundations.png",
  learningObjectives: [
    "Understand what sustainability means in everyday terms",
    "See why sustainability matters for Mauritius and the workplace",
    "Choose practical actions around waste, water, and energy",
    "Make a personal workplace sustainability commitment"
  ],
  includesCertificate: true,
  passingScore: 80,
  status: "review", // Remain in review status for manual approval
  badgeName: "Sustainability Starter",
  badgeDescription: "Awarded for completing the Sustainability Foundations course and making a personal workplace commitment."
};

const LESSONS = [
  {
    order: 0,
    title: "Welcome to Sustainability",
    minutes: 3,
    content: "An introduction to sustainability in plain terms.",
    blocks: [
      { id: "wel-h1", type: "heading", position: 1, headingText: "What is Sustainability?" },
      { id: "wel-t1", type: "short_text", position: 2, bodyText: "Sustainability is a big word for a simple idea. It means meeting our needs today without taking away from what future generations will need tomorrow." },
      { id: "wel-k1", type: "key_message", position: 3, bodyText: "Sustainability is for everyone, regardless of role. Small choices add up to protect Mauritius." },
      {
        id: "wel-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Try this workplace decision scenario:",
        decisionPrompt: "At the end of the day, you see that the empty staff room has lights left on, screens active, and the AC running. What do you do?",
        decisionChoices: [
          { label: "Switch off the lights, screens, and AC", correct: true, feedback: "Excellent. Small daily habits save energy and carbon emissions." },
          { label: "Leave them on in case someone returns", correct: false, feedback: "It is better to switch them off when a room is vacant." },
          { label: "Switch off only the lights", correct: false, feedback: "A good start, but screens and AC use significant power too." }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Why Sustainability Matters",
    minutes: 4,
    content: "Understanding the three pillars of sustainability.",
    blocks: [
      { id: "why-h1", type: "heading", position: 1, headingText: "The Three Pillars" },
      { id: "why-t1", type: "short_text", position: 2, bodyText: "Sustainability rests on three connected pillars: Environment, People (Social), and Business (Economic)." },
      { id: "why-w1", type: "workplace_example", position: 3, bodyText: "For example, reducing paper use saves trees (Environment), saves printing costs (Business), and simplifies document filing for staff (People)." }
    ]
  },
  {
    order: 2,
    title: "Sustainability in Mauritius",
    minutes: 4,
    content: "Local challenges on our small island.",
    blocks: [
      { id: "mau-h1", type: "heading", position: 1, headingText: "Mauritian Island Realities" },
      { id: "mau-t1", type: "short_text", position: 2, bodyText: "Living on an island means our choices are direct. We must protect our fresh water and manage waste carefully." },
      { id: "mau-m1", type: "mauritian_example", position: 3, bodyText: "The Mare Chicose landfill is the single landfill site in Mauritius, and fresh water resources are under pressure during the dry season." }
    ]
  },
  {
    order: 3,
    title: "Your Role as an Employee",
    minutes: 3,
    content: "Every role plays a part.",
    blocks: [
      { id: "rol-h1", type: "heading", position: 1, headingText: "Actions in the Workplace" },
      { id: "rol-p1", type: "practical_action", position: 2, bodyText: "Everyone can make a difference. Technicians fix leaks, office staff print double-sided, and managers encourage green ideas." }
    ]
  },
  {
    order: 4,
    title: "Everyday Sustainability Actions",
    minutes: 3,
    content: "Practical actions on energy, waste, and water.",
    blocks: [
      { id: "act-h1", type: "heading", position: 1, headingText: "Simple Habits" },
      {
        id: "act-d1",
        type: "decision_scenario",
        position: 2,
        decisionIntro: "Try this quick choice:",
        decisionPrompt: "You notice a tap in the staff kitchen is dripping. What is your response?",
        decisionChoices: [
          { label: "Turn it off tightly and report it to maintenance", correct: true, feedback: "Perfect. Proactive dripping tap fixes save thousands of liters of water." },
          { label: "Ignore it, it is just a minor drip", correct: false, feedback: "Even a small drip wastes significant fresh water on an island." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Sustainability Commitment",
    minutes: 3,
    content: "Choosing your action plan.",
    blocks: [
      { id: "com-h1", type: "heading", position: 1, headingText: "Workplace Commitment" },
      { id: "com-t1", type: "reflection", position: 2, bodyText: "What is one simple habit you will commit to practice starting this week?" },
      {
        id: "com-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select one commitment to register as a learning output:",
        commitmentOptions: [
          { value: "reduce-waste", label: "Reduce waste", description: "Use less, reuse, and sort rubbish properly." },
          { value: "save-water", label: "Save water", description: "Turn off taps and report leaks." },
          { value: "save-energy", label: "Save energy", description: "Switch off lights and AC when not needed." }
        ]
      }
    ]
  }
];

const QUIZ = [
  {
    order: 0,
    question: "What does sustainability mean in simple terms?",
    options: [
      "Using resources today in a way that still leaves enough for future generations",
      "Spending as much as possible right now",
      "A concern only for large factories",
      "A rule that applies only to government offices"
    ],
    correct: 0,
    correctExplanation: "Correct! Sustainability balances current resource use with the needs of the future.",
    incorrectExplanation: "Incorrect. The main idea of sustainability is balancing current and future needs.",
    optionFeedback: [
      "Ideal choice. Balanced resource use.",
      "Incorrect. This depletes resources.",
      "Incorrect. Every individual can act.",
      "Incorrect. Applies to all organisations."
    ]
  },
  {
    order: 1,
    question: "Which statement best describes the pillars of sustainability?",
    options: [
      "Only making more profit",
      "Balancing environmental, social, and economic needs",
      "Ignoring community needs",
      "Using more energy every year"
    ],
    correct: 1,
    correctExplanation: "Correct! The three pillars are Environment, Social (People), and Economic (Business).",
    incorrectExplanation: "Incorrect. Sustainability requires balancing all three pillars.",
    optionFeedback: [
      "Incorrect. This focuses solely on economics.",
      "Perfect. Balanced pillars approach.",
      "Incorrect. Ignores the social pillar.",
      "Incorrect. This increases environmental impact."
    ]
  },
  {
    order: 2,
    question: "A company that acts responsibly usually benefits by:",
    options: [
      "Losing all of its customers",
      "Building trust and saving resource costs over time",
      "Having nothing to gain",
      "Stopping all of its operations"
    ],
    correct: 1,
    correctExplanation: "Correct! Responsible actions reduce waste, build customer trust, and save operational costs.",
    incorrectExplanation: "Incorrect. Companies gain trust and cost savings through sustainability.",
    optionFeedback: [
      "Incorrect.",
      "Correct. Long-term trust and savings.",
      "Incorrect.",
      "Incorrect."
    ]
  }
];

const BADGE = {
  name: "Sustainability Starter",
  description: "Awarded for completing the Sustainability Foundations course and making your first workplace commitment.",
  icon: "sprout",
  criteriaType: "all_courses",
  threshold: 0,
  orderIndex: 6
};

async function resolveCourseId(): Promise<number> {
  const bySlug = await db
    .select({ id: coursesTable.id })
    .from(coursesTable)
    .where(eq(coursesTable.slug, COURSE_SLUG))
    .limit(1);
  if (bySlug.length > 0) return bySlug[0]!.id;

  const inserted = await db
    .insert(coursesTable)
    .values({
      title: COURSE_TITLE,
      slug: COURSE_SLUG,
      description: COURSE.description,
      fullDescription: COURSE.fullDescription,
      categoryId: COURSE.categoryId,
      durationMinutes: COURSE.durationMinutes,
      priceUsd: COURSE.priceUsd,
      level: COURSE.level,
      isFeatured: COURSE.isFeatured,
      thumbnailUrl: COURSE.thumbnailUrl,
      learningObjectives: COURSE.learningObjectives,
      includesCertificate: COURSE.includesCertificate,
      passingScore: COURSE.passingScore,
      isPublished: false, // Compatibility
      status: COURSE.status,
      badgeName: COURSE.badgeName,
      badgeDescription: COURSE.badgeDescription
    })
    .returning({ id: coursesTable.id });
  return inserted[0]!.id;
}

export async function ensureFoundationsCourse(): Promise<void> {
  try {
    // 1. Check if the seed has already run
    const [existingSeed] = await db
      .select()
      .from(systemSeedsTable)
      .where(eq(systemSeedsTable.name, SEED_NAME))
      .limit(1);

    if (existingSeed) {
      logger.info({ seed: SEED_NAME }, "Sustainability Foundations pilot seed already run. Skipping...");
      return;
    }

    const courseId = await resolveCourseId();

    // 2. Safely seed lessons (only when they do not exist)
    const existingLessons = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, courseId));

    if (existingLessons.length === 0) {
      await db.insert(lessonsTable).values(
        LESSONS.map((lesson) => ({
          courseId,
          title: lesson.title,
          orderIndex: lesson.order,
          durationMinutes: lesson.minutes,
          content: lesson.content,
          contentBlocks: lesson.blocks,
          isArchived: false
        }))
      );
      logger.info({ count: LESSONS.length }, "Seeded new course lessons with content blocks");
    } else {
      logger.info("Course lessons already present, skipping seeding to preserve admin edits.");
    }

    // 3. Safely seed quiz questions
    const existingQuestions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, courseId));

    if (existingQuestions.length === 0) {
      await db.insert(quizQuestionsTable).values(
        QUIZ.map((q) => ({
          courseId,
          question: q.question,
          options: q.options,
          correctOption: q.correct,
          orderIndex: q.order,
          correctExplanation: q.correctExplanation,
          incorrectExplanation: q.incorrectExplanation,
          optionFeedback: q.optionFeedback,
          isArchived: false
        }))
      );
      logger.info({ count: QUIZ.length }, "Seeded new quiz questions with feedback explanations");
    } else {
      logger.info("Quiz questions already present, skipping seeding to preserve admin edits.");
    }

    // 4. Seed Badge Definition
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
        orderIndex: BADGE.orderIndex
      })
      .onConflictDoUpdate({
        target: badgeDefinitionsTable.slug,
        set: { courseIds: [courseId] }
      });

    // 5. Record seed run
    await db.insert(systemSeedsTable).values({
      name: SEED_NAME,
      version: 1
    });

    logger.info({ seed: SEED_NAME }, "Sustainability Foundations pilot seed completed successfully!");
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent pilot course seeding");
  }
}
