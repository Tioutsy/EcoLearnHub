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

const COURSE_SLUG = "sustainability-for-hr-teams";
const COURSE_TITLE = "Sustainability for HR Teams";
const BADGE_SLUG = "sustainability-enabled-hr-practitioner";
const BADGE_CODE = "COURSE_ELH_24_COMPLETE";
const SEED_NAME = "sustainability-for-hr-teams-v2";

const COURSE_META = {
  courseCode: "ELH-24",
  description: "A practical course for HR professionals and managers on integrating sustainability into onboarding, learning, employee communication, engagement, performance support and training evidence.",
  fullDescription: "A practical course for HR professionals and managers on integrating sustainability into onboarding, learning, employee communication, engagement, performance support and training evidence without presenting HR as the sole owner of technical environmental controls.",
  categoryId: 1,
  durationMinutes: 25,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainability-for-hr-teams.jpg",
  intendedRoles: ["employees", "supervisors", "managers", "sustainability coordinators", "green-team members", "HR professionals", "people managers"],
  learningObjectives: [
    "Clarify HR's role as an enabler, coordinator, and evidence custodian across the employee lifecycle.",
    "Distinguish between HR responsibilities and matters owned by managers, operations, facilities, procurement, or ESG specialists.",
    "Design role-based, accessible, and inclusive learning assignments across diverse workforce groups.",
    "Integrate practical sustainability expectations into onboarding and role clarity without generic slogans.",
    "Foster employee participation without coercion, public naming, pressure, or unsupported environmental claims.",
    "Maintain reliable, audit-ready training evidence distinct from operational performance metrics."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Sustainability for HR Teams. You can now support practical sustainability learning, role clarity, employee participation and reliable training records across the employee lifecycle.",
  badgeName: "Sustainability-Enabled HR Practitioner",
  badgeDescription: "Awarded for demonstrating practical understanding of how to integrate sustainability into onboarding, learning, employee communication, participation and training records.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Opening Workplace Hook: The Email Policy Trap",
    minutes: 3,
    content: "Understand why sending a sustainability policy by email is not enough to create role clarity, accessible learning, or reliable training evidence across a diverse workforce.",
    blocks: [
      {
        id: "c24-l1-b1",
        type: "heading",
        headingText: "Opening Workplace Hook: The Email Policy Trap"
      },
      {
        id: "c24-l1-b2",
        type: "short_text",
        bodyText: "A growing hospitality and logistics enterprise in Mauritius introduces a new workplace sustainability policy and sends it as a PDF email attachment to all employees.\n\nThree months later, HR reports a 98% email delivery rate as proof that the workforce understands sustainability. However, an internal operational review reveals:\n• New hires recruited last month never received the policy.\n• Frontline kitchen, maintenance, and warehouse staff with limited computer access were omitted.\n• Department managers give conflicting instructions on waste sorting and water leak reporting.\n• Training records consist of an incomplete Excel spreadsheet.\n• Employees report that they do not know which specific sustainability expectations apply to their daily roles."
      },
      {
        id: "c24-l1-b3",
        type: "key_message",
        headingText: "The Learning Insight",
        bodyText: "Sending an email attachment is an administrative delivery action. It does not prove role clarity, accessible learning, manager alignment, or operational understanding."
      }
    ]
  },
  {
    order: 1,
    title: "Why HR Matters: Employee, Business and Environmental Relevance",
    minutes: 3,
    content: "Examine how HR acts as an enabler, coordinator, and evidence custodian across three key organizational levels.",
    blocks: [
      {
        id: "c24-l2-b1",
        type: "heading",
        headingText: "Why HR Matters for Workplace Sustainability"
      },
      {
        id: "c24-l2-b2",
        type: "short_text",
        bodyText: "HR enables workplace sustainability by embedding clear expectations from day one, ensuring accessible learning, supporting managers, and maintaining reliable training evidence.\n\n• Employee Relevance: Employees gain clear expectations from onboarding, receive accessible learning in protected working hours, and know how to report operational barriers without fear of penalty.\n• Business Relevance: Reliable training records protect company credibility, streamline internal and external audits, and prevent cross-departmental confusion.\n• Environmental Relevance: Workforce training directly supports operational controls (e.g., proper waste sorting, energy shutoff SOPs) rather than remaining an isolated academic exercise."
      }
    ]
  },
  {
    order: 2,
    title: "HR Role Boundaries: Enabler vs Technical Owner",
    minutes: 3,
    content: "Define strict functional boundaries between HR responsibilities and operational, facilities, ESG, legal, or health and safety ownership.",
    blocks: [
      {
        id: "c24-l3-b1",
        type: "heading",
        headingText: "HR Role Boundaries & Responsibility Matrix"
      },
      {
        id: "c24-l3-b2",
        type: "short_text",
        bodyText: "HR is an enabler and custodian—not the final technical decision-maker or environmental engineer. HR must never unilaterally interpret environmental laws, calculate carbon emissions, approve green claims, or select technical waste contractors.\n\nResponsibility Matrix:\n• Onboarding & Learning: HR coordinates and logs; Manager/ESG lead approves content.\n• Technical SOPs: Operations/Facilities owns; HR supports role documentation.\n• Environmental Claims: Marketing/Technical lead verifies; HR ensures recruitment materials match evidence.\n• Health & Safety Risks: HSE Lead owns; HR documents employee reports and escalates immediately."
      }
    ]
  },
  {
    order: 3,
    title: "Sourced Fact: From Awareness to Technical Competence",
    minutes: 3,
    content: "Distinguish between general awareness, understanding, technical capability, and decision authority using international standard principles.",
    blocks: [
      {
        id: "c24-l4-b1",
        type: "heading",
        headingText: "Sourced Fact: Awareness vs Technical Competence"
      },
      {
        id: "c24-l4-b2",
        type: "memorable_fact",
        factTitle: "ISO 14001:2015 Clause 7.2 & 7.3 Standards",
        bodyText: "ISO 14001:2015 Clause 7.2 (Competence) and Clause 7.3 (Awareness) state that organizations must ensure persons doing work under their control are competent on the basis of appropriate education, training, or experience, and aware of how their work contributes to environmental objectives.\n\nPractical HR Implication: Completing an online general awareness course does not automatically grant technical competence or decision authority over high-risk equipment or hazardous chemical storage."
      }
    ]
  },
  {
    order: 4,
    title: "HR Across the Employee Lifecycle: Part 1 (Planning to Onboarding)",
    minutes: 3,
    content: "Integrate practical sustainability expectations into workforce planning, recruitment, and onboarding.",
    blocks: [
      {
        id: "c24-l5-b1",
        type: "heading",
        headingText: "Workforce Planning, Recruitment & Onboarding"
      },
      {
        id: "c24-l5-b2",
        type: "short_text",
        bodyText: "1. Workforce Planning: Identify roles requiring specific environmental competence (e.g., boiler operators, waste handlers) before hiring.\n2. Recruitment: Describe role expectations accurately without exaggerated employer brand claims.\n3. Onboarding: Introduce site-specific waste sorting, water leak reporting contacts, energy shutoff procedures, and assigned learning paths during week one."
      }
    ]
  },
  {
    order: 5,
    title: "HR Across the Employee Lifecycle: Part 2 (Learning to Offboarding)",
    minutes: 3,
    content: "Manage ongoing learning, performance support, role changes, and offboarding responsibilities.",
    blocks: [
      {
        id: "c24-l6-b1",
        type: "heading",
        headingText: "Ongoing Learning, Performance & Offboarding"
      },
      {
        id: "c24-l6-b2",
        type: "short_text",
        bodyText: "4. Ongoing Learning: Assign role-relevant learning paths and track completion.\n5. Performance Support: Support managers in setting objective, controllable behavior goals rather than vague demands.\n6. Role Change: Reassess required learning when an employee transfers to a new department.\n7. Offboarding: Reassign initiative responsibilities and retain training records according to company policy."
      }
    ]
  },
  {
    order: 6,
    title: "Designing Relevant, Role-Based Learning Assignments",
    minutes: 3,
    content: "Assign targeted learning pathways based on role, department, authority, and risk exposure to prevent training fatigue.",
    blocks: [
      {
        id: "c24-l7-b1",
        type: "heading",
        headingText: "Role-Based Learning Pathways"
      },
      {
        id: "c24-l7-b2",
        type: "short_text",
        bodyText: "Avoid assigning all 29 courses to every employee. Target assignments by role:\n• All Staff: Foundations (ELH-01), Waste (ELH-02), Energy (ELH-03), Water (ELH-04).\n• HR Team: HR Sustainability (ELH-24), Roles & Governance (ELH-20), Engagement (ELH-21).\n• Facilities Staff: Facilities & Property (ELH-27), Waste (ELH-02), Energy (ELH-03).\n• Procurement Team: Sustainable Procurement (ELH-05, ELH-29).\n• Managers & Green Teams: Action Planning (ELH-13), Green Teams (ELH-22), Initiatives (ELH-23)."
      }
    ]
  },
  {
    order: 7,
    title: "Accessible and Inclusive Learning Delivery",
    minutes: 3,
    content: "Ensure shift workers, frontline staff, and employees with limited computer access receive protected learning time and usable tools.",
    blocks: [
      {
        id: "c24-l8-b1",
        type: "heading",
        headingText: "Inclusive Learning Delivery Principles"
      },
      {
        id: "c24-l8-b2",
        type: "short_text",
        bodyText: "HR must ensure learning is accessible to all employee groups:\n• Schedule protected learning time during paid working hours—never demand unpaid off-shift study.\n• Provide tablet or shared kiosk access for frontline shift workers who lack individual company email addresses.\n• Use clear, simple language and support local languages (French / Mauritian Creole) where approved.\n• Accommodate digital literacy needs with guided orientation support."
      }
    ]
  },
  {
    order: 8,
    title: "Employee Engagement Without Pressure or Surveillance",
    minutes: 3,
    content: "Foster voluntary participation, feedback channels, and fair recognition while strictly avoiding coercion, shaming, or invasive personal disclosures.",
    blocks: [
      {
        id: "c24-l9-b1",
        type: "heading",
        headingText: "Ethical Engagement Principles"
      },
      {
        id: "c24-l9-b2",
        type: "short_text",
        bodyText: "Effective engagement relies on trust, inclusion, and visible follow-through.\n\nHR must strictly prohibit:\n• Publicly listing or shaming employees who have not volunteered for green teams.\n• Pressuring employees to disclose personal home lifestyle practices.\n• Assigning unpaid sustainability tasks outside an employee's formal contract.\n• Using participation metrics as a punitive performance ranking tool."
      }
    ]
  },
  {
    order: 9,
    title: "Training Records and Evidence Integrity",
    minutes: 3,
    content: "Distinguish learning evidence from operational result evidence and maintain audit-ready training logs.",
    blocks: [
      {
        id: "c24-l10-b1",
        type: "heading",
        headingText: "Learning Evidence vs Performance Evidence"
      },
      {
        id: "c24-l10-b2",
        type: "short_text",
        bodyText: "Distinguish two types of evidence:\n• Learning Evidence: Assignment logs, completion dates, pass scores, course version numbers, and certificates. Proves training occurred.\n• Performance Evidence: Physical waste reduction weights, water meter logs, energy bills, and audit inspection reports. Proves environmental outcome.\n\nHR maintains learning evidence; HR must never claim training completion alone proves physical environmental compliance."
      }
    ]
  },
  {
    order: 10,
    title: "Visual Element: Employee Lifecycle & HR Responsibility Sort",
    minutes: 3,
    content: "Interactive visual map sorting HR duties across workforce stages and functional boundaries.",
    blocks: [
      {
        id: "c24-l11-b1",
        type: "heading",
        headingText: "Visual Interactive: HR Responsibility Boundary Check"
      },
      {
        id: "c24-l11-b2",
        type: "image",
        imageUrl: "/images/courses/sustainability-for-hr-teams.jpg",
        captionText: "HR Responsibility Matrix: Distinguishing HR coordination from operational engineering."
      },
      {
        id: "c24-l11-b3",
        type: "short_text",
        bodyText: "Review the functional boundary sort:\n• HR Owns: Course assignments, onboarding integration, training record logs, engagement feedback channels.\n• HR Supports: Job description updates, green team volunteer selection, department manager follow-up.\n• Manager Owns: Daily operational adherence, role-relevant training enforcement, local safety SOPs.\n• Specialist Owns: Chemical handling SOPs, waste contractor verification, carbon calculations, facilities energy repairs."
      }
    ]
  },
  {
    order: 11,
    title: "Workplace Scenario Challenge & Commitment",
    minutes: 3,
    content: "Apply HR integration principles to a Port Louis blanket training challenge and select a practical workplace HR commitment.",
    blocks: [
      {
        id: "c24-l12-b1",
        type: "heading",
        headingText: "Scenario Challenge & Practical HR Commitment"
      },
      {
        id: "c24-l12-b2",
        type: "short_text",
        bodyText: "Scenario Challenge: A Port Louis services company assigns a 12-course blanket pathway to all staff. After 30 days, completion is 15%, managers complain of irrelevance, and shift workers lack kiosk access.\n\nBest HR Response: Pause the blanket assignment, consult department leads, establish targeted role-based pathways, provide shift kiosk access during paid working hours, and report actual completion rates accurately."
      },
      {
        id: "c24-l12-b3",
        type: "short_text",
        bodyText: "Select one practical commitment for your workplace this week:\n• Review week-one onboarding to include site-specific waste and leak reporting contacts.\n• Audit current course assignments to replace blanket pathways with targeted role-based paths.\n• Verify that shift staff receive protected working-hour learning time and shared device access.\n• Ensure HR training logs include course code, version, completion date, and score."
      },
      {
        id: "c24-l12-b4",
        type: "callout",
        headingText: "Practical Course Disclaimer",
        bodyText: "This course provides practical workplace guidance for HR professionals. It is not legal, employment-law, health-and-safety, or environmental-assurance advice, and does not provide formal legal compliance certification."
      }
    ]
  }
];

const QUIZ_QUESTIONS = [
  {
    question: "What is the primary boundary of HR's role in workplace sustainability?",
    options: [
      "HR certifies chemical safety protocols and interprets environmental law independently.",
      "HR enables participation, coordinates learning, integrates expectations into onboarding, and maintains training records while escalating technical hazards to operational owners.",
      "HR is solely responsible for calculating company carbon emissions and choosing waste contractors.",
      "HR enforces compulsory weekend volunteer work for employees who fail sustainability quizzes."
    ],
    correctOption: 1,
    correctExplanation: "Correct! HR acts as an enabler, coordinator, and record custodian, while operational and safety leads own technical environmental controls.",
    incorrectExplanation: "Review HR role boundaries: HR coordinates learning and records, while technical leads own environmental engineering and compliance.",
    optionFeedback: [
      "Incorrect. Technical chemical protocols belong to HSE and operations leads, not HR.",
      "Correct! HR enables participation, coordinates learning, integrates expectations into onboarding, and maintains training records while escalating technical hazards to operational owners.",
      "Incorrect. Carbon calculations belong to ESG/sustainability leads; waste contracting belongs to procurement/facilities.",
      "Incorrect. Mandatory unpaid weekend work is unethical and violates labor principles."
    ],
    orderIndex: 0
  },
  {
    question: "A company sends a PDF sustainability policy attachment by email to all employees and reports 98% email delivery as proof of workforce understanding. Why is this flawed?",
    options: [
      "PDF files automatically corrupt database training logs upon delivery.",
      "Email delivery is illegal under Mauritian employment law.",
      "Email delivery proves administrative transmission, not accessible learning, role clarity, shift worker inclusion, or operational understanding.",
      "Email policies are only valid if signed by an external legal auditor."
    ],
    correctOption: 2,
    correctExplanation: "Correct! Email delivery does not guarantee that frontline shift workers accessed the file, understood expectations, or received role-specific guidance.",
    incorrectExplanation: "Review onboarding delivery: Email delivery does not verify comprehension or frontline access.",
    optionFeedback: [
      "Incorrect. Sending PDFs does not corrupt database tables.",
      "Incorrect. Email communication is legal; it is simply insufficient as proof of learning.",
      "Correct! Email delivery proves administrative transmission, not accessible learning, role clarity, shift worker inclusion, or operational understanding.",
      "Incorrect. Internal workplace policies do not require external legal audit signatures for onboarding."
    ],
    orderIndex: 1
  },
  {
    question: "According to ISO 14001:2015 Clauses 7.2 and 7.3 principles, what is the relationship between course completion and technical competence?",
    options: [
      "Completing a general online awareness course provides awareness and understanding, but does not automatically grant technical competence or decision authority over high-risk operations.",
      "Completing an online quiz automatically certifies an employee as an environmental compliance auditor.",
      "Awareness training eliminates the need for site-specific safety SOPs and manager supervision.",
      "Technical competence can only be achieved by employees with senior management job titles."
    ],
    correctOption: 0,
    correctExplanation: "Correct! Awareness training builds foundational understanding, but technical competence requires role-specific training, experience, and operational authorization.",
    incorrectExplanation: "Review ISO 7.2/7.3 principles: Awareness is distinct from technical competence and operational authority.",
    optionFeedback: [
      "Correct! Completing a general online awareness course provides awareness and understanding, but does not automatically grant technical competence or decision authority over high-risk operations.",
      "Incorrect. General online quizzes do not grant professional auditor certification.",
      "Incorrect. Awareness training supports SOPs; it never replaces physical safety controls or supervision.",
      "Incorrect. Technical competence depends on training, skills, and experience, not job titles."
    ],
    orderIndex: 2
  },
  {
    question: "Why should HR design role-based learning pathways instead of assigning all 29 courses to every employee?",
    options: [
      "Because assigning all courses is prohibited by web browser software limits.",
      "Because generic courses are legally invalid for frontline hospitality staff.",
      "Because employees cannot complete quizzes on mobile devices.",
      "Because targeted pathways match learning to role risks and decision authority, preventing training fatigue and ensuring operational relevance."
    ],
    correctOption: 3,
    correctExplanation: "Correct! Role-based pathways ensure employees focus on modules relevant to their daily tasks and authority, avoiding screen fatigue.",
    incorrectExplanation: "Review learning assignment principles: Role-based pathways maximize operational relevance and respect employee time.",
    optionFeedback: [
      "Incorrect. Browsers can load multiple courses; the limitation is pedagogical and operational.",
      "Incorrect. Generic courses are legal; they are simply inefficient when assigned broadly.",
      "Incorrect. Quizzes function cleanly on mobile devices.",
      "Correct! Because targeted pathways match learning to role risks and decision authority, preventing training fatigue and ensuring operational relevance."
    ],
    orderIndex: 3
  },
  {
    question: "How should HR ensure inclusive learning delivery for frontline shift workers who lack individual company email addresses?",
    options: [
      "Demand that frontline staff purchase personal laptops and complete modules at home without pay.",
      "Provide shared kiosk tablets, schedule protected learning time during paid working hours, and offer clear language support.",
      "Exempt all frontline workers from sustainability learning permanently.",
      "Report frontline workers as non-compliant to senior executive management."
    ],
    correctOption: 1,
    correctExplanation: "Correct! Providing kiosk devices, protected paid time, and accessible language ensures fair, inclusive learning for shift workers.",
    incorrectExplanation: "Review inclusive delivery: HR must provide devices, protected paid working hours, and language support.",
    optionFeedback: [
      "Incorrect. Mandating personal laptop purchases and unpaid home training is unethical and unfair.",
      "Correct! Provide shared kiosk tablets, schedule protected learning time during paid working hours, and offer clear language support.",
      "Incorrect. Frontline staff play a vital role in operational controls and should not be excluded.",
      "Incorrect. Labeling staff non-compliant when management failed to provide device access is unfair."
    ],
    orderIndex: 4
  },
  {
    question: "What is an ethical boundary HR must maintain when facilitating employee sustainability engagement?",
    options: [
      "HR should publish a public leaderboard shaming employees who have not volunteered for green teams.",
      "HR should require employees to submit weekly photos of their home recycling bins.",
      "HR should use quiz scores to reduce employee basic salaries.",
      "HR should foster voluntary participation, feedback loops, and fair recognition while prohibiting public shaming or mandatory personal lifestyle disclosures."
    ],
    correctOption: 3,
    correctExplanation: "Correct! Ethical engagement encourages voluntary participation and constructive feedback without coercion, shaming, or invasive home surveillance.",
    incorrectExplanation: "Review ethical engagement: Engagement must avoid public shaming, home surveillance, or punitive salary deductions.",
    optionFeedback: [
      "Incorrect. Public shaming destroys psychological safety and employee trust.",
      "Incorrect. HR has no right to demand invasive home lifestyle surveillance.",
      "Incorrect. Reducing salaries based on quiz scores is illegal and unethical.",
      "Correct! HR should foster voluntary participation, feedback loops, and fair recognition while prohibiting public shaming or mandatory personal lifestyle disclosures."
    ],
    orderIndex: 5
  },
  {
    question: "What is the difference between learning evidence and performance evidence in HR training management?",
    options: [
      "Learning evidence (assignment logs, completion dates, pass scores) proves training occurred; performance evidence (waste weights, meter logs) proves physical environmental outcome.",
      "Learning evidence consists of informal verbal promises; performance evidence consists of certificate PDFs.",
      "Learning evidence is maintained by external auditors; performance evidence is maintained by HR interns.",
      "There is no difference; completing an online module automatically proves physical carbon reduction."
    ],
    correctOption: 0,
    correctExplanation: "Correct! HR maintains learning evidence (training completion), whereas operations/ESG leads track physical performance evidence (environmental data).",
    incorrectExplanation: "Review evidence integrity: Training completion proves learning occurred, not physical environmental metrics.",
    optionFeedback: [
      "Correct! Learning evidence (assignment logs, completion dates, pass scores) proves training occurred; performance evidence (waste weights, meter logs) proves physical environmental outcome.",
      "Incorrect. Learning evidence requires verified digital logs, not informal verbal promises.",
      "Incorrect. HR maintains structured learning logs; operations tracks physical performance data.",
      "Incorrect. Completing a module proves training completion, not physical carbon reduction."
    ],
    orderIndex: 6
  },
  {
    question: "A Port Louis company assigns a blanket 12-course pathway to all staff. After 30 days, completion is 15% and managers complain. What should HR do?",
    options: [
      "Falsify database records to show 100% completion before the management audit.",
      "Issue formal disciplinary warnings to all employees who failed to complete courses outside work hours.",
      "Pause blanket assignments, consult department leads to create targeted role-based paths, provide shift kiosk access during paid hours, and report actual status accurately.",
      "Delete the LMS platform and replace it with paper flyers."
    ],
    correctOption: 2,
    correctExplanation: "Correct! HR should address root causes by refining pathways, providing protected learning time and kiosk access, and reporting progress transparently.",
    incorrectExplanation: "Review HR problem-solving: Refine pathways, protect learning time, provide kiosk access, and report accurately.",
    optionFeedback: [
      "Incorrect. Falsifying records violates ethics, audit compliance, and database integrity.",
      "Incorrect. Disciplinary action for unprovided access or irrelevant courses is unjust.",
      "Correct! Pause blanket assignments, consult department leads to create targeted role-based paths, provide shift kiosk access during paid hours, and report actual status accurately.",
      "Incorrect. Deleting the LMS does not resolve training needs or role clarity."
    ],
    orderIndex: 7
  }
];

export async function ensureSustainabilityForHrTeamsCourse(): Promise<void> {
  logger.info(`Checking and executing ${COURSE_TITLE} course content migration (${SEED_NAME})...`);

  try {
    await db.transaction(async (tx) => {
      const [existingSeed] = await tx
        .select()
        .from(systemSeedsTable)
        .where(eq(systemSeedsTable.name, SEED_NAME))
        .limit(1);

      let actualCourseId: number;

      const [upserted] = await tx
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
          isPublished: true,
          intendedRoles: COURSE_META.intendedRoles,
          badgeName: COURSE_META.badgeName,
          badgeDescription: COURSE_META.badgeDescription,
          completionMessage: COURSE_META.completionMessage,
          status: "published",
        })
        .onConflictDoUpdate({
          target: coursesTable.slug,
          set: {
            title: COURSE_TITLE,
            courseCode: COURSE_META.courseCode,
            description: COURSE_META.description,
            fullDescription: COURSE_META.fullDescription,
            durationMinutes: COURSE_META.durationMinutes,
            level: COURSE_META.level,
            thumbnailUrl: COURSE_META.thumbnailUrl,
            learningObjectives: COURSE_META.learningObjectives,
            intendedRoles: COURSE_META.intendedRoles,
            badgeName: COURSE_META.badgeName,
            badgeDescription: COURSE_META.badgeDescription,
            completionMessage: COURSE_META.completionMessage,
            passingScore: COURSE_META.passingScore,
            isPublished: true,
            status: "published",
          },
        })
        .returning({ id: coursesTable.id });

      actualCourseId = upserted.id;

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
            orderIndex: 27,
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
        logger.info(`Seeded ${NEW_LESSONS.length} upgraded lessons for ELH-24.`);

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
        logger.info(`Seeded ${QUIZ_QUESTIONS.length} upgraded quiz questions for ELH-24.`);

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

      // Ensure Prerequisite relationships exist: ELH-12 and ELH-21 linked to ELH-24
      const prereqCodes = ["ELH-12", "ELH-21"];
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

      // Ensure ELH-23 recommends ELH-24
      const [course23] = await tx
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.courseCode, "ELH-23"))
        .limit(1);

      if (course23) {
        await tx
          .update(coursesTable)
          .set({ recommendedNextCourseId: actualCourseId })
          .where(eq(coursesTable.id, course23.id));
      }
    });

    logger.info(`Successfully seeded ${COURSE_TITLE} content.`);
  } catch (error) {
    logger.error({ err: error }, `Failed to seed ${COURSE_TITLE} course content.`);
    throw error;
  }
}
