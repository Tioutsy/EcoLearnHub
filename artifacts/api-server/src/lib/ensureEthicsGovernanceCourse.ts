import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
  coursePrerequisitesTable,
} from "@workspace/db";
import { eq, and, or } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_ID = 32;
const COURSE_SLUG = "ethics-governance-and-responsible-business";
const COURSE_TITLE = "Ethics, Governance & Responsible Business";
const BADGE_SLUG = "responsible-business-practitioner";
const SEED_NAME = "ethics-governance-and-responsible-business-v1";

const COURSE_META = {
  courseCode: "ELH-32",
  description:
    "Learn how an organisation makes responsible decisions, sets accountabilities, handles conflicts of interest and confidentiality, and ensures appropriate workplace controls are followed.",
  fullDescription:
    "Building directly on ELH-09 (ESG Basics) and ELH-31 (Social Responsibility at Work), this course provides employees across all roles with a practical introduction to the Governance (G) pillar of ESG. Explore the foundations of responsible decision-making, distinguish company-level governance structures from individual employee behaviors, handle conflicts of interest and confidentiality, navigate realistic Mauritius workplace scenarios, and apply practical habits that foster integrity and trust.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "1400.00",
  level: "Intermediate / Applied ESG",
  isFeatured: false,
  thumbnailUrl: "/images/courses/ethics-and-governance.jpg",
  learningObjectives: [
    "Explain Governance in simple workplace language and understand why it is part of ESG.",
    "Recognise ethical and unethical workplace decisions in everyday work.",
    "Understand accountability and the importance of responsible decision-making.",
    "Identify a potential conflict of interest and know how to disclose it transparently.",
    "Understand why accurate records, invoices, and operational reports matter for corporate integrity.",
    "Protect employee, customer, and business confidentiality in daily tasks.",
    "Understand why shortcuts can undermine workplace controls and know how to raise concerns through appropriate channels.",
    "Distinguish leadership governance responsibilities (policies, oversight, systems) from individual employee contributions.",
    "Select one practical workplace commitment to support responsible business conduct."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations on completing Ethics, Governance & Responsible Business! Remember: Environmental = impact on planet, Social = impact on people, Governance = how responsibly the organisation is run. Good governance becomes real in everyday decisions involving honesty, records, confidentiality, and speaking up.",
  badgeName: "Responsible Business Practitioner",
  badgeDescription:
    "Awarded for demonstrating practical understanding of workplace ethics, governance controls, conflict-of-interest disclosure, and transparent business conduct.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Hook: Would You Say Something?",
    minutes: 3,
    content: "Understand how everyday workplace choices reflect corporate governance and ethics.",
    blocks: [
      { id: "eg1-h1", type: "heading", position: 1, headingText: "Governance: How Responsible Organisations Make Decisions" },
      { id: "eg1-t1", type: "short_text", position: 2, bodyText: "At a commercial office and facilities hub in Ebène, Mauritius, a project team is days away from a major audit. A supervisor notices that a safety inspection certificate expired last week and suggests: 'Just change the date on the PDF to yesterday—nobody will check.' At first glance, this seems like a quick convenience to save the team from an audit finding. In reality, it falsifies records, breaches company ethics, and exposes the firm to severe legal liability." },
      {
        id: "eg1-k1",
        type: "key_message",
        position: 3,
        headingText: "What Does Governance Mean?",
        bodyText: "• Governance = How an organisation makes decisions, sets responsibilities, behaves ethically, and ensures appropriate rules and controls are followed.\n• Why Governance is Part of ESG:\n  - Environmental: How do our activities affect the planet?\n  - Social: How do our activities affect people?\n  - Governance: How do we make responsible decisions and ensure the business is properly run?"
      },
      {
        id: "eg1-t2",
        type: "short_text",
        position: 4,
        bodyText: "Governance in Everyday Work:\nGovernance is not just for boardrooms or corporate lawyers. It happens every day in how employees record data, follow procedures, handle confidential information, and report concerns."
      },
      {
        id: "eg1-d1",
        type: "decision_scenario",
        position: 5,
        decisionIntro: "First Impression Challenge:",
        decisionPrompt: "A coworker says: 'Governance only matters to board directors and compliance lawyers.' How do you respond?",
        decisionChoices: [
          { label: "Explain that Governance applies to all of us—it shapes how we record data, follow policies, handle confidential info, and make ethical daily decisions.", correct: true, feedback: "Exactly right! Governance lives in our everyday operational choices." },
          { label: "Agree that ordinary employees have zero connection to corporate governance.", correct: false, feedback: "Incorrect. Every employee shapes governance through honest reporting and policy adherence." },
          { label: "Say that Governance means deleting all audit records to keep files small.", correct: false, feedback: "Incorrect. Destroying records violates governance and compliance rules." }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Ethics in Everyday Work",
    minutes: 4,
    content: "Recognize ethical workplace behaviors and avoid deceptive shortcuts.",
    blocks: [
      { id: "eg2-h1", type: "heading", position: 1, headingText: "Ethical Workplace Decisions" },
      { id: "eg2-t1", type: "short_text", position: 2, bodyText: "Ethics is about doing the right thing in daily workplace choices. Something being convenient or fast does not automatically make it responsible." },
      {
        id: "eg2-k1",
        type: "key_message",
        position: 3,
        headingText: "Everyday Ethical Priorities",
        bodyText: "• Honesty & Integrity: Refusing to falsify figures, alter dates, or hide errors.\n• Refusing Improper Gifts: Declaring or declining gifts, favors, or bribes from suppliers or clients.\n• Accurate Information: Reporting operational facts truthfully to management and clients.\n• Avoiding Unauthorized Shortcuts: Following required sign-offs and procedures even under time pressure."
      },
      {
        id: "eg2-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Workplace Example: Reporting Equipment Errors",
        bodyText: "An employee accidentally breaks a piece of equipment. Instead of hiding the broken item behind a cabinet, the employee immediately logs an incident report and informs the facilities manager, allowing repair before a safety hazard occurs."
      }
    ]
  },
  {
    order: 2,
    title: "Conflicts of Interest & Confidentiality",
    minutes: 4,
    content: "Identify personal conflicts transparently and safeguard sensitive business data.",
    blocks: [
      { id: "eg3-h1", type: "heading", position: 1, headingText: "Navigating Conflicts & Sensitive Information" },
      { id: "eg3-t1", type: "short_text", position: 2, bodyText: "Two common areas where governance is tested at work are personal connections during business choices and handling sensitive information." },
      {
        id: "eg3-k1",
        type: "key_message",
        position: 3,
        headingText: "Conflicts of Interest & Confidentiality",
        bodyText: "• Conflict of Interest: Arises when a personal relationship or financial interest could influence—or appear to influence—a work decision (e.g., a bidder is a close relative).\n  - ACTION: Disclose the relationship transparently, follow company process, and step back from decision-making.\n• Confidentiality: Protecting employee records, customer data, financial figures, passwords, and internal reports.\n  - ACTION: Access info strictly for legitimate work, do not share passwords, and report unauthorized disclosures."
      },
      {
        id: "sr3-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "Disclosing a potential conflict of interest is NOT an admission of wrongdoing! In fact, transparently declaring relationships protects your personal credibility and shields the organization from corruption allegations."
      }
    ]
  },
  {
    order: 3,
    title: "Accurate Records & Company Controls",
    minutes: 3,
    content: "Understand why trustworthy information matters and how controls protect the organization.",
    blocks: [
      { id: "eg4-h1", type: "heading", position: 1, headingText: "Information You Can Trust & Speaking Up" },
      { id: "eg4-t1", type: "short_text", position: 2, bodyText: "Trustworthy information is the bedrock of responsible business. Controls and procedures exist to ensure accuracy, safety, and accountability." },
      {
        id: "eg4-k1",
        type: "key_message",
        position: 3,
        headingText: "Records, Controls & Escalation",
        bodyText: "• Never Alter Records: Training logs, safety sheets, invoices, and environmental metrics must be 100% accurate.\n• Controls Are Not Bureaucracy: Required sign-offs and dual approvals protect the business from fraud and error.\n• Speaking Up: If you encounter falsified data, unsafe practices, or misconduct, report it through available internal channels (manager, HR, or designated compliance lead)."
      },
      {
        id: "eg4-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Records Challenge:",
        decisionPrompt: "A colleague asks you to approve an invoice for goods that have not arrived yet so the department can spend its budget before month-end. What should you do?",
        decisionChoices: [
          { label: "Refuse to approve unverified invoices and explain that financial records must reflect genuine transactions.", correct: true, feedback: "Outstanding! Financial and operational records must always be accurate and truthful." },
          { label: "Approve the invoice immediately to help the department spend its budget.", correct: false, feedback: "Incorrect. Approving unverified invoices violates accounting controls and company policy." },
          { label: "Delete the invoice from the system and pretend it never existed.", correct: false, feedback: "Incorrect. Destroying accounting records is a severe compliance violation." }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "The Contractor Decision: Mauritius Workplace Challenge",
    minutes: 3,
    content: "Apply governance principles to a multi-step procurement scenario in Grand Baie.",
    blocks: [
      { id: "eg5-h1", type: "heading", position: 1, headingText: "Real-Life Application: The Contractor Selection in Grand Baie" },
      { id: "eg5-t1", type: "short_text", position: 2, bodyText: "At a commercial facility in Grand Baie, Mauritius, the procurement team is selecting a contractor for urgent building repairs. During the review, four governance challenges emerge." },
      {
        id: "eg5-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-ethics-governance.png",
        caption: "Grand Baie Procurement Review: Assessing Conflict Disclosure (G), Approval Controls (G), and Bid Confidentiality (G).",
        imageAlt: "Illustration of a Mauritian corporate desk showing contractor tender files, conflict disclosure forms, scoring rubrics, and confidential price bids."
      },
      {
        id: "eg5-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Multi-Step Governance Challenge:",
        decisionPrompt: "The selection committee evaluates 4 critical decision points:\nPoint 1: A committee member notices that Bidder A is owned by their sibling.\nPoint 2: A colleague suggests skipping the final manager approval because the project is running late.\nPoint 3: Someone proposes raising Bidder A's compliance score by 2 points so they beat Bidder B.\nPoint 4: Bidder B's pricing spreadsheet is left open on a shared network drive.\nWhat is the most responsible governance response across all four points?",
        decisionChoices: [
          { label: "Declare the sibling conflict transparently and step back from voting; enforce required manager approval; preserve exact assessment scores; and restrict access to the confidential pricing file immediately.", correct: true, feedback: "Outstanding! Disclosing conflicts, upholding controls, protecting score integrity, and safeguarding confidentiality ensures 100% transparent and ethical governance." },
          { label: "Bypass approvals and adjust scores to award the contract to Bidder A quickly.", correct: false, feedback: "Incorrect. Falsifying scores, hiding conflicts, and bypassing approvals destroys corporate integrity and violates governance policies." },
          { label: "Cancel the procurement process permanently and refuse to repair the building.", correct: false, feedback: "Incorrect. Responsible governance solves operational needs through transparent, ethical procedures." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Role in Responsible Business & Personal Commitment",
    minutes: 2,
    content: "Distinguish company leadership systems from individual employee behaviors.",
    blocks: [
      { id: "eg6-h1", type: "heading", position: 1, headingText: "Pledge to Support Responsible Governance" },
      { id: "eg6-t1", type: "short_text", position: 2, bodyText: "Governance is a shared responsibility. Leadership sets policies and oversight, while employees put governance into practice through daily choices." },
      {
        id: "eg6-k1",
        type: "key_message",
        position: 3,
        headingText: "Company Responsibility vs. Employee Contribution",
        bodyText: "• Leadership / Organisation: Establishing governance structures, fair policies, internal controls, risk management, escalation channels, and audit oversight.\n• Employee Contribution: Acting honestly, recording data accurately, protecting confidential information, declaring potential conflicts, and raising concerns through proper channels."
      },
      {
        id: "eg6-c1",
        type: "commitment",
        position: 4,
        commitmentInstruction: "Select your daily workplace Governance commitment (choose at least one):",
        commitmentOptions: [
          { value: "record-data-accurately", label: "Record workplace information and metrics accurately, even under time pressure", description: "Support trustworthy data and corporate transparency." },
          { value: "declare-conflicts-transparently", label: "Declare potential conflicts of interest promptly rather than hiding them", description: "Protect personal integrity and fair decision-making." },
          { value: "protect-confidential-info", label: "Protect sensitive business, employee, and customer information", description: "Safeguard company data confidentiality." },
          { value: "follow-controls-and-escalate", label: "Follow required approval controls and raise concerns through proper channels", description: "Uphold corporate accountability and ethics." }
        ]
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "What does the Governance (G) pillar of ESG focus on in plain workplace language?",
    options: [
      "Exclusively managing employee social events",
      "How an organisation makes decisions, sets responsibilities, behaves ethically, and ensures appropriate rules and controls are followed",
      "Installing solar water heaters on warehouse roofs",
      "Designing promotional marketing brochures for external sales teams"
    ],
    correct: 1,
    correctExplanation: "Governance focuses on how responsibly an organisation is directed, managed, controlled, and held accountable.",
    incorrectExplanation: "Incorrect. Governance focuses on decision-making, ethics, and controls."
  },
  {
    order: 2,
    question: "An employee involved in selecting a new supplier discovers that one bidding company belongs to a close family member. What is the most responsible action?",
    options: [
      "Keep the relationship secret and vote for the family member's company",
      "Disqualification of the supplier without informing anyone",
      "Disclose the relationship transparently to management and recuse oneself from the selection decision",
      "Share confidential competitor price quotes with the family member"
    ],
    correct: 2,
    correctExplanation: "Disclosing potential conflicts transparently and stepping back from decision-making preserves process integrity.",
    incorrectExplanation: "Incorrect. Disclose the relationship transparently and recuse oneself from voting."
  },
  {
    order: 3,
    question: "While preparing a monthly operational report, an employee notices a calculation typo that makes department performance look slightly worse than expected. What should they do?",
    options: [
      "Correct the typo so the report reflects 100% accurate, truthful data",
      "Invent fake additional numbers to make the department look impressive",
      "Delete the entire report and claim computer servers crashed",
      "Blame the typo on a coworker during a staff meeting"
    ],
    correct: 0,
    correctExplanation: "Responsible governance relies on truthful, accurate recordkeeping without falsifying or hiding information.",
    incorrectExplanation: "Incorrect. Always record and report data accurately."
  },
  {
    order: 4,
    question: "What is the difference between company-level governance responsibility and individual employee responsibility?",
    options: [
      "Employees carry full legal liability for corporate governance while leadership does nothing",
      "Corporate governance policies only apply to external consultants",
      "There is no difference between executive management and frontline staff",
      "Leadership establishes policies, controls, and reporting systems, while employees contribute by acting honestly, following rules, and reporting concerns"
    ],
    correct: 3,
    correctExplanation: "Leadership creates governance structures and policies, while employees put governance into practice through daily actions.",
    incorrectExplanation: "Incorrect. Leadership sets policies; employees contribute through daily actions."
  },
  {
    order: 5,
    question: "A project deadline is hours away. A colleague suggests skipping a required safety sign-off to save time. How should you respond?",
    options: [
      "Skip the sign-off to meet the deadline, assuming nothing will go wrong",
      "Explain that controls protect safety and compliance, and complete the required sign-off before proceeding",
      "Falsify the signature of the safety manager",
      "Cancel the project and resign from the company immediately"
    ],
    correct: 1,
    correctExplanation: "Bypassing controls creates severe safety and legal risks; completing required approvals upholds governance.",
    incorrectExplanation: "Incorrect. Controls protect safety and compliance; complete required approvals before proceeding."
  }
];

export async function ensureEthicsGovernanceCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course by courseCode "ELH-32", slug, or title
      let existingCourse = null;

      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-32"))
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
        logger.info("Seeding new ELH-32 Ethics, Governance & Responsible Business course record...");
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
        logger.info({ courseId, slug: COURSE_SLUG }, "Ethics and Governance course content verified. Skipping repair...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Seeding or repairing ELH-32 course content transactionally...");

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

      // Set ELH-31 or ELH-09 as next recommended course safely
      const [elh31] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-31"))
        .limit(1);

      if (elh31) {
        await tx
          .update(coursesTable)
          .set({ recommendedNextCourseId: elh31.id })
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
          orderIndex: 32,
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

      logger.info({ courseId, slug: COURSE_SLUG }, "ELH-32 Ethics, Governance & Responsible Business seeded successfully!");
    });
  } catch (err) {
    logger.error({ err }, "Failed to seed ELH-32 Ethics and Governance course");
    throw err;
  }
}
