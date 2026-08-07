import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_ID = 10;
const COURSE_SLUG = "environmental-compliance";
const COURSE_TITLE = "Environmental Compliance";
const BADGE_SLUG = "compliance-aware";
const SEED_NAME = "environmental-compliance-v2";
const SKELETON_BADGE_SLUG = "environmental-responsibility"; // catalogue skeleton slug — do not delete

const COURSE_META = {
  description:
    "Learn how environmental laws, permit conditions, company procedures, and operational records work together, and apply STOP–CHECK–CONTROL–RECORD–ESCALATE protocols safely.",
  fullDescription:
    "This course provides employees across all roles with a practical introduction to environmental compliance in Mauritian workplaces. Learn how statutory requirements, licence conditions, and site procedures connect to daily work, distinguish compliance tiers, preserve evidence, handle spills and contractor risks, and apply the STOP–CHECK–CONTROL–RECORD–ESCALATE protocol safely.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "1400.00",
  level: "ESG and Compliance",
  isFeatured: false,
  thumbnailUrl: "/images/courses/environmental-compliance.jpg",
  learningObjectives: [
    "Explain environmental compliance in plain workplace language.",
    "Distinguish between Legal Requirements, Permit Conditions, Company Procedures, and Good Practice.",
    "Identify common workplace situations that create environmental compliance obligations or runoff risks.",
    "Apply the 5-step STOP–CHECK–CONTROL–RECORD–ESCALATE operational protocol.",
    "Avoid high-risk mistakes such as backdating forms, inventing missing logs, or washing spills into storm drains.",
    "Evaluate role-based micro-decisions across general staff, facilities, procurement, operations, sales, managers, and contractors.",
    "Select one practical workplace compliance commitment to support accurate records and timely escalation."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "You have completed Environmental Compliance. You can now recognise environmental obligations, distinguish permit conditions from procedures, and apply STOP–CHECK–CONTROL–RECORD–ESCALATE protocols safely.",
  badgeName: "Environmental Compliance Awareness",
  badgeDescription:
    "Awarded for demonstrating practical workplace environmental compliance awareness, understanding permit conditions, preserving evidence, and escalating concerns correctly.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Understanding Workplace Environmental Obligations",
    minutes: 3,
    content: "Learn how environmental obligations apply to daily site operations and why guessing compliance data is dangerous.",
    blocks: [
      { id: "ec1-h1", type: "heading", position: 1, headingText: "Compliance Beyond Legal Jargon" },
      { id: "esg1-t1", type: "short_text", position: 2, bodyText: "On a Monday morning at a Mauritian commercial loading yard, a site worker notices an unlabelled blue chemical drum leaking fluid near an open storm drain cover, a contractor washing machinery into the drain, an incomplete waste transfer form, and a supervisor asking staff to 'copy last month's figures' for an upcoming inspection." },
      { id: "ec1-k1", type: "key_message", position: 3, headingText: "Compliance Is Operational Procedure, Not Guesswork", bodyText: "Environmental compliance means ensuring workplace activities meet established legal laws, site licence conditions, and internal company procedures. Employees do not need to be lawyers, but they must follow approved procedures, log exact facts, and escalate uncertainty." },
      {
        id: "ec1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Evaluating contractor drain scenario:",
        decisionPrompt: "A contractor is preparing to wash oily equipment into an external storm drain behind a facility, claiming 'the water will evaporate in minutes.' What is the correct response?",
        decisionChoices: [
          { label: "Ask the contractor to pause immediately if safe, protect the drain from runoff, and report the concern to the site supervisor", correct: true, feedback: "Correct! Pausing unapproved drain discharges prevents illegal chemical runoff into public waterways and coastal lagoons." },
          { label: "Allow the washing to continue because contractors are solely responsible for their own work", correct: false, feedback: "Incorrect! Companies share site responsibility for contractor activities occurring on their property." },
          { label: "Help the contractor wash the equipment faster so the drain clears before managers arrive", correct: false, feedback: "NEVER assist in illegal effluent discharge into public drains!" }
        ]
      },
      {
        id: "ec1-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "What is the scope and purpose of this Environmental Compliance course?",
        mcqOptions: [
          "To provide practical workplace awareness on following procedures, preserving evidence, and escalating concerns safely",
          "To certify employees as statutory environmental lawyers qualified to issue government court warrants",
          "To replace all company environmental permits with an online badge",
          "To guarantee that a company will never be inspected by local authorities"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "This course provides general workplace awareness for following procedures, preserving evidence, and escalating concerns safely.",
        mcqIncorrectExplanation: "Incorrect. General compliance training builds practical workplace awareness and reporting habits."
      }
    ]
  },
  {
    order: 1,
    title: "The 4 Tiers of Compliance Responsibility",
    minutes: 4,
    content: "Master the distinctions between Legal Requirements, Permit Conditions, Company Procedures, and Good Practice.",
    blocks: [
      { id: "ec2-h1", type: "heading", position: 1, headingText: "Four Levels of Compliance Expectations" },
      { id: "ec2-t1", type: "short_text", position: 2, bodyText: "Environmental compliance expectations fall into four distinct operational tiers:" },
      {
        id: "ec2-k1",
        type: "key_message",
        position: 3,
        headingText: "The Four Tiers",
        bodyText: "1. Legal Requirements: Statutory laws and national regulations (e.g. Environment Protection Act Mauritius bans unpermitted toxic discharges).\n2. Permit or Licence Conditions: Specific binding terms issued to a facility (e.g. EIA / PER licence specifying maximum wastewater discharge volumes).\n3. Company Procedures: Approved internal operational rules (e.g. mandatory chemical drum secondary containment and spill kit protocols).\n4. Good Practice: Voluntary actions exceeding minimum rules to improve environmental resilience."
      },
      {
        id: "ec2-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "Under the Environment Protection Act (EPA Mauritius) and local effluent discharge regulations, Environmental Impact Assessment (EIA) licences contain legally binding self-monitoring conditions. Failing to log required water, waste, or emissions data can trigger statutory stop-notices and severe corporate penalties!"
      }
    ]
  },
  {
    order: 2,
    title: "The STOP–CHECK–CONTROL–RECORD–ESCALATE Protocol",
    minutes: 4,
    content: "Inspect loading yard compliance risks and apply the 5-step operational protocol.",
    blocks: [
      { id: "ec3-h1", type: "heading", position: 1, headingText: "The 5-Step Operational Protocol" },
      { id: "ec3-t1", type: "short_text", position: 2, bodyText: "When encountering an environmental hazard, spill, or contractor risk, apply this 5-step protocol:" },
      {
        id: "ec3-k1",
        type: "key_message",
        position: 3,
        headingText: "STOP–CHECK–CONTROL–RECORD–ESCALATE",
        bodyText: "1. STOP: Pause an unsafe or non-compliant action safely.\n2. CHECK: Review labels, work permits, safety data sheets, or approved site procedures.\n3. CONTROL: Prevent pollution from spreading (e.g. deploy spill kit booms around drains) without taking personal safety risks.\n4. RECORD: Log exact facts, time, place, photos, and container labels accurately.\n5. ESCALATE: Inform the facility lead, environmental coordinator, or supervisor immediately."
      },
      {
        id: "ec3-img1",
        type: "visual_question",
        position: 4,
        imageUrl: "/images/courses/visual-environmental-compliance.png",
        caption: "Service Yard Inspection: Labelled hazardous waste drum on spill pallet (compliant), unlabelled blue drum on pavement leaking fluid near open storm drain (major risk), work permit clipboard, and worker logging photos.",
        imageAlt: "Realistic photograph of a Mauritian commercial service loading yard displaying a yellow hazardous waste drum on a spill pallet, an unlabelled blue drum leaking fluid on bare pavement near an open storm drain, a work permit clipboard, and a facility worker photographing the site to log evidence."
      },
      {
        id: "ec3-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "In the service yard inspection above, what is the most critical immediate action for the leaking blue drum?",
        mcqOptions: [
          "Deploy spill kit absorbent materials to block fluid from entering the open storm drain, log photos, and escalate to the facility lead",
          "Hose down the pavement so the leaking fluid disappears into the storm drain quickly",
          "Kick the drum over to empty it faster before an inspector arrives",
          "Ignore the drum because it has no label"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Preventing fluid from entering storm drains protecting aquatic habitats is top priority, followed by photo logging and escalation.",
        mcqIncorrectExplanation: "Incorrect. Block drains and control spills; never wash chemical leaks into stormwater drains."
      }
    ]
  },
  {
    order: 3,
    title: "Worked Scenario & Inspection Evidence",
    minutes: 4,
    content: "Analyze a worked Mauritian facility scenario and learn how to handle missing data before inspections.",
    blocks: [
      { id: "ec4-h1", type: "heading", position: 1, headingText: "Inspection Readiness & Record Integrity" },
      { id: "ec4-t1", type: "short_text", position: 2, bodyText: "Examine how a Mauritian manufacturing facility prepares for an environmental review:" },
      {
        id: "ec4-w1",
        type: "workplace_example",
        position: 3,
        headingText: "Worked Scenario: Pre-Inspection Audit Request",
        bodyText: "An environmental officer visits a site in 20 minutes. A supervisor asks a staff member to 'copy last month's waste transfer log numbers' because Q4 logs are missing.\n• WRONG ACTION: Copying old figures or backdating forms (Falsification breach).\n• CORRECT ACTION: Search approved archives for missing forms, present verified Q1–Q3 records honestly, declare the Q4 gap, and notify the environmental lead. Honesty preserves legal credibility!"
      },
      {
        id: "ec4-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Handling missing logs scenario:",
        decisionPrompt: "A contractor completes maintenance but forgets to sign the hazardous waste transfer receipt. How should the facility coordinator handle the document?",
        decisionChoices: [
          { label: "Contact the contractor supervisor to obtain the authorized signature and retain the unsigned form in a pending file with an explanatory note", correct: true, feedback: "Correct! Retaining an explanatory note preserves audit trail integrity without falsifying signatures." },
          { label: "Sign the contractor's name yourself so the file looks complete", correct: false, feedback: "NEVER forge or fake signatures on compliance documents! Forging signatures is illegal." },
          { label: "Throw the waste transfer form away so no one sees it was unsigned", correct: false, feedback: "NEVER destroy compliance paperwork! Destroying records violates waste transfer regulations." }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "High-Risk Mistakes & Role-Based Micro-Decisions",
    minutes: 3,
    content: "Avoid prohibited compliance actions and practice role-based decisions across operational departments.",
    blocks: [
      { id: "ec5-h1", type: "heading", position: 1, headingText: "Prohibited Compliance Actions" },
      { id: "ec5-t1", type: "short_text", position: 2, bodyText: "NEVER engage in these four high-risk operational behaviors:" },
      {
        id: "ec5-k1",
        type: "key_message",
        position: 3,
        headingText: "Prohibited Actions",
        bodyText: "• DO NOT invent figures, backdate forms, or falsify environmental logs.\n• DO NOT wash chemical spills, oil, or contaminated washwater into storm drains or soil.\n• DO NOT hide near-miss incidents, unlabelled containers, or contractor breaches.\n• DO NOT make absolute public claims like '100% Legally Compliant' without authorized legal verification."
      },
      {
        id: "ec5-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Facilities & Maintenance Micro-Decision:",
        decisionPrompt: "A maintenance technician replaces an AC cooling unit compressor and notices a small refrigerant gas leak, but the site supervisor says 'it is too small to report.' What should the technician do?",
        decisionChoices: [
          { label: "Log the exact leak location and quantity on the maintenance work order and report it to the environmental lead", correct: true, feedback: "Outstanding! Accurate logging and escalation ensure high-impact fluorinated refrigerant leaks are repaired promptly." },
          { label: "Ignore the leak because the supervisor told you it is small", correct: false, feedback: "Incorrect! Fluorinated refrigerants have extreme warming impacts and must be logged and repaired." },
          { label: "Cover the leaking pipe with duct tape and claim the repair is complete", correct: false, feedback: "Duct tape is not an approved refrigerant repair! Report and repair leaks properly." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Compliance Awareness Commitment & Disclaimer",
    minutes: 3,
    content: "Select practical daily workplace commitments and review the legal compliance awareness disclaimer.",
    blocks: [
      { id: "ec6-h1", type: "heading", position: 1, headingText: "Pledge to Act" },
      { id: "ec6-t1", type: "short_text", position: 2, bodyText: "Congratulations on completing the lessons! Select the compliance habits you commit to practice in your daily work routine." },
      {
        id: "ec6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your daily workplace environmental compliance commitments (choose at least one):",
        commitmentOptions: [
          { value: "apply-stop-check-control", label: "Apply the STOP–CHECK–CONTROL–RECORD–ESCALATE protocol for site environmental risks", description: "Pause unsafe actions, control runoff, and report concerns promptly." },
          { value: "never-falsify-logs", label: "Never invent figures, backdate forms, or falsify environmental records", description: "Support audit integrity with verified factual records." },
          { value: "protect-storm-drains", label: "Keep chemicals, oils, and washwater away from storm drains and unpaved soil", description: "Prevent illegal effluent discharges into public waterways." },
          { value: "verify-contractor-permits", label: "Check that contractors follow site environmental permits and work controls", description: "Ensure third-party site operations meet company standards." },
          { value: "escalate-unlabelled-containers", label: "Report unlabelled chemical containers and missing safety sheets immediately", description: "Eliminate chemical hazard risks in storage and loading areas." }
        ]
      },
      {
        id: "ec6-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Course Disclaimer",
        bodyText: "DISCLAIMER: This course provides general workplace awareness. Specific legal and permit requirements vary by facility, activity, and sector. Employees must follow their organisation's approved procedures and consult designated environmental leads or legal specialists for statutory interpretation."
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "What is the difference between a Legal Requirement and a Company Procedure?",
    options: [
      "Legal Requirements only apply to police officers; Company Procedures only apply to hotel guests",
      "Company Procedures override national laws whenever a deadline is near",
      "Legal Requirements are binding national laws (e.g. Environment Protection Act); Company Procedures are internal operational rules set by management to meet those laws and standards",
      "There is no difference; both are optional suggestions for office workers"
    ],
    correct: 2,
    correctExplanation: "Legal requirements are binding statutory laws; company procedures are internal rules designed to achieve compliance.",
    incorrectExplanation: "Incorrect. Laws are statutory rules; company procedures are internal operational controls."
  },
  {
    order: 2,
    question: "What is the first step in the STOP–CHECK–CONTROL–RECORD–ESCALATE protocol when observing an unapproved chemical spill near a drain?",
    options: [
      "STOP: Pause the unsafe or non-compliant activity safely to prevent further spill generation",
      "RECORD: Take 50 photos before telling anyone about the leak",
      "CONTROL: Wash the spill into the drain with a high-pressure hose",
      "ESCALATE: Post a public video online before talking to the site supervisor"
    ],
    correct: 0,
    correctExplanation: "The first step is STOP—pause the activity safely to prevent additional spill volume.",
    incorrectExplanation: "Incorrect. The first step in the protocol is STOP."
  },
  {
    order: 3,
    question: "Why should chemical spills or contaminated washwater NEVER be hosed into stormwater drains?",
    options: [
      "Hosing water into drains makes the pavement too clean for delivery trucks",
      "Stormwater drains discharge directly into rivers, groundwater, and lagoons without water treatment, causing severe environmental contamination",
      "Stormwater drains are reserved exclusively for drinking water storage",
      "Chemicals in storm drains automatically destroy solar panels"
    ],
    correct: 1,
    correctExplanation: "Storm drains lead untreated into waterways and lagoons; hosing chemicals into drains causes severe pollution.",
    incorrectExplanation: "Incorrect. Storm drains flow untreated into aquatic ecosystems; never wash chemicals into drains."
  },
  {
    order: 4,
    question: "An environmental inspector arrives in 15 minutes, but Q3 chemical disposal forms cannot be found. A supervisor tells you to 'guess the weights and sign for Q3.' What is the correct response?",
    options: [
      "Guess the numbers quickly and forge the contractor's signature so the file looks neat",
      "Delete all Q1 and Q2 records so the inspector has nothing to check",
      "Lock the office door and pretend no one is inside",
      "Refuse to invent figures or forge signatures; present available verified records, declare the data gap honestly, and notify the environmental lead"
    ],
    correct: 3,
    correctExplanation: "Falsifying data or forging signatures is illegal. Present verified records honestly and declare data gaps.",
    incorrectExplanation: "Incorrect. Never invent data or forge signatures; present verified records and declare gaps honestly."
  },
  {
    order: 5,
    question: "How does contractor management connect to a company's environmental compliance?",
    options: [
      "Contractors can do whatever they want on private property without rules",
      "Companies share responsibility for activities occurring on their property and must ensure contractors follow site environmental controls and permits",
      "Contractors automatically absorb all legal liability so companies never need site controls",
      "Contractors are exempt from environmental legislation in Mauritius"
    ],
    correct: 1,
    correctExplanation: "Companies maintain site oversight and must ensure third-party contractors comply with site permits and controls.",
    incorrectExplanation: "Incorrect. Companies must oversee contractors on their property to ensure environmental permit compliance."
  }
];

export async function ensureEnvironmentalComplianceCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 10 by courseCode "ELH-10", slug, or ID
      let course = null;
      
      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-10"))
        .limit(1);

      if (byCode) {
        course = byCode;
      } else {
        const [bySlug] = await tx
          .select()
          .from(coursesTable)
          .where(eq(coursesTable.slug, COURSE_SLUG))
          .limit(1);
        if (bySlug) {
          course = bySlug;
        } else {
          const [byId] = await tx
            .select()
            .from(coursesTable)
            .where(eq(coursesTable.id, COURSE_ID))
            .limit(1);
          course = byId ?? null;
        }
      }

      if (!course) {
        throw new Error("Course ELH-10 / environmental-compliance not seeded by catalogue skeletons bootstrap!");
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
      const hasMissingQuiz = existingQuizQuestions.length !== 5;
      const hasIncorrectSlug = course.slug !== COURSE_SLUG;

      const needsRepair = !existingSeed ||
                          hasMissingLessons ||
                          hasEmptyBlocks ||
                          hasMissingQuiz ||
                          hasIncorrectSlug;

      if (!needsRepair) {
        logger.info({ courseId, slug: COURSE_SLUG }, "Environmental Compliance course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course ELH-10. Re-seeding course content and lessons transactionally...");

      // 4. Resolve next recommended course dynamically by slug
      const [nextCourse] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.slug, "circular-economy-principles"))
        .limit(1);
      const nextCourseId = nextCourse?.id ?? null;

      // 5. Update course record slug, title, and metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-10",
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

      // 7. Seed/re-seed quiz questions
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

      // 8. Idempotently seed/update badge definition
      await tx
        .insert(badgeDefinitionsTable)
        .values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "shield-check",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 15,
        })
        .onConflictDoUpdate({
          target: badgeDefinitionsTable.slug,
          set: {
            name: COURSE_META.badgeName,
            description: COURSE_META.badgeDescription,
            courseIds: [courseId],
          },
        });

      // 9. Save seed marker version
      if (!existingSeed) {
        await tx.insert(systemSeedsTable).values({
          name: SEED_NAME,
          version: 2,
        });
      } else {
        await tx.update(systemSeedsTable).set({ version: 2 }).where(eq(systemSeedsTable.name, SEED_NAME));
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Environmental Compliance course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Environmental Compliance course");
  }
}
