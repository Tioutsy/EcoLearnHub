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

const COURSE_ID = 2;
const COURSE_SLUG = "waste-sorting-mauritian-bin-system";
const COURSE_TITLE = "Waste Sorting & the Mauritian Bin System";
const BADGE_SLUG = "sorting-champion";
const SEED_NAME = "waste-sorting-mauritian-bin-system-v1";

const COURSE_META = {
  description:
    "Help employees identify common workplace waste, make better sorting decisions, reduce contamination and understand that recycling arrangements can differ between workplaces and collection providers.",
  fullDescription:
    "This course covers simple habits and systems that can lower environmental impact through correct waste separation and recycling. Tailored specifically for Mauritian workplaces, it highlights the local island realities and explains why you must follow workplace labels rather than guessing.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "1400.00",
  level: "Foundation",
  isFeatured: false,
  thumbnailUrl: "/images/courses/waste-sorting.png",
  learningObjectives: [
    "Distinguish between recyclable, non-recyclable, organic and potentially hazardous workplace waste.",
    "Identify common causes of recycling contamination.",
    "Use workplace bin labels and collection instructions correctly.",
    "Make appropriate sorting decisions in realistic Mauritian workplace situations.",
    "Take one practical action to improve waste sorting at work."
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
    content: "Understand why checking bin labels is the golden rule.",
    blocks: [
      { id: "ws1-h1", type: "heading", position: 1, headingText: "Where Does This Go?" },
      { id: "ws1-t1", type: "short_text", position: 2, bodyText: "When you have waste to dispose of at work, how do you decide which bin to use? Guess-based sorting often leads to contamination, which means recyclable items end up in Mare Chicose landfill instead." },
      { id: "ws1-k1", type: "key_message", position: 3, headingText: "Follow Workplace Labels First", bodyText: "Different companies use different waste collectors and bin systems. The golden rule is always to follow the labels on your bins rather than guessing or assuming a generic color system applies." },
      {
        id: "ws1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Try this workplace decision scenario:",
        decisionPrompt: "You have a lunch container that has some plastic parts but also paper labels. You are not sure which recycling bin it belongs to. What do you do?",
        decisionChoices: [
          { label: "Read the labels on the kitchen sorting station bins before discarding it", correct: true, feedback: "Perfect! Workplace labels are the most accurate guide for your specific site's waste collection." },
          { label: "Throw it in the nearest yellow bin because it looks mostly like plastic", correct: false, feedback: "Incorrect. Guessing can lead to recycling contamination." },
          { label: "Throw it in the general waste bin to avoid thinking about it", correct: false, feedback: "That goes straight to Mare Chicose. It is better to check the labels first." }
        ]
      },
      {
        id: "ws1-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "Why should you always follow your workplace labels instead of relying on a general color rule?",
        mcqOptions: [
          "Bin colors and accepted materials can vary between sites and collection providers",
          "Workplaces do not really care about recycling",
          "All offices use the exact same waste collector",
          "Only organic waste is collected in Mauritius"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Recycling arrangements are set by specific companies and their chosen waste collectors. Always follow local labels.",
        mcqIncorrectExplanation: "Incorrect. Bin systems can differ between sites and collectors."
      }
    ]
  },
  {
    order: 1,
    title: "What Happens After We Throw Something Away?",
    minutes: 3,
    content: "Discover why clean separation matters.",
    blocks: [
      { id: "ws2-h1", type: "heading", position: 1, headingText: "The Journey of Waste" },
      { id: "ws2-t1", type: "short_text", position: 2, bodyText: "When you drop something in a bin, its journey is just beginning. How we sort it determines whether it is recovered as a resource or buried in the ground." },
      { id: "ws2-k1", type: "key_message", position: 3, headingText: "The Waste Journey in Mauritius", bodyText: "Mixed general waste goes to the Mare Chicose landfill, which has limited capacity. Clean, sorted materials are taken by approved collectors to processing centres to be recycled into new products." },
      {
        id: "ws2-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "A logistics scenario:",
        decisionPrompt: "You see the cleaning team collecting trash, and they notice recyclables are mixed with organic food scraps. What is the impact?",
        decisionChoices: [
          { label: "The entire batch may be rejected and sent to the landfill", correct: true, feedback: "Exactly. Mixed food residue contaminates paper and cardboard, making them unrecyclable." },
          { label: "They will sort it out piece by piece at the truck", correct: false, feedback: "Collectors do not hand-separate contaminated waste; it goes to landfill." },
          { label: "It will naturally biodegrade in the plastic bin", correct: false, feedback: "Plastic bins do not biodegrade, and mixed waste doesn't decompose properly in landfills." }
        ]
      },
      {
        id: "ws2-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "What happens to a bin of recyclable paper if it is mixed with food scraps?",
        mcqOptions: [
          "It is sent to the landfill because food residue contaminates the paper",
          "It is washed and recycled anyway",
          "It is turned into organic compost",
          "It is exported for free"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Food residue spoils paper fibers, making them impossible to recycle.",
        mcqIncorrectExplanation: "Incorrect. Contamination ruins paper recycling."
      }
    ]
  },
  {
    order: 2,
    title: "Recognising Common Workplace Waste",
    minutes: 3,
    content: "Learn how typical workplace materials are classified.",
    blocks: [
      { id: "ws3-h1", type: "heading", position: 1, headingText: "Material Classifications" },
      { id: "ws3-t1", type: "short_text", position: 2, bodyText: "Typical workplace materials belong in different streams. Let's look at how they are classified." },
      {
        id: "ws3-k1",
        type: "key_message",
        position: 3,
        headingText: "Common Material Categories",
        bodyText: "• Clean recyclables: Clean paper, cardboard, plastic bottles, glass jars, and aluminium cans.\n• General/Residual waste: Food-contaminated packaging, greasy boxes, and soiled tissues.\n• Special waste: Batteries, electronic equipment, and printer cartridges."
      },
      {
        id: "ws3-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Approved Collectors Dictate Rules",
        bodyText: "Always check your workplace instructions. What is accepted for recycling at one office might not be accepted at another because they use different waste collection providers."
      },
      {
        id: "ws3-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "Which of the following is considered special waste and should never be put in general or recycling bins?",
        mcqOptions: [
          "Used printer cartridges and batteries",
          "Clean plastic bottles",
          "Aluminium cans",
          "Fruit peels"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Batteries and electronics contain hazardous materials and must go to a dedicated special collection point.",
        mcqIncorrectExplanation: "Incorrect. Batteries and e-waste require specialized handling."
      }
    ]
  },
  {
    order: 3,
    title: "Contamination — When One Wrong Item Affects the Bin",
    minutes: 4,
    content: "See how food residue and liquids ruin recycling.",
    blocks: [
      { id: "ws4-h1", type: "heading", position: 1, headingText: "Contamination and How to Prevent It" },
      { id: "ws4-t1", type: "short_text", position: 2, bodyText: "Contamination happens when non-recyclable or dirty items are placed in recycling bins, spoiling clean materials." },
      {
        id: "ws4-w1",
        type: "workplace_example",
        position: 3,
        headingText: "Mauritian Workplace Contamination",
        bodyText: "In a hotel restaurant or office canteen, putting a half-empty fruit juice box into the paper bin will soak and ruin the clean cardboard around it."
      },
      {
        id: "ws4-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Cafeteria scenario:",
        decisionPrompt: "You have a plastic bottle that is half-full of soda. What do you do before discarding it?",
        decisionChoices: [
          { label: "Empty the liquid, rinse if possible, and place in the plastic recycling bin", correct: true, feedback: "Perfect! Emptying and rinsing prevents liquid from leaking and contaminating other materials." },
          { label: "Throw it directly in the recycling bin with the soda inside", correct: false, feedback: "Incorrect. Liquids leak and contaminate dry recyclables like paper." },
          { label: "Leave it on the table for the cleaners to empty", correct: false, feedback: "Cleaners may not have time to empty individual bottles; do it yourself." }
        ]
      },
      {
        id: "ws4-d2",
        type: "decision_scenario",
        position: 5,
        decisionIntro: "Catering scenario:",
        decisionPrompt: "You have a cardboard pizza box from team lunch that has some cheese and oil stuck to the bottom. What do you do?",
        decisionChoices: [
          { label: "Tear off the clean top part for recycling, and throw the greasy bottom in general waste", correct: true, feedback: "Excellent. Separating clean cardboard from grease-soiled parts maximizes recycling." },
          { label: "Throw the entire greasy box in the paper recycling bin", correct: false, feedback: "Incorrect. Grease ruins paper recycling processes." },
          { label: "Throw the entire box in the organic bin", correct: false, feedback: "Cardboard with synthetic liners or excessive grease cannot easily be composted unless specified." }
        ]
      },
      {
        id: "ws4-p1",
        type: "practical_action",
        position: 6,
        headingText: "Empty, Separate, and Clean",
        bodyText: "Before recycling, perform these actions: empty liquids, separate different materials (like plastic caps from glass jars), and keep recyclables dry."
      }
    ]
  },
  {
    order: 4,
    title: "Sorting in Real Workplace Situations",
    minutes: 4,
    content: "Apply sorting choices in canteens, canteens, and maintenance areas.",
    blocks: [
      { id: "ws5-h1", type: "heading", position: 1, headingText: "Workplace Case Studies" },
      { id: "ws5-t1", type: "short_text", position: 2, bodyText: "Let's apply waste sorting rules in different workplace environments in Mauritius." },
      {
        id: "ws5-d1",
        type: "decision_scenario",
        position: 3,
        decisionIntro: "Restaurant & Canteen Situation:",
        decisionPrompt: "You work in a staff canteen and are clearing plates. You have vegetable scraps, clean drink cans, and broken ceramic plates. How do you sort them?",
        decisionChoices: [
          { label: "Vegetables in organic, cans in recycling, and broken ceramics in general waste", correct: true, feedback: "Perfect. Ceramics are not recyclable in standard bins, vegetables can be composted, and cans are recyclable." },
          { label: "Put everything together in the black bin to clear tables faster", correct: false, feedback: "This wastes valuable organic compost and recyclable metal." },
          { label: "Recycle the ceramics and cans together", correct: false, feedback: "Ceramics contaminate glass/metal recycling streams." }
        ]
      },
      {
        id: "ws5-d2",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Retail & Warehouse Situation:",
        decisionPrompt: "You are unpacking inventory in a retail warehouse. You have large clean cardboard boxes and plastic shipping straps. The blue bin is labeled 'Cardboard only'. What do you do?",
        decisionChoices: [
          { label: "Place only the cardboard in the blue bin, and throw the plastic straps in general waste", correct: true, feedback: "Excellent. Adhering strictly to collector instructions ensures the cardboard batch remains clean." },
          { label: "Throw both cardboard and plastic straps in the blue bin", correct: false, feedback: "Plastic straps contaminate the cardboard recycling stream." },
          { label: "Leave them mixed on the warehouse floor", correct: false, feedback: "This is a safety hazard and creates clutter." }
        ]
      },
      {
        id: "ws5-d3",
        type: "decision_scenario",
        position: 5,
        decisionIntro: "Maintenance workshop:",
        decisionPrompt: "You find empty aerosol spray cans and dried paint pots in the maintenance workshop. How do you dispose of them?",
        decisionChoices: [
          { label: "Separate them and check the hazardous/special waste instructions", correct: true, feedback: "Exactly. Aerosols and paint pots are special waste and require dedicated safety disposal." },
          { label: "Throw them in the general waste bin", correct: false, feedback: "This poses safety and environmental risks in the general landfill." },
          { label: "Place them in the yellow recycling bin", correct: false, feedback: "Aerosols and paint contaminate standard packaging recycling." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Waste-Sorting Commitment",
    minutes: 3,
    content: "Make your workplace pledges.",
    blocks: [
      { id: "ws6-h1", type: "heading", position: 1, headingText: "Pledge to Act" },
      { id: "ws6-t1", type: "short_text", position: 2, bodyText: "Great work! You have finished the lessons. Now choose the habits you will carry forward in your workplace." },
      {
        id: "ws6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select the commitments you will practice at work. Choose at least one:",
        commitmentOptions: [
          { value: "check-label", label: "Check the label before using a bin", description: "Always read the label to ensure the item is accepted." },
          { value: "keep-food-out", label: "Keep food and liquids out of dry-recycling bins", description: "Empty and rinse containers to avoid contamination." },
          { value: "ask-unsure", label: "Ask when I am unsure", description: "Consult your team or supervisor instead of guessing." },
          { value: "report-unclear", label: "Report unclear or missing bin labels", description: "Help your colleagues make correct sorting choices." },
          { value: "reduce-single-use", label: "Reduce unnecessary single-use items", description: "Prevent waste before it starts by using reusables." },
          { value: "keep-tidy", label: "Help keep the waste area tidy", description: "Ensure bin lids are closed and materials are neatly sorted." }
        ]
      }
    ]
  }
];

const NEW_QUIZ = [
  { order: 1, question: "Where does most unsorted workplace waste in Mauritius end up?", options: ["The Mare Chicose landfill", "A local community compost site", "Exported to international recycling markets", "Incinerated at sea"], correct: 0, correctExplanation: "Most unsorted waste in Mauritius goes to the Mare Chicose landfill, making prevention and sorting critical to reduce landfill pressure.", incorrectExplanation: "Incorrect. Mare Chicose is the central landfill for the island." },
  { order: 2, question: "Why should you always check the label on your workplace bins instead of assuming a color rule?", options: ["Workplace recycling rules depend on the chosen waste collector and may vary by site", "Workplace bins are only decorative", "Workplace waste is not sorted by hand", "Colors are randomly chosen by the cleaners"], correct: 0, correctExplanation: "Bin systems and accepted materials are determined by the company's approved collector, which differs across sites.", incorrectExplanation: "Incorrect. Specific sites contract specific collection services with distinct guidelines." },
  { order: 3, question: "A paper recycling bin has been contaminated with organic food scraps. What is the most likely consequence?", options: ["The entire batch of paper may be rejected and sent to the landfill", "The paper is washed and recycled normally", "The food is separated manually at the truck", "The paper turns into compost"], correct: 0, correctExplanation: "Food grease and liquids contaminate paper fibers, making them unrecyclable. The contaminated batch is discarded.", incorrectExplanation: "Incorrect. Liquid and food residue contaminate cardboard and paper beyond recovery." },
  { order: 4, question: "Which of the following is considered special waste and must never be thrown in general or recycling bins?", options: ["Used printer cartridges and batteries", "Empty glass water bottles", "Clean cardboard packaging", "Rinsed plastic containers"], correct: 0, correctExplanation: "E-waste, batteries, and cartridges contain hazardous elements and need specialized collection points.", incorrectExplanation: "Incorrect. Printer cartridges and batteries contain chemicals requiring hazardous waste management." },
  { order: 5, question: "You have a clean glass container and a plastic cap. The bin is labeled 'Plastic and Glass'. What is the best practice?", options: ["Separate the plastic cap from the glass container, then recycle both", "Throw them in general waste to save sorting time", "Keep the plastic cap screwed tightly onto the glass container", "Recycle only the glass container and throw the cap away"], correct: 0, correctExplanation: "Separating different materials makes sorting at the processing facility much easier and cleaner.", incorrectExplanation: "Incorrect. Removing caps and separating components facilitates processing." },
  { order: 6, question: "A plastic bottle contains some leftover soft drink. What should you do before placing it in the recycling bin?", options: ["Empty the liquid completely, rinse if possible, and recycle", "Throw it in recycling with the liquid inside", "Place it in the organic compost bin", "Throw it in general waste immediately"], correct: 0, correctExplanation: "Emptying and rinsing prevents liquids from leaking and contaminating other dry recyclables.", incorrectExplanation: "Incorrect. Remaining liquids can leak out and soil other clean packaging in the bin." },
  { order: 7, question: "You have a cardboard food box that is heavily soiled with grease. How should it be sorted?", options: ["General waste bin, or tear off any clean parts for recycling", "Yellow recycling bin with the clean paper", "Organic bin for composting", "Hazardous special waste drop-off point"], correct: 0, correctExplanation: "Grease ruins paper recycling. Clean parts can be recycled, but heavily soiled parts must go to general waste.", incorrectExplanation: "Incorrect. Grease and oil residue disrupt the paper repulping process." },
  { order: 8, question: "According to the waste hierarchy, which action is the most preferred environmental choice?", options: ["Refusing single-use cups and reducing unnecessary packaging", "Recycling plastic bottles in the yellow bin", "Burying waste in a double-lined landfill", "Recovering energy from waste incineration"], correct: 0, correctExplanation: "Refusing and reducing waste lies at the top of the hierarchy because preventing waste is always better than managing it.", incorrectExplanation: "Incorrect. Waste prevention (refusing/reducing) is always preferred over recycling or disposal." }
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

      // 3. Evaluate integrity violations (incomplete or placeholder checks)
      const hasMissingLessons = existingLessons.length !== 6;
      const hasEmptyBlocks = existingLessons.some(
        (l) => !l.contentBlocks || !Array.isArray(l.contentBlocks) || l.contentBlocks.length === 0
      );
      const hasPlaceholderText = existingLessons.some(
        (l) => l.title.includes("[DRAFT SKELETON]") || (l.content || "").includes("[DRAFT SKELETON]")
      );
      const hasMissingQuiz = existingQuizQuestions.length !== 8;
      const hasPlaceholderQuiz = existingQuizQuestions.some(
        (q) => q.question.includes("[DRAFT SKELETON]")
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
        logger.info({ courseId, slug: COURSE_SLUG }, "Waste Sorting course content and integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing seed detected for Course 2. Re-seeding course content and lessons transactionally...");

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
      // To preserve admin manual modifications to lesson orders, only insert/overwrite our specific 6 lessons
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
          version: 1,
        });
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Waste Sorting & Mauritian Bin System course seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Waste Sorting course");
  }
}
