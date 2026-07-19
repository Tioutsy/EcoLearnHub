import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_ID = 4;
const COURSE_SLUG = "water-conservation";
const COURSE_TITLE = "Water Conservation";
const BADGE_SLUG = "water-wise-at-work";
const SEED_NAME = "water-conservation-v1";

const COURSE_META = {
  description:
    "Learn how daily habits, early leak reporting and sensible workplace practices can reduce unnecessary water use without compromising hygiene, safety, service quality or operational needs.",
  fullDescription:
    "This course helps employees recognise water waste, use water more carefully during routine work, report leaks or faults promptly, and balance conservation with hygiene, safety, service quality and operational requirements. It is practical, mobile-friendly, and relevant to employees across all sectors in Mauritius.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "1400.00",
  level: "Foundation",
  isFeatured: false,
  thumbnailUrl: "/images/courses/water-conservation.png",
  learningObjectives: [
    "Identify visible and less-obvious signs of water waste.",
    "Use water more efficiently during routine workplace activities.",
    "Report leaks and faulty equipment promptly through the correct workplace channel.",
    "Distinguish between actions employees may take themselves and issues requiring authorised maintenance.",
    "Balance water conservation with hygiene, safety, customer service and operational standards.",
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "You have completed Water Conservation. You can now recognise common signs of water waste, make more careful decisions during routine work and report leaks or faults before they become larger problems.",
  badgeName: "Water Wise at Work",
  badgeDescription:
    "Awarded for demonstrating practical workplace water-conservation awareness and responsible leak-reporting decisions.",
};

const NEW_LESSONS = [
  // ─────────────────────────────────────────────────────────────────────────────
  // Lesson 1 — The Leak Everyone Walks Past
  // ─────────────────────────────────────────────────────────────────────────────
  {
    order: 0,
    title: "The Leak Everyone Walks Past",
    minutes: 3,
    content:
      "A relatable situation where a small dripping tap is noticed repeatedly but never reported — and why that matters.",
    blocks: [
      {
        id: "wc1-h1",
        type: "heading",
        position: 1,
        headingText: "The Leak Everyone Walks Past",
      },
      {
        id: "wc1-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "In an office kitchen, a tap has been dripping for three days. Several people have noticed it. Each person assumed someone else already reported it. Nobody did. The dripping continued.",
      },
      {
        id: "wc1-k1",
        type: "key_message",
        position: 3,
        headingText: "Do Not Assume Someone Else Has Reported It",
        bodyText:
          "A small recurring problem is worth reporting. You do not need to diagnose or repair the fault — just pass the information to the right person. Include the location, what you observed, and when.",
      },
      {
        id: "wc1-w1",
        type: "workplace_example",
        position: 4,
        headingText: "How a Small Drip Adds Up",
        bodyText:
          "A slow drip from a tap or fitting may seem negligible. But over days and weeks, a persistent small leak can waste a significant volume of water and may indicate a fault that will worsen without attention. The solution is simple: report it promptly through the correct workplace channel.",
      },
      {
        id: "wc1-d1",
        type: "decision_scenario",
        position: 5,
        decisionIntro: "You notice a tap in the staff kitchen that continues dripping after use. It has been like this for two days. What do you do?",
        decisionPrompt: "Choose the most appropriate action:",
        decisionChoices: [
          {
            label: "Ignore it — the leak appears small and someone will notice eventually.",
            correct: false,
            feedback:
              "This is the same assumption everyone else is making. Nobody reports it, and the leak continues. Small problems are worth reporting promptly — do not wait for a more serious fault to develop.",
          },
          {
            label: "Try to dismantle the tap yourself to find the cause.",
            correct: false,
            feedback:
              "Unless you are an authorised and competent maintenance person, do not attempt to dismantle plumbing fittings. You could make the fault worse or create a safety risk. Report it to the right person instead.",
          },
          {
            label: "Report the location and the problem through the correct workplace channel.",
            correct: true,
            feedback:
              "This is the right action. You do not need to diagnose or fix the fault. Reporting the location, what you observed, and when it started gives the maintenance team the information they need to act.",
          },
          {
            label: "Wait until the leak becomes more serious before reporting it.",
            correct: false,
            feedback:
              "Waiting makes the problem worse. An early report often results in a quicker and less disruptive repair. Report it as soon as you notice it.",
          },
        ],
      },
      {
        id: "wc1-m1",
        type: "multiple_choice",
        position: 6,
        mcqQuestion:
          "What information is most useful to include when reporting a dripping tap or minor leak at work?",
        mcqOptions: [
          "The exact location, what you observed, and when you noticed it",
          "Your personal opinion on the likely cause of the fault",
          "A list of all the taps in the building that might have the same problem",
          "The contact details of the person who should pay for the repair",
        ],
        mcqCorrectIndex: 0,
        mcqCorrectExplanation:
          "Exactly right. Providing the location, a clear description of what you observed, and when you noticed it gives the maintenance team everything they need to investigate and act quickly.",
        mcqIncorrectExplanation:
          "The most useful report is factual and specific: where is it, what did you observe, and when did you notice it? Speculation about causes or who pays is not required from the reporter.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Lesson 2 — Where Water Is Used at Work
  // ─────────────────────────────────────────────────────────────────────────────
  {
    order: 1,
    title: "Where Water Is Used at Work",
    minutes: 3,
    content:
      "Recognise the many places and activities where water is used in different types of workplace.",
    blocks: [
      {
        id: "wc2-h1",
        type: "heading",
        position: 1,
        headingText: "Where Water Is Used at Work",
      },
      {
        id: "wc2-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "Water is used across many parts of a workplace. Recognising where it is used helps you notice when something is wrong, make better decisions, and know which situations to report.",
      },
      {
        id: "wc2-k1",
        type: "key_message",
        position: 3,
        headingText: "Focus on What You Can Observe, Influence or Report",
        bodyText:
          "Employees should focus on water use they can see, affect during routine tasks, or report to the right person. Do not interfere with technical systems, controlled processes or equipment you are not authorised to operate.",
      },
      {
        id: "wc2-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Common Workplace Water Uses",
        bodyText:
          "Water is used in washrooms and handwashing, staff kitchens, cleaning routines, landscaping and outdoor areas, guest rooms and bathrooms, laundry, food preparation, construction activities, manufacturing or process operations, vehicle or equipment washing, and cooling or building services. Not all of these are within an individual employee's control — but most can be observed and reported.",
      },
      {
        id: "wc2-m1",
        type: "multiple_choice",
        position: 5,
        mcqQuestion:
          "A maintenance colleague tells you that a building cooling system appears to be leaking water. What is the most appropriate action for a regular employee in this situation?",
        mcqOptions: [
          "Attempt to fix the cooling system yourself using available tools.",
          "Ignore it — cooling systems are technical and outside your responsibilities.",
          "Report what you observed to the correct person and let authorised staff investigate.",
          "Switch off the cooling system immediately to stop any further water loss.",
        ],
        mcqCorrectIndex: 2,
        mcqCorrectExplanation:
          "Reporting what you observed is the right action. Technical systems like building cooling should be investigated by authorised staff. Your role is to notice and report, not to repair or shut down equipment you are not authorised to operate.",
        mcqIncorrectExplanation:
          "Attempting to repair, ignoring, or switching off a technical system you are not trained or authorised to work on could cause further damage or a safety risk. The right action is to report it to the correct person.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Lesson 3 — Use Less Without Lowering Standards
  // ─────────────────────────────────────────────────────────────────────────────
  {
    order: 2,
    title: "Use Less Without Lowering Standards",
    minutes: 3,
    content:
      "Practical ways to use water more carefully during routine work while maintaining hygiene, safety and service standards.",
    blocks: [
      {
        id: "wc3-h1",
        type: "heading",
        position: 1,
        headingText: "Use Less Without Lowering Standards",
      },
      {
        id: "wc3-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "Using water more carefully does not mean cutting corners. There are practical habits that help you work efficiently without compromising hygiene, food safety, service quality or operational requirements.",
      },
      {
        id: "wc3-k1",
        type: "key_message",
        position: 3,
        headingText: "Hygiene and Safety Always Come First",
        bodyText:
          "Never reduce the quality of handwashing, food preparation, sanitation or cleaning in order to save water. Conservation means avoiding unnecessary waste — not compromising standards.",
      },
      {
        id: "wc3-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Practical Habits That Make a Difference",
        bodyText:
          "Turn taps off fully after use. Avoid running water while performing a separate task when continuous flow is not needed. Use the correct amount of water for the task at hand. Follow approved cleaning procedures. Use appropriate cleaning equipment — a damp cloth or mop can be more effective than a continuous hose in many indoor situations. Load dishwashers and washing machines according to workplace procedures before running a cycle. Plan cleaning tasks to avoid unnecessary repeat washing.",
      },
      {
        id: "wc3-p1",
        type: "practical_action",
        position: 5,
        headingText: "Simple Habits to Carry Into Every Shift",
        bodyText:
          "1. Turn taps off fully — do not leave them running while doing something else. 2. Use the right amount of water for each task. 3. Follow your workplace's approved cleaning and operating procedures. 4. If you are unsure whether a method is correct, ask a supervisor rather than guessing.",
      },
      {
        id: "wc3-d1",
        type: "decision_scenario",
        position: 6,
        decisionIntro:
          "A staff member is cleaning a work area. They are considering using a continuously running hose because it seems faster than filling a bucket.",
        decisionPrompt:
          "What factors should they consider before deciding?",
        decisionChoices: [
          {
            label:
              "Use the running hose without checking — speed is the priority.",
            correct: false,
            feedback:
              "Speed alone is not a sufficient reason to use a continuously running hose. Consider whether continuous flow is actually needed for this task, what the approved cleaning method is, and whether the area, materials or hygiene requirements call for a specific approach.",
          },
          {
            label:
              "Consider the approved procedure, hygiene requirements, the available equipment, and whether continuous flow is actually necessary for this task.",
            correct: true,
            feedback:
              "The right approach is to consider the context. In some situations a running hose is appropriate; in others a bucket, mop or spray is more effective and uses less water. Always follow approved procedures and hygiene requirements. If uncertain, ask a supervisor.",
          },
          {
            label:
              "Never use a hose — buckets are always more water-efficient.",
            correct: false,
            feedback:
              "This is not a universal rule. Some cleaning tasks require hose flow. The correct decision depends on the approved procedure, hygiene requirements, the surface being cleaned, and the equipment available. Do not substitute one blanket rule for another.",
          },
          {
            label:
              "Use whichever method uses the least water regardless of hygiene.",
            correct: false,
            feedback:
              "Hygiene requirements must not be compromised in order to save water. Conservation means avoiding unnecessary waste, not reducing cleanliness standards. Always follow approved procedures.",
          },
        ],
      },
      {
        id: "wc3-m1",
        type: "multiple_choice",
        position: 7,
        mcqQuestion:
          "Which of the following best describes how to balance water conservation with hygiene and food safety at work?",
        mcqOptions: [
          "Reduce handwashing duration to one rinse to save water.",
          "Skip dishwasher cycles if they are not completely full to avoid waste.",
          "Avoid unnecessary water use while always following hygiene and food-safety procedures in full.",
          "Use as little water as possible in food preparation areas, even if it affects safety.",
        ],
        mcqCorrectIndex: 2,
        mcqCorrectExplanation:
          "This is the correct balance. Conservation means avoiding unnecessary water use, not compromising hygiene or safety. Handwashing, food preparation, and sanitation procedures must always be followed in full.",
        mcqIncorrectExplanation:
          "Hygiene, handwashing, and food-safety procedures must never be reduced to save water. Conservation applies to genuinely unnecessary water use — not to required safety practices.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Lesson 4 — Spot, Report and Follow Up
  // ─────────────────────────────────────────────────────────────────────────────
  {
    order: 3,
    title: "Spot, Report and Follow Up",
    minutes: 3,
    content:
      "Recognise warning signs of leaks or faulty equipment and know how to report them clearly and safely.",
    blocks: [
      {
        id: "wc4-h1",
        type: "heading",
        position: 1,
        headingText: "Spot, Report and Follow Up",
      },
      {
        id: "wc4-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "You do not need to be a plumber to notice that something is wrong. Recognising common warning signs and reporting them promptly is a practical and important contribution.",
      },
      {
        id: "wc4-k1",
        type: "key_message",
        position: 3,
        headingText: "These Are Warning Signs — Not Diagnoses",
        bodyText:
          "You are not expected to identify the technical cause of a fault. You are expected to notice something unusual, report it clearly, and leave the investigation to authorised staff.",
      },
      {
        id: "wc4-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Possible Signs of a Leak or Fault",
        bodyText:
          "A tap that does not close properly. A toilet that continues running after flushing. Water appearing where the area should normally be dry. Dampness, staining or discolouration on walls, ceilings or floors. A hose connection or fitting that drips during use. Repeatedly wet ground when there has been no obvious water use. Equipment using water in a way that seems different from its normal operation. A tank or container that needs refilling more frequently than usual.",
      },
      {
        id: "wc4-d1",
        type: "decision_scenario",
        position: 5,
        decisionIntro:
          "You notice a damp patch forming on the ceiling of a storeroom. There is no obvious explanation — it was dry yesterday.",
        decisionPrompt:
          "What is the most appropriate immediate response?",
        decisionChoices: [
          {
            label:
              "Place a container underneath and carry on — it is probably not serious.",
            correct: false,
            feedback:
              "A container is a temporary measure at best. A new, unexplained damp patch on a ceiling may indicate a leak above. Report it promptly. If there is any sign of structural risk or electrical equipment nearby, escalate immediately.",
          },
          {
            label:
              "Report the location and what you observed to the facilities team, noting the date and any safety concerns.",
            correct: true,
            feedback:
              "Correct. A clear, factual report — including the location, what you saw, when it appeared, and whether there are any safety concerns — gives the maintenance team what they need to investigate. If there are electrical fixtures near the damp area, flag that as a priority.",
          },
          {
            label:
              "Open the ceiling panels yourself to check what is above the storeroom.",
            correct: false,
            feedback:
              "Do not enter ceiling spaces or remove panels unless you are authorised and competent to do so. Report the observation and let trained maintenance staff carry out the investigation.",
          },
          {
            label:
              "Wait for the patch to dry and see whether it returns before reporting anything.",
            correct: false,
            feedback:
              "Waiting can allow a leak to worsen, cause additional damage, or create a safety hazard — particularly if the water is near electrical fittings. Report it now.",
          },
        ],
      },
      {
        id: "wc4-p1",
        type: "practical_action",
        position: 6,
        headingText: "What to Include in a Useful Fault Report",
        bodyText:
          "1. Exact location (room, floor, area, equipment). 2. What you observed (describe it clearly, without guessing the cause). 3. When you first noticed it. 4. Whether it is continuous or comes and goes. 5. Any immediate safety risk (electrical fittings nearby, slip hazard, structural concern). 6. A photograph, if your company policy allows it. Do not interfere with electrical, pressurised, contaminated or technical systems. Report and step back.",
      },
      {
        id: "wc4-m1",
        type: "multiple_choice",
        position: 7,
        mcqQuestion:
          "Which of the following is a useful warning sign that a toilet may have a fault worth reporting?",
        mcqOptions: [
          "The toilet makes a quiet noise only when first flushed.",
          "The toilet continues running for several minutes or indefinitely after flushing.",
          "The toilet handle requires a firm push to operate.",
          "The toilet cistern occasionally refills during the night.",
        ],
        mcqCorrectIndex: 1,
        mcqCorrectExplanation:
          "A toilet that continues running long after flushing is a clear sign of a fault — a valve or seal is likely not closing correctly. This should be reported so the fault can be investigated and repaired by authorised maintenance staff.",
        mcqIncorrectExplanation:
          "A toilet that runs continuously after flushing is the clearest indicator of a fault worth reporting. A normal flush may briefly fill the cistern, but continuous running indicates something is not closing properly.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Lesson 5 — Water Decisions in Real Workplaces
  // ─────────────────────────────────────────────────────────────────────────────
  {
    order: 4,
    title: "Water Decisions in Real Workplaces",
    minutes: 4,
    content:
      "Apply the learning through realistic situations drawn from hospitality, office, and facilities or construction settings.",
    blocks: [
      {
        id: "wc5-h1",
        type: "heading",
        position: 1,
        headingText: "Water Decisions in Real Workplaces",
      },
      {
        id: "wc5-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "The right response to a water issue depends on the context — the sector, the setting, the people involved, and the operational requirements. Work through three realistic situations.",
      },
      {
        id: "wc5-d1",
        type: "decision_scenario",
        position: 3,
        decisionIntro:
          "Scenario A — Hotel or Hospitality: A hotel guest contacts reception to say that the toilet in their room continues running after flushing. It has been happening since they checked in.",
        decisionPrompt:
          "What is the most appropriate response from the reception or guest-services team?",
        decisionChoices: [
          {
            label:
              "Inform the guest that maintenance has been notified and arrange a room change or timely repair, logging the room number and the reported fault.",
            correct: true,
            feedback:
              "Correct. The guest receives a prompt service response, the fault is logged with the correct location and description, and maintenance can investigate. This balances guest service, prompt reporting, and correct escalation.",
          },
          {
            label:
              "Tell the guest it is probably normal and suggest they flush again.",
            correct: false,
            feedback:
              "A toilet that runs continuously is not normal. Dismissing a guest's concern is poor service and allows a real fault to continue unreported.",
          },
          {
            label:
              "Visit the room and attempt to repair the cistern mechanism yourself.",
            correct: false,
            feedback:
              "Unless you are an authorised and competent maintenance person, do not attempt to repair plumbing equipment. Your role is to log the fault and escalate it to the right person promptly.",
          },
          {
            label:
              "Wait until check-out to log the fault so the guest is not disturbed.",
            correct: false,
            feedback:
              "Delaying the report prolongs the water waste and leaves a fault unattended that could worsen. Report promptly even if a room change or repair needs to be arranged sensitively.",
          },
        ],
      },
      {
        id: "wc5-d2",
        type: "decision_scenario",
        position: 4,
        decisionIntro:
          "Scenario B — Office or Retail: Water is found pooling under the staff-kitchen sink on a Monday morning. A colleague says they also noticed it on Friday but did not report it.",
        decisionPrompt:
          "What should you do?",
        decisionChoices: [
          {
            label:
              "Place a container under the sink and leave it there indefinitely without reporting it.",
            correct: false,
            feedback:
              "A container buys time but does not fix the problem. Water under a sink may indicate a slow leak that will worsen. The fault must be reported to the correct person so it can be investigated and repaired.",
          },
          {
            label:
              "Report the recurring problem, place a temporary container if it is safe to do so, keep the area clean and dry to prevent slips, and follow up to confirm the report was received.",
            correct: true,
            feedback:
              "This is the correct response. You report the fault, take a simple practical step to manage the immediate situation safely, and follow up to make sure the report was acted on.",
          },
          {
            label:
              "Try to tighten the pipe connections yourself to stop the leak.",
            correct: false,
            feedback:
              "Do not attempt to repair plumbing unless you are authorised and competent. Even tightening a connection incorrectly can damage fittings or make the fault worse. Report it and let maintenance handle it.",
          },
          {
            label:
              "Ignore it — it was probably there all weekend without causing damage.",
            correct: false,
            feedback:
              "Time without visible damage does not mean the problem is safe to leave. The leak will continue and could worsen. Report it now.",
          },
        ],
      },
      {
        id: "wc5-d3",
        type: "decision_scenario",
        position: 5,
        decisionIntro:
          "Scenario C — Construction, Maintenance or Manufacturing: You notice that a hose used in a routine process appears to be running for longer than usual, and there is water pooling nearby that is not normally present.",
        decisionPrompt:
          "What should you consider before taking any action?",
        decisionChoices: [
          {
            label:
              "Switch off the hose immediately and report the observation.",
            correct: false,
            feedback:
              "Before switching off any water supply on a controlled process, consider whether the process is safety-critical, temperature-controlled, or managed by an authorised operator. Stopping it without authorisation could cause a hazard or damage to the process. Assess first, then act or report.",
          },
          {
            label:
              "Assess whether the process is controlled by an authorised operator, consider any safety or quality requirements, then report the observation to the right person or escalate if there is an immediate safety risk.",
            correct: true,
            feedback:
              "Correct. In technical or industrial settings, controlled water processes may have safety, quality or regulatory requirements. Your role is to observe and report — and to escalate urgently if there is an immediate safety risk — not to interfere with a process you may not fully understand.",
          },
          {
            label:
              "Assume the operator knows about it and carry on with your work.",
            correct: false,
            feedback:
              "Do not assume. If something appears unusual and there is water pooling unexpectedly, it is worth raising with the relevant person. You do not need to be certain — reporting an observation is always appropriate.",
          },
          {
            label:
              "Ignore it — technical processes are not your responsibility.",
            correct: false,
            feedback:
              "Safety and environmental awareness are everyone's responsibility. Reporting an unusual observation to the right person is always appropriate, even if the technical operation is managed by someone else.",
          },
        ],
      },
      {
        id: "wc5-p1",
        type: "practical_action",
        position: 6,
        headingText: "Across Every Sector: The Same Principles Apply",
        bodyText:
          "Notice what is unusual. Report it clearly to the right person. Do not attempt repairs you are not authorised to carry out. Keep the area safe while waiting for maintenance. Follow up to confirm the report was received and acted on.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Lesson 6 — My Water-Wise Commitment
  // ─────────────────────────────────────────────────────────────────────────────
  {
    order: 5,
    title: "My Water-Wise Commitment",
    minutes: 2,
    content:
      "Summarise the course learning and allow the learner to select practical commitments they will carry forward.",
    blocks: [
      {
        id: "wc6-h1",
        type: "heading",
        position: 1,
        headingText: "My Water-Wise Commitment",
      },
      {
        id: "wc6-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "You have worked through six lessons covering the most common water-related situations employees encounter at work. Before completing the course, choose the commitments you will carry into your daily work.",
      },
      {
        id: "wc6-k1",
        type: "key_message",
        position: 3,
        headingText: "Small, Consistent Actions Make a Difference",
        bodyText:
          "Water conservation at work does not require special skills or authority. Noticing problems, reporting them promptly, following approved procedures and making careful everyday decisions are actions every employee can take.",
      },
      {
        id: "wc6-c1",
        type: "commitment",
        position: 4,
        commitmentInstruction:
          "Select the commitments you will practise at work. Choose at least one:",
        commitmentOptions: [
          {
            value: "report-leaks",
            label: "I will report leaks or recurring water problems promptly.",
            description:
              "Reporting early prevents small faults from becoming larger ones.",
          },
          {
            value: "close-taps",
            label: "I will check that taps are fully closed after use.",
            description:
              "A tap that is not fully closed may drip continuously.",
          },
          {
            value: "follow-procedures",
            label: "I will follow approved cleaning and operating procedures.",
            description:
              "Approved procedures balance effectiveness, hygiene and resource use.",
          },
          {
            value: "avoid-running-water",
            label:
              "I will avoid leaving water running when it is not required.",
            description:
              "Running water unnecessarily is one of the most common and avoidable forms of waste.",
          },
          {
            value: "notice-warning-signs",
            label:
              "I will pay attention to damp areas, running toilets and other warning signs.",
            description:
              "Early observation leads to earlier reporting and earlier repair.",
          },
          {
            value: "ask-when-unsure",
            label:
              "I will ask the appropriate person when I am unsure about a water-use practice.",
            description:
              "Asking is always better than guessing, especially where hygiene or safety is involved.",
          },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FINAL QUIZ — 8 questions, correct answers distributed across positions 0–3
// ─────────────────────────────────────────────────────────────────────────────
const NEW_QUIZ = [
  {
    order: 1,
    question:
      "A tap in the staff kitchen has been dripping for two days. Several colleagues have noticed it. What is the correct response?",
    options: [
      "Leave it — someone else will report it eventually.",
      "Report the location and the fault through the correct workplace channel.",
      "Attempt to tighten the tap fitting yourself.",
      "Wait until the fault becomes more serious before raising it.",
    ],
    correct: 1,
    correctExplanation:
      "Reporting the location, what you observed, and when is the correct action. You do not need to diagnose or repair the fault — providing clear information to the right person allows it to be fixed promptly.",
    incorrectExplanation:
      "Small recurring faults are worth reporting immediately. Assuming someone else will act, waiting for a more serious problem, or attempting an unauthorised repair are all less appropriate responses.",
  },
  {
    order: 2,
    question:
      "A ceiling has a new damp patch this morning that was not there yesterday. There are electrical light fittings nearby. What should you do?",
    options: [
      "Remove the ceiling panel to check for a pipe above.",
      "Place a container below the damp patch and ignore it until it worsens.",
      "Report the observation clearly, note the location, and flag the nearby electrical fittings as a priority safety concern.",
      "Switch off the lighting circuit to protect the fittings yourself.",
    ],
    correct: 2,
    correctExplanation:
      "Report the observation clearly and flag the electrical risk. Unexplained dampness near electrical fittings is a safety concern. Let authorised maintenance staff investigate — do not enter ceiling spaces, remove panels, or tamper with electrical circuits yourself.",
    incorrectExplanation:
      "The priority is to report the observation clearly, including the nearby electrical fittings, so that authorised staff can investigate safely. Do not attempt repairs, enter ceiling spaces, or interfere with electrical circuits.",
  },
  {
    order: 3,
    question:
      "Which of the following best describes how to conserve water without reducing hygiene standards?",
    options: [
      "Skip routine handwashing if your hands appear clean.",
      "Reduce dishwasher cycle temperature to save water.",
      "Avoid unnecessary water use while following hygiene and food-safety procedures in full.",
      "Use less water during food preparation to improve kitchen efficiency.",
    ],
    correct: 2,
    correctExplanation:
      "Conservation means avoiding genuinely unnecessary water use — it never means reducing handwashing, hygiene or food-safety standards. Required procedures must always be followed in full.",
    incorrectExplanation:
      "Water conservation applies to genuinely unnecessary use. Handwashing, hygiene procedures and food-safety requirements must never be reduced or skipped to save water.",
  },
  {
    order: 4,
    question:
      "Which of the following is the clearest sign that a toilet should be reported for a possible fault?",
    options: [
      "The toilet makes a brief sound when the cistern refills after flushing.",
      "The toilet handle requires a firm push to operate.",
      "The toilet continues running for several minutes or indefinitely after flushing.",
      "The toilet cistern takes slightly longer to refill than other toilets in the building.",
    ],
    correct: 2,
    correctExplanation:
      "A toilet that runs continuously after flushing is a clear sign of a fault — a valve or seal is not closing correctly. Report it to maintenance so it can be investigated and repaired.",
    incorrectExplanation:
      "A toilet that continues running long after flushing is the clearest indicator of a fault requiring maintenance. Normal refilling after a flush is expected; continuous running is not.",
  },
  {
    order: 5,
    question:
      "A hotel guest reports that the toilet in their room has been running continuously since they checked in. What is the most appropriate response?",
    options: [
      "Visit the room and attempt to adjust the cistern mechanism yourself.",
      "Inform the guest that maintenance has been notified, arrange a resolution, and log the room number and fault clearly.",
      "Tell the guest it is probably a temporary sound and will stop shortly.",
      "Wait until the guest checks out to report the fault so the room is not disturbed.",
    ],
    correct: 1,
    correctExplanation:
      "The correct response prioritises guest service, prompt reporting, correct fault logging, and escalation to authorised maintenance. Do not attempt repairs yourself or dismiss the guest's concern.",
    incorrectExplanation:
      "The fault must be logged and reported promptly. Dismissing the guest's concern, delaying the report, or attempting an unauthorised repair are all incorrect responses.",
  },
  {
    order: 6,
    question:
      "Water is found pooling under a staff-kitchen sink on Monday morning. A colleague says they noticed it on Friday but did not report it. What should you do now?",
    options: [
      "Report the fault, place a temporary container if safe to do so, keep the area dry to prevent slips, and follow up to confirm the report was received.",
      "Tighten the pipe connections beneath the sink to stop the leak yourself.",
      "Leave a note for the next shift to deal with it.",
      "Accept that it has been there all weekend without causing harm and monitor it for another week.",
    ],
    correct: 0,
    correctExplanation:
      "Report the fault, take a simple safe step to manage the immediate hazard, and follow up to ensure the report was received. Do not attempt plumbing repairs yourself or delay reporting a known fault.",
    incorrectExplanation:
      "The fault must be reported now. Time without visible damage does not mean the problem is safe to leave. Avoid attempting repairs you are not authorised to carry out.",
  },
  {
    order: 7,
    question:
      "A hose on a manufacturing or construction site appears to be running for longer than usual and there is unexplained pooling of water nearby. The process is operated by a colleague on a different team. What is the appropriate approach?",
    options: [
      "Switch off the hose immediately without consulting anyone.",
      "Ignore it — controlled processes are not your responsibility.",
      "Assume the operator has already identified the issue and carry on.",
      "Assess whether the process is safety-critical, then report your observation to the operator or the relevant supervisor, escalating urgently if there is an immediate safety risk.",
    ],
    correct: 3,
    correctExplanation:
      "In technical settings, controlled processes may have safety, quality or regulatory requirements. Report your observation to the right person and escalate if there is an immediate risk — do not interfere with a process you are not authorised to manage.",
    incorrectExplanation:
      "Reporting an unusual observation is always appropriate. Do not switch off controlled equipment without authorisation, and do not ignore an unexplained change. Assess the situation and report it to the right person.",
  },
  {
    order: 8,
    question:
      "Which of the following pieces of information is most useful to include in a fault report about a possible water leak?",
    options: [
      "Your professional opinion on the technical cause of the fault.",
      "The names of colleagues who also noticed the problem but did not report it.",
      "The exact location, a clear description of what you observed, when you first noticed it, and any immediate safety risk.",
      "A list of all the plumbing fittings in the affected area.",
    ],
    correct: 2,
    correctExplanation:
      "A useful fault report includes the exact location, a factual description of what you observed, when you noticed it, and any safety concerns. You are not expected to diagnose the technical cause or list all fittings in the area.",
    incorrectExplanation:
      "The most useful report is factual and specific: where, what, when, and any safety risk. Leave the technical investigation to authorised maintenance staff.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main seeder function — idempotent, admin-edit-preserving
// ─────────────────────────────────────────────────────────────────────────────
export async function ensureWaterConservationCourse(
  externalTx?: any
): Promise<void> {
  const runSeeder = async (tx: any) => {
    // 1. Resolve Course 4 by ID 4 first, then by slug
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
      throw new Error(
        "Course 4 not seeded by catalogue skeletons bootstrap. Ensure ensureCatalogueSkeletons() runs first."
      );
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

    // 3. Evaluate integrity violations (determines whether repair is needed)
    const hasMissingLessons = existingLessons.length !== 6;
    const hasEmptyBlocks = existingLessons.some(
      (l: any) =>
        !l.contentBlocks ||
        !Array.isArray(l.contentBlocks) ||
        l.contentBlocks.length === 0
    );
    const hasPlaceholderText = existingLessons.some(
      (l: any) =>
        l.title.includes("[DRAFT SKELETON]") ||
        (l.content || "").includes("[DRAFT SKELETON]")
    );
    const hasMissingQuiz = existingQuizQuestions.length !== 8;
    const hasPlaceholderQuiz = existingQuizQuestions.some((q: any) =>
      q.question.includes("[DRAFT SKELETON]")
    );
    const hasIncorrectSlug = course.slug !== COURSE_SLUG;

    const needsRepair =
      !existingSeed ||
      hasMissingLessons ||
      hasEmptyBlocks ||
      hasPlaceholderText ||
      hasMissingQuiz ||
      hasPlaceholderQuiz ||
      hasIncorrectSlug;

    if (!needsRepair) {
      logger.info(
        { courseId, slug: COURSE_SLUG },
        "Water Conservation course content and integrity verified. Skipping repair to preserve administrator edits..."
      );
      return;
    }

    logger.info(
      { courseId, slug: COURSE_SLUG },
      "Integrity mismatch or missing seed detected for Course 4. Re-seeding course content and lessons transactionally..."
    );

    // 4. Resolve next recommended course dynamically by slug (Course 5: Sustainable Procurement)
    const [nextCourse] = await tx
      .select({ id: coursesTable.id })
      .from(coursesTable)
      .where(eq(coursesTable.slug, "sustainable-procurement"))
      .limit(1);
    const nextCourseId = nextCourse?.id ?? null;

    // 5. Update course record metadata
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
        badgeName: COURSE_META.badgeName,
        badgeDescription: COURSE_META.badgeDescription,
        recommendedNextCourseId: nextCourseId,
        isPublished: true,
        status: "published",
      })
      .where(eq(coursesTable.id, courseId));

    // 6. Re-seed lessons
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

    // 7. Re-seed quiz questions
    await tx
      .delete(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, courseId));
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

    // 8. Idempotently seed badge definition
    await tx
      .insert(badgeDefinitionsTable)
      .values({
        slug: BADGE_SLUG,
        name: COURSE_META.badgeName,
        description: COURSE_META.badgeDescription,
        icon: "droplets",
        criteriaType: "all_courses",
        threshold: 0,
        courseIds: [courseId],
        orderIndex: 9,
      })
      .onConflictDoUpdate({
        target: badgeDefinitionsTable.slug,
        set: {
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          courseIds: [courseId],
        },
      });

    // 9. Record seed marker
    if (!existingSeed) {
      await tx.insert(systemSeedsTable).values({
        name: SEED_NAME,
        version: 1,
      });
    }

    logger.info(
      { courseId, slug: COURSE_SLUG },
      "Water Conservation course seed / repair transaction completed successfully."
    );
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
    logger.error(
      { err },
      "Failed to execute idempotent seeding/repair of Water Conservation course"
    );
  }
}
