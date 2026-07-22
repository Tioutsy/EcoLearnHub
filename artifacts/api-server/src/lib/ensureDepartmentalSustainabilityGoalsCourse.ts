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

const COURSE_SLUG = "setting-departmental-sustainability-goals";
const COURSE_TITLE = "Setting Departmental Sustainability Goals";
const BADGE_SLUG = "departmental-sustainability-goal-setter";
const SEED_NAME = "departmental-sustainability-goals-v1";

const COURSE_META = {
  courseCode: "ELH-14",
  description: "Help departments translate broad company sustainability priorities into practical, owned, and measurable goals.",
  fullDescription: "Company sustainability ambitions only become useful when departments understand what they are responsible for delivering. This course helps learners convert broad priorities into practical departmental sustainability goals. Learners will identify what their department can influence, establish a starting point, define a measurable goal, assign responsibility, and decide how progress should be reviewed. Recommended for employees, departmental representatives, supervisors, managers, and sustainability champions.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/setting-departmental-sustainability-goals.jpg",
  intendedRoles: ["employees", "departmental representatives", "supervisors", "managers", "sustainability champions"],
  learningObjectives: [
    "Explain the difference between a broad sustainability ambition, a goal, an action, and an indicator.",
    "Identify sustainability issues that a department can directly influence.",
    "Establish a realistic baseline using available workplace information.",
    "Write a specific and measurable departmental sustainability goal.",
    "Select practical indicators without creating unnecessary reporting complexity.",
    "Assign ownership and review responsibilities.",
    "Recognise weak goals that are vague, unrealistic, or disconnected from departmental work.",
    "Define one departmental sustainability goal that could be proposed in their workplace."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Setting Departmental Sustainability Goals. You can now identify what a department can influence, establish a useful baseline, and define a goal that has a measurable result, clear ownership, and an appropriate review process. Your next step is to apply this structure to one realistic priority in your own department.",
  badgeName: "Departmental Sustainability Goal Setter",
  badgeDescription: "Awarded for demonstrating the ability to define departmental sustainability goals with clear indicators, ownership, and review processes.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "From Company Ambition to Departmental Responsibility",
    minutes: 3,
    content: "Introduce the problem of broad sustainability commitments that are not translated into departmental responsibilities.",
    blocks: [
      {
        id: "c14-l1-b1",
        type: "heading",
        headingText: "A goal that belongs to everyone may belong to no one"
      },
      {
        id: "c14-l1-b2",
        type: "short_text",
        bodyText: "A company announces that it wants to “reduce its environmental impact.”\n\nThe statement sounds positive, but each department continues working as before.\n\nFacilities assumes Procurement will act. Procurement assumes Operations will act. Employees are unsure what they are expected to change.\n\nA company ambition only becomes useful when each department understands what it can influence and what result it is expected to achieve."
      },
      {
        id: "c14-l1-b3",
        type: "decision_scenario",
        decisionIntro: "Present three statements and select the one that gives a department the clearest responsibility.",
        decisionPrompt: "Which of the following is the clearest departmental goal?",
        decisionChoices: [
          {
            label: "“The company will become more sustainable.”",
            correct: false,
            feedback: "This describes a broad ambition, but it does not identify responsibility, measurement or timing."
          },
          {
            label: "“Everyone should try to reduce waste.”",
            correct: false,
            feedback: "This suggests a general action, but it remains unclear who is accountable and how progress will be assessed."
          },
          {
            label: "“The Administration Department will reduce monthly office-paper purchasing by 15% within twelve months.”",
            correct: true,
            feedback: "Correct. It identifies a department, a measurable result and a timeframe."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "What Can Your Department Influence?",
    minutes: 3,
    content: "Help learners distinguish between issues they control, issues they influence and issues outside their immediate responsibility.",
    blocks: [
      {
        id: "c14-l2-b1",
        type: "heading",
        headingText: "Start with what the department can change"
      },
      {
        id: "c14-l2-b2",
        type: "short_text",
        bodyText: "A useful departmental goal should relate to activities the department controls or can meaningfully influence.\n\nDepartments should not be assigned goals based only on visibility or convenience."
      },
      {
        id: "c14-l2-b3",
        type: "mauritian_example",
        headingText: "Mauritian Workplace Example: Hotel Housekeeping",
        bodyText: "A hotel housekeeping department may directly control how cleaning products are dispensed and how linen-change procedures are followed. It may influence procurement specifications, but it does not independently control all supplier packaging or the hotel’s total energy consumption."
      },
      {
        id: "c14-l2-b4",
        type: "decision_scenario",
        decisionIntro: "Distinguishing levels of influence for departmental activities.",
        decisionPrompt: "Which of the following activities is typically under a department's direct control?",
        decisionChoices: [
          {
            label: "Whether lights and equipment are switched off in the department after use.",
            correct: true,
            feedback: "Correct. Daily operational habits and switching off local equipment are under the department's direct control."
          },
          {
            label: "The entire building-wide electricity consumption.",
            correct: false,
            feedback: "Incorrect. Building-wide consumption is a shared influence across all occupying departments."
          },
          {
            label: "National electricity generation and grid emissions.",
            correct: false,
            feedback: "Incorrect. National infrastructure is outside the department's responsibility or influence."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Establishing a Useful Baseline",
    minutes: 3,
    content: "Explain how a starting point supports credible goal setting.",
    blocks: [
      {
        id: "c14-l3-b1",
        type: "heading",
        headingText: "Know where you are starting"
      },
      {
        id: "c14-l3-b2",
        type: "short_text",
        bodyText: "A baseline is the current level of performance against which future progress can be compared.\n\nWithout a baseline, a department may announce an improvement without being able to show what changed.\n\nA baseline does not always require specialised software. It may come from utility bills, purchase records, waste checks, stock records, travel claims, or observations.\n\nWhen exact historical information is unavailable, a department may conduct a short initial measurement period (e.g. three months) and use the average as the baseline, documenting any limitations."
      },
      {
        id: "c14-l3-b3",
        type: "decision_scenario",
        decisionIntro: "Match the goal area with the most reasonable baseline source.",
        decisionPrompt: "If the Administration Department wants to set a goal to reduce office paper use, what is the best baseline source?",
        decisionChoices: [
          {
            label: "Office paper purchasing records.",
            correct: true,
            feedback: "Correct. Purchasing records show exactly how many reams were ordered, providing a clear starting point."
          },
          {
            label: "Electricity sub-meter readings.",
            correct: false,
            feedback: "Incorrect. Meter readings measure power use, not paper consumption."
          },
          {
            label: "Travel booking claims.",
            correct: false,
            feedback: "Incorrect. Travel records track commuting or business trips, not paper use."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Writing a Strong Departmental Goal",
    minutes: 3,
    content: "Teach learners to construct a goal using a simple, practical framework.",
    blocks: [
      {
        id: "c14-l4-b1",
        type: "heading",
        headingText: "Writing a Strong Goal"
      },
      {
        id: "c14-l4-b2",
        type: "short_text",
        bodyText: "A strong departmental goal should answer: What result should change? What is the starting point? How much change is expected? Who owns the goal? By when should it be achieved? How will progress be checked?\n\nKeep in mind that a goal describes the desired result (e.g., reduce paper purchasing by 15%), while an action describes what will be done (e.g., default printers to double-sided printing), and an indicator describes what is measured (e.g., monthly paper reams purchased)."
      },
      {
        id: "c14-l4-b3",
        type: "decision_scenario",
        decisionIntro: "Practice: Improving weak goals.",
        decisionPrompt: "Which of the following is a strong, well-structured departmental goal?",
        decisionChoices: [
          {
            label: "“We will try to save electricity.”",
            correct: false,
            feedback: "Incorrect. This is a weak goal because it is not measurable and lacks a timeframe, baseline, or owner."
          },
          {
            label: "“Default all office printers to double-sided printing immediately.”",
            correct: false,
            feedback: "Incorrect. This is an action description, not a goal result."
          },
          {
            label: "“The Facilities Department will reduce electricity consumption in the admin building by 8% against the 2026 baseline by June 2027, reviewing progress monthly.”",
            correct: true,
            feedback: "Correct. This is a strong goal containing a target, baseline, timeline, owner, and review method."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Indicators, Ownership and Review",
    minutes: 3,
    content: "Show learners how to monitor a goal without creating unnecessary reporting burdens.",
    blocks: [
      {
        id: "c14-l5-b1",
        type: "heading",
        headingText: "Measure what helps decisions"
      },
      {
        id: "c14-l5-b2",
        type: "short_text",
        bodyText: "An indicator is a piece of information used to assess progress. Use the simplest reliable indicator available. Collecting more data is not automatically better.\n\nEach goal should identify: a responsible owner, contributing team members, information needed, review frequency, and the update audience. Review frequencies depend on the goal (e.g. weekly checks for daily habits, monthly for utilities, quarterly for larger programs)."
      },
      {
        id: "c14-l5-b3",
        type: "decision_scenario",
        decisionIntro: "Selecting review arrangements.",
        decisionPrompt: "Which arrangement provides the strongest follow-through for a departmental goal?",
        decisionChoices: [
          {
            label: "Review the goal once at the end of the year.",
            correct: false,
            feedback: "Incorrect. Annual review is usually too late to correct goals that are off track."
          },
          {
            label: "Ask everyone to remember the goal informally.",
            correct: false,
            feedback: "Incorrect. Informal memory lacks accountability and structured feedback."
          },
          {
            label: "Assign an owner and review the indicator monthly, with corrective action when progress is off track.",
            correct: true,
            feedback: "Correct. Regular reviews allow identifying obstacles and adjusting actions dynamically."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Scenario: Goals for a Mauritian Workplace",
    minutes: 3,
    content: "Apply goal-setting principles to a Mauritian workplace scenario.",
    blocks: [
      {
        id: "c14-l6-b1",
        type: "heading",
        headingText: "Interactive Case Study"
      },
      {
        id: "c14-l6-b2",
        type: "short_text",
        bodyText: "A Mauritian company has completed its first sustainability action plan. The company's priorities are to reduce waste, improve resource efficiency, and strengthen participation. The Operations Department has been asked to define a goal."
      },
      {
        id: "c14-l6-b3",
        type: "decision_scenario",
        decisionIntro: "Decision 1: The department initially proposes: 'Operations will become more environmentally friendly.'",
        decisionPrompt: "What is the main weakness of this proposal?",
        decisionChoices: [
          {
            label: "It does not define a measurable result.",
            correct: true,
            feedback: "Correct. The proposal is a vague intention with no measurable outcomes."
          },
          {
            label: "It does not use complex ESG terminology.",
            correct: false,
            feedback: "Incorrect. Goals should be plain and practical, not filled with complex jargon."
          },
          {
            label: "Sustainability goals should only be defined by senior executives.",
            correct: false,
            feedback: "Incorrect. Departmental goals should be drafted by the department itself."
          }
        ]
      },
      {
        id: "c14-l6-b4",
        type: "decision_scenario",
        decisionIntro: "Decision 2: The department discovers that they order an average of 1,000 disposable cups each month.",
        decisionPrompt: "Which of the following is the strongest goal?",
        decisionChoices: [
          {
            label: "Reduce monthly disposable-cup orders by 40% within six months against the current monthly average.",
            correct: true,
            feedback: "Correct. This is a specific, measurable goal with a target, baseline, and timeframe."
          },
          {
            label: "Encourage staff to think carefully before using cups.",
            correct: false,
            feedback: "Incorrect. This is too vague to act as a target."
          },
          {
            label: "Stop all disposable-cup use immediately.",
            correct: false,
            feedback: "Incorrect. Absolute immediate bans without alternatives are often unrealistic and cause operational disruption."
          }
        ]
      },
      {
        id: "c14-l6-b5",
        type: "decision_scenario",
        decisionIntro: "Decision 3: Supporting action for the cup goal.",
        decisionPrompt: "Which supporting action is most effective?",
        decisionChoices: [
          {
            label: "Introduce reusable cups, communicate the new procedures, and monitor monthly order receipts.",
            correct: true,
            feedback: "Correct. Combining reusable alternatives, clear procedures, and monitoring ensures success."
          },
          {
            label: "Remove all drinking water facilities in the department.",
            correct: false,
            feedback: "Incorrect. This compromises employee health and safety."
          },
          {
            label: "Wait until the supplier proposes an alternative cup option.",
            correct: false,
            feedback: "Incorrect. Passive waiting does not drive progress."
          }
        ]
      },
      {
        id: "c14-l6-b6",
        type: "decision_scenario",
        decisionIntro: "Decision 4: After two months, orders have fallen by only 5%.",
        decisionPrompt: "What is the correct next step?",
        decisionChoices: [
          {
            label: "Review the obstacles, strengthen the supporting actions, and continue monitoring.",
            correct: true,
            feedback: "Correct. Mid-course adjustments are standard practice to get goals back on track."
          },
          {
            label: "Cancel the goal immediately since it is failing.",
            correct: false,
            feedback: "Incorrect. Goals should not be abandoned at the first sign of difficulty."
          },
          {
            label: "Change the baseline average to make the results look better.",
            correct: false,
            feedback: "Incorrect. Falsifying baseline data destroys credibility."
          }
        ]
      },
      {
        id: "c14-l6-b7",
        type: "heading",
        headingText: "Define one goal your department could propose"
      },
      {
        id: "c14-l6-b8",
        type: "short_text",
        bodyText: "Consider a sustainability priority for your own department. Select an area (Waste, Energy, Water, Procurement, Travel, or Training) and define a structured goal:\n\nOur department will [desired result] by [amount or defined standard], against [baseline], by [deadline]. Progress will be owned by [role] and reviewed [frequency] using [indicator]."
      },
      {
        id: "c14-l6-b9",
        type: "commitment",
        commitmentInstruction: "Choose one departmental goal commitment you want to propose in your workplace:",
        commitmentOptions: [
          {
            value: "reduce-paper-purchasing",
            label: "Our department will reduce monthly office-paper purchasing by 15% against baseline within 12 months.",
            description: "Administration & HR Goal template"
          },
          {
            value: "reduce-electricity-use",
            label: "Our department will reduce electricity consumption in our area by 8% against 2026 baseline by June 2027.",
            description: "Facilities & Operations Goal template"
          },
          {
            value: "reduce-disposable-cups",
            label: "Our department will reduce monthly disposable cup orders by 40% against baseline within six months.",
            description: "Hospitality & Food Services Goal template"
          },
          {
            value: "sustainable-purchasing-criteria",
            label: "Our department will ensure sustainability criteria are documented in all applicable purchase requests within six months.",
            description: "Procurement & Finance Goal template"
          },
          {
            value: "sustainability-training-completion",
            label: "Our department will achieve 90% completion of the assigned sustainability learning pathway by our employees within three months.",
            description: "General Departmental Manager Goal template"
          }
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "What is the main purpose of a departmental sustainability goal?",
    options: [
      { text: "To replace the company’s overall sustainability priorities", isCorrect: false, feedback: "Departmental goals support company priorities; they do not replace them." },
      { text: "To convert a company priority into a result a department can influence and review", isCorrect: true, feedback: "Correct. They translate broad direction into departmental responsibility." },
      { text: "To make every department responsible for the same activities", isCorrect: false, feedback: "Departments have different activities, responsibilities and areas of influence." },
      { text: "To produce a public environmental report", isCorrect: false, feedback: "A departmental goal may support reporting, but its main purpose is to guide and assess action." }
    ],
    correctExplanation: "Departmental goals translate high-level corporate priorities into specific, practical targets that match the department's area of influence and daily activities.",
    incorrectExplanation: "Vague ambitions, generic actions, or public reporting reports do not constitute the primary operational purpose of a departmental sustainability goal.",
    practicalTakeaway: "Create goals that are specific and within the control of the team executing them."
  },
  {
    question: "Which statement is the strongest sustainability goal?",
    options: [
      { text: "Try to reduce office waste", isCorrect: false, feedback: "This is not measurable and has no timeframe." },
      { text: "Become a greener department", isCorrect: false, feedback: "This is a broad ambition rather than a usable goal." },
      { text: "Reduce monthly paper purchasing by 15% against the established baseline within twelve months", isCorrect: true, feedback: "Correct. It defines a measurable change and timeframe." },
      { text: "Ask employees to care more about the environment", isCorrect: false, feedback: "Awareness may support a goal, but this statement does not define a result." }
    ],
    correctExplanation: "A strong departmental goal identifies a measurable target, a clear baseline, a specific focus area, and a defined time horizon.",
    incorrectExplanation: "General intentions or broad, unmeasurable ambitions cannot be checked effectively over time.",
    practicalTakeaway: "Always include specific numbers, baselines, and deadlines in your goals."
  },
  {
    question: "What is a baseline?",
    options: [
      { text: "The final sustainability result", isCorrect: false, feedback: "The final result is compared against the baseline." },
      { text: "The starting level used to compare future progress", isCorrect: true, feedback: "Correct. A baseline provides the starting point." },
      { text: "A list of all company policies", isCorrect: false, feedback: "Policies may provide context but are not a baseline." },
      { text: "The minimum quiz score", isCorrect: false, feedback: "Quiz scores are unrelated to workplace goal baselines." }
    ],
    correctExplanation: "A baseline is the measured performance of the target metric before corrective actions are introduced, allowing subsequent changes to be quantified.",
    incorrectExplanation: "Policy inventories, end results, or training score thresholds do not serve as a starting point baseline.",
    practicalTakeaway: "Measure first to establish where you are starting from before enforcing changes."
  },
  {
    question: "A department does not have reliable historical data. What should it do?",
    options: [
      { text: "Invent a reasonable baseline", isCorrect: false, feedback: "Invented data would undermine credibility." },
      { text: "Avoid setting any goals", isCorrect: false, feedback: "A lack of historical data does not prevent an initial measurement." },
      { text: "Conduct an initial measurement period and document the limitations", isCorrect: true, feedback: "Correct. A short measurement period can establish a defensible starting point." },
      { text: "Use another company’s data without checking relevance", isCorrect: false, feedback: "Another company’s data may not reflect the department’s activities." }
    ],
    correctExplanation: "When historical data is missing, a department can conduct a short, focused audit or measurement period (e.g. 1-3 months) to establish an initial benchmark.",
    incorrectExplanation: "Fabricating records or copying external statistics defeats the purpose of local measurement.",
    practicalTakeaway: "Conduct a short initial check rather than guessing your baseline."
  },
  {
    question: "Which is an indicator rather than an action?",
    options: [
      { text: "Configure printers for double-sided printing", isCorrect: false, feedback: "This is an action intended to reduce paper use." },
      { text: "Brief employees on waste sorting", isCorrect: false, feedback: "This is a communication action." },
      { text: "Number of paper reams purchased each month", isCorrect: true, feedback: "Correct. This information can be used to monitor progress." },
      { text: "Install clearly labelled collection bins", isCorrect: false, feedback: "This is an operational action." }
    ],
    correctExplanation: "An indicator is a metric or data point collected regularly to monitor a goal. Actions are the interventions or behaviors executed to achieve the goal.",
    incorrectExplanation: "Configuring printers, training staff, and setting up bins are direct actions, not metrics.",
    practicalTakeaway: "Keep indicators distinct from actions so you can measure whether the actions worked."
  },
  {
    question: "Who should own a departmental sustainability goal?",
    options: [
      { text: "Everyone collectively, without one responsible person", isCorrect: false, feedback: "Participation may be shared, but unclear ownership weakens accountability." },
      { text: "A named person or role with the authority to coordinate progress", isCorrect: true, feedback: "Correct. A named owner should coordinate actions and reviews." },
      { text: "Only an external consultant", isCorrect: false, feedback: "External support may help, but responsibility should remain clear within the organisation." },
      { text: "The software used to record the indicator", isCorrect: false, feedback: "Software may store data but cannot own workplace responsibility." }
    ],
    correctExplanation: "Assigning goal ownership to a specific role or individual ensures accountability, progress monitoring, and dynamic adjustment.",
    incorrectExplanation: "Collective assumptions, software platforms, and external consultants cannot substitute for local operational responsibility.",
    practicalTakeaway: "Assign a named owner to each goal to ensure it receives consistent attention."
  },
  {
    question: "What should happen when progress is below expectations?",
    options: [
      { text: "Change the baseline to improve the result", isCorrect: false, feedback: "Changing the baseline without justification would make the result unreliable." },
      { text: "Stop monitoring the goal", isCorrect: false, feedback: "Monitoring is especially important when progress is weak." },
      { text: "Review the barriers and adjust the supporting actions", isCorrect: true, feedback: "Correct. Reviews should help the department respond while action is still possible." },
      { text: "Wait until the deadline before discussing it", isCorrect: false, feedback: "Waiting may allow the problem to continue until it is too late to respond." }
    ],
    correctExplanation: "Reviews are decision-making checkpoints. If progress lags, the team should analyze the obstacles, strengthen support, and adjust their actions.",
    incorrectExplanation: "Abandoning metric checks, altering baselines, or waiting until the final deadline are counterproductive responses.",
    practicalTakeaway: "Use regular checkpoints to adjust actions before it's too late."
  },
  {
    question: "Which goal is most closely connected to the Procurement Department’s work?",
    options: [
      { text: "Reduce national electricity emissions", isCorrect: false, feedback: "A procurement department does not directly control national electricity generation." },
      { text: "Improve supplier and product sustainability criteria in applicable purchase requests", isCorrect: true, feedback: "Correct. Procurement can directly influence purchasing requirements and supplier selection." },
      { text: "Protect every coastal ecosystem in Mauritius", isCorrect: false, feedback: "This is too broad for a departmental goal." },
      { text: "Control all employee commuting choices", isCorrect: false, feedback: "Procurement does not directly control all employee travel decisions." }
    ],
    correctExplanation: "A department's goals must reflect its core processes. Procurement directly manages supply chains, purchasing requirements, and supplier evaluations.",
    incorrectExplanation: "National infrastructure, general ecosystem conservation, and commuting preferences are outside the control of standard purchasing roles.",
    practicalTakeaway: "Select goal targets that fit your department's core function and responsibilities."
  }
];

export async function ensureDepartmentalSustainabilityGoalsCourse() {
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
      // 1. Resolve direct prerequisite (Course 13)
      const course13 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.slug, "sustainability-action-planning")
      });

      if (!course13) {
        throw new Error("Data integrity error: Course 13 (sustainability-action-planning) not found. Prerequisite cannot be established.");
      }

      // 2. Resolve foundation prerequisite (Course 12)
      const course12 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.slug, "final-sustainability-certification")
      });

      if (!course12) {
        throw new Error("Data integrity error: Course 12 (final-sustainability-certification) not found. Foundation prerequisite cannot be established.");
      }

      // 3. Resolve or insert Course 14
      let existingCourse = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.slug, COURSE_SLUG)
      });

      let actualCourseId: number;

      if (!existingCourse) {
        const byCode = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.courseCode, COURSE_META.courseCode)
        });
        if (byCode) {
          existingCourse = byCode;
        }
      }

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
        }).returning();
        actualCourseId = inserted.id;
      } else {
        actualCourseId = existingCourse.id;
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

      // 4. Update Course 13 recommendedNextCourseId to point to Course 14
      await tx.update(coursesTable).set({
        recommendedNextCourseId: actualCourseId
      }).where(eq(coursesTable.id, course13.id));

      // 5. Ensure Badge Definition exists
      const existingBadge = await tx.query.badgeDefinitionsTable.findFirst({
        where: eq(badgeDefinitionsTable.slug, BADGE_SLUG)
      });

      if (!existingBadge) {
        await tx.insert(badgeDefinitionsTable).values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "award",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 17,
          code: "COURSE_ELH_14_COMPLETE",
        });
      } else {
        await tx.update(badgeDefinitionsTable).set({
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          courseIds: [actualCourseId],
          code: "COURSE_ELH_14_COMPLETE",
        }).where(eq(badgeDefinitionsTable.slug, BADGE_SLUG));
      }

      // 6. Ensure Prerequisite relationships exist
      // Prerequisite 1: Course 13 (Direct)
      const existingPrereq13 = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course13.id)
        )
      });
      if (!existingPrereq13) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course13.id
        });
      }

      // Prerequisite 2: Course 12 (Foundation)
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

      // 7. Seed Lessons safely
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

        for (const lesson of NEW_LESSONS) {
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
