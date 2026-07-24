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
const SEED_NAME = "sustainability-for-finance-teams-v1";

const COURSE_META = {
  courseCode: "ELH-25",
  description: "Learn how finance teams can support credible workplace sustainability through budgeting, cost information, financial controls and reliable records.",
  fullDescription: "Learn how finance teams can support credible workplace sustainability through budgeting, cost information, financial controls and reliable records.",
  categoryId: 1,
  durationMinutes: 18,
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
    "Explain the finance team's supporting role in workplace sustainability.",
    "Distinguish purchase price from wider operational cost.",
    "Incorporate approved sustainability actions into normal budgeting processes.",
    "Maintain reliable financial evidence for sustainability activities.",
    "Identify and escalate inconsistent, unsupported or misleading information.",
    "Monitor expenditure without making technical conclusions outside the finance function.",
    "Contribute to better sustainability decisions while respecting delegated authority."
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
    title: "Finance Supports Sustainability Decisions",
    minutes: 3,
    content: "Understand the boundaries of the finance team's role. Provide reliable cost information and challenge missing parameters without validating technical claims.",
    blocks: [
      {
        id: "c25-l1-b1",
        type: "heading",
        headingText: "Finance Supports Sustainability Decisions"
      },
      {
        id: "c25-l1-b2",
        type: "short_text",
        bodyText: "Finance supports sustainability decisions by supplying reliable cost comparisons, managing budgets, and preserving invoice evidence. Finance does not independently determine whether a technical solution is efficient or approve projects outside established delegation thresholds. Finance helps ensure that business cases are complete, requesting clarification if technical parameters or operating costs are missing."
      },
      {
        id: "c25-l1-b3",
        type: "key_message",
        headingText: "Responsibility Bounds",
        bodyText: "Finance provides decision-quality financial information but defers technical suitability and final engineering validation to operational heads."
      },
      {
        id: "c25-l1-b4",
        type: "decision_scenario",
        decisionIntro: "A facilities manager submits a proposal to replace all air-conditioning units, claiming it will 'pay for itself quickly.' They provide only a quotation for purchase and installation, with no details on current energy use, expected maintenance changes, or who verified the energy-saving claims. What is the correct response?",
        decisionPrompt: "Select the most appropriate action:",
        decisionChoices: [
          {
            label: "Approve the purchase immediately to support environmental progress.",
            correct: false,
            feedback: "Incorrect. Approving projects without complete cost information or delegation authority violates financial controls."
          },
          {
            label: "Request the missing operating costs and ask the facilities head to document who validated the technical energy-saving assumptions.",
            correct: true,
            feedback: "Correct. Finance must ensure decision parameters are complete and technical claims are validated by the responsible owner."
          },
          {
            label: "Calculate estimated energy savings yourself based on a web search.",
            correct: false,
            feedback: "Incorrect. Finance should not invent technical energy calculations; they must come from a verified operational source."
          },
          {
            label: "Reject the project permanently because of missing paperwork.",
            correct: false,
            feedback: "Incorrect. The project may be valid; the correct path is to request the missing data, not arbitrary rejection."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Look Beyond the Purchase Price",
    minutes: 3,
    content: "Evaluate purchasing decisions using lifecycle operating costs (energy, water, maintenance) rather than initial invoice price alone.",
    blocks: [
      {
        id: "c25-l2-b1",
        type: "heading",
        headingText: "Look Beyond the Purchase Price"
      },
      {
        id: "c25-l2-b2",
        type: "short_text",
        bodyText: "A cheap purchase price can result in higher overall operating costs. When comparing options, look at lifecycle factors: installation, utility consumption (electricity, water), useful life, maintenance contracts, and disposal costs. The depth of analysis should match the value and risk of the purchase. Note: environmental benefit does not automatically translate to financial return."
      },
      {
        id: "c25-l2-b3",
        type: "key_message",
        headingText: "Lifecycle Considerations",
        bodyText: "Evaluating overall operating costs prevents the organization from buying cheap equipment that consumes excessive utilities."
      },
      {
        id: "c25-l2-b4",
        type: "decision_scenario",
        decisionIntro: "A Mauritian hotel compares two commercial washing machines. Machine A costs MUR 150,000 to buy, but uses high volumes of water. Machine B costs MUR 200,000, uses 40% less water, and includes a 3-year service agreement. How should finance assist in the decision?",
        decisionPrompt: "Select the correct finance action:",
        decisionChoices: [
          {
            label: "Recommend Machine A because it has the lowest initial invoice price.",
            correct: false,
            feedback: "Incorrect. Recommending based on initial price ignores ongoing utility and maintenance costs."
          },
          {
            label: "Provide a comparison modeling purchase price, estimated water costs, and service costs over their useful lives to support a balanced decision.",
            correct: true,
            feedback: "Correct. Finance helps compare all relevant lifecycle costs rather than initial price alone."
          },
          {
            label: "Choose Machine B automatically because it has 'green' marketing labels.",
            correct: false,
            feedback: "Incorrect. Finance must analyze financial data, not rely on marketing labels without calculation."
          },
          {
            label: "Refuse to compare them because they are in different budget years.",
            correct: false,
            feedback: "Incorrect. Lifecycle modeling often crosses budget years to verify long-term viability."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Put Approved Actions Into the Budget",
    minutes: 3,
    content: "Establish formal budget entries, responsible owners, and clear approval limits. Do not use sustainability labels to bypass financial controls.",
    blocks: [
      {
        id: "c25-l3-b1",
        type: "heading",
        headingText: "Put Approved Actions Into the Budget"
      },
      {
        id: "c25-l3-b2",
        type: "short_text",
        bodyText: "Approved sustainability initiatives require defined budget entries, responsible cost owners, and realistic estimates. Sustainability labels must never be used to bypass normal approval limits. Finance must track project stages carefully: proposed, approved, committed, invoiced, and paid."
      },
      {
        id: "c25-l3-b3",
        type: "key_message",
        headingText: "Budget Control Integrity",
        bodyText: "Every green project must follow standard financial authorization thresholds before any purchasing commitments are made."
      },
      {
        id: "c25-l3-b4",
        type: "decision_scenario",
        decisionIntro: "A green team secures informal management encouragement for reusable water stations and immediately tries to order MUR 80,000 of equipment. Finance finds no formal budget entry or written approval exists.",
        decisionPrompt: "What should the finance officer do?",
        decisionChoices: [
          {
            label: "Release the payment immediately to avoid delaying a green initiative.",
            correct: false,
            feedback: "Incorrect. Bypassing controls for 'green' projects damages financial governance."
          },
          {
            label: "Explain the missing approval steps to the team, and help them document the formal budget request for management authorization.",
            correct: true,
            feedback: "Correct. Standard financial authorization procedures must apply to all sustainability initiatives."
          },
          {
            label: "Pay the invoice and log it as a general marketing expense.",
            correct: false,
            feedback: "Incorrect. Miscategorizing expenses to bypass approvals hides the real cost and violates record standards."
          },
          {
            label: "Tell the team that sustainability projects are not allowed.",
            correct: false,
            feedback: "Incorrect. The project is valid; it simply needs to follow the standard approval workflow."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Keep Evidence That Can Be Trusted",
    minutes: 3,
    content: "Store invoices, payment receipts, and utility bills. Recognize that invoices prove transaction expenditure, not environmental outcomes.",
    blocks: [
      {
        id: "c25-l4-b1",
        type: "heading",
        headingText: "Keep Evidence That Can Be Trusted"
      },
      {
        id: "c25-l4-b2",
        type: "short_text",
        bodyText: "Finance must preserve invoice evidence: approved budgets, POs, quotations, payment confirmations, and utility records. Remember that a financial document proves that money was spent; it does not prove environmental success. An invoice for recycling services proves the service was paid for, but does not prove the actual tonnage recycled without collection weight slips."
      },
      {
        id: "c25-l4-b3",
        type: "key_message",
        headingText: "Evidence Boundaries",
        bodyText: "Record what the financial evidence actually proves. Do not inflate transactions into unverified environmental metrics."
      },
      {
        id: "c25-l4-b4",
        type: "decision_scenario",
        decisionIntro: "A department manager wants to classify all office cleaning invoice expenditure as 'Sustainable Procurement' because the supplier has 'Eco-Choice' written on their letterhead. Finance has invoices but no product certifications or approved criteria.",
        decisionPrompt: "What is the correct finance response?",
        decisionChoices: [
          {
            label: "Classify the expenditure as sustainable procurement based on the letterhead.",
            correct: false,
            feedback: "Incorrect. Letterhead marketing does not constitute verified procurement evidence."
          },
          {
            label: "Retain the invoices in the financial archives, but ask the procurement or sustainability head to review and validate the sustainable classification.",
            correct: true,
            feedback: "Correct. Finance records expenditures accurately and refers environmental classifications to the designated competent owner."
          },
          {
            label: "Refuse to pay the invoice until the supplier submits a full environmental audit.",
            correct: false,
            feedback: "Incorrect. Bypassing payment for standard services over classification disputes disrupts operations."
          },
          {
            label: "Delete the classification field to avoid any debate.",
            correct: false,
            feedback: "Incorrect. Deleting fields does not establish a credible record-keeping system."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Challenge Unsupported or Misleading Information",
    minutes: 3,
    content: "Respond when financial figures or savings claims are inconsistent. Refuse to alter database records to satisfy ESG reports or audits.",
    blocks: [
      {
        id: "c25-l5-b1",
        type: "heading",
        headingText: "Challenge Unsupported or Misleading Information"
      },
      {
        id: "c25-l5-b2",
        type: "short_text",
        bodyText: "Flag red flags such as: duplicate savings claims, projected savings presented as achieved savings, or expenses shifted between periods to hide green initiative cost overruns. Refuse to falsify records or change descriptions. Identify the inconsistency, provide the supporting financial data, and request the owner to correct the statement."
      },
      {
        id: "c25-l5-b3",
        type: "key_message",
        headingText: "Truth in Data",
        bodyText: "Credible reporting requires separating forward-looking estimates from actual, observed bank transactions."
      },
      {
        id: "c25-l5-b4",
        type: "decision_scenario",
        decisionIntro: "A draft company newsletter states that a departmental waste initiative saved the company MUR 180,000 last quarter. Finance records show that MUR 180,000 is the projected annual saving from the original proposal, not actual observed savings.",
        decisionPrompt: "What is the correct action?",
        decisionChoices: [
          {
            label: "Let the statement pass since it is only a marketing newsletter.",
            correct: false,
            feedback: "Incorrect. Allowing incorrect financial figures in official communications damages corporate credibility."
          },
          {
            label: "Flag the discrepancy, provide the proposal record, and request the editor to correct the text to reflect actual quarterly progress.",
            correct: true,
            feedback: "Correct. Finance must identify inaccuracies and insist that public communications align with actual records."
          },
          {
            label: "Change the accounting ledger to show MUR 180,000 in savings.",
            correct: false,
            feedback: "Incorrect. Accounting ledgers must record actual transaction history, never arbitrary numbers."
          },
          {
            label: "Exaggerate the savings further to match other department reports.",
            correct: false,
            feedback: "Incorrect. Falsification is a direct violation of professional standards."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Monitor Costs and Improve Future Decisions",
    minutes: 3,
    content: "Compare actual actuals against budget forecasts. Avoid claiming environmental causation where other factors may have influenced cost changes.",
    blocks: [
      {
        id: "c25-l6-b1",
        type: "heading",
        headingText: "Monitor Costs and Improve Future Decisions"
      },
      {
        id: "c25-l6-b2",
        type: "short_text",
        bodyText: "Monitor performance by comparing approved budgets against actual spending. Do not assume a drop in utility costs was caused only by a green initiative if other variables changed. A decrease in electricity expenditure might be due to seasonal weather, tariff adjustments, or office closures. Disclose these variables honestly."
      },
      {
        id: "c25-l6-b3",
        type: "key_message",
        headingText: "Honest Interpretation",
        bodyText: "By reporting cost variations and disclosing operational changes, finance builds trust in future project budgets."
      },
      {
        id: "c25-l6-b4",
        type: "commitment_scenario",
        commitmentPrompt: "Select one practical finance process to improve in your department:",
        commitmentChoices: [
          "Improving cost comparisons",
          "Recording approval evidence more clearly",
          "Separating estimates from actual results",
          "Checking sustainability-related classifications",
          "Adding clearer budget ownership",
          "Escalating unsupported claims"
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "A facilities manager submits a project proposal with unverified technical energy savings. How should the finance officer respond?",
    options: [
      { text: "Approve the project immediately since it supports sustainability.", isCorrect: false, feedback: "Incorrect. Approving projects without verified details violates financial control standards." },
      { text: "Request the missing operational metrics and ask who validated the technical energy-saving assumptions before proceeding.", isCorrect: true, feedback: "Correct. Finance ensures decision data is complete and refers technical validation to the competent owner." },
      { text: "Estimate the energy savings yourself using basic internet calculators.", isCorrect: false, feedback: "Incorrect. Finance should analyze costs, not invent or guess technical engineering performance parameters." },
      { text: "Delete the proposal to save time.", isCorrect: false, feedback: "Incorrect. The project might be valid; request the missing metrics rather than deleting it." }
    ],
    correctExplanation: "Finance ensures decision information is complete and refers technical validation to the competent owner rather than guessing or ignoring it.",
    incorrectExplanation: "Bypassing approvals, inventing data, or deleting requests violates standard financial verification procedures.",
    practicalTakeaway: "Request verified cost and technical parameters before proceeding with approvals."
  },
  {
    question: "A company is comparing two options for new equipment. Option A has a lower purchase price, but Option B has lower operating and maintenance costs. How should finance assist?",
    options: [
      { text: "Recommend Option A because it has the lowest initial invoice price.", isCorrect: false, feedback: "Incorrect. This ignores ongoing utility and maintenance costs that affect the total cost." },
      { text: "Provide a lifecycle cost model comparing purchase price, expected utility use, and maintenance costs over the expected period.", isCorrect: true, feedback: "Correct. Finance looks beyond purchase price to model total cost implications." },
      { text: "Choose Option B automatically because it has a green leaf logo.", isCorrect: false, feedback: "Incorrect. Finance relies on modeled calculations, not logos or marketing statements." },
      { text: "Refuse to compare them because utility costs are paid by a different department.", isCorrect: false, feedback: "Incorrect. Total organizational cost must be modeled for capital decisions." }
    ],
    correctExplanation: "Finance helps compare total relevant lifecycle costs over the useful life rather than relying solely on the first purchase invoice.",
    incorrectExplanation: "Relying on invoice price alone, choosing based on logos, or ignoring interdepartmental costs leads to poor capital allocation.",
    practicalTakeaway: "Model lifecycle operating costs rather than relying only on purchase price."
  },
  {
    question: "A sustainability group wants to order MUR 80,000 of recycling bins after receiving verbal encouragement from a director. No formal budget exists. What should HR/Finance do?",
    options: [
      { text: "Release the funds immediately because the director supported it verbally.", isCorrect: false, feedback: "Incorrect. Verbal encouragement does not replace budget allocation and formal authorization." },
      { text: "Confirm the budget, secure formal written approval, and verify the quotation before committing funds.", isCorrect: true, feedback: "Correct. Standard budget controls and authorization limits must apply to green spending." },
      { text: "Classify the purchase as general office supplies to bypass the budget limit.", isCorrect: false, feedback: "Incorrect. Falsifying classifications to bypass limits violates controls." },
      { text: "Cancel the initiative because they did not follow procedures.", isCorrect: false, feedback: "Incorrect. The initiative should be guided through the standard approval process, not cancelled." }
    ],
    correctExplanation: "All sustainability projects must follow standard financial authorization thresholds and budget checks before spending is committed.",
    incorrectExplanation: "Releasing funds without approvals, falsifying ledger categories, or cancelling projects without guidance violates control policies.",
    practicalTakeaway: "Ensure green projects follow standard budget check and authorization workflows."
  },
  {
    question: "Finance has received a waste management invoice, but no collection or weight slips are available. How should the transaction be recorded?",
    options: [
      { text: "Record that the service was paid for, without claiming a specific quantity of waste was recycled.", isCorrect: true, feedback: "Correct. Finance records the transaction payment accurately and does not claim unverified environmental quantities." },
      { text: "Estimate the recycled tonnage based on average bills and record it as verified.", isCorrect: false, feedback: "Incorrect. Estimating tonnage without logs is unverified and misleading." },
      { text: "Reject the payment until the supplier submits a full environmental audit.", isCorrect: false, feedback: "Incorrect. You cannot withhold payment for completed services over classification disputes." },
      { text: "Mark the invoice as 'sustainable recycling certified'.", isCorrect: false, feedback: "Incorrect. Invoices confirm payment, not environmental outcome certification." }
    ],
    correctExplanation: "Finance records what the financial document actually proves (expenditure), without asserting unverified environmental metrics like weights recycled.",
    incorrectExplanation: "Estimating tonnages without slips, withholding payments, or applying unverified certification tags reduces record credibility.",
    practicalTakeaway: "Record what the financial document actually proves. Do not inflate transactions."
  },
  {
    question: "A departmental report states that a green project saved MUR 180,000 last quarter. Finance notes this MUR 180,000 is the projected annual saving. What should finance do?",
    options: [
      { text: "Allow the report to be published since it looks positive.", isCorrect: false, feedback: "Incorrect. Reporting incorrect figures damages corporate data credibility." },
      { text: "Flag the discrepancy, share the proposal forecast, and request the editor to correct the text to reflect actual quarterly progress.", isCorrect: true, feedback: "Correct. Finance must identify inaccuracies and request that public statements match actual data." },
      { text: "Adjust the ledger to show the MUR 180,000 saving.", isCorrect: false, feedback: "Incorrect. Ledgers must record actual transaction history, never projections." },
      { text: "Ignore the report because it belongs to the sustainability department.", isCorrect: false, feedback: "Incorrect. Finance is responsible for financial accuracy in official communications." }
    ],
    correctExplanation: "Finance must flag discrepancies when projections are reported as actuals, ensuring communication remains accurate and supported by evidence.",
    incorrectExplanation: "Ignoring errors, fabricating ledger adjustments, or deferring responsibility permits misleading data reporting.",
    practicalTakeaway: "Ensure public reports distinguish projected estimates from actual financial results."
  },
  {
    question: "A manager asks finance to change an office renovation description to 'sustainability investment' to improve the company's ESG report. How should finance respond?",
    options: [
      { text: "Change the description to support the company's ESG score.", isCorrect: false, feedback: "Incorrect. Falsifying description labels to exaggerate environmental spending is greenwashing." },
      { text: "Refuse to alter the record, preserve the accurate transaction history, and escalate the request if pressured.", isCorrect: true, feedback: "Correct. Ledgers must reflect actual transaction reality. Refuse to falsify records." },
      { text: "Delete the record entirely to avoid conflict.", isCorrect: false, feedback: "Incorrect. Renovation records must be retained in the financial history." },
      { text: "Charge the manager a fee to change the label.", isCorrect: false, feedback: "Incorrect. Charging fees for ledger falsifications is illegal and unethical." }
    ],
    correctExplanation: "Finance must maintain ledger integrity. Falsifying transaction descriptions to manipulate ESG reports violates professional standards and controls.",
    incorrectExplanation: "Altering ledger labels for score appearances, deleting valid records, or demanding fees for alterations violates compliance code.",
    practicalTakeaway: "Refuse to alter transaction descriptions to exaggerate environmental spending."
  },
  {
    question: "Electricity costs fell by 15% after a lighting retrofit. During that period, office operating hours were also reduced due to shift changes. How should finance report this?",
    options: [
      { text: "Attribute the entire 15% reduction to the lighting retrofit.", isCorrect: false, feedback: "Incorrect. This is misleading as it ignores the impact of reduced operating hours." },
      { text: "Report the 15% reduction while disclosing that both the retrofit and reduced shift hours contributed to the change.", isCorrect: true, feedback: "Correct. Finance must disclose all variables that could influence the cost variation." },
      { text: "Report that the retrofit failed because shift hours changed.", isCorrect: false, feedback: "Incorrect. The retrofit likely contributed, but the exact fraction is mixed." },
      { text: "Omit the cost change from the report.", isCorrect: false, feedback: "Incorrect. Cost changes should be reported, but with appropriate context." }
    ],
    correctExplanation: "Finance reports actual cost reductions while disclosing other variables (like shift hours or weather) that influenced the results.",
    incorrectExplanation: "Attributing all savings to one project, claiming total failure, or hiding the cost change ignores honest context.",
    practicalTakeaway: "Report cost reductions honestly and disclose other contributing factors."
  },
  {
    question: "A waste sorting project exceeds its budget by 20% but successfully diverts waste. How should finance document this variance?",
    options: [
      { text: "Hide the overspend in a different department's budget.", isCorrect: false, feedback: "Incorrect. Budget allocations and variances must be recorded transparently." },
      { text: "Document the variance, identify the cause, and use the findings to improve future budgeting.", isCorrect: true, feedback: "Correct. Reporting variances helps identify process issues and improves future estimates." },
      { text: "Declare the project an absolute failure and shut it down.", isCorrect: false, feedback: "Incorrect. Operational success and budget variance are distinct parameters." },
      { text: "Mark the project as under-budget to keep the manager happy.", isCorrect: false, feedback: "Incorrect. Falsifying variance reports violates basic audit standards." }
    ],
    correctExplanation: "Finance documents the budget variance, identifies the cause, and uses the findings to improve future estimates rather than hiding the overrun.",
    incorrectExplanation: "Hiding costs, shutting down successful projects, or falsifying variances blocks corporate process improvement.",
    practicalTakeaway: "Document budget variances transparently and use the findings to improve future planning."
  }
];

export async function ensureSustainabilityForFinanceTeamsCourse() {
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

      // 2. Resolve Course 19
      let course19 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-19")
      });
      if (!course19) {
        course19 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "reviewing-sustainability-performance-and-corrective-action")
        });
      }

      if (!course19) {
        throw new Error("Data integrity error: Course 19 (ELH-19) not found. Prerequisite cannot be established.");
      }

      // 3. Resolve or insert Course 25
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

      // 4. Update Course 24 recommendedNextCourseId to point to Course 25 preserving admin edits
      let course24 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-24")
      });
      if (!course24) {
        course24 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "sustainability-for-hr-teams")
        });
      }

      if (course24) {
        let isSystemManaged = false;
        if (course24.recommendedNextCourseId) {
          const currentRecommendedCourse = await tx.query.coursesTable.findFirst({
            where: eq(coursesTable.id, course24.recommendedNextCourseId)
          });
          if (currentRecommendedCourse && currentRecommendedCourse.courseCode === "ELH-25") {
            isSystemManaged = true;
          }
        }

        if (course24.recommendedNextCourseId === null || course24.recommendedNextCourseId === actualCourseId || isSystemManaged) {
          await tx.update(coursesTable).set({
            recommendedNextCourseId: actualCourseId
          }).where(eq(coursesTable.id, course24.id));
        } else {
          logger.warn(`Recommendation conflict: Course 24 currently recommends course ID ${course24.recommendedNextCourseId} instead of Course 25 (ID: ${actualCourseId}). Preserving administrator edit.`);
        }
      } else {
        logger.warn("Data integrity note: Course 24 not found during Course 25 recommendation configuration.");
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
          orderIndex: 28,
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
      // Prerequisite 1: Course 19
      const existingPrereq19 = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course19.id)
        )
      });
      if (!existingPrereq19) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course19.id
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
          where: inArray(lessonProgressTable.lessonId, existingLessons.map(l => l.id))
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
