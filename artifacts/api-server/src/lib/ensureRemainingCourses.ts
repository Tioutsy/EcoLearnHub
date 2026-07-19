import { db, coursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const REMAINING_COURSES = [
  {
    title: "Energy Efficiency at Work",
    slug: "energy-efficiency-at-work",
    description: "Learn practical ways to reduce energy consumption and save electricity in your everyday workplace tasks.",
    fullDescription: "This course covers simple habits and systems that can lower carbon footprint and costs through office and factory energy efficiency, specifically tailored to Mauritian grid realities.",
  },
  {
    title: "Water Conservation",
    slug: "water-conservation",
    description: "Understand Mauritian water constraints and discover practical techniques for conserving water at work and home.",
    fullDescription: "Focuses on the island's unique water challenges, water-saving habits, reporting leaks, and optimizing commercial/industrial water usage.",
  },
  {
    title: "Sustainable Procurement",
    slug: "sustainable-procurement",
    description: "Learn how to choose eco-friendly suppliers, evaluate product life cycles, and make green buying choices.",
    fullDescription: "Designed for procurement officers and managers to align purchasing decisions with circular economy and environmental guidelines.",
  },
  {
    title: "Green Office Practices",
    slug: "green-office-practices",
    description: "A simple guide to reducing paper use, managing waste, and designing a low-impact daily office routine.",
    fullDescription: "Covers recycling, digital transformations, low-waste office events, and building a green community culture in professional settings.",
  },
  {
    title: "Carbon Footprint Awareness",
    slug: "carbon-footprint-awareness",
    description: "Gain a clear understanding of greenhouse gas emissions, scope definitions, and how individuals impact the climate.",
    fullDescription: "Explains scope 1, 2, and 3 emissions, calculations, offsets, and concrete reduction initiatives for Mauritian businesses.",
  },
  {
    title: "Biodiversity in Mauritius",
    slug: "biodiversity-in-mauritius",
    description: "Explore the unique flora and fauna of Mauritius, the threats they face, and how businesses can protect local ecosystems.",
    fullDescription: "Focuses on endemic species, marine conservation, habitat restoration, and Corporate Social Responsibility (CSR) biodiversity mapping.",
  },
  {
    title: "ESG Basics",
    slug: "esg-basics",
    description: "An introduction to Environmental, Social, and Governance (ESG) frameworks and why they matter for modern businesses.",
    fullDescription: "Explains how companies report on climate impact, employee welfare, corporate governance, and ethical supply chains.",
  },
  {
    title: "Environmental Compliance",
    slug: "environmental-compliance",
    description: "Learn about the legal environmental frameworks, licenses, and reporting requirements in Mauritius.",
    fullDescription: "Details EIA licenses, environmental laws, waste disposal policies, and standard compliance audits for Mauritian firms.",
  },
  {
    title: "Circular Economy",
    slug: "circular-economy",
    description: "Discover how to design out waste, keep products in use, and transition from linear to circular systems.",
    fullDescription: "Covers the 3 core principles of the circular economy, industrial symbiosis, and local Mauritian upcycling models.",
  },
  {
    title: "Final Sustainability Certification",
    slug: "final-sustainability-certification",
    description: "The capstone assessment and review to earn your global EcoLearn sustainability certification.",
    fullDescription: "A comprehensive assessment testing all preceding modules and validating your personal workplace commitments.",
  },
];

export async function ensureRemainingCourses(): Promise<void> {
  try {
    for (const course of REMAINING_COURSES) {
      const [existing] = await db
        .select({ id: coursesTable.id })
        .from(coursesTable)
        .where(eq(coursesTable.slug, course.slug))
        .limit(1);

      if (!existing) {
        await db.insert(coursesTable).values({
          title: course.title,
          slug: course.slug,
          description: course.description,
          fullDescription: course.fullDescription,
          categoryId: 1,
          durationMinutes: 30,
          priceUsd: "1400.00",
          level: "beginner",
          isFeatured: false,
          isPublished: false, // Default to draft/not publicly visible to learners
          status: "draft",
          learningObjectives: [
            "Recognize foundational concepts for this topic",
            "Identify key behaviors and decisions",
            "Apply practical strategies at work",
          ],
        });
        logger.info({ slug: course.slug }, `Seeded remaining course: ${course.title}`);
      }
    }
  } catch (err) {
    logger.error({ err }, "Error seeding remaining courses");
  }
}
