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

const COURSE_SLUG = "sustainability-roles-responsibilities-and-accountability";
const COURSE_TITLE = "Sustainability Roles, Responsibilities and Accountability";
const BADGE_SLUG = "sustainability-accountability-contributor";
const BADGE_CODE = "COURSE_ELH_20_COMPLETE";
const SEED_NAME = "sustainability-roles-accountability-v1";

const COURSE_META = {
  courseCode: "ELH-20",
  description: "Learn how sustainability responsibilities are shared across a workplace, how clear ownership prevents actions from being forgotten and when blocked or significant issues should be escalated. This course helps employees and managers understand their role in turning sustainability plans into consistent action.",
  fullDescription: "Learn how sustainability responsibilities are shared across a workplace, how clear ownership prevents actions from being forgotten and when blocked or significant issues should be escalated. This course helps employees and managers understand their role in turning sustainability plans into consistent action.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainability-roles-responsibilities-and-accountability.jpg",
  intendedRoles: ["employees", "supervisors", "line managers", "department heads", "green team members", "facilities and operations staff", "HR and procurement teams", "ESG or compliance support staff", "senior managers"],
  learningObjectives: [
    "Distinguish participation, responsibility, ownership and accountability.",
    "Identify who should own a workplace sustainability action.",
    "Understand the supporting roles of employees, managers and leadership.",
    "Avoid vague ownership such as “everyone” or “the green team.”",
    "Clarify decision-making and approval responsibilities.",
    "Escalate blocked, overdue or material issues appropriately.",
    "Record accountability clearly in action trackers and review records.",
    "Recognise when a sustainability process depends too heavily on one person."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Sustainability Roles, Responsibilities and Accountability. You can now identify clearer action owners, supporting roles, approval responsibilities and escalation routes for workplace sustainability actions.",
  badgeName: "Sustainability Accountability Contributor",
  badgeDescription: "Awarded for completing Sustainability Roles, Responsibilities and Accountability and demonstrating the ability to distribute responsibilities, record ownership, escalate issues, and build resilient processes.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Participation Is Not the Same as Ownership",
    minutes: 3,
    content: "Distinguish between contributing to a task and being responsible for its completion. Learn why vague collective assignments fail and how to assign a single clear owner.",
    blocks: [
      {
        id: "c20-l1-b1",
        type: "heading",
        headingText: "Participation Is Not the Same as Ownership"
      },
      {
        id: "c20-l1-b2",
        type: "short_text",
        bodyText: "If 'everyone' is responsible for reducing unnecessary printing, no one feels accountable. A successful action plan distinguishes between participation (contributing to a task) and ownership (ensuring the action moves forward and is reviewed).\n\nWhile multiple team members may participate, a single clear role should own the action. For default double-sided printing: IT configures printer defaults, HR communicates, employees participate by following instructions, but the Office Manager owns implementation, and the Department Manager reviews results."
      },
      {
        id: "c20-l1-b3",
        type: "key_message",
        headingText: "The Ownership Principle",
        bodyText: "Many people may contribute to an action, but one clear role must ensure that it is completed and reviewed."
      },
      {
        id: "c20-l1-b4",
        type: "decision_scenario",
        decisionIntro: "A department plans to turn off computers at the end of the day. Which approach establishes the clearest accountability?",
        decisionPrompt: "Select the most effective assignment:",
        decisionChoices: [
          {
            label: "Put up a poster saying: 'Everyone must turn off their screens.'",
            correct: false,
            feedback: "Incorrect. Collective assignments without clear role ownership lead to diffusion of responsibility."
          },
          {
            label: "Assign the Office Administrator to verify screen shutdown during the final walk-through, with the IT Lead supporting by automating screen power-offs.",
            correct: true,
            feedback: "Correct. This designates a clear owner role (Office Administrator) to verify completion and a supporting role (IT Lead) to execute tasks."
          },
          {
            label: "Leave the action unassigned because employees should know what to do.",
            correct: false,
            feedback: "Incorrect. Unassigned tasks rarely get completed consistently."
          },
          {
            label: "Make the department's junior intern solely responsible for turning off all computers.",
            correct: false,
            feedback: "Incorrect. The intern may lack the access or process authority to enforce or coordinate this effectively across the department."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Match Responsibility to Authority and Capability",
    minutes: 3,
    content: "Assign ownership to individuals who have the organizational authority and resources to influence the outcome. Avoid setting up team members for delay.",
    blocks: [
      {
        id: "c20-l2-b1",
        type: "heading",
        headingText: "Match Responsibility to Authority and Capability"
      },
      {
        id: "c20-l2-b2",
        type: "short_text",
        bodyText: "An action owner must have: access to the relevant process, sufficient authority to coordinate changes, the time and resources to manage them, and a clear reporting line.\n\nAssigning responsibility without corresponding authority creates friction. For example, a junior employee should not be accountable for approving energy retrofits. A procurement assistant can collect supplier metrics but cannot authorize supplier changes."
      },
      {
        id: "c20-l2-b3",
        type: "key_message",
        headingText: "Mauritian Workplace Context",
        bodyText: "In a hotel, a maintenance technician can identify leaks and recommend repairs, but budget approval for replacement fixtures rests with the Operations Manager. Match task ownership to decision authority."
      },
      {
        id: "c20-l2-b4",
        type: "decision_scenario",
        decisionIntro: "A retail store needs to replace old lighting with energy-efficient alternatives. Who is the most appropriate owner for this action?",
        decisionPrompt: "Select the most appropriate action owner:",
        decisionChoices: [
          {
            label: "A sales floor assistant who is passionate about sustainability.",
            correct: false,
            feedback: "Incorrect. Although passionate, a sales assistant lacks the authority to modify store fixtures or manage procurement budgets."
          },
          {
            label: "The Store Operations Manager, who has budget control and access to building maintenance systems.",
            correct: true,
            feedback: "Correct. The Store Operations Manager has both the operational authority and the access to resources required to complete this task."
          },
          {
            label: "The entire sales team collectively.",
            correct: false,
            feedback: "Incorrect. Collective assignments lead to inaction because there is no single point of contact."
          },
          {
            label: "The external landlord of the shopping complex.",
            correct: false,
            feedback: "Incorrect. While they may need to approve the modifications, they cannot lead the store's internal procurement actions."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Clarify Supporting and Approval Roles",
    minutes: 3,
    content: "Define who performs the work, who approves budgets or changes, and who reviews completion. Unclear approval boundaries lead to stalled actions.",
    blocks: [
      {
        id: "c20-l3-b1",
        type: "heading",
        headingText: "Clarify Supporting and Approval Roles"
      },
      {
        id: "c20-l3-b2",
        type: "short_text",
        bodyText: "To keep actions moving, clarify: Who owns it? Who performs the work? Who approves expenses? Who must be informed? Who reviews completion and confirms effectiveness?\n\nFor replacing disposable cups in a staff area: Procurement searches for reusable options (support), Finance approves the purchase (approval), the Office Manager ensures delivery (owner), and the Department Manager reviews usage patterns after launch (review)."
      },
      {
        id: "c20-l3-b3",
        type: "key_message",
        headingText: "Approval Alignment",
        bodyText: "Clearly defining budget and process approvers prevents actions from becoming stalled between departments."
      },
      {
        id: "c20-l3-b4",
        type: "decision_scenario",
        decisionIntro: "An action to install sub-meters has stalled because the engineering team is waiting to see who will pay for the devices, while facilities believes the cost is covered by corporate green budgets.",
        decisionPrompt: "What role should have been clarified first?",
        decisionChoices: [
          {
            label: "The employee who records the meter readings.",
            correct: false,
            feedback: "Incorrect. That role occurs only after installation."
          },
          {
            label: "The role authorized to approve and fund the purchase.",
            correct: true,
            feedback: "Correct. Clarifying who has budget approval responsibility prevents the project from getting stuck in an inter-departmental funding gap."
          },
          {
            label: "The general manager of the company.",
            correct: false,
            feedback: "Incorrect. The general manager does not need to be the direct owner of every utility task."
          },
          {
            label: "The external utility provider.",
            correct: false,
            feedback: "Incorrect. The provider does not manage internal corporate budget approvals."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Record Accountability Clearly",
    minutes: 3,
    content: "Log ownership details in trackers using role-based entries instead of personal names. Keep records clear to support continuity during handovers.",
    blocks: [
      {
        id: "c20-l4-b1",
        type: "heading",
        headingText: "Record Accountability Clearly"
      },
      {
        id: "c20-l4-b2",
        type: "short_text",
        bodyText: "A clear tracker entry should record: Action, Owner (by role, not personal name), Support roles, Approver, Start Date, Due Date, Review Date, and Escalation route.\n\nAvoid vague entries like: 'Owner: Sustainability Team; Deadline: Soon'. Instead, record: 'Owner: Facilities Manager; Support: Maintenance Supervisor; Approval: General Manager; Due: 30 September; Escalation: Operations Director'."
      },
      {
        id: "c20-l4-b3",
        type: "key_message",
        headingText: "Role-Based Tracking",
        bodyText: "Listing roles rather than personal names ensures that accountability remains clear even if staff shifts occur."
      },
      {
        id: "c20-l4-b4",
        type: "decision_scenario",
        decisionIntro: "Which tracker entry provides the clearest accountability for a waste reduction project?",
        decisionPrompt: "Select the most complete record:",
        decisionChoices: [
          {
            label: "Owner: Green Team. Target: Reduce waste as soon as possible.",
            correct: false,
            feedback: "Incorrect. The Green Team is a collective, and the target timeframe is too vague."
          },
          {
            label: "Action: Install compost bins; Owner: Operations Lead; Support: Kitchen Supervisor; Approval: GM; Due: 15-Oct; Review: 30-Oct; Escalation: Operations Director.",
            correct: true,
            feedback: "Correct. This identifies the owner role, support role, approver role, specific deadlines, review points, and escalation path."
          },
          {
            label: "Owner: Jean. Jean will speak with management next month.",
            correct: false,
            feedback: "Incorrect. Jean is a personal name (which creates issues if Jean leaves) and lacks dates or escalation routes."
          },
          {
            label: "Owner: Management. Status: In progress.",
            correct: false,
            feedback: "Incorrect. 'Management' is too broad to denote specific accountability."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Escalate Blocked or Significant Issues",
    minutes: 3,
    content: "Understand when to escalate issues. Structure escalation messages to focus on blockers and requested decisions rather than blaming individuals.",
    blocks: [
      {
        id: "c20-l5-b1",
        type: "heading",
        headingText: "Escalate Blocked or Significant Issues"
      },
      {
        id: "c20-l5-b2",
        type: "short_text",
        bodyText: "Escalation is not about blame—it is an operational tool to resolve blockers. Escalate when: a deadline is repeatedly missed, budget approval remains pending, a department dispute blocks progress, or the issue impacts safety or compliance.\n\nAn effective escalation message contains: what the issue is, why it matters, what has already been attempted, the specific blocker, and the required decision or support with a deadline."
      },
      {
        id: "c20-l5-b3",
        type: "key_message",
        headingText: "Escalation Design",
        bodyText: "Weak escalation: 'Nothing is happening.' Better escalation: 'Water valve repair is blocked by outstanding budget approval. Maintenance submitted the quote. GM approval is requested by Friday to prevent further water loss.'"
      },
      {
        id: "c20-l5-b4",
        type: "decision_scenario",
        decisionIntro: "A department's printing reduction project is stalled because the IT team has not configured the default printer settings despite three requests.",
        decisionPrompt: "Select the most effective escalation path:",
        decisionChoices: [
          {
            label: "Complain to the IT technician in the hallway.",
            correct: false,
            feedback: "Incorrect. Informal complaints do not create documented escalation resolution."
          },
          {
            label: "Email the IT Director explaining that the printing reduction initiative is blocked, detailing the three previous requests, and requesting configuration authorization by Friday.",
            correct: true,
            feedback: "Correct. This email documents the blocker, the history, and requests a specific decision with a clear deadline."
          },
          {
            label: "Remove the printers without IT's knowledge.",
            correct: false,
            feedback: "Incorrect. This bypasses IT systems and causes operational conflicts."
          },
          {
            label: "Wait until the next annual review to report the issue.",
            correct: false,
            feedback: "Incorrect. Waiting a year to report a blocked initiative is ineffective tracking."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Build Accountability That Survives Staff Changes",
    minutes: 3,
    content: "Avoid single-champion dependence by embedding tasks in standard operational roles. Establish accessible record-keeping routines.",
    blocks: [
      {
        id: "c20-l6-b1",
        type: "heading",
        headingText: "Build Accountability That Survives Staff Changes"
      },
      {
        id: "c20-l6-b2",
        type: "short_text",
        bodyText: "Overdependence on a single sustainability champion is a major operational risk. If they leave or go on leave, progress halts, records may get lost, and process knowledge is lost.\n\nTo build resilient accountability: link tasks to job descriptions, store files in shared workspaces, implement standardized handovers, and ensure review routines are shared by multiple team members."
      },
      {
        id: "c20-l6-b3",
        type: "key_message",
        headingText: "Resilient Routines",
        bodyText: "Strong accountability is integrated into roles, records, and routines, not held only in one person’s memory."
      },
      {
        id: "c20-l6-b4",
        type: "commitment_scenario",
        commitmentPrompt: "Which step will you take to make sustainability accountability more resilient in your workplace?",
        commitmentChoices: [
          "Replace 'everyone' with a clear owner in one action",
          "Add an approver to one blocked action",
          "Document one escalation route",
          "Record one handover requirement",
          "Check whether one process depends too heavily on one person"
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "A sustainability action plan states: 'Everyone must reduce unnecessary printing.' No one is assigned to configure settings or review results. What is the main weakness?",
    options: [
      { text: "Employees should not participate in print reduction.", isCorrect: false, feedback: "Incorrect. Employee participation is important, but not sufficient on its own." },
      { text: "The action has no clear owner responsible for coordination, implementation, and review.", isCorrect: true, feedback: "Correct. Assigning responsibility to 'everyone' means no single role is accountable for managing or reviewing the progress." },
      { text: "Printing can never be reduced in a modern office environment.", isCorrect: false, feedback: "Incorrect. Printing can be reduced with proper settings and processes." },
      { text: "The action plan requires more environmental statistics before it can be assigned.", isCorrect: false, feedback: "Incorrect. Additional statistics will not solve the lack of clear ownership." }
    ],
    correctExplanation: "Shared participation is valuable, but it does not replace the need for a single, designated role responsible for coordinating the action and verifying its success.",
    incorrectExplanation: "Banning participation, declaring print reduction impossible, or demanding more statistics does not resolve the root problem of unassigned ownership.",
    practicalTakeaway: "Shared participation does not replace clear ownership."
  },
  {
    question: "A junior employee is assigned responsibility for replacing inefficient cooling equipment but does not have authority to approve capital purchases. What is the best response?",
    options: [
      { text: "Keep the employee fully accountable for completing the equipment replacement.", isCorrect: false, feedback: "Incorrect. The employee cannot complete the task if they lack purchase authority." },
      { text: "Cancel the equipment replacement action entirely.", isCorrect: false, feedback: "Incorrect. The energy-saving goal remains valid." },
      { text: "Assign ownership to a role with appropriate budget authority, keeping the junior employee involved in implementation or research.", isCorrect: true, feedback: "Correct. Responsibility must align with authority. The role that controls the budget should own the project, while junior staff support it." },
      { text: "Instruct the employee to purchase the equipment using their personal funds.", isCorrect: false, feedback: "Incorrect. Personal expenditure must not be expected for company assets." }
    ],
    correctExplanation: "To avoid project delays, task ownership must be matched to a role that possesses the relevant authority and process access to execute the decisions.",
    incorrectExplanation: "Leaving the employee blocked, cancelling the action, or expecting personal purchase ignores standard governance principles.",
    practicalTakeaway: "Owners need enough authority and access to move an action forward."
  },
  {
    question: "Procurement has identified a reusable alternative to a disposable staff cup, but the change is stuck waiting for a budget decision. Which role must be clarified?",
    options: [
      { text: "The individual employee who will use the cups.", isCorrect: false, feedback: "Incorrect. Users cannot approve procurement budgets." },
      { text: "The specific role authorized to approve the expenditure.", isCorrect: true, feedback: "Correct. The project is stuck because the approval boundary has not been clearly defined or assigned." },
      { text: "The platform administrator who maintains the sustainability tracker.", isCorrect: false, feedback: "Incorrect. Administrators update records but do not make budget decisions." },
      { text: "Every manager in the company.", isCorrect: false, feedback: "Incorrect. Having all managers approve creates confusion, not clarity." }
    ],
    correctExplanation: "Unclear approval boundaries are a common blocker. Identifying who has the authority to approve costs is critical for progression.",
    incorrectExplanation: "Blaming users, tracker admins, or involving all managers does not resolve the specific approval blocker.",
    practicalTakeaway: "Unclear approval responsibility can block an otherwise practical action."
  },
  {
    question: "Which entry in a progress log provides the clearest accountability?",
    options: [
      { text: "Owner: Everyone. Deadline: Soon.", isCorrect: false, feedback: "Incorrect. Vague owners and deadlines ensure the task is delayed." },
      { text: "Owner: Green Team. Review: Later.", isCorrect: false, feedback: "Incorrect. Collective owners and unspecified review dates lack accountability." },
      { text: "Owner: Facilities Manager. Support: Maintenance Supervisor. Due date: 20 September. Review date: 4 October.", isCorrect: true, feedback: "Correct. This entry logs a single owner role, a supporting role, and exact due and review dates." },
      { text: "Owner: Management. Status: Ongoing.", isCorrect: false, feedback: "Incorrect. 'Management' is too broad, and 'ongoing' lacks a firm target milestone." }
    ],
    correctExplanation: "Clear logging requires a specific owner role, supporting roles, and exact due and review dates to prevent tasks from being forgotten.",
    incorrectExplanation: "Group owners, vague dates, or broad labels like 'Management' do not provide individual accountability.",
    practicalTakeaway: "Good records identify the owner, support, deadline and review point."
  },
  {
    question: "A repair action has been delayed because budget approval has not been provided. What is the most appropriate escalation message?",
    options: [
      { text: "Management never helps with sustainability initiatives.", isCorrect: false, feedback: "Incorrect. This is an unhelpful complaint, not a structured escalation." },
      { text: "The valve repair is still blocked. Maintenance completed the assessment and submitted the quotation. Budget approval is required by Friday to prevent further water loss.", isCorrect: true, feedback: "Correct. This describes the issue, the action taken, the blocker, the required decision, and a specific deadline." },
      { text: "Someone should do something about the water leak.", isCorrect: false, feedback: "Incorrect. This does not specify the blocker or direct the message to a decision-maker." },
      { text: "Mark the action completed on the tracker to keep metrics high.", isCorrect: false, feedback: "Incorrect. Falsifying metrics hides unresolved leaks." }
    ],
    correctExplanation: "Effective escalation describes the blocker, the business impact, what has been done, and requests a specific decision with a deadline.",
    incorrectExplanation: "Broad complaints, vague statements, or falsified completions do not resolve the blocker.",
    practicalTakeaway: "Effective escalation explains the blocker and the required decision."
  },
  {
    question: "A department's sustainability coordinator goes on extended leave, and no other staff can access the progress tracker or files. What does this demonstrate?",
    options: [
      { text: "The coordinator was highly efficient and could not be replaced.", isCorrect: false, feedback: "Incorrect. Keeping files locked in personal storage is an operational failure, not efficiency." },
      { text: "The sustainability process depends too heavily on one individual.", isCorrect: true, feedback: "Correct. A resilient system stores data in shared drives and distributes access so work can continue during absences." },
      { text: "All sustainability actions should stop during staff leave.", isCorrect: false, feedback: "Incorrect. Operations and sustainability reviews should proceed consistently." },
      { text: "The files are no longer needed now that the coordinator is away.", isCorrect: false, feedback: "Incorrect. Historical records and active trackers are needed for reviews." }
    ],
    correctExplanation: "Sustainability actions are at risk if they depend entirely on one person. Resilient processes link tasks to roles and share access to records.",
    incorrectExplanation: "Praising poor data storage, stopping operations, or abandoning records ignores resilience principles.",
    practicalTakeaway: "Important sustainability processes should continue during staff absence or change."
  },
  {
    question: "An employee records monthly water-meter readings, while the Facilities Manager reviews the trends and authorizes repairs. Who owns the action?",
    options: [
      { text: "The employee recording the readings.", isCorrect: false, feedback: "Incorrect. Recording readings is a supporting task, not ownership of the outcome." },
      { text: "The Facilities Manager who reviews the data, identifies gaps, and coordinates repairs.", isCorrect: true, feedback: "Correct. The manager ensures follow-up action occurs, which represents the owner role." },
      { text: "Every individual person who uses water in the building.", isCorrect: false, feedback: "Incorrect. Users contribute to conservation but do not coordinate the tracking process." },
      { text: "The municipal utility provider.", isCorrect: false, feedback: "Incorrect. The utility provider is external and does not manage internal building operations." }
    ],
    correctExplanation: "The owner of an action is the role responsible for ensuring that the task moves forward and is reviewed, even if others perform supporting data collection.",
    incorrectExplanation: "Confusing supporting tasks, user participation, or external entities with ownership leads to gaps in tracking.",
    practicalTakeaway: "The owner ensures follow-up, even when others perform supporting tasks."
  },
  {
    question: "A corrective action has missed three deadlines because two departments disagree about who should lead it. What is the best next step?",
    options: [
      { text: "Leave both departments responsible for it collectively.", isCorrect: false, feedback: "Incorrect. Dual collective responsibility has already failed three times." },
      { text: "Remove the deadline from the tracker to avoid reporting failures.", isCorrect: false, feedback: "Incorrect. Deleting deadlines hides the delay rather than resolving it." },
      { text: "Escalate the issue to operational management for a clear ownership decision and log the agreed owner.", isCorrect: true, feedback: "Correct. Inter-departmental disputes that stall progress must be escalated to a manager who can assign clear roles." },
      { text: "Mark the action completed to close the issue.", isCorrect: false, feedback: "Incorrect. Closing an action before it is complete falsifies metrics." }
    ],
    correctExplanation: "Repeated delays caused by unclear ownership require escalation to management to make a binding assignment.",
    incorrectExplanation: "Continuing collective failure, removing deadlines, or falsifying completions does not resolve the conflict.",
    practicalTakeaway: "Repeated delays caused by unclear ownership require a documented decision."
  }
];

export async function ensureSustainabilityRolesAccountabilityCourse() {
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

      // 3. Resolve or insert Course 20
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

      // 4. Update Course 19 recommendedNextCourseId to point to Course 20 preserving admin edits
      let isSystemManaged = false;
      if (course19.recommendedNextCourseId) {
        const currentRecommendedCourse = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.id, course19.recommendedNextCourseId)
        });
        if (currentRecommendedCourse && currentRecommendedCourse.courseCode === "ELH-20") {
          isSystemManaged = true;
        }
      }

      if (course19.recommendedNextCourseId === null || course19.recommendedNextCourseId === actualCourseId || isSystemManaged) {
        await tx.update(coursesTable).set({
          recommendedNextCourseId: actualCourseId
        }).where(eq(coursesTable.id, course19.id));
      } else {
        logger.warn(`Recommendation conflict: Course 19 currently recommends course ID ${course19.recommendedNextCourseId} instead of Course 20 (ID: ${actualCourseId}). Preserving administrator edit.`);
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
          icon: "users",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 23,
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
