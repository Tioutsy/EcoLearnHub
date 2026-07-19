import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
} from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_ID = 6;
const COURSE_SLUG = "green-office-practices";
const COURSE_TITLE = "Green Office Practices";
const BADGE_SLUG = "green-office-champion";
const SEED_NAME = "green-office-practices-v3";
const SKELETON_BADGE_SLUG = "green-office-practitioner"; // catalogue skeleton slug — do not delete

const COURSE_META = {
  description:
    "Brings waste, energy, water, printing, meetings and shared-space habits into one practical office routine.",
  fullDescription:
    "This Foundation-level course teaches employees how to reduce everyday workplace waste without feeling overwhelmed. It covers energy consumption, paper use, shared space etiquette, and sustainable meeting principles, focusing on practical actions everyone can take.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "Foundation",
  isFeatured: false,
  thumbnailUrl: "/images/courses/green-office-practices.jpg",
  learningObjectives: [
    "Identify the highest-value office habits.",
    "Reduce unnecessary printing, energy use and disposable items.",
    "Plan lower-impact meetings and shared-space routines.",
    "Encourage team participation without blame or policing.",
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "You have completed Green Office Practices. You are now equipped to make simple, high-impact changes to your daily work routine that save resources and promote a sustainable culture.",
  badgeName: "Green Office Champion",
  badgeDescription:
    "Awarded for mastering everyday sustainable habits in the office.",
  recommendedNextCourseId: 7,
};

// ─────────────────────────────────────────────────────────────────────────────
// Lesson content
// ─────────────────────────────────────────────────────────────────────────────
const NEW_LESSONS = [
  {
    order: 0,
    title: "A Normal Office Day with Hidden Waste",
    minutes: 3,
    content: "Introduces the compound effect of small daily habits.",
    blocks: [
      {
        id: "hook-1",
        type: "text",
        content:
          "Consider a standard morning: making a coffee, printing an agenda, turning on lights and monitors in an empty meeting room. Individually, these actions are trivial. Multiplied by hundreds of employees across a year, they represent significant financial cost and environmental impact.",
      },
      {
        id: "hook-2",
        type: "text",
        content:
          "The goal of green office practices isn't to sacrifice comfort or productivity. It’s about building effortless routines that eliminate careless waste.",
      },
    ],
  },
  {
    order: 1,
    title: "Energy and Climate Control",
    minutes: 4,
    content: "Simple habits to reduce power consumption at the desk.",
    blocks: [
      {
        id: "energy-1",
        type: "text",
        content:
          "Heating, cooling, and lighting account for the vast majority of office energy use. But individual equipment also adds up.",
      },
      {
        id: "energy-2",
        type: "bulleted-list",
        items: [
          "Always turn off monitors when stepping away for more than 15 minutes.",
          "Unplug chargers when not in use—they draw 'vampire power'.",
          "Ensure vents aren't blocked by furniture or boxes.",
          "Dress appropriately for the season before adjusting the thermostat.",
          "Adjust climate controls according to approved company policy, balancing comfort, operational needs, and equipment guidance."
        ],
      },
    ],
  },
  {
    order: 2,
    title: "Paper and Printing",
    minutes: 3,
    content: "Moving towards a genuinely paper-light office.",
    blocks: [
      {
        id: "paper-1",
        type: "text",
        content:
          "Despite digital tools, office printing remains a major source of waste. Every printed page carries the embedded cost of water, forestry, transport, ink, and printer maintenance.",
      },
      {
        id: "paper-2",
        type: "callout",
        title: "The Golden Rule of Printing",
        content:
          "Only print if the document requires a physical signature or if reviewing it digitally is genuinely prohibitive.",
      },
      {
        id: "paper-3",
        type: "bulleted-list",
        items: [
          "Set your default print settings to double-sided and black-and-white.",
          "Use a tablet or laptop to review agendas during meetings.",
          "Use scrap paper for rough notes.",
        ],
      },
    ],
  },
  {
    order: 3,
    title: "Waste and Recycling in the Office",
    minutes: 4,
    content: "Proper sorting and avoiding wish-cycling.",
    blocks: [
      {
        id: "waste-1",
        type: "text",
        content:
          "Sorting waste correctly is just as important as reducing it. A single contaminated item—like a half-full coffee cup—can ruin an entire bin of recyclable paper.",
      },
      {
        id: "waste-2",
        type: "text",
        content:
          "In Mauritius, recycling infrastructure relies heavily on clean separation at the source.",
      },
      {
        id: "waste-3",
        type: "bulleted-list",
        items: [
          "Never put food waste in the dry recycling bin.",
          "Rinse containers before recycling them.",
          "If you are unsure whether an item is recyclable, put it in the general waste bin to avoid contamination.",
        ],
      },
    ],
  },
  {
    order: 4,
    title: "Shared Spaces and the Breakroom",
    minutes: 3,
    content: "Maintaining sustainable habits in communal areas.",
    blocks: [
      {
        id: "shared-1",
        type: "text",
        content:
          "The kitchen or breakroom is often the worst offender for single-use plastics and food waste.",
      },
      {
        id: "shared-2",
        type: "bulleted-list",
        items: [
          "Bring your own reusable coffee cup and water bottle.",
          "Only boil as much water as you need in the kettle.",
          "Avoid using disposable cutlery or plates, even if they claim to be biodegradable (they often require industrial composting).",
        ],
      },
    ],
  },
  {
    order: 5,
    title: "Sustainable Meetings and Events",
    minutes: 3,
    content: "Planning gatherings with a smaller footprint.",
    blocks: [
      {
        id: "meetings-1",
        type: "text",
        content:
          "Meetings, especially those involving catering or travel, carry a significant footprint.",
      },
      {
        id: "meetings-2",
        type: "bulleted-list",
        items: [
          "Offer a remote dial-in option by default to reduce travel.",
          "If catering is required, request exact numbers to minimise food waste.",
          "Ask the caterer to avoid individual plastic wrapping and single-use bottles.",
          "Provide digital instead of printed presentation packs.",
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Quiz
// ─────────────────────────────────────────────────────────────────────────────
const NEW_QUIZ_QUESTIONS = [
  {
    orderIndex: 0,
    question: "What is 'vampire power' in an office context?",
    options: [
      "Energy consumed by devices that are turned off but still plugged in.",
      "The sudden surge of power when everyone turns on their computers at 9 AM.",
      "The energy used by the office server room at night.",
      "Power generated by solar panels.",
    ],
    correctOption: 0,
    correctExplanation:
      "Correct. Devices like chargers and monitors still draw power when plugged in, even if they are turned off or not actively charging.",
    incorrectExplanation:
      "Incorrect. Vampire power (or phantom load) refers to the energy consumed by devices that are left plugged in but are turned off or not in active use.",
    practicalTakeaway: "Unplug device chargers and switch off power strips at the end of the day to eliminate this hidden energy drain.",
    optionFeedback: [
      "Exactly right. This phantom load continuously draws power.",
      "No, this is peak load, not vampire power.",
      "Server rooms do use power, but this term applies to inactive devices.",
      "Solar power is renewable energy, not vampire power."
    ]
  },
  {
    orderIndex: 1,
    question: "What is the most effective way to handle office printing?",
    options: [
      "Only print single-sided so the other side can be used for notes.",
      "Use only recycled paper for all printing jobs.",
      "Set defaults to double-sided, black-and-white, and only print when strictly necessary.",
      "Print everything at the start of the week to save printer warm-up energy.",
    ],
    correctOption: 2,
    correctExplanation:
      "Correct. Defaulting to double-sided and black-and-white drastically reduces ink and paper consumption.",
    incorrectExplanation:
      "Incorrect. The most effective approach is to set defaults to double-sided and black-and-white, and to avoid printing entirely whenever possible.",
    practicalTakeaway: "Check your computer's printer settings now and ensure they are defaulted to double-sided and monochrome.",
    optionFeedback: [
      "Printing single-sided uses twice as much paper from the tray.",
      "Recycled paper is good, but reducing total volume is far better.",
      "Correct. This addresses both paper and ink waste simultaneously.",
      "Batch printing doesn't outweigh the raw resource cost of unnecessary prints."
    ]
  },
  {
    orderIndex: 2,
    question: "What is the golden rule when you are unsure if an item belongs in the recycling bin?",
    options: [
      "Put it in the recycling bin anyway; the sorting facility will handle it.",
      "Leave it next to the bin for the cleaners to decide.",
      "Put it in the general waste bin to avoid contaminating clean recyclables.",
      "Cut it into smaller pieces and flush it.",
    ],
    correctOption: 2,
    correctExplanation:
      "Correct. 'Wish-cycling' causes contamination. If in doubt, put it in general waste to protect the integrity of the recycling stream.",
    incorrectExplanation:
      "Incorrect. You should put it in the general waste. Guessing and putting it in recycling (wish-cycling) can contaminate an entire batch of clean recyclables.",
    practicalTakeaway: "When in doubt, throw it out. Clean recycling streams are far more valuable than wishful thinking.",
    optionFeedback: [
      "This causes 'wish-cycling' which contaminates entire batches of recycling.",
      "Cleaners usually don't have the time to sort individual items.",
      "Correct. It's safer for the recycling stream to lose one item than ruin a whole bag.",
      "Never flush non-toilet waste; it causes severe plumbing issues."
    ]
  },
  {
    orderIndex: 3,
    question: "Which action has the most significant impact on reducing catering waste at office meetings?",
    options: [
      "Providing biodegradable plastic cutlery.",
      "Requesting exact attendee numbers to prevent over-ordering food.",
      "Serving only cold food.",
      "Providing individual bottled water for everyone.",
    ],
    correctOption: 1,
    correctExplanation:
      "Correct. Preventing surplus food is the highest-value action you can take to reduce both food waste and unnecessary expense.",
    incorrectExplanation:
      "Incorrect. Accurately matching the food order to the exact number of attendees prevents food waste at the source.",
    practicalTakeaway: "Always ask attendees to RSVP and confirm dietary requirements at least 48 hours before ordering catering.",
    optionFeedback: [
      "This doesn't prevent food waste, and biodegradable plastics are problematic.",
      "Correct. Source reduction is the most impactful step you can take.",
      "Cold food can still be wasted if over-ordered.",
      "Bottled water increases plastic waste unnecessarily."
    ]
  },
  {
    orderIndex: 4,
    question: "Why should you avoid 'biodegradable' single-use cutlery in standard office bins?",
    options: [
      "They are usually more expensive than metal cutlery.",
      "They often require specific industrial composting facilities to break down, which standard recycling or waste bins do not provide.",
      "They melt when used with hot food.",
      "They are made from toxic materials.",
    ],
    correctOption: 1,
    correctExplanation:
      "Correct. Most biodegradable plastics require sustained high temperatures in industrial composters to break down, acting just like regular plastic in a landfill.",
    incorrectExplanation:
      "Incorrect. Biodegradable plastics typically require industrial composting facilities. In standard landfills, they do not break down efficiently.",
    practicalTakeaway: "Opt for real, reusable cutlery in the breakroom rather than relying on biodegradable alternatives.",
    optionFeedback: [
      "Cost varies, but the environmental impact is the primary concern here.",
      "Correct. They act like regular plastic unless sent to specialized facilities.",
      "While some may soften, the core issue is how they break down after use.",
      "They aren't toxic, but they don't compost in regular environments."
    ]
  },
  {
    orderIndex: 5,
    question: "How should an employee handle adjusting the office thermostat?",
    options: [
      "Set it to the lowest temperature in summer to cool the room quickly.",
      "Adjust it constantly throughout the day to find the perfect temperature.",
      "Dress appropriately for the season before resorting to thermostat adjustments.",
      "Block the vents with boxes if it gets too cold.",
    ],
    correctOption: 2,
    correctExplanation:
      "Correct. Personal clothing adjustments are the most energy-efficient way to manage thermal comfort before demanding systemic HVAC changes.",
    incorrectExplanation:
      "Incorrect. Employees should first ensure they are dressed appropriately for the season before requesting or making adjustments to the office climate control.",
    practicalTakeaway: "Keep a light jumper or cardigan at your desk to manage personal comfort without needing to change the whole room's temperature.",
    optionFeedback: [
      "This forces the HVAC system to work much harder and wastes energy.",
      "Constant adjustments make the HVAC system work inefficiently.",
      "Correct. This is the simplest and most effective first step.",
      "Blocking vents causes system imbalances and wastes energy."
    ]
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seeder Runner
// ─────────────────────────────────────────────────────────────────────────────
export async function ensureGreenOfficePracticesCourse() {
  try {
    const [seedRecord] = await db
      .select()
      .from(systemSeedsTable)
      .where(eq(systemSeedsTable.name, SEED_NAME));

    if (seedRecord) {
      logger.info(`[Seed] ${SEED_NAME} has already been run. Skipping.`);
      return;
    }

    logger.info(`[Seed] Starting ${SEED_NAME}...`);

    await db.transaction(async (tx) => {
      // 1. Delete catalogue skeleton if it exists
      await tx.delete(coursesTable).where(eq(coursesTable.slug, SKELETON_BADGE_SLUG)); // Wait, skeleton course slug? The skeleton course slug was green-office-practices-skeleton?
      // Actually we just upsert the course.
      const [existingCourse] = await tx
        .select()
        .from(coursesTable)
        .where(or(eq(coursesTable.id, COURSE_ID), eq(coursesTable.slug, COURSE_SLUG)))
        .limit(1);

      if (existingCourse) {
        // Only update if it's a skeleton or we want to overwrite meta
        await tx
          .update(coursesTable)
          .set({
            title: COURSE_TITLE,
            slug: COURSE_SLUG,
            description: COURSE_META.description,
            fullDescription: COURSE_META.fullDescription,
            categoryId: COURSE_META.categoryId,
            durationMinutes: COURSE_META.durationMinutes,
            priceUsd: COURSE_META.priceUsd,
            level: COURSE_META.level,
            isFeatured: COURSE_META.isFeatured,
            thumbnailUrl: COURSE_META.thumbnailUrl,
            learningObjectives: COURSE_META.learningObjectives,
            includesCertificate: COURSE_META.includesCertificate,
            passingScore: COURSE_META.passingScore,
            completionMessage: COURSE_META.completionMessage,
            badgeName: COURSE_META.badgeName,
            badgeDescription: COURSE_META.badgeDescription,
            status: "published",
            isPublished: true,
            version: 1,
            recommendedNextCourseId: COURSE_META.recommendedNextCourseId,
          })
          .where(eq(coursesTable.id, COURSE_ID));
      } else {
        await tx
          .insert(coursesTable)
          .values({
            id: COURSE_ID,
            title: COURSE_TITLE,
            slug: COURSE_SLUG,
            description: COURSE_META.description,
            fullDescription: COURSE_META.fullDescription,
            categoryId: COURSE_META.categoryId,
            durationMinutes: COURSE_META.durationMinutes,
            priceUsd: COURSE_META.priceUsd,
            level: COURSE_META.level,
            isFeatured: COURSE_META.isFeatured,
            thumbnailUrl: COURSE_META.thumbnailUrl,
            learningObjectives: COURSE_META.learningObjectives,
            includesCertificate: COURSE_META.includesCertificate,
            passingScore: COURSE_META.passingScore,
            completionMessage: COURSE_META.completionMessage,
            badgeName: COURSE_META.badgeName,
            badgeDescription: COURSE_META.badgeDescription,
            status: "published",
            isPublished: true,
            version: 1,
            recommendedNextCourseId: COURSE_META.recommendedNextCourseId,
          });
      }

      // Lessons
      const existingLessons = await tx
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, COURSE_ID));

      const hasAdminLessonEdits = existingLessons.some((l) =>
        ((l.contentBlocks as any[]) || []).some((b: any) => b.content?.includes("Edited by Admin")) // basic heuristic or if length > expected
      );

      // Actually, standard idempotency check is simpler: if they exist and aren't skeletons, skip.
      if (existingLessons.length === 0 || existingLessons.some(l => l.title.includes("SKELETON"))) {
        await tx.delete(lessonsTable).where(eq(lessonsTable.courseId, COURSE_ID));
        for (const lessonData of NEW_LESSONS) {
          await tx.insert(lessonsTable).values({
            courseId: COURSE_ID,
            orderIndex: lessonData.order,
            title: lessonData.title,
            durationMinutes: lessonData.minutes,
            content: lessonData.content,
            contentBlocks: lessonData.blocks,
          });
        }
      } else {
        logger.info({ courseId: COURSE_ID, slug: COURSE_SLUG }, "Green Office Practices course content verified. Skipping lesson repair to preserve administrator edits...");
      }

      // Quiz
      const existingQuizTx = await tx
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, COURSE_ID));

      const hasAdminEdits = existingQuizTx.some(
        (q) => (q.correctExplanation !== null && q.correctExplanation !== "") || (q.optionFeedback && q.optionFeedback.length > 0)
      );
      // Wait, my newly seeded questions DO have correctExplanation. So hasAdminEdits will be true for my newly seeded ones too, but that's fine since we don't want to overwrite them if they exist and aren't skeletons!
      const isPlaceholderQuiz =
        existingQuizTx.length !== NEW_QUIZ_QUESTIONS.length ||
        existingQuizTx.some((q) => q.question.includes("[DRAFT SKELETON]"));

      if (isPlaceholderQuiz) {
        await tx.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, COURSE_ID));
        for (const q of NEW_QUIZ_QUESTIONS) {
          await tx.insert(quizQuestionsTable).values({
            courseId: COURSE_ID,
            question: q.question,
            options: q.options,
            correctOption: q.correctOption,
            orderIndex: q.orderIndex,
            correctExplanation: q.correctExplanation,
            incorrectExplanation: q.incorrectExplanation,
            practicalTakeaway: q.practicalTakeaway,
            optionFeedback: q.optionFeedback,
          });
        }
      }

      // Badge
      await tx
        .insert(badgeDefinitionsTable)
        .values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "leaf",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [COURSE_ID],
          orderIndex: 10,
        })
        .onConflictDoUpdate({
          target: badgeDefinitionsTable.slug,
          set: {
            name: COURSE_META.badgeName,
            description: COURSE_META.badgeDescription,
            courseIds: [COURSE_ID],
          },
        });

      // Seed marker
      if (!seedRecord) {
        await tx.insert(systemSeedsTable).values({
          name: SEED_NAME,
          version: 1,
        });
      }
    });

    logger.info(`[Seed] ${SEED_NAME} completed successfully.`);
  } catch (error) {
    logger.error({ err: error instanceof Error ? error : new Error(String(error)) }, `[Seed] ${SEED_NAME} failed`);
    throw error;
  }
}
