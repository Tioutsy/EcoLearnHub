import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
  quizAttemptsTable,
} from "@workspace/db";
import { eq, and, or } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_SLUG = "sustainability-foundations";
const COURSE_TITLE = "Sustainability Foundations";
const BADGE_SLUG = "sustainability-starter";
const SEED_NAME = "sustainability-foundations-pilot-v2";

const COURSE_META = {
  description:
    "A short, practical introduction to workplace sustainability. In about 20 minutes, you will learn what sustainability really means, why it matters for Mauritius, and the simple actions you can take at work every day.",
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
  badgeName: "Sustainability Starter",
  badgeDescription: "Awarded for completing the Sustainability Foundations course and making a personal workplace commitment."
};

const V1_TITLES = [
  "Welcome to Sustainability",
  "Why Sustainability Matters",
  "Sustainability in Mauritius",
  "Your Role as an Employee",
  "Everyday Sustainability Actions",
  "Your Sustainability Commitment"
];

const NEW_LESSONS = [
  {
    order: 0,
    title: "Welcome to Sustainability",
    minutes: 3,
    content: "Introduction to practical daily sustainability.",
    blocks: [
      { id: "wel-h1", type: "heading", position: 1, headingText: "Sustainability Starts at Work" },
      { id: "wel-t1", type: "short_text", position: 2, bodyText: "Sustainability is a simple idea: meeting our needs today without taking away what future generations will need tomorrow. It's about how we use grid energy, water, and materials at work, and how we treat one another." },
      { id: "wel-k1", type: "key_message", position: 3, headingText: "Why it is for everyone", bodyText: "You don't need to be a sustainability expert. Every person makes small choices each day. Added together, these choices protect Mauritius and help the business stay strong. True sustainability starts by preventing waste and conserving resources before they are even used." },
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
      },
      {
        id: "wel-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "What does sustainability mean in simple terms?",
        mcqOptions: [
          "Using resources today in a way that still leaves enough for the future",
          "Spending as much as possible right now",
          "A concern only for large factories",
          "A rule that applies only to government offices"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Sustainability is about balance: using what we need today while protecting what future generations will need.",
        mcqIncorrectExplanation: "Incorrect. The main idea is balancing current and future needs."
      }
    ]
  },
  {
    order: 1,
    title: "The Three Dimensions of Sustainability",
    minutes: 4,
    content: "Understanding the three pillars of sustainability.",
    blocks: [
      { id: "dim-h1", type: "heading", position: 1, headingText: "Environmental, Social, and Economic Pillars" },
      { id: "dim-t1", type: "short_text", position: 2, bodyText: "Sustainability rests on three connected pillars. We care for the environment, we support people and communities, and we keep the business healthy. When these three work together, everyone benefits." },
      { id: "dim-k1", type: "key_message", position: 3, headingText: "The Three Pillars", bodyText: "Environmental: protect nature and resources. Social (People): build fair, safe, and positive workplaces. Economic (Business): stay profitable and trusted for the long term." },
      {
        id: "dim-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Try this pillar interaction scenario:",
        decisionPrompt: "A company decides to replace single-use plastic cups in the breakroom with reusable mugs and glasses. Which dimensions of sustainability does this change improve?",
        decisionChoices: [
          { label: "All three: environmental (less waste), economic (cost savings), and social (clean office space)", correct: true, feedback: "Perfect! This simple change simultaneously reduces waste, saves the company cup purchasing costs, and provides a cleaner experience for employees." },
          { label: "Only the environmental dimension by reducing plastic cups", correct: false, feedback: "While true, it also saves money and benefits staff. The dimensions are connected!" },
          { label: "None, as it is too small to make any real business impact", correct: false, feedback: "No change is too small. Daily habits accumulate into significant environmental and financial returns." }
        ]
      },
      {
        id: "dim-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "Which statement best describes the pillars of sustainability?",
        mcqOptions: [
          "Only making more profit",
          "Balancing environmental, social, and economic needs",
          "Ignoring community needs",
          "Using more energy every year"
        ],
        mcqCorrectIndex: 1,
        mcqCorrectExplanation: "True sustainability balances the environment, people, and the economy at the same time.",
        mcqIncorrectExplanation: "Incorrect. All three dimensions must be balanced."
      }
    ]
  },
  {
    order: 2,
    title: "Why Sustainability Matters to a Business",
    minutes: 3,
    content: "Connecting responsible practices to company success.",
    blocks: [
      { id: "biz-h1", type: "heading", position: 1, headingText: "Practical Business Benefits" },
      { id: "biz-t1", type: "short_text", position: 2, bodyText: "Why do organisations invest in sustainability? Responsible workplace practices are not just about doing good; they are critical to business survival and success. Here are the key benefits:" },
      { id: "biz-k1", type: "key_message", position: 3, headingText: "Business Value Pillars", bodyText: "* Reduced Waste & Costs: Minimizing resource consumption directly lowers monthly operating expenses.\n* Stakeholder Confidence: Clients and partners prefer doing business with companies that behave responsibly.\n* Employee Engagement: Employees feel prouder and more motivated when working for a responsible company.\n* Risk Awareness: Conserving water and using energy efficiently prepares businesses for supply disruptions." },
      { id: "biz-k2", type: "key_message", position: 4, headingText: "ESG Simply Explained", bodyText: "ESG refers to Environmental, Social, and Governance—the standard categories used to measure how a company manages its wider responsibilities and reports evidence of its performance." },
      {
        id: "biz-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "A company that acts responsibly usually benefits by:",
        mcqOptions: [
          "Losing all of its customers",
          "Building trust and saving resource costs over time",
          "Having nothing to gain",
          "Stopping all of its operations"
        ],
        mcqCorrectIndex: 1,
        mcqCorrectExplanation: "Responsible companies tend to cut waste, lower costs, and earn the trust of customers and staff.",
        mcqIncorrectExplanation: "Incorrect. Companies gain trust and cost savings through sustainability."
      }
    ]
  },
  {
    order: 3,
    title: "Sustainability in Mauritius",
    minutes: 4,
    content: "Local island constraints and responsibilities.",
    blocks: [
      { id: "mau-h1", type: "heading", position: 1, headingText: "Local Island Realities" },
      { id: "mau-t1", type: "short_text", position: 2, bodyText: "Living on an island like Mauritius, resource constraints are immediate and visible. Whether you work in an office in Port Louis, a hotel, a retail outlet, a warehouse, or a manufacturing facility, your choices have local consequences." },
      { id: "mau-k1", type: "key_message", position: 3, headingText: "Three Local Challenges", bodyText: "* Limited Landfill Capacity: Our main landfill site at Mare Chicose is facing volume capacity limits, making waste prevention and sorting critical.\n* Freshwater Pressures: Fresh water resources are under pressure, especially during the dry season, making leak reporting vital.\n* Grid Energy: A major portion of our grid electricity is generated from imported fossil fuels, so saving power at work directly reduces energy imports." },
      {
        id: "mau-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Scenario: Hotel Water Efficiency Initiative.\nA hotel employee notices that garden sprinklers are running during midday heat when water quickly evaporates.",
        decisionPrompt: "What is the most practical first action?",
        decisionChoices: [
          { label: "Report the timing issue to the maintenance team and suggest watering during cooler early morning or evening hours", correct: true, feedback: "Correct! Midday watering loses up to 40% of water to evaporation. Adjusting the schedule saves water resources significantly." },
          { label: "Ignore it, as garden care is not part of your job description", correct: false, feedback: "Water security affects everyone in Mauritius. Every employee can suggest simple improvements." }
        ]
      },
      {
        id: "mau-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "Where does most household waste in Mauritius end up?",
        mcqOptions: [
          "The Mare Chicose landfill",
          "The sea near Port Louis",
          "A recycling plant in every village",
          "Reunion Island"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Most household waste in Mauritius is sent to the Mare Chicose landfill, so reducing and sorting waste really matters.",
        mcqIncorrectExplanation: "Incorrect. The main landfill is Mare Chicose."
      },
      {
        id: "mau-m2",
        type: "multiple_choice",
        position: 6,
        mcqQuestion: "Which is a real environmental challenge for Mauritius?",
        mcqOptions: [
          "Too much unused farmland",
          "No coastline to protect",
          "Unlimited landfill space",
          "Limited land for waste and pressure on fresh water"
        ],
        mcqCorrectIndex: 3,
        mcqCorrectExplanation: "As a small island, Mauritius has limited space for waste and must protect its fresh water carefully.",
        mcqIncorrectExplanation: "Incorrect. Mauritius has limited land and fresh water resources."
      }
    ]
  },
  {
    order: 4,
    title: "Everyday Decisions and Their Consequences",
    minutes: 3,
    content: "Apply your judgement to a realistic workplace event.",
    blocks: [
      { id: "dec-h1", type: "heading", position: 1, headingText: "Interactive Scenario: Preparing for a Shift" },
      { id: "dec-t1", type: "short_text", position: 2, bodyText: "Let's apply your learning. You are setting up a meeting room and ordering lunch for a 15-person department training event tomorrow morning." },
      {
        id: "dec-d1",
        type: "decision_scenario",
        position: 3,
        decisionIntro: "Scenario: Event Catering Choices.\nYou need to choose between ordering individual boxed lunches with disposable cutlery, or a buffet setup with reusable plates and glasses.",
        decisionPrompt: "Which choice is most sustainable?",
        decisionChoices: [
          { label: "The buffet setup with reusable tableware", correct: true, feedback: "Perfect! Reusable tableware prevents single-use plastic waste from entering Mare Chicose and represents long-term circular economy principles." },
          { label: "The individual boxed lunches for convenience, throwing everything in the general bin", correct: false, feedback: "This creates large amounts of avoidable packaging and single-use plastic waste, compounding landfill pressures." }
        ]
      },
      {
        id: "dec-d2",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Scenario: Meeting Handouts.\nYou need to prepare printed reference guides for the attendees.",
        decisionPrompt: "What is the most sustainable approach?",
        decisionChoices: [
          { label: "Question if prints are necessary, share digital copies, and print double-sided draft copies only for those who request it", correct: true, feedback: "Excellent! Preventing waste is the most sustainable practice. Digital-first and double-sided printing save paper and energy." },
          { label: "Print single-sided, full-color booklets for everyone and some extra copies to be safe", correct: false, feedback: "This creates high paper and energy consumption. Printing excess copies leads to direct resource waste." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Role in Workplace Sustainability",
    minutes: 3,
    content: "Turning awareness into action commitments.",
    blocks: [
      { id: "rol-h1", type: "heading", position: 1, headingText: "Your Personal Action Commitment" },
      { id: "rol-t1", type: "short_text", position: 2, bodyText: "You are not expected to solve global environmental crises alone. Your role is simply to act responsibly within your job, follow procedures, report problems, and support colleagues." },
      { id: "rol-k1", type: "key_message", position: 3, headingText: "Start with one or two", bodyText: "You do not have to change everything at once. Pick the commitments that feel realistic for you. We will save your choices so you can track them over time." },
      {
        id: "rol-c1",
        type: "commitment",
        position: 4,
        commitmentInstruction: "Select the commitments you are ready to make. Choose at least one.",
        commitmentOptions: [
          { value: "reduce-waste", label: "Reduce waste: Use reusable bottles, cups, and print only when essential.", description: "Use less, reuse where I can, and sort my rubbish properly." },
          { value: "save-water", label: "Save water: Turn off taps tightly and report dripping fixtures immediately.", description: "Turn off taps when not in use and report leaks quickly." },
          { value: "save-energy", label: "Save energy: Switch off lights, computer monitors, and AC when leaving rooms empty.", description: "Switch off lights, screens, and air conditioning when not needed." },
          { value: "report-leaks", label: "Report issues: Report water leaks or energy faults to maintenance promptly.", description: "Report water leaks and maintenance issues quickly." }
        ]
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 0,
    question: "Which of the following best describes what sustainability means in a daily workplace context?",
    options: [
      "Using resource-saving practices that ensure our actions today do not compromise the resources available for future generations.",
      "Stopping all business operations and paper use completely, regardless of operational impacts.",
      "Focusing exclusively on recycling office waste while ignoring other resource uses.",
      "Applying theories only when mandated by external government inspectors."
    ],
    correct: 0,
    correctExplanation: "Correct! Sustainability balances current resource use with future needs.",
    incorrectExplanation: "Incorrect. The main idea of sustainability is balancing current and future needs.",
    optionFeedback: [
      "Correct. This represents balanced, practical resource stewardship.",
      "Incorrect. Halting operations is not viable; sustainability is about responsible efficiency.",
      "Incorrect. Recycling is only one small part; preventing waste and saving energy are equally important.",
      "Incorrect. Sustainability is a proactive cultural practice, not just compliance."
    ]
  },
  {
    order: 1,
    question: "A company decides to replace single-use plastic water bottles with filtered water stations and reusable glasses. Which dimensions of sustainability does this action affect?",
    options: [
      "Only the environmental dimension by reducing plastic waste.",
      "Only the economic dimension by reducing recurring purchasing costs.",
      "All three dimensions: environmental (less plastic waste), economic (cost savings over time), and social (convenient hydration and hygiene for staff).",
      "None of the dimensions, as it is a minor operational change."
    ],
    correct: 2,
    correctExplanation: "Correct! Most workplace sustainability decisions are connected, simultaneously benefiting the environment, people, and the business.",
    incorrectExplanation: "Incorrect. Sustainability requires balancing all three pillars.",
    optionFeedback: [
      "Incorrect. It does reduce waste, but it also has social and economic benefits.",
      "Incorrect. While it saves money long-term, it also reduces environmental waste and helps employees.",
      "Correct. Excellent! This choice illustrates how the three dimensions are connected.",
      "Incorrect. Even minor changes contribute positive cumulative effects across the pillars."
    ]
  },
  {
    order: 2,
    question: "Living on an island like Mauritius, which of these is a critical resource reality that employees should keep in mind during daily operations?",
    options: [
      "Mauritius has unlimited landfill space and imports zero energy.",
      "Fresh water resources are under seasonal pressure, and our landfill capacity is limited.",
      "Coastal ecosystems are unaffected by land-based waste or run-off.",
      "Daily energy conservation has no effect because electricity is fully solar-powered."
    ],
    correct: 1,
    correctExplanation: "Correct! Mauritius faces specific island constraints: limited landfill space (e.g. Mare Chicose) and seasonal pressure on fresh water, making resource conservation vital.",
    incorrectExplanation: "Incorrect. Mauritius has limited landfill space and water pressures.",
    optionFeedback: [
      "Incorrect. We have one primary landfill and rely significantly on imported fossil fuels.",
      "Correct. Understanding local island pressures helps us prioritize water conservation and waste reduction.",
      "Incorrect. Land-based waste and resource run-off create direct pressure on our coastal ecosystems.",
      "Incorrect. A large portion of our grid electricity is generated from imported fossil fuels, so energy saving directly reduces emissions."
    ]
  },
  {
    order: 3,
    question: "During a busy day, you notice that a faucet in the restrooms is running continuously due to a faulty valve. What is the most appropriate first action?",
    options: [
      "Leave it alone, as minor leaks do not affect company resources or island supply.",
      "Close the isolation valve underneath if possible, report the leak to maintenance immediately, and notify your team.",
      "Place a bucket under the leak and check it at the end of your weekly shift.",
      "Wait for a platform administrator or external inspector to log the issue."
    ],
    correct: 1,
    correctExplanation: "Correct! Taking immediate action to stop or report a leak prevents significant water waste, which is crucial for Mauritian water security.",
    incorrectExplanation: "Incorrect. Prompt reporting and isolating the leak is the most responsible response.",
    optionFeedback: [
      "Incorrect. A dripping tap or running faucet can waste thousands of liters of fresh water weekly.",
      "Correct. This minimizes active waste and ensures a permanent repair is scheduled.",
      "Incorrect. Buckets fill quickly; a week is too long to leave a running leak unresolved.",
      "Incorrect. Maintenance is everyone's responsibility, not just administrators."
    ]
  },
  {
    order: 4,
    question: "You are preparing printed booklets for an upcoming team meeting. How can you apply sustainability principles before starting the print job?",
    options: [
      "Print one single copy for each person, using single-sided sheets with color covers.",
      "Question whether physical printouts are necessary, use digital sharing where possible, and print double-sided only for essential copies.",
      "Print extra copies in case guests arrive, using heavy paper stock for durability.",
      "Ignore the paper count and rely on the waste sorting bin to handle clean-up later."
    ],
    correct: 1,
    correctExplanation: "Correct! Sustainable practice starts with waste prevention (questioning need and using digital alternatives) before relying on recycling.",
    incorrectExplanation: "Incorrect. Preventing waste by printing only what is necessary and sharing digitally is the preferred approach.",
    optionFeedback: [
      "Incorrect. Printing single-sided copies is a weaker choice that increases paper consumption.",
      "Correct. Prevention is the highest tier of the waste hierarchy; digital-first is both efficient and low-impact.",
      "Incorrect. Printing excess copies leads to direct resource waste.",
      "Incorrect. Recycling is a lower-value option than preventing the waste in the first place."
    ]
  },
  {
    order: 5,
    question: "Which of the following best defines an employee's role in supporting company-wide sustainability goals?",
    options: [
      "Redesigning the entire company's supply chain without manager approval.",
      "Following operational procedures, avoiding resource waste, and reporting leaks or green improvement suggestions.",
      "Enforcing strict green rules and policing colleagues' personal habits.",
      "Doing nothing because individual workplace decisions have zero cumulative impact."
    ],
    correct: 1,
    correctExplanation: "Correct! Employees support sustainability by acting responsibly in their own roles, following procedures, and reporting opportunities for improvement.",
    incorrectExplanation: "Incorrect. An employee's role is to act responsibly, follow guidelines, and suggest improvements within their own area.",
    optionFeedback: [
      "Incorrect. Supply chain redesign is an administrative task; focus on daily actions in your control.",
      "Correct. Consistently following procedures and reporting issues creates powerful company-wide outcomes.",
      "Incorrect. Sustainable culture relies on respect and support, not policing colleagues.",
      "Incorrect. Small positive choices made by everyone add up to substantial environmental and financial savings."
    ]
  }
];

export async function ensureFoundationsCourse(): Promise<void> {
  try {
    // 1. Fetch course by title or slug
    const [course] = await db
      .select()
      .from(coursesTable)
      .where(
        or(
          eq(coursesTable.id, 1),
          eq(coursesTable.slug, COURSE_SLUG),
          eq(coursesTable.slug, "Sustainability_Foundations")
        )
      )
      .limit(1);

    if (!course) {
      logger.error("Sustainability Foundations course not found in database.");
      return;
    }

    const courseId = course.id;

    // 2. Programmatic integrity checks (Repair Guard)
    let needsRepair = false;

    const existingLessons = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, courseId));

    if (existingLessons.length < 6) {
      needsRepair = true;
    } else {
      for (const newLesson of NEW_LESSONS) {
        const dbLesson = existingLessons.find((l) => l.orderIndex === newLesson.order);
        if (!dbLesson || !dbLesson.contentBlocks || (dbLesson.contentBlocks as any[]).length === 0) {
          needsRepair = true;
          break;
        }
        // Verify if it contains skeleton draft placeholders
        const hasDraftText = dbLesson.content?.includes("[DRAFT SKELETON]") || 
                             JSON.stringify(dbLesson.contentBlocks).includes("[DRAFT SKELETON]");
        if (hasDraftText) {
          needsRepair = true;
          break;
        }
      }
    }

    const existingQuestions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, courseId));

    if (existingQuestions.length !== 6 || existingQuestions.some(q => q.question.includes("[DRAFT SKELETON]"))) {
      needsRepair = true;
    }

    if (course.slug !== COURSE_SLUG) {
      needsRepair = true;
    }

    const [existingSeed] = await db
      .select()
      .from(systemSeedsTable)
      .where(eq(systemSeedsTable.name, SEED_NAME))
      .limit(1);

    if (existingSeed && !needsRepair) {
      logger.info({ seed: SEED_NAME }, "Sustainability Foundations pilot course and integrity verified. Skipping...");
      return;
    }

    if (needsRepair) {
      logger.warn({ seed: SEED_NAME }, "Sustainability Foundations integrity discrepancy detected. Running transactional repair...");
    }

    // Run the migration transactionally
    await db.transaction(async (tx) => {
      // Force slug normalization
      await tx
        .update(coursesTable)
        .set({ slug: COURSE_SLUG })
        .where(eq(coursesTable.id, courseId));

      const existingLessonsTx = await tx
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, courseId));

      for (const newLesson of NEW_LESSONS) {
        const matchingDbLesson = existingLessonsTx.find((l) => l.orderIndex === newLesson.order);
        if (matchingDbLesson) {
          const isEmpty = !matchingDbLesson.contentBlocks || (matchingDbLesson.contentBlocks as any[]).length === 0;
          const isV1Placeholder = isEmpty && V1_TITLES.includes(matchingDbLesson.title);
          const hasDraftText = matchingDbLesson.content?.includes("[DRAFT SKELETON]") || 
                               JSON.stringify(matchingDbLesson.contentBlocks).includes("[DRAFT SKELETON]");

          if (isEmpty || isV1Placeholder || hasDraftText || (matchingDbLesson.contentBlocks as any[]).length < newLesson.blocks.length) {
            await tx
              .update(lessonsTable)
              .set({
                title: newLesson.title,
                durationMinutes: newLesson.minutes,
                content: newLesson.content,
                contentBlocks: newLesson.blocks,
              })
              .where(eq(lessonsTable.id, matchingDbLesson.id));
            logger.info({ orderIndex: newLesson.order }, "Updated/repaired lesson to v2 content.");
          } else {
            logger.info({ orderIndex: newLesson.order, title: matchingDbLesson.title }, "Lesson content verified. Preserving existing edits.");
          }
        } else {
          await tx.insert(lessonsTable).values({
            courseId,
            title: newLesson.title,
            orderIndex: newLesson.order,
            durationMinutes: newLesson.minutes,
            content: newLesson.content,
            contentBlocks: newLesson.blocks,
            isArchived: false,
          });
          logger.info({ orderIndex: newLesson.order }, "Inserted missing lesson.");
        }
      }

      // Quiz question updates
      const existingQuizQuestions = await tx
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, courseId));

      const hasAdminQuizEdits = existingQuizQuestions.some(
        (q) => q.correctExplanation !== null || q.optionFeedback !== null
      );
      const isPlaceholderQuiz = existingQuizQuestions.length !== 6 || 
                                existingQuizQuestions.some(q => q.question.includes("[DRAFT SKELETON]"));

      if (!hasAdminQuizEdits || isPlaceholderQuiz) {
        await tx
          .delete(quizQuestionsTable)
          .where(eq(quizQuestionsTable.courseId, courseId));

        await tx.insert(quizQuestionsTable).values(
          NEW_QUIZ.map((q) => ({
            courseId,
            question: q.question,
            options: q.options,
            correctOption: q.correct,
            orderIndex: q.order,
            correctExplanation: q.correctExplanation,
            incorrectExplanation: q.incorrectExplanation,
            optionFeedback: q.optionFeedback,
            isArchived: false,
          }))
        );
        logger.info({ count: NEW_QUIZ.length }, "Replaced quiz questions with final v2 quiz.");
      }

      // Update course metadata
      await tx
        .update(coursesTable)
        .set({
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
          badgeName: COURSE_META.badgeName,
          badgeDescription: COURSE_META.badgeDescription,
        })
        .where(eq(coursesTable.id, courseId));

      // Seed Badge Definition
      await tx
        .insert(badgeDefinitionsTable)
        .values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "sprout",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 6,
        })
        .onConflictDoUpdate({
          target: badgeDefinitionsTable.slug,
          set: { courseIds: [courseId] },
        });

      if (!existingSeed) {
        await tx.insert(systemSeedsTable).values({
          name: SEED_NAME,
          version: 2,
        });
      }

      logger.info({ seed: SEED_NAME }, "Sustainability Foundations pilot v2 seed and integrity repair completed successfully!");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent pilot course seeding or repair");
  }
}
