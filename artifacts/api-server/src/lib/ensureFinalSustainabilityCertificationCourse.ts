import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
  coursePrerequisitesTable,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_ID = 12;
const COURSE_SLUG = "final-sustainability-certification";
const COURSE_TITLE = "Final Sustainability Certification";
const BADGE_SLUG = "core-sustainability-certified";
const SEED_NAME = "final-certification-v2";
const SKELETON_BADGE_SLUG = "core-sustainability-badge"; // catalogue skeleton slug — do not delete

const COURSE_META = {
  description:
    "The capstone certification assessment for Elevio's Core Sustainability Certificate pathway (ELH-01 through ELH-11). Evaluate integrated workplace scenarios, demonstrate practical judgement, and earn your certificate.",
  fullDescription:
    "This capstone assessment evaluates your ability to apply integrated sustainability principles across all 11 prerequisite courses in the Core Sustainability Certificate pathway. Assess real-world workplace scenarios involving waste sorting, energy efficiency, water conservation, sustainable procurement, green office practices, carbon footprints, Mauritian biodiversity, ESG evidence, environmental compliance, and circular economy decisions.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "1400.00",
  level: "ESG and Compliance",
  isFeatured: true,
  thumbnailUrl: "/images/courses/final-sustainability-certification.jpg",
  learningObjectives: [
    "Integrate core sustainability principles across waste, energy, water, procurement, green office, carbon, biodiversity, ESG, compliance, and circularity.",
    "Evaluate complex workplace scenarios requiring cross-departmental coordination and evidence verification.",
    "Apply operational protocols (Check–Record–Report, STOP–CHECK–CONTROL–RECORD–ESCALATE, CHECK–USE–CARE–SHARE–RECOVER) safely.",
    "Identify high-risk compliance, greenwashing, and safety violations.",
    "Earn the audit-ready Core Sustainability Certificate upon achieving the 80% passing threshold."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations! You have passed the Final Sustainability Certification assessment, demonstrating practical workplace understanding across the complete Core Sustainability Certificate pathway.",
  badgeName: "Core Sustainability Certificate",
  badgeDescription:
    "Awarded for completing Elevio's Core Sustainability Certificate pathway (ELH-01 through ELH-11) and passing the integrated capstone assessment.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Capstone Certification Briefing & Integrated Case",
    minutes: 3,
    content: "Review capstone assessment rules, pathway prerequisites, and the integrated Mauritian facility case study.",
    blocks: [
      { id: "fc1-h1", type: "heading", position: 1, headingText: "Capstone Assessment Briefing" },
      { id: "fc1-t1", type: "short_text", position: 2, bodyText: "Welcome to the capstone assessment for Elevio's Core Sustainability Certificate pathway! This assessment tests your ability to make responsible workplace decisions across all 11 foundation courses: ELH-01 (Foundations), ELH-02 (Waste), ELH-03 (Energy), ELH-04 (Water), ELH-05 (Procurement), ELH-06 (Green Office), ELH-07 (Carbon), ELH-08 (Biodiversity), ELH-09 (ESG), ELH-10 (Compliance), and ELH-11 (Circular Economy)." },
      { id: "fc1-k1", type: "key_message", position: 3, headingText: "Assessment Rules & Passing Standard", bodyText: "• Pass Threshold: 80% (12 out of 15 questions correct).\n• Scope: 15 scenario-based questions covering every foundation course and cross-topic workplace integration.\n• Retakes: Unlimited retakes permitted; previous attempt records are preserved.\n• Prerequisites: Enrolment requires 100% completion of ELH-01 through ELH-11." },
      {
        id: "fc1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Integrated Facility Inspection Readiness Case:",
        decisionPrompt: "A commercial facility in Ebène Cybercity is preparing for an international client audit in 30 minutes. You notice active lights in an empty room, an open window with AC running, a leaking water pipe near an open storm drain, an unlabelled chemical drum on pavement, and a supervisor asking staff to 'copy last month's figures' because Q4 logs are missing. What is the most responsible action?",
        decisionChoices: [
          { label: "Close the window, switch off lights, block the drain leak with a spill kit, secure the drum, present verified Q1–Q3 records honestly, and declare the Q4 data gap", correct: true, feedback: "Outstanding! Resolving physical hazards, containing runoff, and maintaining honest audit evidence protects workplace safety and corporate credibility." },
          { label: "Copy last month's figures quickly and hose the chemical leak into the storm drain before auditors arrive", correct: false, feedback: "NEVER falsify audit records or wash chemical spills into storm drains!" },
          { label: "Lock all doors, turn off electricity, and leave the building so auditors cannot inspect", correct: false, feedback: "Incorrect. Running away does not resolve operational hazards or audit requirements." }
        ]
      },
      {
        id: "fc1-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion: "What does the Core Sustainability Certificate represent?",
        mcqOptions: [
          "Completion of Elevio's foundation training pathway and passing the integrated workplace scenario assessment",
          "Statutory government certification as a licensed court judge",
          "An official engineering licence issued by the Ministry of Public Infrastructure",
          "An exemption from paying commercial electricity and water bills"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "The certificate records training completion and scenario assessment for Elevio's Core Sustainability pathway.",
        mcqIncorrectExplanation: "Incorrect. The certificate records workplace training completion and assessment."
      }
    ]
  },
  {
    order: 1,
    title: "Integrated Workplace Case: The Ebène Facility",
    minutes: 4,
    content: "Examine a realistic Mauritian commercial site integrating waste, energy, water, ESG, compliance, and circularity.",
    blocks: [
      { id: "fc2-h1", type: "heading", position: 1, headingText: "The Ebène Cybercity Facility Case" },
      { id: "fc2-t1", type: "short_text", position: 2, bodyText: "Examine a multi-departmental commercial facility operating in Ebène Cybercity. The site includes open-plan offices, a service loading yard, a storeroom, and staff facilities." },
      {
        id: "fc2-k1",
        type: "key_message",
        position: 3,
        headingText: "Cross-Topic Operational Frameworks",
        bodyText: "• Check–Record–Report–Confirm (ESG & Claims)\n• STOP–CHECK–CONTROL–RECORD–ESCALATE (Environmental Compliance)\n• CHECK–USE–CARE–SHARE–RECOVER (Circular Economy & Assets)"
      },
      {
        id: "fc2-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "According to ISO 14001 Environmental Management Standards and the UN Global Compact, organizations that implement integrated workplace sustainability training and verifiable recordkeeping reduce compliance incidents by over 60% and improve client audit success rates!"
      }
    ]
  },
  {
    order: 2,
    title: "Visual Site Capstone Inspection",
    minutes: 4,
    content: "Inspect the integrated commercial facility image and evaluate operational hazards and escalation steps.",
    blocks: [
      { id: "fc3-h1", type: "heading", position: 1, headingText: "Integrated Visual Site Inspection" },
      { id: "fc3-t1", type: "short_text", position: 2, bodyText: "Examine the integrated Mauritian facility photograph below. Observe the office lights, open window with AC, leaking water pipe, unlabelled drum near the storm drain, reusable crates, IT security cage, and worker logging evidence." },
      {
        id: "fc3-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-final-certification-workplace.png",
        caption: "Integrated Site Inspection: Office lights on & open window with AC (Energy waste), leaking pipe & unlabelled drum near drain (Water & Compliance hazard), reusable crates & IT cage (Circular opportunities), and worker logging photos (Evidence).",
        imageAlt: "Realistic photograph of a Mauritian commercial facility showing an upper office with lights on and an open window with AC running, a loading yard with an unlabelled blue drum leaking fluid near a storm drain, stacked green reusable crates, a locked wire cage with IT hardware, a repair workbench, and a manager in a safety vest logging evidence on a tablet."
      },
      {
        id: "fc3-m1",
        type: "multiple_choice",
        position: 4,
        mcqQuestion: "In the integrated facility inspection scene above, which combination of immediate actions addresses the highest environmental and operational risks?",
        mcqOptions: [
          "Deploy spill kit absorbent to block fluid from entering the storm drain, close the office window, turn off unneeded lights, log photos, and escalate to the site lead",
          "Hose the leaking fluid into the storm drain and open all office windows to cool the building",
          "Ignore the leaking drum and leave all office lights on overnight",
          "Break the lock on the IT cage and throw the computers into the street"
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation: "Blocking chemical runoff into storm drains, closing open windows while AC is running, switching off unneeded lights, and logging evidence correctly addresses immediate hazards.",
        mcqIncorrectExplanation: "Incorrect. Protect storm drains, conserve energy, and log evidence."
      }
    ]
  },
  {
    order: 3,
    title: "Cross-Topic Decision Worked Example",
    minutes: 4,
    content: "Analyze a complex worked scenario integrating procurement, IT data security, and tender ESG claims.",
    blocks: [
      { id: "fc4-h1", type: "heading", position: 1, headingText: "Worked Example: Cross-Topic Asset & Tender Decision" },
      { id: "fc4-t1", type: "short_text", position: 2, bodyText: "A company procurement lead receives a request to purchase 10 new laptops while 15 working 3-year-old laptops sit in a storeroom. Simultaneously, a client tender asks for ESG waste reduction proof and IT security protocols." },
      {
        id: "fc4-w1",
        type: "workplace_example",
        position: 3,
        headingText: "Worked Scenario: Asset Allocation & ESG Evidence",
        bodyText: "• Step 1: IT executes certified data sanitization (data wipe) on the 15 storeroom laptops.\n• Step 2: Procurement reallocates 10 wiped laptops to the requesting department (Circular Economy & Cost Savings).\n• Step 3: Logistics logs the asset transfer and data wiping certificates (Verifiable ESG & Compliance Evidence).\n• Step 4: Sales attaches the verified reuse log to the client tender response instead of making unverified '100% Eco-Friendly' claims."
      },
      {
        id: "fc4-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Evaluating tender claim scenario:",
        decisionPrompt: "A sales manager drafting a proposal wants to state: 'Our company has zero environmental impact and 100% clean operations.' What is the correct response?",
        decisionChoices: [
          { label: "Remove absolute claims, replace them with verified operational facts (e.g. 'We track monthly energy draw, follow approved recycling streams, and reallocate IT hardware')", correct: true, feedback: "Correct! Replacing absolute green claims with verified operational data protects company credibility and avoids greenwashing penalties." },
          { label: "Submit the proposal with the zero-impact claim to win the contract", correct: false, feedback: "NEVER submit absolute unverified claims! Absolute slogans create greenwashing liability." },
          { label: "Delete all environmental mentions and claim the company does not believe in sustainability", correct: false, feedback: "Incorrect. Present verified facts rather than omitting genuine achievements." }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "High-Risk Capstone Safeguards & Micro-Decisions",
    minutes: 3,
    content: "Review high-risk capstone violations and practice micro-decisions across corporate departments.",
    blocks: [
      { id: "fc5-h1", type: "heading", position: 1, headingText: "High-Risk Capstone Safeguards" },
      { id: "fc5-t1", type: "short_text", position: 2, bodyText: "NEVER engage in these prohibited workplace behaviors:" },
      {
        id: "fc5-k1",
        type: "key_message",
        position: 3,
        headingText: "Prohibited Actions",
        bodyText: "• DO NOT falsify, backdate, or guess figures on environmental, safety, or ESG records.\n• DO NOT wash chemical spills, oils, or contaminated washwater into storm drains or soil.\n• DO NOT donate or transfer data-bearing IT hardware without certified data wiping.\n• DO NOT publish absolute slogans like '100% Eco-Friendly' without verified baseline evidence.\n• DO NOT perform unapproved repairs on safety-critical electrical or pressure equipment."
      },
      {
        id: "fc5-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Department Manager Micro-Decision:",
        decisionPrompt: "A supervisor notices a small oil leak under a generator, broken solar water heating pipes, and missing Q3 waste transfer receipts right before a client inspection. What should the supervisor do?",
        decisionChoices: [
          { label: "Deploy spill containment under the generator, log the pipe leak for immediate repair, present verified Q1–Q2 waste receipts, and declare the Q3 data gap honestly", correct: true, feedback: "Outstanding! Resolving physical leaks, logging maintenance, and maintaining honest audit records demonstrates true workplace leadership." },
          { label: "Hose the oil leak into the storm drain and forge the Q3 waste receipt", correct: false, feedback: "NEVER hose oil into drains or forge compliance signatures!" },
          { label: "Ignore all issues and hope the client does not look at the generator", correct: false, feedback: "Incorrect. Active leadership requires prompt hazard control and honest reporting." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Sustainability Commitment & Disclaimer",
    minutes: 3,
    content: "Select practical capstone commitments and review the certificate limitation disclaimer.",
    blocks: [
      { id: "fc6-h1", type: "heading", position: 1, headingText: "Pledge to Lead" },
      { id: "fc6-t1", type: "short_text", position: 2, bodyText: "Congratulations on completing the capstone lessons! Select the commitments you will practice in your daily work routine." },
      {
        id: "fc6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your workplace capstone sustainability commitments (choose at least one):",
        commitmentOptions: [
          { value: "apply-integrated-protocols", label: "Apply operational protocols (Check–Record–Report, STOP–CHECK–CONTROL, CHECK–USE–CARE) daily", description: "Maintain safety, evidence integrity, and resource efficiency." },
          { value: "maintain-honest-records", label: "Maintain exact, verifiable records and declare data gaps honestly without guessing", description: "Protect audit credibility and corporate governance." },
          { value: "protect-waterways-storm-drains", label: "Keep chemicals, oils, and washwater away from storm drains and unpaved ground", description: "Prevent pollution of Mauritian waterways and lagoons." },
          { value: "prioritize-repair-reuse", label: "Check existing stock and prioritize repair and internal reallocation over new purchases", description: "Support circular economy value retention." },
          { value: "verify-green-claims", label: "Verify baseline evidence before supporting external environmental or ESG marketing claims", description: "Prevent greenwashing risks and protect company reputation." }
        ]
      },
      {
        id: "fc6-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Certificate Limitation Disclaimer",
        bodyText: "DISCLAIMER: The Elevio Core Sustainability Certificate records successful completion of foundation training and scenario assessment. It does not constitute statutory legal compliance, professional engineering accreditation, HRDC statutory certification, or external regulatory approval."
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "ELH-01 (Foundations): How does sustainable development balance workplace decisions?",
    options: [
      "By balancing environmental protection, social wellbeing, and economic viability without sacrificing future generations",
      "By focusing 100% on short-term profits regardless of pollution",
      "By shutting down all commercial businesses permanently",
      "By eliminating all employee safety training"
    ],
    correct: 0,
    correctExplanation: "Sustainable development balances environmental, social, and economic needs for present and future resilience.",
    incorrectExplanation: "Incorrect. Sustainability balances environmental, social, and economic factors."
  },
  {
    order: 2,
    question: "ELH-02 (Waste Sorting): What is the most important rule when sorting workplace waste under site bin arrangements?",
    options: [
      "Follow site-specific bin labels strictly, keep recyclable streams clean, and segregate hazardous items separately",
      "Mix food waste and hazardous chemicals into paper recycling bins to save space",
      "Burn plastic waste behind the building when bins are full",
      "Throw all waste into the nearest river"
    ],
    correct: 0,
    correctExplanation: "Clean segregation and following site bin labels prevents contamination of recyclable streams.",
    incorrectExplanation: "Incorrect. Follow site bin labels and keep recyclable streams uncontaminated."
  },
  {
    order: 3,
    question: "ELH-03 (Energy Efficiency): Which daily habit prevents avoidable electricity waste in air-conditioned offices?",
    options: [
      "Keep windows and doors closed while AC is running and set thermostats to a comfortable 24°C rather than freezing temperatures",
      "Open all windows wide while running the AC on 16°C continuously",
      "Leave lights and computers running on maximum brightness all weekend",
      "Cover AC outdoor compressors with plastic tarpaulins while operating"
    ],
    correct: 0,
    correctExplanation: "Closing windows and setting AC to 24°C reduces heavy electricity draw and compressor strain.",
    incorrectExplanation: "Incorrect. Keep windows closed and set AC to 24°C."
  },
  {
    order: 4,
    question: "ELH-04 (Water Conservation): What is the correct response upon discovering a leaking pipe in a washroom?",
    options: [
      "Report the leak location to facilities immediately and place a catch container if safe",
      "Ignore the leak because water is free",
      "Break the pipe further so water flows faster",
      "Cover the leak with paper towels and tell no one"
    ],
    correct: 0,
    correctExplanation: "Prompt reporting to facilities prevents massive clean water loss and structural damage.",
    incorrectExplanation: "Incorrect. Report water leaks to facilities immediately."
  },
  {
    order: 5,
    question: "ELH-05 (Sustainable Procurement): When purchasing goods, what should buyers check beyond the initial purchase price?",
    options: [
      "Whole-life cost including energy consumption, maintenance requirements, durability, and disposal costs",
      "Only the cheapest upfront purchase price regardless of quality or lifespan",
      "Whether the packaging has a bright green sticker",
      "Whether the vendor offers free plastic trinkets"
    ],
    correct: 0,
    correctExplanation: "Whole-life costing evaluates total operating, energy, maintenance, and end-of-life costs.",
    incorrectExplanation: "Incorrect. Evaluate whole-life operating and maintenance costs."
  },
  {
    order: 6,
    question: "ELH-06 (Green Office): How can office teams reduce unnecessary paper and digital clutter?",
    options: [
      "Default to double-sided digital review, print only when essential, and clean up unnecessary cloud file storage",
      "Print every email three times and store them in cardboard boxes on the floor",
      "Send 50 MB email attachments to all staff every morning",
      "Throw all paper documents into general trash without shredding confidential items"
    ],
    correct: 0,
    correctExplanation: "Digital review and cloud cleanup reduce paper waste and server data energy consumption.",
    incorrectExplanation: "Incorrect. Use digital review and print only when necessary."
  },
  {
    order: 7,
    question: "ELH-07 (Carbon Footprint): What is the difference between Scope 1 and Scope 2 greenhouse gas emissions?",
    options: [
      "Scope 1 emissions come from direct on-site fuel combustion (e.g. company vehicles, boilers); Scope 2 emissions come from purchased electricity consumption",
      "Scope 1 emissions come from employee commuting; Scope 2 emissions come from solar panels",
      "Scope 1 emissions are invisible; Scope 2 emissions are bright red",
      "Scope 1 emissions are legal; Scope 2 emissions are illegal"
    ],
    correct: 0,
    correctExplanation: "Scope 1 covers direct fuel combustion; Scope 2 covers indirect emissions from purchased electricity generation.",
    incorrectExplanation: "Incorrect. Scope 1 is direct fuel combustion; Scope 2 is purchased electricity."
  },
  {
    order: 8,
    question: "ELH-08 (Biodiversity): How can a commercial site in Mauritius protect local ecosystems?",
    options: [
      "Prevent chemical runoff into drains, control outdoor lighting glare, and protect native vegetation buffers",
      "Pour leftover paints and solvents onto soil near coastal trees",
      "Clear all trees and replace them with plastic artificial turf",
      "Install unshielded floodlights pointing directly into native forest reserves"
    ],
    correct: 0,
    correctExplanation: "Preventing chemical runoff and controlling outdoor light pollution protects sensitive Mauritian ecosystems.",
    incorrectExplanation: "Incorrect. Prevent runoff and protect native vegetation buffers."
  },
  {
    order: 9,
    question: "ELH-09 (ESG Basics): What should a team do when answering client ESG tender questionnaires if Q4 data is missing?",
    options: [
      "Provide verified Q1–Q3 data, declare the Q4 gap honestly, and explain repair or tracking steps being taken",
      "Invent guessed figures for Q4 to make the numbers look complete",
      "Submit an expired policy from five years ago without declaring the date",
      "Refuse to answer and delete all historical utility bills"
    ],
    correct: 0,
    correctExplanation: "Honest disclosure of data gaps with verified evidence maintains corporate credibility and avoids greenwashing.",
    incorrectExplanation: "Incorrect. Present verified data honestly and declare gaps."
  },
  {
    order: 10,
    question: "ELH-10 (Compliance): What is the correct response when observing an unlabelled chemical drum leaking near a storm drain?",
    options: [
      "STOP action safely, CHECK labels/SDSs, CONTROL runoff with spill kit booms, RECORD facts/photos, and ESCALATE to the site lead",
      "Hose the leaking chemical into the storm drain before an inspector sees it",
      "Kick the drum to see if it is full",
      "Ignore the leak because the drum belongs to a contractor"
    ],
    correct: 0,
    correctExplanation: "Follow STOP–CHECK–CONTROL–RECORD–ESCALATE to block drain runoff and report the hazard safely.",
    incorrectExplanation: "Incorrect. Deploy spill kit controls and escalate immediately; never wash chemicals into drains."
  },
  {
    order: 11,
    question: "ELH-11 (Circular Economy): In the 9-step Circular Value Hierarchy, which action should be taken BEFORE sending a damaged chair to a recycler?",
    options: [
      "Inspect the chair to determine if it can be maintained, repaired, reused, or refurbished",
      "Dump it in a landfill skip immediately",
      "Burn it in an open barrel behind the storeroom",
      "Order ten new chairs without checking the damaged one"
    ],
    correct: 0,
    correctExplanation: "Repair, maintenance, and refurbishment retain higher functional and financial value than material recycling.",
    incorrectExplanation: "Incorrect. Always evaluate repair and reuse before material recycling."
  },
  {
    order: 12,
    question: "Cross-Topic (Energy + Water): A facility manager notices an AC unit dripping condensation water onto a walkway near a storm drain. What is the best integrated action?",
    options: [
      "Inspect the AC drain line, clean the condensate trap, redirect clean water for garden irrigation if safe, and log the maintenance check",
      "Hose chemical detergent over the walkway and let it run into the storm drain",
      "Turn off all AC units permanently and open all windows during summer heatwaves",
      "Ignore the dripping water until the ceiling collapses"
    ],
    correct: 0,
    correctExplanation: "Cleaning condensate lines prevents water damage and safety hazards while enabling clean water reuse.",
    incorrectExplanation: "Incorrect. Repair AC condensate lines and reuse clean water safely."
  },
  {
    order: 13,
    question: "Cross-Topic (Procurement + IT): An IT department replaces 20 desktop computers. How should the team handle the old functional computers?",
    options: [
      "Execute certified data wiping, conduct electrical safety tests, and reallocate them for internal branch upgrades or approved educational redistribution",
      "Throw them into an outdoor trash skip with hard drives intact",
      "Give them away to strangers on the street without deleting confidential company files",
      "Smash the hard drives with a hammer and leave broken glass on the floor"
    ],
    correct: 0,
    correctExplanation: "Certified data wiping and safety testing allow safe circular asset reallocation without data security breaches.",
    incorrectExplanation: "Incorrect. Execute certified data wiping before asset reallocation or recycling."
  },
  {
    order: 14,
    question: "Cross-Topic (ESG + Compliance): During a pre-audit review, a supervisor discovers an unsigned waste transfer receipt and an uncalibrated water flow meter. What is the correct protocol?",
    options: [
      "Contact the authorized waste contractor to confirm receipt signatures, log the meter calibration schedule, present verified records, and declare gaps transparently",
      "Forge the contractor signature and write fake meter readings on the inspection sheet",
      "Throw away the waste receipt and destroy the water flow meter",
      "Cancel the audit and lock all office doors"
    ],
    correct: 0,
    correctExplanation: "Obtaining authorized signatures, scheduling maintenance, and transparent reporting maintains legal and ESG audit integrity.",
    incorrectExplanation: "Incorrect. Never forge signatures or fake readings; present verified records and log corrective steps."
  },
  {
    order: 15,
    question: "Visual Capstone (Integrated Inspection): In the integrated facility photograph (`visual-final-certification-workplace.png`), what is the primary risk associated with the blue drum in the loading yard?",
    options: [
      "The blue drum is unlabelled and leaking liquid directly on pavement leading into an open storm drain grid",
      "The blue drum is painted the wrong shade of blue for office furniture",
      "The blue drum is blocking the manager from reading her digital tablet",
      "The blue drum is generating solar power without a grid licence"
    ],
    correct: 0,
    correctExplanation: "The unlabelled leaking drum on bare pavement near an open storm drain creates an immediate runoff and pollution hazard.",
    incorrectExplanation: "Incorrect. The unlabelled leaking drum near the open storm drain creates an immediate environmental runoff risk."
  }
];

export async function ensureFinalSustainabilityCertificationCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 12 by courseCode "ELH-12", slug, or ID
      let course = null;
      
      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-12"))
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
        throw new Error("Course ELH-12 / final-sustainability-certification not seeded by catalogue skeletons bootstrap!");
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
      const hasMissingQuiz = existingQuizQuestions.length !== 15;
      const hasDummyQuiz = existingQuizQuestions.some((q) => q.question.includes("Resource Management Scenario") || q.options.includes("Option A"));
      const hasIncorrectSlug = course.slug !== COURSE_SLUG;

      const needsRepair = !existingSeed ||
                          hasMissingLessons ||
                          hasEmptyBlocks ||
                          hasMissingQuiz ||
                          hasDummyQuiz ||
                          hasIncorrectSlug;

      if (!needsRepair) {
        logger.info({ courseId, slug: COURSE_SLUG }, "Final Sustainability Certification course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch, dummy questions, or missing v2 seed detected for Course ELH-12. Re-seeding course content, lessons, and 15 capstone questions transactionally...");

      // 4. Resolve next recommended course dynamically (capstone course has no next course)
      const nextCourseId = null;

      // 5. Update course record slug, title, and metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-12",
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

      // 7. Seed/re-seed 15 capstone quiz questions
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

      // 8. Enforce prerequisite entries in coursePrerequisitesTable (ELH-01 through ELH-11 -> ELH-12)
      const prereqCourses = await tx
        .select({ id: coursesTable.id, courseCode: coursesTable.courseCode })
        .from(coursesTable)
        .where(inArray(coursesTable.courseCode, [
          "ELH-01", "ELH-02", "ELH-03", "ELH-04", "ELH-05", "ELH-06", "ELH-07", "ELH-08", "ELH-09", "ELH-10", "ELH-11"
        ]));

      for (const prereq of prereqCourses) {
        const [existingPrereq] = await tx
          .select()
          .from(coursePrerequisitesTable)
          .where(and(
            eq(coursePrerequisitesTable.courseId, courseId),
            eq(coursePrerequisitesTable.prerequisiteCourseId, prereq.id)
          ))
          .limit(1);

        if (!existingPrereq) {
          await tx.insert(coursePrerequisitesTable).values({
            courseId,
            prerequisiteCourseId: prereq.id,
          });
        }
      }

      // 9. Idempotently seed/update badge definition
      await tx
        .insert(badgeDefinitionsTable)
        .values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "award",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 17,
        })
        .onConflictDoUpdate({
          target: badgeDefinitionsTable.slug,
          set: {
            name: COURSE_META.badgeName,
            description: COURSE_META.badgeDescription,
            courseIds: [courseId],
          },
        });

      // 10. Save seed marker version
      if (!existingSeed) {
        await tx.insert(systemSeedsTable).values({
          name: SEED_NAME,
          version: 2,
        });
      } else {
        await tx.update(systemSeedsTable).set({ version: 2 }).where(eq(systemSeedsTable.name, SEED_NAME));
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Final Sustainability Certification course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Final Sustainability Certification course");
  }
}
