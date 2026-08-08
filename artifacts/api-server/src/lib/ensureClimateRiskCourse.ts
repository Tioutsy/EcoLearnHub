import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
  coursePrerequisitesTable,
  quizAttemptsTable,
  lessonProgressTable,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_SLUG = "climate-risk-and-workplace-resilience";
const COURSE_TITLE = "Climate Risk & Workplace Resilience";
const BADGE_SLUG = "workplace-climate-resilience";
const BADGE_CODE = "COURSE_ELH_30_COMPLETE";
const SEED_NAME = "climate-risk-and-workplace-resilience-v1";

const COURSE_META = {
  courseCode: "ELH-30",
  description: "Learn how climate-related hazards affect business operations, distinguish mitigation from adaptation, map workplace vulnerabilities, and apply practical resilience actions across people, facilities, data, and supply chains.",
  fullDescription: "This course provides employees, managers, and operational teams across Mauritian commercial facilities with a practical framework for climate risk and workplace resilience. Learn how extreme weather events disrupt business operations, distinguish carbon mitigation from climate adaptation, map risks using the Hazard–Exposure–Vulnerability sequence, inspect 8 core operational resilience areas, and apply the STOP–CHECK–PROTECT–REPORT–ESCALATE protocol safely.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: true,
  thumbnailUrl: "/images/courses/climate-risk-and-workplace-resilience.jpg",
  intendedRoles: [
    "General employees",
    "Department managers",
    "Operations leads",
    "Facilities officers",
    "Health and safety representatives",
    "Business continuity coordinators",
    "HR and administrative leads"
  ],
  learningObjectives: [
    "Explain the difference between carbon mitigation (emissions reduction) and climate adaptation (resilience).",
    "Recognise how severe weather, flooding, heat, and power disruptions affect workplace operations.",
    "Map workplace risks using the Hazard → Exposure → Vulnerability → Operational Consequence sequence.",
    "Inspect 8 core operational areas: People, Buildings, Equipment, Utilities, Data, Suppliers, Transport, and Operations.",
    "Apply the 5-step STOP–CHECK–PROTECT–REPORT–ESCALATE protocol during weather warnings safely.",
    "Select one realistic workplace climate resilience commitment to support operational readiness."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Climate Risk & Workplace Resilience. You can now identify operational vulnerabilities, distinguish mitigation from adaptation, and support practical workplace resilience actions safely.",
  badgeName: "Workplace Climate Resilience Practitioner",
  badgeDescription: "Awarded for demonstrating practical understanding of workplace climate risk assessment, operational vulnerability mapping, and business resilience protocols.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Opening Workplace Hook: The Heavy Rainfall Warning",
    minutes: 3,
    content: "Examine how a severe weather event creates operational, human, and supply chain disruptions beyond direct physical building damage.",
    blocks: [
      { id: "cr1-h1", type: "heading", position: 1, headingText: "Heavy Rainfall at a Mauritian Facility" },
      { id: "cr1-t1", type: "short_text", position: 2, bodyText: "On a Friday afternoon at a commercial logistics hub near Ebène, a Torrential Rain Warning is issued. Water begins pooling near ground-floor server rooms, three key staff members live in high-risk flood zones, a major supplier delivery is stuck on a blocked coastal road, and critical customer paper files are stored in low-lying cardboard boxes." },
      { id: "cr1-k1", type: "key_message", position: 3, headingText: "Resilience Is Operational, Human, and Financial", bodyText: "Climate risk is not just an environmental issue—it directly impacts employee safety, business continuity, IT data access, utility stability, and customer trust. Workplace resilience means preparing systems and teams to withstand disruption and recover rapidly." },
      {
        id: "cr1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Friday weather warning decision scenario:",
        decisionPrompt: "A torrential rain warning is active, and water begins pooling near the ground-floor server room door. What is the most appropriate immediate action?",
        decisionChoices: [
          { label: "Report the water pooling immediately to facilities and IT leads, elevate low-lying electrical cables safely if authorised, and protect the doorway with sandbags or barrier seals", correct: true, feedback: "Outstanding! Prompt reporting and safe physical protection prevent catastrophic IT hardware damage and data loss." },
          { label: "Ignore the water because server rooms are managed by external IT vendors who do not work on Fridays", correct: false, feedback: "Incorrect! Operational site risks require immediate internal escalation regardless of third-party contracts." },
          { label: "Open the server room doors to let rainwater drain into the hallway", correct: false, feedback: "NEVER allow water into sensitive IT equipment rooms!" }
        ]
      },
      {
        id: "cr1-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "What is the primary objective of workplace climate resilience?",
        mcqOptions: [
          "Preparing systems, people, facilities, and supply chains so the workplace can withstand, adapt to, and recover from climate-related disruptions",
          "Stopping all rain and wind from occurring in tropical island nations",
          "Deleting company backup records whenever weather warnings are issued",
          "Closing business operations permanently at the first sign of rain"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Workplace resilience prepares operational systems, people, and supply chains to maintain business continuity during disruptions.",
        mcqIncorrectExplanation: "Incorrect. Resilience focuses on operational preparation, safety, and business continuity."
      }
    ]
  },
  {
    order: 1,
    title: "Understanding Mitigation vs Adaptation",
    minutes: 3,
    content: "Distinguish carbon mitigation (emissions reduction) from climate adaptation (resilience) with clear workplace examples.",
    blocks: [
      { id: "cr2-h1", type: "heading", position: 1, headingText: "Two Essential Climate Strategies" },
      { id: "cr2-t1", type: "short_text", position: 2, bodyText: "Comprehensive sustainability requires two complementary approaches:" },
      {
        id: "cr2-k1",
        type: "key_message",
        position: 3,
        headingText: "Mitigation vs Adaptation",
        bodyText: "• Mitigation (Emissions Reduction): Actions that lower greenhouse gas emissions (e.g. switching off unused lights, buying energy-efficient machinery, reducing vehicle fuel draw).\n• Adaptation (Workplace Resilience): Actions that adjust operations to withstand current or expected physical climate impacts (e.g. elevating critical equipment, installing storm shutters, backing up digital records, cross-training staff)."
      },
      {
        id: "cr2-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "According to the Intergovernmental Panel on Climate Change (IPCC) and UNDRR frameworks, every $1 invested in proactive climate adaptation and facility resilience saves up to $4 to $7 in avoided emergency repairs, business downtime, and asset replacement costs!"
      }
    ]
  },
  {
    order: 2,
    title: "Mapping Vulnerability: Hazard to Consequence",
    minutes: 4,
    content: "Master the 4-step risk sequence: Hazard → Exposure → Vulnerability → Operational Consequence.",
    blocks: [
      { id: "cr3-h1", type: "heading", position: 1, headingText: "The 4-Step Risk Sequence" },
      { id: "cr3-t1", type: "short_text", position: 2, bodyText: "Evaluate climate risks methodically using this four-stage sequence:" },
      {
        id: "cr3-k1",
        type: "key_message",
        position: 3,
        headingText: "The Risk Sequence",
        bodyText: "1. HAZARD: The physical climate event (e.g. extreme heat, flash flooding, coastal storm surge).\n2. EXPOSURE: The location of people, buildings, or assets in the path of the hazard (e.g. ground-floor inventory storage near a river channel).\n3. VULNERABILITY: The weakness or lack of protection (e.g. cardboard boxes stored directly on concrete without pallets or water barriers).\n4. CONSEQUENCE: The operational impact (e.g. ruined inventory, cancelled customer orders, financial loss)."
      },
      {
        id: "cr3-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Resilience Rule: Reduce Vulnerability",
        bodyText: "CRITICAL OPERATIONAL PRINCIPLE: We cannot stop weather hazards, but workplaces CAN dramatically reduce vulnerability by raising equipment off floors, maintaining clear storm drains, and establishing remote communication backups."
      }
    ]
  },
  {
    order: 3,
    title: "The 8 Core Operational Resilience Areas",
    minutes: 4,
    content: "Inspect the 8 vital operational areas across people, facilities, utilities, suppliers, data, and business continuity.",
    blocks: [
      { id: "cr4-h1", type: "heading", position: 1, headingText: "Workplace Resilience Checklist" },
      { id: "cr4-t1", type: "short_text", position: 2, bodyText: "Assess workplace readiness across 8 key operational areas:" },
      {
        id: "cr4-k1",
        type: "key_message",
        position: 3,
        headingText: "8 Resilience Areas",
        bodyText: "1. PEOPLE: Clear emergency contact lists, staff welfare checks, and safe remote work protocols.\n2. BUILDINGS: Clear drainage channels, secure roof fixtures, and water barrier seals.\n3. EQUIPMENT: Critical machinery elevated on pallets or upper levels away from flood risk.\n4. UTILITIES: Backup power generator fuel checked, UPS battery backups tested, water storage filled.\n5. DATA & DOCUMENTS: Cloud data backups verified, confidential physical records stored in water-tight cabinets.\n6. SUPPLIERS: Alternative suppliers identified for critical materials and logistics routes.\n7. TRANSPORT & ACCESS: Safe travel advice, staff transport coordination, and site access checks.\n8. OPERATIONS: Clear priority list of essential business functions to maintain during disruption."
      },
      {
        id: "cr4-img1",
        type: "visual_question",
        position: 4,
        imageUrl: "/images/courses/visual-climate-risk-inspection.png",
        caption: "Facility Site Resilience Inspection: Palletized electronic stock, generator fuel check, storm drain clearance, cloud backup verification sign, and worker completing pre-cyclone checklist.",
        imageAlt: "Realistic photograph of a Mauritian commercial warehouse compound showing electronic inventory elevated on wooden pallets, a technician verifying generator fuel levels, staff clearing a storm drain grating, a notice reading CLOUD DATA BACKUP VERIFIED DAILY, and a manager completing a pre-cyclone resilience checklist."
      },
      {
        id: "cr4-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "In the warehouse resilience inspection above, why is elevating electronic inventory on wooden pallets an effective adaptation measure?",
        mcqOptions: [
          "It reduces vulnerability by preventing water damage to stock during unexpected ground-floor flooding",
          "It makes inventory heavier so staff cannot move it",
          "It eliminates the need to inspect roof drainage",
          "It automatically generates renewable electricity for the warehouse"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Elevating inventory on pallets reduces physical vulnerability by keeping goods safe above ground flood levels.",
        mcqIncorrectExplanation: "Incorrect. Elevating stock on pallets protects goods from water damage during flash floods."
      }
    ]
  },
  {
    order: 4,
    title: "Action Protocol & Sector Scenarios",
    minutes: 3,
    content: "Apply the STOP–CHECK–PROTECT–REPORT–ESCALATE protocol across hotel, office, and logistics scenarios.",
    blocks: [
      { id: "cr5-h1", type: "heading", position: 1, headingText: "The 5-Step Action Protocol" },
      { id: "cr5-t1", type: "short_text", position: 2, bodyText: "When encountering climate-related hazards or weather warnings, follow these 5 steps:" },
      {
        id: "cr5-k1",
        type: "key_message",
        position: 3,
        headingText: "STOP–CHECK–PROTECT–REPORT–ESCALATE",
        bodyText: "1. STOP: Halt unsafe outdoor work or exposed electrical operations immediately.\n2. CHECK: Inspect immediate workspace for vulnerable assets, open windows, or clogged drains.\n3. PROTECT: Secure loose materials, cover sensitive equipment, move items off floor level.\n4. REPORT: Inform team lead, facilities contact, or safety officer of identified hazards.\n5. ESCALATE: Escalate unresolved utility faults, major leaks, or communication gaps."
      },
      {
        id: "cr5-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Hotel & Resort Resilience Scenario:",
        decisionPrompt: "A coastal hotel receives a Class II Cyclone Warning. Power grid fluctuations begin, and coastal swells increase. What should the duty manager prioritise first?",
        decisionChoices: [
          { label: "Verify emergency communication channels with staff and guests, check backup generator fuel levels, and secure outdoor beach furniture safely", correct: true, feedback: "Correct! Prioritising guest/staff communication, utility backups, and physical asset protection ensures hotel safety." },
          { label: "Wait until Class IV warning before informing staff or securing outdoor furniture", correct: false, feedback: "Incorrect! Proactive preparation before conditions severe prevents injuries and property destruction." },
          { label: "Instruct housekeeping to throw outdoor furniture into the lagoon", correct: false, feedback: "NEVER dump furniture or waste into marine environments!" }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Climate Resilience Commitment",
    minutes: 3,
    content: "Select practical daily workplace commitments to support climate risk awareness and operational readiness.",
    blocks: [
      { id: "cr6-h1", type: "heading", position: 1, headingText: "Pledge to Act" },
      { id: "cr6-t1", type: "short_text", position: 2, bodyText: "Congratulations on completing the lessons! Select the climate resilience habits you commit to practice in your daily work routine." },
      {
        id: "cr6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your daily workplace climate resilience commitments (choose at least one):",
        commitmentOptions: [
          { value: "report-vulnerabilities", label: "Report physical site vulnerabilities (clogged drains, roof leaks, exposed wiring) promptly", description: "Help facilities fix weak points before severe weather occurs." },
          { value: "protect-critical-data", label: "Verify digital file backups and store physical paper records off floor levels", description: "Safeguard business data continuity against flood damage." },
          { value: "apply-stop-check-protect", label: "Apply the STOP–CHECK–PROTECT–REPORT–ESCALATE protocol during weather warnings", description: "Take safe, structured action to protect colleagues and facility assets." },
          { value: "verify-emergency-contacts", label: "Ensure personal emergency contact details and team communication channels are current", description: "Maintain reliable team communication during severe weather disruptions." },
          { value: "support-adaptation-actions", label: "Support workplace adaptation measures across energy, water, and supply chain readiness", description: "Build long-term operational resilience within your team." }
        ]
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "What is the key distinction between climate mitigation and climate adaptation?",
    options: [
      "Mitigation is for hotel guests; Adaptation is for office cleaners",
      "Mitigation requires solar panels; Adaptation requires deleting email attachments",
      "Mitigation focuses on reducing carbon emissions; Adaptation focuses on preparing facilities, people, and operations to withstand physical climate impacts",
      "There is no distinction; both mean buying paper drinking straws"
    ],
    correct: 2,
    correctExplanation: "Mitigation reduces emissions; Adaptation builds operational resilience to withstand climate impacts.",
    incorrectExplanation: "Incorrect. Mitigation reduces greenhouse gases; Adaptation adjusts systems to handle climate impacts."
  },
  {
    order: 2,
    question: "In the 4-step risk sequence (Hazard → Exposure → Vulnerability → Consequence), which element can a company control directly?",
    options: [
      "Vulnerability (by elevating assets, securing drains, and establishing backup communications)",
      "The physical weather hazard itself",
      "The global climate system",
      "The distance between Mauritius and the equator"
    ],
    correct: 0,
    correctExplanation: "Workplaces cannot stop weather hazards, but they can directly reduce vulnerability through preparation.",
    incorrectExplanation: "Incorrect. Companies can directly reduce physical vulnerability through proactive controls."
  },
  {
    order: 3,
    question: "Heavy rainfall is forecast. A staff member notices that important computer equipment in a storeroom is sitting directly on the concrete floor near a door. What should they do?",
    options: [
      "Leave the equipment on the floor because it is not their personal computer",
      "Report the risk immediately to facilities/IT and raise the equipment onto pallets or tables safely",
      "Cover the equipment with paper towels",
      "Wait for ground flooding to occur before informing anyone"
    ],
    correct: 1,
    correctExplanation: "Reporting vulnerability and safely raising equipment off floor level prevents flood damage.",
    incorrectExplanation: "Incorrect. Report vulnerable floor-level assets and elevate them safely."
  },
  {
    order: 4,
    question: "Why should supply chain dependencies be evaluated during climate risk planning?",
    options: [
      "Suppliers are required by law to pay for company rain gear",
      "Evaluating suppliers automatically stops coastal erosion",
      "Suppliers only deliver goods during sunny weather",
      "Severe weather can block transport routes or disrupt critical suppliers, causing operational halts even if your own facility is undamaged"
    ],
    correct: 3,
    correctExplanation: "Disruptions to third-party suppliers or logistics routes directly impact business operations.",
    incorrectExplanation: "Incorrect. Supply chain disruptions can halt business operations even if facility buildings are intact."
  },
  {
    order: 5,
    question: "What is a key utility resilience check for Mauritian commercial facilities before cyclone season?",
    options: [
      "Unplugging all emergency exit lighting",
      "Testing backup generator fuel supplies, inspecting UPS battery backups, and filling emergency water tanks",
      "Draining all water storage tanks into public drains",
      "Turning off central fire safety alarms overnight"
    ],
    correct: 1,
    correctExplanation: "Verifying backup generators, batteries, and emergency water ensures utility continuity during power outages.",
    incorrectExplanation: "Incorrect. Checking generators, batteries, and water supplies maintains essential utility functions."
  },
  {
    order: 6,
    question: "How should important company documents and IT data be protected from climate-related water damage?",
    options: [
      "Keep paper documents stacked in unsealed cardboard boxes on basement floors",
      "Store confidential client records on open outdoor tables",
      "Verify automated cloud backups daily and store physical paper records in water-tight cabinets off floor levels",
      "Delete all digital files so paper is the only record"
    ],
    correct: 2,
    correctExplanation: "Cloud data backups and elevated water-tight physical storage safeguard data continuity.",
    incorrectExplanation: "Incorrect. Secure cloud backups and elevated storage protect vital business records."
  },
  {
    order: 7,
    question: "What is the first action in the STOP–CHECK–PROTECT–REPORT–ESCALATE protocol when observing an outdoor hazard during severe weather?",
    options: [
      "STOP: Halt unsafe outdoor work or exposed electrical operations immediately to protect human safety",
      "REPORT: Post a message on public social media",
      "PROTECT: Try to fix high-voltage power lines yourself without tools",
      "ESCALATE: Call international emergency services"
    ],
    correct: 0,
    correctExplanation: "Human safety comes first—STOP unsafe outdoor or electrical activities immediately.",
    incorrectExplanation: "Incorrect. STOP unsafe work immediately to protect personal safety."
  },
  {
    order: 8,
    question: "Why is multi-channel communication important for staff during severe weather disruptions?",
    options: [
      "Communication channels are used exclusively to stream video games",
      "Reliable channels ensure employees receive prompt safety updates, operational status changes, and remote work instructions",
      "Staff communications are only necessary during annual performance reviews",
      "Multi-channel tools automatically repair damaged roofs"
    ],
    correct: 1,
    correctExplanation: "Multi-channel communications ensure staff receive vital safety updates and operational instructions.",
    incorrectExplanation: "Incorrect. Reliable communications keep teams informed of safety and operational procedures."
  },
  {
    order: 9,
    question: "A company operates three coastal delivery vans. A storm surge warning is issued. What is the most responsible transport action?",
    options: [
      "Instruct drivers to speed through flooded coastal roads to meet delivery times",
      "Abandon the delivery vans in the middle of coastal highways",
      "Ignore weather warnings completely",
      "Reroute or pause coastal deliveries until authorities declare routes safe, keeping drivers informed"
    ],
    correct: 3,
    correctExplanation: "Pausing or rerouting deliveries protects driver safety and company vehicle assets during storm surges.",
    incorrectExplanation: "Incorrect. Reroute or pause deliveries to protect staff safety and fleet vehicles."
  },
  {
    order: 10,
    question: "How does ELH-30 (Climate Risk & Resilience) differ from ELH-07 (Carbon Footprint Awareness)?",
    options: [
      "ELH-30 replaces all other 29 courses in the Elevio catalogue",
      "ELH-07 focuses on carbon emissions reduction (mitigation); ELH-30 focuses on operational readiness and adaptation to climate impacts",
      "ELH-07 is for office staff only; ELH-30 is for submarine captains",
      "There is no difference between carbon reduction and climate adaptation"
    ],
    correct: 1,
    correctExplanation: "ELH-07 teaches carbon emissions mitigation; ELH-30 teaches physical adaptation and operational resilience.",
    incorrectExplanation: "Incorrect. ELH-07 covers carbon mitigation; ELH-30 covers climate adaptation and operational resilience."
  }
];

export async function ensureClimateRiskCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 30 by courseCode "ELH-30", slug, or ID
      let course = null;
      
      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-30"))
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
        }
      }

      let courseId: number;

      if (!course) {
        logger.info("Seeding new ELH-30 course record...");
        const [inserted] = await tx
          .insert(coursesTable)
          .values({
            courseCode: COURSE_META.courseCode,
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
            intendedRoles: COURSE_META.intendedRoles,
            learningObjectives: COURSE_META.learningObjectives,
            includesCertificate: COURSE_META.includesCertificate,
            passingScore: COURSE_META.passingScore,
            completionMessage: COURSE_META.completionMessage,
            badgeName: COURSE_META.badgeName,
            badgeDescription: COURSE_META.badgeDescription,
            isPublished: true,
          })
          .returning();

        courseId = inserted.id;
      } else {
        courseId = course.id;
        await tx
          .update(coursesTable)
          .set({
            courseCode: COURSE_META.courseCode,
            title: COURSE_TITLE,
            description: COURSE_META.description,
            fullDescription: COURSE_META.fullDescription,
            categoryId: COURSE_META.categoryId,
            durationMinutes: COURSE_META.durationMinutes,
            thumbnailUrl: COURSE_META.thumbnailUrl,
            learningObjectives: COURSE_META.learningObjectives,
            completionMessage: COURSE_META.completionMessage,
            badgeName: COURSE_META.badgeName,
            badgeDescription: COURSE_META.badgeDescription,
            isPublished: true,
          })
          .where(eq(coursesTable.id, courseId));
      }

      // 2. Seed Lessons & Content Blocks
      await tx.delete(lessonsTable).where(eq(lessonsTable.courseId, courseId));

      for (const lessonData of NEW_LESSONS) {
        await tx.insert(lessonsTable).values({
          courseId,
          orderIndex: lessonData.order,
          title: lessonData.title,
          durationMinutes: lessonData.minutes,
          content: lessonData.content,
          contentBlocks: lessonData.blocks,
        });
      }

      // 3. Seed Quiz Questions
      await tx.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, courseId));

      for (const q of NEW_QUIZ) {
        await tx.insert(quizQuestionsTable).values({
          courseId,
          orderIndex: q.order,
          question: q.question,
          options: q.options,
          correctOption: q.correct,
          optionFeedback: [
            q.incorrectExplanation,
            q.incorrectExplanation,
            q.incorrectExplanation,
            q.correctExplanation
          ]
        });
      }

      // 4. Seed Badge Definition
      const [existingBadge] = await tx
        .select()
        .from(badgeDefinitionsTable)
        .where(eq(badgeDefinitionsTable.slug, BADGE_SLUG))
        .limit(1);

      if (!existingBadge) {
        await tx.insert(badgeDefinitionsTable).values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "award",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 30,
        });
      }

      // 5. Seed Prerequisite: ELH-07 -> ELH-30
      const [elh07] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-07"))
        .limit(1);

      if (elh07) {
        const [existingPrereq] = await tx
          .select()
          .from(coursePrerequisitesTable)
          .where(
            and(
              eq(coursePrerequisitesTable.courseId, courseId),
              eq(coursePrerequisitesTable.prerequisiteCourseId, elh07.id)
            )
          )
          .limit(1);

        if (!existingPrereq) {
          await tx.insert(coursePrerequisitesTable).values({
            courseId,
            prerequisiteCourseId: elh07.id,
          });
        }
      }

      // Record seed execution
      await tx
        .insert(systemSeedsTable)
        .values({
          name: SEED_NAME,
          version: 1,
        })
        .onConflictDoNothing();

      logger.info({ courseId }, "ELH-30 Climate Risk & Workplace Resilience seeded successfully!");
    });
  } catch (err) {
    logger.error({ err }, "Failed to seed ELH-30 Climate Risk course");
    throw err;
  }
}
