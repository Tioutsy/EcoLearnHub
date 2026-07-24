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

const COURSE_SLUG = "sustainability-for-operations-teams";
const COURSE_TITLE = "Sustainability for Operations Teams";
const BADGE_SLUG = "sustainable-operations-practitioner";
const BADGE_CODE = "COURSE_ELH_29_COMPLETE";
const SEED_NAME = "sustainability-for-operations-teams-v2";

const COURSE_META = {
  courseCode: "ELH-29",
  description: "Learn how operations teams can reduce avoidable waste, embed approved sustainability actions into daily routines and respond safely when workplace conditions change.",
  fullDescription: "Learn how operations teams can reduce avoidable waste, embed approved sustainability actions into daily routines and respond safely when workplace conditions change.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainability-for-operations-teams.jpg",
  intendedRoles: [
    "Operations employees",
    "Operations supervisors",
    "Site coordinators",
    "Warehouse employees",
    "Hospitality operations employees",
    "Retail operations employees",
    "Facilities and property operations employees",
    "Manufacturing and production support employees",
    "Managers responsible for daily service or process delivery"
  ],
  learningObjectives: [
    "explain how daily operations influence sustainability performance;",
    "identify avoidable resource loss without disrupting essential work;",
    "distinguish an approved improvement from an informal process change;",
    "build sustainability actions into normal operating routines;",
    "respond appropriately when a sustainability action creates an operational problem;",
    "maintain useful evidence of actions, deviations and results;",
    "escalate recurring barriers and support continuous improvement."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Sustainability for Operations Teams. You can now reduce resource waste, embed sustainability actions into daily routines, and handle process deviations safely in operations.",
  badgeName: "Sustainable Operations Practitioner",
  badgeDescription: "Awarded for demonstrating practical understanding of how to reduce resource waste, embed sustainability actions into daily routines, and handle process deviations safely in operations.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Operations Turns Plans Into Daily Practice",
    minutes: 3,
    content: "Understand how operations teams turn plans into daily results. Design routines that fit actual operating conditions rather than relying on abstract policies.",
    blocks: [
      {
        id: "c26-l1-b1",
        type: "heading",
        headingText: "Operations Turns Plans Into Daily Practice"
      },
      {
        id: "c26-l1-b2",
        type: "short_text",
        bodyText: "Workplace sustainability plans only produce results when they influence daily routines. Operations teams control when equipment runs, how waste is sorted, and how faults are logged. When a green procedure fails, the cause is often an unworkable process rather than employee attitude. Actions must be practical under real shift and time constraints."
      },
      {
        id: "c26-l1-b3",
        type: "key_message",
        headingText: "Routines Matter Most",
        bodyText: "For policies to succeed on the floor, they must be converted into clear, realistic steps that fit normal operating speeds."
      },
      {
        id: "c26-l1-b4",
        type: "decision_scenario",
        decisionIntro: "A company implements a new waste-sorting policy. It works in the quiet offices, but in the busy loading dock, waste accumulates without sorting because there are no bins near the delivery zones and workers are under strict delivery time pressure.",
        decisionPrompt: "What should the operations supervisor do?",
        decisionChoices: [
          {
            label: "Tell workers that environmental policy is more important than delivery speed.",
            correct: false,
            feedback: "Incorrect. Prioritizing rules over service without adjusting tools creates operational conflict and delays."
          },
          {
            label: "Identify the lack of nearby bins and time constraints as process barriers, and coordinate with the safety head to place bins directly at the dock and adjust layout routines.",
            correct: true,
            feedback: "Correct. Good operational sustainability requires adapting the work layout and tools to fit shift speeds."
          },
          {
            label: "Publish a report blaming workers for poor environmental attitude.",
            correct: false,
            feedback: "Incorrect. Blaming employees does not solve the lack of equipment or time constraints."
          },
          {
            label: "Suspend sorting in the dock permanently without reporting the issue.",
            correct: false,
            feedback: "Incorrect. Suspensions should not be done quietly; process obstacles must be reported."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Find Resource Loss in the Process",
    minutes: 3,
    content: "Identify avoidable waste of energy, water, and materials by observing processes before proposing changes. Involve supervisors for settings adjustments.",
    blocks: [
      {
        id: "c26-l2-b1",
        type: "heading",
        headingText: "Find Resource Loss in the Process"
      },
      {
        id: "c26-l2-b2",
        type: "short_text",
        bodyText: "Resource loss can be identified through process observations: equipment left running, damaged stock, water leaks, or over-ordering. Observe where the loss occurs and check what condition triggers it before changing settings. Avoid adjusting machine configurations without supervisor or technical approval."
      },
      {
        id: "c26-l2-b3",
        type: "key_message",
        headingText: "Observe First",
        bodyText: "Collect details on frequency and workflow context before proposing operational changes to avoid unintended bottlenecks."
      },
      {
        id: "c26-l2-b4",
        type: "decision_scenario",
        decisionIntro: "A Mauritian hotel laundry reports a sudden 25% surge in water usage. The laundry operator suspects the wash cycle settings are inefficient.",
        decisionPrompt: "What is the best immediate action?",
        decisionChoices: [
          {
            label: "Manually reprogram the washing machine cycles immediately to use less water.",
            correct: false,
            feedback: "Incorrect. Reprogramming machinery without technical authorization can damage equipment or compromise fabric hygiene."
          },
          {
            label: "Track actual laundry load levels, check for active pipe leaks, and share the observations with the supervisor and maintenance technician.",
            correct: true,
            feedback: "Correct. Gathering operating facts and reporting to the technician ensures a safe, data-driven solution."
          },
          {
            label: "Assume occupancy increased and ignore the cost change.",
            correct: false,
            feedback: "Incorrect. Cost surges should be investigated rather than dismissed as occupancy changes without verification."
          },
          {
            label: "Refuse to wash linens until the system is checked.",
            correct: false,
            feedback: "Incorrect. Stopping core service delivery is excessive and disrupts hotel operations."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Improve the Process Without Creating New Risks",
    minutes: 3,
    content: "Ensure sustainability improvements do not compromise safety, hygiene, or quality controls. Check instructions and verify approvals.",
    blocks: [
      {
        id: "c26-l3-b1",
        type: "heading",
        headingText: "Improve the Process Without Creating New Risks"
      },
      {
        id: "c26-l3-b2",
        type: "short_text",
        bodyText: "Operational improvements must never compromise safety, hygiene, or quality. Turning off fans, reducing cleaning cycles, or lowering temperatures must follow manufacturer guidelines and safety parameters. Check who owns the process and verify safety approval before modifying any systems."
      },
      {
        id: "c26-l3-b3",
        type: "key_message",
        headingText: "Safety & Quality First",
        bodyText: "Environmental efficiency must operate within the boundaries of safe operational design and product quality standards."
      },
      {
        id: "c26-l3-b4",
        type: "decision_scenario",
        decisionIntro: "A warehouse employee suggests shutting down the ventilation fans during the hot afternoon hours when shipments are slow to conserve electricity.",
        decisionPrompt: "How should the warehouse manager respond?",
        decisionChoices: [
          {
            label: "Shut the fans down immediately since afternoon hours are quiet.",
            correct: false,
            feedback: "Incorrect. Shutting ventilation without verifying temperature and air flow requirements can compromise employee safety and product hygiene."
          },
          {
            label: "Refuse the shutdown until the ventilation requirement is verified with the safety officer, facilities manager, and product storage guidelines.",
            correct: true,
            feedback: "Correct. Safety and product storage specifications must be verified before disabling ventilation systems."
          },
          {
            label: "Tell the employee that energy saving is not allowed.",
            correct: false,
            feedback: "Incorrect. Energy saving is encouraged, but it must be done safely within approved parameters."
          },
          {
            label: "Turn the fans off and wait to see if anyone complains.",
            correct: false,
            feedback: "Incorrect. Waiting for complaints is a high-risk approach that compromises workplace safety."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Build Approved Actions Into the Routine",
    minutes: 3,
    content: "Embed sustainability actions into daily checklists with clear owners, triggers, and contingency instructions. Avoid vague instructions.",
    blocks: [
      {
        id: "c26-l4-b1",
        type: "heading",
        headingText: "Build Approved Actions Into the Routine"
      },
      {
        id: "c26-l4-b2",
        type: "short_text",
        bodyText: "Vague instructions like 'save electricity' or 'reduce waste' are rarely followed. Build concrete tasks into existing routines: who does what, when, where, and what the exceptions are. Examples include checking for leaks during morning opening, or shutting down specific computers at closing."
      },
      {
        id: "c26-l4-b3",
        type: "key_message",
        headingText: "Structured Routines",
        bodyText: "Routines are successful when the task is built directly into existing checklists and has clear, assigned owners."
      },
      {
        id: "c26-l4-b4",
        type: "decision_scenario",
        decisionIntro: "A manager issues an instruction to 'use less lighting in the retail store.' This has led to dim checkout zones and dark customer displays.",
        decisionPrompt: "How can this instruction be converted into a workable routine?",
        decisionChoices: [
          {
            label: "Leave it to the staff's daily judgment to decide which zones to turn off.",
            correct: false,
            feedback: "Incorrect. Staff judgment leads to inconsistent lighting, customer confusion, and safety issues."
          },
          {
            label: "Specify that the supervisor switches off the window and back-room display lights exactly at 18:00, keeping checkouts and exit pathways fully lit.",
            correct: true,
            feedback: "Correct. This routine defines the owner, exact action, timing, location, and safety exceptions."
          },
          {
            label: "Turn off all lights at 17:00 while the store is still open.",
            correct: false,
            feedback: "Incorrect. Turning off all lights during store hours compromises customer safety and sales."
          },
          {
            label: "Remove the checkout zone lights permanently.",
            correct: false,
            feedback: "Incorrect. Removing necessary work area lighting compromises employee vision and quality."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Respond When the Plan Does Not Work",
    minutes: 3,
    content: "Protect safety and operations during disruptions. Record deviations, apply contingencies, and report recurring capacity issues.",
    blocks: [
      {
        id: "c26-l5-b1",
        type: "heading",
        headingText: "Respond When the Plan Does Not Work"
      },
      {
        id: "c26-l5-b2",
        type: "short_text",
        bodyText: "If operational conditions disrupt a sustainability routine (e.g. equipment failure, workload peaks, hygiene hazards), prioritize safety and operations immediately. Use the approved temporary workaround, record the deviation, and report the issue to the supervisor rather than ignoring it or creating shortcuts."
      },
      {
        id: "c26-l5-b3",
        type: "key_message",
        headingText: "Contingency and Report",
        bodyText: "Never hide process failures. Manage the immediate operational risk safely and escalate the recurring bottleneck for review."
      },
      {
        id: "c26-l5-b4",
        type: "decision_scenario",
        decisionIntro: "A hotel kitchen's food-waste container fills up completely before the scheduled collection time, creating a hygiene issue. What is the correct response?",
        decisionPrompt: "Select the operational response:",
        decisionChoices: [
          {
            label: "Leave the food waste on the floor next to the container.",
            correct: false,
            feedback: "Incorrect. Leaving waste on the floor creates immediate pest and hygiene hazards."
          },
          {
            label: "Use the approved local hygiene contingency bin, record the overflow deviation, and report the recurring capacity issue to the operations supervisor.",
            correct: true,
            feedback: "Correct. This manages the immediate hazard safely and escalates the capacity problem for collection adjustments."
          },
          {
            label: "Mix the food waste into the cardboard recycling bin quietly.",
            correct: false,
            feedback: "Incorrect. Mixing waste streams contaminates recyclables and violates environmental rules."
          },
          {
            label: "Stop kitchen operations until the container is emptied.",
            correct: false,
            feedback: "Incorrect. Shutting down service operations for a full container is excessive and disrupts business."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Record, Review and Improve",
    minutes: 3,
    content: "Verify operational outcomes with reliable checklists and records. Maintain record honesty and select practical improvement commitments.",
    blocks: [
      {
        id: "c26-l6-b1",
        type: "heading",
        headingText: "Record, Review and Improve"
      },
      {
        id: "c26-l6-b2",
        type: "short_text",
        bodyText: "Use actual checklist records, utility meter logs, and waste slips to review performance. Never falsify checklist records to hide missed days. Reviews are successful when they identify what worked, what failed, and what adjustments require formal approval."
      },
      {
        id: "c26-l6-b3",
        type: "key_message",
        headingText: "Improvement Loop",
        bodyText: "Honest records help operations identify process failures and build workable solutions for subsequent runs."
      },
      {
        id: "c26-l6-b4",
        type: "commitment_scenario",
        commitmentPrompt: "Select one operational routine you can improve in your department:",
        commitmentChoices: [
          "Reporting leaks or faults more consistently",
          "Improving shutdown checks",
          "Separating materials at the point where waste is created",
          "Recording recurring operational barriers",
          "Clarifying ownership of a sustainability task",
          "Escalating a process that creates avoidable waste"
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "A company introduces a recycling policy, but the busy loading dock has no collection bins near the delivery zones and workers face strict delivery schedules. What should the supervisor do?",
    options: [
      { text: "Reprimand workers for failing to follow the environmental rules.", isCorrect: false, feedback: "Incorrect. Blaming staff does not resolve the lack of equipment or time constraints." },
      { text: "Identify the lack of nearby bins and time constraints as process barriers, and arrange for bins at the dock and adjust layouts.", isCorrect: true, feedback: "Correct. Operations should identify workflow barriers and adjust tools to fit real operating speeds." },
      { text: "Suspend sorting in the dock permanently without reporting it.", isCorrect: false, feedback: "Incorrect. Suspensions should not be done quietly; report process obstacles." },
      { text: "Tell workers to ignore the delivery deadlines to sort waste.", isCorrect: false, feedback: "Incorrect. Prioritizing rules over delivery targets without process changes causes service bottlenecks." }
    ],
    correctExplanation: "Operations must identify workflow barriers and adjust tools to fit real operating speeds rather than blaming employees.",
    incorrectExplanation: "Blaming employees, suspending tasks quietly, or ignoring targets fails to address process blockers.",
    practicalTakeaway: "Identify layout and tool barriers rather than blaming employee motivation."
  },
  {
    question: "A hotel laundry observes a sudden 25% surge in water consumption. What should the operator do before suggesting machine settings adjustments?",
    options: [
      { text: "Manually reprogram the wash cycle parameters immediately.", isCorrect: false, feedback: "Incorrect. Reprogramming equipment without technical clearance can damage machinery." },
      { text: "Track load levels, check for leaks, and share actual operating records with the supervisor and maintenance technician.", isCorrect: true, feedback: "Correct. Gather operational data and consult maintenance before changing system settings." },
      { text: "Assume occupancy increased and ignore the cost change.", isCorrect: false, feedback: "Incorrect. Significant surges should be investigated, not ignored." },
      { text: "Refuse to wash linens until the system is checked.", isCorrect: false, feedback: "Incorrect. Halting core operations is excessive and disrupts hospitality services." }
    ],
    correctExplanation: "Gather operational facts and consult maintenance before changing system settings to avoid process failures.",
    incorrectExplanation: "Arbitrary reprogramming, ignoring cost changes, or halting work ignores balanced process verification.",
    practicalTakeaway: "Gather process data and consult maintenance before altering equipment settings."
  },
  {
    question: "An employee wants to turn off warehouse ventilation fans during slow afternoon shifts to save electricity. What should the manager do?",
    options: [
      { text: "Turn off the fans immediately since afternoons are slow.", isCorrect: false, feedback: "Incorrect. Turning off ventilation without checking safety and storage specifications is high risk." },
      { text: "Confirm safety requirements, temperature parameters, and storage guidelines with the facilities manager and safety officer first.", isCorrect: true, feedback: "Correct. Safety and product storage specifications must be verified before turning off ventilation." },
      { text: "Tell the employee that energy-saving is not allowed in the warehouse.", isCorrect: false, feedback: "Incorrect. Energy saving is encouraged, but it must be done safely within limits." },
      { text: "Turn the fans off and wait to see if anyone complains.", isCorrect: false, feedback: "Incorrect. Waiting for complaints compromises health and safety." }
    ],
    correctExplanation: "Safety and product storage specifications must be verified before turning off ventilation or other environmental control systems.",
    incorrectExplanation: "Unverified shutdowns, blocking all improvements, or waiting for complaints violates risk management protocols.",
    practicalTakeaway: "Verify safety and storage limits before disabling ventilation or control systems."
  },
  {
    question: "A manager issues an instruction to 'use less lighting in the retail store,' which has caused checkout areas to become dim and hard to navigate. How should this be improved?",
    options: [
      { text: "Leave it to staff judgment to turn lights off zone-by-zone.", isCorrect: false, feedback: "Incorrect. Leaving lighting to individual judgment causes inconsistent and unsafe spaces." },
      { text: "Define the specific supervisor task: switch off window display lights at 18:00, keeping checkouts and safety pathways fully lit.", isCorrect: true, feedback: "Correct. Defining specific equipment, timings, owners, and safety exceptions makes the routine workable." },
      { text: "Omit all lighting rules to keep checkouts bright.", isCorrect: false, feedback: "Incorrect. Display lights can still be optimized; define specific rules instead of omitting them." },
      { text: "Remove the checkout zone lights permanently.", isCorrect: false, feedback: "Incorrect. Removing work area lighting compromises worker safety and vision." }
    ],
    correctExplanation: "Workable routines define the specific equipment, timings, owners, and safety exceptions rather than using vague guidelines.",
    incorrectExplanation: "Vague instructions, removing core safety lighting, or omitting all rules ignores the need for clear procedures.",
    practicalTakeaway: "Define specific equipment, times, owners, and exceptions for energy routines."
  },
  {
    question: "A hotel kitchen's food-waste container overflows before collection, creating a hygiene hazard. What should kitchen staff do?",
    options: [
      { text: "Leave the excess food waste on the floor next to the bin.", isCorrect: false, feedback: "Incorrect. Leaving waste exposed creates pest and hygiene hazards." },
      { text: "Use the approved local hygiene contingency bin, record the overflow, and report the capacity issue to the supervisor.", isCorrect: true, feedback: "Correct. Implement the approved hygiene contingency and report the capacity issue for adjustment." },
      { text: "Mix the food waste into the cardboard recycling bin.", isCorrect: false, feedback: "Incorrect. Contaminating recyclables violates waste regulations." },
      { text: "Stop cooking until the waste is collected.", isCorrect: false, feedback: "Incorrect. Halting food production disrupts operations unnecessarily." }
    ],
    correctExplanation: "Implement the approved hygiene contingency to manage immediate risk, and report the capacity issue for collection scheduling updates.",
    incorrectExplanation: "Floor dumping, bin contamination, or stopping kitchen operations fails to resolve the process capacity issue.",
    practicalTakeaway: "Apply hygiene workarounds immediately and escalate the capacity bottleneck."
  },
  {
    question: "During a peak business season, a retail store suspends its cardboard sorting routine to save time. What should the operations coordinator do?",
    options: [
      { text: "Pretend the sorting continued to avoid policy violations.", isCorrect: false, feedback: "Incorrect. Falsifying reports is unethical and hides the operational challenge." },
      { text: "Record the peak season exception, specify when the standard routine should resume, and escalate if the suspension persists.", isCorrect: true, feedback: "Correct. Document the exception, set a resumption trigger, and escalate if the suspension becomes permanent." },
      { text: "Cancel the sorting policy permanently.", isCorrect: false, feedback: "Incorrect. Cardboard sorting is valid; only peak scheduling needs to be managed." },
      { text: "Force sorting during the peak shifts, regardless of customer delays.", isCorrect: false, feedback: "Incorrect. Operational service priorities must be balanced during peak demand." }
    ],
    correctExplanation: "Document the peak season exception, note when standard routines should resume, and escalate if the suspension becomes permanent.",
    incorrectExplanation: "Falsifying records, permanent cancellation, or ignoring peak service demands compromises operations.",
    practicalTakeaway: "Document temporary process suspensions and define when normal routines resume."
  },
  {
    question: "An operations supervisor asks an employee to sign off on opening leak checklists for a week where no checks were performed. How should the employee respond?",
    options: [
      { text: "Sign the checklists to maintain department compliance scores.", isCorrect: false, feedback: "Incorrect. Back-dating checks that did not occur violates data integrity guidelines." },
      { text: "Refuse to falsify the records, document the missing checks accurately, and report the scheduling blocker that prevented the checks.", isCorrect: true, feedback: "Correct. Protect record integrity, refuse falsification, and document the blockers that prevented completion." },
      { text: "Fill in random readings on the checklists.", isCorrect: false, feedback: "Incorrect. Fabricating readings is unethical and misleads compliance audits." },
      { text: "Exempt the supervisor from audit review.", isCorrect: false, feedback: "Incorrect. All operational processes must be auditable and transparent." }
    ],
    correctExplanation: "Protect record integrity, refuse falsification, and document the scheduling blockers that prevented completion.",
    incorrectExplanation: "Back-dating, fabricating readings, or ignoring audit bounds violates corporate compliance code.",
    practicalTakeaway: "Refuse to back-date checks. Record missing dates accurately."
  },
  {
    question: "A waste sorting project reduces plastic waste by 30% but increases customer waiting times at checkout. How should operations review this?",
    options: [
      { text: "Ignore the waiting times since the plastic target was met.", isCorrect: false, feedback: "Incorrect. Customer service metrics are critical for business viability." },
      { text: "Review both outcomes, identify the checkout bottleneck, and adjust the layout or process to protect service speed.", isCorrect: true, feedback: "Correct. Operations reviews both metrics and adjusts the workflow to protect service speed." },
      { text: "Cancel the waste sorting project immediately.", isCorrect: false, feedback: "Incorrect. The sorting is successful; adjust the process rather than cancelling it." },
      { text: "Double the checkout staff without analyzing the process.", isCorrect: false, feedback: "Incorrect. Doubling staff without process review leads to labor cost inefficiencies." }
    ],
    correctExplanation: "Operations reviews both environmental and service metrics, adjusting the process workflow to protect checkout speeds.",
    incorrectExplanation: "Ignoring customer impacts, immediate project cancellation, or hiring staff without review ignores process optimization.",
    practicalTakeaway: "Review both environmental results and service impacts, then adjust the process."
  }
];

export async function ensureSustainabilityForOperationsTeamsCourse() {
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

      // 2. Resolve Course 17
      let course17 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-17")
      });
      if (!course17) {
        course17 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "tracking-sustainability-actions-and-progress")
        });
      }

      if (!course17) {
        throw new Error("Data integrity error: Course 17 (ELH-17) not found. Prerequisite cannot be established.");
      }

      // 3. Resolve or insert Course 26
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

      // 4. Update Course 28 recommendedNextCourseId to point to Course 29 preserving admin edits
      let course28 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-28")
      });
      if (!course28) {
        course28 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "sustainability-for-sales-and-marketing-teams")
        });
      }

      if (course28) {
        let isSystemManaged = false;
        if (course28.recommendedNextCourseId) {
          const currentRecommendedCourse = await tx.query.coursesTable.findFirst({
            where: eq(coursesTable.id, course28.recommendedNextCourseId)
          });
          if (currentRecommendedCourse && (currentRecommendedCourse.courseCode === "ELH-26" || currentRecommendedCourse.courseCode === "ELH-29")) {
            isSystemManaged = true;
          }
        }

        if (course28.recommendedNextCourseId === null || course28.recommendedNextCourseId === actualCourseId || isSystemManaged) {
          await tx.update(coursesTable).set({
            recommendedNextCourseId: actualCourseId
          }).where(eq(coursesTable.id, course28.id));
        } else {
          logger.warn(`Recommendation conflict: Course 28 currently recommends course ID ${course28.recommendedNextCourseId} instead of Course 29 (ID: ${actualCourseId}). Preserving administrator edit.`);
        }
      } else {
        logger.warn("Data integrity note: Course 28 not found during Course 29 recommendation configuration.");
      }

      // Clear Course 25's recommendation pointing to Course 29 (which was Course 26), and update Course 25 to recommend Course 27 (Facilities & Property)
      let course25 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-25")
      });
      if (course25) {
        let course27Ref = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.courseCode, "ELH-27")
        });
        if (course27Ref) {
          if (course25.recommendedNextCourseId === null || course25.recommendedNextCourseId === actualCourseId) {
            await tx.update(coursesTable).set({
              recommendedNextCourseId: course27Ref.id
            }).where(eq(coursesTable.id, course25.id));
          }
        }
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
          icon: "award",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 29,
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
      // Prerequisite 1: Course 17
      const existingPrereq17 = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course17.id)
        )
      });
      if (!existingPrereq17) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course17.id
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

      // Cleanup old prerequisite relationships (Course 23 if it was previously set)
      let course23Ref = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-23")
      });
      if (course23Ref) {
        await tx.delete(coursePrerequisitesTable).where(
          and(
            eq(coursePrerequisitesTable.courseId, actualCourseId),
            eq(coursePrerequisitesTable.prerequisiteCourseId, course23Ref.id)
          )
        );
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
