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
const BADGE_SLUG = "credible-sustainability-communicator";
const BADGE_CODE = "COURSE_ELH_28_COMPLETE";
const SEED_NAME = "sustainability-for-sales-and-marketing-teams-v2";

const COURSE_META = {
  courseCode: "ELH-28",
  description: "Learn how to communicate sustainability accurately, use approved evidence, avoid misleading green claims, and escalate claims requiring specialist or legal review.",
  fullDescription: "Learn how to communicate sustainability accurately, use approved evidence, avoid misleading green claims, and escalate claims requiring specialist or legal review without independently inventing, calculating, or approving technical environmental claims.",
  categoryId: 1,
  durationMinutes: 25,
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
    "Distinguish approved environmental facts from vague, absolute, or unverified marketing claims.",
    "Clarify sales & marketing boundaries vs technical data owners, legal counsel, and executive approvers.",
    "Apply the 7-stage Credible Claim Development Framework from evidence verification to publication.",
    "Structure claims with visible qualifications, material scope limits, and appropriate evidence dates.",
    "Respond accurately to customer sustainability questionnaires and tender inquiries using approved source registers.",
    "Manage claim updates, version control, and rapid correction/withdrawal when operational facts change."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Sustainability for Sales and Marketing Teams. You can now communicate sustainability accurately, use approved evidence, and maintain customer trust through credible claim management.",
  badgeName: "Credible Sustainability Communicator",
  badgeDescription: "Awarded for demonstrating practical understanding of how to communicate sustainability accurately, use approved evidence, and maintain customer trust through credible claim management.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Opening Workplace Hook: The Flawed Proposal",
    minutes: 3,
    content: "Examine a sales tender proposal claiming '100% eco-friendly services' and 'zero-waste operations' based on incomplete evidence.",
    blocks: [
      {
        id: "c28-l1-b1",
        type: "heading",
        headingText: "Opening Workplace Hook: The Overstated Tender Claim"
      },
      {
        id: "c28-l1-b2",
        type: "short_text",
        bodyText: "A sales team in Mauritius prepares a commercial proposal for a major resort client. The draft proposal headline states:\n• '100% Eco-Friendly Commercial Services'\n• 'Zero-Waste Operations'\n• 'Carbon-Neutral Delivery Fleet'\n• 'Fully Sustainable Materials'\n\nHowever, a marketing compliance review reveals:\n• Only 1 packaging box is made of recyclable material.\n• The 'carbon-neutral' claim relies on 1 month of unverified fuel logs.\n• The 'zero-waste' claim is a future 2030 target, not an achieved reality.\n• The proposal deadline is in 3 hours.\n\nThis hook demonstrates that attractive sales copy cannot replace verified evidence and formal sign-off."
      },
      {
        id: "c28-l1-b3",
        type: "key_message",
        headingText: "Commercial Insight",
        bodyText: "Sales and marketing add value by translating approved technical evidence into clear messages—never by converting future targets into current guarantees."
      }
    ]
  },
  {
    order: 1,
    title: "Why Credible Claims Matter: Personal, Business, and Trust Value",
    minutes: 3,
    content: "Understand why accurate sustainability claims build customer trust, protect brand reputation, and win commercial tenders.",
    blocks: [
      {
        id: "c28-l2-b1",
        type: "heading",
        headingText: "Why Credible Claims Matter"
      },
      {
        id: "c28-l2-b2",
        type: "short_text",
        bodyText: "Accurate communication protects both commercial success and brand integrity:\n• Personal & Role Value: Sales staff gain confidence answering customer inquiries without guessing or risking credibility.\n• Business Value: Evidence-backed proposals win commercial tenders and protect against greenwashing lawsuits or brand damage.\n• Environmental Value: Honest communication directs customer purchasing toward genuinely superior environmental products."
      }
    ]
  },
  {
    order: 2,
    title: "Role Boundaries: Sales/Marketing vs Technical & Legal Owners",
    minutes: 3,
    content: "Define functional boundaries between marketing copy drafting, technical verification, and legal sign-off.",
    blocks: [
      {
        id: "c28-l3-b1",
        type: "heading",
        headingText: "Sales & Marketing Boundary Matrix"
      },
      {
        id: "c28-l3-b2",
        type: "short_text",
        bodyText: "Sales and marketing communicate approved facts; they do not calculate or certify technical claims.\n\nBoundary Matrix:\n• Sales/Marketing Owns: Copy drafting from approved registers, channel selection, qualifications visibility, and version control.\n• Technical/HSE Owns: Carbon calculations, energy metrics, waste data verification, and product ingredient testing.\n• Legal/Compliance Owns: Certification mark usage, regulatory risk review, and comparative advertising approvals."
      }
    ]
  },
  {
    order: 3,
    title: "Plain-Language Green Claims Vocabulary",
    minutes: 3,
    content: "Master essential terms for accurate environmental communication.",
    blocks: [
      {
        id: "c28-l4-b1",
        type: "heading",
        headingText: "Plain-Language Green Claims Vocabulary"
      },
      {
        id: "c28-l4-b2",
        type: "short_text",
        bodyText: "Key Terms Defined:\n• Verified Fact vs Target: A fact is a measured past achievement (e.g. 15% lower energy in 2025); a target is a future goal.\n• Absolute Claim: Unqualified terms like '100% green' or 'zero impact' which are almost impossible to substantiate.\n• Qualification: A visible statement explaining scope, date, baseline, or conditions (e.g., 'applies to outer packaging only').\n• Greenwashing: Exaggerating or misrepresenting environmental attributes to mislead customers."
      }
    ]
  },
  {
    order: 4,
    title: "Sourced Fact: ISO 14021 & Green Claims Principles",
    minutes: 3,
    content: "Examine international standards governing self-declared environmental claims.",
    blocks: [
      {
        id: "c28-l5-b1",
        type: "heading",
        headingText: "Sourced Fact: Environmental Claims Standards"
      },
      {
        id: "c28-l5-b2",
        type: "memorable_fact",
        factTitle: "ISO 14021:2016 & ICC Advertising Standards",
        bodyText: "ISO 14021:2016 (Self-Declared Environmental Claims) and ICC Code guidelines state that environmental claims must be specific, substantiated, accurate, and non-deceptive.\n\nPractical Marketing Implication: A claim is misleading not only if factually false, but if it omits material qualifications or creates an overstated impression. Broad terms like 'eco-friendly' or 'chemical-free' must be replaced with specific, verifiable facts."
      }
    ]
  },
  {
    order: 5,
    title: "7-Stage Credible Claim Development Framework",
    minutes: 3,
    content: "Apply the 7-stage framework to take claims safely from idea to publication.",
    blocks: [
      {
        id: "c28-l6-b1",
        type: "heading",
        headingText: "The 7-Stage Credible Claim Framework"
      },
      {
        id: "c28-l6-b2",
        type: "short_text",
        bodyText: "1. Define Exact Claim: Specify product, service, site, or company scope.\n2. Identify Audience & Channel: Determine likely customer interpretation on web, brochure, or social media.\n3. Locate Supporting Evidence: Match claim to verified data logs or test reports.\n4. Check Scope & Date: Ensure evidence covers the exact time period and location.\n5. Draft Qualified Wording: Include visible limitations, baselines, and dates.\n6. Obtain Sign-Off: Secure technical data owner and legal/compliance approval.\n7. Publish & Review: Maintain claim register, archive outdated copy, and update as facts change."
      }
    ]
  },
  {
    order: 6,
    title: "Mauritius-Relevant Example: Eco-Cleaning Service Campaign",
    minutes: 3,
    content: "Review a commercial marketing campaign for a Mauritian facility services company.",
    blocks: [
      {
        id: "c28-l7-b1",
        type: "heading",
        headingText: "Mauritian Commercial Example"
      },
      {
        id: "c28-l7-b2",
        type: "short_text",
        bodyText: "A Port Louis commercial services company launches a new office cleaning line:\n• Unapproved Draft: '100% Chemical-Free, Zero-Impact Cleaning Service.'\n• Compliance Review: Product contains naturally derived cleaning agents (not chemical-free) and packaging is 80% recycled cardboard.\n\n• Approved Copy: 'Office cleaning using plant-derived active ingredients, packaged in 80% recycled cardboard delivery boxes.'"
      }
    ]
  },
  {
    order: 7,
    title: "Visual Element: Evidence-to-Claim Approval Flow",
    minutes: 3,
    content: "Interactive visual diagram mapping claim strength from unverified idea to approved copy.",
    blocks: [
      {
        id: "c28-l8-b1",
        type: "heading",
        headingText: "Visual Interactive: Claim Strength Ladder"
      },
      {
        id: "c28-l8-b2",
        type: "image",
        imageUrl: "/images/courses/sustainability-for-sales-and-marketing-teams.jpg",
        captionText: "Claim Strength Ladder: Vague Absolute Claim -> Broad Unqualified Claim -> Specific Qualified Fact."
      },
      {
        id: "c28-l8-b3",
        type: "short_text",
        bodyText: "Approval Rule:\nNever publish a headline claim that requires hidden fine-print disclaimers to correct a misleading impression."
      }
    ]
  },
  {
    order: 8,
    title: "20 Practical Workplace Sales & Marketing Actions",
    minutes: 3,
    content: "Execute 20 concrete marketing and sales actions to ensure claim credibility.",
    blocks: [
      {
        id: "c28-l9-b1",
        type: "heading",
        headingText: "20 Practical Sales & Marketing Actions"
      },
      {
        id: "c28-l9-b2",
        type: "short_text",
        bodyText: "1. Make every claim specific and attribute-focused.\n2. State the exact scope (product, site, or company).\n3. Record the evidence source and date for every statement.\n4. Separate past achievements from future targets.\n5. Avoid absolute words ('100%', 'zero', 'always').\n6. Avoid vague labels ('eco', 'green', 'clean') without detail.\n7. Place material qualifications adjacent to headlines.\n8. Verify local recycling collection before claiming recyclability.\n9. Obtain written permission before using certification logos.\n10. Keep customer-facing claim wording consistent across channels.\n11. Maintain a central approved claim register.\n12. Check claim expiration dates annually.\n13. Escalate technical customer questions to data owners.\n14. Never guess answers during sales calls.\n15. Correct published errors or outdated claims immediately.\n16. Disclose baseline periods when making comparative claims.\n17. Distinguish supplier claims from company-verified evidence.\n18. Ensure imagery matches written qualifications.\n19. Archive expired marketing collateral.\n20. Verify compliance approval before press releases."
      }
    ]
  },
  {
    order: 9,
    title: "Applied Scenario Challenge: The Cleaning Product Launch",
    minutes: 3,
    content: "Solve a multi-step commercial marketing challenge involving unverified eco-labels and urgent deadlines.",
    blocks: [
      {
        id: "c28-l10-b1",
        type: "heading",
        headingText: "Scenario Challenge: Cleaning Product Launch"
      },
      {
        id: "c28-l10-b2",
        type: "short_text",
        bodyText: "Scenario: A distributor prepares brochure copy for a new hotel dishwashing liquid, claiming 'Certified 100% Eco-Friendly & Chemical-Free.' The product safety sheet lists active biodegradable surfactants, and a certification application is pending.\n\nCorrect Action: Revise copy to 'Formulated with biodegradable surfactants; packaging made of 50% recycled plastic.' Omit '100% chemical-free' (factually false) and 'certified' (application is pending, not awarded)."
      }
    ]
  },
  {
    order: 10,
    title: "Learner Commitment & Practical Actions",
    minutes: 3,
    content: "Select one practical workplace sales or marketing commitment to execute this week.",
    blocks: [
      {
        id: "c28-l11-b1",
        type: "heading",
        headingText: "Select Your Practical Sales/Marketing Commitment"
      },
      {
        id: "c28-l11-b2",
        type: "short_text",
        bodyText: "Choose one action for your team this week:\n• Review 1 active brochure or website page for vague terms like 'eco-friendly' and replace them with specific facts.\n• Verify the evidence date and source behind 1 key sales presentation slide.\n• Confirm that a future target is clearly marked as a goal rather than an achieved result.\n• Audit active marketing copy to ensure all certification logos have valid permission files."
      }
    ]
  },
  {
    order: 11,
    title: "Completion, Badge & Practical Disclaimer",
    minutes: 3,
    content: "Review completion recognition and practical disclaimer guidelines.",
    blocks: [
      {
        id: "c28-l12-b1",
        type: "heading",
        headingText: "Completion & Recognition"
      },
      {
        id: "c28-l12-b2",
        type: "short_text",
        bodyText: "You have completed Sustainability for Sales and Marketing Teams. You can now draft specific, qualified, and evidence-backed customer communications while protecting organizational credibility."
      },
      {
        id: "c28-l12-b3",
        type: "callout",
        headingText: "Practical Disclaimer",
        bodyText: "This course provides practical guidance on sales and marketing communication. It does not replace legal counsel, regulatory compliance review, or technical environmental verification."
      }
    ]
  }
];

const QUIZ_QUESTIONS = [
  {
    question: "What is the primary boundary of sales and marketing teams regarding workplace sustainability claims?",
    options: [
      "Sales and marketing staff calculate technical carbon footprints and issue environmental compliance certificates.",
      "Sales and marketing staff draft customer-facing communications using approved technical evidence, visible qualifications, and formal sign-off.",
      "Sales and marketing staff approve absolute claims like '100% green' without consulting technical owners.",
      "Sales and marketing staff ignore customer sustainability questions to avoid legal risks."
    ],
    correctOption: 1,
    correctExplanation: "Correct! Sales and marketing draft communications using approved technical evidence and qualifications, leaving calculations to technical leads.",
    incorrectExplanation: "Review role boundaries: Sales & marketing translate approved facts into copy; technical leads verify calculations.",
    optionFeedback: [
      "Incorrect. Carbon calculations belong to technical/ESG leads; compliance certificates require accredited bodies.",
      "Correct! Sales and marketing staff draft customer-facing communications using approved technical evidence, visible qualifications, and formal sign-off.",
      "Incorrect. Absolute claims without evidence violate communication controls.",
      "Incorrect. Ignoring questions damages customer trust; refer queries to data owners instead."
    ],
    orderIndex: 0
  },
  {
    question: "A hotel replaces single-use plastic toiletry bottles with refillable dispensers in guest bathrooms. What claim can marketing safely use on website banners?",
    options: [
      "Our hotel is now completely plastic-free.",
      "Our guest room bathrooms are 100% eco-friendly and zero impact.",
      "We have replaced single-use toiletry bottles with wall refillable dispensers in guest bathrooms.",
      "Our hotel has eliminated all environmental footprint."
    ],
    correctOption: 2,
    correctExplanation: "Correct! State the specific, verified physical change rather than making a broad, unverified absolute claim.",
    incorrectExplanation: "Review specific vs absolute claims: State the exact physical change supported by evidence.",
    optionFeedback: [
      "Incorrect. The hotel still uses plastic in other departments.",
      "Incorrect. '100% eco-friendly' is an unverified absolute claim.",
      "Correct! We have replaced single-use toiletry bottles with wall refillable dispensers in guest bathrooms.",
      "Incorrect. Eliminating all footprint is an unprovable absolute claim."
    ],
    orderIndex: 1
  },
  {
    question: "According to ISO 14021:2016 and ICC advertising standards, why is a vague claim like 'eco-friendly product' problematic?",
    options: [
      "Vague claims are misleading because they provide no specific, verifiable detail and create an overstated impression.",
      "Vague claims are prohibited because only government agencies can use the word 'eco'.",
      "Vague claims are acceptable as long as the product price is low.",
      "Vague claims are recommended because they require no technical data."
    ],
    correctOption: 0,
    correctExplanation: "Correct! International standards require specific, substantiated facts; vague terms overstate performance and mislead consumers.",
    incorrectExplanation: "Review claims standards: Vague terms mislead consumers by omitting specific, verifiable details.",
    optionFeedback: [
      "Correct! Vague claims are misleading because they provide no specific, verifiable detail and create an overstated impression.",
      "Incorrect. 'Eco' is not restricted to government agencies, but requires factual substantiation.",
      "Incorrect. Pricing does not excuse misleading marketing language.",
      "Incorrect. Vague claims destroy brand credibility and violate advertising standards."
    ],
    orderIndex: 2
  },
  {
    question: "A company sets a target to achieve 30% solar energy by 2030. How should this be presented in a sales presentation today?",
    options: [
      "Present it as 'our facilities run on 30% solar power'.",
      "Claim the company is currently carbon neutral.",
      "Omit all energy information from customer decks.",
      "Clearly identify it as a 2030 target goal, distinguishing it from current measured performance."
    ],
    correctOption: 3,
    correctExplanation: "Correct! Always distinguish future targets from current measured performance to avoid converting goals into false guarantees.",
    incorrectExplanation: "Review target vs achievement: Always identify future targets clearly as goals.",
    optionFeedback: [
      "Incorrect. Reporting a 2030 target as a current result is misleading.",
      "Incorrect. Solar targets do not prove current carbon neutrality.",
      "Incorrect. Future targets can be shared if clearly identified as goals.",
      "Correct! Clearly identify it as a 2030 target goal, distinguishing it from current measured performance."
    ],
    orderIndex: 3
  },
  {
    question: "A product uses cardboard packaging that is theoretically recyclable, but no collection or recycling facility exists in Mauritius. What should marketing state?",
    options: [
      "Advertise the product as '100% locally recyclable.'",
      "State the material (e.g. 'cardboard delivery box') and note local recycling availability should be verified by the customer.",
      "Label it 'green eco-pack' to avoid explaining details.",
      "Claim the box biodegrades in landfill within 2 days."
    ],
    correctOption: 1,
    correctExplanation: "Correct! Do not claim local recyclability unless verified local collection and processing channels exist.",
    incorrectExplanation: "Review recyclability claims: Avoid claiming local recyclability without confirmed local processing facilities.",
    optionFeedback: [
      "Incorrect. Promising local recyclability without local processing is misleading.",
      "Correct! State the material (e.g. 'cardboard delivery box') and note local recycling availability should be verified by the customer.",
      "Incorrect. Vague green labels do not provide factual recyclability context.",
      "Incorrect. Fabricating biodegradation timelines violates claims standards."
    ],
    orderIndex: 4
  },
  {
    question: "A sales representative receives a complex technical customer inquiry about supply chain carbon emissions. The representative does not have the verified data. What should they do?",
    options: [
      "Estimate a low carbon figure to impress the customer.",
      "Acknowledge the inquiry, provide approved general company facts, and escalate the technical question to the ESG data owner for a verified response.",
      "Refuse to answer and end the sales call.",
      "Claim the supply chain has zero emissions."
    ],
    correctOption: 1,
    correctExplanation: "Correct! Never guess technical data during sales calls; provide approved facts and escalate missing technical queries.",
    incorrectExplanation: "Review technical query handling: Provide known approved facts and escalate missing technical data to data owners.",
    optionFeedback: [
      "Incorrect. Guessing carbon figures risks major commercial and legal liability.",
      "Correct! Acknowledge the inquiry, provide approved general company facts, and escalate the technical question to the ESG data owner for a verified response.",
      "Incorrect. Ending calls abruptly damages customer relationships; escalate through proper channels.",
      "Incorrect. Claiming zero emissions without evidence is false advertising."
    ],
    orderIndex: 5
  },
  {
    question: "A marketing coordinator notices that an active brochure headline claims 'Zero Waste to Landfill', but a new branch office opened that still sends waste to landfill. What is the correct response?",
    options: [
      "Keep distributing the brochure until all printed copies are finished.",
      "Update or qualify the brochure claim promptly to restrict the scope to sites that have achieved verified zero waste status.",
      "Hide the new branch office from company listings.",
      "Blame the printing vendor for the mistake."
    ],
    correctOption: 1,
    correctExplanation: "Correct! Outdated or inaccurate claims must be corrected or qualified promptly when operational facts change.",
    incorrectExplanation: "Review claim updates: Correct or qualify claims promptly when operational facts change.",
    optionFeedback: [
      "Incorrect. Distributing known inaccurate claims misleads customers and breaks compliance.",
      "Correct! Update or qualify the brochure claim promptly to restrict the scope to sites that have achieved verified zero waste status.",
      "Incorrect. Hiding operational sites compromises corporate transparency.",
      "Incorrect. The printing vendor prints approved copy; marketing owns claim accuracy."
    ],
    orderIndex: 6
  },
  {
    question: "A product packaging claim features a third-party eco-certification logo. What must marketing retain in the compliance file?",
    options: [
      "A downloaded Google image of the logo.",
      "Written authorization, valid license certificate, and scope details from the certification body.",
      "A verbal statement from the sales manager.",
      "An internal email saying the logo looks attractive."
    ],
    correctOption: 1,
    correctExplanation: "Correct! Certification logo use requires retaining written license permission and valid scope documentation.",
    incorrectExplanation: "Review certification marks: Retain written license permission and valid scope certificates.",
    optionFeedback: [
      "Incorrect. Downloading a logo image does not grant legal permission to use it.",
      "Correct! Written authorization, valid license certificate, and scope details from the certification body.",
      "Incorrect. Verbal statements do not satisfy legal certification licensing checks.",
      "Incorrect. Visual appeal does not override intellectual property or accreditation rules."
    ],
    orderIndex: 7
  }
];

export async function ensureSustainabilityForSalesAndMarketingTeamsCourse(): Promise<void> {
  logger.info(`Checking and executing ${COURSE_TITLE} course content migration (${SEED_NAME})...`);

  try {
    await db.transaction(async (tx) => {
      const [existingSeed] = await tx
        .select()
        .from(systemSeedsTable)
        .where(eq(systemSeedsTable.name, SEED_NAME))
        .limit(1);

      // Resolve or insert Course 28
      const [existingCourse] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, COURSE_META.courseCode))
        .limit(1);

      let actualCourseId: number;

      if (!existingCourse) {
        const [inserted] = await tx
          .insert(coursesTable)
          .values({
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
            badgeName: COURSE_META.badgeName,
            badgeDescription: COURSE_META.badgeDescription,
            status: "published",
            isPublished: true,
            recommendedNextCourseId: null,
          })
          .returning();
        actualCourseId = inserted.id;
        logger.info(`Inserted new ELH-28 course record (ID: ${actualCourseId}).`);
      } else {
        actualCourseId = existingCourse.id;
        await tx
          .update(coursesTable)
          .set({
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
            badgeName: COURSE_META.badgeName,
            badgeDescription: COURSE_META.badgeDescription,
            status: "published",
            isPublished: true,
            updatedAt: new Date(),
          })
          .where(eq(coursesTable.id, actualCourseId));
        logger.info(`Updated existing ELH-28 course record (ID: ${actualCourseId}).`);
      }

      // Ensure Badge Definition exists
      const [existingBadge] = await tx
        .select()
        .from(badgeDefinitionsTable)
        .where(eq(badgeDefinitionsTable.code, BADGE_CODE))
        .limit(1);

      if (existingBadge) {
        await tx
          .update(badgeDefinitionsTable)
          .set({
            slug: BADGE_SLUG,
            name: COURSE_META.badgeName,
            description: COURSE_META.badgeDescription,
            courseIds: [actualCourseId],
          })
          .where(eq(badgeDefinitionsTable.id, existingBadge.id));
      } else {
        await tx
          .insert(badgeDefinitionsTable)
          .values({
            slug: BADGE_SLUG,
            name: COURSE_META.badgeName,
            description: COURSE_META.badgeDescription,
            icon: "award",
            criteriaType: "all_courses",
            threshold: 0,
            courseIds: [actualCourseId],
            orderIndex: 31,
            code: BADGE_CODE,
          })
          .onConflictDoNothing();
      }

      // Update lessons and quizzes transactionally if seed is not yet present or forced
      const existingLessons = await tx
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, actualCourseId));

      if (!existingSeed || existingLessons.length !== NEW_LESSONS.length) {
        if (existingLessons.length === 0) {
          for (const lesson of NEW_LESSONS) {
            await tx.insert(lessonsTable).values({
              courseId: actualCourseId,
              title: lesson.title,
              orderIndex: lesson.order,
              durationMinutes: lesson.minutes,
              content: lesson.content,
              contentBlocks: lesson.blocks,
            });
          }
        } else {
          for (const lesson of NEW_LESSONS) {
            const lExist = existingLessons.find((l) => l.orderIndex === lesson.order);
            if (lExist) {
              await tx
                .update(lessonsTable)
                .set({
                  title: lesson.title,
                  durationMinutes: lesson.minutes,
                  content: lesson.content,
                  contentBlocks: lesson.blocks,
                })
                .where(eq(lessonsTable.id, lExist.id));
            } else {
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
        logger.info(`Seeded ${NEW_LESSONS.length} upgraded lessons for ELH-28.`);

        await tx.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, actualCourseId));
        // Insert 8 scenario quiz questions with balanced option positions
        for (const q of QUIZ_QUESTIONS) {
          await tx.insert(quizQuestionsTable).values({
            courseId: actualCourseId,
            question: q.question,
            options: q.options,
            correctOption: q.correctOption,
            correctExplanation: q.correctExplanation,
            incorrectExplanation: q.incorrectExplanation,
            optionFeedback: q.optionFeedback,
            orderIndex: q.orderIndex,
          });
        }
        logger.info(`Seeded ${QUIZ_QUESTIONS.length} upgraded quiz questions for ELH-28.`);

        // Record system seed completion marker
        if (!existingSeed) {
          await tx.insert(systemSeedsTable).values({
            name: SEED_NAME,
            version: 2,
          });
        } else {
          await tx
            .update(systemSeedsTable)
            .set({ version: 2 })
            .where(eq(systemSeedsTable.name, SEED_NAME));
        }
      }

      // Ensure Prerequisite relationships exist: ELH-12 and ELH-16 linked to ELH-28
      const prereqCodes = ["ELH-12", "ELH-16"];
      const prereqCourses = await tx
        .select()
        .from(coursesTable)
        .where(inArray(coursesTable.courseCode, prereqCodes));

      for (const prereq of prereqCourses) {
        const [existingLink] = await tx
          .select()
          .from(coursePrerequisitesTable)
          .where(
            and(
              eq(coursePrerequisitesTable.courseId, actualCourseId),
              eq(coursePrerequisitesTable.prerequisiteCourseId, prereq.id)
            )
          )
          .limit(1);

        if (!existingLink) {
          await tx.insert(coursePrerequisitesTable).values({
            courseId: actualCourseId,
            prerequisiteCourseId: prereq.id,
          }).onConflictDoNothing();
        }
      }

      // Ensure ELH-27 recommends ELH-28
      const [course27] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-27"))
        .limit(1);

      if (course27) {
        await tx
          .update(coursesTable)
          .set({ recommendedNextCourseId: actualCourseId })
          .where(eq(coursesTable.id, course27.id));
      }
    });

    logger.info(`Successfully seeded ${COURSE_TITLE} content.`);
  } catch (error) {
    logger.error({ err: error }, `Failed to seed ${COURSE_TITLE} course content.`);
    throw error;
  }
}
