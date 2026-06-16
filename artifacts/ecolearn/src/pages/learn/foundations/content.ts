export const FOUNDATIONS_COURSE_ID = 23;
export const NEXT_COURSE_ID = 12;
export const NEXT_COURSE_TITLE = "Waste Sorting and the Mauritian Bin System";

const IMG = "/images/courses/foundations";

export type TextBlock = { type: "text"; heading?: string; body: string };
export type CalloutBlock = { type: "callout"; title: string; body: string };

export type ScenarioChoice = { label: string; feedback: string; ideal?: boolean };
export type ScenarioBlock = {
  type: "scenario";
  prompt: string;
  choices: ScenarioChoice[];
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

export type CommitmentOption = { value: string; label: string; description: string };
export type CommitmentBlock = {
  type: "commitment";
  instruction: string;
  options: CommitmentOption[];
};

export type Block =
  | TextBlock
  | CalloutBlock
  | ScenarioBlock
  | MatchingBlock
  | KnowledgeCheck
  | RoleSelectorBlock
  | DecisionBlock
  | CommitmentBlock;

export type Module = {
  key: string;
  title: string;
  subtitle: string;
  image?: string;
  blocks: Block[];
};

export const COMMITMENT_OPTIONS: CommitmentOption[] = [
  { value: "reduce-waste", label: "Reduce waste", description: "Use less, reuse where I can, and sort my rubbish properly." },
  { value: "save-water", label: "Save water", description: "Turn off taps when not in use and report leaks quickly." },
  { value: "save-energy", label: "Save energy", description: "Switch off lights, screens, and air conditioning when not needed." },
  { value: "recycle", label: "Recycle correctly", description: "Put items in the right bin and keep the streams clean." },
  { value: "encourage", label: "Encourage colleagues", description: "Share good habits and support green ideas at work." },
];

export const MODULES: Module[] = [
  {
    key: "welcome",
    title: "Welcome to Sustainability",
    subtitle: "A simple idea that shapes our future",
    image: `${IMG}/welcome.png`,
    blocks: [
      {
        type: "text",
        body: "Sustainability is a big word for a simple idea. It means meeting our needs today without taking away what the next generation will need tomorrow. It touches the air we breathe, the water we drink, the energy we use, and the way we treat one another at work.",
      },
      {
        type: "text",
        heading: "Why it is for everyone",
        body: "You do not need to be an expert or work in a special department. Every person at work makes small choices each day. Added together, those choices protect Mauritius and help the business stay strong.",
      },
      {
        type: "scenario",
        prompt: "Picture your team room at the end of the day. The lights are on, two screens are glowing, and the air conditioning is running. Everyone has gone home. What would you do?",
        choices: [
          { label: "Switch off the lights, screens, and air conditioning", feedback: "Great choice. Small habits like this save energy and money every single day.", ideal: true },
          { label: "Leave everything on in case someone returns", feedback: "It is tempting, but an empty room does not need power. Switching off is the sustainable habit." },
          { label: "Switch off only the lights", feedback: "A good start. Screens and air conditioning use a lot of energy too, so switch those off as well." },
        ],
      },
      {
        type: "check",
        question: "What does sustainability mean in simple terms?",
        options: [
          "Using resources today in a way that still leaves enough for the future",
          "Spending as much as possible right now",
          "A concern only for large factories",
          "A rule that applies only to government offices",
        ],
        correctIndex: 0,
        explanation: "Sustainability is about balance: using what we need today while protecting what future generations will need.",
      },
    ],
  },
  {
    key: "why",
    title: "Why Sustainability Matters",
    subtitle: "Good for people, the planet, and business",
    blocks: [
      {
        type: "text",
        body: "Sustainability rests on three connected ideas. We care for the environment, we support people and communities, and we keep the business healthy. When these three work together, everyone benefits.",
      },
      {
        type: "callout",
        title: "The three pillars",
        body: "Environment: protect nature and resources. People: build fair, safe, and positive workplaces. Business: stay profitable and trusted for the long term.",
      },
      {
        type: "matching",
        instruction: "Match each sustainable action to the benefit it brings. Tap an action, then tap its benefit.",
        pairs: [
          { term: "Reduce waste", match: "Less rubbish sent to the landfill" },
          { term: "Save energy", match: "Lower electricity bills and emissions" },
          { term: "Conserve water", match: "More fresh water for everyone" },
          { term: "Corporate responsibility", match: "A stronger and more trusted business" },
        ],
      },
      {
        type: "check",
        question: "Which statement best describes the pillars of sustainability?",
        options: [
          "Only making more profit",
          "Balancing environmental, social, and economic needs",
          "Ignoring community needs",
          "Using more energy every year",
        ],
        correctIndex: 1,
        explanation: "True sustainability balances the environment, people, and the economy at the same time.",
      },
      {
        type: "check",
        question: "A company that acts responsibly usually:",
        options: [
          "Loses all of its customers",
          "Builds trust and saves money over time",
          "Has nothing to gain",
          "Must stop all of its operations",
        ],
        correctIndex: 1,
        explanation: "Responsible companies tend to cut waste, lower costs, and earn the trust of customers and staff.",
      },
    ],
  },
  {
    key: "mauritius",
    title: "Sustainability in Mauritius",
    subtitle: "Local realities, local responsibility",
    image: `${IMG}/mauritius.png`,
    blocks: [
      {
        type: "text",
        heading: "We share one small island",
        body: "Mauritius is beautiful, but it is also small. That means our choices have a direct and visible effect on the land, the lagoon, and each other.",
      },
      {
        type: "text",
        heading: "Three local challenges",
        body: "Limited land for waste: most household rubbish travels to the Mare Chicose landfill, which keeps filling up. Plastic pollution: single use plastic harms our beaches, reefs, and sea life. Water pressure: dry seasons and demand mean fresh water must be used with care.",
      },
      {
        type: "callout",
        title: "Case study: a west coast hotel",
        body: "A hospitality team started small. They placed clear recycling bins in every department, fixed dripping taps within a day, and trained staff to switch off idle equipment. Within a year they sent far less waste to the landfill, cut their water use, and lowered their energy bill. Guests noticed the care, and staff felt proud to be part of it.",
      },
      {
        type: "check",
        question: "Where does most household waste in Mauritius end up?",
        options: [
          "The Mare Chicose landfill",
          "The sea near Port Louis",
          "A recycling plant in every village",
          "Reunion Island",
        ],
        correctIndex: 0,
        explanation: "Most household waste in Mauritius is sent to the Mare Chicose landfill, so reducing and sorting waste really matters.",
      },
      {
        type: "check",
        question: "Which is a real environmental challenge for Mauritius?",
        options: [
          "Too much unused farmland",
          "No coastline to protect",
          "Unlimited landfill space",
          "Limited land for waste and pressure on fresh water",
        ],
        correctIndex: 3,
        explanation: "As a small island, Mauritius has limited space for waste and must protect its fresh water carefully.",
      },
    ],
  },
  {
    key: "role",
    title: "Your Role as an Employee",
    subtitle: "Every job can make a difference",
    image: `${IMG}/roles.png`,
    blocks: [
      {
        type: "text",
        body: "Sustainability is not one person's job. It works best when everyone plays their part, whatever their role. Here are simple examples from across a typical workplace.",
      },
      {
        type: "roles",
        instruction: "See how each role helps, then choose the actions you could realistically do in your own role.",
        roles: [
          { role: "Office employee", example: "Print less, switch off devices, and sort paper for recycling." },
          { role: "Receptionist", example: "Reduce printed forms and share information digitally where possible." },
          { role: "Technician", example: "Fix leaks quickly and keep equipment running efficiently." },
          { role: "Housekeeper", example: "Use water and cleaning products carefully, and report any drips." },
          { role: "Manager", example: "Set the example, encourage the team, and support green ideas." },
        ],
        actionPrompt: "Actions I can take in my role:",
        actions: [
          "Switch off lights and equipment when not in use",
          "Sort my waste into the correct bins",
          "Report leaks and faults quickly",
          "Print less and choose digital first",
          "Encourage a colleague to join in",
        ],
      },
      {
        type: "check",
        question: "As an office employee, a simple sustainable action is to:",
        options: [
          "Leave the air conditioning on overnight",
          "Switch off lights and screens when leaving a room",
          "Print every email",
          "Keep taps running while working",
        ],
        correctIndex: 1,
        explanation: "Switching off lights and screens when you leave is one of the easiest ways to save energy.",
      },
    ],
  },
  {
    key: "actions",
    title: "Everyday Sustainability Actions",
    subtitle: "Small choices, made often",
    image: `${IMG}/actions.png`,
    blocks: [
      {
        type: "text",
        heading: "Five areas you can act on",
        body: "Energy: switch off what you are not using. Water: turn off taps and report leaks. Waste: reduce, reuse, then recycle. Paper: think before you print. Transport: share rides or combine trips when you can.",
      },
      {
        type: "decision",
        intro: "Try these quick decisions. Choose the greener option and see what happens.",
        scenarios: [
          {
            prompt: "You see a clean plastic bottle in the general waste bin. What do you do?",
            options: [
              { label: "Leave it, it does not matter", correct: false, feedback: "Every bottle counts. Moving it to recycling keeps it out of the landfill." },
              { label: "Move it to the recycling stream where available", correct: true, feedback: "Exactly. Sorting it correctly gives the bottle a second life." },
              { label: "Throw more waste on top", correct: false, feedback: "That makes recycling harder. The bottle belongs in the recycling stream." },
            ],
          },
          {
            prompt: "A tap in the staff kitchen is dripping. What is the best response?",
            options: [
              { label: "Ignore it, it is only a drip", correct: false, feedback: "A small drip wastes a lot of water over time. It is worth acting on." },
              { label: "Turn it off tightly and report it", correct: true, feedback: "Perfect. Quick reporting saves water and prevents bigger problems." },
              { label: "Let it run so it does not block", correct: false, feedback: "Letting it run wastes fresh water. Turn it off and report it." },
            ],
          },
          {
            prompt: "You need to read a short document. What is the greener choice?",
            options: [
              { label: "Print several copies to be safe", correct: false, feedback: "That uses paper you may not need. Reading on screen is greener." },
              { label: "Read it on screen if you can", correct: true, feedback: "Great. Choosing digital first saves paper and ink." },
              { label: "Print it single sided every time", correct: false, feedback: "If you must print, use both sides. Better still, read it on screen." },
            ],
          },
        ],
      },
      {
        type: "check",
        question: "Which everyday habit saves water at work?",
        options: [
          "Letting taps run during breaks",
          "Turning off the tap when it is not in use and reporting leaks",
          "Washing single items under running water for a long time",
          "Ignoring a running toilet",
        ],
        correctIndex: 1,
        explanation: "Turning off taps and reporting leaks quickly are simple habits that save a surprising amount of water.",
      },
    ],
  },
  {
    key: "commitment",
    title: "Your Sustainability Commitment",
    subtitle: "Turn knowledge into action",
    blocks: [
      {
        type: "text",
        body: "You have learned what sustainability means, why it matters for Mauritius, and the everyday actions that make a difference. Now comes the most important step: choosing what you will do.",
      },
      {
        type: "text",
        heading: "Start with one or two",
        body: "You do not have to change everything at once. Pick the commitments that feel realistic for you. We will save your choices so you can track them over time.",
      },
      {
        type: "commitment",
        instruction: "Select the commitments you are ready to make. Choose at least one.",
        options: COMMITMENT_OPTIONS,
      },
    ],
  },
];
