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

const COURSE_ID = 9;
const COURSE_SLUG = "esg-basics";
const COURSE_TITLE = "ESG Basics";
const BADGE_SLUG = "esg-fundamentals";
const SEED_NAME = "esg-basics-v2";
const SKELETON_BADGE_SLUG = "esg-fundamentals"; // catalogue skeleton slug — do not delete

const COURSE_META = {
  description:
    "Master Environmental, Social, and Governance (ESG) fundamentals, distinguish the three pillars, evaluate ESG evidence versus greenwashing claims, and apply Check–Record–Report–Confirm protocols.",
  fullDescription:
    "This course provides employees across all roles with a practical, workplace-focused introduction to ESG. Learn what Environmental, Social, and Governance considerations represent in corporate decision-making, distinguish verifiable ESG evidence from unverified marketing claims, map ESG practices across operations, and apply the Check–Record–Report–Confirm protocol to protect company credibility.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "1400.00",
  level: "ESG and Compliance",
  isFeatured: false,
  thumbnailUrl: "/images/courses/esg-basics.jpg",
  learningObjectives: [
    "Define Environmental, Social, and Governance (ESG) in plain workplace language.",
    "Distinguish Environmental (E), Social (S), and Governance (G) pillars with practical operational examples.",
    "Differentiate verifiable ESG evidence (utility bills, training logs, audit sheets) from unverified green claims.",
    "Apply the 4-step Check–Record–Report–Confirm protocol to workplace ESG information and disclosures.",
    "Avoid high-risk mistakes such as inventing missing figures, altering records, or publishing absolute green slogans.",
    "Evaluate role-based micro-decisions across HR, facilities, procurement, sales/marketing, and management.",
    "Select one practical workplace ESG commitment to support reliable evidence and transparent reporting."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "You have completed ESG Basics. You can now recognise Environmental, Social, and Governance factors, distinguish ESG evidence from green claims, and apply Check–Record–Report–Confirm protocols safely.",
  badgeName: "ESG Foundations",
  badgeDescription:
    "Awarded for demonstrating practical workplace ESG awareness, understanding the E, S, G pillars, and supporting verifiable ESG evidence.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Why ESG Requires Verified Evidence",
    minutes: 3,
    content: "Learn why ESG claims require verifiable evidence and how everyday records support company credibility.",
    blocks: [
      { id: "esg1-h1", type: "heading", position: 1, headingText: "Intentions vs. Verifiable Evidence" },
      { id: "esg1-t1", type: "short_text", position: 2, bodyText: "A Mauritian commercial company receives a sustainability questionnaire from an international corporate client during a major tender. The client asks for specific evidence regarding energy tracking, staff safety training, and incident reporting. Staff members offer guesses: 'Just write we are 100% sustainable,' or 'Attach our 2021 policy sheet.' The compliance lead halts the draft: 'Unverified claims risk tender disqualification; we need current, verifiable records.'" },
      { id: "esg1-k1", type: "key_message", position: 3, headingText: "ESG Demands Traceable Proof, Not Slogans", bodyText: "ESG (Environmental, Social, Governance) evaluates how companies manage environmental impacts, treat people, and govern decisions. Positive intentions are not evidence. Credible responses require utility bills, training logs, inspection sheets, and approved policies." },
      {
        id: "esg1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Evaluating tender data scenario:",
        decisionPrompt: "A client questionnaire asks for current annual staff safety training completion rates, but facility records for Q4 are incomplete. What is the most responsible action?",
        decisionChoices: [
          { label: "Check available attendance logs, record the verified numbers honestly, declare the data gap, and ask the manager for review", correct: true, feedback: "Perfect! Transparent reporting with verified data protects corporate integrity and tender credibility." },
          { label: "Invent a 100% completion rate so the proposal looks impressive", correct: false, feedback: "NEVER invent or guess figures! Falsifying records violates corporate governance and exposes the firm to severe legal liability." },
          { label: "Send an old 2021 training sheet without telling the client it is expired", correct: false, feedback: "Incorrect. Submitting outdated evidence as current data misleads clients and violates disclosure rules." }
        ]
      },
      {
        id: "esg1-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "What does ESG stand for in plain workplace language?",
        mcqOptions: [
          "Environmental, Social, and Governance factors evaluated to manage risks, responsibilities, and long-term performance",
          "Energy Savings Guarantee offered by solar panel vendors",
          "Emergency System Grid for electrical power backups",
          "Executive Safety Group for corporate security guards"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "ESG stands for Environmental, Social, and Governance factors that guide responsible corporate practices.",
        mcqIncorrectExplanation: "Incorrect. ESG stands for Environmental, Social, and Governance."
      }
    ]
  },
  {
    order: 1,
    title: "The Three Pillars: E, S, and G",
    minutes: 4,
    content: "Master the Environmental, Social, and Governance pillars with concrete operational examples.",
    blocks: [
      { id: "esg2-h1", type: "heading", position: 1, headingText: "Deconstructing the ESG Pillars" },
      { id: "esg2-t1", type: "short_text", position: 2, bodyText: "ESG connects three distinct operational pillars into a unified framework for responsible business conduct:" },
      {
        id: "esg2-k1",
        type: "key_message",
        position: 3,
        headingText: "The Three Pillars & Examples",
        bodyText: "• Environmental (E): How a company manages natural resources (energy, water, waste, climate emissions, pollution prevention, biodiversity).\n• Social (S): How a company treats people and communities (workplace safety, fair treatment, staff training, customer protection, community engagement).\n• Governance (G): How decisions are directed, recorded, and reviewed (clear policies, ethical conduct, accurate records, incident escalation, board oversight)."
      },
      {
        id: "esg2-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "According to the International Sustainability Standards Board (ISSB) and UN Global Compact, over 80% of institutional investors and major multinational clients evaluate verifiable ESG evidence before awarding supply-chain tenders! Companies with accurate, traceable records gain significant competitive advantages."
      }
    ]
  },
  {
    order: 2,
    title: "The Workplace ESG Map & Evidence Verification",
    minutes: 4,
    content: "Inspect operational ESG evidence items, utility bills, expired policies, and greenwashing risks.",
    blocks: [
      { id: "esg3-h1", type: "heading", position: 1, headingText: "Desk Inspection: Evaluating ESG Evidence" },
      { id: "esg3-t1", type: "short_text", position: 2, bodyText: "Examine a real Mauritian corporate office desk. Observe the current CEB electricity bill, expired 2021 policy sheet, staff training log, unverified supplier declaration, incident email, and '100% ECO-FRIENDLY' marketing draft." },
      {
        id: "esg3-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-esg-evidence-review.png",
        caption: "Corporate Desk Inspection: Utility bill (E evidence), training log (S evidence), expired policy (G gap), supplier declaration (unverified claim), chemical incident email (escalation item), and '100% ECO-FRIENDLY' draft (greenwashing risk).",
        imageAlt: "Realistic photograph of a Mauritian corporate office desk displaying a CEB electricity bill, an expired 2021 Environmental Policy document, a Staff Training Attendance Log, a Supplier Sustainability Declaration letter, an email printout regarding an uncorrected chemical spill, and a green brochure reading '100% ECO-FRIENDLY & ZERO WASTE'."
      },
      {
        id: "esg3-m1",
        type: "multiple_choice",
        position: 4,
        mcqQuestion: "In the corporate desk inspection scene above, how should a responsible employee treat the marketing draft claiming '100% ECO-FRIENDLY & ZERO WASTE'?",
        mcqOptions: [
          "Pause publication immediately and request verifiable baseline evidence and manager approval before releasing absolute green claims",
          "Publish the brochure on social media right away because absolute claims sound impressive",
          "Distribute the brochure to clients without checking whether waste or energy records exist",
          "Burn the brochure and claim the company does not believe in environmental care"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Absolute claims like '100% Eco-Friendly' require verified evidence and management approval to prevent greenwashing liability.",
        mcqIncorrectExplanation: "Incorrect. Unverified absolute green claims expose the company to greenwashing risks; pause and verify first."
      }
    ]
  },
  {
    order: 3,
    title: "Check–Record–Report–Confirm & Hotel Worked Example",
    minutes: 4,
    content: "Apply the 4-step protocol and analyze a real hotel tender response worked example.",
    blocks: [
      { id: "esg4-h1", type: "heading", position: 1, headingText: "The 4-Step Action Protocol" },
      { id: "esg4-t1", type: "short_text", position: 2, bodyText: "When handling ESG requests, customer surveys, or operational claims, follow the Check–Record–Report–Confirm protocol:" },
      {
        id: "esg4-k1",
        type: "key_message",
        position: 3,
        headingText: "Check–Record–Report–Confirm",
        bodyText: "1. CHECK: Understand the request and verify whether available information is current and approved.\n2. RECORD: Use exact, verifiable data (utility bills, training logs) and retain evidence files.\n3. REPORT: Raise data gaps, uncorrected incidents, or missing policies through designated management channels.\n4. CONFIRM: Obtain formal management review and authorization before submitting external disclosures."
      },
      {
        id: "esg4-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Worked Example: Mauritian Hotel Tender Response",
        bodyText: "A Mauritian resort answers a client ESG survey:\n• Water Management: Supported by monthly CWA bills & flow-meter logs (Valid E Evidence).\n• Staff Safety: Supported by Q3 First-Aid & Fire Safety attendance sheets (Valid S Evidence).\n• Grievance Policy: Supported by HR Policy Handbook & signed worker committee minutes (Valid G Evidence).\n• Waste Reduction Claim: No current weighbridge records exist. ACTION: Declare the data gap honestly rather than inventing numbers!"
      }
    ]
  },
  {
    order: 4,
    title: "High-Risk Mistakes & Micro-Decisions",
    minutes: 3,
    content: "Avoid prohibited actions and practice role-based decisions across corporate departments.",
    blocks: [
      { id: "esg5-h1", type: "heading", position: 1, headingText: "High-Risk ESG Mistakes to Avoid" },
      { id: "esg5-t1", type: "short_text", position: 2, bodyText: "NEVER engage in these four high-risk corporate behaviors:" },
      {
        id: "esg5-k1",
        type: "key_message",
        position: 3,
        headingText: "Prohibited Actions",
        bodyText: "• DO NOT invent, estimate, or guess figures for ESG questionnaires without an approved methodology.\n• DO NOT use absolute marketing claims ('Carbon Neutral', 'Zero Harm') without verified evidence.\n• DO NOT alter, backdate, or falsify operational records or safety logs.\n• DO NOT hide incidents, customer complaints, or known environmental data gaps."
      },
      {
        id: "esg5-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Sales & Proposal Scenario:",
        decisionPrompt: "A sales representative is drafting a proposal for a major client. The draft states: 'Our company is 100% sustainable and produces zero environmental harm.' The company has started energy tracking, but no verified zero-impact audit exists. What should the representative do?",
        decisionChoices: [
          { label: "Pause publication, remove absolute claims, and replace them with approved, verifiable facts (e.g. 'We track monthly energy draw and follow approved recycling procedures')", correct: true, feedback: "Outstanding! Replacing absolute claims with verified operational facts protects company credibility." },
          { label: "Submit the proposal with the 'zero harm' claim to win the contract", correct: false, feedback: "Incorrect! Submitting false or absolute claims creates severe greenwashing liability." },
          { label: "Delete all environmental mentions from the proposal and pretend the company has no sustainability goals", correct: false, feedback: "Incorrect. Share verified facts rather than omitting genuine achievements." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your ESG Awareness Commitment",
    minutes: 3,
    content: "Select practical daily workplace commitments to support ESG evidence and transparency.",
    blocks: [
      { id: "esg6-h1", type: "heading", position: 1, headingText: "Pledge to Act" },
      { id: "esg6-t1", type: "short_text", position: 2, bodyText: "Congratulations on completing the lessons! Select the ESG habits you commit to practice in your daily work routine." },
      {
        id: "esg6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your daily workplace ESG commitments (choose at least one):",
        commitmentOptions: [
          { value: "apply-check-record-report", label: "Apply the Check–Record–Report–Confirm protocol for ESG requests and disclosures", description: "Verify information and obtain management review before submitting claims." },
          { value: "avoid-unverified-claims", label: "Avoid using absolute green marketing slogans without baseline evidence", description: "Protect company reputation and prevent greenwashing risks." },
          { value: "report-data-gaps", label: "Report known data gaps or uncorrected incidents honestly rather than concealing them", description: "Support transparent reporting and corporate governance." },
          { value: "maintain-accurate-records", label: "Maintain exact, traceable operational records (invoices, safety logs, training sheets)", description: "Provide verifiable proof for client tenders and audits." },
          { value: "escalate-unsupported-claims", label: "Escalate unverified supplier claims or missing policies to management leads", description: "Ensure supply-chain integrity and governance oversight." }
        ]
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "Which operational item represents valid Social (S) pillar evidence for a Mauritian business?",
    options: [
      "Signed attendance logs for employee health, safety, and first-aid training",
      "A CEB utility bill for facility electricity consumption",
      "A board-approved anti-bribery and corruption policy document",
      "A marketing poster advertising organic fruit in the canteen"
    ],
    correct: 0,
    correctExplanation: "Staff safety and health training records represent direct Social (S) pillar evidence.",
    incorrectExplanation: "Incorrect. Safety training records represent Social pillar evidence."
  },
  {
    order: 2,
    question: "How does the Governance (G) pillar connect to daily employee work?",
    options: [
      "Governance ensures decisions are guided by clear policies, accurate records, ethical reporting, and proper management approvals",
      "Governance only applies to government ministers in parliament",
      "Governance requires all employees to become corporate lawyers",
      "Governance means deleting old records to save server disk space"
    ],
    correct: 0,
    correctExplanation: "Governance ensures decisions, policies, records, and approvals are executed ethically and accurately.",
    incorrectExplanation: "Incorrect. Governance encompasses policies, ethical conduct, accurate records, and approvals."
  },
  {
    order: 3,
    question: "What is the primary risk of publishing absolute marketing claims like '100% Eco-Friendly & Zero Impact' without verified evidence?",
    options: [
      "It exposes the company to greenwashing liability, client tender disqualification, and reputational damage",
      "It automatically increases company tax rates by 50%",
      "It prevents employees from receiving safety certificates",
      "It causes office computers to run slower"
    ],
    correct: 0,
    correctExplanation: "Unverified absolute claims mislead clients and create major legal and reputational greenwashing risks.",
    incorrectExplanation: "Incorrect. Unverified green claims expose the firm to greenwashing liabilities."
  },
  {
    order: 4,
    question: "A client tender asks for water recycling volume data, but facility flow meters were broken for two months. What should the team do?",
    options: [
      "Provide verified data for active months, declare the two-month meter gap honestly, and explain repair steps taken",
      "Invent guessed figures for the missing months to make the spreadsheet look complete",
      "Copy water data from a neighboring hotel and present it as own data",
      "Refuse to submit the tender and delete all water bills"
    ],
    correct: 0,
    correctExplanation: "Honest disclosure of data gaps with verified records maintains credibility; guessing data violates governance.",
    incorrectExplanation: "Incorrect. Always declare data gaps honestly with verified evidence."
  },
  {
    order: 5,
    question: "What is the final step in the Check–Record–Report–Confirm protocol before submitting ESG disclosure data to an external client?",
    options: [
      "Obtain formal review and authorization from the designated manager or compliance lead",
      "Post the draft data on personal social media accounts for public feedback",
      "Delete all supporting utility bills to keep files small",
      "Change the company logo to bright green"
    ],
    correct: 0,
    correctExplanation: "Confirming requires obtaining formal management review and authorization before external release.",
    incorrectExplanation: "Incorrect. Confirming requires formal management review and authorization."
  }
];

export async function ensureEsgBasicsCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 9 by courseCode "ELH-09", slug, or ID
      let course = null;
      
      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-09"))
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
        throw new Error("Course ELH-09 / esg-basics not seeded by catalogue skeletons bootstrap!");
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
        logger.info({ courseId, slug: COURSE_SLUG }, "ESG Basics course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course ELH-09. Re-seeding course content and lessons transactionally...");

      // 4. Resolve next recommended course dynamically by slug
      const [nextCourse] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.slug, "environmental-compliance-mauritius"))
        .limit(1);
      const nextCourseId = nextCourse?.id ?? null;

      // 5. Update course record slug, title, and metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-09",
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
          icon: "award",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 14,
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

      logger.info({ courseId, slug: COURSE_SLUG }, "ESG Basics course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of ESG Basics course");
  }
}
