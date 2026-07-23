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

const COURSE_SLUG = "creating-and-running-effective-green-teams";
const COURSE_TITLE = "Creating and Running Effective Green Teams";
const BADGE_SLUG = "green-team-coordinator";
const BADGE_CODE = "COURSE_ELH_22_COMPLETE";
const SEED_NAME = "effective-green-teams-v1";

const COURSE_META = {
  courseCode: "ELH-22",
  description: "Learn how to create and run a practical workplace green team with clear membership, responsibilities, meeting routines and action tracking. The course helps learners avoid common problems such as unclear authority, inactive meetings, duplicated responsibilities and dependence on one enthusiastic employee.",
  fullDescription: "Learn how to create and run a practical workplace green team with clear membership, responsibilities, meeting routines and action tracking. The course helps learners avoid common problems such as unclear authority, inactive meetings, duplicated responsibilities and dependence on one enthusiastic employee.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/creating-and-running-effective-green-teams.jpg",
  intendedRoles: ["employees", "supervisors", "managers", "sustainability coordinators", "green-team members"],
  learningObjectives: [
    "describe what a green team should and should not do;",
    "select members based on workplace knowledge and operational relevance;",
    "define a workable mandate and escalation boundaries;",
    "structure efficient green-team meetings;",
    "record decisions, owners and due dates;",
    "maintain participation and continuity; and",
    "report progress without exaggerating the team’s environmental impact."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Creating and Running Effective Green Teams. You can now establish, organise and maintain a practical workplace green team that supports sustainability actions effectively.",
  badgeName: "Green Team Coordinator",
  badgeDescription: "Awarded for demonstrating practical understanding of how to establish, organise and sustain an effective workplace green team.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "What a Green Team Is For",
    minutes: 3,
    content: "Clarify the role and scope of a green team. Differentiate advisory, coordination, and delivery tasks from management approval authority.",
    blocks: [
      {
        id: "c22-l1-b1",
        type: "heading",
        headingText: "What a Green Team Is For"
      },
      {
        id: "c22-l1-b2",
        type: "short_text",
        bodyText: "A green team is created to identify opportunities, collect employee observations, test improvements, coordinate activities, and track agreed actions. It is NOT created to replace managers, approve operational budgets, alter health/safety guidelines, or assume compliance duties.\n\nUnderstand four key roles:\n1. Advisory: Recommending or providing process input.\n2. Coordination: Helping people carry out actions.\n3. Delivery: Completing specifically assigned tasks.\n4. Approval: Authorizing budget, policy, or operational changes."
      },
      {
        id: "c22-l1-b3",
        type: "key_message",
        headingText: "Resort Example",
        bodyText: "A Mauritian resort green team documents water loss from guest irrigation and proposes a trial. However, the facilities manager must still approve repairs and budget expenditure."
      },
      {
        id: "c22-l1-b4",
        type: "decision_scenario",
        decisionIntro: "Which action falls within the correct authority of a workplace green team?",
        decisionPrompt: "Select the action within the team's authority:",
        decisionChoices: [
          {
            label: "Authorizing a budget of 50,000 MUR to replace staff room light fixtures.",
            correct: false,
            feedback: "Incorrect. The green team does not have direct financial approval authority."
          },
          {
            label: "Testing a staff room waste sorting station layout and gathering feedback from the cleaning staff.",
            correct: true,
            feedback: "Correct. Testing layouts and collecting feedback represent coordination and delivery tasks within the team's scope."
          },
          {
            label: "Terminating the contract of a waste disposal supplier.",
            correct: false,
            feedback: "Incorrect. Changing supplier contracts requires formal procurement or management authority."
          },
          {
            label: "Rewriting the company's health and safety policy.",
            correct: false,
            feedback: "Incorrect. Health and safety policies are managed by designated compliance officers."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Choose Members for Workplace Relevance",
    minutes: 3,
    content: "Select green team members based on operational knowledge and representative balance rather than seniority or enthusiasm alone.",
    blocks: [
      {
        id: "c22-l2-b1",
        type: "heading",
        headingText: "Choose Members for Workplace Relevance"
      },
      {
        id: "c22-l2-b2",
        type: "short_text",
        bodyText: "A balanced green team represents how work is actually performed. Do not select members based on job titles or appearance. Avoid committees made up only of office-based managers.\n\nUseful teams include representation from: operations, maintenance, procurement, shift staff, customer service, and finance. This ensures that when actions are planned, operational constraints (like busy checkout periods or shift changes) are understood."
      },
      {
        id: "c22-l2-b3",
        type: "key_message",
        headingText: "Team Composition",
        bodyText: "Select members who have direct contact with processes that generate waste, use energy, or consume water."
      },
      {
        id: "c22-l2-b4",
        type: "decision_scenario",
        decisionIntro: "A retail company forms a green team to reduce store packaging waste. Which group represents the most effective team composition?",
        decisionPrompt: "Select the most effective membership:",
        decisionChoices: [
          {
            label: "The General Manager, the Marketing Manager, and the PR Consultant.",
            correct: false,
            feedback: "Incorrect. This group lacks operational knowledge of inventory, receiving, and floor routines."
          },
          {
            label: "The Store Operations Lead, the Receiving Dock Supervisor, a Sales Floor Representative, and the Procurement Assistant.",
            correct: true,
            feedback: "Correct. This team contains the staff who handle incoming packaging, stock shelves, and make procurement requests."
          },
          {
            label: "Three enthusiastic volunteers from the finance department.",
            correct: false,
            feedback: "Incorrect. While enthusiastic, they have no direct involvement in retail floor waste operations."
          },
          {
            label: "All supervisors from every department.",
            correct: false,
            feedback: "Incorrect. A team containing only supervisors is often too large and misses frontline staff perspectives."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Establish a Clear Mandate",
    minutes: 3,
    content: "Define the scope, sponsor, and decision boundaries of the team. A written mandate prevents confusion about roles and authority.",
    blocks: [
      {
        id: "c22-l3-b1",
        type: "heading",
        headingText: "Establish a Clear Mandate"
      },
      {
        id: "c22-l3-b2",
        type: "short_text",
        bodyText: "A mandate clearly defines: purpose, scope (topics), sponsor (accountable manager), decision authority, reporting lines, meeting frequency, and review date.\n\nFor example, a retail green team's mandate might authorize it to review waste logs and recommend bin placements, but explicitly exclude authority to sign vendor contracts or modify safety policies."
      },
      {
        id: "c22-l3-b3",
        type: "key_message",
        headingText: "Scope Boundaries",
        bodyText: "A written mandate prevents the team from stalling due to uncertainty about what they are allowed to decide or do."
      },
      {
        id: "c22-l3-b4",
        type: "decision_scenario",
        decisionIntro: "A green team is unsure whether they can spend 5,000 MUR on recycling containers. What is the most appropriate first action?",
        decisionPrompt: "Select the best mandate step:",
        decisionChoices: [
          {
            label: "Purchase the containers and ask for approval later.",
            correct: false,
            feedback: "Incorrect. Bypassing financial authorization limits violates company policy."
          },
          {
            label: "Refer to the team's written mandate to check their approved spending limit and consult their management sponsor.",
            correct: true,
            feedback: "Correct. Consulting the written mandate and the sponsor clarifies authorization boundaries."
          },
          {
            label: "Cancel the purchase and stop waste sorting actions.",
            correct: false,
            feedback: "Incorrect. This avoids resolving the boundary question."
          },
          {
            label: "Ask all company employees to vote on the purchase.",
            correct: false,
            feedback: "Incorrect. Staff voting is not a standard corporate budget authorization method."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Run Short, Productive Meetings",
    minutes: 3,
    content: "Structure meetings around decisions, progress checks, and assignments. Focus the agenda on a few priority issues to prevent open-ended discussion.",
    blocks: [
      {
        id: "c22-l4-b1",
        type: "heading",
        headingText: "Run Short, Productive Meetings"
      },
      {
        id: "c22-l4-b2",
        type: "short_text",
        bodyText: "Green team meetings must lead to actions. Follow a decision agenda: (1) confirm meeting objectives, (2) review open tracker actions, (3) discuss one or two priority issues, (4) assign owners/due dates, (5) list escalations, and (6) confirm post-meeting messages.\n\nAvoid open-ended discussions without decisions, trying to cover too many topics, or assigning tasks to absent staff."
      },
      {
        id: "c22-l4-b3",
        type: "key_message",
        headingText: "Agenda Discipline",
        bodyText: "A productive green team meeting should end with clear assignments, not vague promises."
      },
      {
        id: "c22-l4-b4",
        type: "decision_scenario",
        decisionIntro: "A green team has 12 agenda items for a 30-minute meeting. Members have spent 20 minutes discussing general environmental news.",
        decisionPrompt: "What should the team coordinator do?",
        decisionChoices: [
          {
            label: "Extend the meeting by an hour to cover all 12 items.",
            correct: false,
            feedback: "Incorrect. Extending meetings causes schedule conflicts and team fatigue."
          },
          {
            label: "Focus the remaining 10 minutes strictly on reviewing active tracker actions and documenting owners for the top two priority issues.",
            correct: true,
            feedback: "Correct. Prioritizing the active tracker ensures that immediate, concrete tasks are checked and assigned."
          },
          {
            label: "Cancel the meeting and reschedule for next week.",
            correct: false,
            feedback: "Incorrect. Rescheduling without progress does not address the lack of agenda focus."
          },
          {
            label: "Assign all 12 items to the members who did not attend.",
            correct: false,
            feedback: "Incorrect. Assigning tasks to absent staff leads to incomplete work and frustration."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Track Actions and Escalate Properly",
    minutes: 3,
    content: "Convert discussion into actions. Use tracker records to define owners and due dates, and understand what constitutes a completed task.",
    blocks: [
      {
        id: "c22-l5-b1",
        type: "heading",
        headingText: "Track Actions and Escalate Properly"
      },
      {
        id: "c22-l5-b2",
        type: "short_text",
        bodyText: "Every green team action must record: issue, action, owner role, due date, status, approval needed, verified evidence, and review date. An action is not 'completed' merely because an email was sent or a meeting occurred.\n\nFor example, if the team asks maintenance to inspect air-conditioning usage after office hours, the action remains open until maintenance completes the check and the result is logged."
      },
      {
        id: "c22-l5-b3",
        type: "key_message",
        headingText: "Progress Tracking",
        bodyText: "Track tasks to verified outcomes rather than administrative steps. Send emails only to start a task, not close it."
      },
      {
        id: "c22-l5-b4",
        type: "decision_scenario",
        decisionIntro: "A green team coordinator marks the action 'Improve recycling bin signage' as 'Completed' because they emailed the graphic files to the printer.",
        decisionPrompt: "Is this action actually complete?",
        decisionChoices: [
          {
            label: "Yes, because the coordinator completed their task.",
            correct: false,
            feedback: "Incorrect. The signs are not yet printed, delivered, or installed."
          },
          {
            label: "No. The action must remain 'In Progress' or 'Waiting for Delivery' until the new signs are installed on the floor and verified.",
            correct: true,
            feedback: "Correct. Actions must be tracked to verified outcomes (signs installed), not administrative milestones (email sent)."
          },
          {
            label: "Yes, because the printer has the files.",
            correct: false,
            feedback: "Incorrect. This leaves the final installation unchecked."
          },
          {
            label: "No, the action should be deleted and restarted.",
            correct: false,
            feedback: "Incorrect. The action remains valid; it is simply not yet complete."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Keep the Team Useful Over Time",
    minutes: 3,
    content: "Establish continuity rules. Mitigate single-champion dependencies by using rotating roles, shared folders, and documented handover procedures.",
    blocks: [
      {
        id: "c22-l6-b1",
        type: "heading",
        headingText: "Keep the Team Useful Over Time"
      },
      {
        id: "c22-l6-b2",
        type: "short_text",
        bodyText: "To build a resilient green team: document meetings in shared files, establish rotation rules for the coordinator role, implement handover guides, and periodically review the team's usefulness. If the coordinator leaves and trackers are in their personal folders, the team collapses.\n\nWarning signs include: meetings are held but tracker items remain open for months, one volunteer does all the work, or operational representatives stop attending."
      },
      {
        id: "c22-l6-b3",
        type: "key_message",
        headingText: "Resilient Records",
        bodyText: "A green team is durable when its knowledge, notes, and trackers belong to the organization rather than a single individual."
      },
      {
        id: "c22-l6-b4",
        type: "commitment_scenario",
        commitmentPrompt: "Which step will you take to improve green team durability in your workplace?",
        commitmentChoices: [
          "Clarify the team's mandate",
          "Add a missing operational representative",
          "Introduce a standard action tracker",
          "Shorten and restructure meetings",
          "Appoint a deputy coordinator",
          "Review inactive or overdue actions"
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "A green team begins changing store operational processes and modifying utility settings without consulting the department managers. What is the main error?",
    options: [
      { text: "The green team should work faster to prevent managers from noticing.", isCorrect: false, feedback: "Incorrect. Bypassing management processes creates operational risk." },
      { text: "The team has advisory and coordination roles but cannot approve or execute operational changes without authorized management consent.", isCorrect: true, feedback: "Correct. Green teams support and coordinate, but they do not replace the formal authority of operational department heads." },
      { text: "Department managers should not participate in green team decisions.", isCorrect: false, feedback: "Incorrect. Managers are critical stakeholders for process feasibility." },
      { text: "The green team should change the written company policy first.", isCorrect: false, feedback: "Incorrect. The team cannot rewrite policy without authorization." }
    ],
    correctExplanation: "Green teams coordinate and recommend improvements but do not hold direct authority to modify operations or budgets without formal management approvals.",
    incorrectExplanation: "Bypassing managers, excluding them, or attempting to rewrite policy without consent violates basic workplace governance.",
    practicalTakeaway: "Green teams support implementation but do not replace management authority."
  },
  {
    question: "A green team consisting only of office-based managers is trying to resolve waste sorting issues in the logistics warehouse. What is the most appropriate action?",
    options: [
      { text: "Send a reminder email to all warehouse supervisors.", isCorrect: false, feedback: "Incorrect. This does not bring warehouse operational knowledge into the team." },
      { text: "Invite a warehouse supervisor and a receiving dock operator to join the team to represent warehouse realities.", isCorrect: true, feedback: "Correct. Representative balance requires including staff who understand the daily shift schedules and layouts." },
      { text: "Create a warehouse sorting leaderboard.", isCorrect: false, feedback: "Incorrect. Leaderboards do not replace operational representation." },
      { text: "Hire an external auditor to inspect the warehouse.", isCorrect: false, feedback: "Incorrect. Direct employee representation is more practical and cost-effective for local trackers." }
    ],
    correctExplanation: "To construct realistic actions, green teams must include representative members who possess direct knowledge of the targeted department's operations.",
    incorrectExplanation: "Email reminders, leaderboards, or external audits do not address the lack of internal operational representation.",
    practicalTakeaway: "Choose team members for their operational relevance and process knowledge."
  },
  {
    question: "Members of a green team disagree about whether they are authorized to spend 5,000 MUR on waste containers. How should this be resolved?",
    options: [
      { text: "Purchase the containers and charge it to office supplies.", isCorrect: false, feedback: "Incorrect. This violates standard financial compliance rules." },
      { text: "Refer to the documented team mandate and check the approved spending limit authorized by their sponsor.", isCorrect: true, feedback: "Correct. The mandate defines the team's scope and spending boundaries." },
      { text: "Cancel the waste container project.", isCorrect: false, feedback: "Incorrect. The project is valid; only the authorization needs verification." },
      { text: "Wait until the next annual review to request authorization.", isCorrect: false, feedback: "Incorrect. Delaying a small purchase for a year is unnecessary." }
    ],
    correctExplanation: "A documented mandate clarifies scope and spending limits authorized by the team's management sponsor, preventing disputes.",
    incorrectExplanation: "Falsifying accounting, cancelling projects, or delaying for a year ignores the purpose of a written mandate.",
    practicalTakeaway: "Refer to a written mandate to clarify spending and decision boundaries."
  },
  {
    question: "A green team meeting covers energy, waste, procurement, biodiversity, and CSR, but ends with no actions assigned or recorded. What is the best next step?",
    options: [
      { text: "Schedule a longer meeting next week to finish the discussions.", isCorrect: false, feedback: "Incorrect. Longer meetings without agenda discipline lead to further delays." },
      { text: "Prioritize the agenda to focus on one or two active projects, and document a clear owner and due date for every action.", isCorrect: true, feedback: "Correct. Restructuring the meeting to focus on the tracker ensures that tasks are assigned and monitored." },
      { text: "Assign all open issues to the coordinator to keep meetings short.", isCorrect: false, feedback: "Incorrect. Overloading the coordinator leads to burnout and project failure." },
      { text: "Disband the green team.", isCorrect: false, feedback: "Incorrect. The team can be effective with a structured meeting format." }
    ],
    correctExplanation: "Meetings are productive when they focus on a small number of tracker priorities and end with defined owners and due dates.",
    incorrectExplanation: "Longer discussions, overloading coordinators, or disbanding teams ignores meeting management best practices.",
    practicalTakeaway: "Focus meeting agendas on tracker priorities and record clear owners."
  },
  {
    question: "A green team member marks the action 'Investigate night-time AC use' as 'Completed' because they sent an email to the facilities team. What is the problem with this entry?",
    options: [
      { text: "Sending the email was the only required task.", isCorrect: false, feedback: "Incorrect. Sending an email does not verify the investigation occurred." },
      { text: "The action should remain 'In Progress' until the facilities team completes the check and the result is logged.", isCorrect: true, feedback: "Correct. Action tracking requires recording the actual outcome, not just the administrative start step." },
      { text: "The coordinator should have sent the email instead.", isCorrect: false, feedback: "Incorrect. The sender is not the issue; the premature status update is." },
      { text: "The entry should be deleted from the tracker.", isCorrect: false, feedback: "Incorrect. The active item should be updated, not deleted." }
    ],
    correctExplanation: "Track tasks to verified outcomes (e.g. check completed and results recorded) rather than initial administrative steps.",
    incorrectExplanation: "Treating emails as completed actions, changing senders, or deleting logs hides process tracking gaps.",
    practicalTakeaway: "Mark actions complete only after the outcome is verified."
  },
  {
    question: "An action to repair a recycling container is blocked because the team lacks budget authority. How should the team respond?",
    options: [
      { text: "Leave the action open on the tracker indefinitely.", isCorrect: false, feedback: "Incorrect. Leaving blockers unaddressed leads to tracker stagnation." },
      { text: "Record the blocker on the tracker and escalate it to the management sponsor with a clear decision request.", isCorrect: true, feedback: "Correct. Escalation is the proper tool for resolving blocker issues that lie outside the team's authority." },
      { text: "Move the container to a general waste pile.", isCorrect: false, feedback: "Incorrect. This damages recycling goals instead of resolving the budget." },
      { text: "Borrow funds from another department's petty cash.", isCorrect: false, feedback: "Incorrect. This violates standard financial governance." }
    ],
    correctExplanation: "When actions are blocked by authority limits, record the blocker on the tracker and escalate to the sponsor with a specific request.",
    incorrectExplanation: "Indefinite delays, abandoning the asset, or unauthorized borrowing ignores operational compliance paths.",
    practicalTakeaway: "Log blockers and escalate to the authorized sponsor."
  },
  {
    question: "A green team's coordinator resigns, and all past meeting notes and trackers are locked in their personal computer folder, forcing meetings to stop. How could this have been avoided?",
    options: [
      { text: "The coordinator should have remained with the company indefinitely.", isCorrect: false, feedback: "Incorrect. Staff changes are normal operational occurrences." },
      { text: "The team should have stored all notes and trackers in a shared corporate folder and appointed a deputy coordinator.", isCorrect: true, feedback: "Correct. Storing records in shared folders and assigning a deputy coordinator ensures process continuity." },
      { text: "The records should have been deleted upon resignation.", 'isCorrect': false, feedback: "Incorrect. Deleting records destroys operational history." },
      { text: "The team should not have kept meeting records.", isCorrect: false, feedback: "Incorrect. Keeping records is critical for progress tracking." }
    ],
    correctExplanation: "Process continuity requires maintaining trackers in shared directories and establishing deputy roles to handle staff changes.",
    incorrectExplanation: "Expecting permanent staff, deleting records, or avoiding records entirely fails basic business resilience checks.",
    practicalTakeaway: "Store team records in shared folders to ensure process continuity."
  },
  {
    question: "A green team has held ten meetings over five months but has completed zero actions. What is the most accurate measure of the team's usefulness?",
    options: [
      { text: "The team is successful because meeting attendance was high.", isCorrect: false, feedback: "Incorrect. Attendance does not measure operational impact." },
      { text: "The team's usefulness is measured by completed actions and results, not meeting frequency alone.", isCorrect: true, feedback: "Correct. Green team success is measured by concrete results on the floor, not administrative activity." },
      { text: "The team requires a monthly newsletter to improve outreach.", isCorrect: false, feedback: "Incorrect. Newsletters do not resolve the lack of completed actions." },
      { text: "The team should double the number of monthly meetings.", isCorrect: false, feedback: "Incorrect. More inactive meetings will not produce outcomes." }
    ],
    correctExplanation: "A green team is evaluated by its practical output (actions completed and gaps resolved), not by meeting frequency or attendance metrics.",
    incorrectExplanation: "Measuring success by attendance, writing newsletters, or doubling meeting frequency ignores result-oriented metrics.",
    practicalTakeaway: "Evaluate green team effectiveness by actions completed and results achieved."
  }
];

export async function ensureEffectiveGreenTeamsCourse() {
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

      // 2. Resolve Course 21
      let course21 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-21")
      });
      if (!course21) {
        course21 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "building-employee-engagement-in-sustainability")
        });
      }

      if (!course21) {
        throw new Error("Data integrity error: Course 21 (ELH-21) not found. Prerequisite cannot be established.");
      }

      // 3. Resolve or insert Course 22
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

      // 4. Update Course 21 recommendedNextCourseId to point to Course 22 preserving admin edits
      let isSystemManaged = false;
      if (course21.recommendedNextCourseId) {
        const currentRecommendedCourse = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.id, course21.recommendedNextCourseId)
        });
        if (currentRecommendedCourse && currentRecommendedCourse.courseCode === "ELH-22") {
          isSystemManaged = true;
        }
      }

      if (course21.recommendedNextCourseId === null || course21.recommendedNextCourseId === actualCourseId || isSystemManaged) {
        await tx.update(coursesTable).set({
          recommendedNextCourseId: actualCourseId
        }).where(eq(coursesTable.id, course21.id));
      } else {
        logger.warn(`Recommendation conflict: Course 21 currently recommends course ID ${course21.recommendedNextCourseId} instead of Course 22 (ID: ${actualCourseId}). Preserving administrator edit.`);
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
          icon: "star",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 25,
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
      // Prerequisite 1: Course 21
      const existingPrereq21 = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course21.id)
        )
      });
      if (!existingPrereq21) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course21.id
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
