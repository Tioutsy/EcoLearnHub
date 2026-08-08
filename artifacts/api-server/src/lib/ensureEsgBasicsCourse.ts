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

const COURSE_ID = 9;
const COURSE_SLUG = "esg-basics";
const COURSE_TITLE = "ESG Basics";
const BADGE_SLUG = "esg-fundamentals";
const SEED_NAME = "esg-basics-v3";

const COURSE_META = {
  description:
    "Master Environmental, Social, and Governance (ESG) basics, understand the E, S, and G pillars with practical workplace examples, and learn how individual actions contribute to organizational goals.",
  fullDescription:
    "Designed specifically for employees with zero prior ESG knowledge, this course provides a clear, practical introduction to Environmental, Social, and Governance (ESG) principles. Learn what each pillar represents, understand how ESG relates to sustainability, explore realistic Mauritius workplace scenarios, and discover how everyday workplace decisions support responsible business practices.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "1400.00",
  level: "ESG and Compliance",
  isFeatured: false,
  thumbnailUrl: "/images/courses/esg-basics.jpg",
  learningObjectives: [
    "Explain what ESG stands for and define Environmental, Social, and Governance in plain workplace language.",
    "Distinguish Environmental (E), Social (S), and Governance (G) pillars using practical, real-world examples.",
    "Understand the relationship between Sustainability (the goal) and ESG (the framework for management and reporting).",
    "Identify how daily employee actions across various roles contribute to corporate ESG objectives.",
    "Recognize that leadership holds ultimate oversight while all employees support ESG through daily decisions.",
    "Select one practical workplace ESG commitment to practice in your daily work routine."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations on completing ESG Basics! Remember the core formula: Environmental = impact on planet, Social = impact on people, Governance = how responsibly the company is run. ESG becomes real through the decisions you and your colleagues make every day.",
  badgeName: "ESG Foundations",
  badgeDescription:
    "Awarded for demonstrating practical workplace ESG awareness, understanding the E, S, G pillars, and supporting responsible corporate practices.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "What is ESG & Why Does It Matter?",
    minutes: 3,
    content: "Understand what ESG stands for, why businesses care about it, and how ESG relates to sustainability.",
    blocks: [
      { id: "esg1-h1", type: "heading", position: 1, headingText: "Welcome to ESG Basics" },
      { id: "esg1-t1", type: "short_text", position: 2, bodyText: "Imagine arriving at work in the morning. Your company switchboard handles client calls, staff prepare reports, facilities manage air conditioning and waste, and HR introduces new team members. Behind every single one of these daily operations lie decisions that affect the environment, people, and how the company is governed. These three areas form ESG." },
      {
        id: "esg1-k1",
        type: "key_message",
        position: 3,
        headingText: "What Does ESG Stand For?",
        bodyText: "• Environmental (E): How a company affects and interacts with the natural planet (energy, water, waste, emissions, resources, biodiversity).\n• Social (S): How a company treats and values people (employee health & safety, fair working conditions, equal treatment, training, customers, communities).\n• Governance (G): How a company is directed, managed, and controlled with ethics, transparency, policies, compliance, and accountability."
      },
      {
        id: "esg1-t2",
        type: "short_text",
        position: 4,
        bodyText: "ESG vs. Sustainability: What is the Difference?\n• Sustainability is the broader goal: creating long-term environmental, social, and economic value responsibly.\n• ESG is the practical framework: the specific categories companies use to measure, manage, and report their environmental, social, and governance performance."
      },
      {
        id: "esg1-d1",
        type: "decision_scenario",
        position: 5,
        decisionIntro: "First Impression Scenario:",
        decisionPrompt: "A colleague says: 'ESG is just another word for tree-planting and recycling.' How should you explain ESG in simple terms?",
        decisionChoices: [
          { label: "Explain that ESG is broader than environmental issues alone—it includes how we treat people (Social) and how responsibly the business is managed (Governance).", correct: true, feedback: "Exactly right! ESG covers Environmental, Social, and Governance factors together." },
          { label: "Agree with your colleague that ESG strictly measures solar panels and recycling bins.", correct: false, feedback: "Incorrect. Environmental sustainability is only one pillar of ESG; Social and Governance are equally essential." },
          { label: "Say that ESG is a complex tax audit that only corporate lawyers need to understand.", correct: false, feedback: "Incorrect. ESG applies to everyday operations across all workplace roles." }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Environmental (E): Impact on the Planet",
    minutes: 4,
    content: "Explore how companies affect the natural world and how employees reduce environmental footprints.",
    blocks: [
      { id: "esg2-h1", type: "heading", position: 1, headingText: "The Environmental Pillar (E)" },
      { id: "esg2-t1", type: "short_text", position: 2, bodyText: "The Environmental pillar evaluates how a business impacts the natural environment and manages natural resources. Environmental factors affect every industry, from tech offices to manufacturing and hospitality." },
      {
        id: "esg2-k1",
        type: "key_message",
        position: 3,
        headingText: "Key Environmental Areas & Workplace Examples",
        bodyText: "• Energy: Switching off equipment, optimizing air conditioning, using LED lighting.\n• Water: Fixing leaks promptly, installing efficient taps, avoiding water waste.\n• Waste & Materials: Sorting recyclables, reducing paper printing, eliminating single-use plastics.\n• Emissions & Transport: Optimizing logistics, encouraging remote meetings or shared transport.\n• Resources & Biodiversity: Protecting local ecosystems, choosing eco-certified paper or supplies."
      },
      {
        id: "esg2-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Office & Operations Example",
        bodyText: "An office manager notices monthly energy bills spiking. By adjusting thermostat settings by 2°C, setting computer displays to auto-sleep, and replacing old fixtures with LEDs, the facility reduces power consumption by 15% without impacting comfort."
      }
    ]
  },
  {
    order: 2,
    title: "Social (S): Impact on People",
    minutes: 4,
    content: "Learn how the Social pillar focuses on employee safety, fair treatment, training, and community care.",
    blocks: [
      { id: "esg3-h1", type: "heading", position: 1, headingText: "The Social Pillar (S)" },
      { id: "esg3-t1", type: "short_text", position: 2, bodyText: "The Social pillar focuses on people—how an organization treats its employees, customers, suppliers, and the broader community. A business cannot thrive long-term if its workforce is unsafe, mistreated, or ignored." },
      {
        id: "esg3-k1",
        type: "key_message",
        position: 3,
        headingText: "Key Social Areas & Workplace Examples",
        bodyText: "• Health & Safety: Wearing required protective equipment, reporting workplace hazards, fire safety drills.\n• Working Conditions & Fair Treatment: Equal opportunity, preventing harassment, fair compensation.\n• Training & Growth: Developing employee skills, onboarding new hires fairly, supporting advancement.\n• Customer Care & Privacy: Protecting personal customer data, communicating transparently.\n• Community Engagement: Supporting local community initiatives, fair local vendor sourcing."
      },
      {
        id: "esg3-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "According to international workplace studies, companies with high employee safety and fair treatment ratings experience 40% lower staff turnover and significantly higher productivity! Social responsibility directly strengthens workforce well-being."
      }
    ]
  },
  {
    order: 3,
    title: "Governance (G): Running Business Responsibly",
    minutes: 4,
    content: "Understand how Governance ensures ethical decision-making, policy adherence, and transparent reporting.",
    blocks: [
      { id: "esg4-h1", type: "heading", position: 1, headingText: "The Governance Pillar (G)" },
      { id: "esg4-t1", type: "short_text", position: 2, bodyText: "Governance covers how a company is directed, managed, and held accountable. It sets the rules, ethics, and oversight that ensure the business acts honestly, complies with policies, and protects stakeholder trust." },
      {
        id: "esg4-k1",
        type: "key_message",
        position: 3,
        headingText: "Key Governance Areas & Workplace Examples",
        bodyText: "• Business Ethics & Honesty: Refusing bribes, reporting improper gifts, avoiding deceptive claims.\n• Policies & Procedures: Following company guidelines, updating safety protocols, respecting compliance rules.\n• Accurate Recordkeeping: Recording work hours, financial logs, and operational reports truthfully.\n• Transparency & Accountability: Clear reporting to leadership, admitting errors or data gaps honestly.\n• Conflicts of Interest: Declaring personal relationships or connections that might influence business decisions."
      },
      {
        id: "esg4-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Governance Decision Scenario:",
        decisionPrompt: "An employee discovers a typo in a log sheet that understates departmental expenses. A coworker suggests ignoring it because 'nobody will notice.' What is the most responsible action?",
        decisionChoices: [
          { label: "Report the error to your supervisor so records remain 100% accurate and transparent.", correct: true, feedback: "Outstanding! Truthful, accurate recordkeeping is a core requirement of Governance." },
          { label: "Ignore the typo so the departmental budget appears under budget.", correct: false, feedback: "Incorrect. Concealing data errors violates governance policies and compromises corporate integrity." },
          { label: "Delete the log sheet entirely so no records remain.", correct: false, feedback: "Incorrect. Destroying operational records is a severe compliance violation." }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "ESG in Real Life: Mauritius Workplace Scenario",
    minutes: 3,
    content: "Examine a realistic Mauritius business situation and classify issues into Environmental, Social, and Governance pillars.",
    blocks: [
      { id: "esg5-h1", type: "heading", position: 1, headingText: "Real-Life Application: Beach Resort & Corporate Office in Mauritius" },
      { id: "esg5-t1", type: "short_text", position: 2, bodyText: "At a commercial company operating in Grand Baie, Mauritius, the operational team conducts a quarterly review. They inspect four real-world situations happening across departments." },
      {
        id: "esg5-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-esg-evidence-review.png",
        caption: "Mauritius Workplace Review: Assessing Energy/Water (E), Health/Safety (S), and Policy Compliance (G).",
        imageAlt: "Illustration of a Mauritian office desk showing energy bills, staff safety logs, policy manuals, and supplier declarations."
      },
      {
        id: "esg5-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Multi-Pillar Classification Challenge:",
        decisionPrompt: "The resort manager reviews 3 ongoing workplace items:\nItem A: Installing solar water heaters and rainwater harvesting on guest villas.\nItem B: Conducting mandatory ergonomics and first-aid safety workshops for kitchen staff.\nItem C: Establishing a transparent whistleblowing policy and fraud reporting hotline.\nHow are these three items classified across ESG?",
        decisionChoices: [
          { label: "Item A = Environmental (E), Item B = Social (S), Item C = Governance (G)", correct: true, feedback: "Spot on! Energy/water = E, health & safety = S, whistleblowing & anti-fraud policy = G. All three pillars work together for total business responsibility." },
          { label: "All three items belong strictly to Environmental (E)", correct: false, feedback: "Incorrect. Safety workshops are Social (S) and anti-fraud policies are Governance (G). ESG is far broader than environmental topics alone!" },
          { label: "Item A = Governance, Item B = Environmental, Item C = Social", correct: false, feedback: "Incorrect. Water/solar heaters impact the natural planet (E), safety workshops protect people (S), and ethics policies govern conduct (G)." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Role in ESG & Personal Commitment",
    minutes: 3,
    content: "Discover how individual actions contribute to company goals and commit to a daily ESG habit.",
    blocks: [
      { id: "esg6-h1", type: "heading", position: 1, headingText: "Employee Role vs. Leadership Oversight" },
      { id: "esg6-t1", type: "short_text", position: 2, bodyText: "A common misconception is that ESG is only the responsibility of senior managers or compliance directors. In reality, leadership sets policies and strategy, while everyday employees bring ESG to life through daily choices." },
      {
        id: "esg6-k1",
        type: "key_message",
        position: 3,
        headingText: "How You Support ESG Every Day",
        bodyText: "• Environmental (E): Turn off unused equipment, report water leaks, minimize waste.\n• Social (S): Wear required safety gear, treat all coworkers fairly, support new team members.\n• Governance (G): Follow company policies, protect confidential data, record information accurately."
      },
      {
        id: "esg6-c1",
        type: "commitment",
        position: 4,
        commitmentInstruction: "Select your daily workplace ESG commitment (choose at least one):",
        commitmentOptions: [
          { value: "practice-3-pillars", label: "Recognize E, S, and G factors in daily work decisions", description: "Remember that ESG includes planet, people, and governance." },
          { value: "conserve-resources", label: "Save energy, water, and reduce waste in my workspace", description: "Contribute to company Environmental objectives." },
          { value: "prioritize-safety-fairness", label: "Follow safety rules and treat colleagues fairly and respectfully", description: "Contribute to company Social objectives." },
          { value: "ensure-policy-accuracy", label: "Follow company policies and record workplace data accurately", description: "Contribute to company Governance objectives." }
        ]
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "What does ESG stand for in plain workplace language?",
    options: [
      "Emergency Safety Group for corporate facilities",
      "Environmental, Social, and Governance",
      "Energy Saving Guarantee for electricity reduction",
      "Executive Strategy Governance for senior management only"
    ],
    correct: 1,
    correctExplanation: "ESG stands for Environmental, Social, and Governance—three key pillars evaluating company responsibility.",
    incorrectExplanation: "Incorrect. ESG stands for Environmental, Social, and Governance."
  },
  {
    order: 2,
    question: "Which action is a practical workplace example of the Environmental (E) pillar?",
    options: [
      "Reporting a leak and turning off unused office air conditioners to conserve energy and water",
      "Attending an annual employee performance review meeting",
      "Writing a company policy manual for new hires",
      "Checking financial invoice totals for accounting accuracy"
    ],
    correct: 0,
    correctExplanation: "Energy conservation and water leak reporting directly reduce natural resource waste under the Environmental pillar.",
    incorrectExplanation: "Incorrect. Conserving energy and water falls under the Environmental pillar."
  },
  {
    order: 3,
    question: "Which workplace situation represents a Social (S) pillar issue?",
    options: [
      "Installing solar panels on the warehouse roof",
      "Filing monthly tax documents with local revenue authorities",
      "Providing staff health and safety training and ensuring equal, fair treatment for all employees",
      "Purchasing recycled printer paper for office copiers"
    ],
    correct: 2,
    correctExplanation: "Employee health, workplace safety, training, and equal treatment are core Social (S) pillar responsibilities.",
    incorrectExplanation: "Incorrect. Employee safety, fair treatment, and training represent Social pillar issues."
  },
  {
    order: 4,
    question: "How does an employee contribute to the Governance (G) pillar in daily work?",
    options: [
      "By growing indoor plants on office window sills",
      "By organizing office social gatherings and birthday celebrations",
      "By installing water meters in staff restrooms",
      "By following company policies, protecting confidential data, and recording work information accurately"
    ],
    correct: 3,
    correctExplanation: "Governance relies on accurate recordkeeping, ethical conduct, data protection, and adherence to policies.",
    incorrectExplanation: "Incorrect. Following policies, protecting confidential data, and accurate recordkeeping support Governance."
  },
  {
    order: 5,
    question: "What is the relationship between individual employee actions and corporate ESG strategy?",
    options: [
      "Employees carry full legal liability for corporate ESG strategy while leadership does nothing",
      "Leadership sets policies and governance, while employees contribute to ESG through everyday workplace decisions",
      "Individual employee choices have zero connection to corporate ESG goals",
      "ESG only matters to external legal auditors and has no impact on workplace behavior"
    ],
    correct: 1,
    correctExplanation: "Leadership sets corporate strategy and policies, while employees put ESG into practice through daily actions.",
    incorrectExplanation: "Incorrect. Leadership sets policies, while employees contribute through daily actions."
  }
];

export async function ensureEsgBasicsCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 9 by courseCode "ELH-09", slug, or ID
      let course = null;
      
      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-09"))
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
        throw new Error("Course ELH-09 / esg-basics not seeded by catalogue skeletons bootstrap!");
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
      const hasMissingQuiz = existingQuizQuestions.length !== 5;
      const hasIncorrectSlug = course.slug !== COURSE_SLUG;

      const needsRepair = !existingSeed ||
                          hasMissingLessons ||
                          hasEmptyBlocks ||
                          hasMissingQuiz ||
                          hasIncorrectSlug;

      if (!needsRepair) {
        logger.info({ courseId, slug: COURSE_SLUG }, "ESG Basics course content and v3 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v3 seed detected for Course ELH-09. Re-seeding course content and lessons transactionally...");

      // 4. Resolve next recommended course dynamically by slug
      const [nextCourse] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.slug, "environmental-compliance-mauritius"))
        .limit(1);
      const nextCourseId = nextCourse?.id ?? null;

      // 5. Update course record slug, title, and metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-09",
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

      // 7. Seed/re-seed quiz questions
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

      // 8. Idempotently seed/update badge definition
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
          orderIndex: 14,
        })
        .onConflictDoUpdate({
          target: badgeDefinitionsTable.slug,
          set: {
            name: COURSE_META.badgeName,
            description: COURSE_META.badgeDescription,
            courseIds: [courseId],
          },
        });

      // 9. Save seed marker version idempotently
      await tx
        .insert(systemSeedsTable)
        .values({
          name: SEED_NAME,
          version: 3,
        })
        .onConflictDoUpdate({
          target: systemSeedsTable.name,
          set: { version: 3 },
        });

      logger.info({ courseId, slug: COURSE_SLUG }, "ESG Basics course v3 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of ESG Basics course");
  }
}

