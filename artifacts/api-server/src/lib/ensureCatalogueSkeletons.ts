import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  coursePrerequisitesTable,
  badgeDefinitionsTable,
  systemSeedsTable
} from "@workspace/db";
import { eq, and, inArray, count } from "drizzle-orm";
import { logger } from "./logger";

const SEED_NAME = "catalogue-skeletons-v1";

const CATALOGUE_COURSES = [
  {
    code: "ELH-01",
    slug: "sustainability-foundations",
    title: "Sustainability Foundations",
    level: "beginner",
    estimatedMinutes: 20,
    shortDescription: "A practical introduction to sustainability and the everyday workplace choices that influence environmental, social and business outcomes.",
    aim: "Build a shared, credible understanding of sustainability and help every employee recognise practical actions within their role.",
    learningObjectives: [
      "Explain sustainability in simple workplace language.",
      "Recognise the environmental, social and economic dimensions of a decision.",
      "Identify everyday actions an employee can influence.",
      "Choose one realistic sustainability commitment."
    ],
    badgeName: "Sustainability Starter",
    badgeDescription: "Awarded for completing the Sustainability Foundations course and making a personal workplace commitment.",
    lessons: [
      "Welcome: sustainability is part of everyday work",
      "The three connected dimensions of sustainability",
      "How workplace choices create wider effects",
      "Practical habits within every employee’s control",
      "Scenario: balancing convenience, cost and impact",
      "Knowledge check, commitment and completion"
    ]
  },
  {
    code: "ELH-02",
    slug: "waste-sorting",
    legacySlugs: ["waste-sorting-mauritian-bin-system"],
    title: "Waste Sorting and the Mauritian Bin System",
    level: "beginner",
    estimatedMinutes: 60,
    shortDescription: "Shows employees how to prevent avoidable waste, read workplace bin labels and sort materials according to the collection arrangements available at their organisation.",
    aim: "Improve sorting decisions, reduce contamination and encourage employees to check local instructions rather than guess.",
    learningObjectives: [
      "Apply the waste hierarchy before deciding where an item goes.",
      "Use workplace labels and accepted-material lists correctly.",
      "Recognise common contamination risks.",
      "Know what to do when a material or bin instruction is unclear."
    ],
    badgeName: "Waste Sorting Essentials",
    badgeDescription: "Awarded for completing the Waste Sorting course.",
    lessons: [
      "Hook: one wrong item can affect a whole collection",
      "Prevent, reduce, reuse and sort",
      "Reading labels and accepted-material instructions",
      "Common workplace sorting mistakes",
      "Scenario: choosing the correct action for mixed items",
      "Knowledge check, commitment and completion"
    ]
  },
  {
    code: "ELH-03",
    slug: "energy-efficiency-at-work",
    title: "Energy Efficiency at Work",
    level: "beginner",
    estimatedMinutes: 15,
    shortDescription: "Introduces practical ways employees can reduce unnecessary energy use while protecting comfort, safety, service quality and productivity.",
    aim: "Help learners identify avoidable energy use and take or report appropriate action in their workplace.",
    learningObjectives: [
      "Recognise common sources of avoidable energy use.",
      "Apply practical habits for lighting, cooling and equipment.",
      "Distinguish between employee actions and maintenance issues.",
      "Escalate faults or recurring waste through the correct channel."
    ],
    badgeName: "Energy Smart at Work",
    badgeDescription: "Awarded for completing the Energy Efficiency at Work course.",
    lessons: [
      "Hook: the empty room still using electricity",
      "Where workplace energy is used",
      "Cooling, lighting and equipment habits",
      "Comfort, safety and operational trade-offs",
      "Scenario: an energy issue during a busy workday",
      "Knowledge check, commitment and completion"
    ]
  },
  {
    code: "ELH-04",
    slug: "water-conservation",
    title: "Water Conservation",
    level: "beginner",
    estimatedMinutes: 15,
    shortDescription: "Explains how daily habits, early leak reporting and sensible operating practices can reduce unnecessary water use without compromising hygiene or service.",
    aim: "Enable employees to notice waste, respond appropriately and use water more carefully in routine tasks.",
    learningObjectives: [
      "Identify visible and hidden signs of water waste.",
      "Use water efficiently during routine work.",
      "Report leaks and faulty equipment promptly.",
      "Balance conservation with hygiene, safety and service standards."
    ],
    badgeName: "Water Wise at Work",
    badgeDescription: "Awarded for completing the Water Conservation course.",
    lessons: [
      "Hook: a small leak that no one reports",
      "Where water is used at work",
      "Everyday conservation without lowering standards",
      "Spotting and reporting leaks or faults",
      "Scenario: water use, hygiene and customer expectations",
      "Knowledge check, commitment and completion"
    ]
  },
  {
    code: "ELH-05",
    slug: "sustainable-procurement",
    title: "Sustainable Procurement",
    level: "intermediate",
    estimatedMinutes: 15,
    shortDescription: "Introduces a practical method for considering need, quality, lifespan, packaging, supplier information and total value before purchasing.",
    aim: "Improve purchasing judgement so sustainability is considered alongside cost, quality, availability and operational need.",
    learningObjectives: [
      "Question whether a purchase is necessary.",
      "Compare options using lifecycle and total-value thinking.",
      "Ask suppliers useful, verifiable questions.",
      "Avoid vague or unsupported environmental claims."
    ],
    badgeName: "Responsible Purchasing",
    badgeDescription: "Awarded for completing the Sustainable Procurement course.",
    lessons: [
      "Hook: the cheapest option is not always the best value",
      "Start with need, not product",
      "Quality, lifespan, repairability and packaging",
      "Useful supplier questions and evidence",
      "Scenario: choosing between competing offers",
      "Knowledge check, commitment and completion"
    ]
  },
  {
    code: "ELH-06",
    slug: "green-office-practices",
    title: "Green Office Practices",
    level: "intermediate",
    estimatedMinutes: 15,
    shortDescription: "Brings waste, energy, water, printing, meetings and shared-space habits into one practical office routine.",
    aim: "Help office-based employees and managers turn isolated good intentions into consistent team practices.",
    learningObjectives: [
      "Identify the highest-value office habits.",
      "Reduce unnecessary printing, energy use and disposable items.",
      "Plan lower-impact meetings and shared-space routines.",
      "Encourage team participation without blame or policing."
    ],
    badgeName: "Green Office Practitioner",
    badgeDescription: "Awarded for completing the Green Office Practices course.",
    lessons: [
      "Hook: a normal office day with hidden waste",
      "The practical green-office routine",
      "Printing, digital work and meetings",
      "Shared kitchens, supplies and common spaces",
      "Scenario: improving a team process without disruption",
      "Knowledge check, commitment and completion"
    ]
  },
  {
    code: "ELH-07",
    slug: "carbon-footprint-awareness",
    title: "Carbon Footprint Awareness",
    level: "intermediate",
    estimatedMinutes: 15,
    shortDescription: "Explains what a carbon footprint represents, where workplace emissions commonly arise and how employees can influence relevant decisions.",
    aim: "Build carbon literacy without turning employees into carbon accountants or making unsupported reduction claims.",
    learningObjectives: [
      "Explain a carbon footprint in plain language.",
      "Recognise direct and indirect workplace emission sources.",
      "Identify actions employees can influence.",
      "Distinguish awareness from formal corporate carbon accounting."
    ],
    badgeName: "Carbon Aware",
    badgeDescription: "Awarded for completing the Carbon Footprint Awareness course.",
    lessons: [
      "Hook: which everyday decision creates emissions?",
      "Carbon footprints in simple terms",
      "Energy, travel, purchasing and waste connections",
      "What employees can influence and what requires company action",
      "Scenario: comparing realistic workplace choices",
      "Knowledge check, commitment and completion"
    ]
  },
  {
    code: "ELH-08",
    slug: "biodiversity-in-mauritius",
    title: "Biodiversity in Mauritius",
    level: "intermediate",
    estimatedMinutes: 15,
    shortDescription: "Connects Mauritian ecosystems and biodiversity with everyday business activities, site management, purchasing, waste, water and employee behaviour.",
    aim: "Help employees understand why biodiversity matters to Mauritius and recognise practical ways workplaces can avoid harm and support responsible behaviour.",
    learningObjectives: [
      "Explain biodiversity and ecosystem services simply.",
      "Recognise links between business activity and natural systems.",
      "Identify common workplace risks such as litter, disturbance or harmful practices.",
      "Choose actions appropriate to the learner’s role and site."
    ],
    badgeName: "Biodiversity Aware",
    badgeDescription: "Awarded for completing the Biodiversity in Mauritius course.",
    lessons: [
      "Hook: business depends on healthy natural systems",
      "What biodiversity means",
      "Mauritian workplace and ecosystem connections",
      "Avoiding harm through daily decisions",
      "Scenario: responding to a site-based biodiversity concern",
      "Knowledge check, commitment and completion"
    ]
  },
  {
    code: "ELH-09",
    slug: "esg-basics",
    title: "ESG Basics",
    level: "advanced",
    estimatedMinutes: 15,
    shortDescription: "Introduces Environmental, Social and Governance factors and explains how employee actions, policies, data and decisions contribute to company performance and credibility.",
    aim: "Give all employees a clear understanding of ESG and their place within a company’s wider responsibilities and reporting systems.",
    learningObjectives: [
      "Define Environmental, Social and Governance in plain language.",
      "Distinguish ESG from marketing or charity alone.",
      "Connect daily actions and records with company-level evidence.",
      "Recognise the importance of accurate, honest information."
    ],
    badgeName: "ESG Fundamentals",
    badgeDescription: "Awarded for completing the ESG Basics course.",
    lessons: [
      "Hook: a company claim needs evidence",
      "What ESG means",
      "Environmental, Social and Governance examples",
      "From employee action to company data and decisions",
      "Scenario: handling an ESG claim or data request",
      "Knowledge check, commitment and completion"
    ]
  },
  {
    code: "ELH-10",
    slug: "environmental-compliance",
    title: "Environmental Compliance",
    level: "advanced",
    estimatedMinutes: 15,
    shortDescription: "Shows how employees support environmental compliance by following procedures, maintaining accurate records, reporting incidents and avoiding unapproved shortcuts.",
    aim: "Build a compliance-aware culture in which employees understand their responsibilities and escalate concerns through the correct process.",
    learningObjectives: [
      "Explain environmental compliance as meeting applicable obligations and company procedures.",
      "Recognise when an issue should be reported or escalated.",
      "Understand why records and evidence matter.",
      "Avoid concealment, assumptions and unauthorised corrective action."
    ],
    badgeName: "Environmental Responsibility",
    badgeDescription: "Awarded for completing the Environmental Compliance course.",
    lessons: [
      "Hook: a small incident becomes a bigger compliance problem",
      "What compliance means at employee level",
      "Procedures, permits, responsibilities and records",
      "Reporting incidents, near misses and concerns",
      "Scenario: pressure to ignore or hide an issue",
      "Knowledge check, commitment and completion"
    ]
  },
  {
    code: "ELH-11",
    slug: "circular-economy",
    title: "Circular Economy",
    level: "advanced",
    estimatedMinutes: 15,
    shortDescription: "Explores how businesses can keep products and materials in use for longer through smarter design, purchasing, maintenance, reuse, repair and recovery.",
    aim: "Move learners beyond recycling and help them apply circular thinking to workplace decisions and processes.",
    learningObjectives: [
      "Distinguish a linear model from a circular approach.",
      "Prioritise prevention, durability, reuse and repair before disposal.",
      "Identify circular opportunities within a workplace process.",
      "Evaluate trade-offs instead of accepting superficial green claims."
    ],
    badgeName: "Circular Thinking",
    badgeDescription: "Awarded for completing the Circular Economy course.",
    lessons: [
      "Hook: recycling is not the first solution",
      "Linear and circular systems",
      "Design, purchase, maintain, reuse and recover",
      "Finding circular opportunities at work",
      "Scenario: redesigning a wasteful process",
      "Knowledge check, commitment and completion"
    ]
  },
  {
    code: "ELH-12",
    slug: "final-sustainability-certification",
    title: "Final Sustainability Certification",
    level: "advanced",
    estimatedMinutes: 20,
    shortDescription: "A scenario-based final assessment that tests whether learners can apply the complete foundation pathway to realistic workplace decisions.",
    aim: "Confirm practical sustainability judgement across waste, energy, water, purchasing, carbon, biodiversity, ESG, compliance and circular economy topics.",
    learningObjectives: [
      "Apply knowledge across several sustainability topics at once.",
      "Select actions that are practical, responsible and evidence-based.",
      "Recognise when to act, ask, document or escalate.",
      "Demonstrate readiness to complete the foundation certification pathway."
    ],
    badgeName: "EcoLearnHub Sustainability Certificate",
    badgeDescription: "Awarded for completing all modules and passing the final certification exam.",
    lessons: [
      "Certification briefing and rules",
      "Integrated scenario 1: routine workplace operations",
      "Integrated scenario 2: purchasing and resource decisions",
      "Integrated scenario 3: incident, evidence and escalation",
      "Final assessment and targeted feedback",
      "Commitment, certificate and next pathway recommendation"
    ]
  }
];

export async function ensureCatalogueSkeletons(): Promise<void> {
  const report = {
    totalCourses: 0,
    initialCatalogueCoursesPresent: 0,
    coursesNewlyInserted: 0,
    coursesPreserved: 0,
    lessonsNewlyInserted: 0,
    prerequisiteRelationshipsInserted: 0,
    recommendationRelationshipsInserted: 0,
    conflictsOrSkipped: 0,
    seedVersionRecorded: SEED_NAME
  };

  try {
    await db.transaction(async (tx) => {
      // 1. Process courses
      const courseIdMap = new Map<string, number>();

      for (const targetCourse of CATALOGUE_COURSES) {
        // a. Lookup by primary slug or legacy slugs (Safeguard 1)
        const slugsToCheck = [targetCourse.slug, ...(targetCourse.legacySlugs || [])];
        let existingCourse = await tx
          .select()
          .from(coursesTable)
          .where(inArray(coursesTable.slug, slugsToCheck))
          .limit(1)
          .then((rows) => rows[0]);

        // b. Lookup by exact title as secondary checks (Safeguard 6)
        if (!existingCourse) {
          const byTitle = await tx
            .select()
            .from(coursesTable)
            .where(eq(coursesTable.title, targetCourse.title))
            .limit(1)
            .then((rows) => rows[0]);

          if (byTitle) {
            logger.warn(
              { slug: targetCourse.slug, existingSlug: byTitle.slug, title: targetCourse.title },
              `Legacy course conflict: "${targetCourse.title}" exists under slug "${byTitle.slug}" instead of "${targetCourse.slug}". Preserving legacy record.`
            );
            existingCourse = byTitle;
            report.conflictsOrSkipped++;
          }
        }

        let courseId: number;

        if (existingCourse) {
          courseId = existingCourse.id;
          report.coursesPreserved++;
          logger.info({ id: courseId, slug: existingCourse.slug }, `Preserved existing course: ${targetCourse.title}`);
        } else {
          // c. Insert new course under draft status (Safeguard 8)
          const fullDescription = `${targetCourse.shortDescription}\n\nAim: ${targetCourse.aim}`;
          const inserted = await tx
            .insert(coursesTable)
            .values({
              title: targetCourse.title,
              slug: targetCourse.slug,
              description: targetCourse.shortDescription,
              fullDescription: fullDescription,
              categoryId: 1,
              durationMinutes: targetCourse.estimatedMinutes,
              priceUsd: "1400.00",
              level: targetCourse.level,
              isFeatured: false,
              isPublished: false, // Hidden from learners (Safeguard 8)
              status: "draft", // Draft status (Safeguard 8)
              learningObjectives: targetCourse.learningObjectives,
              badgeName: targetCourse.badgeName,
              badgeDescription: targetCourse.badgeDescription
            })
            .returning({ id: coursesTable.id });

          courseId = inserted[0]!.id;
          report.coursesNewlyInserted++;
          logger.info({ id: courseId, slug: targetCourse.slug }, `Seeded new course shell: ${targetCourse.title}`);
        }

        courseIdMap.set(targetCourse.slug, courseId);
        if (targetCourse.legacySlugs) {
          for (const s of targetCourse.legacySlugs) {
            courseIdMap.set(s, courseId);
          }
        }
      }

      logger.info("Starting Step 2: Sequential recommendations setup...");
      // 2. Set recommendations sequentially (Safeguard 4)
      for (let i = 0; i < CATALOGUE_COURSES.length - 1; i++) {
        const currentCourse = CATALOGUE_COURSES[i]!;
        const nextCourse = CATALOGUE_COURSES[i + 1]!;

        const currentId = courseIdMap.get(currentCourse.slug);
        const nextId = courseIdMap.get(nextCourse.slug);

        if (currentId && nextId) {
          const [dbCourse] = await tx
            .select({ recommendedNextCourseId: coursesTable.recommendedNextCourseId })
            .from(coursesTable)
            .where(eq(coursesTable.id, currentId))
            .limit(1);

          // We only update if the field is empty, or matches this seed sequence already
          if (!dbCourse || dbCourse.recommendedNextCourseId === null || dbCourse.recommendedNextCourseId === nextId) {
            if (!dbCourse || dbCourse.recommendedNextCourseId === null) {
              await tx
                .update(coursesTable)
                .set({ recommendedNextCourseId: nextId })
                .where(eq(coursesTable.id, currentId));
              report.recommendationRelationshipsInserted++;
            }
          } else {
            logger.warn(
              { courseId: currentId, currentNextId: dbCourse.recommendedNextCourseId, expectedNextId: nextId },
              `Recommendation conflict: course ID ${currentId} has manual next course ${dbCourse.recommendedNextCourseId}. Preserving administrator edit.`
            );
            report.conflictsOrSkipped++;
          }
        }
      }

      logger.info("Starting Step 3: Seeding lesson skeletons for courses 3 to 12...");
      // 3. Seed lessons for Course 3 through Course 12 (Safeguard 3: Course 1 & 2 are untouched)
      for (const targetCourse of CATALOGUE_COURSES) {
        // Skip Course 1 and Course 2 lesson seeding entirely to protect content & admin edits
        if (targetCourse.code === "ELH-01" || targetCourse.code === "ELH-02") {
          continue;
        }

        const courseId = courseIdMap.get(targetCourse.slug);
        if (!courseId) continue;

        // Check if lessons already exist individually for this course (Safeguard 5)
        const existingLessons = await tx
          .select()
          .from(lessonsTable)
          .where(eq(lessonsTable.courseId, courseId));

        if (existingLessons.length === 0) {
          for (let index = 0; index < targetCourse.lessons.length; index++) {
            const lessonTitle = targetCourse.lessons[index]!;
            
            // Build draft skeleton content blocks (Safeguard 7)
            const contentBlocks: any[] = [
              {
                id: `c${courseId}-l${index}-b0`,
                type: "heading",
                position: 0,
                headingText: `[DRAFT SKELETON] ${lessonTitle}`
              },
              {
                id: `c${courseId}-l${index}-b1`,
                type: "short_text",
                position: 1,
                bodyText: `[DRAFT SKELETON] Introduction and narration for ${lessonTitle}. This is draft skeleton content.`
              },
              {
                id: `c${courseId}-l${index}-b2`,
                type: "workplace_example",
                position: 2,
                bodyText: `[DRAFT SKELETON] Mauritian workplace example placeholder for ${lessonTitle}.`
              }
            ];

            if (index === 4) {
              contentBlocks.push({
                id: `c${courseId}-l${index}-b3`,
                type: "decision_scenario",
                position: 3,
                decisionIntro: `[DRAFT SKELETON] Review the following scenario:`,
                decisionPrompt: `[DRAFT SKELETON] What is the most appropriate action to take?`,
                decisionChoices: [
                  { label: `[DRAFT SKELETON] Action A (Preferred)`, correct: true, feedback: `[DRAFT SKELETON] Correct feedback.` },
                  { label: `[DRAFT SKELETON] Action B`, correct: false, feedback: `[DRAFT SKELETON] Incorrect feedback.` }
                ] as any
              });
            }

            if (index === 5) {
              contentBlocks.push({
                id: `c${courseId}-l${index}-b3`,
                type: "commitment",
                position: 3,
                commitmentInstruction: `[DRAFT SKELETON] Select your action commitment:`,
                commitmentOptions: [
                  { value: "commitment-1", label: `[DRAFT SKELETON] Focus on behavior 1`, description: `[DRAFT SKELETON] Focus on behavior 1 description.` },
                  { value: "commitment-2", label: `[DRAFT SKELETON] Focus on behavior 2`, description: `[DRAFT SKELETON] Focus on behavior 2 description.` }
                ] as any
              });
            }

            await tx.insert(lessonsTable).values({
              courseId,
              title: lessonTitle,
              orderIndex: index,
              durationMinutes: 3,
              content: `[DRAFT SKELETON] Content for ${lessonTitle}`,
              contentBlocks: contentBlocks as any
            });

            report.lessonsNewlyInserted++;
          }

          // Seed one draft quiz question for the course
          await tx.insert(quizQuestionsTable).values({
            courseId,
            question: `[DRAFT SKELETON] Quiz Question for ${targetCourse.title}`,
            options: [`[DRAFT SKELETON] Option A`, `[DRAFT SKELETON] Option B`],
            correctOption: 0,
            orderIndex: 0,
            correctExplanation: `[DRAFT SKELETON] Correct option explanation.`,
            incorrectExplanation: `[DRAFT SKELETON] Incorrect option explanation.`,
            optionFeedback: [`[DRAFT SKELETON] Option A feedback`, `[DRAFT SKELETON] Option B feedback`]
          });
        }
      }

      logger.info("Starting Step 4: Seeding prerequisites for course 12...");
      // 4. Seed prerequisites for Course 12 (requiring Course 1 to 11) (Safeguard 1)
      const course12Id = courseIdMap.get("final-sustainability-certification");
      if (course12Id) {
        for (const targetCourse of CATALOGUE_COURSES) {
          if (targetCourse.slug === "final-sustainability-certification") continue;
          const prereqId = courseIdMap.get(targetCourse.slug);
          if (prereqId) {
            const [existingPrereq] = await tx
              .select()
              .from(coursePrerequisitesTable)
              .where(
                and(
                  eq(coursePrerequisitesTable.courseId, course12Id),
                  eq(coursePrerequisitesTable.prerequisiteCourseId, prereqId)
                )
              )
              .limit(1);

            if (!existingPrereq) {
              await tx.insert(coursePrerequisitesTable).values({
                courseId: course12Id,
                prerequisiteCourseId: prereqId
              });
              report.prerequisiteRelationshipsInserted++;
            }
          }
        }
      }

      logger.info("Starting Step 5: Seeding badge definitions for courses 3 to 12...");
      // 5. Seed Badge Definition for Course 3 through Course 12 (Safeguard 1)
      for (const targetCourse of CATALOGUE_COURSES) {
        if (targetCourse.code === "ELH-01" || targetCourse.code === "ELH-02") continue;
        const courseId = courseIdMap.get(targetCourse.slug);
        if (!courseId) continue;

        const badgeSlug = targetCourse.slug + "-badge";
        const [existingBadge] = await tx
          .select()
          .from(badgeDefinitionsTable)
          .where(eq(badgeDefinitionsTable.slug, badgeSlug))
          .limit(1);

        if (!existingBadge) {
          await tx.insert(badgeDefinitionsTable).values({
            slug: badgeSlug,
            name: targetCourse.badgeName,
            description: targetCourse.badgeDescription,
            icon: "award",
            criteriaType: "all_courses",
            threshold: 0,
            courseIds: [courseId],
            orderIndex: 0
          });
        }
      }

      logger.info("Starting Step 6: Recording system seed completion marker...");
      // 6. Record seed completion marker in systemSeedsTable
      await tx
        .insert(systemSeedsTable)
        .values({
          name: SEED_NAME,
          version: 1
        })
        .onConflictDoNothing();
      logger.info("Finished Step 6: Transaction commit starting...");

      const [allCoursesCount] = await tx
        .select({ val: count() })
        .from(coursesTable);
      report.totalCourses = allCoursesCount?.val || 0;

      const slugs = CATALOGUE_COURSES.flatMap(c => [c.slug, ...(c.legacySlugs || [])]);
      const [initialCount] = await tx
        .select({ val: count() })
        .from(coursesTable)
        .where(inArray(coursesTable.slug, slugs));
      report.initialCatalogueCoursesPresent = initialCount?.val || 0;
    });

    logger.info({ report }, "Catalogue skeletons bootstrap completed successfully!");
  } catch (err) {
    logger.error({ err }, "Failed to execute catalogue bootstrapper transaction. Rolled back.");
    throw err;
  }
}
