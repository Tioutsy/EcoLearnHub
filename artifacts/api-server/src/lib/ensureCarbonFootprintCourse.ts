import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_ID = 10;
const COURSE_SLUG = "carbon-footprint-awareness";
const COURSE_TITLE = "Carbon Footprint Awareness";
const BADGE_SLUG = "carbon-aware";
const SEED_NAME = "carbon-footprint-awareness-v3";
const SKELETON_BADGE_SLUG = "carbon-aware"; // catalogue skeleton slug — do not delete

const COURSE_META = {
  description:
    "Gain a plain-language understanding of greenhouse gas emissions, Scope 1–3 boundaries, activity data versus emission factors, and workplace decisions without turning into a specialist carbon accountant.",
  fullDescription:
    "This course helps employees across all roles understand what a carbon footprint represents, how daily workplace activities connect to greenhouse gas emissions, how Scope 1, Scope 2, and Scope 3 emissions differ, how activity data is gathered, and how to avoid unsupported greenwashing claims in Mauritian facilities.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "1400.00",
  level: "Foundation",
  isFeatured: false,
  thumbnailUrl: "/images/courses/carbon-footprint-awareness.jpg",
  learningObjectives: [
    "Explain a carbon footprint and greenhouse gas emissions in plain workplace language.",
    "Distinguish direct emissions (Scope 1), purchased energy (Scope 2), and value-chain emissions (Scope 3).",
    "Distinguish measurable activity data (litres, kWh, km) from emission factors and final carbon calculations.",
    "Map major emissions sources across workplace energy, transport, goods, waste, and refrigerants.",
    "Avoid unsupported carbon claims, guessed figures, and misleading 'carbon-neutral' greenwashing slogans.",
    "Distinguish employee direct actions from data verification, accounting methodology, and management escalation.",
    "Select one practical workplace carbon commitment to support reliable data and emissions awareness."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "You have completed Carbon Footprint Awareness. You can now recognise how workplace decisions connect to greenhouse gas emissions, understand Scope 1–3 boundaries, and support reliable carbon data collection safely.",
  badgeName: "Carbon Awareness Contributor",
  badgeDescription:
    "Awarded for demonstrating plain-language carbon awareness, understanding Scope 1–3 emissions, and supporting reliable workplace activity data.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Understanding Workplace Carbon Footprints",
    minutes: 3,
    content: "Learn what a carbon footprint represents and why data verification matters.",
    blocks: [
      { id: "cfa1-h1", type: "heading", position: 1, headingText: "Why Emissions Data Requires Evidence" },
      { id: "cfa1-t1", type: "short_text", position: 2, bodyText: "At a management meeting, a team asks why the company's annual carbon footprint increased despite employees printing less paper. Staff offer guesses: 'It must be the delivery trucks,' or 'We switched power suppliers, so our footprint should be zero.' The sustainability lead points to the data: generator diesel fuel increased and a major refrigerant leak occurred." },
      { id: "cfa1-k1", type: "key_message", position: 3, headingText: "Emissions Require Measurement, Not Guesses", bodyText: "A carbon footprint is an estimate of total greenhouse gas emissions caused directly and indirectly by an activity or organization. Visible habits (like paper) are important, but energy, fuel, and refrigerants often create far greater emissions." },
      {
        id: "cfa1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Evaluating carbon claims scenario:",
        decisionPrompt: "A vendor claims their service is '100% Carbon Neutral' but provides no data, reporting boundary, or verification sheet. What should you do?",
        decisionChoices: [
          { label: "Treat the claim as unverified marketing and request official methodology or reporting evidence before repeating it", correct: true, feedback: "Perfect! Public carbon claims require defined boundaries, recognized methodologies, and verifiable evidence." },
          { label: "Publish the 'Carbon Neutral' claim on the company website immediately", correct: false, feedback: "Incorrect! Repeating unverified carbon slogans exposes the company to greenwashing risks." },
          { label: "Assume all carbon calculations are fake and refuse to collect energy records", correct: false, feedback: "Incorrect. Operational energy and fuel data must be collected accurately." }
        ]
      },
      {
        id: "cfa1-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "What is a carbon footprint in simple workplace terms?",
        mcqOptions: [
          "An estimate of total greenhouse gas emissions caused directly and indirectly by an activity, expressed as CO2 equivalent (CO2e)",
          "The physical dirt left on office floors by employee shoes",
          "A tax paid exclusively on paper printing invoices",
          "A guarantee that a company produces zero pollution"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "A carbon footprint estimates direct and indirect greenhouse gas emissions in CO2 equivalent units.",
        mcqIncorrectExplanation: "Incorrect. A carbon footprint measures greenhouse gas emissions associated with activities."
      }
    ]
  },
  {
    order: 1,
    title: "Carbon Terminology: GHGs, CO2e & Activity Data",
    minutes: 4,
    content: "Master core carbon terms in plain English without technical accounting confusion.",
    blocks: [
      { id: "cfa2-h1", type: "heading", position: 1, headingText: "Plain-Language Carbon Vocabulary" },
      { id: "cfa2-t1", type: "short_text", position: 2, bodyText: "To participate intelligently in workplace sustainability, understand four fundamental terms:" },
      {
        id: "cfa2-k1",
        type: "key_message",
        position: 3,
        headingText: "Core Vocabulary",
        bodyText: "• Greenhouse Gases (GHGs): Heat-trapping gases including Carbon Dioxide (CO2), Methane (CH4), Nitrous Oxide (N2O), and Refrigerants.\n• CO2 Equivalent (CO2e): A standard unit that expresses the warming effect of different GHGs in one comparable measure.\n• Activity Data: Measurable operational quantities (litres of diesel, kWh of electricity, km driven, kg of refrigerant refilled).\n• Emission Factor: An authorized multiplier used to convert raw activity data into estimated GHG emissions."
      },
      {
        id: "cfa2-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Data Rule: Measure Activity, Do Not Guess Factors",
        bodyText: "CRITICAL DATA PRINCIPLE: Employees should collect exact, verifiable activity data (invoices, meter logs, fuel receipts). Never invent missing figures or search randomly online for emission factors—authorized reporting leads apply official factors."
      }
    ]
  },
  {
    order: 2,
    title: "Scope 1, Scope 2 & Scope 3 Emissions & Sourced Facts",
    minutes: 4,
    content: "Understand direct, energy, and value-chain emissions scopes and learn sourced GHG facts.",
    blocks: [
      { id: "cfa3-h1", type: "heading", position: 1, headingText: "The Three Greenhouse Gas Scopes" },
      { id: "cfa3-t1", type: "short_text", position: 2, bodyText: "Greenhouse gas reporting categorizes emissions into three distinct scopes based on operational control:" },
      {
        id: "cfa3-k1",
        type: "key_message",
        position: 3,
        headingText: "Scope 1, Scope 2 & Scope 3",
        bodyText: "• Scope 1 (Direct Emissions): Fuel burned in company vehicles/generators, and direct AC/refrigerant gas leaks.\n• Scope 2 (Purchased Energy): Indirect emissions from purchased electricity or chilled water used in facilities.\n• Scope 3 (Value Chain): Indirect emissions from purchased goods, business travel, employee commuting, freight, and waste."
      },
      {
        id: "cfa3-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "According to the Intergovernmental Panel on Climate Change (IPCC) and GHG Protocol standards, fluorinated refrigerant gas leaks (Scope 1) trap heat in the atmosphere up to 2,000 times more effectively than CO2 per kilogram! Promptly repairing leaking air conditioners and cooling units is one of the highest-impact carbon reductions a facility can make."
      },
      {
        id: "cfa3-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "Which emissions source represents Scope 1 (Direct Emissions) for a Mauritian commercial company?",
        mcqOptions: [
          "Diesel fuel burned in company-owned delivery vans and refrigerant leaks from facility AC units",
          "Purchased electricity drawn from the central utility power grid",
          "Flights taken by third-party overseas consultants",
          "Emissions created during the manufacturing of imported paper"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Fuel burned in company-owned vehicles and direct refrigerant leaks are direct Scope 1 emissions.",
        mcqIncorrectExplanation: "Incorrect. Company vehicle fuel and direct AC leaks are Scope 1 direct emissions."
      }
    ]
  },
  {
    order: 3,
    title: "The Workplace Carbon Map & Data Verification",
    minutes: 4,
    content: "Inspect operational carbon data sources, activity records, and greenwashing risks.",
    blocks: [
      { id: "cfa4-h1", type: "heading", position: 1, headingText: "Operations Desk Carbon Data Inspection" },
      { id: "cfa4-t1", type: "short_text", position: 2, bodyText: "Examine a real Mauritian workplace operations desk. Observe the CEB electricity bill, generator fuel receipt, vehicle logbook, AC refrigerant report, handwritten guessed estimate, and '100% Zero-Carbon Office' poster." },
      {
        id: "cfa4-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-workplace-carbon-data.png",
        caption: "Operations Desk Inspection: Electricity invoice, generator fuel receipt, fleet logbook, refrigerant repair sheet, guessed estimate note, and '100% ZERO-CARBON OFFICE' poster.",
        imageAlt: "Realistic photograph of a Mauritian operations desk showing a CEB electricity invoice, generator fuel receipt, fleet vehicle logbook, AC maintenance report noting 0.5kg refrigerant added, a handwritten note reading 'Estimated travel emissions: 0.1 tons (guessed)', and a wall poster claiming '100% ZERO-CARBON OFFICE'."
      },
      {
        id: "cfa4-m1",
        type: "multiple_choice",
        position: 4,
        mcqQuestion: "In the operations desk inspection scene above, how should a responsible employee treat the handwritten note reading 'Estimated travel emissions: 0.1 tons (guessed)'?",
        mcqOptions: [
          "Reject guessed figures and locate verifiable activity data (exact fuel receipts, odometer logs, or travel invoices)",
          "Accept the guessed figure as final carbon accounting data",
          "Multiply the guessed figure by 10 to be safe",
          "Erase the note and claim travel emissions are zero"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Never rely on guessed figures for carbon data. Always track exact activity data like fuel receipts and vehicle logs.",
        mcqIncorrectExplanation: "Incorrect. Guessed carbon data is unreliable; accurate activity logs are required."
      }
    ]
  },
  {
    order: 4,
    title: "Action & Authority Boundaries",
    minutes: 3,
    content: "Structure carbon actions into direct habits, site data checks, and specialist escalation.",
    blocks: [
      { id: "cfa5-h1", type: "heading", position: 1, headingText: "Three Levels of Carbon Action" },
      { id: "cfa5-t1", type: "short_text", position: 2, bodyText: "Group your daily carbon-related workplace actions into three distinct authority levels:" },
      {
        id: "cfa5-k1",
        type: "key_message",
        position: 3,
        headingText: "Act, Check & Escalate Framework",
        bodyText: "1. ACT DIRECTLY: Avoid unnecessary equipment run-time, report refrigerant leaks, log vehicle mileage accurately.\n2. CHECK SITE PROCEDURE: Collecting monthly utility invoices, logging fuel receipts, submitting commuting survey data.\n3. ESCALATE TO MANAGEMENT: Unexplained spikes in fuel/power data, major refrigerant leaks, public carbon-neutrality claims, selecting emission factors, or buying carbon offsets."
      },
      {
        id: "cfa5-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Carbon reporting scenario:",
        decisionPrompt: "A company's annual electricity consumption dropped by 10%, but total reported carbon emissions rose by 5% because diesel generator use increased during grid outages. A marketing colleague wants to announce '10% Carbon Reduction' publicly based solely on electricity. What should you do?",
        decisionChoices: [
          { label: "Escalate to the reporting lead and ensure public statements accurately reflect the total footprint across all fuel sources", correct: true, feedback: "Outstanding! Preventing misleading public claims protects the company from severe greenwashing liability." },
          { label: "Approve the marketing announcement because lowering electricity sounds good", correct: false, feedback: "Incorrect! Omitting generator fuel emissions creates false, misleading carbon reporting." },
          { label: "Delete generator fuel receipts from company records so the numbers match", correct: false, feedback: "NEVER falsify or delete activity data records! Falsifying records violates legal and corporate governance rules." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Carbon Awareness Commitment",
    minutes: 3,
    content: "Select practical daily carbon awareness commitments for your workplace role.",
    blocks: [
      { id: "cfa6-h1", type: "heading", position: 1, headingText: "Pledge to Act" },
      { id: "cfa6-t1", type: "short_text", position: 2, bodyText: "Congratulations on completing the lessons! Select the carbon awareness habits you commit to practice in your daily work routine." },
      {
        id: "cfa6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your daily workplace carbon commitments (choose at least one):",
        commitmentOptions: [
          { value: "log-accurate-data", label: "Provide exact fuel, electricity, and activity data without guessing", description: "Support accurate carbon accounting with verifiable receipts and logs." },
          { value: "report-refrigerant-leaks", label: "Report AC refrigerant leaks and cooling faults immediately", description: "Prevent high-impact Scope 1 fluorinated gas emissions." },
          { value: "avoid-unsupported-claims", label: "Avoid repeating unverified 'zero-carbon' or 'carbon-neutral' marketing claims", description: "Protect company credibility against greenwashing risks." },
          { value: "optimize-facility-energy", label: "Reduce unnecessary equipment run-time and travel where practical", description: "Lower operational energy draw and Scope 1 & 2 emissions." },
          { value: "escalate-data-anomalies", label: "Escalate unexplained energy spikes or missing records to management", description: "Ensure operational carbon data integrity." }
        ]
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "What is the relationship between activity data and emission factors in carbon accounting?",
    options: [
      "Activity data measures operational quantities (litres of fuel, kWh of electricity), while emission factors convert that data into estimated CO2e emissions",
      "Activity data and emission factors are identical terms for utility bills",
      "Emission factors are guessed numbers invented by frontline employees",
      "Activity data is only collected when a company is carbon neutral"
    ],
    correct: 0,
    correctExplanation: "Activity data measures physical consumption (litres, kWh), while emission factors convert activity data into CO2e estimates.",
    incorrectExplanation: "Incorrect. Activity data measures physical usage; emission factors convert activity data to CO2e."
  },
  {
    order: 2,
    question: "Which option represents a Scope 1 (Direct) greenhouse gas emission?",
    options: [
      "Diesel fuel burned in company-owned delivery trucks or direct AC refrigerant leaks",
      "Purchased electricity drawn from the central power grid",
      "Emissions generated during the production of paper bought from a supplier",
      "Commercial flights taken by overseas customers"
    ],
    correct: 0,
    correctExplanation: "Fuel burned in company-owned vehicles and direct AC refrigerant leaks are Scope 1 direct emissions.",
    incorrectExplanation: "Incorrect. Direct fuel combustion and refrigerant leaks are Scope 1 emissions."
  },
  {
    order: 3,
    question: "Why are AC refrigerant gas leaks considered a high-priority carbon issue for Mauritian facilities?",
    options: [
      "Fluorinated refrigerant gases have global warming potentials up to 2,000 times greater than CO2 per kilogram",
      "Refrigerant gas leaks increase paper printing costs",
      "Refrigerants automatically turn grid electricity green",
      "Refrigerant leaks are required by law in commercial offices"
    ],
    correct: 0,
    correctExplanation: "Refrigerant gases have extreme global warming potentials compared to CO2, making leak repair a top priority.",
    incorrectExplanation: "Incorrect. Fluorinated refrigerants trap heat up to thousands of times more effectively than CO2."
  },
  {
    order: 4,
    question: "How should a company evaluate a supplier claiming a product is '100% Carbon Neutral'?",
    options: [
      "Request verifiable reporting boundaries, methodology details, and third-party verification before accepting the claim",
      "Publish the claim immediately on marketing brochures without asking for data",
      "Assume the supplier has eliminated all environmental impact",
      "Pay the supplier extra money without checking records"
    ],
    correct: 0,
    correctExplanation: "Unverified 'carbon neutral' claims require defined reporting boundaries, methodology evidence, and verification.",
    incorrectExplanation: "Incorrect. Carbon neutral claims require verifiable reporting boundaries and methodology evidence."
  },
  {
    order: 5,
    question: "At the end of the year, facility electricity draw fell by 10%, but total company carbon emissions rose due to heavy generator fuel use. How should management respond?",
    options: [
      "Acknowledge total emissions across all sources accurately and investigate generator usage rather than claiming a false 10% reduction",
      "Delete generator fuel records so total emissions appear lower",
      "Claim 10% carbon reduction publicly based solely on electricity and ignore generator fuel",
      "Fire the maintenance team for tracking generator fuel"
    ],
    correct: 0,
    correctExplanation: "Total carbon footprints evaluate all emissions sources. Omitting generator fuel creates false, misleading reports.",
    incorrectExplanation: "Incorrect. Total carbon footprints evaluate all fuel and energy sources accurately."
  }
];

export async function ensureCarbonFootprintCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 10 by ID 10 or slug
      let course = null;
      
      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-07"))
        .limit(1);

      if (byCode) {
        course = byCode;
      } else {
        const [bySlug] = await tx
          .select()
          .from(coursesTable)
          .where(eq(coursesTable.slug, COURSE_SLUG))
          .limit(1);
        if (bySlug) {
          course = bySlug;
        } else {
          const [byId] = await tx
            .select()
            .from(coursesTable)
            .where(eq(coursesTable.id, COURSE_ID))
            .limit(1);
          course = byId ?? null;
        }
      }

      if (!course) {
        throw new Error("Course ELH-07 / carbon-footprint-awareness not seeded by catalogue skeletons bootstrap!");
      }

      const courseId = course.id;

      // 2. Fetch seed marker and existing database content
      const [existingSeed] = await tx
        .select()
        .from(systemSeedsTable)
        .where(eq(systemSeedsTable.name, SEED_NAME))
        .limit(1);

      const existingLessons = await tx
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, courseId));

      const existingQuizQuestions = await tx
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, courseId));

      // 3. Evaluate integrity violations
      const hasMissingLessons = existingLessons.length !== 6;
      const hasEmptyBlocks = existingLessons.some(
        (l) => !l.contentBlocks || !Array.isArray(l.contentBlocks) || l.contentBlocks.length === 0
      );
      const hasMissingQuiz = existingQuizQuestions.length !== 5;
      const hasIncorrectSlug = course.slug !== COURSE_SLUG;

      const needsRepair = !existingSeed ||
                          hasMissingLessons ||
                          hasEmptyBlocks ||
                          hasMissingQuiz ||
                          hasIncorrectSlug;

      if (!needsRepair) {
        logger.info({ courseId, slug: COURSE_SLUG }, "Carbon Footprint Awareness course content and v3 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v3 seed detected for Course ELH-07. Re-seeding course content and lessons transactionally...");

      // 4. Resolve next recommended course dynamically by slug
      const [nextCourse] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.slug, "climate-change-mauritian-context"))
        .limit(1);
      const nextCourseId = nextCourse?.id ?? null;

      // 5. Update course record slug, title, and metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-07",
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
          recommendedNextCourseId: nextCourseId,
          isPublished: true,
          status: "published",
        })
        .where(eq(coursesTable.id, courseId));

      // 6. Seed/re-seed lessons with exact position block arrays
      await tx.delete(lessonsTable).where(eq(lessonsTable.courseId, courseId));
      for (const newLesson of NEW_LESSONS) {
        await tx.insert(lessonsTable).values({
          courseId,
          title: newLesson.title,
          orderIndex: newLesson.order,
          durationMinutes: newLesson.minutes,
          content: newLesson.content,
          contentBlocks: newLesson.blocks,
          isArchived: false,
        });
      }

      // 7. Seed/re-seed quiz questions
      await tx.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, courseId));
      await tx.insert(quizQuestionsTable).values(
        NEW_QUIZ.map((q) => ({
          courseId,
          question: q.question,
          options: q.options,
          correctOption: q.correct,
          orderIndex: q.order,
          correctExplanation: q.correctExplanation,
          incorrectExplanation: q.incorrectExplanation,
          isArchived: false,
        }))
      );

      // 8. Idempotently seed/update badge definition
      await tx
        .insert(badgeDefinitionsTable)
        .values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "cloud",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 12,
        })
        .onConflictDoUpdate({
          target: badgeDefinitionsTable.slug,
          set: {
            name: COURSE_META.badgeName,
            description: COURSE_META.badgeDescription,
            courseIds: [courseId],
          },
        });

      // 9. Save seed marker version
      if (!existingSeed) {
        await tx.insert(systemSeedsTable).values({
          name: SEED_NAME,
          version: 3,
        });
      } else {
        await tx.update(systemSeedsTable).set({ version: 3 }).where(eq(systemSeedsTable.name, SEED_NAME));
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Carbon Footprint Awareness course v3 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Carbon Footprint Awareness course");
  }
}
