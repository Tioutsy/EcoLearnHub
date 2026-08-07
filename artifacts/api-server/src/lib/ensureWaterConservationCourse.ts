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

const COURSE_ID = 4;
const COURSE_SLUG = "water-conservation";
const COURSE_TITLE = "Water Conservation";
const BADGE_SLUG = "water-wise-at-work";
const SEED_NAME = "water-conservation-v2";

const COURSE_META = {
  description:
    "Learn how daily workplace habits, early leak reporting, and sensible conservation boundaries eliminate water waste without compromising hygiene, safety, or operational standards.",
  fullDescription:
    "This course covers practical water efficiency routines across Mauritian commercial facilities. It teaches employees how to identify hidden leaks, eliminate unnecessary running water, distinguish direct employee actions from technical escalation, and ensure that water conservation never compromises essential handwashing, sanitation, food safety, or operational safety.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "1400.00",
  level: "Foundation",
  isFeatured: false,
  thumbnailUrl: "/images/courses/water-conservation.png",
  learningObjectives: [
    "Explain why responsible water use matters to employees, businesses, and the Mauritian environment.",
    "Identify common forms of avoidable water waste in commercial and service workplaces.",
    "Take safe, practical actions to reduce water waste within employee authority.",
    "Distinguish between direct actions, site-procedure checks, and issues requiring technical escalation.",
    "Respond appropriately to realistic workplace water-use and leak scenarios.",
    "Select one practical workplace commitment to support responsible water stewardship."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "You have completed Water Conservation. You can now recognise common water waste, practice sensible water stewardship during daily work, and escalate plumbing faults safely.",
  badgeName: "Workplace Water Steward",
  badgeDescription:
    "Awarded for demonstrating practical workplace water-conservation awareness, safe escalation, and responsible water stewardship.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "The Leak Everyone Walks Past",
    minutes: 3,
    content: "Understand why reporting minor leaks and water waste matters in Mauritian workplaces.",
    blocks: [
      { id: "wc1-h1", type: "heading", position: 1, headingText: "Arriving at a Service Area" },
      { id: "wc1-t1", type: "short_text", position: 2, bodyText: "Imagine walking into a workplace service area. A washroom tap is dripping continuously into a filled sink, an outdoor hose is running water onto hard pavement, and a toilet cistern keeps refilling in the background. Several staff members have walked past, assuming someone else reported it. Nobody did." },
      { id: "wc1-k1", type: "key_message", position: 3, headingText: "Do Not Assume Someone Else Has Reported It", bodyText: "Never assume another colleague or cleaner has reported a leak. Reporting a small dripping tap or running cistern takes less than a minute, preventing thousands of litres of wasted treated water and avoiding major pipe bursts." },
      {
        id: "wc1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Morning arrival decision scenario:",
        decisionPrompt: "You notice a washroom tap dripping continuously after use. It has been like this for two days. What should you do?",
        decisionChoices: [
          { label: "Report the exact location and dripping issue to facilities or management promptly", correct: true, feedback: "Perfect! Prompt reporting through approved channels prevents cumulative water waste and larger plumbing damage." },
          { label: "Ignore it, assuming maintenance will notice it during regular checks", correct: false, feedback: "Incorrect. Assuming others will report it allows minor leaks to waste thousands of litres over time." },
          { label: "Attempt to dismantle the tap fixture with personal tools to fix it yourself", correct: false, feedback: "Never attempt unauthorized plumbing repairs! General employees should report faults to qualified facilities staff." }
        ]
      },
      {
        id: "wc1-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "Why should employees report minor dripping taps or refilling cisterns immediately?",
        mcqOptions: [
          "Small persistent leaks add up to thousands of litres of wasted water over time and may indicate worsening pipe faults",
          "Dripping taps are required by building regulations to remain unreported",
          "Building management pays employees a cash bonus for every leak reported",
          "Water meters stop running when leaks are small"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Persistent drips waste massive volumes of treated water and signal underlying valve or pipe wear.",
        mcqIncorrectExplanation: "Incorrect. Minor leaks cause significant cumulative loss and require early reporting."
      }
    ]
  },
  {
    order: 1,
    title: "Why Water Conservation Matters in Mauritius",
    minutes: 3,
    content: "Connect responsible water use to community, business continuity, and island ecosystems.",
    blocks: [
      { id: "wc2-h1", type: "heading", position: 1, headingText: "Three Water Conservation Perspectives" },
      { id: "wc2-t1", type: "short_text", position: 2, bodyText: "In Mauritius, treated fresh water is a vital shared resource. Efficient water management in commercial premises supports island resilience across three key areas:" },
      {
        id: "wc2-k1",
        type: "key_message",
        position: 3,
        headingText: "Community, Business & Environment",
        bodyText: "• Community Impact: Responsible commercial water use ensures steady supply for local healthcare, domestic, and municipal needs.\n• Business Continuity: Eliminating leaks prevents structural water damage, avoids high utility surcharges, and ensures uninterrupted operational service.\n• Environmental Protection: Reducing unnecessary pumping and treatment lowers grid electricity load and protects coastal ecosystems."
      },
      {
        id: "wc2-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Hygiene & Safety Protection Rule",
        bodyText: "CRITICAL PRINCIPLE: Water conservation must NEVER compromise handwashing, surface sanitization, food safety, or medical infection control. Always use necessary water for thorough hygiene—conservation targets avoidable waste, not essential sanitation."
      }
    ]
  },
  {
    order: 2,
    title: "Common Sources of Waste & Sourced Facts",
    minutes: 4,
    content: "Identify frequent sources of workplace water loss and learn sourced conservation facts.",
    blocks: [
      { id: "wc3-h1", type: "heading", position: 1, headingText: "Recognising Avoidable Water Waste" },
      { id: "wc3-t1", type: "short_text", position: 2, bodyText: "Avoidable water waste frequently occurs during routine cleaning, washroom use, landscaping, and kitchen operations." },
      {
        id: "wc3-f1",
        type: "memorable_fact",
        position: 3,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "According to United Nations Environment Programme (UNEP) and WHO technical guidelines, a single commercial tap dripping at just 1 drip per second wastes over 11,000 litres of clean treated water per year! Promptly closing taps fully and reporting worn washers eliminates this massive hidden loss."
      },
      {
        id: "wc3-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Misconception: Hose Down vs Broom Cleaning",
        bodyText: "Myth: 'Hosing down outdoor hardstanding and walkways is the fastest way to clean.' Fact: Sweeping hard surfaces with a broom before spot-cleaning uses up to 90% less water and prevents silt runoff into storm drains."
      },
      {
        id: "wc3-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "Which practice represents avoidable workplace water waste?",
        mcqOptions: [
          "Leaving a garden hose running continuously on hard pavement while taking a break",
          "Washing hands thoroughly with soap for 20 seconds as required by hygiene guidelines",
          "Sanitizing food-prep surfaces using required water concentrations",
          "Operating a commercial dishwasher only when fully loaded"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Leaving hoses running on hard pavement is pure waste. Handwashing and food safety sanitation are essential needs.",
        mcqIncorrectExplanation: "Incorrect. Running hoses unattended on pavement wastes water; handwashing and food sanitation are non-negotiable."
      }
    ]
  },
  {
    order: 3,
    title: "Inspecting Workplace Water Boundaries",
    minutes: 4,
    content: "Practice identifying water waste, safety hazards near electricity, and escalation rules.",
    blocks: [
      { id: "wc4-h1", type: "heading", position: 1, headingText: "Workplace Service Area Inspection" },
      { id: "wc4-t1", type: "short_text", position: 2, bodyText: "Examine a real Mauritian workplace service area. Observe the dripping sink tap, the outdoor hose running on pavement, and the electrical safety warning sign." },
      {
        id: "wc4-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-workplace-water-waste.png",
        caption: "Workplace Service Area Inspection: Stainless steel sink with dripping tap, outdoor running hose, and safety sign: 'CAUTION: KEEP ELECTRICAL EQUIPMENT DRY - REPORT LEAKS IMMEDIATELY'.",
        imageAlt: "Realistic photograph of a modern Mauritian workplace service area featuring a stainless steel sink with a dripping commercial tap, an open doorway showing a hose running on hard pavement, and a prominent warning sign: CAUTION: KEEP ELECTRICAL EQUIPMENT DRY - REPORT LEAKS IMMEDIATELY."
      },
      {
        id: "wc4-m1",
        type: "multiple_choice",
        position: 4,
        mcqQuestion: "In the workplace inspection scene above, what must you do if you observe water pooling near an electrical appliance or wall outlet?",
        mcqOptions: [
          "Escalate the hazard immediately to facilities/safety officers without touching electrical equipment or stepping into pooled water",
          "Mop up the water while holding active power cords with bare hands",
          "Ignore the water because electricity and water naturally mix",
          "Attempt to repair the electrical outlet using a metal screwdriver"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Water near electrical equipment presents severe electrocution hazards. Never touch electrical gear in wet conditions—escalate to safety staff immediately.",
        mcqIncorrectExplanation: "Incorrect. Water near electrical equipment is a life-safety hazard requiring immediate professional escalation."
      }
    ]
  },
  {
    order: 4,
    title: "Action Boundaries: Act, Check & Escalate",
    minutes: 3,
    content: "Categorize water actions into direct employee habits, site checks, and technical escalation.",
    blocks: [
      { id: "wc5-h1", type: "heading", position: 1, headingText: "Three Levels of Action" },
      { id: "wc5-t1", type: "short_text", position: 2, bodyText: "Group your daily workplace water actions into three distinct safety levels:" },
      {
        id: "wc5-k1",
        type: "key_message",
        position: 3,
        headingText: "Act, Check & Escalate Framework",
        bodyText: "1. ACT DIRECTLY: Turn off running taps fully, sweep hard surfaces before washing, report visible drips.\n2. CHECK SITE PROCEDURE: Scheduled landscape watering, commercial dishwashing load rules, authorized water reuse.\n3. ESCALATE TO FACILITIES: Persistent leaks, running toilet cisterns, burst pipes, water near electrical gear, or concealed wall dampness."
      },
      {
        id: "wc5-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "End-of-shift persistent leak scenario:",
        decisionPrompt: "At 5:30 PM on a Friday, you discover a slow leak under a kitchen sink. Water is dripping into a bucket, but the bucket will overflow by morning. The main maintenance technician has left. What should you do?",
        decisionChoices: [
          { label: "Place a larger temporary basin and notify the emergency facilities/after-hours contact with the exact location", correct: true, feedback: "Outstanding! Combining temporary containment with official after-hours escalation prevents weekend flooding." },
          { label: "Leave the small bucket as is and go home without telling anyone", correct: false, feedback: "Incorrect! The bucket will overflow overnight, causing floor damage." },
          { label: "Turn off random main water valves in the building basement without authorization", correct: false, feedback: "Never turn main building valves without training! Doing so may cut off fire suppression or essential hygiene lines." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Water Stewardship Commitment",
    minutes: 3,
    content: "Select practical daily water-saving commitments for your work routine.",
    blocks: [
      { id: "wc6-h1", type: "heading", position: 1, headingText: "Pledge to Act" },
      { id: "wc6-t1", type: "short_text", position: 2, bodyText: "Congratulations on completing the lessons! Select the water stewardship habits you commit to practice in your daily work routine." },
      {
        id: "wc6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your daily workplace water commitments (choose at least one):",
        commitmentOptions: [
          { value: "report-drips", label: "Report dripping taps or running toilet cisterns promptly", description: "Prevent hidden water loss by notifying facilities immediately." },
          { value: "close-taps-fully", label: "Ensure washroom and kitchen taps are fully closed after use", description: "Eliminate avoidable drip waste during routine work." },
          { value: "sweep-before-wash", label: "Sweep walkways and hardstanding before spot-cleaning", description: "Replace excessive hose washing with efficient broom sweeping." },
          { value: "protect-hygiene", label: "Maintain essential handwashing and hygiene standards", description: "Ensure water conservation never compromises health or sanitation." },
          { value: "escalate-electrical-hazards", label: "Escalate leaks near electrical gear or concealed pipes", description: "Prioritize workplace safety by reporting complex leaks safely." }
        ]
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "Why should employees report minor dripping taps or refilling cisterns promptly?",
    options: [
      "Dripping taps improve building air humidity and should not be reported",
      "Water meters do not register small dripping leaks",
      "Persistent minor drips waste thousands of litres of clean water annually and signal potential pipe failure",
      "Building management pays cash rewards for every reported drip"
    ],
    correct: 2,
    correctExplanation: "Minor drips add up to thousands of litres of cumulative waste and can lead to severe pipe bursts if neglected.",
    incorrectExplanation: "Incorrect. Minor leaks waste large volumes of treated water and require early reporting."
  },
  {
    order: 2,
    question: "What is the relationship between water conservation and workplace hygiene guidelines?",
    options: [
      "Water conservation targets avoidable waste, but essential handwashing, sanitation, and food safety must NEVER be reduced",
      "Employees should stop washing hands to save water",
      "Hygiene procedures should only be followed during rainy seasons",
      "Food preparation surfaces should never be washed with clean water"
    ],
    correct: 0,
    correctExplanation: "Hygiene, handwashing, and food safety are mandatory standards that must never be compromised for water saving.",
    incorrectExplanation: "Incorrect. Essential health, hygiene, and food safety standards take strict priority over water savings."
  },
  {
    order: 3,
    question: "Which action should be classified under 'TECHNICAL ESCALATION' rather than direct employee action?",
    options: [
      "Closing a tap fully after washing hands",
      "Repairing a concealed wall pipe leak or water near an electrical panel",
      "Sweeping hardstanding before washing with a bucket",
      "Reporting an unclosed outdoor garden hose"
    ],
    correct: 1,
    correctExplanation: "Concealed plumbing repairs and leaks near electrical equipment pose extreme safety risks and require technical facilities escalation.",
    incorrectExplanation: "Incorrect. Concealed leaks and electrical water hazards require professional technical maintenance."
  },
  {
    order: 4,
    question: "What is a water-efficient alternative to hosing down outdoor hardstanding and walkways?",
    options: [
      "Leaving water running continuously for two hours",
      "Using high-pressure hot water on clean concrete",
      "Flooding walkways with drinking water",
      "Sweeping surfaces thoroughly with a broom before spot-cleaning with a bucket"
    ],
    correct: 3,
    correctExplanation: "Broom sweeping removes debris dry, using up to 90% less water than continuous hose washing.",
    incorrectExplanation: "Incorrect. Sweeping prior to spot cleaning dramatically cuts water consumption."
  },
  {
    order: 5,
    question: "At the end of your shift, you notice water pooling under a staff sink near an electrical socket. What is the safest response?",
    options: [
      "Attempt to rewire the electrical socket yourself using wet towels",
      "Report the hazard immediately to after-hours facilities/safety contact without touching electrical equipment",
      "Ignore it and leave the building without telling anyone",
      "Step into the water pool to inspect the socket closely"
    ],
    correct: 1,
    correctExplanation: "Water near electrical sockets presents fatal shock risks. Escalate to safety/facilities personnel immediately.",
    incorrectExplanation: "Incorrect. Water near electrical equipment requires immediate professional safety escalation."
  }
];

export async function ensureWaterConservationCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 4 by ID 4 or slug
      let course = null;
      
      const [byId] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.id, COURSE_ID))
        .limit(1);

      if (byId) {
        course = byId;
      } else {
        const [bySlug] = await tx
          .select()
          .from(coursesTable)
          .where(eq(coursesTable.slug, COURSE_SLUG))
          .limit(1);
        course = bySlug ?? null;
      }

      if (!course) {
        throw new Error("Course 4 not seeded by catalogue skeletons bootstrap!");
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
        logger.info({ courseId, slug: COURSE_SLUG }, "Water Conservation course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course 4. Re-seeding course content and lessons transactionally...");

      // 4. Resolve next recommended course dynamically by slug
      const [nextCourse] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.slug, "carbon-footprint-awareness"))
        .limit(1);
      const nextCourseId = nextCourse?.id ?? null;

      // 5. Update course record slug, title, and metadata
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
          icon: "droplet",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 9,
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
          version: 2,
        });
      } else {
        await tx.update(systemSeedsTable).set({ version: 2 }).where(eq(systemSeedsTable.name, SEED_NAME));
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Water Conservation course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Water Conservation course");
  }
}
