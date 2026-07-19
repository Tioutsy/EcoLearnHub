import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
} from "@workspace/db";
import { eq, and, or } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_ID = 3;
const COURSE_SLUG = "energy-efficiency-at-work";
const COURSE_TITLE = "Energy Efficiency at Work";
const BADGE_SLUG = "energy-saver";
const SEED_NAME = "energy-efficiency-at-work-v1";

const COURSE_META = {
  description:
    "A practical guide to reducing electricity consumption, improving climate control and lighting practices, and eliminating unnecessary standby energy use in Mauritian workplaces.",
  fullDescription:
    "This course covers simple daily habits and optimized workplace settings that can reduce electricity consumption and lower carbon emissions. Tailored specifically for Mauritian workspaces, it teaches employees how to optimize air conditioning and lighting, switch off standby power safely, and follow shutdown checklists.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "1400.00",
  level: "Foundation",
  isFeatured: false,
  thumbnailUrl: "/images/courses/energy-efficiency.png",
  learningObjectives: [
    "Identify the primary sources of electricity consumption in a typical Mauritian office.",
    "Implement optimized lighting and air conditioning settings to reduce load without affecting comfort.",
    "Recognize and eliminate standby energy waste on office appliances.",
    "Establish energy-saving habits during end-of-day shut-down routines."
  ],
  includesCertificate: true,
  passingScore: 80,
  badgeName: "Energy Saver",
  badgeDescription: "Awarded for completing Energy Efficiency at Work and committing to practical workplace energy-saving actions."
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Office Energy: Where Does It All Go?",
    minutes: 3,
    content: "Understand primary electricity consumers in typical office environments.",
    blocks: [
      { id: "ee1-h1", type: "heading", position: 1, headingText: "Office Energy: Where Does It All Go?" },
      { id: "ee1-t1", type: "short_text", position: 2, bodyText: "Electricity in commercial buildings is consumed by many systems. Knowing which systems use the most power helps us focus our efforts on the most impactful habits." },
      { id: "ee1-k1", type: "key_message", position: 3, headingText: "The Big Consumers", bodyText: "Air conditioning and lighting are often among the most significant sources of workplace electricity consumption." },
      { id: "ee1-w1", type: "workplace_example", position: 4, headingText: "Office Cooling in Mauritius", bodyText: "In tropical climates, ventilation and cooling systems run continuously, making them the primary contributors to commercial grid load." },
      {
        id: "ee1-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "Which of the following is typically a major consumer of electricity in an air-conditioned office building?",
        mcqOptions: [
          "Air conditioning and ventilation systems",
          "Small desktop phone chargers",
          "Wired computer mice",
          "LED status indicators on keyboards"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Yes! Cooling and ventilation systems require large amounts of power to maintain comfortable indoor temperatures in tropical environments.",
        mcqIncorrectExplanation: "Incorrect. Air conditioning and ventilation are typically among the most significant energy users, whereas chargers and mice consume minimal energy."
      }
    ]
  },
  {
    order: 1,
    title: "Smarter Air Conditioning",
    minutes: 3,
    content: "Learn how to optimize temperature settings and contain cooling.",
    blocks: [
      { id: "ee2-h1", type: "heading", position: 1, headingText: "Smarter Air Conditioning" },
      { id: "ee2-t1", type: "short_text", position: 2, bodyText: "Air conditioning is essential for a comfortable work environment, but small inefficiencies or poor practices can lead to significant waste of electricity." },
      { id: "ee2-k1", type: "key_message", position: 3, headingText: "AC Guidelines", bodyText: "Avoid unnecessarily low air-conditioning settings. A setting around 24°C can provide a practical balance between comfort and energy efficiency in many workplaces." },
      { id: "ee2-w1", type: "workplace_example", position: 4, headingText: "Every Degree Counts", bodyText: "Energy performance varies according to the building, equipment, insulation, occupancy, and operating conditions. Small adjustments can add up to noticeable energy savings over time." },
      {
        id: "ee2-d1",
        type: "decision_scenario",
        position: 5,
        decisionIntro: "A common office scenario:",
        decisionPrompt: "You arrive in a meeting room where the AC was left at a very low setting, and it feels uncomfortably cold. What should you do?",
        decisionChoices: [
          { label: "Adjust the AC setting to a comfortable 24°C", correct: true, feedback: "Perfect! Adjusting the thermostat directly solves the discomfort and saves energy." },
          { label: "Open the window to let warm air in while keeping the AC running", correct: false, feedback: "Incorrect. Opening a window while AC runs forces the system to work harder, wasting energy." },
          { label: "Leave the room and find another place to work", correct: false, feedback: "This leaves the AC wasting electricity in an empty room." }
        ]
      },
      {
        id: "ee2-m1",
        type: "multiple_choice",
        position: 6,
        mcqQuestion: "Why is it important to keep windows and doors closed when the air conditioning is on?",
        mcqOptions: [
          "To prevent cooled air from escaping and warm, humid air from entering",
          "To keep the room completely soundproof",
          "Because it is required by local safety laws",
          "To stop the office lights from flickering"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Exactly. Keeping the space sealed keeps the cooled air inside and prevents the AC system from working harder than necessary.",
        mcqIncorrectExplanation: "Incorrect. Open windows allow warm outside air in, which causes the AC to draw more power."
      }
    ]
  },
  {
    order: 2,
    title: "Smarter Workplace Lighting",
    minutes: 3,
    content: "Optimize overhead lights and make appropriate use of daylight.",
    blocks: [
      { id: "ee3-h1", type: "heading", position: 1, headingText: "Smarter Workplace Lighting" },
      { id: "ee3-t1", type: "short_text", position: 2, bodyText: "Lighting is another area where simple habits can make a big difference. We want to maximize the use of natural light while maintaining high safety and visibility standards." },
      { id: "ee3-w1", type: "workplace_example", position: 3, headingText: "Efficiency Gains", bodyText: "Replacing older fluorescent tubes with modern LED tubes is a highly effective hardware upgrade, but occupant habits are just as important." },
      {
        id: "ee3-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Try this scenario:",
        decisionPrompt: "You notice that the lights in a small conference room are still on, even though the meeting ended an hour ago and the room is empty. What do you do?",
        decisionChoices: [
          { label: "Switch the lights off before leaving the area", correct: true, feedback: "Excellent! Switching off lights in empty spaces is a simple and immediate energy saver." },
          { label: "Leave them on because someone might use the room later today", correct: false, feedback: "This wastes electricity. If someone uses the room later, they can easily turn the lights back on." },
          { label: "Report it to the facility manager to log an incident", correct: false, feedback: "No need to log an incident; simply flipping the switch off is faster and more practical." }
        ]
      },
      { id: "ee3-p1", type: "practical_action", position: 5, headingText: "Turn Off Lights in Empty Spaces", bodyText: "Get into the habit of turning off lights in empty meeting rooms, kitchens, corridors, and work areas when it is safe to do so." },
      {
        id: "ee3-m1",
        type: "multiple_choice",
        position: 6,
        mcqQuestion: "How can employees best balance lighting comfort and energy efficiency during the day?",
        mcqOptions: [
          "Use natural daylight where practical, and turn off unnecessary overhead lights",
          "Keep all office lights turned off at all times",
          "Keep all lights on high brightness regardless of outside conditions",
          "Cover the windows to block natural light entirely"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Correct! Leveraging natural daylight and turning off lights in unoccupied rooms is a practical and safe balance.",
        mcqIncorrectExplanation: "Incorrect. Safety and comfortable visibility must always be maintained; do not keep office lights off if it compromises safety."
      }
    ]
  },
  {
    order: 3,
    title: "Standby Energy and Hidden Waste",
    minutes: 3,
    content: "Identify phantom loads and understand when not to unplug.",
    blocks: [
      { id: "ee4-h1", type: "heading", position: 1, headingText: "Standby Energy and Hidden Waste" },
      { id: "ee4-t1", type: "short_text", position: 2, bodyText: "Many electronic devices continue to draw power even when turned off or in standby mode. This is often referred to as 'vampire power' or standby waste." },
      { id: "ee4-k1", type: "key_message", position: 3, headingText: "Identify Critical Equipment First", bodyText: "Always follow workplace procedures and obtain approval before unplugging shared equipment. Never switch off servers, network infrastructure, refrigeration, security systems, or essential safety systems." },
      { id: "ee4-w1", type: "workplace_example", position: 4, headingText: "Common Standby Consumers", bodyText: "Equipment such as monitors, printer displays, active phone chargers, and televisions left on standby overnight can continuously draw electricity." },
      {
        id: "ee4-d1",
        type: "decision_scenario",
        position: 5,
        decisionIntro: "A workplace standby scenario:",
        decisionPrompt: "At the end of your shift, you see a desk printer with a glowing standby light and a phone charger left plugged into the wall without a phone. What is the appropriate action?",
        decisionChoices: [
          { label: "Unplug the phone charger, and turn off the printer using its power button if authorized", correct: true, feedback: "Perfect. Chargers draw power when plugged in, and printers should be shut down appropriately." },
          { label: "Unplug the main office network router to stop standby power", correct: false, feedback: "Warning! Never unplug network routers or servers as they perform critical office functions." },
          { label: "Leave everything plugged in and turned on to avoid touching cords", correct: false, feedback: "This ignores standby waste; simple approved actions can safely reduce it." }
        ]
      },
      {
        id: "ee4-m1",
        type: "multiple_choice",
        position: 6,
        mcqQuestion: "Which of the following devices is generally safe and recommended for employees to switch off or unplug at the end of the day?",
        mcqOptions: [
          "Individual computer monitors and non-essential desk accessories",
          "The main office server rack and security cameras",
          "The kitchen refrigerator storing employee lunches",
          "Emergency exit sign lighting systems"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Yes! Turning off your own monitor and desk accessories is completely safe and saves energy without disrupting critical business operations.",
        mcqIncorrectExplanation: "Incorrect. Servers, security systems, fridges, and emergency lighting must remain running continuously for safety and operations."
      }
    ]
  },
  {
    order: 4,
    title: "The Five-Minute End-of-Day Shutdown",
    minutes: 4,
    content: "Establish a shutdown routine checklist before leaving.",
    blocks: [
      { id: "ee5-h1", type: "heading", position: 1, headingText: "The Five-Minute End-of-Day Shutdown" },
      { id: "ee5-t1", type: "short_text", position: 2, bodyText: "Establishing a simple end-of-day shutdown routine is one of the most effective habits you can build to reduce workplace energy waste." },
      { id: "ee5-p1", type: "practical_action", position: 3, headingText: "Your Daily Checklist", bodyText: "Before leaving: 1. Save work and shut down your PC. 2. Turn off monitors. 3. Switch off desk task lights. 4. Check shared rooms for empty lights/ACs. 5. Disconnect unused chargers. 6. Keep servers, security, and refrigeration running." },
      {
        id: "ee5-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Last employee departure scenario:",
        decisionPrompt: "You are the last person leaving your department's shared office space for the weekend. What is your shutdown routine?",
        decisionChoices: [
          { label: "Perform your checklist, ensuring non-essential lights and ACs are off, but leaving servers and fridges running", correct: true, feedback: "Excellent! You successfully eliminate non-essential waste while keeping critical equipment safe." },
          { label: "Turn off the main electrical breaker for the entire floor", correct: false, feedback: "Caution! Cutting all power can damage servers, shut off security, and spoil food in refrigerators." },
          { label: "Just walk out and lock the door, leaving all desk setups and ACs active", correct: false, feedback: "This leaves office cooling and lights running unnecessarily all weekend." }
        ]
      },
      {
        id: "ee5-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "Why should servers and network equipment be excluded from standard employee shutdown checklists?",
        mcqOptions: [
          "Because they perform critical business and communication tasks that must run continuously",
          "Because they do not consume any electricity",
          "Because they do not have power buttons",
          "Because they automatically shut down when employees leave"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Exactly. Server and network infrastructure must remain active to support remote access, backups, and communications.",
        mcqIncorrectExplanation: "Incorrect. Network systems are essential infrastructure and must not be turned off by regular employees."
      }
    ]
  },
  {
    order: 5,
    title: "My Workplace Energy Commitments",
    minutes: 3,
    content: "Pledge your support for energy savings.",
    blocks: [
      { id: "ee6-h1", type: "heading", position: 1, headingText: "Pledge to Act" },
      { id: "ee6-t1", type: "short_text", position: 2, bodyText: "Great work! You have finished the lessons. Now choose the habits you will carry forward in your workplace." },
      {
        id: "ee6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select the commitments you will practice at work. Choose at least two:",
        commitmentOptions: [
          { value: "ac-24", label: "Use practical air-conditioning settings and avoid unnecessarily cold rooms.", description: "Keep office cooling balanced to avoid power waste." },
          { value: "unplug-vampires", label: "Turn off approved power strips and disconnect unused chargers before leaving.", description: "Stop vampire power consumption when off-duty." },
          { value: "switch-lights-off", label: "Turn off lights in empty meeting rooms, kitchens, corridors, and work areas when safe to do so.", description: "Avoid illuminating unoccupied rooms." },
          { value: "shutdown-equipment", label: "Shut down my computer, monitor, and non-essential desk equipment at the end of the day.", description: "Completely power off your workstation daily." }
        ]
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "Which of the following temperature practices is generally recommended for office air conditioning in tropical environments to balance comfort and energy savings?",
    options: [
      "Keep the thermostat set around 16°C at all times",
      "Keep the thermostat set around 24°C to provide a practical balance",
      "Turn the AC off and on every 10 minutes",
      "Keep the thermostat at 20°C and keep windows open"
    ],
    correct: 1,
    correctExplanation: "Correct. A setting around 24°C provides comfortable indoor cooling while preventing unnecessary grid load.",
    incorrectExplanation: "Incorrect. Settings that are too low (like 16°C or 20°C) draw excessive energy in tropical regions."
  },
  {
    order: 2,
    question: "An office door leading to a non-air-conditioned hallway is left wide open while the AC is running. What is the best action?",
    options: [
      "Close the door to keep the cooled air inside and prevent the AC from overloading",
      "Open all windows in the room to balance the air pressure",
      "Turn off the air conditioning entirely for the day",
      "Ignore it, as modern AC units are unaffected by open doors"
    ],
    correct: 0,
    correctExplanation: "Correct. Closing the door isolates the cooled space and reduces the energy required by the system.",
    incorrectExplanation: "Incorrect. Open doors or windows allow warm air to enter, forcing the system to work harder."
  },
  {
    order: 3,
    question: "What should be done with a shared office printer or photocopier over the weekend, according to general energy guidelines?",
    options: [
      "It should be unplugged from the wall outlet completely, along with the office servers",
      "It should be left fully active with the screen turned on so it is ready for Monday",
      "It should be switched to standby or turned off using its power button if authorized by workplace procedures",
      "It should be kept printing blank pages to prevent ink drying"
    ],
    correct: 2,
    correctExplanation: "Correct. Switching to standby or shutting down using the power button (if authorized) prevents standby power waste without affecting operations.",
    incorrectExplanation: "Incorrect. Unplugging critical infrastructure or leaving screens fully active is not recommended. Standby or power button shut-down is preferred."
  },
  {
    order: 4,
    question: "Your desk area is well-lit by natural daylight, but the overhead artificial lights are turned on. How can you optimize lighting?",
    options: [
      "Keep the artificial lights on anyway to ensure absolute brightness",
      "Turn off unnecessary overhead lights near the windows where natural light is sufficient",
      "Close all blinds and turn on additional task lamps",
      "Unscrew the overhead lightbulbs manually"
    ],
    correct: 1,
    correctExplanation: "Correct. Utilizing natural daylight and reducing artificial lighting in well-lit zones is a safe and efficient practice.",
    incorrectExplanation: "Incorrect. Blocking natural light or leaving unnecessary lights on is wasteful."
  },
  {
    order: 5,
    question: "When using the office kitchen kettle, how can you practice energy efficiency while keeping safety in mind?",
    options: [
      "Boil only the amount of water you need rather than filling the kettle to the top",
      "Keep the kettle plugged in and boiling continuously throughout the day",
      "Fill the kettle to the maximum line every time, even for one cup of tea",
      "Boil water on a microwave plate instead of using the kettle"
    ],
    correct: 0,
    correctExplanation: "Correct. Boiling only the required volume of water saves both electricity and time.",
    incorrectExplanation: "Incorrect. Boiling extra water consumes unnecessary energy."
  },
  {
    order: 6,
    question: "You are leaving a shared meeting room after a workshop, and no one else is scheduled to use it for the rest of the day. What should you do?",
    options: [
      "Leave the lights on because the cleaning crew will turn them off tonight",
      "Leave the AC at 18°C so the room stays cool for tomorrow",
      "Ensure the lights and AC are switched off before you close the door",
      "Leave the door wide open with lights on to show the room is empty"
    ],
    correct: 2,
    correctExplanation: "Correct. Making sure lights and cooling are off in unoccupied rooms is a primary habit for reducing energy waste.",
    incorrectExplanation: "Incorrect. Leaving systems running in empty rooms waste energy unnecessarily."
  },
  {
    order: 7,
    question: "Which of the following actions is recommended for your computer monitor at the end of the day?",
    options: [
      "Leave it on with a screen saver running all night",
      "Turn off the monitor screen completely using its power button",
      "Keep it in active mode so it receives background updates",
      "Unplug the computer's CPU while leaving the monitor turned on"
    ],
    correct: 1,
    correctExplanation: "Correct! Screen savers do not save energy; turning off the monitor screen prevents standby power draw.",
    incorrectExplanation: "Incorrect. Screen savers still draw power. The screen should be shut down."
  },
  {
    order: 8,
    question: "Who is responsible for turning off communal systems like central AC or shared lobby monitors at the end of the day?",
    options: [
      "Any regular employee can shut down central server systems without asking",
      "It should follow designated workplace procedures and authorized employee responsibilities",
      "They should never be turned off, even during office holidays",
      "The last person to leave must unplug all wall sockets, including the security system"
    ],
    correct: 1,
    correctExplanation: "Correct. Managing communal and shared systems must follow workplace procedures to prevent turning off critical business operations.",
    incorrectExplanation: "Incorrect. Unplugging critical security systems or randomly shutting down servers is dangerous. Follow authorized procedures."
  }
];

export async function ensureEnergyEfficiencyCourse(externalTx?: any): Promise<void> {
  const runSeeder = async (tx: any) => {
    // 1. Resolve Course 3 by ID 3 or slug
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
        throw new Error("Course 3 not seeded by catalogue skeletons bootstrap!");
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

      // 3. Evaluate integrity violations (incomplete or placeholder checks)
      const hasMissingLessons = existingLessons.length !== 6;
      const hasEmptyBlocks = existingLessons.some(
        (l: any) => !l.contentBlocks || !Array.isArray(l.contentBlocks) || l.contentBlocks.length === 0
      );
      const hasPlaceholderText = existingLessons.some(
        (l: any) => l.title.includes("[DRAFT SKELETON]") || (l.content || "").includes("[DRAFT SKELETON]")
      );
      const hasMissingQuiz = existingQuizQuestions.length !== 8;
      const hasPlaceholderQuiz = existingQuizQuestions.some(
        (q: any) => q.question.includes("[DRAFT SKELETON]")
      );
      const hasIncorrectSlug = course.slug !== COURSE_SLUG;

      const needsRepair = !existingSeed ||
                          hasMissingLessons ||
                          hasEmptyBlocks ||
                          hasPlaceholderText ||
                          hasMissingQuiz ||
                          hasPlaceholderQuiz ||
                          hasIncorrectSlug;

      if (!needsRepair) {
        logger.info({ courseId, slug: COURSE_SLUG }, "Energy Efficiency course content and integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing seed detected for Course 3. Re-seeding course content and lessons transactionally...");

      // 4. Resolve next recommended course dynamically by slug (Course 4: Water Conservation)
      const [nextCourse] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.slug, "water-conservation"))
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
          icon: "zap",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 8,
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
          version: 1,
        });
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Energy Efficiency course seed / repair transaction completed successfully.");
    };

    try {
      if (externalTx) {
        await runSeeder(externalTx);
      } else {
        await db.transaction(async (tx) => {
          await runSeeder(tx);
        });
      }
    } catch (err) {
      logger.error({ err }, "Failed to execute idempotent seeding/repair of Energy Efficiency course");
    }
}
