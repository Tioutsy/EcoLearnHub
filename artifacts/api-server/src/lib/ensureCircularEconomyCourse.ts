import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
  quizAttemptsTable,
  lessonProgressTable,
} from "@workspace/db";
import { eq, or, inArray } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_ID = 11;
const COURSE_SLUG = "circular-economy";
const COURSE_TITLE = "Circular Economy";
const BADGE_SLUG = "circular-economy-practitioner";
const SEED_NAME = "circular-economy-v1";
const SKELETON_BADGE_SLUG = "circular-economy-badge";

const COURSE_META = {
  description: "Learn how workplaces can prevent waste, extend the useful life of products and equipment, retain material value and make more circular operational decisions.",
  fullDescription: "Learn how workplaces can prevent waste, extend the useful life of products and equipment, retain material value and make more circular operational decisions.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "advanced",
  isFeatured: false,
  thumbnailUrl: "/images/courses/circular-economy.jpg",
  learningObjectives: [
    "Explain the difference between a linear economy and a circular economy.",
    "Recognise that recycling is only one part of circularity.",
    "Identify ways to avoid waste before it is created.",
    "Select options that keep products, equipment and materials useful for longer.",
    "Consider the full workplace life cycle of an item, from need identification to end-of-use.",
    "Recognise how purchasing, maintenance, operations and suppliers contribute to circular outcomes.",
    "Identify one realistic circular-economy action for their own workplace."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Circular Economy. You can now identify where workplace value is being lost and recognise practical opportunities to prevent waste, extend product life and improve end-of-use decisions.",
  badgeName: "Circular Economy Practitioner",
  badgeDescription: "Recognises the ability to identify practical opportunities to prevent waste, extend product life and retain value in workplace systems.",
  recommendedNextCourseId: 12,
};

// ─────────────────────────────────────────────────────────────────────────────
// Lesson content
// ─────────────────────────────────────────────────────────────────────────────
const NEW_LESSONS = [
  {
    order: 0,
    title: "From Linear to Circular",
    minutes: 3,
    content: "Introduce the difference between a linear and circular economy.",
    blocks: [
      {
        id: "c11-l1-b1",
        type: "heading",
        content: "Where does value go?",
      },
      {
        id: "c11-l1-b2",
        type: "text",
        content: "A company replaces office chairs every few years. Some are damaged, some only need minor repairs and some are still fully usable. The entire batch is replaced because buying new chairs seems easier.",
      },
      {
        id: "c11-l1-b3",
        type: "text",
        content: "This is the traditional linear pattern: **Take resources, make a product, use it and dispose of it.**\n\nIn contrast, a circular approach seeks to:\n- Prevent unnecessary consumption\n- Keep products and materials useful for longer\n- Recover value responsibly when continued use is no longer possible\n\nCircularity is not a perfect closed loop and does not mean that nothing is ever discarded. But a circular workplace asks how value can be preserved before deciding to discard and replace.",
      },
      {
        id: "c11-l1-b4",
        type: "scenario",
        scenarioText: "Which of the following responses preserves the most value from the office chairs?",
        options: [
          {
            id: "opt-1",
            text: "Throw all chairs away and buy cheaper replacements.",
            isCorrect: false,
            feedback: "This loses all existing value and consumes new resources unnecessarily.",
          },
          {
            id: "opt-2",
            text: "Donate all chairs to charity.",
            isCorrect: false,
            feedback: "Donating unusable or broken items simply transfers the disposal problem to the charity.",
          },
          {
            id: "opt-3",
            text: "Inspect the chairs, repair where practical, reallocate usable ones, and purchase replacements only where needed.",
            isCorrect: true,
            feedback: "Correct. This approach separates safe reusable chairs from repairable and unusable ones, preserving maximum value.",
          },
          {
            id: "opt-4",
            text: "Send all chairs to a local recycling facility.",
            isCorrect: false,
            feedback: "Recycling should only be considered after repair and reuse options have been exhausted.",
          }
        ],
      }
    ],
  },
  {
    order: 1,
    title: "Keep Products and Materials in Use",
    minutes: 3,
    content: "Explain the practical hierarchy of circular actions.",
    blocks: [
      {
        id: "c11-l2-b1",
        type: "heading",
        content: "The Circular Hierarchy",
      },
      {
        id: "c11-l2-b2",
        type: "text",
        content: "The most circular option often occurs before an item becomes waste. When considering how to handle workplace products and equipment, follow this practical hierarchy:\n\n1. Question whether the item is needed\n2. Reduce unnecessary use\n3. Share or reallocate\n4. Maintain\n5. Reuse\n6. Repair\n7. Refurbish\n8. Recover parts or materials\n9. Recycle where an appropriate stream exists\n10. Dispose responsibly when no safe alternative remains",
      },
      {
        id: "c11-l2-b3",
        type: "text",
        content: "This is not a rigid universal rule. Safety, hygiene, product quality and technical requirements must still be respected. For example, replacing a failed component rather than an entire unit is excellent, but only if the repair is technically appropriate and safe.",
      },
      {
        id: "c11-l2-b4",
        type: "scenario",
        scenarioText: "Which of the following actions represents extending product life before it becomes waste?",
        options: [
          {
            id: "opt-1",
            text: "Sending used printer cartridges to a recycling centre.",
            isCorrect: false,
            feedback: "This is material recovery (recycling), not extending the product's functional life.",
          },
          {
            id: "opt-2",
            text: "Maintaining air-conditioning equipment instead of waiting for avoidable failure.",
            isCorrect: true,
            feedback: "Correct. Preventive maintenance keeps equipment operating efficiently and extends its useful life before it needs replacement.",
          },
          {
            id: "opt-3",
            text: "Using disposable cups but ensuring they are made from recycled paper.",
            isCorrect: false,
            feedback: "Using disposable items, even recycled ones, drives a linear take-make-dispose pattern.",
          },
          {
            id: "opt-4",
            text: "Throwing away usable furniture because it doesn't match the new office decor.",
            isCorrect: false,
            feedback: "This represents premature disposal and value loss.",
          }
        ],
      }
    ],
  },
  {
    order: 2,
    title: "Think Across the Workplace Life Cycle",
    minutes: 3,
    content: "Help learners consider circularity at each stage of a workplace item’s life.",
    blocks: [
      {
        id: "c11-l3-b1",
        type: "heading",
        content: "It starts before purchase",
      },
      {
        id: "c11-l3-b2",
        type: "text",
        content: "Circularity begins before purchase and continues throughout use, maintenance and end-of-use. Decisions made early in the life cycle determine whether an item can later be repaired, reused or recovered.\n\nConsider the workplace life cycle stages:\n1. Need identification\n2. Product or service design\n3. Purchasing\n4. Delivery and packaging\n5. Use\n6. Maintenance\n7. Reallocation\n8. Repair or refurbishment\n9. End-of-use decision\n10. Evidence and learning",
      },
      {
        id: "c11-l3-b3",
        type: "text",
        content: "Compare two approaches to acquiring a new printer:\n\n**Approach A:** Bought mainly on initial price. Consumables are difficult to obtain, repair information is unavailable, spare parts are limited, and the unit is simply replaced after a fault.\n\n**Approach B:** Need and expected use are assessed first. Durability and maintenance are considered, parts are available, repair responsibility is clear, and the equipment is only replaced when justified.",
      },
      {
        id: "c11-l3-b4",
        type: "scenario",
        scenarioText: "Which question is the MOST important to ask during the 'Need identification' stage before acquiring equipment?",
        options: [
          {
            id: "opt-1",
            text: "How quickly can the supplier deliver it?",
            isCorrect: false,
            feedback: "Speed of delivery does not determine if the item is actually needed or circular.",
          },
          {
            id: "opt-2",
            text: "What colour will look best in the office?",
            isCorrect: false,
            feedback: "Aesthetics do not address the fundamental need or utility of the asset.",
          },
          {
            id: "opt-3",
            text: "Can the need be met through sharing or reallocation of an existing underused item?",
            isCorrect: true,
            feedback: "Correct. The most circular choice is avoiding an unnecessary purchase by utilising existing resources better.",
          },
          {
            id: "opt-4",
            text: "What is the cheapest model available online?",
            isCorrect: false,
            feedback: "The cheapest model may lack durability and spare parts, leading to premature disposal.",
          }
        ],
      }
    ],
  },
  {
    order: 3,
    title: "Circular Economy in Mauritian Workplaces",
    minutes: 4,
    content: "Apply circular-economy thinking to realistic Mauritian business settings.",
    blocks: [
      {
        id: "c11-l4-b1",
        type: "heading",
        content: "The Island Context",
      },
      {
        id: "c11-l4-b2",
        type: "text",
        content: "Mauritius is an island economy where many products, components and materials may travel significant distances before reaching a workplace.\n\nPreventing avoidable replacement and extending useful product life can be particularly relevant where supply chains, storage, transport and replacement lead times affect business operations.",
      },
      {
        id: "c11-l4-b3",
        type: "text",
        content: "Circularity requires collaboration. It is not the responsibility of the cleaning team or sustainability officer alone. Circular systems depend on coordination between the people who request, purchase, use, maintain and retire workplace assets.\n\nFor example:\n- **Retail:** Using reusable supplier crates, discussing packaging reduction, and repairing shop fittings.\n- **Manufacturing:** Implementing preventive maintenance, recovering suitable components, and using reusable internal transport packaging.\n- **Property Management:** Maintaining accurate asset registers, planned maintenance, and reallocating equipment between sites.",
      },
      {
        id: "c11-l4-b4",
        type: "scenario",
        scenarioText: "A hotel is looking to implement a circular approach for its guest room linens. Which approach demonstrates cross-departmental coordination?",
        options: [
          {
            id: "opt-1",
            text: "The purchasing department buys the cheapest linens available to save money.",
            isCorrect: false,
            feedback: "This isolates the decision to purchasing and often ignores durability and maintenance needs.",
          },
          {
            id: "opt-2",
            text: "Housekeeping discards any linen with minor stains without telling anyone.",
            isCorrect: false,
            feedback: "This loses value and prevents the business from identifying the root cause of the damage.",
          },
          {
            id: "opt-3",
            text: "Purchasing sources durable linens, housekeeping rotates stock and spots minor damage early, and maintenance repairs washing equipment to prevent fabric tearing.",
            isCorrect: true,
            feedback: "Correct. This shows how purchasing, operations, and maintenance must coordinate to extend the life of the assets.",
          },
          {
            id: "opt-4",
            text: "The sustainability officer asks guests to reuse their towels.",
            isCorrect: false,
            feedback: "While beneficial, this relies entirely on the guest and does not represent internal operational coordination for the linen life cycle.",
          }
        ],
      }
    ],
  },
  {
    order: 4,
    title: "Make the Better Circular Decision",
    minutes: 4,
    content: "Develop decision-making rather than simple recall.",
    blocks: [
      {
        id: "c11-l5-b1",
        type: "heading",
        content: "Navigating complexity",
      },
      {
        id: "c11-l5-b2",
        type: "text",
        content: "A company is renovating part of its workplace. There are desks in good condition, chairs with mixed levels of damage, storage cabinets that do not match the new design, old electrical equipment, packaging from new deliveries, and items containing confidential company information.\n\nThe most responsible process is not to blindly reuse everything, nor to blindly throw everything in the bin.",
      },
      {
        id: "c11-l5-b3",
        type: "text",
        content: "A strong decision process includes:\n1. Creating an inventory before removal.\n2. Assessing condition, ownership and safety.\n3. Reallocating usable items internally.\n4. Protecting confidential information and company data.\n5. Asking suppliers about suitable packaging recovery.\n6. Separating items requiring specialist handling (like e-waste).\n7. Buying replacements only after the actual gap is known.",
      },
      {
        id: "c11-l5-b4",
        type: "scenario",
        scenarioText: "During the renovation, you find a batch of old company laptops. What is the appropriate circular decision?",
        options: [
          {
            id: "opt-1",
            text: "Donate them immediately to a local school to extend their life.",
            isCorrect: false,
            feedback: "Data-bearing devices must follow secure data-handling procedures before leaving the organisation, regardless of how good the intention is.",
          },
          {
            id: "opt-2",
            text: "Throw them in the general waste bin to save time.",
            isCorrect: false,
            feedback: "Electrical and electronic equipment requires specialist assessment and responsible disposal.",
          },
          {
            id: "opt-3",
            text: "Verify the devices with the IT department for secure data wiping, assess them for internal reallocation, and only then consider authorised external recovery or specialist recycling.",
            isCorrect: true,
            feedback: "Correct. This balances circularity (reallocation/recovery) with crucial operational constraints like information security.",
          },
          {
            id: "opt-4",
            text: "Hide them in a storage closet indefinitely.",
            isCorrect: false,
            feedback: "Storing items indefinitely provides no circular value and wastes storage space.",
          }
        ],
      }
    ],
  },
  {
    order: 5,
    title: "Build a Small Circular Action",
    minutes: 3,
    content: "Convert the course into a practical workplace commitment.",
    blocks: [
      {
        id: "c11-l6-b1",
        type: "heading",
        content: "Start small, learn and expand",
      },
      {
        id: "c11-l6-b2",
        type: "text",
        content: "To build a circular workplace, start with a simple action-planning method:\n1. Choose one product, material or process.\n2. Identify where value is currently being lost.\n3. Identify who is involved.\n4. Select one realistic improvement.\n5. Decide what evidence will show progress.\n6. Review the result before expanding it.",
      },
      {
        id: "c11-l6-b3",
        type: "commitment",
        commitmentInstruction: "Select one practical circular-economy commitment you can implement in your workplace role:",
        commitmentOptions: [
          {
            value: "repair-check",
            label: "Create a repair-before-replacement check",
            description: "I will establish a brief checklist to assess whether an item can be safely repaired before a replacement purchase is authorised.",
          },
          {
            value: "reallocate-furniture",
            label: "Identify unused furniture for reallocation",
            description: "I will survey my department for unused or underused furniture and coordinate its reallocation to areas of need.",
          },
          {
            value: "supplier-packaging",
            label: "Discuss reusable packaging with a supplier",
            description: "I will contact one regular supplier to discuss transitioning from single-use delivery packaging to a reusable crate or take-back system.",
          },
          {
            value: "maintenance-checklist",
            label: "Add maintenance to an operational checklist",
            description: "I will integrate basic preventive maintenance checks into our team's regular operational routines to extend equipment life.",
          }
        ]
      }
    ],
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Quiz content
// ─────────────────────────────────────────────────────────────────────────────
const NEW_QUIZ_QUESTIONS = [
  {
    question: "Which action best represents circular thinking?",
    options: [
      { text: "Buying products that are slightly cheaper to replace them more often", isCorrect: false, feedback: "This drives a linear 'take-make-dispose' model and destroys value quickly." },
      { text: "Preserving value through need assessment, maintenance, reuse or repair before replacement", isCorrect: true, feedback: "Correct. Circularity is fundamentally about retaining the value of resources for as long as possible." },
      { text: "Throwing everything into a mixed recycling bin", isCorrect: false, feedback: "Recycling is only a recovery step; circular thinking aims to prevent waste and reuse items before recycling is needed." },
      { text: "Printing on one side of the paper only", isCorrect: false, feedback: "This wastes resources and does not represent circular systems thinking." }
    ],
    correctExplanation: "The circular economy focuses on preventing waste by rethinking needs and keeping assets in productive use.",
    incorrectExplanation: "Many environmental actions are helpful, but circularity specifically targets the preservation of product and material value.",
    practicalTakeaway: "Before replacing an item, always ask if it is truly needed, or if it can be maintained or repaired.",
  },
  {
    question: "What is the role of recycling in a circular economy?",
    options: [
      { text: "It is the only action required to make a business fully circular", isCorrect: false, feedback: "Recycling is the last resort for materials, not the primary goal." },
      { text: "It is a way to avoid maintaining or repairing equipment", isCorrect: false, feedback: "Maintenance and repair are higher priorities than recycling." },
      { text: "It is an important recovery option, but circular decisions should also prevent waste and keep products useful for longer", isCorrect: true, feedback: "Correct. Recycling recovers raw materials but loses the energy and labor invested in the finished product." },
      { text: "Recycling has no place in a circular economy", isCorrect: false, feedback: "Recycling is still essential for handling materials at the true end of their usable life." }
    ],
    correctExplanation: "Recycling loops are necessary but less efficient than inner loops like sharing, maintaining, and reusing.",
    incorrectExplanation: "Do not confuse circularity entirely with recycling; waste prevention comes first.",
    practicalTakeaway: "Recycle responsibly, but aim to reuse and repair first.",
  },
  {
    question: "A department has several unused desks. What is the most circular approach?",
    options: [
      { text: "Send them to a landfill immediately to free up space", isCorrect: false, feedback: "This destroys the value of perfectly usable assets." },
      { text: "Assess their condition, reallocate them to teams that need them, repair any minor damage, and only buy new desks to cover the actual shortfall", isCorrect: true, feedback: "Correct. This maximizes the utility of existing assets and minimizes unnecessary purchasing." },
      { text: "Leave them in a hallway indefinitely", isCorrect: false, feedback: "Unused assets slowly degrade and represent trapped value." },
      { text: "Donate them to charity without checking if other internal departments need them", isCorrect: false, feedback: "While charitable, it forces the business to buy new desks for internal teams, wasting company resources." }
    ],
    correctExplanation: "Internal reallocation ensures assets are fully utilized, preventing premature disposal and unnecessary procurement.",
    incorrectExplanation: "Leaving assets idle or discarding them ignores their remaining value.",
    practicalTakeaway: "Always check for available internal resources before initiating a new purchase.",
  },
  {
    question: "When purchasing new workplace equipment, which decision-making approach is the most circular?",
    options: [
      { text: "Choosing the lowest initial purchase price regardless of quality", isCorrect: false, feedback: "Cheap equipment often breaks quickly and lacks repair options." },
      { text: "Buying the most technologically advanced model even if the features are not needed", isCorrect: false, feedback: "Over-specifying equipment wastes resources and money." },
      { text: "Considering the actual need, durability, ease of maintenance, availability of spare parts, and end-of-use options", isCorrect: true, feedback: "Correct. Life-cycle thinking ensures the asset will provide long-term value and won't prematurely become waste." },
      { text: "Only buying equipment that comes in green packaging", isCorrect: false, feedback: "Packaging is important, but the durability and repairability of the equipment itself has a much larger impact." }
    ],
    correctExplanation: "A circular purchase evaluates the total life cycle of the product, ensuring it can be maintained and recovered.",
    incorrectExplanation: "Focusing solely on price or superficial 'green' features ignores the long-term impact of the asset.",
    practicalTakeaway: "Ask suppliers about spare parts, warranties, and take-back schemes before buying.",
  },
  {
    question: "A piece of heavy industrial equipment has a damaged safety guard. What is the correct circular response?",
    options: [
      { text: "Continue using it as normal to extend its life", isCorrect: false, feedback: "Safety cannot be compromised in the pursuit of circularity." },
      { text: "Attempt a makeshift repair using tape to save money", isCorrect: false, feedback: "Unauthorised or unsafe repairs introduce severe operational risks." },
      { text: "Assess whether a safe, authorised repair can be made using proper parts, rather than automatically discarding the entire machine", isCorrect: true, feedback: "Correct. Safe repair extends the asset's life without endangering operators." },
      { text: "Immediately discard the entire machine and buy a new one", isCorrect: false, feedback: "Discarding the entire machine for one damaged component is a massive loss of value." }
    ],
    correctExplanation: "Circularity promotes repair, but it must always be conducted safely and to appropriate technical standards.",
    incorrectExplanation: "Never compromise health, safety, or quality when extending the life of a product.",
    practicalTakeaway: "Ensure repairs are conducted safely by qualified personnel using appropriate parts.",
  },
  {
    question: "A company receives daily deliveries in single-use cardboard boxes. What is the strongest circular response?",
    options: [
      { text: "Fold the boxes neatly before putting them in the general waste", isCorrect: false, feedback: "This does not recover any value or prevent waste." },
      { text: "Ensure the cardboard is placed in a recycling bin", isCorrect: false, feedback: "Recycling is better than landfill, but it doesn't address the root cause of the continuous waste generation." },
      { text: "Discuss packaging reduction, reusable delivery crates, or take-back options with the supplier, ensuring it is operationally feasible", isCorrect: true, feedback: "Correct. This addresses the waste at its source and builds a circular system with the supplier." },
      { text: "Refuse all deliveries until the supplier uses zero packaging", isCorrect: false, feedback: "This is likely operationally impossible and will disrupt the business." }
    ],
    correctExplanation: "Engaging the supply chain to switch to reusable systems prevents waste from entering the facility in the first place.",
    incorrectExplanation: "Relying purely on recycling or demanding impossible immediate changes misses the opportunity for systemic improvement.",
    practicalTakeaway: "Talk to suppliers; many already offer reusable transport packaging if requested.",
  },
  {
    question: "During an office renovation, what is the best first step to handle existing furniture and equipment?",
    options: [
      { text: "Order a large skip bin and clear everything out", isCorrect: false, feedback: "This guarantees maximum value loss." },
      { text: "Order all new furniture immediately so it arrives on time", isCorrect: false, feedback: "Ordering before knowing what you already have leads to over-purchasing." },
      { text: "Create an inventory to assess condition, ownership, and safety before deciding what to keep, reallocate, repair, or discard", isCorrect: true, feedback: "Correct. An inventory provides the data needed to make responsible circular decisions." },
      { text: "Allow staff to take whatever they want home", isCorrect: false, feedback: "This bypasses asset tracking, safety checks, and data security protocols." }
    ],
    correctExplanation: "An inventory enables an organization to maximize reuse and strategically plan for any necessary disposal.",
    incorrectExplanation: "Acting without assessing existing assets leads to waste and unnecessary expense.",
    practicalTakeaway: "Know what you have before deciding you need something new.",
  },
  {
    question: "Who is responsible for circularity in an organisation?",
    options: [
      { text: "Only the purchasing department", isCorrect: false, feedback: "Purchasing cannot maintain equipment or ensure it is used correctly." },
      { text: "Only the facilities or maintenance team", isCorrect: false, feedback: "Maintenance teams cannot control poor purchasing decisions." },
      { text: "Only the sustainability officer", isCorrect: false, feedback: "A single officer cannot oversee every operational decision across the business." },
      { text: "It requires coordination across purchasing, operations, maintenance, users, management, and suppliers", isCorrect: true, feedback: "Correct. Circular systems rely on the entire life cycle, which touches almost every department." }
    ],
    correctExplanation: "Value is preserved when the people who buy, use, and maintain an asset communicate and coordinate.",
    incorrectExplanation: "Siloed responsibility leads to linear outcomes because decisions are made in isolation.",
    practicalTakeaway: "Collaborate with other departments to ensure assets are managed effectively throughout their life cycle.",
  },
  {
    question: "Which of the following is the best practical evidence that a workplace is becoming more circular?",
    options: [
      { text: "A single percentage showing how much waste is recycled", isCorrect: false, feedback: "Recycling rates do not capture waste prevention, reuse, or product life extension." },
      { text: "Tracking items repaired, assets reallocated, product life extended, and avoided duplicate purchases", isCorrect: true, feedback: "Correct. These metrics demonstrate active value preservation and waste prevention." },
      { text: "The number of new items purchased each month", isCorrect: false, feedback: "Purchasing volume alone does not explain whether those purchases were necessary or circular." },
      { text: "The amount of money spent on waste disposal", isCorrect: false, feedback: "Disposal costs can fluctuate for many reasons unrelated to circularity." }
    ],
    correctExplanation: "Evidence of circularity should reflect actions that extend product life and prevent waste, not just end-of-pipe disposal metrics.",
    incorrectExplanation: "Relying on a single metric often obscures the real systemic changes happening in the workplace.",
    practicalTakeaway: "Measure the activities that keep products in use, like repair logs and reallocation requests.",
  },
  {
    question: "What is the best way to start building a circular workplace?",
    options: [
      { text: "Attempt to completely eliminate all waste across the business by next week", isCorrect: false, feedback: "This is unrealistic and will lead to frustration and failure." },
      { text: "Initiate a specific, manageable pilot linked to an actual workplace problem, assign a responsible owner, and review the results", isCorrect: true, feedback: "Correct. Small, measurable pilots build confidence and provide lessons before scaling up." },
      { text: "Wait until the government passes new circular economy laws", isCorrect: false, feedback: "Businesses can achieve significant operational and financial benefits by acting proactively." },
      { text: "Rewrite all company policies before making any practical changes", isCorrect: false, feedback: "Policy is important, but practical action shouldn't be delayed endlessly by bureaucracy." }
    ],
    correctExplanation: "Starting small allows teams to test solutions, adjust to challenges, and demonstrate success without overwhelming operations.",
    incorrectExplanation: "Over-ambitious or overly bureaucratic approaches often stall before achieving any real impact.",
    practicalTakeaway: "Pick one clear opportunity, test it, learn from it, and then expand.",
  }
];

export async function ensureCircularEconomyCourse() {
  logger.info(`Checking and executing ${COURSE_TITLE} course content migration...`);

  try {
    const seedRecord = await db.query.systemSeedsTable.findFirst({
      where: eq(systemSeedsTable.name, SEED_NAME)
    });

    if (seedRecord) {
      logger.info(`[Seed] ${SEED_NAME} has already been run. Skipping to preserve subsequent administrator edits and quiz attempts.`);
      return;
    }

    await db.transaction(async (tx) => {
      // 1. Ensure Course Exists (resolve skeleton dynamically)
      let existingCourse = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.slug, COURSE_SLUG),
      });

      if (!existingCourse) {
        const byId = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.id, COURSE_ID),
        });
        if (byId) {
          if (!byId.slug) {
            throw new Error(`Data integrity violation: Course (ID: ${COURSE_ID}) is missing a unique slug.`);
          }
          if (byId.slug === COURSE_SLUG) {
            existingCourse = byId;
          } else if (byId.slug.includes('circular')) {
            existingCourse = byId;
          }
        }
      }

      let actualCourseId = existingCourse ? existingCourse.id : COURSE_ID;

      // 2. Ensure the Badge Definition exists
      const existingBadge = await tx.query.badgeDefinitionsTable.findFirst({
        where: eq(badgeDefinitionsTable.slug, BADGE_SLUG),
      });
      if (!existingBadge) {
        // Safe placeholder replacement
        const skeletonBadge = await tx.query.badgeDefinitionsTable.findFirst({
            where: eq(badgeDefinitionsTable.slug, SKELETON_BADGE_SLUG),
        });
        if (skeletonBadge) {
            await tx.delete(badgeDefinitionsTable).where(eq(badgeDefinitionsTable.slug, SKELETON_BADGE_SLUG));
        }

        await tx.insert(badgeDefinitionsTable).values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "award",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 15,
        });
      } else {
        await tx.update(badgeDefinitionsTable).set({
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
        }).where(eq(badgeDefinitionsTable.slug, BADGE_SLUG));
      }

      const badgeRecord = await tx.query.badgeDefinitionsTable.findFirst({
        where: eq(badgeDefinitionsTable.slug, BADGE_SLUG),
      });

      if (!badgeRecord) {
        throw new Error(`Failed to create or retrieve badge ${BADGE_SLUG}`);
      }

      if (!existingCourse) {
        const [inserted] = await tx.insert(coursesTable).values({
          slug: COURSE_SLUG,
          title: COURSE_TITLE,
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
          recommendedNextCourseId: COURSE_META.recommendedNextCourseId,
          status: "published",
          isPublished: true,
        }).returning();
        
        actualCourseId = inserted.id;

        await tx.update(badgeDefinitionsTable).set({
            courseIds: [actualCourseId]
        }).where(eq(badgeDefinitionsTable.slug, BADGE_SLUG));
      } else {
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
            recommendedNextCourseId: COURSE_META.recommendedNextCourseId,
            status: "published",
            isPublished: true,
          })
          .where(eq(coursesTable.id, actualCourseId));
      }

      // 3. Seed Lessons - with strict preservation logic
      const existingLessons = await tx.query.lessonsTable.findMany({
        where: eq(lessonsTable.courseId, actualCourseId),
      });

      const hasOnlySkeletonLessons =
        existingLessons.length > 0 &&
        existingLessons.every(
          (l) => l.content && l.content.includes("[DRAFT SKELETON]"),
        );

      // Verify no lesson progress exists before deleting lessons
      let existingLessonProgress = [];
      if (existingLessons.length > 0) {
        existingLessonProgress = await tx.query.lessonProgressTable.findMany({
          where: inArray(lessonProgressTable.lessonId, existingLessons.map((l) => l.id)),
        });
      }

      if (existingLessonProgress.length === 0 && (existingLessons.length === 0 || hasOnlySkeletonLessons)) {
        if (hasOnlySkeletonLessons) {
          await tx.delete(lessonsTable).where(eq(lessonsTable.courseId, actualCourseId));
        }

        for (const lesson of NEW_LESSONS) {
          await tx.insert(lessonsTable).values({
            courseId: actualCourseId,
            title: lesson.title,
            orderIndex: lesson.order,
            durationMinutes: lesson.minutes,
            content: lesson.content,
            contentBlocks: lesson.blocks,
          });
        }
      }

      // 4. Seed Quiz Questions - with strict preservation logic
      const existingQuestions = await tx.query.quizQuestionsTable.findMany({
        where: eq(quizQuestionsTable.courseId, actualCourseId),
      });

      const hasOnlySkeletonQuestions =
        existingQuestions.length > 0 &&
        existingQuestions.every(
          (q) => q.question && q.question.includes("[DRAFT SKELETON]"),
        );

      // Verify attempts before deleting
      const existingAttempts = await tx.query.quizAttemptsTable.findMany({
        where: eq(quizAttemptsTable.courseId, actualCourseId),
      });

      if (existingAttempts.length === 0 && (existingQuestions.length === 0 || hasOnlySkeletonQuestions)) {
        if (hasOnlySkeletonQuestions) {
          await tx.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, actualCourseId));
        }

        for (const [index, q] of NEW_QUIZ_QUESTIONS.entries()) {
          const correctOptionIndex = q.options.findIndex((o) => o.isCorrect);
          if (correctOptionIndex === -1) {
            throw new Error(`Question ${index} is missing a correct option`);
          }

          await tx.insert(quizQuestionsTable).values({
            courseId: actualCourseId,
            question: q.question,
            options: q.options.map(o => o.text),
            optionFeedback: q.options.map(o => o.feedback),
            correctOption: correctOptionIndex,
            orderIndex: index,
            correctExplanation: q.correctExplanation,
            incorrectExplanation: q.incorrectExplanation,
            practicalTakeaway: q.practicalTakeaway,
          });
        }
      }

      await tx.insert(systemSeedsTable).values({
        name: SEED_NAME,
        runAt: new Date(),
      });
    });

    logger.info(`Successfully seeded ${COURSE_TITLE} content`);
  } catch (error) {
    logger.error({ err: error }, `Failed to seed ${COURSE_TITLE} course content`);
    throw error;
  }
}
