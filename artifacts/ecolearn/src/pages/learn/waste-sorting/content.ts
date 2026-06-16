export const WASTE_SORTING_COURSE_SLUG = "waste-sorting";
export const WASTE_SORTING_COURSE_ID = 12;
export const WASTE_SORTING_COURSE_TITLE =
  "Waste Sorting and the Mauritian Bin System";

export type TextBlock = { type: "text"; heading?: string; body: string };
export type CalloutBlock = { type: "callout"; title: string; body: string };

export type RevealItem = { label: string; detail: string };
export type RevealBlock = {
  type: "reveal";
  instruction: string;
  items: RevealItem[];
};

export type ScenarioChoice = { label: string; feedback: string; ideal?: boolean };
export type ScenarioBlock = {
  type: "scenario";
  prompt: string;
  choices: ScenarioChoice[];
};

export type SortBin = { key: string; label: string };
export type SortItem = { label: string; correctBin: string; note: string };
export type SortBlock = {
  type: "sort";
  instruction: string;
  bins: SortBin[];
  items: SortItem[];
};

export type MatchPair = { term: string; match: string };
export type MatchingBlock = {
  type: "matching";
  instruction: string;
  pairs: MatchPair[];
};

export type KnowledgeCheck = {
  type: "check";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type RoleExample = { role: string; example: string };
export type RoleSelectorBlock = {
  type: "roles";
  instruction: string;
  roles: RoleExample[];
  actionPrompt: string;
  actions: string[];
};

export type DecisionScenario = {
  prompt: string;
  options: { label: string; correct: boolean; feedback: string }[];
};
export type DecisionBlock = {
  type: "decision";
  intro: string;
  scenarios: DecisionScenario[];
};

export type PledgeOption = { value: string; label: string; description: string };
export type PledgeBlock = {
  type: "pledge";
  instruction: string;
  options: PledgeOption[];
};

export type Block =
  | TextBlock
  | CalloutBlock
  | RevealBlock
  | ScenarioBlock
  | SortBlock
  | MatchingBlock
  | KnowledgeCheck
  | RoleSelectorBlock
  | DecisionBlock
  | PledgeBlock;

export type Module = {
  key: string;
  title: string;
  subtitle: string;
  image?: string;
  blocks: Block[];
};

export const PLEDGE_OPTIONS: PledgeOption[] = [
  { value: "sort-correctly", label: "Sort waste correctly", description: "Put each item in the right bin and keep the recycling clean." },
  { value: "reduce-single-use", label: "Cut single use plastics", description: "Choose reusable bottles, bags, and cups whenever I can." },
  { value: "compost", label: "Keep organic waste separate", description: "Send food and garden waste for composting, not to the landfill." },
  { value: "check-before-bin", label: "Check before I bin", description: "Pause and think which bin an item really belongs in." },
  { value: "share-habits", label: "Share good habits", description: "Help colleagues and family sort their waste the right way." },
];

export const MODULES: Module[] = [
  {
    key: "why",
    title: "Why Waste Sorting Matters",
    subtitle: "A small island with a big waste challenge",
    blocks: [
      {
        type: "text",
        body: "Every day, homes, offices, and hotels across Mauritius throw away large amounts of waste. On a small island, that waste has to go somewhere, and most of it ends up buried in the ground. Sorting our waste well is the first step to changing that.",
      },
      {
        type: "text",
        heading: "One island, limited space",
        body: "Almost all of our household waste travels to a single landfill at Mare Chicose in the south east. It keeps filling up, and there is very little room to expand on an island as small as ours. The more we recycle and recover, the less we bury.",
      },
      {
        type: "reveal",
        instruction: "Tap each card to see why sorting makes a real difference here.",
        items: [
          { label: "One landfill for the whole island", detail: "Nearly all household waste in Mauritius is buried at Mare Chicose. Space is limited and costly to expand." },
          { label: "Waste is a resource", detail: "Paper, plastic, metal, and glass sorted correctly can become new products instead of being buried." },
          { label: "Clean streams matter", detail: "When recyclables stay clean and separated, much more can actually be recycled." },
          { label: "It starts with us", detail: "Good sorting begins with simple daily choices at home and at work." },
        ],
      },
      {
        type: "callout",
        title: "The circular economy",
        body: "In a circular economy we keep materials in use for as long as possible. We reduce, reuse, repair, and recycle so that fewer new resources are needed and far less waste is created.",
      },
      {
        type: "scenario",
        prompt: "The bin in your work kitchen is overflowing, and everything from food scraps to bottles and paper is mixed together. What is the best response?",
        choices: [
          { label: "Set up separate bins so waste can be sorted at the source", feedback: "Exactly. Sorting at the source keeps recyclables clean and useful.", ideal: true },
          { label: "Press it down so more fits in the one bin", feedback: "That only delays the problem and mixes materials that could have been recycled." },
          { label: "Leave it, someone else will deal with it", feedback: "Waste is a shared responsibility. A simple sorting setup helps everyone." },
        ],
      },
      {
        type: "check",
        question: "Where does most household waste in Mauritius end up?",
        options: [
          "The Mare Chicose landfill",
          "Recycled in every neighbourhood",
          "Exported to other countries",
          "Burned at sea",
        ],
        correctIndex: 0,
        explanation: "Most household waste in Mauritius is buried at the Mare Chicose landfill, so reducing and sorting waste really matters.",
      },
      {
        type: "check",
        question: "What is the main idea of a circular economy?",
        options: [
          "Use materials once and throw them away",
          "Keep materials in use through reduce, reuse, repair, and recycle",
          "Bury all waste as quickly as possible",
          "Only large factories need to take part",
        ],
        correctIndex: 1,
        explanation: "A circular economy keeps materials in use for as long as possible so less is wasted and fewer new resources are needed.",
      },
    ],
  },
  {
    key: "categories",
    title: "Understanding Waste Categories",
    subtitle: "Know what you are throwing away",
    blocks: [
      {
        type: "text",
        body: "Before you can sort waste, it helps to know the main categories. Most of what we throw away falls into one of four groups.",
      },
      {
        type: "callout",
        title: "The four categories",
        body: "Recyclable: paper, cardboard, plastic containers, metal cans, glass. Organic: food scraps, peels, garden waste. Residual: contaminated or non recyclable items, certain hygiene products. Special: batteries, electronics, chemicals, paints, light bulbs.",
      },
      {
        type: "sort",
        instruction: "Sort each item into the correct category. Tap the item, then choose its category.",
        bins: [
          { key: "recyclable", label: "Recyclable" },
          { key: "organic", label: "Organic" },
          { key: "residual", label: "Residual" },
          { key: "special", label: "Special" },
        ],
        items: [
          { label: "Clean cardboard box", correctBin: "recyclable", note: "Clean paper and cardboard are recyclable." },
          { label: "Banana peel", correctBin: "organic", note: "Food scraps and peels are organic waste." },
          { label: "Used paper tissue", correctBin: "residual", note: "Soiled tissues are residual, or general, waste." },
          { label: "Old phone battery", correctBin: "special", note: "Batteries are special waste and need a collection point." },
          { label: "Empty glass jar", correctBin: "recyclable", note: "Clean glass is recyclable." },
          { label: "Garden leaves", correctBin: "organic", note: "Garden waste is organic and can be composted." },
        ],
      },
      {
        type: "check",
        question: "Which item belongs in the organic category?",
        options: [
          "A plastic bottle",
          "Fruit and vegetable peels",
          "A used battery",
          "A glass jar",
        ],
        correctIndex: 1,
        explanation: "Organic waste includes food scraps, peels, and garden waste, all of which can be composted.",
      },
      {
        type: "check",
        question: "Batteries, electronics, and paints are examples of:",
        options: [
          "Recyclable waste",
          "Organic waste",
          "Residual waste",
          "Special waste",
        ],
        correctIndex: 3,
        explanation: "These are special waste. They should never go in the normal bins and need dedicated collection points.",
      },
    ],
  },
  {
    key: "bins",
    title: "The Mauritian Bin System",
    subtitle: "The right item in the right bin",
    blocks: [
      {
        type: "text",
        body: "A simple colour system makes sorting easy to remember. Use the guide below to match each type of waste to the right bin.",
      },
      {
        type: "reveal",
        instruction: "Tap each bin to see what belongs inside.",
        items: [
          { label: "Green bin", detail: "Organic waste: food scraps, peels, and garden waste that can be composted." },
          { label: "Yellow bin", detail: "Clean recyclables: paper, plastic containers, metal cans, and clean packaging." },
          { label: "Black bin", detail: "General waste: non recyclable and contaminated items that cannot be recovered." },
          { label: "Special collection points", detail: "Batteries, electronics, and hazardous waste taken to a dedicated drop off point." },
        ],
      },
      {
        type: "sort",
        instruction: "Decide which bin each item belongs in. Tap the item, then choose its bin.",
        bins: [
          { key: "green", label: "Green bin" },
          { key: "yellow", label: "Yellow bin" },
          { key: "black", label: "Black bin" },
          { key: "special", label: "Special point" },
        ],
        items: [
          { label: "Banana peel", correctBin: "green", note: "Organic waste goes in the green bin." },
          { label: "Plastic water bottle", correctBin: "yellow", note: "Empty, clean plastic is recyclable, so it goes in the yellow bin." },
          { label: "Newspaper", correctBin: "yellow", note: "Clean paper goes in the yellow recycling bin." },
          { label: "Used tissue", correctBin: "black", note: "A soiled tissue is general waste for the black bin." },
          { label: "Glass bottle", correctBin: "yellow", note: "Clean glass is recyclable and goes in the yellow bin." },
          { label: "Used battery", correctBin: "special", note: "Batteries go to a special collection point, never a normal bin." },
          { label: "Food soiled pizza box", correctBin: "black", note: "Grease and food contaminate recycling, so a soiled box goes in the black bin." },
        ],
      },
      {
        type: "check",
        question: "Which bin is for clean recyclable materials?",
        options: ["The green bin", "The yellow bin", "The black bin", "A special collection point"],
        correctIndex: 1,
        explanation: "The yellow bin is for clean recyclables such as paper, plastic, metal, and glass.",
      },
      {
        type: "check",
        question: "Where should a used battery go?",
        options: [
          "The green bin",
          "The yellow bin",
          "The black bin",
          "A special collection point",
        ],
        correctIndex: 3,
        explanation: "Batteries are special waste and must go to a dedicated collection point so they can be handled safely.",
      },
    ],
  },
  {
    key: "mistakes",
    title: "Common Sorting Mistakes",
    subtitle: "Keep the recycling clean and useful",
    blocks: [
      {
        type: "text",
        body: "Even when people try to sort, small mistakes can spoil a whole bin of recycling. The most common problem is contamination, when the wrong items or food residue end up in the recycling stream.",
      },
      {
        type: "callout",
        title: "Watch out for these",
        body: "Food residue left in containers. Greasy or soiled packaging in the recycling. Batteries thrown in normal bins. Different waste types mixed together. Overfilled bins that spill and mix.",
      },
      {
        type: "check",
        question: "A yellow recycling bin holds clean bottles, clean paper, a rinsed can, and a half full yoghurt pot. Which item does not belong?",
        options: [
          "The clean bottles",
          "The clean paper",
          "The rinsed can",
          "The half full yoghurt pot",
        ],
        correctIndex: 3,
        explanation: "Food left in a container contaminates the recycling. Empty and rinse it first, or put it in the general bin.",
      },
      {
        type: "scenario",
        prompt: "You are about to recycle a plastic yoghurt pot, but there is still some yoghurt inside. What should you do?",
        choices: [
          { label: "Empty and rinse it, then put it in the recycling", feedback: "Correct. A quick rinse keeps the recycling clean and useful.", ideal: true },
          { label: "Put it in the recycling as it is", feedback: "Food residue can spoil a whole batch of recycling. Rinse it first." },
          { label: "Leave the lid and spoon inside too", feedback: "Extra items and residue make sorting harder. Empty, rinse, and separate parts where you can." },
        ],
      },
      {
        type: "check",
        question: "Why does contamination matter so much?",
        options: [
          "It makes bins look untidy only",
          "It can spoil a whole batch of recycling",
          "It has no real effect",
          "It only matters for special waste",
        ],
        correctIndex: 1,
        explanation: "A few dirty or wrong items can contaminate a large amount of recycling, so it ends up buried instead of recovered.",
      },
    ],
  },
  {
    key: "everywhere",
    title: "Waste Sorting at Home and Work",
    subtitle: "Good habits in every setting",
    blocks: [
      {
        type: "text",
        body: "Sorting works best when it becomes a habit in every part of daily life, at home, at work, and in public spaces. Small setups make the right choice the easy choice.",
      },
      {
        type: "roles",
        instruction: "See how sorting fits each setting, then choose the actions you could realistically take.",
        roles: [
          { role: "At home", example: "Keep a small caddy for food waste and a separate box for clean recyclables." },
          { role: "In the office", example: "Set up a labelled recycling station and keep general bins separate." },
          { role: "In public", example: "Use the correct public bins and take special waste home if there is no bin for it." },
        ],
        actionPrompt: "Actions I can take:",
        actions: [
          "Keep a separate container for clean recyclables",
          "Rinse containers before recycling them",
          "Set up or use a labelled sorting station",
          "Keep food waste out of the recycling",
          "Take batteries and electronics to a collection point",
        ],
      },
      {
        type: "decision",
        intro: "Try these everyday situations. Choose the responsible option.",
        scenarios: [
          {
            prompt: "After lunch at the office you have a clean plastic bottle, a banana peel, and a greasy food wrapper. What is the best move?",
            options: [
              { label: "Put the bottle in recycling, the peel in organic, and the wrapper in general waste", correct: true, feedback: "Well sorted. Each item ends up in the right stream." },
              { label: "Put everything in one bin to save time", correct: false, feedback: "Mixing them means the bottle and peel cannot be recovered. Sort each item." },
              { label: "Recycle all three together", correct: false, feedback: "The greasy wrapper and peel are not recyclable. Only the clean bottle is." },
            ],
          },
          {
            prompt: "At a community beach clean up you collect mixed rubbish. How should you handle it?",
            options: [
              { label: "Separate recyclables from general waste and use the right bins", correct: true, feedback: "Great. Sorting on the spot means more can be recycled." },
              { label: "Leave it in a pile for someone else", correct: false, feedback: "That risks it returning to the environment. Sort and bin it properly." },
              { label: "Burn it on the beach", correct: false, feedback: "Burning waste harms the air and the coast. Sort and use the correct bins." },
            ],
          },
        ],
      },
      {
        type: "check",
        question: "What makes sorting easier to keep up at work?",
        options: [
          "Hiding the bins out of sight",
          "Using a single bin for everything",
          "A clearly labelled sorting station",
          "Waiting for a yearly clean up",
        ],
        correctIndex: 2,
        explanation: "A clear, labelled station placed where waste is created makes the right choice the easy choice.",
      },
    ],
  },
  {
    key: "reduce",
    title: "Reducing Waste Before Sorting",
    subtitle: "The best waste is the waste we never create",
    blocks: [
      {
        type: "text",
        body: "Sorting is important, but reducing waste in the first place matters even more. The waste hierarchy shows the order to think in, from most to least preferred.",
      },
      {
        type: "callout",
        title: "The waste hierarchy",
        body: "Refuse, reduce, reuse, repair, recycle, recover, dispose. The closer to the top, the better for the environment. Disposal in a landfill is always the last resort.",
      },
      {
        type: "matching",
        instruction: "Match each step of the waste hierarchy to a simple example. Tap a step, then tap its example.",
        pairs: [
          { term: "Refuse", match: "Say no to a plastic bag you do not need" },
          { term: "Reduce", match: "Print less and buy only what you will use" },
          { term: "Reuse", match: "Refill a bottle instead of buying a new one" },
          { term: "Recycle", match: "Sort clean paper and plastic into the right bin" },
        ],
      },
      {
        type: "decision",
        intro: "Choose the option that prevents waste before it starts.",
        scenarios: [
          {
            prompt: "You are buying lunch and the shop offers a plastic bag, a plastic fork, and a straw. What is the greener choice?",
            options: [
              { label: "Refuse what you do not need and use your own reusables", correct: true, feedback: "Exactly. Refusing single use items is the top of the hierarchy." },
              { label: "Take all of them in case they are useful", correct: false, feedback: "That creates waste you may never use. Refuse what you do not need." },
              { label: "Take them and recycle them later", correct: false, feedback: "Recycling is good, but refusing the items in the first place is better." },
            ],
          },
        ],
      },
      {
        type: "check",
        question: "Which step of the waste hierarchy is most preferred?",
        options: [
          "Dispose in a landfill",
          "Recover energy",
          "Refuse and reduce",
          "Recycle",
        ],
        correctIndex: 2,
        explanation: "Refusing and reducing waste sits at the top of the hierarchy because the best waste is the waste we never create.",
      },
      {
        type: "text",
        heading: "Your turn to act",
        body: "You have learned the categories, the bin system, and how to avoid common mistakes. Now choose the habits you will carry forward. We will save your choices so you can track them over time.",
      },
      {
        type: "pledge",
        instruction: "Select the waste habits you are ready to commit to. Choose at least one.",
        options: PLEDGE_OPTIONS,
      },
    ],
  },
];
