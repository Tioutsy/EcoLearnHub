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
const SEED_NAME = "sustainability-for-facilities-and-property-teams-v2";

const COURSE_META = {
  courseCode: "ELH-27",
  description: "Learn how facilities and property teams manage practical workplace sustainability through inspections, maintenance coordination, operational controls, contractor oversight, evidence capture and escalation.",
  fullDescription: "Learn how facilities and property teams manage practical workplace sustainability through inspections, maintenance coordination, operational controls, contractor oversight, evidence capture and escalation without replacing qualified engineers, electricians, plumbers, legal advisers, or fire-safety professionals.",
  categoryId: 1,
  durationMinutes: 25,
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
    "Explain how building systems, controls, and maintenance routines influence daily resource efficiency.",
    "Distinguish facilities operational coordination from work requiring qualified engineers, plumbers, electricians, or HSE specialists.",
    "Perform structured site inspections, log defect evidence with photographs, and track meter anomalies.",
    "Distinguish temporary emergency controls from verified corrective action that addresses root causes.",
    "Coordinate contractors effectively using clear scope, work orders, service reports, and completion evidence.",
    "Maintain audit-ready maintenance histories and escalate unresolved or high-risk site defects."
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
    title: "Opening Workplace Hook: The Unresolved Leak",
    minutes: 3,
    content: "Examine why closing a maintenance ticket without verified completion evidence leads to recurring water loss and unbudgeted repairs.",
    blocks: [
      {
        id: "c27-l1-b1",
        type: "heading",
        headingText: "Opening Workplace Hook: The Unresolved Water Stain"
      },
      {
        id: "c27-l1-b2",
        type: "short_text",
        bodyText: "A commercial mixed-use property in Mauritius experiences a recurring water stain beneath its main plant room and a 18% surge in monthly water bills.\n\nA plumbing contractor was called out, reported that the issue was 'fixed,' and submitted an invoice. However, an operational inspection reveals:\n• No photograph of the repaired pipe or replaced fitting was attached.\n• No post-repair water meter check was conducted.\n• A plastic bucket remains positioned beneath the leaking pipe.\n• The property manager is asked to sign off the maintenance request as 'Completed.'\n\nThis hook demonstrates that visible contractor attendance is not proof of verified problem resolution."
      },
      {
        id: "c27-l1-b3",
        type: "key_message",
        headingText: "Operational Insight",
        bodyText: "Facilities management adds value by verifying site conditions and completion evidence before closing maintenance records or approving contractor invoices."
      }
    ]
  },
  {
    order: 1,
    title: "Why Facilities & Property Teams Matter",
    minutes: 3,
    content: "Understand why facilities teams are central to resource efficiency, occupant safety, and asset longevity.",
    blocks: [
      {
        id: "c27-l2-b1",
        type: "heading",
        headingText: "Why Facilities Teams Matter for Sustainability"
      },
      {
        id: "c27-l2-b2",
        type: "short_text",
        bodyText: "Facilities and property teams manage physical site operations where energy, water, and waste occur daily:\n• Personal & Role Value: Clear operational routines protect staff safety and streamline daily maintenance workflows.\n• Business Value: Preventive maintenance prevents catastrophic equipment failure, unbudgeted emergency callouts, and property damage.\n• Environmental Value: Rapid leak repairs, optimized HVAC schedules, and waste area controls reduce environmental impact at scale."
      }
    ]
  },
  {
    order: 2,
    title: "Role Boundaries: Facilities Coordination vs Technical Specialists",
    minutes: 3,
    content: "Establish strict functional boundaries between facilities operational coordination and licensed specialist engineering.",
    blocks: [
      {
        id: "c27-l3-b1",
        type: "heading",
        headingText: "Facilities Role Responsibility & Boundary Matrix"
      },
      {
        id: "c27-l3-b2",
        type: "short_text",
        bodyText: "Facilities staff coordinate and inspect; they do not perform unlicensed technical repairs.\n\nBoundary Matrix:\n• Facilities Owns/Coordinates: Inspection schedules, defect logging, temporary authorized controls, contractor access, meter logs, and completion verification.\n• Facilities Supports: Energy/water reduction projects, contractor scope reviews, and maintenance budget preparation.\n• Qualified Specialist Required: High-voltage electrical work, structural assessments, pressure vessel repairs, refrigerant gas handling, and fire alarm certification."
      }
    ]
  },
  {
    order: 3,
    title: "Plain-Language Facilities Vocabulary",
    minutes: 3,
    content: "Master essential operational terms used across building management and property maintenance.",
    blocks: [
      {
        id: "c27-l4-b1",
        type: "heading",
        headingText: "Plain-Language Facilities Vocabulary"
      },
      {
        id: "c27-l4-b2",
        type: "short_text",
        bodyText: "Key Terms Defined:\n• Symptom vs Root Cause: A water stain is a symptom; a corroded pipe joint is the technical root cause.\n• Temporary Control: An authorized interim measure (e.g., isolating a supply valve) to prevent immediate damage.\n• Corrective Action: A permanent repair or modification that eliminates the root cause.\n• Work Order & Service Report: Official documentation detailing requested work, parts replaced, and tests completed by a contractor."
      }
    ]
  },
  {
    order: 4,
    title: "Sourced Fact: ISO 14001 & ISO 55001 Operational Control Standards",
    minutes: 3,
    content: "Examine international asset management and operational control standards requiring retained evidence.",
    blocks: [
      {
        id: "c27-l5-b1",
        type: "heading",
        headingText: "Sourced Fact: Operational Control Standards"
      },
      {
        id: "c27-l5-b2",
        type: "memorable_fact",
        factTitle: "ISO 14001:2015 Clause 8.1 & ISO 55001:2014 Standards",
        bodyText: "ISO 14001:2015 Clause 8.1 (Operational Control) and ISO 55001:2014 (Asset Management) require organizations to establish operational controls for building systems and maintain documented evidence of maintenance actions.\n\nPractical Facilities Implication: Closing a maintenance ticket requires three pieces of evidence: (1) Work order with scope, (2) Vendor service report with replaced parts listed, and (3) Post-maintenance physical inspection verification."
      }
    ]
  },
  {
    order: 5,
    title: "7-Stage Practical Site Operations Framework",
    minutes: 3,
    content: "Apply the 7-stage framework to manage site defects from observation to verified closure.",
    blocks: [
      {
        id: "c27-l6-b1",
        type: "heading",
        headingText: "The 7-Stage Site Operations Framework"
      },
      {
        id: "c27-l6-b2",
        type: "short_text",
        bodyText: "1. Observe Site Condition: Perform routine walks and identify anomalies (leaks, noise, temperature complaints).\n2. Record Facts & Immediate Risks: Log location, date, photos, and safety impact.\n3. Apply Authorized Temporary Controls: Isolate water supply or post warning signage if safe.\n4. Assign Correct Owner/Specialist: Issue work order to qualified internal technician or contractor.\n5. Coordinate & Document Work: Provide site access, monitor safety, and collect service reports.\n6. Verify Completion & Site Condition: Inspect physical repair and check post-repair meter readings.\n7. Monitor Recurrence & Close/Escalate: Recheck after 7 days; close if resolved or escalate if defect recurs."
      }
    ]
  },
  {
    order: 6,
    title: "Mauritius-Relevant Operational Example",
    minutes: 3,
    content: "Review a multi-defect operational situation in a Mauritian commercial property.",
    blocks: [
      {
        id: "c27-l7-b1",
        type: "heading",
        headingText: "Mauritian Site Operations Example"
      },
      {
        id: "c27-l7-b2",
        type: "short_text",
        bodyText: "A Grand Baie resort complex identifies four simultaneous site issues:\n1. Irrigation running during heavy rainfall (Rain sensor faulty).\n2. Car park floodlights remaining on at noon (Timer contactor stuck).\n3. Kitchen waste bins overflowing into common drainage.\n4. Guest room AC units tripping circuit breakers.\n\nOperational Actions:\n• Immediately override lighting timer and clean waste drainage.\n• Issue urgent work orders for electrician (lighting timer) and HVAC technician (breaker trips).\n• Replace irrigation rain sensor and verify automatic shutoff during next rainfall."
      }
    ]
  },
  {
    order: 7,
    title: "Visual Element: Observe-to-Close Maintenance Evidence Flow",
    minutes: 3,
    content: "Interactive visual flow chart mapping maintenance verification from inspection to sign-off.",
    blocks: [
      {
        id: "c27-l8-b1",
        type: "heading",
        headingText: "Visual Interactive: Maintenance Evidence Chain"
      },
      {
        id: "c27-l8-b2",
        type: "image",
        imageUrl: "/images/courses/sustainability-for-facilities-and-property-teams.jpg",
        captionText: "Observe-to-Close Evidence Flow: Inspection -> Work Order -> Contractor Service Report -> Physical Verification -> Ticket Closure."
      },
      {
        id: "c27-l8-b3",
        type: "short_text",
        bodyText: "Verification Decision Rule:\nNever close a maintenance ticket based solely on verbal contractor claims. Require photo proof, replaced parts documentation, and physical inspection sign-off."
      }
    ]
  },
  {
    order: 8,
    title: "18 Practical Workplace Facilities Actions",
    minutes: 3,
    content: "Execute 18 concrete facilities actions to maintain site efficiency and safety.",
    blocks: [
      {
        id: "c27-l9-b1",
        type: "heading",
        headingText: "18 Practical Facilities Control Actions"
      },
      {
        id: "c27-l9-b2",
        type: "short_text",
        bodyText: "1. Perform structured daily site walks.\n2. Record date, location, and photos of all defects.\n3. Log water/electric meters at consistent daily times.\n4. Compare meter readings against occupancy trends.\n5. Avoid declaring technical causes without specialist checks.\n6. Apply only authorized interim temporary controls.\n7. Check contractor qualifications before site access.\n8. Verify contractor scope against purchase orders.\n9. Require written service reports for all repairs.\n10. Document replaced parts and test results.\n11. Inspect physical site cleanliness after contractor work.\n12. Conduct post-repair meter checks 24h later.\n13. Reopen recurring maintenance tickets if defects persist.\n14. Maintain audit-ready asset history logs.\n15. Escalate safety hazards to HSE officer immediately.\n16. Communicate planned utility outages to occupants.\n17. Audit HVAC/lighting timer settings quarterly.\n18. Ensure spill kits and waste areas are compliant."
      }
    ]
  },
  {
    order: 9,
    title: "Applied Scenario Challenge: Port Louis Office & Warehouse Anomaly",
    minutes: 3,
    content: "Solve a multi-step investigation scenario involving sharp utility surges and contractor disputes.",
    blocks: [
      {
        id: "c27-l10-b1",
        type: "heading",
        headingText: "Scenario Challenge: Port Louis Utility Anomaly"
      },
      {
        id: "c27-l10-b2",
        type: "short_text",
        bodyText: "Scenario: A Port Louis office & warehouse experiences a 25% electricity surge. Management wants to blame the HVAC contractor who recently serviced the chillers. However, a facilities investigation reveals:\n• Storeroom B was recently converted to 24/7 server storage with portable heaters running.\n• The HVAC contractor's service report confirms setpoints were set to standard 24°C.\n• An unclear meter photo was logged on Tuesday.\n\nCorrect Action: Report facts objectively to management: (1) HVAC contractor setpoints are verified correct, (2) The 24/7 server storage heaters are the primary surge cause, and (3) Re-take clear meter photos daily."
      }
    ]
  },
  {
    order: 10,
    title: "Learner Commitment & Practical Actions",
    minutes: 3,
    content: "Select one practical workplace facilities commitment to execute this week.",
    blocks: [
      {
        id: "c27-l11-b1",
        type: "heading",
        headingText: "Select Your Practical Facilities Commitment"
      },
      {
        id: "c27-l11-b2",
        type: "short_text",
        bodyText: "Choose one action for your property this week:\n• Audit 3 recently closed maintenance tickets for contractor service report completeness.\n• Conduct a night-time site walk to check exterior lighting timer shutoff accuracy.\n• Establish a daily water meter log sheet for high-consumption building zones.\n• Re-inspect a temporary repair to ensure permanent corrective action is scheduled."
      }
    ]
  },
  {
    order: 11,
    title: "Completion, Badge & Practical Disclaimer",
    minutes: 3,
    content: "Review completion recognition and practical disclaimer guidelines.",
    blocks: [
      {
        id: "c27-l12-b1",
        type: "heading",
        headingText: "Completion & Recognition"
      },
      {
        id: "c27-l12-b2",
        type: "short_text",
        bodyText: "You have completed Sustainability for Facilities and Property Teams. You can now conduct structured site inspections, coordinate contractor work with evidence, enforce preventive maintenance, and maintain audit-ready property records."
      },
      {
        id: "c27-l12-b3",
        type: "callout",
        headingText: "Practical Disclaimer",
        bodyText: "This course provides practical workplace facilities guidance. It does not replace licensed engineering qualifications, statutory safety certifications, legal counsel, or professional trade licenses."
      }
    ]
  }
];

const QUIZ_QUESTIONS = [
  {
    question: "What is the primary boundary of the facilities team's role in workplace sustainability?",
    options: [
      "Facilities staff perform high-voltage electrical rewiring and certify structural engineering safety independently.",
      "Facilities staff conduct routine inspections, log defects, enforce operational controls, and coordinate contractors while referring licensed engineering to qualified specialists.",
      "Facilities staff approve unverified vendor energy claims without inspecting physical site conditions.",
      "Facilities staff ignore water leak stains as long as occupants do not complain."
    ],
    correctOption: 1,
    correctExplanation: "Correct! Facilities staff coordinate site operations and inspect evidence, leaving licensed engineering repairs to qualified specialists.",
    incorrectExplanation: "Review facilities role boundaries: Facilities staff coordinate and inspect while licensed specialists handle engineering repairs.",
    optionFeedback: [
      "Incorrect. High-voltage electrical and structural work requires licensed engineering specialists.",
      "Correct! Facilities staff conduct routine inspections, log defects, enforce operational controls, and coordinate contractors while referring licensed engineering to qualified specialists.",
      "Incorrect. Unverified vendor claims must never bypass physical inspection.",
      "Incorrect. Ignoring leaks allows structural damage and resource waste to compound."
    ],
    orderIndex: 0
  },
  {
    question: "A maintenance contractor reports that a plant room pipe leak was 'repaired', but a bucket remains under the pipe and water is still pooling. What should the facilities coordinator do?",
    options: [
      "Sign off the work order as completed because the contractor attended the site.",
      "Pay the invoice immediately and ask internal staff to clean the bucket.",
      "Withhold completion sign-off, document the pooling water with photographs, and require verified repair evidence before approving payment.",
      "Ban the contractor from entering the property without notifying management."
    ],
    correctOption: 2,
    correctExplanation: "Correct! Work orders must not be closed on verbal claims alone; require physical verification and photo proof before signing off.",
    incorrectExplanation: "Review contractor completion rules: Never close tickets without physical inspection and evidence.",
    optionFeedback: [
      "Incorrect. Attendance is not proof of verified repair completion.",
      "Incorrect. Paying incomplete invoices wastes budget and fails contractor controls.",
      "Correct! Withhold completion sign-off, document the pooling water with photographs, and require verified repair evidence before approving payment.",
      "Incorrect. Contractor disputes require contractual communication, not security bans."
    ],
    orderIndex: 1
  },
  {
    question: "According to ISO 14001:2015 Clause 8.1 and ISO 55001:2014 standards, what three evidence items are required to close a maintenance action?",
    options: [
      "Work order with scope, contractor service report with parts listed, and post-maintenance physical inspection verification.",
      "Verbal contractor promise, invoice total sum, and a coffee receipt.",
      "Marketing brochure, annual budget sheet, and executive email sign-off.",
      "Single photo of the building exterior, tax invoice, and employee attendance sheet."
    ],
    correctOption: 0,
    correctExplanation: "Correct! Audit-ready maintenance closure requires: (1) Work order, (2) Service report listing parts, and (3) Physical inspection sign-off.",
    incorrectExplanation: "Review closure standards: Require work order, service report with parts, and physical inspection.",
    optionFeedback: [
      "Correct! Work order with scope, contractor service report with parts listed, and post-maintenance physical inspection verification.",
      "Incorrect. Verbal promises and coffee receipts are not valid compliance evidence.",
      "Incorrect. Marketing brochures do not verify physical maintenance work.",
      "Incorrect. Building exterior photos do not prove specific pipe or equipment repairs."
    ],
    orderIndex: 2
  },
  {
    question: "What is the key difference between a temporary control and a corrective action in building maintenance?",
    options: [
      "A temporary control is performed by managers; a corrective action is performed by interns.",
      "A temporary control is a permanent structural change; a corrective action is a verbal warning.",
      "There is no difference; both mean closing the maintenance ticket immediately.",
      "A temporary control (e.g., isolating a valve) mitigates immediate risk; a corrective action (e.g., replacing a corroded pipe joint) eliminates the root cause."
    ],
    correctOption: 3,
    correctExplanation: "Correct! Temporary controls contain immediate risk, whereas corrective actions permanently resolve technical root causes.",
    incorrectExplanation: "Review temporary vs corrective controls: Temporary measures mitigate risk; corrective actions eliminate root causes.",
    optionFeedback: [
      "Incorrect. Job titles do not define control classifications.",
      "Incorrect. Temporary controls are interim risk measures, not structural changes.",
      "Incorrect. Temporary controls must remain open until permanent corrective action occurs.",
      "Correct! A temporary control (e.g., isolating a valve) mitigates immediate risk; a corrective action (e.g., replacing a corroded pipe joint) eliminates the root cause."
    ],
    orderIndex: 3
  },
  {
    question: "During a hot summer month, electricity use rises sharply in a commercial building. What should the facilities team do before assuming the central chiller is faulty?",
    options: [
      "Immediately submit a capital request to replace the central chiller plant.",
      "Check operating schedules, tenant occupancy rates, air filter cleanliness, and outdoor temperature records to isolate variables.",
      "Turn off the building ventilation completely during working hours.",
      "Wait until winter to see if electricity consumption drops."
    ],
    correctOption: 1,
    correctExplanation: "Correct! Rule out operational variables (hours, occupancy, weather, filters) before declaring major capital equipment faulty.",
    incorrectExplanation: "Review utility anomaly checks: Verify operating hours, occupancy, filters, and weather before assuming equipment failure.",
    optionFeedback: [
      "Incorrect. Capital replacement without checking filters or operating hours is premature.",
      "Correct! Check operating schedules, tenant occupancy rates, air filter cleanliness, and outdoor temperature records to isolate variables.",
      "Incorrect. Shutting off ventilation in peak summer compromises health and safety.",
      "Incorrect. Passivity allows potential operating defects to waste energy for months."
    ],
    orderIndex: 4
  },
  {
    question: "An employee suggests bypassing an air-handler safety limit switch to keep cooling running continuously overnight. How should facilities respond?",
    options: [
      "Bypass the switch immediately to maximize tenant satisfaction.",
      "Refuse the unauthorized change and explain that equipment safety limit switches must never be bypassed for operational convenience.",
      "Bypass the switch only during weekend shifts when managers are away.",
      "Report the employee to local police for suggesting maintenance changes."
    ],
    correctOption: 1,
    correctExplanation: "Correct! Safety limit switches protect equipment and life safety; they must never be bypassed for convenience or energy targets.",
    incorrectExplanation: "Review safety limits: Equipment safety switches must never be bypassed.",
    optionFeedback: [
      "Incorrect. Bypassing safety switches causes motor burnouts, fires, and safety hazards.",
      "Correct! Refuse the unauthorized change and explain that equipment safety limit switches must never be bypassed for operational convenience.",
      "Incorrect. Bypassing switches on weekends creates unmonitored fire and breakdown risks.",
      "Incorrect. Suggestions should be guided through safety channels, not police reports."
    ],
    orderIndex: 5
  },
  {
    question: "A facilities supervisor notices that a water meter reading entry was missed for two days. What is the correct way to handle the log?",
    options: [
      "Invent average numbers and fill in the blank dates so the sheet looks complete.",
      "Copy the previous week's numbers into the missing slots.",
      "Record the dates as 'Missed Check', note the workflow blocker that caused it, and log the current actual reading.",
      "Throw away the log sheet and start a new one."
    ],
    correctOption: 2,
    correctExplanation: "Correct! Audit integrity requires recording missed checks honestly rather than fabricating or cloning meter data.",
    incorrectExplanation: "Review record integrity: Record missed checks honestly; never fabricate meter readings.",
    optionFeedback: [
      "Incorrect. Fabricating meter entries violates data integrity and obscures leaks.",
      "Incorrect. Copying previous numbers creates false records and hides consumption surges.",
      "Correct! Record the dates as 'Missed Check', note the workflow blocker that caused it, and log the current actual reading.",
      "Incorrect. Destroying log sheets violates audit compliance requirements."
    ],
    orderIndex: 6
  },
  {
    question: "Water consumption drops by 20% after fixing a main valve leak, but building occupancy also fell by 15% during the same month. How should this be reported?",
    options: [
      "Report the 20% water drop while disclosing both the valve repair and the reduced occupancy as contributing factors.",
      "Attribute 100% of the water reduction to the leak repair in executive summaries.",
      "Report that the valve repair failed because occupancy changed.",
      "Omit water consumption metrics from the monthly building performance report."
    ],
    correctOption: 0,
    correctExplanation: "Correct! Report actual consumption reductions transparently while disclosing occupancy or operational variables.",
    incorrectExplanation: "Review honest reporting: Disclose both physical repairs and occupancy changes.",
    optionFeedback: [
      "Correct! Report the 20% water drop while disclosing both the valve repair and the reduced occupancy as contributing factors.",
      "Incorrect. Attributing 100% savings to the valve repair when occupancy dropped is misleading.",
      "Incorrect. Occupancy drops do not mean the valve repair failed.",
      "Incorrect. Omitting metrics deprives management of operational performance data."
    ],
    orderIndex: 7
  }
];

export async function ensureSustainabilityForFacilitiesAndPropertyTeamsCourse(): Promise<void> {
  logger.info(`Checking and executing ${COURSE_TITLE} course content migration (${SEED_NAME})...`);

  try {
    await db.transaction(async (tx) => {
      const [existingSeed] = await tx
        .select()
        .from(systemSeedsTable)
        .where(eq(systemSeedsTable.name, SEED_NAME))
        .limit(1);

      // Resolve or insert Course 27
      const [existingCourse] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, COURSE_META.courseCode))
        .limit(1);

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
            badgeName: COURSE_META.badgeName,
            badgeDescription: COURSE_META.badgeDescription,
            status: "published",
            isPublished: true,
            recommendedNextCourseId: null,
          })
          .returning();
        actualCourseId = inserted.id;
        logger.info(`Inserted new ELH-27 course record (ID: ${actualCourseId}).`);
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
            badgeName: COURSE_META.badgeName,
            badgeDescription: COURSE_META.badgeDescription,
            status: "published",
            isPublished: true,
            updatedAt: new Date(),
          })
          .where(eq(coursesTable.id, actualCourseId));
        logger.info(`Updated existing ELH-27 course record (ID: ${actualCourseId}).`);
      }

      // Ensure Badge Definition exists
      const [existingBadge] = await tx
        .select()
        .from(badgeDefinitionsTable)
        .where(eq(badgeDefinitionsTable.code, BADGE_CODE))
        .limit(1);

      if (existingBadge) {
        await tx
          .update(badgeDefinitionsTable)
          .set({
            slug: BADGE_SLUG,
            name: COURSE_META.badgeName,
            description: COURSE_META.badgeDescription,
            courseIds: [actualCourseId],
          })
          .where(eq(badgeDefinitionsTable.id, existingBadge.id));
      } else {
        await tx
          .insert(badgeDefinitionsTable)
          .values({
            slug: BADGE_SLUG,
            name: COURSE_META.badgeName,
            description: COURSE_META.badgeDescription,
            icon: "award",
            criteriaType: "all_courses",
            threshold: 0,
            courseIds: [actualCourseId],
            orderIndex: 30,
            code: BADGE_CODE,
          })
          .onConflictDoNothing();
      }

      // Update lessons and quizzes transactionally if seed is not yet present or forced
      const existingLessons = await tx
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, actualCourseId));

      if (!existingSeed || existingLessons.length !== NEW_LESSONS.length) {
        if (existingLessons.length === 0) {
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
        } else {
          for (const lesson of NEW_LESSONS) {
            const lExist = existingLessons.find((l) => l.orderIndex === lesson.order);
            if (lExist) {
              await tx
                .update(lessonsTable)
                .set({
                  title: lesson.title,
                  durationMinutes: lesson.minutes,
                  content: lesson.content,
                  contentBlocks: lesson.blocks,
                })
                .where(eq(lessonsTable.id, lExist.id));
            } else {
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
        logger.info(`Seeded ${NEW_LESSONS.length} upgraded lessons for ELH-27.`);

        await tx.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, actualCourseId));
        // Insert 8 scenario quiz questions with balanced option positions
        for (const q of QUIZ_QUESTIONS) {
          await tx.insert(quizQuestionsTable).values({
            courseId: actualCourseId,
            question: q.question,
            options: q.options,
            correctOption: q.correctOption,
            correctExplanation: q.correctExplanation,
            incorrectExplanation: q.incorrectExplanation,
            optionFeedback: q.optionFeedback,
            orderIndex: q.orderIndex,
          });
        }
        logger.info(`Seeded ${QUIZ_QUESTIONS.length} upgraded quiz questions for ELH-27.`);

        // Record system seed completion marker
        if (!existingSeed) {
          await tx.insert(systemSeedsTable).values({
            name: SEED_NAME,
            version: 2,
          });
        } else {
          await tx
            .update(systemSeedsTable)
            .set({ version: 2 })
            .where(eq(systemSeedsTable.name, SEED_NAME));
        }
      }

      // Ensure Prerequisite relationships exist: ELH-12 and ELH-29 linked to ELH-27
      const prereqCodes = ["ELH-12", "ELH-29"];
      const prereqCourses = await tx
        .select()
        .from(coursesTable)
        .where(inArray(coursesTable.courseCode, prereqCodes));

      for (const prereq of prereqCourses) {
        const [existingLink] = await tx
          .select()
          .from(coursePrerequisitesTable)
          .where(
            and(
              eq(coursePrerequisitesTable.courseId, actualCourseId),
              eq(coursePrerequisitesTable.prerequisiteCourseId, prereq.id)
            )
          )
          .limit(1);

        if (!existingLink) {
          await tx.insert(coursePrerequisitesTable).values({
            courseId: actualCourseId,
            prerequisiteCourseId: prereq.id,
          }).onConflictDoNothing();
        }
      }

      // Ensure ELH-25 recommends ELH-27 (or ELH-27 recommends ELH-28/29)
      const [course25] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-25"))
        .limit(1);

      if (course25) {
        await tx
          .update(coursesTable)
          .set({ recommendedNextCourseId: actualCourseId })
          .where(eq(coursesTable.id, course25.id));
      }
    });

    logger.info(`Successfully seeded ${COURSE_TITLE} content.`);
  } catch (error) {
    logger.error({ err: error }, `Failed to seed ${COURSE_TITLE} course content.`);
    throw error;
  }
}
