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

const COURSE_SLUG = "building-workplace-sustainability-team";
const COURSE_TITLE = "Building a Workplace Sustainability Team";
const BADGE_SLUG = "workplace-sustainability-team-builder";
const SEED_NAME = "workplace-sustainability-team-v2";

const COURSE_META = {
  courseCode: "ELH-15",
  description:
    "Learn how to establish and operate a practical cross-functional workplace sustainability team with clear mandates, roles, meeting agendas, and escalation protocols.",
  fullDescription:
    "A workplace sustainability team brings departments together to turn company sustainability priorities into coordinated actions. This course teaches employees, managers, and committee representatives how to establish a practical cross-functional team. Learners will define a formal team mandate, select appropriate representatives across operations, assign distinct operational roles (sponsor, chair, coordinator, member, action owner, specialist adviser), run focused action-oriented meetings, and escalate barriers effectively.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/building-workplace-sustainability-team.jpg",
  intendedRoles: ["employees", "departmental representatives", "managers", "HR teams", "operations leads", "sustainability coordinators"],
  learningObjectives: [
    "Explain the purpose, mandate, and operational boundaries of a workplace sustainability team.",
    "Select balanced cross-functional team membership representing operational departments.",
    "Distinguish operational roles: Sponsor, Chair, Coordinator/Secretary, Team Member, Action Owner, and Specialist Adviser.",
    "Apply the TEAM framework (Terms & purpose, Engage right roles, Assign decisions/actions, Monitor & escalate).",
    "Run productive meeting agendas that record clear decisions, assigned owners, target dates, and evidence requirements."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations! You have passed Building a Workplace Sustainability Team. You can now establish team terms of reference, select balanced departmental representation, run structured action meetings, and maintain transparent action registers.",
  badgeName: "Workplace Sustainability Team Member",
  badgeDescription:
    "Awarded for demonstrating practical understanding of workplace sustainability team mandates, composition, operational roles, meeting structures, and action ownership.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "A Team Needs More Than Enthusiasm",
    minutes: 3,
    content: "Understand why informal enthusiasm without an operating structure fails to produce workplace results.",
    blocks: [
      { id: "st1-h1", type: "heading", position: 1, headingText: "Structure Turns Enthusiasm into Results" },
      { id: "st1-t1", type: "short_text", position: 2, bodyText: "A company forms a 'green committee' after staff raise concerns about waste and electricity draw. The first meeting includes 14 people from different departments. Ideas are discussed, but no one knows who approves budgets, no action owners are named, and no deadlines are set. At the next meeting, the same issues return. Without a formal mandate and structure, a team becomes a discussion forum rather than an operational working group." },
      { id: "st1-k1", type: "key_message", position: 3, headingText: "Core Operating Principle", bodyText: "A sustainability team connects departments, coordinates agreed actions, and monitors evidence. The team does not replace management authority or grant unlimited spending rights." },
      {
        id: "st1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Evaluating Team Function:",
        decisionPrompt: "What turns an informal discussion group into a functioning workplace sustainability team?",
        decisionChoices: [
          { label: "A clear mandate, cross-functional representation, named action owners, and transparent action tracking", correct: true, feedback: "Correct! Defining purpose, ownership, and tracking creates operational accountability." },
          { label: "Inviting 30 employees to attend monthly open brainstorms without agendas", correct: false, feedback: "Incorrect. Large unstructured brainstorms rarely produce accountable workplace actions." },
          { label: "Giving the committee power to change company policies without management approval", correct: false, feedback: "Incorrect. Sustainability teams operate within normal corporate governance and management approval structures." }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Why a Sustainability Team Matters & Core Vocabulary",
    minutes: 3,
    content: "Explore how sustainability teams bridge departments and master core team vocabulary.",
    blocks: [
      { id: "st2-h1", type: "heading", position: 1, headingText: "Cross-Functional Value & Vocabulary" },
      { id: "st2-t1", type: "short_text", position: 2, bodyText: "A cross-functional team breaks down departmental silos. It helps Facilities coordinate energy routines with Operations, Procurement align eco-specifications with Kitchen/Housekeeping, and HR support staff training." },
      {
        id: "st2-k1",
        type: "key_message",
        position: 3,
        headingText: "Sustainability Team Vocabulary",
        bodyText: "• Mandate / Terms of Reference: The formal document defining team purpose, authority limits, and scope.\n• Sponsor: Executive or senior manager providing authority, budget guidance, and barrier removal.\n• Chair: Meeting leader who keeps discussions focused and ensures decisions are recorded.\n• Coordinator / Secretary: Organizes agendas, maintains the action register, and tracks deadlines.\n• Action Owner: Named individual responsible for delivering a specific task step.\n• Action Register: The central record listing tasks, owners, target dates, evidence, and status."
      },
      {
        id: "st2-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "According to ISO 14001 Environmental Management Systems and the UN Global Compact, organizations that establish a cross-functional sustainability team with a formal mandate, executive sponsor, and assigned action owners achieve over 70% higher project completion rates compared to informal working groups!"
      }
    ]
  },
  {
    order: 2,
    title: "The TEAM Operating Framework",
    minutes: 4,
    content: "Master the 4-step TEAM framework: Terms, Engage, Assign, Monitor.",
    blocks: [
      { id: "st3-h1", type: "heading", position: 1, headingText: "The TEAM Framework" },
      { id: "st3-t1", type: "short_text", position: 2, bodyText: "Use the TEAM framework to build and run an effective workplace sustainability committee:" },
      {
        id: "st3-k1",
        type: "key_message",
        position: 3,
        headingText: "TEAM Framework Breakdown",
        bodyText: "• T — Terms & purpose: Define why the team exists, what it covers, and what requires management approval.\n• E — Engage right roles: Include operational representatives across key departments and frontline voices.\n• A — Assign decisions & actions: Turn meeting discussion into recorded decisions, named owners, and deadlines.\n• M — Monitor & escalate: Review progress using evidence, resolve delays, and escalate unmanaged barriers."
      },
      {
        id: "st3-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Practice: Role Distinction",
        decisionPrompt: "What is the primary difference between a Team Sponsor and a Team Chair?",
        decisionChoices: [
          { label: "The Sponsor is a senior manager providing executive authority and barrier escalation; the Chair facilitates meetings and ensures decision focus", correct: true, feedback: "Correct! Sponsors provide management authority, while Chairs facilitate productive meetings." },
          { label: "The Sponsor takes minutes; the Chair pays for team lunches", correct: false, feedback: "Incorrect. Role definitions reflect governance and meeting facilitation." },
          { label: "Sponsor and Chair are identical roles that must always be held by the same person", correct: false, feedback: "Incorrect. They perform distinct governance and facilitation functions." }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Visual Meeting Board & High-Risk Mistakes",
    minutes: 4,
    content: "Inspect a realistic Mauritian sustainability team meeting board and review critical safeguards.",
    blocks: [
      { id: "st4-h1", type: "heading", position: 1, headingText: "Visual Sustainability Team Board Inspection" },
      { id: "st4-t1", type: "short_text", position: 2, bodyText: "Examine the Mauritian workplace meeting board below (`visual-workplace-sustainability-team.png`). Observe how the board clearly displays the Team Mandate, departmental Attendance (Facilities, Housekeeping, Kitchen, Procurement, HR, Frontline), Agenda, Decisions, Action Register (Owner, Target Date, Evidence), and Escalations." },
      {
        id: "st4-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-workplace-sustainability-team.png",
        caption: "Sustainability Team Board: Showing Mandate, Department Attendance, Agenda, Decisions, Action Register with named owners, target dates, and evidence.",
        imageAlt: "Realistic photograph of a Mauritian commercial workplace meeting room with a whiteboard titled Workplace Sustainability Team Meeting Board showing mandate, attendance list, agenda, decisions, and action register while committee members review tablet records."
      },
      {
        id: "st4-k1",
        type: "key_message",
        position: 4,
        headingText: "High-Risk Team Operating Mistakes to Avoid",
        bodyText: "• DO NOT launch a team without a written mandate or executive sponsor.\n• DO NOT allow attendance to swell beyond 8–10 core members without designated operational roles.\n• DO NOT record general discussion without defining specific decisions and named action owners.\n• DO NOT assign actions to entire departments (e.g. 'Procurement will handle it'); assign to one named owner.\n• DO NOT treat committee attendance as proof of environmental performance."
      }
    ]
  },
  {
    order: 4,
    title: "Worked Mauritian Scenario & Applied Decision",
    minutes: 2,
    content: "Study a Mauritian hotel sustainability team worked scenario and solve an applied commercial property decision.",
    blocks: [
      { id: "st5-h1", type: "heading", position: 1, headingText: "Worked Scenario: Hotel Sustainability Team" },
      {
        id: "st5-w1",
        type: "workplace_example",
        position: 2,
        headingText: "Mauritian Hotel Committee Operation",
        bodyText: "A 120-room resort forms a sustainability team:\n• Sponsor: General Manager (provides quarterly budget & receives escalations).\n• Chair: Operations Manager (facilitates monthly meetings).\n• Coordinator: HR Assistant (maintains Action Register & circulates minutes).\n• Members: Facilities Lead (M. Govinden), Housekeeping Supervisor (S. Peerbocos), Head Chef (L. Seetaram), Procurement Officer (R. Ramtohul), HR Lead (A. Sookon), Frontline Staff Rep (V. Atchia).\n• Outcome: Assigned 3 clear actions (Kitchen waste sorting, Housekeeping bottle switch, Facilities LED retrofit) with named owners and target dates."
      },
      {
        id: "st5-d1",
        type: "decision_scenario",
        position: 3,
        decisionIntro: "Applied Commercial Property Decision:",
        decisionPrompt: "A commercial building's sustainability team discovers that external doors are left open while air conditioning is running. The team includes Facilities, Security, Tenant Relations, and Cleaning. What is the most effective team response?",
        decisionChoices: [
          { label: "Assign Security to record open door locations/times, Facilities to check door closer hardware, Tenant Relations to brief tenant managers, and schedule progress review for the next meeting", correct: true, feedback: "Outstanding! Coordinating operational checks across Security, Facilities, and Tenant Relations with assigned owners solves the problem systematically." },
          { label: "Pass a resolution demanding that Security lock all building entrance doors permanently", correct: false, feedback: "NEVER compromise building access, emergency egress, or fire safety codes!" },
          { label: "Discuss the problem for 45 minutes and adjourn without assigning tasks or owners", correct: false, feedback: "Incorrect. Discussion without assigned actions leaves operational problems unsolved." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Team Operating Commitment & Badge",
    minutes: 2,
    content: "Select your daily sustainability team commitments and complete the course.",
    blocks: [
      { id: "st6-h1", type: "heading", position: 1, headingText: "Sustainability Team Operating Commitment" },
      { id: "st6-t1", type: "short_text", position: 2, bodyText: "Select the team operating commitments you pledge to practice in your workplace." },
      {
        id: "st6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your sustainability team commitments (choose at least one):",
        commitmentOptions: [
          { value: "establish-written-mandate", label: "Ensure every sustainability team operates under a clear, written mandate and sponsor", description: "Define authority boundaries and management support." },
          { value: "assign-named-action-owners", label: "Turn meeting decisions into recorded action items with named owners and deadlines", description: "Avoid vague task assignments to entire departments." },
          { value: "maintain-action-register", label: "Maintain a transparent action register backed by verifiable workplace evidence", description: "Keep task progress visible and reviewable." },
          { value: "escalate-unmanaged-barriers", label: "Escalate budget, authority, or resource constraints to executive sponsorship promptly", description: "Prevent stalled actions from circulating endlessly." }
        ]
      },
      {
        id: "st6-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Practical Disclaimer",
        bodyText: "DISCLAIMER: The TEAM Framework is an operational workplace committee guide. It does not constitute statutory corporate governance certification, legal environmental auditing, or HRDC statutory committee approval."
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "What is the primary purpose of a workplace sustainability team?",
    options: [
      "To coordinate cross-functional sustainability actions, share information, assign owners, and track progress",
      "To replace the authority of department managers and executive directors",
      "To spend company funds without financial approval",
      "To create publicity announcements without requiring evidence of operational results"
    ],
    correct: 0,
    correctExplanation: "A sustainability team coordinates cross-functional actions and tracks accountability across departments.",
    incorrectExplanation: "Incorrect. The team coordinates cross-functional progress within existing management structures."
  },
  {
    order: 2,
    question: "What does the 'T' in the TEAM operating framework stand for?",
    options: [
      "Terms & purpose (define why the team exists, what it covers, and its authority limits)",
      "Travel budget for committee members",
      "Technical certification for legal compliance",
      "Temporary task forces that meet once every three years"
    ],
    correct: 0,
    correctExplanation: "T = Terms & purpose, establishing the team's written mandate and operational boundaries.",
    incorrectExplanation: "Incorrect. T = Terms & purpose."
  },
  {
    order: 3,
    question: "What is the key role of a Sustainability Team SPONSOR?",
    options: [
      "A senior manager who provides executive authority, clarifies budget limits, and resolves escalated barriers",
      "The secretary who takes meeting notes and orders tea",
      "An external auditor who issues legal fines to departments",
      "A staff member who cleans waste sorting bins on weekends"
    ],
    correct: 0,
    correctExplanation: "The Sponsor is an executive manager who provides authority, budget guidance, and barrier removal.",
    incorrectExplanation: "Incorrect. The Sponsor provides management authority and handles escalations."
  },
  {
    order: 4,
    question: "In the visual meeting board (`visual-workplace-sustainability-team.png`), why is the ACTION REGISTER essential?",
    options: [
      "It records specific task items, assigned named owners, target dates, and required evidence to ensure accountability",
      "It lists employee salaries and personal home addresses",
      "It replaces the company's financial accounting system",
      "It is decorative and has no operational function"
    ],
    correct: 0,
    correctExplanation: "The Action Register tracks task items, named owners, deadlines, and evidence sources.",
    incorrectExplanation: "Incorrect. The Action Register maintains clear task ownership, target dates, and evidence."
  },
  {
    order: 5,
    question: "Why is assigning an action to 'Procurement' or 'The Team' a high-risk mistake?",
    options: [
      "Because when tasks are assigned to a department or group rather than one named owner, no single individual is accountable",
      "Because departments do not exist in commercial companies",
      "Because procurement officers are not allowed to join teams",
      "Because tasks must only be assigned to external consultants"
    ],
    correct: 0,
    correctExplanation: "Assigning tasks to groups creates ambiguity; every action must have one named individual owner.",
    incorrectExplanation: "Incorrect. Every action requires one named accountable owner."
  },
  {
    order: 6,
    question: "What distinguishes ELH-15 (Workplace Sustainability Team) from ELH-22 (Effective Green Teams)?",
    options: [
      "ELH-15 establishes team operating structure, mandate, roles, and agendas; ELH-22 focuses on team dynamics and long-term engagement",
      "ELH-15 is for hotels only; ELH-22 is for banks only",
      "ELH-15 replaces ELH-22 so green teams are no longer needed",
      "There is no difference between ELH-15 and ELH-22"
    ],
    correct: 0,
    correctExplanation: "ELH-15 teaches team structure and foundation; ELH-22 focuses on sustaining team dynamics over time.",
    incorrectExplanation: "Incorrect. ELH-15 covers team foundation/structure; ELH-22 covers long-term team effectiveness/dynamics."
  },
  {
    order: 7,
    question: "What should a committee Chair do if a meeting discussion becomes stuck on an unresolvable budget constraint?",
    options: [
      "Record the constraint, assign a member to gather cost estimates, and escalate to the Team Sponsor for management review",
      "Argue for two hours until everyone agrees",
      "Approve corporate spending without authority",
      "Cancel the sustainability team permanently"
    ],
    correct: 0,
    correctExplanation: "Record the barrier, gather factual evidence, and escalate to the executive Sponsor for management decision.",
    incorrectExplanation: "Incorrect. Factual evidence should be gathered and escalated to the Sponsor."
  },
  {
    order: 8,
    question: "Which operational role is responsible for facilitating meetings and keeping discussions focused on agenda decisions?",
    options: [
      "Team Chair",
      "Specialist Adviser",
      "Frontline Staff Representative",
      "External Auditor"
    ],
    correct: 0,
    correctExplanation: "The Team Chair facilitates meetings and ensures discussions remain focused on agenda items and decisions.",
    incorrectExplanation: "Incorrect. The Team Chair facilitates meetings and maintains focus."
  },
  {
    order: 9,
    question: "Why should specialist advisers (e.g. Health & Safety Lead, Legal Counsel) be invited to specific team meetings?",
    options: [
      "To provide expert guidance on technical, safety, or legal requirements when specific actions affect those areas",
      "To take permanent ownership of all sustainability tasks",
      "To replace the General Manager on the board",
      "To prevent frontline staff from speaking"
    ],
    correct: 0,
    correctExplanation: "Specialists provide technical and safety guidance when specific operational actions require compliance input.",
    incorrectExplanation: "Incorrect. Specialists provide expert input on specific technical or safety matters."
  },
  {
    order: 10,
    question: "What is the primary takeaway of the TEAM Operating Framework?",
    options: [
      "Structured team operating practices (TEAM) enable cross-functional committees to translate corporate ambitions into owned workplace actions",
      "Sustainability teams should meet without agendas or recorded minutes",
      "Enthusiasm alone is sufficient to run complex commercial projects",
      "Committees are only formed to create promotional marketing posters"
    ],
    correct: 0,
    correctExplanation: "The TEAM framework provides the structure needed to convert corporate priorities into owned, reviewable actions.",
    incorrectExplanation: "Incorrect. The TEAM framework provides structure for cross-functional workplace action."
  }
];

export async function ensureWorkplaceSustainabilityTeamCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 15 by courseCode "ELH-15" or slug
      let course = null;

      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-15"))
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
        throw new Error("Course ELH-15 / building-workplace-sustainability-team not seeded by catalogue skeletons bootstrap!");
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

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course ELH-15. Re-seeding course content, lessons, and 10 quiz questions transactionally...");

      // 4. Resolve next recommended course dynamically (ELH-16 or null if not yet seeded)
      const [course16] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.slug, "workplace-sustainability-communication"))
        .limit(1);
      const nextCourseId = course16 ? course16.id : null;

      // 5. Update course record metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-15",
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

      // 8. Enforce prerequisite entries in coursePrerequisitesTable (ELH-12, ELH-13, ELH-14 -> ELH-15)
      const prereqs = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(inArray(coursesTable.slug, [
          "final-sustainability-certification",
          "sustainability-action-planning",
          "setting-departmental-sustainability-goals"
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
          orderIndex: 20,
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
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Workplace Sustainability Team course");
  }
}
