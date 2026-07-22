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

const COURSE_SLUG = "sustainability-action-planning";
const COURSE_TITLE = "Sustainability Action Planning";
const BADGE_SLUG = "sustainability-action-planner";
const SEED_NAME = "sustainability-action-planning-v1";

const COURSE_META = {
  courseCode: "ELH-13",
  description: "Learn how to turn a general sustainability concern into a practical, owned, and measurable workplace action plan.",
  fullDescription: "Good intentions do not automatically create results. This course shows learners how to define a specific workplace issue, establish a starting point, choose realistic actions, assign responsibility, set deadlines, and identify evidence of progress. Recommended for employees, supervisors, managers, and sustainability champions.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainability-action-planning.jpg",
  intendedRoles: ["employees", "supervisors", "managers", "sustainability champions"],
  learningObjectives: [
    "Identify a specific workplace sustainability issue rather than a vague ambition.",
    "Distinguish between an observed problem, its possible causes and its consequences.",
    "Establish a simple starting point using available workplace evidence.",
    "Define a realistic result, owner and deadline.",
    "Select practical actions that address the likely cause of the problem.",
    "Choose indicators and evidence that can demonstrate progress.",
    "Review an action plan and adjust it when results are not improving."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Sustainability Action Planning. You can now identify a workplace issue, use evidence to understand it, define a practical objective, assign actions and responsibility, and choose a clear way to review progress.",
  badgeName: "Sustainability Action Planner",
  badgeDescription: "Awarded for demonstrating the ability to turn a workplace sustainability issue into a practical and measurable action plan.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "From Intention to Action",
    minutes: 3,
    content: "Show why broad intentions frequently fail to produce measurable workplace improvements.",
    blocks: [
      {
        id: "c13-l1-b1",
        type: "heading",
        headingText: "The Action Gap"
      },
      {
        id: "c13-l1-b2",
        type: "short_text",
        bodyText: "Good intentions like “reduce waste,” “save electricity,” or “be greener” express a positive desire, but they do not yet tell employees what needs to change, where the problem occurs, what result is expected, who is responsible, when the work should happen, or how progress will be measured."
      },
      {
        id: "c13-l1-b3",
        type: "key_message",
        headingText: "The Planning Sequence",
        bodyText: "A useful action plan converts an intention into a clear, structured sequence:\n\nIssue → Evidence → Objective → Actions → Owner → Deadline → Measure"
      },
      {
        id: "c13-l1-b4",
        type: "mauritian_example",
        headingText: "Mauritian Workplace Example: Energy Costs",
        bodyText: "A medium-sized company notices that its electricity costs are increasing. Management tells staff to switch off lights, but no one checks which equipment uses the most energy, whether AC schedules are aligned with working hours, or if maintenance issues contribute. After several months, costs are unchanged because the workplace acted before defining the problem."
      },
      {
        id: "c13-l1-b5",
        type: "decision_scenario",
        decisionIntro: "Practice: Distinguishing between a broad intention and a practical objective.",
        decisionPrompt: "Which of the following is a specific, actionable objective rather than a vague intention?",
        decisionChoices: [
          {
            label: "Use less water.",
            correct: false,
            feedback: "Incorrect. This is a broad intention with no location, target, owner, or timeframe."
          },
          {
            label: "Investigate repeated water use outside operating hours and reduce avoidable consumption within three months.",
            correct: true,
            feedback: "Correct. This defines a clear focus, a location/time context, and a timeline for action."
          },
          {
            label: "Become environmentally friendly.",
            correct: false,
            feedback: "Incorrect. This is a general ambition rather than a specific, manageable project."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Define the Real Workplace Issue",
    minutes: 3,
    content: "Teach learners to separate observations, possible causes, and assumptions.",
    blocks: [
      {
        id: "c13-l2-b1",
        type: "heading",
        headingText: "Start with Observations"
      },
      {
        id: "c13-l2-b2",
        type: "short_text",
        bodyText: "An observation describes what can be seen, measured, or verified, such as 'recycling bins regularly contain food waste' or 'air-conditioning remains on in empty meeting rooms.' A possible cause explains why the issue may be happening (e.g., 'bin labels are unclear' or 'schedules have not been assigned'). Never present a possible cause as fact until it has been checked."
      },
      {
        id: "c13-l2-b3",
        type: "key_message",
        headingText: "The Definition Framework",
        bodyText: "Before writing actions, ask:\n1. What is happening?\n2. Where and when does it happen?\n3. Who is involved?\n4. What evidence is available?\n5. What might be causing it?\n6. What still needs to be checked?"
      },
      {
        id: "c13-l2-b4",
        type: "decision_scenario",
        decisionIntro: "Scenario: A hotel department reports that employees 'do not care about waste sorting'.",
        decisionPrompt: "A review of the workspace shows: two different bin-label systems are used, bins are placed far from work areas, and new employees receive no sorting guidance. What is the most effective first response?",
        decisionChoices: [
          {
            label: "Issue disciplinary warnings to employees immediately to improve their attitude.",
            correct: false,
            feedback: "Incorrect. Blaming attitude without addressing the system faults is unlikely to resolve the sorting problem."
          },
          {
            label: "Investigate the inconsistent labels, bin placement, and employee guidance before concluding that the problem is attitude.",
            correct: true,
            feedback: "Correct. Examining physical layout and training resources is essential before assuming negligence."
          },
          {
            label: "Remove the recycling bins to prevent contamination.",
            correct: false,
            feedback: "Incorrect. Removing bins avoids the issue rather than resolving it, and stops all recycling."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Establish a Starting Point and Objective",
    minutes: 3,
    content: "Teach learners to create a simple baseline and a clear result.",
    blocks: [
      {
        id: "c13-l3-b1",
        type: "heading",
        headingText: "Finding Your Baseline"
      },
      {
        id: "c13-l3-b2",
        type: "short_text",
        bodyText: "A starting point, or baseline, is the best available picture of the situation before the action begins. It does not require complex software. You can use utility bills, meter readings, waste logs, checklists, photographs, or counts of recurring incidents."
      },
      {
        id: "c13-l3-b3",
        type: "key_message",
        headingText: "Define a Practical Objective",
        bodyText: "A practical objective defines: what should improve, where the improvement applies, how progress will be checked, who is responsible, and when results will be reviewed. Some organisations call this a SMART objective."
      },
      {
        id: "c13-l3-b4",
        type: "decision_scenario",
        decisionIntro: "Practice: Evaluating objectives.",
        decisionPrompt: "Which objective is most suitable for an action plan?",
        decisionChoices: [
          {
            label: "Reduce office waste.",
            correct: false,
            feedback: "Incorrect. This is too vague and does not define what type of waste, how much reduction is expected, or by when."
          },
          {
            label: "Reduce avoidable contamination in the main staff recycling area over the next eight weeks by improving bin labels, repositioning bins and checking contamination weekly.",
            correct: true,
            feedback: "Correct. This defines the problem, location, timeframe, actions, and review method clearly."
          },
          {
            label: "Become the most sustainable company in Mauritius.",
            correct: false,
            feedback: "Incorrect. This is an unrealistic ambition that cannot be practically managed or verified."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Choose Actions, Owners and Resources",
    minutes: 3,
    content: "Teach learners to build an action sequence that addresses likely causes.",
    blocks: [
      {
        id: "c13-l4-b1",
        type: "heading",
        headingText: "Sequence Actions Logically"
      },
      {
        id: "c13-l4-b2",
        type: "short_text",
        bodyText: "Actions should directly address the likely causes identified by your evidence. Each action needs: a clear status, one accountable owner (who ensures the task moves forward), and a realistic completion date."
      },
      {
        id: "c13-l4-b3",
        type: "key_message",
        headingText: "Identifying Needed Resources",
        bodyText: "Always check if an action requires manager approval, facilities support, procurement involvement, supplier participation, or budget before finalising the plan."
      },
      {
        id: "c13-l4-b4",
        type: "decision_scenario",
        decisionIntro: "Scenario: Meeting room air-conditioning is frequently left running when rooms are empty.",
        decisionPrompt: "What is the best first action for the team?",
        decisionChoices: [
          {
            label: "Order new energy-efficient AC units immediately.",
            correct: false,
            feedback: "Incorrect. Buying new equipment without checking room schedules, controls, and usage is a potential waste of capital."
          },
          {
            label: "Investigate room schedules, AC controls, and employee practices before choosing a solution.",
            correct: true,
            feedback: "Correct. Assessing actual room usage and controls is the best first step to avoid unnecessary expense."
          },
          {
            label: "Ban all meeting room use to stop the AC waste.",
            correct: false,
            feedback: "Incorrect. This disrupts operations instead of addressing the AC control habits."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Measure Progress and Improve the Plan",
    minutes: 3,
    content: "Teach learners to choose practical indicators and respond when an action is not working.",
    blocks: [
      {
        id: "c13-l5-b1",
        type: "heading",
        headingText: "Activity vs. Outcome"
      },
      {
        id: "c13-l5-b2",
        type: "short_text",
        bodyText: "Completing a task is not the same as achieving a result. Installing signs is an action; reducing contamination is the outcome. A useful plan tracks both: task completion (did we do it?) and outcome progress (did it solve the problem?)."
      },
      {
        id: "c13-l5-b3",
        type: "key_message",
        headingText: "Review and Adapt",
        bodyText: "At each review point, ask: What was completed? What changed? What evidence supports this? What did not work? Does the plan need to be adjusted or escalated?"
      },
      {
        id: "c13-l5-b4",
        type: "decision_scenario",
        decisionIntro: "Scenario: A company sends three reminder emails about waste sorting, but contamination does not decrease.",
        decisionPrompt: "What should the action-plan owner do?",
        decisionChoices: [
          {
            label: "Mark the plan successful because the emails were sent.",
            correct: false,
            feedback: "Incorrect. Sending emails is an activity. The outcome (reduced contamination) was not achieved."
          },
          {
            label: "Continue sending the same email weekly.",
            correct: false,
            feedback: "Incorrect. Repeating an ineffective action without review is unlikely to change the result."
          },
          {
            label: "Review the evidence, investigate why the emails failed, and adjust the actions.",
            correct: true,
            feedback: "Correct. The owner should identify why the action did not change the result and adapt the plan."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Workplace Challenge: Build the Action Plan",
    minutes: 4,
    content: "A Mauritian workplace with 60 employees has recycling confusion in its shared kitchen.",
    blocks: [
      {
        id: "c13-l6-b1",
        type: "heading",
        headingText: "Case Study Challenge"
      },
      {
        id: "c13-l6-b2",
        type: "short_text",
        bodyText: "A company with 60 employees has a shared kitchen and staff recycling area. The following issues are observed: food waste in recycling bins, different labels on similar bins, and employees reporting the system is confusing. Management suggests sending a reminder email to 'fix it quickly'."
      },
      {
        id: "c13-l6-b3",
        type: "decision_scenario",
        decisionIntro: "Build the Plan",
        decisionPrompt: "What is the most complete and effective action-plan objective for this situation?",
        decisionChoices: [
          {
            label: "Ask employees to sort waste better by sending a reminder email.",
            correct: false,
            feedback: "Incorrect. A reminder email does not address the inconsistent labels, poor layout, or employee guidance."
          },
          {
            label: "Reduce avoidable contamination in the shared recycling area over eight weeks by introducing consistent labels, improving bin placement, and conducting weekly checks.",
            correct: true,
            feedback: "Correct. This directly targets the observed issues (labels, placement, guidance) and establishes a review method."
          },
          {
            label: "Implement zero-waste operations in the kitchen by next week.",
            correct: false,
            feedback: "Incorrect. This is an unrealistic timeframe and ambition that cannot be successfully implemented or monitored."
          }
        ]
      },
      {
        id: "c13-l6-b4",
        type: "commitment",
        commitmentInstruction: "Choose your daily workplace action planning commitment:",
        commitmentOptions: [
          {
            value: "identify-specific-issue",
            label: "I will identify one specific sustainability issue instead of using a broad goal.",
            description: "Focus on a clear, observable problem first."
          },
          {
            value: "check-evidence",
            label: "I will check available evidence before suggesting a solution.",
            description: "Base decisions on facts and observations rather than assumptions."
          },
          {
            value: "owner-deadline",
            label: "I will make sure an action has an owner and deadline.",
            description: "Build accountability into my plans."
          },
          {
            value: "activity-vs-outcome",
            label: "I will distinguish between completing an activity and achieving a result.",
            description: "Ensure tasks lead to real workplace improvements."
          },
          {
            value: "suggest-review-date",
            label: "I will suggest a review date for an existing sustainability action.",
            description: "Review and adjust plans when results do not improve."
          }
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "A workplace says its objective is to “be more sustainable.” What should happen next?",
    options: [
      { text: "Purchase new environmental equipment immediately", isCorrect: false, feedback: "Purchasing hardware before understanding the specific problem often leads to waste." },
      { text: "Identify a specific workplace issue and review available evidence", isCorrect: true, feedback: "Correct. A practical plan begins with a specific issue and evidence." },
      { text: "Ask all employees to use fewer resources without further guidance", isCorrect: false, feedback: "General instructions do not define responsibility or expected results." },
      { text: "Publish the objective as the completed action plan", isCorrect: false, feedback: "Publishing an ambition does not demonstrate implementation." }
    ],
    correctExplanation: "A practical plan begins with a specific issue and evidence. Purchasing equipment before understanding the problem may waste resources. General instructions do not define responsibility or expected results. Publishing an ambition does not demonstrate implementation.",
    incorrectExplanation: "Identify a specific workplace issue and review available evidence.",
    practicalTakeaway: "Always define the problem before selecting a solution."
  },
  {
    question: "Recycling bins contain frequent contamination. A manager concludes that employees do not care. What is the strongest response?",
    options: [
      { text: "Accept the conclusion because contamination is visible", isCorrect: false, feedback: "Accepting a conclusion without checking the system ignores potential system faults." },
      { text: "Remove the recycling bins", isCorrect: false, feedback: "Removing bins avoids the issue rather than resolving it, and stops recycling." },
      { text: "Check labels, bin positioning, training and employee understanding", isCorrect: true, feedback: "Correct. The workplace should investigate the system and employee understanding before assigning blame." },
      { text: "Issue disciplinary warnings immediately", isCorrect: false, feedback: "Disciplinary action without investigation is unlikely to produce a fair or effective solution." }
    ],
    correctExplanation: "Contamination is observable, but its cause has not yet been established. The workplace should investigate the system and employee understanding before assigning blame. Removing bins avoids the issue rather than resolving it. Disciplinary action without investigation is unlikely to produce a fair or effective solution.",
    incorrectExplanation: "Check labels, bin positioning, training and employee understanding.",
    practicalTakeaway: "Look at system design and employee guidance before assuming attitude is the problem."
  },
  {
    question: "Which objective is most suitable for an action plan?",
    options: [
      { text: "Stop all waste immediately", isCorrect: false, feedback: "This is unrealistic and impossible to manage or verify." },
      { text: "Encourage everyone to care more about the environment", isCorrect: false, feedback: "This is too vague and lacks specific targets, timeframe or owners." },
      { text: "Reduce recurring contamination in the staff recycling area over eight weeks through consistent labels, guidance and weekly checks", isCorrect: true, feedback: "Correct. This objective defines the issue, location, timeframe, actions and review method clearly." },
      { text: "Become the most sustainable company in Mauritius", isCorrect: false, feedback: "This is an ambition rather than a specific, manageable project." }
    ],
    correctExplanation: "This objective defines the issue, location, timeframe, actions and review method. The other objectives are vague, unrealistic or impossible to verify.",
    incorrectExplanation: "Reduce recurring contamination in the staff recycling area over eight weeks through consistent labels, guidance and weekly checks.",
    practicalTakeaway: "An objective is actionable when it defines what, where, how, and by when."
  },
  {
    question: "Meeting-room air-conditioning is often running when rooms are empty. What is the best first step?",
    options: [
      { text: "Replace every air-conditioning unit", isCorrect: false, feedback: "Replacing equipment before checking schedules and controls may waste capital." },
      { text: "Investigate room schedules, controls, employee practices and equipment condition", isCorrect: true, feedback: "Correct. The workplace should understand when and why equipment remains on before selecting a solution." },
      { text: "Ban all meeting-room use", isCorrect: false, feedback: "Banning room use does not address the operational problem and disrupts business." },
      { text: "Assume the energy bill is incorrect", isCorrect: false, feedback: "Assuming billing errors without evidence delays useful action." }
    ],
    correctExplanation: "The workplace should understand when and why equipment remains on before selecting a solution. Replacement may be unnecessary. Banning room use does not address the operational problem. Assuming billing errors without evidence delays useful action.",
    incorrectExplanation: "Investigate room schedules, controls, employee practices and equipment condition.",
    practicalTakeaway: "Always check operational schedules and controls before buying hardware."
  },
  {
    question: "A company sends three reminder emails about waste sorting, but contamination does not decrease. What should the action-plan owner do?",
    options: [
      { text: "Mark the plan successful because the emails were sent", isCorrect: false, feedback: "Sending emails is an activity. Success is measured by the actual outcome." },
      { text: "Continue sending the same email indefinitely", isCorrect: false, feedback: "Repeating an ineffective action without review is unlikely to improve performance." },
      { text: "Review the evidence, investigate the cause and adjust the actions", isCorrect: true, feedback: "Correct. The owner should examine why the action did not change the result and revise the plan." },
      { text: "Stop measuring the issue", isCorrect: false, feedback: "Stopping measurements ignores the issue instead of solving it." }
    ],
    correctExplanation: "Sending emails is an activity, not proof of improvement. The owner should examine why the action did not change the result and revise the plan. Repeating an ineffective action without review is unlikely to improve performance.",
    incorrectExplanation: "Review the evidence, investigate the cause and adjust the actions.",
    practicalTakeaway: "Measure the outcome of an action, not just the activity itself."
  },
  {
    question: "Which is the strongest evidence that a recycling improvement plan is working?",
    options: [
      { text: "The new signs look professional", isCorrect: false, feedback: "Attractive signs support the project but do not prove that waste contamination has improved." },
      { text: "Employees say the project is interesting", isCorrect: false, feedback: "Positive opinions do not provide measurable proof of environmental improvement." },
      { text: "Recorded contamination decreases consistently during the review period", isCorrect: true, feedback: "Correct. A consistent reduction in recorded contamination directly relates to the intended result." },
      { text: "The project was announced by management", isCorrect: false, feedback: "Management announcements do not verify whether employees are sorting waste correctly." }
    ],
    correctExplanation: "A consistent reduction in recorded contamination directly relates to the intended result. Attractive signs, positive opinions and management announcements may support the project but do not prove the workplace issue has improved.",
    incorrectExplanation: "Recorded contamination decreases consistently during the review period.",
    practicalTakeaway: "Choose indicators that directly measure the improvement of the workplace issue."
  }
];

export async function ensureActionPlanningCourse() {
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
      // 1. Ensure Course 12 exists dynamically to get its ID for prerequisite
      const course12 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.slug, "final-sustainability-certification")
      });

      if (!course12) {
        throw new Error("Data integrity error: Course 12 (final-sustainability-certification) not found. Prerequisite cannot be established.");
      }

      // Check if course 14 exists to set recommended next course, else defer (set null)
      const course14 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.slug, "conducting-a-workplace-waste-audit")
      });
      const recommendedNextCourseId = course14 ? course14.id : null;

      // 2. Resolve or insert Course 13
      let existingCourse = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.slug, COURSE_SLUG)
      });

      let actualCourseId: number;

      if (!existingCourse) {
        // Safe check for auto-increment ID conflict (if any skeleton occupies the ID)
        const byId = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.courseCode, COURSE_META.courseCode)
        });
        if (byId) {
          existingCourse = byId;
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
          recommendedNextCourseId,
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
          recommendedNextCourseId,
          intendedRoles: COURSE_META.intendedRoles,
          status: "published",
          isPublished: true,
        }).where(eq(coursesTable.id, actualCourseId));
      }

      // 3. Ensure Badge Definition exists
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
          orderIndex: 16,
          code: "COURSE_ELH_13_COMPLETE",
        });
      } else {
        await tx.update(badgeDefinitionsTable).set({
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          courseIds: [actualCourseId],
          code: "COURSE_ELH_13_COMPLETE",
        }).where(eq(badgeDefinitionsTable.slug, BADGE_SLUG));
      }

      // 4. Ensure Prerequisite to Course 12 exists
      const existingPrereq = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course12.id)
        )
      });

      if (!existingPrereq) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course12.id
        });
      }

      // 5. Seed Lessons safely
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

      // 6. Seed Quiz Questions safely
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

      // 7. Record system seed completion marker
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
