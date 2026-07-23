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

const COURSE_SLUG = "tracking-sustainability-actions-and-progress";
const COURSE_TITLE = "Tracking Sustainability Actions and Progress";
const BADGE_SLUG = "sustainability-progress-tracker";
const BADGE_CODE = "COURSE_ELH_17_COMPLETE";
const SEED_NAME = "tracking-sustainability-actions-and-progress-v1";

const COURSE_META = {
  courseCode: "ELH-17",
  description: "Learn how to turn sustainability goals into trackable workplace actions with clear owners, deadlines, progress indicators and proportionate evidence.",
  fullDescription: "Learn how to turn sustainability goals into trackable workplace actions with clear owners, deadlines, progress indicators and proportionate evidence. This course enables learners to maintain a reliable view of sustainability actions, identify delays early and communicate progress accurately.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/tracking-sustainability-actions-and-progress.jpg",
  intendedRoles: ["employees", "managers", "department representatives", "sustainability teams", "HR teams", "operations leads", "facilities coordinators"],
  learningObjectives: [
    "Convert a broad sustainability goal into specific trackable actions.",
    "Assign one accountable owner while identifying supporting contributors.",
    "Set realistic deadlines, milestones and review dates.",
    "Apply consistent action-status definitions.",
    "Select simple and relevant progress indicators.",
    "Identify suitable evidence for different workplace actions.",
    "Recognise delayed, blocked or poorly defined actions.",
    "Prepare a basic sustainability action tracker and progress update."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Tracking Sustainability Actions and Progress. You can now establish and maintain a reliable view of sustainability actions, identify delays early, and report progress accurately.",
  badgeName: "Sustainability Progress Tracker",
  badgeDescription: "Awarded for completing Tracking Sustainability Actions and Progress and demonstrating the ability to assign ownership, monitor delivery, use suitable indicators and maintain credible evidence.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "A Goal Is Not Yet an Action",
    minutes: 3,
    content: "Explain that a broad goal needs to be broken down into specific tasks. Understand the key concepts: Goal, Action, Owner, Deadline, Indicator, and Evidence, and learn how to write trackable actions.",
    blocks: [
      {
        id: "c17-l1-b1",
        type: "heading",
        headingText: "A Goal Is Not Yet an Action"
      },
      {
        id: "c17-l1-b2",
        type: "short_text",
        bodyText: "A department agrees to: 'Reduce unnecessary electricity use.' Three months later, nothing has changed, and nobody knows who was responsible, when it should have started, or how progress was measured. This is because a goal is not yet an action.\n\nTo track progress, we must convert broad goals into specific tasks. A goal is the intended result. An action is a specific task contributing to the goal. Every action needs one accountable owner, a deadline, a simple indicator, and proportionate evidence."
      },
      {
        id: "c17-l1-b3",
        type: "key_message",
        headingText: "Trackable Action Rule",
        bodyText: "A trackable action must define the task, name a single owner, specify a deadline, and declare a clear completion condition."
      },
      {
        id: "c17-l1-b4",
        type: "decision_scenario",
        decisionIntro: "A company wants to reduce paper waste. Which action is most trackable?",
        decisionPrompt: "Select the most trackable option:",
        decisionChoices: [
          {
            label: "Avoid wasting paper in the office",
            correct: false,
            feedback: "Incorrect. This is a general behavior plea, not a specific, trackable task."
          },
          {
            label: "Reduce printing whenever possible",
            correct: false,
            feedback: "Incorrect. This has no owner, no deadline, and no clear way to verify completion."
          },
          {
            label: "Office Administrator to activate double-sided printing as default on all shared printers by 15 October and confirm completion through a printer-settings check",
            correct: true,
            feedback: "Correct. This defines the task, a single owner, a clear deadline, and verifiable evidence of completion."
          },
          {
            label: "Become a paperless office by the end of the year",
            correct: false,
            feedback: "Incorrect. This is a high-level goal, not a specific action task."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "One Action, One Accountable Owner",
    minutes: 3,
    content: "Clarify ownership without excluding collaboration. Understand the difference between owners, contributors, approvers, reviewers, and sponsors, and learn why actions should never be assigned to a group.",
    blocks: [
      {
        id: "c17-l2-b1",
        type: "heading",
        headingText: "One Action, One Accountable Owner"
      },
      {
        id: "c17-l2-b2",
        type: "short_text",
        bodyText: "An action may involve several people, but only one person should be accountable for coordinating and ensuring it progresses. Assigning an action to 'everyone', 'the sustainability team', or 'management' leads to shared ambiguity and zero progress.\n\nDistinguish roles: the Owner ensures the action progresses, Contributors complete parts of the work, Approvers authorize decisions/costs, Reviewers check results, and Sponsors remove organizational barriers."
      },
      {
        id: "c17-l2-b3",
        type: "key_message",
        headingText: "Clear Accountability",
        bodyText: "Shared work does not require shared ambiguity. Record contributors to show who is helping, but maintain exactly one named owner who is accountable."
      },
      {
        id: "c17-l2-b4",
        type: "decision_scenario",
        decisionIntro: "A waste sorting update requires Procurement to buy labels, Facilities to install them, cleaning contractors to receive instructions, and HR to notify staff. Who should own the overall action?",
        decisionPrompt: "Select the most appropriate owner:",
        decisionChoices: [
          {
            label: "Assign the action to 'all departments' to ensure complete alignment",
            correct: false,
            feedback: "Incorrect. Assigning to 'all departments' means no single department is responsible for tracking or driving it."
          },
          {
            label: "Assign it to the Facilities Coordinator as the Owner, and list Procurement, HR, and the Cleaning Supervisor as Contributors",
            correct: true,
            feedback: "Correct. This gives one role the responsibility to coordinate the tasks and track progress, while clarifying who else needs to help."
          },
          {
            label: "Do not assign an owner and let the sustainability committee review progress monthly",
            correct: false,
            feedback: "Incorrect. Without an owner, the committee will have no results to review; someone must drive the action."
          },
          {
            label: "Assign it to the CEO since it involves multiple departments",
            correct: false,
            feedback: "Incorrect. The CEO is a sponsor, not the operational coordinator. Ownership should sit at the coordinate level."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Deadlines, Milestones and Review Dates",
    minutes: 3,
    content: "Learn how to use milestones, review dates, and dependencies to manage long-term sustainability actions, ensuring delays or obstacles are caught and resolved early.",
    blocks: [
      {
        id: "c17-l3-b1",
        type: "heading",
        headingText: "Deadlines, Milestones and Review Dates"
      },
      {
        id: "c17-l3-b2",
        type: "short_text",
        bodyText: "Long-term actions cannot be completed overnight. Relying only on a distant final deadline hides delays until it is too late. Milestones represent important intermediate checkpoints that make progress or blocks visible earlier.\n\nUse Review Dates to formally check progress, and map out Dependencies (things that must happen before an action can proceed) to plan work sequences logically."
      },
      {
        id: "c17-l3-b3",
        type: "key_message",
        headingText: "Sequence Example",
        bodyText: "Action: Introduce reusable delivery crates with a supplier. Milestones: 1. Confirm operational requirements. 2. Obtain supplier proposal. 3. Approve trial. 4. Run one-month pilot. 5. Review metrics. 6. Decide on expansion."
      },
      {
        id: "c17-l3-b4",
        type: "decision_scenario",
        decisionIntro: "Which milestone sequence is most logical for implementing a water-leak inspection program?",
        decisionPrompt: "Select the logical milestone order:",
        decisionChoices: [
          {
            label: "1. Run inspector briefings. 2. Purchase equipment. 3. Finalize inspection route. 4. Perform check and log evidence",
            correct: false,
            feedback: "Incorrect. You cannot brief inspectors effectively on the route before it is finalized or before equipment is selected."
          },
          {
            label: "1. Finalize inspection route and select equipment. 2. Brief inspectors on route and log tool usage. 3. Perform Q1 checks and log evidence",
            correct: true,
            feedback: "Correct. This defines the process and tools first, trains the staff next, and then schedules execution and evidence collection."
          },
          {
            label: "1. Conduct the inspections. 2. Plan the route. 3. Purchase tools. 4. Record evidence",
            correct: false,
            feedback: "Incorrect. You cannot conduct structured inspections before planning the route or buying the necessary tools."
          },
          {
            label: "1. Report progress to managers. 2. Do checks. 3. Set up the log files",
            correct: false,
            feedback: "Incorrect. Setting up the log and doing the checks must happen before you can report progress to managers."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Use Statuses Consistently",
    minutes: 3,
    content: "Apply consistent action-status definitions: Not started, In progress, Blocked, Delayed, Completed, and Cancelled. Avoid optimism and base status strictly on factual progress.",
    blocks: [
      {
        id: "c17-l4-b1",
        type: "heading",
        headingText: "Use Statuses Consistently"
      },
      {
        id: "c17-l4-b2",
        type: "short_text",
        bodyText: "Using a consistent set of status definitions ensures progress reports are accurate. Status must be based on facts, not optimism. An action is not 'in progress' merely because it has been discussed.\n\nUse: Not started (no work begun), In progress (work active), Blocked (stuck due to decision, resource, or dependency), Delayed (active but behind schedule), Completed (completion condition achieved), Cancelled (formally stopped)."
      },
      {
        id: "c17-l4-b3",
        type: "key_message",
        headingText: "Handling Blockers",
        bodyText: "When an action is 'Blocked,' always record what is blocking it, who must make the decision, and the escalation date. Do not leave blocked actions marked as 'in progress.'"
      },
      {
        id: "c17-l4-b4",
        type: "decision_scenario",
        decisionIntro: "A supplier proposal for new waste bins has been received, but budget approval has been pending with the finance manager for six weeks and work cannot proceed. What is the correct status?",
        decisionPrompt: "Select the most accurate status:",
        decisionChoices: [
          {
            label: "In progress - because we are waiting for the proposal to be reviewed",
            correct: false,
            feedback: "Incorrect. The proposal is received; work is completely stopped waiting for approval. Marking it 'in progress' hides the delay."
          },
          {
            label: "Blocked - because budget approval is pending with Finance and no operational steps can continue",
            correct: true,
            feedback: "Correct. This accurately flags that progress has stopped due to an external decision/dependency, making it clear where action is needed."
          },
          {
            label: "Delayed - because the final delivery date will be missed",
            correct: false,
            feedback: "Incorrect. While it may be delayed eventually, the immediate state is 'Blocked' because it cannot progress until the budget is approved."
          },
          {
            label: "Completed - because the proposal phase is finished",
            correct: false,
            feedback: "Incorrect. The action was to install the bins, not just collect proposals; the work is far from complete."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Indicators and Evidence That Are Useful",
    minutes: 3,
    content: "Distinguish activity indicators from result indicators. Select relevant, proportionate evidence (photos, invoices, logs, meter readings) to back up progress claims without creating unnecessary paperwork.",
    blocks: [
      {
        id: "c17-l5-b1",
        type: "heading",
        headingText: "Indicators and Evidence That Are Useful"
      },
      {
        id: "c17-l5-b2",
        type: "short_text",
        bodyText: "Indicators check if progress is occurring. Activity indicators show what was done (e.g. number of staff trained). Result indicators show what changed (e.g. waste contamination rates).\n\nProgress claims should be backed by proportionate evidence (attendance logs, invoices, photos, meter logs, purchasing receipts). Collect only what is useful; do not create unnecessary administrative paperwork."
      },
      {
        id: "c17-l5-b3",
        type: "key_message",
        headingText: "Evidence Principle",
        bodyText: "Evidence should fit the action. A photo of a bin is enough to verify installation; a complex engineering report is not needed for simple changes."
      },
      {
        id: "c17-l5-b4",
        type: "decision_scenario",
        decisionIntro: "Which combination of indicator and evidence is most relevant for a workplace water-leak inspection program?",
        decisionPrompt: "Select the best indicator/evidence mix:",
        decisionChoices: [
          {
            label: "Indicator: Number of plumbing catalogs reviewed. Evidence: Catalog list.",
            correct: false,
            feedback: "Incorrect. Reviewing catalogs is research, not an action that tracks leak inspections or water savings."
          },
          {
            label: "Indicator: Percentage of bathrooms inspected weekly. Evidence: Signed bathroom log sheets and repair invoices.",
            correct: true,
            feedback: "Correct. Bathroom inspection rate is a direct activity indicator, and log sheets/invoices provide verifiable evidence of action."
          },
          {
            label: "Indicator: Annual Mauritian rainfall statistics. Evidence: Meteorological report.",
            correct: false,
            feedback: "Incorrect. Rainfall is external weather data and does not measure the company's leak repair performance."
          },
          {
            label: "Indicator: Total number of office taps. Evidence: Map of sinks.",
            correct: false,
            feedback: "Incorrect. Sinks count is static asset data; it does not indicate whether leaks are being inspected or repaired."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Build and Review the Action Tracker",
    minutes: 3,
    content: "Examine the fields of a simple action tracker. Learn how to conduct a progress review, identify poorly defined tasks, and choose a practical tracking improvement to implement in your workplace.",
    blocks: [
      {
        id: "c17-l6-b1",
        type: "heading",
        headingText: "Build and Review the Action Tracker"
      },
      {
        id: "c17-l6-b2",
        type: "short_text",
        bodyText: "A simple action tracker holds: Goal, Action, Owner, Contributors, Deadline, Milestones, Status, Indicator, Evidence, and Blockers.\n\nRegular progress reviews check what has been completed, what is delayed/blocked, what decisions are needed, and what happens next. If a team claims 80% progress but has no defined owners or deadlines, the percentage is not reliable because the actions are poorly defined."
      },
      {
        id: "c17-l6-b3",
        type: "key_message",
        headingText: "Review Questions",
        bodyText: "At each progress review, focus on: Completed actions (backed by evidence) and Delayed/Blocked actions (to resolve obstacles)."
      },
      {
        id: "c17-l6-b4",
        type: "commitment_scenario",
        commitmentPrompt: "Which tracking improvement would be most useful in your workplace?",
        commitmentChoices: [
          "Clarify an action owner",
          "Add a realistic deadline",
          "Define a completion condition",
          "Identify suitable evidence",
          "Record a blocker",
          "Schedule a progress review"
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "A department has agreed to reduce unnecessary printing. Which action represents the most trackable workplace action?",
    options: [
      { text: "Employees should avoid wasting paper.", isCorrect: false, feedback: "Incorrect. This is a general advice plea, not a specific, trackable action." },
      { text: "Reduce printing whenever possible.", isCorrect: false, feedback: "Incorrect. This has no owner, deadline, or completion condition." },
      { text: "Office Administrator to activate double-sided printing as the default on all shared printers by 15 October and confirm completion through a printer-settings check.", isCorrect: true, feedback: "Correct. This defines the task, a single owner, a clear deadline, and verifiable evidence." },
      { text: "Become a paperless office.", isCorrect: false, feedback: "Incorrect. This is a goal description, not a trackable operational action." }
    ],
    correctExplanation: "Trackable actions define a specific task, a single accountable owner, a deadline, and clear completion evidence.",
    incorrectExplanation: "Vague slogans, advice pleas, or high-level goals lack the accountability structure needed for progress tracking.",
    practicalTakeaway: "Convert vague goals into tasks with one owner, a deadline, and a verifiable completion condition."
  },
  {
    question: "Who should be recorded as the owner when a waste-reduction initiative involves tasks across multiple departments?",
    options: [
      { text: "Assign the action to 'all departments' to ensure shared responsibility.", isCorrect: false, feedback: "Incorrect. Assigning it to 'everyone' leads to a lack of individual accountability." },
      { text: "One named role or coordinator who is accountable for coordinating the action, listing other department roles as contributors.", isCorrect: true, feedback: "Correct. One owner must drive coordination, even if multiple contributors perform specific steps." },
      { text: "The CEO, to make sure all departments comply.", isCorrect: false, feedback: "Incorrect. The CEO is a sponsor, not the operational coordinator who tracks daily actions." },
      { text: "The external cleaning contractor supervisor.", isCorrect: false, feedback: "Incorrect. External contractors support the action but are not accountable for the company's internal coordination." }
    ],
    correctExplanation: "To prevent ambiguity, every action must have exactly one accountable owner, regardless of how many contributors are involved.",
    incorrectExplanation: "Group assignments, executive sponsors, or external parties do not replace the need for a single, accountable coordinator.",
    practicalTakeaway: "Never leave an action without a single owner. Use contributors to list supporting roles."
  },
  {
    question: "A facilities coordinator needs to install energy-saving LED lighting but requires budget approval from the finance manager. Who is the owner and who is the approver?",
    options: [
      { text: "The finance manager is the owner, and the facilities coordinator is the contributor.", isCorrect: false, feedback: "Incorrect. The facilities coordinator is driving the task; the finance manager only approves funding." },
      { text: "The facilities coordinator is the owner, and the finance manager is the approver.", isCorrect: true, feedback: "Correct. The coordinator is accountable for delivering the installation, and the finance manager authorizes the cost." },
      { text: "They are co-owners of the action to ensure cost-efficiency.", isCorrect: false, feedback: "Incorrect. Co-ownership dilutes responsibility. The operational lead must own the action." },
      { text: "The electrical supplier is the owner, and the facilities coordinator is the reviewer.", isCorrect: false, feedback: "Incorrect. The external supplier is a contributor; the coordinator owns the task." }
    ],
    correctExplanation: "The person driving and coordinating the task is the Owner. The person authorizing budget or decisions is the Approver.",
    incorrectExplanation: "Co-ownership or making the approver/supplier the owner creates operational confusion.",
    practicalTakeaway: "Keep ownership with the operational driver, and list budget sign-off roles as Approvers."
  },
  {
    question: "Why should a six-month energy efficiency project include intermediate milestones?",
    options: [
      { text: "To hide delays from senior management until the final deadline.", isCorrect: false, feedback: "Incorrect. Milestones increase transparency and show delays early." },
      { text: "To replace the final completion deadline entirely.", isCorrect: false, feedback: "Incorrect. Milestones support the final deadline, they do not replace it." },
      { text: "To break down a long-term goal and make obstacles or delays visible early.", isCorrect: true, feedback: "Correct. Checking milestones allows teams to catch delays and adjust plans before the final date is missed." },
      { text: "To double the project budget.", isCorrect: false, feedback: "Incorrect. Milestones track progress, they do not impact budget allocations." }
    ],
    correctExplanation: "Milestones serve as checkpoints during long-term actions, allowing teams to identify and resolve issues early.",
    incorrectExplanation: "Hiding delays, replacing deadlines, or budget adjustments are not the purpose of milestones.",
    practicalTakeaway: "Use milestones to catch delays early. Do not rely solely on a distant final deadline."
  },
  {
    question: "A recycling bin installation is on hold because the supplier has run out of stock and cannot deliver for four weeks. What is the correct status?",
    options: [
      { text: "In progress - because we have selected the supplier.", isCorrect: false, feedback: "Incorrect. Work has stopped because we cannot get the bins. Hiding this blocker is misleading." },
      { text: "Delayed - because the final date is uncertain.", isCorrect: false, feedback: "Incorrect. While it may be delayed, the immediate cause is an external dependency that is blocking further steps." },
      { text: "Blocked - because progress cannot continue due to an external supply dependency.", isCorrect: true, feedback: "Correct. This flags that work is completely stopped due to a dependency, highlighting where attention is needed." },
      { text: "Completed - because the order has been placed.", isCorrect: false, feedback: "Incorrect. The bins are not installed; the action is incomplete." }
    ],
    correctExplanation: "An action is Blocked when progress has stopped entirely due to an external decision, resource shortage, or dependency.",
    incorrectExplanation: "Marking blocked actions as 'in progress' or 'delayed' hides the specific obstacle stopping the work.",
    practicalTakeaway: "Mark stopped actions as 'Blocked' and record the obstacle, decision needed, and next review date."
  },
  {
    question: "What is the difference between an activity indicator and a result indicator in sustainability tracking?",
    options: [
      { text: "Activity indicators measure what was done; result indicators measure what changed.", isCorrect: true, feedback: "Correct. Activity tracks task execution (e.g. training completed), while result tracks impact (e.g. energy saved)." },
      { text: "Activity indicators are for employees; result indicators are only for CEOs.", isCorrect: false, feedback: "Incorrect. Both indicators are useful at all organizational levels to monitor action progress." },
      { text: "Activity indicators use numbers; result indicators only use text descriptions.", isCorrect: false, feedback: "Incorrect. Both indicator types should use specific, supportable data." },
      { text: "There is no difference; the terms are interchangeable.", isCorrect: false, feedback: "Incorrect. Distinguishing them helps check if actions are achieving their intended outcomes." }
    ],
    correctExplanation: "Activity indicators track task completion (inputs/actions). Result indicators track the environmental impact (outputs/outcomes).",
    incorrectExplanation: "Role-based limits, data formats, or treating them as identical are incorrect descriptions.",
    practicalTakeaway: "Track both: activity indicators prove the action occurred, and result indicators prove it worked."
  },
  {
    question: "A department is tracking an action: 'Inspect all plumbing fixtures for water leaks weekly.' What is the most proportionate evidence to support this?",
    options: [
      { text: "A detailed engineering study of Mauritian water infrastructure.", isCorrect: false, feedback: "Incorrect. This is external research and does not verify weekly inspection tasks." },
      { text: "Signed weekly inspection logs showing dates, rooms checked, and any repairs made.", isCorrect: true, feedback: "Correct. signed logs directly verify weekly inspections and repair details without excess paperwork." },
      { text: "An verbal statement from the manager saying everything is fine.", isCorrect: false, feedback: "Incorrect. Verbal statements are not verifiable records and do not represent credible evidence." },
      { text: "A video of every single bathroom faucet.", isCorrect: false, feedback: "Incorrect. Taking weekly videos of all taps is excessive and creates unnecessary administration." }
    ],
    correctExplanation: "Evidence must be proportionate to the action. Signed logs and repair logs verify inspections cleanly without administrative waste.",
    incorrectExplanation: "Infrastructure reports (irrelevant), verbal claims (unverifiable), or video logs (excessive) are not proportionate.",
    practicalTakeaway: "Keep evidence simple and proportionate—such as a checklist log, photo, or invoice."
  },
  {
    question: "During a progress review, a team reports 80% of its actions are 'in progress,' but none has an owner, deadline, or completion condition. How should the manager respond?",
    options: [
      { text: "Accept the update and congratulate the team on their progress.", isCorrect: false, feedback: "Incorrect. The 80% is not reliable because the actions are not defined." },
      { text: "Tell the team that the progress percentage is unreliable, and work with them to define owners, deadlines, and completion conditions.", isCorrect: true, feedback: "Correct. Vague actions cannot be tracked. Defining owners and deadlines makes the tracking data reliable." },
      { text: "Cancel the initiative immediately due to poor reporting.", isCorrect: false, feedback: "Incorrect. This is too severe; the constructive step is to clarify the action tracker." },
      { text: "Increase the goal to 100% to force them to complete the work.", isCorrect: false, feedback: "Incorrect. Raising targets on undefined actions only increases confusion." }
    ],
    correctExplanation: "Progress tracking metrics are meaningless if the underlying actions lack owners, deadlines, and clear completion criteria.",
    incorrectExplanation: "Accepting unreliable numbers, cancelling, or raising targets fails to establish the necessary task structure.",
    practicalTakeaway: "Never track vague actions. Ensure every task has a named owner, deadline, and completion evidence."
  }
];

export async function ensureTrackingSustainabilityActionsCourse() {
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

      // 2. Resolve Course 16
      let course16 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-16")
      });
      if (!course16) {
        course16 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "communicating-sustainability-at-work")
        });
      }

      if (!course16) {
        throw new Error("Data integrity error: Course 16 (ELH-16) not found. Prerequisite cannot be established.");
      }

      // 3. Resolve or insert Course 17
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

      // 4. Update Course 16 recommendedNextCourseId to point to Course 17 preserving admin edits
      let isSystemManaged = false;
      if (course16.recommendedNextCourseId) {
        const currentRecommendedCourse = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.id, course16.recommendedNextCourseId)
        });
        if (currentRecommendedCourse && currentRecommendedCourse.courseCode === "ELH-17") {
          isSystemManaged = true;
        }
      }

      if (course16.recommendedNextCourseId === null || course16.recommendedNextCourseId === actualCourseId || isSystemManaged) {
        await tx.update(coursesTable).set({
          recommendedNextCourseId: actualCourseId
        }).where(eq(coursesTable.id, course16.id));
      } else {
        logger.warn(`Recommendation conflict: Course 16 currently recommends course ID ${course16.recommendedNextCourseId} instead of Course 17 (ID: ${actualCourseId}). Preserving administrator edit.`);
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
          icon: "check-square",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 20,
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
      // Prerequisite 1: Course 16
      const existingPrereq16 = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course16.id)
        )
      });
      if (!existingPrereq16) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course16.id
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
