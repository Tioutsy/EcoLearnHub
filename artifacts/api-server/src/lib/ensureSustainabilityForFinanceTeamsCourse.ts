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

const COURSE_SLUG = "sustainability-for-finance-teams";
const COURSE_TITLE = "Sustainability for Finance Teams";
const BADGE_SLUG = "sustainable-finance-supporter";
const BADGE_CODE = "COURSE_ELH_25_COMPLETE";
const SEED_NAME = "sustainability-for-finance-teams-v2";

const COURSE_META = {
  courseCode: "ELH-25",
  description: "A practical course for finance employees and managers on integrating sustainability into budgeting, expenditure review, financial controls, evidence management and management reporting.",
  fullDescription: "A practical course for finance employees and managers on integrating sustainability into budgeting, expenditure review, financial controls, evidence management and management reporting without presenting finance as the sole owner of technical environmental performance or calculations.",
  categoryId: 1,
  durationMinutes: 25,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainability-for-finance-teams.jpg",
  intendedRoles: [
    "Finance officers",
    "Accountants",
    "Finance administrators",
    "Payroll and accounts employees",
    "Finance managers",
    "Employees responsible for invoices, budgets or expenditure records",
    "Managers who work with finance teams on sustainability initiatives"
  ],
  learningObjectives: [
    "Clarify finance's role in evaluating financial visibility, budgeting, and controls for sustainability initiatives.",
    "Distinguish finance responsibilities from technical environmental, ESG, facilities, procurement, or legal ownership.",
    "Apply total cost of ownership (TCO) and lifecycle cost principles beyond initial purchase invoice prices.",
    "Incorporate approved sustainability actions into standard budget coding, expenditure tracking, and variance reviews.",
    "Request, review, and retain credible financial and supporting operational evidence before approving invoices.",
    "Detect and escalate unverified financial assumptions, greenwashing claims, or inaccurate savings reporting."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Sustainability for Finance Teams. You can now support credible decisions through reliable cost comparisons, disciplined budgeting, verifiable records, and honest reviews of cost results.",
  badgeName: "Sustainable Finance Supporter",
  badgeDescription: "Awarded for demonstrating practical understanding of how to integrate sustainability into financial processes, budgeting, lifecycles, record-keeping, and cost controls.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Opening Workplace Hook: The Flawed Proposal",
    minutes: 3,
    content: "Examine a realistic Mauritian commercial proposal where substantial savings are claimed without baseline data, maintenance costs, or verified assumptions.",
    blocks: [
      {
        id: "c25-l1-b1",
        type: "heading",
        headingText: "Opening Workplace Hook: The Flawed Business Case"
      },
      {
        id: "c25-l1-b2",
        type: "short_text",
        bodyText: "A commercial hotel and property enterprise in Mauritius considers a proposal to upgrade air-conditioning chillers and install LED lighting across three sites. The proposal states that the investment will 'pay for itself within 12 months' and reduce electricity costs by MUR 450,000 annually.\n\nHowever, a initial finance review reveals:\n• The baseline energy consumption uses one unusually high summer peak month as the annual baseline.\n• The quotation covers equipment supply but omits installation labor, electrical upgrades, and disposal fees.\n• Annual maintenance contract costs after year one are completely omitted.\n• The expected savings are presented as 100% guaranteed.\n• No operational lead has been assigned to verify meter readings after installation."
      },
      {
        id: "c25-l1-b3",
        type: "key_message",
        headingText: "The Financial Insight",
        bodyText: "Finance adds value by making assumptions, total costs, evidence gaps, and decision conditions visible before capital is committed."
      }
    ]
  },
  {
    order: 1,
    title: "Why Finance Matters: Personal, Business, and Environmental Value",
    minutes: 3,
    content: "Understand why finance involvement ensures affordable, accountable, and evidence-backed workplace sustainability.",
    blocks: [
      {
        id: "c25-l2-b1",
        type: "heading",
        headingText: "Why Finance Involvement Matters"
      },
      {
        id: "c25-l2-b2",
        type: "short_text",
        bodyText: "Finance involvement connects sustainability ideas to rigorous business discipline:\n• Employee & Personal Value: Finance staff gain clarity on how to review green proposals without acting as technical engineers.\n• Business Value: Credible financial controls protect against unbudgeted cost overruns, greenwashing risks, and unreliable vendor claims.\n• Environmental Value: Rigorous budgeting ensures approved environmental projects receive sustained funding rather than being cancelled mid-way."
      }
    ]
  },
  {
    order: 2,
    title: "Finance Role Boundary & Responsibility Matrix",
    minutes: 3,
    content: "Define functional boundaries between finance ownership, support duties, and technical environmental leads.",
    blocks: [
      {
        id: "c25-l3-b1",
        type: "heading",
        headingText: "Finance Role Responsibility Matrix"
      },
      {
        id: "c25-l3-b2",
        type: "short_text",
        bodyText: "Finance is a financial evaluator and control custodian—not a technical environmental engineer.\n\nResponsibility Boundaries:\n• Finance Owns: Budget coding, expenditure recording, invoice matching, variance tracking, and financial evidence retention.\n• Finance Supports: Business case evaluation, payback modeling, procurement reviews, and cost-benefit analysis.\n• Finance Does Not Own: Carbon calculations, technical energy engineering, legal permit compliance, or supplier environmental verification."
      }
    ]
  },
  {
    order: 3,
    title: "Plain-Language Financial Vocabulary",
    minutes: 3,
    content: "Master core financial terms relevant to workplace sustainability evaluation.",
    blocks: [
      {
        id: "c25-l4-b1",
        type: "heading",
        headingText: "Plain-Language Financial Vocabulary"
      },
      {
        id: "c25-l4-b2",
        type: "short_text",
        bodyText: "Key Terms Defined:\n• Baseline: Historical, verified consumption data prior to an initiative.\n• Total Cost of Ownership (TCO): Combined purchase price, installation, operating utilities, maintenance, and disposal costs over useful life.\n• Avoided Cost: Future expenditure prevented by an initiative (e.g., lower utility tariff hikes).\n• Sensitivity Check: Testing how financial return changes if energy savings or electricity tariffs vary by +/- 15%.\n• Greenwashing: Exaggerating environmental spending or outcomes to manipulate corporate reports."
      }
    ]
  },
  {
    order: 4,
    title: "Sourced Fact: Business Case Evidence Standards",
    minutes: 3,
    content: "Distinguish verified historical baseline data, supplier estimates, and financial assumptions using international standards.",
    blocks: [
      {
        id: "c25-l5-b1",
        type: "heading",
        headingText: "Sourced Fact: Evidence Classification Standards"
      },
      {
        id: "c25-l5-b2",
        type: "memorable_fact",
        factTitle: "ISO 14001:2015 Clause 8.1 & ISO 50001:2018 Standards",
        bodyText: "ISO 14001:2015 Clause 8.1 (Operational Planning) and ISO 50001:2018 Clause 6.6 (Planning for Energy Data) require organizations to base operational change decisions on verified data and document key assumptions.\n\nPractical Finance Implication: A credible business case must explicitly categorize figures into: (1) Verified historical utility invoices, (2) Vendor quotation commitments, and (3) Unverified estimates requiring operational sign-off."
      }
    ]
  },
  {
    order: 5,
    title: "7-Stage Practical Finance Integration Framework",
    minutes: 3,
    content: "Apply the 7-stage framework to evaluate and control sustainability expenditure.",
    blocks: [
      {
        id: "c25-l6-b1",
        type: "heading",
        headingText: "The 7-Stage Financial Integration Framework"
      },
      {
        id: "c25-l6-b2",
        type: "short_text",
        bodyText: "1. Clarify Action & Intended Result: Confirm exact equipment, location, and operational objective.\n2. Identify All Costs: Include purchase price, freight, installation, training, maintenance, and disposal.\n3. Confirm Technical Data Owner: Assign operational lead to verify technical energy/water claims.\n4. Review Evidence & Assumptions: Check baseline invoices and vendor calculations.\n5. Apply Budget & Approval Controls: Verify budget codes and delegation limits.\n6. Track Actual Expenditure & Variance: Compare actual invoices against approved capital baseline.\n7. Review Results & Report Limitations: Report verified cost reductions while disclosing external variables."
      }
    ]
  },
  {
    order: 6,
    title: "Mauritius-Relevant Example: Commercial Laundry Equipment TCO",
    minutes: 3,
    content: "Compare initial purchase price versus lifecycle operating costs for a Mauritian hotel laundry upgrade.",
    blocks: [
      {
        id: "c25-l7-b1",
        type: "heading",
        headingText: "Lifecycle Costing Example: Hotel Commercial Laundry"
      },
      {
        id: "c25-l7-b2",
        type: "short_text",
        bodyText: "A Grand Baie resort compares two commercial laundry washing machines:\n• Washer A: Purchase price MUR 180,000. Standard water & energy use. 1-year warranty.\n• Washer B: Purchase price MUR 240,000. 35% less water, heat recovery system, 3-year service agreement included.\n\nLifecycle Analysis: Over a 5-year useful life, Washer B saves MUR 110,000 in water and electricity bills and avoids MUR 35,000 in service fees. Although Washer B costs MUR 60,000 more upfront, its Total Cost of Ownership is MUR 85,000 lower than Washer A."
      }
    ]
  },
  {
    order: 7,
    title: "Visual Element: Business-Case Evidence Flow & Traceability",
    minutes: 3,
    content: "Interactive visual diagram connecting vendor quotes, utility invoices, budget codes, and audit trails.",
    blocks: [
      {
        id: "c25-l8-b1",
        type: "heading",
        headingText: "Visual Interactive: Budget-to-Results Traceability"
      },
      {
        id: "c25-l8-b2",
        type: "image",
        imageUrl: "/images/courses/sustainability-for-finance-teams.jpg",
        captionText: "Financial Evidence Flow: From Vendor Quote to Ledger Entry and Post-Audit Review."
      },
      {
        id: "c25-l8-b3",
        type: "short_text",
        bodyText: "Traceability Principles:\n• Stage 1: Verified Utility Invoice Baseline -> Stage 2: Approved Business Case & Budget Code -> Stage 3: Purchase Order & Vendor Invoice -> Stage 4: Post-Implementation Utility Variance Review.\n\nIf any link in the evidence chain is missing, finance should flag the gap before approving payment."
      }
    ]
  },
  {
    order: 8,
    title: "Practical Workplace Finance Actions",
    minutes: 3,
    content: "Execute 12 concrete finance actions to maintain financial control integrity.",
    blocks: [
      {
        id: "c25-l9-b1",
        type: "heading",
        headingText: "12 Practical Finance Control Actions"
      },
      {
        id: "c25-l9-b2",
        type: "short_text",
        bodyText: "1. Request verified baseline utility bills.\n2. Document source and date of all cost assumptions.\n3. Include installation, training, and maintenance in capital requests.\n4. Separate expected savings from guaranteed savings.\n5. Assign dedicated budget codes for sustainability projects.\n6. Match vendor invoices to approved purchase orders.\n7. Track actual costs against approved budgets monthly.\n8. Record reasons for expenditure variances (+/- 10%).\n9. Require technical sign-off from operational heads.\n10. Retain financial evidence for internal/external audits.\n11. Escalate unverified vendor claims or suspicious invoices.\n12. Disclose external variables (e.g., weather, shift changes) when reporting utility cost drops."
      }
    ]
  },
  {
    order: 9,
    title: "Applied Scenario Challenge: The Multi-Site Equipment Proposal",
    minutes: 3,
    content: "Solve a multi-step financial review challenge involving an urgent equipment replacement proposal.",
    blocks: [
      {
        id: "c25-l10-b1",
        type: "heading",
        headingText: "Scenario Challenge: Multi-Site Equipment Proposal"
      },
      {
        id: "c25-l10-b2",
        type: "short_text",
        bodyText: "Scenario: An operations manager submits a MUR 500,000 equipment upgrade for three sites, demanding immediate finance sign-off before a vendor discount expires. The proposal claims a 1-year payback, but omits electrical installation costs, relies on a peak-month baseline, and includes no technical validation from the engineering lead.\n\nCorrect Finance Decision: Do not reject blindly, but withhold approval until: (1) Installation labor costs are included, (2) A 12-month average baseline is used, and (3) The engineering lead signs off on the technical energy reduction claim."
      }
    ]
  },
  {
    order: 10,
    title: "Learner Commitment & Practical Actions",
    minutes: 3,
    content: "Select one practical workplace finance commitment to apply this week.",
    blocks: [
      {
        id: "c25-l11-b1",
        type: "heading",
        headingText: "Select Your Practical Finance Commitment"
      },
      {
        id: "c25-l11-b2",
        type: "short_text",
        bodyText: "Choose one action for your organization:\n• Review an active sustainability project proposal for missing installation or maintenance costs.\n• Confirm whether reported energy savings are based on verified utility bills or vendor estimates.\n• Create a dedicated budget code for tracking sustainability-related capital expenditure.\n• Require operational sign-off on all vendor energy-saving claims prior to invoice approval."
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
        id: "c25-l12-b1",
        type: "heading",
        headingText: "Completion & Recognition"
      },
      {
        id: "c25-l12-b2",
        type: "short_text",
        bodyText: "You have completed Sustainability for Finance Teams. You are now equipped to evaluate business cases, enforce financial controls, perform total cost of ownership analysis, and ensure financial records remain accurate and audit-ready."
      },
      {
        id: "c25-l12-b3",
        type: "callout",
        headingText: "Practical Disclaimer",
        bodyText: "This course provides practical workplace financial guidance. It does not constitute formal tax advice, statutory accounting standards advice, legal counsel, or independent ESG audit certification."
      }
    ]
  }
];

const QUIZ_QUESTIONS = [
  {
    question: "What is the primary boundary of finance's role in evaluating workplace sustainability initiatives?",
    options: [
      "Finance independently calculates carbon footprint metrics and certifies technical engineering designs.",
      "Finance evaluates financial viability, enforces budget controls, models total cost of ownership, and verifies supporting evidence while technical leads validate operational claims.",
      "Finance approves any project immediately if it contains green marketing keywords.",
      "Finance enforces mandatory salary deductions for departments that exceed energy budgets."
    ],
    correctOption: 1,
    correctExplanation: "Correct! Finance evaluates financial metrics, budget integrity, TCO, and evidence, while technical leads own operational engineering.",
    incorrectExplanation: "Review finance role boundaries: Finance evaluates financial viability and evidence; technical leads validate engineering claims.",
    optionFeedback: [
      "Incorrect. Carbon calculations belong to ESG leads; engineering designs belong to technical leads.",
      "Correct! Finance evaluates financial viability, enforces budget controls, models total cost of ownership, and verifies supporting evidence while technical leads validate operational claims.",
      "Incorrect. Green keywords do not bypass financial review or authorization limits.",
      "Incorrect. Salary deductions for energy overruns are illegal and unethical."
    ],
    orderIndex: 0
  },
  {
    question: "A proposal claims a new solar lighting system will 'pay for itself in 12 months' based on one peak summer month's electricity bill. Why should finance challenge this claim?",
    options: [
      "Solar panels are illegal under Mauritian commercial property regulations.",
      "Peak summer bills automatically corrupt general ledger accounting software.",
      "Using a single peak month creates an artificially high baseline that exaggerates annual savings.",
      "Finance must always reject renewable energy projects regardless of payback period."
    ],
    correctOption: 2,
    correctExplanation: "Correct! Baselines must reflect representative 12-month utility trends rather than an isolated peak month to avoid inflating financial returns.",
    incorrectExplanation: "Review baseline evaluation: Single peak months distort annual baseline calculations.",
    optionFeedback: [
      "Incorrect. Solar lighting is legal and widely supported in Mauritius.",
      "Incorrect. High utility bills do not corrupt ledger software.",
      "Correct! Using a single peak month creates an artificially high baseline that exaggerates annual savings.",
      "Incorrect. Finance supports viable renewable projects that meet financial decision criteria."
    ],
    orderIndex: 1
  },
  {
    question: "According to ISO 14001:2015 Clause 8.1 and ISO 50001:2018 principles, how should financial proposals classify project figures?",
    options: [
      "Distinguish verified historical utility data, vendor quotation commitments, and unverified estimates requiring operational sign-off.",
      "Combine all estimates and actual invoices into a single unlabelled total sum.",
      "Treat vendor advertising claims as verified audit evidence.",
      "Omit all maintenance and installation costs to keep capital figures low."
    ],
    correctOption: 0,
    correctExplanation: "Correct! Standards require clear data classification: historical baseline, vendor quote, and unverified estimate requiring technical sign-off.",
    incorrectExplanation: "Review evidence standards: Proposals must separate verified historical data, vendor quotes, and estimates.",
    optionFeedback: [
      "Correct! Distinguish verified historical utility data, vendor quotation commitments, and unverified estimates requiring operational sign-off.",
      "Incorrect. Combining data types destroys audit traceability.",
      "Incorrect. Vendor marketing brochures are promotional, not verified audit evidence.",
      "Incorrect. Omitting installation or maintenance distorts total cost of ownership."
    ],
    orderIndex: 2
  },
  {
    question: "When evaluating two commercial appliances, Machine A (lower purchase price, high water/energy use) vs Machine B (higher purchase price, 35% lower utility use), how should finance guide the decision?",
    options: [
      "Select Machine A because initial invoice price is the only metric finance considers.",
      "Select Machine A and hide ongoing water bills in another department's budget.",
      "Select Machine B automatically without calculating actual utility rates.",
      "Perform a Total Cost of Ownership (TCO) calculation incorporating purchase price, expected utility bills, maintenance, and useful life."
    ],
    correctOption: 3,
    correctExplanation: "Correct! Total Cost of Ownership (TCO) models lifecycle costs over useful life, preventing cheap purchases with high operating expenses.",
    incorrectExplanation: "Review TCO principles: Compare purchase price, utilities, maintenance, and useful life.",
    optionFeedback: [
      "Incorrect. Initial price alone ignores ongoing operating costs.",
      "Incorrect. Hiding utility bills in another budget violates financial accounting controls.",
      "Incorrect. Finance must model actual data rather than choosing blindly.",
      "Correct! Perform a Total Cost of Ownership (TCO) calculation incorporating purchase price, expected utility bills, maintenance, and useful life."
    ],
    orderIndex: 3
  },
  {
    question: "A green team requests an immediate MUR 100,000 vendor payment for reusable water stations, claiming management verbally agreed. Finance finds no budget code or written sign-off exists. What should finance do?",
    options: [
      "Pay the vendor immediately to avoid delaying an environmental project.",
      "Pause payment, explain missing approval steps, and assist the team in submitting a formal budget request for management authorization.",
      "Pay the invoice and log it as a general entertainment expense.",
      "Cancel the water station project permanently without explanation."
    ],
    correctOption: 1,
    correctExplanation: "Correct! Sustainability projects must follow standard financial authorization thresholds and formal budget coding before funds are released.",
    incorrectExplanation: "Review budget controls: Green projects must follow standard approval limits and budget coding.",
    optionFeedback: [
      "Incorrect. Verbal promises do not override formal financial delegation limits.",
      "Correct! Pause payment, explain missing approval steps, and assist the team in submitting a formal budget request for management authorization.",
      "Incorrect. Misclassifying transactions as entertainment violates accounting standards.",
      "Incorrect. Finance helps guide proper approval; it does not arbitrarily cancel valid projects."
    ],
    orderIndex: 4
  },
  {
    question: "A departmental manager asks finance to change an office refurbishment invoice description to 'carbon reduction investment' to boost the company's ESG report score. How should finance respond?",
    options: [
      "Approve the change because ESG scores are a corporate priority.",
      "Delete the invoice record to prevent audit questions.",
      "Charge the manager an administrative fee to alter the description.",
      "Refuse to alter the description, preserve accurate transaction history, and escalate the request if pressured."
    ],
    correctOption: 3,
    correctExplanation: "Correct! Ledgers must reflect actual transaction reality. Altering descriptions to exaggerate environmental spending is greenwashing.",
    incorrectExplanation: "Review ledger integrity: Transaction descriptions must accurately reflect actual purchases.",
    optionFeedback: [
      "Incorrect. Altering ledger descriptions to inflate ESG metrics is misleading greenwashing.",
      "Incorrect. Deleting valid invoices destroys accounting history and audit trails.",
      "Incorrect. Demanding fees to falsify financial records is illegal and unethical.",
      "Correct! Refuse to alter the description, preserve accurate transaction history, and escalate the request if pressured."
    ],
    orderIndex: 5
  },
  {
    question: "Electricity costs dropped by 18% following an HVAC upgrade. However, office operating hours were also cut by 2 hours daily during that period. How should finance report this result?",
    options: [
      "Report the 18% cost drop while disclosing that both the HVAC upgrade and reduced operating hours contributed to the savings.",
      "Attribute 100% of the cost drop to the HVAC upgrade in the executive summary.",
      "Report that the HVAC upgrade failed completely because hours were reduced.",
      "Omit the cost reduction from financial reports."
    ],
    correctOption: 0,
    correctExplanation: "Correct! Finance must report actual financial results transparently while disclosing external variables (such as shift changes or weather).",
    incorrectExplanation: "Review honest reporting: Disclose all contributing factors alongside actual financial results.",
    optionFeedback: [
      "Correct! Report the 18% cost drop while disclosing that both the HVAC upgrade and reduced operating hours contributed to the savings.",
      "Incorrect. Attributing 100% savings to one factor when operating hours changed is misleading.",
      "Incorrect. Operating hour reductions do not mean the HVAC upgrade failed.",
      "Incorrect. Hiding verified cost drops deprives management of relevant performance data."
    ],
    orderIndex: 6
  },
  {
    question: "An urgent multi-site equipment proposal demands immediate finance sign-off before a vendor discount expires, but omits installation costs and lacks engineering sign-off. What is the best finance response?",
    options: [
      "Reject the project permanently and ban the vendor from future bidding.",
      "Approve sign-off immediately to secure the vendor discount.",
      "Withhold approval until installation costs are included, a representative 12-month baseline is used, and the engineering lead validates energy claims.",
      "Sign off on the proposal but verbally tell the manager that finance is not responsible if it fails."
    ],
    correctOption: 2,
    correctExplanation: "Correct! Evidence-based decision support requires completing missing costs and securing technical validation before approving capital commitments.",
    incorrectExplanation: "Review decision support: Ensure missing installation costs and technical sign-offs are completed before approval.",
    optionFeedback: [
      "Incorrect. Vendor discount urgency does not justify permanent project rejection.",
      "Incorrect. Discount deadlines should not override basic cost completeness checks.",
      "Correct! Withhold approval until installation costs are included, a representative 12-month baseline is used, and the engineering lead validates energy claims.",
      "Incorrect. Verbal disclaimers do not excuse signing off on incomplete financial proposals."
    ],
    orderIndex: 7
  }
];

export async function ensureSustainabilityForFinanceTeamsCourse(): Promise<void> {
  logger.info(`Checking and executing ${COURSE_TITLE} course content migration (${SEED_NAME})...`);

  try {
    await db.transaction(async (tx) => {
      const [existingSeed] = await tx
        .select()
        .from(systemSeedsTable)
        .where(eq(systemSeedsTable.name, SEED_NAME))
        .limit(1);

      // Resolve or insert Course 25
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
        logger.info(`Inserted new ELH-25 course record (ID: ${actualCourseId}).`);
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
        logger.info(`Updated existing ELH-25 course record (ID: ${actualCourseId}).`);
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
            orderIndex: 28,
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
        logger.info(`Seeded ${NEW_LESSONS.length} upgraded lessons for ELH-25.`);

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
        logger.info(`Seeded ${QUIZ_QUESTIONS.length} upgraded quiz questions for ELH-25.`);

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

      // Ensure Prerequisite relationships exist: ELH-12 and ELH-19 linked to ELH-25
      const prereqCodes = ["ELH-12", "ELH-19"];
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

      // Ensure ELH-24 recommends ELH-25
      const [course24] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-24"))
        .limit(1);

      if (course24) {
        await tx
          .update(coursesTable)
          .set({ recommendedNextCourseId: actualCourseId })
          .where(eq(coursesTable.id, course24.id));
      }
    });

    logger.info(`Successfully seeded ${COURSE_TITLE} content.`);
  } catch (error) {
    logger.error({ err: error }, `Failed to seed ${COURSE_TITLE} course content.`);
    throw error;
  }
}
