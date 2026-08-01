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

const COURSE_SLUG = "building-employee-engagement-in-sustainability";
const COURSE_TITLE = "Building Employee Engagement in Sustainability";
const BADGE_SLUG = "sustainability-engagement-practitioner";
const SEED_NAME = "employee-sustainability-engagement-v2";

const COURSE_META = {
  courseCode: "ELH-21",
  description:
    "Learn how to build meaningful workplace participation in sustainability without relying on guilt, token campaigns, forced enthusiasm, or shifting management responsibilities onto staff.",
  fullDescription:
    "Low participation in sustainability initiatives rarely stems from employee indifference; it usually reflects operational barriers, poor access, lack of shift inclusion, or missing follow-through. This course teaches managers, sustainability leads, and workplace representatives how to identify participation barriers, design role-relevant contribution channels, create psychological safety, establish visible feedback loops, and maintain sustained participation across all shifts and roles.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/building-employee-engagement-in-sustainability.jpg",
  intendedRoles: ["employees", "supervisors", "managers", "sustainability coordinators", "green-team members", "HR and administration staff", "frontline and shift leads"],
  learningObjectives: [
    "Distinguish passive awareness and meeting attendance from active participation and sustained behavior change.",
    "Identify operational, shift-based, digital, and cultural barriers to employee participation.",
    "Apply the INVOLVE operational framework (Identify barriers, Name purpose, Vary channels, Open safe feedback, Link to owners, Verify changes, Explain response).",
    "Design role-relevant contribution opportunities for frontline, shift, remote, and non-desk workers.",
    "Establish transparent feedback loops and visible follow-through on employee suggestions."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations! You have completed Building Employee Engagement in Sustainability. You can now identify participation barriers, design inclusive contribution channels, manage transparent feedback loops, and build sustained workplace involvement without relying on guilt or token campaigns.",
  badgeName: "Sustainability Engagement Practitioner",
  badgeDescription:
    "Awarded for demonstrating operational mastery of employee sustainability engagement, barrier removal, frontline inclusion, and transparent feedback loops.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Low Participation Is Rarely Indifference",
    minutes: 3,
    content: "Understand why low employee campaign uptake stems from operational barriers, shift exclusion, or lack of follow-through rather than staff apathy.",
    blocks: [
      { id: "ee1-h1", type: "heading", position: 1, headingText: "Look Beyond Surface Indifference" },
      { id: "ee1-t1", type: "short_text", position: 2, bodyText: "A resort launches a 'Green Month' campaign. Posters ask staff to save water, switch off equipment, sort waste correctly, and submit ideas via a QR code for a prize. At month-end, participation is under 10%. Management concludes: 'Employees do not care about sustainability.' However: Housekeeping staff have no smartphones or shift time to scan QR codes; Kitchen staff lack labeled sorting bins; Maintenance submitted 3 water leak reports weeks ago with no response; Night-shift staff were omitted from briefings. Low participation reflects access barriers, unaddressed infrastructure gaps, and broken feedback loops—not employee apathy." },
      { id: "ee1-k1", type: "key_message", position: 3, headingText: "The Engagement Principle", bodyText: "Informing delivers a message; Engagement enables people to participate meaningfully. Remove operational barriers and establish visible follow-through before judging employee motivation." },
      {
        id: "ee1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Diagnosing Campaign Failure:",
        decisionPrompt: "A factory warehouse idea-box campaign yields zero submissions from shift workers after two weeks. What is the correct management investigation?",
        decisionChoices: [
          { label: "Conduct brief verbal shift huddles to check whether workers have time, access, and clear instructions to submit ideas, and check if past suggestions were answered", correct: true, feedback: "Correct! Investigating shift barriers, access methods, and past follow-through identifies the real causes of low participation." },
          { label: "Post a stricter notice warning that sustainability idea submission is mandatory for annual bonuses", correct: false, feedback: "Incorrect. Forcing submissions through penalties creates cynical compliance without improving ideas or systems." },
          { label: "Cancel all sustainability initiatives and announce that warehouse staff are uncooperative", correct: false, feedback: "Incorrect. Blaming staff for systemic communication and shift access barriers destroys trust." }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Why Engagement Matters & Essential Vocabulary",
    minutes: 3,
    content: "Explore the operational benefits of frontline participation and master 50+ engagement terms.",
    blocks: [
      { id: "ee2-h1", type: "heading", position: 1, headingText: "Frontline Insights & Engagement Vocabulary" },
      { id: "ee2-t1", type: "short_text", position: 2, bodyText: "Frontline employees see daily operational waste, equipment leaks, and procedural flaws long before management. Engaging staff builds realistic procedures, speeds up problem identification, and maintains momentum after launch events." },
      {
        id: "ee2-k1",
        type: "key_message",
        position: 3,
        headingText: "Core Engagement Vocabulary",
        bodyText: "• Awareness vs Engagement: Awareness = reading a poster; Engagement = actively shaping and applying workplace practices.\n• Attendance vs Participation: Mandatory presence at a briefing vs active contribution of frontline insights.\n• Barrier vs Enabler: An obstacle (no time, no tools) vs an facilitating condition (verbal huddles, shift time).\n• Psychological Safety: Workplace culture where employees can raise concerns or point out leaks without fear of blame.\n• Feedback Loop: Explaining to staff who reviewed their idea, what decision was made, and why.\n• Initiative Fatigue: Exhaustion caused by repeated short-term promotional campaigns with no lasting follow-through.\n• Token Participation: Superficial photo-ops or suggestion boxes that lead to no operational changes."
      },
      {
        id: "ee2-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Awareness & Communication Standards)",
        bodyText: "Employees are more able to contribute when they understand what is expected, have a realistic opportunity to participate, and receive feedback on what happens after they raise an idea or concern.\n\nManagement-system standards (ISO 14001 Clause 7.3/7.4 & ISO 9001 Clause 7.3) emphasize that effective awareness requires two-way communication channels and operational support rather than one-way top-down announcements."
      }
    ]
  },
  {
    order: 2,
    title: "The INVOLVE Operational Framework",
    minutes: 4,
    content: "Master the 7-step INVOLVE framework for practical employee participation.",
    blocks: [
      { id: "ee3-h1", type: "heading", position: 1, headingText: "The INVOLVE Operational Framework" },
      { id: "ee3-t1", type: "short_text", position: 2, bodyText: "Use the INVOLVE framework to build inclusive, barrier-free participation across all departments:" },
      {
        id: "ee3-k1",
        type: "key_message",
        position: 3,
        headingText: "INVOLVE Framework Breakdown",
        bodyText: "• I — Identify relevant employees & barriers: Ask who is affected and what blocks them (shift time, tools).\n• N — Name practical purpose & expected contribution: Define clear, role-specific participation requests.\n• V — Vary participation methods for different roles: Combine verbal huddles, paper slips, and mobile forms.\n• O — Open safe channels for ideas, concerns & disagreement: Protect staff who report leaks or flaws.\n• L — Link employee input to owners, decisions & resources: Assign every valid suggestion to a named lead.\n• V — Verify what changed & what remains unresolved: Track implementation and test pilot changes.\n• E — Explain response & maintain follow-through: Provide clear feedback even when ideas are declined."
      },
      {
        id: "ee3-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Practice: Role-Relevant Participation Requests",
        decisionPrompt: "A hotel sustainability lead wants to engage kitchen staff in waste reduction. Which request is most effective?",
        decisionChoices: [
          { label: "Ask kitchen staff during daily shift huddles which prep stations generate the most food trim waste and test a revised prep bin layout together", correct: true, feedback: "Correct! Asking specific, role-relevant questions during normal shift routines yields actionable frontline solutions." },
          { label: "Send an email asking kitchen staff to write an essay on global food security", correct: false, feedback: "Incorrect. Academic essays are irrelevant to kitchen shift operations and create literacy barriers." },
          { label: "Put up a poster in the dining room telling chefs to be more careful", correct: false, feedback: "Incorrect. Passive, preachy posters do not provide practical tools or invite constructive feedback." }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Visual Campaign Inspection & High-Risk Mistakes",
    minutes: 4,
    content: "Inspect a breakroom campaign feedboard and review critical safeguards.",
    blocks: [
      { id: "ee4-h1", type: "heading", position: 1, headingText: "Visual Employee Campaign Board Inspection" },
      { id: "ee4-t1", type: "short_text", position: 2, bodyText: "Examine the breakroom campaign feedboard (`visual-sustainability-employee-engagement.png`). Observe how red sticky notes highlight campaign defects: QR code as sole submission method (excluding staff without smartphones), participation deadline during peak operational shift, 'Lowest-Performing Department' public ranking wall (demoralizing staff), employee suggestions marked 'Received' with no assigned owner or date, night shift omitted, prize based solely on volume of ideas, missing infrastructure reported by staff but unresolved, and meeting attendance figures presented as proof of engagement." },
      {
        id: "ee4-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-sustainability-employee-engagement.png",
        caption: "Sustainability Campaign & Employee Feedboard: Displaying QR-code exclusion, shift timing flaws, public shaming leaderboards, and unresolved infrastructure reports.",
        imageAlt: "Realistic photograph of a Mauritian commercial workplace breakroom with a poster board titled Sustainability Campaign & Employee Feedboard showing highlighted defects like QR code only, bad shift timing, public ranking, and unresolved infrastructure reports."
      },
      {
        id: "ee4-k1",
        type: "key_message",
        position: 4,
        headingText: "High-Risk Engagement Mistakes to Avoid",
        bodyText: "• DO NOT rely on QR codes or digital forms as the sole submission method for non-desk or shift workers.\n• DO NOT publish 'lowest-performing' department rankings that publicly embarrass teams.\n• DO NOT launch new idea competitions while ignoring previously reported equipment leaks or broken bins.\n• DO NOT confuse high meeting attendance with active engagement or environmental behavior change.\n• DO NOT use guilt-driven, patronizing, or childish language in workplace communications."
      }
    ]
  },
  {
    order: 4,
    title: "Worked Mauritian Scenario & Applied Decision",
    minutes: 2,
    content: "Study a resort engagement feedback log and solve an applied warehouse decision.",
    blocks: [
      { id: "ee5-h1", type: "heading", position: 1, headingText: "Worked Scenario: Grand Baie Resort Engagement Log" },
      {
        id: "ee5-w1",
        type: "workplace_example",
        position: 2,
        headingText: "Transparent Feedback Loop Log",
        bodyText: "A Grand Baie resort tracks 4 employee suggestions across departments:\n1. Housekeeping: Request for smaller laundry cart bins to sort plastic bottles on guest floors | Status: Accepted | Action: Purchasing 20 trolley caddies by 15 July | Feedback: Shared in huddle.\n2. Kitchen: Suggestion to install motion sensors in walk-in chillers | Status: Pilot Approved | Action: Maintenance Lead testing 1 sensor in main kitchen.\n3. Maintenance: Request for digital water meter logging tablet | Status: Declined with Reason | Feedback: Current paper logs are working well; funds prioritized for pipe repair.\n4. Night Shift Security: Report of main gate floodlights left on past sunrise | Status: Accepted | Action: Timer reset assigned to Facilities."
      },
      {
        id: "ee5-d1",
        type: "decision_scenario",
        position: 3,
        decisionIntro: "Applied Warehouse Engagement Decision:",
        decisionPrompt: "Only 12% of warehouse staff completed an online sustainability survey. Investigation shows workers lack computer access during shifts and feel past packaging feedback was ignored. What is the correct management response?",
        decisionChoices: [
          { label: "Introduce 5-minute verbal shift huddles, record packaging feedback on a breakroom board, assign owners to valid ideas, and post visible monthly status updates", correct: true, feedback: "Outstanding! Removing digital access barriers and establishing visible feedback huddles restores trust and engagement." },
          { label: "Offer a raffle ticket for a TV to anyone who completes the online survey by Friday", correct: false, feedback: "Incorrect. Raffles do not fix the lack of computer access during shifts or restore broken feedback loops." },
          { label: "Make survey completion mandatory and discipline supervisors whose teams do not submit", correct: false, feedback: "Incorrect. Punishing staff for management-created access barriers destroys morale." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Engagement Commitment & Badge",
    minutes: 2,
    content: "Select your daily engagement commitments and complete the course.",
    blocks: [
      { id: "ee6-h1", type: "heading", position: 1, headingText: "Engagement Commitment" },
      { id: "ee6-t1", type: "short_text", position: 2, bodyText: "Select the engagement practices you pledge to apply in your workplace." },
      {
        id: "ee6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your engagement commitments (choose at least one):",
        commitmentOptions: [
          { value: "identify-barriers-first", label: "Investigate shift, tool, and time barriers before judging employee participation levels", description: "Focus on systemic barrier removal." },
          { value: "inclusive-channels", label: "Provide verbal, paper, and mobile contribution channels for frontline and shift workers", description: "Ensure access for all roles." },
          { value: "visible-feedback-loops", label: "Provide clear, respectful feedback on every employee suggestion (accepted, pilot, or declined)", description: "Build trust through transparent responses." },
          { value: "fix-infrastructure-first", label: "Resolve reported equipment leaks and missing bins before asking staff for new ideas", description: "Demonstrate management commitment." }
        ]
      },
      {
        id: "ee6-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Practical Disclaimer",
        bodyText: "DISCLAIMER: This course provides practical workplace guidance on employee engagement in sustainability. It does not provide legal advice, employee-relations certification, independent assurance, or verification of an organization's environmental performance or workplace culture."
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "Why is low employee participation in a sustainability initiative rarely proof of employee indifference?",
    options: [
      "Because low participation usually reflects operational barriers, shift exclusion, lack of tool access, or missing feedback on past suggestions",
      "Because employees always complete every corporate campaign enthusiastically",
      "Because sustainability is legally mandatory for all employees in Mauritius",
      "Because participation figures are calculated by external software"
    ],
    correct: 0,
    correctExplanation: "Low participation stems from systemic barriers, shift exclusion, or lack of follow-through rather than apathy.",
    incorrectExplanation: "Incorrect. Systemic barriers, shift timing, or broken feedback loops cause low participation."
  },
  {
    order: 2,
    question: "What does the 'I' in the INVOLVE operational framework stand for in the first step?",
    options: [
      "Identify relevant employees & barriers (ask who is affected and what blocks them, such as shift time or tools)",
      "Ignore frontline employee concerns until management demands an update",
      "Issue financial penalties to staff who do not attend voluntary briefings",
      "Inspect employee personal lockers for uncycled paper"
    ],
    correct: 0,
    correctExplanation: "I = Identify relevant employees & barriers before launching campaigns.",
    incorrectExplanation: "Incorrect. I = Identify relevant employees & barriers."
  },
  {
    order: 3,
    question: "What is the key difference between PASSIVE AWARENESS and ACTIVE ENGAGEMENT?",
    options: [
      "Awareness means receiving information (e.g. Reading a poster); Engagement means actively shaping, contributing to, and applying workplace practices",
      "Awareness applies to managers; Engagement applies to interns",
      "Awareness is used in summer; Engagement is used in winter",
      "Awareness and Engagement are exact synonyms in human resources"
    ],
    correct: 0,
    correctExplanation: "Awareness = receiving info; Engagement = active participation and shaping workplace practices.",
    incorrectExplanation: "Incorrect. Awareness is passive receipt; Engagement is active participation and practice application."
  },
  {
    order: 4,
    question: "In the visual breakroom feedboard (`visual-sustainability-employee-engagement.png`), why is offering a QR code as the sole submission method a flaw?",
    options: [
      "Because frontline and shift workers without smartphones or desk computers are excluded from participating",
      "Because QR codes are illegal in commercial breakrooms",
      "Because QR codes can only be scanned during rainstorms",
      "Because poster boards cannot support digital printing"
    ],
    correct: 0,
    correctExplanation: "QR-code-only channels exclude non-desk, frontline, and shift workers who lack smartphones or email access.",
    incorrectExplanation: "Incorrect. Single digital channels exclude non-desk and shift workers."
  },
  {
    order: 5,
    question: "Why should public leaderboards ranking 'Lowest-Performing Departments' be avoided in employee engagement?",
    options: [
      "Because public shaming demoralizes teams, creates hostility between departments, and discourages honest reporting of operational problems",
      "Because leaderboards require too much ink to print",
      "Because departments are not allowed to compare results",
      "Because public rankings automatically trigger union audits"
    ],
    correct: 0,
    correctExplanation: "Public shaming demoralizes staff and causes teams to hide operational flaws; positive recognition of collaborative effort is effective.",
    incorrectExplanation: "Incorrect. Public shaming demoralizes teams and encourages hiding operational flaws."
  },
  {
    order: 6,
    question: "What is a FEEDBACK LOOP in employee sustainability engagement?",
    options: [
      "Explaining to employees who reviewed their idea, what decision was made (accepted, pilot, or declined), and why",
      "Sending monthly marketing newsletters to external customers",
      "Repeating the same training video every week",
      "Installing loudspeakers in the staff cafeteria"
    ],
    correct: 0,
    correctExplanation: "A feedback loop ensures every employee suggestion receives a transparent, respectful response.",
    incorrectExplanation: "Incorrect. Feedback loop = explaining to staff what decision was made on their input and why."
  },
  {
    order: 7,
    question: "Why should management resolve reported equipment leaks or missing bins before asking staff for new sustainability ideas?",
    options: [
      "Because asking for new ideas while ignoring basic infrastructure failures undermines management credibility and creates initiative fatigue",
      "Because new ideas are forbidden until all repairs are finished",
      "Because equipment leaks are illegal under commercial building codes",
      "Because bins must be imported from abroad"
    ],
    correct: 0,
    correctExplanation: "Fixing known operational defects demonstrates management commitment before requesting new employee ideas.",
    incorrectExplanation: "Incorrect. Ignoring existing reported defects destroys management credibility."
  },
  {
    order: 8,
    question: "How can line managers and shift supervisors enable frontline employee participation?",
    options: [
      "By dedicating 5 minutes during shift huddles, modeling expected behaviors, and escalating unresolved equipment barriers to management",
      "By ordering staff to complete surveys during their unpaid lunch breaks",
      "By forbidding staff from discussing waste during work hours",
      "By taking credit for frontline ideas on executive reports"
    ],
    correct: 0,
    correctExplanation: "Supervisors enable participation by integrating huddles into shift time, removing barriers, and listening.",
    incorrectExplanation: "Incorrect. Supervisors enable participation during normal shift routines and huddles."
  },
  {
    order: 9,
    question: "How does ELH-21 (Employee Engagement) connect to ELH-22 (Effective Green Teams)?",
    options: [
      "ELH-21 builds widespread workforce participation; ELH-22 equips formal green team members to facilitate and sustain those engagement routines over time",
      "ELH-21 replaces green teams so formal committees are no longer needed",
      "ELH-21 is for office staff; ELH-22 is for external auditors",
      "There is no connection between engagement and green teams"
    ],
    correct: 0,
    correctExplanation: "ELH-21 engages the general workforce; ELH-22 guides green teams in sustaining engagement long-term.",
    incorrectExplanation: "Incorrect. ELH-21 builds general engagement; ELH-22 equips green teams to facilitate it."
  },
  {
    order: 10,
    question: "What is the primary takeaway of the INVOLVE Operational Framework?",
    options: [
      "Applying INVOLVE (Identify barriers, Name purpose, Vary channels, Open safe feedback, Link to owners, Verify changes, Explain response) ensures inclusive participation",
      "Employee engagement should rely on guilt-driven posters and mandatory prizes",
      "Management should shift all environmental responsibilities onto frontline staff",
      "Participation rates prove environmental performance without needing physical data"
    ],
    correct: 0,
    correctExplanation: "INVOLVE ensures structured, barrier-free, and respectful employee participation with visible follow-through.",
    incorrectExplanation: "Incorrect. INVOLVE provides structured discipline for inclusive workplace participation and follow-through."
  }
];

export async function ensureEmployeeSustainabilityEngagementCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 21 by courseCode "ELH-21" or slug
      let course = null;

      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-21"))
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
        throw new Error("Course ELH-21 / building-employee-engagement-in-sustainability not seeded by catalogue skeletons bootstrap!");
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
        logger.info({ courseId, slug: COURSE_SLUG }, "Employee Sustainability Engagement course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course ELH-21. Re-seeding course content, lessons, and 10 quiz questions transactionally...");

      // 4. Resolve next recommended course dynamically (ELH-22 or null if not yet seeded)
      const [course22] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.slug, "effective-green-teams-and-sustainability-committees"))
        .limit(1);
      const nextCourseId = course22 ? course22.id : null;

      // 5. Update course record metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-21",
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

      // 8. Enforce prerequisite entries in coursePrerequisitesTable (ELH-12 through ELH-20 -> ELH-21)
      const prereqs = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(inArray(coursesTable.slug, [
          "final-sustainability-certification",
          "sustainability-action-planning",
          "setting-departmental-sustainability-goals",
          "building-workplace-sustainability-team",
          "communicating-sustainability-at-work",
          "tracking-sustainability-actions-and-progress",
          "sustainability-data-collection-and-evidence",
          "reviewing-sustainability-performance-and-corrective-action",
          "sustainability-roles-responsibilities-and-accountability"
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
          icon: "heart",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 26,
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

      logger.info({ courseId, slug: COURSE_SLUG }, "Employee Sustainability Engagement course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Employee Sustainability Engagement course");
  }
}
