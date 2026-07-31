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

const COURSE_ID = 5;
const COURSE_SLUG = "sustainable-procurement";
const COURSE_TITLE = "Sustainable Procurement";
const BADGE_SLUG = "responsible-purchasing";
const SEED_NAME = "sustainable-procurement-v2";
const SKELETON_BADGE_SLUG = "sustainable-procurement-badge"; // catalogue skeleton slug — do not delete

const COURSE_META = {
  description:
    "Learn a practical, plain-language method for evaluating workplace purchases using whole-life value, verifying green claims evidence, and maintaining strict safety, quality, and anti-bribery standards.",
  fullDescription:
    "This course helps employees, requesters, buyers, and managers make responsible purchasing decisions. It teaches how to confirm actual need, compare operating costs and durability alongside initial price, evaluate green claims evidence, and establish clear authority and ethical boundaries in Mauritian commercial workplaces.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "1400.00",
  level: "Level 2",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainable-procurement.png",
  learningObjectives: [
    "Explain sustainable procurement principles in plain workplace language.",
    "Confirm whether a purchase is necessary before comparing products or issuing quotes.",
    "Distinguish initial purchase price from total whole-life value across operating, maintenance, and disposal costs.",
    "Evaluate environmental and supplier claims using verifiable evidence rather than vague marketing buzzwords.",
    "Apply relevant sustainability criteria without compromising safety, hygiene, food safety, or technical quality.",
    "Recognise procurement authority boundaries, conflict-of-interest risks, and anti-bribery escalation rules.",
    "Select one practical workplace procurement commitment to support responsible purchasing."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "You have completed Sustainable Procurement. You can now assess genuine purchase needs, compare whole-life value beyond purchase price, verify supplier evidence, and escalate procurement risks safely.",
  badgeName: "Responsible Purchasing Contributor",
  badgeDescription:
    "Awarded for applying balanced purchasing judgement across need, whole-life value, supplier evidence, safety, and ethical governance.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Cheapest Quote vs Whole-Life Value",
    minutes: 3,
    content: "Understand why purchase price alone is insufficient for evaluating workplace purchasing decisions.",
    blocks: [
      { id: "sp1-h1", type: "heading", position: 1, headingText: "Evaluating Supplier Quotes" },
      { id: "sp1-t1", type: "short_text", position: 2, bodyText: "Imagine your department needs replacement office equipment. Supplier A offers the lowest purchase price. Supplier B costs 15% more upfront but provides detailed energy consumption data, a 3-year warranty, and local spare parts. Supplier C claims its product is '100% eco-friendly' but offers no technical data sheet or evidence." },
      { id: "sp1-k1", type: "key_message", position: 3, headingText: "Cheapest Does Not Mean Best Value", bodyText: "A low initial purchase price can hide high energy bills, frequent breakdowns, short lifespan, and costly disposal. Sustainable procurement evaluates whole-life value—balancing purchase cost, operating performance, durability, repairability, and end-of-life impact." },
      {
        id: "sp1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "First step in evaluating supplier quotes:",
        decisionPrompt: "What should you do before recommending any supplier option?",
        decisionChoices: [
          { label: "Confirm the genuine operational need, compare whole-life data sheets, and ask for evidence supporting green claims", correct: true, feedback: "Perfect! Confirming need, technical performance, and verifiable evidence ensures true value and eliminates waste." },
          { label: "Select Supplier A immediately because it has the lowest upfront invoice price", correct: false, feedback: "Incorrect. The cheapest initial quote often leads to higher total costs through frequent replacements or high energy draw." },
          { label: "Choose Supplier C because '100% eco-friendly' marketing sounds sustainable", correct: false, feedback: "Incorrect! Vague marketing slogans are not evidence. Always request verifiable technical data." }
        ]
      },
      {
        id: "sp1-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "What is the core definition of whole-life value in sustainable procurement?",
        mcqOptions: [
          "Evaluating total cost and performance across purchase price, operating energy/water, maintenance, durability, and disposal",
          "Selecting whichever product has the most green logos on its packaging",
          "Buying the most expensive premium brand regardless of actual need",
          "Always choosing the cheapest available item to minimize initial budget spend"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Whole-life value assesses total ownership costs—including operating efficiency, maintenance, and lifespan—not just the initial price tag.",
        mcqIncorrectExplanation: "Incorrect. Whole-life value looks beyond initial purchase price to consider operating costs, durability, and maintenance."
      }
    ]
  },
  {
    order: 1,
    title: "Why Sustainable Procurement Matters",
    minutes: 3,
    content: "Connect responsible purchasing to operational reliability, financial value, and plain-language ESG goals.",
    blocks: [
      { id: "sp2-h1", type: "heading", position: 1, headingText: "Three Value Perspectives" },
      { id: "sp2-t1", type: "short_text", position: 2, bodyText: "Responsible procurement strengthens commercial organizations across three key pillars:" },
      {
        id: "sp2-k1",
        type: "key_message",
        position: 3,
        headingText: "Operational, Financial & ESG Value",
        bodyText: "• Operational Value: Reliable, durable products reduce downtime, equipment failures, and service interruptions.\n• Financial Value: Evaluating operating energy/water consumption and maintenance lowers total cost of ownership.\n• ESG Relevance: Environmental, Social, and Governance (ESG) considerations ensure ethical supply chains, reduced waste, and credible corporate reporting."
      },
      {
        id: "sp2-w1",
        type: "workplace_example",
        position: 4,
        headingText: "ESG Explained in Plain English",
        bodyText: "ESG stands for Environmental (resource use and waste), Social (fair treatment of workers and community safety), and Governance (ethical decision-making, anti-corruption, and compliance). Sustainable procurement puts ESG into daily workplace practice."
      }
    ]
  },
  {
    order: 2,
    title: "The 6-Step Decision Framework & Sourced Facts",
    minutes: 4,
    content: "Apply a structured 6-step purchasing framework and learn sourced life-cycle facts.",
    blocks: [
      { id: "sp3-h1", type: "heading", position: 1, headingText: "The 6-Step Sustainable Procurement Framework" },
      { id: "sp3-t1", type: "short_text", position: 2, bodyText: "Follow these 6 practical steps whenever requesting, comparing, or approving a workplace purchase:" },
      {
        id: "sp3-k1",
        type: "key_message",
        position: 3,
        headingText: "Step-by-Step Purchasing Method",
        bodyText: "Step 1: Confirm the Need (Is the purchase necessary? Can an existing item be repaired or redeployed?)\nStep 2: Define Performance (Safety, hygiene, quality, and operational fitness come first).\nStep 3: Identify Relevant Criteria (Energy efficiency, durability, spare parts, packaging).\nStep 4: Ask for Evidence (Data sheets, warranties, recognized certifications).\nStep 5: Compare Whole-Life Value (Purchase price + operating energy + maintenance + lifespan).\nStep 6: Follow Approval Procedure (Record comparison and obtain authorized sign-off)."
      },
      {
        id: "sp3-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "According to ISO 20400 Sustainable Procurement Standards and UNEP Life Cycle Assessment studies, operating electricity, maintenance, and disposal costs for commercial appliances and machinery account for 60% to 80% of total life-cycle expenditure! Prioritizing energy efficiency and repairability yields massive long-term financial savings."
      },
      {
        id: "sp3-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "What is Step 1 of the Sustainable Procurement Framework?",
        mcqOptions: [
          "Confirm whether the purchase is genuinely necessary before issuing quotes or buying new items",
          "Issue a purchase order to the nearest vendor without checking stock",
          "Demand a 50% discount from the supplier",
          "Select whichever product has green packaging"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "The first step is always confirming actual need—repairing, sharing, or redeploying existing equipment eliminates unnecessary spending entirely.",
        mcqIncorrectExplanation: "Incorrect. Confirming actual need is the foundational first step before comparing product options."
      }
    ]
  },
  {
    order: 3,
    title: "Inspecting Supplier Evidence & Green Claims",
    minutes: 4,
    content: "Evaluate supplier proposals, green claims evidence, and anti-bribery compliance.",
    blocks: [
      { id: "sp4-h1", type: "heading", position: 1, headingText: "Purchasing Desk Proposal Inspection" },
      { id: "sp4-t1", type: "short_text", position: 2, bodyText: "Examine a real Mauritian corporate purchasing desk. Compare Proposal A (vague '100% Eco' sticker), Proposal B (technical energy data sheet and 3-year warranty), and Proposal C (unverified symbol with an inappropriate gift box)." },
      {
        id: "sp4-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-sustainable-procurement-evidence.png",
        caption: "Purchasing Desk Inspection: Proposal A ('100% Eco' sticker without data), Proposal B (energy data sheet & 3-year warranty certificate), and Proposal C (unverified green symbol with personal gift box).",
        imageAlt: "Realistic photograph of a Mauritian corporate procurement desk with laptop comparison table and three paper proposals: Proposal A with a green 100% Eco-Friendly stamp, Proposal B with an energy efficiency chart and 3-year warranty certificate, and Proposal C with an unverified green symbol and a gift box labelled GIFT."
      },
      {
        id: "sp4-m1",
        type: "multiple_choice",
        position: 4,
        mcqQuestion: "In the purchasing desk inspection scene above, how should you respond to Proposal C containing an inappropriate personal gift box alongside an unverified green claim?",
        mcqOptions: [
          "Refuse and report the personal gift offer to management/procurement ethics officers immediately, and reject the unverified proposal",
          "Accept the personal gift quietly and award Proposal C the supply contract",
          "Keep the gift box for yourself and select Proposal A",
          "Ignore company procurement rules because gifts are normal business etiquette"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Personal gifts or vendor favors violate anti-bribery policies and create severe conflicts of interest. Report gifts and require objective evidence.",
        mcqIncorrectExplanation: "Incorrect. Personal supplier gifts violate anti-bribery policies and must be reported immediately."
      }
    ]
  },
  {
    order: 4,
    title: "Authority Boundaries & Practical Actions",
    minutes: 3,
    content: "Categorize purchasing actions into direct tasks, site procedures, and mandatory escalation.",
    blocks: [
      { id: "sp5-h1", type: "heading", position: 1, headingText: "Three Levels of Purchasing Authority" },
      { id: "sp5-t1", type: "short_text", position: 2, bodyText: "To maintain commercial governance and safety standards, group your purchasing actions into three clear authority levels:" },
      {
        id: "sp5-k1",
        type: "key_message",
        position: 3,
        headingText: "Act, Check & Escalate Framework",
        bodyText: "1. ACT DIRECTLY: Confirm genuine need, request technical data sheets, compare energy ratings, flag unsupported claims.\n2. CHECK SITE PROCEDURE: Add sustainability criteria to requisitions, evaluate warranty terms, select from approved vendor lists.\n3. ESCALATE TO MANAGEMENT: Supplier contract changes, vendor gift/bribery offers, overriding safety/hygiene specs, purchases exceeding delegated financial authority."
      },
      {
        id: "sp5-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Commercial equipment procurement scenario:",
        decisionPrompt: "A hotel or office is purchasing a commercial cleaning machine. Supplier B costs 15% more upfront but provides documented energy/water efficiency ratings, local replacement parts, and a 3-year warranty. What is the correct recommendation?",
        decisionChoices: [
          { label: "Document the whole-life value comparison (energy savings + warranty) and submit it for authorized approval according to financial limits", correct: true, feedback: "Outstanding! Documenting whole-life value and following financial approval limits ensures commercial rigor and compliance." },
          { label: "Sign a binding 5-year contract with Supplier B on your own authority without manager sign-off", correct: false, feedback: "Incorrect! Signing contracts outside delegated approval limits violates corporate governance." },
          { label: "Reject Supplier B and buy the cheapest unverified machine without warranty", correct: false, feedback: "Incorrect. Ignoring whole-life efficiency data leads to higher long-term operating costs." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Responsible Purchasing Commitment",
    minutes: 3,
    content: "Select practical daily procurement commitments for your workplace role.",
    blocks: [
      { id: "sp6-h1", type: "heading", position: 1, headingText: "Pledge to Act" },
      { id: "sp6-t1", type: "short_text", position: 2, bodyText: "Congratulations on completing the lessons! Select the purchasing commitments you will practice in your workplace role." },
      {
        id: "sp6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your daily workplace purchasing commitments (choose at least one):",
        commitmentOptions: [
          { value: "confirm-need", label: "Confirm genuine need before requesting or approving new purchases", description: "Prevent unnecessary spending by repairing or redeploying existing equipment." },
          { value: "compare-whole-life", label: "Compare operating costs and warranty terms alongside initial price", description: "Evaluate total ownership cost over product lifespan." },
          { value: "demand-evidence", label: "Request technical data sheets to verify vague green claims", description: "Eliminate greenwashing by requiring verifiable supplier evidence." },
          { value: "protect-safety", label: "Ensure sustainability criteria never compromise safety, hygiene, or quality", description: "Maintain mandatory operational and health safety standards." },
          { value: "report-conflicts", label: "Report vendor gifts, bribes, or conflicts of interest immediately", description: "Uphold strict anti-corruption and corporate governance rules." }
        ]
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "What is the primary goal of sustainable procurement in commercial organizations?",
    options: [
      "Evaluating whole-life value across purchase price, operating efficiency, durability, and supplier evidence while maintaining safety and operational quality",
      "Always purchasing the cheapest item available regardless of quality or lifespan",
      "Selecting products exclusively based on green marketing slogans without requesting data",
      "Bypassing company financial controls to buy expensive eco-certified goods"
    ],
    correct: 0,
    correctExplanation: "Sustainable procurement balances total cost of ownership, operational reliability, supplier evidence, and safety standards.",
    incorrectExplanation: "Incorrect. Sustainable procurement evaluates total whole-life value without compromising safety or governance."
  },
  {
    order: 2,
    question: "What is Step 1 of the 6-Step Sustainable Procurement Framework?",
    options: [
      "Confirming whether the purchase is genuinely necessary before issuing quotes or buying new items",
      "Issuing a purchase order immediately to the lowest bidder",
      "Accepting vendor promotional gifts to lower costs",
      "Demanding a 50% discount from the supplier"
    ],
    correct: 0,
    correctExplanation: "Confirming actual need—checking if existing items can be repaired, shared, or redeployed—is the essential first step.",
    incorrectExplanation: "Incorrect. Confirming actual need is the foundational first step before comparing quotes."
  },
  {
    order: 3,
    question: "How should a workplace buyer evaluate a supplier quote claiming a product is '100% Eco-Friendly'?",
    options: [
      "Request verifiable technical data sheets, energy ratings, or recognized independent certifications supporting the claim",
      "Accept the claim at face value without asking for evidence",
      "Reject the supplier immediately because all green claims are false",
      "Ask the supplier for a cash refund in exchange for accepting the claim"
    ],
    correct: 0,
    correctExplanation: "Vague marketing buzzwords require verifiable data sheets or independent certification details before being accepted.",
    incorrectExplanation: "Incorrect. Vague green claims must be verified with technical data sheets or certified documentation."
  },
  {
    order: 4,
    question: "What should an employee do if a prospective supplier offers a personal gift or financial favor alongside a quotation?",
    options: [
      "Refuse and report the personal gift offer to management/ethics officers immediately according to anti-bribery rules",
      "Accept the gift quietly if the product price is low",
      "Keep the gift and promise to award all future contracts to that supplier",
      "Share the gift with department colleagues to make it acceptable"
    ],
    correct: 0,
    correctExplanation: "Personal vendor gifts create severe conflicts of interest and violate anti-bribery policies. Report them immediately.",
    incorrectExplanation: "Incorrect. Personal supplier gifts violate anti-bribery policies and must be reported immediately."
  },
  {
    order: 5,
    question: "Which decision must be ESCALATED to senior management or procurement specialists?",
    options: [
      "Exceeding delegated financial approval limits or modifying standard supplier contract terms",
      "Asking a supplier for an updated product data sheet",
      "Comparing energy consumption figures between two approved models",
      "Checking existing inventory stock before placing a requisition"
    ],
    correct: 0,
    correctExplanation: "Exceeding approval limits, altering legal contracts, or accepting material risk requires senior management escalation.",
    incorrectExplanation: "Incorrect. Contract alterations and exceeding approval limits require senior management escalation."
  }
];

export async function ensureSustainableProcurementCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 5 by ID 5 or slug
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
        throw new Error("Course 5 not seeded by catalogue skeletons bootstrap!");
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
        logger.info({ courseId, slug: COURSE_SLUG }, "Sustainable Procurement course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course 5. Re-seeding course content and lessons transactionally...");

      // 4. Resolve next recommended course dynamically by slug
      const [nextCourse] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.slug, "waste-minimisation-workplace"))
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
          icon: "shopping-bag",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 10,
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

      logger.info({ courseId, slug: COURSE_SLUG }, "Sustainable Procurement course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Sustainable Procurement course");
  }
}
