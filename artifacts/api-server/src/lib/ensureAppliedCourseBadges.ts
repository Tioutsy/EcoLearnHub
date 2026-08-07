import {
  db,
  coursesTable,
  badgeDefinitionsTable,
} from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { logger } from "./logger";

export interface CourseBadgeMetadata {
  courseCode: string;
  slug: string;
  badgeSlug: string;
  badgeName: string;
  badgeDescription: string;
}

export const APPLIED_COURSE_BADGES: CourseBadgeMetadata[] = [
  {
    courseCode: "ELH-13",
    slug: "sustainability-action-planning",
    badgeSlug: "sustainability-action-planner",
    badgeName: "Sustainability Action Planner",
    badgeDescription: "Awarded for demonstrating the ability to turn a workplace sustainability issue into a practical and measurable action plan.",
  },
  {
    courseCode: "ELH-14",
    slug: "setting-departmental-sustainability-goals",
    badgeSlug: "departmental-goal-setter",
    badgeName: "Departmental Goal Setter",
    badgeDescription: "Awarded for establishing clear, actionable departmental sustainability goals aligned with organizational objectives.",
  },
  {
    courseCode: "ELH-15",
    slug: "building-workplace-sustainability-team",
    badgeSlug: "sustainability-team-leader",
    badgeName: "Sustainability Team Leader",
    badgeDescription: "Awarded for building and organizing an effective workplace sustainability team with clear roles and cross-departmental representation.",
  },
  {
    courseCode: "ELH-16",
    slug: "communicating-sustainability-at-work",
    badgeSlug: "sustainability-communicator",
    badgeName: "Sustainability Communicator",
    badgeDescription: "Awarded for crafting clear, transparent, and engaging workplace sustainability communications.",
  },
  {
    courseCode: "ELH-17",
    slug: "tracking-sustainability-actions-and-progress",
    badgeSlug: "action-progress-tracker",
    badgeName: "Action & Progress Tracker",
    badgeDescription: "Awarded for tracking sustainability initiatives, maintaining evidence, and reporting progress accurately.",
  },
  {
    courseCode: "ELH-18",
    slug: "sustainability-data-collection-and-evidence",
    badgeSlug: "sustainability-data-guardian",
    badgeName: "Sustainability Data Guardian",
    badgeDescription: "Awarded for establishing structured data collection methods and maintaining credible environmental evidence.",
  },
  {
    courseCode: "ELH-19",
    slug: "reviewing-sustainability-performance-and-taking-corrective-action",
    badgeSlug: "performance-review-specialist",
    badgeName: "Performance & Review Specialist",
    badgeDescription: "Awarded for conducting sustainability performance reviews and implementing corrective actions.",
  },
  {
    courseCode: "ELH-20",
    slug: "sustainability-roles-responsibilities-and-accountability",
    badgeSlug: "accountability-champion",
    badgeName: "Accountability Champion",
    badgeDescription: "Awarded for embedding sustainability responsibilities and accountability into daily job roles.",
  },
  {
    courseCode: "ELH-21",
    slug: "building-employee-engagement-in-sustainability",
    badgeSlug: "employee-engagement-champion",
    badgeName: "Employee Engagement Champion",
    badgeDescription: "Awarded for fostering active employee participation and driving sustainable cultural change at work.",
  },
  {
    courseCode: "ELH-22",
    slug: "creating-and-running-effective-green-teams",
    badgeSlug: "green-team-facilitator",
    badgeName: "Green Team Facilitator",
    badgeDescription: "Awarded for forming, facilitating, and sustaining high-impact employee green teams.",
  },
  {
    courseCode: "ELH-23",
    slug: "planning-and-delivering-workplace-sustainability-initiatives",
    badgeSlug: "initiative-delivery-leader",
    badgeName: "Initiative Delivery Leader",
    badgeDescription: "Awarded for planning, launching, and managing successful workplace sustainability projects.",
  },
  {
    courseCode: "ELH-24",
    slug: "sustainability-for-hr-teams",
    badgeSlug: "sustainable-hr-partner",
    badgeName: "Sustainable HR Partner",
    badgeDescription: "Awarded for integrating sustainability principles into recruitment, onboarding, training, and employee policies.",
  },
  {
    courseCode: "ELH-25",
    slug: "sustainability-for-finance-teams",
    badgeSlug: "sustainable-finance-analyst",
    badgeName: "Sustainable Finance Analyst",
    badgeDescription: "Awarded for applying ESG criteria, ROI calculations, and sustainable financial principles to business decisions.",
  },
  {
    courseCode: "ELH-26",
    slug: "sustainability-for-procurement-and-purchasing-teams",
    badgeSlug: "sustainable-procurement-specialist",
    badgeName: "Sustainable Procurement Specialist",
    badgeDescription: "Awarded for evaluating vendor ESG performance, life-cycle costs, and sustainable purchasing criteria.",
  },
  {
    courseCode: "ELH-27",
    slug: "sustainability-for-facilities-and-property-teams",
    badgeSlug: "facilities-sustainability-manager",
    badgeName: "Facilities Sustainability Manager",
    badgeDescription: "Awarded for optimizing building energy efficiency, water usage, and facility waste management.",
  },
  {
    courseCode: "ELH-28",
    slug: "sustainability-for-sales-and-marketing-teams",
    badgeSlug: "ethical-marketing-strategist",
    badgeName: "Ethical Marketing Strategist",
    badgeDescription: "Awarded for promoting green products and services with authentic, non-greenwashing communications.",
  },
  {
    courseCode: "ELH-29",
    slug: "sustainability-for-operations-and-frontline-teams",
    badgeSlug: "frontline-operations-specialist",
    badgeName: "Frontline Operations Specialist",
    badgeDescription: "Awarded for implementing daily sustainable operational procedures and resource reduction on the frontline.",
  },
  {
    courseCode: "ELH-30",
    slug: "climate-risk-and-workplace-resilience",
    badgeSlug: "workplace-climate-resilience",
    badgeName: "Workplace Climate Resilience Practitioner",
    badgeDescription: "Awarded for demonstrating practical understanding of workplace climate risk assessment and business resilience protocols.",
  },
];

export async function ensureAppliedCourseBadges(): Promise<void> {
  logger.info("Ensuring badge metadata for applied workplace courses (ELH-13..29)...");

  for (const item of APPLIED_COURSE_BADGES) {
    const [course] = await db
      .select({ id: coursesTable.id })
      .from(coursesTable)
      .where(or(eq(coursesTable.courseCode, item.courseCode), eq(coursesTable.slug, item.slug)))
      .limit(1);

    if (!course) continue;

    // 1. Update coursesTable badgeName, badgeDescription and thumbnailUrl
    await db
      .update(coursesTable)
      .set({
        badgeName: item.badgeName,
        badgeDescription: item.badgeDescription,
        thumbnailUrl: item.courseCode === "ELH-30" ? "/images/courses/climate-risk-and-workplace-resilience.jpg" : undefined,
      })
      .where(eq(coursesTable.id, course.id));

    // 2. Ensure badgeDefinitionsTable entry
    const [existingBadge] = await db
      .select({ id: badgeDefinitionsTable.id })
      .from(badgeDefinitionsTable)
      .where(or(eq(badgeDefinitionsTable.slug, item.badgeSlug), eq(badgeDefinitionsTable.code, item.badgeSlug)))
      .limit(1);

    if (existingBadge) {
      await db
        .update(badgeDefinitionsTable)
        .set({
          name: item.badgeName,
          slug: item.badgeSlug,
          code: item.badgeSlug,
          description: item.badgeDescription,
          courseIds: [course.id],
        })
        .where(eq(badgeDefinitionsTable.id, existingBadge.id));
    } else {
      await db.insert(badgeDefinitionsTable).values({
        slug: item.badgeSlug,
        code: item.badgeSlug,
        name: item.badgeName,
        description: item.badgeDescription,
        icon: "award",
        criteriaType: "all_courses",
        threshold: 0,
        courseIds: [course.id],
        orderIndex: parseInt(item.courseCode.replace("ELH-", ""), 10),
      });
    }
  }

  logger.info("Applied course badges successfully updated.");
}
