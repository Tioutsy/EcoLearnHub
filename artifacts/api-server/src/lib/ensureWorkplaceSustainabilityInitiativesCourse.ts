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

const COURSE_SLUG = "planning-and-delivering-workplace-sustainability-initiatives";
const COURSE_TITLE = "Planning and Delivering Workplace Sustainability Initiatives";
const BADGE_SLUG = "workplace-sustainability-initiative-practitioner";
const BADGE_CODE = "COURSE_ELH_23_COMPLETE";
const SEED_NAME = "workplace-sustainability-initiatives-v2";

const COURSE_META = {
  courseCode: "ELH-23",
  description: "Learn how to turn an identified sustainability opportunity into a controlled, feasible and evidence-based workplace initiative from approval and pilot testing to review and closeout.",
  fullDescription: "Master the complete lifecycle of workplace sustainability initiatives: from defining a real problem and gathering baseline evidence to establishing scope, checking feasibility, securing approvals, conducting controlled pilots, evaluating results, and embedding lasting operational practices.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/visual-sustainability-workplace-initiative.png",
  intendedRoles: ["employees", "supervisors", "department managers", "sustainability coordinators", "green-team members", "facilities leads", "ops leads"],
  learningObjectives: [
    "Distinguish an unverified sustainability idea or promotional campaign from a controlled workplace initiative.",
    "Describe the workplace problem or opportunity using available observations, operational records, and employee input.",
    "Define clear initiative scope, explicit exclusions, affected workplace areas, and operational boundaries.",
    "Assign an initiative owner, sponsor, approver, technical reviewer, data owner, and supporting contributors.",
    "Assess operational, technical, financial, and competence feasibility before committing organizational resources.",
    "Identify implementation risks, dependencies, and potential unintended trade-offs (e.g. hygiene, safety, packaging shift).",
    "Design and execute a controlled pilot project before deciding on full organization-wide rollout.",
    "Establish balanced success indicators covering activity, operational adoption, environmental result, and unexpected effects.",
    "Obtain appropriate approval through defined decision gates prior to implementation.",
    "Take a structured review decision: close, modify, embed into routine procedures, pause, stop, or scale responsibly."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "Congratulations! You have completed ELH-23: Planning and Delivering Workplace Sustainability Initiatives. You can now design, approve, pilot, deliver, and close reviewable workplace initiatives backed by verified evidence.",
  badgeName: "Workplace Sustainability Initiative Practitioner",
  badgeDescription: "Awarded for demonstrating practical competency in turning sustainability ideas into controlled, feasible, and reviewable workplace initiatives from baseline approval to closeout and operational embedding.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Course Introduction & Strategic Scope Boundaries",
    minutes: 2,
    content: "Understand the core purpose of ELH-23, target audience, duration, prerequisites, and explicit boundary matrix distinguishing initiative delivery from action planning and green team governance.",
    blocks: [
      {
        id: "c23-l0-b1",
        type: "heading",
        headingText: "Welcome to ELH-23: Controlled Initiative Delivery"
      },
      {
        id: "c23-l0-b2",
        type: "short_text",
        bodyText: "Turning a sustainability ambition into workplace reality requires more than enthusiasm or promotional posters. It demands controlled initiative delivery. ELH-23 teaches employees, supervisors, department managers, and green-team members how to convert an identified sustainability opportunity into a structured, feasible, approved, and reviewable workplace initiative.\n\nThis course is suitable for a 15–20-minute learning session. It provides practical workplace guidance and does not constitute formal project-management accreditation, environmental audit certification, engineering assurance, or legal advice."
      },
      {
        id: "c23-l0-b3",
        type: "key_message",
        headingText: "Structural Boundary & Progression Matrix",
        bodyText: "ELH-23 occupies a distinct position in the EcoLearnHub curriculum:\n\n• ELH-13 (Action Planning) creates an overarching multi-action plan across departmental goals; ELH-23 controls one defined workplace initiative from problem identification to closeout.\n• ELH-14 (Departmental Goals) establishes targets; ELH-23 designs initiatives that deliver against those targets.\n• ELH-15 & ELH-22 (Green Teams) establish team governance and operating discipline; ELH-23 provides the delivery mechanics for a specific team or department project.\n• ELH-17 (Tracking Actions) records register completion; ELH-23 manages the full initiative lifecycle (feasibility, pilot, approval gate, closeout review).\n• ELH-18 (Data Collection) collects raw metrics; ELH-23 uses data owners to verify baselines and measured results.\n• ELH-19 (Performance Review) conducts overall organizational performance review; ELH-23 conducts initiative-specific closeout reviews."
      }
    ]
  },
  {
    order: 1,
    title: "Opening Hook: The Uncontrolled 'Zero Disposable Cups' Campaign",
    minutes: 3,
    content: "Examine a realistic Mauritian commercial workplace scenario where positive environmental intentions without feasibility checks, consultation, or baselines caused operational chaos.",
    blocks: [
      {
        id: "c23-l1-b1",
        type: "heading",
        headingText: "Case Study: Grand Baie Enterprise Cup Campaign"
      },
      {
        id: "c23-l1-b2",
        type: "short_text",
        bodyText: "A multi-site commercial enterprise in Grand Baie launched a headline campaign titled 'Zero Disposable Cups in 30 Days' after an enthusiastic committee member saw discarded single-use cups in office breakrooms. Management quickly ordered 300 ceramic mugs, printed promotional banners, and announced the initiative.\n\nHowever, critical controls were completely ignored:\n1. No baseline volume was checked: procurement had already placed a non-refundable 6-month bulk order of paper cups.\n2. Housekeeping was omitted: no additional washing arrangements or sink space were allocated in staff breakrooms.\n3. Kitchen & Hygiene leads were not consulted: food safety protocols prohibited unwashed personal mugs near food prep areas.\n4. Night-shift employees were excluded: mug distribution occurred exclusively during day-shift office hours.\n5. Operational constraints were ignored: maintenance technicians working outdoors required portable covered containers for safety reasons.\n6. Success was declared on Day 1 because 300 mugs were distributed—even though mug loss, unwashed cup clutter, and continued paper cup usage created widespread frustration."
      },
      {
        id: "c23-l1-b3",
        type: "key_message",
        headingText: "Core Lesson",
        bodyText: "Distributing equipment or holding launch events is activity, not environmental success. Without baseline evidence, operational consultation, feasibility checks, and review dates, initiatives fail or create unintended operational trade-offs."
      }
    ]
  },
  {
    order: 2,
    title: "Why Controlled Initiatives Matter & Operational Limits",
    minutes: 2,
    content: "Understand why structured initiative controls protect organizations from wasted resources, initiative fatigue, and unverified green claims.",
    blocks: [
      {
        id: "c23-l2-b1",
        type: "heading",
        headingText: "Value & Boundaries of Workplace Initiatives"
      },
      {
        id: "c23-l2-b2",
        type: "short_text",
        bodyText: "Controlled workplace initiatives provide a safe bridge between high-level sustainability goals and daily operational routines. When delivered effectively, an initiative:\n\n• Tests proposed operational solutions in real workplace conditions before committing large budgets.\n• Coordinates effort across frontline departments (Operations, Maintenance, Procurement, HR, Finance).\n• Uncovers hidden operational dependencies, competence gaps, and technical constraints early.\n• Establishes baseline and post-implementation evidence before organization-wide rollout.\n\nHowever, initiative controls also enforce strict limits:\n• A visible campaign is not automatically an effective initiative.\n• Participation numbers or pledge signatures do not prove environmental improvement.\n• A pilot is a learning tool—not a disguised commitment to full rollout if results fail.\n• Sustainability labels do not override health, safety, hygiene, labour, or procurement controls."
      }
    ]
  },
  {
    order: 3,
    title: "Plain-Language Initiative Vocabulary",
    minutes: 2,
    content: "Master key initiative delivery terms in plain English to ensure clear communication across all workplace roles.",
    blocks: [
      {
        id: "c23-l3-b1",
        type: "heading",
        headingText: "Plain-Language Initiative Terminology"
      },
      {
        id: "c23-l3-b2",
        type: "short_text",
        bodyText: "To avoid confusion between ideas, routine tasks, and formal projects, use these precise definitions:\n\n• Sustainability Initiative: A time-bound, structured workplace project designed to test or implement a specific environmental or operational improvement.\n• Idea / Proposal: An unverified suggestion for improvement before evidence, scope, feasibility, or approval is established.\n• Routine Action: An ongoing operational task performed as part of regular job duties (e.g. routine leak checks).\n• Baseline: The verified starting condition or resource consumption rate recorded before initiative launch.\n• Scope & Exclusions: Explicit boundaries defining which sites, departments, shifts, and equipment are included or excluded.\n• Feasibility: Practical evaluation of technical capability, operational fit, financial cost, and staff competence.\n• Pilot / Trial: A limited, small-scale test of an initiative under real working conditions before wider deployment.\n• Approval Gate: A formal decision checkpoint where designated authority reviews evidence before funding or rollout.\n• Unintended Consequence: An unexpected operational, safety, or environmental side-effect caused by an initiative.\n• Closeout & Embedding: Formally ending the initiative phase and transitioning successful practices into standard operating procedures."
      }
    ]
  },
  {
    order: 4,
    title: "Sourced 'Did You Know?' Fact: ISO Operational Control",
    minutes: 2,
    content: "Review authoritative international standards governing operational planning, change control, and evidence-based evaluation.",
    blocks: [
      {
        id: "c23-l4-b1",
        type: "heading",
        headingText: "Did You Know? Sourced Operational Standard"
      },
      {
        id: "c23-l4-b2",
        type: "callout",
        headingText: "ISO 14001:2015 Clause 8.1 & ISO 9001:2015 Clause 8.1",
        bodyText: "According to ISO 14001:2015 Clause 8.1 and ISO 9001:2015 Clause 8.1 (Operational Planning and Control):\n\n'The organization shall establish, implement, control and maintain the processes needed to meet environmental management system requirements... The organization shall control planned changes and review the consequences of unintended changes, taking action to mitigate any adverse effects, as necessary.'\n\nKey Takeaway for Workplace Initiatives: International management standards require organizations to evaluate planned operational changes before launch, control implementation steps, and actively monitor unintended side-effects. Good intentions or promotional announcements do not satisfy operational control requirements."
      }
    ]
  },
  {
    order: 5,
    title: "The INITIATE Framework for Controlled Delivery",
    minutes: 3,
    content: "Master the 8-step INITIATE framework for taking a workplace sustainability initiative from initial problem identification through closeout.",
    blocks: [
      {
        id: "c23-l5-b1",
        type: "heading",
        headingText: "The 8-Step INITIATE Operational Framework"
      },
      {
        id: "c23-l5-b2",
        type: "short_text",
        bodyText: "Follow the INITIATE framework to ensure every initiative is grounded in reality, properly authorized, and rigorously evaluated:\n\n1. I — Identify the real need: Describe the specific workplace problem using observations, records, and frontline feedback.\n2. N — Name intended outcome & scope: Specify exact targets, affected areas, and explicit exclusions.\n3. I — Involve owners & stakeholders: Assign an initiative owner, approver, technical leads, and consult affected staff.\n4. T — Test feasibility, risks & dependencies: Check operational capacity, budget, hygiene/safety impacts, and supplier lead times.\n5. I — Implement through controlled pilot: Execute a small-scale trial in one department or shift before full deployment.\n6. A — Assess evidence & unintended effects: Compare pilot data against baseline and check for negative side-effects.\n7. T — Take a review decision: Decide whether to close, modify, continue, embed into procedures, or scale up.\n8. E — Embed learning & close responsibly: Document lessons learned, transfer ongoing ownership, and communicate final outcomes."
      }
    ]
  },
  {
    order: 6,
    title: "Structure of a Proportionate Initiative Brief & Approval Gates",
    minutes: 2,
    content: "Learn how to draft a concise, single-page initiative brief and navigate formal management approval checkpoints.",
    blocks: [
      {
        id: "c23-l6-b1",
        type: "heading",
        headingText: "The Proportionate Initiative Brief"
      },
      {
        id: "c23-l6-b2",
        type: "short_text",
        bodyText: "A workplace initiative brief does not need to be a 50-page manual. For most workplace improvements, a concise 1-to-2 page document contains all essential controls:\n\n1. Problem & Baseline Evidence: What issue was observed, where, and what initial baseline data exists?\n2. Intended Outcome & Scope: What specific operational result is sought? What areas are explicitly excluded?\n3. Roles & Accountabilities: Who is the Initiative Owner? Who is the Approver? Who provides technical/data support?\n4. Feasibility & Risk Assessment: What costs, maintenance dependencies, or safety/hygiene risks must be managed?\n5. Pilot Design & Schedule: Where will the trial take place, for how long, and what equipment/training is required?\n6. Balanced Indicators: How will activity, operational adoption, environmental outcome, and side-effects be measured?\n7. Approval Gate: Signed approval from designated manager before funds are spent or operational changes commence."
      }
    ]
  },
  {
    order: 7,
    title: "Visual Identification: Initiative Planning Board Defects",
    minutes: 2,
    content: "Examine a realistic Mauritian workplace planning board visual and identify dangerous governance and delivery flaws.",
    blocks: [
      {
        id: "c23-l7-b1",
        type: "heading",
        headingText: "Visual Analysis: Spotting Initiative Defects"
      },
      {
        id: "c23-l7-b2",
        type: "short_text",
        bodyText: "Inspect the initiative board below. Notice how unverified assumptions, unassigned owners, and skipped technical reviews threaten project delivery."
      },
      {
        id: "c23-l7-b3",
        type: "image",
        imageUrl: "/images/courses/visual-sustainability-workplace-initiative.png",
        caption: "Mauritian corporate meeting room: Initiative Planning Board displaying critical delivery, approval, and evidence defects."
      },
      {
        id: "c23-l7-b4",
        type: "visual_identification",
        questionText: "Review the meeting board above. Which identified defect creates the greatest risk that the initiative will be declared successful without reliable evidence?",
        imageUrl: "/images/courses/visual-sustainability-workplace-initiative.png",
        options: [
          {
            label: "Listing 'number of posters printed' as the sole success measure while marking baseline volume as unchecked and technical review as skipped",
            correct: true,
            feedback: "Correct! Measuring poster output instead of actual operational waste reduction, combined with an unchecked baseline and skipped technical review, guarantees vanity reporting without environmental proof."
          },
          {
            label: "Holding the planning meeting in a glass-walled conference room in Ebène",
            correct: false,
            feedback: "Incorrect. The meeting room location is irrelevant to initiative governance and measurement accuracy."
          },
          {
            label: "Writing sticky notes in red marker instead of blue ink",
            correct: false,
            feedback: "Incorrect. Ink colour has no impact on initiative feasibility, safety checks, or data validity."
          },
          {
            label: "Using a white dry-erase board rather than a digital spreadsheet application",
            correct: false,
            feedback: "Incorrect. Whiteboards are effective planning tools; the defect lies in the missing data and skipped controls, not the physical board."
          }
        ]
      }
    ]
  },
  {
    order: 8,
    title: "Worked Mauritian Workplace Scenario: Resort Amenity Reduction",
    minutes: 2,
    content: "Walk through a step-by-step worked example of a Grand Baie hotel amenity reduction initiative following the INITIATE framework.",
    blocks: [
      {
        id: "c23-l8-b1",
        type: "heading",
        headingText: "Worked Example: Resort Guest Amenity Waste Brief"
      },
      {
        id: "c23-l8-b2",
        type: "short_text",
        bodyText: "Context: A 150-room resort in Grand Baie noted significant disposal of partially used bottled bath amenities. Rather than launching an immediate blanket ban, the team executed a controlled initiative:\n\n• I (Identify Need): Audit showed 45% of small plastic shampoo bottles were discarded half-full daily during peak season.\n• N (Name Scope): Initiative target: Replace single-use mini bottles with refillable wall dispensers in 20 pilot rooms in Building A for 30 days. Excluded: Luxury suites (pending brand audit).\n• I (Involve Roles): Initiative Owner: Executive Housekeeper. Sponsor: General Manager. Technical Reviewer: Hygiene & Food Safety Lead. Approver: Operations Director.\n• T (Test Feasibility): Checked dispenser cleaning protocol, tamper-proof locks, housekeepers' restocking time (+45 secs/room), and bulk liquid supplier lead time.\n• I (Implement Pilot): Installed dispensers in 20 pilot rooms; provided housekeepers with refill funnels and sanitization logs.\n• A (Assess Evidence): Result after 30 days: Plastic bottle waste in Building A dropped by 88%. Housekeeping reported 0 hygiene complaints. Refill time added 30 secs/room.\n• T (Take Decision): Review Decision: APPROVED for full resort rollout across standard rooms; luxury suites deferred pending supplier branding review.\n• E (Embed): Updated Housekeeping Standard Operating Procedure (SOP-HK-014) and assigned inventory restocking to shift supervisor."
      }
    ]
  },
  {
    order: 9,
    title: "Applied Decision Scenario: Marketing's 'Paperless Month' Proposal",
    minutes: 2,
    content: "Test your judgement on a complex workplace proposal that risks operational failure without proper scoping and technical checks.",
    blocks: [
      {
        id: "c23-l9-b1",
        type: "heading",
        headingText: "Applied Scenario: Unscoped Paperless Proposal"
      },
      {
        id: "c23-l9-b2",
        type: "decision_scenario",
        decisionIntro: "The Marketing Manager at a Port Louis logistics firm proposes 'Paperless Workplace Month starting next Monday', ordering all office printers disconnected and asking staff to sign an eco-pledge banner. Finance requires signed paper waybills by law, Warehouse staff lack handheld tablets, and IT has not assessed cloud storage security.",
        decisionPrompt: "As the Department Lead reviewing this proposal, what is the correct immediate course of action?",
        decisionChoices: [
          {
            label: "Disconnect the printers immediately as proposed to demonstrate strong environmental commitment.",
            correct: false,
            feedback: "Incorrect. Disconnecting printers without reviewing legal requirements or warehouse tablet access will disrupt operations and breach financial compliance."
          },
          {
            label: "Pause the campaign, review printing baseline data, involve Finance, IT, and Warehouse leads, define legal exclusions, and propose a limited 2-week pilot in Administration.",
            correct: true,
            feedback: "Correct! Pausing premature launch to review baseline data, legal constraints, IT capacity, and frontline needs turns a high-risk campaign into a controlled, feasible initiative."
          },
          {
            label: "Approve the campaign for all office staff but exempt the Marketing department.",
            correct: false,
            feedback: "Incorrect. Exempting marketing while forcing unfeasible rules on operational teams destroys credibility and fails to address legal or technical gaps."
          },
          {
            label: "Ask all employees to sign the pledge banner and declare the initiative successful.",
            correct: false,
            feedback: "Incorrect. Signing a banner is promotional activity; it does not solve digital access barriers or prove paper reduction."
          }
        ]
      }
    ]
  },
  {
    order: 10,
    title: "Role-Based Micro-Decisions Across Workplace Functions",
    minutes: 2,
    content: "Navigate 12 real-world workplace micro-decisions testing authority, feasibility checks, risk escalation, and closeout rules.",
    blocks: [
      {
        id: "c23-l10-b1",
        type: "heading",
        headingText: "Practical Workplace Micro-Decisions"
      },
      {
        id: "c23-l10-b2",
        type: "short_text",
        bodyText: "Review how key initiative decisions must be handled across different organizational roles:\n\n1. Senior Sponsor: Receives a proposal claiming 50% energy savings without calculations → Action: Require engineering baseline data before approving funds.\n2. Initiative Owner: Frontline staff report a safety hazard during pilot → Action: Pause pilot immediately, log safety issue, and consult Health & Safety Lead.\n3. Department Lead: Marketing wants to announce 'Zero Waste Office' on Day 3 of a pilot → Action: Reject public claims until post-pilot evidence is verified.\n4. Night-Shift Rep: Identifies that waste sorting bins are locked at night → Action: Adjust facility access rules before launching sorting initiative.\n5. Finance Lead: Asked to approve bulk eco-product purchase without cost-benefit check → Action: Request unit cost comparison and usage estimates.\n6. Procurement Lead: Proposed supplier has 12-week lead time for bulk reusable items → Action: Update pilot timeline to reflect real procurement lead times.\n7. Maintenance Lead: Water-saving valve reduces pressure below dishwashing hygiene threshold → Action: Reject valve model; test alternative pressure-compliant fixture.\n8. IT Specialist: Digital form initiative requires tablet access for 15 warehouse staff → Action: Include tablet hardware & security in initiative budget.\n9. HR Lead: Initiative requires staff to perform extra sorting during lunch breaks → Action: Realign sorting tasks into paid shift routines to ensure fairness.\n10. Data Owner: Pre-initiative waste logs were lost by external contractor → Action: Conduct new 2-week baseline audit before launching pilot.\n11. Green Team Coordinator: Pilot completed with 15% energy reduction and positive staff feedback → Action: Submit pilot review report to Operations Lead for SOP integration.\n12. Operations Director: Successful pilot completed in Site A → Action: Authorize phased rollout to Site B with Site A supervisor acting as mentor."
      }
    ]
  },
  {
    order: 11,
    title: "Learner Commitment & Practical Disclaimer",
    minutes: 1,
    content: "Select a practical workplace commitment and review the official course operational disclaimer.",
    blocks: [
      {
        id: "c23-l11-b1",
        type: "heading",
        headingText: "Workplace Application Commitment"
      },
      {
        id: "c23-l11-b2",
        type: "short_text",
        bodyText: "Select one practical action you will take in your workplace this week:\n\n• Check whether an ongoing sustainability project has a named Initiative Owner and clear scope.\n• Verify if baseline data exists before proposing a new environmental improvement.\n• Consult frontline or night-shift employees who will be directly affected by a proposed operational change.\n• Recommend a 30-day pilot project instead of an immediate organization-wide rollout.\n• Ensure an initiative review decision is formally recorded before declaring a project closed."
      },
      {
        id: "c23-l11-b3",
        type: "callout",
        headingText: "Practical Course Disclaimer",
        bodyText: "This course provides practical workplace guidance. It is not legal, engineering, financial, health-and-safety, or project-management advice, and it does not provide environmental assurance, management-system certification, or independent verification of an organization's sustainability claims or results."
      }
    ]
  }
];

const QUIZ_QUESTIONS = [
  {
    question: "What is the primary difference between a vague sustainability idea and a controlled workplace initiative?",
    options: [
      "An initiative has a defined problem, clear scope, named owner, feasibility check, pilot plan, and review date.",
      "An initiative is launched with a public press release and high-budget marketing campaign.",
      "An initiative requires hiring external management consultants to oversee daily staff tasks.",
      "An initiative must always apply to all company facilities across Mauritius simultaneously."
    ],
    correctAnswerIndex: 0,
    optionsFeedback: [
      "Correct! A controlled initiative requires structured governance: defined problem, scope, owner, feasibility, pilot, and evidence review.",
      "Incorrect. Marketing campaigns and press releases are promotional activities, not operational controls.",
      "Incorrect. Initiatives are typically managed by internal workplace teams and department leads.",
      "Incorrect. Effective initiatives start with small, controlled pilots in specific areas before scaling."
    ]
  },
  {
    question: "Why is establishing baseline evidence essential BEFORE launching a workplace initiative?",
    options: [
      "Baseline evidence allows the team to verify whether post-implementation changes actually achieved an improvement.",
      "Baseline evidence is required only if the company is undergoing an immediate ISO audit.",
      "Baseline evidence guarantees that the initiative will receive unlimited financial funding.",
      "Baseline evidence replaces the need for management approval and safety checks."
    ],
    correctAnswerIndex: 0,
    optionsFeedback: [
      "Correct! Without baseline data, an organization cannot prove whether an initiative reduced consumption or improved performance.",
      "Incorrect. Baseline data is essential for operational decision-making, not just external audits.",
      "Incorrect. Baseline data supports realistic budgeting; it does not guarantee unlimited funds.",
      "Incorrect. Data collection never overrides management approval or safety compliance."
    ]
  },
  {
    question: "What does the 'T' in the INITIATE framework stand for?",
    options: [
      "Test feasibility, risks and operational dependencies before committing organizational resources.",
      "Target maximum social media publicity during the first week of launch.",
      "Transfer all operational responsibility to the human resources department.",
      "Terminate existing supplier contracts without checking procurement terms."
    ],
    correctAnswerIndex: 0,
    optionsFeedback: [
      "Correct! 'T' stands for testing feasibility, risks, and operational dependencies early to prevent project failure.",
      "Incorrect. Publicity is not part of feasibility and risk testing.",
      "Incorrect. Responsibilities must be assigned to relevant operational leads, not dumped on HR.",
      "Incorrect. Terminating contracts blindly creates severe legal and operational risks."
    ]
  },
  {
    question: "In the Grand Baie resort worked example, why was the amenity dispenser initiative approved for a 20-room pilot first?",
    options: [
      "To test housekeeper restocking times, sanitization protocols, and guest feedback under real conditions before full resort rollout.",
      "Because 20 rooms was the maximum number of guest rooms available in the entire hotel.",
      "To avoid informing the General Manager or Operations Lead about the project.",
      "Because single-use plastic bottles were legally banned in Mauritius on that exact day."
    ],
    correctAnswerIndex: 0,
    optionsFeedback: [
      "Correct! A 20-room pilot allowed the team to verify operational feasibility, hygiene SOPs, and staff workload before full commitment.",
      "Incorrect. The resort had 150 rooms; 20 rooms represented a controlled pilot sample.",
      "Incorrect. The General Manager sponsored the project and approved the pilot.",
      "Incorrect. The pilot was an internal operational control choice, not a sudden legal compulsion."
    ]
  },
  {
    question: "Which of the following represents an UNINTENDED CONSEQUENCE of a poorly planned paperless initiative?",
    options: [
      "Warehouse staff being unable to verify shipments because they lack mobile digital devices, causing dispatch delays.",
      "Administration staff printing fewer internal emails during the workday.",
      "Finance securely archiving digital invoices in compliance with audit standards.",
      "IT upgrading server security protocols prior to digital form deployment."
    ],
    correctAnswerIndex: 0,
    optionsFeedback: [
      "Correct! Disabling paper without providing tablets created an operational bottleneck in dispatch—a classic unintended trade-off.",
      "Incorrect. Printing fewer internal emails is a desired positive outcome.",
      "Incorrect. Secure digital archiving is a planned, positive operational control.",
      "Incorrect. Upgrading IT security is a planned pre-implementation feasibility step."
    ]
  },
  {
    question: "According to ISO 14001:2015 Clause 8.1, what is required when planning operational changes?",
    options: [
      "Organizations must control planned changes and review the consequences of unintended changes to mitigate adverse effects.",
      "Organizations must eliminate all physical paperwork across all operational departments immediately.",
      "Organizations must guarantee a minimum 25% cost reduction for every environmental initiative.",
      "Organizations must obtain written permission from international standard bodies before changing internal procedures."
    ],
    correctAnswerIndex: 0,
    optionsFeedback: [
      "Correct! Clause 8.1 explicitly requires controlling planned changes and acting to mitigate unintended side-effects.",
      "Incorrect. ISO standards require operational control and evidence, not mandatory instant paper elimination.",
      "Incorrect. ISO standards do not specify fixed financial percentage targets.",
      "Incorrect. Operational changes are managed internally in compliance with system standards."
    ]
  },
  {
    question: "What is the primary role of an Initiative Sponsor in workplace delivery?",
    options: [
      "Providing managerial authority, approving project scope/budget, and removing organizational roadblocks.",
      "Performing daily maintenance checks and cleaning sorting bins in staff breakrooms.",
      "Writing promotional social media posts and designing campaign stickers.",
      "Collecting daily meter readings and inputting raw numbers into spreadsheets."
    ],
    correctAnswerIndex: 0,
    optionsFeedback: [
      "Correct! The Sponsor holds managerial authority to approve scope, allocate resources, and clear organizational obstacles.",
      "Incorrect. Daily operational tasks belong to maintenance or action owners, not the senior sponsor.",
      "Incorrect. Promotional copy is a communications task, not sponsorship governance.",
      "Incorrect. Data collection is handled by designated data owners."
    ]
  },
  {
    question: "Why is 'number of employee pledge signatures' an inadequate primary measure of initiative success?",
    options: [
      "Signing a pledge is an activity metric that does not prove actual environmental or operational resource reduction.",
      "Pledge signatures are illegal to collect in commercial Mauritian workplaces.",
      "Pledges can only be signed by senior executive managers and board directors.",
      "Pledges automatically increase electricity and water consumption."
    ],
    correctAnswerIndex: 0,
    optionsFeedback: [
      "Correct! Pledges measure participation interest, not physical waste, energy, or water performance.",
      "Incorrect. Employee pledges are completely legal; they are simply insufficient as proof of outcome.",
      "Incorrect. Anyone can sign a pledge.",
      "Incorrect. Pledges do not physically increase resource consumption, but they don't prove reduction either."
    ]
  },
  {
    question: "What should happen during the 'Take a Review Decision' step of the INITIATE framework?",
    options: [
      "Designated leads evaluate pilot evidence to decide whether to close, modify, embed into SOPs, pause, or scale the initiative.",
      "The initiative is automatically extended for 5 years without inspecting data.",
      "All project records are deleted to save digital storage space.",
      "The initiative owner is replaced and penalized if any operational risk occurred."
    ],
    correctAnswerIndex: 0,
    optionsFeedback: [
      "Correct! The review decision uses pilot evidence to determine whether to embed, modify, pause, stop, or scale the initiative.",
      "Incorrect. Extending without reviewing data defeats the purpose of controlled delivery.",
      "Incorrect. Project records must be retained as evidence of change control and learning.",
      "Incorrect. Identifying operational risks during a pilot is a success of the control system, not a failure to be penalized."
    ]
  },
  {
    question: "How does ELH-23 connect to ELH-24 (Sustainability for HR Teams)?",
    options: [
      "ELH-23 provides general initiative delivery mechanics; ELH-24 applies these controls to HR practices like onboarding, training, and employee policies.",
      "ELH-23 replaces all HR policies and employment contracts across Mauritius.",
      "ELH-24 is designed exclusively for external legal auditors and accountants.",
      "There is no connection; ELH-23 is for facilities staff only while ELH-24 is for marketing."
    ],
    correctAnswerIndex: 0,
    optionsFeedback: [
      "Correct! ELH-23 establishes the universal initiative delivery framework, which ELH-24 then applies to human resource operations.",
      "Incorrect. ELH courses provide workplace learning; they do not rewrite national employment laws.",
      "Incorrect. ELH-24 is designed for HR managers, officers, and internal HR representatives.",
      "Incorrect. ELH-23 provides cross-functional initiative mechanics applicable to all departments."
    ]
  }
];

export async function ensureWorkplaceSustainabilityInitiativesCourse(): Promise<void> {
  logger.info("Starting ELH-23 course seeding (workplace-sustainability-initiatives-v2)...");

  // 1. Check or create system seed marker
  const [existingSeed] = await db
    .select()
    .from(systemSeedsTable)
    .where(eq(systemSeedsTable.name, SEED_NAME))
    .limit(1);

  // Find course by code, slug, or ID
  const [existingCourse] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.courseCode, COURSE_META.courseCode))
    .limit(1);

  let courseId: number;

  if (existingCourse) {
    courseId = existingCourse.id;
    await db
      .update(coursesTable)
      .set({
        title: COURSE_TITLE,
        slug: COURSE_SLUG,
        description: COURSE_META.description,
        fullDescription: COURSE_META.fullDescription,
        durationMinutes: COURSE_META.durationMinutes,
        level: COURSE_META.level,
        thumbnailUrl: COURSE_META.thumbnailUrl,
        learningObjectives: COURSE_META.learningObjectives,
        intendedRoles: COURSE_META.intendedRoles,
        completionMessage: COURSE_META.completionMessage,
        badgeName: COURSE_META.badgeName,
        badgeDescription: COURSE_META.badgeDescription,
        passingScore: COURSE_META.passingScore,
        updatedAt: new Date(),
      })
      .where(eq(coursesTable.id, courseId));
    logger.info(`Updated existing ELH-23 course record (ID: ${courseId}).`);
  } else {
    const [inserted] = await db
      .insert(coursesTable)
      .values({
        courseCode: COURSE_META.courseCode,
        title: COURSE_TITLE,
        slug: COURSE_SLUG,
        description: COURSE_META.description,
        fullDescription: COURSE_META.fullDescription,
        categoryId: COURSE_META.categoryId,
        durationMinutes: COURSE_META.durationMinutes,
        priceUsd: COURSE_META.priceUsd,
        level: COURSE_META.level,
        isFeatured: COURSE_META.isFeatured,
        thumbnailUrl: COURSE_META.thumbnailUrl,
        intendedRoles: COURSE_META.intendedRoles,
        learningObjectives: COURSE_META.learningObjectives,
        includesCertificate: COURSE_META.includesCertificate,
        passingScore: COURSE_META.passingScore,
        completionMessage: COURSE_META.completionMessage,
        badgeName: COURSE_META.badgeName,
        badgeDescription: COURSE_META.badgeDescription,
      })
      .returning();
    courseId = inserted.id;
    logger.info(`Inserted new ELH-23 course record (ID: ${courseId}).`);
  }

  // 2. Ensure badge definition
  await db
    .insert(badgeDefinitionsTable)
    .values({
      slug: BADGE_SLUG,
      name: COURSE_META.badgeName,
      description: COURSE_META.badgeDescription,
      icon: "target",
      criteriaType: "all_courses",
      threshold: 0,
      courseIds: [courseId],
      orderIndex: 28,
    })
    .onConflictDoUpdate({
      target: badgeDefinitionsTable.slug,
      set: {
        name: COURSE_META.badgeName,
        description: COURSE_META.badgeDescription,
        courseIds: [courseId],
      },
    });

  // 3. Update lessons transactionally if seed is not yet present or forced
  const existingLessons = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.courseId, courseId));

  if (!existingSeed || existingLessons.length !== NEW_LESSONS.length) {
    // Delete existing quiz questions and lessons cleanly to avoid orphaned data
    const existingLessonIds = existingLessons.map((l) => l.id);
    if (existingLessonIds.length > 0) {
      await db
        .delete(lessonProgressTable)
        .where(inArray(lessonProgressTable.lessonId, existingLessonIds));
    }
    await db.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, courseId));
    await db.delete(lessonsTable).where(eq(lessonsTable.courseId, courseId));

    // Insert 12 comprehensive lessons
    for (const l of NEW_LESSONS) {
      await db.insert(lessonsTable).values({
        courseId: courseId,
        title: l.title,
        orderIndex: l.order,
        durationMinutes: l.minutes,
        content: l.content,
        contentBlocks: l.blocks,
      });
    }
    logger.info(`Seeded ${NEW_LESSONS.length} upgraded lessons for ELH-23.`);

    // Insert 10 scenario quiz questions
    for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
      const q = QUIZ_QUESTIONS[i];
      await db.insert(quizQuestionsTable).values({
        courseId: courseId,
        question: q.question,
        options: q.options,
        correctOption: q.correctAnswerIndex,
        correctExplanation: q.optionsFeedback[q.correctAnswerIndex],
        incorrectExplanation: "Review the initiative controls, feasibility steps, and evidence measures before retrying.",
        optionFeedback: q.optionsFeedback,
        orderIndex: i,
      });
    }
    logger.info(`Seeded ${QUIZ_QUESTIONS.length} upgraded quiz questions for ELH-23.`);

    // Record system seed marker
    if (!existingSeed) {
      await db.insert(systemSeedsTable).values({
        name: SEED_NAME,
        version: 2,
      });
    } else {
      await db
        .update(systemSeedsTable)
        .set({ version: 2 })
        .where(eq(systemSeedsTable.name, SEED_NAME));
    }
  }

  // 4. Ensure Prerequisites: ELH-12 through ELH-22 are linked as prerequisites to ELH-23
  const prereqCodes = ["ELH-12", "ELH-13", "ELH-14", "ELH-15", "ELH-16", "ELH-17", "ELH-18", "ELH-19", "ELH-20", "ELH-21", "ELH-22"];
  const prereqCourses = await db
    .select()
    .from(coursesTable)
    .where(inArray(coursesTable.courseCode, prereqCodes));

  for (const prereq of prereqCourses) {
    const [existingLink] = await db
      .select()
      .from(coursePrerequisitesTable)
      .where(
        and(
          eq(coursePrerequisitesTable.courseId, courseId),
          eq(coursePrerequisitesTable.prerequisiteCourseId, prereq.id)
        )
      )
      .limit(1);

    if (!existingLink) {
      await db.insert(coursePrerequisitesTable).values({
        courseId: courseId,
        prerequisiteCourseId: prereq.id,
      });
    }
  }

  logger.info("ELH-23 course seeding complete.");
}
