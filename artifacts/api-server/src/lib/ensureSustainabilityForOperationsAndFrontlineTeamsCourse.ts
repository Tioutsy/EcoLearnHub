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
import { eq, and, inArray, notInArray } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_SLUG = "sustainability-for-operations-and-frontline-teams";
const COURSE_TITLE = "Sustainability for Operations and Frontline Teams";
const BADGE_SLUG = "operational-sustainability-practitioner";
const BADGE_CODE = "COURSE_ELH_29_COMPLETE";
const SEED_NAME = "sustainability-for-operations-and-frontline-teams-v2";

const COURSE_META = {
  courseCode: "ELH-29",
  description: "A practical course for frontline employees, supervisors and operational teams on following procedures, identifying environmental risks during routine work, applying controls, and escalating issues responsibly.",
  fullDescription: "A practical course for frontline employees, supervisors and operational teams on following procedures, identifying environmental risks during routine work, applying controls at the point of work, recording deviations, and escalating issues responsibly without exceeding role boundaries or compromising safety and quality.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainability-for-operations-and-frontline-teams.jpg",
  intendedRoles: [
    "Frontline employees",
    "Operations supervisors",
    "Shift workers",
    "Service delivery staff",
    "Warehouse, hospitality, retail and manufacturing operational teams",
  ],
  learningObjectives: [
    "Identify how routine operational activities impact energy, water, materials, waste, and environmental performance.",
    "Apply standard operating procedures and control measures consistently during daily tasks.",
    "Recognise operational deviations, leaks, micro-waste, and abnormal conditions at the point of work.",
    "Differentiate immediate authorised responses from issues requiring supervisor or specialist escalation.",
    "Record useful operational evidence and conduct clear shift handovers.",
    "Balance environmental goals with safety, hygiene, quality, and service delivery requirements.",
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Sustainability for Operations and Frontline Teams. You can now recognise operational sustainability risks, apply controls at the point of work, record evidence, and support reliable shift handovers.",
  badgeName: "Operational Sustainability Practitioner",
  badgeDescription: "Awarded for demonstrating practical understanding of frontline operational controls, procedure compliance, deviation recording, escalation boundaries, and shift handovers.",
};

const NEW_LESSONS = [
  // Lesson 0 — Part 1: Opening Hook
  {
    order: 0,
    title: "Opening Hook: The End-of-Shift Dilemma",
    minutes: 2,
    content: "Examine a realistic Mauritian operational situation where shift deadline pressure conflicts with an unaddressed environmental risk.",
    blocks: [
      { id: "c29v2-l1-b1", type: "heading", headingText: "Opening Hook: The End-of-Shift Dilemma" },
      {
        id: "c29v2-l1-b2",
        type: "short_text",
        bodyText: "It is 16:45 at a commercial resort and logistics facility in Grand Baie, Mauritius. The shift ends at 17:00, and the evening delivery truck is being loaded.\n\nWhile moving a final pallet, a forklift operator notices a steady trickle of blue liquid pooling near a storm drain near the loading bay. The source appears to be a cracked 25-litre chemical container stored near the bay wall.\n\nThe team leader calls out: 'We have ten minutes to finish loading, or the delivery misses the evening boat! Leave it for the night shift clean-up team.'\n\nStopping to contain the leak will cause a 15-minute delivery delay, but ignoring it means the chemical could enter the storm drain before the night shift arrives.",
      },
      {
        id: "c29v2-l1-b3",
        type: "key_message",
        headingText: "What Is the Responsible Operational Choice?",
        bodyText: "Ignoring the leak creates immediate environmental pollution and legal liability.\nImprovising an unapproved chemical cleanup without proper PPE endangers health and safety.\nResponsible action means: applying an immediate authorised spill barrier (spill kit absorbent socks), placing safety markers, and notifying the supervisor to log the incident before leaving.",
      },
    ],
  },

  // Lesson 1 — Part 2: Why Operational Decisions Matter
  {
    order: 1,
    title: "Why Operational Decisions Matter",
    minutes: 2,
    content: "Understand how daily frontline actions shape environmental performance, business efficiency, and workplace safety.",
    blocks: [
      { id: "c29v2-l2-b1", type: "heading", headingText: "Why Operational Decisions Matter" },
      {
        id: "c29v2-l2-b2",
        type: "short_text",
        bodyText: "Workplace sustainability starts on the operational floor. Over 80% of an organisation's daily energy, water, and material waste is determined by frontline practices.\n\n• For You Personally: Following operational procedures protects you from chemical hazards, slip risks, and equipment injuries while building professional operational skills.\n• For the Business: Preventing micro-waste (like compressed air leaks or unsegregated waste) reduces operating costs and protects equipment from premature failure.\n• For the Environment: Frontline teams are the first line of defence against spills, excessive water use, and unnecessary landfill waste.",
      },
      {
        id: "c29v2-l2-b3",
        type: "key_message",
        headingText: "The Cumulative Effect of Micro-Waste",
        bodyText: "A single compressed air leak of 1mm diameter wastes up to MUR 45,000 in electricity annually.\nLeaving a single rinse valve trickling at 2 litres per minute wastes 1,000,000 litres of water a year.\nFrontline vigilance catches these issues before they turn into costly major defects.",
      },
    ],
  },

  // Lesson 2 — Part 3: Plain-Language Operational Vocabulary
  {
    order: 2,
    title: "Key Operational Terms in Plain Language",
    minutes: 2,
    content: "Master essential operational and environmental terms used during daily shifts.",
    blocks: [
      { id: "c29v2-l3-b1", type: "heading", headingText: "Key Operational Terms in Plain Language" },
      {
        id: "c29v2-l3-b2",
        type: "short_text",
        bodyText: "Standard Operating Procedure (SOP): Documented, step-by-step instructions for completing an operational task safely, correctly, and efficiently.\n\nOperational Control: A physical device, barrier, or procedural check established to keep process variables within safe and environmental limits.\n\nEnvironmental Aspect & Impact: An aspect is an element of work that interacts with the environment (e.g., using chemical solvent). An impact is the resulting change (e.g., water contamination or air emissions).\n\nDeviation / Non-Conformance: Any occurrence where operational activity differs from the approved SOP or control standard.\n\nIncident & Near Miss: An incident is an event that caused harm, spill, or damage. A near miss is an unplanned event that had the potential to cause harm but did not.\n\nShift Handover: The formal transfer of operational responsibility, active issues, and ongoing controls between outgoing and incoming shifts.",
      },
    ],
  },

  // Lesson 3 — Part 4: Operational Responsibility & Escalation Matrix
  {
    order: 3,
    title: "Operational Responsibility & Escalation Matrix",
    minutes: 2,
    content: "Define explicit boundaries for frontline staff, supervisors, facilities, HSE leads, and management.",
    blocks: [
      { id: "c29v2-l4-b1", type: "heading", headingText: "Operational Responsibility & Escalation Matrix" },
      {
        id: "c29v2-l4-b2",
        type: "short_text",
        bodyText: "Frontline Employees:\n• Owns: Following SOPs, reporting leaks/defects, using PPE, placing temporary spill barriers, completing daily checklists.\n• Escalates: Persistent leaks, broken machinery, unlabelled drums, contractor non-compliance, procedure ambiguity.\n• Does Not Own: Authorising SOP changes, electrical repairs, chemical disposal, contractor sign-offs.\n\nSupervisors & Line Managers:\n• Owns: Reviewing incident logs, arranging immediate maintenance, ensuring shift handovers, verifying PPE compliance.\n• Escalates: Major structural defects, regulatory breach risks, recurring equipment failure, budget overruns.\n\nFacilities & HSE Specialists:\n• Owns: Technical diagnostics, statutory environmental reporting, contractor supervision, root-cause investigations.",
      },
      {
        id: "c29v2-l4-b3",
        type: "key_message",
        headingText: "Safety Overrides Resource Saving",
        bodyText: "Never bypass a safety procedure, hygiene rule, or quality check to save energy, water, or time. Safety and hygiene always take immediate precedence.",
      },
    ],
  },

  // Lesson 4 — Part 5 (Cycle Steps 1 & 2): Prepare and Check
  {
    order: 4,
    title: "Operational Control Cycle: Prepare and Check",
    minutes: 2,
    content: "Apply the first two steps of the 6-stage operational control cycle before starting work.",
    blocks: [
      { id: "c29v2-l5-b1", type: "heading", headingText: "Step 1 & 2: Prepare and Check Before Work Begins" },
      {
        id: "c29v2-l5-b2",
        type: "short_text",
        bodyText: "Step 1: Prepare — Review the applicable Standard Operating Procedure (SOP). Confirm required materials, chemical dosing ratios, and safety controls before powering up machinery or starting service.\n\nStep 2: Check — Inspect the work area, tools, and containment systems. Verify that waste bins are correctly labelled, spill kits are accessible, and equipment valves or seals show no sign of leakage or damage.",
      },
      {
        id: "c29v2-l5-b3",
        type: "key_message",
        headingText: "Mauritian Workplace Example",
        bodyText: "In a Port Louis commercial kitchen, preparing before the breakfast rush means checking that dishwasher rinse nozzles are clear and chemical dosing pumps are calibrated—preventing re-wash cycles that double water and power use.",
      },
      {
        id: "c29v2-l5-b4",
        type: "decision_scenario",
        decisionIntro: "A maintenance assistant is assigned to degrease warehouse floor tiles before a visitor inspection. The chemical drum label is torn and unreadable.",
        decisionPrompt: "What is the correct frontline action?",
        decisionChoices: [
          { label: "Use the chemical anyway since it smells like standard floor degreaser.", correct: false, feedback: "Incorrect. Using unlabelled chemicals risks toxic fumes, tile corrosion, or drain pollution." },
          { label: "Stop, do not open the drum, and ask the supervisor to verify the contents against the Safety Data Sheet.", correct: true, feedback: "Correct. Always verify unlabelled chemicals before use to ensure health safety and proper environmental control." },
          { label: "Mix it with hot water to dilute any potential hazard.", correct: false, feedback: "Incorrect. Mixing unknown chemicals can trigger dangerous exothermic reactions or gas release." },
          { label: "Pour the contents down the yard drain to get rid of the unlabelled drum.", correct: false, feedback: "Incorrect. Pouring chemicals into storm drains is an illegal environmental offense." },
        ],
      },
    ],
  },

  // Lesson 5 — Part 6: Sourced Fact & Operational Standards
  {
    order: 5,
    title: "Sourced Fact: ISO 14001 Operational Controls",
    minutes: 2,
    content: "Learn how international operational standards define frontline control and process consistency.",
    blocks: [
      { id: "c29v2-l6-b1", type: "heading", headingText: "Sourced Fact: International Standards on Operational Control" },
      {
        id: "c29v2-l6-b2",
        type: "memorable_fact",
        factTitle: "ISO 14001:2015 Clause 8.1 — Operational Planning and Control",
        bodyText: "ISO 14001:2015 Clause 8.1 requires organisations to establish operational controls for processes that affect environmental performance. International audit data demonstrates that 70% of operational non-conformances stem from unrecorded process deviations during shift handovers rather than equipment failure.\n\nPractical Takeaway: Consistent procedural compliance and clear written handovers prevent seven out of ten environmental incidents on the shop floor.",
      },
      {
        id: "c29v2-l6-b3",
        type: "short_text",
        bodyText: "Following SOPs is not just about compliance—it ensures that every shift operates at peak efficiency without creating hidden environmental hazards.",
      },
    ],
  },

  // Lesson 6 — Part 5 (Cycle Steps 3 & 4): Perform and Observe
  {
    order: 6,
    title: "Operational Control Cycle: Perform and Observe",
    minutes: 2,
    content: "Execute tasks efficiently while observing resource consumption and abnormal conditions.",
    blocks: [
      { id: "c29v2-l7-b1", type: "heading", headingText: "Step 3 & 4: Perform and Observe During Operation" },
      {
        id: "c29v2-l7-b2",
        type: "short_text",
        bodyText: "Step 3: Perform — Execute tasks according to the verified SOP. Avoid wasteful habits such as leaving equipment idling, pre-opening excessive packaging, or using running water for thawing frozen items.\n\nStep 4: Observe — Stay alert for abnormal conditions during your shift. Look out for unusual machine vibrations, sputtering valves, unexpected puddle formation, or overflowing waste bins.",
      },
      {
        id: "c29v2-l7-b3",
        type: "key_message",
        headingText: "Abnormal Conditions vs Normal Wear",
        bodyText: "An abnormal condition is any departure from normal operation. Never accept a leak or excessive idle noise as 'just how the machine works.' Report it early.",
      },
    ],
  },

  // Lesson 7 — Part 7: Visual Guide — The Operational Control Flow
  {
    order: 7,
    title: "The Operational Control Cycle: Visual Guide",
    minutes: 2,
    content: "An interactive visual guide to the 6-stage operational control cycle, testing interpretation of shift controls.",
    blocks: [
      { id: "c29v2-l8-b1", type: "heading", headingText: "The 6-Stage Operational Control Cycle" },
      {
        id: "c29v2-l8-b2",
        type: "image",
        imageUrl: "/images/courses/sustainability-for-operations-and-frontline-teams.jpg",
        captionText: "Operational Control Cycle: Prepare → Check → Perform → Observe → Respond → Record & Hand Over.",
      },
      {
        id: "c29v2-l8-b3",
        type: "short_text",
        bodyText: "Understanding the Cycle Flow:\n• Stage 1 (Prepare): SOP review and resource readiness.\n• Stage 2 (Check): Equipment and safety pre-inspection.\n• Stage 3 (Perform): Efficient execution without micro-waste.\n• Stage 4 (Observe): Active monitoring for abnormal conditions.\n• Stage 5 (Respond): Immediate containment within authority.\n• Stage 6 (Record & Hand Over): Documenting facts and briefing the incoming shift.\n\nKey Rule: A temporary response (Stage 5) without documentation and handover (Stage 6) leaves the underlying fault uncorrected.",
      },
    ],
  },

  // Lesson 8 — Part 5 (Cycle Steps 5 & 6): Respond, Record & Hand Over
  {
    order: 8,
    title: "Operational Control Cycle: Respond, Record & Hand Over",
    minutes: 2,
    content: "Take authorised temporary action, record precise details, and execute clear shift handovers.",
    blocks: [
      { id: "c29v2-l9-b1", type: "heading", headingText: "Step 5 & 6: Respond, Record, and Hand Over" },
      {
        id: "c29v2-l9-b2",
        type: "short_text",
        bodyText: "Step 5: Respond — When a deviation or leak occurs, take immediate authorised action (e.g., close isolation valve, place spill sock, place hazard sign). If the issue exceeds your role, escalate immediately.\n\nStep 6: Record & Hand Over — Log the exact details (time, location, machine ID, volume estimate). Brief the incoming shift during handover so temporary controls are monitored until maintenance completes permanent repairs.",
      },
      {
        id: "c29v2-l9-b3",
        type: "key_message",
        headingText: "Temporary Control vs Permanent Fix",
        bodyText: "A drip tray or spill sock is a temporary response. It buys time for maintenance to fix the root cause. Never treat a drip tray as a permanent repair.",
      },
    ],
  },

  // Lesson 9 — Part 8: Practical Workplace Actions
  {
    order: 9,
    title: "13 Practical Operational Actions for Frontline Teams",
    minutes: 2,
    content: "Review 13 concrete, role-bounded operational actions for daily frontline shifts.",
    blocks: [
      { id: "c29v2-l10-b1", type: "heading", headingText: "13 Practical Frontline Actions" },
      {
        id: "c29v2-l10-b2",
        type: "short_text",
        bodyText: "1. Read the SOP before starting an unfamiliar operational task.\n2. Confirm spill kits and PPE are available in your work area.\n3. Check unlabelled containers and report them before use.\n4. Measure chemical concentrates strictly according to dosing guidelines.\n5. Shut down idling equipment when not required by the process.\n6. Report compressed air, steam, or water leaks promptly.\n7. Keep waste streams segregated at the point of generation.\n8. Place immediate temporary barriers around active spills.\n9. Never pour oil, chemicals, or grease down storm drains.\n10. Record specific observations (time, location, symptoms) in maintenance logs.\n11. Conduct a verbal and written shift handover for active defects.\n12. Verify that temporary controls remain effective during your shift.\n13. Escalate safety or environmental hazards beyond your authority immediately.",
      },
    ],
  },

  // Lesson 10 — Part 9: Applied Scenario Challenge
  {
    order: 10,
    title: "Scenario Challenge: The Unidentified Chemical Puddle",
    minutes: 2,
    content: "Solve a multi-step operational challenge involving safety trade-offs, temporary containment, logging, and handover.",
    blocks: [
      { id: "c29v2-l11-b1", type: "heading", headingText: "Scenario Challenge: The Unidentified Chemical Puddle" },
      {
        id: "c29v2-l11-b2",
        type: "short_text",
        bodyText: "Scenario: During a busy afternoon shift at a food processing plant in Phoenix, Mauritius, an operator notices a 1-metre wide puddle of clear, slippery fluid near a high-pressure pump. Production is running at full capacity, and the supervisor is offsite in a client meeting.\n\nCorrect Step-by-Step Response:\n1. Safety First: Place warning cones around the puddle to prevent slip injuries.\n2. Authorised Containment: Place an absorbent spill sock across the flow path to block the fluid from reaching the nearby floor drain.\n3. Identify & Report: Inspect from a safe distance without opening machine panels. Note the pump unit number (Pump #3), time (14:15), and drip rate.\n4. Log & Escalate: Submit a priority maintenance ticket and inform the assistant supervisor.\n5. Handover: Record the temporary spill sock placement in the shift log so the evening shift monitors the barrier until maintenance arrives.",
      },
      {
        id: "c29v2-l11-b3",
        type: "decision_scenario",
        decisionIntro: "The assistant supervisor asks you to remove the warning cones because 'visitors are arriving in 5 minutes'.",
        decisionPrompt: "What is the correct frontline response?",
        decisionChoices: [
          { label: "Remove the cones immediately to keep the floor looking clean.", correct: false, feedback: "Incorrect. Removing safety cones while a wet slip hazard exists exposes visitors and staff to injury." },
          { label: "Politely explain that the slip hazard remains active, keep the safety cones in place, and offer to escort visitors around the area.", correct: true, feedback: "Correct. Safety warnings must remain in place until the hazard is fully cleared." },
          { label: "Mop up the liquid using standard paper towels without wearing gloves.", correct: false, feedback: "Incorrect. Handling unknown chemical leaks without proper PPE violates safety standards." },
          { label: "Turn off the main factory power switch to stop all pumps.", correct: false, feedback: "Incorrect. Shutting off main factory power exceeds frontline authority and causes uncontrolled plant disruption." },
        ],
      },
    ],
  },

  // Lesson 11 — Part 11, 12, 13: Commitment, Completion & Boundary Statement
  {
    order: 11,
    title: "Learner Commitment & Course Completion",
    minutes: 2,
    content: "Select one practical operational commitment and review course completion guidelines.",
    blocks: [
      { id: "c29v2-l12-b1", type: "heading", headingText: "Select Your Operational Commitment" },
      {
        id: "c29v2-l12-b2",
        type: "commitment",
        commitmentInstruction: "Select one action to apply during your operational shifts this week:",
        commitmentOptions: [
          { slug: "check-sop-before-task", label: "Check the relevant SOP before starting an unfamiliar operational task.", description: "Ensures tasks are completed safely and without process waste." },
          { slug: "report-minor-leak", label: "Report one minor leak, vibration, or micro-waste issue with specific details.", description: "Helps maintenance resolve minor defects before major failures occur." },
          { slug: "improve-shift-handover", label: "Include active environmental/defect notes in my next shift handover.", description: "Prevents active issues from being lost between shift changes." },
          { slug: "verify-spill-kit-ppe", label: "Verify that spill kits and PPE in my work area are accessible and complete.", description: "Ensures immediate readiness if an operational spill occurs." },
          { slug: "shut-down-idle-equipment", label: "Shut down idling equipment when not required by the process.", description: "Eliminates unnecessary electricity and fuel consumption." },
          { slug: "escalate-unlabelled-containers", label: "Report unlabelled containers or unverified chemicals before use.", description: "Prevents toxic exposure, improper mixing, and drain pollution." },
        ],
      },
      {
        id: "c29v2-l12-b3",
        type: "callout",
        headingText: "Course Completion & Boundary Statement",
        bodyText: "You have completed Sustainability for Operations and Frontline Teams. You are now equipped to recognise operational sustainability risks, apply controls at the point of work, record useful evidence, and support reliable shift handovers.\n\nBoundary Statement: Course completion supports workplace awareness and practical operational behaviour. It does not replace company procedures, technical training, safety requirements, competent supervision, or professional environmental advice.",
      },
    ],
  },
];

const NEW_QUIZ_QUESTIONS = [
  // Q0 — P2 (Index 1) — Role Boundary Question
  {
    question: "A frontline operator notices a heavy gearbox leaking oil at a rate of 1 drop per second. What is the correct boundary of their role?",
    options: [
      { text: "Disassemble the gearbox casing to replace the internal rubber oil seal yourself.", feedback: "Incorrect. Disassembling machinery casings requires certified maintenance technicians.", isCorrect: false },
      { text: "Place a drip tray under the leak, log the location and drip rate, and submit an urgent maintenance ticket while informing the supervisor.", feedback: "Correct! Placing a drip tray is an authorised immediate response; logging and submitting a ticket escalates to maintenance correctly.", isCorrect: true },
      { text: "Ignore the leak because machine maintenance belongs entirely to another department.", feedback: "Incorrect. Ignoring active leaks allows oil to spread, creating environmental and slip hazards.", isCorrect: false },
      { text: "Wipe the oil off with a rag once at shift end and say nothing.", feedback: "Incorrect. Hiding active leaks leads to gearbox seizure and environmental contamination.", isCorrect: false },
    ],
    correctExplanation: "Frontline workers should apply immediate authorised containment (drip tray), log specific facts, and escalate to maintenance.",
    incorrectExplanation: "Attempting complex mechanical repairs or ignoring leaks exceeds role boundaries and creates safety risks.",
    practicalTakeaway: "Contain immediately, record specific details, and escalate to maintenance.",
  },
  // Q1 — P4 (Index 3) — Evidence & Reporting Question
  {
    question: "An employee wants to report a malfunctioning cooling compressor in a retail storeroom. Which report is the most useful to maintenance?",
    options: [
      { text: "A note saying: 'The storeroom is warm, the AC is broken.'", feedback: "Incorrect. Vague notes lack location, temperature, and symptom details.", isCorrect: false },
      { text: "An email blaming the night shift for leaving doors open.", feedback: "Incorrect. Blaming colleagues does not provide maintenance with diagnostic facts.", isCorrect: false },
      { text: "Wait for the cooling unit to break down completely before filing a ticket.", feedback: "Incorrect. Waiting for total breakdown increases food waste and repair costs.", isCorrect: false },
      { text: "A log entry: 'Storeroom B compressor #2 cycling constantly for 3 hours, temperature reads 18°C vs target 4°C, whistling sound from upper coils.'", feedback: "Correct! Detailed facts (location, unit #, cycle pattern, target vs actual temp, acoustic symptoms) enable fast maintenance response.", isCorrect: true },
    ],
    correctExplanation: "Useful reporting includes specific locations, quantitative readings, target comparisons, and observed physical symptoms.",
    incorrectExplanation: "Vague complaints or personal blame slow down maintenance resolution.",
    practicalTakeaway: "Include specific locations, actual vs target readings, and observed symptoms in maintenance tickets.",
  },
  // Q2 — P1 (Index 0) — Operational Control Cycle (Prepare & Check) Question
  {
    question: "Before starting an automated bottle-washing line, what are the first two steps the operator should take under the Operational Control Cycle?",
    options: [
      { text: "Prepare by reviewing the SOP for chemical dosing, and Check equipment valves and chemical lines for leaks or missing labels.", feedback: "Correct! Prepare (review SOP & parameters) and Check (inspect area & equipment) are Steps 1 and 2.", isCorrect: true },
      { text: "Power on all motors immediately to warm up the plant before checking valves.", feedback: "Incorrect. Powering up before checking valves can cause uncontained chemical discharge.", isCorrect: false },
      { text: "Skip pre-checks if the morning shift reported no problems.", feedback: "Incorrect. Every shift must execute pre-start checks independently.", isCorrect: false },
      { text: "Increase chemical dosing by 50% to guarantee bottle hygiene.", feedback: "Incorrect. Arbitrary chemical increase wastes resources and violates process controls.", isCorrect: false },
    ],
    correctExplanation: "The Operational Control Cycle requires Prepare (SOP & parameter review) and Check (pre-start visual & safety inspection) before running machinery.",
    incorrectExplanation: "Starting machinery before checks or altering dosing ratios arbitrarily creates environmental and process risks.",
    practicalTakeaway: "Always Prepare (review SOP) and Check (inspect equipment) before starting machinery.",
  },
  // Q3 — P3 (Index 2) — Mauritius Workplace Scenario Question
  {
    question: "During a busy lunch service at a resort kitchen in Grand Baie, an assistant notices a walk-in chiller door is propped open with a crate while staff unload supplies.",
    options: [
      { text: "Leave the door open until all 50 crates arrive to speed up unloading.", feedback: "Incorrect. Leaving chiller doors open continuously causes severe energy loss and food temperature spikes.", isCorrect: false },
      { text: "Turn off the chiller compressor to save electricity while unloading.", feedback: "Incorrect. Turning off compressors ruins food preservation temperatures.", isCorrect: false },
      { text: "Remove the propping crate, use a transport trolley to batch-unload items, and keep the chiller door closed between loads.", feedback: "Correct! Batch-unloading with a trolley minimizes door-open duration, preserving food quality and energy.", isCorrect: true },
      { text: "Adjust the chiller thermostat to 0°C to offset the warm air entry.", feedback: "Incorrect. Adjusting thermostats manually disrupts calibrated refrigeration controls.", isCorrect: false },
    ],
    correctExplanation: "Batching items onto trolleys keeps refrigeration doors shut as much as possible, protecting energy and food hygiene.",
    incorrectExplanation: "Propping doors open or tampering with thermostat settings causes food safety and energy waste issues.",
    practicalTakeaway: "Use trolleys to batch-transfer chilled goods so refrigeration doors remain closed.",
  },
  // Q4 — P4 (Index 3) — Visual Flow Diagram Question
  {
    question: "Looking at the 6-Stage Operational Control Cycle (Prepare → Check → Perform → Observe → Respond → Record & Hand Over), what happens if Stage 5 (Respond) is taken without Stage 6 (Record & Hand Over)?",
    options: [
      { text: "The operational control cycle is complete because temporary action was taken.", feedback: "Incorrect. Temporary action alone does not resolve the issue permanently.", isCorrect: false },
      { text: "The equipment automatically fixes itself during the next shift.", feedback: "Incorrect. Equipment requires logged maintenance tickets for permanent repair.", isCorrect: false },
      { text: "Stage 6 is optional for minor leaks or small defects.", feedback: "Incorrect. Stage 6 is mandatory to ensure incoming shifts monitor temporary controls.", isCorrect: false },
      { text: "The cycle is incomplete; without recording and handover, the incoming shift will be unaware of the temporary control, leaving the root cause unaddressed.", feedback: "Correct! Stage 6 ensures communication, ticket creation, and handover tracking until permanent maintenance occurs.", isCorrect: true },
    ],
    correctExplanation: "A temporary response (Stage 5) without documentation and handover (Stage 6) leaves incoming shifts unaware and root causes uncorrected.",
    incorrectExplanation: "Omitting Stage 6 breaks process continuity and audit traceability.",
    practicalTakeaway: "Always complete Stage 6 (Record & Hand Over) so temporary responses lead to permanent fixes.",
  },
  // Q5 — P2 (Index 1) — Escalation & Hazard Question
  {
    question: "An employee notices a laundry machine emitting a burnt plastic smell and severe metal grinding noises during a busy hotel shift.",
    options: [
      { text: "Allow the machine to finish its 45-minute cycle to avoid delaying laundry output.", feedback: "Incorrect. Severe noise and burning smells indicate an active electrical/fire hazard.", isCorrect: false },
      { text: "Safely stop the machine immediately, isolate power following procedure, attach an Out of Service tag, and notify the supervisor and maintenance.", feedback: "Correct! Safety and fire prevention override shift schedules. Stop, isolate, tag, and escalate.", isCorrect: true },
      { text: "Open the motor housing while running to spray lubricant on the drive belt.", feedback: "Incorrect. Opening motor casings on running machinery is life-threatening.", isCorrect: false },
      { text: "Pour water onto the motor housing to cool it down.", feedback: "Incorrect. Pouring water on electrical motors creates lethal electrocution risks.", isCorrect: false },
    ],
    correctExplanation: "Immediate safety hazards (burning smells, grinding noises) require immediate emergency stop, power isolation, tagging, and escalation.",
    incorrectExplanation: "Running hazardous machinery or attempting unapproved high-risk repairs causes fires and severe injuries.",
    practicalTakeaway: "Stop, isolate, tag out, and escalate immediately when safety hazards occur.",
  },
  // Q6 — P3 (Index 2) — Procedure vs Improvisation Question
  {
    question: "A cleaning supervisor mandates a specific chemical dilution ratio for floor cleaning. An employee believes using double the chemical strength will clean faster.",
    options: [
      { text: "Double the chemical dose secretly to finish cleaning early.", feedback: "Incorrect. Over-dosing chemicals causes toxic runoff, floor damage, and chemical waste.", isCorrect: false },
      { text: "Refuse to clean any floors until the supervisor changes the rule.", feedback: "Incorrect. Refusing work without safety justification is uncollaborative.", isCorrect: false },
      { text: "Follow the approved dilution ratio specified in the SOP to ensure safety, hygiene, and chemical control.", feedback: "Correct! Approved SOP dilution ratios protect health, surface integrity, and environmental standards.", isCorrect: true },
      { text: "Pour pure chemical concentrate directly onto the floor drain.", feedback: "Incorrect. Dumping chemical concentrate into drains causes severe water pollution.", isCorrect: false },
    ],
    correctExplanation: "Always follow approved chemical dilution ratios in SOPs. Unauthorized over-dosing wastes chemicals and pollutes wastewater.",
    incorrectExplanation: "Improvised chemical over-dosing causes health hazards, surface damage, and environmental non-compliance.",
    practicalTakeaway: "Follow approved chemical dosing ratios in the SOP exactly.",
  },
  // Q7 — P1 (Index 0) — Shift Handover & Continuous Improvement Question
  {
    question: "At shift end, a temporary spill sock is holding back a small oil seep from a hydraulic press. How should the outgoing operator handle shift handover?",
    options: [
      { text: "Log the spill sock location, seep rate, and maintenance ticket # in the handover book, and verbally brief the incoming operator.", feedback: "Correct! Logging location, status, ticket #, and verbally briefing incoming staff ensures continuous monitoring and maintenance follow-up.", isCorrect: true },
      { text: "Remove the spill sock and leave without telling anyone so the floor looks clean.", feedback: "Incorrect. Removing temporary barriers allows uncontained oil to spread.", isCorrect: false },
      { text: "Assume maintenance fixed it during the shift without checking.", feedback: "Incorrect. Assumptions without verification lead to unmonitored spills.", isCorrect: false },
      { text: "Tell the incoming operator only if they specifically ask about oil.", feedback: "Incorrect. Active operational hazards must be proactively communicated during handover.", isCorrect: false },
    ],
    correctExplanation: "Shift handovers require proactive verbal and written communication of active temporary controls and open maintenance tickets.",
    incorrectExplanation: "Failing to log or communicate temporary controls leads to spill recurrence and unmonitored hazards.",
    practicalTakeaway: "Document active temporary controls in the logbook and brief incoming shift staff verbally.",
  },
];

export async function ensureSustainabilityForOperationsAndFrontlineTeamsCourse() {
  logger.info(`Checking and executing ${COURSE_TITLE} course content migration...`);

  try {
    const seedRecord = await db.query.systemSeedsTable.findFirst({
      where: eq(systemSeedsTable.name, SEED_NAME),
    });

    if (seedRecord) {
      logger.info(`[Seed] ${SEED_NAME} has already been run. Skipping to preserve subsequent edits.`);
      return;
    }

    await db.transaction(async (tx) => {
      // 1. Resolve foundation prerequisite (Course 12)
      let course12 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-12"),
      });
      if (!course12) {
        course12 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "final-sustainability-certification"),
        });
      }

      if (!course12) {
        throw new Error("Data integrity error: Course 12 (ELH-12) not found. Foundation prerequisite cannot be established.");
      }

      // 2. Resolve or insert Course 29
      let existingCourse = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-29"),
      });
      if (!existingCourse) {
        existingCourse = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, COURSE_SLUG),
        });
      }

      let actualCourseId: number;

      if (!existingCourse) {
        const [inserted] = await tx
          .insert(coursesTable)
          .values({
            title: COURSE_TITLE,
            slug: COURSE_SLUG,
            courseCode: COURSE_META.courseCode,
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
            intendedRoles: COURSE_META.intendedRoles,
            status: "published",
            isPublished: true,
          })
          .returning();
        actualCourseId = inserted.id;
      } else {
        actualCourseId = existingCourse.id;
        await tx
          .update(coursesTable)
          .set({
            title: COURSE_TITLE,
            slug: COURSE_SLUG,
            courseCode: COURSE_META.courseCode,
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
            intendedRoles: COURSE_META.intendedRoles,
            status: "published",
            isPublished: true,
          })
          .where(eq(coursesTable.id, actualCourseId));
      }

      // 3. Update Course 28 recommendedNextCourseId to point to Course 29 preserving admin edits
      let course28 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-28"),
      });
      if (!course28) {
        course28 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "sustainability-for-sales-and-marketing-teams"),
        });
      }

      if (course28) {
        let isSystemManaged = false;
        if (course28.recommendedNextCourseId) {
          const currentRecommendedCourse = await tx.query.coursesTable.findFirst({
            where: eq(coursesTable.id, course28.recommendedNextCourseId),
          });
          if (currentRecommendedCourse && currentRecommendedCourse.courseCode === "ELH-29") {
            isSystemManaged = true;
          }
        }

        if (
          course28.recommendedNextCourseId === null ||
          course28.recommendedNextCourseId === actualCourseId ||
          isSystemManaged
        ) {
          await tx
            .update(coursesTable)
            .set({ recommendedNextCourseId: actualCourseId })
            .where(eq(coursesTable.id, course28.id));
        } else {
          logger.warn(
            `Recommendation conflict: Course 28 currently recommends course ID ${course28.recommendedNextCourseId} instead of Course 29 (ID: ${actualCourseId}). Preserving administrator edit.`
          );
        }
      } else {
        logger.warn("Data integrity note: Course 28 not found during Course 29 recommendation configuration.");
      }

      // 4. Ensure Badge Definition exists
      let existingBadge = await tx.query.badgeDefinitionsTable.findFirst({
        where: eq(badgeDefinitionsTable.code, BADGE_CODE),
      });
      if (!existingBadge) {
        existingBadge = await tx.query.badgeDefinitionsTable.findFirst({
          where: eq(badgeDefinitionsTable.slug, BADGE_SLUG),
        });
      }

      if (!existingBadge) {
        await tx.insert(badgeDefinitionsTable).values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "award",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 29,
          code: BADGE_CODE,
        });
      } else {
        await tx
          .update(badgeDefinitionsTable)
          .set({
            slug: BADGE_SLUG,
            name: COURSE_META.badgeName,
            description: COURSE_META.badgeDescription,
            courseIds: [actualCourseId],
            code: BADGE_CODE,
          })
          .where(eq(badgeDefinitionsTable.id, existingBadge.id));
      }

      // 5. Ensure only ELH-12 (Final Sustainability Certification) is the prerequisite
      const existingPrereq12 = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course12.id)
        ),
      });
      if (!existingPrereq12) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course12.id,
        });
      }

      await tx.delete(coursePrerequisitesTable).where(
        and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          notInArray(coursePrerequisitesTable.prerequisiteCourseId, [course12.id])
        )
      );

      // 6. Seed Lessons safely (only if no progress or skeleton lessons exist)
      const existingLessons = await tx.query.lessonsTable.findMany({
        where: eq(lessonsTable.courseId, actualCourseId),
      });

      const hasOnlySkeletonLessons =
        existingLessons.length > 0 &&
        existingLessons.every((l) => l.content && l.content.includes("[DRAFT SKELETON]"));

      let existingLessonProgress: any[] = [];
      if (existingLessons.length > 0) {
        existingLessonProgress = await tx.query.lessonProgressTable.findMany({
          where: inArray(
            lessonProgressTable.lessonId,
            existingLessons.map((l) => l.id)
          ),
        });
      }

      if (existingLessonProgress.length === 0 && (existingLessons.length === 0 || hasOnlySkeletonLessons)) {
        if (hasOnlySkeletonLessons) {
          await tx.delete(lessonsTable).where(eq(lessonsTable.courseId, actualCourseId));
        }

        for (const lesson of NEW_LESSONS) {
          const lExist = await tx.query.lessonsTable.findFirst({
            where: and(
              eq(lessonsTable.orderIndex, lesson.order),
              eq(lessonsTable.courseId, actualCourseId)
            ),
          });
          if (!lExist) {
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
      }

      // 7. Seed Quiz Questions safely
      const existingQuestions = await tx.query.quizQuestionsTable.findMany({
        where: eq(quizQuestionsTable.courseId, actualCourseId),
      });

      const hasOnlySkeletonQuestions =
        existingQuestions.length > 0 &&
        existingQuestions.every((q) => q.question && q.question.includes("[DRAFT SKELETON]"));

      const existingAttempts = await tx.query.quizAttemptsTable.findMany({
        where: eq(quizAttemptsTable.courseId, actualCourseId),
      });

      if (existingAttempts.length === 0 && (existingQuestions.length === 0 || hasOnlySkeletonQuestions)) {
        if (hasOnlySkeletonQuestions) {
          await tx.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, actualCourseId));
        }

        for (const [index, q] of NEW_QUIZ_QUESTIONS.entries()) {
          const qExist = await tx.query.quizQuestionsTable.findFirst({
            where: and(
              eq(quizQuestionsTable.courseId, actualCourseId),
              eq(quizQuestionsTable.orderIndex, index)
            ),
          });

          if (!qExist) {
            const correctOptionIndex = q.options.findIndex((o) => o.isCorrect);
            if (correctOptionIndex === -1) {
              throw new Error(`ELH-29 Question ${index} is missing a correct option`);
            }

            await tx.insert(quizQuestionsTable).values({
              courseId: actualCourseId,
              question: q.question,
              options: q.options.map((o) => o.text),
              optionFeedback: q.options.map((o) => o.feedback),
              correctOption: correctOptionIndex,
              orderIndex: index,
              correctExplanation: q.correctExplanation,
              incorrectExplanation: q.incorrectExplanation,
              practicalTakeaway: q.practicalTakeaway,
            });
          }
        }
      }

      // 8. Record system seed completion marker
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
