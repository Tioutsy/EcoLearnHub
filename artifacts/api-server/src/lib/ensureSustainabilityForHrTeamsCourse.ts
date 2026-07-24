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

const COURSE_SLUG = "sustainability-for-hr-teams";
const COURSE_TITLE = "Sustainability for HR Teams";
const BADGE_SLUG = "sustainability-aware-hr";
const BADGE_CODE = "COURSE_ELH_24_COMPLETE";
const SEED_NAME = "sustainability-for-hr-teams-v1";

const COURSE_META = {
  courseCode: "ELH-24",
  description: "A practical course for HR professionals and people managers on integrating sustainability into onboarding, learning, employee communication, participation and training records.",
  fullDescription: "A practical course for HR professionals and people managers on integrating sustainability into onboarding, learning, employee communication, participation and training records.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainability-for-hr-teams.jpg",
  intendedRoles: ["employees", "supervisors", "managers", "sustainability coordinators", "green-team members", "HR professionals", "people managers"],
  learningObjectives: [
    "Explain the HR team's role in supporting workplace sustainability.",
    "Include relevant sustainability expectations in onboarding and employee learning.",
    "Distinguish between HR responsibilities and matters owned by operations, facilities, procurement, ESG or management.",
    "encourage participation without using guilt, pressure or unsupported environmental claims.",
    "Maintain accurate and useful training records.",
    "Select an appropriate HR response to common workplace sustainability situations."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Sustainability for HR Teams. You can now support credibility in workplace sustainability through clear employee expectations, role-relevant learning paths, fair participation methods, and reliable training records.",
  badgeName: "Sustainability-Aware HR",
  badgeDescription: "Awarded for demonstrating practical understanding of how to integrate sustainability into onboarding, learning, employee communication, participation and training records.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "HR Supports Sustainability but Does Not Own Everything",
    minutes: 3,
    content: "Understand the boundaries of HR's role. Support coordination, onboarding, role expectations, and records without taking technical or operational safety ownership.",
    blocks: [
      {
        id: "c24-l1-b1",
        type: "heading",
        headingText: "HR Supports Sustainability but Does Not Own Everything"
      },
      {
        id: "c24-l1-b2",
        type: "short_text",
        bodyText: "HR supports workplace sustainability by coordinating learning, defining role expectations, managing communication, and tracking training records. HR should NOT take technical responsibility for environmental controls, certify legal compliance, or approve facilities expenditures. Operations, compliance, or engineering owners must retain ownership of technical safety and operational matters."
      },
      {
        id: "c24-l1-b3",
        type: "key_message",
        headingText: "Boundary of Responsibility",
        bodyText: "When technical hazards or environmental problems arise, HR's role is to ensure the concern is logged and escalated to the correct operational owner immediately."
      },
      {
        id: "c24-l1-b4",
        type: "decision_scenario",
        decisionIntro: "An employee reports to HR that chemical cleaning containers are stored incorrectly in the housekeeping area, causing fumes. What is the correct HR response?",
        decisionPrompt: "Select the most appropriate action:",
        decisionChoices: [
          {
            label: "Go to the storage area immediately and attempt to reorganize the chemicals yourself.",
            correct: false,
            feedback: "Incorrect. Reorganizing chemicals without safety competence or authorization exposes you to health risks and bypasses operational owners."
          },
          {
            label: "Acknowledge the employee's concern, record the report details, and escalate it immediately to the responsible operational manager and safety compliance officer.",
            correct: true,
            feedback: "Correct. HR ensures concerns are documented and escalated to the correct competent owner rather than taking on technical repairs."
          },
          {
            label: "Ignore the report since safety is an operational matter, not an HR task.",
            correct: false,
            feedback: "Incorrect. HR should never ignore safety hazards; escalation is critical."
          },
          {
            label: "Create a flyer reminding housekeeping staff to be tidy.",
            correct: false,
            feedback: "Incorrect. Flyers do not resolve chemical safety hazards or alert the responsible owner."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Put Sustainability Into Onboarding",
    minutes: 3,
    content: "Introduce sustainability behavior guidelines and tap leak reporting contacts to new hires during onboarding, avoiding generic slogans.",
    blocks: [
      {
        id: "c24-l2-b1",
        type: "heading",
        headingText: "Put Sustainability Into Onboarding"
      },
      {
        id: "c24-l2-b2",
        type: "short_text",
        bodyText: "Onboarding should provide concrete, role-relevant behaviors and reporting procedures. Avoid overwhelming new hires with broad, unexplainable slogans or generic environmental promises that do not relate to their day-to-day work.\n\nIn Mauritian hotels, this means showing new hires the hotel's specific waste streams, how to report a leaking water tap, when guest comfort takes priority over conservation, and which training courses are required."
      },
      {
        id: "c24-l2-b3",
        type: "key_message",
        headingText: "Actionable Onboarding",
        bodyText: "Onboarding is successful when a new employee knows exactly who to contact for faults and which behaviors are expected in their department."
      },
      {
        id: "c24-l2-b4",
        type: "decision_scenario",
        decisionIntro: "An HR coordinator is designing the sustainability segment for new-hire orientation. Which approach is most effective?",
        decisionPrompt: "Select the onboarding approach:",
        decisionChoices: [
          {
            label: "Distribute a 100-page environmental policy manual and ask them to sign an agreement.",
            correct: false,
            feedback: "Incorrect. Distributing policies without context does not help employees understand daily expectations."
          },
          {
            label: "Present specific waste sorting bins on the floor, explain the procedure for reporting a leaking tap, and share the contact number for the maintenance log.",
            correct: true,
            feedback: "Correct. This provides immediate, practical behavior guidelines and clear reporting routes."
          },
          {
            label: "Give a presentation declaring that the company is '100% green' and carbon-neutral.",
            correct: false,
            feedback: "Incorrect. Exaggerated claims do not provide role-relevant behavior guidelines."
          },
          {
            label: "Tell them to figure out sorting procedures from their department colleagues.",
            correct: false,
            feedback: "Incorrect. Onboarding should actively establish behavior standards."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Assign Learning That Matches the Role",
    minutes: 3,
    content: "Design relevant, role-based learning pathways instead of assigning the entire catalog to everyone. Recognize that learning does not certify compliance.",
    blocks: [
      {
        id: "c24-l3-b1",
        type: "heading",
        headingText: "Assign Learning That Matches the Role"
      },
      {
        id: "c24-l3-b2",
        type: "short_text",
        bodyText: "Avoid assigning every specialist module to all employees. Match learning to roles, decision authority, and risks. Foundations are for everyone, advanced purchasing is for procurement, energy/water metrics are for facilities, and corrective action modules are for managers. Note: course completion is training evidence, not legal compliance or professional certification."
      },
      {
        id: "c24-l3-b3",
        type: "key_message",
        headingText: "Role-Based Paths",
        bodyText: "Targeted training reduces employee screen fatigue and improves operational relevance."
      },
      {
        id: "c24-l3-b4",
        type: "decision_scenario",
        decisionIntro: "An HR administrator wants to assign all 24 courses to every employee in the logistics department to maximize training hours.",
        decisionPrompt: "Why should they reconsider this approach?",
        decisionChoices: [
          {
            label: "Because employees prefer to complete quizzes without reading the lessons.",
            correct: false,
            feedback: "Incorrect. The main issue is training relevance, not quiz behaviors."
          },
          {
            label: "Because role-based pathways are more credible, prevent training fatigue, and ensure employees study modules directly relevant to their work processes.",
            correct: true,
            feedback: "Correct. Customizing paths to departments ensures operational relevance and respects employees' time constraints."
          },
          {
            label: "Because courses are too expensive to assign broadly.",
            correct: false,
            feedback: "Incorrect. The pricing is free ($0.00) in this system, so cost is not the blocker."
          },
          {
            label: "Because only managers should study sustainability.",
            correct: false,
            feedback: "Incorrect. Foundations apply to all staff; only specialist modules should be restricted."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Encourage Participation Without Pressure",
    minutes: 3,
    content: "Encourage voluntary participation. Avoid public shaming, leaderboard rankings, and blaming employees for structural/equipment blockers.",
    blocks: [
      {
        id: "c24-l4-b1",
        type: "heading",
        headingText: "Encourage Participation Without Pressure"
      },
      {
        id: "c24-l4-b2",
        type: "short_text",
        bodyText: "Encourage participation by explaining benefits, removing practical blockers, and offering professional feedback. Never use public shaming, leaderboard rankings of personal choices, or pressure. Low participation in a department is often caused by structural barriers (lack of tools, time constraints, unclear steps) rather than bad employee attitudes."
      },
      {
        id: "c24-l4-b3",
        type: "key_message",
        headingText: "No Public Shaming",
        bodyText: "Avoid public leaderboards that rank employees on self-reported green choices. This encourages false reporting and damages trust."
      },
      {
        id: "c24-l4-b4",
        type: "decision_scenario",
        decisionIntro: "A department has low completion rates for a new recycling initiative. The supervisor asks HR to publish a list of employees who have not participated to encourage compliance.",
        decisionPrompt: "What should HR do?",
        decisionChoices: [
          {
            label: "Publish the list on the department bulletin board immediately.",
            correct: false,
            feedback: "Incorrect. Public shaming damages employee trust and does not resolve process barriers."
          },
          {
            label: "Reject the public list, and instead coordinate with the supervisor to inspect the recycling area for physical barriers or scheduling constraints.",
            correct: true,
            feedback: "Correct. HR should reject public shaming and focus on identifying capability or opportunity barriers."
          },
          {
            label: "Award a cash prize to the employee with the most recycling actions.",
            correct: false,
            feedback: "Incorrect. Financial rewards for self-reported behavior encourage data exaggeration."
          },
          {
            label: "Fine the employees who do not participate.",
            correct: false,
            feedback: "Incorrect. Compulsory penalties damage collaboration and ignore process blockers."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Keep Reliable Training Records",
    minutes: 3,
    content: "Maintain training records. Protect record integrity by refusing to mark incomplete learning as complete for audits or client inspections.",
    blocks: [
      {
        id: "c24-l5-b1",
        type: "heading",
        headingText: "Keep Reliable Training Records"
      },
      {
        id: "c24-l5-b2",
        type: "short_text",
        bodyText: "Training records must be accurate. Record employee ID, course code, title, enrollment date, completion status, completion date, and score. Never falsify records or mark incomplete modules as complete to satisfy audits or client inspections. A small, accurate record is far more credible than a perfect, falsified report."
      },
      {
        id: "c24-l5-b3",
        type: "key_message",
        headingText: "Record Integrity",
        bodyText: "Auditors verify records against actual system activity. Documenting separate briefing sessions as independent records preserves system integrity."
      },
      {
        id: "c24-l5-b4",
        type: "decision_scenario",
        decisionIntro: "Before a client audit, a manager asks HR to mark five employees as 'Complete' for a required course because they attended a brief 5-minute toolbox talk, although they did not complete the module online.",
        decisionPrompt: "What is the correct HR action?",
        decisionChoices: [
          {
            label: "Mark the courses as complete to help the department pass the audit.",
            correct: false,
            feedback: "Incorrect. Falsifying system data destroys record integrity and exposes the company to audit failures."
          },
          {
            label: "Refuse to modify the course status, preserve the accurate system progress, and document the 5-minute briefing separately as a local orientation record.",
            correct: true,
            feedback: "Correct. HR must protect record integrity and document other training methods separately without falsifying system database records."
          },
          {
            label: "Delete the employees' course enrollments entirely to remove them from the audit scope.",
            correct: false,
            feedback: "Incorrect. Deleting enrollments to bypass audits is evasive and easily flagged by auditors."
          },
          {
            label: "Ask the employees to complete the quiz for each other.",
            correct: false,
            feedback: "Incorrect. Proxy completions violate code of conduct guidelines."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Coordinate, Escalate and Improve",
    minutes: 3,
    content: "Verify records, resolve scheduling conflicts, refer technical issues to maintenance, and report completion statistics honestly.",
    blocks: [
      {
        id: "c24-l6-b1",
        type: "heading",
        headingText: "Coordinate, Escalate and Improve"
      },
      {
        id: "c24-l6-b2",
        type: "short_text",
        bodyText: "Bring HR processes together: verify records, coordinate training schedules around production demands, refer technical environmental leaks to facilities, and report exact completion percentages to management. HR coordinates the support framework while operations manages technical execution."
      },
      {
        id: "c24-l6-b3",
        type: "key_message",
        headingText: "Process Continuity",
        bodyText: "By linking learning pathways, record integrity, and safe operational referrals, HR builds a reliable foundation for workplace sustainability."
      },
      {
        id: "c24-l6-b4",
        type: "commitment_scenario",
        commitmentPrompt: "Select one practical HR action to improve sustainability in your organization:",
        commitmentChoices: [
          "Improve sustainability onboarding",
          "Review whether assigned learning matches employee roles",
          "Check how incomplete training is followed up",
          "Clarify the route for employee concerns",
          "Improve the accuracy of training records"
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "An employee reports to HR that chemical cleaning containers are being stored incorrectly in the housekeeping area. What is the correct HR action?",
    options: [
      { text: "Go to the chemical storage area and attempt to reorganize the containers.", isCorrect: false, feedback: "Incorrect. Reorganizing chemicals requires specific safety training and operational authority." },
      { text: "Acknowledge the report, log the details, and escalate it immediately to the operational manager and safety officer.", isCorrect: true, feedback: "Correct. HR supports reporting and escalation but does not take technical ownership of operational safety issues." },
      { text: "File the report and ignore it since safety is an operational task.", isCorrect: false, feedback: "Incorrect. Safety reports should never be ignored; prompt escalation is required." },
      { text: "Tell the employee to clean up the area themselves.", isCorrect: false, feedback: "Incorrect. Housekeeping hazards must be escalated to the supervisor or safety officer." }
    ],
    correctExplanation: "HR is responsible for ensuring concerns are recorded and escalated to the correct competent owner rather than taking on technical corrections.",
    incorrectExplanation: "Bypassing safety managers, ignoring hazards, or directing unauthorized staff to handle chemicals violates safety protocol.",
    practicalTakeaway: "HR supports reporting and escalation but does not take technical ownership of operational safety issues."
  },
  {
    question: "A new hire at a Mauritian hotel is undergoing orientation. What is the most effective sustainability onboarding approach?",
    options: [
      { text: "Provide a slogan declaring that the hotel is 'fully eco-friendly'.", isCorrect: false, feedback: "Incorrect. General slogans do not guide day-to-day employee behavior." },
      { text: "Show the specific waste streams for their role, explain how to report a leaking tap, and share the maintenance log contact.", isCorrect: true, feedback: "Correct. Effective onboarding provides concrete, department-relevant behavior instructions and reporting paths." },
      { text: "Require them to read the national environmental laws during their first shift.", isCorrect: false, feedback: "Incorrect. Reading legal text does not explain daily workplace routines." },
      { text: "Tell the new hire that they must follow a national bin-colour scheme.", isCorrect: false, feedback: "Incorrect. Bin systems vary by workplace, and orientation should focus on local site instructions." }
    ],
    correctExplanation: "Useful onboarding defines job-relevant expectations, site procedures, and reporting contacts rather than generic slogans or national policy text.",
    incorrectExplanation: "Broad assertions, legal manuals, or generalized claims do not explain the actual workplace layout or contacts.",
    practicalTakeaway: "Onboarding should define specific, role-relevant behaviors and reporting paths."
  },
  {
    question: "An HR team is setting up sustainability learning pathways. How should they assign courses to different departments?",
    options: [
      { text: "Assign the entire 24-course catalog to all employees to maximize training records.", isCorrect: false, feedback: "Incorrect. This leads to training fatigue and irrelevant learning hours." },
      { text: "Assign foundational courses to all staff, and restrict specialized modules to relevant roles (e.g., procurement, facilities).", isCorrect: true, feedback: "Correct. Matching courses to department scope and decision authority ensures learning relevance." },
      { text: "Only assign training to facilities and maintenance teams.", isCorrect: false, feedback: "Incorrect. All employees need foundational training to follow basic waste and energy procedures." },
      { text: "Allow employees to skip all training to save time.", isCorrect: false, feedback: "Incorrect. Basic environmental compliance and waste sorting instructions apply to everyone." }
    ],
    correctExplanation: "Training paths are most effective when they match employee roles, department scopes, and decision authority rather than assigning every course to everyone.",
    incorrectExplanation: "Overloading employees with irrelevant courses, restricting training only to maintenance, or skipping basics entirely reduces training credibility.",
    practicalTakeaway: "Match learning pathways to employee roles, department scopes, and decision authority."
  },
  {
    question: "A department has low completion rates for a paper-reduction project. How should the HR manager address this issue?",
    options: [
      { text: "Publish a list of non-compliant employees on the office intranet.", isCorrect: false, feedback: "Incorrect. Public shaming damages collaboration and ignores operational barriers." },
      { text: "Investigate whether employees face capability or opportunity blockers (e.g., lack of digital tools or unclear steps).", isCorrect: true, feedback: "Correct. Low participation is often caused by process bottlenecks rather than employee motivation." },
      { text: "Fines or penalties should be automatically applied to the department.", isCorrect: false, feedback: "Incorrect. Penalties do not resolve process blockers or clarify tasks." },
      { text: "Close the paper-reduction initiative.", isCorrect: false, feedback: "Incorrect. The initiative is valid; only the process barriers need resolution." }
    ],
    correctExplanation: "Always investigate capability, equipment availability, or time constraints (opportunity barriers) before assuming poor employee motivation.",
    incorrectExplanation: "Public pressure, penalties, or immediate project cancellations ignore the need to audit process bottlenecks.",
    practicalTakeaway: "Audit process blockers before blaming employee motivation."
  },
  {
    question: "A marketing manager asks HR to add the claim 'our company is fully sustainable' to recruitment brochures because employees completed EcoLearnHub courses. What is the correct response?",
    options: [
      { text: "Approve the text to attract more job applicants.", isCorrect: false, feedback: "Incorrect. Falsifying green credentials violates professional recruitment ethics." },
      { text: "Reject the unsupported claim and recommend using precise, evidence-based descriptions of employee training completion.", isCorrect: true, feedback: "Correct. HR materials must be credible and evidence-based, avoiding exaggerated green claims." },
      { text: "Add a statement that course completion guarantees carbon-neutral operations.", isCorrect: false, feedback: "Incorrect. Completion does not verify carbon neutrality." },
      { text: "Exempt recruitment materials from review.", isCorrect: false, feedback: "Incorrect. HR materials should be reviewed for credibility and accuracy." }
    ],
    correctExplanation: "HR should reject exaggerated environmental claims and focus on precise, evidence-based statements regarding employee training completion.",
    incorrectExplanation: "Approving exaggerations, making unverified carbon claims, or skipping review processes compromises professional credibility.",
    practicalTakeaway: "Ensure HR recruitment materials use credible, evidence-based statements."
  },
  {
    question: "A manager asks HR to mark several staff members as 'Complete' for a required course before a client audit, although they have not finished the online quiz. How should HR respond?",
    options: [
      { text: "Mark the course complete to avoid department audit failures.", isCorrect: false, feedback: "Incorrect. Falsifying training records is unethical and can fail verification audits." },
      { text: "Refuse to alter the database records, preserve the actual progress, and coordinate a catch-up session for the employees.", isCorrect: true, feedback: "Correct. Training records must be accurate and verified. Falsification destroys database integrity." },
      { text: "Delete the incomplete enrollments entirely.", isCorrect: false, feedback: "Incorrect. Deleting enrollments does not document the training status." },
      { text: "Exempt this department from the client audit scope.", isCorrect: false, feedback: "Incorrect. HR cannot unilaterally change client audit scopes." }
    ],
    correctExplanation: "HR must protect database and training record integrity. Incomplete requirements must be reported accurately, and catch-up sessions scheduled.",
    incorrectExplanation: "Altering records, deleting enrollments, or trying to bypass audit boundaries violates record compliance standards.",
    practicalTakeaway: "Maintain accurate, verified training records and refuse to falsify progress."
  },
  {
    question: "The training dashboard shows that several employees have not finished their assigned courses. No due dates are configured. What should HR report to management?",
    options: [
      { text: "Report that these employees are overdue and should be penalized.", isCorrect: false, feedback: "Incorrect. You cannot label employees overdue without a configured due date." },
      { text: "Report the exact completion rates and state that no due date has been configured by administration.", isCorrect: true, feedback: "Correct. Accurate reporting requires listing actual completion status and clarifying missing configurations." },
      { text: "Estimate an arbitrary completion date for the report.", isCorrect: false, feedback: "Incorrect. Inventing dates destroys report reliability." },
      { text: "Mark the training incomplete as a permanent failure.", isCorrect: false, feedback: "Incorrect. Incomplete progress can be updated once completed." }
    ],
    correctExplanation: "When reporting progress, list the exact status and clarify if configuration elements like due dates are not defined.",
    incorrectExplanation: "Applying penalties, inventing dates, or recording permanent failures ignores the actual system configuration.",
    practicalTakeaway: "Report actual completion rates accurately and clarify missing configuration settings."
  },
  {
    question: "A department manager wants to implement a waste-reduction checklist but employees complain that the training schedule conflicts with production shifts. What should HR do?",
    options: [
      { text: "Tell employees that environmental training is a priority over production work.", isCorrect: false, feedback: "Incorrect. This causes operational conflict and reduces training support." },
      { text: "Coordinate with the manager to schedule shorter training blocks during shift handovers or adjust path duration parameters.", isCorrect: true, feedback: "Correct. HR should coordinate training delivery around production routines to ensure feasibility." },
      { text: "Mark all employees complete without requiring the course.", isCorrect: false, feedback: "Incorrect. Falsification is not an acceptable solution to scheduling conflicts." },
      { text: "Cancel the waste checklist program.", isCorrect: false, feedback: "Incorrect. The program is valid; only the schedule requires coordination." }
    ],
    correctExplanation: "HR should coordinate learning schedules to fit around shift and production demands, ensuring training is feasible and does not cause friction.",
    incorrectExplanation: "Prioritizing training over production, falsifying records, or cancelling programs does not resolve the scheduling blocker.",
    practicalTakeaway: "Coordinate training delivery schedules to minimize operational disruption."
  }
];

export async function ensureSustainabilityForHrTeamsCourse() {
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

      // 3. Resolve or insert Course 24
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

      // 4. Update Course 23 recommendedNextCourseId to point to Course 24 preserving admin edits
      let course23 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-23")
      });
      if (!course23) {
        course23 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "planning-and-delivering-workplace-sustainability-initiatives")
        });
      }

      if (course23) {
        let isSystemManaged = false;
        if (course23.recommendedNextCourseId) {
          const currentRecommendedCourse = await tx.query.coursesTable.findFirst({
            where: eq(coursesTable.id, course23.recommendedNextCourseId)
          });
          if (currentRecommendedCourse && currentRecommendedCourse.courseCode === "ELH-24") {
            isSystemManaged = true;
          }
        }

        if (course23.recommendedNextCourseId === null || course23.recommendedNextCourseId === actualCourseId || isSystemManaged) {
          await tx.update(coursesTable).set({
            recommendedNextCourseId: actualCourseId
          }).where(eq(coursesTable.id, course23.id));
        } else {
          logger.warn(`Recommendation conflict: Course 23 currently recommends course ID ${course23.recommendedNextCourseId} instead of Course 24 (ID: ${actualCourseId}). Preserving administrator edit.`);
        }
      } else {
        logger.warn("Data integrity note: Course 23 not found during Course 24 recommendation configuration.");
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
          orderIndex: 27,
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
