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

const COURSE_SLUG = "creating-and-running-effective-green-teams";
const COURSE_TITLE = "Creating and Running Effective Green Teams";
const BADGE_SLUG = "effective-green-team-contributor";
const SEED_NAME = "effective-green-teams-v2";

const COURSE_META = {
  courseCode: "ELH-22",
  description:
    "Learn how to operate an established workplace sustainability team effectively over time, manage decision boundaries, run productive meetings, escalate blockers, and sustain action delivery without volunteer fatigue.",
  fullDescription:
    "Forming a green team is only the first step. Operating a team effectively over time requires clear decision boundaries, functional representation across shifts, workable meeting routines, single action ownership, and transparent escalation routes. This course equips sustainability coordinators, committee chairs, department representatives, and managers with practical operating disciplines to convert ideas into accountable workplace delivery.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/creating-and-running-effective-green-teams.jpg",
  intendedRoles: ["sustainability coordinators", "green-team members", "committee chairs", "department representatives", "supervisors", "managers", "operations leads"],
  learningObjectives: [
    "Distinguish an effective, accountable operating green team from a general discussion committee or temporary campaign group.",
    "Draft a clear team mandate, decision boundaries (direct, recommend, pilot, approve, escalate, decline), and reporting lines.",
    "Apply the TEAMWORK operational framework (Target purpose, Ensure representation, Assign authority, Make meetings useful, Work from evidence, Organise actions, Review delivery, Keep relevant).",
    "Structure cross-functional representation including operations, facilities, shift workers, finance, and frontline roles.",
    "Manage meeting routines, single action ownership, blocker escalation, and handover continuity."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations! You have completed Creating and Running Effective Green Teams. You can now operate a workplace sustainability team with clear decision boundaries, functional representation, productive meeting routines, and accountable action delivery.",
  badgeName: "Effective Green Team Contributor",
  badgeDescription:
    "Awarded for demonstrating operational mastery in running an effective workplace sustainability team, managing decision boundaries, and sustaining action delivery.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Operating Discipline Beyond Initial Launch",
    minutes: 3,
    content: "Understand why green teams stall after launch and how operating discipline converts enthusiasm into accountable delivery.",
    blocks: [
      { id: "gt1-h1", type: "heading", position: 1, headingText: "Why Green Teams Stall After Launch" },
      { id: "gt1-t1", type: "short_text", position: 2, bodyText: "A multi-site Mauritian enterprise launches a Green Team comprising head-office HR, marketing, and admin volunteers. After 3 months: meetings clash with operational shifts; Housekeeping, Warehouse, Maintenance, and Night-shift staff are omitted; 15 ideas are discussed but zero owners are named; budget requests sit unapproved for months; meeting frequency (12 meetings held!) is cited as proof of success; one enthusiastic employee carries all files. Members disengage. The team is active, but operationally ineffective because it lacks a clear mandate, decision boundaries, functional representation, and action ownership." },
      { id: "gt1-k1", type: "key_message", position: 3, headingText: "Operating Principle", bodyText: "Meetings held and ideas discussed are activity indicators; completed actions, removed blockers, and verified workplace practices are effectiveness indicators. Structure your team for delivery, not just discussion." },
      {
        id: "gt1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Diagnosing Green Team Ineffectiveness:",
        decisionPrompt: "A company's green team meets monthly for 6 months, generating 20 ideas but completing only 1 action. What should the chair do first?",
        decisionChoices: [
          { label: "Review the team mandate, representation, decision boundaries, and require every approved idea to have one named owner and target date before starting new discussions", correct: true, feedback: "Correct! Establishing clear mandates, decision flows, and single action ownership fixes root delivery failures." },
          { label: "Increase meeting frequency from monthly to weekly to force more discussions", correct: false, feedback: "Incorrect. Holding more unorganized meetings increases meeting fatigue without resolving ownership gaps." },
          { label: "Launch a staff competition to generate 20 more ideas", correct: false, feedback: "Incorrect. Generating more unowned ideas overburdens the team and destroys credibility." }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Core Purpose & Essential Vocabulary",
    minutes: 3,
    content: "Define the operational role of a green team and master 50+ green team governance terms.",
    blocks: [
      { id: "gt2-h1", type: "heading", position: 1, headingText: "Team Boundaries & Governance Vocabulary" },
      { id: "gt2-t1", type: "short_text", position: 2, bodyText: "A sustainability team provides cross-departmental coordination, evidence gathering, and recommendations. It does NOT replace line management authority, approve unbudgeted capital expenses, or assume statutory health and safety duties." },
      {
        id: "gt2-k1",
        type: "key_message",
        position: 3,
        headingText: "Core Green Team Vocabulary",
        bodyText: "• Sponsor: Senior manager who provides executive alignment, resources, and budget sign-off.\n• Chair / Coordinator: Team lead who structures agendas, facilitates meetings, and tracks action delivery.\n• Mandate & Scope: Written authorization defining what the team can decide, recommend, or pilot.\n• Decision Rights: Explicit rules on what the team can approve directly vs what requires management sign-off.\n• Functional Representation: Including key operational roles (facilities, kitchen, warehouse, shift leads) rather than head-office volunteers only.\n• Action Log: Structured record of assigned owners, target dates, and blocker escalation routes.\n• Volunteer Dependency: Vulnerability caused when team delivery relies on a single enthusiastic person without formal support."
      },
      {
        id: "gt2-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Roles & Communication Standards)",
        bodyText: "Management-system standards (ISO 14001 Clause 5.3 & ISO 9001 Clause 5.3) require top management to assign, communicate, and understand organizational roles and authorities to ensure environmental management processes deliver intended outputs.\n\nA green team operates effectively when its decision boundaries are formally communicated and supported by department heads."
      }
    ]
  },
  {
    order: 2,
    title: "The TEAMWORK Operational Framework",
    minutes: 4,
    content: "Master the 8-step TEAMWORK framework for practical green team delivery.",
    blocks: [
      { id: "gt3-h1", type: "heading", position: 1, headingText: "The TEAMWORK Operational Framework" },
      { id: "gt3-t1", type: "short_text", position: 2, bodyText: "Use the TEAMWORK framework to structure an accountable, high-performing green team:" },
      {
        id: "gt3-k1",
        type: "key_message",
        position: 3,
        headingText: "TEAMWORK Framework Breakdown",
        bodyText: "• T — Target a clear purpose: Define written mandate, scope, and decision boundaries.\n• E — Ensure relevant representation: Include operations, facilities, frontline, shift leads, and finance.\n• A — Assign authority & accountability: Name one accountable lead for every action and clarify approvers.\n• M — Make meetings useful: Run 45-min agenda-driven meetings focused on action review.\n• W — Work from evidence & reality: Use physical observations, utility records, and operational constraints.\n• O — Organise actions & resources: Secure sponsor approval, budget, and time allocations.\n• R — Review delivery & remove blockers: Escalate unresolved dependencies to executive sponsors.\n• K — Keep team relevant & sustainable: Refresh membership, manage workload, and record written handovers."
      },
      {
        id: "gt3-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Practice: Decision Boundary Categorization",
        decisionPrompt: "A hotel green team wants to replace 50 showerheads with low-flow models costing 150,000 MUR. How should the team handle this decision?",
        decisionChoices: [
          { label: "Gather water-savings evidence, obtain supplier quotes, test 2 pilot units in staff showers, and present a formal recommendation to the Facilities Manager for budget approval", correct: true, feedback: "Correct! Gathering evidence, testing pilots, and presenting costed recommendations to authorized managers respects decision boundaries." },
          { label: "Purchase and install all 50 showerheads immediately using team volunteer funds", correct: false, feedback: "Incorrect. Green teams must not bypass procurement rules or use personal funds for capital upgrades." },
          { label: "Reject the idea outright because green teams are forbidden from proposing plumbing improvements", correct: false, feedback: "Incorrect. Proposing costed improvements to management is a core advisory function of the team." }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Visual Meeting Inspection & High-Risk Mistakes",
    minutes: 4,
    content: "Inspect a green team delivery board and review critical operational safeguards.",
    blocks: [
      { id: "gt4-h1", type: "heading", position: 1, headingText: "Visual Green Team Meeting Board Inspection" },
      { id: "gt4-t1", type: "short_text", position: 2, bodyText: "Examine the green team meeting board (`visual-sustainability-green-team-effectiveness.png`). Observe how red sticky notes highlight operational defects: Head-office staff only (empty seat with placard reading 'Night Shift & Frontline Omitted'), long idea list with no assigned owners, budget request marked 'Awaiting Approval (3 Months)', meeting count cited as main success metric ('12 Meetings Held!'), one person holding all action folders, no written mandate, meeting time clashing with operational shift, and an overflow of unanswered suggestion slips." },
      {
        id: "gt4-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-sustainability-green-team-effectiveness.png",
        caption: "Green Team Quarterly Delivery & Action Board: Displaying head-office bias, unassigned actions, long pending budget approvals, and meeting count vanity metrics.",
        imageAlt: "Realistic photograph of a Mauritian commercial workplace meeting room with a whiteboard titled Green Team Quarterly Delivery & Action Board showing highlighted defects like head office only, unassigned actions, pending approvals, and meeting count vanity metrics."
      },
      {
        id: "gt4-k1",
        type: "key_message",
        position: 4,
        headingText: "High-Risk Team Operating Mistakes to Avoid",
        bodyText: "• DO NOT cite meeting count or attendance as evidence of environmental progress.\n• DO NOT overload one enthusiastic employee with all action items (prevent single-point failure).\n• DO NOT hold meetings during operational shift peaks that exclude frontline or shift workers.\n• DO NOT leave budget requests sitting unassigned; establish executive sponsor escalation routes.\n• DO NOT approve technical, financial, or safety changes outside the team's written mandate."
      }
    ]
  },
  {
    order: 4,
    title: "Worked Mauritian Scenario & Applied Decision",
    minutes: 2,
    content: "Study a Grand Baie resort green team delivery log and solve an applied manufacturing decision.",
    blocks: [
      { id: "gt5-h1", type: "heading", position: 1, headingText: "Worked Scenario: Grand Baie Resort Green Team Delivery Log" },
      {
        id: "gt5-w1",
        type: "workplace_example",
        position: 2,
        headingText: "Structured Delivery & Escalation Table",
        bodyText: "A Grand Baie resort green team tracks 4 cross-departmental items:\n1. Kitchen Food Waste: Kitchen Rep & Chef testing food trim weighing | Decision: Pilot Approved | Owner: Sous Chef | Target: 20 July | Blocker: None.\n2. Guest Villa Irrigation Leak: Maintenance Rep identified 3 broken valves | Decision: Escalated for Budget | Owner: Facilities Mgr | Approver: GM | Target: 10 July | Blocker: 25,000 MUR sign-off.\n3. Plastic Straw Replacement: Housekeeping Rep proposed paper straws | Decision: Approved Directly | Owner: Purchasing Lead | Target: Completed.\n4. Solar Panel Installation: Marketing Rep proposed rooftop solar | Decision: Outside Scope | Action: Referred to Engineering & Board."
      },
      {
        id: "gt5-d1",
        type: "decision_scenario",
        position: 3,
        decisionIntro: "Applied Manufacturing Team Decision:",
        decisionPrompt: "A textile factory green team has 8 pending actions stalled because the Operations Lead never attends monthly 2 PM meetings due to dispatch duties. What is the correct team adjustment?",
        decisionChoices: [
          { label: "Reschedule meetings to 8:30 AM before dispatch peak, send 3-point pre-meeting briefings, or appoint an alternate shift supervisor to represent Operations", correct: true, feedback: "Outstanding! Adjusting meeting timing and appointing operational alternates removes attendance barriers." },
          { label: "Reassign all 8 operations actions to the HR coordinator who has free time", correct: false, feedback: "Incorrect. Assigning operational actions to HR leads to failure because HR lacks shopfloor authority." },
          { label: "Mark all 8 actions as completed to clean up the action log", correct: false, feedback: "Incorrect. Falsifying action status destroys data integrity." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Team Operating Commitment & Badge",
    minutes: 2,
    content: "Select your daily team operating commitments and complete the course.",
    blocks: [
      { id: "gt6-h1", type: "heading", position: 1, headingText: "Green Team Operating Commitment" },
      { id: "gt6-t1", type: "short_text", position: 2, bodyText: "Select the team operating practices you pledge to apply in your workplace." },
      {
        id: "gt6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your green team commitments (choose at least one):",
        commitmentOptions: [
          { value: "clear-mandate-boundaries", label: "Establish a written team mandate clarifying direct decision rights, recommendations, and manager approvals", description: "Define clear authority boundaries." },
          { value: "cross-functional-representation", label: "Ensure operations, facilities, shift leads, and frontline roles are represented in team membership", description: "Avoid head-office-only bias." },
          { value: "single-action-ownership", label: "Assign one specific role as accountable owner for every approved green team action", description: "Eliminate unowned ideas." },
          { value: "escalate-blockers-promptly", label: "Escalate unresolved budget requests and operational dependencies to senior executive sponsors", description: "Maintain delivery momentum." }
        ]
      },
      {
        id: "gt6-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Practical Disclaimer",
        bodyText: "DISCLAIMER: This course provides practical workplace guidance on operating sustainability teams. It does not provide legal advice, employee-relations certification, environmental assurance, management-system certification, or independent verification of an organization's environmental performance or workplace culture."
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "What is the primary difference between a green team's MEETING ACTIVITY and its OPERATIONAL EFFECTIVENESS?",
    options: [
      "Meeting activity measures meetings held and ideas discussed; Effectiveness measures completed actions, removed operational blockers, and verified workplace improvements",
      "Meeting activity applies to managers; Effectiveness applies to external auditors",
      "Meeting activity requires catering; Effectiveness requires PowerPoint slides",
      "Meeting activity and Effectiveness are exact synonyms in corporate governance"
    ],
    correct: 0,
    correctExplanation: "Meetings held = activity; Completed actions and verified improvements = effectiveness.",
    incorrectExplanation: "Incorrect. Activity measures meetings held; Effectiveness measures verified workplace delivery."
  },
  {
    order: 2,
    question: "What does the 'T' in the TEAMWORK operational framework stand for?",
    options: [
      "Target a clear purpose (define written mandate, scope, and decision boundaries)",
      "Terminate non-attending committee members immediately",
      "Transfer all environmental budgets into personal accounts",
      "Threaten supervisors who do not submit weekly ideas"
    ],
    correct: 0,
    correctExplanation: "T = Target a clear purpose with written mandate and decision boundaries.",
    incorrectExplanation: "Incorrect. T = Target a clear purpose."
  },
  {
    order: 3,
    question: "Why should a workplace green team include frontline, shift, and facilities representatives rather than head-office volunteers only?",
    options: [
      "Because frontline and shift staff observe daily operational waste, equipment leaks, and procedural constraints that head-office staff cannot see",
      "Because head-office staff are legally forbidden from attending green team meetings",
      "Because frontline staff are required to take meeting minutes",
      "Because facilities staff own all company shares"
    ],
    correct: 0,
    correctExplanation: "Frontline and shift staff bring essential operational insights and spot daily waste.",
    incorrectExplanation: "Incorrect. Cross-functional representation ensures operational reality and shift feasibility."
  },
  {
    order: 4,
    question: "In the visual green team delivery board (`visual-sustainability-green-team-effectiveness.png`), why is 'One person holding all action folders' a high-risk operating flaw?",
    options: [
      "Because relying on a single volunteer creates a single point of failure, causes volunteer burnout, and delays all team actions if that person is absent",
      "Because action folders must legally be stored in locked steel safes",
      "Because paper folders increase carbon emissions by 50%",
      "Because green team coordinators are forbidden from carrying paper"
    ],
    correct: 0,
    correctExplanation: "Overloading one person creates volunteer dependency and single-point failure; actions must be distributed.",
    incorrectExplanation: "Incorrect. Single-person overload creates volunteer dependency and delivery bottlenecks."
  },
  {
    order: 5,
    question: "How should a green team handle a proposed action that requires a 200,000 MUR capital budget approval?",
    options: [
      "Gather evidence, cost the proposal, test a pilot if feasible, and submit a formal recommendation to the authorized manager or executive sponsor for sign-off",
      "Approve the expenditure directly during the green team meeting",
      "Reallocate funds from staff salary budgets without telling finance",
      "Cancel the meeting and abandon the initiative"
    ],
    correct: 0,
    correctExplanation: "Capital expenses exceeding team authority must be costed, evidenced, and recommended to authorized managers.",
    incorrectExplanation: "Incorrect. Green teams recommend capital expenditures to authorized line managers."
  },
  {
    order: 6,
    question: "What is the role of an EXECUTIVE SPONSOR in a workplace green team?",
    options: [
      "A senior manager who aligns team goals with company strategy, secures necessary resources, and approves or escalates budget requests",
      "An external contractor who cleans the meeting room",
      "A junior intern who orders coffee for meetings",
      "A software algorithm that sends automated reminders"
    ],
    correct: 0,
    correctExplanation: "Executive sponsor = senior lead providing management alignment, resources, and budget sign-off.",
    incorrectExplanation: "Incorrect. Sponsor = senior manager providing alignment, resources, and sign-off."
  },
  {
    order: 7,
    question: "Why should every approved green team action have ONE named role as accountable owner?",
    options: [
      "Because assigning actions to 'everyone' or 'all departments' means no single person is answerable for follow-through or reporting progress",
      "Because naming multiple owners triggers double taxation",
      "Because database systems can only store single names",
      "Because single ownership is required by Mauritian labor law"
    ],
    correct: 0,
    correctExplanation: "Naming one accountable role ensures clear answerability and prevents diffusion of responsibility.",
    incorrectExplanation: "Incorrect. Naming one role prevents 'everyone's job becomes no one's job'."
  },
  {
    order: 8,
    question: "What is the correct response when an employee submits a sustainability idea that the green team CANNOT implement due to technical constraints?",
    options: [
      "Provide clear, respectful feedback explaining why the idea cannot currently proceed, thank the employee, and record the explanation in the decision log",
      "Ignore the submission slip and pretend it was lost",
      "Publicly reprimand the employee for submitting an unrealistic idea",
      "Mark the idea as 'Completed' on the board to keep morale high"
    ],
    correct: 0,
    correctExplanation: "Respectful, transparent explanations maintain employee trust even when ideas are declined.",
    incorrectExplanation: "Incorrect. Transparent feedback explaining reasons maintains trust."
  },
  {
    order: 9,
    question: "How does ELH-22 (Effective Green Teams) connect to ELH-23 (Workplace Sustainability Initiatives)?",
    options: [
      "ELH-22 establishes the team operating discipline and decision flow; ELH-23 guides the team in selecting, planning, and executing specific high-impact initiatives",
      "ELH-22 replaces initiatives so specific projects are no longer needed",
      "ELH-22 is for office staff; ELH-23 is for external consultants only",
      "There is no connection between green teams and initiatives"
    ],
    correct: 0,
    correctExplanation: "ELH-22 builds team operating capability; ELH-23 guides the team in delivering specific workplace initiatives.",
    incorrectExplanation: "Incorrect. ELH-22 provides team governance; ELH-23 provides initiative delivery mechanics."
  },
  {
    order: 10,
    question: "What is the main takeaway of the TEAMWORK Operational Framework?",
    options: [
      "Applying TEAMWORK (Target purpose, Ensure representation, Assign authority, Make meetings useful, Work from evidence, Organise actions, Review delivery, Keep relevant) ensures sustained team delivery",
      "Green teams should rely on unbudgeted volunteer enthusiasm and endless meetings",
      "Line managers should transfer all environmental responsibilities onto green teams",
      "Meeting frequency is the single true measure of sustainability success"
    ],
    correct: 0,
    correctExplanation: "TEAMWORK provides structured operating discipline for cross-functional representation and accountable action delivery.",
    incorrectExplanation: "Incorrect. TEAMWORK provides structured operating discipline for effective green team delivery."
  }
];

export async function ensureEffectiveGreenTeamsCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 22 by courseCode "ELH-22" or slug
      let course = null;

      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-22"))
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
        throw new Error("Course ELH-22 / creating-and-running-effective-green-teams not seeded by catalogue skeletons bootstrap!");
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
        logger.info({ courseId, slug: COURSE_SLUG }, "Effective Green Teams course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course ELH-22. Re-seeding course content, lessons, and 10 quiz questions transactionally...");

      // 4. Resolve next recommended course dynamically (ELH-23 or null if not yet seeded)
      const [course23] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.slug, "planning-workplace-sustainability-initiatives"))
        .limit(1);
      const nextCourseId = course23 ? course23.id : null;

      // 5. Update course record metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-22",
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

      // 8. Enforce prerequisite entries in coursePrerequisitesTable (ELH-12 through ELH-21 -> ELH-22)
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
          "reviewing-sustainability-performance-and-corrective-action",
          "sustainability-roles-responsibilities-and-accountability",
          "building-employee-engagement-in-sustainability"
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
          orderIndex: 27,
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

      logger.info({ courseId, slug: COURSE_SLUG }, "Effective Green Teams course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Effective Green Teams course");
  }
}
