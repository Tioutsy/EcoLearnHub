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
const SEED_NAME = "sustainability-for-operations-and-frontline-teams-v1";

const COURSE_META = {
  courseCode: "ELH-29",
  description: "Learn how to recognise sustainability issues during frontline work, act safely within your authority, report problems clearly, and contribute to continuous improvement.",
  fullDescription: "Learn how to recognise sustainability issues during frontline work, act safely within your authority, report problems clearly, and contribute to continuous improvement.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainability-for-operations-and-frontline-teams.jpg",
  intendedRoles: [
    "Operations employees",
    "Frontline workers",
    "Shift employees",
    "Operations supervisors",
    "Service-delivery teams"
  ],
  learningObjectives: [
    "Identify operational activities that affect waste, energy, water, materials and environmental performance.",
    "Recognise abnormal conditions and avoid treating them as normal workplace inconvenience.",
    "Apply approved procedures while balancing sustainability, safety, quality and service requirements.",
    "Take immediate action when authorised and escalate issues that exceed their role.",
    "Report operational problems using specific observations and useful evidence.",
    "Participate constructively in workplace improvements and help verify whether changes work."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Sustainability for Operations and Frontline Teams. You can now recognise operational sustainability issues, respond within your role and report useful evidence for workplace action.",
  badgeName: "Operational Sustainability Practitioner",
  badgeDescription: "Awarded for demonstrating practical understanding of how to manage waste separation, reduce energy loss, coordinate corrective actions and retain operational evidence.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Daily Operations Shape Environmental Performance",
    minutes: 3,
    content: "Understand how daily operations use resources and shape the organization's footprint. Frontline teams notice inefficiencies and can prevent significant waste.",
    blocks: [
      {
        id: "c29-l1-b1",
        type: "heading",
        headingText: "Daily Operations Shape Environmental Performance"
      },
      {
        id: "c29-l1-b2",
        type: "short_text",
        bodyText: "Workplace sustainability starts on the floor. Every process—cooking, packing, warehousing, cleaning, or delivery—uses energy, water, and materials. Repeated micro-waste (like leaving water running or pre-opening packaging) builds up significantly over a year. Frontline teams see these issues first."
      },
      {
        id: "c29-l1-b3",
        type: "key_message",
        headingText: "Resource Priorities",
        bodyText: "Always balance resource reduction with safety, hygiene, quality, and service continuity. Correcting waste must never compromise safe operations."
      },
      {
        id: "c29-l1-b4",
        type: "decision_scenario",
        decisionIntro: "During a busy breakfast service in a Mauritian hotel, the team prepares dishes in advance, leaves unused refrigeration doors open, ignores a leaking rinse tap, and keeps lighting on in empty storerooms.",
        decisionPrompt: "Which of these issues requires immediate supervisor escalation rather than basic correction?",
        decisionChoices: [
          {
            label: "Leaving unused refrigeration doors open.",
            correct: false,
            feedback: "Incorrect. Frontline staff can close doors immediately without supervisor approval."
          },
          {
            label: "Keeping lighting on in empty storerooms.",
            correct: false,
            feedback: "Incorrect. Staff should switch off lights immediately."
          },
          {
            label: "A persistent leak under the rinse sink that is starting to flood the floor and create a slipping hazard.",
            correct: true,
            feedback: "Correct. Slip hazards require immediate supervisor attention and safety signs, unlike simple habits that can be self-corrected."
          },
          {
            label: "Preparing standard breakfast dishes based on the occupancy forecast.",
            correct: false,
            feedback: "Incorrect. Following occupancy forecasts is a necessary operational planning tool."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Recognise Waste and Abnormal Conditions",
    minutes: 3,
    content: "Learn to distinguish normal resource use from abnormal conditions. Ignoring minor issues leads to costly long-term waste.",
    blocks: [
      {
        id: "c29-l2-b1",
        type: "heading",
        headingText: "Recognise Waste and Abnormal Conditions"
      },
      {
        id: "c29-l2-b2",
        type: "short_text",
        bodyText: "An abnormal condition is a deviation from standard operation—such as faulty seals, leaking valves, unusual machine noises, or damaged stock packaging. Frontline staff should not attempt technical diagnostic work. Instead, observe the issue, record facts, and log it."
      },
      {
        id: "c29-l2-b3",
        type: "key_message",
        headingText: "Do Not Accept Waste",
        bodyText: "Accepting minor leaks or constant machine idle times as 'just how things work' causes significant cumulative carbon and material loss."
      },
      {
        id: "c29-l2-b4",
        type: "decision_scenario",
        decisionIntro: "In a warehouse stockroom in Port Louis, several cardboard cartons containing inventory are repeatedly damaged by rain water entering from a gaps near a loading bay shutter.",
        decisionPrompt: "What is the most responsible frontline action?",
        decisionChoices: [
          {
            label: "Wait until the next quarterly stocktake to log the damaged boxes.",
            correct: false,
            feedback: "Incorrect. Delaying allows more stock to be ruined."
          },
          {
            label: "Attempt to fix the loading bay door seal yourself using cardboard and tape.",
            correct: false,
            feedback: "Incorrect. Frontline staff should not perform unauthorized structural repairs."
          },
          {
            label: "Move the unaffected stock to a dry location immediately, log the timing and location of the water entry, and report it to the supervisor.",
            correct: true,
            feedback: "Correct. This immediately protects the inventory and escalates the underlying facility issue with clear facts."
          },
          {
            label: "Quietly discard the ruined packaging and say nothing to avoid blame.",
            correct: false,
            feedback: "Incorrect. Hiding waste prevents management from repairing the building."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Act Within Your Role and Escalate Clearly",
    minutes: 3,
    content: "Understand when to take immediate action and when to escalate. Safety must always take priority over saving resources.",
    blocks: [
      {
        id: "c29-l3-b1",
        type: "heading",
        headingText: "Act Within Your Role and Escalate Clearly"
      },
      {
        id: "c29-l3-b2",
        type: "short_text",
        bodyText: "Workplace actions fall into three levels. Level 1: Act immediately on authorized items (e.g. closing running taps, switching off idle computers). Level 2: Report and request support for persistent issues (e.g. minor leaks, worn seals). Level 3: Stop and escalate urgent hazards (e.g. chemical spills, smoke, overheating machines, food safety risks)."
      },
      {
        id: "c29-l3-b3",
        type: "key_message",
        headingText: "Improvisation is Dangerous",
        bodyText: "Never bypass safety procedures to save energy or water. Improvising maintenance work creates critical risks."
      },
      {
        id: "c29-l3-b4",
        type: "decision_scenario",
        decisionIntro: "An employee notices a laundry machine is hot to the touch, making loud metallic noises, and smelling slightly of burnt plastic, but the supervisor is away.",
        decisionPrompt: "Which action should be taken?",
        decisionChoices: [
          {
            label: "Let the machine finish its current cycle to avoid wasting water.",
            correct: false,
            feedback: "Incorrect. Burning smell and metallic noise indicate an active safety hazard."
          },
          {
            label: "Safely stop the machine immediately, isolate power following procedure, place an Out of Service tag, and report it to maintenance.",
            correct: true,
            feedback: "Correct. Safety takes immediate precedence over completing the load or saving a cycle."
          },
          {
            label: "Attempt to open the machine's motor casing to inspect the belt.",
            correct: false,
            feedback: "Incorrect. Performing unauthorized technical repairs is dangerous."
          },
          {
            label: "Ignore the smell and leave the area to complete other tasks.",
            correct: false,
            feedback: "Incorrect. Leaving a hazardous machine running unattended is unsafe."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Follow Procedures Without Losing Practical Judgement",
    minutes: 3,
    content: "Procedures guarantee safety, hygiene, and consistency. When a procedure causes waste, propose an improvement instead of taking shortcuts.",
    blocks: [
      {
        id: "c29-l4-b1",
        type: "heading",
        headingText: "Follow Procedures Without Losing Practical Judgement"
      },
      {
        id: "c29-l4-b2",
        type: "short_text",
        bodyText: "Standard operating procedures (SOPs) protect quality and compliance. However, outdated procedures can sometimes dictate wasteful practices. Rather than taking unauthorized shortcuts, employees should collect evidence of the waste and submit a structured proposal for review."
      },
      {
        id: "c29-l4-b3",
        type: "key_message",
        headingText: "Propose, Don't Bypass",
        bodyText: "Proposing a formal change involves explaining the problem, the suggested alternative, safety impacts, and expected outcomes."
      },
      {
        id: "c29-l4-b4",
        type: "decision_scenario",
        decisionIntro: "A cleaning supervisor mandates that a specific chemical dose is used per room. However, employees find that cleaner rooms do not need the full chemical concentration, creating excess runoff and waste.",
        decisionPrompt: "What is the best way to handle this?",
        decisionChoices: [
          {
            label: "Quietly dilute the product without approval to save chemical costs.",
            correct: false,
            feedback: "Incorrect. Diluting products without authorization violates health, safety, and hygiene standards."
          },
          {
            label: "Refuse to clean rooms until the procedure is updated.",
            correct: false,
            feedback: "Incorrect. Striking or refusing standard duties is counterproductive."
          },
          {
            label: "Follow the current procedure to maintain hygiene, and present the supervisor with chemical logs showing actual versus needed usage to suggest a tiered dosing procedure.",
            correct: true,
            feedback: "Correct. This maintains current safety standards while providing objective data to request a formal procedure update."
          },
          {
            label: "Complain to colleagues on shift but continue wasting the chemical.",
            correct: false,
            feedback: "Incorrect. Complaints without data do not result in process changes."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Report Problems With Useful Evidence",
    minutes: 3,
    content: "Learn how to document and communicate operational waste. Concrete evidence allows maintenance and management to act quickly.",
    blocks: [
      {
        id: "c29-l5-b1",
        type: "heading",
        headingText: "Report Problems With Useful Evidence"
      },
      {
        id: "c29-l5-b2",
        type: "short_text",
        bodyText: "Maintenance teams need facts, not opinions. When reporting a leak, a malfunctioning chiller, or a heating issue, include key details: what, where, when, frequency, and severity. Do not take photos if company rules prohibit them, but note specific counts or values."
      },
      {
        id: "c29-l5-b3",
        type: "key_message",
        headingText: "Actionable Reporting",
        bodyText: "Vague tickets like 'the machine is broken' are delayed. Precise tickets like 'water is dripping from chiller 3 evaporator drain line at 1 drop per second' are resolved quickly."
      },
      {
        id: "c29-l5-b4",
        type: "decision_scenario",
        decisionIntro: "In a hotel restaurant kitchen, a bakery unit is repeatedly preheated 3 hours before the baking shift starts, wasting significant gas and electricity.",
        decisionPrompt: "Which report will help management resolve the issue?",
        decisionChoices: [
          {
            label: "A note saying: 'The kitchen is wasting too much power.'",
            correct: false,
            feedback: "Incorrect. Vague complaints do not point to a specific machine or cause."
          },
          {
            label: "An email stating: 'Bakery oven unit B is being switched on at 05:00, but baking does not start until 08:00. This is 3 hours of idle heating daily.'",
            correct: true,
            feedback: "Correct. This details the exact equipment, timing, and duration of the waste, making it immediately actionable."
          },
          {
            label: "A warning message accusing the early shift workers of lazy habits.",
            correct: false,
            feedback: "Incorrect. Wording should remain neutral and focus on resource usage, not personal blame."
          },
          {
            label: "Saying nothing since ovens are meant to get hot.",
            correct: false,
            feedback: "Incorrect. Unnecessary preheating is a clear operational waste."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Contribute to Improvements and Check Results",
    minutes: 3,
    content: "Frontline knowledge is essential for continuous improvement. Learn how to run safe trials and verify actual resource savings.",
    blocks: [
      {
        id: "c29-l6-b1",
        type: "heading",
        headingText: "Contribute to Improvements and Check Results"
      },
      {
        id: "c29-l6-b2",
        type: "short_text",
        bodyText: "Do not assume a green initiative is a success until the results have been verified. Run small, controlled trials to evaluate changes. Check if the alternative method maintains safety, product quality, and service speeds while reducing resource consumption."
      },
      {
        id: "c29-l6-b3",
        type: "key_message",
        headingText: "Verify Success",
        bodyText: "Always verify savings. A change is successful when it preserves operational throughput while lowering environmental impacts over a test period."
      },
      {
        id: "c29-l6-b4",
        type: "decision_scenario",
        decisionIntro: "A warehouse team proposes replacing all bubble wrap with shredded scrap cardboard from local deliveries.",
        decisionPrompt: "How should they verify whether this change is successful?",
        decisionChoices: [
          {
            label: "Implement it permanently across all shipping bays immediately.",
            correct: false,
            feedback: "Incorrect. Immediate global implementation risks uncalculated package damage."
          },
          {
            label: "Run a 1-week trial on 50 local shipments, monitor package integrity upon arrival, and check packing times before making a decision.",
            correct: true,
            feedback: "Correct. A controlled trial verifies safety, customer quality, and packaging times before scaling."
          },
          {
            label: "Only check if the cardboard looks better than plastic wrap.",
            correct: false,
            feedback: "Incorrect. Aesthetic appeal is not a measure of packaging safety or protection."
          },
          {
            label: "Ask the supplier to make the decision for the team.",
            correct: false,
            feedback: "Incorrect. The team must verify operational impacts on their own shipments."
          }
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "A kitchen employee sees the walk-in chiller door held wide open with a crate during unloading. What is the correct analysis?",
    options: [
      {
        text: "This is necessary resource use to speed up delivery times.",
        isCorrect: false,
        feedback: "Incorrect. Unloading does not require the door to remain open continuously, letting warm air in and overworking the compressor."
      },
      {
        text: "This is avoidable waste. The employee should close the door between crate loads or unload onto a trolley first to keep door opening times short.",
        isCorrect: true,
        feedback: "Correct. Using a trolley to batch load and keeping the door shut preserves temperature control and limits energy waste."
      },
      {
        text: "It is only a problem if the kitchen temperature is above 30 degrees.",
        isCorrect: false,
        feedback: "Incorrect. Walk-in chiller energy loss occurs whenever the door is left open, regardless of kitchen ambient temp."
      },
      {
        text: "The employee should do nothing to avoid slowing down the delivery team.",
        isCorrect: false,
        feedback: "Incorrect. Unnecessary resource loss should be corrected if it is safe and simple to do so."
      }
    ],
    correctExplanation: "Unloading walk-in chillers should be planned (e.g., using transport trolleys) to minimize the time the doors remain open, reducing electricity waste and protecting food temperatures.",
    incorrectExplanation: "Leaving doors propped open, ignoring delivery prep, or classifying food safety issues as necessary use misses operational and energy efficiency opportunities.",
    practicalTakeaway: "Close refrigeration doors during unloading and use trolleys to batch items, minimizing warm air entry."
  },
  {
    question: "A hotel guest-room cleaner notices that a corridor AC unit is leaking water through the ceiling plaster, creating a wet patch on the carpet below.",
    options: [
      {
        text: "Ignore it since carpet cleaning is handled by another department.",
        isCorrect: false,
        feedback: "Incorrect. Ignoring leaks allows building structure damage and mold growth."
      },
      {
        text: "Try to repair the plaster ceiling yourself to save maintenance costs.",
        isCorrect: false,
        feedback: "Incorrect. Repairs must be handled by qualified maintenance technicians."
      },
      {
        text: "Mark the wet carpet area with a warning cone, record the exact location and time of the leak, and submit an urgent maintenance report.",
        isCorrect: true,
        feedback: "Correct. This secures immediate employee and guest safety and escalates the structural issue to maintenance with clear facts."
      },
      {
        text: "Wait until the guest checks out before reporting the issue.",
        isCorrect: false,
        feedback: "Incorrect. Water damage and slip hazards must be reported and isolated immediately."
      }
    ],
    correctExplanation: "Abnormal conditions like active water leaks in corridors should be reported immediately. Secure guest safety by marking the area and report details to maintenance.",
    incorrectExplanation: "Delaying, ignoring, or attempting unauthorized repair allows structural damage or slip hazards to escalate.",
    practicalTakeaway: "Secure immediate safety around a leak, record details, and submit a maintenance report."
  },
  {
    question: "An employee notices a grease separator tank in a kitchen is overflowing, but they are not the designated operator.",
    options: [
      {
        text: "Clean up the spill and wait until the next day to inform anyone.",
        isCorrect: false,
        feedback: "Incorrect. Separator overflows indicate filter failure and must be escalated immediately."
      },
      {
        text: "Shut down the kitchen sinks to stop flow, place safety signage, and report the overflow immediately to the kitchen supervisor.",
        isCorrect: true,
        feedback: "Correct. This stops the active pollution source, protects kitchen hygiene/safety, and escalates to the supervisor."
      },
      {
        text: "Open the tank casing and try to manually scrape the grease out.",
        isCorrect: false,
        feedback: "Incorrect. Opening grease traps requires training, safety gear, and proper disposal tools."
      },
      {
        text: "Ignore it since they are not the operator.",
        isCorrect: false,
        feedback: "Incorrect. Grease spills pose environmental and hygiene risks and must be escalated."
      }
    ],
    correctExplanation: "Frontline staff should stop the inflow of water/grease if possible, secure the area with signs, and escalate immediately since overflows contaminate sewage lines and create hygiene hazards.",
    incorrectExplanation: "Attempting manual tank cleaning without training, ignoring overflows, or delaying reports creates hygiene risks.",
    practicalTakeaway: "Stop the source of flow, place warnings, and escalate separator issues immediately."
  },
  {
    question: "A laundry machine is emitting a strange smell of hot oil and vibration noises, but the laundry shift is currently behind schedule.",
    options: [
      {
        text: "Run the machine on a shorter cycle to save time.",
        isCorrect: false,
        feedback: "Incorrect. A machine showing signs of mechanical failure should never be run."
      },
      {
        text: "Continue running the machine until the shift is completed to maintain service output.",
        isCorrect: false,
        feedback: "Incorrect. Running failing machines risks complete breakdown, fires, or operator injury."
      },
      {
        text: "Stop the machine safely, isolate power following approved instructions, flag it as out of service, and inform the supervisor and maintenance team.",
        isCorrect: true,
        feedback: "Correct. Safety takes immediate precedence over shift output. Isolate the machine and escalate."
      },
      {
        text: "Apply lubricant to the outside of the drum while it is spinning.",
        isCorrect: false,
        feedback: "Incorrect. Touching moving parts on heavy machinery is extremely dangerous."
      }
    ],
    correctExplanation: "Mechanical failures (smells, extreme vibrations) pose safety risks. The machine must be stopped, isolated, and reported immediately, even if it delays the current shift.",
    incorrectExplanation: "Running the machine, ignoring faults, or attempting dangerous adjustments violates safety and maintenance rules.",
    practicalTakeaway: "Stop and isolate vibrating or smelling machinery immediately; safety always overrides shift schedule."
  },
  {
    question: "A supervisor wants to reduce hot water usage in a food preparation area by lowering the water heater temperature to 35 degrees.",
    options: [
      {
        text: "Support this idea because it saves significant heating energy.",
        isCorrect: false,
        feedback: "Incorrect. Lowering water temperatures in food prep below safe thresholds violates hygiene laws and allows bacterial growth."
      },
      {
        text: "Suggest using cold water exclusively for sanitizing prep tables.",
        isCorrect: false,
        feedback: "Incorrect. Sanitizing requires heat or approved sanitizers at mandated temperatures."
      },
      {
        text: "Explain that food hygiene regulations mandate water temperatures of at least 60 degrees in heaters to prevent bacteria like Legionella, and safety overrides energy savings.",
        isCorrect: true,
        feedback: "Correct. Food safety and health guidelines must never be compromised to achieve energy savings."
      },
      {
        text: "Lower the thermostat secretly to prove it works.",
        isCorrect: false,
        feedback: "Incorrect. Unauthorized adjustment of safety thermostats creates health and compliance hazards."
      }
    ],
    correctExplanation: "Safety, hygiene, and public health regulations must always take precedence over environmental target settings. Lowering water heater temperatures below safe levels is a severe compliance violation.",
    incorrectExplanation: "Supporting temperature reductions, bypassing sanitizer standards, or altering controls secretly endangers public health.",
    practicalTakeaway: "Never compromise sanitizing or hot-water safety temperatures to meet energy reduction goals."
  },
  {
    question: "An employee wants to report a malfunctioning cooling compressor in a retail storeroom. Which report is the most useful?",
    options: [
      {
        text: "A message stating: 'The storeroom is warm, the AC is garbage and needs to be replaced.'",
        isCorrect: false,
        feedback: "Incorrect. This contains opinions and lacks specific, actionable technical details."
      },
      {
        text: "A log entry: 'Storeroom B compressor has cycled constantly for 3 hours, temperature reads 18°C instead of the target 4°C, and there is a whistling sound from the upper coils.'",
        isCorrect: true,
        feedback: "Correct. This details the exact equipment, current versus target temperature, cycle patterns, and physical symptoms."
      },
      {
        text: "An email blaming the night shift for leaving the doors open.",
        isCorrect: false,
        feedback: "Incorrect. Blaming teams without technical details is not useful to maintenance."
      },
      {
        text: "Wait for the unit to break down completely before filing a ticket.",
        isCorrect: false,
        feedback: "Incorrect. Early reporting of abnormal conditions prevents complete failure."
      }
    ],
    correctExplanation: "Maintenance tickets should contain specific, objective, and quantitative evidence (location, symptoms, specific readings, targeting vs. actual conditions) so teams can prepare the right tools.",
    incorrectExplanation: "Vague complaints, personal blame, or waiting for total equipment failure delays repairs and increases waste.",
    practicalTakeaway: "Report equipment faults with specific observations, target values, and physical symptoms."
  },
  {
    question: "A delivery team finds that a new packaging procedure requires placing plastic stretch wrap around every box, even when loading inside locked delivery vans.",
    options: [
      {
        text: "Stop using the stretch wrap immediately without informing the office.",
        isCorrect: false,
        feedback: "Incorrect. Bypassing shipping procedures without approval can lead to damaged stock and customer complaints."
      },
      {
        text: "Follow the current procedure, record the plastic wrap usage and delivery conditions for 5 routes, and submit a suggestion to use reusable strap ties for internal van loads.",
        isCorrect: true,
        feedback: "Correct. Follow current quality standards while gathering data to propose a formal, safe, and zero-waste alternative."
      },
      {
        text: "Complain to the client about the company's wasteful policies.",
        isCorrect: false,
        feedback: "Incorrect. Discussing internal procedural issues with clients hurts company trust."
      },
      {
        text: "Refuse to wrap the packages and let the stock slide around in the van.",
        isCorrect: false,
        feedback: "Incorrect. Ignoring safety/securing guidelines damages inventory."
      }
    ],
    correctExplanation: "Procedures must be followed to ensure delivery quality. If a procedure is wasteful, gather data on consumption, and propose a specific alternative (like reusable straps) through the formal feedback process.",
    incorrectExplanation: "Bypassing wrapping without authority, complaining to clients, or delivering loose stock causes inventory damage.",
    practicalTakeaway: "Follow wrapping procedures to secure stock, while logging waste and proposing reusable alternatives."
  },
  {
    question: "A team runs a trial to reduce printing in a logistics office by switching to digital delivery logs. How should they check the results?",
    options: [
      {
        text: "Confirm that everyone likes using the new tablets.",
        isCorrect: false,
        feedback: "Incorrect. User preference is important but does not prove process safety or actual resource savings."
      },
      {
        text: "Track the number of delivery errors, average loading times, and total paper sheets consumed over a 2-week period compared to the previous month.",
        isCorrect: true,
        feedback: "Correct. Checking error rates, loading speeds, and actual paper reduction provides hard evidence of success."
      },
      {
        text: "Assume the trial worked because a manager signed the approval form.",
        isCorrect: false,
        feedback: "Incorrect. Management approval is a prerequisite for a trial, not a verification of its performance."
      },
      {
        text: "Stop logging deliveries entirely to save time.",
        isCorrect: false,
        feedback: "Incorrect. Eliminating logging records destroys process control and traceability."
      }
    ],
    correctExplanation: "Verifying an operational change requires tracking both the environmental metrics (paper sheets avoided) and the operational metrics (processing times, error rates) to ensure safety and quality are preserved.",
    incorrectExplanation: "Relying on staff opinions, assuming success without data, or removing logs entirely fails to verify the change's safety.",
    practicalTakeaway: "Verify operational changes by measuring both resource reduction and process metrics (speeds, errors)."
  }
];

const NEW_COMMITMENTS = [
  "I will report one recurring operational waste issue using specific evidence.",
  "I will check whether equipment or resources are being used unnecessarily in my work area.",
  "I will raise one procedure that may need clarification.",
  "I will help separate an immediate action from an issue requiring escalation.",
  "I will contribute one practical improvement idea during the next team discussion."
];

export async function ensureSustainabilityForOperationsAndFrontlineTeamsCourse() {
  logger.info(`Checking and executing ${COURSE_TITLE} course content migration...`);

  try {
    const seedRecord = await db.query.systemSeedsTable.findFirst({
      where: eq(systemSeedsTable.name, SEED_NAME)
    });

    if (seedRecord) {
      logger.info(`[Seed] ${SEED_NAME} has already been run. Skipping to preserve subsequent edits.`);
      return;
    }

    await db.transaction(async (tx) => {
      // 1. Resolve foundation prerequisite (Course 12)
      let course12 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-12")
      });
      if (!course12) {
        course12 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "final-sustainability-certification")
        });
      }

      if (!course12) {
        throw new Error("Data integrity error: Course 12 (ELH-12) not found. Foundation prerequisite cannot be established.");
      }

      // 2. (ELH-17 was incorrectly added as a prerequisite in the original seed. Only ELH-12 is required.)

      // 3. Resolve or insert Course 29
      let existingCourse = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-29")
      });
      if (!existingCourse) {
        existingCourse = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, COURSE_SLUG)
        });
      }

      let actualCourseId: number;

      if (!existingCourse) {
        const [inserted] = await tx.insert(coursesTable).values({
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
        }).returning();
        actualCourseId = inserted.id;
      } else {
        actualCourseId = existingCourse.id;
        await tx.update(coursesTable).set({
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
        }).where(eq(coursesTable.id, actualCourseId));
      }

      // 4. Update Course 28 recommendedNextCourseId to point to Course 29 preserving admin edits
      let course28 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-28")
      });
      if (!course28) {
        course28 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "sustainability-for-sales-and-marketing-teams")
        });
      }

      if (course28) {
        let isSystemManaged = false;
        if (course28.recommendedNextCourseId) {
          const currentRecommendedCourse = await tx.query.coursesTable.findFirst({
            where: eq(coursesTable.id, course28.recommendedNextCourseId)
          });
          if (currentRecommendedCourse && (currentRecommendedCourse.courseCode === "ELH-29")) {
            isSystemManaged = true;
          }
        }

        if (course28.recommendedNextCourseId === null || course28.recommendedNextCourseId === actualCourseId || isSystemManaged) {
          await tx.update(coursesTable).set({
            recommendedNextCourseId: actualCourseId
          }).where(eq(coursesTable.id, course28.id));
        } else {
          logger.warn(`Recommendation conflict: Course 28 currently recommends course ID ${course28.recommendedNextCourseId} instead of Course 29 (ID: ${actualCourseId}). Preserving administrator edit.`);
        }
      } else {
        logger.warn("Data integrity note: Course 28 not found during Course 29 recommendation configuration.");
      }

      // Clear Course 25's recommendation pointing to Course 29 (which was Course 26), and update Course 25 to recommend Course 27 (Facilities & Property)
      let course25 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-25")
      });
      if (course25) {
        let course27Ref = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.courseCode, "ELH-27")
        });
        if (course27Ref) {
          if (course25.recommendedNextCourseId === null || course25.recommendedNextCourseId === actualCourseId) {
            await tx.update(coursesTable).set({
              recommendedNextCourseId: course27Ref.id
            }).where(eq(coursesTable.id, course25.id));
          }
        }
      }

      // 5. Ensure Badge Definition exists
      let existingBadge = await tx.query.badgeDefinitionsTable.findFirst({
        where: eq(badgeDefinitionsTable.code, BADGE_CODE)
      });
      if (!existingBadge) {
        existingBadge = await tx.query.badgeDefinitionsTable.findFirst({
          where: eq(badgeDefinitionsTable.slug, BADGE_SLUG)
        });
      }

      if (!existingBadge) {
        // Remove the old slug if it exists but is not associated with this code
        await tx.delete(badgeDefinitionsTable).where(
          and(
            eq(badgeDefinitionsTable.slug, "sustainable-operations-practitioner"),
            eq(badgeDefinitionsTable.criteriaType, "all_courses")
          )
        );

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
        await tx.update(badgeDefinitionsTable).set({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          courseIds: [actualCourseId],
          code: BADGE_CODE,
        }).where(eq(badgeDefinitionsTable.id, existingBadge.id));
      }

      // 6. Ensure only ELH-12 (Final Sustainability Certification) is the prerequisite.
      // ELH-17 was incorrectly added in the original seed — the corrective migration removes it from live data.
      const existingPrereq12 = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course12.id)
        )
      });
      if (!existingPrereq12) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course12.id
        });
      }

      // Remove any prerequisites that are not ELH-12 (including the incorrectly-added ELH-17)
      await tx.delete(coursePrerequisitesTable).where(
        and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          notInArray(coursePrerequisitesTable.prerequisiteCourseId, [course12.id])
        )
      );

      // 7. Seed Lessons safely
      if (NEW_LESSONS.length > 0) {
        for (const lesson of NEW_LESSONS) {
          const [existingLesson] = await tx
            .select()
            .from(lessonsTable)
            .where(
              and(
                eq(lessonsTable.orderIndex, lesson.order),
                eq(lessonsTable.courseId, actualCourseId)
              )
            )
            .limit(1);

          if (!existingLesson) {
            await tx.insert(lessonsTable).values({
              courseId: actualCourseId,
              title: lesson.title,
              orderIndex: lesson.order,
              durationMinutes: lesson.minutes,
              content: lesson.content,
              contentBlocks: lesson.blocks,
            });
          } else {
            await tx.update(lessonsTable).set({
              title: lesson.title,
              durationMinutes: lesson.minutes,
              content: lesson.content,
              contentBlocks: lesson.blocks,
            }).where(eq(lessonsTable.id, existingLesson.id));
          }
        }
      }

      // 8. Seed Quiz Questions safely
      for (const [index, q] of NEW_QUIZ_QUESTIONS.entries()) {
        const correctOptionIndex = q.options.findIndex(o => o.isCorrect);
        if (correctOptionIndex === -1) {
          throw new Error(`Question ${index} is missing a correct option`);
        }

        const [existingQuestion] = await tx
          .select()
          .from(quizQuestionsTable)
          .where(
            and(
              eq(quizQuestionsTable.courseId, actualCourseId),
              eq(quizQuestionsTable.orderIndex, index)
            )
          )
          .limit(1);

        if (!existingQuestion) {
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
        } else {
          await tx.update(quizQuestionsTable).set({
            question: q.question,
            options: q.options.map(o => o.text),
            optionFeedback: q.options.map(o => o.feedback),
            correctOption: correctOptionIndex,
            correctExplanation: q.correctExplanation,
            incorrectExplanation: q.incorrectExplanation,
            practicalTakeaway: q.practicalTakeaway,
          }).where(eq(quizQuestionsTable.id, existingQuestion.id));
        }
      }

      // Remove any extra quiz questions beyond the index 7
      await tx.delete(quizQuestionsTable).where(
        and(
          eq(quizQuestionsTable.courseId, actualCourseId),
          eq(quizQuestionsTable.orderIndex, 8) // Or greater
        )
      );

      // 9. Record system seed completion marker
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
