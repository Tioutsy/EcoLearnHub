import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
  coursePrerequisitesTable,
  quizAttemptsTable,
  lessonProgressTable,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_SLUG = "sustainability-for-sales-and-marketing-teams";
const COURSE_TITLE = "Sustainability for Sales and Marketing Teams";
const BADGE_SLUG = "responsible-sustainability-communicator";
const BADGE_CODE = "COURSE_ELH_28_COMPLETE";
const SEED_NAME = "sustainability-for-sales-and-marketing-teams-v1";

const COURSE_META = {
  courseCode: "ELH-28",
  description: "Learn how to communicate sustainability accurately, use approved evidence and respond confidently to customer questions without exaggeration.",
  fullDescription: "Learn how to communicate sustainability accurately, use approved evidence and respond confidently to customer questions without exaggeration.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainability-for-sales-and-marketing-teams.jpg",
  intendedRoles: [
    "Sales employees",
    "Marketing employees",
    "Communications employees",
    "Business-development employees",
    "Customer-service employees",
    "Social-media coordinators",
    "Brand and content employees",
    "Account managers",
    "Managers approving customer-facing sustainability messages"
  ],
  learningObjectives: [
    "explain why sustainability communication requires evidence and context;",
    "distinguish a factual statement from an environmental claim;",
    "identify vague, absolute or unsupported wording;",
    "use approved evidence without exaggeration;",
    "explain conditions, scope and limitations clearly;",
    "respond appropriately to customer sustainability questions;",
    "coordinate claim approval and updates;",
    "correct inaccurate or outdated communications."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Sustainability for Sales and Marketing Teams. You can now communicate sustainability accurately, use approved evidence and respond confidently to customer questions without exaggeration.",
  badgeName: "Responsible Sustainability Communicator",
  badgeDescription: "Awarded for demonstrating practical understanding of how to communicate sustainability accurately, use approved evidence and respond confidently to customer questions without exaggeration.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Sustainability Communication Needs Evidence",
    minutes: 3,
    content: "Explain why sustainability messages must be supported and approved. Avoid using absolute words when only limited progress exists.",
    blocks: [
      {
        id: "c28-l1-b1",
        type: "heading",
        headingText: "Communication Needs Evidence"
      },
      {
        id: "c28-l1-b2",
        type: "short_text",
        bodyText: "Sustainability communication influences buying decisions and trust. A message is misleading when it has no evidence, exaggerates limited improvements, hides conditions, or presents future goals as current achievements. Understand the source, approved scope, valid period, and limitations of every claim."
      },
      {
        id: "c28-l1-b3",
        type: "key_message",
        headingText: "Verified Facts Only",
        bodyText: "Always match marketing words directly to verified facts. Avoid creating overly broad claims that suggest company-wide success from isolated actions."
      },
      {
        id: "c28-l1-b4",
        type: "decision_scenario",
        decisionIntro: "A hotel replaces small single-use plastic toiletry bottles with large wall-mounted refillable dispensers in all guest rooms.",
        decisionPrompt: "What claim can the marketing coordinator safely use on social media?",
        decisionChoices: [
          {
            label: "Our hotel is now completely plastic-free.",
            correct: false,
            feedback: "Incorrect. The hotel still uses plastic in packaging, housekeeping, food, and maintenance."
          },
          {
            label: "We have replaced single-use guest toiletry bottles with refillable dispensers, avoiding room toiletry plastic waste.",
            correct: true,
            feedback: "Correct. This describes the specific change that can be proven rather than making an unverified broad claim."
          },
          {
            label: "Our hotel has achieved 100% environmental sustainability.",
            correct: false,
            feedback: "Incorrect. This is a vague, absolute claim that cannot be technically proven."
          },
          {
            label: "Tell guests that the bathroom is environmentally neutral.",
            correct: false,
            feedback: "Incorrect. The term 'environmentally neutral' is an absolute claim without clear technical basis."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Replace Vague Words With Specific Information",
    minutes: 3,
    content: "Identify vague environmental wording and replace it with clear, measurable statements. Clarify local recyclability before advertising.",
    blocks: [
      {
        id: "c28-l2-b1",
        type: "heading",
        headingText: "Replace Vague Words"
      },
      {
        id: "c28-l2-b2",
        type: "short_text",
        bodyText: "Words like 'green,' 'eco,' and 'responsible' are positive but provide no useful details. Specific communication explains what changed, where, when, and what proof exists. Instead of 'eco-packaging,' state 'made of 80% recycled cardboard.' Ensure claims match local Mauritian recycling collection realities."
      },
      {
        id: "c28-l2-b3",
        type: "key_message",
        headingText: "Attribute-Specific Claims",
        bodyText: "Describe the specific material property (e.g. recycled content, compostable) rather than applying general environmental labels."
      },
      {
        id: "c28-l2-b4",
        type: "decision_scenario",
        decisionIntro: "A Mauritian retailer sells a product packaged in materials that are technically recyclable in theory, but no municipal or commercial recycling collection route currently exists for this material in Mauritius.",
        decisionPrompt: "How should the marketing team describe the packaging?",
        decisionChoices: [
          {
            label: "Advertise it as '100% recyclable' to encourage consumers.",
            correct: false,
            feedback: "Incorrect. Promising recyclability when no local collection route exists is misleading to Mauritian customers."
          },
          {
            label: "Specify the material composition (e.g., 'made of PET plastic') and note local recycling availability should be checked.",
            correct: true,
            feedback: "Correct. This avoids promising local recycling processing without verified evidence."
          },
          {
            label: "Mark the product as 'eco-friendly green pack.'",
            correct: false,
            feedback: "Incorrect. General green labels do not provide factual recyclability details."
          },
          {
            label: "Claim that the package biodegrades in ordinary landfill waste.",
            correct: false,
            feedback: "Incorrect. Biodegradation in landfills requires specific testing; do not claim it without evidence."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Understand Scope, Conditions and Comparisons",
    minutes: 3,
    content: "Communicate the correct scope, parameters, and time periods of claims. Limit comparative statements to verified baseline data.",
    blocks: [
      {
        id: "c28-l3-b1",
        type: "heading",
        headingText: "Scope and Comparisons"
      },
      {
        id: "c28-l3-b2",
        type: "short_text",
        bodyText: "Claims must match the scope of evidence: specific sites, products, or periods. Avoid presenting a single property's reduction as a company-wide result. Comparative claims (e.g. 'less water,' 'lower carbon') must state the baseline compared, conditions, time period, and sources."
      },
      {
        id: "c28-l3-b3",
        type: "key_message",
        headingText: "Control Scope creep",
        bodyText: "Do not let claims expand as they move from technical spreadsheets to sales brochures. Disclose necessary limits."
      },
      {
        id: "c28-l3-b4",
        type: "decision_scenario",
        decisionIntro: "A real estate company replaces lobby light fittings at one apartment residence, reducing common-area lighting consumption. Marketing wants to add 'our properties use energy-efficient lighting and consume less power' to all brochures.",
        decisionPrompt: "What is the correct action?",
        decisionChoices: [
          {
            label: "Include the company-wide statement since they plan to upgrade other properties later.",
            correct: false,
            feedback: "Incorrect. Promising upgrades that have not occurred converts future intentions into achieved claims."
          },
          {
            label: "Restrict the claim specifically to the name of the upgraded residence, citing the measured reduction and year.",
            correct: true,
            feedback: "Correct. Restricting the claim to the specific site supported by data prevents misleading scope creep."
          },
          {
            label: "State that all managed buildings are certified green.",
            correct: false,
            feedback: "Incorrect. Certifications cannot be claimed company-wide unless formally issued to all sites."
          },
          {
            label: "Omit the lighting upgrade details from all brochures.",
            correct: false,
            feedback: "Incorrect. The upgrade is a valid achievement; communicate it with the correct, specific scope."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Use Approved Evidence Correctly",
    minutes: 3,
    content: "Verify evidence currency, applicability, and validation source. Distinguish internal calculations and estimates from actual results.",
    blocks: [
      {
        id: "c28-l4-b1",
        type: "heading",
        headingText: "Use Approved Evidence"
      },
      {
        id: "c28-l4-b2",
        type: "short_text",
        bodyText: "Check if evidence (procurement logs, utility readings, certificates) is current and covers the claim scope. Do not shorten statements to remove qualifications, convert estimates to achievements, or present internal calculations as independent verification."
      },
      {
        id: "c28-l4-b3",
        type: "key_message",
        headingText: "Projections vs Achievements",
        bodyText: "Always identify forecasted benefits as projections, and wait for performance logs before declaring achievements."
      },
      {
        id: "c28-l4-b4",
        type: "decision_scenario",
        decisionIntro: "An internal technical proposal estimates that an upcoming shipping adjustment could reduce water usage by 20%. A salesperson wants to add 'our new process reduces water consumption by 20%' to a customer presentation.",
        decisionPrompt: "What should the salesperson do?",
        decisionChoices: [
          {
            label: "Use the statement to secure the client, since the engineering team estimated it.",
            correct: false,
            feedback: "Incorrect. Estimates cannot be reported as realized results before they are measured in operation."
          },
          {
            label: "Describe the 20% water reduction as an expected project target, or wait until operational performance metrics verify the actual result.",
            correct: true,
            feedback: "Correct. Keep targets marked as projections until operational evidence proves the outcome."
          },
          {
            label: "Remove the percentage and say the process is 'water neutral.'",
            correct: false,
            feedback: "Incorrect. 'Water neutral' is an unverified absolute claim that ignores actual calculations."
          },
          {
            label: "Claim the reduction has already occurred at another site.",
            correct: false,
            feedback: "Incorrect. Fabricating locations violates professional codes and corporate data integrity rules."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Respond to Customer Questions Honestly",
    minutes: 3,
    content: "Respond confidently and honestly to technical sustainability queries. Acknowledge limits and refer questions to internal owners.",
    blocks: [
      {
        id: "c28-l5-b1",
        type: "heading",
        headingText: "Respond Honestly"
      },
      {
        id: "c28-l5-b2",
        type: "short_text",
        bodyText: "Customers ask about recyclability, carbon neutrality, certifications, and compliance. Provide approved facts, explain scope, acknowledge what is unconfirmed, and coordinate follow-up with internal subject owners. Never guess or fabricate answers to appear informed."
      },
      {
        id: "c28-l5-b3",
        type: "key_message",
        headingText: "Acknowledge and Verify",
        bodyText: "Saying what is verified and checking the rest builds more trust than making confident, unverified guesses."
      },
      {
        id: "c28-l5-b4",
        type: "decision_scenario",
        decisionIntro: "A corporate buyer asks a sales representative if the company's recycled paper stock is processed locally in Mauritius. The representative does not have this detail.",
        decisionPrompt: "How should the representative reply?",
        decisionChoices: [
          {
            label: "Confirm it is processed locally to avoid losing sales momentum.",
            correct: false,
            feedback: "Incorrect. Guessing or fabricating locations creates legal risks if the supplier imports the stock."
          },
          {
            label: "Provide the approved facts regarding paper specifications, explain that local processing details are being verified, and coordinate a follow-up through the procurement head.",
            correct: true,
            feedback: "Correct. Provide known facts, acknowledge limits, and check details with the internal owner."
          },
          {
            label: "Tell the customer that processing location does not affect sustainability.",
            correct: false,
            feedback: "Incorrect. Dismissing buyer queries violates customer service standards and avoids transparency."
          },
          {
            label: "Guarantee that the entire supply chain is carbon neutral.",
            correct: false,
            feedback: "Incorrect. Carbon neutrality claims require verified emissions balances; do not guess them."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Review, Approve and Correct Communications",
    minutes: 3,
    content: "Establish a controlled process for approving claims. Correct outdated or inaccurate customer-facing statements promptly.",
    blocks: [
      {
        id: "c28-l6-b1",
        type: "heading",
        headingText: "Review and Correct"
      },
      {
        id: "c28-l6-b2",
        type: "short_text",
        bodyText: "Claims require documentation: proposed message, evidence source, approving owner, and review date. When a statement becomes inaccurate (e.g. site changes), correct or narrow it promptly across websites, templates, and brochures. Updates protect record transparency and client trust."
      },
      {
        id: "c28-l6-b3",
        type: "key_message",
        headingText: "Prompt Corrections",
        bodyText: "Updating outdated statements is part of responsible brand management. Do not wait for annual print cycles."
      },
      {
        id: "c28-l6-b4",
        type: "commitment_scenario",
        commitmentPrompt: "Select one sustainability practice you can improve in your communications:",
        commitmentChoices: [
          "Checking evidence before publishing",
          "Replacing vague environmental words",
          "Recording claim approvals",
          "Adding clear scope to customer messages",
          "Correcting outdated website content",
          "Escalating customer questions instead of guessing"
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "A hotel removes single-use plastic bottles from guest rooms. What claim can the marketing team safely place on website banners?",
    options: [
      { text: "Our hotel is now plastic-free.", isCorrect: false, feedback: "Incorrect. The hotel still uses plastic in other departments and packages." },
      { text: "We have replaced room toiletry bottles with wall refillable dispensers, avoiding room plastic bottle waste.", isCorrect: true, feedback: "Correct. State the specific, verified change rather than making a company-wide absolute claim." },
      { text: "Our bathrooms are 100% green and eco-friendly.", isCorrect: false, feedback: "Incorrect. Vague labels do not provide factual details about bathroom waste." },
      { text: "We have eliminated environmental impacts in guest rooms.", isCorrect: false, feedback: "Incorrect. This is an absolute, unprovable claim." }
    ],
    correctExplanation: "A message must describe the specific change that can be proven rather than making a company-wide absolute claim.",
    incorrectExplanation: "Broad absolute claims like 'plastic-free' or vague green labels violate evidence-based communication rules.",
    practicalTakeaway: "Describe the specific item removed rather than making a company-wide absolute claim."
  },
  {
    question: "A marketing description for a product states that it features 'eco-friendly packaging.' How should this vague label be corrected?",
    options: [
      { text: "Leave it as is because customers understand 'eco-friendly.'", isCorrect: false, feedback: "Incorrect. Vague terms provide no factual, auditable detail." },
      { text: "Specify the exact supported attribute (e.g., 'outer delivery box made of 80% recycled cardboard').", isCorrect: true, feedback: "Correct. Replace vague environmental words with specific, verifiable packaging attributes." },
      { text: "Change the term to 'green packaging' instead.", isCorrect: false, feedback: "Incorrect. 'Green' is just as vague and uninformative as 'eco-friendly.'" },
      { text: "Omit all packaging descriptions to save label space.", isCorrect: false, feedback: "Incorrect. Descriptions can remain; clarify them with facts." }
    ],
    correctExplanation: "Replace vague environmental words with specific, verifiable packaging attributes to maintain credibility.",
    incorrectExplanation: "Leaving vague terms, changing to other vague labels, or omitting descriptions fails to provide clear facts.",
    practicalTakeaway: "Replace vague environmental words with specific, verifiable attributes."
  },
  {
    question: "A real estate developer replaces common-area lighting at one residence. The sales manager wants to add 'our properties use energy-efficient lighting' to all brochures.",
    options: [
      { text: "Use the statement since other properties will get upgrades later.", isCorrect: false, feedback: "Incorrect. Presenting future targets as current achievements is misleading." },
      { text: "Limit the claim to the specific upgraded residence, citing the measured reduction and year.", isCorrect: true, feedback: "Correct. Keep the scope of the claim restricted to the actual properties supported by evidence." },
      { text: "State that all buildings are certified carbon neutral.", isCorrect: false, feedback: "Incorrect. Carbon neutrality requires verified emissions records; do not guess." },
      { text: "Remove the lighting reference entirely from all brochures.", isCorrect: false, feedback: "Incorrect. Upgrades are valid achievements; communicate them within the correct scope." }
    ],
    correctExplanation: "Restrict the scope of the claim to the specific property or sites supported by verified evidence.",
    incorrectExplanation: "Expanding claims company-wide, fabricating certifications, or avoiding valid descriptions ignores scope control.",
    practicalTakeaway: "Limit the claim to the specific property or site supported by the evidence."
  },
  {
    question: "An engineering proposal estimates that an upcoming delivery adjustment could reduce water usage by 20%. How should a salesperson present this?",
    options: [
      { text: "Say 'our new process reduces water consumption by 20%' to secure the client.", isCorrect: false, feedback: "Incorrect. Reporting estimates as realized results before they are measured is misleading." },
      { text: "Identify the 20% water reduction as an expected target, or wait until operational metrics verify the actual result.", isCorrect: true, feedback: "Correct. Keep estimated parameters marked as targets/projections until performance metrics prove the result." },
      { text: "Describe the process as 'water neutral.'", isCorrect: false, feedback: "Incorrect. 'Water neutral' is an unverified absolute claim." },
      { text: "State that the reduction has already occurred at another site.", isCorrect: false, feedback: "Incorrect. Fabricating locations violates corporate data integrity rules." }
    ],
    correctExplanation: "Identify forecasted benefits as expected targets or wait until actual performance metrics verify the results.",
    incorrectExplanation: "Reporting projections as achieved results, using unverified terms, or fabricating sites is misleading.",
    practicalTakeaway: "Keep statements identified as estimates or targets until verified results are measured."
  },
  {
    question: "A product uses cardboard that is technically recyclable as a material, but no collection or processing route exists in Mauritius. What should marketing state?",
    options: [
      { text: "Advertise it as '100% recyclable locally.'", isCorrect: false, feedback: "Incorrect. Promising local recyclability when no collection route exists is misleading to Mauritian customers." },
      { text: "State the material (e.g. 'cardboard') and note that local recycling collection availability should be verified by the customer.", isCorrect: true, feedback: "Correct. Do not promise local recycling processing without verified evidence of collection channels." },
      { text: "Label the product as 'locally recyclable green packaging.'", isCorrect: false, feedback: "Incorrect. Broad labels do not provide factual recyclability context." },
      { text: "Claim the box biodegrades in landfill waste within a week.", isCorrect: false, feedback: "Incorrect. Do not make biodegradation rate claims without testing records." }
    ],
    correctExplanation: "Do not promise local recycling processing without verified evidence of collection channels.",
    incorrectExplanation: "Promising local recyclability, using vague green labels, or fabricating biodegradation times violates evidence rules.",
    practicalTakeaway: "Avoid promising local recyclability unless collection and processing routes are confirmed."
  },
  {
    question: "A corporate client asks a sales representative if the paper stock is processed locally in Mauritius. The representative does not have this detail. How should they respond?",
    options: [
      { text: "Confirm it is processed locally to keep the customer happy.", isCorrect: false, feedback: "Incorrect. Guessing creates legal and reputational risks if the paper is imported." },
      { text: "Provide the approved paper details, explain that processing location details are being checked, and coordinate a follow-up.", isCorrect: true, feedback: "Correct. Provide known approved facts, acknowledge limitations, and check details with the procurement head." },
      { text: "Ignore the question and discuss other specifications.", isCorrect: false, feedback: "Incorrect. Avoiding the question violates customer transparency codes." },
      { text: "Guarantee the paper is completely carbon neutral.", isCorrect: false, feedback: "Incorrect. Carbon neutrality claims require verified emissions records; do not guess." }
    ],
    correctExplanation: "Provide the approved facts, acknowledge the missing information, and refer the query to the correct internal owner for follow-up.",
    incorrectExplanation: "Guessing locations, avoiding transparency, or fabricating carbon neutrality claims is misleading.",
    practicalTakeaway: "Provide approved facts, acknowledge missing details, and check with the appropriate owner."
  },
  {
    question: "A company website claims that all offices run on renewable energy, but a new branch office opens that does not. How should the team handle this?",
    options: [
      { text: "Leave the claim on the website until the next annual printing.", isCorrect: false, feedback: "Incorrect. Leaving outdated claims active creates immediate compliance and transparency issues." },
      { text: "Correct or narrow the website claim promptly to reflect the new branch's actual energy status.", isCorrect: true, feedback: "Correct. Inaccurate or outdated claims must be corrected or narrowed promptly." },
      { text: "Delete the website page entirely.", isCorrect: false, feedback: "Incorrect. The page is useful; correct the statement rather than deleting the page." },
      { text: "Claim the new branch is energy-neutral.", isCorrect: false, feedback: "Incorrect. This is an unverified claim that ignores actual energy logs." }
    ],
    correctExplanation: "Inaccurate or outdated claims must be corrected or narrowed promptly to protect record transparency and client trust.",
    incorrectExplanation: "Leaving outdated claims, deleting pages, or fabricating energy neutrality violates compliance standards.",
    practicalTakeaway: "Correct or narrow claims promptly when operational circumstances change."
  },
  {
    question: "A manager asks a marketing coordinator to remove a critical limitation statement from a product claim because it makes the claim look less impressive.",
    options: [
      { text: "Remove the limitation to support the sales team.", isCorrect: false, feedback: "Incorrect. Removing material qualifications makes the claim misleading." },
      { text: "Retain the material qualification to protect accuracy, and escalate the approval concern to the compliance manager.", isCorrect: true, feedback: "Correct. Protect record accuracy, retain the qualification, and escalate the concern." },
      { text: "Shorten the limitation so it is hard to read.", isCorrect: false, feedback: "Incorrect. Obfuscating limitations is unethical and misleading." },
      { text: "Move the limitation to another unrelated product page.", isCorrect: false, feedback: "Incorrect. Moving qualifications misleads audits and customers." }
    ],
    correctExplanation: "Protect record accuracy, retain the material qualification, and escalate the approval concern where necessary.",
    incorrectExplanation: "Removing limitations, shortening qualifiers, or moving data to unrelated pages violates ethical communication codes.",
    practicalTakeaway: "Retain material qualifications and limitations. Escalate approval concerns."
  }
];

export async function ensureSustainabilityForSalesAndMarketingTeamsCourse() {
  logger.info(`Checking and executing ${COURSE_TITLE} course content migration...`);

  try {
    const seedRecord = await db.query.systemSeedsTable.findFirst({
      where: eq(systemSeedsTable.name, SEED_NAME)
    });

    if (seedRecord) {
      logger.info(`[Seed] ${SEED_NAME} has already been run. Skipping to preserve subsequent edits.`);
      return;
    }

    await db.transaction(async (tx) => {
      // 1. Resolve foundation prerequisite (Course 12)
      let course12 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-12")
      });
      if (!course12) {
        course12 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "final-sustainability-certification")
        });
      }

      if (!course12) {
        throw new Error("Data integrity error: Course 12 (ELH-12) not found. Foundation prerequisite cannot be established.");
      }

      // 2. Resolve Course 16
      let course16 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-16")
      });
      if (!course16) {
        course16 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "communicating-sustainability-at-work")
        });
      }

      if (!course16) {
        throw new Error("Data integrity error: Course 16 (ELH-16) not found. Prerequisite cannot be established.");
      }

      // 3. Resolve or insert Course 28
      let existingCourse = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, COURSE_META.courseCode)
      });
      if (!existingCourse) {
        existingCourse = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, COURSE_SLUG)
        });
      }

      let actualCourseId: number;

      if (!existingCourse) {
        const [inserted] = await tx.insert(coursesTable).values({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: COURSE_META.courseCode,
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
          intendedRoles: COURSE_META.intendedRoles,
          status: "published",
          isPublished: true,
          recommendedNextCourseId: null,
        }).returning();
        actualCourseId = inserted.id;
      } else {
        actualCourseId = existingCourse.id;
        // Update Course metadata but DO NOT overwrite recommendedNextCourseId to preserve admin choices
        await tx.update(coursesTable).set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: COURSE_META.courseCode,
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
          intendedRoles: COURSE_META.intendedRoles,
          status: "published",
          isPublished: true,
        }).where(eq(coursesTable.id, actualCourseId));
      }

      // 4. Update Course 27 recommendedNextCourseId to point to Course 28 preserving admin edits
      let course27Ref = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-27")
      });
      if (!course27Ref) {
        course27Ref = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "sustainability-for-facilities-and-property-teams")
        });
      }

      if (course27Ref) {
        let isSystemManaged = false;
        if (course27Ref.recommendedNextCourseId) {
          const currentRecommendedCourse = await tx.query.coursesTable.findFirst({
            where: eq(coursesTable.id, course27Ref.recommendedNextCourseId)
          });
          if (currentRecommendedCourse && currentRecommendedCourse.courseCode === "ELH-28") {
            isSystemManaged = true;
          }
        }

        if (course27Ref.recommendedNextCourseId === null || course27Ref.recommendedNextCourseId === actualCourseId || isSystemManaged) {
          await tx.update(coursesTable).set({
            recommendedNextCourseId: actualCourseId
          }).where(eq(coursesTable.id, course27Ref.id));
        } else {
          logger.warn(`Recommendation conflict: Course 27 currently recommends course ID ${course27Ref.recommendedNextCourseId} instead of Course 28 (ID: ${actualCourseId}). Preserving administrator edit.`);
        }
      } else {
        logger.warn("Data integrity note: Course 27 not found during Course 28 recommendation configuration.");
      }

      // 5. Ensure Badge Definition exists
      const existingBadge = await tx.query.badgeDefinitionsTable.findFirst({
        where: eq(badgeDefinitionsTable.slug, BADGE_SLUG)
      });

      if (!existingBadge) {
        await tx.insert(badgeDefinitionsTable).values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "award",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 31,
          code: BADGE_CODE,
        });
      } else {
        await tx.update(badgeDefinitionsTable).set({
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          courseIds: [actualCourseId],
          code: BADGE_CODE,
        }).where(eq(badgeDefinitionsTable.slug, BADGE_SLUG));
      }

      // 6. Ensure Prerequisite relationships exist
      // Prerequisite 1: Course 16
      const existingPrereq16 = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course16.id)
        )
      });
      if (!existingPrereq16) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course16.id
        });
      }

      // Prerequisite 2: Course 12
      const existingPrereq12 = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course12.id)
        )
      });
      if (!existingPrereq12) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course12.id
        });
      }

      // 7. Seed Lessons safely (only if no progress or skeleton lessons exist)
      const existingLessons = await tx.query.lessonsTable.findMany({
        where: eq(lessonsTable.courseId, actualCourseId)
      });

      const hasOnlySkeletonLessons =
        existingLessons.length > 0 &&
        existingLessons.every(l => l.content && l.content.includes("[DRAFT SKELETON]"));

      let existingLessonProgress = [];
      if (existingLessons.length > 0) {
        existingLessonProgress = await tx.query.lessonProgressTable.findMany({
          where: inArray(lessonProgressTable.enrollmentId, existingLessons.map(l => l.id))
        });
      }

      if (existingLessonProgress.length === 0 && (existingLessons.length === 0 || hasOnlySkeletonLessons)) {
        if (hasOnlySkeletonLessons) {
          await tx.delete(lessonsTable).where(eq(lessonsTable.courseId, actualCourseId));
        }

        // Insert new lessons in order
        for (const lesson of NEW_LESSONS) {
          const lExist = await tx.query.lessonsTable.findFirst({
            where: and(
              eq(lessonsTable.orderIndex, lesson.order),
              eq(lessonsTable.courseId, actualCourseId)
            )
          });
          if (!lExist) {
            await tx.insert(lessonsTable).values({
              courseId: actualCourseId,
              title: lesson.title,
              orderIndex: lesson.order,
              durationMinutes: lesson.minutes,
              content: lesson.content,
              contentBlocks: lesson.blocks,
            });
          }
        }
      }

      // 8. Seed Quiz Questions safely
      const existingQuestions = await tx.query.quizQuestionsTable.findMany({
        where: eq(quizQuestionsTable.courseId, actualCourseId)
      });

      const hasOnlySkeletonQuestions =
        existingQuestions.length > 0 &&
        existingQuestions.every(q => q.question && q.question.includes("[DRAFT SKELETON]"));

      const existingAttempts = await tx.query.quizAttemptsTable.findMany({
        where: eq(quizAttemptsTable.courseId, actualCourseId)
      });

      if (existingAttempts.length === 0 && (existingQuestions.length === 0 || hasOnlySkeletonQuestions)) {
        if (hasOnlySkeletonQuestions) {
          await tx.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, actualCourseId));
        }

        for (const [index, q] of NEW_QUIZ_QUESTIONS.entries()) {
          const qExist = await tx.query.quizQuestionsTable.findFirst({
            where: and(
              eq(quizQuestionsTable.courseId, actualCourseId),
              eq(quizQuestionsTable.orderIndex, index)
            )
          });

          if (!qExist) {
            const correctOptionIndex = q.options.findIndex(o => o.isCorrect);
            if (correctOptionIndex === -1) {
              throw new Error(`Question ${index} is missing a correct option`);
            }

            await tx.insert(quizQuestionsTable).values({
              courseId: actualCourseId,
              question: q.question,
              options: q.options.map(o => o.text),
              optionFeedback: q.options.map(o => o.feedback),
              correctOption: correctOptionIndex,
              orderIndex: index,
              correctExplanation: q.correctExplanation,
              incorrectExplanation: q.incorrectExplanation,
              practicalTakeaway: q.practicalTakeaway,
            });
          }
        }
      }

      // 9. Record system seed completion marker
      await tx.insert(systemSeedsTable).values({
        name: SEED_NAME,
        runAt: new Date(),
      });
    });

    logger.info(`Successfully seeded ${COURSE_TITLE} content`);
  } catch (error) {
    logger.error({ err: error }, `Failed to seed ${COURSE_TITLE} course content`);
    throw error;
  }
}
