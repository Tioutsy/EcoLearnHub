import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
  coursePrerequisitesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_ID = 33;
const COURSE_SLUG = "esg-data-measurement-and-reporting-basics";
const COURSE_TITLE = "ESG Data, Measurement & Reporting Basics";
const BADGE_SLUG = "esg-data-awareness";
const SEED_NAME = "esg-data-measurement-and-reporting-basics-v1";

const COURSE_META = {
  courseCode: "ELH-33",
  description:
    "Learn how organisations collect, check, use, and report ESG information, understand why data quality matters, and discover your role in maintaining trustworthy workplace records.",
  fullDescription:
    "Building directly on ELH-09 (ESG Basics), ELH-31 (Social Responsibility at Work), and ELH-32 (Ethics, Governance & Responsible Business), this course provides employees across all roles with a practical introduction to ESG data literacy. Explore what ESG data looks like across Environmental, Social, and Governance pillars, distinguish actions from measurements and evidence, apply key context rules (Value + Unit + Period + Scope + Source), recognize measured vs estimated figures, and discover how honest daily records support organisational transparency.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "1400.00",
  level: "Intermediate / Applied ESG",
  isFeatured: false,
  thumbnailUrl: "/images/courses/esg-data-measurement.jpg",
  learningObjectives: [
    "Explain what ESG data means in simple workplace language.",
    "Recognise examples of Environmental, Social, and Governance information.",
    "Understand the difference between an action statement, a measurement, and verified evidence.",
    "Understand why units, dates, periods, and context (Value + Unit + Period + Scope + Source) matter for trustworthy records.",
    "Recognise basic data-quality problems such as missing units, wrong dates, or duplicate entries.",
    "Distinguish measured information from estimated figures.",
    "Understand why missing data should not simply be copied or invented.",
    "Understand why manipulating numbers to make performance look better violates corporate integrity.",
    "Recognise the individual employee's role in accurate daily recordkeeping.",
    "Distinguish employee data accuracy responsibilities from organisational ESG reporting responsibilities.",
    "Select one practical workplace commitment to support trustworthy ESG information."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations on completing ESG Data, Measurement & Reporting Basics! Remember: Environmental = impact on planet, Social = impact on people, Governance = how responsibly the business is run. ESG data becomes trustworthy through daily accuracy, clear units, verified evidence, and transparent reporting.",
  badgeName: "ESG Data Awareness",
  badgeDescription:
    "Awarded for demonstrating practical understanding of workplace ESG data quality, measurement principles, evidence verification, and trustworthy recordkeeping.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Hook: Can You Trust This Number?",
    minutes: 3,
    content: "Understand why uncontextualized numbers are misleading and why ESG data requires context.",
    blocks: [
      { id: "ed1-h1", type: "heading", position: 1, headingText: "Understanding Workplace ESG Data" },
      { id: "ed1-t1", type: "short_text", position: 2, bodyText: "A facility manager in Ebène, Mauritius receives a monthly dashboard update stating: 'Water used: 280.' Immediately, questions arise: 280 what? Litres or cubic metres (m³)? For the main office or the warehouse? Measured from a utility meter or estimated from last year? Without units, dates, scope, and source, a number is incomplete and cannot be used for responsible business decisions." },
      {
        id: "ed1-k1",
        type: "key_message",
        position: 3,
        headingText: "What Is ESG Data?",
        bodyText: "• ESG Data = Figures, metrics, and records that measure how a business operates across Environmental, Social, and Governance areas.\n• Purpose: Data helps an organisation track progress, identify resource waste, demonstrate accountability, and communicate truthfully with stakeholders."
      },
      {
        id: "ed1-t2",
        type: "short_text",
        position: 4,
        bodyText: "Action vs. Measurement vs. Evidence:\n• Action: 'We try to reduce water waste.' (Statement of intent)\n• Measurement: 'The main meter recorded 280 m³ of water in July.' (Numerical data)\n• Evidence: 'Utility bill #8910 and signed meter log confirm 280 m³.' (Verifiable proof)"
      },
      {
        id: "ed1-d1",
        type: "decision_scenario",
        position: 5,
        decisionIntro: "First Impression Challenge:",
        decisionPrompt: "A colleague says: 'ESG data just means inventing green numbers to impress corporate auditors.' How do you respond?",
        decisionChoices: [
          { label: "Explain that ESG data must be accurate and verifiable—it comes from genuine operational measurements like meter logs, training completion records, and safety reports.", correct: true, feedback: "Exactly right! ESG data relies on real, verifiable operational records." },
          { label: "Agree that ESG data is completely made up and does not need evidence.", correct: false, feedback: "Incorrect. Fabricating data violates ethics, governance, and audit standards." },
          { label: "Say that ESG data means deleting utility invoices so nobody sees electricity costs.", correct: false, feedback: "Incorrect. Destroying operational records is a severe compliance breach." }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "What Counts as ESG Data?",
    minutes: 4,
    content: "Explore examples across Environmental, Social, and Governance pillars.",
    blocks: [
      { id: "ed2-h1", type: "heading", position: 1, headingText: "Examples Across Environmental, Social & Governance Pillars" },
      { id: "ed2-t1", type: "short_text", position: 2, bodyText: "ESG data is generated across every department. It includes both quantitative (numerical) metrics and qualitative (descriptive) information." },
      {
        id: "ed2-k1",
        type: "key_message",
        position: 3,
        headingText: "Examples Across the 3 Pillars",
        bodyText: "• Environmental Data: Electricity consumed (kWh), fuel used (litres), water consumed (m³), waste generated/recycled (kg/tonnes).\n• Social Data: Training participation/completion rates, workplace safety incident logs, employee turnover, customer safety feedback.\n• Governance Data: Compliance check completion, declared conflicts of interest, audit findings, policy acknowledgement records.\n• Quantitative vs. Qualitative: Quantitative metrics use numbers (e.g., 450 kWh), while qualitative data describes status or policies (e.g., 'Equal opportunity policy updated and published')."
      },
      {
        id: "ed2-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Workplace Example: Paper & Policy Tracking",
        bodyText: "An office manager logs monthly paper consumption (quantitative: 50 reams) alongside the team's double-sided printing policy (qualitative: procedure active in all departments)."
      }
    ]
  },
  {
    order: 2,
    title: "From Action to Evidence & Context",
    minutes: 4,
    content: "Apply the 5-point Context Rule and learn to compare data like-for-like.",
    blocks: [
      { id: "ed3-h1", type: "heading", position: 1, headingText: "The 5-Point Context Rule & Fair Comparisons" },
      { id: "ed3-t1", type: "short_text", position: 2, bodyText: "A number alone is never enough. To make information useful and trustworthy, it requires complete context." },
      {
        id: "ed3-k1",
        type: "key_message",
        position: 3,
        headingText: "The 5-Point Context Rule & Fair Comparisons",
        bodyText: "• Context Formula: Value + Unit + Period + Scope/Location + Source.\n  - Example: '1,200 kWh (Value/Unit) used in July 2026 (Period) at the Grand Baie Hub (Scope) from CEB Meter #442 (Source).'\n• Comparing Like with Like: If electricity dropped 30% this month, ask why! Was it due to solar energy efficiency, or because the building was closed for holidays? Context prevents misleading conclusions."
      },
      {
        id: "ed3-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "International data standards show that over 60% of ESG data errors are caused by simple missing units or mismatched date ranges! Double-checking units (e.g., litres vs m³) prevents costly reporting mistakes."
      }
    ]
  },
  {
    order: 3,
    title: "Good Data vs Misleading Data",
    minutes: 3,
    content: "Distinguish measured vs estimated data and master the 5 Data Quality Attributes.",
    blocks: [
      { id: "ed4-h1", type: "heading", position: 1, headingText: "Measured vs. Estimated & 5 Quality Attributes" },
      { id: "ed4-t1", type: "short_text", position: 2, bodyText: "High-quality data builds trust. Understanding measured vs estimated information ensures transparency." },
      {
        id: "ed4-k1",
        type: "key_message",
        position: 3,
        headingText: "Measured vs. Estimated & Data Quality",
        bodyText: "• Measured Data: Obtained directly from utility meters, invoices, or verified system logs.\n• Estimated Data: Calculated when direct measurement is unavailable. Estimates are acceptable ONLY when clearly labelled and based on reasonable methods.\n• 5 Data Quality Attributes:\n  1. Accurate: Reflects true operational facts.\n  2. Complete: Important records are not omitted.\n  3. Consistent: Standard units and methods are used.\n  4. Traceable: Source documents or logs exist.\n  5. Timely: Recorded in the correct period."
      },
      {
        id: "ed4-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Data Integrity Challenge:",
        decisionPrompt: "A utility bill is missing for the last week of the month. A coworker suggests: 'Just make up a number so the spreadsheet looks finished.' What should you do?",
        decisionChoices: [
          { label: "Label the missing period clearly, use a documented estimate or wait for the invoice, and explain the assumption transparently.", correct: true, feedback: "Outstanding! Transparently labelling estimates or waiting for verified invoices protects data integrity." },
          { label: "Invent a fake number and present it as an official meter reading.", correct: false, feedback: "Incorrect. Presenting invented numbers as official readings is falsification." },
          { label: "Delete the entire month's data from the company archive.", correct: false, feedback: "Incorrect. Destroying operational records corrupts company historical data." }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "The Monthly ESG Snapshot: Mauritius Workplace Challenge",
    minutes: 3,
    content: "Navigate a multi-step data quality review in a Mauritius commercial resort complex.",
    blocks: [
      { id: "ed5-h1", type: "heading", position: 1, headingText: "Real-Life Application: Monthly ESG Review in Mauritius" },
      { id: "ed5-t1", type: "short_text", position: 2, bodyText: "At a hotel resort and commercial complex in Mauritius, the team is reviewing the monthly internal ESG snapshot before management submission. Five data issues require resolution." },
      {
        id: "ed5-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-esg-data.png",
        caption: "Grand Baie Operations Review: Evaluating Water Units (E), Waste Invoices (E), Facility Closures (E), Training Status (S), and Incident Logs (G).",
        imageAlt: "Illustration of a Mauritian resort office showing utility meter spreadsheets, waste collection receipts, staff training logs, and incident reports."
      },
      {
        id: "ed5-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Multi-Step Data Quality Challenge:",
        decisionPrompt: "The review team evaluates 5 data entries:\n1. Water entry reads '280' without units.\n2. Waste collection receipt is missing; colleague suggests copying last month's figure.\n3. Electricity fell 40% because Wing B was closed for repairs.\n4. Manager wants 10 pending employees marked '100% completed' for training.\n5. Proposal to delete an accidental fuel spill log to make safety numbers look good.\nWhat is the most responsible data resolution across all five items?",
        decisionChoices: [
          { label: "Add 'm³' unit to water; request vendor copy for waste receipt; record true electricity drop while adding facility closure context; log exact current training completion; and retain fuel spill log transparently.", correct: true, feedback: "Outstanding! Ensuring accurate units, chasing genuine evidence, providing context, reporting true completion, and preserving incident records maintains 100% data integrity." },
          { label: "Invent missing figures, mark pending training as completed, and delete the fuel spill log to make results look impressive.", correct: false, feedback: "Incorrect. Inventing numbers, falsifying training logs, and hiding incident reports destroys corporate trust and violates ESG governance rules." },
          { label: "Delete all five department records and refuse to submit the monthly snapshot.", correct: false, feedback: "Incorrect. Responsible data management resolves issues through accurate, transparent evidence." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Role in Trustworthy ESG Information & Personal Commitment",
    minutes: 2,
    content: "Distinguish frontline recordkeeping from corporate ESG reporting, and commit to daily habits.",
    blocks: [
      { id: "ed6-h1", type: "heading", position: 1, headingText: "Frontline Recordkeeping vs. Corporate Reporting" },
      { id: "ed6-t1", type: "short_text", position: 2, bodyText: "Corporate ESG reports depend on frontline data accuracy. Understand your role in keeping information trustworthy." },
      {
        id: "ed6-k1",
        type: "key_message",
        position: 3,
        headingText: "Organisational Role vs. Employee Contribution",
        bodyText: "• Organisational / ESG Specialist Role: Establishing reporting frameworks, setting boundary rules, calculating carbon footprints, submitting formal disclosures, and conducting audits.\n• Employee Contribution: Recording daily figures accurately, double-checking units and dates, keeping source evidence/receipts, labelling estimates, and reporting data errors promptly."
      },
      {
        id: "ed6-c1",
        type: "commitment",
        position: 4,
        commitmentInstruction: "Select your daily workplace ESG data commitment (choose at least one):",
        commitmentOptions: [
          { value: "check-units-and-dates", label: "Check units, dates, and locations before recording operational data", description: "Prevent basic data errors and missing context." },
          { value: "never-invent-missing-data", label: "Never copy or invent missing figures when records are unavailable", description: "Uphold data integrity and evidence standards." },
          { value: "label-estimates-transparently", label: "Label estimated figures clearly and keep source receipts/evidence", description: "Ensure data traceability and transparency." },
          { value: "report-data-errors-promptly", label: "Report data discrepancies or recording errors to supervisors promptly", description: "Support continuous data quality and honest reporting." }
        ]
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "What does ESG data include in plain workplace language?",
    options: [
      "Exclusively financial stock market share prices",
      "Operational figures and records across Environmental (kWh, water, waste), Social (training, safety), and Governance (compliance checks, conflicts) pillars",
      "Unsubstantiated marketing slogans printed on sales posters",
      "Personal social media posts by company executives"
    ],
    correct: 1,
    correctExplanation: "ESG data encompasses operational measurements and records across Environmental, Social, and Governance activities.",
    incorrectExplanation: "Incorrect. ESG data includes operational figures across E, S, and G pillars."
  },
  {
    order: 2,
    question: "Which of the following represents verified ESG evidence rather than a statement of intent?",
    options: [
      "Saying 'We plan to reduce electricity consumption next year'",
      "Writing an email that says 'Our office is very eco-friendly'",
      "A utility bill and certified meter reading log confirming 1,400 kWh consumed in July",
      "Posting a green leaf icon on the company intranet homepage"
    ],
    correct: 2,
    correctExplanation: "Evidence consists of verifiable proof, such as signed meter logs, utility bills, or system records.",
    incorrectExplanation: "Incorrect. Verified evidence requires traceable proof like utility bills or signed meter logs."
  },
  {
    order: 3,
    question: "Why is a recorded figure such as 'Water: 450' incomplete without context?",
    options: [
      "Because without a unit (m³ or litres), period (month/year), location, and source, the number cannot be accurately understood or compared",
      "Because all numbers must be converted into foreign currencies",
      "Because water data is illegal to record in commercial buildings",
      "Because figures under 500 are automatically invalid"
    ],
    correct: 0,
    correctExplanation: "Complete context (Value + Unit + Period + Scope + Source) ensures data is clear, accurate, and comparable.",
    incorrectExplanation: "Incorrect. Numbers require units, dates, scope, and source to be usable."
  },
  {
    order: 4,
    question: "A waste collection receipt for the last week of the month is missing. How should an employee handle this situation?",
    options: [
      "Copy the previous month's figure and present it as an exact receipt",
      "Invent a large number to make waste recycling look impressive",
      "Delete all waste records for the entire year",
      "Follow procedure to request a duplicate receipt from the vendor, or label any calculated estimate transparently"
    ],
    correct: 3,
    correctExplanation: "Missing data should be retrieved from source documents or labelled as an estimate transparently—never invented.",
    incorrectExplanation: "Incorrect. Always retrieve source receipts or label estimates transparently."
  },
  {
    order: 5,
    question: "What is the primary data responsibility of an individual employee compared to corporate ESG specialists?",
    options: [
      "Individual employees must calculate international carbon footprint disclosures for the board",
      "Employees contribute by recording daily workplace data accurately, verifying units/dates, and keeping source records, while specialists handle formal reporting frameworks",
      "Employees carry full legal liability for international climate reporting treaties",
      "Employees have no role in workplace recordkeeping whatsoever"
    ],
    correct: 1,
    correctExplanation: "Employees support data quality through accurate daily recordkeeping; specialists aggregate data for formal reporting.",
    incorrectExplanation: "Incorrect. Employees focus on daily data accuracy and evidence; specialists manage formal disclosures."
  }
];

export async function ensureEsgDataCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course by courseCode "ELH-33", slug, or title
      let existingCourse = null;

      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-33"))
        .limit(1);

      if (byCode) {
        existingCourse = byCode;
      } else {
        const [bySlug] = await tx
          .select()
          .from(coursesTable)
          .where(eq(coursesTable.slug, COURSE_SLUG))
          .limit(1);
        if (bySlug) {
          existingCourse = bySlug;
        } else {
          const [byTitle] = await tx
            .select()
            .from(coursesTable)
            .where(eq(coursesTable.title, COURSE_TITLE))
            .limit(1);
          if (byTitle) {
            existingCourse = byTitle;
          }
        }
      }

      let courseId: number;

      if (!existingCourse) {
        logger.info("Seeding new ELH-33 ESG Data, Measurement & Reporting Basics course record...");
        try {
          const [inserted] = await tx
            .insert(coursesTable)
            .values({
              courseCode: COURSE_META.courseCode,
              slug: COURSE_SLUG,
              title: COURSE_TITLE,
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
              isPublished: true,
              status: "published",
            })
            .returning();
          courseId = inserted.id;
        } catch (_err) {
          const [retry] = await tx
            .select()
            .from(coursesTable)
            .where(eq(coursesTable.slug, COURSE_SLUG))
            .limit(1);
          if (retry) {
            courseId = retry.id;
          } else {
            throw _err;
          }
        }
      } else {
        courseId = existingCourse.id;
        await tx
          .update(coursesTable)
          .set({
            courseCode: COURSE_META.courseCode,
            title: COURSE_TITLE,
            slug: COURSE_SLUG,
            description: COURSE_META.description,
            fullDescription: COURSE_META.fullDescription,
            categoryId: COURSE_META.categoryId,
            durationMinutes: COURSE_META.durationMinutes,
            priceUsd: COURSE_META.priceUsd,
            level: COURSE_META.level,
            thumbnailUrl: COURSE_META.thumbnailUrl,
            learningObjectives: COURSE_META.learningObjectives,
            completionMessage: COURSE_META.completionMessage,
            badgeName: COURSE_META.badgeName,
            badgeDescription: COURSE_META.badgeDescription,
            isPublished: true,
            status: "published",
          })
          .where(eq(coursesTable.id, courseId));
      }

      // 2. Fetch system seed marker
      const [existingSeed] = await tx
        .select()
        .from(systemSeedsTable)
        .where(eq(systemSeedsTable.name, SEED_NAME))
        .limit(1);

      const existingLessons = await tx
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, courseId));

      const existingQuiz = await tx
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, courseId));

      const needsRepair = !existingSeed || existingLessons.length !== 6 || existingQuiz.length !== 5;

      if (!needsRepair) {
        logger.info({ courseId, slug: COURSE_SLUG }, "ESG Data course content verified. Skipping repair...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Seeding or repairing ELH-33 course content transactionally...");

      // 3. Resolve ELH-09 as prerequisite
      const [elh09] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-09"))
        .limit(1);

      if (elh09) {
        const [existingPrereq] = await tx
          .select()
          .from(coursePrerequisitesTable)
          .where(
            and(
              eq(coursePrerequisitesTable.courseId, courseId),
              eq(coursePrerequisitesTable.prerequisiteCourseId, elh09.id)
            )
          )
          .limit(1);

        if (!existingPrereq) {
          await tx.insert(coursePrerequisitesTable).values({
            courseId,
            prerequisiteCourseId: elh09.id,
          });
        }
      }

      // Set ELH-32 as next recommended course safely if available
      const [elh32] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-32"))
        .limit(1);

      if (elh32) {
        await tx
          .update(coursesTable)
          .set({ recommendedNextCourseId: elh32.id })
          .where(eq(coursesTable.id, courseId));
      }

      // 4. Seed Lessons
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

      // 5. Seed Quiz Questions
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

      // 6. Seed Badge Definition
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
          orderIndex: 33,
        })
        .onConflictDoUpdate({
          target: badgeDefinitionsTable.slug,
          set: {
            name: COURSE_META.badgeName,
            description: COURSE_META.badgeDescription,
            courseIds: [courseId],
          },
        });

      // 7. Record System Seed Version Idempotently
      await tx
        .insert(systemSeedsTable)
        .values({
          name: SEED_NAME,
          version: 1,
        })
        .onConflictDoUpdate({
          target: systemSeedsTable.name,
          set: { version: 1 },
        });

      logger.info({ courseId, slug: COURSE_SLUG }, "ELH-33 ESG Data, Measurement & Reporting Basics seeded successfully!");
    });
  } catch (err) {
    logger.error({ err }, "Failed to seed ELH-33 ESG Data course");
    throw err;
  }
}
