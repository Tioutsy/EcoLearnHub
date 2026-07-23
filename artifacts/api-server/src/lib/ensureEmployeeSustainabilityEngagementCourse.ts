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

const COURSE_SLUG = "building-employee-engagement-in-sustainability";
const COURSE_TITLE = "Building Employee Engagement in Sustainability";
const BADGE_SLUG = "sustainability-engagement-facilitator";
const BADGE_CODE = "COURSE_ELH_21_COMPLETE";
const SEED_NAME = "employee-sustainability-engagement-v1";

const COURSE_META = {
  courseCode: "ELH-21",
  description: "Help employees and managers build practical participation in workplace sustainability initiatives. Learners explore how to identify barriers, involve colleagues in decisions, respond to resistance and maintain engagement through clear feedback, visible follow-up and realistic routines.",
  fullDescription: "Help employees and managers build practical participation in workplace sustainability initiatives. Learners explore how to identify barriers, involve colleagues in decisions, respond to resistance and maintain engagement through clear feedback, visible follow-up and realistic routines.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/building-employee-engagement-in-sustainability.jpg",
  intendedRoles: ["employees", "supervisors", "managers", "sustainability coordinators", "green-team members"],
  learningObjectives: [
    "explain the difference between informing employees and engaging them;",
    "identify operational, behavioural and organisational barriers to participation;",
    "select appropriate ways to involve employees in workplace sustainability actions;",
    "respond constructively to scepticism and resistance;",
    "use feedback, recognition and progress updates responsibly; and",
    "establish routines that help participation continue over time."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Sustainability Roles, Responsibilities and Accountability. You can now identify clearer action owners, supporting roles, approval responsibilities and escalation routes for workplace sustainability actions.",
  badgeName: "Sustainability Engagement Facilitator",
  badgeDescription: "Awarded for demonstrating practical understanding of how to build and maintain employee participation in workplace sustainability initiatives.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Communication Is Not Engagement",
    minutes: 3,
    content: "Distinguish between passive communication and meaningful employee participation. Understand how consulting employees on operational realities shapes successful actions.",
    blocks: [
      {
        id: "c21-l1-b1",
        type: "heading",
        headingText: "Communication Is Not Engagement"
      },
      {
        id: "c21-l1-b2",
        type: "short_text",
        bodyText: "Sending emails or displaying posters informs employees but does not engage them. True engagement means employees understand expectations, see the connection to their daily work, can raise operational concerns, contribute ideas, have the tools to act, and receive updates on results.\n\nFor example, asking Mauritian hotel housekeeping staff to reduce unnecessary linen replacement without consulting them onゲスト requests or trolley processes often leads to failure. The process must match the workplace reality."
      },
      {
        id: "c21-l1-b3",
        type: "key_message",
        headingText: "Engagement Defined",
        bodyText: "Informing delivers a message. Engagement enables people to shape and participate in the actions."
      },
      {
        id: "c21-l1-b4",
        type: "decision_scenario",
        decisionIntro: "Which activity demonstrates genuine employee engagement rather than just passive communication?",
        decisionPrompt: "Select the engagement activity:",
        decisionChoices: [
          {
            label: "Displaying a recycling guidelines poster in the breakroom.",
            correct: false,
            feedback: "Incorrect. This is passive information delivery (informing)."
          },
          {
            label: "Hosting a toolbox talk with warehouse employees to identify where packaging waste is generated and test a revised sorting table layout.",
            correct: true,
            feedback: "Correct. This involves employees in identifying waste points and testing solutions related directly to their daily work."
          },
          {
            label: "Emailing a new corporate energy-saving target to all supervisors.",
            correct: false,
            feedback: "Incorrect. This is a top-down announcement (informing)."
          },
          {
            label: "Publishing the monthly water consumption report on the office bulletin board.",
            correct: false,
            feedback: "Incorrect. This shares a result but does not invite participation or feedback."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Find the Barrier Before Blaming Behaviour",
    minutes: 3,
    content: "Investigate participation barriers rather than assuming poor motivation. Classify blockers into motivation, capability, or opportunity barriers.",
    blocks: [
      {
        id: "c21-l2-b1",
        type: "heading",
        headingText: "Find the Barrier Before Blaming Behaviour"
      },
      {
        id: "c21-l2-b2",
        type: "short_text",
        bodyText: "When employees fail to follow a process, it is rarely just an attitude problem. Investigate three barrier categories:\n\n1. Motivation barrier: The employee does not see a clear reason to act.\n2. Capability barrier: The employee lacks training or cannot perform the task.\n3. Opportunity barrier: The physical layout or workflow makes the action inconvenient or impossible (e.g. cardboards piled in general waste because collection bins are located outside secure delivery areas, and staff cannot leave the retail floor)."
      },
      {
        id: "c21-l2-b3",
        type: "key_message",
        headingText: "Opportunity Check first",
        bodyText: "Always verify whether the workplace environment and tools actually allow the employee to perform the action before assuming a motivation issue."
      },
      {
        id: "c21-l2-b4",
        type: "decision_scenario",
        decisionIntro: "Office staff are not sorting food waste. The manager finds the compost container is placed on another floor, and staff only have a 15-minute break. What is the primary barrier?",
        decisionPrompt: "Classify the barrier:",
        decisionChoices: [
          {
            label: "A motivation barrier, because employees lack environmental awareness.",
            correct: false,
            feedback: "Incorrect. Staff may care, but the placement makes it impractical."
          },
          {
            label: "An opportunity barrier, because the bin's physical placement and time constraints make the action highly inconvenient.",
            correct: true,
            feedback: "Correct. The physical distance combined with limited break time creates a structural opportunity barrier."
          },
          {
            label: "A capability barrier, because staff do not know what compost is.",
            correct: false,
            feedback: "Incorrect. There is no evidence they lack understanding of composting basics."
          },
          {
            label: "An administrative barrier, because there is no poster near the desk.",
            correct: false,
            feedback: "Incorrect. More posters will not solve the physical distance blocker."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Involve the People Who Perform the Work",
    minutes: 3,
    content: "Gather operational insights from team members who perform the tasks. Learn simple consultation methods and how to close the feedback loop.",
    blocks: [
      {
        id: "c21-l3-b1",
        type: "heading",
        headingText: "Involve the People Who Perform the Work"
      },
      {
        id: "c21-l3-b2",
        type: "short_text",
        bodyText: "Frontline employees understand where delays, safety risks, and waste occur. Involving them improves task practicality. Use simple formats: short shift huddles, process walk-throughs, suggestion channels, or small pilots.\n\nConsultation does not mean consensus. When suggestions are gathered, managers must communicate what was proposed, what was accepted, what was rejected and why, and what happens next."
      },
      {
        id: "c21-l3-b3",
        type: "key_message",
        headingText: "Close the Loop",
        bodyText: "Failing to explain why suggestions were rejected kills future engagement. Always explain decisions constructively."
      },
      {
        id: "c21-l3-b4",
        type: "decision_scenario",
        decisionIntro: "A manufacturing plant wants to reduce compressed-air waste during shutdowns. How should the operations coordinator involve staff before setting the new policy?",
        decisionPrompt: "Select the most constructive involvement method:",
        decisionChoices: [
          {
            label: "Publish the new shutdown schedule on the company portal.",
            correct: false,
            feedback: "Incorrect. This is informing, not involvement."
          },
          {
            label: "Run a one-week pilot shutdown process with a single shift, ask the technicians to record any operational delays, and adjust the checklist based on their feedback.",
            correct: true,
            feedback: "Correct. A pilot allows the actual process operators to test and refine the workflow under real conditions."
          },
          {
            label: "Install automated shutdown valves without informing the staff.",
            correct: false,
            feedback: "Incorrect. Bypassing operators without briefing leads to confusion and safety risks."
          },
          {
            label: "Create a green team competition to see who can shut down equipment fastest.",
            correct: false,
            feedback: "Incorrect. This prioritizes speed over safety and process validation."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Respond Constructively to Resistance",
    minutes: 3,
    content: "Differentiate operational concerns from refusal. Learn the five-step model to clarify concerns, identify constraints, and agree next steps.",
    blocks: [
      {
        id: "c21-l4-b1",
        type: "heading",
        headingText: "Respond Constructively to Resistance"
      },
      {
        id: "c21-l4-b2",
        type: "short_text",
        bodyText: "Skepticism and resistance are often expressions of practical concern (e.g. fear of increased workload, conflicting targets, or past failed programs). Do not dismiss it as negativity.\n\nFollow a 5-step response: (1) listen without defending; (2) clarify the specific concern; (3) separate facts from assumptions; (4) explain what can and cannot change; and (5) agree on the next practical trial step."
      },
      {
        id: "c21-l4-b3",
        type: "key_message",
        headingText: "Workload Checks",
        bodyText: "If kitchen employees object to waste weighing because it delays busy food service, look for a simpler recording method rather than dismissing their objection."
      },
      {
        id: "c21-l4-b4",
        type: "decision_scenario",
        decisionIntro: "An employee says: 'Sorting waste takes too much time during our busiest shift.' Which response represents the most constructive approach?",
        decisionPrompt: "Select the constructive response:",
        decisionChoices: [
          {
            label: "Tell the employee that caring about the environment requires effort.",
            correct: false,
            feedback: "Incorrect. This shames the employee and ignores the operational concern."
          },
          {
            label: "Ask the employee to show you the sorting station during the shift, identify where the bottleneck occurs, and test a different bin layout for one week.",
            correct: true,
            feedback: "Correct. This investigates the physical bottleneck, respects the employee's time constraint, and proposes a practical test."
          },
          {
            label: "Remind them that waste sorting is a mandatory company policy.",
            correct: false,
            feedback: "Incorrect. Invoking authority does not resolve the operational bottleneck."
          },
          {
            label: "Exempt the busy shift from the recycling program.",
            correct: false,
            feedback: "Incorrect. This abandons the goal instead of fixing the process bottleneck."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Feedback and Recognition That Build Trust",
    minutes: 3,
    content: "Learn the components of effective feedback and credible recognition. Avoid shaming, public rankings, and unverified data claims.",
    blocks: [
      {
        id: "c21-l5-b1",
        type: "heading",
        headingText: "Feedback and Recognition That Build Trust"
      },
      {
        id: "c21-l5-b2",
        type: "short_text",
        bodyText: "Effective feedback answers: What action occurred? What was the result? What still needs fixing? And what happens next? Acknowledge specific contributions (e.g. thank the mechanic who found a leak, or the team that tested composting bins).\n\nAvoid: public shaming, ranking employees collectively, rewarding unverified personal claims, or exaggerating carbon reduction statistics. Trust is built on realistic, fair recognition."
      },
      {
        id: "c21-l5-b3",
        type: "key_message",
        headingText: "Recognition Rules",
        bodyText: "Focus recognition on specific team and operational efforts, keeping them realistic and evidence-based."
      },
      {
        id: "c21-l5-b4",
        type: "decision_scenario",
        decisionIntro: "A company wants to recognize departments for a successful energy reduction pilot. Which message is most appropriate?",
        decisionPrompt: "Select the appropriate recognition:",
        decisionChoices: [
          {
            label: "Publish a leaderboard showing which employees are 'eco-champions' and which are lagging.",
            correct: false,
            feedback: "Incorrect. Public ranking and shaming damage collaboration and trust."
          },
          {
            label: "We want to thank the maintenance team for adjusting the shutdown timers, and the office staff for testing the end-of-shift checklist, which helped reduce after-hours consumption by 15% in July.",
            correct: true,
            feedback: "Correct. This is specific, describes what each team contributed, reports a clear result (15% reduction), and lists verifiable evidence."
          },
          {
            label: "Declare that the company has saved the planet thanks to its green initiatives.",
            correct: false,
            feedback: "Incorrect. This is exaggerated and lacks credible, specific details."
          },
          {
            label: "Give a cash prize to the employee who claims to turn off the most switches.",
            correct: false,
            feedback: "Incorrect. Rewarding unverified individual claims encourages unreliable reporting."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Make Engagement Part of the Routine",
    minutes: 3,
    content: "Transition from short-term campaigns to long-term operational routines. Establish simple onboarding and check-in schedules.",
    blocks: [
      {
        id: "c21-l6-b1",
        type: "heading",
        headingText: "Make Engagement Part of the Routine"
      },
      {
        id: "c21-l6-b2",
        type: "short_text",
        bodyText: "Campaigns attract short-term attention, but routines maintain participation. Build routines by integrating check-ins into existing meetings, establishing clear handover rules, and reviewing barriers periodically.\n\nEnsure that when initiatives are closed or suspended, the team is formally debriefed rather than letting tasks fade away silently."
      },
      {
        id: "c21-l6-b3",
        type: "key_message",
        headingText: "Routine Integration",
        bodyText: "Do not create new separate meetings. Add brief sustainability check-ins to existing operational team meetings."
      },
      {
        id: "c21-l6-b4",
        type: "commitment_scenario",
        commitmentPrompt: "Select one practical step to improve sustainability engagement in your area:",
        commitmentChoices: [
          "Ask a colleague about a practical barrier",
          "Include sustainability in an existing team discussion",
          "Provide feedback on a previous suggestion",
          "Invite employees to test a process change",
          "Establish a simple channel for reporting operational concerns"
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "A company circulates a new sustainability policy by email and puts up posters, but employee participation remains low. What is the most likely reason?",
    options: [
      { text: "Employees do not care about workplace goals.", isCorrect: false, feedback: "Incorrect. Motivation should not be blamed before reviewing the engagement process." },
      { text: "The policy lacks sufficient graphics and slogans.", isCorrect: false, feedback: "Incorrect. Visuals support but do not create active engagement." },
      { text: "The company used passive communication instead of enabling active participation and addressing barriers.", isCorrect: true, feedback: "Correct. Sending information (informing) does not ensure employees understand how it fits their workflow or can raise practical blockers." },
      { text: "The email should have been sent by the CEO directly.", isCorrect: false, feedback: "Incorrect. The sender does not resolve the lack of interactive engagement." }
    ],
    correctExplanation: "Communication delivers a policy, but engagement requires enabling two-way feedback, clarifying tasks, and resolving operational barriers.",
    incorrectExplanation: "Blaming attitude, graphic choices, or email senders ignores the core difference between passive informing and active engagement.",
    practicalTakeaway: "Informing employees is not the same as engaging them."
  },
  {
    question: "Employees repeatedly place cardboard in general waste. The manager finds the recycling bin is kept locked in an outdoor yard, and employees are not allowed to leave the retail floor during busy shifts. What should the manager conclude?",
    options: [
      { text: "Employees require another mandatory training talk on waste sorting.", isCorrect: false, feedback: "Incorrect. Training will not unlock the yard or free up staff time." },
      { text: "The primary blocker is an opportunity barrier caused by inaccessible bins and shift constraints.", isCorrect: true, feedback: "Correct. The physical placement and retail floor staffing constraints prevent employees from performing the action." },
      { text: "The general waste bins should be removed to force sorting.", isCorrect: false, feedback: "Incorrect. This causes operational chaos without resolving the recycling barrier." },
      { text: "The store needs a competitive waste leaderboard.", isCorrect: false, feedback: "Incorrect. Leaderboards do not resolve physical access issues." }
    ],
    correctExplanation: "Before blaming employee motivation, you must investigate opportunity barriers, such as physical placement, equipment availability, or time constraints.",
    incorrectExplanation: "More training, removing general bins, or adding leaderboards does not resolve physical access blockers.",
    practicalTakeaway: "Investigate structural barriers before assuming a motivational problem."
  },
  {
    question: "A facilities team wants to implement a new office shutdown checklist. What is the most effective way to involve employees?",
    options: [
      { text: "Publish the checklist on the portal and request compliance by next Monday.", isCorrect: false, feedback: "Incorrect. This lacks direct employee testing or feedback." },
      { text: "Organize a department-wide competition with points for the fastest shutdown.", isCorrect: false, feedback: "Incorrect. Competition can compromise safety and process accuracy." },
      { text: "Test the checklist with a small pilot group of staff, collect their feedback on process bottlenecks, and refine the checklist before full rollout.", isCorrect: true, feedback: "Correct. Piloting with the actual users identifies process errors and builds trust." },
      { text: "Delegate the checklist entirely to the junior intern to save staff time.", isCorrect: false, feedback: "Incorrect. This avoids engaging the actual department staff." }
    ],
    correctExplanation: "A small pilot group allows the people who perform the work to test the procedure, identify practical bottlenecks, and refine the process.",
    incorrectExplanation: "Top-down rollouts, competitions, or outsourcing to interns do not enable meaningful process feedback.",
    practicalTakeaway: "Use pilot groups and user feedback to make procedures realistic."
  },
  {
    question: "An employee objects to a new waste-tracking process, saying: 'We are already short-staffed, and weighing every bag will delay customer checkout.' How should the supervisor respond?",
    options: [
      { text: "Explain that environmental compliance is mandatory for all team members.", isCorrect: false, feedback: "Incorrect. This dismisses the operational concern." },
      { text: "Acknowledge the shift workload concern, review the weighing process on the floor, and test a simplified batch-weighing method during the shift.", isCorrect: true, feedback: "Correct. This constructive response investigates the blocker and trials an operational adjustment." },
      { text: "Ask other employees to cover the sorting tasks to avoid arguments.", isCorrect: false, feedback: "Incorrect. This creates division and avoids fixing the process bottleneck." },
      { text: "Exempt this department from the recycling goals entirely.", isCorrect: false, feedback: "Incorrect. Jumps to cancellation instead of process optimization." }
    ],
    correctExplanation: "Resistance is often a sign of practical operational bottlenecks. Supervisors should investigate, validate, and test simplified adjustments.",
    incorrectExplanation: "Invoking policy, creating team friction, or cancelling objectives ignores the constructive feedback loop.",
    practicalTakeaway: "Explore operational concerns constructively rather than dismissing them as negativity."
  },
  {
    question: "Employees submitted several suggestions for energy-saving improvements, but none have been implemented, and no updates have been shared. What is the best next step?",
    options: [
      { text: "Wait until the suggestions are fully resolved before communicating.", isCorrect: false, feedback: "Incorrect. Long silence leads employees to assume their feedback was ignored." },
      { text: "Close the suggestion box to prevent additional backlog.", isCorrect: false, feedback: "Incorrect. This shuts down employee engagement completely." },
      { text: "Provide a quick update listing which suggestions were accepted, which are under technical review, and explaining why others were not feasible.", isCorrect: true, feedback: "Correct. Closing the feedback loop build trust by explaining the reasons behind decisions." },
      { text: "Implement all suggestions immediately to show support.", isCorrect: false, feedback: "Incorrect. Some suggestions may be unfeasible or unsafe." }
    ],
    correctExplanation: "To maintain trust, companies must close the loop by communicating decisions, explaining constraints, and listing next steps.",
    incorrectExplanation: "Silences, closing suggestion channels, or implementing unfeasible ideas damages operational credibility.",
    practicalTakeaway: "Close the loop by sharing what was accepted, rejected, and why."
  },
  {
    question: "A warehouse maintenance technician identifies and repairs a major air-line leak that was wasting significant energy. What is the most appropriate recognition?",
    options: [
      { text: "Award them the 'Planet Savior' trophy in front of the entire company.", isCorrect: false, feedback: "Incorrect. Exaggerated titles feel insincere and patronizing." },
      { text: "Post a notice thanking the technician for their specific diagnostic work and repair, which saved a documented 12% in compressor energy use in August.", isCorrect: true, feedback: "Correct. This recognition is specific, credible, and links the action to a verified operational result." },
      { text: "Give the department manager a bonus for leading the energy reduction program.", isCorrect: false, feedback: "Incorrect. Acknowledging only managers for frontline work kills employee engagement." },
      { text: "Avoid recognizing the action to prevent other staff from feeling excluded.", isCorrect: false, feedback: "Incorrect. Specific contributions should be highlighted to encourage similar actions." }
    ],
    correctExplanation: "Appropriate recognition is specific, evidence-based, focuses on the operational contributor, and describes the actual result without exaggeration.",
    incorrectExplanation: "Exaggeration, rewarding only managers, or ignoring contributions entirely undermines engagement credibility.",
    practicalTakeaway: "Recognition should be specific, credible, and linked to evidence."
  },
  {
    question: "A company runs a successful month-long paper-saving campaign, but participation drops immediately after the campaign ends. What is the best corrective action?",
    options: [
      { text: "Launch another campaign with new posters and slogans.", isCorrect: false, feedback: "Incorrect. Repeated campaigns without structural change lead to fatigue." },
      { text: "Integrate brief paper-usage reviews into existing weekly department meetings and assign a specific role to monitor defaults.", isCorrect: true, feedback: "Correct. Moving from a campaign to an operating routine maintains engagement over time." },
      { text: "Reprimand employees who continue to print unnecessarily.", isCorrect: false, feedback: "Incorrect. Shaming does not address the lack of process routines." },
      { text: "Remove all printer terminals from the office.", isCorrect: false, feedback: "Incorrect. Extreme reactions disrupt normal business operations." }
    ],
    correctExplanation: "Long-term engagement is maintained by integrating review check-ins into existing meetings and assigning clear role ownership.",
    incorrectExplanation: "Slogan fatigue, reprimands, or extreme equipment removals do not create reliable routines.",
    practicalTakeaway: "Transition campaigns into regular operating routines to maintain progress."
  },
  {
    question: "A department manager proposes introducing a leaderboard that ranks individual employees publicly based on their self-reported green actions. What is the main problem?",
    options: [
      { text: "Leaderboards are too difficult to configure in Excel.", isCorrect: false, feedback: "Incorrect. The tool is not the main issue." },
      { text: "It encourages competitive self-reporting of unverified claims and relies on public shaming, which damages trust.", isCorrect: true, feedback: "Correct. Public rankings based on unverified personal behavior invite data exaggeration and create a culture of blame." },
      { text: "Employees prefer individual rewards over team rankings.", isCorrect: false, feedback: "Incorrect. Rewarding individual claims still leads to unverified reporting problems." },
      { text: "The ranking list should be updated daily rather than weekly.", isCorrect: false, feedback: "Incorrect. Higher frequency will only accelerate reporting exaggeration." }
    ],
    correctExplanation: "Active engagement must remain professional and voluntary. Public rankings of personal behavior encourage exaggeration and create friction.",
    incorrectExplanation: "Configuration limits, individual preferences, or list update frequency does not address the ethical and data reliability issues.",
    practicalTakeaway: "Avoid public rankings and self-reported contests that encourage data exaggeration."
  }
];

export async function ensureEmployeeSustainabilityEngagementCourse() {
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

      // 2. Resolve Course 20
      let course20 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-20")
      });
      if (!course20) {
        course20 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "sustainability-roles-responsibilities-and-accountability")
        });
      }

      if (!course20) {
        throw new Error("Data integrity error: Course 20 (ELH-20) not found. Prerequisite cannot be established.");
      }

      // 3. Resolve or insert Course 21
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

      // 4. Update Course 20 recommendedNextCourseId to point to Course 21 preserving admin edits
      let isSystemManaged = false;
      if (course20.recommendedNextCourseId) {
        const currentRecommendedCourse = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.id, course20.recommendedNextCourseId)
        });
        if (currentRecommendedCourse && currentRecommendedCourse.courseCode === "ELH-21") {
          isSystemManaged = true;
        }
      }

      if (course20.recommendedNextCourseId === null || course20.recommendedNextCourseId === actualCourseId || isSystemManaged) {
        await tx.update(coursesTable).set({
          recommendedNextCourseId: actualCourseId
        }).where(eq(coursesTable.id, course20.id));
      } else {
        logger.warn(`Recommendation conflict: Course 20 currently recommends course ID ${course20.recommendedNextCourseId} instead of Course 21 (ID: ${actualCourseId}). Preserving administrator edit.`);
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
          icon: "heart",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 24,
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
      // Prerequisite 1: Course 20
      const existingPrereq20 = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course20.id)
        )
      });
      if (!existingPrereq20) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course20.id
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
