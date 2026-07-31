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

const COURSE_SLUG = "communicating-sustainability-at-work";
const COURSE_TITLE = "Communicating Sustainability at Work";
const BADGE_SLUG = "sustainability-communicator";
const SEED_NAME = "communicating-sustainability-at-work-v2";

const COURSE_META = {
  courseCode: "ELH-16",
  description:
    "Learn how to communicate workplace sustainability actions clearly, accurately, and credibly without exaggeration, unsupported environmental claims, or misleading omissions.",
  fullDescription:
    "Credible workplace sustainability communication depends on evidence, context, and proper authorization. This course teaches employees, managers, and committee representatives how to construct and review internal and external sustainability messages. Learners will master the CLEAR framework (Confirm purpose, Link to evidence, Explain context, Approve through channels, Record and review), distinguish facts from targets and aspirations, avoid high-risk greenwashing traps, and communicate progress and limitations transparently.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/communicating-sustainability-at-work.jpg",
  intendedRoles: ["employees", "managers", "HR teams", "internal communications teams", "sustainability representatives", "department coordinators"],
  learningObjectives: [
    "Identify the audience, purpose, and channel of a workplace sustainability message.",
    "Distinguish verified facts, future targets, binding commitments, and general aspirations.",
    "Apply the CLEAR framework (Confirm purpose, Link to evidence, Explain context, Approve through channels, Record & review).",
    "Avoid high-risk greenwashing terms ('eco-friendly', 'zero waste', 'carbon neutral') without evidence.",
    "Report progress, limitations, and operational setbacks transparently."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations! You have passed Communicating Sustainability at Work. You can now verify evidence sources, distinguish facts from targets, apply the CLEAR communication framework, and maintain credible workplace transparency.",
  badgeName: "Credible Sustainability Communicator",
  badgeDescription:
    "Awarded for demonstrating practical understanding of credible workplace sustainability communication, evidence verification, and message review using the CLEAR framework.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Good Intentions vs Credible Statements",
    minutes: 3,
    content: "Understand why well-meaning announcements fail or risk greenwashing without evidence.",
    blocks: [
      { id: "sc1-h1", type: "heading", position: 1, headingText: "Good Intentions Require Evidence" },
      { id: "sc1-t1", type: "short_text", position: 2, bodyText: "A company prepares an internal announcement: 'Our office is completely sustainable and has eliminated waste!' However, labeled sorting bins were only installed two weeks ago, contamination rates remain high, and no waste weights have been measured. While the enthusiasm is genuine, releasing unverified claims damages management credibility and creates employee skepticism." },
      { id: "sc1-k1", type: "key_message", position: 3, headingText: "Core Credibility Principle", bodyText: "Positive language is not the same as accurate language. Credible communication presents verified facts, clear boundaries, and honest progress limitations." },
      {
        id: "sc1-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Evaluating Announcement Credibility:",
        decisionPrompt: "What should happen before releasing an internal sustainability announcement?",
        decisionChoices: [
          { label: "Verify baseline data, confirm specific operational scope, state evidence sources, and secure management approval", correct: true, feedback: "Correct! Verifying data and stating boundaries ensures message accuracy and employee trust." },
          { label: "Publish absolute claims immediately to inspire staff enthusiasm", correct: false, feedback: "Incorrect. Exaggerated claims destroy trust when employees notice operational contradictions." },
          { label: "Copy promotional slogans from supplier marketing flyers", correct: false, feedback: "Incorrect. Supplier marketing claims must be verified against actual workplace operations." }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Why Credible Communication Matters & Core Vocabulary",
    minutes: 3,
    content: "Explore the business benefits of credible communication and master plain-language terms.",
    blocks: [
      { id: "sc2-h1", type: "heading", position: 1, headingText: "Workplace Credibility & Vocabulary" },
      { id: "sc2-t1", type: "short_text", position: 2, bodyText: "Credible communication protects employee trust, client confidence, and tender submissions. Unverified claims expose organizations to greenwashing accusations and reputational damage." },
      {
        id: "sc2-k1",
        type: "key_message",
        position: 3,
        headingText: "Communication Vocabulary",
        bodyText: "• Sustainability Claim: Any statement asserting an environmental or social outcome.\n• Evidence Source: The verified data document supporting a claim (e.g. utility bills, audit receipts).\n• Fact: A measured, past result verified by data (e.g. 'We reduced diesel draw by 12% in Q3').\n• Target: A specific, future measurable objective (e.g. 'We aim to reduce paper draw by 15% next year').\n• Aspiration: A general directional ambition (e.g. 'We strive to become a low-impact business').\n• Greenwashing: Presenting misleading, exaggerated, or unsupported environmental claims.\n• Misleading Omission: Leaving out critical negative context or limitations to make performance look better."
      },
      {
        id: "sc2-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Did You Know? (Worth Knowing)",
        bodyText: "According to ISO 14021 / ISO 14063 Environmental Communication Guidance and the UN Global Compact, over 40% of environmental claims in commercial workplaces lack verifiable evidence or omit critical operational context, making evidence-linking the single most vital step in workplace communication!"
      }
    ]
  },
  {
    order: 2,
    title: "The CLEAR Communication Framework",
    minutes: 4,
    content: "Master the 5-step CLEAR framework: Confirm, Link, Explain, Approve, Record.",
    blocks: [
      { id: "sc3-h1", type: "heading", position: 1, headingText: "The CLEAR Framework" },
      { id: "sc3-t1", type: "short_text", position: 2, bodyText: "Use the CLEAR framework to construct and review all workplace sustainability messages:" },
      {
        id: "sc3-k1",
        type: "key_message",
        position: 3,
        headingText: "CLEAR Framework Breakdown",
        bodyText: "• C — Confirm purpose & audience: Identify who needs the message and what action is expected.\n• L — Link statements to evidence: Ensure every statistic is backed by verified workplace data.\n• E — Explain context & limitations: Be transparent about reporting boundaries, delays, or remaining gaps.\n• A — Approve through correct person: Secure authorization from the designated manager or spokesperson.\n• R — Record, review & correct: Archive evidence files and promptly issue corrections if errors occur."
      },
      {
        id: "sc3-d1",
        type: "decision_scenario",
        position: 4,
        decisionIntro: "Practice: Facts vs Targets",
        decisionPrompt: "Which of the following statements represents a VERIFIED FACT?",
        decisionChoices: [
          { label: "Our resort reduced kitchen food prep waste by 14% in Q2 based on daily weight logs", correct: true, feedback: "Correct! It describes a measured past result linked to daily weight logs." },
          { label: "Our resort will eliminate 100% of single-use plastic by next December", correct: false, feedback: "Incorrect. This is a future target, not a verified past fact." },
          { label: "We are committed to being the greenest resort in Mauritius", correct: false, feedback: "Incorrect. This is a general promotional slogan, not a verified fact." }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Visual Review Board & High-Risk Mistakes",
    minutes: 4,
    content: "Inspect a realistic Mauritian communication review board and review critical safeguards.",
    blocks: [
      { id: "sc4-h1", type: "heading", position: 1, headingText: "Visual Communication Review Board Inspection" },
      { id: "sc4-t1", type: "short_text", position: 2, bodyText: "Examine the Mauritian workplace noticeboard below (`visual-sustainability-communication-review.png`). Observe how the board tracks Draft Message, Intended Audience (Staff, Clients, Community), Evidence Source, Reporting Period (Q3 2023), Limitations & Context, Approval Status, Channel, and Publication Status." },
      {
        id: "sc4-img1",
        type: "visual_question",
        position: 3,
        imageUrl: "/images/courses/visual-sustainability-communication-review.png",
        caption: "Communication Review Board: Displaying message draft, audience, evidence source, reporting period, limitations, approval status, channel, and publication status.",
        imageAlt: "Realistic photograph of a Mauritian commercial workplace office with a noticeboard titled Sustainability Communication Review Board showing draft messages, evidence sources, reporting periods, and approval statuses while HR coordinators review cards."
      },
      {
        id: "sc4-k1",
        type: "key_message",
        position: 4,
        headingText: "High-Risk Communication Mistakes to Avoid",
        bodyText: "• DO NOT use vague buzzwords ('eco-friendly', 'zero waste', '100% green') without precise definitions.\n• DO NOT present a future target as an accomplished result.\n• DO NOT cherry-pick positive data while hiding significant negative performance.\n• DO NOT publish external statements without written authorization from management.\n• DO NOT fail to issue a prompt correction if an earlier statement contained factual errors."
      }
    ]
  },
  {
    order: 4,
    title: "Worked Mauritian Scenario & Applied Decision",
    minutes: 2,
    content: "Study a hotel plastic claim rewrite and solve an applied commercial property energy decision.",
    blocks: [
      { id: "sc5-h1", type: "heading", position: 1, headingText: "Worked Scenario: Hotel Plastic Claim Rewrite" },
      {
        id: "sc5-w1",
        type: "workplace_example",
        position: 2,
        headingText: "Rewriting an Exaggerated Claim",
        bodyText: "Original Draft: 'Hotel Le Morne has eliminated single-use plastic completely!'\nReview Audit: Guest room plastic bottles removed, but conference water bottles remain, and suppliers still deliver items in plastic wrap.\nImproved Credible Update: 'As part of our phased plastic reduction plan, Hotel Le Morne has replaced single-use guest room water bottles with refillable glass carafes. Conference facilities and supplier packaging audits remain in progress for Phase 2.'"
      },
      {
        id: "sc5-d1",
        type: "decision_scenario",
        position: 3,
        decisionIntro: "Applied Commercial Property Decision:",
        decisionPrompt: "A facilities team records an 18% drop in building electricity draw during July. However, two floors were vacant for renovation during that month. The manager wants to post: 'Our energy-efficiency program reduced power draw by 18%.' What is the proper response?",
        decisionChoices: [
          { label: "Pause publication, verify occupancy adjustments with Facilities, separate renovation effects from energy routines, and publish a qualified update explaining the context", correct: true, feedback: "Outstanding! Explaining context and separating temporary occupancy drops from energy routine savings protects credibility." },
          { label: "Publish the post immediately because an 18% drop looks great for corporate marketing", correct: false, feedback: "NEVER publish misleading statistics that conceal major operational factors like vacant floors!" },
          { label: "Delete all energy data and tell staff energy draw cannot be communicated", correct: false, feedback: "Incorrect. Data can be communicated credibly by explaining context and limitations." }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Your Communication Commitment & Badge",
    minutes: 2,
    content: "Select your daily credible communication commitments and complete the course.",
    blocks: [
      { id: "sc6-h1", type: "heading", position: 1, headingText: "Credible Communication Commitment" },
      { id: "sc6-t1", type: "short_text", position: 2, bodyText: "Select the credible communication commitments you pledge to practice in your workplace." },
      {
        id: "sc6-c1",
        type: "commitment",
        position: 3,
        commitmentInstruction: "Select your communication commitments (choose at least one):",
        commitmentOptions: [
          { value: "link-messages-to-evidence", label: "Verify evidence sources before sharing any workplace sustainability statistic", description: "Ensure every number is backed by verified data." },
          { value: "distinguish-facts-from-targets", label: "Label future targets and aspirations clearly so they are not confused with measured results", description: "Maintain strict honesty between past facts and future goals." },
          { value: "explain-context-and-gaps", label: "Include relevant context, reporting boundaries, and operational gaps in progress updates", description: "Avoid misleading omissions." },
          { value: "obtain-formal-approval", label: "Secure management authorization before releasing external sustainability statements", description: "Respect communication governance protocols." }
        ]
      },
      {
        id: "sc6-w1",
        type: "workplace_example",
        position: 4,
        headingText: "Practical Disclaimer",
        bodyText: "DISCLAIMER: This course provides practical workplace guidance on sustainability communication. It does not constitute legal advice, independent assurance, advertising-law certification, or authorization to issue public corporate statements."
      }
    ]
  }
];

const NEW_QUIZ = [
  {
    order: 1,
    question: "What is the primary objective of credible workplace sustainability communication?",
    options: [
      "To provide clear, accurate, evidence-backed information so employees and stakeholders understand actual performance and required actions",
      "To publish impressive slogans regardless of whether operational evidence exists",
      "To convince external clients that the company has zero environmental impact",
      "To prevent employees from asking questions about energy or waste"
    ],
    correct: 0,
    correctExplanation: "Credible communication provides accurate, evidence-backed clarity on workplace performance and expected actions.",
    incorrectExplanation: "Incorrect. Credible communication presents accurate, evidence-backed facts and instructions."
  },
  {
    order: 2,
    question: "What does the 'L' in the CLEAR communication framework stand for?",
    options: [
      "Link statements to evidence (ensure every claim is backed by verified workplace data)",
      "Launch advertising campaigns before checking facts",
      "Legal threats to employees who ask questions",
      "Limit communication to executive directors only"
    ],
    correct: 0,
    correctExplanation: "L = Link statements to evidence, ensuring every assertion is supported by factual data.",
    incorrectExplanation: "Incorrect. L = Link statements to evidence."
  },
  {
    order: 3,
    question: "Which of the following represents a FUTURE TARGET rather than a measured past fact?",
    options: [
      "Our logistics department aims to reduce fleet fuel draw by 10% by December 2027",
      "Our logistics department reduced fleet fuel draw by 8% in Q1 based on fuel receipts",
      "The fleet consumed 4,200 litres of diesel last month",
      "We installed GPS route optimization hardware on 15 delivery vehicles"
    ],
    correct: 0,
    correctExplanation: "Aiming to reduce fuel draw by a future date represents a future target objective, not a past fact.",
    incorrectExplanation: "Incorrect. Stating a future reduction goal is a target, not a past fact."
  },
  {
    order: 4,
    question: "In the visual communication review board (`visual-sustainability-communication-review.png`), why is the EVIDENCE SOURCE column vital?",
    options: [
      "It identifies the specific data document (e.g. utility bill, weight audit) confirming the claim before publication",
      "It lists employee home addresses for mailing posters",
      "It displays company bank account details",
      "It is decorative and has no verification function"
    ],
    correct: 0,
    correctExplanation: "The evidence source column links draft messages to specific verified data files.",
    incorrectExplanation: "Incorrect. It confirms the verified data source supporting the claim."
  },
  {
    order: 5,
    question: "What is GREENWASHING in a workplace communication context?",
    options: [
      "Presenting misleading, exaggerated, or unsupported environmental claims that overstate actual performance",
      "Washing solar panels with recycled rainwater",
      "Cleaning office floors with eco-certified detergent",
      "Printing double-sided training manuals"
    ],
    correct: 0,
    correctExplanation: "Greenwashing is the practice of releasing misleading or unsupported environmental assertions.",
    incorrectExplanation: "Incorrect. Greenwashing refers to misleading or exaggerated environmental claims."
  },
  {
    order: 6,
    question: "What is a MISLEADING OMISSION when publishing a sustainability progress update?",
    options: [
      "Leaving out critical negative operational context (e.g. building vacancy) to make energy reductions appear greater than they were",
      "Including supplier audit receipts in the appendix",
      "Explaining that data covers 3 out of 4 operating sites",
      "Stating the exact reporting timeframe in the header"
    ],
    correct: 0,
    correctExplanation: "Misleading omission conceals material negative context to create a false impression of success.",
    incorrectExplanation: "Incorrect. Misleading omission leaves out negative context or boundaries to distort results."
  },
  {
    order: 7,
    question: "How should a hotel communicate a single-use plastic reduction initiative that is only partially complete?",
    options: [
      "Issue a progress update specifying what has been achieved (e.g. guest room bottles), what remains in progress, and the next review date",
      "Announce that 100% of plastic has been eliminated across the entire resort",
      "Cancel all communications and keep progress secret",
      "Blame guests for continuing to bring plastic onto the property"
    ],
    correct: 0,
    correctExplanation: "Credible updates explain what has changed, what remains in progress, and what evidence supports it.",
    incorrectExplanation: "Incorrect. State accurate achievements, remaining gaps, and next review dates."
  },
  {
    order: 8,
    question: "What should an employee do if they discover an internal announcement contains an incorrect energy statistic?",
    options: [
      "Notify the message author/approver, record the correct verified number, and issue a transparent correction notice",
      "Ignore the error and hope no one notices",
      "Delete the entire company intranet database",
      "Post anonymous complaints on public social media"
    ],
    correct: 0,
    correctExplanation: "Record the correct verified data, notify the approver, and issue a prompt correction notice.",
    incorrectExplanation: "Incorrect. Notify the approver, verify correct data, and issue a transparent correction."
  },
  {
    order: 9,
    question: "Why must external sustainability communications receive formal management authorization?",
    options: [
      "To ensure corporate claims comply with legal, regulatory, and reporting governance standards before public release",
      "To prevent employees from talking to clients about basic office recycling",
      "Because external communications cost $10,000 per word",
      "Because managers write all social media posts personally"
    ],
    correct: 0,
    correctExplanation: "Formal approval ensures public statements are accurate, defensible, and compliant with governance rules.",
    incorrectExplanation: "Incorrect. Formal authorization ensures public claims meet legal and corporate governance standards."
  },
  {
    order: 10,
    question: "What is the primary takeaway of the CLEAR Communication Framework?",
    options: [
      "Applying CLEAR (Confirm, Link, Explain, Approve, Record) ensures workplace sustainability messages are accurate, evidence-backed, and credible",
      "Sustainability messages do not require evidence if they sound positive",
      "Any employee can publish unverified environmental claims on behalf of the company",
      "Communication should only occur once a year during annual shareholder meetings"
    ],
    correct: 0,
    correctExplanation: "The CLEAR framework provides the structure needed to maintain evidence-backed, credible workplace communication.",
    incorrectExplanation: "Incorrect. The CLEAR framework ensures accurate, evidence-backed, and transparent communication."
  }
];

export async function ensureCommunicatingSustainabilityAtWorkCourse(): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      // 1. Resolve Course 16 by courseCode "ELH-16" or slug
      let course = null;

      const [byCode] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-16"))
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
        throw new Error("Course ELH-16 / communicating-sustainability-at-work not seeded by catalogue skeletons bootstrap!");
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
        logger.info({ courseId, slug: COURSE_SLUG }, "Communicating Sustainability at Work course content and v2 integrity verified. Skipping repair to preserve administrator edits...");
        return;
      }

      logger.info({ courseId, slug: COURSE_SLUG }, "Integrity mismatch or missing v2 seed detected for Course ELH-16. Re-seeding course content, lessons, and 10 quiz questions transactionally...");

      // 4. Resolve next recommended course dynamically (ELH-17 or null if not yet seeded)
      const [course17] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.slug, "tracking-sustainability-actions"))
        .limit(1);
      const nextCourseId = course17 ? course17.id : null;

      // 5. Update course record metadata
      await tx
        .update(coursesTable)
        .set({
          title: COURSE_TITLE,
          slug: COURSE_SLUG,
          courseCode: "ELH-16",
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

      // 8. Enforce prerequisite entries in coursePrerequisitesTable (ELH-12, ELH-13, ELH-14, ELH-15 -> ELH-16)
      const prereqs = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(inArray(coursesTable.slug, [
          "final-sustainability-certification",
          "sustainability-action-planning",
          "setting-departmental-sustainability-goals",
          "building-workplace-sustainability-team"
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
          icon: "message-square",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 21,
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

      logger.info({ courseId, slug: COURSE_SLUG }, "Communicating Sustainability at Work course v2 seed / repair transaction completed successfully.");
    });
  } catch (err) {
    logger.error({ err }, "Failed to execute idempotent seeding/repair of Communicating Sustainability at Work course");
  }
}
