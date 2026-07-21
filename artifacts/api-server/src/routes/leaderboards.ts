import { Router } from "express";
import { db } from "@workspace/db";
import { companiesTable, employeesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

const TOP_N = 10;

type EmployeeRow = {
  id: number;
  name: string;
  department: string | null;
  completedCourses: number;
  avgScore: number;
  certificates: number;
  learningMinutes: number;
};

const buildBoard = (
  key: string,
  title: string,
  description: string,
  unit: string,
  employees: EmployeeRow[],
  value: (e: EmployeeRow) => number,
  valueLabel: (v: number) => string,
) => {
  const ranked = employees
    .map((e) => ({ employee: e, v: value(e) }))
    .filter((r) => r.v > 0)
    .sort(
      (a, b) =>
        b.v - a.v || a.employee.name.localeCompare(b.employee.name),
    )
    .slice(0, TOP_N);

  return {
    key,
    title,
    description,
    unit,
    entries: ranked.map((r, i) => ({
      rank: i + 1,
      employeeId: r.employee.id,
      name: r.employee.name,
      department: r.employee.department,
      value: r.v,
      valueLabel: valueLabel(r.v),
    })),
  };
};

router.get("/", async (req, res): Promise<void> => {
  try {
    const [company] = await db.select().from(companiesTable).orderBy(companiesTable.id).limit(1);
    if (!company) {
      res.json({ enabled: false, boards: [] });
      return;
    }

    if (!company.leaderboardEnabled) {
      res.json({ enabled: false, boards: [] });
      return;
    }

    const employees = await db
      .select({
        id: employeesTable.id,
        name: employeesTable.name,
        department: employeesTable.department,
        completedCourses: employeesTable.completedCourses,
        avgScore: employeesTable.avgScore,
        certificates: employeesTable.certificates,
        learningMinutes: employeesTable.learningMinutes,
      })
      .from(employeesTable)
      .where(eq(employeesTable.companyId, company.id))
      .orderBy(desc(employeesTable.completedCourses));

    const boards = [
      buildBoard(
        "top-learners",
        "Top Learners",
        "Employees who have spent the most time learning.",
        "minutes",
        employees,
        (e) => e.learningMinutes,
        (v) => `${v.toLocaleString()} min`,
      ),
      buildBoard(
        "sustainability-champions",
        "Top Sustainability Champions",
        "Employees with the most certificates earned across sustainability training.",
        "certificates",
        employees,
        (e) => e.certificates,
        (v) => `${v} ${v === 1 ? "certificate" : "certificates"}`,
      ),
      buildBoard(
        "most-courses",
        "Most Courses Completed",
        "Employees who have completed the most courses.",
        "courses",
        employees,
        (e) => e.completedCourses,
        (v) => `${v} ${v === 1 ? "course" : "courses"}`,
      ),
      buildBoard(
        "highest-score",
        "Highest Assessment Score",
        "Employees with the strongest average assessment scores.",
        "score",
        employees,
        (e) => e.avgScore,
        (v) => `${v}%`,
      ),
    ];

    res.json({ enabled: true, boards });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to list leaderboards");
    res.status(500).json({ error: "Failed to load leaderboards" });
  }
});

export default router;
