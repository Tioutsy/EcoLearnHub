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

const COURSE_ID = 11;
const COURSE_SLUG = "circular-economy";
const COURSE_TITLE = "Circular Economy";
const BADGE_SLUG = "circular-economy-practitioner";
const SEED_NAME = "circular-economy-v2";
const SKELETON_BADGE_SLUG = "circular-economy-badge"; // catalogue skeleton slug — do not delete

const COURSE_META = {
  description:
    "Learn how workplaces can prevent waste, extend product useful life, retain material value, and make circular operational decisions beyond basic recycling.",
  fullDescription:
    "This course provides employees across all roles with a practical, workplace-focused introduction to circular economy principles. Learn how organizations transition from linear 'take-make-dispose' habits to value-retention practices, apply the 9-step Circular Value Hierarchy, execute the CHECK–USE–CARE–SHARE–RECOVER protocol, and protect product safety and data security.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "1400.00",
  level: "ESG and Compliance",
  isFeatured: false,
  thumbnailUrl: "/images/courses/circular-economy.jpg",
  learningObjectives: [
    "Explain the difference between a linear economy and a circular economy in plain workplace language.",
    "Distinguish high-value circular actions (repair, reuse, refurbishment) from lower-value material recycling.",
    "Apply the 9-step Circular Value Hierarchy across purchasing, maintenance, operations, and asset disposal.",
    "Execute the 5-step CHECK–USE–CARE–SHARE–RECOVER operational protocol.",
    "Avoid high-risk mistakes such as ordering duplicates without checking stock, discarding repairable equipment, or donating IT devices without data wipes.",
    "Evaluate role-based micro-decisions across general staff, facilities, procurement, finance, HR, IT, operations, sales, managers, and contractors.",
    "Select one practical workplace circular commitment to prevent waste and retain product value."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "You have completed Circular Economy. You can now recognize where workplace products retain value, prioritize repair and reuse over disposal, and apply CHECK–USE–CARE–SHARE–RECOVER protocols safely.",
  badgeName: "Circular Workplace Practitioner",
  badgeDescription:
    "Awarded for demonstrating practical awareness of circular economy principles, value retention, equipment maintenance, and responsible material recovery.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Linear vs. Circular: Retaining Workplace Value",
    minutes: 3,
    content: "Learn how linear habits destroy value and why circular thinking prevents waste before it is created.",
    blocks: [
      { id: "ce1-h1", type: "heading", position: 1, headingText: "Where Does Workplace Value Go?" },
      { id: "ce1-t1", type: "short_text", position: 2, bodyText: "A commercial company storeroom contains functional office chairs scheduled for dumping due to minor armrest scratches, unopened cleaning chemicals nearing expiry, unassessed electronic equipment, and discarded single-use cardboard delivery boxes. Simultaneously, procurement receives urgent requests to order brand-new chairs and chemicals." },
      { id: "ce1-k1", type: "key_message", position: 3, headingText: "Linear vs. Circular Economy", bodyText: "• Linear Economy ('Take–Make–Dispose'): Raw materials are extracted, manufactured into products, used briefly, and thrown away as waste.\n• Circular Economy ('Prevent–Use–Care–Share–Recover'): Workplace systems keep products, components, and materials at their highest utility and value for as long as possible through repair, reuse, refurbishment, and responsible recovery." },
      {
        id: "ce1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Evaluating office chair disposal scenario:",
        decisionPrompt: "A company plans to replace 30 office chairs. Inspection shows 20 are fully functional, 5 need minor bolt tightening, and 5 are severely broken. What is the most circular response?",
        decisionChoices: [
          { label: "Inspect and clean the 20 good chairs, repair the 5 minor defects, and order replacement parts or new units only for the 5 broken ones", correct: true, feedback: "Outstanding! This preserves maximum financial and material value while preventing unnecessary expenditure and landfill waste." },
          { label: "Dispose of all 30 chairs in a landfill skip to ensure matching new furniture", correct: false, feedback: "Incorrect! Throwing away functioning assets destroys embodied material value and wastes company capital." },
          { label: "Send all 30 chairs directly to a plastic recycler without assessing repair", correct: false, feedback: "Incorrect. Recycling shreds materials and loses manufacturing value; repair and reuse must come first!" }
        ]
      },
      {
        id: "ce1-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "Why is material recycling considered a lower-value option than repair or reuse in a circular economy?",
        mcqOptions: [
          "Recycling breaks down products into raw materials, losing the embodied labor, manufacturing energy, and functional value retained by repair or reuse",
          "Recycling is strictly illegal in all commercial workplaces",
          "Recycling requires all employees to hold engineering degrees",
          "Recycling automatically creates toxic air pollution in office canteens"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Recycling shreds products into raw materials, destroying the manufacturing and functional value preserved by repair or reuse.",
        mcqIncorrectExplanation: "Incorrect. Repair and reuse preserve functional utility and manufacturing energy far better than recycling."
      }
    ]
  },
  {
    order: 1,
    title: "The 9-Step Circular Value Hierarchy",
    minutes: 4,
    content: "Master the 9-level circular value hierarchy to guide operational purchasing and asset decisions.",
    blocks: [
      { id: "ce2-h1", type: "heading", position: 1, headingText: "The Value Retention Order" },
      { id: "ce2-t1", type: "short_text", position: 2, bodyText: "When evaluating workplace products, equipment, and packaging, follow the 9-step value retention hierarchy:" },
      {
        id: "ce2-k1",
        type: "key_message",
        position: 3,
        headingText: "The 9-Step Circular Hierarchy",
        bodyText: "1. Question the Need: Avoid unnecessary purchases.\n2. Reduce: Minimize material use per operation.\n3. Choose Durable: Purchase long-lasting, repairable items.\n4. Maintain: Conduct routine preventative maintenance.\n5. Repair: Fix broken components promptly.\n6. Reuse / Redistribute: Share usable items across departments.\n7. Refurbish: Restore worn assets to original condition.\n8. Recover Materials (Recycle): Process materials responsibly when reuse ends.\n9. Safe Disposal: Landfill or incinerate only as an absolute last resort."
      },
      {
        id: "ce2-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "According to the United Nations Environment Programme (UNEP) and the European Commission Circular Economy Action Plan, over 80% of a product's environmental impacts across its lifecycle are determined during the initial design and procurement phase! Extending product useful life by just 1–2 years reduces emissions and resource demand far more than recycling alone."
      }
    ]
  },
  {
    order: 2,
    title: "The CHECK–USE–CARE–SHARE–RECOVER Protocol",
    minutes: 4,
    content: "Inspect facility asset assessment areas and apply the 5-step operational protocol.",
    blocks: [
      { id: "ce3-h1", type: "heading", position: 1, headingText: "The 5-Step Operational Protocol" },
      { id: "ce3-t1", type: "short_text", position: 2, bodyText: "Apply the 5-step CHECK–USE–CARE–SHARE–RECOVER framework across daily workplace activities:" },
      {
        id: "ce3-k1",
        type: "key_message",
        position: 3,
        headingText: "CHECK–USE–CARE–SHARE–RECOVER",
        bodyText: "• CHECK: Check existing stock and internal availability before ordering new items.\n• USE: Use equipment, chemicals, and supplies efficiently without wasteful excess.\n• CARE: Maintain equipment and store items properly to prevent premature damage.\n• SHARE: Redistribute surplus functional items or return reusable transport packaging.\n• RECOVER: Send genuine end-of-life materials to authorized recovery partners."
      },
      {
        id: "ce3-img1",
        type: "visual_question",
        position: 4,
        imageUrl: "/images/courses/visual-circular-economy.png",
        caption: "Facility Asset Assessment Area: Repair & refurbishing workbench (left), reusable delivery crates & stock shelves by expiry (center), locked IT data sanitization cage (right), and logistics manager logging asset tags.",
        imageAlt: "Realistic photograph of a Mauritian commercial facility storeroom showing a labelled repair workbench with tools and chairs, stacked reusable delivery crates, shelves with expiry dates, a lockable wire cage holding IT computer hardware, and a facility manager inspecting asset tags on a tablet."
      },
      {
        id: "ce3-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "In the facility asset assessment scene above, why is computer hardware kept in a lockable wire cage marked for data sanitization before reuse or recycling?",
        mcqOptions: [
          "To protect confidential company and client data through certified data wiping before computers are redistributed or recycled",
          "To hide old computers so inspectors think the facility owns no electronics",
          "Because computers generate magnetic radiation that ruins wooden pallets",
          "To prevent employees from playing video games during lunch breaks"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Data-bearing electronics require certified data sanitization and physical security to prevent confidential data breaches during circular reuse or recycling.",
        mcqIncorrectExplanation: "Incorrect. Data-bearing hardware requires secure storage and certified data wiping before reuse or recovery."
      }
    ]
  },
  {
    order: 3,
    title: "Worked Resort Scenario & Material Safeguards",
    minutes: 4,
    content: "Analyze a worked Mauritian resort scenario and review safety, hygiene, and data protection safeguards.",
    blocks: [
      { id: "ce4-h1", type: "heading", position: 1, headingText: "Hotel Asset Refurbishment Worked Example" },
      { id: "ce4-t1", type: "short_text", position: 2, bodyText: "Examine how a Mauritian beach resort manages room refurbishment:" },
      {
        id: "ce4-w1",
        type: "workplace_example",
        position: 3,
        headingText: "Worked Example: Resort Refurbishment & Reusable Crates",
        bodyText: "A resort updates 50 guest rooms:\n• Wooden Furniture: Inspected and re-varnished on-site by maintenance (Refurbishment).\n• Linens & Towels: Cleaned, graded, and repurposed as kitchen cleaning rags (Repurposing).\n• Supplier Deliveries: Drinks and dry goods delivered in heavy-duty reusable plastic crates returned to vendors (Circular Packaging).\n• Mattresses: Unusable worn mattresses sent to licensed foam recyclers (Responsible Recovery)."
      },
      {
        id: "ce4-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Urgent room clearance scenario:",
        decisionPrompt: "A manager orders an employee to 'dump everything in the storeroom into a waste skip immediately' because a VIP client is arriving in 30 minutes. The storeroom contains spare furniture, unopened lightbulbs, and old laptops. What is the correct response?",
        decisionChoices: [
          { label: "Secure the storeroom door, move items neatly to designated asset zones (repair, stock, IT lockup), and explain the asset preservation steps to the manager", correct: true, feedback: "Correct! Securing and organizing assets prevents valuable stock destruction and protects IT data security." },
          { label: "Throw all items, including laptops and unopened stock, into the outdoor trash skip", correct: false, feedback: "NEVER destroy valuable stock or data-bearing IT equipment for quick appearance!" },
          { label: "Give the laptops away to strangers on the street without wiping hard drives", correct: false, feedback: "NEVER distribute data-bearing IT devices without certified data sanitization!" }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "High-Risk Mistakes & Role-Based Micro-Decisions",
    minutes: 3,
    content: "Avoid prohibited circular mistakes and practice role-based decisions across corporate departments.",
    blocks: [
      { id: "ce5-h1", type: "heading", position: 1, headingText: "Prohibited Circular Mistakes" },
      { id: "ce5-t1", type: "short_text", position: 2, bodyText: "NEVER engage in these high-risk operational behaviors:" },
      {
        id: "ce5-k1",
        type: "key_message",
        position: 3,
        headingText: "Prohibited Actions",
        bodyText: "• DO NOT order new equipment or supplies without checking existing stock or internal asset registries.\n• DO NOT discard repairable furniture, tools, or appliances without technical assessment.\n• DO NOT donate or transfer data-bearing electronics without certified data sanitization.\n• DO NOT perform unapproved repairs on safety-critical equipment (electrical panels, pressure vessels, lifting gear).\n• DO NOT label single-use plastic items as 'fully circular' merely because they are theoretically recyclable."
      },
      {
        id: "ce5-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "IT & Facilities Micro-Decision:",
        decisionPrompt: "An IT department is replacing 15 desktop monitors. The old monitors work perfectly but are 3 years old. What is the most circular IT action?",
        decisionChoices: [
          { label: "Wipe data logs, test electrical safety, and reallocate the working monitors to training rooms or branch offices needing upgrades", correct: true, feedback: "Outstanding! Internal redistribution extends asset life, saves capital, and avoids electronic waste." },
          { label: "Smash the monitors with a hammer and dump them in a general waste bin", correct: false, feedback: "Incorrect! Smashing working monitors causes electronic waste pollution and hazardous glass breakage." },
          { label: "Store the monitors in a wet outdoor shed until they rust and break", correct: false, feedback: "Incorrect. Improper storage damages usable assets; reallocate or store them properly!" }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Circular Economy Commitment & Disclaimer",
    minutes: 3,
    content: "Select practical daily workplace commitments and review the circular economy disclaimer.",
    blocks: [
      { id: "ce6-h1", type: "heading", position: 1, headingText: "Pledge to Act" },
      { id: "ce6-t1", type: "short_text", position: 2, bodyText: "Congratulations on completing the lessons! Select the circular habits you commit to practice in your daily work routine." },
      {
        id: "ce6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your daily workplace circular economy commitments (choose at least one):",
        commitmentOptions: [
          { value: "apply-check-use-care", label: "Apply the CHECK–USE–CARE–SHARE–RECOVER protocol before requesting new purchases", description: "Verify existing stock and asset availability before buying new items." },
          { value: "prioritize-repair-refurbishment", label: "Prioritize equipment maintenance, repair, and refurbishment over immediate replacement", description: "Extend product useful life and retain material value." },
          { value: "protect-data-security", label: "Ensure data-bearing IT devices undergo certified data wiping before reuse or recycling", description: "Safeguard company and customer data privacy." },
          { value: "return-reusable-packaging", label: "Return reusable delivery crates, pallets, and containers to suppliers promptly", description: "Support circular supply-chain packaging loops." },
          { value: "report-circular-opportunities", label: "Report idle, surplus, or repairable assets to department leads for internal redistribution", description: "Prevent unnecessary waste and reduce corporate expenditure." }
        ]
      },
      {
        id: "ce6-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Course Disclaimer",
        bodyText: "DISCLAIMER: This course provides general workplace awareness. Specific technical, safety, data security, and waste regulations vary by facility and sector. Employees must follow their organisation's approved procedures and obtain appropriate technical or safety authorization before modifying or transferring equipment."
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "What is the core difference between a Linear Economy and a Circular Economy?",
    options: [
      "Linear economies follow a 'Take–Make–Dispose' model; Circular economies keep products, components, and materials at high value through prevention, maintenance, repair, reuse, and recovery",
      "Linear economies only operate in round office buildings; Circular economies only operate in straight lines",
      "Linear economies ban all electricity; Circular economies require all staff to ride bicycles",
      "There is no difference; both terms mean dumping waste into rivers"
    ],
    correct: 0,
    correctExplanation: "Linear economies dispose of products rapidly; Circular economies retain product utility and material value for as long as possible.",
    incorrectExplanation: "Incorrect. Circular economies prioritize value retention, repair, and reuse over rapid disposal."
  },
  {
    order: 2,
    question: "In the 9-step Circular Value Hierarchy, which action should be taken BEFORE sending a damaged item to a material recycler?",
    options: [
      "Inspect the item to evaluate whether it can be maintained, repaired, reused, or refurbished",
      "Immediately burn the item to generate ash for gardens",
      "Throw the item into a river so water washes it away",
      "Order five new replacements before checking the damaged item"
    ],
    correct: 0,
    correctExplanation: "Maintenance, repair, reuse, and refurbishment retain higher functional value than material recycling.",
    incorrectExplanation: "Incorrect. Repair and reuse options must always be evaluated before material recycling."
  },
  {
    order: 3,
    question: "What essential safeguard MUST be completed before surplus company laptop computers are redistributed or sent for external recycling?",
    options: [
      "Certified data sanitization (data wiping) and electrical safety testing to protect confidential information and user safety",
      "Painting all laptop screens bright green",
      "Removing all keys from the keyboard so no one can type",
      "Dipping the laptops in sea water to wash off dust"
    ],
    correct: 0,
    correctExplanation: "Data-bearing electronics require certified data wiping and safety testing before reuse or recycling.",
    incorrectExplanation: "Incorrect. Certified data wiping is mandatory for data protection compliance."
  },
  {
    order: 4,
    question: "A company facility receives weekly deliveries of dry goods. Which packaging arrangement represents a circular economy practice?",
    options: [
      "Using heavy-duty reusable plastic crates that are collected, cleaned, and refilled by the supplier on each delivery run",
      "Using single-use cardboard boxes and throwing them in a general trash skip after one use",
      "Wrapping every box in ten layers of non-recyclable plastic foil and burning it behind the warehouse",
      "Demanding suppliers deliver goods in unlabelled glass jars with no lids"
    ],
    correct: 0,
    correctExplanation: "Reusable transport crates collected and refilled by suppliers create a closed-loop circular packaging system.",
    incorrectExplanation: "Incorrect. Reusable delivery crates refilled by suppliers represent circular packaging."
  },
  {
    order: 5,
    question: "What is the first step in the CHECK–USE–CARE–SHARE–RECOVER protocol when a staff member needs additional office supplies?",
    options: [
      "CHECK: Check existing storeroom stock and internal asset availability before requesting new purchases",
      "RECOVER: Dump old supplies in a skip to make room for new boxes",
      "SHARE: Take supplies from a neighboring business without asking",
      "CARE: Hide supplies under your desk so others cannot see them"
    ],
    correct: 0,
    correctExplanation: "Checking existing inventory prevents buying duplicates and saves company capital.",
    incorrectExplanation: "Incorrect. The first step is CHECK existing stock before placing new purchase orders."
  }
];

export async function ensureCircularEconomyCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 11 by courseCode "ELH-11", slug, or ID
      let course = null;
      
      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-11"))
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
        throw new Error("Course ELH-11 / circular-economy not seeded by catalogue skeletons bootstrap!");
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
        logger.info({ courseId, slug: COURSE_SLUG }, "Circular Economy course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course ELH-11. Re-seeding course content and lessons transactionally...");

      // 4. Resolve next recommended course dynamically by slug
      const [nextCourse] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.slug, "industrial-symbiosis-mauritius"))
        .limit(1);
      const nextCourseId = nextCourse?.id ?? null;

      // 5. Update course record slug, title, and metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-11",
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
          icon: "refresh-cw",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 16,
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

      logger.info({ courseId, slug: COURSE_SLUG }, "Circular Economy course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Circular Economy course");
  }
}
