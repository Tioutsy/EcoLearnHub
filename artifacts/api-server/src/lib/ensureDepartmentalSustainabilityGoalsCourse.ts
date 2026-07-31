import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
  coursePrerequisitesTable,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_SLUG = "setting-departmental-sustainability-goals";
const COURSE_TITLE = "Setting Departmental Sustainability Goals";
const BADGE_SLUG = "departmental-sustainability-goal-setter";
const SEED_NAME = "departmental-sustainability-goals-v2";

const COURSE_META = {
  courseCode: "ELH-14",
  description:
    "Help departments translate broad company sustainability priorities into practical, owned, and measurable goals.",
  fullDescription:
    "Company sustainability ambitions only become useful when departments understand what they are responsible for delivering. This course helps learners convert broad company priorities into practical departmental sustainability goals. Learners will identify what their department controls vs influences, establish a realistic starting point using available evidence, define a measurable goal using the ALIGN framework, assign accountable ownership, and decide how progress should be reviewed. Recommended for employees, departmental representatives, supervisors, managers, and sustainability champions.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/setting-departmental-sustainability-goals.jpg",
  intendedRoles: ["employees", "departmental representatives", "supervisors", "managers", "sustainability champions"],
  learningObjectives: [
    "Translate company sustainability priorities into specific departmental goals reflecting departmental control and influence.",
    "Distinguish between direct control, operational influence, and concerns requiring escalation.",
    "Apply the ALIGN (Assess, Link, Identify, Give ownership, Negotiate constraints) goal-setting framework.",
    "Distinguish company priorities, departmental goals, activities, outputs, and outcomes.",
    "Select realistic indicators and evidence sources without creating unnecessary reporting complexity."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations! You have passed Setting Departmental Sustainability Goals. You can now align your department's responsibilities with company priorities, define measurable goals with named owners, and select evidence-backed indicators.",
  badgeName: "Departmental Sustainability Goal Setter",
  badgeDescription:
    "Awarded for demonstrating the ability to define departmental sustainability goals with clear indicators, ownership, and review processes.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "From Company Ambition to Departmental Responsibility",
    minutes: 3,
    content: "Understand why broad corporate commitments fail unless translated into specific departmental responsibilities.",
    blocks: [
      { id: "dg1-h1", type: "heading", position: 1, headingText: "A Goal for Everyone Belongs to No One" },
      { id: "dg1-t1", type: "short_text", position: 2, bodyText: "When a company announces a priority to 'reduce environmental impact and waste this year,' departments often respond with disconnected ideas: Facilities suggests equipment upgrades, HR proposes poster campaigns, and Procurement asks about green vendors. Without explicit departmental goals, no team knows what result it is responsible for delivering." },
      { id: "dg1-k1", type: "key_message", position: 3, headingText: "The Core Alignment Principle", bodyText: "Company priorities define the organization's direction; departmental goals define each team's specific, owned contribution based on its operational control." },
      {
        id: "dg1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Evaluating Departmental Responsibility:",
        decisionPrompt: "A commercial company sets a priority to reduce site energy draw by 20%. Which statement represents a clear, actionable departmental goal?",
        decisionChoices: [
          { label: "The Administration Department will reduce monthly office paper purchasing by 15% within 12 months by defaulting to double-sided digital review", correct: true, feedback: "Correct! It names the specific department, defines a measurable outcome, and sets a 12-month timeframe." },
          { label: "Everyone in the building should try their best to turn off lights when leaving rooms", correct: false, feedback: "Incorrect. Broad requests without assigned departmental targets or owners rarely produce measurable results." },
          { label: "The company will become 100% green by December", correct: false, feedback: "Incorrect. This is an absolute slogan, not a departmental goal." }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Why Departmental Goals Matter & Core Vocabulary",
    minutes: 3,
    content: "Explore the operational benefits of goal alignment and master plain-language goal-setting terms.",
    blocks: [
      { id: "dg2-h1", type: "heading", position: 1, headingText: "Operational Benefits & Vocabulary" },
      { id: "dg2-t1", type: "short_text", position: 2, bodyText: "Departmental goals convert high-level strategy into everyday operational clarity. They prevent duplicated effort, clarify authority boundaries, and guide resource allocation." },
      {
        id: "dg2-k1",
        type: "key_message",
        position: 3,
        headingText: "Goal-Setting Vocabulary",
        bodyText: "• Company Priority: High-level organizational objective (e.g. Reduce corporate carbon emissions by 25%).\n• Departmental Goal: The specific contribution owned by one department (e.g. Logistics reduces fleet fuel draw by 10%).\n• Activity: The task step taken (e.g. Conduct driver eco-driving briefings).\n• Output: The immediate deliverable (e.g. 20 drivers trained).\n• Outcome: The measured result (e.g. 1,200 litres of diesel saved per month).\n• Indicator & Evidence: The verified data source confirming progress (e.g. Monthly fuel purchase receipts)."
      },
      {
        id: "dg2-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "According to ISO 14001 Environmental Management Systems and the UN Global Compact, organizations that align departmental goals with corporate priorities and assign named goal owners increase successful target completion by over 75%!"
      }
    ]
  },
  {
    order: 2,
    title: "The ALIGN Goal-Setting Framework",
    minutes: 4,
    content: "Master the 5-step ALIGN framework: Assess, Link, Identify, Give ownership, Negotiate constraints.",
    blocks: [
      { id: "dg3-h1", type: "heading", position: 1, headingText: "The ALIGN Framework" },
      { id: "dg3-t1", type: "short_text", position: 2, bodyText: "Use the ALIGN framework to construct robust departmental goals:" },
      {
        id: "dg3-k1",
        type: "key_message",
        position: 3,
        headingText: "ALIGN Framework Breakdown",
        bodyText: "• A — Assess the department's role: Determine what the team directly controls vs influences.\n• L — Link to the company priority: Connect the goal directly to an overarching business objective.\n• I — Identify baseline & result: Record current performance and define the target improvement.\n• G — Give ownership, timing & evidence: Name one goal owner, set a deadline, and choose indicator data.\n• N — Negotiate constraints & dependencies: Confirm cross-department support and resource availability."
      },
      {
        id: "dg3-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Practice: Control vs Influence",
        decisionPrompt: "A hotel housekeeping department wants to reduce water use. Which area is under its DIRECT CONTROL?",
        decisionChoices: [
          { label: "Enforcing daily towel/linen reuse procedures and laundry wash-load optimization", correct: true, feedback: "Correct! Housekeeping directly controls laundry loading procedures and room linen change schedules." },
          { label: "Replacing the hotel's main water pumps and solar heating boilers", correct: false, feedback: "Incorrect. Major plant replacement is under Facilities or Capital Projects control." },
          { label: "Negotiating municipal water tariff rates with the Central Water Authority", correct: false, feedback: "Incorrect. Utility rates are legal/commercial matters outside departmental control." }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Visual Alignment Board & High-Risk Mistakes",
    minutes: 4,
    content: "Inspect a realistic Mauritian departmental alignment board and review critical safeguards.",
    blocks: [
      { id: "dg4-h1", type: "heading", position: 1, headingText: "Visual Goal Alignment Board Inspection" },
      { id: "dg4-t1", type: "short_text", position: 2, bodyText: "Examine the Mauritian workplace alignment board below. Observe how the top company priority ('Reduce Operational Waste & Energy Draw by 20%') branches into distinct aligned goals for Kitchen, Housekeeping, Procurement, Facilities, and HR—each with named owners (Jean-Pierre, Meera, Davin, Sarah), target dates, and evidence indicators." },
      {
        id: "dg4-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-departmental-sustainability-goals.png",
        caption: "Departmental Alignment Board: Top company priority linking to aligned goals for Kitchen, Housekeeping, Procurement, Facilities, and HR with named owners and indicators.",
        imageAlt: "Realistic photograph of a Mauritian commercial workplace planning room with a whiteboard titled Departmental Sustainability Goal Alignment Board showing a top company priority branching into columns for Kitchen, Housekeeping, Procurement, Facilities, and HR, while managers review cards."
      },
      {
        id: "dg4-k1",
        type: "key_message",
        position: 4,
        headingText: "High-Risk Goal Mistakes to Avoid",
        bodyText: "• DO NOT copy another company's targets without understanding your baseline.\n• DO NOT adopt percentage targets if no baseline data exists; set an observational baseline goal first.\n• DO NOT set goals outside your department's authority without securing cross-department agreement.\n• DO NOT compromise safety, hygiene, or customer service standards to meet a sustainability target."
      }
    ]
  },
  {
    order: 4,
    title: "Worked Mauritian Scenario & Applied Decision",
    minutes: 2,
    content: "Study a multi-department hotel worked scenario and make an applied store manager decision.",
    blocks: [
      { id: "dg5-h1", type: "heading", position: 1, headingText: "Worked Scenario: Hotel Waste Reduction" },
      {
        id: "dg5-w1",
        type: "workplace_example",
        position: 2,
        headingText: "Multi-Department Goal Alignment",
        bodyText: "Company Priority: Reduce Resort Operational Waste by 25% in 12 Months.\n• Kitchen Goal: Reduce food prep waste by 15% via daily portion planning (Owner: Head Chef Jean-Pierre).\n• Housekeeping Goal: Eliminate single-use plastic guest bottles by switching to refillable dispensers (Owner: Meera R.).\n• Procurement Goal: Audit top 10 suppliers for reusable delivery crate packaging (Owner: Davin K.).\n• Facilities Goal: Upgrade waste sorting station signage and bin capacity (Owner: Raj S.).\n• HR Goal: Conduct role-relevant waste sorting induction for all 150 staff (Owner: Sarah M.)."
      },
      {
        id: "dg5-d1",
        type: "decision_scenario",
        position: 3,
        decisionIntro: "Applied Retail Store Manager Decision:",
        decisionPrompt: "A retail store manager in Port Louis receives a corporate command: 'Reduce store electricity draw by 20% in 3 months.' The store has no sub-meter and no budget for equipment. What is the most appropriate departmental goal?",
        decisionChoices: [
          { label: "Establish a strict opening/closing shutdown checklist for non-essential display lighting and AC, track monthly total power bills, and request Facilities to inspect AC thermostat calibration", correct: true, feedback: "Outstanding! Focusing on direct operational shutdown controls while coordinating with Facilities for equipment checks respects authority boundaries and protects customer comfort." },
          { label: "Turn off all store air conditioning and sales floor lighting during trading hours", correct: false, feedback: "NEVER compromise customer safety or store trading conditions!" },
          { label: "Refuse the goal and tell corporate that electricity cannot be managed in retail", correct: false, feedback: "Incorrect. Operational shutdown routines and closing checks can be managed immediately." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Goal-Setting Commitment & Badge",
    minutes: 2,
    content: "Select your daily departmental goal-setting commitments and complete the course.",
    blocks: [
      { id: "dg6-h1", type: "heading", position: 1, headingText: "Departmental Goal Commitment" },
      { id: "dg6-t1", type: "short_text", position: 2, bodyText: "Select the goal-setting commitments you pledge to practice in your workplace planning." },
      {
        id: "dg6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your departmental goal commitments (choose at least one):",
        commitmentOptions: [
          { value: "align-with-company-priority", label: "Align departmental goals directly with overarching company sustainability priorities", description: "Ensure team efforts support business strategy." },
          { value: "focus-on-direct-control", label: "Focus goals on areas under direct departmental control and operational influence", description: "Avoid setting goals outside team authority." },
          { value: "assign-named-goal-owners", label: "Assign one accountable named individual for every departmental goal", description: "Ensure clear ownership and follow-through." },
          { value: "protect-operational-standards", label: "Protect safety, quality, hygiene, and customer service while pursuing sustainability goals", description: "Maintain core operational standards." }
        ]
      },
      {
        id: "dg6-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Practical Disclaimer",
        bodyText: "DISCLAIMER: The ALIGN Goal-Setting Framework is an operational planning tool for workplace departments. It does not constitute statutory ESG reporting, legal compliance certification, or HRDC statutory approval."
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "Why is a company priority like 'reduce environmental impact' insufficient on its own?",
    options: [
      "Because it does not specify what individual departments are responsible for delivering based on their operational control",
      "Because environmental priorities are illegal in commercial workplaces",
      "Because departments are not allowed to talk to executive management",
      "Because electricity and waste cannot be measured in commercial buildings"
    ],
    correct: 0,
    correctExplanation: "Broad company priorities require specific departmental goals to define ownership, actions, and measurable outcomes.",
    incorrectExplanation: "Incorrect. Company priorities must be translated into specific departmental responsibilities."
  },
  {
    order: 2,
    question: "What does the 'A' in the ALIGN goal-setting framework stand for?",
    options: [
      "Assess the department's role (determine what the department directly controls vs influences)",
      "Announce a 50% target immediately without checking baseline data",
      "Avoid talking to other departments about shared resources",
      "Approve all purchase requests regardless of cost"
    ],
    correct: 0,
    correctExplanation: "A = Assess the department's role to identify areas of direct control and influence.",
    incorrectExplanation: "Incorrect. A = Assess the department's role."
  },
  {
    order: 3,
    question: "Which of the following is an example of an operational area under DIRECT CONTROL of a company's HR department?",
    options: [
      "Integrating sustainability orientation guidance into new employee onboarding programs",
      "Replacing the main electrical transformers in the building basement",
      "Selecting the refrigerant gas used in central chiller plants",
      "Setting municipal water rates for commercial customers"
    ],
    correct: 0,
    correctExplanation: "HR directly controls employee onboarding programs and internal staff training schedules.",
    incorrectExplanation: "Incorrect. HR directly controls onboarding, staff policies, and training."
  },
  {
    order: 4,
    question: "In the departmental goal alignment board (`visual-departmental-sustainability-goals.png`), how do departmental goals connect to the top row?",
    options: [
      "Each department (Kitchen, Housekeeping, Procurement, Facilities, HR) defines a specific goal that directly supports the central company priority",
      "All departments copy the exact same word-for-word text from the top row",
      "The top row is ignored and departments work on unrelated projects",
      "The board is decorative and contains no real department information"
    ],
    correct: 0,
    correctExplanation: "Departmental goals branch from the top company priority, showing each team's specific contribution.",
    incorrectExplanation: "Incorrect. Departmental goals branch from and support the company priority."
  },
  {
    order: 5,
    question: "What is the difference between an ACTIVITY and an OUTCOME in departmental goal setting?",
    options: [
      "An activity is a task step taken (e.g. conduct staff briefings); an outcome is the measured improvement achieved (e.g. 15% reduction in paper waste)",
      "An activity is a legal penalty; an outcome is a company logo",
      "An activity is an assumption; an outcome is a rumor",
      "Activity and outcome mean the exact same thing"
    ],
    correct: 0,
    correctExplanation: "Activities are tasks performed; outcomes are the actual measured results achieved.",
    incorrectExplanation: "Incorrect. Activity = task performed; Outcome = measured improvement."
  },
  {
    order: 6,
    question: "What should a department manager do if a proposed sustainability goal requires decisions outside their department's authority?",
    options: [
      "Identify the dependency, negotiate with the responsible department head (or escalate to management), and secure agreement before finalizing the goal",
      "Implement the changes secretly without informing the other department",
      "Set an unachievable target and blame the other department when it fails",
      "Cancel all departmental planning permanently"
    ],
    correct: 0,
    correctExplanation: "Dependencies must be negotiated and agreed upon across departments before finalizing targets.",
    incorrectExplanation: "Incorrect. Negotiate cross-department dependencies and secure agreement."
  },
  {
    order: 7,
    question: "What is a HIGH-RISK MISTAKE when setting departmental sustainability goals?",
    options: [
      "Adopting a rigid percentage reduction target when no baseline measurement data exists",
      "Defining a clear 6-month review date",
      "Naming an accountable staff member as goal owner",
      "Checking evidence receipts before reporting progress"
    ],
    correct: 0,
    correctExplanation: "Setting percentage targets without baseline data leads to unverified claims and audit failures.",
    incorrectExplanation: "Incorrect. Avoid adopting percentage targets without baseline data."
  },
  {
    order: 8,
    question: "How does ELH-14 (Departmental Goals) connect to ELH-13 (Action Planning)?",
    options: [
      "ELH-14 defines the overarching departmental goal; ELH-13 provides the step-by-step action plan to execute that goal",
      "ELH-14 replaces ELH-13 entirely so action plans are no longer needed",
      "ELH-14 is for executive directors only; ELH-13 is for external auditors",
      "There is no connection between goals and action plans"
    ],
    correct: 0,
    correctExplanation: "ELH-14 sets the departmental goal; ELH-13 builds the detailed action plan to deliver it.",
    incorrectExplanation: "Incorrect. ELH-14 sets the goal; ELH-13 provides the execution action plan."
  },
  {
    order: 9,
    question: "When selecting indicators for a departmental goal, what should managers prioritize?",
    options: [
      "Proportionate, verifiable data sources (e.g. utility bills, purchase receipts, audit logs) that directly measure goal progress",
      "Complicated statistical models that require 20 hours of manual data entry per week",
      "Unverified opinions from social media comments",
      "Vague slogans printed on poster banners"
    ],
    correct: 0,
    correctExplanation: "Select simple, verifiable indicators that directly track progress without excessive administrative burden.",
    incorrectExplanation: "Incorrect. Select proportionate, verifiable indicators directly linked to goal progress."
  },
  {
    order: 10,
    question: "What is the primary takeaway of the ALIGN Goal-Setting Framework?",
    options: [
      "Structured goal setting (ALIGN) enables departments to translate company strategy into owned, realistic, and evidence-backed workplace results",
      "Departmental goal setting is optional and has no impact on business performance",
      "Any employee can change corporate procurement policies without management review",
      "Goals should only be set if they guarantee immediate financial bonuses"
    ],
    correct: 0,
    correctExplanation: "The ALIGN framework helps departments convert corporate priorities into owned, evidence-backed results.",
    incorrectExplanation: "Incorrect. The ALIGN framework connects company priorities to owned departmental results."
  }
];

export async function ensureDepartmentalSustainabilityGoalsCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 14 by courseCode "ELH-14" or slug
      let course = null;

      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-14"))
        .limit(1);

      if (byCode) {
        course = byCode;
      } else {
        const [bySlug] = await tx
          .select()
          .from(coursesTable)
          .where(eq(coursesTable.slug, COURSE_SLUG))
          .limit(1);
        course = bySlug ?? null;
      }

      if (!course) {
        throw new Error("Course ELH-14 / setting-departmental-sustainability-goals not seeded by catalogue skeletons bootstrap!");
      }

      const courseId = course.id;

      // 2. Fetch seed marker and existing database content
      const [existingSeed] = await tx
        .select()
        .from(systemSeedsTable)
        .where(eq(systemSeedsTable.name, SEED_NAME))
        .limit(1);

      const existingLessons = await tx
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, courseId));

      const existingQuizQuestions = await tx
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, courseId));

      // 3. Evaluate integrity violations
      const hasMissingLessons = existingLessons.length !== 6;
      const hasEmptyBlocks = existingLessons.some(
        (l) => !l.contentBlocks || !Array.isArray(l.contentBlocks) || l.contentBlocks.length === 0
      );
      const hasMissingQuiz = existingQuizQuestions.length !== 10;

      const needsRepair = !existingSeed || hasMissingLessons || hasEmptyBlocks || hasMissingQuiz;

      if (!needsRepair) {
        logger.info({ courseId, slug: COURSE_SLUG }, "Setting Departmental Sustainability Goals course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course ELH-14. Re-seeding course content, lessons, and 10 quiz questions transactionally...");

      // 4. Resolve next recommended course dynamically (ELH-15 or null if not yet seeded)
      const [course15] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.slug, "workplace-sustainability-communication"))
        .limit(1);
      const nextCourseId = course15 ? course15.id : null;

      // 5. Update course record metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-14",
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
          badgeName: COURSE_META.badgeName,
          badgeDescription: COURSE_META.badgeDescription,
          recommendedNextCourseId: nextCourseId,
          isPublished: true,
          status: "published",
        })
        .where(eq(coursesTable.id, courseId));

      // 6. Seed/re-seed lessons with exact position block arrays
      await tx.delete(lessonsTable).where(eq(lessonsTable.courseId, courseId));
      for (const newLesson of NEW_LESSONS) {
        await tx.insert(lessonsTable).values({
          courseId,
          title: newLesson.title,
          orderIndex: newLesson.order,
          durationMinutes: newLesson.minutes,
          content: newLesson.content,
          contentBlocks: newLesson.blocks,
          isArchived: false,
        });
      }

      // 7. Seed/re-seed 10 quiz questions
      await tx.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, courseId));
      await tx.insert(quizQuestionsTable).values(
        NEW_QUIZ.map((q) => ({
          courseId,
          question: q.question,
          options: q.options,
          correctOption: q.correct,
          orderIndex: q.order,
          correctExplanation: q.correctExplanation,
          incorrectExplanation: q.incorrectExplanation,
          isArchived: false,
        }))
      );

      // 8. Enforce prerequisite entries in coursePrerequisitesTable (ELH-12 & ELH-13 -> ELH-14)
      const prereqs = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(inArray(coursesTable.slug, [
          "final-sustainability-certification",
          "sustainability-action-planning"
        ]));

      for (const prereq of prereqs) {
        const [existingPrereq] = await tx
          .select()
          .from(coursePrerequisitesTable)
          .where(and(
            eq(coursePrerequisitesTable.courseId, courseId),
            eq(coursePrerequisitesTable.prerequisiteCourseId, prereq.id)
          ))
          .limit(1);

        if (!existingPrereq) {
          await tx.insert(coursePrerequisitesTable).values({
            courseId,
            prerequisiteCourseId: prereq.id,
          });
        }
      }

      // 9. Idempotently seed/update badge definition
      await tx
        .insert(badgeDefinitionsTable)
        .values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "target",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 19,
        })
        .onConflictDoUpdate({
          target: badgeDefinitionsTable.slug,
          set: {
            name: COURSE_META.badgeName,
            description: COURSE_META.badgeDescription,
            courseIds: [courseId],
          },
        });

      // 10. Save seed marker version
      if (!existingSeed) {
        await tx.insert(systemSeedsTable).values({
          name: SEED_NAME,
          version: 2,
        });
      } else {
        await tx.update(systemSeedsTable).set({ version: 2 }).where(eq(systemSeedsTable.name, SEED_NAME));
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Setting Departmental Sustainability Goals course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Setting Departmental Sustainability Goals course");
  }
}
