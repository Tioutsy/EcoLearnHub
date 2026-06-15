import { Router } from "express";
import { db } from "@workspace/db";
import {
  companiesTable,
  badgesTable,
  certificatesTable,
  employeesTable,
  enrollmentsTable,
  lessonProgressTable,
  subscriptionsTable,
  plansTable,
} from "@workspace/db";
import { eq, count, isNotNull, sql } from "drizzle-orm";

const router = Router();

// ── Donation model ──────────────────────────────────────────────────────────
// A portion of every company subscription funds native tree planting with our
// reforestation partner. These are the transparent, fixed conversion factors
// used across the platform impact dashboard.
const DONATION_RATE_PCT = 5; // % of each subscription donated
const TREE_COST = 200; // Rs to plant one endemic tree
const CO2_PER_TREE_KG = 21; // kg CO2 sequestered per tree per year (standard estimate)
const AREA_PER_TREE_M2 = 4; // m² of forest restored per tree
const PARTNER_NAME = "Ebony Forest, Chamarel";

router.get("/", async (_req, res): Promise<void> => {
  // ── Social impact (real, cumulative) ──────────────────────────────────────
  const [completedEnrollments] = await db
    .select({ count: count() })
    .from(enrollmentsTable)
    .where(isNotNull(enrollmentsTable.completedAt));

  const [distinctLearners] = await db
    .select({ count: sql<number>`count(distinct ${enrollmentsTable.userId})` })
    .from(enrollmentsTable)
    .where(isNotNull(enrollmentsTable.completedAt));

  const [certCount] = await db.select({ count: count() }).from(certificatesTable);

  const [lessonsDone] = await db
    .select({ count: count() })
    .from(lessonProgressTable)
    .where(eq(lessonProgressTable.completed, 1));

  const coursesCompleted = completedEnrollments?.count ?? 0;
  const employeesTrained = Number(distinctLearners?.count ?? 0);
  const certificatesIssued = certCount?.count ?? 0;
  const lessonsCompleted = lessonsDone?.count ?? 0;

  // ── Environmental impact via subscription-funded donations ────────────────
  const activeSubs = await db
    .select({
      companyId: subscriptionsTable.companyId,
      companyName: companiesTable.name,
      priceAnnual: plansTable.priceAnnual,
    })
    .from(subscriptionsTable)
    .leftJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
    .leftJoin(companiesTable, eq(subscriptionsTable.companyId, companiesTable.id))
    .where(eq(subscriptionsTable.status, "active"));

  // Aggregate donations per distinct company (a company may hold more than one
  // active subscription — they count once as a participant, with totals summed).
  const byCompany = new Map<number, { company: string; donated: number }>();
  for (const s of activeSubs) {
    const annual = parseFloat(s.priceAnnual ?? "0");
    const donated = Math.round((annual * DONATION_RATE_PCT) / 100);
    const existing = byCompany.get(s.companyId) ?? {
      company: s.companyName ?? "A company",
      donated: 0,
    };
    existing.donated += donated;
    byCompany.set(s.companyId, existing);
  }

  let totalDonated = 0;
  let treesPlanted = 0;
  const contributors = Array.from(byCompany.values()).map((c) => {
    const trees = Math.floor(c.donated / TREE_COST);
    totalDonated += c.donated;
    treesPlanted += trees;
    return { company: c.company, trees, donated: c.donated };
  });

  const topContributors = contributors
    .sort((a, b) => b.trees - a.trees)
    .slice(0, 5);

  const companiesParticipating = byCompany.size;
  const co2SequesteredKg = treesPlanted * CO2_PER_TREE_KG;
  const areaReforestedM2 = treesPlanted * AREA_PER_TREE_M2;

  // ── Completions over the last 12 months (real) ────────────────────────────
  const now = new Date();
  const monthlyTrend: { month: string; completions: number; enrollments: number }[] = [];
  const completedRows = await db
    .select({ completedAt: enrollmentsTable.completedAt, createdAt: enrollmentsTable.createdAt })
    .from(enrollmentsTable);

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    const completions = completedRows.filter(
      (r) => r.completedAt && r.completedAt >= d && r.completedAt < next,
    ).length;
    const enrollments = completedRows.filter(
      (r) => r.createdAt && r.createdAt >= d && r.createdAt < next,
    ).length;
    monthlyTrend.push({ month: label, completions, enrollments });
  }

  res.json({
    employeesTrained,
    coursesCompleted,
    certificatesIssued,
    companiesParticipating,
    lessonsCompleted,
    treesPlanted,
    totalDonated,
    co2SequesteredKg,
    areaReforestedM2,
    donationRatePct: DONATION_RATE_PCT,
    treeCost: TREE_COST,
    partnerName: PARTNER_NAME,
    topContributors,
    monthlyTrend,
  });
});

router.get("/badges", async (_req, res): Promise<void> => {
  const companies = await db.select().from(companiesTable).limit(1);
  if (!companies.length) {
    res.json([]);
    return;
  }

  const badges = await db.select().from(badgesTable).where(eq(badgesTable.companyId, companies[0].id));
  res.json(badges);
});

router.get("/department-breakdown", async (_req, res): Promise<void> => {
  const companies = await db.select().from(companiesTable).limit(1);
  if (!companies.length) {
    res.json([]);
    return;
  }

  const employees = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companies[0].id));

  const deptMap = new Map<string, { count: number; completed: number; certs: number }>();
  for (const emp of employees) {
    const dept = emp.department ?? "General";
    const existing = deptMap.get(dept) ?? { count: 0, completed: 0, certs: 0 };
    deptMap.set(dept, {
      count: existing.count + 1,
      completed: existing.completed + emp.completedCourses,
      certs: existing.certs + emp.certificates,
    });
  }

  const breakdown = Array.from(deptMap.entries()).map(([dept, stats]) => ({
    department: dept,
    employeeCount: stats.count,
    completionRate: stats.count > 0 ? Math.round((stats.completed / Math.max(1, stats.count)) * 100) : 0,
    certificates: stats.certs,
  }));

  res.json(breakdown);
});

export default router;
