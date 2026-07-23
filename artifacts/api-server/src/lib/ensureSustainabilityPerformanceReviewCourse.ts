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

const COURSE_SLUG = "reviewing-sustainability-performance-and-corrective-action";
const COURSE_TITLE = "Reviewing Sustainability Performance and Taking Corrective Action";
const BADGE_SLUG = "sustainability-performance-reviewer";
const BADGE_CODE = "COURSE_ELH_19_COMPLETE";
const SEED_NAME = "sustainability-performance-review-v1";

const COURSE_META = {
  courseCode: "ELH-19",
  description: "Learn how to review sustainability results, identify performance gaps and agree corrective actions that address the real cause of a problem. This course helps workplace teams turn tracking information into practical follow-up and measurable improvement.",
  fullDescription: "Learn how to review sustainability results, identify performance gaps and agree corrective actions that address the real cause of a problem. This course helps workplace teams turn tracking information into practical follow-up and measurable improvement.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/reviewing-sustainability-performance-and-corrective-action.jpg",
  intendedRoles: ["employees", "green team members", "department coordinators", "supervisors", "managers", "facilities and operations staff", "HR, procurement and administration teams", "ESG or compliance support staff"],
  learningObjectives: [
    "Compare actual performance with an agreed target or expected result.",
    "Identify when performance requires investigation.",
    "Distinguish evidence from assumptions during a review.",
    "Separate immediate symptoms from possible root causes.",
    "Select practical and proportionate corrective actions.",
    "Assign ownership, deadlines and follow-up checks.",
    "Document review decisions clearly.",
    "Escalate significant, repeated or uncertain issues appropriately."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Reviewing Sustainability Performance and Taking Corrective Action. You can now identify performance gaps, investigate likely causes and document practical follow-up actions more clearly.",
  badgeName: "Sustainability Performance Reviewer",
  badgeDescription: "Awarded for completing Reviewing Sustainability Performance and Taking Corrective Action and demonstrating the ability to identify performance gaps, investigate likely causes and document practical follow-up actions.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Compare the Result with the Expectation",
    minutes: 3,
    content: "Learn how to compare actual performance with targets and baseline data. Understand how context factors like occupancy, staffing levels, or seasonal variations impact results.",
    blocks: [
      {
        id: "c19-l1-b1",
        type: "heading",
        headingText: "Compare the Result with the Expectation"
      },
      {
        id: "c19-l1-b2",
        type: "short_text",
        bodyText: "A performance review begins by comparing actual results with agreed expectations or baselines. If paper purchases have not decreased after introducing digital approvals, does this automatically mean the action failed?\n\nTo conduct a fair review, check: the original action, intended result, indicator, comparison period, and evidence source. Always review context—such as changes in staffing, customer occupancy, equipment failure, supplier delays, or seasonal business activity—before judging success."
      },
      {
        id: "c19-l1-b3",
        type: "key_message",
        headingText: "Fair Comparisons",
        bodyText: "Always compare actual performance with a clearly defined expectation and relevant context before deciding what the result means."
      },
      {
        id: "c19-l1-b4",
        type: "decision_scenario",
        decisionIntro: "An office's electricity use remained flat despite installing LED lights, but occupancy doubled during the same period. What should the team check first?",
        decisionPrompt: "Select the most appropriate review step:",
        decisionChoices: [
          {
            label: "Declare the LED installation unsuccessful",
            correct: false,
            feedback: "Incorrect. This ignores the significant context change (doubled occupancy)."
          },
          {
            label: "Verify whether the LEDs are functional, and calculate energy consumption per office occupant to adjust for the doubled occupancy context",
            correct: true,
            feedback: "Correct. Comparing consumption per occupant adjusts for the occupancy change, providing a fair basis for comparison."
          },
          {
            label: "Remove the occupancy figures from the data to keep the chart simple",
            correct: false,
            feedback: "Incorrect. Ignoring critical workplace context changes distorts the review's accuracy."
          },
          {
            label: "Change the targets so the LED project appears successful",
            correct: false,
            feedback: "Incorrect. Arbitrarily changing baseline targets without analysis is poor data practice."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Identify the Performance Gap",
    minutes: 3,
    content: "Describe performance gaps precisely using numbers, locations, and timeframes. Avoid subjective labels like 'waste sorting is bad' in favor of objective, audit-ready statements.",
    blocks: [
      {
        id: "c19-l2-b1",
        type: "heading",
        headingText: "Identify the Performance Gap"
      },
      {
        id: "c19-l2-b2",
        type: "short_text",
        bodyText: "A performance gap is the difference between what was expected and what actually happened. A clear gap statement should list: the indicator, expected result, actual result, review period, location, and supporting evidence.\n\nAvoid vague statements like 'waste sorting is not working.' Instead, use precise details: 'During the four-week review period, contamination was recorded in five of eight checks at the staff canteen recycling point.'"
      },
      {
        id: "c19-l2-b3",
        type: "key_message",
        headingText: "Precise Gap Wording",
        bodyText: "Wording gaps precisely makes it easier to target the cause and select the correct corrective action."
      },
      {
        id: "c19-l2-b4",
        type: "decision_scenario",
        decisionIntro: "A Mauritian hotel team notices back-of-house waste stations are failing separation targets. Which is the clearest performance gap statement?",
        decisionPrompt: "Select the clearest statement:",
        decisionChoices: [
          {
            label: "Staff are mixing waste again because they are in a rush.",
            correct: false,
            feedback: "Incorrect. This is an assumption about motivation, not a factual statement of the gap."
          },
          {
            label: "Back-of-house recycling bins are contaminated.",
            correct: false,
            feedback: "Incorrect. This lacks timeframes, locations, specific indicators, or evidence statistics."
          },
          {
            label: "Weekly waste review logs show that plastic packaging was mixed with food waste in 6 out of 10 checks during the evening shifts in July.",
            correct: true,
            feedback: "Correct. This statement specifies the source (weekly review logs), what was mixed (plastic and food), the rate (6 out of 10), the timeframe (evening shifts in July), and the location (back-of-house)."
          },
          {
            label: "We need better waste containers in the hotel.",
            correct: false,
            feedback: "Incorrect. This is a proposed solution, not a description of the performance gap."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Investigate Causes, Not Just Symptoms",
    minutes: 3,
    content: "Differentiate immediate symptoms from root causes. Learn how to ask simple investigative questions about unclear instructions, equipment, placement, or training.",
    blocks: [
      {
        id: "c19-l3-b1",
        type: "heading",
        headingText: "Investigate Causes, Not Just Symptoms"
      },
      {
        id: "c19-l3-b2",
        type: "short_text",
        bodyText: "A symptom is the visible issue. A cause explains why it happened. A root cause is the underlying process issue that, if fixed, prevents the problem from returning.\n\nInvestigate by asking: What happened? Where and when? Is it repeated or isolated? What changed? Who knows the process? Common cause categories include: unclear instructions, lack of ownership, missing equipment/tools, poor placement, process conflicts, or inadequate training."
      },
      {
        id: "c19-l3-b3",
        type: "key_message",
        headingText: "Root Cause Focus",
        bodyText: "Address the cause, not just the symptom. Moving the trash bin closer (addressing placement cause) is more effective than repeatedly telling people to use it (treating symptom)."
      },
      {
        id: "c19-l3-b4",
        type: "decision_scenario",
        decisionIntro: "A warehouse repeatedly leaves heating and lighting systems running after closing hours. Which response investigates the cause rather than repeating the symptom?",
        decisionPrompt: "Select the investigative response:",
        decisionChoices: [
          {
            label: "Write down that the heating and lighting were left on again on Monday.",
            correct: false,
            feedback: "Incorrect. This merely re-records the visible symptom."
          },
          {
            label: "Ask the warehouse supervisor who is responsible for the closing routine, check if a closing checklist exists, and verify if the shutdown switches are clearly marked.",
            correct: true,
            feedback: "Correct. This investigates ownership, process, and tools to identify why the shutdown did not happen."
          },
          {
            label: "Remind staff to turn off lights when leaving.",
            correct: false,
            feedback: "Incorrect. This treats the symptom with advice, without checking why it failed (e.g. lack of closing checklist or assigned owner)."
          },
          {
            label: "Install automated sensors immediately without asking questions.",
            correct: false,
            feedback: "Incorrect. This jumps to a costly solution before understanding the underlying operational cause."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Select a Proportionate Corrective Action",
    minutes: 3,
    content: "Distinguish immediate corrections from long-term corrective actions. Select actions that are relevant, achievable, specific, and assigned.",
    blocks: [
      {
        id: "c19-l4-b1",
        type: "heading",
        headingText: "Select a Proportionate Corrective Action"
      },
      {
        id: "c19-l4-b2",
        type: "short_text",
        bodyText: "Immediate Correction fixes the current issue (e.g. removing plastic from a paper recycling bin). Corrective Action prevents the issue from recurring (e.g. updating signage and briefing shifts).\n\nA corrective action must be specific, achievable, assigned to one owner, time-bound, and proportionate to the impact of the problem. Simply repeating general awareness messages is rarely effective."
      },
      {
        id: "c19-l4-b3",
        type: "key_message",
        headingText: "Action Range",
        bodyText: "Possible actions include: clarifying instructions, updating checklists, reassigning ownership, repairing tools, or adjusting target timelines."
      },
      {
        id: "c19-l4-b4",
        type: "decision_scenario",
        decisionIntro: "Waste contamination occurs because recycling labels are positioned behind the bins where staff cannot see them when approaching. What is the most appropriate corrective action?",
        decisionPrompt: "Select the most appropriate action:",
        decisionChoices: [
          {
            label: "Publish a story in the annual newsletter about how recycling works.",
            correct: false,
            feedback: "Incorrect. This does not address the physical cause (labels hidden behind the bins)."
          },
          {
            label: "Reposition the labels to eye-level on the wall above the bins by Friday, and inspect the bins for contamination weekly for three weeks to verify success.",
            correct: true,
            feedback: "Correct. This physically addresses the cause, sets a clear deadline, and includes a verification plan."
          },
          {
            label: "Remove the recycling bins to prevent staff from making mistakes.",
            correct: false,
            feedback: "Incorrect. This is an extreme response that cancels the recycling goal entirely."
          },
          {
            label: "Tell staff to look harder for the labels when throwing trash away.",
            correct: false,
            feedback: "Incorrect. This blames the user rather than fixing the poor placement cause."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Assign Ownership and Follow-Up",
    minutes: 3,
    content: "Assign actions to a single accountable role with a realistic deadline and a follow-up date. Avoid collective ownership terms like 'everyone' or 'the team'.",
    blocks: [
      {
        id: "c19-l5-b1",
        type: "heading",
        headingText: "Assign Ownership and Follow-Up"
      },
      {
        id: "c19-l5-b2",
        type: "short_text",
        bodyText: "Corrective actions must be logged with one clear owner (using a named role rather than collective terms like 'everyone' or 'the team'), start date, due date, resources, completion evidence, and follow-up check date.\n\nWater leak example: A leak remains unrepaired for weeks because Maintenance believed Procurement was ordering the part, while Procurement believed Maintenance had already ordered it. Clear ownership entries solve this confusion."
      },
      {
        id: "c19-l5-b3",
        type: "key_message",
        headingText: "Tracking Entry",
        bodyText: "Record ownership clearly. Use a specific role (e.g. 'Facilities Supervisor') so accountability is maintained even if staff shifts occur."
      },
      {
        id: "c19-l5-b4",
        type: "decision_scenario",
        decisionIntro: "Which tracker entry provides the clearest accountability for repairing a leaking valve?",
        decisionPrompt: "Select the entry with clear accountability:",
        decisionChoices: [
          {
            label: "Action: Fix leak. Owner: Maintenance. Due date: ASAP.",
            correct: false,
            feedback: "Incorrect. 'Maintenance' is a group, and 'ASAP' is not a defined deadline."
          },
          {
            label: "Action: Facilities Lead to order replacement valve and verify installation; Due: 10-Aug; Follow-up check: 15-Aug; Evidence: repair work order.",
            correct: true,
            feedback: "Correct. This defines a specific owner role (Facilities Lead), exact deadline and follow-up dates, and clear evidence requirements."
          },
          {
            label: "Action: Get the plumber in. Owner: Anyone on shift. Due date: Next month.",
            correct: false,
            feedback: "Incorrect. 'Anyone' means no one is accountable, and 'next month' lacks a specific completion date."
          },
          {
            label: "Action: Discuss valve replacement at the next green team meeting.",
            correct: false,
            feedback: "Incorrect. This is a task to talk about the leak, not an action to repair it."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Check Effectiveness and Record the Decision",
    minutes: 3,
    content: "Distinguish 'action completed' from 'action effective'. Learn how to review outcomes, update trackers, and establish simple progress commitments.",
    blocks: [
      {
        id: "c19-l6-b1",
        type: "heading",
        headingText: "Check Effectiveness and Record the Decision"
      },
      {
        id: "c19-l6-b2",
        type: "short_text",
        bodyText: "Completing a task does not automatically mean the problem is solved. Distinguish: Action Completed (new recycling signs installed) from Action Effective (contamination dropped to expected level).\n\nReview outcomes: close the action (if effective), extend the timeline, revise the action (if complete but ineffective), or escalate to management for repeated failures."
      },
      {
        id: "c19-l6-b3",
        type: "key_message",
        headingText: "Effectiveness Rule",
        bodyText: "Only close an action on the tracker after verifying that the performance gap has actually improved based on evidence."
      },
      {
        id: "c19-l6-b4",
        type: "commitment_scenario",
        commitmentPrompt: "Which performance review improvement would be most useful in your workplace?",
        commitmentChoices: [
          "Review one overdue sustainability action",
          "Rewrite one vague performance-gap statement",
          "Assign a clear owner to one corrective action",
          "Add a follow-up date to an existing tracker",
          "Check whether one completed action was actually effective"
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "A company introduced digital approvals to reduce paper use. Paper purchases remained unchanged, but employee numbers increased by 25%. What is the best review response?",
    options: [
      { text: "Declare the digital approvals initiative unsuccessful immediately.", isCorrect: false, feedback: "Incorrect. This ignores the 25% staff increase context." },
      { text: "Compare paper use using a relative measure (like sheets per employee) and consider the increase in staff.", isCorrect: true, feedback: "Correct. Adjusting for the employee count changes provides a fair basis for performance analysis." },
      { text: "Remove the new employee figures from the review data to keep the report simple.", isCorrect: false, feedback: "Incorrect. Hiding context changes distorts the performance review." },
      { text: "Report that paper use decreased because the digital process was successfully implemented.", isCorrect: false, feedback: "Incorrect. Reporting success despite unchanged purchases is misleading." }
    ],
    correctExplanation: "Performance reviews must compare results using a fair comparison and relevant context, such as staff growth.",
    incorrectExplanation: "Declaring failure, hiding data, or reporting false success ignores baseline context principles.",
    practicalTakeaway: "Review performance using a fair comparison and relevant workplace context."
  },
  {
    question: "Which represents the clearest performance-gap statement for a tracker update?",
    options: [
      { text: "Recycling is bad.", isCorrect: false, feedback: "Incorrect. This is a vague opinion, not a performance gap." },
      { text: "Staff do not care about waste sorting.", isCorrect: false, feedback: "Incorrect. This is a subjective assumption about motivation." },
      { text: "During six weekly checks, mixed food packaging was found four times in the canteen paper-recycling container.", isCorrect: true, feedback: "Correct. This states the location (canteen), what was mixed, the rate (4 of 6 checks), and the specific container." },
      { text: "The waste bins are probably confusing.", isCorrect: false, feedback: "Incorrect. This is a guess about a cause, not a description of the gap." }
    ],
    correctExplanation: "A clear gap statement describes what happened, where, when, and how often based on objective evidence.",
    incorrectExplanation: "Vague opinions, guesses about motivation, or suggestions about causes are not gap statements.",
    practicalTakeaway: "A useful gap statement describes what happened, where, when, and how often."
  },
  {
    question: "The lights remain on after warehouse closing hours. Which statement describes a possible cause rather than only the symptom?",
    options: [
      { text: "The warehouse lights are currently on.", isCorrect: false, feedback: "Incorrect. This merely restates the visible symptom." },
      { text: "Electricity is being consumed after hours.", isCorrect: false, feedback: "Incorrect. This is a description of the symptom's effect, not its cause." },
      { text: "No role is assigned to complete the final shutdown check.", isCorrect: true, feedback: "Correct. This describes a process gap (unassigned ownership) that explains why the lights were left on." },
      { text: "The warehouse should save more energy.", isCorrect: false, feedback: "Incorrect. This is a general advice plea, not a cause." }
    ],
    correctExplanation: "A cause explains why an issue occurs, whereas a symptom is simply the visible result of the problem.",
    incorrectExplanation: "Restating the problem, describing its effects, or pleading for general behavior change does not identify the cause.",
    practicalTakeaway: "Investigate why the issue happens before selecting a corrective action."
  },
  {
    question: "Waste contamination occurs because labels are positioned behind the bins and cannot be seen by staff. What is the most appropriate corrective action?",
    options: [
      { text: "Send a general annual sustainability newsletter to all staff.", isCorrect: false, feedback: "Incorrect. A newsletter does not address the physical placement issue." },
      { text: "Move the labels to visible positions above the bins and verify contamination rates during the next review period.", isCorrect: true, feedback: "Correct. This addresses the specific cause (label placement) and schedules follow-up checks." },
      { text: "Remove all recycling stations to prevent mistakes.", isCorrect: false, feedback: "Incorrect. Cancelling the project is an extreme reaction that avoids solving the problem." },
      { text: "Mark the issue as completed because the labels already exist.", isCorrect: false, feedback: "Incorrect. Marking the issue complete when contamination persists ignores effectiveness." }
    ],
    correctExplanation: "Corrective actions must target the identified cause of the gap and verify whether the change resolved it.",
    incorrectExplanation: "Newsletters, project cancellations, or premature completions do not address the placement cause.",
    practicalTakeaway: "The corrective action should address the identified cause and include follow-up."
  },
  {
    question: "Which corrective-action entry provides the clearest accountability in a progress log?",
    options: [
      { text: "Owner: Everyone. Due date: Soon.", isCorrect: false, feedback: "Incorrect. Group ownership and vague due dates lead to zero action." },
      { text: "Owner: Green Team. Due date: When possible.", isCorrect: false, feedback: "Incorrect. This lacks a specific responsible role or a clear deadline." },
      { text: "Owner: Facilities Supervisor. Due date: 14 August. Follow-up check: 21 August.", isCorrect: true, feedback: "Correct. This specifies a single role, a clear due date, and a specific check date." },
      { text: "Owner: Management. Due date: To be discussed.", isCorrect: false, feedback: "Incorrect. This is too vague and lacks commitment details." }
    ],
    correctExplanation: "Accountability requires a single owner role, a specific due date, and a scheduled follow-up check date.",
    incorrectExplanation: "Group owners, vague timelines, or delaying discussion does not provide clear accountability.",
    practicalTakeaway: "Assign a clear owner, deadline, and follow-up point."
  },
  {
    question: "New recycling signs were installed as planned, but contamination remained unchanged after four weeks. What should the team conclude?",
    options: [
      { text: "The action is complete and therefore successful.", isCorrect: false, feedback: "Incorrect. The signs are up, but the action was not effective in reducing contamination." },
      { text: "The contamination issue must be caused by lazy employees.", isCorrect: false, feedback: "Incorrect. Blaming employees does not solve the process issue." },
      { text: "The action was completed, but its effectiveness needs further review and possibly a revised response.", isCorrect: true, feedback: "Correct. If an action is complete but ineffective, the team must review and adjust the corrective action." },
      { text: "The contamination results should be removed from the tracker log.", isCorrect: false, feedback: "Incorrect. Deleting negative data violates reporting integrity." }
    ],
    correctExplanation: "Completion of an action (signs installed) does not prove that it was effective in resolving the gap (contamination).",
    incorrectExplanation: "Claiming success, blaming staff, or deleting logs ignores the fact that the gap remains unresolved.",
    practicalTakeaway: "Completion of an action does not prove that it was effective."
  },
  {
    question: "A department claims that a corrective action solved a recurring water leak, but no repair record or follow-up inspection log is available. What is the best response?",
    options: [
      { text: "Close the action because the department manager verbally confirmed it.", isCorrect: false, feedback: "Incorrect. Verbal confirmations without proof do not meet audit-ready evidence standards." },
      { text: "Record the action as effective and update the tracker to complete.", isCorrect: false, feedback: "Incorrect. Closing trackers without verifying evidence undermines data integrity." },
      { text: "Request the repair work order or a follow-up inspection record before closing the action.", isCorrect: true, feedback: "Correct. Verifiable evidence of repair and follow-up checks is required before closing an action." },
      { text: "Delete the original leak record to keep the system clean.", isCorrect: false, feedback: "Incorrect. Deleting records of historical leaks is bad data practice." }
    ],
    correctExplanation: "Before closing any corrective action, you must verify documented proof of repair and follow-up checks.",
    incorrectExplanation: "Accepting verbal claims, updating trackers without proof, or deleting records violates data integrity.",
    practicalTakeaway: "Confirm completion and effectiveness before closing an action."
  },
  {
    question: "A corrective action has been attempted twice, but the same problem continues and the cause remains uncertain. What is the best next step?",
    options: [
      { text: "Repeat the same action again and wait for better results.", isCorrect: false, feedback: "Incorrect. Repeating failed actions without changes is ineffective." },
      { text: "Mark the action completed on the tracker to keep metrics high.", isCorrect: false, feedback: "Incorrect. Fabricating completion metrics hides unresolved issues." },
      { text: "Escalate the issue to management and investigate the cause further before selecting a new action.", isCorrect: true, feedback: "Correct. Deeper investigation and escalation are needed when repeated attempts fail and causes are uncertain." },
      { text: "Stop recording the issue in the tracker logs.", isCorrect: false, feedback: "Incorrect. Hiding repeated issues violates professional tracking standards." }
    ],
    correctExplanation: "When repeated actions fail and causes are unclear, the issue must be escalated to management for investigation.",
    incorrectExplanation: "Repeating failures, falsifying tracking statistics, or ignoring the issue does not resolve the gap.",
    practicalTakeaway: "Repeated or uncertain problems may require escalation and deeper investigation."
  }
];

export async function ensureSustainabilityPerformanceReviewCourse() {
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

      // 2. Resolve Course 18
      let course18 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-18")
      });
      if (!course18) {
        course18 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "sustainability-data-collection-and-evidence")
        });
      }

      if (!course18) {
        throw new Error("Data integrity error: Course 18 (ELH-18) not found. Prerequisite cannot be established.");
      }

      // 3. Resolve or insert Course 19
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

      // 4. Update Course 18 recommendedNextCourseId to point to Course 19 preserving admin edits
      let isSystemManaged = false;
      if (course18.recommendedNextCourseId) {
        const currentRecommendedCourse = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.id, course18.recommendedNextCourseId)
        });
        if (currentRecommendedCourse && currentRecommendedCourse.courseCode === "ELH-19") {
          isSystemManaged = true;
        }
      }

      if (course18.recommendedNextCourseId === null || course18.recommendedNextCourseId === actualCourseId || isSystemManaged) {
        await tx.update(coursesTable).set({
          recommendedNextCourseId: actualCourseId
        }).where(eq(coursesTable.id, course18.id));
      } else {
        logger.warn(`Recommendation conflict: Course 18 currently recommends course ID ${course18.recommendedNextCourseId} instead of Course 19 (ID: ${actualCourseId}). Preserving administrator edit.`);
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
          icon: "check-circle",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 22,
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
      // Prerequisite 1: Course 18
      const existingPrereq18 = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course18.id)
        )
      });
      if (!existingPrereq18) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course18.id
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
