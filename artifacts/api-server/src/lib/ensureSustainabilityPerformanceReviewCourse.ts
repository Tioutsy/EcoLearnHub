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

const COURSE_SLUG = "reviewing-sustainability-performance-and-corrective-action";
const COURSE_TITLE = "Reviewing Sustainability Performance and Taking Corrective Action";
const BADGE_SLUG = "sustainability-performance-reviewer";
const SEED_NAME = "sustainability-performance-review-v2";

const COURSE_META = {
  courseCode: "ELH-19",
  description:
    "Learn how to evaluate sustainability results against baselines and targets, distinguish absolute from intensity metrics, identify root causes, and decide evidence-backed corrective actions.",
  fullDescription:
    "A positive-looking dashboard does not automatically prove environmental improvement. This course enables managers, sustainability leads, and department representatives to conduct rigorous performance reviews. Learners master comparing actual results against like-for-like baselines, normalizing for occupancy or production changes, investigating root causes without jumping to conclusions, and establishing owned corrective actions.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/reviewing-sustainability-performance-and-corrective-action.jpg",
  intendedRoles: ["employees", "green team members", "department coordinators", "supervisors", "managers", "facilities and operations staff", "HR, procurement and administration teams", "ESG or compliance support staff"],
  learningObjectives: [
    "Verify data suitability and like-for-like comparison boundaries before evaluating results.",
    "Compare actual performance against baselines, targets, and historical trends.",
    "Distinguish absolute consumption (total kWh) from intensity metrics (kWh per guest-night or unit).",
    "Apply the REVIEW operational framework (Review data, Examine comparisons, Verify variances, Investigate causes, Establish decisions, Write record).",
    "Investigate root causes without confusing correlation with causation or declaring victory prematurely."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations! You have completed Reviewing Sustainability Performance and Taking Corrective Action. You can now evaluate results against like-for-like baselines, distinguish intensity metrics from absolute totals, investigate root causes, and document evidence-backed corrective decisions.",
  badgeName: "Sustainability Performance Reviewer",
  badgeDescription:
    "Awarded for demonstrating operational mastery of sustainability performance reviews, like-for-like comparisons, root-cause analysis, and evidence-backed decision making.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "A Positive Dashboard Is Not Automatically Proven Success",
    minutes: 3,
    content: "Understand why green dashboard indicators require contextual analysis, like-for-like comparisons, and data checks before declaring success.",
    blocks: [
      { id: "pr1-h1", type: "heading", position: 1, headingText: "Look Beyond the Surface Dashboard" },
      { id: "pr1-t1", type: "short_text", position: 2, bodyText: "A hotel committee reviews its monthly dashboard: Electricity consumption fell 8%, Water increased 11%, Recycling reached 72%, and 3 energy actions are marked completed. The manager declares: 'Overall environmental performance improved significantly.' However, guest occupancy fell 24% during the month, one main water meter was replaced during week two, and the recycling percentage excludes mixed waste collected from the main restaurant. Without adjusting for lower occupancy and checking boundary exclusions, declaring success is premature and misleading." },
      { id: "pr1-k1", type: "key_message", position: 3, headingText: "Performance Review Rule", bodyText: "Evaluating performance requires comparing actual results against a valid like-for-like baseline, normalizing for operational volume (occupancy, production), and accounting for data limitations." },
      {
        id: "pr1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Evaluating Dashboard Claims:",
        decisionPrompt: "An office electricity bill dropped by 10% in July, but the office was closed for 7 days due to public holidays and renovation. How should the sustainability lead interpret this result?",
        decisionChoices: [
          { label: "Record the result as provisional, note the 7-day closure context, and compare daily operating consumption against prior open months to evaluate true efficiency", correct: true, feedback: "Correct! Accounting for operational closures prevents false claims of efficiency improvements caused simply by reduced operating days." },
          { label: "Declare the energy efficiency project an unqualified success", correct: false, feedback: "Incorrect. Lower consumption due to office closure is a volume drop, not an efficiency achievement." },
          { label: "Delete the July electricity data from the annual record", correct: false, feedback: "Incorrect. Data history must be preserved; context notes explain the variation." }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Why Performance Reviews Matter & Essential Vocabulary",
    minutes: 3,
    content: "Explore the operational value of evidence-based reviews and master 50+ performance review terms.",
    blocks: [
      { id: "pr2-h1", type: "heading", position: 1, headingText: "Operational Decision-Making & Vocabulary" },
      { id: "pr2-t1", type: "short_text", position: 2, bodyText: "Rigorous performance reviews catch operational flaws early, prevent wasted capital on ineffective actions, and ensure management decisions are grounded in verified data." },
      {
        id: "pr2-k1",
        type: "key_message",
        position: 3,
        headingText: "Core Performance Review Vocabulary",
        bodyText: "• Absolute Result: Total resource consumed (e.g. Total 45,000 kWh).\n• Intensity Result: Resource consumed normalized per unit of activity (e.g. 14.2 kWh per occupied guest-night).\n• Favourable/Unfavourable Variance: Difference between planned target and actual measured result.\n• Like-for-Like Comparison: Comparing data across identical reporting durations, site boundaries, and operational contexts.\n• Root Cause vs Symptom: The underlying operational failure vs the visible surface anomaly.\n• Correlation vs Causation: Coincidental alignment of two numbers vs proven cause-and-effect relationship.\n• Activity vs Outcome: Performing a task (e.g. Briefed staff) vs measured environmental result (e.g. Reduced waste contamination)."
      },
      {
        id: "pr2-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Evaluation Criteria & Timing)",
        bodyText: "Performance evaluation should explicitly establish what will be monitored and measured, the methods used, the criteria against which results are evaluated, and when results will be analyzed and reviewed.\n\nManagement-system standards (ISO 14001 Clause 9.1 & ISO 9001 Clause 9.1) mandate that organizations evaluate environmental performance against established baselines and retain documented review records as evidence of decision making."
      }
    ]
  },
  {
    order: 2,
    title: "The REVIEW Operational Framework",
    minutes: 4,
    content: "Master the 6-step REVIEW framework for evidence-backed performance evaluation.",
    blocks: [
      { id: "pr3-h1", type: "heading", position: 1, headingText: "The REVIEW Operational Framework" },
      { id: "pr3-t1", type: "short_text", position: 2, bodyText: "Use the REVIEW framework to evaluate sustainability progress and agree corrective actions:" },
      {
        id: "pr3-k1",
        type: "key_message",
        position: 3,
        headingText: "REVIEW Framework Breakdown",
        bodyText: "• R — Review data quality & boundaries: Verify physical units, billing periods, and site scope.\n• E — Examine actual results against right comparison: Compare vs like-for-like baselines and intensity metrics.\n• V — Verify variances, trends & limitations: Distinguish one-off anomalies from persistent operational trends.\n• I — Investigate causes without jumping to conclusions: Test hypotheses before assigning blame.\n• E — Establish decisions, owners & follow-up actions: Agree specific corrective actions with deadlines.\n• W — Write review record & communicate honestly: Document limitations and report findings without exaggeration."
      },
      {
        id: "pr3-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Practice: Absolute vs Intensity Metrics",
        decisionPrompt: "A hotel's total water consumption rose by 5% in December, but guest nights increased by 25% during the peak holiday season. How should the sustainability manager report performance?",
        decisionChoices: [
          { label: "Report that absolute water rose 5% due to peak occupancy, but water intensity improved from 0.48 m³ to 0.40 m³ per guest-night (a 16.6% intensity improvement)", correct: true, feedback: "Correct! Presenting both absolute totals and normalized intensity metrics provides a complete, honest performance evaluation." },
          { label: "Report only that water consumption improved, omitting the 5% total increase", correct: false, feedback: "Incorrect. Suppressing absolute consumption figures hides environmental impact." },
          { label: "Declare the water conservation campaign a failure because total water increased", correct: false, feedback: "Incorrect. Ignoring the 25% occupancy increase fails to recognize operational efficiency gains." }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Visual Dashboard Inspection & High-Risk Mistakes",
    minutes: 4,
    content: "Inspect a projected performance review dashboard and review critical safeguards.",
    blocks: [
      { id: "pr4-h1", type: "heading", position: 1, headingText: "Visual Performance Review Dashboard Inspection" },
      { id: "pr4-t1", type: "short_text", position: 2, bodyText: "Examine the projected meeting dashboard (`visual-sustainability-performance-review.png`). Observe how red sticky notes highlight data review defects: electricity shown in MUR cost instead of kWh, water compared across unequal billing periods (50 days vs 42 days), recycling percentage missing a denominator, a green 'Target Achieved' badge despite missing fuel data, and an unsupported conclusion banner stating 'Overall Performance Improved' despite a 24% drop in occupancy." },
      {
        id: "pr4-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-sustainability-performance-review.png",
        caption: "Quarterly Sustainability Performance Review Dashboard: Displaying financial cost errors, unequal comparison periods, missing denominators, and premature conclusion claims.",
        imageAlt: "Realistic photograph of a Mauritian commercial workplace meeting room with a projected screen titled Quarterly Sustainability Performance Review Dashboard showing highlighted review defects like electricity in MUR cost, unequal billing periods, missing denominators, and premature conclusions."
      },
      {
        id: "pr4-k1",
        type: "key_message",
        position: 4,
        headingText: "High-Risk Review Mistakes to Avoid",
        bodyText: "• DO NOT cherry-pick favourable metrics while suppressing negative results.\n• DO NOT silently rewrite missed targets after the review period has ended.\n• DO NOT treat reduced financial expenditure (MUR) as proof of reduced physical consumption (kWh).\n• DO NOT claim a completed activity (e.g. Staff trained) is proof of an environmental outcome.\n• DO NOT present internal informal reviews as independent third-party audit assurance."
      }
    ]
  },
  {
    order: 4,
    title: "Worked Mauritian Scenario & Applied Decision",
    minutes: 2,
    content: "Study a resort quarterly review scenario and solve an applied facilities decision.",
    blocks: [
      { id: "pr5-h1", type: "heading", position: 1, headingText: "Worked Scenario: Grand Baie Resort Quarterly Review" },
      {
        id: "pr5-w1",
        type: "workplace_example",
        position: 2,
        headingText: "Balanced Performance Review Log",
        bodyText: "A Grand Baie resort reviews Q2 performance across 4 streams:\n1. Electricity: Absolute down 4%, Intensity down 8% (kWh/guest-night) | Status: On Track | Decision: Continue HVAC setback schedules.\n2. Water: Absolute up 12%, Intensity up 7% | Status: Off Track | Investigation: Main pool balance-tank leak identified | Action: Maintenance Lead to repair valve by 15 July.\n3. Kitchen Food Waste: Down 15% | Status: Target Achieved | Action: Chef team briefing recorded as best practice.\n4. Generator Diesel: Uncollected data gap | Status: At Risk | Escalation: Logistics Lead assigned to retrieve supplier receipts."
      },
      {
        id: "pr5-d1",
        type: "decision_scenario",
        position: 3,
        decisionIntro: "Applied Facilities Decision:",
        decisionPrompt: "A commercial office building reports a 9% reduction in monthly electricity consumption. However, office occupancy fell 18% during the month, and the reporting period was two days shorter due to public holidays. What is the correct performance review decision?",
        decisionChoices: [
          { label: "Record the 9% drop as provisional, calculate daily electricity intensity per occupant, and note that energy efficiency per person actually decreased slightly due to fixed baseline loads", correct: true, feedback: "Outstanding! Normalizing for occupancy and operating days reveals that per-person energy intensity rose, preventing an false claim of efficiency gains." },
          { label: "Publish a news release claiming the energy reduction target was exceeded", correct: false, feedback: "NEVER publish unadjusted volume drops as sustainability efficiency triumphs." },
          { label: "Change the baseline target to match the 9% drop so the chart looks green", correct: false, feedback: "Incorrect. Silently altering baselines to force green indicators violates review integrity." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Review Commitment & Badge",
    minutes: 2,
    content: "Select your daily performance review commitments and complete the course.",
    blocks: [
      { id: "pr6-h1", type: "heading", position: 1, headingText: "Performance Review Commitment" },
      { id: "pr6-t1", type: "short_text", position: 2, bodyText: "Select the performance review practices you pledge to apply in your workplace." },
      {
        id: "pr6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your review commitments (choose at least one):",
        commitmentOptions: [
          { value: "like-for-like-comparisons", label: "Always verify like-for-like comparison boundaries, units, and operating durations before evaluating results", description: "Ensure fair and mathematical comparison." },
          { value: "report-intensity-and-absolute", label: "Report both absolute totals and normalized intensity metrics alongside operational context", description: "Provide complete, balanced performance pictures." },
          { value: "investigate-root-causes", label: "Investigate root causes for unfavourable variances rather than blaming individuals or ignoring gaps", description: "Focus on operational problem solving." },
          { value: "assign-owned-corrective-actions", label: "Assign a single owner, target date, and required evidence to every review decision", description: "Turn review findings into accountable actions." }
        ]
      },
      {
        id: "pr6-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Practical Disclaimer",
        bodyText: "DISCLAIMER: This course provides practical workplace guidance on reviewing sustainability performance. It does not provide independent assurance, environmental accreditation, statutory reporting certification, legal advice, or verification of an organization's environmental claims."
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "Why is declaring 'environmental performance improved' based solely on a lower electricity bill a high-risk review mistake?",
    options: [
      "Because lower electricity bills may simply reflect reduced business occupancy, office closures, or shorter billing cycles rather than improved energy efficiency",
      "Because electricity data is not relevant to sustainability",
      "Because performance reviews are only allowed to inspect water usage",
      "Because lower bills always indicate financial fraud"
    ],
    correct: 0,
    correctExplanation: "Lower consumption can result from reduced business activity or closures; like-for-like intensity analysis is required.",
    incorrectExplanation: "Incorrect. Reduced bills may stem from volume drops or shorter billing periods rather than genuine efficiency."
  },
  {
    order: 2,
    question: "What does the 'E' in the REVIEW operational framework stand for in the second step?",
    options: [
      "Examine actual results against the right comparison (compare vs like-for-like baselines and intensity metrics)",
      "Erase all negative data points from the quarterly slides",
      "Email the raw spreadsheet to external journalists immediately",
      "Expend remaining departmental budget before month-end"
    ],
    correct: 0,
    correctExplanation: "E = Examine actual results against the right comparison, using valid baselines and intensity metrics.",
    incorrectExplanation: "Incorrect. E = Examine actual results against the right comparison."
  },
  {
    order: 3,
    question: "What is the key difference between ABSOLUTE RESULT and INTENSITY RESULT?",
    options: [
      "Absolute result measures total resource consumed (e.g. Total kWh); Intensity result normalizes consumption per activity unit (e.g. kWh per guest-night)",
      "Absolute result measures money spent; Intensity result measures employee happiness",
      "Absolute result is used in summer; Intensity result is used in winter",
      "Absolute result and Intensity result mean the exact same thing"
    ],
    correct: 0,
    correctExplanation: "Absolute metrics track total environmental load; Intensity metrics track operational efficiency per unit.",
    incorrectExplanation: "Incorrect. Absolute = total consumption; Intensity = consumption normalized per unit of activity."
  },
  {
    order: 4,
    question: "In the visual performance review slide (`visual-sustainability-performance-review.png`), why is the conclusion banner 'Overall Performance Improved' invalid?",
    options: [
      "Because it claims overall success despite a 24% drop in hotel occupancy, unequal water comparison periods, and missing fuel data",
      "Because the presentation uses a projector screen instead of paper handouts",
      "Because there are too many people in the meeting room",
      "Because the slide header font is too small"
    ],
    correct: 0,
    correctExplanation: "The banner ignores a 24% occupancy drop, unequal water billing periods, and missing fuel data.",
    incorrectExplanation: "Incorrect. The conclusion ignores major operational context drops, unequal periods, and data gaps."
  },
  {
    order: 5,
    question: "Why must financial currency costs (e.g. MUR spent on energy) NEVER be used as the primary metric for environmental performance?",
    options: [
      "Because utility price tariffs change over time, so money spent does not reflect physical kWh or m³ consumed",
      "Because currency amounts are not understood by facilities staff",
      "Because financial costs are regulated by international court orders",
      "Because money spent is always lower than energy consumed"
    ],
    correct: 0,
    correctExplanation: "Tariff adjustments distort financial trends; physical consumption units (kWh, m³) are required for environmental evaluation.",
    incorrectExplanation: "Incorrect. Tariff changes distort cost trends; physical units must be evaluated."
  },
  {
    order: 6,
    question: "What is the difference between an ACTIVITY (e.g. Training completed) and an OUTCOME (e.g. Reduced waste stream)?",
    options: [
      "An activity is a task executed; an outcome is the measured environmental change resulting from that action",
      "An activity is performed by managers; an outcome is performed by external auditors",
      "Activity and outcome mean the exact same thing in ISO standards",
      "An activity takes 5 minutes; an outcome takes 5 years"
    ],
    correct: 0,
    correctExplanation: "Completing a task is an activity; an outcome requires measured evidence of environmental improvement.",
    incorrectExplanation: "Incorrect. Activity = task executed; Outcome = measured environmental result achieved."
  },
  {
    order: 7,
    question: "Why is silently changing a missed target after a review period ends a high-risk review violation?",
    options: [
      "Because it conceals operational underperformance, destroys target baselines, and prevents genuine root-cause investigation",
      "Because targets can never be adjusted under any circumstances",
      "Because computers automatically lock spreadsheet files after 30 days",
      "Because targets are legally binding corporate contracts"
    ],
    correct: 0,
    correctExplanation: "Revising missed targets silently hides failures; target changes must be formally approved and recorded in change logs.",
    incorrectExplanation: "Incorrect. Silently modifying targets hides underperformance and destroys baseline integrity."
  },
  {
    order: 8,
    question: "How should a sustainability review committee handle an unfavourable variance where water consumption spiked by 30%?",
    options: [
      "Investigate root causes (check sub-meters for pipe leaks, valve faults, or kitchen equipment issues) and assign an owned corrective action",
      "Ignore the spike and hope it decreases next month",
      "Blame the housekeeping department without checking sub-meter data",
      "Delete the water column from the quarterly report"
    ],
    correct: 0,
    correctExplanation: "Unfavourable variances require root-cause evidence investigation and an owned corrective action plan.",
    incorrectExplanation: "Incorrect. Investigate root causes using sub-meters and assign an owned corrective action."
  },
  {
    order: 9,
    question: "How does ELH-19 (Performance Review) connect to ELH-20 (Roles and Accountability)?",
    options: [
      "ELH-19 identifies performance gaps and corrective decisions; ELH-20 defines organizational governance, approval authorities, and escalation paths",
      "ELH-19 replaces governance so organizational roles are no longer needed",
      "ELH-19 is for receptionists; ELH-20 is for external journalists",
      "There is no connection between performance review and accountability"
    ],
    correct: 0,
    correctExplanation: "ELH-19 evaluates results and defines corrective needs; ELH-20 enforces governance and decision approvals.",
    incorrectExplanation: "Incorrect. ELH-19 identifies corrective needs; ELH-20 establishes governance and decision authority."
  },
  {
    order: 10,
    question: "What is the primary takeaway of the REVIEW Operational Framework?",
    options: [
      "Applying REVIEW (Review data, Examine comparisons, Verify variances, Investigate causes, Establish decisions, Write record) ensures evidence-backed decisions",
      "Performance reviews are optional and have no impact on workplace sustainability",
      "Reviews should only celebrate positive results while ignoring gaps",
      "Baselines should be changed whenever actual results miss targets"
    ],
    correct: 0,
    correctExplanation: "The REVIEW framework provides disciplined, evidence-based performance evaluation and accountable follow-through.",
    incorrectExplanation: "Incorrect. REVIEW provides structured discipline for evidence-backed performance evaluation."
  }
];

export async function ensureSustainabilityPerformanceReviewCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 19 by courseCode "ELH-19" or slug
      let course = null;

      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-19"))
        .limit(1);

      if (byCode) {
        course = byCode;
      } else {
        const [bySlug] = await tx
          .select()
          .from(coursesTable)
          .where(eq(coursesTable.slug, COURSE_SLUG))
          .limit(1);
        course = bySlug ?? null;
      }

      if (!course) {
        throw new Error("Course ELH-19 / reviewing-sustainability-performance-and-corrective-action not seeded by catalogue skeletons bootstrap!");
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
      const hasMissingQuiz = existingQuizQuestions.length !== 10;

      const needsRepair = !existingSeed || hasMissingLessons || hasEmptyBlocks || hasMissingQuiz;

      if (!needsRepair) {
        logger.info({ courseId, slug: COURSE_SLUG }, "Sustainability Performance Review course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course ELH-19. Re-seeding course content, lessons, and 10 quiz questions transactionally...");

      // 4. Resolve next recommended course dynamically (ELH-20 or null if not yet seeded)
      const [course20] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.slug, "roles-and-accountability"))
        .limit(1);
      const nextCourseId = course20 ? course20.id : null;

      // 5. Update course record metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-19",
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

      // 7. Seed/re-seed 10 quiz questions
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

      // 8. Enforce prerequisite entries in coursePrerequisitesTable (ELH-12 through ELH-18 -> ELH-19)
      const prereqs = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(inArray(coursesTable.slug, [
          "final-sustainability-certification",
          "sustainability-action-planning",
          "setting-departmental-sustainability-goals",
          "building-workplace-sustainability-team",
          "communicating-sustainability-at-work",
          "tracking-sustainability-actions-and-progress",
          "sustainability-data-collection-and-evidence"
        ]));

      for (const prereq of prereqs) {
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
          icon: "bar-chart-2",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 24,
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

      logger.info({ courseId, slug: COURSE_SLUG }, "Sustainability Performance Review course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Sustainability Performance Review course");
  }
}
