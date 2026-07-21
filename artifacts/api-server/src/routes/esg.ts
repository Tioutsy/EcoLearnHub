import { Router } from "express";
import { db } from "@workspace/db";
import { companiesTable, employeesTable } from "@workspace/db";
import { eq, count, sum, sql } from "drizzle-orm";
import { generateEsgReportPdf, type EsgReportData } from "../lib/esgReportPdf";

const router = Router();

function safeFileName(value: string): string {
  return value.replace(/[^a-z0-9-_]+/gi, "_").replace(/_+/g, "_");
}

// ── ESG estimation model ──────────────────────────────────────────────────────
// Company ESG impact is estimated from real training engagement using fixed,
// transparent assumptions. These are conservative per-completed-course factors
// reflecting typical behaviour change after sustainability training.
const CO2_PER_COMPLETION_KG = 30; // kg CO2/yr avoided per completed course
const WASTE_PER_COMPLETION_KG = 15; // kg waste/yr diverted per completed course
const CO2_PER_TREE_KG = 21; // kg CO2/yr sequestered by one tree (standard estimate)

// Sustainability Score weighting (sums to 1.0)
const SCORE_WEIGHTS = {
  completion: 0.3,
  adoption: 0.25,
  assessment: 0.25,
  engagement: 0.2,
};

const LEVELS = [
  { name: "Starter", min: 0, max: 25 },
  { name: "Bronze", min: 26, max: 50 },
  { name: "Silver", min: 51, max: 75 },
  { name: "Gold", min: 76, max: 90 },
  { name: "Platinum", min: 91, max: 100 },
];

function levelFor(score: number) {
  return LEVELS.find((l) => score >= l.min && score <= l.max) ?? LEVELS[0];
}

async function getCompanyAggregates() {
  const companies = await db.select().from(companiesTable).orderBy(companiesTable.id).limit(1);
  if (!companies.length) return null;
  const company = companies[0];

  const [agg] = await db
    .select({
      totalEmployees: count(),
      assigned: sum(employeesTable.enrolledCourses),
      completed: sum(employeesTable.completedCourses),
      certificates: sum(employeesTable.certificates),
      learningMinutes: sum(employeesTable.learningMinutes),
      active: sql<number>`count(*) filter (where ${employeesTable.completedCourses} > 0)`,
      adopted: sql<number>`count(*) filter (where ${employeesTable.enrolledCourses} > 0)`,
      avgScore: sql<number>`coalesce(round(avg(${employeesTable.avgScore}) filter (where ${employeesTable.completedCourses} > 0)), 0)`,
    })
    .from(employeesTable)
    .where(eq(employeesTable.companyId, company.id));

  const totalEmployees = Number(agg?.totalEmployees ?? 0);
  const assigned = Number(agg?.assigned ?? 0);
  const completed = Number(agg?.completed ?? 0);
  const active = Number(agg?.active ?? 0);
  const adopted = Number(agg?.adopted ?? 0);
  const avgScore = Number(agg?.avgScore ?? 0);
  const learningMinutes = Number(agg?.learningMinutes ?? 0);

  return {
    company,
    totalEmployees,
    assigned,
    completed,
    certificates: Number(agg?.certificates ?? 0),
    learningHours: Math.round(learningMinutes / 60),
    active,
    adopted,
    avgScore,
    completionRate: assigned > 0 ? Math.round((completed / assigned) * 100) : 0,
    adoptionRate: totalEmployees > 0 ? Math.round((adopted / totalEmployees) * 100) : 0,
    engagementRate: totalEmployees > 0 ? Math.round((active / totalEmployees) * 100) : 0,
  };
}

type Aggregates = NonNullable<Awaited<ReturnType<typeof getCompanyAggregates>>>;

function computeImpact(a: Aggregates) {
  const co2EquivalentKg = a.completed * CO2_PER_COMPLETION_KG;
  const wasteDivertedKg = a.completed * WASTE_PER_COMPLETION_KG;
  const treesEquivalent = Math.round(co2EquivalentKg / CO2_PER_TREE_KG);

  // Awareness sub-scores blend completion, adoption and assessment performance.
  const plasticReductionScore = Math.min(100, Math.round(a.completionRate * 0.6 + a.avgScore * 0.4));
  const waterSavingsScore = Math.min(100, Math.round(a.adoptionRate * 0.5 + a.avgScore * 0.5));
  const carbonAwarenessScore = Math.min(100, Math.round(a.avgScore * 0.6 + a.completionRate * 0.4));
  const sustainabilityEngagementScore = Math.min(
    100,
    Math.round(a.engagementRate * 0.5 + a.adoptionRate * 0.5),
  );

  return {
    co2EquivalentKg,
    treesEquivalent,
    wasteDivertedKg,
    recyclingParticipation: a.engagementRate,
    plasticReductionScore,
    waterSavingsScore,
    carbonAwarenessScore,
    sustainabilityEngagementScore,
  };
}

function computeScore(a: Aggregates) {
  const score = Math.round(
    a.completionRate * SCORE_WEIGHTS.completion +
      a.adoptionRate * SCORE_WEIGHTS.adoption +
      a.avgScore * SCORE_WEIGHTS.assessment +
      a.engagementRate * SCORE_WEIGHTS.engagement,
  );

  const level = levelFor(score);
  const idx = LEVELS.indexOf(level);
  const nextLevel = idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  const pointsToNextLevel = nextLevel ? nextLevel.min - score : 0;

  const components = [
    { label: "Course completion", value: a.completionRate },
    { label: "Training adoption", value: a.adoptionRate },
    { label: "Assessment scores", value: a.avgScore },
    { label: "Active engagement", value: a.engagementRate },
  ];

  // Recommendations target the weakest levers first.
  const recommendations: string[] = [];
  const sorted = [...components].sort((x, y) => x.value - y.value);
  for (const c of sorted) {
    if (c.value >= 90) continue;
    if (c.label === "Course completion")
      recommendations.push("Follow up with employees who have started but not finished their assigned courses.");
    if (c.label === "Training adoption")
      recommendations.push("Assign at least one sustainability course to every employee, including new joiners.");
    if (c.label === "Assessment scores")
      recommendations.push("Encourage retakes and refreshers to lift average assessment scores above 90%.");
    if (c.label === "Active engagement")
      recommendations.push("Run a monthly challenge or learning path to keep more employees actively training.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Outstanding. Maintain momentum with refresher training and new course assignments.");
  }

  return {
    score,
    level: level.name,
    nextLevel: nextLevel?.name ?? null,
    pointsToNextLevel,
    components,
    recommendations: recommendations.slice(0, 4),
  };
}

router.get("/impact", async (_req, res): Promise<void> => {
  const a = await getCompanyAggregates();
  if (!a) {
    res.json({
      co2EquivalentKg: 0,
      treesEquivalent: 0,
      wasteDivertedKg: 0,
      recyclingParticipation: 0,
      plasticReductionScore: 0,
      waterSavingsScore: 0,
      carbonAwarenessScore: 0,
      sustainabilityEngagementScore: 0,
    });
    return;
  }

  res.json(computeImpact(a));
});

router.get("/score", async (_req, res): Promise<void> => {
  const a = await getCompanyAggregates();
  if (!a) {
    res.json({
      score: 0,
      level: "Starter",
      nextLevel: "Bronze",
      pointsToNextLevel: 26,
      components: [],
      recommendations: ["Assign your first courses to start building your sustainability score."],
    });
    return;
  }

  res.json(computeScore(a));
});

async function getDepartmentBreakdown(companyId: number) {
  const rows = await db
    .select({
      department: employeesTable.department,
      employees: count(),
      assigned: sum(employeesTable.enrolledCourses),
      completed: sum(employeesTable.completedCourses),
      participating: sql<number>`count(*) filter (where ${employeesTable.enrolledCourses} > 0)`,
    })
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId))
    .groupBy(employeesTable.department);

  return rows
    .map((r) => {
      const employees = Number(r.employees ?? 0);
      const assigned = Number(r.assigned ?? 0);
      const completed = Number(r.completed ?? 0);
      const participating = Number(r.participating ?? 0);
      return {
        department: r.department ?? "Unassigned",
        employees,
        participationRate: employees > 0 ? Math.round((participating / employees) * 100) : 0,
        completionRate: assigned > 0 ? Math.round((completed / assigned) * 100) : 0,
      };
    })
    .sort((a, b) => b.employees - a.employees);
}

// Generate a professional, shareable ESG training report as a PDF.
router.get("/report", async (req, res): Promise<void> => {
  const a = await getCompanyAggregates();
  if (!a) {
    res.status(404).json({ error: "No company data available to build a report" });
    return;
  }

  const score = computeScore(a);
  const impact = computeImpact(a);
  const departments = await getDepartmentBreakdown(a.company.id);

  const reportData: EsgReportData = {
    company: { name: a.company.name, industry: a.company.industry ?? null },
    generatedAt: new Date(),
    participation: {
      totalEmployees: a.totalEmployees,
      activeEmployees: a.active,
      adoptionRate: a.adoptionRate,
      engagementRate: a.engagementRate,
      coursesAssigned: a.assigned,
      coursesCompleted: a.completed,
      completionRate: a.completionRate,
      avgScore: a.avgScore,
      learningHours: a.learningHours,
      certificatesIssued: a.certificates,
    },
    score: {
      score: score.score,
      level: score.level,
      nextLevel: score.nextLevel,
      pointsToNextLevel: score.pointsToNextLevel,
      components: score.components,
    },
    impact,
    departments,
  };

  try {
    const pdfBytes = await generateEsgReportPdf(reportData);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFileName(a.company.name)}_ESG_Training_Report.pdf"`,
    );
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    req.log?.error({ err }, "Failed to generate ESG training report");
    res.status(500).json({ error: "Failed to generate ESG training report" });
  }
});

export default router;
