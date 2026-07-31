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

const COURSE_ID = 8;
const COURSE_SLUG = "biodiversity-in-mauritius";
const COURSE_TITLE = "Biodiversity in Mauritius";
const BADGE_SLUG = "biodiversity-aware";
const SEED_NAME = "biodiversity-in-mauritius-v2";
const SKELETON_BADGE_SLUG = "biodiversity-aware"; // catalogue skeleton slug — do not delete

const COURSE_META = {
  description:
    "Learn how routine workplace activities affect Mauritian ecosystems, distinguish native vs. invasive species, and apply the Pause–Protect–Report–Record framework to prevent environmental harm.",
  fullDescription:
    "This course provides employees across all operational roles with a practical, workplace-focused introduction to Mauritian biodiversity. Learn why local ecosystems matter to business resilience, distinguish native, endemic, introduced, and invasive alien species, map workplace impacts across site disturbance, water, waste, lighting, and procurement, and master the Pause–Protect–Report–Record protocol.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "1400.00",
  level: "Foundation",
  isFeatured: false,
  thumbnailUrl: "/images/courses/biodiversity-in-mauritius.jpg",
  learningObjectives: [
    "Explain biodiversity and ecosystem services in plain workplace language.",
    "Distinguish native, endemic, introduced, and invasive alien species with Mauritian examples.",
    "Identify workplace activities that cause habitat disturbance, runoff pollution, or species disruption.",
    "Apply the 4-step Pause–Protect–Report–Record protocol when encountering environmental risks.",
    "Avoid high-risk actions such as wildlife handling, unauthorized vegetation clearing, or herbicide spraying.",
    "Evaluate role-based micro-decisions across facilities, hospitality, procurement, office, and landscaping.",
    "Select one practical workplace biodiversity commitment to support ecosystem protection."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "You have completed Biodiversity in Mauritius. You can now recognise workplace impacts on local ecosystems, distinguish species concepts, and apply Pause–Protect–Report–Record safely.",
  badgeName: "Mauritius Biodiversity Aware",
  badgeDescription:
    "Awarded for demonstrating practical workplace biodiversity awareness, understanding Mauritian ecosystems, and applying Pause–Protect–Report–Record protocols.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Workplace Decisions & Ecosystem Impact",
    minutes: 3,
    content: "Learn how routine site operations connect directly to local Mauritian biodiversity.",
    blocks: [
      { id: "bio1-h1", type: "heading", position: 1, headingText: "Ecological Risks Beyond Site Boundaries" },
      { id: "bio1-t1", type: "short_text", position: 2, bodyText: "On a Monday morning at a Mauritian commercial facility near a coastal drainage channel, a site supervisor notices exterior lights left on in daylight, loose plastic litter clogging a storm drain cover, chemical drums stored beside the drain, and contractors preparing to clear shrubland near a marked native plant restoration zone." },
      { id: "bio1-k1", type: "key_message", position: 3, headingText: "Routine Decisions Have Direct Ecological Consequences", bodyText: "Biodiversity protection is not limited to national parks. Routine site activities—such as lighting draw, waste management, landscaping, and contractor oversight—directly influence surrounding terrestrial, wetland, and lagoon ecosystems." },
      {
        id: "bio1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Evaluating site disturbance scenario:",
        decisionPrompt: "A contractor suggests clearing shrubland near a coastal drainage boundary to store extra equipment, claiming 'it is just wild weeds.' What is the correct initial action?",
        decisionChoices: [
          { label: "Pause work in that area, protect the site boundary, and report to the facility environmental lead to verify habitat status", correct: true, feedback: "Excellent! Pausing and verifying protects sensitive native species and prevents illegal or damaging site clearing." },
          { label: "Allow the clearing to proceed immediately to avoid contractor schedule delays", correct: false, feedback: "Incorrect! Clearing unverified vegetation can destroy native habitats and violate environmental regulations." },
          { label: "Spray chemical herbicides over the shrubland to clear it faster", correct: false, feedback: "NEVER apply unapproved herbicides! Chemical runoff damages drainage soils and nearby aquatic ecosystems." }
        ]
      },
      {
        id: "bio1-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "What is biodiversity in simple workplace terms?",
        mcqOptions: [
          "The variety of living organisms, habitats, and ecological relationships that support ecosystem services",
          "The total number of potted indoor ornamental plants in an office building",
          "A tax paid exclusively by agricultural fruit exporters",
          "A guarantee that a property is free of wild animals and insects"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Biodiversity encompasses all living organisms, habitats, and ecological relationships that sustain essential ecosystem services.",
        mcqIncorrectExplanation: "Incorrect. Biodiversity represents the full variety of life, habitats, and natural systems."
      }
    ]
  },
  {
    order: 1,
    title: "Mauritian Ecosystems & Species Concepts",
    minutes: 4,
    content: "Master native, endemic, introduced, and invasive alien species concepts with local examples.",
    blocks: [
      { id: "bio2-h1", type: "heading", position: 1, headingText: "Four Key Species Classifications" },
      { id: "bio2-t1", type: "short_text", position: 2, bodyText: "Mauritius is an isolated oceanic island with high ecological sensitivity. Understand these four distinct species categories:" },
      {
        id: "bio2-k1",
        type: "key_message",
        position: 3,
        headingText: "Species Categories & Examples",
        bodyText: "• Native Species: Arrived naturally in Mauritius without human aid (e.g. coastal mangroves, seabirds).\n• Endemic Species: Native species found ONLY in Mauritius and nowhere else on Earth (e.g. Mauritius Kestrel, Pink Pigeon, Ebony tree).\n• Introduced Species: Brought to Mauritius by human activity, living in managed environments (e.g. agricultural crops, decorative garden flowers).\n• Invasive Alien Species: Introduced species that spread aggressively and damage native ecosystems (e.g. Strawberry Guava / Goyave de Chine, Privet, Rats, Mongoose)."
      },
      {
        id: "bio2-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "According to the National Parks and Conservation Service (NPCS), Mauritius has over 670 native flowering plant species, of which approximately 45% are endemic! Because native forest remnants now cover less than 5% of the island, protecting remaining native habitats from invasive weeds and workplace disturbance is vital for island survival."
      }
    ]
  },
  {
    order: 2,
    title: "The Workplace Biodiversity Impact Map",
    minutes: 4,
    content: "Map operational activity risks across site disturbance, water, waste, lighting, and procurement.",
    blocks: [
      { id: "bio3-h1", type: "heading", position: 1, headingText: "Five Workplace Impact Categories" },
      { id: "bio3-t1", type: "short_text", position: 2, bodyText: "Examine how five core workplace activities connect directly to local ecological risks:" },
      {
        id: "bio3-k1",
        type: "key_message",
        position: 3,
        headingText: "Impact Categories & Mitigations",
        bodyText: "1. Site & Habitat Disturbance: Land clearing, unapproved storage, heavy equipment movement near vegetation.\n2. Water & Drainage Runoff: Chemical spills, oil leaks, or sediment washing into storm drains and lagoons.\n3. Waste & Plastics: Loose packaging or food waste attracting pests or entering marine environments.\n4. Lighting & Noise Disturbance: Unnecessary exterior night lighting disturbing nocturnal fauna and nesting birds.\n5. Landscaping & Procurement: Purchasing unverified timber/plants or introducing invasive ornamental species."
      },
      {
        id: "bio3-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Lighting Rule: Switch Off Daylight Floodlights",
        bodyText: "CRITICAL OPERATIONAL PRINCIPLE: Ensure exterior security floodlights are switched off during daylight hours. Excessive night lighting near coastal or forest boundaries disrupts nocturnal pollinators and nesting wildlife."
      }
    ]
  },
  {
    order: 3,
    title: "Pause–Protect–Report–Record & Visual Inspection",
    minutes: 4,
    content: "Apply the 4-step protocol and inspect a real Mauritian commercial facility site.",
    blocks: [
      { id: "bio4-h1", type: "heading", position: 1, headingText: "The 4-Step Action Protocol" },
      { id: "bio4-t1", type: "short_text", position: 2, bodyText: "When encountering an environmental hazard or unexpected wildlife on site, follow the Pause–Protect–Report–Record protocol:" },
      {
        id: "bio4-k1",
        type: "key_message",
        position: 3,
        headingText: "Pause–Protect–Report–Record",
        bodyText: "1. PAUSE: Stop or halt disturbance in the immediate area safely.\n2. PROTECT: Keep vehicles, waste, chemicals, and unauthorized staff away from the affected zone.\n3. REPORT: Inform the facility lead, environmental coordinator, or site manager immediately.\n4. RECORD: Log exact facts, time, location, and photos without disturbing wildlife or hazardous spills."
      },
      {
        id: "bio4-img1",
        type: "visual_question",
        position: 4,
        imageUrl: "/images/courses/visual-workplace-biodiversity-risk.png",
        caption: "Facility Site Inspection: Daylight floodlight active, chemical drums near drain, loose litter, marked native restoration zone, and worker photographing site hazards.",
        imageAlt: "Realistic photograph of a Mauritian commercial property compound showing an active daytime floodlight, chemical drums beside an open storm drain, loose plastic litter, a wooden sign reading 'NATIVE SPECIES RESTORATION ZONE - DO NOT DISTURB', and a facility staff member taking a photo to report site risks."
      },
      {
        id: "bio4-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "In the facility site inspection above, what is the best immediate response to the chemical drums stored beside the storm drain?",
        mcqOptions: [
          "Report the improper storage immediately and arrange for chemical drums to be moved to an approved bunded containment area away from drains",
          "Kick the chemical drums into the storm drain cover to clear the yard space",
          "Wash the drums with water so chemical residues flow into the coastal channel",
          "Ignore the drums because they belong to a third-party logistics supplier"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Chemicals stored near open drains present severe runoff risks to coastal ecosystems and must be relocated to secondary containment.",
        mcqIncorrectExplanation: "Incorrect. Storing chemicals near storm drains risks chemical runoff into aquatic environments; proper containment is required."
      }
    ]
  },
  {
    order: 4,
    title: "High-Risk Mistakes & Micro-Decisions",
    minutes: 3,
    content: "Avoid prohibited actions and practice role-based decisions across operational departments.",
    blocks: [
      { id: "bio5-h1", type: "heading", position: 1, headingText: "High-Risk Mistakes to Avoid" },
      { id: "bio5-t1", type: "short_text", position: 2, bodyText: "NEVER engage in these four high-risk operational behaviors:" },
      {
        id: "bio5-k1",
        type: "key_message",
        position: 3,
        headingText: "Prohibited Actions",
        bodyText: "• DO NOT capture, relocate, or handle wild animals, reptiles, or fruit bats yourself.\n• DO NOT feed wild birds or stray animals near food-service or staff eating areas.\n• DO NOT apply unapproved herbicides or pesticides without authorized procedures.\n• DO NOT clear trees, shrubs, or wetlands without written environmental clearance."
      },
      {
        id: "bio5-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Hospitality & Food Service Scenario:",
        decisionPrompt: "Hotel guests and staff frequently leave accessible food waste near a coastal service terrace, attracting crows and rodents. What should the service team do?",
        decisionChoices: [
          { label: "Secure all waste containers with tight-fitting lids, clear tables promptly, and educate staff not to feed animals", correct: true, feedback: "Correct! Securing food waste removes artificial attractants and protects coastal ecological balance." },
          { label: "Leave extra food scraps outside so animals do not disturb guests indoors", correct: false, feedback: "Incorrect! Feeding animals creates pest dependency and damages ecosystem balance." },
          { label: "Spray chemical poison around outdoor dining tables without authorization", correct: false, feedback: "NEVER spray unapproved poisons near dining areas or coastal habitats!" }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Biodiversity Awareness Commitment",
    minutes: 3,
    content: "Select practical daily workplace commitments to protect Mauritian ecosystems.",
    blocks: [
      { id: "bio6-h1", type: "heading", position: 1, headingText: "Pledge to Act" },
      { id: "bio6-t1", type: "short_text", position: 2, bodyText: "Congratulations on completing the lessons! Select the biodiversity protection habits you commit to practice in your daily work routine." },
      {
        id: "bio6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your daily workplace biodiversity commitments (choose at least one):",
        commitmentOptions: [
          { value: "apply-pause-protect-report", label: "Apply the Pause–Protect–Report–Record protocol when encountering habitat risks", description: "Halt disturbance and report environmental concerns promptly." },
          { value: "keep-drains-clean", label: "Keep chemicals, oil, and loose litter away from storm drains and waterways", description: "Prevent harmful runoff from entering rivers and coastal lagoons." },
          { value: "avoid-wildlife-handling", label: "Never capture, relocate, or feed wild animals without specialist authorization", description: "Respect wildlife boundaries and report species sightings safely." },
          { value: "turn-off-daytime-lights", label: "Ensure exterior floodlights are turned off during daylight hours", description: "Reduce unnecessary energy draw and nocturnal wildlife disturbance." },
          { value: "verify-plant-sourcing", label: "Support native plant landscaping and avoid buying invasive alien species", description: "Protect local flora and prevent invasive plant spread." }
        ]
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "What is the difference between a native species and an endemic species in Mauritius?",
    options: [
      "Native species arrived in Mauritius naturally without human aid; endemic species are native species found ONLY in Mauritius and nowhere else on Earth",
      "Native species are imported garden plants; endemic species are wild farm animals",
      "Native species only live in lagoons; endemic species only live in urban offices",
      "There is no difference; both terms mean plastic decorative plants"
    ],
    correct: 0,
    correctExplanation: "Native species arrived naturally; endemic species are unique native species found exclusively in Mauritius.",
    incorrectExplanation: "Incorrect. Endemic species are native species found exclusively in Mauritius."
  },
  {
    order: 2,
    question: "Why is Strawberry Guava (Goyave de Chine) classified as an Invasive Alien Species in Mauritian forests?",
    options: [
      "It spreads aggressively, crowding out native endemic trees and reducing natural forest water catchment capacity",
      "It produces excessive oxygen that harms soil bacteria",
      "It is a protected endemic tree planted by national parks",
      "It requires artificial solar lighting to survive"
    ],
    correct: 0,
    correctExplanation: "Strawberry Guava spreads aggressively, smothering native forests and degrading ecosystem services.",
    incorrectExplanation: "Incorrect. Invasive alien species like Strawberry Guava crowd out native fauna and flora."
  },
  {
    order: 3,
    question: "What should a maintenance employee do if an unfamiliar nest or wild animal is found in a work zone?",
    options: [
      "Follow Pause–Protect–Report–Record: pause work in that area, protect the site, report to the environmental lead, and record facts",
      "Capture the animal in a box and release it in another town",
      "Spray chemical pesticide over the nest immediately",
      "Destroy the nest quickly before anyone notices"
    ],
    correct: 0,
    correctExplanation: "Always apply Pause–Protect–Report–Record to ensure safety and prevent unauthorized species harm.",
    incorrectExplanation: "Incorrect. Apply Pause–Protect–Report–Record instead of capturing or destroying wildlife."
  },
  {
    order: 4,
    question: "Why should chemical drums and loose plastic litter never be stored near open storm drains on commercial property?",
    options: [
      "Rainwater washes chemicals and plastics directly into rivers, wetlands, and coastal lagoons, causing aquatic habitat destruction",
      "Storing items near drains makes the storm water evaporate faster",
      "Plastic litter in drains automatically turns into native fish food",
      "Chemicals in drains increase solar panel power generation"
    ],
    correct: 0,
    correctExplanation: "Storm drains discharge directly into waterways; chemical runoff and plastics degrade aquatic and coastal ecosystems.",
    incorrectExplanation: "Incorrect. Chemical spills and plastic litter entering storm drains destroy aquatic and lagoon habitats."
  },
  {
    order: 5,
    question: "A landscaping contractor offers to sell 'fast-growing exotic groundcover' for an office garden. What should the buyer do before approving?",
    options: [
      "Verify that the plant is non-invasive and preferably native, avoiding species known to spread aggressively into local ecosystems",
      "Approve the purchase immediately without checking plant species lists",
      "Order double the quantity if the plants are bright red",
      "Replace all surrounding trees with concrete to match the groundcover"
    ],
    correct: 0,
    correctExplanation: "Always check plant species to prevent introducing aggressive invasive alien plants into local ecosystems.",
    incorrectExplanation: "Incorrect. Verify plant species to ensure they are non-invasive and eco-friendly."
  }
];

export async function ensureBiodiversityCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 8 by courseCode "ELH-08", slug, or ID
      let course = null;
      
      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-08"))
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
        throw new Error("Course ELH-08 / biodiversity-in-mauritius not seeded by catalogue skeletons bootstrap!");
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
        logger.info({ courseId, slug: COURSE_SLUG }, "Biodiversity in Mauritius course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course ELH-08. Re-seeding course content and lessons transactionally...");

      // 4. Resolve next recommended course dynamically by slug
      const [nextCourse] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.slug, "esg-basics-for-mauritian-business"))
        .limit(1);
      const nextCourseId = nextCourse?.id ?? null;

      // 5. Update course record slug, title, and metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-08",
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
          icon: "leaf",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 13,
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

      logger.info({ courseId, slug: COURSE_SLUG }, "Biodiversity in Mauritius course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Biodiversity in Mauritius course");
  }
}
