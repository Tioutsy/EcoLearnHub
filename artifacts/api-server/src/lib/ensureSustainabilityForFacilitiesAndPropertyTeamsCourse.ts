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

const COURSE_SLUG = "sustainability-for-facilities-and-property-teams";
const COURSE_TITLE = "Sustainability for Facilities and Property Teams";
const BADGE_SLUG = "sustainable-facilities-practitioner";
const BADGE_CODE = "COURSE_ELH_27_COMPLETE";
const SEED_NAME = "sustainability-for-facilities-and-property-teams-v1";

const COURSE_META = {
  courseCode: "ELH-27",
  description: "Learn how facilities and property teams can reduce avoidable resource loss, coordinate maintenance and contractors, and keep reliable evidence of building performance.",
  fullDescription: "Learn how facilities and property teams can reduce avoidable resource loss, coordinate maintenance and contractors, and keep reliable evidence of building performance.",
  categoryId: 1,
  durationMinutes: 19,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainability-for-facilities-and-property-teams.jpg",
  intendedRoles: [
    "Facilities officers",
    "Facilities managers",
    "Property managers",
    "Maintenance coordinators",
    "Site supervisors",
    "Building administrators",
    "Hotel engineering support employees",
    "Common-area and estate-management employees",
    "Employees coordinating utilities, equipment or contractors"
  ],
  learningObjectives: [
    "explain how buildings and equipment affect sustainability performance;",
    "identify abnormal resource use and maintenance warning signs;",
    "distinguish observation from technical diagnosis;",
    "use preventive maintenance to reduce avoidable waste and disruption;",
    "coordinate contractors using clear scope and evidence;",
    "assess operational impacts without making unsupported claims;",
    "maintain records that support management review and audit readiness;",
    "escalate safety, technical and investment decisions appropriately."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Sustainability for Facilities and Property Teams. You can now reduce avoidable resource loss, coordinate maintenance and contractors, and keep reliable evidence of building performance.",
  badgeName: "Sustainable Facilities Practitioner",
  badgeDescription: "Awarded for demonstrating practical understanding of how to reduce avoidable resource loss, coordinate maintenance and contractors, and keep reliable evidence of building performance.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Buildings Use Resources Every Day",
    minutes: 3,
    content: "Explain how facilities decisions influence resource use. Learn why high or low utility bills do not automatically prove equipment success or failure.",
    blocks: [
      {
        id: "c27-l1-b1",
        type: "heading",
        headingText: "Buildings Use Resources Every Day"
      },
      {
        id: "c27-l1-b2",
        type: "short_text",
        bodyText: "Building sustainability is affected by equipment conditions, control settings, user behaviors, weather, and occupancy. Facilities teams detect warnings before reports or invoices reveal them. However, a high bill does not prove equipment failure, and a low bill does not prove successful efficiency. Good work combines observations, history, and utility data."
      },
      {
        id: "c27-l1-b3",
        type: "key_message",
        headingText: "Billing vs Reality",
        bodyText: "Utility invoices show overall volume but never isolate specific failures. Perform physical checks and trace schedules before drawing conclusions."
      },
      {
        id: "c27-l1-b4",
        type: "decision_scenario",
        decisionIntro: "An office building's electricity invoice shows a significant consumption increase during a very hot and humid Mauritian summer month.",
        decisionPrompt: "What should the facilities officer do first?",
        decisionChoices: [
          {
            label: "Immediately declare the building's central chiller system inefficient and request a replacement budget.",
            correct: false,
            feedback: "Incorrect. Jump-starting to chiller replacement without checking schedules, occupancy, or filters is premature and costly."
          },
          {
            label: "Check the cooling hours, occupancy rates, filter conditions, and baseline weather data to identify actual contributing variables.",
            correct: true,
            feedback: "Correct. Facilities teams must verify all operating factors before identifying a specific technical cause."
          },
          {
            label: "Advise the company to turn off the air conditioning completely to force energy reductions.",
            correct: false,
            feedback: "Incorrect. Bypassing cooling in a hot environment compromises safety, health, and service continuity."
          },
          {
            label: "Wait for the next billing cycle before taking any action.",
            correct: false,
            feedback: "Incorrect. Passivity during potential anomalies delays defect detection and increases resource waste."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Detect Abnormal Use and Early Warning Signs",
    minutes: 3,
    content: "Identify signs of avoidable resource loss. Determine the appropriate first response without performing unauthorized technical adjustments.",
    blocks: [
      {
        id: "c27-l2-b1",
        type: "heading",
        headingText: "Detect Abnormal Use and Early Warning Signs"
      },
      {
        id: "c27-l2-b2",
        type: "short_text",
        bodyText: "Warning signs include utility surges, pumps cycling frequently, water marks, temperature complaints, and generator failures. The first response is to protect safety, check operating parameters, document details, and arrange authorized inspection. Never dismantle or reprogram technical systems without competency and clearance."
      },
      {
        id: "c27-l2-b3",
        type: "key_message",
        headingText: "Observe, Escalating Safely",
        bodyText: "Detect early symptoms but leave technical repairs to authorized specialists. Bypassing limits or safety devices compromises building safety."
      },
      {
        id: "c27-l2-b4",
        type: "decision_scenario",
        decisionIntro: "A property's main water pump starts cycling much more frequently than its normal operational profile.",
        decisionPrompt: "What is the appropriate first action?",
        decisionChoices: [
          {
            label: "Manually adjust the pump's pressure limit switch to force longer cycles.",
            correct: false,
            feedback: "Incorrect. Modifying pressure switches without calibration can rupture pipes, burn out motors, or void warranties."
          },
          {
            label: "Log the cycle frequency, check water tank levels and check for active pipeline leaks, then notify the maintenance coordinator for inspection.",
            correct: true,
            feedback: "Correct. Documenting observations and requesting technical inspections resolves root causes safely."
          },
          {
            label: "Shut down the water pump permanently to eliminate electricity waste.",
            correct: false,
            feedback: "Incorrect. Cutting water supply disrupts occupancy hygiene and building emergency safety."
          },
          {
            label: "Ignore the cycling since water is still flowing.",
            correct: false,
            feedback: "Incorrect. Ignoring pump cycling leads to premature motor failure and unresolved leaks."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Preventive Maintenance Supports Sustainability",
    minutes: 3,
    content: "Understand how planned maintenance prevents resource waste and premature asset replacement. Review recurring failures instead of isolated visits.",
    blocks: [
      {
        id: "c27-l3-b1",
        type: "heading",
        headingText: "Preventive Maintenance"
      },
      {
        id: "c27-l3-b2",
        type: "short_text",
        bodyText: "Planned maintenance ensures systems run efficiently, extends asset life, and limits emergency repairs. The value of maintenance depends on service quality, the operating environment, and correct follow-up. Keep clear histories to differentiate schedules, repairs, inspections, and projects."
      },
      {
        id: "c27-l3-b3",
        type: "key_message",
        headingText: "Maintenance History",
        bodyText: "Analyzing recurring failure patterns helps facilities identify root issues (e.g. corrosion or wrong parts) rather than treating visits as isolated."
      },
      {
        id: "c27-l3-b4",
        type: "decision_scenario",
        decisionIntro: "A hotel laundry AC unit repeatedly fails and stops cooling. A contractor is called out every few weeks to restore operation temporarily without permanent fix.",
        decisionPrompt: "What is the sustainable facility response?",
        decisionChoices: [
          {
            label: "Continue paying for emergency contractor callouts since they get the cooling back.",
            correct: false,
            feedback: "Incorrect. Repeated emergency callouts mask underlying defects, increase waste, and multiply costs."
          },
          {
            label: "Analyze the unit's service history, log the failure pattern, and coordinate a comprehensive review of root causes or replacement options.",
            correct: true,
            feedback: "Correct. Track the recurring trend to identify permanent mechanical fixes or select efficient upgrades."
          },
          {
            label: "Bypass the AC unit thermal cutout safety switches to keep it running.",
            correct: false,
            feedback: "Incorrect. Bypassing safety switches creates fire risks and violates electrical standards."
          },
          {
            label: "Instruct the kitchen staff to repair the unit themselves.",
            correct: false,
            feedback: "Incorrect. Kitchen staff lack the mechanical qualifications to repair pressurized cooling systems."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Coordinate Contractors Clearly",
    minutes: 3,
    content: "Manage contractors using clear scopes, site safety protocols, and verified completion evidence. Avoid accepting unverified verbal sign-offs.",
    blocks: [
      {
        id: "c27-l4-b1",
        type: "heading",
        headingText: "Coordinate Contractors Clearly"
      },
      {
        id: "c27-l4-b2",
        type: "short_text",
        bodyText: "Contractor management requires clear scopes, safety checklists, and verified evidence. Attendance does not equal quality completion. Request service reports, test results, photos of parts replaced, or equipment readings before signing acceptances. Never sign acceptor forms you cannot verify."
      },
      {
        id: "c27-l4-b3",
        type: "key_message",
        headingText: "Completion Verification",
        bodyText: "A service report with concrete metrics (e.g., pressure levels or flow rates) provides auditable proof of resolution."
      },
      {
        id: "c27-l4-b4",
        type: "decision_scenario",
        decisionIntro: "A contractor attends a development to repair a landscaping irrigation leak. The invoice states 'repair completed,' but the leak reappears next morning.",
        decisionPrompt: "How should the coordinator handle this?",
        decisionChoices: [
          {
            label: "Approve the invoice immediately because the contractor attended.",
            correct: false,
            feedback: "Incorrect. Paying for failed work without verification waste funds and ignores unresolved leaks."
          },
          {
            label: "Hold the invoice, document the leakage recurrence with photos, and request a detailed service report showing scope details before sign-off.",
            correct: true,
            feedback: "Correct. Coordinators must hold acceptance until contractor deliverables are verified with records."
          },
          {
            label: "Have internal staff repair it and pay the contractor invoice anyway.",
            correct: false,
            feedback: "Incorrect. Double-paying for unresolved scope wastes budget and normalizes poor contractor controls."
          },
          {
            label: "Instruct the security team to block the contractor from the property forever.",
            correct: false,
            feedback: "Incorrect. Arbitrary blocking without formal dispute escalation violates contract protocols."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Evaluate Improvements Without Unsupported Claims",
    minutes: 4,
    content: "Assess facility upgrade proposals by checking baseline hours, costs, and warranties. Avoid accepting supplier savings projections at face value.",
    blocks: [
      {
        id: "c27-l5-b1",
        type: "heading",
        headingText: "Evaluate Improvements"
      },
      {
        id: "c27-l5-b2",
        type: "short_text",
        bodyText: "Proposed improvements (e.g. lighting retrofits, irrigation sensors, timers) need clear justification. Check problem context, safety rules, baseline conditions, maintenance needs, and review methods. Supplier claims are projections, not guarantees. Environmental labels alone do not prove suitability."
      },
      {
        id: "c27-l5-b3",
        type: "key_message",
        headingText: "Compare Baselines",
        bodyText: "Always cross-reference supplier claims against actual operating hours, local tariffs, and installation costs to calculate credible paybacks."
      },
      {
        id: "c27-l5-b4",
        type: "decision_scenario",
        decisionIntro: "A lighting vendor claims that replacing exterior floodlights with new fixtures will save 60% of current electricity consumption, but does not provide installation costs, warranties, or the calculation baseline.",
        decisionPrompt: "What should the facilities manager do?",
        decisionChoices: [
          {
            label: "Present the 60% saving claim immediately to the executive board for capital approval.",
            correct: false,
            feedback: "Incorrect. Presenting unverified savings claims without installation cost or warranties is high risk."
          },
          {
            label: "Request the specific baseline, fixture counts, local operating hours, maintenance requirements, and the verification method used.",
            correct: true,
            feedback: "Correct. Gathering the underlying details ensures the business case is realistic and auditable."
          },
          {
            label: "Reject the proposal instantly because it lacks a standard logo.",
            correct: false,
            feedback: "Incorrect. The proposal might have merit; request clarification rather than immediate rejection."
          },
          {
            label: "Purchase the fixtures without checking compatibility with existing brackets.",
            correct: false,
            feedback: "Incorrect. Skipping hardware and wiring compatibility checks leads to project installation delays."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Keep Records and Review Performance",
    minutes: 3,
    content: "Maintain factual facilities logs. Report multi-variable performance changes honestly instead of attributing all reductions to a single repair.",
    blocks: [
      {
        id: "c27-l6-b1",
        type: "heading",
        headingText: "Keep Records and Review"
      },
      {
        id: "c27-l6-b2",
        type: "short_text",
        bodyText: "Useful records include asset registers, utility logs, inspections, and work orders. Never back-date missing checks or omit failures. When reviewing results, be honest about multi-variable impacts. If water usage falls after a repair but occupancy also dropped, report both facts."
      },
      {
        id: "c27-l6-b3",
        type: "key_message",
        headingText: "Honest Records",
        bodyText: "Factual, auditable logs are critical for compliance, budgeting, and identifying structural property issues."
      },
      {
        id: "c27-l6-b4",
        type: "commitment_scenario",
        commitmentPrompt: "Select one facilities routine you can improve in your team:",
        commitmentChoices: [
          "Recording abnormal readings",
          "Tracking recurring faults",
          "Improving contractor completion evidence",
          "Checking equipment schedules",
          "Documenting unresolved maintenance issues",
          "Clarifying responsibility for utility monitoring"
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "During a hot Mauritian summer, a building's electricity invoice surges. What should the facilities officer do first?",
    options: [
      { text: "Recommend chiller replacement immediately.", isCorrect: false, feedback: "Incorrect. Replacing capital chiller plants without checking operational factors is premature." },
      { text: "Log operating hours, occupancy, filter condition, and outdoor weather records before declaring equipment faulty.", isCorrect: true, feedback: "Correct. Establish operational context and rule out variables before assuming chiller failure." },
      { text: "Disable the air conditioning system completely.", isCorrect: false, feedback: "Incorrect. Shutting down HVAC systems in peak heat compromises safety and tenant comfort." },
      { text: "Wait for the next monthly bill before inspecting.", isCorrect: false, feedback: "Incorrect. Delaying inspections allows potential faults and waste to persist." }
    ],
    correctExplanation: "Facilities teams must verify operating parameters, weather, and occupancy variables before declaring equipment faulty.",
    incorrectExplanation: "Premature replacements, cutting essential services, or delayed responses violate basic diagnostic principles.",
    practicalTakeaway: "Rule out variables like weather and occupancy before blaming equipment efficiency."
  },
  {
    question: "A property's domestic water pump starts cycling much more frequently than normal. What is the correct response?",
    options: [
      { text: "Bypass the safety pressure switches.", isCorrect: false, feedback: "Incorrect. Bypassing switches damages system motors and risks pipe ruptures." },
      { text: "Record the frequency, check water levels and leaks, and arrange an authorized technician inspection.", isCorrect: true, feedback: "Correct. Document the pattern and request competent inspection rather than adjusting switches." },
      { text: "Change the limit settings yourself.", isCorrect: false, feedback: "Incorrect. Adjusting technical limit settings without qualifications can cause mechanical failure." },
      { text: "Ignore it since water is still flowing.", isCorrect: false, feedback: "Incorrect. Ignored pump cycling leads to motor burnout and unresolved leaks." }
    ],
    correctExplanation: "Document cycling symptoms and arrange authorized technical inspection rather than altering limit settings.",
    incorrectExplanation: "Bypassing safety switches, unauthorized settings adjustments, or ignoring anomalies compromises system reliability.",
    practicalTakeaway: "Record pump cycling patterns and escalate for technician check; do not self-adjust settings."
  },
  {
    question: "A hotel AC unit keeps breaking down and requires technician callouts every few weeks. How should this be reviewed?",
    options: [
      { text: "Continue emergency callouts indefinitely.", isCorrect: false, feedback: "Incorrect. Treating repeated faults as isolated incidents wastes budget." },
      { text: "Analyze the unit's repair history, identify the recurring fault cause, and plan a permanent fix or replacement.", isCorrect: true, feedback: "Correct. Identify repeating failure root causes to evaluate permanent solutions." },
      { text: "Instruct kitchen staff to perform the repair.", isCorrect: false, feedback: "Incorrect. Complex HVAC repairs require competent technicians, not kitchen staff." },
      { text: "Bypass the unit thermal safety switch.", isCorrect: false, feedback: "Incorrect. Bypassing thermal limits creates fire hazards." }
    ],
    correctExplanation: "Review the maintenance logs and address root failure causes rather than treating recurring repairs as isolated.",
    incorrectExplanation: "Paying for constant emergency calls, bypassing thermal limits, or delegating technical tasks to unqualified staff is unsafe.",
    practicalTakeaway: "Review maintenance histories to resolve recurring faults instead of repeating emergency calls."
  },
  {
    question: "A contractor invoice states 'landscaping irrigation leak repaired,' but water continues pooling. What should the coordinator do?",
    options: [
      { text: "Approve the invoice since the contractor visited.", isCorrect: false, feedback: "Incorrect. Approving unverified or incomplete work wastes budget." },
      { text: "Retain the invoice, document the recurrence with photographs, and request verified repair evidence.", isCorrect: true, feedback: "Correct. Retain invoice and require verified proof of repair before signing off acceptance." },
      { text: "Pay the invoice and have internal staff fix it.", isCorrect: false, feedback: "Incorrect. Double-paying for incomplete scopes ignores contractor controls." },
      { text: "Block the contractor from the site permanently.", isCorrect: false, feedback: "Incorrect. Escalating a dispute requires contract communication, not security lockouts." }
    ],
    correctExplanation: "Hold invoice sign-off, document the recurring defect, and request the service report showing verified resolution.",
    incorrectExplanation: "Signing incomplete invoices, double-paying, or bypassing dispute steps fails to enforce vendor controls.",
    practicalTakeaway: "Require verified service evidence before signing off contractor completion."
  },
  {
    question: "A vendor claims a retrofitted lighting system saves 60% of electricity, but provides no calculation details or costs. What should the manager do?",
    options: [
      { text: "Present the claim immediately for board approval.", isCorrect: false, feedback: "Incorrect. Presenting unverified savings claims without cost parameters is bad practice." },
      { text: "Request the baseline assumptions, fixture counts, local operating hours, and verified result check methods.", isCorrect: true, feedback: "Correct. Obtain baseline, costs, hours, and checks to build a credible proposal." },
      { text: "Reject the proposal instantly.", isCorrect: false, feedback: "Incorrect. Proposals may be viable; request details instead of rejecting immediately." },
      { text: "Order the fittings without checking mounting sizes.", isCorrect: false, feedback: "Incorrect. Ordering without verification leads to installation delays." }
    ],
    correctExplanation: "Verify supplier claims against actual operating hours, counts, local tariffs, and installation costs.",
    incorrectExplanation: "Accepting claims blindly, rejecting without review, or ordering incompatible hardware ignores process controls.",
    practicalTakeaway: "Verify supplier claims by checking baseline hours, costs, and warranties."
  },
  {
    question: "An employee suggests bypassing a controller safety thermostat to reduce boiler operating hours. What is the correct response?",
    options: [
      { text: "Bypass the thermostat to save energy.", isCorrect: false, feedback: "Incorrect. Bypassing safety controls creates explosion and fire hazards." },
      { text: "Refuse the unauthorized change and refer the suggestion for technical and safety review.", isCorrect: true, feedback: "Correct. Sustainability never overrides equipment safety or thermal control limits." },
      { text: "Tell the employee to drop all efficiency ideas.", isCorrect: false, feedback: "Incorrect. Encourage ideas, but guide them through proper safety channels." },
      { text: "Apply the bypass temporarily during night shifts.", isCorrect: false, feedback: "Incorrect. Safety controls must be active at all times to prevent system failures." }
    ],
    correctExplanation: "Safety controls and manufacturer specs must never be bypassed for environmental targets.",
    incorrectExplanation: "Bypassing thermostats, ignoring all ideas, or applying temporary bypasses compromises health and safety.",
    practicalTakeaway: "Never bypass equipment safety devices or limits to reduce resource use."
  },
  {
    question: "A facilities supervisor asks an employee to fill in missing entries on a water meter log for dates the checks were missed. What should the employee do?",
    options: [
      { text: "Fabricate the readings to keep logs compliant.", isCorrect: false, feedback: "Incorrect. Fabricating utility readings violates record compliance rules." },
      { text: "Record the missed inspection dates accurately and escalate the scheduling barrier that caused it.", isCorrect: true, feedback: "Correct. Document the missed entries honestly and report the workflow constraint." },
      { text: "Copy the previous day's data onto the blank logs.", isCorrect: false, feedback: "Incorrect. Cloning logs is falsification and hides building anomalies." },
      { text: "Delete the blank log sheets from the archive.", isCorrect: false, feedback: "Incorrect. Deleting record sheets violates audit compliance requirements." }
    ],
    correctExplanation: "Log blank entries honestly, report the missed checks, and note the scheduling blocker.",
    incorrectExplanation: "Fabrication, data cloning, or destroying compliance sheets violates data integrity.",
    practicalTakeaway: "Record missed inspections accurately. Falsifying logs hides operational failures."
  },
  {
    question: "Water consumption falls by 20% after leak repairs, but building occupancy also decreased by 15%. How should the review be reported?",
    options: [
      { text: "Claim the entire 20% reduction was due to the leak repair.", isCorrect: false, feedback: "Incorrect. Attributing all savings to the repair hides the occupancy drop variable." },
      { text: "Report both the repair and the occupancy drop, stating that the exact contribution of each cannot be isolated.", isCorrect: true, feedback: "Correct. Report both facts honestly without claiming unverified causation." },
      { text: "Omit the occupancy drop from the management report.", isCorrect: false, feedback: "Incorrect. Omitted variables distort future utility budgets and audits." },
      { text: "Declare the leak repair project a failure.", isCorrect: false, feedback: "Incorrect. The repair was successful; only the volume contribution is multi-variable." }
    ],
    correctExplanation: "Report all major variables (repairs and occupancy changes) honestly to ensure utility reviews remain credible.",
    incorrectExplanation: "Claiming full credit, hiding variables, or calling the project a failure ignores objective data analysis.",
    practicalTakeaway: "Report all major variables honestly. Avoid claiming single-cause success."
  }
];

export async function ensureSustainabilityForFacilitiesAndPropertyTeamsCourse() {
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

      // 2. Resolve Course 29
      let course29 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-29")
      });
      if (!course29) {
        course29 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "sustainability-for-operations-teams")
        });
      }

      if (!course29) {
        throw new Error("Data integrity error: Course 29 (ELH-29) not found. Prerequisite cannot be established.");
      }

      // 3. Resolve or insert Course 27
      let existingCourse = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, COURSE_META.courseCode)
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
          recommendedNextCourseId: null,
        }).returning();
        actualCourseId = inserted.id;
      } else {
        actualCourseId = existingCourse.id;
        // Update Course metadata but DO NOT overwrite recommendedNextCourseId to preserve admin choices
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

      // 4. Clear Course 29 (formerly 26) recommendedNextCourseId pointing to Course 27 to avoid cycles
      let course29Ref = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-29")
      });
      if (!course29Ref) {
        course29Ref = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "sustainability-for-operations-teams")
        });
      }

      if (course29Ref && course29Ref.recommendedNextCourseId === actualCourseId) {
        await tx.update(coursesTable).set({
          recommendedNextCourseId: null
        }).where(eq(coursesTable.id, course29Ref.id));
      }

      // 5. Ensure Badge Definition exists
      const existingBadge = await tx.query.badgeDefinitionsTable.findFirst({
        where: eq(badgeDefinitionsTable.slug, BADGE_SLUG)
      });

      if (!existingBadge) {
        await tx.insert(badgeDefinitionsTable).values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "award",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 30,
          code: BADGE_CODE,
        });
      } else {
        await tx.update(badgeDefinitionsTable).set({
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          courseIds: [actualCourseId],
          code: BADGE_CODE,
        }).where(eq(badgeDefinitionsTable.slug, BADGE_SLUG));
      }

      // 6. Ensure Prerequisite relationships exist
      // Prerequisite 1: Course 29
      const existingPrereq29 = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course29.id)
        )
      });
      if (!existingPrereq29) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course29.id
        });
      }

      // Prerequisite 2: Course 12
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

      // 7. Seed Lessons safely (only if no progress or skeleton lessons exist)
      const existingLessons = await tx.query.lessonsTable.findMany({
        where: eq(lessonsTable.courseId, actualCourseId)
      });

      const hasOnlySkeletonLessons =
        existingLessons.length > 0 &&
        existingLessons.every(l => l.content && l.content.includes("[DRAFT SKELETON]"));

      let existingLessonProgress = [];
      if (existingLessons.length > 0) {
        existingLessonProgress = await tx.query.lessonProgressTable.findMany({
          where: inArray(lessonProgressTable.enrollmentId, existingLessons.map(l => l.id))
        });
      }

      if (existingLessonProgress.length === 0 && (existingLessons.length === 0 || hasOnlySkeletonLessons)) {
        if (hasOnlySkeletonLessons) {
          await tx.delete(lessonsTable).where(eq(lessonsTable.courseId, actualCourseId));
        }

        // Insert new lessons in order
        for (const lesson of NEW_LESSONS) {
          const lExist = await tx.query.lessonsTable.findFirst({
            where: and(
              eq(lessonsTable.orderIndex, lesson.order),
              eq(lessonsTable.courseId, actualCourseId)
            )
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

      // 8. Seed Quiz Questions safely
      const existingQuestions = await tx.query.quizQuestionsTable.findMany({
        where: eq(quizQuestionsTable.courseId, actualCourseId)
      });

      const hasOnlySkeletonQuestions =
        existingQuestions.length > 0 &&
        existingQuestions.every(q => q.question && q.question.includes("[DRAFT SKELETON]"));

      const existingAttempts = await tx.query.quizAttemptsTable.findMany({
        where: eq(quizAttemptsTable.courseId, actualCourseId)
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
            )
          });

          if (!qExist) {
            const correctOptionIndex = q.options.findIndex(o => o.isCorrect);
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
      }

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
