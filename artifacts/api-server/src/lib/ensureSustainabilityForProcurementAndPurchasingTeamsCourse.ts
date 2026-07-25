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
const SEED_NAME = "sustainability-for-procurement-and-purchasing-teams-v1";

const COURSE_META = {
  courseCode: "ELH-26",
  description: "A practical course for procurement officers, purchasing staff, buyers and managers on applying sustainability to real purchasing requests, supplier comparisons, approvals, records and recurring workplace decisions.",
  fullDescription: "A practical course for procurement officers, purchasing staff, buyers and managers on applying sustainability to real purchasing requests, supplier comparisons, approvals, records and recurring workplace decisions.",
  categoryId: 1,
  durationMinutes: 18,
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
    "Distinguish essential requirements from preferences.",
    "Include relevant and proportionate sustainability criteria in a request or specification.",
    "Compare suppliers using evidence rather than unsupported environmental language.",
    "Consider whole-life value rather than purchase price alone.",
    "Identify when an environmental claim requires clarification or documentation.",
    "Record the reasons behind a procurement decision.",
    "Follow approval, conflict-of-interest and supplier-management procedures.",
    "Review supplier performance after the purchase or contract begins.",
    "Raise concerns without personally making legal or technical conclusions outside their role.",
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Sustainability for Procurement and Purchasing Teams. You are now better prepared to define purchasing needs, compare relevant evidence, document decisions and follow supplier performance responsibly.",
  badgeName: "Responsible Procurement Practitioner",
  badgeDescription: "Awarded for demonstrating practical understanding of how to apply sustainability to purchasing needs, supplier comparison, whole-life value, decision records and post-award supplier management.",
};

const NEW_LESSONS = [
  {
    order: 0,
    title: "Start With the Need, Not the Product",
    minutes: 3,
    content: "Before requesting a purchase, define what the organisation actually needs. Automatic replacement can create unnecessary cost and waste.",
    blocks: [
      { id: "c26-l1-b1", type: "heading", headingText: "Start With the Need, Not the Product" },
      { id: "c26-l1-b2", type: "short_text", bodyText: "A purchasing request often names a specific product, brand or supplier before anyone has confirmed what the organisation actually needs. Starting with the product can lead to unnecessary spend, excess stock and wasted resources. Starting with the need gives procurement a clearer basis for any decision." },
      { id: "c26-l1-b3", type: "key_message", headingText: "Questions to Ask Before Requesting a Purchase", bodyText: "Is the item genuinely needed right now? Can an existing item be repaired, shared, reused or reassigned? What quantity is actually required? What performance or service outcome is needed? Is the request temporary, recurring or long-term?" },
      { id: "c26-l1-b4", type: "short_text", bodyText: "Procurement should not pressure staff to avoid purchases that are necessary. Safety, quality, hygiene, accessibility and operational continuity remain essential. The goal is to ensure that what is purchased reflects a verified need, in the right quantity, for the right reason." },
      { id: "c26-l1-b5", type: "key_message", headingText: "Mauritian Workplace Example", bodyText: "A hotel department requests twenty new office chairs because several chairs look worn. The procurement officer checks which chairs are structurally damaged, which can be repaired or reupholstered locally, whether unused chairs exist in another department, and whether all twenty are needed immediately. The decision may still be to purchase chairs — but the quantity and specification should be based on the verified need." },
      {
        id: "c26-l1-b6",
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
  {
    order: 1,
    title: "Write Clear and Proportionate Requirements",
    minutes: 3,
    content: "Translate a sustainability intention into usable purchasing requirements. Vague instructions produce vague results.",
    blocks: [
      { id: "c26-l2-b1", type: "heading", headingText: "Write Clear and Proportionate Requirements" },
      { id: "c26-l2-b2", type: "short_text", bodyText: "Requirements must be relevant to the product or service being purchased. Vague instructions such as 'must be eco-friendly', 'must be green' or 'must be sustainable' are difficult to evaluate and can disqualify capable suppliers unfairly. Better criteria describe an observable feature, service or evidence." },
      { id: "c26-l2-b3", type: "key_message", headingText: "Criteria Can Include", bodyText: "Durability and expected lifespan. Repairability and local maintenance support. Energy or water performance. Packaging format and refill options. Use of recycled or responsibly sourced materials. Availability of replacement parts. Take-back or return arrangements. Delivery frequency. Supplier reporting or evidence commitments." },
      { id: "c26-l2-b4", type: "short_text", bodyText: "Criteria must remain proportionate. They should not unnecessarily prevent capable suppliers from competing. Do not invent mandatory certifications or legal requirements. Where specialist or legal advice is needed, escalate appropriately rather than making assumptions." },
      { id: "c26-l2-b5", type: "key_message", headingText: "Mauritian Workplace Example", bodyText: "Instead of requesting 'environmentally friendly cleaning products', a workplace may ask shortlisted suppliers to provide: product-use instructions, packaging format and refill options, safety documentation required by company procedure, information supporting specific environmental claims, and delivery and container-return arrangements where available. Each criterion is specific and reviewable." },
      {
        id: "c26-l2-b6",
        type: "decision_scenario",
        decisionIntro: "A specification currently reads: 'Provide sustainable air-conditioning units.'",
        decisionPrompt: "Which revised version best replaces this vague instruction?",
        decisionChoices: [
          { label: "Provide environmentally responsible air-conditioning units with green credentials.", correct: false, feedback: "Incorrect. This replaces one vague phrase with another and does not give suppliers a specific requirement to meet." },
          { label: "Provide units with documented energy-efficiency ratings, local maintenance availability, estimated lifespan of at least ten years, and a take-back or responsible disposal arrangement at end of life.", correct: true, feedback: "Correct. This version is specific, observable and proportionate. Each criterion can be verified from supplier responses." },
          { label: "Provide units that are 100% carbon neutral and carry certified zero-impact labels.", correct: false, feedback: "Incorrect. Requiring claims that cannot reasonably be verified narrows the supplier pool unnecessarily and may introduce unsupported commitments." },
          { label: "Provide the cheapest units from an approved local supplier list.", correct: false, feedback: "Incorrect. Cost and local sourcing may be relevant, but this does not address any sustainability or performance requirement." },
        ],
      },
    ],
  },
  {
    order: 2,
    title: "Compare Whole-Life Value, Not Price Alone",
    minutes: 3,
    content: "The cheapest initial price is not automatically the best value. Whole-life value accounts for the cost and operational consequences of a purchase over its useful life.",
    blocks: [
      { id: "c26-l3-b1", type: "heading", headingText: "Compare Whole-Life Value, Not Price Alone" },
      { id: "c26-l3-b2", type: "short_text", bodyText: "Whole-life value means considering what a purchase will cost — and how it will perform — across its full useful life, not only at the point of purchase. A product with a lower purchase price may cost more to run, maintain or replace than one that costs more to buy initially." },
      { id: "c26-l3-b3", type: "key_message", headingText: "Considerations in a Whole-Life Assessment", bodyText: "Purchase price. Delivery and installation. Energy or water consumption during use. Consumables and replacement parts. Maintenance and repair costs. Expected useful life. Downtime or service disruption risk. Disposal or recovery arrangements at end of life. Contract management effort and supplier support." },
      { id: "c26-l3-b4", type: "short_text", bodyText: "The highest-priced option is not automatically the most sustainable choice either. The level of analysis should match the value, risk and duration of the purchase. Not every purchase requires a complex calculation — but recording the key assumptions and comparisons used helps justify the decision." },
      { id: "c26-l3-b5", type: "key_message", headingText: "Mauritian Workplace Example", bodyText: "Two water dispensers are compared for an office. Option A has a lower purchase price but expensive proprietary filters and limited local servicing. Option B costs more initially but has locally available maintenance, standard replacement parts and a longer warranty. The decision should document the expected use, support arrangements and cost implications, rather than relying only on the purchase price." },
      {
        id: "c26-l3-b6",
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
  {
    order: 3,
    title: "Test Supplier Claims and Evidence",
    minutes: 3,
    content: "Environmental claims from suppliers require appropriate scrutiny. Ask the right questions rather than accepting or dismissing claims without review.",
    blocks: [
      { id: "c26-l4-b1", type: "heading", headingText: "Test Supplier Claims and Evidence" },
      { id: "c26-l4-b2", type: "short_text", bodyText: "Suppliers sometimes describe their products or services using terms such as 'zero impact', '100% green', 'carbon neutral', 'fully biodegradable' or 'planet friendly'. These phrases may be accurate, partially accurate, or difficult to verify. Procurement employees do not need to assess the technical accuracy of every claim — but they should ask useful questions before accepting or repeating one." },
      { id: "c26-l4-b3", type: "key_message", headingText: "Useful Questions to Ask", bodyText: "What exactly does this claim apply to? Which product, period or service is covered? What conditions or limitations apply? What evidence supports it? Is that evidence current and relevant to the product or service offered? Does the claim apply to the full product, or only a component?" },
      { id: "c26-l4-b4", type: "short_text", bodyText: "Supplier brochures alone may not answer every question. Evidence requirements should remain proportionate to the value and risk of the purchase. Unsupported claims should not receive evaluation credit merely because they sound positive. Concerns should be recorded and escalated through the organisation's approval process." },
      { id: "c26-l4-b5", type: "key_message", headingText: "Mauritian Workplace Example", bodyText: "A packaging supplier describes a product as 'fully biodegradable in Mauritius'. The buyer asks: Under which conditions does it break down? Does it require industrial treatment? What evidence supports the claim? Does the claim apply to the full packaging item, including labels and lining? The buyer records the supplier's response rather than repeating the original claim as fact in the evaluation report." },
      {
        id: "c26-l4-b6",
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
  {
    order: 4,
    title: "Make and Record a Defensible Decision",
    minutes: 3,
    content: "A procurement decision is defensible when the reasoning, information reviewed and approvals followed are clearly recorded.",
    blocks: [
      { id: "c26-l5-b1", type: "heading", headingText: "Make and Record a Defensible Decision" },
      { id: "c26-l5-b2", type: "short_text", bodyText: "Applying evaluation criteria consistently and recording the process is a professional responsibility, not an administrative burden. Records support internal review, budget control, supplier management, ESG evidence and consistency in future purchases." },
      { id: "c26-l5-b3", type: "key_message", headingText: "A Decision Record Should Include", bodyText: "The verified need. Shortlisted options considered. Information reviewed and key assumptions. Any missing evidence and how it was handled. The evaluation result against stated criteria. Required approvals and who provided them. The final reason for selection." },
      { id: "c26-l5-b4", type: "short_text", bodyText: "Avoid vague decision notes such as 'best supplier', 'most sustainable' or 'preferred option'. These phrases do not explain the reasoning and cannot be reviewed meaningfully. Do not change evaluation criteria informally after offers have been received — criteria must be applied consistently throughout the process." },
      { id: "c26-l5-b5", type: "key_message", headingText: "Conflict of Interest", bodyText: "Personal relationships, gifts or undisclosed interests must not influence supplier selection. If a conflict exists or may appear to exist, it must be declared and handled through the organisation's approval and escalation process. The procurement officer should not attempt to resolve a conflict of interest alone." },
      { id: "c26-l5-b6", type: "key_message", headingText: "Mauritian Workplace Example", bodyText: "A manager prefers a supplier they have used privately. The procurement officer does not accuse the manager of misconduct. Instead, they ensure the relationship is declared and that the organisation's evaluation and approval process is followed. The decision record documents that the declared relationship was noted and that the process remained consistent." },
      {
        id: "c26-l5-b7",
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
  {
    order: 5,
    title: "Manage the Supplier After Award",
    minutes: 3,
    content: "Sustainability-related procurement does not end when a purchase order or contract is issued. Performance must be monitored and problems addressed early.",
    blocks: [
      { id: "c26-l6-b1", type: "heading", headingText: "Manage the Supplier After Award" },
      { id: "c26-l6-b2", type: "short_text", bodyText: "A purchase order or contract confirms what has been agreed. Confirming requirements in writing, assigning responsibility for checking performance, and reviewing delivery against what was agreed are part of completing the procurement process — not an optional extra." },
      { id: "c26-l6-b3", type: "key_message", headingText: "Issues Worth Monitoring", bodyText: "Product quality and quantities delivered. Packaging format versus what was agreed. Maintenance visits and service frequency. Waste removal or take-back arrangements. Reporting commitments. Agreed corrective actions." },
      { id: "c26-l6-b4", type: "short_text", bodyText: "Procurement staff should distinguish between a one-off issue, repeated poor performance, and a requirement that was never clearly documented. Discussing problems early and specifically — with a record of the discussion — avoids disputes and helps both parties improve. Renewal points are useful opportunities to improve the specification for the next contract period." },
      { id: "c26-l6-b5", type: "key_message", headingText: "Mauritian Workplace Example", bodyText: "A supplier agreed to collect reusable delivery crates but repeatedly leaves them onsite. The contract owner records the missed collections, contacts the supplier, agrees a corrective action with a deadline, and notes in the file whether the original requirement was clearly stated. At renewal, the requirement is written more specifically into the next agreement." },
      {
        id: "c26-l6-b6",
        type: "decision_scenario",
        decisionIntro: "A cleaning supplier agreed to use concentrated products and collect empty containers monthly. After three months, containers are not being collected and diluted products are being delivered instead.",
        decisionPrompt: "What is the most appropriate next step?",
        decisionChoices: [
          { label: "Immediately terminate the contract and source a new supplier.", correct: false, feedback: "Incorrect. Immediate termination without first recording the issue, contacting the supplier and seeking a corrective action is disproportionate and may not be permitted by the contract terms." },
          { label: "Accept the situation because suppliers often struggle to meet sustainability requirements.", correct: false, feedback: "Incorrect. Accepting non-delivery of agreed requirements without recording or discussing it undermines the value of the contract and prevents future improvement." },
          { label: "Record the non-delivery, contact the supplier to discuss it, agree a corrective action with a deadline, and check whether the original requirement was sufficiently clear.", correct: true, feedback: "Correct. This approach documents the issue, gives the supplier an opportunity to correct it, and identifies whether the requirement needs to be clarified for the next renewal." },
          { label: "Ask the supplier to add an environmental statement to their invoices to demonstrate commitment.", correct: false, feedback: "Incorrect. An invoice statement does not resolve the operational non-delivery. The specific agreed requirements must be addressed directly." },
        ],
      },
      {
        id: "c26-l6-b7",
        type: "commitment",
        commitmentInstruction: "Select one commitment to carry forward from this course:",
        commitmentOptions: [
          { slug: "clarify-need-first", label: "I will clarify the operational need before naming a product.", description: "Confirming what is genuinely needed prevents unnecessary purchases." },
          { slug: "specific-requirements", label: "I will replace vague green wording with a specific, verifiable requirement.", description: "Clear requirements produce useful supplier responses." },
          { slug: "ask-for-evidence", label: "I will ask for evidence when a supplier makes a material environmental claim.", description: "Specific evidence supports a fair evaluation." },
          { slug: "record-decision", label: "I will record the reasons for a supplier decision.", description: "Clear records support review, consistency and ESG evidence." },
          { slug: "review-recurring", label: "I will review one recurring purchase for avoidable cost or waste.", description: "Existing contracts are often the best place to find practical improvements." },
          { slug: "check-delivery", label: "I will check whether an agreed supplier requirement is actually being delivered.", description: "Post-award monitoring completes the procurement cycle." },
        ],
      },
    ],
  },
];

const NEW_QUIZ_QUESTIONS = [
  {
    question: "A department requests replacement stock for an item that appears depleted. Before placing the order, what is the most useful first step?",
    options: [
      { text: "Order the same quantity as last time to keep the process consistent.", isCorrect: false, feedback: "Incorrect. Ordering the same quantity without checking current stock or actual need may create excess inventory." },
      { text: "Check current stock levels, review recent consumption and confirm whether the replenishment is needed at the quantity requested.", isCorrect: true, feedback: "Correct. Confirming the actual need and quantity before ordering prevents unnecessary purchases and reduces waste." },
      { text: "Reject the request because the department should reduce consumption instead.", isCorrect: false, feedback: "Incorrect. Procurement's role is to clarify and meet verified operational needs, not to override departmental requirements without review." },
      { text: "Ask the supplier to recommend the appropriate quantity.", isCorrect: false, feedback: "Incorrect. The supplier's recommendation reflects their commercial interest. The organisation should confirm its own operational need." },
    ],
    correctExplanation: "Reviewing actual stock, recent consumption and the verified need before placing an order is the most reliable way to confirm that a purchase is necessary and proportionate.",
    incorrectExplanation: "Ordering by habit, rejecting requests without review, or relying on supplier guidance alone each bypass the need to confirm what is actually required.",
    practicalTakeaway: "Always verify the operational need and required quantity before processing a purchase request.",
  },
  {
    question: "A purchasing specification states: 'All office furniture must be eco-friendly.' What is the main problem with this requirement?",
    options: [
      { text: "It is too long and will slow down the tender process.", isCorrect: false, feedback: "Incorrect. The length is not the issue — the phrase 'eco-friendly' is not measurable or verifiable." },
      { text: "It is too vague to evaluate. Suppliers cannot demonstrate compliance and evaluators cannot compare responses consistently.", isCorrect: true, feedback: "Correct. Vague requirements produce vague responses. Specific criteria — such as durability, repairability, materials or end-of-life arrangements — allow consistent comparison." },
      { text: "It excludes local suppliers, who are more sustainable.", isCorrect: false, feedback: "Incorrect. The problem is the lack of clarity, not a geographic restriction." },
      { text: "Furniture procurement does not need sustainability criteria.", isCorrect: false, feedback: "Incorrect. Relevant sustainability criteria can be included in any category of purchasing. The issue here is that the stated criterion is not specific enough to be useful." },
    ],
    correctExplanation: "A requirement must describe an observable feature, service or evidence so that all suppliers can respond consistently and evaluators can compare responses fairly.",
    incorrectExplanation: "Vague instructions like 'eco-friendly' cannot be measured, compared or verified. They do not give suppliers clear guidance and cannot be evaluated objectively.",
    practicalTakeaway: "Replace general green phrases with specific, observable criteria relevant to the product or service.",
  },
  {
    question: "Two suppliers offer similar products. Supplier A costs 15% less to purchase. Supplier B costs more initially but has local maintenance support and a longer warranty. What should inform the decision?",
    options: [
      { text: "Purchase price alone, because procurement must reduce costs.", isCorrect: false, feedback: "Incorrect. Procurement must consider value, not only initial cost. A lower purchase price may result in higher total expenditure over the product's life." },
      { text: "The expected useful life, annual maintenance cost and total cost of ownership over the contract period.", isCorrect: true, feedback: "Correct. Comparing whole-life cost — including purchase, maintenance, spares and end-of-life — provides a more complete basis for the decision." },
      { text: "Which supplier has a better environmental brand reputation.", isCorrect: false, feedback: "Incorrect. Brand reputation is not a substitute for specific, documented cost and performance information." },
      { text: "Which supplier is larger, because larger organisations are more reliable.", isCorrect: false, feedback: "Incorrect. Organisation size does not determine suitability. The evaluation should use the criteria stated in the specification." },
    ],
    correctExplanation: "Whole-life value considers purchase price, maintenance, spares, useful life and disposal. A higher initial cost may represent better value over time.",
    incorrectExplanation: "Purchase price, brand reputation and supplier size alone do not provide a complete or fair basis for comparison.",
    practicalTakeaway: "Record the key assumptions and cost comparisons used so the decision can be reviewed and improved in future procurement exercises.",
  },
  {
    question: "A supplier states that their delivery vehicles 'run on green fuel'. What is the most appropriate response from a procurement officer?",
    options: [
      { text: "Accept the claim and award points for environmental performance.", isCorrect: false, feedback: "Incorrect. Accepting an unspecified claim without clarification means evaluation credit is given for a statement that cannot be compared or verified." },
      { text: "Reject the claim entirely because environmental claims are always misleading.", isCorrect: false, feedback: "Incorrect. Some environmental claims are accurate and verifiable. The task is to ask for clarification and evidence, not to dismiss all claims." },
      { text: "Ask what fuel is used, what proportion of vehicles it applies to, and what evidence supports the claim.", isCorrect: true, feedback: "Correct. Specific questions identify what the claim actually means, which vehicles it covers and whether the evidence is sufficient to use in the evaluation." },
      { text: "Ask the supplier to sign a declaration that the claim is accurate.", isCorrect: false, feedback: "Incorrect. A declaration alone does not explain or verify the claim. Specific evidence is more useful." },
    ],
    correctExplanation: "Asking what the claim means, which vehicles it applies to and what evidence supports it gives procurement the information needed to evaluate the claim fairly.",
    incorrectExplanation: "Accepting without clarification, dismissing all claims, or relying on declarations alone each prevent a fair and documented evaluation.",
    practicalTakeaway: "Record supplier responses to environmental claim questions in the evaluation file, rather than repeating the original claim as fact.",
  },
  {
    question: "A procurement officer suspects that the evaluation criteria were informally changed after offers were received, to favour a particular supplier. What should they do?",
    options: [
      { text: "Apply the changed criteria, because the preferred supplier is better for the organisation.", isCorrect: false, feedback: "Incorrect. Changing criteria after offers are received undermines the fairness of the process and cannot be defended if the decision is reviewed." },
      { text: "Raise the concern through the organisation's approval or escalation process and document their concern in writing.", isCorrect: true, feedback: "Correct. A procurement officer who identifies an irregularity should raise it through the appropriate channel, not resolve it independently or proceed as though it did not occur." },
      { text: "Ignore it, because the final outcome is the same.", isCorrect: false, feedback: "Incorrect. A process that cannot be defended on review creates reputational, audit and legal risk for the organisation." },
      { text: "Inform the losing suppliers so they can appeal.", isCorrect: false, feedback: "Incorrect. The first responsibility is to raise the concern internally through the correct channel." },
    ],
    correctExplanation: "Procurement integrity requires that evaluation criteria are applied consistently and that concerns about process irregularities are raised formally.",
    incorrectExplanation: "Proceeding with changed criteria, ignoring concerns or contacting suppliers directly each bypass the organisation's established controls.",
    practicalTakeaway: "If you identify a process concern, raise it in writing through the correct channel before the decision is finalised.",
  },
  {
    question: "A manager requests a particular supplier for cleaning services and mentions they have a personal connection with the supplier's director. What is the correct procurement response?",
    options: [
      { text: "Exclude the supplier from consideration immediately.", isCorrect: false, feedback: "Incorrect. Excluding the supplier without due process may itself be unfair. The connection should be declared and the evaluation process followed consistently." },
      { text: "Ensure the personal connection is declared, recorded and that the evaluation process is followed consistently for all suppliers.", isCorrect: true, feedback: "Correct. A declared connection, handled through the organisation's conflict-of-interest process, allows the evaluation to proceed fairly and remain defensible." },
      { text: "Ask the manager to confirm in writing that the connection will not affect their judgement.", isCorrect: false, feedback: "Incorrect. A written confirmation alone does not satisfy conflict-of-interest requirements. The connection must be declared and handled through the organisation's formal process." },
      { text: "Accept the supplier's proposal without competitive comparison, because the manager has local knowledge of their performance.", isCorrect: false, feedback: "Incorrect. Waiving competitive comparison because of a personal connection is precisely the situation that conflict-of-interest procedures exist to prevent." },
    ],
    correctExplanation: "A declared personal connection must be handled through the organisation's conflict-of-interest process. This protects the organisation, the manager and the procurement officer.",
    incorrectExplanation: "Excluding without process, accepting informal assurances or bypassing competition each fail to protect the organisation.",
    practicalTakeaway: "Declare connections, follow the process, and record how the conflict was managed — regardless of the final outcome.",
  },
  {
    question: "A procurement officer completes an evaluation and needs to write a decision note. Which version is strongest?",
    options: [
      { text: "Supplier B was selected because they are the most sustainable option on the market.", isCorrect: false, feedback: "Incorrect. 'Most sustainable' does not explain the specific evaluation criteria used or how Supplier B performed against them." },
      { text: "Supplier B was selected as the best overall value based on price, service record and delivery reliability.", isCorrect: false, feedback: "Partially useful, but it does not specify the evaluation criteria stated in the original requirement or how each supplier performed against those criteria." },
      { text: "Supplier B was selected because it met all three evaluation criteria: ten-year expected lifespan per product specification, local maintenance support within 48 hours, and a documented take-back arrangement. Supplier A did not provide evidence of local maintenance support.", isCorrect: true, feedback: "Correct. This note states the criteria applied, how each supplier performed, and the specific reason for selection. It is clear, consistent and reviewable." },
      { text: "Supplier B was selected because we have worked with them before and they are reliable.", isCorrect: false, feedback: "Incorrect. Prior relationship is not a stated evaluation criterion and may raise conflict-of-interest concerns without a clear record of the evaluation process." },
    ],
    correctExplanation: "A defensible decision note states the criteria, how suppliers were evaluated against them, and the specific reason for selection.",
    incorrectExplanation: "Vague notes, incomplete comparisons or relationship-based selections cannot be reviewed fairly or used to improve future procurement.",
    practicalTakeaway: "Decision notes should state the criteria used and specifically explain how the selected supplier met them.",
  },
  {
    question: "Which of the following best describes the complete procurement cycle for a sustainability-relevant purchase?",
    options: [
      { text: "Identify the product, select a supplier, place the order.", isCorrect: false, feedback: "Incorrect. Starting with a named product bypasses the need definition step and skips requirements, evaluation and post-award management." },
      { text: "Define the need, write clear requirements, compare whole-life value and evidence, approve and document the decision, confirm the agreement, review supplier performance.", isCorrect: true, feedback: "Correct. This sequence places need definition first, includes requirements and evaluation, documents the decision and completes with post-award review." },
      { text: "Select the most sustainable option, get manager sign-off, monitor supplier carbon reporting.", isCorrect: false, feedback: "Incorrect. This skips need verification, requirements writing, whole-life cost comparison and conflict-of-interest checks." },
      { text: "Issue a tender, select the lowest-cost bid, close the file.", isCorrect: false, feedback: "Incorrect. Lowest cost alone is not a complete evaluation. The cycle does not end at award — performance must be reviewed against what was agreed." },
    ],
    correctExplanation: "The complete procurement cycle starts with defining the need, moves through requirements, evidence and decision documentation, and continues with post-award performance review.",
    incorrectExplanation: "Shorter versions of the cycle — starting with a named product or ending at award — miss the steps that protect the organisation and support improvement.",
    practicalTakeaway: "The procurement cycle is complete only when supplier performance has been reviewed against agreed requirements.",
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
