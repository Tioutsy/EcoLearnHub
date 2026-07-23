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

const COURSE_SLUG = "building-workplace-sustainability-team";
const COURSE_TITLE = "Building a Workplace Sustainability Team";
const BADGE_SLUG = "workplace-sustainability-team-builder";
const SEED_NAME = "workplace-sustainability-team-v1";

const COURSE_META = {
  courseCode: "ELH-15",
  description: "Learn how to form and coordinate a practical workplace sustainability team with the right representatives, clear responsibilities, focused meetings and an achievable first action plan.",
  fullDescription: "Learn how to form and coordinate a practical workplace sustainability team with the right representatives, clear responsibilities, focused meetings and an achievable first action plan. This course enables learners to establish a credible internal sustainability team that can coordinate departmental goals, assign actions, maintain participation and report progress appropriately.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/building-workplace-sustainability-team.jpg",
  intendedRoles: ["employees", "departmental representatives", "managers", "HR teams", "operations leads", "sustainability coordinators"],
  learningObjectives: [
    "Explain the purpose and limitations of a workplace sustainability team.",
    "Select suitable representatives across departments, roles and operational levels.",
    "Define clear responsibilities, decision rights and management sponsorship.",
    "Organise short, focused meetings with documented actions and owners.",
    "Respond appropriately to low participation, conflicting priorities and unclear accountability.",
    "Draft a practical sustainability team charter and initial 90-day action plan."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Building a Workplace Sustainability Team. You can now establish a credible internal sustainability team that can coordinate departmental goals, assign actions, maintain participation and report progress appropriately.",
  badgeName: "Workplace Sustainability Team Builder",
  badgeDescription: "Awarded for completing Building a Workplace Sustainability Team and demonstrating practical understanding of team composition, responsibilities, action ownership and coordination.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "A Team Needs More Than Enthusiasm",
    minutes: 3,
    content: "Introduce a realistic situation where sustainability actions are being discussed but nobody owns coordination.",
    blocks: [
      {
        id: "c15-l1-b1",
        type: "heading",
        headingText: "A Team Needs More Than Enthusiasm"
      },
      {
        id: "c15-l1-b2",
        type: "short_text",
        bodyText: "A company has introduced several sustainability goals. Procurement is reviewing packaging, facilities is monitoring electricity use and HR wants to improve employee participation. Each department is taking separate actions, but nobody knows who should coordinate progress.\n\nA workplace sustainability team can connect departmental actions, share information, identify overlaps/gaps, maintain momentum, escalate decisions, and help employees understand what is changing."
      },
      {
        id: "c15-l1-b3",
        type: "key_message",
        headingText: "Core Boundary Principle",
        bodyText: "Coordinate actions, advise management, share information and monitor agreed progress. The team does not replace managers or approve expenditure unless formally authorised."
      },
      {
        id: "c15-l1-b4",
        type: "decision_scenario",
        decisionIntro: "Which is the strongest reason to create a sustainability team?",
        decisionPrompt: "Select the most appropriate reason:",
        decisionChoices: [
          {
            label: "To make one group responsible for all environmental work",
            correct: false,
            feedback: "Incorrect. The team coordinates actions but does not replace the responsibilities of individual department staff."
          },
          {
            label: "To coordinate action across departments and clarify ownership",
            correct: true,
            feedback: "Correct. Coordinating progress, sharing info, and tracking action ownership is the core purpose."
          },
          {
            label: "To give employees authority over company expenditure",
            correct: false,
            feedback: "Incorrect. A sustainability team operates within normal company boundaries and approval structures."
          },
          {
            label: "To create more sustainability announcements",
            correct: false,
            feedback: "Incorrect. Publicity is secondary to coordinating practical actions and results."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Choosing the Right Representatives",
    minutes: 3,
    content: "Teach learners how to select a balanced and useful group.",
    blocks: [
      {
        id: "c15-l2-b1",
        type: "heading",
        headingText: "Choosing the Right Representatives"
      },
      {
        id: "c15-l2-b2",
        type: "short_text",
        bodyText: "A sustainability team should normally include people who understand different parts of the operation, can influence or coordinate practical actions, represent different roles, and have access to relevant information."
      },
      {
        id: "c15-l2-b3",
        type: "mauritian_example",
        headingText: "Mauritian Workplace Example: Hotel Housekeeping",
        bodyText: "A hotel sustainability team composed only of office staff may overlook housekeeping, kitchen, maintenance, landscaping and guest-service realities.\n\nA practical team might include a manager, a facilities representative, someone from housekeeping or operations, procurement and an employee representative."
      },
      {
        id: "c15-l2-b4",
        type: "decision_scenario",
        decisionIntro: "Distinguishing a balanced team for a fictional company.",
        decisionPrompt: "Which of the following teams is most balanced?",
        decisionChoices: [
          {
            label: "The General Manager, Financial Controller, and Human Resources Director.",
            correct: false,
            feedback: "Incorrect. While highly authoritative, this team lacks operational representation from the frontline and departments executing actions."
          },
          {
            label: "A team consisting of a manager, a facilities representative, someone from housekeeping or operations, procurement, and an employee representative.",
            correct: true,
            feedback: "Correct. This composition provides operational frontline insights, administrative staff, and management sponsorship."
          },
          {
            label: "Ten volunteer employees from the administrative office.",
            correct: false,
            feedback: "Incorrect. Having members from only one department ignores the realities and challenges of other departments."
          },
          {
            label: "Frontline volunteers with no management representative or sponsor.",
            correct: false,
            feedback: "Incorrect. Without a management sponsor or representative, the team will struggle to align goals and get approvals."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Roles, Authority and Management Sponsorship",
    minutes: 3,
    content: "Prevent unclear accountability and unrealistic expectations.",
    blocks: [
      {
        id: "c15-l3-b1",
        type: "heading",
        headingText: "Roles, Authority and Management Sponsorship"
      },
      {
        id: "c15-l3-b2",
        type: "short_text",
        bodyText: "Introduce roles: Sponsor (supports team and removes barriers), Coordinator/chair (organises and focuses), Action owners (leads specific tasks), Representatives (brings info and communicates), Recorder (documents), and Data contact."
      },
      {
        id: "c15-l3-b3",
        type: "key_message",
        headingText: "Distinguish Levels of Authority",
        bodyText: "Be clear on: Recommending, Approving, Implementing, Monitoring, and Reporting. The team charter should state what the team may decide directly and what must be escalated."
      },
      {
        id: "c15-l3-b4",
        type: "decision_scenario",
        decisionIntro: "Decision Scenario: The team recommends replacing inefficient equipment, but the change requires a significant budget.",
        decisionPrompt: "What is the correct action?",
        decisionChoices: [
          {
            label: "Announce that the equipment will be replaced",
            correct: false,
            feedback: "Incorrect. The team cannot approve major spending or announce changes without proper authorization."
          },
          {
            label: "Purchase the equipment using another department’s budget",
            correct: false,
            feedback: "Incorrect. Bypassing standard financial controls is unauthorized and damages organizational trust."
          },
          {
            label: "Prepare the recommendation, evidence, expected benefits and approval request",
            correct: true,
            feedback: "Correct. The team should make a credible case and use the company’s normal approval process."
          },
          {
            label: "Remove the goal because the team cannot approve spending",
            correct: false,
            feedback: "Incorrect. The team should not be passive; presenting a well-reasoned recommendation is within their scope."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Meetings That Lead to Action",
    minutes: 3,
    content: "Show learners how to avoid unfocused or ceremonial meetings.",
    blocks: [
      {
        id: "c15-l4-b1",
        type: "heading",
        headingText: "Meetings That Lead to Action"
      },
      {
        id: "c15-l4-b2",
        type: "short_text",
        bodyText: "A practical sustainability meeting should include: Review of open actions, Progress, Barriers, Decisions, New actions with named owners, Deadlines, and Items for escalation."
      },
      {
        id: "c15-l4-b3",
        type: "decision_scenario",
        decisionIntro: "Improving a poor meeting note: 'Discuss recycling. Speak to staff. Improve energy. Check supplier.'",
        decisionPrompt: "Identify the best improvement of the note:",
        decisionChoices: [
          {
            label: "Do more recycling, tell people to save energy, and contact the supplier.",
            correct: false,
            feedback: "Incorrect. This remains vague and lacks specific owners and target dates."
          },
          {
            label: "Facilities Manager to confirm which waste streams the current collector accepts and provide updated bin instructions before 15 September.",
            correct: true,
            feedback: "Correct. This defines a specific action, owner, and deadline to ensure clear follow-through."
          },
          {
            label: "The sustainability team will try to improve recycling and energy use by next month.",
            correct: false,
            feedback: "Incorrect. Group-level assignments without named individuals lead to weak accountability."
          },
          {
            label: "Everyone should check recycling bins and energy consumption.",
            correct: false,
            feedback: "Incorrect. Vague collaborative assignments usually result in no one taking action."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Scenario: Participation Drops After the Launch",
    minutes: 3,
    content: "Assess how learners respond when early enthusiasm declines.",
    blocks: [
      {
        id: "c15-l5-b1",
        type: "heading",
        headingText: "Scenario: Participation Drops After the Launch"
      },
      {
        id: "c15-l5-b2",
        type: "short_text",
        bodyText: "A company launches its sustainability team with strong initial interest. After two months, representatives miss meetings, managers say operational work takes priority, employees are not updated, and actions have no clear owners."
      },
      {
        id: "c15-l5-b3",
        type: "decision_scenario",
        decisionIntro: "What is the most constructive response?",
        decisionPrompt: "Choose the strongest response:",
        decisionChoices: [
          {
            label: "Send daily motivational emails to all staff about the importance of saving the planet.",
            correct: false,
            feedback: "Incorrect. Generic emails do not address structural issues like workload or lack of clear ownership."
          },
          {
            label: "Schedule a three-hour brainstorming session to generate new sustainability ideas.",
            correct: false,
            feedback: "Incorrect. Adding more ideas when earlier tasks are uncompleted increases workload and confusion."
          },
          {
            label: "Review the team’s purpose and workload, reduce the number of active priorities, and confirm manager support.",
            correct: true,
            feedback: "Correct. Narrowing the focus and aligning operational schedules with management sponsorship restores progress."
          },
          {
            label: "Reprimand the representatives who missed meetings.",
            correct: false,
            feedback: "Incorrect. Threats and blame create hostility without resolving genuine competing priorities."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Create the Team Charter and First 90-Day Plan",
    minutes: 3,
    content: "Convert learning into a practical workplace output.",
    blocks: [
      {
        id: "c15-l6-b1",
        type: "heading",
        headingText: "Create the Team Charter and First 90-Day Plan"
      },
      {
        id: "c15-l6-b2",
        type: "short_text",
        bodyText: "A Team Charter aligns members and management on purpose, sponsor, coordinator, members, scope, responsibilities, decision rights, and meeting frequency.\n\nA first 90-day plan focuses on no more than three initial priorities, clearly assigned owners, achievable deadlines, simple indicators, and a review point."
      },
      {
        id: "c15-l6-b3",
        type: "commitment",
        commitmentInstruction: "Choose one daily commitment you want to propose to strengthen sustainability coordination in your workplace:",
        commitmentOptions: [
          {
            value: "identify-missing-rep",
            label: "Identify missing departmental representation.",
            description: "Look for departments or roles that are currently not represented on the team."
          },
          {
            value: "clarify-ownership",
            label: "Clarify who owns an existing sustainability action.",
            description: "Ensure every task has a named owner and deadline."
          },
          {
            value: "propose-charter",
            label: "Propose a short team charter.",
            description: "Draft a basic outline of purpose and scope."
          },
          {
            value: "review-meetings",
            label: "Review whether current meetings produce documented actions.",
            description: "Check if minutes track concrete outcomes."
          },
          {
            value: "ask-management",
            label: "Ask management to clarify sponsorship and approval boundaries.",
            description: "Ensure the team knows what it can decide."
          }
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "What is the primary purpose of a workplace sustainability team?",
    options: [
      { text: "To take full responsibility for all environmental tasks and manual cleanups.", isCorrect: false, feedback: "The team coordinates actions but does not replace the responsibilities of individual department staff." },
      { text: "To coordinate actions across departments, share information, and monitor progress.", isCorrect: true, feedback: "Correct. Coordinating progress, sharing info, and tracking action ownership is the core purpose." },
      { text: "To bypass normal company spending limits for green products.", isCorrect: false, feedback: "A sustainability team operates within normal company boundaries and approval structures." },
      { text: "To police colleagues and report environmental policy violations to HR.", isCorrect: false, feedback: "Policing colleagues creates resentment; the team should encourage engagement and coordination." }
    ],
    correctExplanation: "A sustainability team coordinates, advises, and tracks departmental goals rather than taking over all manual work or acting as police.",
    incorrectExplanation: "The team does not replace existing managers or assume formal regulatory authority, nor should it act as internal police.",
    practicalTakeaway: "Focus the team on coordination and tracking rather than manual execution or policy enforcement."
  },
  {
    question: "A retail business in Mauritius wants to build a sustainability team. Which team composition is most likely to succeed?",
    options: [
      { text: "The executive board only, to ensure maximum decision authority.", isCorrect: false, feedback: "Board members lack insight into daily store operations and shelf-stocking practices." },
      { text: "A mix of office staff, shop floor supervisors, procurement, and a management sponsor.", isCorrect: true, feedback: "Correct. A balanced team represents operational, support, and management functions, making implementation realistic." },
      { text: "A group of summer interns, since they have more time to devote to projects.", isCorrect: false, feedback: "Interns lack long-term tenure and the authority needed to establish routine workplace habits." },
      { text: "Anyone who volunteers, even if they all come from the same administrative department.", isCorrect: false, feedback: "Having members from only one department ignores the realities and challenges of other departments." }
    ],
    correctExplanation: "A successful team combines operational frontline insights, administrative staff, and management sponsorship.",
    incorrectExplanation: "Single-department teams or executive-only boards lack either the broad perspective or the detailed frontline understanding needed to implement changes.",
    practicalTakeaway: "Ensure diverse operational and administrative representation on your team."
  },
  {
    question: "Why is a management sponsor essential for a workplace sustainability team?",
    options: [
      { text: "To run the weekly meetings and record the minutes.", isCorrect: false, feedback: "The coordinator or coordinator role runs meetings and records minutes, not the sponsor." },
      { text: "To do the manual waste sorting and check energy meters.", isCorrect: false, feedback: "Manual tasks are owned by action owners and department representatives." },
      { text: "To provide backing, align goals with business priorities, and help remove operational barriers.", isCorrect: true, feedback: "Correct. Sponsors provide strategic alignment and help resolve resources and structural barriers." },
      { text: "To sign off on all environmental expenditures without a business case.", isCorrect: false, feedback: "Management sponsors require a clear business case and follow normal company approval procedures." }
    ],
    correctExplanation: "Sponsors provide executive alignment and help clear obstacles that the team cannot resolve alone.",
    incorrectExplanation: "The sponsor is not there to perform operational work or bypass financial accountability rules.",
    practicalTakeaway: "Secure a management sponsor who can champion your team's recommendations at the executive level."
  },
  {
    question: "The sustainability team wants to transition the office from disposable plastic bottles to filtered water dispensers. What is the team's correct authority role in this decision?",
    options: [
      { text: "The team can approve the purchase of the dispensers directly using company funds.", isCorrect: false, feedback: "The team recommends actions but does not have the authority to bypass standard financial controls." },
      { text: "The team can order the change without consulting the facilities or finance managers.", isCorrect: false, feedback: "Unilateral actions cause friction and bypass operations and compliance checks." },
      { text: "The team should analyze the options, build a business case, and recommend the change to the authorized manager.", isCorrect: true, feedback: "Correct. Building a recommendation and seeking approval from the proper authority is the standard, effective way." },
      { text: "The team must do nothing because they do not have formal financial authority.", isCorrect: false, feedback: "The team should not be passive; presenting a well-reasoned recommendation is within their scope." }
    ],
    correctExplanation: "Sustainability teams advise and coordinate; formal spending or policy changes must go through standard corporate approvals.",
    incorrectExplanation: "The team has no inherent spending authority unless formally delegated by management.",
    practicalTakeaway: "Always present a solid business case with your sustainability recommendations."
  },
  {
    question: "Which of the following is the best habit for keeping workplace sustainability meetings productive?",
    options: [
      { text: "Schedule long, open sessions to debate general global warming trends.", isCorrect: false, feedback: "Meetings should focus on local operational issues, not general climate debate." },
      { text: "Circulate a simple agenda beforehand and focus on reviewing and assigning specific actions.", isCorrect: true, feedback: "Correct. Clear agendas and action tracking keep meetings short, focused, and productive." },
      { text: "Avoid documenting action owners to keep the atmosphere collaborative.", isCorrect: false, feedback: "Unassigned actions lead to zero progress. Every action must have a named owner and deadline." },
      { text: "Cancel meetings if any action owner has not completed their task.", isCorrect: false, feedback: "Uncompleted tasks should be discussed to identify obstacles, not ignored by cancelling meetings." }
    ],
    correctExplanation: "Short, regular meetings with clear agendas and explicitly assigned action ownership ensure continuous progress.",
    incorrectExplanation: "Vague debates or avoiding accountability structures leads to meeting fatigue and zero implementation.",
    practicalTakeaway: "Make meetings action-oriented with clear owners and timelines."
  },
  {
    question: "A meeting note states: 'We need to update our recycling signs. Team will help.' What is the main weakness of this note?",
    options: [
      { text: "The task is too expensive to implement.", isCorrect: false, feedback: "Updating signs is inexpensive; the issue is how the action is managed." },
      { text: "It does not use official ESG reporting terminologies.", isCorrect: false, feedback: "Practical action notes should be plain and direct, not full of ESG jargon." },
      { text: "It fails to assign a specific owner, a deadline, and the expected result.", isCorrect: true, feedback: "Correct. 'Team will help' means nobody is accountable. There must be one named owner and a target date." },
      { text: "The team should not be involved in updating signs.", isCorrect: false, feedback: "Updating signs is a very typical and useful action for a sustainability team to coordinate." }
    ],
    correctExplanation: "Action notes must define exactly who is responsible and by when the outcome is expected, avoiding vague group commitments.",
    incorrectExplanation: "Expense, lack of jargon, or team involvement are not the limiting issues; lack of individual accountability is.",
    practicalTakeaway: "Never leave an action assigned to 'the team'—assign it to one named individual."
  },
  {
    question: "Two months after the launch, attendance at sustainability meetings is dropping, and representatives claim they are too busy. What is the most constructive response?",
    options: [
      { text: "Report the absent representatives to HR for disciplinary action.", isCorrect: false, feedback: "Disciplinary threats create hostility and do not address operational workload issues." },
      { text: "Post public updates naming and shaming the departments that are not participating.", isCorrect: false, feedback: "Naming and shaming destroys team collaboration and employee goodwill." },
      { text: "Review the workload, reduce the number of active priorities, and confirm manager support.", isCorrect: true, feedback: "Correct. Focus on a few high-value, manageable actions and check with managers to align operational schedules." },
      { text: "Suspend the team and assume the company is not ready for sustainability.", isCorrect: false, feedback: "Giving up ignores the opportunity to adjust scope and find a pace that fits the business." }
    ],
    correctExplanation: "Drop in participation is usually due to competing operational priorities; narrowing focus and aligning schedules solves this constructively.",
    incorrectExplanation: "Punitive actions, naming and shaming, or total abandonment are counterproductive and damage morale.",
    practicalTakeaway: "When interest drops, reduce the workload and confirm management backing for representatives' time."
  },
  {
    question: "Why should a sustainability team draft a formal Team Charter at the start?",
    options: [
      { text: "To establish the team's purpose, scope, decision boundaries, and meeting routines.", isCorrect: true, feedback: "Correct. The charter aligns members and management on what the team is responsible for and what requires escalation." },
      { text: "To declare the team's legal independence from company management.", isCorrect: false, feedback: "The team is part of the organization and relies on management support." },
      { text: "To submit it for mandatory registration with the Ministry of Environment.", isCorrect: false, feedback: "Team charters are internal guidelines, not legal regulatory documents." },
      { text: "To replace all existing departmental job descriptions.", isCorrect: false, feedback: "The charter defines the committee's scope, not individual employee job descriptions." }
    ],
    correctExplanation: "A charter clarifies expectations, scopes, and decision boundaries, preventing conflicts and wasted effort.",
    incorrectExplanation: "The charter has no legal registration requirements and does not replace employment contracts or override corporate hierarchy.",
    practicalTakeaway: "Use a simple charter to agree on decision rights and escalation rules before issues arise."
  }
];

export async function ensureWorkplaceSustainabilityTeamCourse() {
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

      // 2. Resolve Course 14
      let course14 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-14")
      });
      if (!course14) {
        course14 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "setting-departmental-sustainability-goals")
        });
      }

      if (!course14) {
        throw new Error("Data integrity error: Course 14 (ELH-14) not found. Prerequisite cannot be established.");
      }

      // 3. Resolve or insert Course 15
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
          recommendedNextCourseId: null, // New course, default system-managed recommendation is null
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

      // 4. Update Course 14 recommendedNextCourseId to point to Course 15 preserving admin edits
      let isSystemManaged = false;
      if (course14.recommendedNextCourseId) {
        const currentRecommendedCourse = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.id, course14.recommendedNextCourseId)
        });
        if (currentRecommendedCourse && currentRecommendedCourse.courseCode === "ELH-15") {
          isSystemManaged = true;
        }
      }

      if (course14.recommendedNextCourseId === null || course14.recommendedNextCourseId === actualCourseId || isSystemManaged) {
        await tx.update(coursesTable).set({
          recommendedNextCourseId: actualCourseId
        }).where(eq(coursesTable.id, course14.id));
      } else {
        logger.warn(`Recommendation conflict: Course 14 currently recommends course ID ${course14.recommendedNextCourseId} instead of Course 15 (ID: ${actualCourseId}). Preserving administrator edit.`);
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
          orderIndex: 18,
          code: "COURSE_ELH_15_COMPLETE",
        });
      } else {
        await tx.update(badgeDefinitionsTable).set({
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          courseIds: [actualCourseId],
          code: "COURSE_ELH_15_COMPLETE",
        }).where(eq(badgeDefinitionsTable.slug, BADGE_SLUG));
      }

      // 6. Ensure Prerequisite relationships exist
      // Prerequisite 1: Course 14
      const existingPrereq14 = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course14.id)
        )
      });
      if (!existingPrereq14) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course14.id
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
              eq(lessonsTable.courseId, actualCourseId),
              eq(lessonsTable.orderIndex, lesson.order)
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
