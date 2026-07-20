import { db, challengesTable, coursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export async function ensureChallenges(): Promise<void> {
  try {
    // 1. Fetch existing courses to resolve linkedCourseId dynamically
    const courses = await db.select({ id: coursesTable.id, slug: coursesTable.slug }).from(coursesTable);
    const courseMap = new Map(courses.map((c) => [c.slug, c.id]));

    // 2. Define the 10 canonical challenges
    const canonicalChallenges: any[] = [
      {
        code: "ELH-CH-01",
        slug: "five-day-energy-switch-off",
        title: "Five-Day Energy Switch-Off",
        summary: "Build a routine of switching off equipment and lighting when they are no longer needed.",
        description: "Build a routine of switching off equipment and lighting when they are no longer needed.",
        category: "Energy",
        linkedCourseSlug: "energy-efficiency-at-work",
        durationLabel: "Five working days",
        points: 10,
        icon: "zap",
        theme: "amber",
        focus: "Reduce idle energy consumption",
        unit: "days",
        goalTarget: 5,
        instructions: "For five working days, check your immediate work area before leaving or when equipment is no longer required.\n\nLook for:\n* Unnecessary lighting\n* Air conditioning running in unused spaces\n* Computers or screens left active\n* Chargers or equipment left switched on\n* Doors or windows affecting air-conditioning efficiency\n\nOnly switch off equipment when it is safe and within your responsibility.",
        evidencePrompt: "Describe the routine you followed, one unnecessary energy use you noticed and what action you took.",
        startDate: new Date("2025-01-01T00:00:00Z"),
        endDate: new Date("2030-01-01T00:00:00Z"),
        orderIndex: 1,
      },
      {
        code: "ELH-CH-02",
        slug: "waste-sorting-spot-check",
        title: "Waste Sorting Spot Check",
        summary: "Review one shared disposal area and identify a practical sorting improvement.",
        description: "Review one shared disposal area and identify a practical sorting improvement.",
        category: "Waste",
        linkedCourseSlug: "waste-sorting-the-mauritian-bin-system",
        durationLabel: "One workplace check",
        points: 10,
        icon: "recycle",
        theme: "green",
        focus: "Improve waste segregation",
        unit: "checks",
        goalTarget: 1,
        instructions: "Inspect one workplace bin, recycling point or shared waste area.\n\nCheck whether:\n* Waste is being placed in the correct stream\n* Labels are visible and understandable\n* Recyclables are heavily contaminated\n* A bin is missing where it is needed\n* Employees appear uncertain about sorting\n\nCorrect the issue where authorised or report it to the appropriate colleague.",
        evidencePrompt: "What did you observe, what action did you take and how could the waste area be improved?",
        startDate: new Date("2025-01-01T00:00:00Z"),
        endDate: new Date("2030-01-01T00:00:00Z"),
        orderIndex: 2,
      },
      {
        code: "ELH-CH-03",
        slug: "water-saving-action",
        title: "Water-Saving Action",
        summary: "Identify and address one avoidable source of water waste.",
        description: "Identify and address one avoidable source of water waste.",
        category: "Water",
        linkedCourseSlug: "water-conservation",
        durationLabel: "One to five working days",
        points: 10,
        icon: "droplets",
        theme: "blue",
        focus: "Identify and fix water leaks",
        unit: "actions",
        goalTarget: 1,
        instructions: "Look for a practical water-saving opportunity in your workplace.\n\nExamples include:\n* A leaking tap\n* A toilet that continues running\n* Excessive hose use\n* Unnecessary water use during cleaning\n* Irrigation occurring at an unsuitable time\n* Water being left running during a task\n\nResolve the issue only when it is safe and within your role. Otherwise, report it through the appropriate workplace channel.",
        evidencePrompt: "Describe the water-wasting practice, how you responded and what result or follow-up is expected.",
        startDate: new Date("2025-01-01T00:00:00Z"),
        endDate: new Date("2030-01-01T00:00:00Z"),
        orderIndex: 3,
      },
      {
        code: "ELH-CH-04",
        slug: "paper-light-workweek",
        title: "Paper-Light Workweek",
        summary: "Reduce unnecessary printing during one working week.",
        description: "Reduce unnecessary printing during one working week.",
        category: "Green Office",
        linkedCourseSlug: "green-office-practices",
        durationLabel: "Five working days",
        points: 10,
        icon: "trash-2",
        theme: "cyan",
        focus: "Go paperless in meetings",
        unit: "days",
        goalTarget: 5,
        instructions: "For five working days, review your printing decisions before using paper.\n\nPossible actions include:\n* Sharing a digital document\n* Reviewing a document on screen\n* Printing double-sided\n* Printing only the required pages\n* Reusing suitable single-sided paper for internal notes\n* Avoiding duplicate copies\n\nPrinting required for legal, operational or accessibility reasons should continue.",
        evidencePrompt: "Describe one task you completed with less paper and how the alternative worked.",
        startDate: new Date("2025-01-01T00:00:00Z"),
        endDate: new Date("2030-01-01T00:00:00Z"),
        orderIndex: 4,
      },
      {
        code: "ELH-CH-05",
        slug: "replace-one-single-use-item",
        title: "Replace One Single-Use Item",
        summary: "Avoid or replace one unnecessary single-use item used regularly at work.",
        description: "Avoid or replace one unnecessary single-use item used regularly at work.",
        category: "Waste Prevention",
        linkedCourseSlug: "circular-economy",
        durationLabel: "Five working days",
        points: 10,
        icon: "target",
        theme: "green",
        focus: "Avoid disposable containers",
        unit: "days",
        goalTarget: 5,
        instructions: "Choose one suitable single-use item and use a practical reusable alternative for five working days.\n\nExamples may include:\n* Disposable cups\n* Plastic water bottles\n* Disposable cutlery\n* Unnecessary plastic folders\n* Individually packaged workplace supplies\n\nDo not replace items required for hygiene, medical, food-safety or operational reasons without approval.",
        evidencePrompt: "Which item did you reduce, what alternative did you use and was the change practical?",
        startDate: new Date("2025-01-01T00:00:00Z"),
        endDate: new Date("2030-01-01T00:00:00Z"),
        orderIndex: 5,
      },
      {
        code: "ELH-CH-06",
        slug: "reuse-before-replacing",
        title: "Reuse Before Replacing",
        summary: "Find one safe opportunity to reuse, repair or reallocate an item before purchasing a replacement.",
        description: "Find one safe opportunity to reuse, repair or reallocate an item before purchasing a replacement.",
        category: "Circular Economy",
        linkedCourseSlug: "circular-economy",
        durationLabel: "One workplace action",
        points: 10,
        icon: "recycle",
        theme: "green",
        focus: "Repurpose packaging material",
        unit: "actions",
        goalTarget: 1,
        instructions: "Identify an item that may still have useful value.\n\nPossible actions include:\n* Reallocating unused office supplies\n* Repairing suitable equipment\n* Reusing storage materials\n* Returning reusable packaging\n* Offering an item to another department\n* Repurposing appropriate materials\n\nDo not reuse damaged, unsafe, unhygienic or non-compliant items.",
        evidencePrompt: "What item did you identify, what was done with it and what purchase or waste may have been avoided?",
        startDate: new Date("2025-01-01T00:00:00Z"),
        endDate: new Date("2030-01-01T00:00:00Z"),
        orderIndex: 6,
      },
      {
        code: "ELH-CH-07",
        slug: "responsible-purchase-check",
        title: "Responsible Purchase Check",
        summary: "Apply a simple sustainability check to one real or upcoming workplace purchase.",
        description: "Apply a simple sustainability check to one real or upcoming workplace purchase.",
        category: "Procurement",
        linkedCourseSlug: "sustainable-procurement",
        durationLabel: "One purchasing decision",
        points: 10,
        icon: "target",
        theme: "amber",
        focus: "Evaluate supplier packaging",
        unit: "checks",
        goalTarget: 1,
        instructions: "Before requesting or approving a suitable purchase, consider:\n* Is the purchase genuinely needed?\n* Can an existing item be reused or repaired?\n* Is the product durable?\n* Is excessive packaging involved?\n* Is a local or lower-impact option available?\n* Can the supplier provide useful environmental information?\n* What will happen to the product at the end of its useful life?\n\nEmployees without purchasing authority may apply the check to a suggested or hypothetical departmental purchase.",
        evidencePrompt: "Which purchase did you review, which questions influenced your thinking and what decision or recommendation resulted?",
        startDate: new Date("2025-01-01T00:00:00Z"),
        endDate: new Date("2030-01-01T00:00:00Z"),
        orderIndex: 7,
      },
      {
        code: "ELH-CH-08",
        slug: "smarter-travel-choice",
        title: "Smarter Travel Choice",
        summary: "Make one practical choice that reduces avoidable workplace travel.",
        description: "Make one practical choice that reduces avoidable workplace travel.",
        category: "Carbon Awareness",
        linkedCourseSlug: "carbon-footprint-awareness",
        durationLabel: "One working day or one business activity",
        points: 10,
        icon: "zap",
        theme: "blue",
        focus: "Avoid solo car commute",
        unit: "trips",
        goalTarget: 1,
        instructions: "Choose an option appropriate to your role, location and personal circumstances.\n\nExamples include:\n* Carpooling where practical\n* Combining several errands into one trip\n* Holding a remote meeting instead of an unnecessary journey\n* Planning a more efficient route\n* Walking a short safe distance\n* Using shared transport where available and suitable\n\nThis challenge must not pressure employees to choose an unsafe, inaccessible or impractical travel option.",
        evidencePrompt: "What travel decision did you change, why was it suitable and what did you learn from it?",
        startDate: new Date("2025-01-01T00:00:00Z"),
        endDate: new Date("2030-01-01T00:00:00Z"),
        orderIndex: 8,
      },
      {
        code: "ELH-CH-09",
        slug: "biodiversity-friendly-workplace-check",
        title: "Biodiversity-Friendly Workplace Check",
        summary: "Identify one workplace activity that may affect plants, wildlife, waterways or coastal environments.",
        description: "Identify one workplace activity that may affect plants, wildlife, waterways or coastal environments.",
        category: "Biodiversity",
        linkedCourseSlug: "biodiversity-in-mauritius",
        durationLabel: "One workplace observation",
        points: 10,
        icon: "droplets",
        theme: "green",
        focus: "Reduce site runoff risks",
        unit: "checks",
        goalTarget: 1,
        instructions: "Observe an appropriate area connected to the workplace.\n\nExamples include:\n* Outdoor lighting\n* Waste near drains or waterways\n* Disturbance of vegetation\n* Chemical or cleaning-product storage\n* Litter near a beach, river or green space\n* Activities that may disturb birds or other wildlife\n* Invasive plant management concerns\n\nDo not handle wildlife or enter unsafe or restricted areas.",
        evidencePrompt: "What did you observe, what possible environmental impact did you identify and what improvement did you recommend?",
        startDate: new Date("2025-01-01T00:00:00Z"),
        endDate: new Date("2030-01-01T00:00:00Z"),
        orderIndex: 9,
      },
      {
        code: "ELH-CH-10",
        slug: "team-sustainability-micro-action",
        title: "Team Sustainability Micro-Action",
        summary: "Work with at least one colleague to implement a small sustainability improvement.",
        description: "Work with at least one colleague to implement a small sustainability improvement.",
        category: "Workplace Culture",
        linkedCourseSlug: "sustainability-foundations",
        durationLabel: "Up to two working weeks",
        points: 10,
        icon: "target",
        theme: "green",
        focus: "Improve waste bin signs",
        unit: "actions",
        goalTarget: 1,
        instructions: "Choose one realistic workplace improvement that does not require a major budget or policy change.\n\nExamples include:\n* Improving a waste label\n* Creating a switch-off reminder\n* Organising reusable supplies\n* Improving a shared recycling point\n* Reducing unnecessary printing\n* Reporting and following up on a leak\n* Sharing a practical sustainability tip with the team\n\nThe action should be respectful, voluntary and appropriate to the workplace.",
        evidencePrompt: "What improvement did you make, who was involved and what changed as a result?",
        startDate: new Date("2025-01-01T00:00:00Z"),
        endDate: new Date("2030-01-01T00:00:00Z"),
        orderIndex: 10,
      },
    ];

    // 3. Upsert each challenge based on unique 'code' (not overwriting participant progress)
    for (const challenge of canonicalChallenges) {
      const linkedCourseId = courseMap.get(challenge.linkedCourseSlug) || null;
      
      const values = {
        slug: challenge.slug,
        title: challenge.title,
        summary: challenge.summary,
        description: challenge.description,
        icon: challenge.icon,
        theme: challenge.theme,
        focus: challenge.focus,
        unit: challenge.unit,
        goalTarget: challenge.goalTarget,
        points: challenge.points,
        badgeName: challenge.badgeName || null,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        orderIndex: challenge.orderIndex,
        category: challenge.category,
        linkedCourseId,
        durationLabel: challenge.durationLabel,
        instructions: challenge.instructions,
        evidencePrompt: challenge.evidencePrompt,
        isActive: true,
      };

      // Check if challenge exists by code
      const [existing] = await db
        .select()
        .from(challengesTable)
        .where(eq(challengesTable.code, challenge.code))
        .limit(1);

      if (existing) {
        // Safe update
        await db
          .update(challengesTable)
          .set(values)
          .where(eq(challengesTable.id, existing.id));
      } else {
        // Insert new
        await db
          .insert(challengesTable)
          .values({
            code: challenge.code,
            ...values,
          });
      }
    }

    logger.info("Idempotently seeded canonical challenges successfully.");
  } catch (err) {
    logger.error({ err }, "Failed to execute challenges seeder");
    throw err;
  }
}
