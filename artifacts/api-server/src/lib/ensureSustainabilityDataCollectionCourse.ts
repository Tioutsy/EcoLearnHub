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

const COURSE_SLUG = "sustainability-data-collection-and-evidence";
const COURSE_TITLE = "Sustainability Data Collection and Evidence";
const BADGE_SLUG = "sustainability-evidence-contributor";
const BADGE_CODE = "COURSE_ELH_18_COMPLETE";
const SEED_NAME = "sustainability-data-collection-and-evidence-v1";

const COURSE_META = {
  courseCode: "ELH-18",
  description: "Learn how to collect reliable workplace sustainability information, maintain clear supporting evidence and recognise common data-quality problems. This course helps employees and managers create records that are practical, understandable and suitable for progress reviews.",
  fullDescription: "Learn how to collect reliable workplace sustainability information, maintain clear supporting evidence and recognise common data-quality problems. This course helps employees and managers create records that are practical, understandable and suitable for progress reviews.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainability-data-collection-and-evidence.jpg",
  intendedRoles: ["employees", "managers", "supervisors", "green teams", "facilities and operations", "esg and compliance support"],
  learningObjectives: [
    "Distinguish useful sustainability evidence from vague claims or assumptions.",
    "Identify the information required before beginning data collection.",
    "Record figures, observations and documents consistently.",
    "Select evidence that is proportionate to the action being tracked.",
    "Recognise common data-quality problems.",
    "Escalate gaps or uncertainty rather than inventing or estimating unsupported information.",
    "Maintain records that another authorised person can understand and verify."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Sustainability Data Collection and Evidence. You can now contribute clearer, more consistent sustainability records and recognise when information needs clarification before it is used.",
  badgeName: "Sustainability Evidence Contributor",
  badgeDescription: "Awarded for completing Sustainability Data Collection and Evidence and demonstrating the ability to collect reliable workplace sustainability information, maintain clear supporting evidence and recognise common data-quality problems.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Evidence, Not Assumptions",
    minutes: 3,
    content: "Differentiate a claim from an observation or measured figure. Understand how to collect proportionate evidence (such as meter readings, invoices, and checklists) that another person can easily verify.",
    blocks: [
      {
        id: "c18-l1-b1",
        type: "heading",
        headingText: "Evidence, Not Assumptions"
      },
      {
        id: "c18-l1-b2",
        type: "short_text",
        bodyText: "A department reports that it has 'significantly reduced paper use,' but the action tracker contains no figures, dates, or supporting records. Vague claims cannot be reviewed or verified.\n\nUseful sustainability evidence shows what happened, what was measured or observed, when it happened, where the information came from, who recorded it, and what supporting proof is available. Evidence does not need to be complex to be useful: dated meter readings, invoices, checklists, photographs, and logs are all excellent, proportionate forms of evidence."
      },
      {
        id: "c18-l1-b3",
        type: "key_message",
        headingText: "Workplace Example",
        bodyText: "An office in Mauritius claiming reduced electricity consumption should compare electricity utility data or meter logs for consistent periods, while noting occupancy levels or closures, rather than simply stating 'energy use is lower.'"
      },
      {
        id: "c18-l1-b4",
        type: "decision_scenario",
        decisionIntro: "Which statement is best supported and most useful for a progress review?",
        decisionPrompt: "Select the best-supported statement:",
        decisionChoices: [
          {
            label: "The office is using less electricity",
            correct: false,
            feedback: "Incorrect. This is a claim with no data, time period, or evidence source."
          },
          {
            label: "Electricity use appears lower this month",
            correct: false,
            feedback: "Incorrect. This is an assumption based on appearance, not a measured figure."
          },
          {
            label: "Electricity consumption fell by 12% in August compared to July, based on utility invoice data attached to the tracker",
            correct: true,
            feedback: "Correct. This statement specifies the amount (12%), period (August vs July), source (utility invoice), and provides the source document."
          },
          {
            label: "We are the greenest office in the region",
            correct: false,
            feedback: "Incorrect. This is unsupportable marketing puffery that does not relate to specific measurements."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Decide What to Collect First",
    minutes: 3,
    content: "Learn how to define data requirements before starting collection. Understand how clear instructions on scope, units, timing, and sources prevent inconsistencies.",
    blocks: [
      {
        id: "c18-l2-b1",
        type: "heading",
        headingText: "Decide What to Collect First"
      },
      {
        id: "c18-l2-b2",
        type: "short_text",
        bodyText: "Before collecting evidence, you must clarify: the goal being tracked, the indicator, the measurement unit or format, the reporting period, the responsible person, the source, and review frequency. Collecting massive amounts of unguided data does not improve quality; it increases confusion."
      },
      {
        id: "c18-l2-b3",
        type: "key_message",
        headingText: "Instruction Comparison",
        bodyText: "Vague instruction: 'Collect food waste data.' Clear instruction: 'Record the weight of avoidable canteen food waste in kilograms after lunch service every Friday for four weeks, using the canteen scale.'"
      },
      {
        id: "c18-l2-b4",
        type: "decision_scenario",
        decisionIntro: "A coordinator is asked to 'track electricity reduction' from the facilities team. Which detail must be clarified first to ensure consistent data?",
        decisionPrompt: "Select the most critical detail to clarify:",
        decisionChoices: [
          {
            label: "The national energy tariff rates for the next five years",
            correct: false,
            feedback: "Incorrect. Tariff rates are external pricing details; they do not define how or when electricity consumption is measured."
          },
          {
            label: "The specific meters to be read, the reading day of the month, the unit (kWh), and who will record the figures",
            correct: true,
            feedback: "Correct. Defining meters, frequency, units, and ownership ensures data remains consistent and comparable over time."
          },
          {
            label: "The marketing slogans for the energy saving campaign",
            correct: false,
            feedback: "Incorrect. Marketing slogans do not establish data parameters or measurement consistency."
          },
          {
            label: "The global carbon emission factors for grid electricity",
            correct: false,
            feedback: "Incorrect. Carbon accounting factors are applied later; you first need clear parameters for the raw electricity data collection."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Record Information Consistently",
    minutes: 3,
    content: "Understand why consistency in units, sources, and formatting is critical. Follow basic data protection guidelines, avoiding unnecessary personal or confidential information.",
    blocks: [
      {
        id: "c18-l3-b1",
        type: "heading",
        headingText: "Record Information Consistently"
      },
      {
        id: "c18-l3-b2",
        type: "short_text",
        bodyText: "Consistent records are easy to compare and verify. Use the same units, same sources, format dates identically, avoid leaving unexplained blanks, name files clearly, and record corrections transparently. Separate actual figures from estimates, and never modify historical values without an audit trail.\n\nData Protection Rule: Collect only the information required for the tracker, and follow your organization's privacy and document-retention guidelines. Avoid recording unnecessary personal details."
      },
      {
        id: "c18-l3-b3",
        type: "key_message",
        headingText: "Consistent Log Entry",
        bodyText: "Weak entries: 'Pipe leaking', 'Fixed', 'Small leak'. Better entries: Date reported, Location, Leak type, Person notified, Date repaired, Verification status, and work order link."
      },
      {
        id: "c18-l3-b4",
        type: "decision_scenario",
        decisionIntro: "Which leak log entry is easiest for a manager to verify and review three months later?",
        decisionPrompt: "Select the most consistent log entry:",
        decisionChoices: [
          {
            label: "Leak fixed last week by facilities crew.",
            correct: false,
            feedback: "Incorrect. This lacks the exact date, location, repair details, or verification link."
          },
          {
            label: "12-Sep-2026: Bathroom 2B hot water pipe leak repaired by plumber; verified dry on 13-Sep-2026; repair invoice #8874 attached.",
            correct: true,
            feedback: "Correct. This logs the date, location, repair details, verification date, and attaches verifiable source proof (invoice #8874)."
          },
          {
            label: "Leak under control.",
            correct: false,
            feedback: "Incorrect. This contains no dates, location, or verifiable details."
          },
          {
            label: "Plumber repaired a faucet and noted a leak somewhere in the office block.",
            correct: false,
            feedback: "Incorrect. This is too vague and lacks dates, exact location, or supporting records."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Use Proportionate Supporting Evidence",
    minutes: 3,
    content: "Select evidence that is proportionate to the action being tracked. Understand how simple actions (checklists), ongoing tasks (logs), and purchasing actions (receipts) require different types of proof.",
    blocks: [
      {
        id: "c18-l4-b1",
        type: "heading",
        headingText: "Use Proportionate Supporting Evidence"
      },
      {
        id: "c18-l4-b2",
        type: "short_text",
        bodyText: "Evidence should be relevant, dated, and stored in an authorized location. It should also be proportionate to the action's significance. A simple task (installing recycling bins) needs simple evidence like a dated photo or location checklist. An ongoing task (weekly equipment shutdown) needs a signed weekly log. A purchasing action (buying reusable mugs) needs invoice receipts."
      },
      {
        id: "c18-l4-b3",
        type: "key_message",
        headingText: "Photo Limitations",
        bodyText: "A photograph shows that an item existed at one moment, but it does not prove ongoing use, correct operation, or long-term results."
      },
      {
        id: "c18-l4-b4",
        type: "decision_scenario",
        decisionIntro: "A department replaces single-use cups with ceramic mugs. Which evidence represents the most proportionate combination for the tracker?",
        decisionPrompt: "Select the most proportionate evidence:",
        decisionChoices: [
          {
            label: "A photograph of one mug on a desk and a verbal promise that everyone is using them",
            correct: false,
            feedback: "Incorrect. One desk photo and a verbal claim do not verify that the purchasing change was fully implemented."
          },
          {
            label: "The approved mug purchase order, delivery note, and the updated facilities supply checklist",
            correct: true,
            feedback: "Correct. The purchase order and delivery note prove the procurement change occurred, and the supply checklist verifies distribution."
          },
          {
            label: "A 50-page corporate sustainability strategy document",
            correct: false,
            feedback: "Incorrect. Strategy documents define intentions, they do not prove that this specific cup replacement action took place."
          },
          {
            label: "Daily video logs of employees drinking beverages for two weeks",
            correct: false,
            feedback: "Incorrect. This is excessive, violates privacy guidelines, and creates unnecessary administrative burden."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Recognise Data-Quality Problems",
    minutes: 3,
    content: "Identify common data-quality errors: missing dates, inconsistent periods, selective reporting, and unsupported estimates. Learn how to escalate gaps honestly.",
    blocks: [
      {
        id: "c18-l5-b1",
        type: "heading",
        headingText: "Recognise Data-Quality Problems"
      },
      {
        id: "c18-l5-b2",
        type: "short_text",
        bodyText: "Common errors include missing units, selective reporting, or treating 'Zero', 'Not measured', and 'Not available' as interchangeable. An honest gap is always more useful than a value that is estimated or invented without support.\n\nEscalation rule: when data is missing, mark it as 'unavailable', note the reason, notify the responsible owner, and adjust the collection process for next time."
      },
      {
        id: "c18-l5-b3",
        type: "key_message",
        headingText: "Blank Cell Scenario",
        bodyText: "A waste log contains a blank cell for week 3. The manager should not assume waste was zero; a blank cell simply means data is incomplete until explained."
      },
      {
        id: "c18-l5-b4",
        type: "decision_scenario",
        decisionIntro: "You find that the fuel record for one company vehicle is missing for the month. What is the correct way to record this in the tracker?",
        decisionPrompt: "Select the best data entry action:",
        decisionChoices: [
          {
            label: "Copy the fuel consumption from the previous month so the reports look consistent",
            correct: false,
            feedback: "Incorrect. Copying values creates a false estimate and hides the data gap."
          },
          {
            label: "Mark the fuel data as 'Unavailable', record that the log sheet was lost, and report the gap to the fleet manager",
            correct: true,
            feedback: "Correct. This maintains integrity by declaring the gap honestly and prompting corrective action to retrieve or prevent lost logs."
          },
          {
            label: "Enter zero, assuming the vehicle was not used much",
            correct: false,
            feedback: "Incorrect. Recording zero when fuel was consumed is false data and distorts the total utility metrics."
          },
          {
            label: "Estimate the figure based on memory without adding any notes",
            correct: false,
            feedback: "Incorrect. Memory-based estimates without notes degrade data quality and make auditing impossible."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Prepare Evidence for Review",
    minutes: 3,
    content: "Learn how to organize records so another person can verify them. Conduct reviews following a structured routine, and make a personal collection commitment.",
    blocks: [
      {
        id: "c18-l6-b1",
        type: "heading",
        headingText: "Prepare Evidence for Review"
      },
      {
        id: "c18-l6-b2",
        type: "short_text",
        bodyText: "Evidence is review-ready when someone else can understand the action, its source, its limitations, and verify the result without relying on your memory. Before reviews, verify: actions are named, periods are clear, units are marked, sources are identified, and links are active."
      },
      {
        id: "c18-l6-b3",
        type: "key_message",
        headingText: "Review Routine",
        bodyText: "1. Confirm the action. 2. Check the indicator. 3. Check the period. 4. Verify the source data. 5. Note gaps or anomalies. 6. Record the review outcome."
      },
      {
        id: "c18-l6-b4",
        type: "commitment_scenario",
        commitmentPrompt: "Which data collection improvement would be most useful in your workplace?",
        commitmentChoices: [
          "Clarify one indicator before collecting new information",
          "Add dates and sources to an existing tracker",
          "Review one blank or unexplained value",
          "Organise one set of supporting evidence",
          "Confirm who is responsible for one data source"
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "A department claims: 'We have dramatically reduced paper use.' The action tracker has no figures, dates, or source files. What is the best response?",
    options: [
      { text: "Approve the update as completed because the department team verbally confirmed it.", isCorrect: false, feedback: "Incorrect. Verbal confirmations without data do not provide reliable or verifiable evidence." },
      { text: "Ask the department for a defined comparison period and the supporting printer logs or purchasing invoices.", isCorrect: true, feedback: "Correct. A credible claim requires a specified timeframe and reliable source documents to back it up." },
      { text: "Replace the word 'dramatically' with 'slightly' and mark the action as completed in the tracker.", isCorrect: false, feedback: "Incorrect. Softening the adjectives does not fix the absolute lack of data or evidence." },
      { text: "Add an estimated percentage (like 10%) so the tracker fields appear complete.", isCorrect: false, feedback: "Incorrect. Inventing numbers undermines the integrity of the tracking system." }
    ],
    correctExplanation: "Sustainability claims must be backed by a defined comparison period and reliable source data to be credible.",
    incorrectExplanation: "Verbal assurances, modifying adjectives, or fabricating estimates do not resolve data gaps.",
    practicalTakeaway: "Always ask for comparison periods and source records before entering a claim into the tracker."
  },
  {
    question: "A hotel team wants to track canteen food waste. Which instruction is most useful to ensure consistent data collection?",
    options: [
      { text: "Monitor canteen food waste regularly.", isCorrect: false, feedback: "Incorrect. 'Regularly' is vague and doesn't specify when, what, or how to measure." },
      { text: "Ask canteen staff whether food waste has improved at the end of each week.", isCorrect: false, feedback: "Incorrect. Staff opinions are subjective and do not provide consistent, measurable data." },
      { text: "Record the weight of avoidable food waste from the staff canteen in kilograms after Friday lunch service for four weeks, using the canteen scale.", isCorrect: true, feedback: "Correct. This specifies what to measure, the unit (kg), when (after Friday lunch), duration (four weeks), and the exact tool (canteen scale)." },
      { text: "Take a photograph of the kitchen area at the end of the month.", isCorrect: false, feedback: "Incorrect. Photographs do not measure food waste weight or provide operational consistency." }
    ],
    correctExplanation: "Clear collection instructions define the exact task, the unit of measurement, the timing, the duration, and the tools to be used.",
    incorrectExplanation: "Vague terms, staff opinions, or random photographs fail to establish consistent or comparable data points.",
    practicalTakeaway: "Specify the unit, timing, tool, and coordinator when requesting sustainability data."
  },
  {
    question: "A weekly leak tracker contains a blank cell for one week. What should the reviewer conclude?",
    options: [
      { text: "No leaks occurred during that week.", isCorrect: false, feedback: "Incorrect. A blank cell does not prove zero leaks; it is ambiguous." },
      { text: "The value should be recorded as zero to keep the charts aligned.", isCorrect: false, feedback: "Incorrect. Entering zero for missing data is inaccurate and distorts reporting integrity." },
      { text: "The information is incomplete until the blank is explained and verified by the inspection owner.", isCorrect: true, feedback: "Correct. A blank cell represents missing data and must be treated as incomplete until clarified." },
      { text: "The previous week's leak count should be copied into the blank cell.", isCorrect: false, feedback: "Incorrect. Duplicating historical records without verification creates false metrics." }
    ],
    correctExplanation: "Blanks represent incomplete data. A reviewer cannot assume a blank equals zero or no activity; it must be investigated.",
    incorrectExplanation: "Assuming zero, copying old values, or ignoring the cell ignores the data gap and distorts the tracker.",
    practicalTakeaway: "Never assume a blank cell means zero leaks or zero waste. Treat it as incomplete."
  },
  {
    question: "One department records plastic waste in kilograms. Another department records it as 'number of bags.' What is the main issue with this tracking data?",
    options: [
      { text: "Both datasets are automatically incorrect and must be deleted.", isCorrect: false, feedback: "Incorrect. The data is not necessarily incorrect, but it is inconsistent." },
      { text: "The results cannot be easily compared or combined without a defined conversion rate or a uniform recording method.", isCorrect: true, feedback: "Correct. Using different units makes it impossible to aggregate the total plastic waste accurately." },
      { text: "Bags are always a more accurate unit of measurement than kilograms.", isCorrect: false, feedback: "Incorrect. Kilograms (weight) is a standardized unit, whereas bags vary in volume and fullness." },
      { text: "The numbers should be added together directly in the main report.", isCorrect: false, feedback: "Incorrect. You cannot add weight (kg) directly to counts (bags) without a conversion." }
    ],
    correctExplanation: "Tracking metrics must use standardized units (or have documented conversion rules) to allow aggregation and comparison.",
    incorrectExplanation: "Inconsistent units do not mean the data is corrupt, but they prevent direct comparison and reporting.",
    practicalTakeaway: "Agree on standard units (like kilograms or liters) before starting data collection across departments."
  },
  {
    question: "A company installs new recycling points in three office areas. Which evidence is most proportionate to verify this action?",
    options: [
      { text: "A general email bulletin to employees saying recycling is important.", isCorrect: false, feedback: "Incorrect. Emails state intent or awareness; they do not prove bins were actually installed." },
      { text: "A dated installation checklist signed by the facilities coordinator, supported by photographs of the three bins.", isCorrect: true, feedback: "Correct. This provides direct, proportionate proof of installation (checklist and photos) for a simple physical action." },
      { text: "The company's five-year waste management strategy document.", isCorrect: false, feedback: "Incorrect. Strategy documents show plans, not proof of installation for this specific action." },
      { text: "An employee survey asking if the new bins look nice.", isCorrect: false, feedback: "Incorrect. Employee opinions do not provide concrete proof of physical installation." }
    ],
    correctExplanation: "Evidence should be proportionate to the action. For a simple physical installation, a checklist and photos are perfect.",
    incorrectExplanation: "Corporate strategy PDFs, general emails, or opinions are not direct, proportionate proof of physical actions.",
    practicalTakeaway: "Match the evidence to the action: a signed checklist and photos are perfect for physical installations."
  },
  {
    question: "A facilities team changes its weekly electricity meter-reading day from Monday morning to Friday afternoon. What should they do?",
    options: [
      { text: "Continue reading without noting the change in the tracker logs.", isCorrect: false, feedback: "Incorrect. Failing to note the change obscures why weekly consumption figures may appear different." },
      { text: "Delete the previous Monday readings to keep the database consistent.", isCorrect: false, feedback: "Incorrect. Deleting historical data destroys valuable baseline tracking records." },
      { text: "Document the change in the tracker notes because changing the reading interval will affect weekly comparisons.", isCorrect: true, feedback: "Correct. Changing intervals shifts the duration of the reading period, which must be noted to explain anomalies." },
      { text: "Adjust the historical Monday data to match the new Friday timeline.", isCorrect: false, feedback: "Incorrect. Fabricating historical entries violates data integrity and auditing rules." }
    ],
    correctExplanation: "Changes in data collection intervals or methods must be documented to explain variances and preserve comparison validity.",
    incorrectExplanation: "Failing to document, deleting baseline records, or fabricating history undermines tracking credibility.",
    practicalTakeaway: "Always document changes in data collection timing or tools to explain future variances."
  },
  {
    question: "An employee cannot find the fuel invoice for a company delivery vehicle, but wants to complete the monthly tracking report. What is the best action?",
    options: [
      { text: "Enter an estimate based on memory and mark the task as complete.", isCorrect: false, feedback: "Incorrect. Memory-based estimates without notes degrade data quality." },
      { text: "Copy the previous month's fuel invoice amount.", isCorrect: false, feedback: "Incorrect. Duplicating values creates false reports and hides the gap." },
      { text: "Record the fuel data as 'Unavailable', document the missing invoice note, and notify the fleet supervisor.", isCorrect: true, feedback: "Correct. Flagging the gap honestly is critical, allowing follow-up to retrieve the invoice or fix logs." },
      { text: "Leave the cell blank without adding any notes or telling anyone.", isCorrect: false, feedback: "Incorrect. Unexplained blanks leave the report ambiguous and delay resolution." }
    ],
    correctExplanation: "Data integrity requires declaring gaps honestly, logging the reasons, and notifying supervisors to address the missing source records.",
    incorrectExplanation: "Fabricating estimates, duplicating historical values, or ignoring gaps violates professional data standards.",
    practicalTakeaway: "Be honest about missing data: mark it 'Unavailable', explain the gap, and notify the owner."
  },
  {
    question: "Which tracker entry represents the most review-ready progress update?",
    options: [
      { text: "Lights improved. Completed.", isCorrect: false, feedback: "Incorrect. This has no date, details, or link to supporting records." },
      { text: "Energy project successful.", isCorrect: false, feedback: "Incorrect. This is a vague claim that provides no data or verification proof." },
      { text: "LED replacements completed in reception and meeting rooms on 14 July; contractor sign-off sheet #401 attached; post-install electricity review scheduled for October.", isCorrect: true, feedback: "Correct. This logs the action, date (14 July), location (reception/meeting rooms), attaches proof (sheet #401), and schedules the next review step." },
      { text: "Everyone agrees the new office lights are much better.", isCorrect: false, feedback: "Incorrect. Staff consensus is nice, but it is not verifiable evidence of project completion." }
    ],
    correctExplanation: "A review-ready entry clearly details the action, location, date, links to supporting proof, and maps out the next review step.",
    incorrectExplanation: "Vague claims, opinion metrics, or single-word updates lack the details needed for audit and verification.",
    practicalTakeaway: "Write tracker entries so someone else can understand the action, date, location, and proof without asking you."
  }
];

export async function ensureSustainabilityDataCollectionCourse() {
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

      // 2. Resolve Course 17
      let course17 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-17")
      });
      if (!course17) {
        course17 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "tracking-sustainability-actions-and-progress")
        });
      }

      if (!course17) {
        throw new Error("Data integrity error: Course 17 (ELH-17) not found. Prerequisite cannot be established.");
      }

      // 3. Resolve or insert Course 18
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

      // 4. Update Course 17 recommendedNextCourseId to point to Course 18 preserving admin edits
      let isSystemManaged = false;
      if (course17.recommendedNextCourseId) {
        const currentRecommendedCourse = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.id, course17.recommendedNextCourseId)
        });
        if (currentRecommendedCourse && currentRecommendedCourse.courseCode === "ELH-18") {
          isSystemManaged = true;
        }
      }

      if (course17.recommendedNextCourseId === null || course17.recommendedNextCourseId === actualCourseId || isSystemManaged) {
        await tx.update(coursesTable).set({
          recommendedNextCourseId: actualCourseId
        }).where(eq(coursesTable.id, course17.id));
      } else {
        logger.warn(`Recommendation conflict: Course 17 currently recommends course ID ${course17.recommendedNextCourseId} instead of Course 18 (ID: ${actualCourseId}). Preserving administrator edit.`);
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
          icon: "file-text",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 21,
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
      // Prerequisite 1: Course 17
      const existingPrereq17 = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course17.id)
        )
      });
      if (!existingPrereq17) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course17.id
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

        // Insert new lessons in order if they don't already exist or are skeletons
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
