import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
  quizAttemptsTable,
} from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_ID = 9;
const COURSE_SLUG = "esg-basics";
const COURSE_TITLE = "ESG Basics";
const BADGE_SLUG = "esg-fundamentals";
const SEED_NAME = "esg-basics-v1";
const SKELETON_BADGE_SLUG = "esg-fundamentals";

const COURSE_META = {
  description: "Introduces Environmental, Social and Governance factors and explains how employee actions, policies, records and decisions contribute to company performance, accountability and credibility.",
  fullDescription:
    "Give all employees a clear understanding of ESG and their place within a company’s wider responsibilities, evidence and reporting processes.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "ESG and Compliance",
  isFeatured: false,
  thumbnailUrl: "/images/courses/esg-basics.jpg",
  learningObjectives: [
    "Define Environmental, Social and Governance in plain workplace language.",
    "Distinguish ESG from marketing, charitable activity or environmental claims alone.",
    "Recognise practical Environmental, Social and Governance examples.",
    "Connect daily actions and records with company-level evidence and decisions.",
    "Respond appropriately when ESG information is missing, uncertain or unsupported.",
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "You have completed ESG Basics. You can now recognise Environmental, Social and Governance factors, connect everyday workplace actions with company evidence and respond more responsibly when information is uncertain or incomplete.",
  badgeName: "ESG Fundamentals",
  badgeDescription:
    "Recognises an understanding of Environmental, Social and Governance fundamentals, accurate workplace evidence and responsible handling of ESG-related information.",
  recommendedNextCourseId: 10, // Environmental Compliance
};

// ─────────────────────────────────────────────────────────────────────────────
// Lesson content
// ─────────────────────────────────────────────────────────────────────────────
const NEW_LESSONS = [
  {
    order: 0,
    title: "A Company Claim Needs Evidence",
    minutes: 3,
    content: "Introduce ESG through a realistic workplace situation where a company statement is challenged by a request for evidence.",
    blocks: [
      {
        id: "c9-l1-b1",
        type: "heading",
        content: "A positive claim is only the beginning",
      },
      {
        id: "c9-l1-b2",
        type: "text",
        content:
          "Your company is preparing information for an important client.\n\nThe draft says:\n> “We take care of the environment, support our employees and operate responsibly.”\n\nThe client responds with a simple question:\n> “What evidence can you provide?”\n\nThe statement may reflect good intentions, but good intentions are not the same as evidence.\n\nA credible response may require policies, training records, invoices, inspection logs, incident reports, energy or water records, supplier information, meeting decisions or other approved documents.",
      },
      {
        id: "c9-l1-b3",
        type: "heading",
        content: "Why it matters",
      },
      {
        id: "c9-l1-b4",
        type: "text",
        content:
          "Companies are increasingly asked to explain how they manage environmental impacts, people-related responsibilities and decision-making.\n\nEmployees contribute to that explanation every time they:\n- Follow a procedure.\n- Record an activity.\n- Report a fault or concern.\n- Complete training.\n- Approve a purchase.\n- Handle employee or customer information.\n- Communicate a company claim.\n- Keep an accurate document.\n\nESG is therefore not limited to senior management. It connects everyday work with wider company responsibility.",
      },
      {
        id: "c9-l1-b5",
        type: "workplace_example",
        title: "Workplace Example: Water Waste",
        content:
          "A hotel says that it reduces water waste.\n\nUseful supporting evidence might include:\n- Leak reports.\n- Maintenance records.\n- Water-consumption records.\n- Staff instructions.\n- Records showing that faults were corrected.\n\nA photograph of a reusable bottle or a general statement about caring for the environment would not, by itself, prove that water use is being managed.",
      },
      {
        id: "c9-l1-b6",
        type: "scenario",
        scenarioText:
          "A client asks for evidence supporting an environmental claim. The records available to you are incomplete.\n\nWhat is the most responsible first action?",
        options: [
          {
            id: "opt-1",
            text: "Estimate the missing information so the response looks complete.",
            isCorrect: false,
            feedback: "This creates information that may not be reliable. An estimate should never be presented as a verified fact. Missing information should be identified honestly.",
          },
          {
            id: "opt-2",
            text: "Send the marketing statement again because it has already been approved.",
            isCorrect: false,
            feedback: "Approval of a statement does not automatically provide evidence for it. The request should be directed to the person responsible for the relevant records.",
          },
          {
            id: "opt-3",
            text: "Identify what is verified, explain what is missing and refer the request through the correct company process.",
            isCorrect: true,
            feedback: "Correct. This protects the credibility of the company and allows the responsible person to provide accurate information or explain any limitations.",
          },
          {
            id: "opt-4",
            text: "Ignore the request because ESG is only a management responsibility.",
            isCorrect: false,
            feedback: "Employees may not own the final report, but they still have a responsibility to route requests and handle information appropriately.",
          },
        ],
      },
      {
        id: "c9-l1-b7",
        type: "key_message",
        content: "ESG credibility depends on what a company does, how it manages the activity and what reliable evidence it can provide.",
      },
    ],
  },
  {
    order: 1,
    title: "What ESG Means",
    minutes: 4,
    content: "Define Environmental, Social and Governance clearly and distinguish ESG from isolated good deeds or promotional claims.",
    blocks: [
      {
        id: "c9-l2-b1",
        type: "heading",
        content: "Environmental, Social and Governance",
      },
      {
        id: "c9-l2-b2",
        type: "text",
        content:
          "ESG is a way of looking at how a company manages three connected areas:\n\n**Environmental**\nHow the organisation interacts with natural resources and environmental systems.\nWorkplace examples may include: Energy use, Water use, Waste and materials, Pollution prevention, Transport and emissions, Biodiversity and site impacts, Environmental incidents and maintenance.\n\n**Social**\nHow the organisation affects people.\nWorkplace examples may include: Health and safety, Working conditions, Training and development, Respectful treatment, Inclusion and fair processes, Customer wellbeing, Community impacts, Labour conditions within supply chains.\n\n**Governance**\nHow the organisation is directed, controlled and held accountable.\nWorkplace examples may include: Clear responsibilities, Policies and approvals, Ethical conduct, Conflicts of interest, Accurate records, Oversight and internal controls, Reporting concerns, Transparent decision-making.",
      },
      {
        id: "c9-l2-b3",
        type: "heading",
        content: "Important Clarification",
      },
      {
        id: "c9-l2-b4",
        type: "text",
        content:
          "ESG does not mean that every issue fits neatly into only one category.\n\nFor example:\n- Unsafe handling of chemicals may affect the environment and employee safety.\n- A misleading environmental claim may involve environmental information and governance.\n- Supplier working conditions may involve social responsibility, purchasing and governance.\n- Failure to report a spill may involve environmental impact, employee responsibility and management oversight.",
      },
      {
        id: "c9-l2-b5",
        type: "heading",
        content: "ESG is not only charity",
      },
      {
        id: "c9-l2-b6",
        type: "text",
        content:
          "A company donation may provide a genuine community benefit. However, a donation does not replace responsible management of:\n- Employee safety.\n- Waste.\n- Water.\n- Energy.\n- Supplier practices.\n- Business ethics.\n- Accurate records.\n\nCharitable activity may form part of a company’s wider social contribution, but ESG concerns how the company operates as a whole.",
      },
      {
        id: "c9-l2-b7",
        type: "heading",
        content: "ESG is not only marketing",
      },
      {
        id: "c9-l2-b8",
        type: "text",
        content:
          "A well-written sustainability page is communication.\nESG management requires underlying actions, responsibilities and evidence.",
      },
      {
        id: "c9-l2-b9",
        type: "scenario",
        scenarioText:
          "Classify the following example using its strongest primary category:\n\nRecording and correcting a water leak",
        options: [
          {
            id: "opt-env",
            text: "Environmental",
            isCorrect: true,
            feedback: "Correct. Water management is an Environmental issue.",
          },
          {
            id: "opt-soc",
            text: "Social",
            isCorrect: false,
            feedback: "Incorrect. The primary impact is on natural resources (Environmental).",
          },
          {
            id: "opt-gov",
            text: "Governance",
            isCorrect: false,
            feedback: "Incorrect. While recording relates to Governance, the core issue is Environmental.",
          },
        ],
      },
      {
        id: "c9-l2-b10",
        type: "scenario",
        scenarioText:
          "Classify the following example using its strongest primary category:\n\nDeclaring a personal conflict before approving a supplier",
        options: [
          {
            id: "opt-env",
            text: "Environmental",
            isCorrect: false,
            feedback: "Incorrect. Conflicts of interest relate to how the company is controlled.",
          },
          {
            id: "opt-soc",
            text: "Social",
            isCorrect: false,
            feedback: "Incorrect. This is primarily about ethical decision-making.",
          },
          {
            id: "opt-gov",
            text: "Governance",
            isCorrect: true,
            feedback: "Correct. Conflicts of interest and approvals are Governance actions.",
          },
        ],
      },
      {
        id: "c9-l2-b11",
        type: "key_message",
        content: "Environmental concerns natural systems, Social concerns people and Governance concerns how decisions, responsibilities and controls are managed.",
      },
    ],
  },
  {
    order: 2,
    title: "ESG in Everyday Mauritian Workplaces",
    minutes: 3,
    content: "Connect ESG concepts with practical situations across different Mauritian business sectors.",
    blocks: [
      {
        id: "c9-l3-b1",
        type: "heading",
        content: "ESG appears in routine work",
      },
      {
        id: "c9-l3-b2",
        type: "text",
        content:
          "ESG may sound like a boardroom subject, but the supporting actions often happen during ordinary work.\nDifferent employees contribute in different ways.",
      },
      {
        id: "c9-l3-b3",
        type: "bulleted-list",
        items: [
          "**An office team** may contribute by following purchasing approvals, avoiding unsupported environmental claims, recording training completion, protecting confidential information, reporting damaged equipment, using approved suppliers, and following conflict-of-interest procedures.",
          "**A hotel team** may contribute by reporting water leaks quickly, following hygiene and safety procedures, recording maintenance work, sorting waste according to collection arrangements, treating employees and guests respectfully, and avoiding unverified claims.",
          "**A retail employee** may contribute by following safety procedures, recording damaged stock accurately, escalating a misleading product claim, and treating customers fairly.",
          "**A construction team** may contribute by following spill-prevention procedures, recording waste removal, using approved contractors, reporting unsafe conditions, and escalating environmental or community concerns.",
          "**A factory employee** may contribute by recording production data accurately, reporting equipment faults, following safety and waste procedures, avoiding unauthorised shortcuts, and raising concerns when records do not match actual conditions."
        ],
      },
      {
        id: "c9-l3-b4",
        type: "scenario",
        scenarioText:
          "A waste collection did not take place, but the monthly spreadsheet already shows the waste as collected. What is the best action?",
        options: [
          {
            id: "opt-1",
            text: "Correct or flag the record through the approved process. Do not leave information that you know is inaccurate.",
            isCorrect: true,
            feedback: "Correct. Accurate records are a fundamental Governance responsibility.",
          },
          {
            id: "opt-2",
            text: "Ignore it, as it will probably balance out next month.",
            isCorrect: false,
            feedback: "Leaving inaccurate information undermines the credibility of the company's reporting.",
          },
        ],
      },
      {
        id: "c9-l3-b5",
        type: "scenario",
        scenarioText:
          "A supplier description says that a product is “eco-friendly” but provides no supporting information. What is the best action?",
        options: [
          {
            id: "opt-1",
            text: "Trust the description since suppliers rarely lie.",
            isCorrect: false,
            feedback: "A claim without evidence is not sufficient for responsible procurement.",
          },
          {
            id: "opt-2",
            text: "Treat the statement as an unverified claim and request useful evidence before relying on it.",
            isCorrect: true,
            feedback: "Correct. Evidence is required to support any ESG-related claim.",
          },
        ],
      },
      {
        id: "c9-l3-b6",
        type: "key_message",
        content: "An employee does not need to manage the entire ESG programme to contribute. Accurate actions, records and escalation all matter.",
      },
    ],
  },
  {
    order: 3,
    title: "From Employee Action to Company Evidence",
    minutes: 4,
    content: "Show how individual actions and records can become useful company-level information.",
    blocks: [
      {
        id: "c9-l4-b1",
        type: "heading",
        content: "How everyday work becomes evidence",
      },
      {
        id: "c9-l4-b2",
        type: "bulleted-list",
        items: [
          "**Action**: Something happens or a task is completed.",
          "**Record**: The relevant information is documented.",
          "**Review**: An authorised person checks the information.",
          "**Decision or indicator**: The company uses verified information to understand performance or decide what to improve.",
          "**Communication**: Approved information may be shared internally or externally."
        ],
      },
      {
        id: "c9-l4-b3",
        type: "workplace_example",
        title: "Example: A leaking tap",
        content:
          "A leaking tap is reported.\n- The employee notices and reports the leak.\n- The maintenance request records the location and date.\n- The facilities team completes and records the repair.\n- Management can identify recurring problems or maintenance needs.\n- Verified information may later support a company statement about water management.\n\nThe original employee did not prepare an ESG report, but the employee’s accurate action supported the evidence chain.",
      },
      {
        id: "c9-l4-b4",
        type: "heading",
        content: "Principles of reliable information",
      },
      {
        id: "c9-l4-b5",
        type: "bulleted-list",
        items: [
          "ESG-related records should be accurate, complete enough for their purpose, recorded at the appropriate time, based on actual information, traceable, and protected from unauthorised changes.",
          "Employees should NOT guess missing values, backdate an activity that did not occur, copy information from an unrelated period, change a record to improve a result, or confirm a claim they cannot verify."
        ],
      },
      {
        id: "c9-l4-b6",
        type: "scenario",
        scenarioText:
          "A monthly record contains three missing entries. Your manager needs the total today. Choose the best response.",
        options: [
          {
            id: "opt-1",
            text: "Use the average from previous months and enter it without explanation.",
            isCorrect: false,
            feedback: "An estimate may sometimes be permitted, but it must use an approved method and be clearly identified. It must not be disguised as measured data.",
          },
          {
            id: "opt-2",
            text: "Enter zero for every missing value.",
            isCorrect: false,
            feedback: "Zero means that nothing occurred. It must not be used merely because the actual value is unavailable.",
          },
          {
            id: "opt-3",
            text: "Explain the data gap, confirm what is verified and ask the responsible person how missing information should be handled.",
            isCorrect: true,
            feedback: "Correct. This preserves accuracy and allows an approved approach to be used.",
          },
          {
            id: "opt-4",
            text: "Leave the fields blank and say nothing.",
            isCorrect: false,
            feedback: "Leaving information unexplained may create a misleading result. The limitation should be raised through the correct process.",
          },
        ],
      },
      {
        id: "c9-l4-b7",
        type: "key_message",
        content: "Honest information is more useful than a complete-looking record that cannot be trusted.",
      },
    ],
  },
  {
    order: 4,
    title: "Scenario, Pressure to Improve the Story",
    minutes: 4,
    content: "Test whether the learner can handle pressure to make ESG information appear stronger than the evidence supports.",
    blocks: [
      {
        id: "c9-l5-b1",
        type: "heading",
        content: "“Can you make the figures look better?”",
      },
      {
        id: "c9-l5-b2",
        type: "text",
        content:
          "A company is responding to a client questionnaire.\n\nThe draft response says:\n> “All workplace waste is recycled.”\n\nYou know that:\n- Some recyclable materials are collected separately.\n- General waste is also collected.\n- Records for two months are incomplete.\n- The company has not verified what happens to every material after collection.\n\nA manager says:\n> “The client expects a positive answer. Just use the sentence for now. We can improve the records later.”",
      },
      {
        id: "c9-l5-b3",
        type: "scenario",
        scenarioText:
          "What should you do?",
        options: [
          {
            id: "opt-1",
            text: "Use the statement because a manager instructed you to do so.",
            isCorrect: false,
            feedback: "A manager’s instruction does not make unsupported information accurate. The concern should be handled through the company’s authorised review or escalation process.\n\nConsequence: The company may communicate a claim that it cannot demonstrate and later lose credibility when evidence is requested.",
          },
          {
            id: "opt-2",
            text: "Change the statement to “Most waste is recycled” without checking the figures.",
            isCorrect: false,
            feedback: "This still creates an unsupported claim. Replacing one unverified statement with another does not resolve the problem.\n\nConsequence: The wording sounds more cautious but remains unreliable.",
          },
          {
            id: "opt-3",
            text: "Explain what the records genuinely show, identify the gaps and ask for the response to be reviewed by the responsible person.",
            isCorrect: true,
            feedback: "Correct. The response can describe verified collection arrangements without claiming more than the evidence supports.\n\nConsequence: The client receives a more accurate answer and the company can identify what record keeping needs to improve.",
          },
          {
            id: "opt-4",
            text: "Post the concern publicly so that the company cannot hide it.",
            isCorrect: false,
            feedback: "Serious concerns should be handled through approved reporting and escalation channels unless there is an immediate safety issue or another formal requirement. Public disclosure is not the appropriate first response in this scenario.\n\nConsequence: Confidential information may be shared without authorisation and the underlying data problem may remain unresolved.",
          },
        ],
      },
      {
        id: "c9-l5-b4",
        type: "text",
        content:
          "**Model responsible response:**\n“The company separates selected recyclable materials through its current collection arrangements. Available records confirm some collections, but the information is not sufficient to verify that all workplace waste is recycled. The response should be reviewed and limited to the evidence currently available.”",
      },
      {
        id: "c9-l5-b5",
        type: "key_message",
        content: "Credible ESG communication should reflect verified actions and records, including any relevant limitations.",
      },
    ],
  },
  {
    order: 5,
    title: "Knowledge Check, Commitment and Completion",
    minutes: 2,
    content: "Reinforce the main ideas, deliver the formal assessment and record one practical learner commitment.",
    blocks: [
      {
        id: "c9-l6-b1",
        type: "heading",
        content: "What ESG means in practice",
      },
      {
        id: "c9-l6-b2",
        type: "text",
        content:
          "Environmental, Social and Governance factors help a company understand and manage its wider impacts, responsibilities and decision-making.\n\nEmployees contribute by:\n- Following approved procedures.\n- Acting responsibly.\n- Maintaining accurate records.\n- Reporting incidents and concerns.\n- Avoiding unsupported claims.\n- Protecting the integrity of company information.\n- Escalating uncertainty through the correct process.\n\nESG is not limited to a report. The report, dashboard or client response depends on what happens throughout the organisation.",
      },
      {
        id: "c9-l6-b3",
        type: "commitment",
        options: [
          "I will verify information before repeating a sustainability or ESG claim.",
          "I will record one relevant workplace activity more carefully.",
          "I will find out who receives ESG, environmental or ethical concerns in my organisation.",
          "I will report missing or inaccurate information rather than guessing.",
          "I will review one procedure connected with my role."
        ],
      },
      {
        id: "c9-l6-b4",
        type: "heading",
        content: "ESG starts with credible everyday practice",
      },
      {
        id: "c9-l6-b5",
        type: "text",
        content:
          "You have completed ESG Basics.\n\nYou can now recognise Environmental, Social and Governance factors, connect everyday workplace actions with company evidence and respond more responsibly when information is uncertain or incomplete.\n\nYour next recommended course is:\n**ELH-10: Environmental Compliance**",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Quiz content
// ─────────────────────────────────────────────────────────────────────────────
const NEW_QUIZ_QUESTIONS = [
  {
    questionText: "Which description best explains ESG in a workplace?",
    practicalTakeaway: "Look for the underlying actions, controls and evidence rather than the label alone.",
    options: [
      {
        text: "A programme for making donations to environmental organisations",
        isCorrect: false,
        feedback: "Charitable activity may contribute to a social or environmental objective, but it does not cover how the whole organisation operates.",
      },
      {
        text: "A way of considering environmental impacts, people-related responsibilities and how the company is governed",
        isCorrect: true,
        feedback: "Correct. ESG connects environmental, social and governance responsibilities with company actions and decisions.",
      },
      {
        text: "A marketing method used to make products appear greener",
        isCorrect: false,
        feedback: "ESG communication should be supported by evidence. Marketing alone is not ESG management.",
      },
      {
        text: "A financial report prepared only by accountants",
        isCorrect: false,
        feedback: "Financial and reporting teams may contribute, but ESG involves responsibilities and evidence across the organisation.",
      },
    ],
    correctExplanation: "ESG considers how a company interacts with the environment, affects people and manages decisions, responsibilities and accountability.",
    incorrectExplanation: "ESG is broader than donations, marketing or one department’s report.",
  },
  {
    questionText: "A company makes an annual community donation but repeatedly ignores employee safety concerns. What is the most accurate conclusion?",
    practicalTakeaway: "Evaluate the relevant action and evidence rather than relying on a general positive impression.",
    options: [
      {
        text: "The donation proves that the company has strong ESG performance",
        isCorrect: false,
        feedback: "One positive activity does not demonstrate performance across all ESG responsibilities.",
      },
      {
        text: "Community donations cancel out workplace safety problems",
        isCorrect: false,
        feedback: "Positive community activity does not cancel out harm or unmanaged risk elsewhere.",
      },
      {
        text: "The donation may be positive, but it does not replace responsible management of employee safety",
        isCorrect: true,
        feedback: "Correct. Charitable activity and workplace responsibility should be considered separately and honestly.",
      },
      {
        text: "Safety is a governance issue and has no connection to the Social category",
        isCorrect: false,
        feedback: "Employee safety is primarily a Social issue, although governance determines how responsibilities and controls are managed.",
      },
    ],
    correctExplanation: "ESG considers how the company operates overall. A positive donation does not remove the need to manage workplace safety.",
    incorrectExplanation: "Do not use one positive activity to hide or offset an unrelated problem.",
  },
  {
    questionText: "Which example is primarily Environmental?",
    practicalTakeaway: "Identify the strongest primary category while recognising that responsibilities may overlap.",
    options: [
      {
        text: "Declaring a conflict of interest before approving a supplier",
        isCorrect: false,
        feedback: "This is primarily a Governance action.",
      },
      {
        text: "Recording and repairing a recurring water leak",
        isCorrect: true,
        feedback: "Correct. Water use and leak management are primarily Environmental matters.",
      },
      {
        text: "Providing respectful treatment during recruitment",
        isCorrect: false,
        feedback: "This is primarily a Social matter.",
      },
      {
        text: "Reviewing who is authorised to approve company claims",
        isCorrect: false,
        feedback: "This is primarily a Governance matter.",
      },
    ],
    correctExplanation: "Water use and leak management directly concern the organisation’s use of natural resources.",
    incorrectExplanation: "Environmental examples generally relate to resources, waste, emissions, pollution, ecosystems or similar impacts.",
  },
  {
    questionText: "Which example is primarily Social?",
    practicalTakeaway: "Social responsibility appears in daily employment, safety, customer and supply-chain practices.",
    options: [
      {
        text: "Ensuring that employees receive suitable safety training",
        isCorrect: true,
        feedback: "Correct. Employee safety, wellbeing, treatment and development are Social matters.",
      },
      {
        text: "Approving environmental claims through a documented process",
        isCorrect: false,
        feedback: "This is primarily Governance because it concerns review, approval and accountability.",
      },
      {
        text: "Recording electricity consumption",
        isCorrect: false,
        feedback: "This is primarily Environmental, although accurate records also involve governance.",
      },
      {
        text: "Declaring a personal relationship with a bidding supplier",
        isCorrect: false,
        feedback: "This is primarily Governance because it concerns conflicts of interest.",
      },
    ],
    correctExplanation: "Social factors concern how the organisation affects employees, customers, suppliers and communities.",
    incorrectExplanation: "Look for the option most directly connected with people and their treatment, safety or wellbeing.",
  },
  {
    questionText: "Which action best demonstrates Governance?",
    practicalTakeaway: "Good governance helps ensure that responsible actions are consistent, authorised and traceable.",
    options: [
      {
        text: "Switching off an unnecessary light",
        isCorrect: false,
        feedback: "This is primarily an Environmental action.",
      },
      {
        text: "Reporting a leaking tap",
        isCorrect: false,
        feedback: "This is primarily Environmental, although reporting procedures also involve governance.",
      },
      {
        text: "Following an approval process and declaring a conflict of interest",
        isCorrect: true,
        feedback: "Correct. Governance includes approvals, accountability, ethical conduct and conflicts of interest.",
      },
      {
        text: "Participating in a community clean-up",
        isCorrect: false,
        feedback: "This may support environmental or social objectives, but it is not the strongest Governance example.",
      },
    ],
    correctExplanation: "Governance concerns how responsibilities, decisions, approvals, ethics and oversight are organised.",
    incorrectExplanation: "Choose the action most directly connected with accountability and decision controls.",
  },
  {
    questionText: "You find missing values in an ESG-related spreadsheet shortly before it must be submitted. What should you do?",
    practicalTakeaway: "Explain uncertainty rather than hiding it.",
    options: [
      {
        text: "Enter estimated values without labelling them",
        isCorrect: false,
        feedback: "Unlabelled estimates may be mistaken for measured information.",
      },
      {
        text: "Enter zero because it is safer than leaving the fields blank",
        isCorrect: false,
        feedback: "Zero has a specific meaning and must not be used simply because information is missing.",
      },
      {
        text: "Explain the gap and ask the responsible person to apply an approved method",
        isCorrect: true,
        feedback: "Correct. Missing data should be handled transparently through an approved method.",
      },
      {
        text: "Copy the values from the previous reporting period",
        isCorrect: false,
        feedback: "Previous-period values do not automatically represent the current period.",
      },
    ],
    correctExplanation: "Data gaps should be identified honestly and handled using an authorised process.",
    incorrectExplanation: "Do not create complete-looking information at the expense of accuracy.",
  },
  {
    questionText: "What is the most appropriate ESG responsibility for an employee who does not prepare company reports?",
    practicalTakeaway: "Focus on the actions and information within your role.",
    options: [
      {
        text: "None, because ESG belongs only to executives",
        isCorrect: false,
        feedback: "Employees contribute through their actions, records and reporting responsibilities.",
      },
      {
        text: "Independently publish company performance information",
        isCorrect: false,
        feedback: "Company information should only be published through authorised processes.",
      },
      {
        text: "Follow procedures, keep accurate records and report relevant concerns",
        isCorrect: true,
        feedback: "Correct. Reliable company evidence begins with accurate everyday practice.",
      },
      {
        text: "Decide which reporting framework the company must use",
        isCorrect: false,
        feedback: "Reporting-framework decisions normally belong to authorised management or specialist roles.",
      },
    ],
    correctExplanation: "Every employee can support credible ESG practice without owning the final report.",
    incorrectExplanation: "The employee’s role is practical and evidence-related, not to make unauthorised reporting decisions.",
  },
  {
    questionText: "A company wants to say that all of its waste is recycled, but it has records for only some materials. What is the best response?",
    practicalTakeaway: "Use precise, evidence-based language rather than absolute claims.",
    options: [
      {
        text: "Publish the claim because some recycling takes place",
        isCorrect: false,
        feedback: "Some recycling does not prove that all waste is recycled.",
      },
      {
        text: "Describe only the verified arrangements and clearly identify the limits of the available information",
        isCorrect: true,
        feedback: "Correct. Communication should match the evidence and acknowledge relevant limitations.",
      },
      {
        text: "Use the claim temporarily and correct it after the next collection",
        isCorrect: false,
        feedback: "A temporary unsupported claim can still mislead clients, employees or the public.",
      },
      {
        text: "Remove all references to waste so no questions are asked",
        isCorrect: false,
        feedback: "Avoiding the subject does not improve the company’s records or response.",
      },
    ],
    correctExplanation: "A credible statement should not claim more than the available evidence supports.",
    incorrectExplanation: "Positive wording does not justify unsupported information.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seeder Function
// ─────────────────────────────────────────────────────────────────────────────
export async function ensureEsgBasicsCourse() {
  logger.info(`Checking and executing ${COURSE_TITLE} course content migration...`);

  try {
    const [seedRecord] = await db
      .select({ id: systemSeedsTable.id })
      .from(systemSeedsTable)
      .where(eq(systemSeedsTable.name, SEED_NAME))
      .limit(1);

    if (seedRecord) {
      logger.info(`[Seed] ${SEED_NAME} has already been run. Skipping to preserve subsequent administrator edits and quiz attempts.`);
      return;
    }

    let txHasFinished = false;

    await db.transaction(async (tx) => {
      // 1. Course Record
      let courseRecord;
      const [existingCourse] = await tx
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(
          or(
            eq(coursesTable.slug, COURSE_SLUG),
            eq(coursesTable.id, COURSE_ID)
          )
        )
        .limit(1);

      if (existingCourse) {
        [courseRecord] = await tx
          .update(coursesTable)
          .set({
            title: COURSE_TITLE,
            slug: COURSE_SLUG,
            ...COURSE_META,
            isPublished: true, // This publishes the course
            status: "published",
            updatedAt: new Date(),
          })
          .where(eq(coursesTable.id, existingCourse.id))
          .returning();
      } else {
        [courseRecord] = await tx
          .insert(coursesTable)
          .values({
            id: COURSE_ID,
            title: COURSE_TITLE,
            slug: COURSE_SLUG,
            ...COURSE_META,
            isPublished: true,
            status: "published",
          })
          .returning();
      }

      const actualCourseId = courseRecord.id;

      // 2. Badge Definition
      const [existingBadge] = await tx
        .select({ id: badgeDefinitionsTable.id })
        .from(badgeDefinitionsTable)
        .where(
          or(
            eq(badgeDefinitionsTable.slug, BADGE_SLUG),
            eq(badgeDefinitionsTable.slug, SKELETON_BADGE_SLUG)
          )
        )
        .limit(1);

      if (existingBadge) {
        await tx
          .update(badgeDefinitionsTable)
          .set({
            name: COURSE_META.badgeName,
            slug: BADGE_SLUG,
            description: COURSE_META.badgeDescription,
            courseIds: [actualCourseId],
          })
          .where(eq(badgeDefinitionsTable.id, existingBadge.id));
      } else {
        await tx.insert(badgeDefinitionsTable).values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "shield",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 13,
        });
      }

      // 3. Lessons (Replace ONLY if they are draft skeletons or empty to preserve manual admin edits)
      const existingLessons = await tx
        .select({ id: lessonsTable.id, content: lessonsTable.content })
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, actualCourseId));

      const hasSkeletonLessons = existingLessons.some(l => l.content && l.content.includes("[DRAFT SKELETON]"));
      
      if (existingLessons.length === 0 || hasSkeletonLessons) {
        if (hasSkeletonLessons) {
          await tx.delete(lessonsTable).where(eq(lessonsTable.courseId, actualCourseId));
        }
        
        const lessonsToInsert = NEW_LESSONS.map((l, idx) => ({
          courseId: actualCourseId,
          title: l.title,
          orderIndex: idx,
          durationMinutes: l.minutes || 10,
          content: l.content || "",
          contentBlocks: l.blocks || [],
        }));
        await tx.insert(lessonsTable).values(lessonsToInsert);
      } else {
        logger.info(`[Seed] Lessons for ${COURSE_TITLE} already exist and are not skeletons. Preserving manual administrator edits.`);
      }

      // 4. Quiz Questions (Replace ONLY if they are draft skeletons or empty to preserve user attempts and admin edits)
      const existingQuestions = await tx
        .select({ id: quizQuestionsTable.id, question: quizQuestionsTable.question })
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, actualCourseId));

      const hasSkeletonQuestions = existingQuestions.some(q => q.question.includes("[DRAFT SKELETON]"));

      if (existingQuestions.length === 0 || hasSkeletonQuestions) {
        if (hasSkeletonQuestions) {
          await tx.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, actualCourseId));
        }

        const quizQuestionsToInsert = NEW_QUIZ_QUESTIONS.map((q, idx) => {
          const correctIdx = q.options.findIndex(o => o.isCorrect);
          return {
            courseId: actualCourseId,
            question: q.questionText,
            practicalTakeaway: q.practicalTakeaway,
            options: q.options.map(o => o.text),
            correctOption: correctIdx !== -1 ? correctIdx : 0,
            orderIndex: idx,
            optionFeedback: q.options.map(o => o.feedback),
            correctExplanation: q.correctExplanation,
            incorrectExplanation: q.incorrectExplanation,
          };
        });
        await tx.insert(quizQuestionsTable).values(quizQuestionsToInsert);
      } else {
        logger.info(`[Seed] Quiz questions for ${COURSE_TITLE} already exist and are not skeletons. Preserving quiz history and admin edits.`);
      }

      // 5. Mark successful completion
      await tx.insert(systemSeedsTable).values({
        name: SEED_NAME,
        runAt: new Date(),
      });

      txHasFinished = true;
    });

    if (txHasFinished) {
      logger.info(`${COURSE_TITLE} course content and quiz safely migrated and published.`);
    }
  } catch (error) {
    logger.error(
      { err: error },
      `Failed to migrate ${COURSE_TITLE} course content`
    );
    throw error;
  }
}
