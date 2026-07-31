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

const COURSE_SLUG = "sustainability-action-planning";
const COURSE_TITLE = "Sustainability Action Planning";
const BADGE_SLUG = "sustainability-action-planner";
const SEED_NAME = "sustainability-action-planning-v2";

const COURSE_META = {
  courseCode: "ELH-13",
  description:
    "Learn how to turn a general sustainability concern into a practical, owned, and measurable workplace action plan.",
  fullDescription:
    "Good intentions do not automatically create results. This course shows learners how to define a specific workplace issue, establish a starting point using available evidence, choose realistic actions, assign accountable ownership, set target dates, and identify clear ways to review progress. Recommended for employees, supervisors, managers, and sustainability champions.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainability-action-planning.jpg",
  intendedRoles: ["employees", "supervisors", "managers", "sustainability champions"],
  learningObjectives: [
    "Distinguish an issue, objective, action, output, outcome, indicator, and action owner.",
    "Define a specific, realistic, and time-bound workplace sustainability objective.",
    "Apply the DEFINE–PLAN–ASSIGN–EVIDENCE–REVIEW operational action-planning framework.",
    "Avoid high-risk mistakes such as guessing baselines, missing assigned owners, or hiding delayed progress.",
    "Construct a concise workplace action-plan record suitable for management review."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations! You have passed Sustainability Action Planning. You can now define a specific workplace issue, establish baseline evidence, assign accountable owners, set review dates, and track practical results.",
  badgeName: "Sustainability Action Planner",
  badgeDescription:
    "Awarded for demonstrating the ability to turn a general workplace sustainability issue into a practical, owned, and measurable action plan.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "From Intention to Action",
    minutes: 3,
    content: "Understand why vague workplace intentions frequently fail and how structured action plans produce results.",
    blocks: [
      { id: "ap1-h1", type: "heading", position: 1, headingText: "The Workplace Action Gap" },
      { id: "ap1-t1", type: "short_text", position: 2, bodyText: "General sustainability slogans such as 'be greener' or 'save energy' express positive intentions, but they fail to produce sustained results because they leave essential operational questions unanswered: Where is the issue? Who owns the work? What specific result is expected? When will progress be reviewed?" },
      { id: "ap1-k1", type: "key_message", position: 3, headingText: "The Core Principle", bodyText: "Good intentions without a clear plan, named owner, target date, and verifiable evidence rarely produce lasting workplace change." },
      {
        id: "ap1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Mauritian Workplace Scenario (Ebène Cybercity):",
        decisionPrompt: "A commercial building management team notices rising electricity costs and sends a general email saying 'Everyone please save power.' After three months, power bills remain unchanged. Why did this approach fail?",
        decisionChoices: [
          { label: "The request was a broad intention without specific target areas, assigned equipment owners, or review dates", correct: true, feedback: "Correct! Broad requests without specific targets or assigned owners rarely change workplace operational habits." },
          { label: "Employees intentionally ignored the email because they prefer high energy bills", correct: false, feedback: "Incorrect. The failure stems from vague guidance and lack of ownership, not deliberate bad intent." },
          { label: "Electricity in Mauritius cannot be reduced under any circumstances", correct: false, feedback: "Incorrect. Operational energy efficiency can be measured and reduced with clear action plans." }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Why Action Planning Matters & Core Vocabulary",
    minutes: 4,
    content: "Explore the operational value of action plans and master plain-language action planning terminology.",
    blocks: [
      { id: "ap2-h1", type: "heading", position: 1, headingText: "Operational Value & Vocabulary" },
      { id: "ap2-t1", type: "short_text", position: 2, bodyText: "Action planning converts open discussion into clear responsibility. It prevents duplicated effort, identifies operational constraints early, and creates an audit trail of agreed improvements." },
      {
        id: "ap2-k1",
        type: "key_message",
        position: 3,
        headingText: "Action-Planning Terminology",
        bodyText: "• Issue: The specific observed problem (e.g. food waste contaminating paper bins).\n• Baseline: The current starting measurement or condition before action.\n• Objective: The specific, time-bound result to be achieved.\n• Action: The practical steps required to reach the objective.\n• Output: The completed task (e.g. 5 bin signs installed).\n• Outcome: The actual change achieved (e.g. bin contamination reduced by 80%).\n• Action Owner: The single named person accountable for ensuring completion.\n• Indicator & Evidence: The source of data confirming whether the action worked."
      },
      {
        id: "ap2-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "According to ISO 14001 Environmental Management Standards and the UN Global Compact, organizations that convert general environmental intentions into structured action plans with named owners and review dates increase project completion rates by over 70%!"
      }
    ]
  },
  {
    order: 2,
    title: "The EcoLearnHub Action-Planning Framework",
    minutes: 4,
    content: "Master the 5-step operational framework: DEFINE – PLAN – ASSIGN – EVIDENCE – REVIEW.",
    blocks: [
      { id: "ap3-h1", type: "heading", position: 1, headingText: "The 5-Step Operational Framework" },
      { id: "ap3-t1", type: "short_text", position: 2, bodyText: "Use this 5-step framework to guide every workplace sustainability project:" },
      {
        id: "ap3-k1",
        type: "key_message",
        position: 3,
        headingText: "DEFINE – PLAN – ASSIGN – EVIDENCE – REVIEW",
        bodyText: "1. DEFINE: State the specific workplace issue, baseline condition, and target objective.\n2. PLAN: Outline realistic step-by-step tasks, required resources, and target dates.\n3. ASSIGN: Name one accountable action owner and identify supporting roles.\n4. EVIDENCE: Decide what data or logs will verify that tasks were completed.\n5. REVIEW: Compare results with the objective at scheduled intervals and adjust if needed."
      },
      {
        id: "ap3-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Practice: Objective vs Action",
        decisionPrompt: "A team leader writes: 'Install 10 LED light fixtures in the warehouse.' Is this an objective or an action?",
        decisionChoices: [
          { label: "It is an ACTION (a specific task step taken to achieve an energy-reduction objective)", correct: true, feedback: "Correct! Installing lights is a task/action step. The objective is the broader result (e.g., reduce warehouse lighting energy by 25%)." },
          { label: "It is an OBJECTIVE because it contains a number", correct: false, feedback: "Incorrect. A task specification is an action step, not the ultimate result objective." },
          { label: "It is an OUTCOME because the lights are installed", correct: false, feedback: "Incorrect. The physical installation is an output; the outcome is energy saved." }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Visual Action Board & High-Risk Mistakes",
    minutes: 4,
    content: "Inspect a realistic Mauritian workplace action planning board and review critical safeguards.",
    blocks: [
      { id: "ap4-h1", type: "heading", position: 1, headingText: "Visual Action Plan Board Inspection" },
      { id: "ap4-t1", type: "short_text", position: 2, bodyText: "Examine the Mauritian workplace planning board image below. Notice how vague handwritten sticky notes are replaced by structured cards containing clear objectives, named owners (Sheila K., Raj S.), target dates, evidence sources, and status columns." },
      {
        id: "ap4-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-sustainability-action-planning.png",
        caption: "Action Planning Board: Clear headers (Issue/Baseline, Objective, Assigned Owner, Target Date, Evidence, Status) replacing vague sticky notes.",
        imageAlt: "Realistic photograph of a Mauritian commercial workplace planning room with a large whiteboard displaying an action plan table with columns for Issue, Objective, Assigned Action Owner with staff photos and names, Target Date, Evidence, and Status, while a facility manager and team leader review tablet data together."
      },
      {
        id: "ap4-k1",
        type: "key_message",
        position: 4,
        headingText: "High-Risk Mistakes to Avoid",
        bodyText: "• DO NOT guess missing baseline figures; record available data and declare gaps honestly.\n• DO NOT assign responsibility to a general department; always name an accountable individual.\n• DO NOT confuse completed activity (output) with measured improvement (outcome).\n• DO NOT hide project delays; communicate obstacles early and adjust target dates."
      }
    ]
  },
  {
    order: 4,
    title: "Worked Scenario & Applied Decision",
    minutes: 3,
    content: "Study a complete worked scenario for a Mauritian hotel waste station and make an applied data gap decision.",
    blocks: [
      { id: "ap5-h1", type: "heading", position: 1, headingText: "Worked Scenario: Hotel Waste Station Contamination" },
      {
        id: "ap5-w1",
        type: "workplace_example",
        position: 2,
        headingText: "Worked Action Plan Example",
        bodyText: "• Issue: Staff dining waste sorting stations show 40% food contamination in paper bins.\n• Baseline: 4 out of 10 paper bags rejected by collector per week.\n• Objective: Reduce paper bin contamination from 40% to under 5% within 6 weeks.\n• Action Steps: Install bilingual Creole/English icon labels, conduct 5-minute shift briefings, place food scrap bins closer to plates.\n• Owner: Housekeeping Supervisor (Rajen P.).\n• Evidence: Weekly audit logs by shift lead + collector acceptance receipts.\n• Review Date: Every Friday for 6 weeks."
      },
      {
        id: "ap5-d1",
        type: "decision_scenario",
        position: 3,
        decisionIntro: "Applied Coordinator Decision (Missing Baseline Data):",
        decisionPrompt: "A facilities coordinator is asked to create an action plan to cut meeting room electricity, but no sub-metering data exists. What is the most responsible action?",
        decisionChoices: [
          { label: "Record the current data limitation, establish a 2-week baseline check of room occupancy vs lights/AC state, implement no-cost shutdown checks, and set a review date", correct: true, feedback: "Outstanding! Acknowledging data gaps, establishing an initial observational baseline, and scheduling a review protects plan integrity." },
          { label: "Invent baseline numbers to make the action plan look complete immediately", correct: false, feedback: "NEVER invent baseline numbers! Falsifying baseline data destroys audit credibility." },
          { label: "Refuse to take any action until management spends $50,000 on digital meters", correct: false, feedback: "Incorrect. Observational baselines and no-cost controls can begin immediately." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Action Planning Commitment & Badge",
    minutes: 3,
    content: "Select your daily workplace action planning commitments and complete the course.",
    blocks: [
      { id: "ap6-h1", type: "heading", position: 1, headingText: "Workplace Action Commitment" },
      { id: "ap6-t1", type: "short_text", position: 2, bodyText: "Select the action-planning habits you pledge to practice in your daily work routine." },
      {
        id: "ap6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your action planning commitments (choose at least one):",
        commitmentOptions: [
          { value: "define-clear-objectives", label: "Define specific, time-bound objectives rather than vague intentions", description: "Turn broad ideas into measurable goals." },
          { value: "assign-named-owners", label: "Assign one accountable named individual for every action step", description: "Ensure clear responsibility and follow-through." },
          { value: "use-verifiable-evidence", label: "Base progress reviews on verifiable logs, receipts, or data rather than assumptions", description: "Maintain honest audit-ready evidence." },
          { value: "review-and-adjust", label: "Schedule regular review dates and adjust plans transparently when delays occur", description: "Support continual improvement and open communication." }
        ]
      },
      {
        id: "ap6-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Practical Disclaimer",
        bodyText: "DISCLAIMER: The EcoLearnHub Action-Planning Framework is an operational learning tool for workplace projects. It does not replace statutory environmental management systems, official legal compliance procedures, or HRDC statutory requirements."
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "Why do broad intentions like 'be more sustainable' frequently fail to produce workplace results?",
    options: [
      "Because they lack specific focus areas, assigned owners, target dates, and verifiable evidence",
      "Because employees in Mauritius do not care about environmental issues",
      "Because sustainability actions require a government decree for every step",
      "Because power and water cannot be managed in commercial buildings"
    ],
    correct: 0,
    correctExplanation: "Broad intentions fail because they do not define specific targets, accountable owners, or review dates.",
    incorrectExplanation: "Incorrect. Broad intentions lack specific targets, assigned owners, and review dates."
  },
  {
    order: 2,
    question: "In action planning terminology, what is the difference between an OUTPUT and an OUTCOME?",
    options: [
      "An output is the completed task (e.g. 5 signs installed); an outcome is the measured result achieved (e.g. 80% reduction in contamination)",
      "An output is a financial penalty; an outcome is a company speech",
      "An output is an unverified assumption; an outcome is a handwritten note",
      "There is no difference; output and outcome mean the exact same thing"
    ],
    correct: 0,
    correctExplanation: "Outputs are completed task activities; outcomes are the actual measured improvements achieved.",
    incorrectExplanation: "Incorrect. Output = completed task; Outcome = measured result."
  },
  {
    order: 3,
    question: "What does the 'ASSIGN' step in the DEFINE–PLAN–ASSIGN–EVIDENCE–REVIEW framework require?",
    options: [
      "Naming one accountable individual for each action step rather than assigning to a general department",
      "Assigning the work to a contractor without telling them",
      "Writing 'Everyone' as the owner on the action board",
      "Leaving the owner column blank until the project is finished"
    ],
    correct: 0,
    correctExplanation: "Assigning one named accountable owner ensures clear responsibility and accountability.",
    incorrectExplanation: "Incorrect. Name one accountable individual for every action step."
  },
  {
    order: 4,
    question: "Which of the following represents a SPECIFIC, USEFUL workplace sustainability objective?",
    options: [
      "Reduce avoidable paper bin contamination in staff dining areas from 40% to under 5% within 6 weeks",
      "Try to save some paper whenever possible",
      "Make the office 100% green by tomorrow morning",
      "Tell all employees to stop generating waste permanently"
    ],
    correct: 0,
    correctExplanation: "A useful objective is specific, measurable, realistic, and time-bound.",
    incorrectExplanation: "Incorrect. Objectives must be specific, measurable, and time-bound."
  },
  {
    order: 5,
    question: "What is the correct response when baseline measurement data for a project is currently missing?",
    options: [
      "Record the current data limitation, establish a short initial baseline observation period, and proceed transparently",
      "Invent fake baseline numbers to make the initial plan look complete",
      "Cancel the project permanently and delete the action plan",
      "Copy baseline figures from a completely different industry in another country"
    ],
    correct: 0,
    correctExplanation: "Documenting data gaps honestly and collecting initial baseline evidence maintains audit integrity.",
    incorrectExplanation: "Incorrect. Document data gaps honestly and establish an initial observation period."
  },
  {
    order: 6,
    question: "Why should an action plan include a scheduled REVIEW DATE?",
    options: [
      "To compare actual results against the objective, identify obstacles early, and adjust actions transparently",
      "To find out who to blame and fire when tasks are delayed",
      "To delete all previous records so no history remains",
      "Review dates are optional and add no value to workplace projects"
    ],
    correct: 0,
    correctExplanation: "Scheduled review dates enable continual improvement, obstacle identification, and transparent plan adjustment.",
    incorrectExplanation: "Incorrect. Review dates allow progress evaluation and corrective plan adjustments."
  },
  {
    order: 7,
    question: "In the visual action planning board (`visual-sustainability-action-planning.png`), why are handwritten sticky notes replaced by structured task cards?",
    options: [
      "To provide clear headers, named staff owners, target dates, verifiable evidence sources, and visible status tracking",
      "Because sticky notes are illegal in Mauritian offices",
      "Because printed cards automatically solve energy leaks without human action",
      "Because whiteboards can only hold printed paper"
    ],
    correct: 0,
    correctExplanation: "Structured task cards clarify owners, dates, evidence sources, and status, eliminating vague notes.",
    incorrectExplanation: "Incorrect. Structured task cards clarify owners, target dates, evidence, and status."
  },
  {
    order: 8,
    question: "Which of the following is a HIGH-RISK MISTAKE in workplace action planning?",
    options: [
      "Marking an action complete when only the task activity, not the actual result, was verified",
      "Recording baseline data before starting actions",
      "Setting a realistic 4-week review date",
      "Listing required resources before starting work"
    ],
    correct: 0,
    correctExplanation: "Marking tasks complete based solely on activity rather than verified results creates false progress claims.",
    incorrectExplanation: "Incorrect. Verify measured results, not just task completion."
  },
  {
    order: 9,
    question: "When should an action plan issue be ESCALATED to senior management or safety leads?",
    options: [
      "When the issue involves immediate chemical runoff, structural hazards, uncontained leaks, or legal compliance breaches",
      "Whenever a light bulb burns out in an empty hallway",
      "Whenever an employee asks for a new pencil",
      "Never escalate under any circumstances"
    ],
    correct: 0,
    correctExplanation: "Immediate pollution hazards, safety risks, or legal breaches require immediate escalation outside routine plans.",
    incorrectExplanation: "Incorrect. Escalate immediate safety, pollution, or compliance hazards immediately."
  },
  {
    order: 10,
    question: "What is the primary takeaway of the EcoLearnHub Action-Planning Framework?",
    options: [
      "Structured planning (DEFINE–PLAN–ASSIGN–EVIDENCE–REVIEW) converts sustainability ideas into owned, measurable workplace results",
      "Action planning is an academic exercise meant only for external consultants",
      "Any employee can make major structural building changes without approval",
      "Action plans guarantee 100% cost elimination in every facility"
    ],
    correct: 0,
    correctExplanation: "Structured action planning converts sustainability ideas into owned, evidence-backed workplace results.",
    incorrectExplanation: "Incorrect. DEFINE–PLAN–ASSIGN–EVIDENCE–REVIEW turns intentions into measurable results."
  }
];

export async function ensureActionPlanningCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 13 by courseCode "ELH-13" or slug
      let course = null;

      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-13"))
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
        throw new Error("Course ELH-13 / sustainability-action-planning not seeded by catalogue skeletons bootstrap!");
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
        logger.info({ courseId, slug: COURSE_SLUG }, "Sustainability Action Planning course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course ELH-13. Re-seeding course content, lessons, and 10 quiz questions transactionally...");

      // 4. Resolve next recommended course dynamically (ELH-14 conducting-a-workplace-waste-audit)
      const [course14] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.slug, "conducting-a-workplace-waste-audit"))
        .limit(1);
      const nextCourseId = course14 ? course14.id : null;

      // 5. Update course record metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-13",
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

      // 8. Enforce prerequisite entry in coursePrerequisitesTable (ELH-12 -> ELH-13)
      const [course12] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.slug, "final-sustainability-certification"))
        .limit(1);

      if (course12) {
        const [existingPrereq] = await tx
          .select()
          .from(coursePrerequisitesTable)
          .where(and(
            eq(coursePrerequisitesTable.courseId, courseId),
            eq(coursePrerequisitesTable.prerequisiteCourseId, course12.id)
          ))
          .limit(1);

        if (!existingPrereq) {
          await tx.insert(coursePrerequisitesTable).values({
            courseId,
            prerequisiteCourseId: course12.id,
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
          icon: "clipboard-list",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 18,
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

      logger.info({ courseId, slug: COURSE_SLUG }, "Sustainability Action Planning course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Sustainability Action Planning course");
  }
}
