import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
  coursePrerequisitesTable,
} from "@workspace/db";
import { eq, and, or } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_ID = 31;
const COURSE_SLUG = "social-responsibility-at-work";
const COURSE_TITLE = "Social Responsibility at Work";
const BADGE_SLUG = "social-responsibility-practitioner";
const SEED_NAME = "social-responsibility-at-work-v1";

const COURSE_META = {
  courseCode: "ELH-31",
  description:
    "Learn how organizational decisions and everyday workplace behaviors affect employees, customers, contractors, and communities, and discover practical ways to support a human-centered, responsible workplace.",
  fullDescription:
    "Building directly on ELH-09 (ESG Basics), this course provides employees across all roles with a practical introduction to the Social (S) pillar of ESG. Explore the impact of business activities on internal and external stakeholders, distinguish company-level policy responsibilities from individual employee behaviors, navigate realistic Mauritius workplace scenarios, and apply practical habits that foster safety, respect, fairness, and trust.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "1400.00",
  level: "Intermediate / Applied ESG",
  isFeatured: false,
  thumbnailUrl: "/images/courses/social-responsibility.jpg",
  learningObjectives: [
    "Explain the Social pillar of ESG in simple workplace language.",
    "Identify internal and external stakeholder groups affected by business operations (employees, customers, contractors, suppliers, communities).",
    "Recognise core workplace Social priorities, including health, safety, fair treatment, inclusion, and wellbeing.",
    "Distinguish company-level responsibilities (policies, systems, oversight) from individual employee responsibilities (respect, safety, data care, honest reporting).",
    "Evaluate workplace decision trade-offs where operational pressure conflicts with safety or human well-being.",
    "Identify safe, appropriate channels for escalating workplace concerns or risks.",
    "Select one practical workplace commitment to support a responsible and respectful workplace environment."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations on completing Social Responsibility at Work! Remember: Environmental = impact on planet, Social = impact on people, Governance = how responsibly the company is run. Social responsibility becomes real in the everyday decisions that affect people.",
  badgeName: "Social Responsibility Practitioner",
  badgeDescription:
    "Awarded for demonstrating practical understanding of workplace social responsibility, human-centric decision-making, and stakeholder care.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Hook: Who Does This Decision Affect?",
    minutes: 3,
    content: "Understand how everyday operational choices affect different groups of people.",
    blocks: [
      { id: "sr1-h1", type: "heading", position: 1, headingText: "Everyday Workplace Decisions Affect People" },
      { id: "sr1-t1", type: "short_text", position: 2, bodyText: "A busy service hub in Ebène, Mauritius receives an urgent weekend client order. To meet the deadline, a supervisor considers cancelling scheduled break shifts and requiring overnight overtime without checking worker fatigue or safety guidelines. At first glance, this seems like a simple scheduling choice to satisfy a client. In reality, it affects employee health, contractor safety, service quality, and company reputation." },
      {
        id: "sr1-k1",
        type: "key_message",
        position: 3,
        headingText: "What Does Social Responsibility Mean?",
        bodyText: "• Social = How a business affects people.\n• Affected Groups:\n  - Employees: Staff health, safety, fair treatment, wellbeing, skill growth.\n  - Customers: Customer safety, accessibility, privacy, honest communication.\n  - Contractors & Supply Chain: Fair treatment, safe site conditions, transparent terms.\n  - Local Communities: Neighborhood safety, noise, traffic, environmental health."
      },
      {
        id: "sr1-t2",
        type: "short_text",
        position: 4,
        bodyText: "Social Responsibility vs. Charity:\nSocial responsibility is NOT about public relations, charity donations, or optional sponsorships. It is about how the company conducts its core business operations every single day."
      },
      {
        id: "sr1-d1",
        type: "decision_scenario",
        position: 5,
        decisionIntro: "First Impression Challenge:",
        decisionPrompt: "A coworker says: 'Social responsibility just means donating money to local sports clubs once a year.' How do you respond?",
        decisionChoices: [
          { label: "Explain that Social responsibility is about how our daily business operations treat people—our employees, customers, contractors, and local neighbors—every day.", correct: true, feedback: "Exactly right! Social responsibility starts in our core daily business operations." },
          { label: "Agree that Social responsibility is purely about annual charity donations.", correct: false, feedback: "Incorrect. Charity donations do not replace responsible daily treatment of employees and customers." },
          { label: "Say that Social responsibility means deleting customer safety logs to save server disk space.", correct: false, feedback: "Incorrect. Destroying safety records violates ethics and governance." }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "People Inside the Organisation: Safety, Fairness & Respect",
    minutes: 4,
    content: "Explore health and safety, fair treatment, inclusion, and employee wellbeing.",
    blocks: [
      { id: "sr2-h1", type: "heading", position: 1, headingText: "Internal People: Our Workplace Workforce" },
      { id: "sr2-t1", type: "short_text", position: 2, bodyText: "The most immediate group affected by any organisation is its workforce. A responsible business ensures every team member can work safely, be treated fairly, and grow professionally." },
      {
        id: "sr2-k1",
        type: "key_message",
        position: 3,
        headingText: "Key Internal Social Priorities",
        bodyText: "• Health & Safety: Wearing PPE, following safety protocols, reporting physical and ergonomic hazards.\n• Fair Treatment & Inclusion: Zero tolerance for harassment, equal opportunity, respectful communication.\n• Working Conditions & Wellbeing: Reasonable work schedules, break times, mental health awareness, manageable workload.\n• Growth & Training: Equal access to skill development, fair performance reviews, clear career pathways.\n• Raising Concerns Safely: Knowing designated channels to report hazards, ethics violations, or unfair treatment without fear."
      },
      {
        id: "sr2-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Workplace Example: Managing Fatigue",
        bodyText: "An operational team lead notices a technician working double shifts to cover for an absent colleague. Recognizing the fatigue hazard, the lead reassigns non-urgent tasks and logs an official shift replacement request rather than pushing the technician to exhaustion."
      }
    ]
  },
  {
    order: 2,
    title: "People Outside the Organisation: Customers, Contractors & Community",
    minutes: 4,
    content: "Understand how company actions touch customers, third-party contractors, and local communities.",
    blocks: [
      { id: "sr3-h1", type: "heading", position: 1, headingText: "External People: Customers, Partners & Neighbors" },
      { id: "sr3-t1", type: "short_text", position: 2, bodyText: "Social responsibility extends beyond full-time employees. Company decisions touch customers, third-party contractors, supply chain workers, and local communities." },
      {
        id: "sr3-k1",
        type: "key_message",
        position: 3,
        headingText: "Key External Social Priorities",
        bodyText: "• Customer Care & Safety: Ensuring products/services are safe, transparently communicated, and physically/digitally accessible.\n• Data Privacy & Confidentiality: Protecting customer personal information and client files from unauthorized access.\n• Contractors & Supply Chain: Treating third-party technicians, security staff, and supplier workers with the same safety standards and respect as internal staff.\n• Local Community Impact: Managing local noise, traffic congestion, waste spills, and respecting local neighborhood well-being."
      },
      {
        id: "sr3-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "According to international business studies, 76% of customers and 82% of job candidates prefer companies with strong, verifiable social responsibility standards! Treating people responsibly drives long-term brand trust and talent retention."
      }
    ]
  },
  {
    order: 3,
    title: "Company Responsibility vs Employee Role",
    minutes: 3,
    content: "Distinguish leadership policy responsibilities from individual employee behaviors.",
    blocks: [
      { id: "sr4-h1", type: "heading", position: 1, headingText: "Systems & Strategy vs. Daily Behaviors" },
      { id: "sr4-t1", type: "short_text", position: 2, bodyText: "To practice Social responsibility effectively, it is essential to distinguish what the company is responsible for from what individual employees contribute." },
      {
        id: "sr4-k1",
        type: "key_message",
        position: 3,
        headingText: "Company Responsibility vs. Employee Contribution",
        bodyText: "• Company / Leadership Responsibility: Creating fair HR policies, establishing safe facilities, providing safety equipment, setting manageable workloads, maintaining formal grievance/reporting channels, and funding training.\n• Employee Contribution: Following safety procedures, treating coworkers with respect, protecting customer privacy, recording work data accurately, and raising concerns through designated reporting channels."
      },
      {
        id: "sr4-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Reporting Challenge:",
        decisionPrompt: "An employee notices that a contractor's safety harness is frayed while working at height. The contractor says: 'Don't worry, I've used this for years.' What should the employee do?",
        decisionChoices: [
          { label: "Stop the work immediately if authorized, report the safety hazard to the site supervisor, and ensure proper equipment is provided before work resumes.", correct: true, feedback: "Outstanding! Escalating safety hazards protects human life and complies with site safety rules." },
          { label: "Ignore it because contractors are employed by a third-party agency.", correct: false, feedback: "Incorrect. Safety hazards on site threaten human life regardless of employment contracts." },
          { label: "Tell the contractor to work faster so they finish before an inspector arrives.", correct: false, feedback: "Incorrect. Rushing dangerous work increases injury risks severe legal liability." }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "ESG in Real Life: Mauritius Workplace Scenario",
    minutes: 3,
    content: "Examine a realistic Mauritius business situation and make human-centered decisions.",
    blocks: [
      { id: "sr5-h1", type: "heading", position: 1, headingText: "Real-Life Application: Resort & Corporate Operations in Grand Baie" },
      { id: "sr5-t1", type: "short_text", position: 2, bodyText: "At a hotel resort and corporate service complex in Grand Baie, Mauritius, the team faces high seasonal demand. During a busy afternoon, three operational choices arise at once." },
      {
        id: "sr5-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-social-responsibility.png",
        caption: "Grand Baie Operations Review: Evaluating Ergonomics (S), Contractor Safety (S), and Data Protection (G/S).",
        imageAlt: "Illustration of a Mauritian resort office showing staff schedules, safety inspection logs, customer data folders, and contractor permits."
      },
      {
        id: "sr5-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Multi-Stakeholder Decision Challenge:",
        decisionPrompt: "The resort manager evaluates 3 high-pressure situations:\nSituation A: A kitchen line cook reports severe wrist pain and asks for ergonomic support during peak dinner service.\nSituation B: A temporary maintenance contractor is asked to clean outdoor glass windows without safety goggles or harness inspection.\nSituation C: A receptionist leaves unencrypted customer passport files open on a public desk counter to handle a check-in queue.\nWhat is the most responsible multi-stakeholder resolution?",
        decisionChoices: [
          { label: "Address all 3 risks: pause the contractor until safety gear is verified, secure customer passport files immediately, and rotate the line cook to lighter prep work while logging an ergonomic review.", correct: true, feedback: "Outstanding! Protecting staff safety, contractor welfare, and customer data privacy preserves operational integrity and respects human dignity." },
          { label: "Ignore all three items until seasonal peak demand ends next month.", correct: false, feedback: "Incorrect. Delaying safety, health, and privacy risks leads to severe injury, data breach liability, and staff burnout." },
          { label: "Fix Situation A only because internal staff are more important than contractors or customers.", correct: false, feedback: "Incorrect. Social responsibility encompasses all people affected by the business—employees, contractors, and customers alike!" }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Role in Social Responsibility & Personal Commitment",
    minutes: 2,
    content: "Discover how individual actions contribute to company goals and commit to a daily workplace habit.",
    blocks: [
      { id: "sr6-h1", type: "heading", position: 1, headingText: "Pledge to Support a Responsible Workplace" },
      { id: "sr6-t1", type: "short_text", position: 2, bodyText: "Every workday brings choices that affect people. Select the practical habits you commit to practice in your daily role." },
      {
        id: "sr6-k1",
        type: "key_message",
        position: 3,
        headingText: "How You Support Social Responsibility Every Day",
        bodyText: "• Listen respectfully when colleagues raise safety or workload concerns.\n• Follow physical safety rules and wear protective equipment.\n• Protect customer personal information and confidential data.\n• Treat third-party contractors and temporary staff fairly.\n• Raise hazards or policy gaps through designated management channels."
      },
      {
        id: "sr6-c1",
        type: "commitment",
        position: 4,
        commitmentInstruction: "Select your daily workplace Social responsibility commitment (choose at least one):",
        commitmentOptions: [
          { value: "prioritize-safety-reporting", label: "Report safety hazards and support physical/mental wellbeing for my team", description: "Contribute to internal workforce health and safety." },
          { value: "treat-all-fairly", label: "Treat all colleagues, contractors, and customers with fairness and respect", description: "Promote workplace inclusion and equal treatment." },
          { value: "protect-data-privacy", label: "Protect customer data and confidential files in daily tasks", description: "Safeguard customer privacy and trust." },
          { value: "raise-concerns-appropriately", label: "Raise workplace concerns or policy gaps through proper channels", description: "Support transparent communication and corporate accountability." }
        ]
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "What does the Social (S) pillar of ESG focus on in plain workplace language?",
    options: [
      "Exclusively managing company tax filing deadlines",
      "Evaluating how an organisation's decisions and daily operations affect people—including employees, customers, contractors, and communities",
      "Designing promotional marketing flyers for corporate social media accounts",
      "Calculating solar panel electrical output for facility rooftops"
    ],
    correct: 1,
    correctExplanation: "The Social pillar evaluates how a business affects people across internal workforce and external stakeholders.",
    incorrectExplanation: "Incorrect. The Social pillar focuses on people affected by the organisation."
  },
  {
    order: 2,
    question: "An employee notices a team member working long overtime hours and showing clear signs of physical exhaustion near machinery. What is the most responsible action?",
    options: [
      "Encourage the team member to drink coffee and continue operating machinery faster",
      "Ignore the situation because overtime is an individual employee choice",
      "Report the fatigue hazard to the supervisor immediately so tasks can be safely reassigned or breaks provided",
      "Tell the team member to leave work without informing management"
    ],
    correct: 2,
    correctExplanation: "Recognizing fatigue hazards and escalating them promptly protects workplace safety and employee health.",
    incorrectExplanation: "Incorrect. Fatigue hazards must be reported immediately to protect safety."
  },
  {
    order: 3,
    question: "How should customer personal information (such as national ID numbers, address records, or payment data) be treated under workplace Social responsibility?",
    options: [
      "Protected securely, kept confidential, and handled strictly in accordance with company data protection procedures",
      "Printed on public flyers and handed out in office reception areas",
      "Saved on unencrypted personal mobile phones",
      "Discarded in open recycling bins without shredding"
    ],
    correct: 0,
    correctExplanation: "Protecting customer privacy and confidential data is a core Social responsibility that builds trust.",
    incorrectExplanation: "Incorrect. Customer data must be protected securely and confidentially."
  },
  {
    order: 4,
    question: "What is the difference between company-level responsibility and individual employee responsibility in Social ESG?",
    options: [
      "Individual employees carry 100% legal liability for structural company policies while management has no role",
      "Company policies only apply on public holidays",
      "There is no difference between corporate leadership and individual employees",
      "The company establishes policies, safe systems, and resources, while employees contribute by following safety rules, treating people respectfully, and reporting hazards"
    ],
    correct: 3,
    correctExplanation: "Leadership sets corporate policies and systems; employees contribute through daily responsible behaviors.",
    incorrectExplanation: "Incorrect. Leadership sets policies, while employees contribute through daily actions."
  },
  {
    order: 5,
    question: "During a peak demand period at a Mauritian commercial facility, a contractor is asked to perform high-voltage electrical repairs without standard safety gear. What should happen?",
    options: [
      "Proceed with electrical repairs to avoid delaying client orders",
      "Pause the work until proper safety gear and permits are verified, protecting human life over short-term speed",
      "Instruct an untrained internal staff member to do the repair instead",
      "Cancel the entire client contract and close the facility permanently"
    ],
    correct: 1,
    correctExplanation: "Responsible workplace decision-making prioritizes human safety over short-term operational speed.",
    incorrectExplanation: "Incorrect. Always prioritize human life and safety over short-term operational speed."
  }
];

export async function ensureSocialResponsibilityAtWorkCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course by courseCode "ELH-31", slug, or title
      let existingCourse = null;

      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-31"))
        .limit(1);

      if (byCode) {
        existingCourse = byCode;
      } else {
        const [bySlug] = await tx
          .select()
          .from(coursesTable)
          .where(eq(coursesTable.slug, COURSE_SLUG))
          .limit(1);
        if (bySlug) {
          existingCourse = bySlug;
        } else {
          const [byTitle] = await tx
            .select()
            .from(coursesTable)
            .where(eq(coursesTable.title, COURSE_TITLE))
            .limit(1);
          if (byTitle) {
            existingCourse = byTitle;
          }
        }
      }

      let courseId: number;

      if (!existingCourse) {
        logger.info("Seeding new ELH-31 Social Responsibility at Work course record...");
        try {
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
              learningObjectives: COURSE_META.learningObjectives,
              includesCertificate: COURSE_META.includesCertificate,
              passingScore: COURSE_META.passingScore,
              completionMessage: COURSE_META.completionMessage,
              badgeName: COURSE_META.badgeName,
              badgeDescription: COURSE_META.badgeDescription,
              isPublished: true,
              status: "published",
            })
            .returning();
          courseId = inserted.id;
        } catch (_err) {
          const [retry] = await tx
            .select()
            .from(coursesTable)
            .where(eq(coursesTable.slug, COURSE_SLUG))
            .limit(1);
          if (retry) {
            courseId = retry.id;
          } else {
            throw _err;
          }
        }
      } else {
        courseId = existingCourse.id;
        await tx
          .update(coursesTable)
          .set({
            courseCode: COURSE_META.courseCode,
            title: COURSE_TITLE,
            slug: COURSE_SLUG,
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
          })
          .where(eq(coursesTable.id, courseId));
      }

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
        logger.info({ courseId, slug: COURSE_SLUG }, "Social Responsibility course content verified. Skipping repair...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Seeding or repairing ELH-31 course content transactionally...");

      // 3. Resolve ELH-09 as prerequisite & next course logic
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

      // Set ELH-30 or ELH-09 as next recommended course safely
      const [elh30] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-30"))
        .limit(1);

      if (elh30) {
        await tx
          .update(coursesTable)
          .set({ recommendedNextCourseId: elh30.id })
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
          orderIndex: 31,
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

      logger.info({ courseId, slug: COURSE_SLUG }, "ELH-31 Social Responsibility at Work seeded successfully!");
    });
  } catch (err) {
    logger.error({ err }, "Failed to seed ELH-31 Social Responsibility course");
    throw err;
  }
}
