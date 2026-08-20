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

const COURSE_SLUG = "workplace-sustainability-leadership";
const COURSE_TITLE = "Workplace Sustainability Leadership";
const BADGE_SLUG = "workplace-sustainability-leader";
const SEED_NAME = "workplace-sustainability-leadership-v1";

const COURSE_META = {
  courseCode: "ELH-23",
  title: COURSE_TITLE,
  slug: COURSE_SLUG,
  description:
    "Master the strategic leadership principles, change management frameworks, and stakeholder alignment techniques required to embed sustainability into core business operations.",
  fullDescription:
    "True sustainability leadership goes beyond regulatory compliance. This advanced course equips executives, department heads, and green champions with the strategic models, decision-making tools, and influence strategies needed to drive enterprise-wide sustainability transformations, overcome organizational inertia, allocate resources, and foster an enduring culture of environmental stewardship.",
  categoryId: 1,
  durationMinutes: 25,
  priceUsd: "0.00",
  level: "Advanced",
  status: "draft" as const, // Preserved as draft per configuration
  isFeatured: false,
  thumbnailUrl: "/images/courses/workplace-sustainability-leadership.jpg",
  intendedRoles: [
    "executives",
    "directors",
    "senior managers",
    "department heads",
    "sustainability leads",
    "operations directors",
    "ESG managers",
    "emerging leaders",
  ],
  learningObjectives: [
    "Articulate the business case for sustainability and align environmental goals with enterprise commercial strategy.",
    "Apply proven change leadership frameworks to overcome cultural resistance and organizational inertia.",
    "Design effective sustainability governance structures and executive decision-making escalation pathways.",
    "Engage cross-functional stakeholders, board members, and frontline teams with compelling, evidence-backed communication.",
    "Prioritize strategic sustainability investments using multi-criteria capital allocation and ROI/risk frameworks.",
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "Congratulations! You have completed Workplace Sustainability Leadership. You are now equipped to drive strategic sustainability transformations, navigate organizational change, align governance, and lead high-impact workplace environmental initiatives.",
  badgeName: "Workplace Sustainability Leader",
  badgeDescription:
    "Awarded for mastering advanced organizational change leadership, strategic ESG integration, and workplace sustainability governance.",
};

const LESSONS = [
  {
    order: 0,
    title: "The Strategic Imperative of Sustainability Leadership",
    minutes: 4,
    content:
      "Explore why leadership commitment is the primary driver of corporate sustainability success and how to transition from reactive compliance to strategic value creation.",
    blocks: [
      {
        id: "wsl1-h1",
        type: "heading",
        position: 1,
        headingText: "From Compliance Burden to Commercial Advantage",
      },
      {
        id: "wsl1-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "Traditional organizations often treat sustainability as a public relations exercise or an unavoidable cost center. Modern sustainability leaders, however, recognize that environmental efficiency, circular resource models, and transparent governance directly enhance operating margins, mitigate climate risks, attract top talent, and secure preferential commercial financing.",
      },
      {
        id: "wsl1-k1",
        type: "key_message",
        position: 3,
        headingText: "The Core Leadership Principle",
        bodyText:
          "Sustainability succeeds when it is woven into core commercial strategy rather than relegated to a standalone CSR department. A true sustainability leader aligns environmental milestones directly with operational excellence and long-term enterprise value.",
      },
      {
        id: "wsl1-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Leadership & ISO 14001:2015 Clause 5.1",
        bodyText:
          "Under ISO 14001:2015 Clause 5.1 (Leadership and Commitment), top management cannot delegate strategic accountability for the environmental management system. Leaders must actively ensure that environmental policy and objectives are compatible with the strategic direction of the organization.",
      },
      {
        id: "wsl1-d1",
        type: "decision_scenario",
        position: 5,
        decisionIntro: "Executive Prioritization Dilemma:",
        decisionPrompt:
          "A business unit manager argues that adopting energy-saving chiller variable speed drives should be postponed because current electricity costs are simply passed through into tenant operating budgets. How should an executive sustainability leader respond?",
        decisionChoices: [
          {
            label:
              "Demonstrate that modernizing equipment reduces lifecycle maintenance costs, protects asset valuation, and prevents future vacancy risks as corporate tenants increasingly mandate certified green buildings.",
            correct: true,
            feedback:
              "Correct! Strategic leaders look at total asset lifecycle value and market positioning rather than short-term cost pass-throughs.",
          },
          {
            label:
              "Accept the delay since energy costs are not directly borne by the central balance sheet.",
            correct: false,
            feedback:
              "Incorrect. Ignoring efficiency undermines long-term tenant retention, brand reputation, and environmental performance.",
          },
          {
            label:
              "Order an immediate shutdown of equipment without analyzing commercial impact or operational continuity.",
            correct: false,
            feedback:
              "Incorrect. Effective leadership balances operational continuity with structured efficiency upgrades.",
          },
        ],
      },
    ],
  },
  {
    order: 1,
    title: "Leading Culture Change & Overcoming Organizational Inertia",
    minutes: 4,
    content:
      "Learn how to diagnose cultural friction, leverage change management frameworks (ADKAR and Kotter), and mobilize cross-functional champions.",
    blocks: [
      {
        id: "wsl2-h1",
        type: "heading",
        position: 1,
        headingText: "Managing the Human Side of Sustainability Transformations",
      },
      {
        id: "wsl2-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "The biggest barrier to sustainability is rarely technical—it is behavioral. Employees and mid-level managers frequently resist new environmental procedures due to change fatigue, perceived workload increases, or lack of understanding. Sustainability leaders diagnose the root cause of friction before imposing mandatory rules.",
      },
      {
        id: "wsl2-k1",
        type: "key_message",
        position: 3,
        headingText: "The 5 ADKAR Stages for Workplace Green Transitions",
        bodyText:
          "• Awareness: Communicate why the change is necessary (e.g. rising landfill fees, climate risks).\n• Desire: Highlight what is in it for employees (better working environment, team pride, streamlined processes).\n• Knowledge: Provide practical training on exact operational procedures.\n• Ability: Remove physical barriers (provide accessible sorting bins, default printer configs).\n• Reinforcement: Publicly celebrate successes and recognize department champions.",
      },
      {
        id: "wsl2-c1",
        type: "case_study",
        position: 4,
        headingText: "Case in Action: Breaking Single-Use Plastic Habits in Hospitality",
        bodyText:
          "A leading Mauritian resort group struggled to eliminate single-use plastic water bottles because housekeeping staff felt glass carafes were too heavy. Instead of penalizing staff, leadership redesigned the refilling carts with ergonomic trays and recognized housekeeping teams with monthly sustainability bonuses. Compliance jumped from 42% to 99% within six weeks.",
      },
      {
        id: "wsl2-d1",
        type: "decision_scenario",
        position: 5,
        decisionIntro: "Navigating Middle Management Resistance:",
        decisionPrompt:
          "A warehouse manager resists a new digital inventory system designed to eliminate paper waste, claiming 'paper has worked fine for 20 years.' How should leadership intervene?",
        decisionChoices: [
          {
            label:
              "Pair the warehouse manager with a trained green champion to pilot the tablet system on a single shift, tracking time saved on physical stock reconciliation to prove direct job benefit.",
            correct: true,
            feedback:
              "Correct! Hands-on piloting that demonstrates personal workflow benefits overcomes skepticism much faster than top-down mandates.",
          },
          {
            label:
              "Issue a formal reprimand and demand compliance within 24 hours.",
            correct: false,
            feedback:
              "Incorrect. Threatening staff breeds passive non-compliance and resistance.",
          },
          {
            label:
              "Abandon the digital transformation to keep the peace.",
            correct: false,
            feedback:
              "Incorrect. Leaders guide teams through discomfort rather than abandoning strategic priorities.",
          },
        ],
      },
    ],
  },
  {
    order: 2,
    title: "Governance Structures, Steering Committees & Decision Rights",
    minutes: 4,
    content:
      "Design robust governance models that connect executive leadership, green committees, and operational units without bureaucratic gridlock.",
    blocks: [
      {
        id: "wsl3-h1",
        type: "heading",
        position: 1,
        headingText: "Building Lean, Action-Oriented Sustainability Governance",
      },
      {
        id: "wsl3-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "Without clear governance, sustainability initiatives devolve into endless committee debates with no budget authority. An effective governance structure defines who proposes initiatives, who evaluates financial feasibility, who authorizes CapEx, and who enforces accountability.",
      },
      {
        id: "wsl3-k1",
        type: "key_message",
        position: 3,
        headingText: "Three-Tiered Sustainability Governance Model",
        bodyText:
          "1. Executive ESG Steering Committee: Sets strategic vision, approves annual sustainability CapEx, and monitors enterprise risk.\n2. Cross-Functional Green Champions Network: Identifies operational opportunities, tests departmental pilots, and drives daily adoption.\n3. Operational Action Owners: Named departmental supervisors accountable for specific action implementation, data gathering, and compliance verification.",
      },
      {
        id: "wsl3-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Governance Insight: Avoiding Committee Paralysis",
        bodyText:
          "High-performing organizations establish pre-approved discretionary budgets (e.g., up to 25,000 MUR) for Green Teams to implement rapid-payback improvements without requiring Board-level approval for every light fixture or compost bin.",
      },
      {
        id: "wsl3-d1",
        type: "decision_scenario",
        position: 5,
        decisionIntro: "Clarifying Decision Rights:",
        decisionPrompt:
          "The Green Team identifies an opportunity to install water aerators that pay for themselves in 3 months, but the procurement department refuses to process the purchase because it was not in the annual baseline budget. How should the governance framework resolve this?",
        decisionChoices: [
          {
            label:
              "Establish a fast-track sustainability micro-fund approval mechanism for initiatives with a verified payback under 6 months, signed off by the Operations Director.",
            correct: true,
            feedback:
              "Correct! Agile governance empowers rapid execution of high-ROI micro-investments while preserving financial controls.",
          },
          {
            label:
              "Wait 11 months until the next annual budgeting cycle to submit a formal line-item request.",
            correct: false,
            feedback:
              "Incorrect. Deferring zero-risk, high-return conservation projects wastes money and kills employee momentum.",
          },
          {
            label:
              "Have Green Team members buy the hardware out of pocket with personal cash.",
            correct: false,
            feedback:
              "Incorrect. Corporate sustainability must be backed by formal company financial processes.",
          },
        ],
      },
    ],
  },
  {
    order: 3,
    title: "Capital Allocation & Business Case Evaluation",
    minutes: 5,
    content:
      "Master financial evaluation techniques for sustainability projects, including Total Cost of Ownership (TCO), internal carbon pricing, and non-financial risk mitigation.",
    blocks: [
      {
        id: "wsl4-h1",
        type: "heading",
        position: 1,
        headingText: "Quantifying ROI Beyond Simple Payback Periods",
      },
      {
        id: "wsl4-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "Evaluating green investments solely on 12-month payback ignores substantial lifecycle cost savings, regulatory penalties, productivity boosts, and brand equity. Sustainability leaders frame business cases using Total Cost of Ownership (TCO), Net Present Value (NPV), and risk-adjusted return models.",
      },
      {
        id: "wsl4-k1",
        type: "key_message",
        position: 3,
        headingText: "The 4 Pillars of a Robust Sustainability Business Case",
        bodyText:
          "• Direct Cost Savings: Reductions in utility bills, landfill tipping fees, and raw material waste.\n• Risk Mitigation: Shielding the company against expected carbon taxes, water tariff spikes, or regulatory fines.\n• Asset Protection & Valuation: Lowering building operational costs and maintaining premium commercial asset ratings.\n• Talent & Customer Retention: Higher win rates on corporate procurement tenders and lower employee turnover.",
      },
      {
        id: "wsl4-c1",
        type: "case_study",
        position: 4,
        headingText: "Financial Model: Rooftop Solar PV at a Port Louis Distribution Hub",
        bodyText:
          "A logistics firm evaluated a 100kWp rooftop solar installation. The initial capital outlay was 3.8M MUR. A simple payback calculation indicated 4.8 years. When accounting for CEB peak tariff inflation (+7% p.a.), green asset depreciation tax benefits, and client sustainability audit points that unlocked a major international shipping contract, the true internal rate of return (IRR) was 24.2%.",
      },
      {
        id: "wsl4-d1",
        type: "decision_scenario",
        position: 5,
        decisionIntro: "Appraising Competing CapEx Requests:",
        decisionPrompt:
          "The Finance Director is comparing a standard air conditioning unit (cost: 400,000 MUR, high energy consumption) against an inverter-driven VRF system (cost: 650,000 MUR, 45% lower power consumption). How should the sustainability leader present the decision?",
        decisionChoices: [
          {
            label:
              "Present a 7-year Total Cost of Ownership (TCO) model showing that the 250,000 MUR upfront premium is recouped in energy savings by year 2.5, delivering a net cash benefit of over 600,000 MUR over the equipment lifecycle.",
            correct: true,
            feedback:
              "Correct! TCO analysis clearly proves that the 'cheaper' upfront option is drastically more expensive in total cash outflow.",
          },
          {
            label:
              "Agree to buy the cheaper unit to minimize this quarter's CapEx budget.",
            correct: false,
            feedback:
              "Incorrect. Buying inefficient equipment locks the company into high operating expenses for the next decade.",
          },
          {
            label:
              "Argue that cost is irrelevant when dealing with climate change.",
            correct: false,
            feedback:
              "Incorrect. Executive leaders must speak the language of fiduciary responsibility and rigorous financial analysis.",
          },
        ],
      },
    ],
  },
  {
    order: 4,
    title: "Authentic Stakeholder Communication & Preventing Greenwashing",
    minutes: 4,
    content:
      "Learn how to communicate environmental achievements with scientific rigor, transparent data, and credible stakeholder engagement.",
    blocks: [
      {
        id: "wsl5-h1",
        type: "heading",
        position: 1,
        headingText: "Credibility, Transparency & Risk Defense",
      },
      {
        id: "wsl5-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "Stakeholders, consumers, and regulators are increasingly vigilant against greenwashing—the practice of making exaggerated, misleading, or unsubstantiated environmental claims. True sustainability leaders practice radical transparency: they celebrate genuine progress while honestly reporting on operational hurdles and areas needing improvement.",
      },
      {
        id: "wsl5-k1",
        type: "key_message",
        position: 3,
        headingText: "The 4 Rules of Credible Sustainability Communication",
        bodyText:
          "1. Ground Every Claim in Measured Data: Use verified utility meter readings, waste receipts, and audited metrics.\n2. Specify Scope & Boundaries: Clarify whether a goal applies to one office, the entire organization, or the full supply chain.\n3. Avoid Vague Buzzwords: Eliminate terms like '100% eco-friendly' or 'greenest company' unless defined by verifiable third-party standards.\n4. Disclose the Journey: Acknowledge ongoing challenges (e.g. 'We reduced waste by 30%, but supply chain packaging remains a challenge we are addressing in 2027').",
      },
      {
        id: "wsl5-f1",
        type: "memorable_fact",
        position: 4,
        headingText: "Regulatory Warning: The Rise of ESG Scrutiny",
        bodyText:
          "Under modern international reporting standards (IFRS S1/S2, GRI, and EU CSRD), misleading environmental statements carry severe regulatory, legal, and financial liability. Trust is built through verified baselines and audit-ready data trails.",
      },
      {
        id: "wsl5-d1",
        type: "decision_scenario",
        position: 5,
        decisionIntro: "Reviewing a Corporate Marketing Campaign:",
        decisionPrompt:
          "The marketing department drafts a press release titled: 'Elevio Client is Now Completely Carbon-Free and 100% Sustainable!' In reality, the company has only installed solar panels at its head office and started sorting paper waste. What must the sustainability leader do?",
        decisionChoices: [
          {
            label:
              "Require marketing to revise the release to accurately reflect verified accomplishments: 'Head Office Cuts Grid Dependence by 40% with Rooftop Solar & Launches Waste Diversion Program'.",
            correct: true,
            feedback:
              "Correct! Precise, factual communication protects company integrity and builds authentic trust with customers and investors.",
          },
          {
            label:
              "Approve the release as written because bold headlines attract positive public attention.",
            correct: false,
            feedback:
              "Incorrect. Publishing unsubstantiated claims exposes the company to severe greenwashing accusations and regulatory reprimand.",
          },
          {
            label:
              "Cancel all external communications and forbid the marketing team from ever mentioning sustainability.",
            correct: false,
            feedback:
              "Incorrect. The goal is accurate, data-backed communication, not total silence (greenhushing).",
          },
        ],
      },
    ],
  },
  {
    order: 5,
    title: "Institutionalizing Sustainability & Personal Leadership Commitment",
    minutes: 4,
    content:
      "Embed sustainability into job descriptions, onboarding, executive scorecards, and finalize your personal workplace leadership action plan.",
    blocks: [
      {
        id: "wsl6-h1",
        type: "heading",
        position: 1,
        headingText: "Building an Enduring Sustainability Legacy",
      },
      {
        id: "wsl6-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "The ultimate test of a sustainability leader is whether environmental excellence persists after they move to a new role. Institutionalization means cementing green practices into Standard Operating Procedures (SOPs), hiring criteria, supplier contracts, and executive performance evaluations.",
      },
      {
        id: "wsl6-k1",
        type: "key_message",
        position: 3,
        headingText: "The 4 Pillars of Institutionalization",
        bodyText:
          "• Policy & Onboarding: Every new hire receives environmental responsibility training during week one.\n• Performance Reviews: Linking departmental sustainability KPIs to annual manager appraisals and recognition.\n• Procurement Standards: Mandating minimum environmental criteria in all vendor contracts and RFPs.\n• Succession & Documentation: Maintaining centralized, audit-ready sustainability records and handover protocols.",
      },
      {
        id: "wsl6-c1",
        type: "commitment",
        position: 4,
        headingText: "Your Workplace Leadership Action Commitment",
        bodyText:
          "As a Workplace Sustainability Leader, identify one strategic initiative you will champion over the next 90 days: (1) Sponsoring an energy or waste audit, (2) Establishing a cross-functional Green Team, (3) Introducing sustainable procurement guidelines, or (4) Integrating sustainability KPIs into executive review.",
      },
      {
        id: "wsl6-d1",
        type: "decision_scenario",
        position: 5,
        decisionIntro: "Ensuring Sustainability Continuity:",
        decisionPrompt:
          "A key sustainability champion is transferring to an overseas subsidiary. How should leadership prevent the workplace green initiatives from collapsing upon their departure?",
        decisionChoices: [
          {
            label:
              "Conduct a structured 30-day handover, document all active initiatives into the central Elevio action register, and formally assign ownership of tasks to co-leaders in the Green Team.",
            correct: true,
            feedback:
              "Correct! Institutionalizing processes into systems and shared team roles ensures seamless operational continuity.",
          },
          {
            label:
              "Hope the remaining team members figure out what to do on their own.",
            correct: false,
            feedback:
              "Incorrect. Unstructured transitions are the leading cause of initiative failure.",
          },
          {
            label:
              "Pause all sustainability programs until a new external executive is hired.",
            correct: false,
            feedback:
              "Incorrect. Halting initiatives destroys team momentum and loses accumulated progress.",
          },
        ],
      },
    ],
  },
];

const QUIZ_QUESTIONS = [
  {
    order: 0,
    question:
      "Why is leadership commitment considered the single most critical factor in corporate sustainability success?",
    options: [
      "Top management sets the strategic vision, allocates necessary financial resources, and models the cultural expectations for the entire organization.",
      "Leaders are the only employees allowed to read environmental compliance laws.",
      "Sustainability initiatives do not require employee participation if the CEO is involved.",
      "Leadership involvement is only required for marketing and PR photo opportunities.",
    ],
    correctOption: 0,
    correctExplanation:
      "Without executive buy-in and resource allocation, sustainability efforts remain siloed, underfunded, and vulnerable to competing operational priorities.",
    incorrectExplanation:
      "Leadership sets strategy, culture, and resource allocation across the entire enterprise.",
  },
  {
    order: 1,
    question:
      "According to ISO 14001:2015 Clause 5.1, what is the specific responsibility of top management regarding environmental management?",
    options: [
      "They must demonstrate leadership and commitment by ensuring environmental objectives are integrated into core business processes.",
      "They must delegate all environmental accountability entirely to third-party consultants.",
      "They only need to review environmental performance once every 10 years.",
      "They must physically perform all waste sorting and energy auditing tasks themselves.",
    ],
    correctOption: 0,
    correctExplanation:
      "ISO 14001 Clause 5.1 explicitly requires top leadership to take accountability for the effectiveness of the environmental management system and integrate it into business strategy.",
    incorrectExplanation:
      "Top management cannot delegate strategic accountability for the environmental management system.",
  },
  {
    order: 2,
    question:
      "When using the ADKAR change management framework for a workplace green initiative, what is the first step leaders must address?",
    options: [
      "Awareness — clearly communicating the operational and environmental reasons why the change is necessary.",
      "Ability — demanding that staff immediately change their behavior without training.",
      "Reinforcement — penalizing employees before the initiative starts.",
      "Knowledge — purchasing expensive software before explaining the project goals.",
    ],
    correctOption: 0,
    correctExplanation:
      "Awareness of the business and environmental need for change is the essential foundation before employees can develop the desire and ability to participate.",
    incorrectExplanation:
      "Awareness is always the first stage in the ADKAR change management framework.",
  },
  {
    order: 3,
    question:
      "How does a three-tiered sustainability governance structure prevent organizational gridlock?",
    options: [
      "It clearly separates executive strategy/budget approval, cross-functional champion coordination, and departmental operational action ownership.",
      "It mandates that all minor purchases must be approved by the entire Board of Directors.",
      "It eliminates all frontline employee involvement so managers can work faster.",
      "It prevents departments from communicating directly with each other.",
    ],
    correctOption: 0,
    correctExplanation:
      "Separating strategic oversight, champion facilitation, and operational ownership gives teams clear decision rights and rapid execution authority.",
    incorrectExplanation:
      "Clear tiers ensure strategic alignment while empowering rapid operational execution.",
  },
  {
    order: 4,
    question:
      "What is the primary limitation of evaluating energy-efficiency investments using ONLY a simple 12-month payback period?",
    options: [
      "It ignores total lifecycle cost savings, utility tariff inflation, equipment durability, and asset valuation improvements over 5-10 years.",
      "Simple payback calculations cannot be performed with standard spreadsheets.",
      "It overstates the cost of electricity in commercial buildings.",
      "Payback periods are prohibited by international accounting standards.",
    ],
    correctOption: 0,
    correctExplanation:
      "Total Cost of Ownership (TCO) and Net Present Value (NPV) provide a far more accurate financial picture for long-lived sustainable infrastructure.",
    incorrectExplanation:
      "Short-term payback calculations ignore long-term operating efficiencies and utility tariff inflation.",
  },
  {
    order: 5,
    question:
      "Which of the following statements represents authentic, credible corporate sustainability communication?",
    options: [
      "'We reduced single-use plastics in our office by 45% in 2026, and we are working with suppliers to address remaining freight packaging in 2027.'",
      "'Our company is now 100% green and has completely solved all climate issues.'",
      "'We are the eco-friendliest business in the entire Southern Hemisphere.'",
      "'Our products produce zero environmental impact across all planetary boundaries.'",
    ],
    correctOption: 0,
    correctExplanation:
      "Authentic communication uses specific, verified data, defines scope clearly, and transparently acknowledges ongoing challenges.",
    incorrectExplanation:
      "Credible sustainability communication is data-backed, bounded, and transparent about challenges.",
  },
  {
    order: 6,
    question:
      "What is 'greenwashing', and why does it represent a major commercial risk for modern enterprises?",
    options: [
      "Making misleading or unsubstantiated environmental claims, which damages brand reputation, loses customer trust, and triggers legal/regulatory penalties.",
      "Cleaning solar panels with environmentally certified detergent.",
      "Spending more money on waste recycling than on electricity bills.",
      "Planting indigenous trees on hotel grounds without a permit.",
    ],
    correctOption: 0,
    correctExplanation:
      "Greenwashing exposes companies to severe reputational damage, consumer backlash, and regulatory investigation under modern truth-in-advertising and ESG frameworks.",
    incorrectExplanation:
      "Greenwashing refers to deceptive or unsubstantiated environmental marketing claims.",
  },
  {
    order: 7,
    question:
      "How should executive leaders address change fatigue among middle managers when rolling out new environmental initiatives?",
    options: [
      "Integrate green goals into existing workflows and KPI reviews, providing tangible tools and recognizing time-saving process improvements.",
      "Double the number of weekly meetings and demand daily handwritten reports.",
      "Ignore manager concerns and assume compliance will occur automatically.",
      "Replace all middle managers with automated artificial intelligence.",
    ],
    correctOption: 0,
    correctExplanation:
      "Embedding sustainability into existing routines and demonstrating efficiency gains prevents staff from viewing sustainability as an unmanageable extra workload.",
    incorrectExplanation:
      "Integrating goals into existing routines and providing tools overcomes change fatigue.",
  },
  {
    order: 8,
    question:
      "What is the most effective way to ensure a corporate sustainability program survives staff turnover and leadership transitions?",
    options: [
      "Institutionalize policies into employee onboarding, Standard Operating Procedures (SOPs), vendor contracts, and central digital tracking systems.",
      "Keep all project details in the personal email inbox of a single employee.",
      "Rely exclusively on unwritten verbal traditions and informal memory.",
      "End all sustainability initiatives whenever a department head resigns.",
    ],
    correctOption: 0,
    correctExplanation:
      "Institutionalizing processes into standard operational documentation, contracts, and digital dashboards guarantees long-term continuity regardless of personnel changes.",
    incorrectExplanation:
      "Policies must be embedded into systems, SOPs, and contracts to survive personnel turnover.",
  },
  {
    order: 9,
    question:
      "What is the ultimate goal of workplace sustainability leadership?",
    options: [
      "To embed environmental and social responsibility into the cultural DNA and everyday commercial decisions of the organization.",
      "To win a single trophy and immediately stop all environmental tracking.",
      "To create a marketing slogan that distracts the public from operating practices.",
      "To eliminate all business growth in order to save electricity.",
    ],
    correctOption: 0,
    correctExplanation:
      "Transformational leadership embeds sustainability into organizational culture, operating decisions, and long-term enterprise value creation.",
    incorrectExplanation:
      "The ultimate objective is deep cultural integration and sustainable commercial operations.",
  },
];

export async function ensureWorkplaceSustainabilityLeadershipCourse(): Promise<void> {
  try {
    const existing = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.slug, COURSE_SLUG))
      .limit(1)
      .then((r) => r[0]);

    let courseId: number;

    if (existing) {
      courseId = existing.id;
      // Preserve "draft" status as requested
      await db
        .update(coursesTable)
        .set({
          title: COURSE_META.title,
          courseCode: COURSE_META.courseCode,
          description: COURSE_META.description,
          fullDescription: COURSE_META.fullDescription,
          categoryId: COURSE_META.categoryId,
          durationMinutes: COURSE_META.durationMinutes,
          priceUsd: COURSE_META.priceUsd,
          level: COURSE_META.level,
          status: "draft", // Strictly preserved as draft
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
        .where(eq(coursesTable.id, courseId));
    } else {
      const [newCourse] = await db
        .insert(coursesTable)
        .values({
          title: COURSE_META.title,
          slug: COURSE_META.slug,
          courseCode: COURSE_META.courseCode,
          description: COURSE_META.description,
          fullDescription: COURSE_META.fullDescription,
          categoryId: COURSE_META.categoryId,
          durationMinutes: COURSE_META.durationMinutes,
          priceUsd: COURSE_META.priceUsd,
          level: COURSE_META.level,
          status: "draft", // Strictly preserved as draft
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
      courseId = newCourse.id;
    }

    // Seed/update lessons
    const existingLessons = await db
      .select({ id: lessonsTable.id })
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, courseId));

    if (existingLessons.length > 0) {
      await db.delete(lessonsTable).where(eq(lessonsTable.courseId, courseId));
    }

    for (const lesson of LESSONS) {
      await db.insert(lessonsTable).values({
        courseId,
        title: lesson.title,
        orderIndex: lesson.order,
        durationMinutes: lesson.minutes,
        content: lesson.content,
        contentBlocks: lesson.blocks as any,
      });
    }

    // Seed/update quiz questions
    const existingQuiz = await db
      .select({ id: quizQuestionsTable.id })
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, courseId));

    if (existingQuiz.length > 0) {
      await db
        .delete(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, courseId));
    }

    for (const q of QUIZ_QUESTIONS) {
      await db.insert(quizQuestionsTable).values({
        courseId,
        orderIndex: q.order,
        question: q.question,
        options: q.options,
        correctOption: q.correctOption,
        correctExplanation: q.correctExplanation,
        incorrectExplanation: q.incorrectExplanation,
      });
    }

    // Ensure badge definition
    const existingBadge = await db
      .select()
      .from(badgeDefinitionsTable)
      .where(eq(badgeDefinitionsTable.slug, BADGE_SLUG))
      .limit(1)
      .then((r) => r[0]);

    if (existingBadge) {
      await db
        .update(badgeDefinitionsTable)
        .set({
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          courseIds: [courseId],
          icon: "award",
        })
        .where(eq(badgeDefinitionsTable.id, existingBadge.id));
    } else {
      await db
        .insert(badgeDefinitionsTable)
        .values({
          name: COURSE_META.badgeName,
          slug: BADGE_SLUG,
          description: COURSE_META.badgeDescription,
          icon: "award",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 23,
        })
        .onConflictDoNothing();
    }

    logger.info(
      { courseId, slug: COURSE_SLUG, status: "draft" },
      "Completed course structure seeded for Workplace Sustainability Leadership (DRAFT)"
    );
  } catch (err: any) {
    logger.warn(
      { err: err?.message },
      "Notice during ensureWorkplaceSustainabilityLeadershipCourse seeding"
    );
  }
}
