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

const COURSE_ID = 2;
const COURSE_SLUG = "waste-sorting-mauritian-bin-system";
const COURSE_TITLE = "Waste Sorting & the Mauritian Bin System";
const BADGE_SLUG = "sorting-champion";
const SEED_NAME = "waste-sorting-mauritian-bin-system-v2";

const COURSE_META = {
  description:
    "Help employees identify common workplace waste, make better sorting decisions, reduce contamination, and understand that recycling rules depend on your employer's designated waste collector.",
  fullDescription:
    "This course covers simple habits and practical systems that lower environmental impact through correct waste separation and recycling. Tailored specifically for Mauritian workplaces, it highlights local island constraints—such as Mare Chicose landfill limits—and explains why you must always follow workplace bin labels rather than assuming a single universal national color scheme.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "1400.00",
  level: "Foundation",
  isFeatured: false,
  thumbnailUrl: "/images/courses/waste-sorting.png",
  learningObjectives: [
    "Identify common workplace waste categories and clean recyclable materials.",
    "Separate clean, accepted materials from contaminated or unsuitable items.",
    "Follow workplace-specific bin labels and approved collector instructions.",
    "Recognise special waste (like batteries and e-waste) that requires escalation.",
    "Take practical action to reduce sorting mistakes and avoid landfill contamination."
  ],
  includesCertificate: true,
  passingScore: 80,
  badgeName: "Sorting Champion",
  badgeDescription: "Awarded for completing the Waste Sorting & the Mauritian Bin System course."
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "The Workplace Bin Decision",
    minutes: 3,
    content: "Understand why checking bin labels is the golden rule in Mauritian workplaces.",
    blocks: [
      { id: "ws1-h1", type: "heading", position: 1, headingText: "Where Does This Go?" },
      { id: "ws1-t1", type: "short_text", position: 2, bodyText: "You are standing at a workplace waste station holding a plastic bottle, a takeaway container with food residue, a used battery, and a paper napkin. You have only a few seconds to decide where each item belongs. Guessing leads to recycling contamination." },
      { id: "ws1-k1", type: "key_message", position: 3, headingText: "Follow Workplace Labels First", bodyText: "Different companies in Mauritius contract different waste collection services. There is no single universal national color scheme for commercial bins across all facilities. Always follow the explicit printed labels on your site's bins rather than assuming a generic color rule applies." },
      {
        id: "ws1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Workplace decision scenario:",
        decisionPrompt: "You have a lunch packaging box with paper labels and plastic lining. You are unsure which recycling stream accepts it at your workplace. What should you do?",
        decisionChoices: [
          { label: "Check the printed bin label and workplace waste guide before discarding it", correct: true, feedback: "Perfect! Workplace labels and collector guidelines are the only authoritative guide for your site." },
          { label: "Toss it into the yellow bin because it looks mostly like plastic", correct: false, feedback: "Incorrect. Guessing can contaminate an entire clean batch of recyclable packaging." },
          { label: "Throw it in general waste to avoid thinking about it", correct: false, feedback: "This sends recyclable material straight to Mare Chicose landfill. Check site labels first." }
        ]
      },
      {
        id: "ws1-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "Why should you always follow your workplace labels instead of relying on a general color rule?",
        mcqOptions: [
          "Bin labels and accepted items vary between commercial sites and waste collectors",
          "Mauritian companies do not bother sorting waste",
          "All Mauritian offices share one national waste collection truck",
          "Only food scraps are sorted in Mauritian offices"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Commercial waste arrangements depend on your employer's contracted waste service provider. Always follow local site instructions.",
        mcqIncorrectExplanation: "Incorrect. Collection rules and bin systems vary by collector and site."
      }
    ]
  },
  {
    order: 1,
    title: "The Journey of Waste & Mauritian Island Realities",
    minutes: 3,
    content: "Discover why clean separation matters on an island.",
    blocks: [
      { id: "ws2-h1", type: "heading", position: 1, headingText: "The Journey of Waste in Mauritius" },
      { id: "ws2-t1", type: "short_text", position: 2, bodyText: "On an island like Mauritius, land and freshwater resources are finite. When waste is thrown into a general bin, its destination is the Mare Chicose landfill, which faces strict capacity constraints." },
      {
        id: "ws2-k1",
        type: "key_message",
        position: 3,
        headingText: "Three Sorting Perspectives",
        bodyText: "• Employee Relevance: Clear sorting habits prevent messy kitchen areas and reduce handling confusion.\n• Business Relevance: Clean, sorted waste reduces waste management fees and supports company ESG compliance.\n• Environmental Relevance: Keeping clean recyclables out of Mare Chicose extends landfill life and reduces green-house emissions."
      },
      {
        id: "ws2-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Workplace canteen scenario:",
        decisionPrompt: "The cleaning team notices organic food scraps mixed into a bin of dry paper. What is the operational impact?",
        decisionChoices: [
          { label: "The entire batch of paper may be rejected by the collector and sent to landfill", correct: true, feedback: "Correct! Food grease and moisture spoil paper fibers, rendering them unrecyclable." },
          { label: "The waste collector will wash and dry the paper by hand", correct: false, feedback: "Collectors do not hand-wash contaminated paper; dirty paper is discarded to landfill." },
          { label: "It naturally turns into compost inside the plastic bin", correct: false, feedback: "Paper mixed with plastic packaging in sealed bins does not compost properly." }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Understanding Waste Categories & Contamination",
    minutes: 4,
    content: "Learn material classifications and how contamination spoils recycling.",
    blocks: [
      { id: "ws3-h1", type: "heading", position: 1, headingText: "Material Classifications & Contamination Rules" },
      { id: "ws3-t1", type: "short_text", position: 2, bodyText: "Not everything made of paper or plastic can be recycled together. Contamination occurs when dirty or non-accepted items spoil clean recyclable streams." },
      {
        id: "ws3-f1",
        type: "memorable_fact",
        position: 3,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "Food-soiled cardboard (like greasy pizza boxes or oil-stained takeaway containers) cannot be recycled with clean office paper. The oil breaks down paper fibers during repulping. Always tear off clean cardboard tops for recycling and place greasy bottoms in general waste!"
      },
      {
        id: "ws3-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Empty, Separate & Clean",
        bodyText: "Before placing containers in recycling streams: 1) Empty remaining liquids, 2) Remove heavy food residue, 3) Separate mixed materials (such as plastic lids from glass bottles)."
      },
      {
        id: "ws3-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "Which item is most likely to ruin a batch of clean paper recycling?",
        mcqOptions: [
          "A greasy cardboard takeaway box with leftover sauce",
          "A clean, flattened office envelope",
          "A dry cardboard shipping box",
          "A printed white paper memo"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Oil and food grease permeate paper fibers, making them impossible to repulp cleanly.",
        mcqIncorrectExplanation: "Incorrect. Dry paper and cardboard are recyclable; oil and grease cause contamination."
      }
    ]
  },
  {
    order: 3,
    title: "Inspecting Your Workplace Sorting Station",
    minutes: 4,
    content: "Practice identifying workplace waste items and special disposal requirements.",
    blocks: [
      { id: "ws4-h1", type: "heading", position: 1, headingText: "Workplace Waste Inspection" },
      { id: "ws4-t1", type: "short_text", position: 2, bodyText: "Examine a real Mauritian workplace waste sorting station. Notice the labelled bins for Paper & Cardboard, Plastics & Cans, and General Waste." },
      {
        id: "ws4-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-workplace-waste-station.png",
        caption: "Workplace Waste Station Inspection: Clearly labelled bins for Paper & Cardboard, Plastics & Cans, and General Waste, with items on the adjacent counter.",
        imageAlt: "Realistic photograph of a modern Mauritian workplace waste sorting station featuring clear printed labels for Paper & Cardboard, Plastics & Cans, and General Waste, with clean recyclables and a used battery on the adjacent counter."
      },
      {
        id: "ws4-m1",
        type: "multiple_choice",
        position: 4,
        mcqQuestion: "In the workplace waste station scene above, which item must NEVER be placed in standard recycling or general waste bins without checking special disposal procedures?",
        mcqOptions: [
          "The used AA battery on the counter",
          "The clean PET plastic water bottle",
          "The flattened cardboard box",
          "The aluminium beverage can"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Batteries contain corrosive chemicals and heavy metals. They pose fire and contamination hazards and require special e-waste/battery drop-off points.",
        mcqIncorrectExplanation: "Incorrect. Clean bottles, cardboard, and cans are standard recyclables; batteries require dedicated hazardous waste escalation."
      }
    ]
  },
  {
    order: 4,
    title: "Practical Workplace Sorting & Escalation",
    minutes: 3,
    content: "Apply sorting choices in canteens, offices, and maintenance areas.",
    blocks: [
      { id: "ws5-h1", type: "heading", position: 1, headingText: "Handling Uncertainty & Hazardous Items" },
      { id: "ws5-t1", type: "short_text", position: 2, bodyText: "When sorting waste at work, you will encounter items that are unclear or hazardous. Never guess—follow escalation protocols." },
      {
        id: "ws5-d1",
        type: "decision_scenario",
        position: 3,
        decisionIntro: "Office canteen scenario:",
        decisionPrompt: "A new waste bin has missing or unreadable text labels, and colleagues are throwing mixed items inside. What is the best action?",
        decisionChoices: [
          { label: "Report the unreadable label to facilities/management and follow site instructions", correct: true, feedback: "Excellent! Resolving infrastructure and label clarity prevents site-wide sorting errors." },
          { label: "Ignore the issue and throw whatever you want inside", correct: false, feedback: "Unclear labels cause contamination across the entire workplace waste stream." },
          { label: "Remove the bin and throw all waste out the window", correct: false, feedback: "Never discard waste unsafely." }
        ]
      },
      {
        id: "ws5-p1",
        type: "practical_action",
        position: 4,
        headingText: "Items Requiring Special Escalation",
        bodyText: "Always escalate these items to your supervisor or facilities contact: 1) Batteries and e-waste, 2) Fluorescent light tubes, 3) Chemical container residues, 4) Medical or sharp objects."
      }
    ]
  },
  {
    order: 5,
    title: "Your Workplace Waste Commitment",
    minutes: 3,
    content: "Pledge practical workplace waste habits.",
    blocks: [
      { id: "ws6-h1", type: "heading", position: 1, headingText: "Pledge to Act" },
      { id: "ws6-t1", type: "short_text", position: 2, bodyText: "Congratulations on completing the waste sorting module! Select the daily habits you commit to practice in your workplace." },
      {
        id: "ws6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your daily workplace commitments (choose at least one):",
        commitmentOptions: [
          { value: "check-label", label: "Check printed bin labels before sorting unfamiliar items", description: "Always read site bin labels rather than guessing." },
          { value: "empty-liquids", label: "Empty liquids and rinse containers before recycling", description: "Prevent liquid leakage and paper stream contamination." },
          { value: "separate-cardboard", label: "Separate clean cardboard from food-greasy parts", description: "Keep dry paper streams clean and free of grease." },
          { value: "escalate-batteries", label: "Escalate batteries and e-waste to special collection points", description: "Never dispose of hazardous batteries in standard bins." },
          { value: "report-unclear", label: "Report missing or unreadable bin labels to facilities", description: "Help maintain clear sorting infrastructure for your team." }
        ]
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "Where does unsorted general waste in Mauritius ultimately end up?",
    options: [
      "The Mare Chicose landfill",
      "Community compost facilities across the island",
      "Exported for international recycling",
      "Incinerated for renewable grid electricity"
    ],
    correct: 0,
    correctExplanation: "Most unsorted waste in Mauritius goes to Mare Chicose landfill, making waste reduction and proper sorting essential.",
    incorrectExplanation: "Incorrect. Mare Chicose is the central landfill site in Mauritius."
  },
  {
    order: 2,
    question: "Why must employees follow explicit workplace bin labels instead of assuming a universal national color scheme?",
    options: [
      "Waste collection rules depend on the specific collector contracted by your employer",
      "Commercial bins are only decorative",
      "All Mauritian workplaces use identical private recycling trucks",
      "Only organic food waste is collected in Mauritius"
    ],
    correct: 0,
    correctExplanation: "Different employers contract different waste collection services with unique guidelines and accepted items.",
    incorrectExplanation: "Incorrect. Bin systems and accepted materials vary by employer and waste collector."
  },
  {
    order: 3,
    question: "How does food grease or residual liquid affect a bin of clean paper and cardboard?",
    options: [
      "It ruins paper fibers during repulping, often causing the entire batch to be sent to landfill",
      "It gets washed off automatically during industrial paper recycling",
      "It turns the paper into organic compost instantly",
      "It increases the commercial value of recycled paper"
    ],
    correct: 0,
    correctExplanation: "Grease and moisture disrupt repulping processes, contaminating dry paper streams beyond recovery.",
    incorrectExplanation: "Incorrect. Food oil and moisture permanently spoil recyclable paper streams."
  },
  {
    order: 4,
    question: "Which item requires special hazardous waste handling and should NEVER go into standard office recycling or general bins?",
    options: [
      "Used batteries and electronic waste",
      "Clean PET plastic water bottles",
      "Flattened cardboard shipping boxes",
      "Clean aluminum soda cans"
    ],
    correct: 0,
    correctExplanation: "Batteries contain hazardous heavy metals and chemicals that require dedicated collection procedures.",
    incorrectExplanation: "Incorrect. Batteries and e-waste must be escalated to special collection points."
  },
  {
    order: 5,
    question: "What is the best action when preparing a plastic bottle containing leftover liquid for recycling?",
    options: [
      "Empty all liquid, rinse if possible, and place in the plastic recycling bin",
      "Throw it into the recycling bin with the liquid inside",
      "Throw it into the paper recycling bin",
      "Leave it on your desk for cleaning staff to handle"
    ],
    correct: 0,
    correctExplanation: "Emptying liquids prevents leaks that destroy adjacent paper and cardboard recyclables.",
    incorrectExplanation: "Incorrect. Liquids must be emptied before placing containers into recycling streams."
  }
];

export async function ensureWasteSortingCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 2 by ID 2 or slug
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
        throw new Error("Course 2 not seeded by catalogue skeletons bootstrap!");
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
        logger.info({ courseId, slug: COURSE_SLUG }, "Waste Sorting course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course 2. Re-seeding course content and lessons transactionally...");

      // 4. Resolve next recommended course dynamically by slug
      const [nextCourse] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.slug, "energy-efficiency-at-work"))
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
          icon: "recycle",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 7,
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

      logger.info({ courseId, slug: COURSE_SLUG }, "Waste Sorting & Mauritian Bin System course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Waste Sorting course");
  }
}
