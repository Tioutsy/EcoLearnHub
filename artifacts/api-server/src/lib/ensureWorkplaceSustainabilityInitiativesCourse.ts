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

const COURSE_SLUG = "planning-and-delivering-workplace-sustainability-initiatives";
const COURSE_TITLE = "Planning and Delivering Workplace Sustainability Initiatives";
const BADGE_SLUG = "workplace-initiative-coordinator";
const BADGE_CODE = "COURSE_ELH_23_COMPLETE";
const SEED_NAME = "workplace-sustainability-initiatives-v1";

const COURSE_META = {
  courseCode: "ELH-23",
  description: "Learn how to turn a useful sustainability idea into a clearly scoped workplace initiative, coordinate delivery, respond to obstacles and review whether the initiative achieved its intended result.",
  fullDescription: "Learn how to turn a useful sustainability idea into a clearly scoped workplace initiative, coordinate delivery, respond to obstacles and review whether the initiative achieved its intended result.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/planning-and-delivering-workplace-sustainability-initiatives.jpg",
  intendedRoles: ["employees", "supervisors", "managers", "sustainability coordinators", "green-team members"],
  learningObjectives: [
    "Define the workplace problem before proposing a solution.",
    "Compare potential initiatives using practical selection criteria.",
    "Establish a clear scope, intended result and approval boundary.",
    "Assign responsibilities and manageable milestones.",
    "Identify operational risks and respond to delivery obstacles.",
    "Gather proportionate evidence of implementation and results.",
    "Recommend whether an initiative should continue, change, expand or stop."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Planning and Delivering Workplace Sustainability Initiatives. You can now turn sustainability ideas into structured, scoped, and reviewable workplace initiatives.",
  badgeName: "Workplace Initiative Coordinator",
  badgeDescription: "Awarded for demonstrating practical understanding of how to turn a useful sustainability idea into a clearly scoped workplace initiative, coordinate delivery, respond to obstacles and review whether the initiative achieved its intended result.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "From a Good Idea to a Workable Initiative",
    minutes: 3,
    content: "Distinguish broad ambitions and communication messages from clearly defined workplace initiatives with owners, scope, and target outcomes.",
    blocks: [
      {
        id: "c23-l1-b1",
        type: "heading",
        headingText: "From a Good Idea to a Workable Initiative"
      },
      {
        id: "c23-l1-b2",
        type: "short_text",
        bodyText: "Saying 'we should reduce waste' is a broad ambition, not a workable initiative. A true initiative requires a defined workplace problem, specific area, owner, timeframe, and a way to verify if anything changed. Sustainability projects should solve real issues on the floor rather than just making the company look active.\n\nFor example, if a Mauritian hotel green team notices returned unopened breakfast buffet items, 'reducing food waste' is too broad. A workable initiative is: 'Record returned buffet items for 4 weeks, identify the top 3 wasted items, and adjust replenishment quantities with approval from the F&B manager.'"
      },
      {
        id: "c23-l1-b3",
        type: "key_message",
        headingText: "Initiative Focus",
        bodyText: "Start with a specific workplace issue rather than a vague environmental slogan or general campaign."
      },
      {
        id: "c23-l1-b4",
        type: "decision_scenario",
        decisionIntro: "Which statement represents a clearly defined, manageable workplace sustainability initiative?",
        decisionPrompt: "Select the workable initiative:",
        decisionChoices: [
          {
            label: "Become a greener and more eco-friendly office workspace.",
            correct: false,
            feedback: "Incorrect. This is a broad corporate ambition, not a scoped project."
          },
          {
            label: "Display a recycling reminder poster near the office printer.",
            correct: false,
            feedback: "Incorrect. This is a communication message without a defined process or target result."
          },
          {
            label: "Reduce unnecessary colour printing in the administration department over a six-week period by setting default printing profiles.",
            correct: true,
            feedback: "Correct. This statement specifies the problem area (colour printing in admin), a timeline (six weeks), a clear action, and is measurable."
          },
          {
            label: "Ask the facilities maintenance team to check for water leaks.",
            correct: false,
            feedback: "Incorrect. This represents an ongoing operational maintenance responsibility, not a temporary initiative."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Define the Problem Before Choosing the Solution",
    minutes: 3,
    content: "Differentiate symptoms from causes. Investigate what, where, when, and who before purchasing tools or proposing solutions.",
    blocks: [
      {
        id: "c23-l2-b1",
        type: "heading",
        headingText: "Define the Problem Before Choosing the Solution"
      },
      {
        id: "c23-l2-b2",
        type: "short_text",
        bodyText: "Do not buy tools or bins before you understand why a process fails. Distinguish symptoms from causes:\n- Symptom: Recyclable bottles are found in general waste bins.\n- Cause: Bins are badly located, labels are missing, contractor schedules conflict, or staff instructions are unclear.\n\nAt a Mauritian retail outlet, air-conditioning was left running after hours. Proposing a reminder email was a symptom fix. The actual cause was that closing staff did not control the system controls and assumed security handled it. The real problem was unclear shutdown responsibility, not a lack of awareness."
      },
      {
        id: "c23-l2-b3",
        type: "key_message",
        headingText: "Investigate first",
        bodyText: "Always observe the process on the floor and discuss it with the operators before deciding on equipment or policies."
      },
      {
        id: "c23-l2-b4",
        type: "decision_scenario",
        decisionIntro: "Employees regularly pile unflattened cardboard box waste beside a recycling cage instead of placing them inside. What is the most appropriate first action?",
        decisionPrompt: "Select the first action:",
        decisionChoices: [
          {
            label: "Issue a formal written warning to all department staff.",
            correct: false,
            feedback: "Incorrect. Punishing staff before understanding workflow barriers damages trust."
          },
          {
            label: "Purchase a larger recycling cage immediately.",
            correct: false,
            feedback: "Incorrect. You do not know if cage size is the actual barrier."
          },
          {
            label: "Observe the waste disposal area during shift changes and talk to the employees handling the boxes.",
            correct: true,
            feedback: "Correct. Speaking with the operators helps identify if the barrier is time constraints, cage lock issues, or box cutting tool availability."
          },
          {
            label: "Remove the cardboard recycling program completely.",
            correct: false,
            feedback: "Incorrect. This abandons the goal without addressing the operational process."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Select the Right Initiative",
    minutes: 3,
    content: "Evaluate ideas using practical comparison criteria like benefit, effort, risk, cost, and feasibility. Prioritize achievable first steps.",
    blocks: [
      {
        id: "c23-l3-b1",
        type: "heading",
        headingText: "Select the Right Initiative"
      },
      {
        id: "c23-l3-b2",
        type: "short_text",
        bodyText: "Compare initiative ideas on feasibility, not just maximum theoretical impact. Consider expected environmental benefit, operational effort, capital cost, time, and safety. A smaller, highly feasible initiative that succeeds builds team confidence and data for future investment."
      },
      {
        id: "c23-l3-b3",
        type: "key_message",
        headingText: "Comparison Matrix",
        bodyText: "A workable project balances potential impact with current budget boundaries and operational risk."
      },
      {
        id: "c23-l3-b4",
        type: "decision_scenario",
        decisionIntro: "A manufacturing plant wants to reduce energy use. The green team is comparing replacing production line machinery (high cost, high impact), improving compressed-air shutdown checks (low cost, immediate impact), and running a slogan contest (low cost, no direct impact).",
        decisionPrompt: "Which project is the best first initiative?",
        decisionChoices: [
          {
            label: "Replacing the production machinery because it has the largest impact.",
            correct: false,
            feedback: "Incorrect. This requires significant capital and technical reviews, making it a poor immediate first step for a green team."
          },
          {
            label: "Running the environmental slogan competition because it is the easiest to start.",
            correct: false,
            feedback: "Incorrect. Slogans do not directly address energy waste on the floor."
          },
          {
            label: "Improving shutdown checks for compressed-air equipment because it is low-cost, manageable, and has direct verifiable impact.",
            correct: true,
            feedback: "Correct. This project is highly feasible, operationally relevant, and delivers immediate energy reductions within the team's coordination scope."
          },
          {
            label: "Do both the machinery replacement and slogan contest simultaneously.",
            correct: false,
            feedback: "Incorrect. This overloads resources and mixes high-capital projects with low-impact campaigns."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Define Scope, Responsibilities and Milestones",
    minutes: 3,
    content: "Turn initiatives into delivery plans. Define operational areas, assign named roles, set milestones, and establish scope boundaries.",
    blocks: [
      {
        id: "c23-l4-b1",
        type: "heading",
        headingText: "Define Scope, Responsibilities and Milestones"
      },
      {
        id: "c23-l4-b2",
        type: "short_text",
        bodyText: "A clear plan specifies: included area, excluded zones, target results, owners, required approvals, dates, and escalation paths. Assign responsibilities to named roles (e.g. 'Facilities Assistant') rather than 'everyone'. Keep scope controlled: an office printing initiative should not expand into general IT procurement reforms without approval."
      },
      {
        id: "c23-l4-b3",
        type: "key_message",
        headingText: "Responsibility Rule",
        bodyText: "If everyone is responsible for an action, then no one is accountable. Always name a specific coordinator."
      },
      {
        id: "c23-l4-b4",
        type: "decision_scenario",
        decisionIntro: "A green team drafts a plan: 'Reduce office paper use. Staff will check printers. Review in July.' Which critical element is missing?",
        decisionPrompt: "Identify the missing planning detail:",
        decisionChoices: [
          {
            label: "The selection of a green team slogan.",
            correct: false,
            feedback: "Incorrect. Slogans are not operational planning requirements."
          },
          {
            label: "A named owner, specific checklist printer areas, required manager approvals, and the source of paper consumption evidence.",
            correct: true,
            feedback: "Correct. Without a defined owner, clear scope boundaries, approval steps, and verification data, the plan cannot be monitored or executed."
          },
          {
            label: "A spreadsheet to calculate carbon savings.",
            correct: false,
            feedback: "Incorrect. Detailed carbon formulas are not required for task assignment and execution."
          },
          {
            label: "Weekly department presentations.",
            correct: false,
            feedback: "Incorrect. Reporting should be simple and structured, not cause meeting fatigue."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Deliver the Initiative and Respond to Obstacles",
    minutes: 3,
    content: "Handle operational obstacles. Learn the response sequence to adjust within scope, notify managers, or pause unsafe tasks.",
    blocks: [
      {
        id: "c23-l5-b1",
        type: "heading",
        headingText: "Deliver the Initiative and Respond to Obstacles"
      },
      {
        id: "c23-l5-b2",
        type: "short_text",
        bodyText: "Obstacles are normal: equipment delays, shift changes, contractor conflicts, or safety issues. Follow a safe response sequence: (1) confirm changes, (2) identify the barrier, (3) adjust within approved scope, (4) record modifications, (5) escalate outside decisions, and (6) pause the task if safety or operational risk is not controlled."
      },
      {
        id: "c23-l5-b3",
        type: "key_message",
        headingText: "Operations First",
        bodyText: "Sustainability initiatives must support safe, efficient daily business operations and must never conflict with safety paths."
      },
      {
        id: "c23-l5-b4",
        type: "decision_scenario",
        decisionIntro: "A new kitchen glass-sorting container is blocking an emergency fire exit corridor. Kitchen staff complain it slows down food service exit access.",
        decisionPrompt: "What should the team coordinator do?",
        decisionChoices: [
          {
            label: "Ask staff to be careful and leave the bin in place since recycling is a priority.",
            correct: false,
            feedback: "Incorrect. Safety must never be compromised for environmental goals."
          },
          {
            label: "Remove the glass container immediately, temporarily suspend glass collection in that corridor, notify the safety manager, and find a safer layout.",
            correct: true,
            feedback: "Correct. Safety hazards must be resolved immediately by pausing the hazard, notifying safety officers, and relocating the container."
          },
          {
            label: "Wait until the next scheduled monthly green team meeting to discuss it.",
            correct: false,
            feedback: "Incorrect. Exit blockages represent immediate safety hazards that cannot wait for monthly meetings."
          },
          {
            label: "Tell the kitchen staff to use a different corridor exit.",
            correct: false,
            feedback: "Incorrect. Re-routing emergency paths requires formal authorization, not green team direction."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Review Results and Decide What Happens Next",
    minutes: 3,
    content: "Evaluate projects honestly using counts, invoices, or feedback. Make clear recommendations to continue, adjust, expand, or stop.",
    blocks: [
      {
        id: "c23-l6-b1",
        type: "heading",
        headingText: "Review Results and Decide What Happens Next"
      },
      {
        id: "c23-l6-b2",
        type: "short_text",
        bodyText: "Review questions: Was it delivered? What evidence was gathered? Did results change? What worked or failed? Decide: continue, adjust, repeat, replace, expand, or stop. Stopping an ineffective initiative is a responsible decision if you document the reasons and learning. Avoid exaggerating estimates or presenting guesses as verified facts."
      },
      {
        id: "c23-l6-b3",
        type: "key_message",
        headingText: "Proportionate Evidence",
        bodyText: "Focus on simple indicators (purchasing records, counts, observations, meter checks) to verify results."
      },
      {
        id: "c23-l6-b4",
        type: "commitment_scenario",
        commitmentPrompt: "Which action will you take when supporting a workplace sustainability initiative?",
        commitmentChoices: [
          "Confirm the problem before proposing a solution",
          "Help define a clear and manageable scope",
          "Record evidence consistently",
          "Raise operational or safety concerns promptly",
          "Support an honest review of what worked and what did not"
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "A green team coordinator proposes 'Make our corporate offices sustainable' as the team's first project. What is the primary planning issue?",
    options: [
      { text: "The team requires a bigger budget first.", isCorrect: false, feedback: "Incorrect. Budget is not the primary issue for a vague proposal." },
      { text: "It is a broad ambition rather than a workable initiative with defined scope, owner, and review timeline.", isCorrect: true, feedback: "Correct. A workable initiative must target a specific workplace problem and define clear boundaries, ownership, and timelines." },
      { text: "The proposal lacks support from an environmental consultant.", isCorrect: false, feedback: "Incorrect. Internal operational scoping is needed, not external consulting." },
      { text: "Office buildings cannot be made sustainable.", isCorrect: false, feedback: "Incorrect. They can, but the project must be scoped practically." }
    ],
    correctExplanation: "A workable initiative targets a specific problem, area, timeframe, and has a defined owner rather than a broad ambition.",
    incorrectExplanation: "Vague ambitions fail because they lack scope boundaries, not because they lack external experts or unlimited budgets.",
    practicalTakeaway: "Distinguish broad ambitions from clearly scoped, manageable initiatives."
  },
  {
    question: "A company finds food waste bins in a staff canteen are contaminated with plastic wrap. The green team suggests buying new bins with restricted lids. What should they do first?",
    options: [
      { text: "Order the new bins immediately to show rapid action.", isCorrect: false, feedback: "Incorrect. Ordering bins before confirming the cause of contamination wastes budget." },
      { text: "Observe the sorting process during canteen hours and discuss the workflow barriers with kitchen staff.", isCorrect: true, feedback: "Correct. You must identify the cause (e.g. time constraints, placement, or lack of tools to open packages) before choosing a tool." },
      { text: "Post a list of employees who contaminate the bins.", isCorrect: false, feedback: "Incorrect. Shaming staff does not identify operational process problems." },
      { text: "Exempt the kitchen staff from sorting guidelines.", isCorrect: false, feedback: "Incorrect. This abandons the goal instead of analyzing the process." }
    ],
    correctExplanation: "Before selecting a solution, investigate the actual cause of the symptom by observing operations and discussing barriers with frontline workers.",
    incorrectExplanation: "Rushing to buy equipment, shaming staff, or cancelling guidelines does not resolve the process bottleneck.",
    practicalTakeaway: "Investigate the actual problem before choosing the solution."
  },
  {
    question: "A team is comparing three energy-saving projects: replacing all light fixtures (high cost, high impact), adjusting warehouse HVAC shut-down times (low cost, immediate medium impact), and holding a green poster contest (low cost, no direct impact). Which is the best first step?",
    options: [
      { text: "The fixture replacement, because it is the most modern option.", isCorrect: false, feedback: "Incorrect. This requires capital approval, causing implementation delays." },
      { text: "The poster contest, because it involves the most employees.", isCorrect: false, feedback: "Incorrect. Poster campaigns do not deliver direct, measurable energy waste reductions." },
      { text: "The HVAC shut-down checks, because it is low-cost, manageable, and delivers immediate verifiable energy reductions.", isCorrect: true, feedback: "Correct. This project balances impact and feasibility, building team confidence and records." },
      { text: "The team should avoid choosing and wait for manager direction.", isCorrect: false, feedback: "Incorrect. The team should make evidence-based recommendations." }
    ],
    correctExplanation: "Feasible first initiatives should balance impact, effort, and cost. High-impact, low-cost projects like process checks are ideal starting points.",
    incorrectExplanation: "Capital-heavy fixtures or low-impact posters are less effective first steps than practical process controls.",
    practicalTakeaway: "Select initiatives that balance impact and feasibility."
  },
  {
    question: "An initiative to reduce plastic packaging requires purchasing reusable crates that exceed the coordinator's approved spending limit. How should the coordinator proceed?",
    options: [
      { text: "Charge the crates to the general department operations budget.", isCorrect: false, feedback: "Incorrect. Falsifying budget lines violates company compliance rules." },
      { text: "Record the budget blocker on the tracker and escalate the purchase request to the authorized manager sponsor.", isCorrect: true, feedback: "Correct. Financial decisions exceeding authorized limits must be escalated through the formal approval route." },
      { text: "Cancel the initiative immediately without notifying anyone.", isCorrect: false, feedback: "Incorrect. Blocker details should be logged and escalated rather than silently abandoned." },
      { text: "Ask the supplier to deliver the crates without an invoice.", isCorrect: false, feedback: "Incorrect. This violates corporate procurement rules." }
    ],
    correctExplanation: "Green teams and coordinators must respect organizational budget boundaries. Purchases exceeding limits must be escalated to the sponsor.",
    incorrectExplanation: "Budget line manipulation, silent cancellations, or unauthorized vendor deals violate financial governance.",
    practicalTakeaway: "Escalate initiatives requiring budget or operational approvals to the authorized manager."
  },
  {
    question: "A green team coordinator drafts an initiative plan: 'Reduce office printing. Use digital documents. Review next month.' Which element is missing?",
    options: [
      { text: "A list of digital document software options.", isCorrect: false, feedback: "Incorrect. Tool selection follows process ownership." },
      { text: "A named owner, specific printer area boundaries, manager approvals, and the source of printing records.", isCorrect: true, feedback: "Correct. Plans require defined owners, clear scope boundaries, approvals, and verified data sources." },
      { text: "A slogan to put on the office screen savers.", isCorrect: false, feedback: "Incorrect. Slogans do not assign tasks or monitor progress." },
      { text: "A detailed description of the printer network cables.", isCorrect: false, feedback: "Incorrect. Network cables are not operational plan parameters." }
    ],
    correctExplanation: "A delivery plan must define the owner, clear scope boundaries, required approvals, start/review dates, and the evidence source.",
    incorrectExplanation: "Slogans, tool lists, or network diagrams do not replace ownership, scope boundaries, or data criteria.",
    practicalTakeaway: "Ensure plans specify owners, boundaries, and evidence sources."
  },
  {
    question: "A hotel green team places glass bottle collection bins in a main restaurant corridor. The F&B supervisor reports that the bins obstruct waiter trays and represent a trip hazard. How should the team respond?",
    options: [
      { text: "Keep the bins in place because glass recycling is a priority.", isCorrect: false, feedback: "Incorrect. Recycling goals must never compromise employee safety." },
      { text: "Temporarily remove the bins, coordinate a safer bin location with the F&B supervisor, and update the initiative records.", isCorrect: true, feedback: "Correct. Safety hazards must be resolved immediately by suspending the hazard, coordinating a safer setup, and logging the change." },
      { text: "Ask the waiters to walk slower and more carefully.", isCorrect: false, feedback: "Incorrect. Shifting safety responsibility to employees is inappropriate." },
      { text: "Exempt the restaurant from glass recycling.", isCorrect: false, feedback: "Incorrect. The project can continue with a safer bin placement." }
    ],
    correctExplanation: "Workplace safety must never be compromised. Hazards must be resolved immediately by removing the blocker and adjusting layout with supervisors.",
    incorrectExplanation: "Ignoring hazards, shaming staff, or abandoning objectives ignores basic safety and operational compliance.",
    practicalTakeaway: "Prioritize workplace safety and adjust layouts to avoid operational hazards."
  },
  {
    question: "A department claims a waste-reduction pilot was successful because 'several employees said they liked the new bins.' What is the weakness of this review?",
    options: [
      { text: "The review should have been verified by a third-party auditor.", isCorrect: false, feedback: "Incorrect. Third-party audits are not required for local pilots." },
      { text: "It relies on subjective feedback rather than objective evidence such as monthly purchase records or waste weights.", isCorrect: true, feedback: "Correct. Credible reviews require proportionate, objective evidence rather than positive comments alone." },
      { text: "The team did not take photos of the happy employees.", isCorrect: false, feedback: "Incorrect. Photos of staff do not measure waste reductions." },
      { text: "The review should have calculated carbon offsets.", isCorrect: false, feedback: "Incorrect. Carbon formulas are not required for simple pilot checks." }
    ],
    correctExplanation: "Review outcomes must be based on objective evidence (like invoice records, counts, or weights) rather than subjective comments.",
    incorrectExplanation: "Audits, staff photos, or carbon claims do not replace the need for objective, local operational measurements.",
    practicalTakeaway: "Measure initiative results using objective, proportionate evidence."
  },
  {
    question: "A six-week office cup-reduction pilot records a 30% drop in disposable cups purchased, but employees report that reusable cups are frequently unavailable because washing responsibilities are unclear. What should the review recommend?",
    options: [
      { text: "Declare success, end the pilot, and stop tracking cup use.", isCorrect: false, feedback: "Incorrect. Ending the pilot ignores the operational gap." },
      { text: "Continue the initiative, adjust the plan by defining cup washing tasks, and schedule a review in four weeks.", isCorrect: true, feedback: "Correct. Continuous improvement requires adjusting the plan to fix process bottlenecks before full rollout." },
      { text: "Purchase a fully automated dishwasher for the department.", isCorrect: false, feedback: "Incorrect. Dishwashers are expensive capital items that may not resolve the responsibility gap." },
      { text: "Revert to disposable cups to avoid washing issues.", isCorrect: false, feedback: "Incorrect. This cancels the program instead of addressing the process task." }
    ],
    correctExplanation: "Pilots expose process gaps. The review should recommend continuing with adjustments (defining washing roles) to resolve the bottleneck.",
    incorrectExplanation: "Silencing reviews, buying expensive dishwashers, or returning to disposables ignores continuous improvement methods.",
    practicalTakeaway: "Adjust the plan to address process gaps identified during reviews."
  }
];

export async function ensureWorkplaceSustainabilityInitiativesCourse() {
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

      // 2. Resolve Course 22
      let course22 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-22")
      });
      if (!course22) {
        course22 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "creating-and-running-effective-green-teams")
        });
      }

      if (!course22) {
        throw new Error("Data integrity error: Course 22 (ELH-22) not found. Prerequisite cannot be established.");
      }

      // 3. Resolve or insert Course 23
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

      // 4. Update Course 22 recommendedNextCourseId to point to Course 23 preserving admin edits
      let isSystemManaged = false;
      if (course22.recommendedNextCourseId) {
        const currentRecommendedCourse = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.id, course22.recommendedNextCourseId)
        });
        if (currentRecommendedCourse && currentRecommendedCourse.courseCode === "ELH-23") {
          isSystemManaged = true;
        }
      }

      if (course22.recommendedNextCourseId === null || course22.recommendedNextCourseId === actualCourseId || isSystemManaged) {
        await tx.update(coursesTable).set({
          recommendedNextCourseId: actualCourseId
        }).where(eq(coursesTable.id, course22.id));
      } else {
        logger.warn(`Recommendation conflict: Course 22 currently recommends course ID ${course22.recommendedNextCourseId} instead of Course 23 (ID: ${actualCourseId}). Preserving administrator edit.`);
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
          icon: "bookmark",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 26,
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
      // Prerequisite 1: Course 22
      const existingPrereq22 = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course22.id)
        )
      });
      if (!existingPrereq22) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course22.id
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
