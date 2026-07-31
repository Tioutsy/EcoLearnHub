import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
  coursePrerequisitesTable,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_SLUG = "sustainability-data-collection-and-evidence";
const COURSE_TITLE = "Sustainability Data Collection and Evidence";
const BADGE_SLUG = "sustainability-evidence-contributor";
const SEED_NAME = "sustainability-data-collection-and-evidence-v2";

const COURSE_META = {
  courseCode: "ELH-18",
  description:
    "Learn how to collect, record, validate, and preserve reliable workplace sustainability data with correct units, reporting periods, boundaries, and supporting evidence files.",
  fullDescription:
    "Reliable sustainability tracking depends on ground-level data quality. This course enables employees, data collectors, and managers to select authentic data sources (utility invoices, meter logs, weigh-slips), apply explicit units and reporting periods, distinguish measured values from estimates and calculations, avoid using zero for missing data, and maintain audit-ready traceability without risking data gaps.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainability-data-collection-and-evidence.jpg",
  intendedRoles: ["employees", "managers", "supervisors", "green teams", "facilities and operations", "esg and compliance support", "data collectors"],
  learningObjectives: [
    "Identify appropriate workplace sustainability data sources (utility bills, sub-meters, weigh-slips, procurement records).",
    "Record data entries with complete metadata (value, physical unit, site boundary, reporting period, source link).",
    "Apply the SOURCE data-quality framework (Select source, Observe period/unit, Upload record, Record estimates, Check gaps/duplicates, Escalate).",
    "Distinguish between primary measured values, estimates, assumptions, and calculated indicators.",
    "Recognize missing data, outliers, and duplicate entries, ensuring zero is never entered for unavailable data."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations! You have completed Sustainability Data Collection and Evidence. You can now collect accurate workplace data, maintain complete units and reporting boundaries, preserve source evidence, and escalate data-quality gaps.",
  badgeName: "Sustainability Data Collector",
  badgeDescription:
    "Awarded for demonstrating operational mastery of workplace data collection, unit precision, source evidence preservation, and data-gap escalation.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "A Neat Spreadsheet Is Not Automatically Reliable Data",
    minutes: 3,
    content: "Understand why formatting data in a spreadsheet does not guarantee accuracy without units, boundaries, and source proof.",
    blocks: [
      { id: "dc1-h1", type: "heading", position: 1, headingText: "Data Reliability Starts at the Source" },
      { id: "dc1-t1", type: "short_text", position: 2, bodyText: "A hotel's monthly sustainability log reports: Electricity: 42, Water: 1,850, Waste Recycled: 65%, Generator Diesel: blank, Food Waste: 0. No physical units are shown. The electricity number came from a financial invoice total (MUR 42,000) rather than kilowatt-hours. The water figure covers six weeks instead of one calendar month. The recycling percentage lacks numerator/denominator records. Diesel data was uncollected, and food waste was entered as zero because no weigh-slip was submitted." },
      { id: "dc1-k1", type: "key_message", position: 3, headingText: "Data Reliability Rule", bodyText: "A neat spreadsheet row is meaningless without physical units, explicit reporting boundaries, a defined collection period, and a verifiable source document." },
      {
        id: "dc1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Evaluating Spreadsheet Data Quality:",
        decisionPrompt: "A department spreadsheet lists Water: 1,850 without units or dates. How should a data collector respond?",
        decisionChoices: [
          { label: "Reject the entry until the value is specified with units (e.g. 1,850 m³), site scope (Building B), reporting period (1–30 June 2026), and source link (CWA bill / meter log)", correct: true, feedback: "Correct! Every data point requires a value, physical unit, site boundary, exact reporting period, and traceable source." },
          { label: "Assume the number means 1,850 litres and approve the spreadsheet", correct: false, feedback: "Incorrect. Never assume physical units; guessing leads to massive calculation errors." },
          { label: "Change the number to zero because no unit was provided", correct: false, feedback: "Incorrect. Never enter zero for missing metadata or uncollected records." }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Why Data Quality Matters & Essential Vocabulary",
    minutes: 3,
    content: "Understand operational benefits of reliable data and master 50+ core data-collection terms.",
    blocks: [
      { id: "dc2-h1", type: "heading", position: 1, headingText: "Operational Value & Plain-Language Vocabulary" },
      { id: "dc2-t1", type: "short_text", position: 2, bodyText: "Accurate data enables facilities leads to pinpoint equipment leaks, procurement officers to evaluate supplier efficiency, and management to track performance targets honestly." },
      {
        id: "dc2-k1",
        type: "key_message",
        position: 3,
        headingText: "Core Data-Collection Vocabulary",
        bodyText: "• Primary Data: Direct physical measurements (e.g. meter readings, weigh-scale slips).\n• Secondary Data: Derived or third-party estimates (e.g. average fuel factors).\n• Source Record: Original evidence file (e.g. CEB invoice PDF, signed delivery note).\n• Unit of Measure: Physical dimension (kWh, m³, kg, L, tonnes) — NEVER currency amount.\n• Reporting Period: Exact calendar date span of resource usage (e.g. 1–30 June 2026).\n• Missing Data vs Zero: Missing data means uncollected information (blank/escalated); zero means verified zero resource use.\n• Outlier: An implausibly high or low value requiring verification before submission.\n• Traceability: The ability to trace a final reported statistic back to its original source record."
      },
      {
        id: "dc2-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Completion vs Verification)",
        bodyText: "An action or report marked 'completed' is not automatically verified.\n\nReliable monitoring records show what deliverable was measured, who was accountable, when it was recorded, and what documented information supports the value.\n\nManagement-system standards (ISO 14001 Clause 9.1 & ISO 9001 Clause 9.1) emphasize monitoring, evaluation, and retaining appropriate documented information. A clear data register preserves evidence and prevents relying on memory or unverified estimates."
      }
    ]
  },
  {
    order: 2,
    title: "The SOURCE Data-Quality Framework",
    minutes: 4,
    content: "Apply the 6-step SOURCE framework for disciplined data collection.",
    blocks: [
      { id: "dc3-h1", type: "heading", position: 1, headingText: "The SOURCE Data-Quality Framework" },
      { id: "dc3-t1", type: "short_text", position: 2, bodyText: "Follow the SOURCE protocol for every workplace data entry:" },
      {
        id: "dc3-k1",
        type: "key_message",
        position: 3,
        headingText: "SOURCE Framework Breakdown",
        bodyText: "• S — Select the correct source: Use primary meter logs, utility invoices, or weigh-slips.\n• O — Observe period, boundary & unit: Record physical unit (kWh, m³), exact dates, and site location.\n• U — Upload or preserve supporting record: Attach or link original digital PDFs or photo logs.\n• R — Record estimates & assumptions honestly: Label non-metered estimates clearly with formulas.\n• C — Check for gaps, duplicates & unusual values: Audit for double invoices, missing months, and spikes.\n• E — Escalate unresolved issues & preserve corrections: Surface uncollected data gaps and log change reasons."
      },
      {
        id: "dc3-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Practice: Handling Unavailable Data",
        decisionPrompt: "A generator diesel delivery took place on 28 June, but the delivery receipt was misplaced. How should the logistics clerk record the June generator fuel data?",
        decisionChoices: [
          { label: "Flag the entry as 'Data Pending / Misplaced Receipt', record a provisional estimate based on tank dipstick reading with a note, and request a duplicate receipt from the fuel supplier", correct: true, feedback: "Correct! Labeling provisional estimates transparently and requesting supplier duplicates preserves data integrity." },
          { label: "Enter '0' in the diesel column so the monthly summary formula works without errors", correct: false, feedback: "NEVER enter zero for uncollected or missing data; zero distorts totals and falsely implies zero fuel usage." },
          { label: "Copy the diesel consumption figure from May without writing any note", correct: false, feedback: "Incorrect. Silently carrying forward old figures creates false historical records." }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Visual Inspection & Data-Quality Safeguards",
    minutes: 4,
    content: "Inspect a realistic Mauritian data collection log sheet and master critical safeguards.",
    blocks: [
      { id: "dc4-h1", type: "heading", position: 1, headingText: "Visual Data Quality Inspection" },
      { id: "dc4-t1", type: "short_text", position: 2, bodyText: "Examine the printed monthly data log sheet (`visual-sustainability-data-quality-check.png`). Observe how red sticky notes mark data quality defects: missing units on water ('1850'), zero entered for missing diesel fuel data ('0'), duplicate invoice references, and unverified percentages." },
      {
        id: "dc4-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-sustainability-data-quality-check.png",
        caption: "Monthly Sustainability Data Log Sheet: Highlighting missing units, zero for missing data, duplicate invoice numbers, and unverified percentages.",
        imageAlt: "Realistic photograph of a Mauritian commercial workplace desk with a printed Monthly Sustainability Data Log Sheet showing highlighted data quality defects like missing units, zero for missing data, duplicate invoice references, and unverified percentages while coordinators review."
      },
      {
        id: "dc4-k1",
        type: "key_message",
        position: 4,
        headingText: "High-Risk Data Mistakes to Avoid",
        bodyText: "• DO NOT record financial cost (MUR) in place of physical consumption units (kWh, m³).\n• DO NOT mix calendar month boundaries (1–30 June) with billing cycle dates (12 May–11 June) without noting overlap.\n• DO NOT enter '0' for missing data; leave blank or tag as 'Data Gap / Escalated'.\n• DO NOT overwrite primary source data with calculated formulas or secondary indicators.\n• DO NOT save evidence files in private personal folders or personal messaging chats."
      }
    ]
  },
  {
    order: 4,
    title: "Worked Mauritian Scenario & Applied Decision",
    minutes: 2,
    content: "Study a hotel multi-resource data collection log and solve a real-world facilities decision.",
    blocks: [
      { id: "dc5-h1", type: "heading", position: 1, headingText: "Worked Scenario: Hotel Monthly Data Collection Log" },
      {
        id: "dc5-w1",
        type: "workplace_example",
        position: 2,
        headingText: "Coordinated Hotel Resource Data Log",
        bodyText: "A Grand Baie hotel collects 4 monthly streams:\n1. Electricity: 48,200 kWh | Period: 1–30 June | Source: CEB Smart Meter Log | Validation: Checked vs sub-meters.\n2. Water: 2,150 m³ | Period: 1–30 June | Source: CWA Bill & Daily Sub-Meter Register | Validation: Leak test confirmed.\n3. General Waste: 4.2 tonnes | Period: 1–30 June | Source: Contractor Weigh-Slips (8 receipts attached) | Unit: Tonnes.\n4. Recyclable Plastic: 680 kg | Period: 1–30 June | Source: Recycler Receipt #1042 | Validation: Weigh-scale verified."
      },
      {
        id: "dc5-d1",
        type: "decision_scenario",
        position: 3,
        decisionIntro: "Applied Facilities Decision:",
        decisionPrompt: "A facilities manager needs monthly electricity data by noon for a quarterly review. The CEB utility bill has not arrived yet, but the maintenance technician has recorded physical sub-meter readings for 30 June. What is the most reliable action?",
        decisionChoices: [
          { label: "Calculate electricity usage using the 30 June sub-meter photo logs, enter the value with unit 'kWh (Provisional Meter Log)', attach the sub-meter photo, and note that utility invoice verification will occur upon bill arrival", correct: true, feedback: "Outstanding! Using primary sub-meter logs labelled as provisional meter readings maintains transparency, physical units, and immediate traceability." },
          { label: "Copy the previous month's CEB invoice consumption figure so the table is filled", correct: false, feedback: "NEVER copy previous months' figures without labeling them as estimates; doing so creates false historical records." },
          { label: "Multiply last month's bill cost by 1.1 to guess current usage", correct: false, feedback: "Incorrect. Guessing based on financial cost is unreliable and introduces severe calculation errors." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Data Collection Commitment & Badge",
    minutes: 2,
    content: "Select your daily data collection commitments and complete the course.",
    blocks: [
      { id: "dc6-h1", type: "heading", position: 1, headingText: "Data Collection Commitment" },
      { id: "dc6-t1", type: "short_text", position: 2, bodyText: "Select the data collection practices you pledge to apply in your workplace." },
      {
        id: "dc6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your data collection commitments (choose at least one):",
        commitmentOptions: [
          { value: "include-physical-units", label: "Include explicit physical units (kWh, m³, kg, L) on every data point recorded", description: "Prevent financial currency or unit confusion." },
          { value: "never-zero-for-missing", label: "Never enter zero for uncollected or missing data; tag gaps and escalate transparently", description: "Protect mathematical formula totals." },
          { value: "preserve-source-evidence", label: "Attach or link original source records (invoices, meter photos, weigh-slips) in shared drives", description: "Maintain full audit traceability." },
          { value: "distinguish-estimates", label: "Clearly label estimates and assumptions with their calculation methods", description: "Ensure full operational transparency." }
        ]
      },
      {
        id: "dc6-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Practical Disclaimer",
        bodyText: "DISCLAIMER: This course provides practical workplace guidance on sustainability data collection. It does not provide independent assurance, environmental accreditation, statutory reporting certification, legal advice, or verification of an organization's environmental performance."
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "Why is entering '1,850' in a water tracking spreadsheet without units or dates a data-quality failure?",
    options: [
      "Because without physical units (e.g. m³, L) and an exact reporting period, the number cannot be verified, calculated, or compared",
      "Because spreadsheets cannot store numbers greater than 1,000",
      "Because water tracking is legally restricted to government officers",
      "Because all water numbers must be written in roman numerals"
    ],
    correct: 0,
    correctExplanation: "Every data point requires a value, physical unit, site boundary, exact reporting period, and traceable source.",
    incorrectExplanation: "Incorrect. Numbers without physical units and reporting periods cannot be verified or compared."
  },
  {
    order: 2,
    question: "What does the 'O' in the SOURCE data-quality framework stand for?",
    options: [
      "Observe period, boundary & unit (record physical units, exact calendar dates, and site location)",
      "Overwrite old spreadsheet files to save storage space",
      "Omit fuel data if the invoice is too complicated",
      "Order new smart meters without management approval"
    ],
    correct: 0,
    correctExplanation: "O = Observe period, boundary & unit, ensuring explicit physical and temporal boundaries.",
    incorrectExplanation: "Incorrect. O = Observe period, boundary & unit."
  },
  {
    order: 3,
    question: "What is the critical difference between MISSING DATA and ZERO?",
    options: [
      "Missing data means information was uncollected (must remain blank/tagged gap); zero means verified proof that zero resource was consumed",
      "Missing data means zero cost; zero means negative cost",
      "Missing data and zero mean the exact same thing in accounting",
      "Missing data is used for electricity; zero is used for water"
    ],
    correct: 0,
    correctExplanation: "Entering zero for missing data distorts totals and falsely implies zero resource consumption.",
    incorrectExplanation: "Incorrect. Missing data = uncollected info; Zero = verified zero consumption."
  },
  {
    order: 4,
    question: "In the visual data log sheet photo (`visual-sustainability-data-quality-check.png`), what data defect is highlighted on the water row?",
    options: [
      "The value '1850' is recorded without any physical unit of measure (e.g. m³ or litres)",
      "The document is printed on recycled paper",
      "The table contains too many rows",
      "The font color is dark blue"
    ],
    correct: 0,
    correctExplanation: "The water row shows '1850' without specifying m³ or litres, creating severe ambiguity.",
    incorrectExplanation: "Incorrect. The highlighted defect is a missing unit of measure."
  },
  {
    order: 5,
    question: "Why should financial invoice costs (e.g. MUR 45,000) NEVER be entered into consumption fields meant for physical units (e.g. kWh)?",
    options: [
      "Because utility tariffs change over time, so money spent does not equal physical energy or water consumed",
      "Because currency amounts are secret and confidential",
      "Because utility bills are always inaccurate",
      "Because physical units can only be measured in winter"
    ],
    correct: 0,
    correctExplanation: "Tariffs and taxes fluctuate; tracking costs instead of physical units distorts environmental footprint calculations.",
    incorrectExplanation: "Incorrect. Financial costs fluctuate with tariffs and do not represent physical resource consumption."
  },
  {
    order: 6,
    question: "How should a data collector handle an ESTIMATED value when a meter reading is temporarily unavailable?",
    options: [
      "Label the entry clearly as 'Estimate', record the estimation formula/source, and schedule verification when actual data arrives",
      "Enter the estimate as a verified meter reading without telling anyone",
      "Leave the spreadsheet permanently locked",
      "Multiply last year's number by 2 and submit it"
    ],
    correct: 0,
    correctExplanation: "Estimates must be explicitly labeled with calculation methods and updated when measured data arrives.",
    incorrectExplanation: "Incorrect. Estimates must be clearly labeled with methods and updated upon verification."
  },
  {
    order: 7,
    question: "What is an OUTLIER in workplace sustainability data collection?",
    options: [
      "An implausibly high or low data value compared to historical baselines that requires verification before submission",
      "An employee who works outside the main office building",
      "A document that was deleted from the computer recycle bin",
      "A supplier who provides raw materials"
    ],
    correct: 0,
    correctExplanation: "Outliers are unusual spikes or drops requiring verification for potential leaks or data entry errors.",
    incorrectExplanation: "Incorrect. Outliers are unusual values requiring verification before submission."
  },
  {
    order: 8,
    question: "Why is saving evidence files in shared company locations better than storing them in personal folders?",
    options: [
      "Because shared storage ensures audit traceability, team access, and operational continuity when staff change roles",
      "Because personal folders use more internet bandwidth",
      "Because shared files cannot be edited by managers",
      "Because personal files automatically expire after 24 hours"
    ],
    correct: 0,
    correctExplanation: "Shared evidence locations ensure team access, audit traceability, and continuity.",
    incorrectExplanation: "Incorrect. Shared locations preserve traceability and operational continuity."
  },
  {
    order: 9,
    question: "How does ELH-18 (Data Collection) connect to ELH-19 (Performance Review)?",
    options: [
      "ELH-18 ensures raw data is complete, validated, and traceable; ELH-19 evaluates those validated data streams to review overall progress",
      "ELH-18 replaces performance reviews entirely",
      "ELH-18 is for receptionists; ELH-19 is for external lawyers",
      "ELH-18 handles financial payroll while ELH-19 handles marketing"
    ],
    correct: 0,
    correctExplanation: "ELH-18 collects and validates raw data; ELH-19 interprets the validated data during performance reviews.",
    incorrectExplanation: "Incorrect. ELH-18 provides validated data; ELH-19 evaluates performance trends."
  },
  {
    order: 10,
    question: "What is the primary takeaway of the SOURCE Data-Quality Framework?",
    options: [
      "Applying SOURCE (Select source, Observe period/unit, Upload record, Record estimates, Check gaps, Escalate) ensures workplace data is reliable and traceable",
      "Data collection is only necessary during external audits",
      "Spreadsheets should be submitted without checking for missing units",
      "Estimates should always replace physical meter readings"
    ],
    correct: 0,
    correctExplanation: "The SOURCE framework provides structured discipline for accurate, evidence-backed data collection.",
    incorrectExplanation: "Incorrect. SOURCE provides the discipline needed for reliable workplace data."
  }
];

export async function ensureSustainabilityDataCollectionCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 18 by courseCode "ELH-18" or slug
      let course = null;

      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-18"))
        .limit(1);

      if (byCode) {
        course = byCode;
      } else {
        const [bySlug] = await tx
          .select()
          .from(coursesTable)
          .where(eq(coursesTable.slug, COURSE_SLUG))
          .limit(1);
        course = bySlug ?? null;
      }

      if (!course) {
        throw new Error("Course ELH-18 / sustainability-data-collection-and-evidence not seeded by catalogue skeletons bootstrap!");
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
      const hasMissingQuiz = existingQuizQuestions.length !== 10;

      const needsRepair = !existingSeed || hasMissingLessons || hasEmptyBlocks || hasMissingQuiz;

      if (!needsRepair) {
        logger.info({ courseId, slug: COURSE_SLUG }, "Sustainability Data Collection course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course ELH-18. Re-seeding course content, lessons, and 10 quiz questions transactionally...");

      // 4. Resolve next recommended course dynamically (ELH-19 or null if not yet seeded)
      const [course19] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.slug, "sustainability-performance-review"))
        .limit(1);
      const nextCourseId = course19 ? course19.id : null;

      // 5. Update course record metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-18",
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

      // 7. Seed/re-seed 10 quiz questions
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

      // 8. Enforce prerequisite entries in coursePrerequisitesTable (ELH-12 through ELH-17 -> ELH-18)
      const prereqs = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(inArray(coursesTable.slug, [
          "final-sustainability-certification",
          "sustainability-action-planning",
          "setting-departmental-sustainability-goals",
          "building-workplace-sustainability-team",
          "communicating-sustainability-at-work",
          "tracking-sustainability-actions-and-progress"
        ]));

      for (const prereq of prereqs) {
        const [existingPrereq] = await tx
          .select()
          .from(coursePrerequisitesTable)
          .where(and(
            eq(coursePrerequisitesTable.courseId, courseId),
            eq(coursePrerequisitesTable.prerequisiteCourseId, prereq.id)
          ))
          .limit(1);

        if (!existingPrereq) {
          await tx.insert(coursePrerequisitesTable).values({
            courseId,
            prerequisiteCourseId: prereq.id,
          });
        }
      }

      // 9. Idempotently seed/update badge definition
      await tx
        .insert(badgeDefinitionsTable)
        .values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "database",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 23,
        })
        .onConflictDoUpdate({
          target: badgeDefinitionsTable.slug,
          set: {
            name: COURSE_META.badgeName,
            description: COURSE_META.badgeDescription,
            courseIds: [courseId],
          },
        });

      // 10. Save seed marker version
      if (!existingSeed) {
        await tx.insert(systemSeedsTable).values({
          name: SEED_NAME,
          version: 2,
        });
      } else {
        await tx.update(systemSeedsTable).set({ version: 2 }).where(eq(systemSeedsTable.name, SEED_NAME));
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Sustainability Data Collection course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Sustainability Data Collection course");
  }
}
