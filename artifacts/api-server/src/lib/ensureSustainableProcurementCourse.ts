import {
  db,
  coursesTable,
  lessonsTable,
  quizQuestionsTable,
  badgeDefinitionsTable,
  systemSeedsTable,
} from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { logger } from "./logger";

const COURSE_ID = 5;
const COURSE_SLUG = "sustainable-procurement";
const COURSE_TITLE = "Sustainable Procurement";
const BADGE_SLUG = "responsible-purchasing";
const SEED_NAME = "sustainable-procurement-v1";
const SKELETON_BADGE_SLUG = "sustainable-procurement-badge"; // catalogue skeleton slug — do not delete

const COURSE_META = {
  description:
    "Learn a practical method for considering need, quality, lifespan, repairability, packaging, supplier evidence and total value before making or recommending a workplace purchase.",
  fullDescription:
    "This course helps employees make better purchasing decisions by weighing need, fitness for purpose, quality, expected lifespan, repairability, warranty, packaging and supplier evidence alongside cost, availability, hygiene, safety and operational requirements. It is suitable for anyone who requests, selects, approves or makes purchases at work.",
  categoryId: 1,
  durationMinutes: 18,
  priceUsd: "1400.00",
  level: "Level 2",
  isFeatured: false,
  thumbnailUrl: "/images/courses/sustainable-procurement.png",
  learningObjectives: [
    "Question whether a purchase is necessary before comparing products.",
    "Distinguish purchase price from total value over the useful life of a product or service.",
    "Compare quality, durability, repairability, warranty, packaging and operational suitability.",
    "Ask suppliers useful and verifiable questions.",
    "Recognise vague or unsupported environmental claims.",
    "Make and document a balanced purchasing recommendation within their authority.",
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage:
    "You have completed Sustainable Procurement. You can now assess whether a purchase is needed, compare options beyond the initial price and ask suppliers for clearer evidence before making or recommending a decision.",
  badgeName: "Responsible Purchasing",
  badgeDescription:
    "Awarded for applying balanced purchasing judgement across need, cost, quality, lifespan, supplier evidence and operational requirements.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Lesson content
// ─────────────────────────────────────────────────────────────────────────────
const NEW_LESSONS = [
  // ───────────────────────────────────────────────────────────────────────────
  // Lesson 1 — The Cheapest Quote Is Not Always the Best Value
  // ───────────────────────────────────────────────────────────────────────────
  {
    order: 0,
    title: "The Cheapest Quote Is Not Always the Best Value",
    minutes: 3,
    content:
      "Introduces the difference between purchase price and total value, using a realistic workplace equipment comparison.",
    blocks: [
      {
        id: "sp1-h1",
        type: "heading",
        position: 1,
        headingText: "The Cheapest Quote Is Not Always the Best Value",
      },
      {
        id: "sp1-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "A company needs to replace several frequently used items. Supplier A offers the lowest price. Supplier B costs more but provides a longer warranty, confirmed spare parts and clear product specifications. The difference in price is noticeable. The difference in long-term cost may be larger.",
      },
      {
        id: "sp1-k1",
        type: "key_message",
        position: 3,
        headingText: "Compare the value of using the product — not only the price of buying it.",
        bodyText:
          "A lower price can mean a shorter lifespan, higher replacement frequency or limited support. A higher price does not automatically mean better quality. Before recommending either option, compare specifications, intended use, warranty, expected lifespan and after-sales support.",
      },
      {
        id: "sp1-w1",
        type: "workplace_example",
        position: 4,
        exampleTitle: "Office Chair Replacement — Port Louis",
        exampleBody:
          "A Port Louis office needs ten new chairs. Supplier A offers chairs at a 30% lower unit price with a six-month warranty. Supplier B charges more but provides a three-year warranty, a local service contact and replacement parts. The office chairs are used every working day. At the end of six months the office will know whether the cheaper chair holds up — but by then the replacement cycle may already be more expensive than the initial saving.",
      },
      {
        id: "sp1-d1",
        type: "decision_scenario",
        position: 5,
        decisionIntro:
          "A colleague asks you to approve one of two printer offers received today. Supplier A is cheaper. Supplier B costs 18% more.",
        decisionPrompt:
          "What is the most useful first step before recommending either supplier?",
        decisionChoices: [
          {
            label: "Choose Supplier A immediately — it is the cheaper option.",
            correct: false,
            feedback:
              "Purchase price alone is not a sufficient reason to recommend a supplier. A lower price may reflect a shorter lifespan, limited warranty or weaker support. Check the specifications first.",
          },
          {
            label:
              "Choose Supplier B immediately — a higher price usually means better quality.",
            correct: false,
            feedback:
              "Price is not a reliable indicator of quality. A higher-priced product is not automatically a better value. Compare what each supplier actually offers.",
          },
          {
            label:
              "Compare specifications, intended use, warranty, expected lifespan and support before recommending.",
            correct: true,
            feedback:
              "This is the right approach. A recommendation based on evidence is more useful than one based on price alone. If the information is incomplete, ask both suppliers for clearer specifications before deciding.",
          },
          {
            label: "Delay the decision indefinitely — no option is perfect.",
            correct: false,
            feedback:
              "Decisions rarely have a perfect option. If you have gathered the relevant information and compared it fairly, a considered recommendation is appropriate. Unnecessary delay creates its own operational cost.",
          },
        ],
      },
      {
        id: "sp1-m1",
        type: "multiple_choice",
        position: 6,
        mcqQuestion:
          "A colleague says the company should always choose the cheapest supplier to reduce costs. Which response is most accurate?",
        mcqOptions: [
          "Agree — lower purchase price always means lower overall cost.",
          "Disagree — total value includes lifespan, warranty, support and replacement frequency, not only the purchase price.",
          "Disagree — the most expensive supplier always delivers the best value.",
          "Agree — environmental sustainability always overrides cost considerations.",
        ],
        mcqCorrectIndex: 1,
        mcqCorrectExplanation:
          "Total value accounts for what the product costs and delivers throughout its useful life, not only on the day of purchase. A lower-priced item that requires frequent replacement may cost more overall.",
        mcqIncorrectExplanation:
          "Purchase price is one input — not the whole picture. Compare lifespan, maintenance, warranty and support alongside the initial cost.",
        optionFeedback: [
          "Incorrect. Lower purchase price often comes with trade-offs in lifespan, warranty or support that increase total cost.",
          "Correct. Total value is a broader measure than purchase price alone.",
          "Incorrect. A higher price is not a reliable indicator of quality or value.",
          "Incorrect. Sustainability is one consideration alongside cost, quality, safety and operational need — it does not override the others.",
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Lesson 2 — Start With Need, Not Product
  // ───────────────────────────────────────────────────────────────────────────
  {
    order: 1,
    title: "Start With Need, Not Product",
    minutes: 3,
    content:
      "Teaches employees to clarify the actual operational need before comparing suppliers or products.",
    blocks: [
      {
        id: "sp2-h1",
        type: "heading",
        position: 1,
        headingText: "Start With Need, Not Product",
      },
      {
        id: "sp2-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "The first question in any purchasing decision is not which supplier to choose. It is whether a purchase is necessary. Before comparing products, confirm the problem being solved, whether existing resources can meet the need, and what quantity and performance level is actually required.",
      },
      {
        id: "sp2-k1",
        type: "key_message",
        position: 3,
        headingText: "Eight questions to ask before purchasing",
        bodyText:
          "1. What problem are we trying to solve?\n2. Is a new purchase genuinely necessary?\n3. Can an existing item be shared, repaired, maintained or redeployed?\n4. What quantity is actually required?\n5. How often will it be used?\n6. What minimum performance, safety or hygiene requirements apply?\n7. Who has authority to approve this purchase?\n8. When is the item genuinely needed?",
      },
      {
        id: "sp2-w1",
        type: "workplace_example",
        position: 4,
        exampleTitle: "Storage Equipment — Checking Before Ordering",
        exampleBody:
          "A department requests new storage shelving because the current workspace feels disorganised. Before placing an order, the responsible employee checks whether existing shelving units in another area can be reassigned, whether a reorganisation of the current space would resolve the issue, and what quantity would genuinely be needed if new shelving is required. This check takes thirty minutes. It prevents an unnecessary order in some cases and produces a more accurate order in others. Sometimes buying new equipment is the correct decision — but that decision is more defensible when the need has been confirmed.",
      },
      {
        id: "sp2-p1",
        type: "practical_action",
        position: 5,
        actionTitle: "Before raising a purchase request, answer these questions",
        actionSteps: [
          "Write one sentence describing the operational problem the purchase will solve.",
          "Check whether existing equipment can be repaired, shared or redeployed.",
          "Confirm the minimum quantity required for the expected usage.",
          "Identify any mandatory performance, safety or hygiene requirements.",
          "Confirm who has approval authority and whether the amount is within your limit.",
          "Record your answers — this supports your recommendation and any later review.",
        ],
      },
      {
        id: "sp2-d1",
        type: "decision_scenario",
        position: 6,
        decisionIntro:
          "A team leader requests ten new tablets, explaining that everyone on the team should have one. The tablets will be used occasionally for scheduling and checking task lists.",
        decisionPrompt:
          "What is the most appropriate response before placing the order?",
        decisionChoices: [
          {
            label: "Order ten tablets immediately — the team leader knows what the team needs.",
            correct: false,
            feedback:
              "A team leader's request is a useful starting point, not a confirmed need. Confirm the usage frequency, whether shared devices would meet the need, and whether the quantity and budget are appropriate before ordering.",
          },
          {
            label:
              "Refuse the request — the team can manage without any tablets.",
            correct: false,
            feedback:
              "Refusing without evidence is not appropriate. The need may be genuine. Confirm the usage, quantity and alternatives first, then decide.",
          },
          {
            label:
              "Confirm usage frequency, whether sharing is feasible, minimum quantity needed and whether the request is within the approval limit.",
            correct: true,
            feedback:
              "This is the right approach. Confirming the actual need, usage pattern and quantity leads to a more appropriate purchase decision — whether that means ordering fewer devices, approving the full request or escalating for further approval.",
          },
          {
            label:
              "Order two tablets as a compromise without asking any further questions.",
            correct: false,
            feedback:
              "A compromise without information may solve nothing. Find out what the team actually needs before deciding on a quantity.",
          },
        ],
      },
      {
        id: "sp2-m1",
        type: "multiple_choice",
        position: 7,
        mcqQuestion:
          "A colleague requests new office chairs, saying their current chairs are uncomfortable. What is the most useful first step?",
        mcqOptions: [
          "Order new chairs immediately — employee comfort is important.",
          "Refuse the request — new purchases are wasteful.",
          "Confirm whether the current chairs can be repaired or adjusted, and whether the discomfort affects the team's ability to work safely.",
          "Ask the most senior person in the office to decide without gathering any further information.",
        ],
        mcqCorrectIndex: 2,
        mcqCorrectExplanation:
          "Confirming the actual problem — and whether it can be resolved without a new purchase — is always worth doing first. If the chairs are genuinely unsuitable or a safety concern, a purchase may well be justified.",
        mcqIncorrectExplanation:
          "Before ordering, confirm the nature of the problem and whether existing resources can address it. This produces a more appropriate decision.",
        optionFeedback: [
          "Incorrect. Comfort matters, but ordering without confirming the problem or exploring alternatives is premature.",
          "Incorrect. Refusing without information is not appropriate. The need may be genuine.",
          "Correct. Confirming the problem and checking whether it can be resolved without a new purchase is the right starting point.",
          "Incorrect. Escalating without gathering information makes it harder for anyone to decide well.",
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Lesson 3 — Look Beyond the Purchase Price
  // ───────────────────────────────────────────────────────────────────────────
  {
    order: 2,
    title: "Look Beyond the Purchase Price",
    minutes: 3,
    content:
      "Introduces whole-life value in plain language, covering what a product costs and delivers throughout the time the company uses it.",
    blocks: [
      {
        id: "sp3-h1",
        type: "heading",
        position: 1,
        headingText: "Look Beyond the Purchase Price",
      },
      {
        id: "sp3-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "Whole-life value means considering what an item may cost, require and deliver throughout the time the company uses it — not only on the day it is purchased. Two products can have very different purchase prices and similar total costs, or similar purchase prices and very different total costs.",
      },
      {
        id: "sp3-k1",
        type: "key_message",
        position: 3,
        headingText: "Factors that affect whole-life value",
        bodyText:
          "Beyond purchase price, consider: delivery and installation costs, energy or water use where relevant, consumables, maintenance requirements, cleaning needs, expected downtime, warranty coverage, spare part availability, repairability, expected lifespan, how often it may need to be replaced, and what happens at the end of its useful life.",
      },
      {
        id: "sp3-w1",
        type: "workplace_example",
        position: 4,
        exampleTitle: "Two Workplace Appliances — Which Is Better Value?",
        exampleBody:
          "A business needs to replace a frequently used appliance. Option A costs less to buy but comes with a one-year warranty and the supplier cannot confirm whether replacement parts are available locally. Option B costs more but offers a three-year warranty and confirmed local servicing.\n\nIs Option B automatically better value? Not necessarily. If the appliance will be used only occasionally, the shorter warranty on Option A may carry lower risk. If it runs continuously, the repair and downtime costs on Option A could exceed the price difference within the first year. The right recommendation depends on how often the appliance will be used, how reliable the product information is, and what the company's budget and risk tolerance allow.",
      },
      {
        id: "sp3-p1",
        type: "practical_action",
        position: 5,
        actionTitle: "Whole-life value questions to ask for any significant purchase",
        actionSteps: [
          "What is the expected service life under our intended use?",
          "What maintenance does it require, and who will carry this out?",
          "Are spare parts and servicing available if something goes wrong?",
          "What consumables or ongoing costs does it require?",
          "How long is the warranty, and what does it cover?",
          "What happens if it fails out of warranty — can it be repaired?",
          "How often might we need to replace it at the end of its useful life?",
        ],
      },
      {
        id: "sp3-d1",
        type: "decision_scenario",
        position: 6,
        decisionIntro:
          "Your team needs a piece of equipment that will be used no more than twice a week. Option A is a professional grade version with a five-year warranty at a higher price. Option B is a simpler version at a lower price with a one-year warranty.",
        decisionPrompt: "Which factor is most important to consider?",
        decisionChoices: [
          {
            label: "Choose Option A — professional grade is always worth the investment.",
            correct: false,
            feedback:
              "Professional grade equipment may be the right choice for continuous or high-demand use. For low-frequency use, the additional cost may not be justified. Evaluate based on actual usage requirements.",
          },
          {
            label: "Choose Option B — it is cheaper and the savings can be used elsewhere.",
            correct: false,
            feedback:
              "Lower purchase price is only one factor. If Option B requires replacement more frequently, the lower price may not deliver better value over time.",
          },
          {
            label:
              "Consider the actual usage frequency, risk of downtime, required performance and expected lifespan before deciding.",
            correct: true,
            feedback:
              "For twice-weekly use, a lower-cost option may offer adequate value if performance meets requirements. For safety-critical or high-frequency applications, the longer warranty and build quality of the professional version may be worth the additional cost. The best answer depends on the evidence available.",
          },
          {
            label:
              "Ask the supplier which option they recommend — they know the products better.",
            correct: false,
            feedback:
              "Supplier input can be useful, but suppliers have a commercial interest in the sale. Base your recommendation on an objective assessment of your organisation's actual requirements.",
          },
        ],
      },
      {
        id: "sp3-m1",
        type: "multiple_choice",
        position: 7,
        mcqQuestion:
          "Which of the following is the most complete description of whole-life value?",
        mcqOptions: [
          "The purchase price plus delivery cost only.",
          "The total environmental impact of producing the product.",
          "What the product costs, requires and delivers throughout the time the organisation uses it, including maintenance, lifespan and replacement.",
          "The resale value of the product at the end of its useful life.",
        ],
        mcqCorrectIndex: 2,
        mcqCorrectExplanation:
          "Whole-life value covers the full cost and benefit of using the product — from purchase through maintenance, consumables, repairs and eventual replacement. It gives a more complete basis for comparing options.",
        mcqIncorrectExplanation:
          "Whole-life value is broader than purchase price, delivery or resale value alone. It includes maintenance, consumables, lifespan, repairability and replacement frequency.",
        optionFeedback: [
          "Incorrect. Purchase price and delivery are part of the picture, but whole-life value also includes maintenance, consumables, lifespan and replacement.",
          "Incorrect. Environmental impact is one consideration in procurement decisions, but whole-life value in this context refers to cost and utility over the product's useful life.",
          "Correct. This is the most complete description.",
          "Incorrect. Resale or end-of-life value is relevant in some decisions but is one small part of whole-life value, not the whole of it.",
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Lesson 4 — Ask Suppliers Better Questions
  // ───────────────────────────────────────────────────────────────────────────
  {
    order: 3,
    title: "Ask Suppliers Better Questions",
    minutes: 3,
    content:
      "Helps employees request useful, specific and verifiable supplier information, including how to handle vague environmental claims.",
    blocks: [
      {
        id: "sp4-h1",
        type: "heading",
        position: 1,
        headingText: "Ask Suppliers Better Questions",
      },
      {
        id: "sp4-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "Good purchasing decisions depend on good information. Suppliers sometimes provide general descriptions rather than specific, verifiable facts. Asking more precise questions helps you compare offers fairly, avoid unverified claims and produce a recommendation that can be explained and defended.",
      },
      {
        id: "sp4-k1",
        type: "key_message",
        position: 3,
        headingText: "Supplier answers should be specific, verifiable and comparable",
        bodyText:
          "Useful questions include: What is the product made from? What warranty applies and what does it cover? Are spare parts available locally or through an approved service? What maintenance is required? What is the expected service life under our intended use? Can unnecessary packaging be reduced? What does the environmental claim mean and what evidence supports it? Does any certification apply to the full product or only one component? What are the delivery lead time and minimum order quantity?",
      },
      {
        id: "sp4-w1",
        type: "workplace_example",
        position: 4,
        exampleTitle: "100% Eco-Friendly — What Does That Mean?",
        exampleBody:
          "A supplier describes a cleaning product range as '100% eco-friendly'. No further explanation is provided on the product sheet. Before recommending the product, the purchasing officer asks: What does '100% eco-friendly' mean in this context? Which part of the product or packaging does this apply to? Is this claim supported by a recognised certification, and if so, what does that certification actually cover?\n\nThe supplier responds that the claim refers to the packaging only, which is made from recycled material. The product itself has not been independently assessed. This is useful information. The claim was not dishonest, but it was incomplete. The officer now has accurate information to include in their recommendation.",
      },
      {
        id: "sp4-p1",
        type: "practical_action",
        position: 5,
        actionTitle: "When you receive a vague environmental claim, ask:",
        actionSteps: [
          "What does this claim mean specifically?",
          "Which part of the product, packaging or process does it apply to?",
          "Is it supported by a recognised certification or independent assessment?",
          "If a certification is mentioned, what does that certification actually require?",
          "Is this claim relevant to how we intend to use the product?",
          "Record what the supplier confirms in writing where required by your procurement procedure.",
        ],
      },
      {
        id: "sp4-d1",
        type: "decision_scenario",
        position: 6,
        decisionIntro:
          "A supplier tells you their packaging is recyclable. Your company uses a waste collection service that collects mixed recyclables.",
        decisionPrompt:
          "What is the most appropriate next step?",
        decisionChoices: [
          {
            label:
              "Accept the claim — recyclable packaging is always an improvement.",
            correct: false,
            feedback:
              "'Recyclable' describes a material property, not a confirmed outcome. Whether packaging is actually recycled depends on local collection arrangements. Confirm whether your company's collection service accepts this packaging type before relying on the claim.",
          },
          {
            label:
              "Reject the supplier — recyclability claims are never reliable.",
            correct: false,
            feedback:
              "Recyclability claims are not automatically false. Ask what the claim means and whether your company's collection arrangement can process the packaging. Then include that information in your recommendation.",
          },
          {
            label:
              "Confirm whether this packaging type is accepted through your company's actual collection arrangement, and ask whether unnecessary packaging can be avoided.",
            correct: true,
            feedback:
              "'Recyclable' describes what a material could theoretically be processed into — not what will actually happen to it. Confirming your collection arrangement avoids a misleading assumption. Asking whether packaging can be reduced is also a useful step.",
          },
          {
            label:
              "Choose this supplier ahead of others — recyclable packaging is a positive environmental indicator.",
            correct: false,
            feedback:
              "Packaging is one factor in a purchasing decision, not the primary basis for selecting a supplier. Confirm what the claim means, whether it applies to your situation, and compare it alongside other factors such as cost, quality and service.",
          },
        ],
      },
      {
        id: "sp4-m1",
        type: "multiple_choice",
        position: 7,
        mcqQuestion:
          "A supplier says their product carries an environmental certification. What is the most important follow-up question?",
        mcqOptions: [
          "What is the unit price compared with uncertified alternatives?",
          "What does the certification actually require, and does it apply to the full product or only part of it?",
          "Is the supplier local or international?",
          "How many years has the supplier been operating?",
        ],
        mcqCorrectIndex: 1,
        mcqCorrectExplanation:
          "Environmental certifications vary widely in scope and rigour. A certification may apply to one material, one stage of production or the packaging alone. Understanding what it covers lets you assess whether it is relevant and meaningful for your purchase.",
        mcqIncorrectExplanation:
          "The most useful follow-up question asks what the certification actually covers and requires. Price, supplier origin and tenure are separate considerations.",
        optionFeedback: [
          "Incorrect. Price is relevant but is not the most important follow-up to a certification claim.",
          "Correct. Certifications differ significantly in what they cover. Knowing the scope and requirements helps you judge the claim.",
          "Incorrect. Whether a supplier is local or international does not determine the validity or relevance of a certification.",
          "Incorrect. Years in operation are a general indicator of stability, not a guide to the reliability of a certification claim.",
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Lesson 5 — Compare Competing Offers Fairly
  // ───────────────────────────────────────────────────────────────────────────
  {
    order: 4,
    title: "Compare Competing Offers Fairly",
    minutes: 3,
    content:
      "Applies the course through three realistic scenarios: office supplies, hospitality cleaning products, and facilities equipment.",
    blocks: [
      {
        id: "sp5-h1",
        type: "heading",
        position: 1,
        headingText: "Compare Competing Offers Fairly",
      },
      {
        id: "sp5-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "Three workplace scenarios illustrate how to apply a consistent comparison method when choosing between competing offers. Each scenario involves a different trade-off. There is no universal rule that resolves all of them — the right answer depends on usage, requirements, risk and the information available.",
      },
      {
        id: "sp5-d1",
        type: "decision_scenario",
        position: 3,
        decisionIntro:
          "Scenario A — Office Supplies. A company is comparing two paper and stationery offers. Offer A: lower price, large minimum order, more individual packaging, limited product specifications. Offer B: slightly higher unit price, smaller order quantities available, clearer product information, reduced packaging option.",
        decisionPrompt:
          "Which factors should most influence the recommendation?",
        decisionChoices: [
          {
            label: "Choose Offer A — it is cheaper per unit.",
            correct: false,
            feedback:
              "Unit price is one input. A large minimum order may create storage problems or commit budget to more stock than required. Limited product information makes it harder to compare quality. Consider the full picture before recommending.",
          },
          {
            label:
              "Choose Offer B — reduced packaging is better for the environment.",
            correct: false,
            feedback:
              "Packaging is one consideration. A slightly higher unit price and clearer product information may or may not outweigh other factors depending on the quantity needed, storage availability and budget. Packaging alone should not determine the recommendation.",
          },
          {
            label:
              "Compare the quantity actually needed against minimum order requirements, storage implications, quality specifications, packaging and total cost before recommending.",
            correct: true,
            feedback:
              "This is the structured approach. The right choice depends on how much is genuinely needed, whether the minimum order creates a storage or budget problem, and whether the product quality information is sufficient to compare the offers fairly.",
          },
          {
            label:
              "Request a third quote — neither offer is suitable.",
            correct: false,
            feedback:
              "A third quote may be appropriate in some cases, but it is not automatically the right step when two offers have already been received. Compare what you have, identify any gaps, and decide whether the available information is sufficient to make a recommendation.",
          },
        ],
      },
      {
        id: "sp5-d2",
        type: "decision_scenario",
        position: 4,
        decisionIntro:
          "Scenario B — Cleaning Products. A hotel is comparing two cleaning product offers. Offer A: lower unit price, unclear dosage instructions, no training support. Offer B: clear dosage and safety guidance, supplier training available, higher unit price.",
        decisionPrompt:
          "What is the most important factor for this category of product?",
        decisionChoices: [
          {
            label: "Choose Offer A — unit cost matters most in this category.",
            correct: false,
            feedback:
              "Cleaning products used in hospitality carry hygiene, safety and regulatory requirements. Unclear dosage instructions increase the risk of incorrect use, which can affect cleaning effectiveness, staff safety and compliance. Do not recommend a change without confirming suitability through the appropriate approval process.",
          },
          {
            label:
              "Assess both offers against hygiene standards, safety requirements, correct dosage, staff training needs and total consumption before recommending any change.",
            correct: true,
            feedback:
              "Cleaning product selection involves hygiene, safety and operational effectiveness — not only unit price. Clear dosage instructions reduce the risk of under- or over-use, which affects both product consumption and effectiveness. Any change to approved cleaning products should go through the correct approval process.",
          },
          {
            label: "Choose Offer B — it includes training, so it must be safer.",
            correct: false,
            feedback:
              "Training support is a positive indicator, but it does not automatically make a product more effective or suitable. Assess both offers against your hygiene, safety and operational requirements.",
          },
          {
            label:
              "Recommend Offer A and provide training internally to reduce total cost.",
            correct: false,
            feedback:
              "Internal training may be appropriate in some situations, but changing approved cleaning products without a proper review creates compliance and safety risks. Follow your company's chemical approval and procurement procedures.",
          },
        ],
      },
      {
        id: "sp5-d3",
        type: "decision_scenario",
        position: 5,
        decisionIntro:
          "Scenario C — Facilities Equipment. A facilities team is comparing two equipment offers. Offer A: lower purchase price, one-year warranty, spare-part availability unclear. Offer B: higher purchase price, three-year warranty, confirmed service support, delivery takes two additional weeks.",
        decisionPrompt:
          "Which combination of factors should carry the most weight?",
        decisionChoices: [
          {
            label: "Choose Offer A — lower cost and faster delivery are decisive.",
            correct: false,
            feedback:
              "Speed and price are important but are not the only factors for equipment decisions. If the equipment is critical and spare parts are unavailable, a breakdown could create a more significant operational cost than the initial saving. Assess downtime risk alongside delivery time.",
          },
          {
            label:
              "Choose Offer B — a longer warranty always indicates better reliability.",
            correct: false,
            feedback:
              "A longer warranty is a useful indicator but is not a guarantee of reliability. Weigh the warranty alongside performance requirements, budget, delivery time and urgency. Whether the two-week delivery delay is acceptable depends on the operational situation.",
          },
          {
            label:
              "Balance urgency, downtime risk, budget, warranty, service support and required performance before recommending.",
            correct: true,
            feedback:
              "There is no single rule for this comparison. If the equipment is urgently needed and downtime would be costly, the delivery delay on Offer B may be a significant factor. If the budget is constrained, the lower price on Offer A may be more appropriate. The recommendation should state the trade-offs considered.",
          },
          {
            label:
              "Escalate immediately to senior management — this decision is too complex.",
            correct: false,
            feedback:
              "Escalation is appropriate when the decision is outside your authority or the risk is high. Gathering and comparing the available information first makes any escalation more useful. Present what you have found rather than asking someone else to make the decision without that information.",
          },
        ],
      },
      {
        id: "sp5-p1",
        type: "practical_action",
        position: 6,
        actionTitle: "A seven-step approach for any purchasing comparison",
        actionSteps: [
          "Confirm the need — what problem does this purchase solve and is a purchase genuinely necessary?",
          "Identify mandatory requirements — performance, safety, hygiene, compliance or technical specifications that cannot be compromised.",
          "Compare total value factors — purchase price, lifespan, maintenance, warranty, support, consumables and replacement frequency.",
          "Check supplier evidence — ask for specifications, certifications or claims to be explained and supported.",
          "Record assumptions and uncertainties — note what information was missing or unverified.",
          "Recommend within your authority — make a considered recommendation based on the evidence available.",
          "Escalate when required — if the decision is outside your approval limit or involves significant risk, present your comparison to the appropriate approver.",
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Lesson 6 — My Responsible Purchasing Commitment
  // ───────────────────────────────────────────────────────────────────────────
  {
    order: 5,
    title: "My Responsible Purchasing Commitment",
    minutes: 2,
    content:
      "Course summary and learner commitment selection for Sustainable Procurement.",
    blocks: [
      {
        id: "sp6-h1",
        type: "heading",
        position: 1,
        headingText: "My Responsible Purchasing Commitment",
      },
      {
        id: "sp6-t1",
        type: "short_text",
        position: 2,
        bodyText:
          "Every purchasing decision — large or small — involves a judgement about need, value, quality and risk. The decisions you make consistently, across routine and significant purchases, shape how much your organisation spends, what it uses and how reliable it is to work with.",
      },
      {
        id: "sp6-k1",
        type: "key_message",
        position: 3,
        headingText: "Good procurement is a habit, not a one-off review.",
        bodyText:
          "You do not need to be a specialist to make better purchasing decisions. Asking the right questions — about need, total value, supplier evidence and your authority — is a practice that improves with every decision you make.",
      },
      {
        id: "sp6-c1",
        type: "commitment",
        position: 4,
        commitmentTitle: "Select one or more commitments to take from this course:",
        commitmentOptions: [
          {
            slug: "value-before-price",
            label: "I will compare total value, not only the initial purchase price.",
          },
          {
            slug: "confirm-the-need",
            label: "I will confirm the actual need and quantity before requesting a purchase.",
          },
          {
            slug: "ask-for-evidence",
            label: "I will ask what evidence supports environmental product claims.",
          },
          {
            slug: "check-lifespan",
            label: "I will consider quality, lifespan, warranty and repairability where relevant.",
          },
          {
            slug: "reduce-packaging",
            label: "I will ask whether unnecessary packaging can be reduced.",
          },
          {
            slug: "follow-procedure",
            label: "I will follow company purchasing approvals and supplier procedures.",
          },
          {
            slug: "document-recommendation",
            label: "I will record the main reasons for my purchasing recommendation.",
          },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Quiz questions
// ─────────────────────────────────────────────────────────────────────────────
const NEW_QUIZ = [
  {
    order: 1,
    question:
      "A colleague argues that choosing the cheapest supplier always reduces company costs. Which response is most accurate?",
    options: [
      "Agree — purchase price is the only cost that matters.",
      "Disagree — total value includes lifespan, warranty, support and replacement frequency, which can make a lower-priced option more expensive overall.",
      "Agree — sustainability requirements always override cost.",
      "Disagree — the most expensive supplier always delivers the best value.",
    ],
    correct: 1,
    correctExplanation:
      "Total value accounts for maintenance, warranty, lifespan and replacement frequency — not only the purchase price. A cheaper option that requires frequent replacement may cost more over time.",
    incorrectExplanation:
      "Purchase price is one input in a purchasing decision, not the whole picture. Consider lifespan, warranty, support and replacement frequency when comparing options.",
    optionFeedback: [
      "Incorrect. Purchase price alone does not capture the total cost of using a product throughout its life.",
      "Correct. Total value is a broader measure that accounts for what a product costs and delivers over time.",
      "Incorrect. Sustainability is one consideration alongside cost, quality, safety and operational need — not a factor that overrides the others.",
      "Incorrect. A higher price is not a reliable indicator of quality or value.",
    ],
  },
  {
    order: 2,
    question:
      "Before comparing supplier quotes for new equipment, what is the most important first step?",
    options: [
      "Request at least three supplier quotes before doing anything else.",
      "Check whether the purchase is necessary and whether the need can be met by existing equipment.",
      "Choose the supplier the company has used before to save time.",
      "Select the environmentally certified option to meet sustainability targets.",
    ],
    correct: 1,
    correctExplanation:
      "Confirming the need before comparing suppliers prevents unnecessary purchases and leads to more accurate orders. Sometimes existing equipment can be repaired, shared or redeployed.",
    incorrectExplanation:
      "The first step in any purchasing decision is to confirm whether a purchase is genuinely needed. Supplier comparison and selection come after the need has been established.",
    optionFeedback: [
      "Incorrect. Requesting quotes before confirming the need may result in purchasing something that was not necessary.",
      "Correct. Confirming the need and exploring alternatives before comparing products is always the right starting point.",
      "Incorrect. A familiar supplier is not automatically the right choice for every situation. Compare current options against the current requirement.",
      "Incorrect. A certification is one factor to consider — it does not resolve the question of whether the purchase is necessary.",
    ],
  },
  {
    order: 3,
    question:
      "A purchasing officer is comparing two office chairs. Option A has a one-year warranty and a lower price. Option B has a three-year warranty, confirmed local servicing and a higher price. The chairs will be used every working day. Which statement best reflects a whole-life value comparison?",
    options: [
      "Option A is better value because its purchase price is lower.",
      "Option B is better value because a longer warranty always indicates superior quality.",
      "The comparison should include expected lifespan, likely repair costs, downtime risk and total cost over the period of use — not only the purchase price.",
      "The decision should be based on whichever option has the lower environmental impact.",
    ],
    correct: 2,
    correctExplanation:
      "For chairs used every day, warranty, repair availability and lifespan are important factors. A product that requires earlier replacement or creates downtime may cost more overall than a higher-priced option with better support.",
    incorrectExplanation:
      "Whole-life value requires comparing more than the purchase price. For equipment in daily use, lifespan, repair availability and downtime risk are significant factors in the total cost.",
    optionFeedback: [
      "Incorrect. Purchase price alone is not a sufficient basis for a whole-life value comparison.",
      "Incorrect. A longer warranty is a useful indicator but is not a guarantee of quality. The comparison should be based on the full range of relevant factors.",
      "Correct. A whole-life comparison accounts for what the product costs and delivers throughout the time the organisation uses it.",
      "Incorrect. Environmental impact is one consideration in procurement decisions. For this comparison, the primary question is total cost and value over the period of use.",
    ],
  },
  {
    order: 4,
    question:
      "A supplier describes a product as environmentally friendly but provides no further explanation. What is the most appropriate response?",
    options: [
      "Accept the claim — suppliers are responsible for the accuracy of their product descriptions.",
      "Reject the supplier — environmental claims without evidence are dishonest.",
      "Ask what the claim means, what evidence supports it, and whether any certification applies to the full product or only part of it.",
      "Give the supplier the benefit of the doubt — most environmental claims are broadly accurate.",
    ],
    correct: 2,
    correctExplanation:
      "Vague environmental claims cannot be evaluated without more information. Asking what the claim means, what evidence supports it and whether a certification applies to the full product or only a component gives you the information needed to assess it fairly.",
    incorrectExplanation:
      "A vague claim should be clarified before being accepted or rejected. Ask what it means and what evidence supports it — then use that information in your recommendation.",
    optionFeedback: [
      "Incorrect. Accepting an unexplained claim without checking it means you cannot verify whether it is relevant or meaningful.",
      "Incorrect. A vague claim is not automatically dishonest. It may be incomplete or imprecise. Ask for clarification before drawing a conclusion.",
      "Correct. Specific, verifiable information allows you to make a fair comparison and an accurate recommendation.",
      "Incorrect. Environmental claims vary widely in scope and accuracy. Do not assume they are broadly accurate without checking what they refer to.",
    ],
  },
  {
    order: 5,
    question:
      "A supplier tells you their product packaging is recyclable. Your company uses a mixed-recycling collection service. What should you do before treating this as a sustainability advantage?",
    options: [
      "Accept the claim — recyclable packaging reduces environmental impact.",
      "Confirm whether your company's collection service accepts this packaging type, and ask whether unnecessary packaging can be avoided.",
      "Reject the supplier — recyclability claims are unreliable.",
      "Compare the packaging with competitors' packaging and choose the option with the most recycled content.",
    ],
    correct: 1,
    correctExplanation:
      "'Recyclable' describes what a material could theoretically be processed into — not what will actually happen to it. Whether it is recycled depends on your collection arrangement. Confirming this avoids a misleading assumption.",
    incorrectExplanation:
      "A recyclability claim describes a material property. Whether the material is actually recycled depends on local collection arrangements. Confirm this before treating the claim as a confirmed benefit.",
    optionFeedback: [
      "Incorrect. Recyclable packaging is only beneficial if it is collected and processed through an actual recycling stream. Confirm your collection arrangement.",
      "Correct. Confirming whether your collection service accepts the packaging type gives you accurate information to use in your recommendation.",
      "Incorrect. Recyclability claims are not automatically unreliable. Ask what they mean and whether they apply to your situation.",
      "Incorrect. Recycled content is one factor. The primary question is whether your collection arrangement can process this packaging type.",
    ],
  },
  {
    order: 6,
    question:
      "A hotel is selecting a new cleaning product. Offer A is cheaper but provides unclear dosage instructions. Offer B costs more and includes clear dosage guidance and supplier training. What is the most important consideration?",
    options: [
      "Unit cost — cleaning products are a commodity and price should be the deciding factor.",
      "Supplier reputation — choose the supplier the hotel has used before.",
      "Hygiene effectiveness, safety compliance, correct use and total consumption — unclear dosage instructions increase the risk of incorrect application.",
      "Environmental certification — choose the option with the most eco-labels.",
    ],
    correct: 2,
    correctExplanation:
      "Cleaning products in hospitality carry hygiene, safety and compliance requirements. Unclear dosage instructions increase the risk of under- or over-application, which affects cleaning effectiveness, staff safety and actual product consumption. Any change to approved products should follow the correct approval process.",
    incorrectExplanation:
      "For hospitality cleaning products, hygiene effectiveness, safety and correct application are primary considerations. Unit cost and eco-labels are relevant but secondary to ensuring the product can be used safely and correctly.",
    optionFeedback: [
      "Incorrect. Unit cost is relevant but is not the primary factor for cleaning products that carry hygiene and safety requirements.",
      "Incorrect. Familiarity with a supplier is useful context but is not a substitute for evaluating the specific product against current requirements.",
      "Correct. The most important factors for cleaning products are whether they meet hygiene standards, can be used safely and correctly, and are compatible with approved procedures.",
      "Incorrect. Environmental certifications are one consideration. For cleaning products, hygiene, safety and correct application take precedence.",
    ],
  },
  {
    order: 7,
    question:
      "A facilities team is comparing two equipment offers. Offer A is cheaper and arrives in three days. Offer B is more expensive, has a longer warranty, confirmed service support, but takes two additional weeks to arrive. The equipment is needed for a project that starts in ten days. Which approach is most appropriate?",
    options: [
      "Choose Offer A — delivery time is the deciding factor when a deadline is approaching.",
      "Choose Offer B — a longer warranty always justifies higher cost.",
      "Assess urgency, downtime risk, budget, warranty and service support together — if the project cannot start without the equipment and Offer B cannot arrive in time, delivery time may be decisive.",
      "Request an extension on the project deadline to allow more time to decide.",
    ],
    correct: 2,
    correctExplanation:
      "When a deadline is firm and the equipment is critical, delivery time becomes a significant factor alongside warranty and cost. The recommendation should state the trade-off considered so the approver understands what was weighed.",
    incorrectExplanation:
      "Delivery time is an important factor when a deadline is involved, but it should be assessed alongside budget, downtime risk, warranty and service support — not treated as the only consideration.",
    optionFeedback: [
      "Incorrect. Delivery time matters when a deadline is firm, but it should be assessed alongside other relevant factors such as budget, downtime risk and warranty.",
      "Incorrect. A longer warranty does not automatically justify a higher cost in all situations. Weigh it against budget, urgency and operational requirements.",
      "Correct. When a deadline is firm and the equipment is critical, delivery time may become the most important factor. State the trade-off considered in your recommendation.",
      "Incorrect. Requesting a project extension to defer a procurement decision is rarely appropriate unless there is a genuine reason the purchase cannot proceed.",
    ],
  },
  {
    order: 8,
    question:
      "After comparing two supplier offers, a department employee believes Offer B is the better value but the total cost is above their individual approval limit. What is the correct next step?",
    options: [
      "Proceed with Offer B — the sustainability benefit justifies exceeding the approval limit.",
      "Choose Offer A because it falls within the approval limit, without mentioning the comparison.",
      "Prepare a clear comparison of both offers and escalate to the appropriate approver, explaining the trade-offs considered.",
      "Wait until the next budget cycle before making any decision.",
    ],
    correct: 2,
    correctExplanation:
      "When a decision is outside your approval authority, escalation is required. Presenting a clear comparison with the trade-offs considered gives the approver what they need to decide efficiently. Do not bypass approval limits.",
    incorrectExplanation:
      "Purchasing approval limits exist to ensure appropriate oversight. When a decision exceeds your authority, escalate with the supporting information rather than bypassing the process or defaulting to a lower-value option without explanation.",
    optionFeedback: [
      "Incorrect. Sustainability considerations do not override procurement approval limits. Follow your company's purchasing procedures.",
      "Incorrect. Choosing a lower-value option without informing the approver of the comparison denies them information they may need.",
      "Correct. Escalation with a clear comparison is the appropriate step when a decision exceeds your approval authority.",
      "Incorrect. Deferring a purchasing decision without explanation may create operational problems. Escalate promptly with your comparison and recommendation.",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main seeder
// ─────────────────────────────────────────────────────────────────────────────
export async function ensureSustainableProcurementCourse(): Promise<void> {
  try {
    // 1. Locate the existing course record (never create a new one)
    const [course] = await db
      .select()
      .from(coursesTable)
      .where(
        or(
          eq(coursesTable.id, COURSE_ID),
          eq(coursesTable.slug, COURSE_SLUG)
        )
      )
      .limit(1);

    if (!course) {
      logger.error(
        { courseId: COURSE_ID, slug: COURSE_SLUG },
        "Sustainable Procurement course not found in database."
      );
      return;
    }

    const courseId = course.id;

    // 2. Integrity checks
    let needsRepair = false;

    const existingLessons = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, courseId));

    if (existingLessons.length < 6) {
      needsRepair = true;
    } else {
      for (const newLesson of NEW_LESSONS) {
        const dbLesson = existingLessons.find(
          (l) => l.orderIndex === newLesson.order
        );
        if (
          !dbLesson ||
          !Array.isArray(dbLesson.contentBlocks) ||
          (dbLesson.contentBlocks as any[]).length === 0
        ) {
          needsRepair = true;
          break;
        }
        const raw = JSON.stringify(dbLesson.contentBlocks);
        if (
          dbLesson.content?.includes("[DRAFT SKELETON]") ||
          raw.includes("[DRAFT SKELETON]")
        ) {
          needsRepair = true;
          break;
        }
      }
    }

    const existingQuestions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.courseId, courseId));

    if (
      existingQuestions.length !== 8 ||
      existingQuestions.some((q) => q.question.includes("[DRAFT SKELETON]"))
    ) {
      needsRepair = true;
    }

    if (!course.completionMessage) {
      needsRepair = true;
    }

    if (course.passingScore !== 80) {
      needsRepair = true;
    }

    // Check badge (seed marker badge slug, not the skeleton badge)
    const existingBadge = await db
      .select()
      .from(badgeDefinitionsTable)
      .where(eq(badgeDefinitionsTable.slug, BADGE_SLUG))
      .limit(1);
    if (existingBadge.length === 0) {
      needsRepair = true;
    }

    const [existingSeed] = await db
      .select()
      .from(systemSeedsTable)
      .where(eq(systemSeedsTable.name, SEED_NAME))
      .limit(1);

    if (existingSeed && !needsRepair) {
      logger.info(
        { courseId, slug: COURSE_SLUG },
        "Sustainable Procurement course content and integrity verified. Skipping repair to preserve administrator edits..."
      );
      return;
    }

    if (needsRepair) {
      logger.info(
        { courseId, slug: COURSE_SLUG },
        "Integrity mismatch or missing seed detected for Course 5. Re-seeding course content and lessons transactionally..."
      );
    }

    // 3. Transactional repair
    await db.transaction(async (tx) => {
      // Update course metadata
      await tx
        .update(coursesTable)
        .set({
          slug: COURSE_SLUG,
          title: COURSE_TITLE,
          description: COURSE_META.description,
          fullDescription: COURSE_META.fullDescription,
          categoryId: COURSE_META.categoryId,
          durationMinutes: COURSE_META.durationMinutes,
          priceUsd: COURSE_META.priceUsd,
          level: COURSE_META.level,
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
        .where(eq(coursesTable.id, courseId));

      // Lessons — repair or upsert
      const existingLessonsTx = await tx
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, courseId));

      for (const newLesson of NEW_LESSONS) {
        const dbLesson = existingLessonsTx.find(
          (l) => l.orderIndex === newLesson.order
        );

        if (dbLesson) {
          const isEmpty =
            !Array.isArray(dbLesson.contentBlocks) ||
            (dbLesson.contentBlocks as any[]).length === 0;
          const isPlaceholder =
            dbLesson.content?.includes("[DRAFT SKELETON]") ||
            JSON.stringify(dbLesson.contentBlocks || []).includes(
              "[DRAFT SKELETON]"
            );
          const isSkeleton = isEmpty || isPlaceholder;

          if (isSkeleton) {
            await tx
              .update(lessonsTable)
              .set({
                title: newLesson.title,
                durationMinutes: newLesson.minutes,
                content: newLesson.content,
                contentBlocks: newLesson.blocks,
              })
              .where(eq(lessonsTable.id, dbLesson.id));
          } else {
            // Preserve admin edits — only update if block count has grown
            const currentCount = (dbLesson.contentBlocks as any[]).length;
            if (currentCount < newLesson.blocks.length) {
              await tx
                .update(lessonsTable)
                .set({ contentBlocks: newLesson.blocks })
                .where(eq(lessonsTable.id, dbLesson.id));
            } else {
              logger.info(
                { orderIndex: newLesson.order, title: dbLesson.title },
                "Lesson content verified. Preserving existing edits."
              );
            }
          }
        } else {
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
      }

      // Quiz — replace only if skeleton or wrong count
      const existingQuizTx = await tx
        .select()
        .from(quizQuestionsTable)
        .where(eq(quizQuestionsTable.courseId, courseId));

      const hasAdminEdits = existingQuizTx.some(
        (q) => q.correctExplanation !== null || q.optionFeedback !== null
      );
      const isPlaceholderQuiz =
        existingQuizTx.length !== 8 ||
        existingQuizTx.some((q) => q.question.includes("[DRAFT SKELETON]"));

      if (!hasAdminEdits || isPlaceholderQuiz) {
        await tx
          .delete(quizQuestionsTable)
          .where(eq(quizQuestionsTable.courseId, courseId));

        await tx.insert(quizQuestionsTable).values(
          NEW_QUIZ.map((q) => ({
            courseId,
            question: q.question,
            options: q.options,
            correctOption: q.correct,
            orderIndex: q.order,
            correctExplanation: q.correctExplanation,
            incorrectExplanation: q.incorrectExplanation,
            optionFeedback: q.optionFeedback,
            isArchived: false,
          }))
        );
      }

      // Badge — upsert the seeder badge (do not touch skeleton badge)
      await tx
        .insert(badgeDefinitionsTable)
        .values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "clipboard-check",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [courseId],
          orderIndex: 10,
        })
        .onConflictDoUpdate({
          target: badgeDefinitionsTable.slug,
          set: {
            name: COURSE_META.badgeName,
            description: COURSE_META.badgeDescription,
            courseIds: [courseId],
          },
        });

      // Seed marker
      if (!existingSeed) {
        await tx.insert(systemSeedsTable).values({
          name: SEED_NAME,
          version: 1,
        });
      }
    });

    logger.info(
      { courseId, slug: COURSE_SLUG },
      "Sustainable Procurement course seed / repair transaction completed successfully."
    );
  } catch (err) {
    logger.error(
      { err },
      "Failed to execute Sustainable Procurement course seeder"
    );
  }
}
