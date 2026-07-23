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

const COURSE_SLUG = "communicating-sustainability-at-work";
const COURSE_TITLE = "Communicating Sustainability at Work";
const BADGE_SLUG = "sustainability-communicator";
const BADGE_CODE = "COURSE_ELH_16_COMPLETE";
const SEED_NAME = "communicating-sustainability-at-work-v1";

const COURSE_META = {
  courseCode: "ELH-16",
  description: "Learn how to communicate workplace sustainability actions clearly, honestly and practically so employees understand what is changing, why it matters and what they are expected to do.",
  fullDescription: "Learn how to communicate workplace sustainability actions clearly, honestly and practically so employees understand what is changing, why it matters and what they are expected to do. This course enables learners to create clear and credible internal sustainability communications that support action, participation and trust.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/communicating-sustainability-at-work.jpg",
  intendedRoles: ["employees", "managers", "HR teams", "internal communications teams", "sustainability representatives", "department coordinators"],
  learningObjectives: [
    "Explain sustainability actions in clear and accessible workplace language.",
    "Communicate the specific behaviour, responsibility or decision expected from employees.",
    "Select suitable communication channels for different audiences and situations.",
    "Replace vague or exaggerated environmental claims with specific, supportable statements.",
    "Communicate progress, limitations and delays honestly.",
    "Respond appropriately to employee questions, uncertainty and resistance.",
    "Draft a simple internal sustainability communication plan."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Communicating Sustainability at Work. You can now create clear, credible and practical internal sustainability messages that support employee understanding and constructive action.",
  badgeName: "Sustainability Communicator",
  badgeDescription: "Awarded for completing Communicating Sustainability at Work and demonstrating the ability to create clear, credible and practical internal sustainability messages.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Good Intentions Can Still Create Confusion",
    minutes: 3,
    content: "Explain that good intentions alone aren't enough. Many sustainability announcements fail because they are too vague, leaving employees unsure of what to do. Clear workplace communication must answer key questions to drive actual behaviour change.",
    blocks: [
      {
        id: "c16-l1-b1",
        type: "heading",
        headingText: "Good Intentions Can Still Create Confusion"
      },
      {
        id: "c16-l1-b2",
        type: "short_text",
        bodyText: "A company announces: 'We are going green. Everyone must do their part.' While the intention is good, employees are left with no explanation of what is changing, why it is changing, what each department must do, when the change begins, or who can answer questions.\n\nEffective sustainability communication should answer: What is changing? Why does it matter? Who is affected? What action is expected? When must it happen? Where can employees get help? How will progress be reviewed? Awareness without a clear action rarely changes behaviour."
      },
      {
        id: "c16-l1-b3",
        type: "key_message",
        headingText: "Core Actionable Principle",
        bodyText: "Avoid generic appeals to 'save the planet.' Practical workplace sustainability communication must provide a specific call to action, starting point, and instructions."
      },
      {
        id: "c16-l1-b4",
        type: "decision_scenario",
        decisionIntro: "Which message is most likely to change workplace behaviour?",
        decisionPrompt: "Select the most appropriate communication:",
        decisionChoices: [
          {
            label: "Help us save the planet",
            correct: false,
            feedback: "Incorrect. Vague calls to save the planet do not give employees any practical idea of what they need to do next."
          },
          {
            label: "Our company is becoming greener",
            correct: false,
            feedback: "Incorrect. This is an awareness statement that lacks actionable steps or deadlines."
          },
          {
            label: "From Monday, office paper must be placed in the labelled paper container beside the printer, with no food or plastic packaging",
            correct: true,
            feedback: "Correct. This provides a clear start date, a specific action, and exact sorting instructions."
          },
          {
            label: "Sustainability is everyone's responsibility",
            correct: false,
            feedback: "Incorrect. When responsibility is assigned to 'everyone' without specifics, individuals assume someone else is doing it."
          }
        ]
      }
    ]
  },
  {
    order: 1,
    title: "Start With the Audience",
    minutes: 3,
    content: "Different workplace audiences require different levels of detail and communication formats. Teach learners how to adapt their messaging style for frontline staff, operational departments, and managers without altering the core truth.",
    blocks: [
      {
        id: "c16-l2-b1",
        type: "heading",
        headingText: "Start With the Audience"
      },
      {
        id: "c16-l2-b2",
        type: "short_text",
        bodyText: "Different workplace groups need different types of details. Frontline employees need clear actions and visual instructions. Managers need to know deadlines, responsibilities, and escalation protocols. Facilities and procurement teams require operational specifications and supplier requirements.\n\nWhile the underlying truth remains consistent, the format and focus must change to suit the audience. For example, an email is unlikely to reach a busy kitchen team in a hotel."
      },
      {
        id: "c16-l2-b3",
        type: "key_message",
        headingText: "Operational Example",
        bodyText: "In a Mauritian hotel introducing food-waste separation, success requires: simple illustrated posters in kitchen prep areas, shift supervisor briefings, clear container labels, and management reporting on contamination."
      },
      {
        id: "c16-l2-b4",
        type: "decision_scenario",
        decisionIntro: "A hotel is introducing waste separation in its kitchens. What is the most effective way to communicate this to the kitchen staff?",
        decisionPrompt: "Select the best communication strategy:",
        decisionChoices: [
          {
            label: "Send a detailed PDF policy document to all kitchen staff emails",
            correct: false,
            feedback: "Incorrect. Kitchen operators rarely check emails during busy shifts; a written document won't drive point-of-use habits."
          },
          {
            label: "Conduct pre-shift briefs, place illustrated signs at the waste bins, and label all sorting containers clearly",
            correct: true,
            feedback: "Correct. This targets the audience where the action happens, combining verbal instructions with clear visual cues."
          },
          {
            label: "Hold a monthly town hall meeting in the main conference room",
            correct: false,
            feedback: "Incorrect. Town halls are too distant from daily routines and do not provide instructions when staff are sorting waste."
          },
          {
            label: "Post the kitchen food waste policy on the company's website",
            correct: false,
            feedback: "Incorrect. Web posts are external marketing channels and fail to provide direct operational guidance."
          }
        ]
      }
    ]
  },
  {
    order: 2,
    title: "Replace Vague Claims With Specific Information",
    minutes: 3,
    content: "Explain the importance of credible, evidence-based language. Learn to replace vague terms like 'green', 'sustainable', or 'zero impact' with factual descriptions of the action taken, its scope, and current results.",
    blocks: [
      {
        id: "c16-l3-b1",
        type: "heading",
        headingText: "Replace Vague Claims With Specific Information"
      },
      {
        id: "c16-l3-b2",
        type: "short_text",
        bodyText: "Using unsupported words like 'green', 'zero impact', or 'carbon neutral' harms trust. In workplace communications, always describe exact actions, scope, timeframes, and limitations.\n\nInstead of claiming: 'Our office is now fully green,' communicate: 'Since June, the office has replaced disposable drinking cups with reusable cups and introduced separate paper collection points.' Specific details are credible and verifiable."
      },
      {
        id: "c16-l3-b3",
        type: "key_message",
        headingText: "Language Shift",
        bodyText: "Replace vague marketing slogans with supportable facts. Credible messaging includes scope and progress, admitting what is still left to do."
      },
      {
        id: "c16-l3-b4",
        type: "decision_scenario",
        decisionIntro: "Which statement is the most credible environmental update for a company notice board?",
        decisionPrompt: "Select the most credible update statement:",
        decisionChoices: [
          {
            label: "Our operations have achieved complete zero waste, making us the greenest company in Mauritius",
            correct: false,
            feedback: "Incorrect. This contains broad, unsupportable claims and absolute statements that are highly unlikely to be completely true."
          },
          {
            label: "We are now 100% sustainable across all corporate offices",
            correct: false,
            feedback: "Incorrect. 'Sustainable' is too broad. It does not explain what was actually done or provide any evidence."
          },
          {
            label: "In the first quarter, we replaced single-use plastic water bottles with refillable carafes in meeting rooms, reducing bottle purchases by 80%",
            correct: true,
            feedback: "Correct. This specifies the action (carafes), scope (meeting rooms), period (Q1), and a clear, supportable metric (80% reduction)."
          },
          {
            label: "We have eliminated our carbon footprint entirely through recycling",
            correct: false,
            feedback: "Incorrect. Recycling alone cannot eliminate a carbon footprint, and the claim is scientifically inaccurate."
          }
        ]
      }
    ]
  },
  {
    order: 3,
    title: "Choose the Right Channel and Timing",
    minutes: 3,
    content: "Selecting communication channels (briefings, emails, posters) depends on the target group, action location, and task complexity. Discover how to use multiple channels for safety and operational changes.",
    blocks: [
      {
        id: "c16-l4-b1",
        type: "heading",
        headingText: "Choose the Right Channel and Timing"
      },
      {
        id: "c16-l4-b2",
        type: "short_text",
        bodyText: "Workplace channels include briefings, toolbox talks, shift handovers, posters, intranet updates, and onboarding guides. The right channel depends on where the action happens, how urgent it is, and whether staff need to demonstrate the behavior.\n\nImportant operational updates should normally use multiple channels rather than a single email or announcement."
      },
      {
        id: "c16-l4-b3",
        type: "key_message",
        headingText: "Channel Selection Rule",
        bodyText: "Match the channel to the action. Place visual instructions directly at the point of action (e.g. near bins or equipment) rather than relying on memory."
      },
      {
        id: "c16-l4-b4",
        type: "decision_scenario",
        decisionIntro: "A manufacturing plant changes the procedure for storing used chemical containers. How should this change be communicated to operators?",
        decisionPrompt: "Select the most appropriate channel mix:",
        decisionChoices: [
          {
            label: "Mention the chemical container procedure in the monthly company newsletter",
            correct: false,
            feedback: "Incorrect. Monthly newsletters are too slow and informal for high-risk or technical procedure changes."
          },
          {
            label: "Post it on the company's LinkedIn page",
            correct: false,
            feedback: "Incorrect. Social media is an external marketing tool and is not an appropriate channel for internal safety procedures."
          },
          {
            label: "Update the procedure document, brief operators, place visual signs at the storage area, and verify understanding",
            correct: true,
            feedback: "Correct. This combines formal updates with shift briefings and point-of-use visuals, confirming operators understand the new steps."
          },
          {
            label: "Send a single company-wide email broadcast",
            correct: false,
            feedback: "Incorrect. Emails can be missed or forgotten, especially by plant floor workers who do not work at desks."
          }
        ]
      }
    ]
  },
  {
    order: 4,
    title: "Scenario: Employees Push Back",
    minutes: 3,
    content: "Address employee scepticism or resistance constructively. Learn to identify design barriers, layout issues, or poor instructions, rather than blaming employees' lack of commitment.",
    blocks: [
      {
        id: "c16-l5-b1",
        type: "heading",
        headingText: "Scenario: Employees Push Back"
      },
      {
        id: "c16-l5-b2",
        type: "short_text",
        bodyText: "A company sets up new waste-sorting stations. After two weeks, employees complain that sorting labels are confusing, bins are located too far from work areas, and cleaning staff are throwing sorted waste back into general bins.\n\nScepticism or low compliance often indicates process design problems, missing training, or unclear instructions. Communication cannot compensate for an unworkable process."
      },
      {
        id: "c16-l5-b3",
        type: "key_message",
        headingText: "Constructive Response",
        bodyText: "Observe, ask questions, and fix barriers. Speak to the people expected to do the action (including cleaning crews) before trying to force compliance."
      },
      {
        id: "c16-l5-b4",
        type: "decision_scenario",
        decisionIntro: "How should a manager handle the feedback that the new waste sorting bins are confusing and slow down work?",
        decisionPrompt: "Select the best managerial response:",
        decisionChoices: [
          {
            label: "Send an email warning employees that recycling compliance is mandatory",
            correct: false,
            feedback: "Incorrect. Threats do not clarify confusing labels or reduce distance issues."
          },
          {
            label: "Walk the floor, speak with employees and cleaning staff, adjust bin placements, and simplify labels",
            correct: true,
            feedback: "Correct. Resolving physical and instructional barriers makes the process practical and demonstrates support."
          },
          {
            label: "Remove the bins and cancel the program",
            correct: false,
            feedback: "Incorrect. Giving up is premature when simple physical or label updates can solve the problem."
          },
          {
            label: "Ask the sustainability team to write an article on why recycling is good",
            correct: false,
            feedback: "Incorrect. General awareness articles do not solve localized physical or layout problems."
          }
        ]
      }
    ]
  },
  {
    order: 5,
    title: "Create a Simple Communication Plan",
    minutes: 3,
    content: "Learn the core components of a workplace communication plan and select a practical sustainability communication message to improve in your own workplace.",
    blocks: [
      {
        id: "c16-l6-b1",
        type: "heading",
        headingText: "Create a Simple Communication Plan"
      },
      {
        id: "c16-l6-b2",
        type: "short_text",
        bodyText: "A basic sustainability communication plan maps out: the sustainability action, communication objective, target audience, main message, expected employee action, channel, owner, and review date.\n\nBy keeping messages focused and tracking who is responsible, you can verify if communication is supporting behavioural change."
      },
      {
        id: "c16-l6-b3",
        type: "key_message",
        headingText: "Plan Example",
        bodyText: "Action: Reduce unnecessary air conditioning use.\nAudience: Office employees.\nMain message: Switch off A/C in empty meeting rooms.\nChannel: Manager briefing and room signage.\nOwner: Facilities coordinator.\nReview: Monthly electricity use spot check."
      },
      {
        id: "c16-l6-b4",
        type: "commitment_scenario",
        commitmentPrompt: "Which sustainability message in your workplace could be made clearer?",
        commitmentChoices: [
          "A waste-sorting instruction",
          "An energy-saving reminder",
          "A water-use procedure",
          "A sustainable purchasing requirement",
          "A progress update",
          "Another workplace message"
        ]
      }
    ]
  }
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "A facilities manager wants to encourage office workers to turn off computer monitors at the end of the day. Which message represents the most effective call to action?",
    options: [
      { text: "Help us protect the environment by saving electricity.", isCorrect: false, feedback: "Incorrect. This is too general and does not specify what action is required." },
      { text: "Green offices are better offices.", isCorrect: false, feedback: "Incorrect. This is an awareness slogan with no instruction or deadline." },
      { text: "From Monday, turn off computer monitors at the desk power switch at the end of every shift.", isCorrect: true, feedback: "Correct. This specifies the start date, the exact action, and when it should happen." },
      { text: "Corporate electricity costs are rising; do your part.", isCorrect: false, feedback: "Incorrect. This focuses on cost and lacks actionable guidance for employees." }
    ],
    correctExplanation: "Clear calls to action name a specific date, a precise action, and clear instructions on how and when to do it.",
    incorrectExplanation: "Vague slogans, moral appeals, or cost warnings do not tell employees exactly what behavior is expected.",
    practicalTakeaway: "Always include a start date, a specific action, and clear instructions in your sustainability alerts."
  },
  {
    question: "You are tasked with communicating new sustainable purchasing guidelines to a procurement department. What should your communication focus on?",
    options: [
      { text: "A broad presentation on the global plastic crisis and marine life.", isCorrect: false, feedback: "Incorrect. Procurement teams need specifications, not generic environmental lectures." },
      { text: "Specific supplier requirements, material standards, and certification criteria.", isCorrect: true, feedback: "Correct. The purchasing team needs operational data and specific criteria to evaluate vendor bids." },
      { text: "An announcement that the company is aiming to become fully green.", isCorrect: false, feedback: "Incorrect. Vague goals do not help buyers select or reject suppliers." },
      { text: "A request for buyers to use their personal judgement on what is sustainable.", isCorrect: false, feedback: "Incorrect. Personal judgement leads to inconsistent purchases; procurement requires clear standards." }
    ],
    correctExplanation: "Procurement teams need concrete standards, material requirements, and vendor criteria to apply during buying cycles.",
    incorrectExplanation: "Lectures, vague slogans, or unstructured criteria do not support operational procurement processes.",
    practicalTakeaway: "Match communication to the team's operational needs; give procurement specific criteria, not slogans."
  },
  {
    question: "A laundry department in a hotel is introducing a water-reuse procedure for washing sheets. What is the best channel combination to communicate this change to shift operators?",
    options: [
      { text: "Mention it in the annual corporate sustainability report.", isCorrect: false, feedback: "Incorrect. Shift operators do not read annual reports to find shift instructions." },
      { text: "Supervisor briefing before shifts, combined with illustrated instruction cards placed directly at the control panels.", isCorrect: true, feedback: "Correct. Verbal briefings build initial understanding, and point-of-use signs remind staff at the moment of action." },
      { text: "Post the policy document on the company's external website.", isCorrect: false, feedback: "Incorrect. External websites are for marketing and public relations, not internal operational procedures." },
      { text: "Send a department-wide email notice.", isCorrect: false, feedback: "Incorrect. Laundry operators are usually on the floor and may not check emails regularly." }
    ],
    correctExplanation: "Point-of-use visual instructions supported by verbal team briefings are highly effective for hands-on, operational environments.",
    incorrectExplanation: "Emails, external websites, or annual reports fail to reach frontline workers when they are performing tasks.",
    practicalTakeaway: "For operational tasks, place clear visual instructions directly at the point of action."
  },
  {
    question: "Which of the following environmental updates is most credible for a company announcement board?",
    options: [
      { text: "We have eliminated our carbon footprint entirely.", isCorrect: false, feedback: "Incorrect. This is an exaggerated and scientifically unsupported claim." },
      { text: "Our corporate headquarters is now completely sustainable.", isCorrect: false, feedback: "Incorrect. 'Sustainable' is too vague and lacks evidence or specific boundaries." },
      { text: "Since January, we have replaced disposable plastic cups with ceramic mugs in the office, reducing cup waste by an estimated 1,200 units per month.", isCorrect: true, feedback: "Correct. This states the action, timeline, scope, and a specific, supportable result." },
      { text: "We have gone green across all departments.", isCorrect: false, feedback: "Incorrect. 'Going green' is a vague claim that doesn't explain what actually changed." }
    ],
    correctExplanation: "Credible communication describes specific, supportable actions, timeframes, and measurable results while avoiding vague terms.",
    incorrectExplanation: "Exaggerated claims or generic terms like 'completely sustainable' harm trust because they cannot be verified.",
    practicalTakeaway: "Replace vague words like 'green' with specific, verifiable descriptions of actions and outcomes."
  },
  {
    question: "A company has reduced single-use plastic water bottles in the customer-service department but has not yet rolled the program out company-wide. Which statement is most credible?",
    options: [
      { text: "Our company is now completely plastic-free.", isCorrect: false, feedback: "Incorrect. This is false and misleads readers about the overall company status." },
      { text: "We have eliminated plastic waste.", isCorrect: false, feedback: "Incorrect. Exaggerating scope destroys credibility." },
      { text: "The customer-service department replaced single-use water bottles with refillable bottles during the three-month pilot.", isCorrect: true, feedback: "Correct. This accurately states the scope (one department), the action (refillable bottles), and the timeframe (three-month pilot)." },
      { text: "We are leading Mauritius toward a waste-free future.", isCorrect: false, feedback: "Incorrect. This is PR puffery rather than an honest, supportable update." }
    ],
    correctExplanation: "Honest progress reporting limits claims to the actual scope, department, and timeline where the action occurred.",
    incorrectExplanation: "Declaring the entire company plastic-free or using marketing slogans misleads the reader and violates integrity.",
    practicalTakeaway: "Always limit your claim to the exact scope and departments where the change took place."
  },
  {
    question: "After setting up new recycling bins, the facilities coordinator notices that general waste is still being mixed with recyclables. What is the most constructive response?",
    options: [
      { text: "Send a warning email stating that sorting is mandatory and compliance will be monitored.", isCorrect: false, feedback: "Incorrect. Warnings do not address physical or design barriers that make sorting difficult." },
      { text: "Remove the sorting bins since employees are not showing commitment.", isCorrect: false, feedback: "Incorrect. Premature cancellation ignores the possibility that the sorting process is poorly designed." },
      { text: "Walk the floor, check bin locations and labels, talk with employees and cleaning staff, and adjust setup to simplify sorting.", isCorrect: true, feedback: "Correct. Active review identifies barriers, such as distant bins or confusing labels, which can then be fixed." },
      { text: "Post photos of the contaminated bins to shame the department.", isCorrect: false, feedback: "Incorrect. Naming and shaming damages team relationships and fails to solve the root problem." }
    ],
    correctExplanation: "Low participation is usually caused by process issues, confusing instructions, or inconvenient bin layouts. Investigating barriers solves this.",
    incorrectExplanation: "Threats, public shaming, or cancelling the program fail to address the core usability problems.",
    practicalTakeaway: "When compliance is low, check if the process is convenient and the instructions are clear."
  },
  {
    question: "Which set of fields represents the core elements of a simple internal sustainability communication plan?",
    options: [
      { text: "Action, target audience, main message, expected employee action, channel, owner, and review date.", isCorrect: true, feedback: "Correct. These cover what is changing, who needs to know, what they must do, how they will be reached, who owns the message, and when progress is checked." },
      { text: "Marketing budget, PR agency contact list, advertising schedule, and spokesperson photos.", isCorrect: false, feedback: "Incorrect. These are public relations and external advertising elements, not internal operational plan fields." },
      { text: "Legal disclosure templates, corporate liability waivers, and regulatory fines listings.", isCorrect: false, feedback: "Incorrect. Internal plans focus on coordination and action, not legal defense scripts." },
      { text: "A list of global environmental NGOs and their contact details.", isCorrect: false, feedback: "Incorrect. NGO contact lists do not help organize internal employee messaging actions." }
    ],
    correctExplanation: "An internal communication plan focuses on coordinating action: mapping messages, target groups, required behaviors, channels, owners, and review dates.",
    incorrectExplanation: "Marketing, PR, external advertising, or legal scripts are outside the scope of internal workplace sustainability coordination.",
    practicalTakeaway: "Keep plans action-oriented, specifying target audience, clear expected behaviors, channels, and owners."
  },
  {
    question: "Your office missed its Q1 energy-saving goal of 20% because energy-efficient lighting upgrades were delayed. How should you report this to employees?",
    options: [
      { text: "Report that the energy program is on track and ignore the Q1 figures.", isCorrect: false, feedback: "Incorrect. Hiding results is dishonest and damages employee trust." },
      { text: "Explain that energy consumption dropped by 5% instead of 20% due to delayed lighting upgrades, and share the rescheduled installation plan.", isCorrect: true, feedback: "Correct. Honest reporting builds credibility, explains the reason for the delay, and shares next steps." },
      { text: "Cancel the energy program and stop reporting energy metrics.", isCorrect: false, feedback: "Incorrect. Abandoning the program avoids accountability and stops valuable progress." },
      { text: "Blame employees for not turning off lights to explain why the goal was missed.", isCorrect: false, feedback: "Incorrect. Blaming employees is dishonest when the main driver was a delay in equipment upgrades." }
    ],
    correctExplanation: "Honest progress reporting states the actual numbers, explains any technical delays or setbacks, and shares the revised timeline.",
    incorrectExplanation: "Covering up results, blaming employees, or cancelling the program destroys trust and accountability.",
    practicalTakeaway: "Communicate progress honestly; explain delays and outline the next steps to build long-term trust."
  }
];

export async function ensureCommunicatingSustainabilityAtWorkCourse() {
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

      // 2. Resolve Course 15
      let course15 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-15")
      });
      if (!course15) {
        course15 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "building-workplace-sustainability-team")
        });
      }

      if (!course15) {
        throw new Error("Data integrity error: Course 15 (ELH-15) not found. Prerequisite cannot be established.");
      }

      // 3. Resolve or insert Course 16
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

      // 4. Update Course 15 recommendedNextCourseId to point to Course 16 preserving admin edits
      let isSystemManaged = false;
      if (course15.recommendedNextCourseId) {
        const currentRecommendedCourse = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.id, course15.recommendedNextCourseId)
        });
        if (currentRecommendedCourse && currentRecommendedCourse.courseCode === "ELH-16") {
          isSystemManaged = true;
        }
      }

      if (course15.recommendedNextCourseId === null || course15.recommendedNextCourseId === actualCourseId || isSystemManaged) {
        await tx.update(coursesTable).set({
          recommendedNextCourseId: actualCourseId
        }).where(eq(coursesTable.id, course15.id));
      } else {
        logger.warn(`Recommendation conflict: Course 15 currently recommends course ID ${course15.recommendedNextCourseId} instead of Course 16 (ID: ${actualCourseId}). Preserving administrator edit.`);
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
          icon: "message-square",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 19,
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
      // Prerequisite 1: Course 15
      const existingPrereq15 = await tx.query.coursePrerequisitesTable.findFirst({
        where: and(
          eq(coursePrerequisitesTable.courseId, actualCourseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, course15.id)
        )
      });
      if (!existingPrereq15) {
        await tx.insert(coursePrerequisitesTable).values({
          courseId: actualCourseId,
          prerequisiteCourseId: course15.id
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
          where: inArray(lessonProgressTable.lessonId, existingLessons.map(l => l.id))
        });
      }

      if (existingLessonProgress.length === 0 && (existingLessons.length === 0 || hasOnlySkeletonLessons)) {
        if (hasOnlySkeletonLessons) {
          await tx.delete(lessonsTable).where(eq(lessonsTable.courseId, actualCourseId));
        }

        // Insert new lessons in order if they don't already exist or are skeletons
        for (const lesson of NEW_LESSONS) {
          const lExist = await tx.query.lessonsTable.findFirst({
            where: and(
              eq(lessonsTable.courseId, actualCourseId),
              eq(lessonsTable.orderIndex, lesson.order)
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
