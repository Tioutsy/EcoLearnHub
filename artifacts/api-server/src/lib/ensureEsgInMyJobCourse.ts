import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
  coursePrerequisitesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_ID = 34;
const COURSE_SLUG = "esg-in-my-job-from-policy-to-everyday-action";
const COURSE_TITLE = "ESG in My Job: From Policy to Everyday Action";
const BADGE_SLUG = "esg-action-practitioner";
const SEED_NAME = "esg-in-my-job-from-policy-to-everyday-action-v1";

const COURSE_META = {
  courseCode: "ELH-34",
  description:
    "Translate ESG policies into practical daily workplace decisions, understand your role-based responsibilities, apply direct actions vs escalation, and build habits that support a responsible organisation.",
  fullDescription:
    "Building directly on ELH-09 (ESG Basics), ELH-31 (Social Responsibility at Work), ELH-32 (Ethics, Governance & Responsible Business), and ELH-33 (ESG Data, Measurement & Reporting Basics), this course serves as the capstone integration point for everyday ESG practice. Discover how Environmental, Social, and Governance considerations appear in ordinary workplace tasks, master the 4-Action Framework (Direct Action, Report/Escalate, Ask for Clarification, Outside My Authority), navigate realistic workplace pressures, and build lasting, role-relevant ESG habits.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "1400.00",
  level: "Intermediate / Applied ESG",
  isFeatured: false,
  thumbnailUrl: "/images/courses/esg-in-my-job.jpg",
  learningObjectives: [
    "Recognise Environmental, Social, and Governance considerations in ordinary daily work.",
    "Identify specific ESG opportunities and responsibilities relevant to your own job role.",
    "Distinguish direct actions within your authority from issues requiring management escalation or clarification.",
    "Make responsible workplace decisions when ESG considerations compete with time, convenience, or cost.",
    "Recognise how small operational choices contribute to company-wide ESG objectives.",
    "Record workplace metrics and information accurately when your role requires it.",
    "Identify when workplace hazards or policy breaches should be raised rather than ignored.",
    "Avoid treating ESG as exclusively an environmental or management-only responsibility.",
    "Distinguish individual employee contributions from organizational leadership governance.",
    "Select at least one practical, realistic ESG commitment applicable to your daily work."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations on completing ESG in My Job: From Policy to Everyday Action! Remember: Environmental = impact on planet, Social = impact on people, Governance = how responsibly the business is run. ESG becomes real when every employee acts within their influence, upholds data accuracy, and speaks up when something needs attention.",
  badgeName: "ESG Action Practitioner",
  badgeDescription:
    "Awarded for demonstrating practical understanding of workplace ESG application, role-based decision-making, and responsible operational habits.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Hook: What Does ESG Have to Do With My Job?",
    minutes: 3,
    content: "Discover how corporate ESG policies connect to everyday workplace choices.",
    blocks: [
      { id: "ej1-h1", type: "heading", position: 1, headingText: "Bringing ESG Down to Earth" },
      { id: "ej1-t1", type: "short_text", position: 2, bodyText: "At a commercial office and resort complex in Ebène, Mauritius, an employee receives a company email announcing a new ESG Policy. The employee thinks: 'ESG is for corporate executives and legal consultants in boardrooms—it has nothing to do with my daily shift.' However, during the very next hour, the employee encounters a leaking tap, a colleague dumping unseparated waste, a request to record unverified numbers, and a safety hazard on a walkway." },
      {
        id: "ej1-k1",
        type: "key_message",
        position: 3,
        headingText: "Where Does My Responsibility Begin & End?",
        bodyText: "• ESG Is Not One Person's Job: Corporate policies set the direction, but ESG is brought to life through everyday employee choices.\n• The Central Question: 'What does responsible business mean in my specific role today?'"
      },
      {
        id: "ej1-t2",
        type: "short_text",
        position: 4,
        bodyText: "Employee vs. Organisational Responsibility:\n• Leadership: Sets company-wide ESG targets, reporting frameworks, compliance programs, and investment budgets.\n• Employee: Acts within their role's influence—saving resources, treating people fairly, recording data accurately, following rules, and reporting hazards."
      },
      {
        id: "ej1-d1",
        type: "decision_scenario",
        position: 5,
        decisionIntro: "First Impression Challenge:",
        decisionPrompt: "A coworker says: 'Frontline staff shouldn't care about ESG because management owns all company policies.' How do you respond?",
        decisionChoices: [
          { label: "Explain that leadership sets policies, but ESG only becomes real when employees take responsible daily actions like saving resources, working safely, and recording data accurately.", correct: true, feedback: "Exactly right! Frontline actions bring corporate ESG policies to life." },
          { label: "Agree that frontline staff should deliberately waste resources to protest corporate policies.", correct: false, feedback: "Incorrect. Wasting resources harms the organization, environment, and workplace safety." },
          { label: "Say that ESG means frontline staff are personally liable for corporate tax filings.", correct: false, feedback: "Incorrect. Corporate legal liabilities belong to organizational leadership." }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "ESG Is Already in Everyday Work",
    minutes: 4,
    content: "Explore role-based ESG contributions across different departments.",
    blocks: [
      { id: "ej2-h1", type: "heading", position: 1, headingText: "Role-Based ESG Contributions" },
      { id: "ej2-t1", type: "short_text", position: 2, bodyText: "Every department touches ESG differently. Understanding your role's unique contribution prevents confusion." },
      {
        id: "ej2-k1",
        type: "key_message",
        position: 3,
        headingText: "Role Contributions Across Departments",
        bodyText: "• Operations & Facilities: Preventing energy/water waste, reporting leaks, sorting waste correctly, maintaining equipment safely.\n• Office & Administration: Responsible purchasing, double-sided printing, protecting confidential files, maintaining accurate logs.\n• Hospitality & Customer-Facing: Resource-conscious service, handling customer data securely, treating guests and staff with respect.\n• Procurement & Purchasing: Following vendor procedures, declaring conflicts of interest, evaluating sustainable criteria.\n• Supervisors & Managers: Supporting safe workloads, listening to employee concerns, ensuring honest recordkeeping."
      },
      {
        id: "ej2-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Workplace Example: Protecting Data Privacy",
        bodyText: "A receptionist notices guest passport files left on a public counter during check-in. Recognizing both Social (data privacy) and Governance (policy compliance) considerations, the receptionist immediately files the documents in a locked drawer."
      }
    ]
  },
  {
    order: 2,
    title: "What Can I Actually Influence?",
    minutes: 4,
    content: "Master the 4-Action Framework: Direct Action, Report/Escalate, Ask, Outside Authority.",
    blocks: [
      { id: "ej3-h1", type: "heading", position: 1, headingText: "The 4-Action Framework: Direct Action vs Escalation" },
      { id: "ej3-t1", type: "short_text", position: 2, bodyText: "Responsible action does not mean taking authority you do not have. Knowing whether to act, ask, or report keeps operations smooth and safe." },
      {
        id: "ej3-k1",
        type: "key_message",
        position: 3,
        headingText: "The 4-Action Framework",
        bodyText: "1. Direct Action: You have authority and ability to fix it immediately (e.g., turning off unused lights/AC in an empty room, picking up a slipping hazard).\n2. Report / Escalate: Issue requires specialized repair, management intervention, or safety escalation (e.g., a major pipe leak, damaged electrical wire).\n3. Ask for Clarification: Procedure or classification is unclear (e.g., asking a supervisor where a new chemical container should be recycled).\n4. Outside My Authority: Strategic decisions belonging to leadership (e.g., choosing corporate carbon accounting software)."
      },
      {
        id: "ej3-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "Studies show that 70% of workplace resource savings and safety improvements originate from frontline employees reporting or taking small direct actions during routine shifts! Everyday vigilance drives organizational success."
      }
    ]
  },
  {
    order: 3,
    title: "When Work Gets Busy",
    minutes: 3,
    content: "Navigate competing operational pressures with proportionate, responsible decisions.",
    blocks: [
      { id: "ej4-h1", type: "heading", position: 1, headingText: "Navigating Competing Operational Pressures" },
      { id: "ej4-t1", type: "short_text", position: 2, bodyText: "Workplace decisions rarely happen in ideal conditions. Employees encounter time pressure, cost constraints, and fatigue." },
      {
        id: "ej4-k1",
        type: "key_message",
        position: 3,
        headingText: "Handling Operational Pressures Responsibly",
        bodyText: "• The Convenience Trap: 'We don't have time to sort waste today.' -> Cutting corners on safety, data accuracy, or ethics to save 2 minutes creates severe long-term risks.\n• Proportionate Action: Responsible behavior does not mean stopping business operations over minor issues; it means choosing the safe, honest, and compliant option within reasonable workflow."
      },
      {
        id: "ej4-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Pressure Challenge:",
        decisionPrompt: "During peak client check-out, a colleague suggests skipping a required safety inspection log for an elevator to save time. What should you do?",
        decisionChoices: [
          { label: "Refuse to skip required safety logs and complete the inspection checklist before operating the equipment.", correct: true, feedback: "Outstanding! Completing safety logs protects human life and complies with governance controls." },
          { label: "Skip the inspection log and pretend the elevator was fully inspected.", correct: false, feedback: "Incorrect. Skipping safety logs exposes people to injury and creates severe legal liability." },
          { label: "Falsify the signature of the safety technician.", correct: false, feedback: "Incorrect. Falsifying signatures is a major compliance and ethical violation." }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "One Shift, Five Decisions: Mauritius Workplace Challenge",
    minutes: 3,
    content: "Apply applied ESG principles across a 5-decision shift scenario in Grand Baie.",
    blocks: [
      { id: "ej5-h1", type: "heading", position: 1, headingText: "Real-Life Application: A Busy Shift in Grand Baie" },
      { id: "ej5-t1", type: "short_text", position: 2, bodyText: "At a hotel resort and commercial complex in Grand Baie, Mauritius, an operational staff member faces five distinct ESG choices during a single busy afternoon shift." },
      {
        id: "ej5-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-esg-in-my-job.png",
        caption: "Grand Baie Operations Review: Evaluating Water Leaks (E), Waste Sorting (E), Safety Hazards (S), Data Logs (G/Data), and Procurement Approvals (G).",
        imageAlt: "Illustration of a Mauritian resort complex showing maintenance areas, waste collection bins, safety walkways, and procurement desks."
      },
      {
        id: "ej5-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Multi-Decision Capstone Challenge:",
        decisionPrompt: "You navigate 5 situations during your shift:\n1. Leaking tap in service kitchen while maintenance is busy.\n2. Colleague about to dump mixed trash into a clean recycling bin to finish quickly.\n3. Wet walkway near guest entrance without a warning sign during peak arrival.\n4. Operational meter reading is missing; colleague suggests copying last month's figure.\n5. Familiar contractor offers to fix a door immediately if you bypass the formal procurement sign-off.\nWhat is the most responsible resolution across all 5 decisions?",
        decisionChoices: [
          { label: "Turn off the tap valve immediately and log a maintenance ticket; stop waste contamination; place a wet floor sign and report to housekeeping; wait for verified meter reading; and follow required procurement sign-off.", correct: true, feedback: "Outstanding! Taking direct action where authorized, enforcing waste & safety procedures, maintaining data accuracy, and respecting controls ensures 100% applied ESG excellence across your shift." },
          { label: "Ignore all issues, copy last month's meter reading, and bypass procurement approvals to finish your shift early.", correct: false, feedback: "Incorrect. Ignoring leaks, contaminating waste, faking data, and skipping approvals damages environmental, social, and governance standards." },
          { label: "Resign from your job immediately and close the resort complex.", correct: false, feedback: "Incorrect. Applied ESG means making practical, responsible choices during routine work." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "My ESG Role & Personal Commitment",
    minutes: 2,
    content: "Reflect on your role contribution and select a practical daily ESG commitment.",
    blocks: [
      { id: "ej6-h1", type: "heading", position: 1, headingText: "Reflection & Personal Commitment" },
      { id: "ej6-t1", type: "short_text", position: 2, bodyText: "Every job has an ESG dimension. Reflect on your workplace contribution and choose a practical habit to strengthen." },
      {
        id: "ej6-k1",
        type: "key_message",
        position: 3,
        headingText: "Role Reflection",
        bodyText: "• Where do you see ESG most often in your work?\n  - Operations & Facilities\n  - Office & Administration\n  - Customer-Facing & Hospitality\n  - Procurement & Purchasing\n  - Supervision & Leadership\n• Bringing It All Together: E (Planet), S (People), G (Governance), Data (Truthful Info)."
      },
      {
        id: "ej6-c1",
        type: "commitment",
        position: 4,
        commitmentInstruction: "Select your daily workplace ESG action commitment (choose at least one):",
        commitmentOptions: [
          { value: "report-resource-waste", label: "Report avoidable energy, water, or material waste promptly", description: "Contribute to environmental responsibility." },
          { value: "follow-waste-and-safety-rules", label: "Follow established waste and safety procedures even during busy shifts", description: "Uphold safety and operational discipline." },
          { value: "record-data-accurately", label: "Record operational figures and metrics accurately without guessing", description: "Support data integrity and corporate trust." },
          { value: "respect-controls-and-escalated-concerns", label: "Respect approval controls and raise concerns through proper channels", description: "Uphold corporate governance and ethical standards." }
        ]
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "How does ESG apply to ordinary workplace roles across an organisation?",
    options: [
      "ESG is exclusively owned by corporate legal teams and board directors",
      "ESG is brought to life through daily employee choices—such as saving resources, working safely, protecting data, and following rules",
      "ESG only applies to employees who work in outdoor forestry",
      "ESG requires every employee to write annual corporate sustainability disclosures"
    ],
    correct: 1,
    correctExplanation: "ESG policies depend on daily frontline employee choices and responsible habits to succeed.",
    incorrectExplanation: "Incorrect. ESG applies to daily employee choices across all departments."
  },
  {
    order: 2,
    question: "An employee notices an unused air conditioner running in an empty conference room, and later discovers a major high-pressure water pipe bursting in the basement. What is the most appropriate combination of actions?",
    options: [
      "Ignore both issues and leave the building immediately",
      "Try to repair the high-pressure water pipe without training, and ignore the air conditioner",
      "Take direct action by turning off the conference room AC, and immediately report the basement water pipe burst to maintenance",
      "Call the company CEO directly to report the air conditioner"
    ],
    correct: 2,
    correctExplanation: "Direct action is appropriate for simple fixes within your authority (AC), while complex hazards require immediate reporting to specialists.",
    incorrectExplanation: "Incorrect. Take direct action where authorized and escalate complex hazards to maintenance."
  },
  {
    order: 3,
    question: "During a busy afternoon shift, a team member is tempted to dump mixed trash into a clean paper recycling bin to save time. What should happen?",
    options: [
      "Follow established waste sorting procedures rather than contaminating the recycling stream for temporary convenience",
      "Dump the trash into the recycling bin because speed is more important than rules",
      "Burn the waste container behind the facility",
      "Hide the trash under an office desk"
    ],
    correct: 0,
    correctExplanation: "Contaminating recycling streams destroys waste reduction efforts; procedures must be followed even during busy shifts.",
    incorrectExplanation: "Incorrect. Always follow established waste sorting procedures."
  },
  {
    order: 4,
    question: "An employee is filling out a weekly safety inspection log, but one machine reading was missed yesterday. A coworker says: 'Just copy last week's reading.' What is the responsible choice?",
    options: [
      "Copy last week's reading and pretend the inspection happened",
      "Invent a random high number to make safety look exceptional",
      "Delete the entire safety log spreadsheet",
      "Record the missing status accurately, perform the inspection now if authorized, or follow the procedure for missing logs"
    ],
    correct: 3,
    correctExplanation: "Falsifying safety logs creates severe compliance risks; records must reflect truthful operational facts.",
    incorrectExplanation: "Incorrect. Falsifying logs violates data integrity and safety rules."
  },
  {
    order: 5,
    question: "A supplier offers to deliver emergency office supplies immediately if an employee bypasses the company's required purchase order sign-off. How should the employee respond?",
    options: [
      "Bypass the purchase order sign-off because urgency overrides all company policies",
      "Follow the required procurement approval process or use an authorized emergency sign-off channel",
      "Pay the supplier with personal cash and hide the receipt",
      "Cancel all office operations permanently"
    ],
    correct: 1,
    correctExplanation: "Internal controls protect the organization against fraud; urgency must be handled through proper approval channels.",
    incorrectExplanation: "Incorrect. Urgency must be handled through proper procurement approval channels."
  }
];

export async function ensureEsgInMyJobCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      let courseId: number;

      const [upserted] = await tx
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
          learningObjectives: COURSE_META.learningObjectives,
          includesCertificate: COURSE_META.includesCertificate,
          passingScore: COURSE_META.passingScore,
          completionMessage: COURSE_META.completionMessage,
          badgeName: COURSE_META.badgeName,
          badgeDescription: COURSE_META.badgeDescription,
          isPublished: true,
          status: "published",
        })
        .onConflictDoUpdate({
          target: coursesTable.slug,
          set: {
            courseCode: COURSE_META.courseCode,
            title: COURSE_TITLE,
            description: COURSE_META.description,
            fullDescription: COURSE_META.fullDescription,
            categoryId: COURSE_META.categoryId,
            durationMinutes: COURSE_META.durationMinutes,
            priceUsd: COURSE_META.priceUsd,
            level: COURSE_META.level,
            thumbnailUrl: COURSE_META.thumbnailUrl,
            learningObjectives: COURSE_META.learningObjectives,
            completionMessage: COURSE_META.completionMessage,
            badgeName: COURSE_META.badgeName,
            badgeDescription: COURSE_META.badgeDescription,
            isPublished: true,
            status: "published",
          },
        })
        .returning({ id: coursesTable.id });

      courseId = upserted.id;

      // 2. Fetch system seed marker
      const [existingSeed] = await tx
        .select()
        .from(systemSeedsTable)
        .where(eq(systemSeedsTable.name, SEED_NAME))
        .limit(1);

      const existingLessons = await tx
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, courseId));

      const existingQuiz = await tx
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, courseId));

      const needsRepair = !existingSeed || existingLessons.length !== 6 || existingQuiz.length !== 5;

      if (!needsRepair) {
        logger.info({ courseId, slug: COURSE_SLUG }, "ESG in My Job course content verified. Skipping repair...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Seeding or repairing ELH-34 course content transactionally...");

      // 3. Resolve ELH-09 as prerequisite
      const [elh09] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-09"))
        .limit(1);

      if (elh09) {
        const [existingPrereq] = await tx
          .select()
          .from(coursePrerequisitesTable)
          .where(
            and(
              eq(coursePrerequisitesTable.courseId, courseId),
              eq(coursePrerequisitesTable.prerequisiteCourseId, elh09.id)
            )
          )
          .limit(1);

        if (!existingPrereq) {
          await tx.insert(coursePrerequisitesTable).values({
            courseId,
            prerequisiteCourseId: elh09.id,
          });
        }
      }

      // Set ELH-33 as next recommended course safely if available
      const [elh33] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-33"))
        .limit(1);

      if (elh33) {
        await tx
          .update(coursesTable)
          .set({ recommendedNextCourseId: elh33.id })
          .where(eq(coursesTable.id, courseId));
      }

      // 4. Seed Lessons
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

      // 5. Seed Quiz Questions
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

      // 6. Seed Badge Definition
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
          orderIndex: 34,
        })
        .onConflictDoUpdate({
          target: badgeDefinitionsTable.slug,
          set: {
            name: COURSE_META.badgeName,
            description: COURSE_META.badgeDescription,
            courseIds: [courseId],
          },
        });

      // 7. Record System Seed Version Idempotently
      await tx
        .insert(systemSeedsTable)
        .values({
          name: SEED_NAME,
          version: 1,
        })
        .onConflictDoUpdate({
          target: systemSeedsTable.name,
          set: { version: 1 },
        });

      logger.info({ courseId, slug: COURSE_SLUG }, "ELH-34 ESG in My Job seeded successfully!");
    });
  } catch (err) {
    logger.error({ err }, "Failed to seed ELH-34 ESG in My Job course");
    throw err;
  }
}
