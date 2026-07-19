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

const COURSE_ID = 8;
const COURSE_SLUG = "biodiversity-in-mauritius";
const COURSE_TITLE = "Biodiversity in Mauritius";
const BADGE_SLUG = "biodiversity-aware";
const SEED_NAME = "biodiversity-in-mauritius-v1";
const SKELETON_BADGE_SLUG = "biodiversity-aware";

const COURSE_META = {
  description: "Discover why Mauritius has distinctive biodiversity, how workplaces can affect local ecosystems and what employees can do to reduce harm.",
  fullDescription:
    "Understand why Mauritius has distinctive biodiversity, why biodiversity matters to people and businesses, how ordinary workplace activities can affect ecosystems, and how employees can make practical, responsible decisions. The focus is on practical awareness rather than formal scientific classification.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "Foundation",
  isFeatured: false,
  thumbnailUrl: "/images/courses/biodiversity-in-mauritius.jpg",
  learningObjectives: [
    "Explain biodiversity in plain language.",
    "Distinguish between native, endemic, introduced and invasive species.",
    "Identify important terrestrial, freshwater, wetland, coastal and marine ecosystems in Mauritius.",
    "Explain how biodiversity supports people and businesses.",
    "Recognise workplace activities that can damage habitats or wildlife.",
    "Select practical actions that reduce biodiversity-related harm.",
    "Commit to one realistic biodiversity-supporting action at work.",
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "You have completed Biodiversity in Mauritius. You can now recognise common workplace impacts on local ecosystems and make more biodiversity-aware decisions.",
  badgeName: "Biodiversity Aware",
  badgeDescription:
    "Awarded for completing the Biodiversity in Mauritius course.",
  recommendedNextCourseId: 9, // ESG Basics
};

// ─────────────────────────────────────────────────────────────────────────────
// Lesson content
// ─────────────────────────────────────────────────────────────────────────────
const NEW_LESSONS = [
  {
    order: 0,
    title: "A Harmless Workplace Decision?",
    minutes: 3,
    content: "Create a relatable workplace hook regarding landscaping and property changes.",
    blocks: [
      {
        id: "hook-1",
        type: "text",
        content:
          "A company is improving the grounds around an office, hotel, retail site or residential property. The proposed work includes removing existing vegetation, planting fast-growing decorative species, installing stronger outdoor lighting, increasing chemical pest control, and extending paving close to a drainage or wet area.",
      },
      {
        id: "hook-2",
        type: "text",
        content: "The manager describes the project as harmless because the property is privately owned.",
      },
      {
        id: "hook-scenario",
        type: "scenario",
        scenarioText: "What should the team do first?",
        options: [
          {
            id: "opt-1",
            text: "Approve the work because biodiversity only matters inside protected parks.",
            isCorrect: false,
            feedback: "Incorrect. Habitats and species do not observe property boundaries, and actions outside parks can still cause significant harm.",
          },
          {
            id: "opt-2",
            text: "Check whether the work could affect habitats, drainage, wildlife or introduce invasive species.",
            isCorrect: true,
            feedback: "Correct. Assessing the site first is the most responsible step to avoid irreversible harm.",
          },
          {
            id: "opt-3",
            text: "Remove all vegetation so that wildlife cannot enter the property.",
            isCorrect: false,
            feedback: "Incorrect. Removing all vegetation destroys habitats and degrades local ecosystems entirely.",
          },
          {
            id: "opt-4",
            text: "Continue immediately and review the effects after completion.",
            isCorrect: false,
            feedback: "Incorrect. Reviewing after completion may be too late to reverse damage to wildlife or drainage.",
          },
        ],
      },
      {
        id: "hook-3",
        type: "key_message",
        content:
          "Biodiversity can be affected by ordinary decisions about land, lighting, chemicals, drainage, purchasing and waste. A workplace does not need to be inside a national park to have an impact.",
      },
    ],
  },
  {
    order: 1,
    title: "What Biodiversity Means",
    minutes: 4,
    content: "Explain biodiversity in plain international English.",
    blocks: [
      {
        id: "def-1",
        type: "text",
        content:
          "Biodiversity is the variety of living things. It includes differences between species, differences within species, the ecosystems where living things interact, and the connection between plants, animals, microorganisms, soil, water and climate.",
      },
      {
        id: "def-2",
        type: "heading",
        content: "Understanding Species Terminology",
      },
      {
        id: "def-native",
        type: "text",
        content:
          "**Native species**: A species that occurs naturally in a particular place.",
      },
      {
        id: "def-endemic",
        type: "text",
        content:
          "**Endemic species**: A species naturally found in one defined location and nowhere else in the wild.",
      },
      {
        id: "def-intro",
        type: "text",
        content:
          "**Introduced species**: A species brought to a place through human activity, intentionally or accidentally.",
      },
      {
        id: "def-invasive",
        type: "text",
        content:
          "**Invasive alien species**: An introduced species that spreads and causes environmental, economic or other harm.",
      },
      {
        id: "def-3",
        type: "key_message",
        content:
          "Introduced does not automatically mean invasive. The risk depends on whether the species spreads and causes harm.",
      },
    ],
  },
  {
    order: 2,
    title: "Mauritius and Its Living Heritage",
    minutes: 3,
    content: "Explain how island isolation contributed to distinctive species and ecosystems.",
    blocks: [
      {
        id: "heritage-1",
        type: "text",
        content:
          "Because Mauritius is an isolated island, it developed unique species and ecosystems. Many of these are endemic, meaning they are found naturally nowhere else in the wild.",
      },
      {
        id: "heritage-2",
        type: "text",
        content:
          "Mauritius features diverse environments, including terrestrial forests (such as Black River Gorges and Bras d’Eau National Park), rivers and freshwater streams, wetlands, mangroves, lagoons, coral reefs (like Blue Bay Marine Park), and offshore islets.",
      },
      {
        id: "heritage-3",
        type: "text",
        content:
          "Conservation efforts have helped protect endemic species like the Mauritius kestrel, pink pigeon and echo parakeet. However, biodiversity also includes less visible organisms such as insects, fungi, and microorganisms that are vital to these ecosystems.",
      },
      {
        id: "heritage-match",
        type: "scenario",
        scenarioText: "Match the ecosystem with one of its critical functions:",
        options: [
          {
            id: "opt-1",
            text: "Forest: supports soil and water conservation.",
            isCorrect: true,
            feedback: "Correct. Forests play a major role in holding soil in place and managing water cycles.",
          },
          {
            id: "opt-2",
            text: "Wetland: only provides drinking water.",
            isCorrect: false,
            feedback: "Incorrect. Wetlands also store water, filter pollutants, and help reduce flooding.",
          },
          {
            id: "opt-3",
            text: "Coral reef: has no impact on coastal protection.",
            isCorrect: false,
            feedback: "Incorrect. Coral reefs break waves and protect shorelines from erosion.",
          },
          {
            id: "opt-4",
            text: "Mangrove: only produces wood for construction.",
            isCorrect: false,
            feedback: "Incorrect. Mangroves provide vital nursery habitats for marine life and contribute to shoreline stability.",
          },
        ],
      },
    ],
  },
  {
    order: 3,
    title: "Why Biodiversity Matters to Business",
    minutes: 4,
    content: "Explain ecosystem services and why businesses rely on them.",
    blocks: [
      {
        id: "matter-1",
        type: "text",
        content:
          "**Ecosystem services** are benefits that people and organisations receive from functioning natural systems. These include water availability and quality, flood and drainage management, soil protection, coastal protection, fisheries, agriculture, tourism, and employee wellbeing.",
      },
      {
        id: "matter-2",
        type: "workplace_example",
        title: "Hospitality",
        content:
          "Coastal pollution, landscaping, guest activities, exterior lighting and supplier choices can affect lagoons, beaches and wildlife.",
      },
      {
        id: "matter-3",
        type: "workplace_example",
        title: "Construction and property management",
        content:
          "Vegetation removal, drainage changes, dust, noise, waste and chemical use can disturb habitats.",
      },
      {
        id: "matter-4",
        type: "workplace_example",
        title: "Retail and offices",
        content:
          "Procurement, waste, lighting, cleaning chemicals and employee behaviour can create indirect impacts.",
      },
      {
        id: "matter-5",
        type: "workplace_example",
        title: "Manufacturing and Agriculture",
        content:
          "Water discharge, chemical storage, raw-material sourcing, crop choices, soil management, and pest control can affect surrounding ecosystems.",
      },
      {
        id: "matter-6",
        type: "key_message",
        content:
          "Biodiversity is not separate from business. Businesses depend on natural systems and can also place pressure on them.",
      },
    ],
  },
  {
    order: 4,
    title: "Recognising Workplace Pressures",
    minutes: 4,
    content: "Cover common pressures employees may encounter.",
    blocks: [
      {
        id: "pressures-1",
        type: "bulleted-list",
        items: [
          "Clearing vegetation without assessing impacts",
          "Disturbing nesting or feeding areas",
          "Excessive external lighting",
          "Litter and unmanaged waste or chemical spills",
          "Inappropriate pesticide or herbicide use",
          "Polluted runoff or blocking drainage and wet areas",
          "Introducing potentially invasive plants or animals",
          "Feeding wildlife or removing plants, shells, corals or animals",
          "Purchasing products connected to habitat damage",
          "Allowing contractors to work without environmental instructions"
        ],
      },
      {
        id: "pressures-scenario",
        type: "scenario",
        scenarioText:
          "A contractor is preparing to clear vegetation beside a company site. Employees notice birds using the area and water collecting nearby after rain. The contractor says the work is already approved and must be finished today. What is the most responsible response?",
        options: [
          {
            id: "opt-1",
            text: "Allow the work because environmental responsibility belongs only to the contractor.",
            isCorrect: false,
            feedback: "Contractor responsibility does not remove the company’s responsibility to prevent environmental harm.",
          },
          {
            id: "opt-2",
            text: "Physically block the machinery without informing anyone.",
            isCorrect: false,
            feedback: "Employees should never create an unsafe confrontation or put themselves in physical danger.",
          },
          {
            id: "opt-3",
            text: "Pause and report the concern through the appropriate manager or site procedure before irreversible work continues.",
            isCorrect: true,
            feedback: "Correct. Early internal escalation allows the concern to be assessed safely before irreversible damage is done.",
          },
          {
            id: "opt-4",
            text: "Photograph the work for social media but take no workplace action.",
            isCorrect: false,
            feedback: "Posting online is not a substitute for following workplace procedures and does not solve the immediate operational risk.",
          },
        ],
      },
      {
        id: "pressures-takeaway",
        type: "practical_action",
        content:
          "When an activity may cause irreversible harm, raise the concern before the work is completed. Use the company’s reporting and escalation procedure rather than ignoring the issue or intervening unsafely.",
      },
    ],
  },
  {
    order: 5,
    title: "Practical Action and Commitment",
    minutes: 2,
    content: "Provide achievable employee actions.",
    blocks: [
      {
        id: "action-1",
        type: "bulleted-list",
        items: [
          "Keep waste and chemicals away from drains, soil and waterways.",
          "Report leaks, spills, illegal dumping or wildlife disturbance.",
          "Follow site procedures before clearing vegetation or changing drainage.",
          "Avoid feeding or handling wild animals, and do not remove plants, shells or corals.",
          "Reduce unnecessary exterior lighting where operationally appropriate.",
          "Ask suppliers and contractors how they manage environmental impacts.",
          "Respect protected and sensitive areas during company activities.",
          "Record and escalate environmental observations through the correct workplace channel."
        ],
      },
      {
        id: "action-2",
        type: "text",
        content:
          "Note: Do not attempt to identify or remove invasive species yourself unless you are trained and authorised.",
      },
      {
        id: "commit-block",
        type: "commitment",
        options: [
          "I will report environmental risks before they become larger problems.",
          "I will keep waste and chemicals away from drains and natural areas.",
          "I will consider biodiversity when choosing products, contractors or landscaping.",
          "I will avoid disturbing or feeding wildlife at work.",
          "I will raise one biodiversity improvement with my manager or team."
        ],
      },
      {
        id: "action-key",
        type: "key_message",
        content:
          "Protecting biodiversity often begins with noticing how an ordinary workplace decision could affect a living system.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Quiz content
// ─────────────────────────────────────────────────────────────────────────────
const NEW_QUIZ_QUESTIONS = [
  {
    questionText: "What does biodiversity include?",
    practicalTakeaway: "When assessing biodiversity, consider the whole living system rather than only visible or rare animals.",
    options: [
      {
        text: "Only rare animals living in protected parks",
        isCorrect: false,
        feedback: "Biodiversity includes common and rare organisms in many environments, not only animals in protected parks.",
      },
      {
        text: "Plants, animals, microorganisms, genetic variety and the ecosystems connecting them",
        isCorrect: true,
        feedback: "Correct. Biodiversity includes living organisms, variation within life and the ecosystems where organisms interact.",
      },
      {
        text: "Only species that are useful to businesses",
        isCorrect: false,
        feedback: "A species does not need to provide an obvious commercial benefit to be part of biodiversity.",
      },
      {
        text: "Any green space created by people",
        isCorrect: false,
        feedback: "A managed green area may support biodiversity, but greenery alone does not define biodiversity.",
      },
    ],
  },
  {
    questionText: "What does it mean when a species is endemic to Mauritius?",
    practicalTakeaway: "Damage to the habitat of an endemic species can have global consequences because the species may exist nowhere else.",
    options: [
      {
        text: "It is found naturally only in Mauritius.",
        isCorrect: true,
        feedback: "Correct. An endemic species naturally occurs in a defined location and nowhere else in the wild.",
      },
      {
        text: "It was imported into Mauritius for agriculture.",
        isCorrect: false,
        feedback: "A species brought through human activity is introduced, not endemic.",
      },
      {
        text: "It is found in every tropical country.",
        isCorrect: false,
        feedback: "A species found across many countries is not endemic only to Mauritius.",
      },
      {
        text: "It is automatically invasive.",
        isCorrect: false,
        feedback: "Endemic and invasive describe different concepts. An endemic species is native to a limited place.",
      },
    ],
  },
  {
    questionText: "A company plans new landscaping beside a natural area. What is the best first step?",
    practicalTakeaway: "Biodiversity risks are easier and less costly to prevent before landscaping or construction begins.",
    options: [
      {
        text: "Select the fastest-growing imported plants available.",
        isCorrect: false,
        feedback: "Fast growth is not the only consideration. Some introduced plants can spread or require unsuitable management.",
      },
      {
        text: "Clear the site completely before checking what is present.",
        isCorrect: false,
        feedback: "Clearing first may destroy habitat before the risks are understood.",
      },
      {
        text: "Assess the site and obtain appropriate advice about habitats and suitable plant choices.",
        isCorrect: true,
        feedback: "Correct. Early assessment helps the company avoid damage and make informed landscaping choices.",
      },
      {
        text: "Use more pesticide so that insects cannot damage the landscaping.",
        isCorrect: false,
        feedback: "Broad pesticide use can affect non-target organisms and does not replace proper site assessment.",
      },
    ],
  },
  {
    questionText: "Why can wetlands, mangroves and coral ecosystems matter to businesses and communities?",
    practicalTakeaway: "Protecting ecosystems can also support business resilience and community wellbeing.",
    options: [
      {
        text: "They only provide attractive places for photographs.",
        isCorrect: false,
        feedback: "Their value goes far beyond appearance.",
      },
      {
        text: "They can support wildlife and contribute to functions such as water management, shoreline protection, fisheries and tourism.",
        isCorrect: true,
        feedback: "Correct. Healthy ecosystems provide several environmental, social and economic benefits.",
      },
      {
        text: "They prevent every flood and storm from causing damage.",
        isCorrect: false,
        feedback: "Natural ecosystems can reduce risks but cannot prevent every damaging event.",
      },
      {
        text: "They have no relevance unless the business operates directly inside them.",
        isCorrect: false,
        feedback: "Businesses can depend on or affect ecosystems indirectly through supply chains, drainage, pollution, tourism and development.",
      },
    ],
  },
  {
    questionText: "An employee notices a contractor preparing work that may disturb wildlife and alter drainage. What is the most responsible response?",
    practicalTakeaway: "Raise potential environmental harm early, safely and through the appropriate workplace channel.",
    options: [
      {
        text: "Ignore it because the contractor is responsible.",
        isCorrect: false,
        feedback: "Companies should not ignore possible impacts simply because work is outsourced.",
      },
      {
        text: "Raise the concern immediately through the company’s manager or environmental reporting procedure.",
        isCorrect: true,
        feedback: "Correct. Early reporting allows the concern to be assessed before irreversible work occurs.",
      },
      {
        text: "Confront the contractor physically.",
        isCorrect: false,
        feedback: "Employees should not place themselves or others in danger.",
      },
      {
        text: "Wait until the work is complete and then mention it casually.",
        isCorrect: false,
        feedback: "Reporting after completion may be too late to prevent harm.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seeder Function
// ─────────────────────────────────────────────────────────────────────────────
export async function ensureBiodiversityCourse() {
  logger.info(`Checking and executing ${COURSE_TITLE} course content migration...`);

  try {
    const [seedRecord] = await db
      .select({ id: systemSeedsTable.id })
      .from(systemSeedsTable)
      .where(eq(systemSeedsTable.name, SEED_NAME))
      .limit(1);

    if (seedRecord) {
      logger.info(`[Seed] ${SEED_NAME} has already been run. Skipping.`);
      return;
    }

    let txHasFinished = false;

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
          orderIndex: 12,
        });
      }

      // 3. Lessons (Replace entirely for cleanliness)
      await tx
        .delete(lessonsTable)
        .where(eq(lessonsTable.courseId, actualCourseId));

      const lessonsToInsert = NEW_LESSONS.map((lesson) => ({
        courseId: actualCourseId,
        title: lesson.title,
        orderIndex: lesson.order,
        durationMinutes: lesson.minutes,
        content: lesson.content,
        contentBlocks: lesson.blocks,
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
