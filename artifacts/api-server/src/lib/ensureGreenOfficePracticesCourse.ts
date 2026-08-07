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

const COURSE_ID = 6;
const COURSE_SLUG = "green-office-practices";
const COURSE_TITLE = "Green Office Practices";
const BADGE_SLUG = "green-office-contributor";
const SEED_NAME = "green-office-practices-v4";
const SKELETON_BADGE_SLUG = "green-office-practitioner"; // catalogue skeleton slug — do not delete

const COURSE_META = {
  description:
    "Integrate everyday office routines, shared workspace management, printing and digital boundaries, meeting efficiency, and respectful team habits into a sustainable workplace culture.",
  fullDescription:
    "This course helps office-based, hybrid, administrative, and managerial employees organize daily office work efficiently. It covers arrival routines, document and digital file boundaries, lower-waste meeting planning, shared space management, confidential record protection, critical equipment boundaries, and respectful colleague communication in Mauritian workplaces.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "1400.00",
  level: "Foundation",
  isFeatured: false,
  thumbnailUrl: "/images/courses/green-office-practices.jpg",
  learningObjectives: [
    "Recognise common resource waste across a normal office working day.",
    "Apply practical sustainability habits in personal and shared workspaces.",
    "Apply sensible printing and digital document boundaries while protecting data confidentiality.",
    "Plan efficient, lower-waste meetings and shared refreshment routines.",
    "Distinguish direct employee actions from changes requiring site procedure or facilities escalation.",
    "Escalate office faults and safety issues constructively without policing or blaming colleagues.",
    "Select one practical workplace commitment to support a green office culture."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "You have completed Green Office Practices. You can now organize your daily office routine efficiently, plan lower-waste meetings, handle confidential records securely, and encourage sustainable team habits constructively.",
  badgeName: "Green Office Contributor",
  badgeDescription:
    "Awarded for mastering everyday sustainable office routines, meeting efficiency, document boundaries, and respectful workplace habits.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "A Normal Office Day with Hidden Waste",
    minutes: 3,
    content: "Identify resource waste across a typical office working day.",
    blocks: [
      { id: "gop1-h1", type: "heading", position: 1, headingText: "Arriving for a Team Meeting" },
      { id: "gop1-t1", type: "short_text", position: 2, bodyText: "Imagine arriving at your office at 8:15 AM for a morning team meeting. The presentation display screen in an empty room is already powered on, thick printed paper packs sit uncollected on the table, disposable coffee cups fill the bin, and confidential client folders are stacked beside an open recycling box." },
      { id: "gop1-k1", type: "key_message", position: 3, headingText: "Effortless Daily Routines", bodyText: "Green office practice is not about sacrificing comfort or productivity. It is about building clear, consistent daily routines across shared spaces, meetings, documents, and equipment to eliminate careless waste." },
      {
        id: "gop1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Morning meeting arrival decision scenario:",
        decisionPrompt: "You walk into an empty meeting room 30 minutes before your scheduled meeting and notice the large presentation screen powered on displaying a blank input screen. What should you do?",
        decisionChoices: [
          { label: "Switch off or put the presentation screen into standby until the meeting starts", correct: true, feedback: "Perfect! Turning off idle room displays when meetings are not active is a simple, direct employee habit." },
          { label: "Leave the screen running on high brightness for 30 minutes because someone will use it eventually", correct: false, feedback: "Incorrect. Leaving displays powered on in empty rooms wastes power and shortens equipment life." },
          { label: "Unplug the main network server cabinet in the corner of the room", correct: false, feedback: "NEVER disconnect network or server infrastructure! Critical IT hardware must remain powered continuously." }
        ]
      },
      {
        id: "gop1-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "What is the core purpose of the Green Office Practices course?",
        mcqOptions: [
          "Helping employees build practical daily routines that eliminate office waste in shared spaces, meetings, and documents",
          "Policing colleagues and reporting small personal mistakes to senior management",
          "Banning all paper printing and electrical equipment in corporate offices",
          "Switching off critical IT server racks and security alarms every evening"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "The course focuses on practical, shared daily routines and constructive workplace culture—not policing or banning equipment.",
        mcqIncorrectExplanation: "Incorrect. Green office practice creates effortless daily routines without policing colleagues or risking critical operations."
      }
    ]
  },
  {
    order: 1,
    title: "Why Green Office Habits Matter",
    minutes: 3,
    content: "Connect daily office habits to employee experience, business efficiency, and environmental responsibility.",
    blocks: [
      { id: "gop2-h1", type: "heading", position: 1, headingText: "Three Workplace Perspectives" },
      { id: "gop2-t1", type: "short_text", position: 2, bodyText: "Consistent office habits create tangible benefits across three areas:" },
      {
        id: "gop2-k1",
        type: "key_message",
        position: 3,
        headingText: "Employee, Business & Environmental Value",
        bodyText: "• Employee Experience: Cleaner, better-organized workspaces, fewer misplaced files, and smoother team collaboration.\n• Business Value: Reduced paper and supply overhead, longer equipment lifespan, and stronger compliance with company policy.\n• Environmental Value: Reduced unnecessary material consumption, lower standby power draw, and responsible resource stewardship."
      },
      {
        id: "gop2-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Mauritian Office Reality",
        bodyText: "In Mauritian business centers (Port Louis, Ebène, and regional hubs), imported paper, office supplies, and electricity carry real commercial costs. Simple daily habits—like duplex printing and clearing meeting rooms—have an immediate cumulative impact."
      }
    ]
  },
  {
    order: 2,
    title: "The Working-Day Framework & Sourced Facts",
    minutes: 4,
    content: "Follow an integrated 5-stage working day framework and learn sourced office efficiency facts.",
    blocks: [
      { id: "gop3-h1", type: "heading", position: 1, headingText: "The 5-Stage Office Working-Day Framework" },
      { id: "gop3-t1", type: "short_text", position: 2, bodyText: "Organize your workday using five practical stages:" },
      {
        id: "gop3-k1",
        type: "key_message",
        position: 3,
        headingText: "Working-Day Stages",
        bodyText: "1. ARRIVE & SET UP: Use only needed equipment; report existing room faults.\n2. WORK & COMMUNICATE: Share digital links; print only when required by legal/operational rules.\n3. MEET & COLLABORATE: Confirm attendee count; order proportionate catering; release room displays.\n4. USE SHARED SPACES: Follow kitchen/waste labels; keep reusable cups clean; avoid kettle overfilling.\n5. CLOSE THE DAY: Power down non-critical desk gear; leave server racks powered; clear confidential paper."
      },
      {
        id: "gop3-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "According to the International Energy Agency (IEA) and UNEP Sustainable Office Studies, unattended office monitors, idle meeting room displays, and unnecessary document printing account for over 20% of avoidable commercial office energy and supply overhead! Establishing a simple end-of-day shut-down checklist eliminates this waste effortlessly."
      },
      {
        id: "gop3-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "What is a recommended practice when closing your desk workspace at the end of the working day?",
        mcqOptions: [
          "Switch off non-critical workstation monitors and desk lamps while leaving critical IT infrastructure powered on",
          "Switch off all central IT server racks and fire safety alarms in the building",
          "Leave all desk displays, lights, and air conditioners running on full power overnight",
          "Dump confidential client files into an open hallway waste paper bin"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Turn off personal desk equipment safely while ensuring central IT and safety systems remain untouched.",
        mcqIncorrectExplanation: "Incorrect. Personal desk displays should be switched off, while critical server infrastructure must remain powered."
      }
    ]
  },
  {
    order: 3,
    title: "Document, Printing & Digital Boundaries",
    minutes: 4,
    content: "Apply proportionate printing guidelines while protecting document confidentiality and data security.",
    blocks: [
      { id: "gop4-h1", type: "heading", position: 1, headingText: "Printing, Digital Tools & Confidentiality" },
      { id: "gop4-t1", type: "short_text", position: 2, bodyText: "Digital document sharing reduces paper use, but printing remains necessary for certain legal, accessibility, or operational tasks. Follow these practical boundaries:" },
      {
        id: "gop4-k1",
        type: "key_message",
        position: 3,
        headingText: "Proportionate Printing & Confidentiality Rules",
        bodyText: "• Print When Required: Legal/contractual records, approved operational checklists, accessibility needs, or signed client records.\n• Avoid Unnecessary Print: Printing emails solely for reading, printing full meeting packs before attendance is confirmed, or multi-page draft reviews.\n• Protect Data Confidentiality: NEVER place confidential client papers, HR records, or financial documents into general paper bins. Use approved secure shredding consoles."
      },
      {
        id: "gop4-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Digital Responsibility Principle",
        bodyText: "Digital storage is not impact-free. Clean up outdated draft files, share document links instead of sending 50MB attachments to large distribution lists, and close unused video calls."
      }
    ]
  },
  {
    order: 4,
    title: "Inspecting Office & Meeting Room Boundaries",
    minutes: 4,
    content: "Identify post-meeting room waste, confidential paper risks, and critical IT equipment boundaries.",
    blocks: [
      { id: "gop5-h1", type: "heading", position: 1, headingText: "Meeting Room & Kitchenette Inspection" },
      { id: "gop5-t1", type: "short_text", position: 2, bodyText: "Examine a real Mauritian corporate meeting space. Observe the active presentation screen, leftover printed packs, confidential folders near a bin, and the glass server cabinet." },
      {
        id: "gop5-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-green-office-practices.png",
        caption: "Meeting Room Inspection: Active presentation screen, abandoned printed packs, confidential folders near a recycling bin, and server cabinet labeled 'CRITICAL IT INFRASTRUCTURE - DO NOT POWER DOWN'.",
        imageAlt: "Realistic photograph of a Mauritian office meeting room after a meeting showing an active presentation screen, abandoned paper packs, confidential folders on a desk near a bin, and a glass IT server cabinet labeled CRITICAL IT INFRASTRUCTURE - DO NOT POWER DOWN."
      },
      {
        id: "gop5-m1",
        type: "multiple_choice",
        position: 4,
        mcqQuestion: "In the office inspection scene above, what must you NEVER do regarding the glass server cabinet labeled 'CRITICAL IT INFRASTRUCTURE - DO NOT POWER DOWN'?",
        mcqOptions: [
          "Never switch off, unplug, or tamper with critical server infrastructure or network equipment",
          "Switch it off every evening at 5:00 PM to save standby electricity",
          "Open the cabinet door and adjust internal cooling fans",
          "Use the server cabinet as a temporary storage shelf for wet cleaning sponges"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Critical IT infrastructure must remain powered 24/7 to maintain network security, database availability, and business continuity.",
        mcqIncorrectExplanation: "Incorrect. Critical IT server cabinets must never be powered down by general office employees."
      }
    ]
  },
  {
    order: 5,
    title: "Authority Boundaries & Respectful Culture",
    minutes: 3,
    content: "Categorize office actions into authority levels and practice constructive, respectful communication.",
    blocks: [
      { id: "gop6-h1", type: "heading", position: 1, headingText: "Act, Check & Escalate Framework" },
      { id: "gop6-t1", type: "short_text", position: 2, bodyText: "Structure your daily office actions using three clear authority levels:" },
      {
        id: "gop6-k1",
        type: "key_message",
        position: 3,
        headingText: "Three Levels of Authority",
        bodyText: "1. ACT DIRECTLY: Turn off desk lights/monitors, print duplex, clear personal desk space, use reusable cups.\n2. CHECK SITE PROCEDURE: Adjusting central AC settings, altering meeting room booking rules, disposing of bulk office furniture.\n3. ESCALATE TO MANAGEMENT: Electrical faults, water near electrical outlets, damaged power cords, confidential data leaks, or repeated procedure failures."
      },
      {
        id: "gop6-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Respectful team communication scenario:",
        decisionPrompt: "You notice that colleagues frequently print full 40-page meeting packs before attendee numbers are confirmed, leaving half of them in the bin after the meeting. How should you address this?",
        decisionChoices: [
          { label: "Suggest constructively at the next team meeting: 'Could we share digital agendas first and print copies only for those who request them?'", correct: true, feedback: "Outstanding! Constructive suggestions focus on process improvements without blaming or policing colleagues." },
          { label: "Publicly shame your colleagues on the company group chat for wasting paper", correct: false, feedback: "Incorrect! Public shaming creates hostility and undermines team culture." },
          { label: "Hide the office printer paper so nobody can print anything", correct: false, feedback: "Incorrect. Sabotaging office supplies disrupts business operations." }
        ]
      },
      {
        id: "gop6-c1",
        type: "commitment",
        position: 5,
        commitmentInstruction: "Select your daily green office commitments (choose at least one):",
        commitmentOptions: [
          { value: "print-intentionally", label: "Print intentionally and use duplex mode for multi-page documents", description: "Reduce unnecessary paper waste while respecting operational printing needs." },
          { value: "protect-confidential-paper", label: "Place confidential documents strictly into secure destruction consoles", description: "Safeguard client and company data security." },
          { value: "release-room-displays", label: "Switch off presentation screens and lights when leaving meeting rooms", description: "Eliminate idle standby power draw in shared spaces." },
          { value: "respect-critical-it", label: "Never touch or power down central server racks and safety systems", description: "Protect IT network infrastructure and workplace safety." },
          { value: "suggest-constructively", label: "Suggest office improvements constructively without policing or blaming peers", description: "Build a positive, collaborative workplace sustainability culture." }
        ]
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "What is the primary objective of practicing green office routines?",
    options: [
      "Banning all paper printing and electrical devices in commercial offices",
      "Policing colleagues and publicly reporting personal errors",
      "Building effortless daily habits in shared spaces, meetings, and document workflows that eliminate waste without compromising productivity",
      "Switching off central IT server infrastructure every weekend"
    ],
    correct: 2,
    correctExplanation: "Green office practices focus on building seamless, shared daily habits that eliminate waste while maintaining productivity.",
    incorrectExplanation: "Incorrect. Green office practices create efficient daily habits without policing colleagues or risking IT operations."
  },
  {
    order: 2,
    question: "How should confidential paper records (e.g. HR files, financial reports, client data) be handled?",
    options: [
      "Placed strictly into authorized secure destruction consoles or shredded according to company data policies",
      "Thrown into open hallway recycling bins",
      "Left on meeting room tables for cleaners to throw away",
      "Used as scratch paper for public notes"
    ],
    correct: 0,
    correctExplanation: "Confidential records must follow secure destruction procedures to comply with data protection regulations.",
    incorrectExplanation: "Incorrect. Confidential documents require secure handling and must never be placed in open recycling bins."
  },
  {
    order: 3,
    question: "Which piece of office equipment must NEVER be powered down or unplugged by general employees during end-of-day shut-down routines?",
    options: [
      "Individual desktop workstation computer monitors",
      "Central IT server racks, network cabinets, and building security systems",
      "Desk lamps in unoccupied private offices",
      "Presentation display screens in empty meeting rooms"
    ],
    correct: 1,
    correctExplanation: "Server racks and network cabinets maintain business systems and data security—never switch them off.",
    incorrectExplanation: "Incorrect. Server racks and IT infrastructure must remain powered continuously."
  },
  {
    order: 4,
    question: "What is a key principle of lower-waste meeting planning?",
    options: [
      "Printing 50 extra paper packs for unconfirmed guests",
      "Leaving presentation screens powered on 24 hours before the meeting",
      "Ordering individual plastic bottled drinks for every internal participant",
      "Confirming attendee numbers before ordering catering and sharing digital documents in advance"
    ],
    correct: 3,
    correctExplanation: "Confirming attendance and sharing digital agendas prevents unnecessary paper and catering waste.",
    incorrectExplanation: "Incorrect. Confirming attendance and sharing digital links eliminates meeting waste."
  },
  {
    order: 5,
    question: "What is the most effective way to encourage sustainable habits among office colleagues?",
    options: [
      "Publicly confront and shame colleagues who leave lights on",
      "Model good habits yourself and suggest process improvements constructively during team meetings",
      "Hide shared office stationery so colleagues cannot use it",
      "Report minor personal habits to senior management immediately"
    ],
    correct: 1,
    correctExplanation: "Modeling positive habits and making constructive process suggestions builds a collaborative, lasting culture.",
    incorrectExplanation: "Incorrect. Constructive suggestions and leading by example build a positive workplace culture."
  }
];

export async function ensureGreenOfficePracticesCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 6 by ID 6 or slug
      let course = null;
      
      const [byId] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.id, COURSE_ID))
        .limit(1);

      if (byId) {
        course = byId;
      } else {
        const [bySlug] = await tx
          .select()
          .from(coursesTable)
          .where(eq(coursesTable.slug, COURSE_SLUG))
          .limit(1);
        course = bySlug ?? null;
      }

      if (!course) {
        throw new Error("Course 6 not seeded by catalogue skeletons bootstrap!");
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
        logger.info({ courseId, slug: COURSE_SLUG }, "Green Office Practices course content and v4 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v4 seed detected for Course 6. Re-seeding course content and lessons transactionally...");

      // 4. Resolve next recommended course dynamically by slug
      const [nextCourse] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.slug, "sustainable-transport-commuting"))
        .limit(1);
      const nextCourseId = nextCourse?.id ?? null;

      // 5. Update course record slug, title, and metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
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
          icon: "briefcase",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 11,
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
          version: 4,
        });
      } else {
        await tx.update(systemSeedsTable).set({ version: 4 }).where(eq(systemSeedsTable.name, SEED_NAME));
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Green Office Practices course v4 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Green Office Practices course");
  }
}
