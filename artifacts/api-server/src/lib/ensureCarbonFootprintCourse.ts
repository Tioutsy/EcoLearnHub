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

const COURSE_ID = 10; // Carbon Footprint Awareness originally ID 10 in skeletons, but the user calls it Course 7 (7th logical course)
const COURSE_SLUG = "carbon-footprint-awareness";
const COURSE_TITLE = "Carbon Footprint Awareness";
const BADGE_SLUG = "carbon-aware";
const SEED_NAME = "carbon-footprint-awareness-v1";
const SKELETON_BADGE_SLUG = "carbon-aware"; // Needs to match whatever the skeleton generated

const COURSE_META = {
  description: "Gain a clear understanding of greenhouse gas emissions and how individuals impact the climate.",
  fullDescription:
    "Explains what a carbon footprint represents, where workplace emissions commonly arise, and how employees can influence relevant decisions without turning them into carbon accountants. The focus is on practical awareness rather than formal emissions inventories.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "Foundation",
  isFeatured: false,
  thumbnailUrl: "/images/courses/carbon-footprint-awareness.jpg",
  learningObjectives: [
    "Explain a carbon footprint in plain language.",
    "Recognise direct and indirect workplace emission sources.",
    "Identify actions employees can influence.",
    "Distinguish awareness from formal corporate carbon accounting.",
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "You have completed Carbon Footprint Awareness. You can now recognise how everyday workplace decisions connect to carbon emissions and identify which actions can be taken personally or raised at company level.",
  badgeName: "Carbon Aware",
  badgeDescription:
    "Awarded for completing the Carbon Footprint Awareness course.",
  recommendedNextCourseId: 11, // Biodiversity in Mauritius (ID 11 in skeleton)
};

// ─────────────────────────────────────────────────────────────────────────────
// Lesson content
// ─────────────────────────────────────────────────────────────────────────────
const NEW_LESSONS = [
  {
    order: 0,
    title: "The Hidden Emissions Behind a Working Day",
    minutes: 3,
    content: "Begin with a relatable workplace scenario.",
    blocks: [
      {
        id: "hook-1",
        type: "text",
        content:
          "An employee drives alone to an office, enters an air-conditioned room with an open door, joins an in-person meeting requiring colleagues to travel from another site, orders individually packaged refreshments and replaces a usable item with a new one.",
      },
      {
        id: "hook-2",
        type: "callout",
        title: "Which of these decisions creates carbon emissions?",
        content:
          "The correct learning point is that several decisions contribute to emissions, including emissions that may not be immediately visible.",
      },
      {
        id: "hook-3",
        type: "text",
        content:
          "Our daily workplace choices, even the seemingly small ones, connect directly to greenhouse gas emissions. The goal is to build an awareness of those connections.",
      },
    ],
  },
  {
    order: 1,
    title: "Carbon Footprints in Simple Terms",
    minutes: 4,
    content: "Explain that a carbon footprint is an estimate of the greenhouse gas emissions connected with an activity.",
    blocks: [
      {
        id: "terms-1",
        type: "text",
        content:
          "A carbon footprint is simply an estimate of the greenhouse gas emissions connected with an activity, product, person or organisation.",
      },
      {
        id: "terms-2",
        type: "text",
        content:
          "Greenhouse gases (like carbon dioxide and methane) trap heat in the atmosphere. Carbon dioxide equivalent, written as CO₂e, is a common way of expressing the combined warming effect of different greenhouse gases.",
      },
      {
        id: "terms-3",
        type: "bulleted-list",
        items: [
          "Fuel burned by a company vehicle.",
          "Electricity used by workplace equipment.",
          "Emissions created while manufacturing purchased products.",
          "Transport used to deliver goods.",
          "Waste treatment and disposal."
        ],
      },
    ],
  },
  {
    order: 2,
    title: "How Workplace Decisions Connect to Emissions",
    minutes: 4,
    content: "Understanding energy, transport, purchasing and waste connections.",
    blocks: [
      {
        id: "connect-1",
        type: "text",
        content:
          "Consider these practical areas in a Mauritian workplace context:",
      },
      {
        id: "connect-2",
        type: "bulleted-list",
        items: [
          "Energy: Air-conditioning, lighting and equipment use in offices, hotels, and retail premises.",
          "Travel: Separate vehicle journeys between Port Louis, Ebène, Moka, the West and other sites.",
          "Purchasing: Deliveries that could be consolidated, and products requiring manufacturing and transport before reaching Mauritius.",
          "Waste: Food, packaging and equipment discarded before the end of their useful life."
        ],
      },
      {
        id: "connect-3",
        type: "callout",
        title: "A Note on Products",
        content:
          "Imported products are not automatically worse than local products. The material, production method, durability, transport efficiency, and useful life must all be considered together.",
      },
    ],
  },
  {
    order: 3,
    title: "What Employees Can Influence",
    minutes: 3,
    content: "Distinguish what you can do versus what requires management action.",
    blocks: [
      {
        id: "influence-1",
        type: "text",
        content:
          "Everyone has a role to play. Employee awareness supports company action, but it does not replace formal corporate carbon accounting.",
      },
      {
        id: "influence-2",
        type: "split-text",
        leftTitle: "Employees can often influence:",
        leftContent:
          "• Whether a short meeting requires travel\n• Switching off equipment that is not needed\n• Reporting excessive cooling or faulty equipment\n• Avoiding unnecessary printing\n• Requesting only the materials that are required\n• Reusing suitable items\n• Combining journeys or deliveries\n• Suggesting lower-carbon ways of completing work",
        rightTitle: "Company/Management action is usually required for:",
        rightContent:
          "• Replacing a fleet\n• Changing the building’s energy systems\n• Selecting renewable-energy arrangements\n• Establishing procurement standards\n• Choosing major suppliers\n• Redesigning delivery networks\n• Measuring the formal carbon footprint\n• Setting verified corporate reduction targets",
      },
    ],
  },
  {
    order: 4,
    title: "Workplace Decision Scenario",
    minutes: 4,
    content: "Compare realistic workplace choices.",
    blocks: [
      {
        id: "scenario-1",
        type: "scenario",
        scenarioText:
          "A manager in Ebène needs a 30-minute discussion with colleagues based in Port Louis and Tamarin. No equipment inspection, physical signing or site visit is required. What is the best choice?",
        options: [
          {
            id: "opt-1",
            text: "Ask every participant to drive to Ebène.",
            isCorrect: false,
            feedback: "This generates unnecessary travel emissions for a short meeting that doesn't require physical presence.",
          },
          {
            id: "opt-2",
            text: "Hold a video meeting and circulate the decision notes afterward.",
            isCorrect: true,
            feedback: "Remote communication avoids unnecessary journeys when physical presence adds no operational value.",
          },
          {
            id: "opt-3",
            text: "Send separate employees to collect everyone.",
            isCorrect: false,
            feedback: "This would double the amount of driving and emissions.",
          },
          {
            id: "opt-4",
            text: "Postpone the discussion indefinitely.",
            isCorrect: false,
            feedback: "Avoiding work altogether isn't a productive sustainability strategy.",
          },
        ],
      },
      {
        id: "scenario-2",
        type: "scenario",
        scenarioText:
          "Your department needs new office chairs. What is the most carbon-conscious approach to purchasing?",
        options: [
          {
            id: "opt-a",
            text: "Order the cheapest option online with individual expedited shipping.",
            isCorrect: false,
            feedback: "Individual, expedited shipping significantly increases the transport carbon footprint.",
          },
          {
            id: "opt-b",
            text: "Evaluate durability, consolidate the order, and look for sustainable materials.",
            isCorrect: true,
            feedback: "Combining deliveries and prioritising durable materials reduces both transport emissions and replacement waste.",
          },
          {
            id: "opt-c",
            text: "Always buy the closest locally produced chair regardless of its lifespan.",
            isCorrect: false,
            feedback: "Local is often good, but if a local product breaks immediately and must be replaced repeatedly, its lifecycle footprint might be higher.",
          },
        ],
      },
    ],
  },
  {
    order: 5,
    title: "Knowledge Check, Commitment and Completion",
    minutes: 2,
    content: "Commit to one practical action before completing the course.",
    blocks: [
      {
        id: "commit-1",
        type: "text",
        content:
          "Before you proceed to the final quiz, consider what you can influence in your daily routine.",
      },
      {
        id: "commit-2",
        type: "commitment",
        options: [
          "I will question whether a journey is necessary before arranging it.",
          "I will report avoidable energy waste.",
          "I will avoid requesting unnecessary materials.",
          "I will combine suitable deliveries or workplace journeys.",
          "I will suggest one realistic carbon-reduction opportunity to my manager."
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Quiz content
// ─────────────────────────────────────────────────────────────────────────────
const NEW_QUIZ_QUESTIONS = [
  {
    questionText: "What does a workplace carbon footprint represent?",
    practicalTakeaway: "A company’s footprint is created by several connected activities, not by one visible source alone.",
    options: [
      {
        text: "Only the amount of paper placed in a waste bin",
        isCorrect: false,
        feedback: "Waste is only one part of the picture.",
      },
      {
        text: "The greenhouse gas emissions connected with the organisation’s activities",
        isCorrect: true,
        feedback: "Correct. It estimates emissions connected with energy, transport, purchasing, operations and waste.",
      },
      {
        text: "The physical size of the workplace",
        isCorrect: false,
        feedback: "A footprint refers to emissions, not physical square footage.",
      },
      {
        text: "Only the fuel used by employees travelling to work",
        isCorrect: false,
        feedback: "Employee travel is a component, but it also includes electricity, waste, and manufacturing.",
      },
    ],
  },
  {
    questionText: "Which is an example of an indirect workplace emission?",
    practicalTakeaway: "Purchasing decisions can influence emissions even when those emissions occur outside the workplace.",
    options: [
      {
        text: "Fuel burned in a company-owned vehicle",
        isCorrect: false,
        feedback: "Because the company owns the vehicle, this is considered a direct emission.",
      },
      {
        text: "Diesel burned in a company-owned generator",
        isCorrect: false,
        feedback: "Fuel burned on-site by company equipment is a direct emission.",
      },
      {
        text: "Emissions created when a supplier manufactures equipment purchased by the company",
        isCorrect: true,
        feedback: "Correct. The emissions occur within the supplier’s operations, but they are connected to the company’s purchasing decision.",
      },
      {
        text: "Fuel burned directly in company-owned machinery",
        isCorrect: false,
        feedback: "Fuel burned directly by the company is a direct emission.",
      },
    ],
  },
  {
    questionText: "An employee notices that an unoccupied meeting room remains brightly lit and heavily air-conditioned for several hours each day. What is the most appropriate action?",
    practicalTakeaway: "Employees can act on visible waste while also raising issues that require a longer-term company response.",
    options: [
      {
        text: "Ignore it because only management can influence emissions",
        isCorrect: false,
        feedback: "Employees have the power to influence daily operational waste.",
      },
      {
        text: "Switch off the unused systems if authorised and report the recurring issue",
        isCorrect: true,
        feedback: "Correct. Stop immediate avoidable use where authorised and report the recurring problem.",
      },
      {
        text: "Open the windows while leaving the air-conditioning operating",
        isCorrect: false,
        feedback: "This makes the air-conditioning work harder, increasing energy use and emissions.",
      },
      {
        text: "Wait until the company completes a formal carbon footprint assessment",
        isCorrect: false,
        feedback: "Practical waste reduction should not wait for formal accounting.",
      },
    ],
  },
  {
    questionText: "True or false: Employee carbon awareness is the same as completing a formal corporate carbon footprint assessment.",
    practicalTakeaway: "Every employee can support carbon reduction, while formal measurement remains an organisational process requiring proper data and governance.",
    options: [
      {
        text: "True",
        isCorrect: false,
        feedback: "Awareness helps make better decisions, but formal corporate carbon accounting requires defined boundaries, reliable data, and documented methods.",
      },
      {
        text: "False",
        isCorrect: true,
        feedback: "Correct. Formal accounting is an organisational process that requires strict methodologies and data gathering, whereas awareness empowers daily decisions.",
      },
    ],
  },
  {
    questionText: "Colleagues based at different company sites need a short decision meeting. No inspection, physical work or exchange of original documents is required. Which option is most likely to avoid unnecessary travel emissions?",
    practicalTakeaway: "Choose remote communication when it serves the purpose of the meeting, but retain in-person visits when the work genuinely requires physical presence.",
    options: [
      {
        text: "Ask every employee to drive separately to the head office",
        isCorrect: false,
        feedback: "This maximizes unnecessary travel emissions.",
      },
      {
        text: "Hold a video meeting and record the agreed actions",
        isCorrect: true,
        feedback: "Correct. Where physical presence is unnecessary, a well-managed video meeting avoids multiple journeys.",
      },
      {
        text: "Send a company vehicle to collect each participant separately",
        isCorrect: false,
        feedback: "While carpooling is better than separate driving, a video meeting eliminates the driving entirely.",
      },
      {
        text: "Print the discussion points and deliver them to every site",
        isCorrect: false,
        feedback: "Delivery vehicles also generate transport emissions.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Idempotent Seeder Execution
// ─────────────────────────────────────────────────────────────────────────────
export async function ensureCarbonFootprintCourse(): Promise<void> {
  let txHasFinished = false;

  try {
    logger.info("Checking and executing Carbon Footprint course content migration...");

    // Check if system seed has already run successfully
    const [existingSeed] = await db
      .select({ id: systemSeedsTable.id })
      .from(systemSeedsTable)
      .where(eq(systemSeedsTable.name, SEED_NAME))
      .limit(1);

    if (existingSeed) {
      logger.info(`[Seed] ${SEED_NAME} has already been run. Skipping.`);
      return;
    }

    await db.transaction(async (tx) => {
      // 1. Course Record
      let courseRecord;
      const [existingCourse] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(
          or(
            eq(coursesTable.slug, COURSE_SLUG),
            eq(coursesTable.id, COURSE_ID)
          )
        )
        .limit(1);

      if (existingCourse) {
        [courseRecord] = await tx
          .update(coursesTable)
          .set({
            title: COURSE_TITLE,
            slug: COURSE_SLUG,
            ...COURSE_META,
            isPublished: true,
            status: "published",
            updatedAt: new Date(),
          })
          .where(eq(coursesTable.id, existingCourse.id))
          .returning();
      } else {
        [courseRecord] = await tx
          .insert(coursesTable)
          .values({
            id: COURSE_ID,
            title: COURSE_TITLE,
            slug: COURSE_SLUG,
            ...COURSE_META,
            isPublished: true,
            status: "published",
          })
          .returning();
      }

      const actualCourseId = courseRecord.id;

      // 2. Badge Definition
      const [existingBadge] = await tx
        .select({ id: badgeDefinitionsTable.id })
        .from(badgeDefinitionsTable)
        .where(
          or(
            eq(badgeDefinitionsTable.slug, BADGE_SLUG),
            eq(badgeDefinitionsTable.slug, SKELETON_BADGE_SLUG)
          )
        )
        .limit(1);

      if (existingBadge) {
        await tx
          .update(badgeDefinitionsTable)
          .set({
            name: COURSE_META.badgeName,
            slug: BADGE_SLUG,
            description: COURSE_META.badgeDescription,
            courseIds: [actualCourseId],
          })
          .where(eq(badgeDefinitionsTable.id, existingBadge.id));
      } else {
        await tx.insert(badgeDefinitionsTable).values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "leaf",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 11,
        });
      }
      // 3. Lessons (Replace entirely for cleanliness)
      await tx
        .delete(lessonsTable)
        .where(eq(lessonsTable.courseId, actualCourseId));

      const lessonsToInsert = NEW_LESSONS.map((l) => ({
        courseId: actualCourseId,
        title: l.title,
        orderIndex: l.order,
        durationMinutes: l.minutes,
        content: JSON.stringify(l),
      }));
      await tx.insert(lessonsTable).values(lessonsToInsert);

      // 4. Quiz Questions (Replace entirely)
      await tx
        .delete(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, actualCourseId));

      const quizQuestionsToInsert = NEW_QUIZ_QUESTIONS.map((q, idx) => {
        const correctIdx = q.options.findIndex(o => o.isCorrect);
        return {
          courseId: actualCourseId,
          question: q.questionText,
          practicalTakeaway: q.practicalTakeaway,
          options: q.options.map(o => o.text),
          correctOption: correctIdx !== -1 ? correctIdx : 0,
          orderIndex: idx,
          optionFeedback: q.options.map(o => o.feedback),
          correctExplanation: correctIdx !== -1 ? q.options[correctIdx].feedback : "",
          incorrectExplanation: "Please review the feedback for the correct choice.",
        };
      });
      await tx.insert(quizQuestionsTable).values(quizQuestionsToInsert);

      // 5. Mark successful completion
      await tx.insert(systemSeedsTable).values({
        name: SEED_NAME,
        runAt: new Date(),
      });

      txHasFinished = true;
    });

    if (txHasFinished) {
      logger.info(`${COURSE_TITLE} course content and quiz safely migrated and published.`);
    }
  } catch (error) {
    logger.error(
      { err: error },
      `Failed to migrate ${COURSE_TITLE} course content`
    );
    throw error;
  }
}
