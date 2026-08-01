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

const COURSE_SLUG = "sustainability-roles-responsibilities-and-accountability";
const COURSE_TITLE = "Sustainability Roles, Responsibilities and Accountability";
const BADGE_SLUG = "sustainability-accountability-practitioner";
const SEED_NAME = "sustainability-roles-accountability-v2";

const COURSE_META = {
  courseCode: "ELH-20",
  description:
    "Learn how sustainability responsibilities are assigned, supported, approved, and escalated in a workplace, ensuring clear individual accountability and internal contractor oversight.",
  fullDescription:
    "Broad collective responsibility without named ownership creates accountability gaps. This course enables workplace teams to assign one clear accountable owner to every sustainability action, distinguish supporting from approving roles, manage contractor oversight internally, enforce separation of duties, and preserve written handovers during personnel changes.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainability-roles-responsibilities-and-accountability.jpg",
  intendedRoles: ["employees", "supervisors", "line managers", "department heads", "green team members", "facilities and operations staff", "HR and procurement teams", "ESG or compliance support staff", "senior managers"],
  learningObjectives: [
    "Distinguish responsibility (task execution) from final accountability (answerable for progress and results).",
    "Assign one clear accountable owner to every workplace sustainability action.",
    "Identify supporting, reviewing, and approving roles across departments.",
    "Apply the CLEAR operational framework (Choose owner, Link authority, Explain roles, Agree evidence & escalation, Record decisions).",
    "Maintain internal company oversight when contracting work out to third-party suppliers."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations! You have completed Sustainability Roles, Responsibilities and Accountability. You can now establish single accountable ownership, separate supporting from approving roles, manage contractor oversight, and enforce separation of duties across workplace actions.",
  badgeName: "Sustainability Accountability Practitioner",
  badgeDescription:
    "Awarded for demonstrating operational mastery of workplace sustainability governance, single accountable ownership, contractor oversight, and clear decision escalation.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Broad Involvement Is Not Single Accountability",
    minutes: 3,
    content: "Understand why assigning actions to 'everyone' creates accountability gaps and how naming a single accountable owner ensures progress.",
    blocks: [
      { id: "ra1-h1", type: "heading", position: 1, headingText: "Avoid the Accountability Gap" },
      { id: "ra1-t1", type: "short_text", position: 2, bodyText: "A commercial property meeting assigns responsibility for reducing after-hours electricity use. The action register states: 'Security, Facilities, Finance and all department managers to ensure electricity use is reduced.' No single owner is named. Security believes Facilities is responsible because it involves equipment. Facilities believes department managers control staff behavior. Finance thinks it only checks bills. Managers assume Security switches everything off. At the next review, consumption has not improved and no one can explain what was done." },
      { id: "ra1-k1", type: "key_message", position: 3, headingText: "The Accountability Rule", bodyText: "When 'everyone' owns an action, no one is accountable. Many people may contribute, but one named role must remain answerable for progress, evidence, and review." },
      {
        id: "ra1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Fixing an Unclear Action Assignment:",
        decisionPrompt: "An office action plan lists 'All Employees' as the owner for setting printer defaults to double-sided. How should the team fix this assignment?",
        decisionChoices: [
          { label: "Assign the Office Administrator as the single accountable owner, with IT supporting technical deployment and department leads communicating the change", correct: true, feedback: "Correct! Naming one accountable owner with defined supporting roles establishes clear, actionable responsibility." },
          { label: "Add the Sustainability Committee as a co-owner alongside All Employees", correct: false, feedback: "Incorrect. Adding more collective groups without a single named owner worsens accountability gaps." },
          { label: "Remove the action from the plan so no one is bothered", correct: false, feedback: "Incorrect. Deleting necessary actions avoids responsibility rather than establishing governance." }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Why Clear Roles Matter & Essential Vocabulary",
    minutes: 3,
    content: "Explore the operational benefits of clear governance and master 50+ roles and accountability terms.",
    blocks: [
      { id: "ra2-h1", type: "heading", position: 1, headingText: "Operational Decision Rights & Vocabulary" },
      { id: "ra2-t1", type: "short_text", position: 2, bodyText: "Clear role definition speeds up decision making, prevents duplicated effort, ensures contractor work is checked, and provides seamless continuity when personnel change." },
      {
        id: "ra2-k1",
        type: "key_message",
        position: 3,
        headingText: "Core Roles & Governance Vocabulary",
        bodyText: "• Responsibility vs Accountability: Responsibility = doing the task; Accountability = final answerability for outcome and evidence.\n• Authority & Decision Rights: Power to authorize budget, approve actions, or enforce procedures.\n• Action Owner: Named role answerable for driving a specific workplace action to completion.\n• Supporting Role vs Approver: Supporting = provides labor/data; Approver = formal sign-off authority.\n• Delegation vs Abdication: Assigning a task while maintaining oversight vs walking away without tracking.\n• Internal Contractor Oversight: Retaining an internal company owner to verify external supplier work.\n• Separation of Duties: Splitting creation, verification, and approval roles to prevent errors and self-approval."
      },
      {
        id: "ra2-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Roles & Governance Standards)",
        bodyText: "Top management must ensure that the responsibilities and authorities for relevant roles are assigned, communicated, and understood within the organization.\n\nManagement-system standards (ISO 14001 Clause 5.3 & ISO 9001 Clause 5.3) require clear role definitions to ensure environmental management processes deliver intended outputs without creating operational ambiguity."
      }
    ]
  },
  {
    order: 2,
    title: "The CLEAR Operational Framework",
    minutes: 4,
    content: "Master the 5-step CLEAR framework for establishing workplace sustainability governance.",
    blocks: [
      { id: "ra3-h1", type: "heading", position: 1, headingText: "The CLEAR Operational Framework" },
      { id: "ra3-t1", type: "short_text", position: 2, bodyText: "Use the CLEAR framework to assign, communicate, and track workplace sustainability roles:" },
      {
        id: "ra3-k1",
        type: "key_message",
        position: 3,
        headingText: "CLEAR Framework Breakdown",
        bodyText: "• C — Choose one accountable owner: Name a specific role (e.g. Facilities Lead) for every action.\n• L — Link responsibilities to authority & resources: Ensure the owner has time, access, and budget.\n• E — Explain supporting, reviewing & approving roles: Define who contributes, checks, and signs off.\n• A — Agree evidence, deadlines & escalation: Specify required proof files, target dates, and blocked routes.\n• R — Record decisions, handovers & follow-up: Document assignments in registers and update on departure."
      },
      {
        id: "ra3-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Practice: Delegation & Handover",
        decisionPrompt: "A facilities coordinator who owns the rainwater tank maintenance project goes on 4 weeks leave. What is the correct handover procedure?",
        decisionChoices: [
          { label: "Brief the temporary covering officer, update the action register with temporary contact details, and record open deadlines and evidence files", correct: true, feedback: "Correct! Formal handovers preserve action continuity and prevent open projects from stalling during leave." },
          { label: "Leave the project unmonitored until the coordinator returns", correct: false, feedback: "Incorrect. Abandoning actions during leave causes missed deadlines and unmonitored contractor work." },
          { label: "Transfer final legal liability for the building's water system to the temporary officer", correct: false, feedback: "Incorrect. Task coverage does not alter corporate legal liability structures." }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Visual Governance Inspection & High-Risk Mistakes",
    minutes: 4,
    content: "Inspect a projected roles and accountability matrix board and review critical safeguards.",
    blocks: [
      { id: "ra4-h1", type: "heading", position: 1, headingText: "Visual Roles & Governance Matrix Inspection" },
      { id: "ra4-t1", type: "short_text", position: 2, bodyText: "Examine the meeting room whiteboard (`visual-sustainability-roles-accountability.png`). Observe how red sticky notes highlight governance defects: 'ALL DEPARTMENTS' listed as sole owner, two equal accountable owners with split decision rights, a contractor listed as sole owner without internal company oversight, a former departed employee still assigned, a missing capital expense approver, a blank escalation route, and the same person creating, validating, and approving evidence." },
      {
        id: "ra4-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-sustainability-roles-accountability.png",
        caption: "Workplace Sustainability Governance & Roles Matrix: Displaying unclear ownership, missing approvers, contractor sole ownership, and self-approval defects.",
        imageAlt: "Realistic photograph of a Mauritian commercial workplace office room with a whiteboard titled Workplace Sustainability Governance & Roles Matrix showing highlighted defects like All Departments as owner, missing approvers, contractor sole ownership, and self-approval."
      },
      {
        id: "ra4-k1",
        type: "key_message",
        position: 4,
        headingText: "High-Risk Governance Mistakes to Avoid",
        bodyText: "• DO NOT assign actions to 'everyone' or 'all staff' without a named accountable lead.\n• DO NOT list an external contractor as the sole owner without an internal company supervisor.\n• DO NOT leave departed employees as active owners on registers.\n• DO NOT allow the same person to create data, validate accuracy, and sign off completion without checks.\n• DO NOT confuse green team advisory involvement with operational line management authority."
      }
    ]
  },
  {
    order: 4,
    title: "Worked Mauritian Scenario & Applied Decision",
    minutes: 2,
    content: "Study a Grand Baie resort governance scenario and solve an applied contractor oversight decision.",
    blocks: [
      { id: "ra5-h1", type: "heading", position: 1, headingText: "Worked Scenario: Grand Baie Resort Water Programme" },
      {
        id: "ra5-w1",
        type: "workplace_example",
        position: 2,
        headingText: "Clear Governance & Role Assignment Log",
        bodyText: "A Grand Baie resort structures its water conservation programme across 5 roles:\n1. Accountable Owner: Facilities Manager (drives project, reports monthly, manages budget).\n2. Supporting Roles: Housekeeping Supervisor (checks guest tap aerators) & Maintenance Tech (repairs leaks).\n3. Internal Data Owner: Sustainability Coordinator (logs meter readings & collects weigh-slips).\n4. Approver: General Manager (authorizes capital repairs over MUR 50,000).\n5. External Contractor Oversight: Plumbing Contractor performs pipe lining; Facilities Manager checks completion certificates before invoice approval."
      },
      {
        id: "ra5-d1",
        type: "decision_scenario",
        position: 3,
        decisionIntro: "Applied Contractor Oversight Decision:",
        decisionPrompt: "A hotel's external waste contractor repeatedly submits incomplete waste collection receipts. The sustainability coordinator asks the contractor to fix them, but no internal manager owns the vendor contract. What is the correct governance resolution?",
        decisionChoices: [
          { label: "Assign the Procurement / Contract Manager as the internal accountable owner to enforce vendor compliance, while the Sustainability Coordinator verifies receipts", correct: true, feedback: "Outstanding! Naming an internal manager with contract authority ensures external supplier compliance can be enforced." },
          { label: "Make the external waste contractor the sole accountable owner of the company's waste register", correct: false, feedback: "NEVER delegate internal company accountability to an external contractor." },
          { label: "Mark the waste tracking action complete because the vendor was emailed", correct: false, feedback: "Incorrect. Contacting a supplier does not resolve incomplete compliance records." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Accountability Commitment & Badge",
    minutes: 2,
    content: "Select your daily governance commitments and complete the course.",
    blocks: [
      { id: "ra6-h1", type: "heading", position: 1, headingText: "Accountability Commitment" },
      { id: "ra6-t1", type: "short_text", position: 2, bodyText: "Select the governance practices you pledge to apply in your workplace." },
      {
        id: "ra6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your governance commitments (choose at least one):",
        commitmentOptions: [
          { value: "single-accountable-owner", label: "Assign one named accountable owner to every workplace sustainability action", description: "Eliminate diffusion of responsibility." },
          { value: "verify-authority-and-budget", label: "Ensure assigned action owners have sufficient authority, time, and budget resources", description: "Match responsibility with actual power." },
          { value: "internal-contractor-oversight", label: "Maintain internal company oversight and check verification proof for contractor-delivered work", description: "Prevent unmonitored supplier reliance." },
          { value: "formal-written-handovers", label: "Record formal written handovers when action owners change roles or go on leave", description: "Preserve project continuity." }
        ]
      },
      {
        id: "ra6-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Practical Disclaimer",
        bodyText: "DISCLAIMER: This course provides practical workplace guidance on sustainability roles and accountability. It does not provide legal advice, statutory governance certification, independent assurance, or confirmation that an organization has met all regulatory or management-system requirements."
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "Why is assigning a sustainability action to 'All Staff' or 'Everyone' a major governance flaw?",
    options: [
      "Because broad collective assignments lead to diffusion of responsibility where no individual feels answerable for driving progress or saving records",
      "Because employees are not allowed to participate in sustainability",
      "Because sustainability actions must only be performed by external consultants",
      "Because spreadsheet software cannot handle more than 5 names"
    ],
    correct: 0,
    correctExplanation: "Collective assignments without a single named lead cause diffusion of responsibility and unmonitored actions.",
    incorrectExplanation: "Incorrect. Broad assignments dilute accountability; a single named owner must drive progress."
  },
  {
    order: 2,
    question: "What does the 'C' in the CLEAR operational framework stand for?",
    options: [
      "Choose one accountable owner (name a specific role answerable for driving the action)",
      "Cancel all departmental sustainability meetings",
      "Copy all emails to external news outlets",
      "Charge employees financial penalties for unread policies"
    ],
    correct: 0,
    correctExplanation: "C = Choose one accountable owner for every workplace action.",
    incorrectExplanation: "Incorrect. C = Choose one accountable owner."
  },
  {
    order: 3,
    question: "What is the fundamental difference between RESPONSIBILITY and ACCOUNTABILITY?",
    options: [
      "Responsibility means performing the task execution; Accountability means final answerability for the outcome, evidence, and review",
      "Responsibility applies to full-time staff; Accountability applies to part-time staff",
      "Responsibility is used in corporate offices; Accountability is used in factories",
      "Responsibility and Accountability are exact synonyms in organizational management"
    ],
    correct: 0,
    correctExplanation: "Responsibility = performing work; Accountability = final answerability for results and evidence.",
    incorrectExplanation: "Incorrect. Responsibility is task execution; Accountability is final answerability."
  },
  {
    order: 4,
    question: "In the visual governance matrix board (`visual-sustainability-roles-accountability.png`), why is listing a contractor as sole owner of a compliance task a defect?",
    options: [
      "Because contracting out work does not contract out internal company oversight; a named internal owner must verify supplier delivery",
      "Because contractors are forbidden from using whiteboards",
      "Because contractors never complete their assigned tasks",
      "Because waste contractors do not work in commercial buildings"
    ],
    correct: 0,
    correctExplanation: "Companies must retain internal accountable ownership to verify contractor evidence and enforce contract standards.",
    incorrectExplanation: "Incorrect. Contracting out work does not eliminate the need for an internal company owner."
  },
  {
    order: 5,
    question: "What should happen when an assigned action owner transfers to a new department or leaves the company?",
    options: [
      "Perform a formal written handover, update the action register with a new named owner, and transfer project files",
      "Leave the departed employee listed as owner indefinitely",
      "Delete the entire action history from the database",
      "Assume the action is automatically completed"
    ],
    correct: 0,
    correctExplanation: "Personnel changes require updating ownership records and transferring files to preserve continuity.",
    incorrectExplanation: "Incorrect. Perform a formal handover and assign a new active owner in the register."
  },
  {
    order: 6,
    question: "Why is assigning an employee responsibility for a project without providing authority or budget resources ineffective?",
    options: [
      "Because without authority to approve changes or access budget, the owner cannot overcome operational obstacles or enforce procedures",
      "Because employees prefer not to have budget access",
      "Because project targets can be met without any resources",
      "Because authority is only required for senior directors"
    ],
    correct: 0,
    correctExplanation: "Accountable owners must be equipped with sufficient decision rights, time, and budget resources to succeed.",
    incorrectExplanation: "Incorrect. Responsibility without authority or resources leads to blocked, unexecutable actions."
  },
  {
    order: 7,
    question: "What is the purpose of SEPARATION OF DUTIES in sustainability data logging and approvals?",
    options: [
      "Ensuring the person preparing data or claims is not the sole verifier and approver, preventing self-approval and undetected errors",
      "Keeping employees in separate office rooms during working hours",
      "Preventing finance staff from talking to facilities staff",
      "Doubling the length of all team meetings"
    ],
    correct: 0,
    correctExplanation: "Separation of duties splits creation, verification, and approval roles to ensure data integrity and prevent self-approval.",
    incorrectExplanation: "Incorrect. Separation of duties prevents self-approval and ensures independent review."
  },
  {
    order: 8,
    question: "What role does a Sustainability Coordinator play compared to a Department Manager who owns an action?",
    options: [
      "The Coordinator facilitates, advises, and tracks overall progress; the Department Manager has line authority to direct staff and enforce procedures",
      "The Coordinator makes all operational business decisions for every department",
      "The Department Manager only attends social events",
      "The Coordinator is legally liable for all company actions"
    ],
    correct: 0,
    correctExplanation: "Coordinators advise and track; Line Managers hold operational authority to direct staff and execute actions.",
    incorrectExplanation: "Incorrect. Coordinators provide advisory support; Line Managers hold operational execution authority."
  },
  {
    order: 9,
    question: "How does ELH-20 (Roles and Accountability) connect to ELH-21 (Employee Sustainability Engagement)?",
    options: [
      "ELH-20 defines governance structures and decision ownership; ELH-21 builds widespread employee participation and engagement within those role boundaries",
      "ELH-20 replaces employee participation completely",
      "ELH-20 is for legal advisors; ELH-21 is for interns only",
      "There is no relationship between roles and engagement"
    ],
    correct: 0,
    correctExplanation: "ELH-20 establishes clear role boundaries; ELH-21 engages employees effectively within that clear framework.",
    incorrectExplanation: "Incorrect. ELH-20 establishes clear governance boundaries; ELH-21 engages employees within them."
  },
  {
    order: 10,
    question: "What is the primary takeaway of the CLEAR Operational Framework?",
    options: [
      "Applying CLEAR (Choose owner, Link authority, Explain roles, Agree evidence & escalation, Record decisions) ensures transparent governance and follow-through",
      "Role assignments should be kept secret from employees",
      "Green teams should replace all department managers",
      "External contractors should make all internal company decisions"
    ],
    correct: 0,
    correctExplanation: "CLEAR provides structured discipline for workplace governance, role clarity, and accountable decision-making.",
    incorrectExplanation: "Incorrect. CLEAR ensures transparent workplace governance and accountable follow-through."
  }
];

export async function ensureSustainabilityRolesAccountabilityCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 20 by courseCode "ELH-20" or slug
      let course = null;

      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-20"))
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
        throw new Error("Course ELH-20 / sustainability-roles-responsibilities-and-accountability not seeded by catalogue skeletons bootstrap!");
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
        logger.info({ courseId, slug: COURSE_SLUG }, "Workplace Sustainability Team course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course ELH-20. Re-seeding course content, lessons, and 10 quiz questions transactionally...");

      // 4. Resolve next recommended course dynamically (ELH-21 or null if not yet seeded)
      const [course21] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.slug, "employee-sustainability-engagement-and-culture"))
        .limit(1);
      const nextCourseId = course21 ? course21.id : null;

      // 5. Update course record metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-20",
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

      // 8. Enforce prerequisite entries in coursePrerequisitesTable (ELH-12 through ELH-19 -> ELH-20)
      const prereqs = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(inArray(coursesTable.slug, [
          "final-sustainability-certification",
          "sustainability-action-planning",
          "setting-departmental-sustainability-goals",
          "building-workplace-sustainability-team",
          "communicating-sustainability-at-work",
          "tracking-sustainability-actions-and-progress",
          "sustainability-data-collection-and-evidence",
          "reviewing-sustainability-performance-and-corrective-action"
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
          icon: "users",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 25,
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

      logger.info({ courseId, slug: COURSE_SLUG }, "Workplace Sustainability Team course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Sustainability Roles and Accountability course");
  }
}
