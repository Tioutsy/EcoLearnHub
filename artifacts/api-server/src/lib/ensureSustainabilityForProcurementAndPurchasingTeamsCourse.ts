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

const COURSE_SLUG = "sustainability-for-procurement-and-purchasing-teams";
const COURSE_TITLE = "Sustainability for Procurement and Purchasing Teams";
const BADGE_SLUG = "responsible-procurement-practitioner";
const BADGE_CODE = "COURSE_ELH_26_COMPLETE";
const SEED_NAME = "sustainability-for-procurement-and-purchasing-teams-v2";

const COURSE_META = {
  courseCode: "ELH-26",
  description: "A practical course for procurement officers, purchasing staff, buyers and managers on applying sustainability to real purchasing requests, supplier comparisons, approvals, records and recurring workplace decisions.",
  fullDescription: "A practical course for procurement officers, purchasing staff, buyers and managers on applying sustainability to real purchasing requests, supplier comparisons, approvals, records and recurring workplace decisions without overstating the authority of the procurement role or making legal, technical or environmental conclusions outside their competence.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "Applied Workplace Practice",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainability-for-procurement-and-purchasing-teams.jpg",
  intendedRoles: [
    "Procurement officers",
    "Purchasing staff",
    "Buyers",
    "Department managers who request or approve purchases",
    "Employees with purchasing authority",
  ],
  learningObjectives: [
    "Define the actual operational need before requesting a purchase.",
    "Distinguish essential requirements from preferences and translate sustainability intentions into specific, verifiable criteria.",
    "Compare suppliers using evidence rather than unsupported environmental language.",
    "Consider whole-life value rather than purchase price alone.",
    "Identify when an environmental claim requires clarification, documentation or escalation.",
    "Record the reasons behind a procurement decision in a reviewable format.",
    "Follow approval, conflict-of-interest and supplier-management procedures.",
    "Review supplier performance against agreed requirements after the purchase or contract begins.",
    "Raise concerns without personally making legal or technical conclusions outside the procurement role.",
    "Apply the six-stage procurement cycle to a realistic Mauritius workplace purchasing decision.",
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Sustainability for Procurement and Purchasing Teams. You are now better prepared to define purchasing needs, write clear requirements, compare evidence, document decisions and manage supplier performance responsibly.",
  badgeName: "Responsible Procurement Practitioner",
  badgeDescription: "Awarded for demonstrating practical understanding of how to apply sustainability to purchasing needs, supplier comparison, whole-life value, decision records and post-award supplier management.",
};

const NEW_LESSONS = [
  // Lesson 0 — Part 1: Opening Hook
  {
    order: 0,
    title: "Opening Hook: The Urgent Request",
    minutes: 2,
    content: "A realistic Mauritius procurement situation where an urgent order arrives with incomplete evidence and an undisclosed relationship.",
    blocks: [
      { id: "c26v2-l1-b1", type: "heading", headingText: "Opening Hook: The Urgent Request" },
      {
        id: "c26v2-l1-b2",
        type: "short_text",
        bodyText: "A department head at a Port Louis commercial property management company forwards an urgent message: 'We need to order twenty premium air-purification units immediately — the supplier discount expires Friday. I have already chosen the brand. Please process the order.'\n\nAttached to the message is a single supplier quote describing the units as '100% eco-certified and carbon neutral'.\n\nThe procurement officer has thirty minutes before a weekly approval meeting.",
      },
      {
        id: "c26v2-l1-b3",
        type: "key_message",
        headingText: "What Is Missing from This Request?",
        bodyText: "The verified operational need — how many units are actually required and why?\nA comparison of more than one supplier or option.\nEvidence supporting the 'eco-certified and carbon neutral' claim.\nWhether the department head has a personal or commercial relationship with the supplier.\nA whole-life cost estimate including maintenance and replacement.\nRequired approval for a purchase of this value.",
      },
      {
        id: "c26v2-l1-b4",
        type: "short_text",
        bodyText: "This course prepares you to respond to situations like this — not by blocking necessary purchases, but by asking the right questions, collecting the right evidence, and recording a decision that can be defended on review.",
      },
    ],
  },

  // Lesson 1 — Part 2: Why It Matters
  {
    order: 1,
    title: "Why Procurement Decisions Matter",
    minutes: 2,
    content: "Why sustainable procurement practices matter for employees, organisations and the environment.",
    blocks: [
      { id: "c26v2-l2-b1", type: "heading", headingText: "Why Procurement Decisions Matter" },
      {
        id: "c26v2-l2-b2",
        type: "short_text",
        bodyText: "For you personally: Procurement decisions that are poorly documented or based on unverified claims create professional risk. A clear, evidence-based process protects the employee as much as the organisation.\n\nFor the business: Purchases are one of the most direct ways an organisation creates waste, incurs cost and generates environmental impact. Procurement decisions that consider whole-life value and supplier reliability reduce both financial and reputational risk.\n\nFor the environment and ESG: Supply chains account for a significant share of most organisations' environmental footprint. Procurement that asks the right questions about materials, energy use, packaging and end-of-life disposal can reduce that footprint without requiring specialist technical knowledge.",
      },
      {
        id: "c26v2-l2-b3",
        type: "key_message",
        headingText: "What Can Go Wrong",
        bodyText: "Purchasing without verifying the need leads to excess stock and waste.\nAccepting unverified environmental claims creates greenwashing risk.\nIgnoring whole-life costs results in higher total expenditure.\nFailing to document decisions makes reviews and audits unreliable.\nUndisclosed conflicts of interest undermine fair supplier selection.",
      },
    ],
  },

  // Lesson 2 — Part 3: Plain-Language Vocabulary
  {
    order: 2,
    title: "Key Terms in Procurement and Purchasing",
    minutes: 2,
    content: "Plain-language definitions of the terms procurement employees genuinely need for sustainability-related purchasing decisions.",
    blocks: [
      { id: "c26v2-l3-b1", type: "heading", headingText: "Key Terms in Procurement and Purchasing" },
      {
        id: "c26v2-l3-b2",
        type: "short_text",
        bodyText: "Specification: A written description of what is being purchased — the function, performance standard, quantity and any relevant criteria. A vague specification produces vague supplier responses.\n\nWhole-Life Cost (Total Cost of Ownership): The full cost of a purchase over its useful life, including price, installation, maintenance, consumables, energy or water use, and end-of-life disposal or return.\n\nEvaluation Criteria: The specific factors against which supplier responses are compared. Criteria must be defined before responses are received and applied consistently throughout.\n\nGreenwashing: Describing a product, service or organisation as environmentally responsible using claims that are vague, exaggerated, selective or unsupported by verifiable evidence.\n\nConflict of Interest: A personal, financial or professional relationship that could — or could appear to — influence a procurement decision unfairly. Must be declared and handled through the organisation's process.\n\nPost-Award Management: The process of monitoring and managing a supplier after a contract or purchase order has been placed, to verify that agreed requirements are being met.\n\nTake-Back Arrangement: A commitment by a supplier to collect or accept the return of a product or packaging at end of use, to prevent it going to landfill.",
      },
    ],
  },

  // Lesson 3 — Part 4: Role Boundaries
  {
    order: 3,
    title: "Procurement Role and Responsibility Boundaries",
    minutes: 2,
    content: "What procurement owns, coordinates, supports, escalates and does not independently authorise.",
    blocks: [
      { id: "c26v2-l4-b1", type: "heading", headingText: "Procurement Role and Responsibility Boundaries" },
      {
        id: "c26v2-l4-b2",
        type: "short_text",
        bodyText: "Procurement owns: Verifying the operational need. Writing clear, proportionate specifications. Conducting a consistent supplier evaluation. Recording the reasoning behind a decision. Managing suppliers against agreed requirements. Raising concerns about claims, conflicts or process irregularities.\n\nProcurement coordinates: The approval process for purchases above delegation thresholds. Technical or specialist verification of environmental, safety or legal claims. Finance review for capital expenditure and whole-life cost modelling.\n\nProcurement supports: ESG and sustainability reporting by providing accurate decision records. Finance by supplying purchase documentation and supplier performance data. Operations and facilities by confirming that agreed requirements are in writing.\n\nProcurement escalates: Conflict-of-interest concerns — to the organisation's designated process. Unverifiable or potentially misleading supplier claims — to a technical or sustainability lead. Process irregularities (such as criteria changed after offers are received) — to management or compliance.\n\nProcurement does not independently: Make technical environmental assessments. Interpret legal or regulatory requirements. Guarantee supplier financial stability or capacity. Certify a product or service as compliant with a standard it has not assessed.",
      },
      {
        id: "c26v2-l4-b3",
        type: "key_message",
        headingText: "Completing This Course",
        bodyText: "Completion of this course demonstrates familiarity with practical procurement principles. It is not a professional procurement licence, legal authorisation or technical qualification. It does not certify the learner to make independent environmental assessments or legal determinations.",
      },
    ],
  },

  // Lesson 4 — Part 5 (Framework step 1): Start With the Need
  {
    order: 4,
    title: "Start With the Need, Not the Product",
    minutes: 2,
    content: "Before requesting a purchase, define what the organisation actually needs. Automatic replacement can create unnecessary cost and waste.",
    blocks: [
      { id: "c26v2-l5-b1", type: "heading", headingText: "Start With the Need, Not the Product" },
      { id: "c26v2-l5-b2", type: "short_text", bodyText: "A purchasing request often names a specific product, brand or supplier before anyone has confirmed what the organisation actually needs. Starting with the product can lead to unnecessary spend, excess stock and wasted resources. Starting with the need gives procurement a clearer basis for any decision." },
      { id: "c26v2-l5-b3", type: "key_message", headingText: "Questions to Ask Before Requesting a Purchase", bodyText: "Is the item genuinely needed right now? Can an existing item be repaired, shared, reused or reassigned? What quantity is actually required? What performance or service outcome is needed? Is the request temporary, recurring or long-term?" },
      { id: "c26v2-l5-b4", type: "short_text", bodyText: "Procurement should not pressure staff to avoid purchases that are necessary. Safety, quality, hygiene, accessibility and operational continuity remain essential. The goal is to ensure that what is purchased reflects a verified need, in the right quantity, for the right reason." },
      { id: "c26v2-l5-b5", type: "key_message", headingText: "Mauritian Workplace Example", bodyText: "A hotel department requests twenty new office chairs because several chairs look worn. The procurement officer checks which chairs are structurally damaged, which can be repaired or reupholstered locally, whether unused chairs exist in another department, and whether all twenty are needed immediately. The decision may still be to purchase chairs — but the quantity and specification should be based on the verified need." },
      {
        id: "c26v2-l5-b6",
        type: "decision_scenario",
        decisionIntro: "A department requests twelve new desktop printers, citing that their current printers are slow.",
        decisionPrompt: "Which is the strongest first action?",
        decisionChoices: [
          { label: "Order the requested model immediately to avoid further delay.", correct: false, feedback: "Incorrect. Acting before confirming the need may result in unnecessary purchase of equipment that duplicates existing capacity." },
          { label: "Ask what printing demand cannot be met by the existing shared printers.", correct: true, feedback: "Correct. Clarifying the unmet operational need gives procurement the right basis for any decision — including whether new printers are actually required." },
          { label: "Reject the request because printing creates waste.", correct: false, feedback: "Incorrect. Printing may be operationally necessary. A blanket rejection without reviewing the need is not proportionate." },
          { label: "Choose the cheapest printer available online without further review.", correct: false, feedback: "Incorrect. Selecting by lowest price alone, without confirming the need or reviewing whole-life costs, can increase long-term operational expenditure." },
        ],
      },
    ],
  },

  // Lesson 5 — Part 5 (Framework step 2) + Part 7: Requirements + Memorable Fact
  {
    order: 5,
    title: "Write Clear Requirements and Evaluate Evidence",
    minutes: 2,
    content: "Translate a sustainability intention into usable purchasing requirements and learn how verifiable evidence differs from marketing language.",
    blocks: [
      { id: "c26v2-l6-b1", type: "heading", headingText: "Write Clear and Proportionate Requirements" },
      { id: "c26v2-l6-b2", type: "short_text", bodyText: "Requirements must be relevant to the product or service being purchased. Vague instructions such as 'must be eco-friendly', 'must be green' or 'must be sustainable' are difficult to evaluate and can disqualify capable suppliers unfairly. Better criteria describe an observable feature, service or evidence." },
      { id: "c26v2-l6-b3", type: "key_message", headingText: "Criteria Can Include", bodyText: "Durability and expected lifespan. Repairability and local maintenance support. Energy or water performance. Packaging format and refill options. Use of recycled or responsibly sourced materials. Availability of replacement parts. Take-back or return arrangements. Delivery frequency. Supplier reporting or evidence commitments." },
      { id: "c26v2-l6-b4", type: "short_text", bodyText: "Criteria must remain proportionate. They should not unnecessarily prevent capable suppliers from competing. Do not invent mandatory certifications or legal requirements. Where specialist or legal advice is needed, escalate appropriately rather than making assumptions." },
      {
        id: "c26v2-l6-b5",
        type: "memorable_fact",
        factTitle: "Worth Knowing: Specific Criteria Produce Specific Responses",
        bodyText: "ISO 20400:2017 (Sustainable Procurement guidance) identifies specificity as the most important characteristic of a usable sustainability requirement. A requirement that describes a measurable outcome — such as 'minimum five-year manufacturer warranty with local service available within 48 hours' — allows all suppliers to respond on equal terms and allows evaluators to compare responses consistently. General statements such as 'must be environmentally responsible' cannot be evaluated or compared and carry a risk of legal challenge in competitive procurement.",
      },
      { id: "c26v2-l6-b6", type: "key_message", headingText: "Mauritian Workplace Example", bodyText: "Instead of requesting 'environmentally friendly cleaning products', a workplace may ask shortlisted suppliers to provide: product-use instructions, packaging format and refill options, safety documentation required by company procedure, information supporting specific environmental claims, and delivery and container-return arrangements where available. Each criterion is specific and reviewable." },
    ],
  },

  // Lesson 6 — Part 5 (Framework step 3): Whole-Life Value
  {
    order: 6,
    title: "Compare Whole-Life Value, Not Price Alone",
    minutes: 2,
    content: "The cheapest initial price is not automatically the best value. Whole-life value accounts for the cost and operational consequences of a purchase over its useful life.",
    blocks: [
      { id: "c26v2-l7-b1", type: "heading", headingText: "Compare Whole-Life Value, Not Price Alone" },
      { id: "c26v2-l7-b2", type: "short_text", bodyText: "Whole-life value means considering what a purchase will cost — and how it will perform — across its full useful life, not only at the point of purchase. A product with a lower purchase price may cost more to run, maintain or replace than one that costs more to buy initially." },
      { id: "c26v2-l7-b3", type: "key_message", headingText: "Considerations in a Whole-Life Assessment", bodyText: "Purchase price. Delivery and installation. Energy or water consumption during use. Consumables and replacement parts. Maintenance and repair costs. Expected useful life. Downtime or service disruption risk. Disposal or recovery arrangements at end of life. Contract management effort and supplier support." },
      { id: "c26v2-l7-b4", type: "short_text", bodyText: "The highest-priced option is not automatically the most sustainable choice either. The level of analysis should match the value, risk and duration of the purchase. Not every purchase requires a complex calculation — but recording the key assumptions and comparisons used helps justify the decision." },
      { id: "c26v2-l7-b5", type: "key_message", headingText: "Mauritian Workplace Example", bodyText: "Two water dispensers are compared for an office. Option A has a lower purchase price but expensive proprietary filters and limited local servicing. Option B costs more initially but has locally available maintenance, standard replacement parts and a longer warranty. The decision should document the expected use, support arrangements and cost implications, rather than relying only on the purchase price." },
      {
        id: "c26v2-l7-b6",
        type: "decision_scenario",
        decisionIntro: "A procurement officer is comparing two cleaning-equipment suppliers. Supplier A offers a lower purchase price. Supplier B offers a higher purchase price but includes a three-year maintenance contract with local technicians.",
        decisionPrompt: "What information is most useful before making a decision?",
        decisionChoices: [
          { label: "The lowest purchase price, because procurement must always reduce upfront costs.", correct: false, feedback: "Incorrect. Upfront cost is one factor. Without reviewing maintenance costs and equipment lifespan, a lower purchase price may result in higher overall expenditure." },
          { label: "The expected useful life, annual maintenance cost and local availability of spare parts for both options.", correct: true, feedback: "Correct. These factors allow a more complete comparison of whole-life value, which is more useful than purchase price alone." },
          { label: "Which supplier has a better sustainability brand reputation.", correct: false, feedback: "Incorrect. Brand reputation is not a substitute for specific, documented cost and performance information." },
          { label: "Which supplier is larger, because larger organisations are more reliable.", correct: false, feedback: "Incorrect. Organisation size does not determine suitability. The evaluation should use the criteria stated in the specification." },
        ],
      },
    ],
  },

  // Lesson 7 — Part 8: Visual Learning Element
  {
    order: 7,
    title: "The Procurement Cycle: A Visual Guide",
    minutes: 2,
    content: "A visual guide to the six-stage sustainable procurement cycle, with an interactive interpretation question.",
    blocks: [
      { id: "c26v2-l8-b1", type: "heading", headingText: "The Sustainable Procurement Cycle" },
      {
        id: "c26v2-l8-b2",
        type: "image",
        imageUrl: "/images/courses/sustainability-for-procurement-and-purchasing-teams.jpg",
        captionText: "The six-stage procurement cycle: Define Need → Write Requirements → Compare Value & Evidence → Approve & Document → Confirm Agreement → Review Supplier Performance.",
      },
      {
        id: "c26v2-l8-b3",
        type: "short_text",
        bodyText: "Reading the diagram: Each stage has a defined output before the next stage can proceed.\n\nStage 1 — Define Need: Output is a confirmed requirement with verified quantity.\nStage 2 — Write Requirements: Output is a specification with observable criteria.\nStage 3 — Compare Value and Evidence: Output is a consistent evaluation against stated criteria.\nStage 4 — Approve and Document: Output is a defensible decision note with required approvals.\nStage 5 — Confirm Agreement: Output is a written purchase order or contract confirming requirements.\nStage 6 — Review Supplier Performance: Output is a performance record against agreed requirements.\n\nIf Stage 6 is skipped, the organisation has no documented basis for renewing, improving or challenging the supplier arrangement.",
      },
    ],
  },

  // Lesson 8 — Part 5 (Framework step 4): Test Supplier Claims
  {
    order: 8,
    title: "Test Supplier Claims and Evidence",
    minutes: 2,
    content: "Environmental claims from suppliers require appropriate scrutiny. Ask the right questions rather than accepting or dismissing claims without review.",
    blocks: [
      { id: "c26v2-l9-b1", type: "heading", headingText: "Test Supplier Claims and Evidence" },
      { id: "c26v2-l9-b2", type: "short_text", bodyText: "Suppliers sometimes describe their products or services using terms such as 'zero impact', '100% green', 'carbon neutral', 'fully biodegradable' or 'planet friendly'. These phrases may be accurate, partially accurate, or difficult to verify. Procurement employees do not need to assess the technical accuracy of every claim — but they should ask useful questions before accepting or repeating one." },
      { id: "c26v2-l9-b3", type: "key_message", headingText: "Useful Questions to Ask", bodyText: "What exactly does this claim apply to? Which product, period or service is covered? What conditions or limitations apply? What evidence supports it? Is that evidence current and relevant to the product or service offered? Does the claim apply to the full product, or only a component?" },
      { id: "c26v2-l9-b4", type: "short_text", bodyText: "Supplier brochures alone may not answer every question. Evidence requirements should remain proportionate to the value and risk of the purchase. Unsupported claims should not receive evaluation credit merely because they sound positive. Concerns should be recorded and escalated through the organisation's approval process." },
      { id: "c26v2-l9-b5", type: "key_message", headingText: "Mauritian Workplace Example", bodyText: "A packaging supplier describes a product as 'fully biodegradable in Mauritius'. The buyer asks: Under which conditions does it break down? Does it require industrial treatment? What evidence supports the claim? Does the claim apply to the full packaging item, including labels and lining? The buyer records the supplier's response rather than repeating the original claim as fact in the evaluation report." },
      {
        id: "c26v2-l9-b6",
        type: "decision_scenario",
        decisionIntro: "Three suppliers each make a statement about their product. You need to identify the most decision-useful statement.",
        decisionPrompt: "Which statement is most useful when comparing supplier evidence?",
        decisionChoices: [
          { label: "Our product protects the planet.", correct: false, feedback: "Incorrect. This is a general marketing statement with no specific claim, evidence or measurement. It cannot be evaluated or compared." },
          { label: "Our packaging contains recycled material.", correct: false, feedback: "Partially useful but incomplete. The proportion, type of recycled material and supporting evidence are not specified. This statement cannot be reliably compared between suppliers." },
          { label: "The offered container contains 40% post-consumer recycled plastic by weight, supported by the attached product specification from our manufacturer.", correct: true, feedback: "Correct. This statement is specific, measurable and supported by documentation. It allows for a fair comparison between suppliers and can be recorded in the evaluation." },
          { label: "We are committed to sustainability and reducing our environmental impact across all operations.", correct: false, feedback: "Incorrect. A general commitment statement does not provide specific, verifiable information about the product being purchased." },
        ],
      },
    ],
  },

  // Lesson 9 — Part 10: Applied Scenario Challenge
  {
    order: 9,
    title: "Scenario Challenge: The Cleaning Contract Renewal",
    minutes: 2,
    content: "A multi-step Mauritius workplace scenario requiring the learner to review evidence, respect role boundaries and choose a practical response.",
    blocks: [
      { id: "c26v2-l10-b1", type: "heading", headingText: "Scenario Challenge: The Cleaning Contract Renewal" },
      {
        id: "c26v2-l10-b2",
        type: "short_text",
        bodyText: "A hotel in Grand Baie, Mauritius, is renewing its three-year cleaning-services contract. Three suppliers have responded. The procurement officer has received the following:\n\nSupplier A: Lowest price. States products are '100% natural and certified zero-impact'. No supporting documentation provided.\n\nSupplier B: Mid-range price. Provides product data sheets, a refill and take-back arrangement, and a written maintenance schedule. Prices include all consumables.\n\nSupplier C: Highest price. The operations manager has mentioned privately that they have used the supplier personally for home services and finds them reliable.\n\nThe operations manager is pressing for a quick decision before the current contract expires on Friday.",
      },
      {
        id: "c26v2-l10-b3",
        type: "key_message",
        headingText: "What Does the Procurement Officer Do?",
        bodyText: "Step 1: Note that Supplier A's claim ('100% natural and certified zero-impact') is unspecified. Ask what evidence supports it before awarding evaluation points. Record the response.\n\nStep 2: Note that the operations manager has a personal connection to Supplier C. This must be declared and handled through the conflict-of-interest process before evaluation proceeds — regardless of the manager's intention or the quality of Supplier C's service.\n\nStep 3: Evaluate all three suppliers against the agreed criteria (quality, whole-life cost, documented sustainability commitments, local service availability). Based on available evidence, Supplier B provides the most specific and verifiable information.\n\nStep 4: Record the evaluation, including how Supplier A's claim was handled, how the declared connection to Supplier C was managed, and why Supplier B met the stated criteria. Do not accuse the manager of misconduct.\n\nStep 5: Confirm the agreement with the selected supplier in writing, including specific requirements, and assign responsibility for monitoring performance.",
      },
      {
        id: "c26v2-l10-b4",
        type: "decision_scenario",
        decisionIntro: "The operations manager insists that Supplier C should be selected because 'they are the best in the business'. The conflict-of-interest declaration has not yet been made.",
        decisionPrompt: "What is the correct procurement response?",
        decisionChoices: [
          { label: "Select Supplier C immediately, because management preferences take priority.", correct: false, feedback: "Incorrect. Proceeding without a declared conflict-of-interest is a process failure that exposes the organisation and the procurement officer to review risk, regardless of whether Supplier C is actually the strongest option." },
          { label: "Require the personal connection to be declared through the conflict-of-interest process before proceeding, and apply the evaluation criteria consistently to all three suppliers.", correct: true, feedback: "Correct. A declared connection, handled through the established process, allows the evaluation to proceed fairly. This protects the organisation, the manager and the procurement officer." },
          { label: "Remove Supplier C from consideration immediately to avoid any appearance of bias.", correct: false, feedback: "Incorrect. Excluding a supplier without due process may itself be unfair and creates a different risk. The connection must be declared and the process followed — then the evaluation result determines the outcome." },
          { label: "Ask the manager to confirm in writing that the connection will not affect their judgement.", correct: false, feedback: "Incorrect. A written assurance alone does not satisfy conflict-of-interest requirements. The formal declaration and process must be followed." },
        ],
      },
    ],
  },

  // Lesson 10 — Part 5 (Framework step 5): Make and Record a Decision
  {
    order: 10,
    title: "Make and Record a Defensible Decision",
    minutes: 2,
    content: "A procurement decision is defensible when the reasoning, information reviewed and approvals followed are clearly recorded.",
    blocks: [
      { id: "c26v2-l11-b1", type: "heading", headingText: "Make and Record a Defensible Decision" },
      { id: "c26v2-l11-b2", type: "short_text", bodyText: "Applying evaluation criteria consistently and recording the process is a professional responsibility, not an administrative burden. Records support internal review, budget control, supplier management, ESG evidence and consistency in future purchases." },
      { id: "c26v2-l11-b3", type: "key_message", headingText: "A Decision Record Should Include", bodyText: "The verified need. Shortlisted options considered. Information reviewed and key assumptions. Any missing evidence and how it was handled. The evaluation result against stated criteria. Required approvals and who provided them. The final reason for selection." },
      { id: "c26v2-l11-b4", type: "short_text", bodyText: "Avoid vague decision notes such as 'best supplier', 'most sustainable' or 'preferred option'. These phrases do not explain the reasoning and cannot be reviewed meaningfully. Do not change evaluation criteria informally after offers have been received — criteria must be applied consistently throughout the process." },
      { id: "c26v2-l11-b5", type: "key_message", headingText: "Conflict of Interest", bodyText: "Personal relationships, gifts or undisclosed interests must not influence supplier selection. If a conflict exists or may appear to exist, it must be declared and handled through the organisation's approval and escalation process. The procurement officer should not attempt to resolve a conflict of interest alone." },
      { id: "c26v2-l11-b6", type: "key_message", headingText: "Mauritian Workplace Example", bodyText: "A manager prefers a supplier they have used privately. The procurement officer does not accuse the manager of misconduct. Instead, they ensure the relationship is declared and that the organisation's evaluation and approval process is followed. The decision record documents that the declared relationship was noted and that the process remained consistent." },
      {
        id: "c26v2-l11-b7",
        type: "decision_scenario",
        decisionIntro: "A procurement officer has selected a supplier for cleaning equipment. They need to write a decision note.",
        decisionPrompt: "Which decision note is strongest?",
        decisionChoices: [
          { label: "Supplier B was selected because they are the most sustainable option on the market.", correct: false, feedback: "Incorrect. This is an unsupported claim. 'Most sustainable' does not explain the specific evaluation criteria used or how Supplier B performed against them." },
          { label: "Supplier B was selected as the best overall value based on price, service record and delivery reliability.", correct: false, feedback: "Partially useful, but it does not specify the evaluation criteria stated in the original requirement or how each supplier performed against those criteria." },
          { label: "Supplier B was selected because it met all three evaluation criteria: ten-year expected lifespan per product specification, local maintenance support within 48 hours, and a documented take-back arrangement. Supplier A did not provide evidence of local maintenance support.", correct: true, feedback: "Correct. This note states the criteria applied, how each supplier performed, and the specific reason for selection. It is clear, consistent and reviewable." },
          { label: "Supplier B was selected because we have worked with them before and they are reliable.", correct: false, feedback: "Incorrect. Prior relationship is not a stated evaluation criterion and may raise conflict-of-interest concerns without a clear record of the evaluation process." },
        ],
      },
    ],
  },

  // Lesson 11 — Part 5 (Framework step 6) + Part 9 + Part 12 + Part 13: Manage After Award + Actions + Commitment + Completion
  {
    order: 11,
    title: "Manage the Supplier After Award",
    minutes: 2,
    content: "Sustainability-related procurement does not end when a purchase order or contract is issued. Performance must be monitored and problems addressed early.",
    blocks: [
      { id: "c26v2-l12-b1", type: "heading", headingText: "Manage the Supplier After Award" },
      { id: "c26v2-l12-b2", type: "short_text", bodyText: "A purchase order or contract confirms what has been agreed. Confirming requirements in writing, assigning responsibility for checking performance, and reviewing delivery against what was agreed are part of completing the procurement process — not an optional extra." },
      { id: "c26v2-l12-b3", type: "key_message", headingText: "Issues Worth Monitoring", bodyText: "Product quality and quantities delivered. Packaging format versus what was agreed. Maintenance visits and service frequency. Waste removal or take-back arrangements. Reporting commitments. Agreed corrective actions." },
      { id: "c26v2-l12-b4", type: "short_text", bodyText: "Procurement staff should distinguish between a one-off issue, repeated poor performance, and a requirement that was never clearly documented. Discussing problems early and specifically — with a record of the discussion — avoids disputes and helps both parties improve. Renewal points are useful opportunities to improve the specification for the next contract period." },
      { id: "c26v2-l12-b5", type: "key_message", headingText: "Mauritian Workplace Example", bodyText: "A supplier agreed to collect reusable delivery crates but repeatedly leaves them onsite. The contract owner records the missed collections, contacts the supplier, agrees a corrective action with a deadline, and notes in the file whether the original requirement was clearly stated. At renewal, the requirement is written more specifically into the next agreement." },
      {
        id: "c26v2-l12-b6",
        type: "short_text",
        bodyText: "Practical Actions to Apply Now:\n• Clarify the operational need before naming a product in a purchase request.\n• Replace vague 'eco-friendly' wording with a specific, verifiable criterion.\n• Ask for evidence when a supplier makes a material environmental claim — and record the response.\n• Write decision notes that state the criteria, the evaluation result and the reason for selection.\n• Review one recurring contract for a requirement that is agreed but not being verified.\n• Declare personal connections early and follow the conflict-of-interest process.",
      },
      {
        id: "c26v2-l12-b7",
        type: "commitment",
        commitmentInstruction: "Select one commitment to carry forward from this course:",
        commitmentOptions: [
          { slug: "clarify-need-first", label: "I will clarify the operational need before naming a product.", description: "Confirming what is genuinely needed prevents unnecessary purchases." },
          { slug: "specific-requirements", label: "I will replace vague green wording with a specific, verifiable requirement.", description: "Clear requirements produce useful supplier responses." },
          { slug: "ask-for-evidence", label: "I will ask for evidence when a supplier makes a material environmental claim.", description: "Specific evidence supports a fair evaluation." },
          { slug: "record-decision", label: "I will record the reasons for a supplier decision against stated criteria.", description: "Clear records support review, consistency and ESG evidence." },
          { slug: "review-recurring", label: "I will review one recurring purchase for a requirement that is agreed but not verified.", description: "Post-award monitoring completes the procurement cycle." },
          { slug: "declare-conflict", label: "I will declare personal connections early and follow the conflict-of-interest process.", description: "Declared conflicts, handled correctly, protect everyone involved." },
        ],
      },
      {
        id: "c26v2-l12-b8",
        type: "callout",
        headingText: "Course Completion",
        bodyText: "You have completed Sustainability for Procurement and Purchasing Teams. You are now better prepared to define purchasing needs, write clear requirements, compare evidence, document decisions and manage supplier performance responsibly.\n\nThis course provides practical workplace guidance on procurement principles. It does not constitute formal legal advice, a professional procurement qualification, or authorisation to make independent technical, environmental or regulatory determinations.",
      },
    ],
  },
];

const NEW_QUIZ_QUESTIONS = [
  // Q0 — Role-boundary question — correctOption = 1 (Position 2)
  {
    question: "A procurement officer is asked to confirm whether a supplier's claimed 30% carbon reduction is technically accurate. What is the correct response?",
    options: [
      { text: "Calculate the supplier's carbon footprint independently using available data.", isCorrect: false, feedback: "Incorrect. Technical carbon calculations are outside the procurement role. Making an independent assessment creates risk of error and overstates the procurement officer's authority." },
      { text: "Ask the supplier what evidence supports the claim, record the response, and refer the claim to a technical or sustainability lead for verification.", isCorrect: true, feedback: "Correct. Procurement asks the right questions, records the response and escalates to a technical lead for verification. Procurement does not independently assess the accuracy of carbon calculations." },
      { text: "Reject the supplier immediately because the claim cannot be confirmed.", isCorrect: false, feedback: "Incorrect. Rejecting without asking for evidence does not give the supplier a fair opportunity to substantiate the claim and may unfairly exclude a capable supplier." },
      { text: "Accept the claim and award maximum points for environmental performance.", isCorrect: false, feedback: "Incorrect. Accepting an unspecified claim without clarification means evaluation credit is given for a statement that cannot be compared or verified." },
    ],
    correctExplanation: "Procurement's role in evaluating environmental claims is to ask specific questions, record responses and escalate to technical leads — not to independently calculate or certify environmental data.",
    incorrectExplanation: "Procurement should neither independently verify technical claims nor accept or reject them without asking for specific evidence. The correct response is to ask, record and escalate.",
    practicalTakeaway: "Ask for evidence, record the response, and refer technical or scientific claims to the appropriate lead before awarding evaluation points.",
  },
  // Q1 — Evidence-quality question — correctOption = 3 (Position 4)
  {
    question: "A supplier states their cleaning product is 'fully biodegradable in Mauritius'. What is the most useful follow-up question?",
    options: [
      { text: "Is the product cheaper than the competing supplier's equivalent?", isCorrect: false, feedback: "Incorrect. Price does not address the biodegradability claim. Clarifying the claim requires questions about the specific conditions, scope and evidence." },
      { text: "Does the supplier hold an internationally recognised quality certification?", isCorrect: false, feedback: "Incorrect. A general quality certification does not necessarily validate a specific biodegradability claim for a particular product." },
      { text: "How long has the supplier operated in Mauritius?", isCorrect: false, feedback: "Incorrect. Company tenure does not validate the specific claim being made about the product's environmental properties." },
      { text: "Under what conditions does it break down, does it require industrial treatment, and does the claim apply to the full product including labels and packaging?", isCorrect: true, feedback: "Correct. These questions identify what the claim actually covers, what conditions are required, and whether the evidence applies to the full product — which is the information needed to evaluate it fairly." },
    ],
    correctExplanation: "Specific questions about conditions, scope and evidence transform a general marketing claim into information that can be evaluated, compared and recorded in the procurement file.",
    incorrectExplanation: "Price, general certifications and company history do not address the specific biodegradability claim. The task is to clarify what the claim means and what supports it.",
    practicalTakeaway: "Record the supplier's answer to these questions in the evaluation file rather than repeating the original claim as fact.",
  },
  // Q2 — Framework-application question — correctOption = 0 (Position 1)
  {
    question: "A department submits a request for twelve new desktop computers, stating that the current ones are slow. What is the most appropriate first action?",
    options: [
      { text: "Check whether the performance issue is confirmed, how many computers are affected, and whether repair, software upgrade or device reallocation from another area could meet the need.", isCorrect: true, feedback: "Correct. Verifying the operational need — and whether the full quantity is required — is the first stage of the procurement cycle. The answer may still be to purchase computers, but the quantity and specification should be based on confirmed need." },
      { text: "Order twelve computers immediately to avoid further operational delay.", isCorrect: false, feedback: "Incorrect. Acting without verifying the need risks purchasing more than is required or purchasing equipment that does not solve the underlying performance issue." },
      { text: "Reject the request because IT equipment creates electronic waste at end of life.", isCorrect: false, feedback: "Incorrect. Operational IT equipment is a legitimate need. A blanket rejection based on environmental concern, without reviewing the actual requirement, is not proportionate." },
      { text: "Ask the supplier to recommend the most energy-efficient model available.", isCorrect: false, feedback: "Incorrect. Supplier recommendations reflect commercial interest. The organisation should confirm its own verified need before requesting quotations." },
    ],
    correctExplanation: "The first stage of the procurement cycle is to verify the operational need. The decision may still be to purchase — but quantity, specification and timing should be based on a confirmed requirement.",
    incorrectExplanation: "Acting before verifying the need, rejecting without review, or asking the supplier to define the need each bypass the most important first step.",
    practicalTakeaway: "Always confirm the specific operational gap before raising a purchase order — this applies whether the purchase is large or routine.",
  },
  // Q3 — Mauritius workplace scenario — correctOption = 2 (Position 3)
  {
    question: "A Mauritius hotel specifies that all new outdoor furniture must be 'environmentally friendly'. Three suppliers respond with different products. Which revised specification would produce more useful and comparable supplier responses?",
    options: [
      { text: "All outdoor furniture must carry an internationally recognised environmental certification.", isCorrect: false, feedback: "Incorrect. Requiring a specific certification without identifying which scheme may exclude capable suppliers who meet equivalent standards but do not hold that particular certification." },
      { text: "Suppliers must provide proof of membership in a sustainability trade association.", isCorrect: false, feedback: "Incorrect. Association membership is not a direct indicator of product performance. It does not tell the hotel about the furniture's actual durability, maintenance requirements or disposal options." },
      { text: "Furniture must have a documented minimum ten-year design life, use materials that resist humid coastal conditions without specialist coatings, and include a manufacturer take-back or responsible disposal commitment.", isCorrect: true, feedback: "Correct. Each criterion describes an observable, verifiable product feature. All suppliers can respond on equal terms and evaluators can compare responses consistently — which is what a useful specification achieves." },
      { text: "The cheapest furniture option that claims to be sustainable will be selected.", isCorrect: false, feedback: "Incorrect. This conflates price with sustainability and still uses an unverifiable 'sustainable' claim as the criterion. It does not produce comparable or meaningful supplier responses." },
    ],
    correctExplanation: "A useful specification describes observable, verifiable product features. This allows all suppliers to respond on equal terms and evaluators to compare responses consistently.",
    incorrectExplanation: "General certification requirements, association membership and price-based selection do not produce the specific, comparable supplier responses needed to make and record a defensible decision.",
    practicalTakeaway: "Replace 'environmentally friendly' and similar phrases with specific criteria about performance, lifespan, maintenance or end-of-life arrangements.",
  },
  // Q4 — Visual interpretation question — correctOption = 1 (Position 2)
  {
    question: "Looking at the six-stage procurement cycle diagram: a purchase has been completed and the supplier agreement is in place, but the stage 'Review Supplier Performance Against Agreed Requirements' has not been carried out. What does this mean?",
    options: [
      { text: "The procurement cycle is complete once the contract is signed and payment is made.", isCorrect: false, feedback: "Incorrect. Signing a contract and making payment are Stages 4 and 5 of the cycle. Stage 6 — performance review — is a required stage, not a formality that can be skipped." },
      { text: "The procurement cycle is incomplete. Without post-award review, the organisation has no documented basis for verifying that agreed requirements are being met, and no reliable basis for renewal or improvement.", isCorrect: true, feedback: "Correct. The cycle shown in the diagram is only complete when supplier performance has been reviewed against what was agreed. Skipping this stage means problems may go undetected until they cause a larger issue." },
      { text: "The performance review only applies to contracts above a minimum financial threshold.", isCorrect: false, feedback: "Incorrect. Post-award performance review applies to all purchases where specific requirements were agreed. The scale of review should be proportionate to the value and risk of the purchase." },
      { text: "The supplier is responsible for requesting the performance review and the procurement officer should wait.", isCorrect: false, feedback: "Incorrect. Assigning responsibility for checking performance is part of the procurement officer's role at Stage 5 (Confirm Agreement). The review is a procurement responsibility, not a supplier-initiated step." },
    ],
    correctExplanation: "The procurement cycle is complete only when supplier performance has been reviewed against agreed requirements. This is Stage 6 and is a required part of the cycle shown in the diagram.",
    incorrectExplanation: "Treating contract signing or payment as the end of the cycle leaves agreed requirements unverified and provides no basis for renewal decisions or supplier improvement.",
    practicalTakeaway: "Assign responsibility for monitoring each agreed requirement at the time the contract is confirmed — not as an afterthought when a problem appears.",
  },
  // Q5 — Escalation question — correctOption = 3 (Position 4)
  {
    question: "A procurement officer discovers that the manager who approved a supplier selection has a personal financial interest in that supplier. The contract has already been issued. What is the correct response?",
    options: [
      { text: "Ignore the connection because the contract is already in place and raising it now will cause disruption.", isCorrect: false, feedback: "Incorrect. A known undisclosed conflict of interest creates ongoing organisational risk. The procurement officer has a professional responsibility to raise it, regardless of timing." },
      { text: "Cancel the contract immediately and select a different supplier without further investigation.", isCorrect: false, feedback: "Incorrect. Cancelling a contract without following due process creates legal and financial risk. The concern must be raised through the correct channel first." },
      { text: "Ask the manager privately whether the connection affected their decision, and accept their reassurance.", isCorrect: false, feedback: "Incorrect. Private reassurance from the individual with the undisclosed connection does not satisfy conflict-of-interest requirements and does not protect the organisation." },
      { text: "Record the concern in writing and raise it promptly through the organisation's conflict-of-interest or compliance escalation process.", isCorrect: true, feedback: "Correct. The procurement officer's responsibility is to raise the concern formally, not to investigate or resolve it independently. Written records protect the officer and the organisation." },
    ],
    correctExplanation: "Conflicts of interest must be raised through the organisation's formal process, with a written record. The procurement officer is not responsible for investigating or resolving them alone.",
    incorrectExplanation: "Ignoring the connection, acting unilaterally or accepting informal assurances each bypass the controls that exist precisely to handle this situation.",
    practicalTakeaway: "Record and escalate. You do not need to determine the outcome — you need to ensure the concern is formally recorded and handled through the correct channel.",
  },
  // Q6 — Action-completion/verification question — correctOption = 0 (Position 1)
  {
    question: "A cleaning supplier agreed to collect reusable containers monthly. After three months, no collections have taken place. What is the most appropriate next step?",
    options: [
      { text: "Record the missed collections, contact the supplier to discuss the specific non-delivery, agree a corrective action with a clear deadline, and check whether the original requirement was sufficiently documented in the contract.", isCorrect: true, feedback: "Correct. This approach documents the issue, gives the supplier an opportunity to correct it, and identifies whether the requirement needs to be clarified for the next renewal period." },
      { text: "Terminate the contract immediately and source a replacement supplier.", isCorrect: false, feedback: "Incorrect. Immediate termination without first recording the issue and seeking a corrective action is disproportionate and may not be permitted under the contract terms." },
      { text: "Accept the situation because sustainability requirements are often difficult for suppliers to implement.", isCorrect: false, feedback: "Incorrect. Accepting non-delivery without recording or addressing it undermines the value of the agreed requirement and prevents any future improvement." },
      { text: "Ask the supplier to add a sustainability statement to their next invoice to confirm their commitment.", isCorrect: false, feedback: "Incorrect. An invoice statement does not resolve the operational non-delivery. The specific agreed requirement must be addressed directly, with a record of the action taken." },
    ],
    correctExplanation: "Recording the issue, contacting the supplier specifically, agreeing a corrective action and checking the documentation is the proportionate response to supplier non-delivery of an agreed requirement.",
    incorrectExplanation: "Immediate termination, passive acceptance and symbolic gestures each fail to address the specific non-delivery in a way that is documented and leads to improvement.",
    practicalTakeaway: "Post-award monitoring is only effective if non-delivery is recorded and addressed with a specific corrective action and deadline.",
  },
  // Q7 — Principal credibility risk (unverifiable claim in decision note) — correctOption = 2 (Position 3)
  {
    question: "A procurement decision note reads: 'Supplier B was selected because they are the most environmentally advanced supplier in the market.' What is the main problem with this note?",
    options: [
      { text: "The note is too short and should include a full review of the supplier's company history and financial position.", isCorrect: false, feedback: "Incorrect. Length and financial history are not the issue. The problem is the nature of the claim being used to justify the decision." },
      { text: "Environmental considerations should not appear in procurement decision notes, which must focus only on price.", isCorrect: false, feedback: "Incorrect. Environmental criteria can be included in procurement evaluations — but they must be stated as specific, verifiable criteria, not as general comparative claims." },
      { text: "'Most environmentally advanced' is not a stated evaluation criterion, cannot be verified from available information, and does not explain how Supplier B was assessed against any specific requirement.", isCorrect: true, feedback: "Correct. A decision note must state the criteria that were applied and how the selected supplier performed against them. 'Most environmentally advanced' is a subjective claim that cannot be reviewed or challenged on any factual basis." },
      { text: "The note should have been written by the finance department rather than procurement.", isCorrect: false, feedback: "Incorrect. Procurement is responsible for recording procurement decisions. The issue is the quality of the reasoning recorded, not which function authored the note." },
    ],
    correctExplanation: "A defensible decision note states the specific evaluation criteria applied and explains how the selected supplier met them. General comparative claims such as 'most environmentally advanced' cannot be reviewed, verified or challenged.",
    incorrectExplanation: "The problem is not length, environmental content, or authorship — it is that the note uses an unsupported, unverifiable claim instead of specific criteria-based reasoning.",
    practicalTakeaway: "Test every decision note with this question: could someone who was not in the room understand exactly why this supplier was selected, based only on what is written here?",
  },
];

export async function ensureSustainabilityForProcurementAndPurchasingTeamsCourse() {
  logger.info(`Checking and executing ${COURSE_TITLE} course content migration...`);

  try {
    const seedRecord = await db.query.systemSeedsTable.findFirst({
      where: eq(systemSeedsTable.name, SEED_NAME),
    });

    if (seedRecord) {
      logger.info(`[Seed] ${SEED_NAME} has already been run. Skipping to preserve subsequent edits.`);
      return;
    }

    await db.transaction(async (tx) => {
      // 1. Resolve ELH-05 (Sustainable Procurement) — recommended prerequisite only
      let course05 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-05"),
      });
      if (!course05) {
        course05 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "sustainable-procurement"),
        });
      }
      if (!course05) {
        logger.warn("ELH-05 (Sustainable Procurement) not found. Recommended prerequisite will be skipped.");
      }

      // 2. Resolve or insert ELH-26
      let existingCourse = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, COURSE_META.courseCode),
      });
      if (!existingCourse) {
        existingCourse = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, COURSE_SLUG),
        });
      }

      let actualCourseId: number;

      if (!existingCourse) {
        const [inserted] = await tx
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
            completionMessage: COURSE_META.completionMessage,
            intendedRoles: COURSE_META.intendedRoles,
            status: "published",
            isPublished: true,
            recommendedNextCourseId: null,
          })
          .returning();
        actualCourseId = inserted.id;
      } else {
        actualCourseId = existingCourse.id;
        await tx
          .update(coursesTable)
          .set({
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
          })
          .where(eq(coursesTable.id, actualCourseId));
      }

      // 3. Update ELH-25 recommendedNextCourseId to point to ELH-26 (preserving admin edits)
      let course25 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-25"),
      });
      if (!course25) {
        course25 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "sustainability-for-finance-teams"),
        });
      }

      if (course25) {
        let isSystemManaged = false;
        if (course25.recommendedNextCourseId) {
          const currentRec = await tx.query.coursesTable.findFirst({
            where: eq(coursesTable.id, course25.recommendedNextCourseId),
          });
          if (currentRec && currentRec.courseCode === "ELH-26") {
            isSystemManaged = true;
          }
        }
        if (
          course25.recommendedNextCourseId === null ||
          course25.recommendedNextCourseId === actualCourseId ||
          isSystemManaged
        ) {
          await tx
            .update(coursesTable)
            .set({ recommendedNextCourseId: actualCourseId })
            .where(eq(coursesTable.id, course25.id));
        } else {
          logger.warn(
            `Recommendation conflict: ELH-25 currently recommends course ID ${course25.recommendedNextCourseId} instead of ELH-26 (ID: ${actualCourseId}). Preserving administrator edit.`
          );
        }
      } else {
        logger.warn("ELH-25 not found during ELH-26 recommendation configuration.");
      }

      // 4. Set ELH-26 recommendedNextCourseId to ELH-27 if not already set
      let course27 = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.courseCode, "ELH-27"),
      });
      if (!course27) {
        course27 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.slug, "sustainability-for-facilities-and-property-teams"),
        });
      }

      if (course27) {
        const currentELH26 = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.id, actualCourseId),
        });
        if (currentELH26 && currentELH26.recommendedNextCourseId === null) {
          await tx
            .update(coursesTable)
            .set({ recommendedNextCourseId: course27.id })
            .where(eq(coursesTable.id, actualCourseId));
        }
      } else {
        logger.warn("ELH-27 not found. ELH-26 recommendedNextCourseId will remain null.");
      }

      // 5. Ensure Badge Definition exists
      const existingBadge = await tx.query.badgeDefinitionsTable.findFirst({
        where: eq(badgeDefinitionsTable.slug, BADGE_SLUG),
      });

      if (!existingBadge) {
        await tx.insert(badgeDefinitionsTable).values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "award",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 26,
          code: BADGE_CODE,
        });
      } else {
        await tx
          .update(badgeDefinitionsTable)
          .set({
            name: COURSE_META.badgeName,
            description: COURSE_META.badgeDescription,
            courseIds: [actualCourseId],
            code: BADGE_CODE,
          })
          .where(eq(badgeDefinitionsTable.slug, BADGE_SLUG));
      }

      // 6. Ensure ELH-05 recommended prerequisite (non-blocking)
      if (course05) {
        const existingRecommendedPrereq = await tx.query.coursePrerequisitesTable.findFirst({
          where: and(
            eq(coursePrerequisitesTable.courseId, actualCourseId),
            eq(coursePrerequisitesTable.prerequisiteCourseId, course05.id)
          ),
        });
        if (!existingRecommendedPrereq) {
          await tx.insert(coursePrerequisitesTable).values({
            courseId: actualCourseId,
            prerequisiteCourseId: course05.id,
            requirementType: "recommended",
          });
        } else {
          await tx
            .update(coursePrerequisitesTable)
            .set({ requirementType: "recommended" })
            .where(
              and(
                eq(coursePrerequisitesTable.courseId, actualCourseId),
                eq(coursePrerequisitesTable.prerequisiteCourseId, course05.id)
              )
            );
        }
      }

      // 7. Seed Lessons safely (only if no progress or skeleton lessons exist)
      const existingLessons = await tx.query.lessonsTable.findMany({
        where: eq(lessonsTable.courseId, actualCourseId),
      });

      const hasOnlySkeletonLessons =
        existingLessons.length > 0 &&
        existingLessons.every((l) => l.content && l.content.includes("[DRAFT SKELETON]"));

      let existingLessonProgress: any[] = [];
      if (existingLessons.length > 0) {
        existingLessonProgress = await tx.query.lessonProgressTable.findMany({
          where: inArray(
            lessonProgressTable.lessonId,
            existingLessons.map((l) => l.id)
          ),
        });
      }

      if (existingLessonProgress.length === 0 && (existingLessons.length === 0 || hasOnlySkeletonLessons)) {
        if (hasOnlySkeletonLessons) {
          await tx.delete(lessonsTable).where(eq(lessonsTable.courseId, actualCourseId));
        }

        for (const lesson of NEW_LESSONS) {
          const lExist = await tx.query.lessonsTable.findFirst({
            where: and(
              eq(lessonsTable.orderIndex, lesson.order),
              eq(lessonsTable.courseId, actualCourseId)
            ),
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
        where: eq(quizQuestionsTable.courseId, actualCourseId),
      });

      const hasOnlySkeletonQuestions =
        existingQuestions.length > 0 &&
        existingQuestions.every((q) => q.question && q.question.includes("[DRAFT SKELETON]"));

      const existingAttempts = await tx.query.quizAttemptsTable.findMany({
        where: eq(quizAttemptsTable.courseId, actualCourseId),
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
            ),
          });

          if (!qExist) {
            const correctOptionIndex = q.options.findIndex((o) => o.isCorrect);
            if (correctOptionIndex === -1) {
              throw new Error(`ELH-26 Quiz Question ${index} is missing a correct option`);
            }

            await tx.insert(quizQuestionsTable).values({
              courseId: actualCourseId,
              question: q.question,
              options: q.options.map((o) => o.text),
              optionFeedback: q.options.map((o) => o.feedback),
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
