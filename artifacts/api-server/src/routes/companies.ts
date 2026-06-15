import { Router } from "express";
import { db } from "@workspace/db";
import { companiesTable, plansTable, employeesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateMyCompanyBody, CreateCompanyBody } from "@workspace/api-zod";

const router = Router();

const getCompanyWithPlan = async (id: number) => {
  const [company] = await db
    .select({
      id: companiesTable.id,
      name: companiesTable.name,
      slug: companiesTable.slug,
      industry: companiesTable.industry,
      logoUrl: companiesTable.logoUrl,
      planId: companiesTable.planId,
      planName: plansTable.name,
      employeeCount: companiesTable.employeeCount,
      maxEmployees: companiesTable.maxEmployees,
      completionRate: companiesTable.completionRate,
      certificatesIssued: companiesTable.certificatesIssued,
      badges: companiesTable.badges,
      isPublicProfile: companiesTable.isPublicProfile,
      leaderboardEnabled: companiesTable.leaderboardEnabled,
      createdAt: companiesTable.createdAt,
    })
    .from(companiesTable)
    .leftJoin(plansTable, eq(companiesTable.planId, plansTable.id))
    .where(eq(companiesTable.id, id));
  return company
    ? {
        ...company,
        completionRate: company.completionRate ? parseFloat(company.completionRate) : null,
      }
    : null;
};

// GET /company — demo: first company
router.get("/", async (_req, res): Promise<void> => {
  const companies = await db.select().from(companiesTable).limit(1);
  if (!companies.length) {
    res.status(404).json({ error: "No company found" });
    return;
  }
  const company = await getCompanyWithPlan(companies[0].id);
  res.json(company);
});

router.patch("/", async (req, res): Promise<void> => {
  const companies = await db.select().from(companiesTable).limit(1);
  if (!companies.length) {
    res.status(404).json({ error: "No company found" });
    return;
  }

  const parsed = UpdateMyCompanyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.update(companiesTable).set(parsed.data).where(eq(companiesTable.id, companies[0].id));
  const updated = await getCompanyWithPlan(companies[0].id);
  res.json(updated);
});

// Admin: list all companies
router.get("/all", async (_req, res): Promise<void> => {
  const companies = await db
    .select({
      id: companiesTable.id,
      name: companiesTable.name,
      slug: companiesTable.slug,
      industry: companiesTable.industry,
      logoUrl: companiesTable.logoUrl,
      planId: companiesTable.planId,
      planName: plansTable.name,
      employeeCount: companiesTable.employeeCount,
      maxEmployees: companiesTable.maxEmployees,
      completionRate: companiesTable.completionRate,
      certificatesIssued: companiesTable.certificatesIssued,
      badges: companiesTable.badges,
      isPublicProfile: companiesTable.isPublicProfile,
      leaderboardEnabled: companiesTable.leaderboardEnabled,
      createdAt: companiesTable.createdAt,
    })
    .from(companiesTable)
    .leftJoin(plansTable, eq(companiesTable.planId, plansTable.id));

  res.json(
    companies.map((c) => ({
      ...c,
      completionRate: c.completionRate ? parseFloat(c.completionRate) : null,
    })),
  );
});

router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateCompanyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const slug = parsed.data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const [company] = await db
    .insert(companiesTable)
    .values({ ...parsed.data, slug })
    .returning();
  const full = await getCompanyWithPlan(company.id);
  res.status(201).json(full);
});

// Employees sub-routes
router.get("/employees", async (_req, res): Promise<void> => {
  const companies = await db.select().from(companiesTable).limit(1);
  if (!companies.length) {
    res.json([]);
    return;
  }
  const employees = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companies[0].id));
  res.json(employees);
});

router.post("/employees", async (req, res): Promise<void> => {
  const companies = await db.select().from(companiesTable).limit(1);
  if (!companies.length) {
    res.status(404).json({ error: "No company found" });
    return;
  }

  const { AddEmployeeBody } = await import("@workspace/api-zod");
  const parsed = AddEmployeeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [emp] = await db
    .insert(employeesTable)
    .values({ companyId: companies[0].id, ...parsed.data })
    .returning();
  res.status(201).json(emp);
});

router.patch("/employees/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { UpdateEmployeeBody } = await import("@workspace/api-zod");
  const parsed = UpdateEmployeeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(employeesTable)
    .set(parsed.data)
    .where(eq(employeesTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Employee not found" });
    return;
  }
  res.json(updated);
});

router.delete("/employees/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(employeesTable).where(eq(employeesTable.id, id));
  res.status(204).send();
});

export default router;
