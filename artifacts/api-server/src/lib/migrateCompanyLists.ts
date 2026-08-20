import { db, companiesTable, employeesTable, departmentsTable, jobTitlesTable } from "@workspace/db";
import { eq, and, sql, isNull } from "drizzle-orm";
import { logger } from "./logger";
import { ensureDefaultCompanyLists } from "./companyListService";

export interface MigrationSummary {
  companiesProcessed: number;
  departmentsCreated: number;
  jobTitlesCreated: number;
  employeesLinkedDepartments: number;
  employeesLinkedJobTitles: number;
  employeesProfileCompleted: number;
}

export async function migrateCompanyLists(): Promise<MigrationSummary> {
  const summary: MigrationSummary = {
    companiesProcessed: 0,
    departmentsCreated: 0,
    jobTitlesCreated: 0,
    employeesLinkedDepartments: 0,
    employeesLinkedJobTitles: 0,
    employeesProfileCompleted: 0,
  };

  const companies = await db.select({ id: companiesTable.id }).from(companiesTable);
  summary.companiesProcessed = companies.length;

  for (const comp of companies) {
    const companyId = comp.id;

    // 0. Ensure default company lists exist
    await ensureDefaultCompanyLists(companyId);

    // 1. Fetch all employees for this company
    const employees = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.companyId, companyId));

    // 2. Fetch existing departments for this company
    const existingDepts = await db
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.companyId, companyId));

    const deptMap = new Map<string, number>();
    for (const d of existingDepts) {
      deptMap.set(d.name.trim().toLowerCase(), d.id);
    }

    // 3. Migrate and create missing departments
    for (const emp of employees) {
      const rawDept = emp.department?.trim();
      if (rawDept) {
        const normalized = rawDept.toLowerCase();
        if (!deptMap.has(normalized)) {
          const [newDept] = await db
            .insert(departmentsTable)
            .values({
              companyId,
              name: rawDept,
              status: "active",
            })
            .returning();
          deptMap.set(normalized, newDept.id);
          summary.departmentsCreated++;
        }
      }
    }

    // 4. Fetch existing job titles for this company
    const existingTitles = await db
      .select()
      .from(jobTitlesTable)
      .where(eq(jobTitlesTable.companyId, companyId));

    const titleMap = new Map<string, number>();
    for (const t of existingTitles) {
      titleMap.set(t.name.trim().toLowerCase(), t.id);
    }

    // 5. Migrate and create missing job titles
    for (const emp of employees) {
      const rawTitle = emp.jobTitle?.trim();
      if (rawTitle) {
        const normalized = rawTitle.toLowerCase();
        if (!titleMap.has(normalized)) {
          const [newTitle] = await db
            .insert(jobTitlesTable)
            .values({
              companyId,
              name: rawTitle,
              status: "active",
            })
            .returning();
          titleMap.set(normalized, newTitle.id);
          summary.jobTitlesCreated++;
        }
      }
    }

    // 6. Link employee records with department_id, job_title_id and profile_completed
    for (const emp of employees) {
      const rawDept = emp.department?.trim();
      const rawTitle = emp.jobTitle?.trim();
      const targetDeptId = rawDept ? deptMap.get(rawDept.toLowerCase()) ?? null : null;
      const targetTitleId = rawTitle ? titleMap.get(rawTitle.toLowerCase()) ?? null : null;

      const shouldCompleteProfile = emp.profileCompleted || (Boolean(targetDeptId) && Boolean(targetTitleId));

      const updates: Record<string, any> = {};
      if (targetDeptId && emp.departmentId !== targetDeptId) {
        updates.departmentId = targetDeptId;
        summary.employeesLinkedDepartments++;
      }
      if (targetTitleId && emp.jobTitleId !== targetTitleId) {
        updates.jobTitleId = targetTitleId;
        summary.employeesLinkedJobTitles++;
      }
      if (shouldCompleteProfile !== emp.profileCompleted) {
        updates.profileCompleted = shouldCompleteProfile;
        if (shouldCompleteProfile) summary.employeesProfileCompleted++;
      }

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();
        await db
          .update(employeesTable)
          .set(updates)
          .where(eq(employeesTable.id, emp.id));
      }
    }
  }

  logger.info({ summary }, "Company lists migration completed successfully");
  return summary;
}
