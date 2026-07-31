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

const COURSE_SLUG = "tracking-sustainability-actions-and-progress";
const COURSE_TITLE = "Tracking Sustainability Actions and Progress";
const BADGE_SLUG = "sustainability-progress-tracker";
const SEED_NAME = "tracking-sustainability-actions-and-progress-v2";

const COURSE_META = {
  courseCode: "ELH-17",
  description:
    "Learn how to maintain clear, current, and evidence-supported records of workplace sustainability actions using structured action registers and consistent status disciplines.",
  fullDescription:
    "Maintaining an action register turns committee decisions and departmental goals into trackable workplace delivery. This course teaches employees, action owners, and supervisors how to convert decisions into clear action statements, assign one accountable owner, track target dates, use consistent statuses (Not Started, In Progress, Blocked, Overdue, Completed, Deferred, Cancelled), distinguish activity from completion evidence, and escalate delays transparently.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/tracking-sustainability-actions-and-progress.jpg",
  intendedRoles: ["employees", "managers", "department representatives", "sustainability teams", "HR teams", "operations leads", "facilities coordinators"],
  learningObjectives: [
    "Convert approved sustainability decisions into clear, trackable action statements.",
    "Assign one accountable action owner while identifying supporting roles and approvers.",
    "Apply the TRACE action framework (Turn decision into action, Record owner/date, Add updates/evidence, Check status, Escalate delays).",
    "Distinguish between activity, output, outcome, and verifiable completion evidence.",
    "Maintain transparent action registers with consistent statuses and change histories."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations! You have passed Tracking Sustainability Actions and Progress. You can now write trackable action statements, assign single accountable owners, maintain evidence-backed status logs, and escalate delays transparently.",
  badgeName: "Sustainability Action Tracker",
  badgeDescription:
    "Awarded for demonstrating practical mastery of workplace action registers, single-owner accountability, evidence verification, and transparent status tracking.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "A Goal Is Not Yet an Action",
    minutes: 3,
    content: "Understand why broad goals fail without specific trackable action statements, owners, and target dates.",
    blocks: [
      { id: "ta1-h1", type: "heading", position: 1, headingText: "Goals Require Specific Action Tracking" },
      { id: "ta1-t1", type: "short_text", position: 2, bodyText: "A committee agrees: 'Improve waste sorting and reduce energy draw.' Three months later, the action register shows vague notes: 'Improve waste sorting — ongoing', 'Reduce electricity use — almost done', 'Speak to supplier — completed.' Nobody knows who owned the task, when it was due, what evidence proves completion, or what management needs to resolve. A goal is an intended result; a trackable action is a specific deliverable with one named owner and a deadline." },
      { id: "ta1-k1", type: "key_message", position: 3, headingText: "Trackable Action Rule", bodyText: "A trackable action statement defines the task deliverable, names one accountable owner, sets a target date, and specifies required completion evidence." },
      {
        id: "ta1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Evaluating Action Statement Quality:",
        decisionPrompt: "Which of the following represents a TRACKABLE ACTION STATEMENT?",
        decisionChoices: [
          { label: "Facilities Lead M. Govinden to audit all washroom taps in Building A, record leak locations, and submit repair purchase requests by 15 August", correct: true, feedback: "Correct! It specifies the exact task, deliverable, single owner, scope, deadline, and evidence." },
          { label: "Everyone should try to conserve water in washrooms", correct: false, feedback: "Incorrect. General pleas without assigned owners or dates are not trackable actions." },
          { label: "Reduce company water consumption by 20%", correct: false, feedback: "Incorrect. This is an overarching goal, not a specific action task." }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Why Action Tracking Matters & Core Vocabulary",
    minutes: 3,
    content: "Explore the operational benefits of reliable action tracking and master core action-register terms.",
    blocks: [
      { id: "ta2-h1", type: "heading", position: 1, headingText: "Operational Tracking & Vocabulary" },
      { id: "ta2-t1", type: "short_text", position: 2, bodyText: "Disciplined action tracking ensures committee meetings produce results. It prevents tasks from being forgotten, surfaces cross-departmental blockers early, and provides transparent evidence for performance reviews." },
      {
        id: "ta2-k1",
        type: "key_message",
        position: 3,
        headingText: "Action-Tracking Vocabulary",
        bodyText: "• Action Statement: The concise definition of the task deliverable and scope.\n• Action Owner: The single named individual accountable for delivering the action.\n• Supporting Role: Contributors who provide assistance without replacing single owner accountability.\n• Status: The current condition (Not Started, In Progress, Blocked, Overdue, Completed, Deferred, Cancelled).\n• Activity: The task step performed (e.g. Sent an email request).\n• Output: The immediate deliverable produced (e.g. 3 vendor quotes received).\n• Outcome: The measured environmental result (e.g. 15% reduction in electricity draw).\n• Completion Evidence: Factual proof verifying deliverable completion (e.g. Work sign-off certificate, audit log)."
      },
      {
        id: "ta2-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Completion vs Verification)",
        bodyText: "An action marked 'completed' is not automatically verified.\n\nReliable completion records show what deliverable was produced, who was accountable, when it was finished, and what evidence confirms completion.\n\nManagement-system standards (ISO 14001 Clause 9.1 & ISO 9001 Clause 9.1) emphasize monitoring, evaluation, and retaining appropriate documented information. A clear action register helps a workplace preserve evidence and avoid relying on memory or unverified status claims."
      }
    ]
  },
  {
    order: 2,
    title: "The TRACE Action Framework",
    minutes: 4,
    content: "Master the 5-step TRACE framework: Turn, Record, Add, Check, Escalate.",
    blocks: [
      { id: "ta3-h1", type: "heading", position: 1, headingText: "The TRACE Action Framework" },
      { id: "ta3-t1", type: "short_text", position: 2, bodyText: "Use the TRACE framework to maintain a reliable workplace action register:" },
      {
        id: "ta3-k1",
        type: "key_message",
        position: 3,
        headingText: "TRACE Framework Breakdown",
        bodyText: "• T — Turn decision into clear action: Define the exact deliverable, scope, and location.\n• R — Record one owner & target date: Assign single accountability and a realistic deadline.\n• A — Add updates, dependencies & evidence: Record progress notes, cross-department needs, and proof.\n• C — Check status & completion honestly: Use consistent status labels; do not mark complete without evidence.\n• E — Escalate delays & preserve history: Promptly report blocked tasks to management and archive change logs."
      },
      {
        id: "ta3-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Practice: Activity vs Completion Evidence",
        decisionPrompt: "A procurement officer sends an email requesting quotes for reusable delivery crates. How should this be recorded?",
        decisionChoices: [
          { label: "Record as 'In Progress' with a progress note: 'Quote request emailed to 3 vendors on 10 July'", correct: true, feedback: "Correct! Sending an email is an activity step, so the action remains In Progress until quotes are received and verified." },
          { label: "Mark the action 'Completed' because an email was sent", correct: false, feedback: "Incorrect. Sending an email is an activity step, not proof of deliverable completion." },
          { label: "Delete the action from the register to keep it short", correct: false, feedback: "Incorrect. Action history must be preserved until deliverables are verified." }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Visual Action Register & High-Risk Mistakes",
    minutes: 4,
    content: "Inspect a realistic Mauritian action register board and review critical safeguards.",
    blocks: [
      { id: "ta4-h1", type: "heading", position: 1, headingText: "Visual Action Register Inspection" },
      { id: "ta4-t1", type: "short_text", position: 2, bodyText: "Examine the Mauritian workplace action board below (`visual-sustainability-action-register.png`). Observe how the board tracks Action Statement, Owner, Supporting Role, Target Date, Status, Latest Update, Dependency, Evidence, and Escalation." },
      {
        id: "ta4-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-sustainability-action-register.png",
        caption: "Sustainability Action Register Board: Displaying action statements, owners, target dates, statuses, update logs, dependencies, and evidence.",
        imageAlt: "Realistic photograph of a Mauritian commercial workplace office with a whiteboard titled Sustainability Action Register Board showing action statements, single owners, target dates, statuses, updates, and evidence while facilities managers inspect the board."
      },
      {
        id: "ta4-k1",
        type: "key_message",
        position: 4,
        headingText: "High-Risk Tracking Mistakes to Avoid",
        bodyText: "• DO NOT assign multiple owners to a single action (e.g. 'Sarah & Rajiv'); assign one primary owner.\n• DO NOT leave target dates blank or use permanent 'ongoing' status without review dates.\n• DO NOT mark blocked actions as 'in progress' to hide delays from management.\n• DO NOT mark actions 'completed' without attaching or linking verifiable evidence.\n• DO NOT delete old actions or overwrite target dates without recording change history."
      }
    ]
  },
  {
    order: 4,
    title: "Worked Mauritian Scenario & Applied Decision",
    minutes: 2,
    content: "Study a hotel multi-action tracking scenario and solve an applied commercial property decision.",
    blocks: [
      { id: "ta5-h1", type: "heading", position: 1, headingText: "Worked Scenario: Hotel Action Register" },
      {
        id: "ta5-w1",
        type: "workplace_example",
        position: 2,
        headingText: "Tracking Three Distinct Actions",
        bodyText: "A hotel committee tracks 3 actions:\n1. Leak Repairs: Owner: Facilities Lead (M. Govinden) | Target: 10 Aug | Status: Completed | Evidence: Plumbing repair sign-off log.\n2. Kitchen Sorting: Owner: Head Chef (L. Seetaram) | Target: 20 Aug | Status: In Progress | Evidence: Bin audit photo & staff briefing roster.\n3. Amenities Switch: Owner: Procurement Officer (R. Ramtohul) | Target: 30 Aug | Status: Blocked | Dependency: Supplier contract review | Escalation: General Manager."
      },
      {
        id: "ta5-d1",
        type: "decision_scenario",
        position: 3,
        decisionIntro: "Applied Commercial Property Decision:",
        decisionPrompt: "A property management team wants to eliminate air conditioning waste caused by open doors. The current register entry reads: 'Security and Facilities to solve door problem — ongoing.' Security briefed guards, but Facilities has not checked door closer hardware and Tenant Relations was not involved. What is the correct tracking fix?",
        decisionChoices: [
          { label: "Split into 2 clear actions: (1) Facilities Lead to inspect/adjust door closers by 15 Aug; (2) Tenant Manager to issue door policy guidance by 20 Aug, with single owners and target dates", correct: true, feedback: "Outstanding! Splitting vague group entries into single-owner actions with specific deliverables and deadlines restores operational control." },
          { label: "Leave the entry as 'Security and Facilities — ongoing' because both teams are working on it", correct: false, feedback: "NEVER leave shared group entries with 'ongoing' status; shared ownership leads to zero accountability." },
          { label: "Mark the action 'Completed' because Security guards were briefed", correct: false, feedback: "Incorrect. Briefing guards is a supporting activity, not proof of door hardware or tenant policy resolution." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Tracking Commitment & Badge",
    minutes: 2,
    content: "Select your daily action-tracking commitments and complete the course.",
    blocks: [
      { id: "ta6-h1", type: "heading", position: 1, headingText: "Action Tracking Commitment" },
      { id: "ta6-t1", type: "short_text", position: 2, bodyText: "Select the action-tracking commitments you pledge to practice in your workplace." },
      {
        id: "ta6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your tracking commitments (choose at least one):",
        commitmentOptions: [
          { value: "assign-single-owner", label: "Assign exactly one primary accountable owner to every workplace action statement", description: "Prevent shared ambiguity and vague team assignments." },
          { value: "require-completion-evidence", label: "Attach or cite verifiable evidence before marking any action as completed", description: "Ensure status updates are backed by factual proof." },
          { value: "escalate-blocked-status", label: "Mark blocked actions accurately and escalate resource or authority barriers promptly", description: "Surface delays to management early." },
          { value: "preserve-change-history", label: "Preserve target date change history and progress update notes transparently", description: "Maintain an honest audit trail." }
        ]
      },
      {
        id: "ta6-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Practical Disclaimer",
        bodyText: "DISCLAIMER: This course provides operational guidance for tracking workplace sustainability actions. It does not constitute independent assurance, environmental accreditation, legal auditing, or statutory compliance certification."
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "Why is a vague register entry like 'Improve recycling — ongoing' ineffective?",
    options: [
      "Because it lacks a specific task deliverable, a single accountable owner, a target date, and verifiable completion evidence",
      "Because recycling is prohibited in commercial workplaces",
      "Because action registers must only contain financial statistics",
      "Because ongoing tasks can never be recorded in computers"
    ],
    correct: 0,
    correctExplanation: "Vague entries lack single-owner accountability, specific deliverables, target dates, and evidence.",
    incorrectExplanation: "Incorrect. Trackable actions require specific deliverables, single owners, deadlines, and evidence."
  },
  {
    order: 2,
    question: "What does the 'R' in the TRACE action framework stand for?",
    options: [
      "Record one owner & target date (assign single accountability and a realistic deadline)",
      "Remove all overdue tasks from the spreadsheet",
      "Refuse to answer manager questions about delays",
      "Replace internal staff with external contractors"
    ],
    correct: 0,
    correctExplanation: "R = Record one owner & target date, ensuring clear personal accountability.",
    incorrectExplanation: "Incorrect. R = Record one owner & target date."
  },
  {
    order: 3,
    question: "Why should an action statement have only ONE primary accountable owner?",
    options: [
      "Because when multiple owners or entire departments are assigned, no single individual feels accountable for follow-through",
      "Because only managers are allowed to work on actions",
      "Because software spreadsheets can only store one name per row",
      "Because supporting contributors are forbidden from helping"
    ],
    correct: 0,
    correctExplanation: "Single ownership prevents shared ambiguity; supporting roles can contribute without diluting ownership.",
    incorrectExplanation: "Incorrect. Assigning one primary owner ensures clear accountability for completion."
  },
  {
    order: 4,
    question: "In the visual action register board (`visual-sustainability-action-register.png`), what weakness is highlighted by the red arrow?",
    options: [
      "An overdue action assigned to two owners (Sarah J. & Rajiv M.) without single-owner clarity or evidence verification",
      "A completed action that cost too much money",
      "A missing building floor plan map",
      "An action written in the wrong font style"
    ],
    correct: 0,
    correctExplanation: "The highlighted entry shows an overdue task with dual ownership, creating accountability ambiguity.",
    incorrectExplanation: "Incorrect. It highlights an overdue task assigned to two owners without evidence."
  },
  {
    order: 5,
    question: "What is the difference between an ACTIVITY and COMPLETION EVIDENCE?",
    options: [
      "An activity is a task step performed (e.g. sending a quote request email); completion evidence is factual proof that the deliverable was achieved (e.g. signed supplier contract)",
      "An activity is an official fine; completion evidence is a verbal rumor",
      "Activity and completion evidence mean the exact same thing",
      "An activity is performed by computers; evidence is performed by humans"
    ],
    correct: 0,
    correctExplanation: "Activities are task steps performed; completion evidence is factual proof that the deliverable is finished.",
    incorrectExplanation: "Incorrect. Activity = task step performed; Completion Evidence = factual proof of deliverable."
  },
  {
    order: 6,
    question: "When should an action status be marked as BLOCKED?",
    options: [
      "When progress cannot continue due to an external dependency, resource constraint, or unapproved budget requiring escalation",
      "Whenever an action is completed ahead of schedule",
      "When an employee goes on annual leave for two days",
      "When the action register file is locked for editing"
    ],
    correct: 0,
    correctExplanation: "Mark 'Blocked' when external dependencies or resource constraints prevent progress, triggering escalation.",
    incorrectExplanation: "Incorrect. Blocked status indicates an unresolved barrier requiring escalation."
  },
  {
    order: 7,
    question: "Why is silently replacing an overdue target date with a new future date without explanation a high-risk mistake?",
    options: [
      "Because it conceals operational delays and destroys change history, preventing management from understanding root causes",
      "Because target dates can never be changed under any circumstances",
      "Because spreadsheets automatically crash when dates are edited",
      "Because target dates are legally binding court orders"
    ],
    correct: 0,
    correctExplanation: "Target dates can be revised, but the change history and reason for delay must be preserved transparently.",
    incorrectExplanation: "Incorrect. Revisions require transparent notes to preserve change history and record reasons for delay."
  },
  {
    order: 8,
    question: "What should a sustainability committee coordinator do when an action owner reports an unmanaged budget barrier?",
    options: [
      "Update status to 'Blocked', record the specific budget barrier note, and escalate to the Team Sponsor for management review",
      "Mark the action 'Completed' so the register looks good",
      "Delete the action row from the database",
      "Tell the action owner to pay for the equipment personally"
    ],
    correct: 0,
    correctExplanation: "Update status to Blocked, record the barrier note, and escalate to the Sponsor for management review.",
    incorrectExplanation: "Incorrect. Record Blocked status and escalate to the Sponsor for management decision."
  },
  {
    order: 9,
    question: "How does ELH-17 (Tracking Actions) connect to ELH-18 (Data Collection)?",
    options: [
      "ELH-17 identifies what evidence is needed and links it to action records; ELH-18 teaches how to collect and validate that quantitative data",
      "ELH-17 replaces ELH-18 so data collection is no longer necessary",
      "ELH-17 is for external auditors; ELH-18 is for receptionists",
      "There is no connection between tracking actions and data collection"
    ],
    correct: 0,
    correctExplanation: "ELH-17 specifies evidence requirements on action logs; ELH-18 teaches technical data collection protocols.",
    incorrectExplanation: "Incorrect. ELH-17 links evidence to tasks; ELH-18 teaches how to collect and validate data."
  },
  {
    order: 10,
    question: "What is the primary takeaway of the TRACE Action Framework?",
    options: [
      "Applying TRACE (Turn to action, Record owner/date, Add updates/evidence, Check status, Escalate delays) ensures workplace actions are delivered transparently",
      "Action tracking is optional and has no impact on project completion",
      "Actions should be marked complete as soon as an email is sent",
      "Action registers should be kept secret from department heads"
    ],
    correct: 0,
    correctExplanation: "The TRACE framework provides disciplined recordkeeping that turns decisions into verified workplace results.",
    incorrectExplanation: "Incorrect. TRACE provides the structure needed for evidence-backed action delivery."
  }
];

export async function ensureTrackingSustainabilityActionsCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 17 by courseCode "ELH-17" or slug
      let course = null;

      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-17"))
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
        throw new Error("Course ELH-17 / tracking-sustainability-actions-and-progress not seeded by catalogue skeletons bootstrap!");
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
        logger.info({ courseId, slug: COURSE_SLUG }, "Tracking Sustainability Actions course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course ELH-17. Re-seeding course content, lessons, and 10 quiz questions transactionally...");

      // 4. Resolve next recommended course dynamically (ELH-18 or null if not yet seeded)
      const [course18] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.slug, "sustainability-data-collection"))
        .limit(1);
      const nextCourseId = course18 ? course18.id : null;

      // 5. Update course record metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-17",
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

      // 8. Enforce prerequisite entries in coursePrerequisitesTable (ELH-12, ELH-13, ELH-14, ELH-15, ELH-16 -> ELH-17)
      const prereqs = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(inArray(coursesTable.slug, [
          "final-sustainability-certification",
          "sustainability-action-planning",
          "setting-departmental-sustainability-goals",
          "building-workplace-sustainability-team",
          "communicating-sustainability-at-work"
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
          icon: "check-circle",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 22,
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

      logger.info({ courseId, slug: COURSE_SLUG }, "Tracking Sustainability Actions course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Tracking Sustainability Actions course");
  }
}
