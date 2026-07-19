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

const COURSE_ID = 10;
const COURSE_SLUG = "environmental-compliance";
const COURSE_TITLE = "Environmental Compliance";
const BADGE_SLUG = "compliance-aware";
const SEED_NAME = "environmental-compliance-v1";
const SKELETON_BADGE_SLUG = "environmental-responsibility";

const COURSE_META = {
  description: "Learn how environmental requirements, company procedures, approvals and workplace records work together, and what employees should do when they identify an environmental risk or possible non-compliance.",
  fullDescription: "Learn how environmental requirements, company procedures, approvals and workplace records work together, and what employees should do when they identify an environmental risk or possible non-compliance.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "0.00",
  level: "ESG and Compliance",
  isFeatured: false,
  thumbnailUrl: "/images/courses/environmental-compliance.jpg",
  learningObjectives: [
    "Explain environmental compliance in practical workplace language.",
    "Recognise the difference between legislation, permits or licences, company procedures and operational records.",
    "Identify common workplace situations that may create an environmental compliance risk.",
    "Respond correctly to spills, improper disposal, missing information or possible breaches.",
    "Understand why accurate records and timely escalation matter.",
    "Prepare appropriately for an inspection or compliance review within the limits of their role."
  ],
  includesCertificate: true,
  passingScore: 80,
  completionMessage: "You have completed Environmental Compliance. You can now recognise common environmental compliance risks, understand the role of procedures and records, and respond more responsibly when something may be wrong.",
  badgeName: "Compliance Aware",
  badgeDescription: "Recognises practical awareness of environmental responsibilities, incident reporting, reliable records and appropriate workplace escalation.",
  recommendedNextCourseId: 11, // Circular Economy
};

// ─────────────────────────────────────────────────────────────────────────────
// Lesson content
// ─────────────────────────────────────────────────────────────────────────────
const NEW_LESSONS = [
  {
    order: 0,
    title: "The Drain Behind the Building",
    minutes: 3,
    content: "Introduce environmental compliance through a realistic workplace situation requiring immediate but proportionate action.",
    blocks: [
      {
        id: "c10-l1-b1",
        type: "heading",
        content: "Would you know what to do?",
      },
      {
        id: "c10-l1-b2",
        type: "text",
        content: "During routine work, you notice a contractor preparing to pour dirty cleaning water into an external drain behind the building.\n\nYou do not know:\n- What the water contains.\n- Where the drain leads.\n- Whether the disposal method was approved.\n- Whether the contractor has received instructions.\n- Whether a permit or site procedure applies.\n\nThe contractor says:\n> “We always do it this way. It will be gone in a few minutes.”",
      },
      {
        id: "c10-l1-b3",
        type: "heading",
        content: "Why it matters",
      },
      {
        id: "c10-l1-b4",
        type: "text",
        content: "A routine-looking action may create pollution, breach an approval condition or conflict with company procedures.\n\nEmployees are not expected to know every environmental law.\n\nThey are expected to:\n- Recognise when something may be wrong.\n- Avoid making the situation worse.\n- Follow the approved reporting process.\n- Provide accurate information.\n- Seek help from the responsible person.",
      },
      {
        id: "c10-l1-b5",
        type: "scenario",
        scenarioText: "What is the most responsible first response?",
        options: [
          {
            id: "opt-1",
            text: "Ignore it because the contractor is responsible for the work.",
            isCorrect: false,
            feedback: "Contractors have responsibilities, but the company may also need to manage activities taking place on its site. A concern should not be ignored merely because another organisation is involved.",
          },
          {
            id: "opt-2",
            text: "Allow the disposal and report it at the end of the month.",
            isCorrect: false,
            feedback: "Delayed reporting may allow harm to occur and may make it harder to establish what happened.",
          },
          {
            id: "opt-3",
            text: "Ask for the activity to pause if it is safe to do so, avoid touching the substance and immediately contact the responsible supervisor or environmental contact.",
            isCorrect: true,
            feedback: "Correct. This prevents an uncertain activity from continuing while keeping the employee within the limits of their role and training.",
          },
          {
            id: "opt-4",
            text: "Collect the liquid yourself and decide how it should be disposed of.",
            isCorrect: false,
            feedback: "An untrained employee should not handle an unknown substance. Use the approved incident or escalation process.",
          },
        ]
      },
      {
        id: "c10-l1-b6",
        type: "heading",
        content: "Consequence explanation",
      },
      {
        id: "c10-l1-b7",
        type: "text",
        content: "A prompt report allows the responsible person to:\n- Identify the substance.\n- Check the applicable procedure.\n- Confirm the correct disposal method.\n- Prevent a discharge.\n- Document the incident.\n- Address contractor instructions.",
      },
      {
        id: "c10-l1-b8",
        type: "callout",
        content: "**Key takeaway:** Environmental compliance starts with recognising concerns early and responding through the correct process.",
      },
      {
        id: "c10-l1-b9",
        type: "callout",
        content: "**Disclaimer:** This course provides general environmental compliance awareness. The requirements applying to an organisation depend on its activities, location, approvals and current legislation. Employees should follow their company’s approved procedures and refer legal or technical questions to the responsible person.",
      }
    ],
  },
  {
    order: 1,
    title: "What Environmental Compliance Means",
    minutes: 3,
    content: "Explain the different layers that can create environmental responsibilities.",
    blocks: [
      {
        id: "c10-l2-b1",
        type: "heading",
        content: "Compliance is more than knowing a law",
      },
      {
        id: "c10-l2-b2",
        type: "text",
        content: "Environmental compliance means operating in accordance with the environmental requirements that apply to the organisation.\n\nThose requirements may come from several places.",
      },
      {
        id: "c10-l2-b3",
        type: "heading",
        content: "Layer 1: Legislation and regulations",
      },
      {
        id: "c10-l2-b4",
        type: "text",
        content: "National legislation and regulations establish legal environmental duties, standards, approval processes and enforcement mechanisms.\n\nEmployees do not need to memorise an entire Act.\n\nThey should understand that legal requirements exist and can affect workplace activities.",
      },
      {
        id: "c10-l2-b5",
        type: "heading",
        content: "Layer 2: Permits, licences and approvals",
      },
      {
        id: "c10-l2-b6",
        type: "text",
        content: "Depending on the activity, scale, location and other factors, an organisation or project may need an environmental permit, licence or approval.\n\nThese documents may include conditions that the organisation must follow.\n\nEmployees must not assume that:\n- An approval is unnecessary.\n- An old approval still covers changed work.\n- A contractor’s approval automatically covers the company.\n- A permit allows any method of operation.\n\nQuestions should be referred to the responsible person.",
      },
      {
        id: "c10-l2-b7",
        type: "heading",
        content: "Layer 3: Company procedures",
      },
      {
        id: "c10-l2-b8",
        type: "text",
        content: "A company converts applicable obligations and risks into practical instructions.\n\nExamples may include:\n- Waste-handling procedures.\n- Spill response instructions.\n- Chemical-storage requirements.\n- Maintenance controls.\n- Contractor rules.\n- Incident reporting.\n- Inspection checklists.\n- Record-retention requirements.",
      },
      {
        id: "c10-l2-b9",
        type: "heading",
        content: "Layer 4: Records and evidence",
      },
      {
        id: "c10-l2-b10",
        type: "text",
        content: "Records help demonstrate what was done.\n\nExamples include:\n- Inspection logs.\n- Waste collection records.\n- Maintenance reports.\n- Incident reports.\n- Contractor documents.\n- Training records.\n- Monitoring results.\n- Photographs where approved.\n- Corrective-action records.\n\n**Important distinction:** A company procedure may be stricter than the minimum legal requirement. Employees should follow the approved company procedure unless an authorised person formally changes it.",
      },
      {
        id: "c10-l2-b11",
        type: "interactive_list",
        title: "Match the item to its strongest category",
        items: [
          {
            title: "National environmental requirement",
            content: "Legislation or regulation"
          },
          {
            title: "Conditions attached to an approval for a particular activity",
            content: "Permit, licence or approval"
          },
          {
            title: "Instructions for reporting a spill",
            content: "Company procedure"
          },
          {
            title: "Completed monthly storage-area inspection",
            content: "Record or evidence"
          },
          {
            title: "Contractor induction explaining site waste rules",
            content: "Company control and training evidence"
          }
        ]
      },
      {
        id: "c10-l2-b12",
        type: "callout",
        content: "**Key takeaway:** Compliance depends on understanding which requirements apply and translating them into consistent workplace actions.",
      }
    ],
  },
  {
    order: 2,
    title: "Everyday Compliance Risks",
    minutes: 4,
    content: "Help learners recognise common warning signs without turning them into environmental specialists.",
    blocks: [
      {
        id: "c10-l3-b1",
        type: "heading",
        content: "Small actions can create significant risks",
      },
      {
        id: "c10-l3-b2",
        type: "text",
        content: "**Waste**\nWarning signs may include:\n- Waste placed in an unauthorised area.\n- Unknown waste mixed with ordinary waste.\n- Burning waste.\n- Unlabelled containers.\n- A contractor removing waste without the required company checks.\n- Records that do not match actual collections.\n\n*Best employee response:* Follow the site procedure and report uncertainty before the waste is moved or disposed of.",
      },
      {
        id: "c10-l3-b3",
        type: "text",
        content: "**Wastewater and drains**\nWarning signs may include:\n- Dirty water poured into an external drain.\n- Oil, paint, chemicals or food-processing residues near drainage channels.\n- An overflowing wastewater system.\n- Unusual colour, foam or odour.\n- A blocked drain causing wastewater to escape.\n\n*Best employee response:* Keep away from unknown substances, report the issue promptly and follow the approved incident procedure.",
      },
      {
        id: "c10-l3-b4",
        type: "text",
        content: "**Fuels, oils and chemicals**\nWarning signs may include:\n- Leaking containers.\n- Missing labels.\n- Damaged storage.\n- Open containers.\n- No suitable containment.\n- Materials stored beside drains.\n- Staff using a substance without the required instructions.\n\n*Best employee response:* Do not improvise. Isolate the area only where safe and authorised, then contact the trained responsible person.",
      },
      {
        id: "c10-l3-b5",
        type: "text",
        content: "**Dust, smoke, noise and odour**\nWarning signs may include:\n- Equipment producing unusual smoke.\n- Construction dust affecting neighbours.\n- A generator operating outside approved arrangements.\n- Repeated complaints.\n- Extraction or ventilation equipment not working.\n- Strong or unexpected odours.\n\n*Best employee response:* Record the observation accurately and refer it through the correct operational or environmental process.",
      },
      {
        id: "c10-l3-b6",
        type: "text",
        content: "**Sensitive locations**\nExtra care may be needed where work is close to:\n- The coast.\n- A river or watercourse.\n- A wetland.\n- A natural drainage path.\n- A protected or sensitive habitat.\n- Neighbouring homes.\n- Public areas.\n\nEmployees must not decide independently that work is permitted simply because it appears minor.",
      },
      {
        id: "c10-l3-b7",
        type: "heading",
        content: "Workplace Interaction",
      },
      {
        id: "c10-l3-b8",
        type: "interactive_list",
        title: "For each situation, choose the strongest response:",
        items: [
          {
            title: "Situation 1: A colleague suggests burning cardboard and plastic packaging behind the site.",
            content: "Best response: Do not proceed. Follow the approved waste procedure and report the suggestion to the responsible supervisor."
          },
          {
            title: "Situation 2: A container is leaking, but the label cannot be read.",
            content: "Best response: Keep away, prevent access where safe and contact the trained person responsible for spills or chemicals."
          },
          {
            title: "Situation 3: A neighbour complains repeatedly about noise from company equipment.",
            content: "Best response: Record the complaint accurately and refer it through the company’s complaint and maintenance process."
          },
          {
            title: "Situation 4: A contractor says that no paperwork is needed because the job will last only one day.",
            content: "Best response: Confirm the applicable approval, induction and company requirements before allowing the work to proceed."
          }
        ]
      },
      {
        id: "c10-l3-b9",
        type: "callout",
        content: "**Key takeaway:** Recognising a warning sign and reporting it promptly is a practical compliance skill.",
      }
    ],
  },
  {
    order: 3,
    title: "Records, Inspections and Evidence",
    minutes: 3,
    content: "Explain how reliable records support compliance and what employees should do during reviews or inspections.",
    blocks: [
      {
        id: "c10-l4-b1",
        type: "heading",
        content: "A record should reflect what actually happened",
      },
      {
        id: "c10-l4-b2",
        type: "text",
        content: "**Why records matter**\nEnvironmental records may help a company:\n- Confirm that an inspection occurred.\n- Track maintenance.\n- Demonstrate how waste was handled.\n- Investigate an incident.\n- Respond to a complaint.\n- Verify contractor activity.\n- Identify repeated failures.\n- Show that corrective action was completed.\n- Respond to an authorised request for information.",
      },
      {
        id: "c10-l4-b3",
        type: "text",
        content: "**A reliable record should be:**\n- Accurate.\n- Completed at the correct time.\n- Legible.\n- Traceable where required.\n- Based on actual observations.\n- Clear about missing information.\n- Corrected using the approved process.\n- Protected from unauthorised alteration.\n\n**Records must not be:**\n- Backdated.\n- Invented.\n- Copied from an earlier inspection without checking.\n- Altered to conceal a problem.\n- Signed by someone who did not complete or verify the work.\n- Destroyed because they show an unfavourable result.",
      },
      {
        id: "c10-l4-b4",
        type: "heading",
        content: "Inspection readiness",
      },
      {
        id: "c10-l4-b5",
        type: "text",
        content: "Employees should know:\n- Who the company’s designated contact is.\n- Where relevant procedures are stored.\n- Which records they are authorised to access.\n- How visitors and inspectors are managed at the site.\n- How to answer accurately without guessing.\n- How to refer questions outside their role.\n\nEmployees should:\n- Remain professional.\n- Follow company visitor and inspection procedures.\n- Provide truthful information within their authority.\n- Contact the designated responsible person.\n- Preserve relevant records.\n- Avoid obstructing, hiding information or creating new records after the fact.\n\nEmployees should not:\n- Guess an answer.\n- Admit liability on behalf of the company.\n- Alter records.\n- Delete messages or documents.\n- Provide confidential information without authorisation.\n- Pretend that a task was completed.",
      },
      {
        id: "c10-l4-b6",
        type: "scenario",
        scenarioText: "An inspection checklist was missed last week. A manager asks you to complete it using last week’s date because “the area is fine now.” What should you do?",
        options: [
          {
            id: "opt-1",
            text: "Complete and backdate the checklist because no problem is currently visible.",
            isCorrect: false,
            feedback: "A backdated checklist would falsely suggest that an inspection occurred at the required time.",
          },
          {
            id: "opt-2",
            text: "Copy the previous checklist and change the date.",
            isCorrect: false,
            feedback: "Copying an old record does not prove that the area was checked.",
          },
          {
            id: "opt-3",
            text: "Record the actual current inspection, identify that the previous check was missed and follow the corrective or escalation process.",
            isCorrect: true,
            feedback: "Correct. This creates an honest record and allows the missed control to be addressed.",
          },
          {
            id: "opt-4",
            text: "Refuse to inspect the area at all.",
            isCorrect: false,
            feedback: "The current inspection may still be useful. The problem is the false date, not the act of checking the area now.",
          },
        ]
      },
      {
        id: "c10-l4-b7",
        type: "callout",
        content: "**Key takeaway:** A truthful record showing a missed control is safer and more useful than a false record showing perfect compliance.",
      }
    ],
  },
  {
    order: 4,
    title: "Scenario, Work Must Continue",
    minutes: 3,
    content: "Test the learner’s response when operational pressure conflicts with an environmental control.",
    blocks: [
      {
        id: "c10-l5-b1",
        type: "heading",
        content: "“We cannot stop the work now”",
      },
      {
        id: "c10-l5-b2",
        type: "text",
        content: "A maintenance contractor is replacing equipment near an external drainage area.\n\nThe work involves:\n- Oil from the old equipment.\n- Cleaning chemicals.\n- Damaged absorbent materials.\n- Temporary waste containers.\n\nBefore the work begins, you notice:\n- The contractor has not completed the site environmental induction.\n- One temporary container has no label.\n- The spill-response equipment listed in the work plan is not present.\n- The supervisor says the work must continue because the equipment is urgently needed.\n\nWhat should you do?",
      },
      {
        id: "c10-l5-b3",
        type: "scenario",
        scenarioText: "What is the most responsible action?",
        options: [
          {
            id: "opt-1",
            text: "Allow the work because operational urgency is more important.",
            isCorrect: false,
            feedback: "Urgency does not automatically remove environmental controls. Missing controls should be assessed by the authorised responsible person before work proceeds. Consequence: A leak, spill or improper disposal may occur without the agreed controls or trained response.",
          },
          {
            id: "opt-2",
            text: "Complete the contractor’s induction record yourself and add the missing signatures.",
            isCorrect: false,
            feedback: "A record must show what actually occurred. Creating false evidence does not correct the missing induction. Consequence: The company may appear compliant while the contractor remains unaware of the site requirements.",
          },
          {
            id: "opt-3",
            text: "Raise the missing controls immediately, request that the relevant part of the work pauses where safe and refer the decision to the authorised supervisor or environmental contact.",
            isCorrect: true,
            feedback: "Correct. This allows the responsible person to assess the urgency, establish suitable controls and authorise the work appropriately. Consequence: The work may continue after the missing controls are resolved or an approved alternative is established.",
          },
          {
            id: "opt-4",
            text: "Post photographs publicly to prove that the company is not compliant.",
            isCorrect: false,
            feedback: "Concerns should first be handled through approved reporting or escalation channels. Public disclosure may expose confidential information and does not establish the required controls. Consequence: The environmental risk may remain unresolved while additional confidentiality and employment issues are created.",
          },
        ]
      },
      {
        id: "c10-l5-b4",
        type: "heading",
        content: "Model responsible response",
      },
      {
        id: "c10-l5-b5",
        type: "text",
        content: "> “The planned controls are not currently in place. The contractor has not completed the required site induction, the waste container is not identified and the listed spill equipment is unavailable. The responsible supervisor should review these points before the relevant work proceeds.”",
      },
      {
        id: "c10-l5-b6",
        type: "reflection",
        prompt: "Which environmental control in your own workplace would create the greatest risk if it were skipped? (e.g. Waste-handling check, Equipment inspection, Contractor induction, Chemical-storage check, Spill-kit inspection, Drain or wastewater check, Complaint escalation)",
      },
      {
        id: "c10-l5-b7",
        type: "callout",
        content: "**Key takeaway:** Operational pressure should be managed through authorised decisions, not by ignoring or falsifying environmental controls.",
      }
    ],
  },
  {
    order: 5,
    title: "Respond, Record and Improve",
    minutes: 4,
    content: "Consolidate the course, deliver the scored assessment and record a practical commitment.",
    blocks: [
      {
        id: "c10-l6-b1",
        type: "heading",
        content: "Your role in environmental compliance",
      },
      {
        id: "c10-l6-b2",
        type: "text",
        content: "Employees support environmental compliance when they:\n1. Recognise unusual or unsafe environmental situations.\n2. Pause or avoid an activity where this is safe and within their authority.\n3. Contact the correct person promptly.\n4. Follow approved procedures.\n5. Keep honest records.\n6. Cooperate professionally with reviews and inspections.\n7. Avoid guessing, concealing or altering information.\n8. Learn from incidents and corrective actions.",
      },
      {
        id: "c10-l6-b3",
        type: "heading",
        content: "Simple response model",
      },
      {
        id: "c10-l6-b4",
        type: "text",
        content: "**1. Notice**\nRecognise the warning sign.\n\n**2. Protect**\nAvoid making the situation worse. Keep people away where safe and authorised.\n\n**3. Report**\nContact the designated supervisor or responsible person promptly.\n\n**4. Record**\nProvide accurate information about what was observed and when.\n\n**5. Improve**\nSupport the corrective action and any updated procedure or training.\n\n*Emergency response must always follow the organisation’s approved procedure. Employees should not handle unknown or hazardous substances unless they are trained and authorised.*",
      },
      {
        id: "c10-l6-b5",
        type: "commitment",
        options: [
          "I will report an environmental concern promptly rather than assuming someone else will do it.",
          "I will complete environmental records only from actual observations.",
          "I will find out who the environmental or compliance contact is in my organisation.",
          "I will check the relevant procedure before starting an unfamiliar task.",
          "I will raise missing contractor controls before work begins.",
          "Other"
        ]
      }
    ],
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Content
// ─────────────────────────────────────────────────────────────────────────────
const NEW_QUESTIONS = [
  {
    question: "What does environmental compliance mean in everyday workplace practice?",
    options: [
      { text: "Memorising every environmental law", isCorrect: false, feedback: "Employees do not need to memorise every law. They should understand and follow the controls relevant to their role." },
      { text: "Following the environmental requirements, approvals and procedures that apply to the organisation", isCorrect: true, feedback: "Correct. Compliance combines applicable requirements with practical procedures, responsibilities and records." },
      { text: "Recycling all materials whether or not a collection route exists", isCorrect: false, feedback: "Waste should follow approved arrangements. Good intentions do not replace correct handling." },
      { text: "Allowing only managers to report environmental concerns", isCorrect: false, feedback: "Employees at every level may need to report concerns through the correct process." }
    ],
    correctExplanation: "Environmental compliance means meeting applicable requirements through appropriate workplace actions, controls and evidence.",
    incorrectExplanation: "Compliance is not limited to memorising legislation or assigning all responsibility to managers.",
    practicalTakeaway: "Know the procedures and reporting responsibilities connected with your role.",
  },
  {
    question: "You find an unlabelled leaking container beside a drain. What should you do first?",
    options: [
      { text: "Smell the liquid to identify it", isCorrect: false, feedback: "Smelling an unknown substance may expose you to harm." },
      { text: "Pour it into another container", isCorrect: false, feedback: "An untrained person should not transfer an unknown substance." },
      { text: "Keep away, prevent access where safe and contact the trained responsible person", isCorrect: true, feedback: "Correct. Avoid contact and activate the approved response process." },
      { text: "Wash the liquid into the drain", isCorrect: false, feedback: "Washing the liquid away may spread pollution and increase the impact." }
    ],
    correctExplanation: "Unknown substances should be handled only by trained and authorised people using the approved procedure.",
    incorrectExplanation: "Do not investigate or clean an unknown substance by improvising.",
    practicalTakeaway: "Protect yourself first, then report promptly.",
  },
  {
    question: "A contractor says a one-day job does not require the company’s environmental induction. What is the best response?",
    options: [
      { text: "Allow the work because it is temporary", isCorrect: false, feedback: "Short duration does not automatically remove site controls." },
      { text: "Confirm the company and site requirements before work starts", isCorrect: true, feedback: "Correct. The applicable company, site and approval requirements should be confirmed before work begins." },
      { text: "Ask the contractor to sign the record without attending", isCorrect: false, feedback: "A signature must not be used to create false evidence of an induction." },
      { text: "Ignore the issue because contractors are legally responsible for themselves", isCorrect: false, feedback: "The company may still have responsibilities for contractor activities on its site." }
    ],
    correctExplanation: "Contractor controls should be confirmed before work begins, regardless of whether the task is short.",
    incorrectExplanation: "Do not assume that temporary work is exempt from site requirements.",
    practicalTakeaway: "Verify controls before authorising unfamiliar or higher-risk work.",
  },
  {
    question: "Why are environmental records important?",
    options: [
      { text: "They make the company appear perfect", isCorrect: false, feedback: "Records should reflect reality, including missed controls and problems." },
      { text: "They provide evidence of actions, inspections, incidents and corrective measures", isCorrect: true, feedback: "Correct. Reliable records support monitoring, investigation and evidence." },
      { text: "They remove the need for supervision", isCorrect: false, feedback: "Records support supervision but do not replace it." },
      { text: "They are useful only when a regulator visits", isCorrect: false, feedback: "Records are also useful for daily management, improvement and internal review." }
    ],
    correctExplanation: "Accurate records help the organisation understand what occurred and demonstrate how responsibilities were managed.",
    incorrectExplanation: "Records are not created merely for appearance or external inspections.",
    practicalTakeaway: "Complete records honestly and at the appropriate time.",
  },
  {
    question: "An inspection was missed last week. What is the most responsible action?",
    options: [
      { text: "Backdate the inspection after checking the area today", isCorrect: false, feedback: "A backdated checklist would falsely state that the inspection occurred last week." },
      { text: "Copy the previous inspection record", isCorrect: false, feedback: "A copied record does not reflect an actual inspection." },
      { text: "Record today’s actual inspection and report that the earlier check was missed", isCorrect: true, feedback: "Correct. Record the current facts and use the corrective process for the missed control." },
      { text: "Delete the inspection requirement from the checklist", isCorrect: false, feedback: "Employees must not remove an approved control without authorisation." }
    ],
    correctExplanation: "Honest documentation allows the company to address both the current condition and the missed inspection.",
    incorrectExplanation: "Never create or alter a record to hide a missed task.",
    practicalTakeaway: "An accurate record of a failure is better than false evidence of success.",
  },
  {
    question: "A colleague asks whether a planned project definitely needs an environmental licence. You are not responsible for approvals. What should you do?",
    options: [
      { text: "Confirm that no licence is needed because the project appears small", isCorrect: false, feedback: "The need for an approval cannot be determined only from the project’s apparent size." },
      { text: "Search social media and make the decision", isCorrect: false, feedback: "Unverified online information should not be used to make a legal or technical decision." },
      { text: "Refer the question to the authorised person who can verify the current requirements", isCorrect: true, feedback: "Correct. Approval questions should be handled by an authorised and suitably informed person." },
      { text: "Wait until construction starts and see whether anyone objects", isCorrect: false, feedback: "Requirements should be considered before work begins." }
    ],
    correctExplanation: "Employees should recognise the limit of their authority and escalate approval questions appropriately.",
    incorrectExplanation: "Do not guess whether a legal approval applies.",
    practicalTakeaway: "Knowing when to seek qualified advice is part of compliance.",
  },
  {
    question: "During an inspection or compliance review, what should an employee do?",
    options: [
      { text: "Guess an answer so the company appears organised", isCorrect: false, feedback: "A guessed answer may be inaccurate or misleading." },
      { text: "Hide records that show a problem", isCorrect: false, feedback: "Records must not be concealed or altered." },
      { text: "Follow the company process, provide truthful information within their role and refer other questions appropriately", isCorrect: true, feedback: "Correct. Employees should cooperate professionally while remaining within their authority." },
      { text: "Admit legal liability on behalf of the organisation", isCorrect: false, feedback: "Employees should not make unauthorised legal admissions." }
    ],
    correctExplanation: "Truthful cooperation and appropriate referral protect the integrity of the inspection process.",
    incorrectExplanation: "Do not guess, conceal information or speak beyond your authority.",
    practicalTakeaway: "Be accurate, professional and clear about the limits of your role.",
  },
  {
    question: "Urgent maintenance work is ready to begin, but required spill controls and contractor induction are missing. What is the best response?",
    options: [
      { text: "Continue because the equipment is urgently needed", isCorrect: false, feedback: "Urgency should be managed through an authorised decision, not by ignoring controls." },
      { text: "Create the missing records after the work", isCorrect: false, feedback: "Records created after the event would not prove that the controls were in place." },
      { text: "Raise the missing controls and refer the decision to the authorised responsible person before the relevant work proceeds", isCorrect: true, feedback: "Correct. The responsible person can assess the urgency and establish appropriate controls." },
      { text: "Allow the work but avoid recording it", isCorrect: false, feedback: "Avoiding a record does not remove the risk or responsibility." }
    ],
    correctExplanation: "Missing environmental controls should be resolved or formally assessed before the affected activity continues.",
    incorrectExplanation: "Operational pressure does not justify false records or uncontrolled work.",
    practicalTakeaway: "Escalate urgent conflicts rather than making an unauthorised exception.",
  }
];

export async function ensureEnvironmentalComplianceCourse() {
  logger.info(`Checking and executing ${COURSE_TITLE} course content migration...`);

  try {
    await db.transaction(async (tx) => {
      // 1. Ensure Course Exists
      let existingCourse = await tx.query.coursesTable.findFirst({
        where: eq(coursesTable.slug, COURSE_SLUG),
      });

      // We only fallback to ID match if it's the exact same course
      if (!existingCourse) {
        const byId = await tx.query.coursesTable.findFirst({
          where: eq(coursesTable.id, COURSE_ID),
        });
        if (byId && byId.slug === COURSE_SLUG) {
          existingCourse = byId;
        } else if (byId && byId.slug.includes('environmental')) {
          existingCourse = byId;
        }
      }

      let actualCourseId = existingCourse ? existingCourse.id : COURSE_ID;

      // 2. Ensure the Badge Definition exists
      const existingBadge = await tx.query.badgeDefinitionsTable.findFirst({
        where: eq(badgeDefinitionsTable.slug, BADGE_SLUG),
      });
      if (!existingBadge) {
        // If a skeleton badge exists under the old slug, we'll delete it to replace with proper
        const skeletonBadge = await tx.query.badgeDefinitionsTable.findFirst({
            where: eq(badgeDefinitionsTable.slug, SKELETON_BADGE_SLUG),
        });
        if (skeletonBadge) {
            await tx.delete(badgeDefinitionsTable).where(eq(badgeDefinitionsTable.slug, SKELETON_BADGE_SLUG));
        }

        await tx.insert(badgeDefinitionsTable).values({
          slug: BADGE_SLUG,
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
          icon: "award",
          criteriaType: "all_courses",
          threshold: 0,
          courseIds: [actualCourseId],
          orderIndex: 14,
        });
      } else {
        // Update badge descriptions without overwriting user state
        await tx.update(badgeDefinitionsTable).set({
          name: COURSE_META.badgeName,
          description: COURSE_META.badgeDescription,
        }).where(eq(badgeDefinitionsTable.slug, BADGE_SLUG));
      }

      const badgeRecord = await tx.query.badgeDefinitionsTable.findFirst({
        where: eq(badgeDefinitionsTable.slug, BADGE_SLUG),
      });

      if (!badgeRecord) {
        throw new Error(`Failed to create or retrieve badge ${BADGE_SLUG}`);
      }

      if (!existingCourse) {
        // Safe insert relying on auto-increment if the hardcoded ID is taken by another course
        const [inserted] = await tx.insert(coursesTable).values({
          slug: COURSE_SLUG,
          title: COURSE_TITLE,
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
          recommendedNextCourseId: COURSE_META.recommendedNextCourseId,
          status: "published", 
          isPublished: true,
        }).returning();
        
        actualCourseId = inserted.id;
        
        // We must update the badge since we didn't know the generated ID before
        await tx.update(badgeDefinitionsTable).set({
            courseIds: [actualCourseId]
        }).where(eq(badgeDefinitionsTable.slug, BADGE_SLUG));
      } else {
        // Only update metadata; preserve user/admin edits to core fields if possible,
        // but since this is an official deployment, we overwrite meta to ensure correctness.
        await tx
          .update(coursesTable)
          .set({
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
            learningObjectives: COURSE_META.learningObjectives,
            includesCertificate: COURSE_META.includesCertificate,
            passingScore: COURSE_META.passingScore,
            completionMessage: COURSE_META.completionMessage,
            recommendedNextCourseId: COURSE_META.recommendedNextCourseId,
            status: "published",
            isPublished: true,
          })
          .where(eq(coursesTable.id, actualCourseId));
      }

      // 3. Seed Lessons - with strict preservation logic
      const existingLessons = await tx.query.lessonsTable.findMany({
        where: eq(lessonsTable.courseId, actualCourseId),
      });

      const hasOnlySkeletonLessons =
        existingLessons.length > 0 &&
        existingLessons.every(
          (l) => l.content && l.content.includes("[DRAFT SKELETON]"),
        );

      if (existingLessons.length === 0 || hasOnlySkeletonLessons) {
        if (hasOnlySkeletonLessons) {
          await tx.delete(lessonsTable).where(eq(lessonsTable.courseId, actualCourseId));
        }

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
        logger.info(`[Seed] Lessons for ${COURSE_TITLE} already exist and are not skeletons. Preserving manual administrator edits.`);
      }

      // 4. Seed Quiz Questions - with strict preservation logic
      const existingQuestions = await tx.query.quizQuestionsTable.findMany({
        where: eq(quizQuestionsTable.courseId, actualCourseId),
      });

      const hasOnlySkeletonQuestions =
        existingQuestions.length > 0 &&
        existingQuestions.every(
          (q) => q.question && q.question.includes("[DRAFT SKELETON]"),
        );

      // Verify attempts before deleting
      const existingAttempts = await tx.query.quizAttemptsTable.findFirst({
        where: eq(quizAttemptsTable.courseId, actualCourseId),
      });

      if ((existingQuestions.length === 0 || hasOnlySkeletonQuestions) && !existingAttempts) {
        if (hasOnlySkeletonQuestions) {
          await tx.delete(quizQuestionsTable).where(eq(quizQuestionsTable.courseId, actualCourseId));
        }

        for (const [index, q] of NEW_QUESTIONS.entries()) {
          const correctOptionIndex = q.options.findIndex((opt) => opt.isCorrect);

          if (correctOptionIndex === -1) {
            throw new Error(`Question "${q.question}" has no correct option defined.`);
          }

          await tx.insert(quizQuestionsTable).values({
            courseId: actualCourseId,
            question: q.question,
            options: q.options.map(o => o.text),
            optionFeedback: q.options.map(o => o.feedback),
            correctOption: correctOptionIndex,
            correctExplanation: q.correctExplanation,
            incorrectExplanation: q.incorrectExplanation,
            practicalTakeaway: q.practicalTakeaway,
            orderIndex: index,
          });
        }
      } else {
        logger.info(`[Seed] Quiz questions for ${COURSE_TITLE} already exist and are not skeletons. Preserving quiz history and admin edits.`);
      }

      // Mark the seed as run in the system seeds table to prevent repeated execution logic
      // although our logic above is already idempotent and safe.
      const seedRecord = await tx.query.systemSeedsTable.findFirst({
        where: eq(systemSeedsTable.name, SEED_NAME),
      });

      if (!seedRecord) {
         await tx.insert(systemSeedsTable).values({ name: SEED_NAME, runAt: new Date() });
      }
    });

    logger.info(`${COURSE_TITLE} course content and quiz safely migrated and published.`);
  } catch (error) {
    logger.error({ err: error }, `Failed to seed ${COURSE_TITLE} course content`);
    throw error;
  }
}
