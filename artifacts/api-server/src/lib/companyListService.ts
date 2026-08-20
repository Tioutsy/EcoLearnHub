import {
  db,
  departmentsTable,
  jobTitlesTable,
  employeesTable,
  type Department,
  type JobTitle,
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { HttpError } from "./access";
import { logAuditEvent } from "./auditLogService";

export interface CreateDepartmentInput {
  companyId: number;
  name: string;
  code?: string | null;
  managerEmployeeId?: number | null;
  actorUserId?: string;
}

export interface UpdateDepartmentInput {
  companyId: number;
  id: number;
  name?: string;
  code?: string | null;
  managerEmployeeId?: number | null;
  status?: "active" | "archived";
  actorUserId?: string;
}

export interface CreateJobTitleInput {
  companyId: number;
  name: string;
  code?: string | null;
  actorUserId?: string;
}

export interface UpdateJobTitleInput {
  companyId: number;
  id: number;
  name?: string;
  code?: string | null;
  status?: "active" | "archived";
  actorUserId?: string;
}

// ─── Department Operations ───────────────────────────────────────────────────

export async function createDepartment(input: CreateDepartmentInput): Promise<Department> {
  const name = input.name.trim();
  if (!name) {
    throw new HttpError(400, "Department name is required");
  }

  // Check for duplicate in company (case-insensitive)
  const [existing] = await db
    .select()
    .from(departmentsTable)
    .where(
      and(
        eq(departmentsTable.companyId, input.companyId),
        sql`lower(${departmentsTable.name}) = ${name.toLowerCase()}`
      )
    )
    .limit(1);

  if (existing) {
    if (existing.status === "archived") {
      // Reactivate archived department if duplicate name
      const [reactivated] = await db
        .update(departmentsTable)
        .set({
          status: "active",
          code: input.code?.trim() || existing.code,
          managerEmployeeId: input.managerEmployeeId ?? existing.managerEmployeeId,
          updatedAt: new Date(),
        })
        .where(eq(departmentsTable.id, existing.id))
        .returning();
      return reactivated;
    }
    throw new HttpError(409, `Department '${name}' already exists in your company.`);
  }

  if (input.managerEmployeeId) {
    const [manager] = await db
      .select()
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.id, input.managerEmployeeId),
          eq(employeesTable.companyId, input.companyId)
        )
      )
      .limit(1);

    if (!manager) {
      throw new HttpError(400, "Designated manager does not belong to your company");
    }
  }

  const [department] = await db
    .insert(departmentsTable)
    .values({
      companyId: input.companyId,
      name,
      code: input.code?.trim() || null,
      managerEmployeeId: input.managerEmployeeId || null,
      status: "active",
    })
    .returning();

  if (input.actorUserId) {
    await logAuditEvent({
      companyId: input.companyId,
      actorUserId: input.actorUserId,
      actorRole: "company_admin",
      action: "department.created",
      targetType: "department",
      targetId: department.id,
      metadata: { name: department.name, code: department.code },
    });
  }

  return department;
}

export async function updateDepartment(input: UpdateDepartmentInput): Promise<Department> {
  const [existing] = await db
    .select()
    .from(departmentsTable)
    .where(
      and(
        eq(departmentsTable.id, input.id),
        eq(departmentsTable.companyId, input.companyId)
      )
    )
    .limit(1);

  if (!existing) {
    throw new HttpError(404, "Department not found in your company");
  }

  const updates: Record<string, any> = { updatedAt: new Date() };

  if (input.name !== undefined) {
    const trimmed = input.name.trim();
    if (!trimmed) throw new HttpError(400, "Department name cannot be empty");

    // Check duplicate name
    const [dup] = await db
      .select()
      .from(departmentsTable)
      .where(
        and(
          eq(departmentsTable.companyId, input.companyId),
          sql`lower(${departmentsTable.name}) = ${trimmed.toLowerCase()}`,
          sql`${departmentsTable.id} != ${input.id}`
        )
      )
      .limit(1);

    if (dup) {
      throw new HttpError(409, `Another department named '${trimmed}' already exists.`);
    }

    updates.name = trimmed;
  }

  if (input.code !== undefined) {
    updates.code = input.code?.trim() || null;
  }

  if (input.managerEmployeeId !== undefined) {
    if (input.managerEmployeeId !== null) {
      const [mgr] = await db
        .select()
        .from(employeesTable)
        .where(
          and(
            eq(employeesTable.id, input.managerEmployeeId),
            eq(employeesTable.companyId, input.companyId)
          )
        )
        .limit(1);
      if (!mgr) throw new HttpError(400, "Designated manager does not belong to your company");
    }
    updates.managerEmployeeId = input.managerEmployeeId;
  }

  if (input.status !== undefined) {
    updates.status = input.status;
  }

  const [updated] = await db
    .update(departmentsTable)
    .set(updates)
    .where(eq(departmentsTable.id, input.id))
    .returning();

  // If department was renamed, sync string text on linked employees
  if (updates.name && updates.name !== existing.name) {
    await db
      .update(employeesTable)
      .set({ department: updates.name, updatedAt: new Date() })
      .where(
        and(
          eq(employeesTable.companyId, input.companyId),
          eq(employeesTable.departmentId, input.id)
        )
      );
  }

  if (input.actorUserId) {
    await logAuditEvent({
      companyId: input.companyId,
      actorUserId: input.actorUserId,
      actorRole: "company_admin",
      action: "department.updated",
      targetType: "department",
      targetId: updated.id,
      metadata: { previousName: existing.name, newName: updated.name, status: updated.status },
    });
  }

  return updated;
}

export async function deactivateDepartment(
  companyId: number,
  id: number,
  actorUserId?: string
): Promise<Department> {
  return await updateDepartment({
    companyId,
    id,
    status: "archived",
    actorUserId,
  });
}

export const DEFAULT_COMPANY_DEPARTMENTS = [
  "Management & Administration",
  "Operations & Logistics",
  "Sustainability & ESG",
  "Engineering & Facilities",
  "Human Resources",
  "Finance & Commercial",
  "General",
];

export const DEFAULT_COMPANY_JOB_TITLES = [
  "Director / Executive",
  "Department Manager",
  "Team Lead / Supervisor",
  "Sustainability Officer",
  "Operations Specialist",
  "Technical Specialist",
  "Administrator / Coordinator",
  "Staff Member",
];

export async function ensureDefaultCompanyLists(companyId: number): Promise<void> {
  const existingDepts = await db
    .select({ id: departmentsTable.id })
    .from(departmentsTable)
    .where(eq(departmentsTable.companyId, companyId))
    .limit(1);

  if (existingDepts.length === 0) {
    for (const name of DEFAULT_COMPANY_DEPARTMENTS) {
      await db
        .insert(departmentsTable)
        .values({
          companyId,
          name,
          status: "active",
        })
        .onConflictDoNothing();
    }
  }

  const existingTitles = await db
    .select({ id: jobTitlesTable.id })
    .from(jobTitlesTable)
    .where(eq(jobTitlesTable.companyId, companyId))
    .limit(1);

  if (existingTitles.length === 0) {
    for (const name of DEFAULT_COMPANY_JOB_TITLES) {
      await db
        .insert(jobTitlesTable)
        .values({
          companyId,
          name,
          status: "active",
        })
        .onConflictDoNothing();
    }
  }
}

export async function listCompanyDepartments(
  companyId: number,
  includeArchived = false
): Promise<(Department & { memberCount: number })[]> {
  let depts = await db
    .select()
    .from(departmentsTable)
    .where(
      includeArchived
        ? eq(departmentsTable.companyId, companyId)
        : and(
            eq(departmentsTable.companyId, companyId),
            eq(departmentsTable.status, "active")
          )
    )
    .orderBy(departmentsTable.name);

  if (depts.length === 0) {
    await ensureDefaultCompanyLists(companyId);
    depts = await db
      .select()
      .from(departmentsTable)
      .where(
        includeArchived
          ? eq(departmentsTable.companyId, companyId)
          : and(
              eq(departmentsTable.companyId, companyId),
              eq(departmentsTable.status, "active")
            )
      )
      .orderBy(departmentsTable.name);
  }

  const employees = await db
    .select({
      id: employeesTable.id,
      departmentId: employeesTable.departmentId,
      department: employeesTable.department,
    })
    .from(employeesTable)
    .where(
      and(
        eq(employeesTable.companyId, companyId),
        eq(employeesTable.status, "active")
      )
    );

  return depts.map((d) => {
    const memberCount = employees.filter(
      (e) => e.departmentId === d.id || (e.department && e.department.toLowerCase() === d.name.toLowerCase())
    ).length;
    return { ...d, memberCount };
  });
}

// ─── Job Title Operations ────────────────────────────────────────────────────

export async function createJobTitle(input: CreateJobTitleInput): Promise<JobTitle> {
  const name = input.name.trim();
  if (!name) {
    throw new HttpError(400, "Job title name is required");
  }

  const [existing] = await db
    .select()
    .from(jobTitlesTable)
    .where(
      and(
        eq(jobTitlesTable.companyId, input.companyId),
        sql`lower(${jobTitlesTable.name}) = ${name.toLowerCase()}`
      )
    )
    .limit(1);

  if (existing) {
    if (existing.status === "archived") {
      const [reactivated] = await db
        .update(jobTitlesTable)
        .set({
          status: "active",
          code: input.code?.trim() || existing.code,
          updatedAt: new Date(),
        })
        .where(eq(jobTitlesTable.id, existing.id))
        .returning();
      return reactivated;
    }
    throw new HttpError(409, `Job title '${name}' already exists in your company.`);
  }

  const [jobTitle] = await db
    .insert(jobTitlesTable)
    .values({
      companyId: input.companyId,
      name,
      code: input.code?.trim() || null,
      status: "active",
    })
    .returning();

  if (input.actorUserId) {
    await logAuditEvent({
      companyId: input.companyId,
      actorUserId: input.actorUserId,
      actorRole: "company_admin",
      action: "job_title.created",
      targetType: "job_title",
      targetId: jobTitle.id,
      metadata: { name: jobTitle.name, code: jobTitle.code },
    });
  }

  return jobTitle;
}

export async function updateJobTitle(input: UpdateJobTitleInput): Promise<JobTitle> {
  const [existing] = await db
    .select()
    .from(jobTitlesTable)
    .where(
      and(
        eq(jobTitlesTable.id, input.id),
        eq(jobTitlesTable.companyId, input.companyId)
      )
    )
    .limit(1);

  if (!existing) {
    throw new HttpError(404, "Job title not found in your company");
  }

  const updates: Record<string, any> = { updatedAt: new Date() };

  if (input.name !== undefined) {
    const trimmed = input.name.trim();
    if (!trimmed) throw new HttpError(400, "Job title name cannot be empty");

    const [dup] = await db
      .select()
      .from(jobTitlesTable)
      .where(
        and(
          eq(jobTitlesTable.companyId, input.companyId),
          sql`lower(${jobTitlesTable.name}) = ${trimmed.toLowerCase()}`,
          sql`${jobTitlesTable.id} != ${input.id}`
        )
      )
      .limit(1);

    if (dup) {
      throw new HttpError(409, `Another job title named '${trimmed}' already exists.`);
    }

    updates.name = trimmed;
  }

  if (input.code !== undefined) {
    updates.code = input.code?.trim() || null;
  }

  if (input.status !== undefined) {
    updates.status = input.status;
  }

  const [updated] = await db
    .update(jobTitlesTable)
    .set(updates)
    .where(eq(jobTitlesTable.id, input.id))
    .returning();

  if (updates.name && updates.name !== existing.name) {
    await db
      .update(employeesTable)
      .set({ jobTitle: updates.name, updatedAt: new Date() })
      .where(
        and(
          eq(employeesTable.companyId, input.companyId),
          eq(employeesTable.jobTitleId, input.id)
        )
      );
  }

  if (input.actorUserId) {
    await logAuditEvent({
      companyId: input.companyId,
      actorUserId: input.actorUserId,
      actorRole: "company_admin",
      action: "job_title.updated",
      targetType: "job_title",
      targetId: updated.id,
      metadata: { previousName: existing.name, newName: updated.name, status: updated.status },
    });
  }

  return updated;
}

export async function deactivateJobTitle(
  companyId: number,
  id: number,
  actorUserId?: string
): Promise<JobTitle> {
  return await updateJobTitle({
    companyId,
    id,
    status: "archived",
    actorUserId,
  });
}

export async function listCompanyJobTitles(
  companyId: number,
  includeArchived = false
): Promise<(JobTitle & { memberCount: number })[]> {
  let titles = await db
    .select()
    .from(jobTitlesTable)
    .where(
      includeArchived
        ? eq(jobTitlesTable.companyId, companyId)
        : and(
            eq(jobTitlesTable.companyId, companyId),
            eq(jobTitlesTable.status, "active")
          )
    )
    .orderBy(jobTitlesTable.name);

  if (titles.length === 0) {
    await ensureDefaultCompanyLists(companyId);
    titles = await db
      .select()
      .from(jobTitlesTable)
      .where(
        includeArchived
          ? eq(jobTitlesTable.companyId, companyId)
          : and(
              eq(jobTitlesTable.companyId, companyId),
              eq(jobTitlesTable.status, "active")
            )
      )
      .orderBy(jobTitlesTable.name);
  }

  const employees = await db
    .select({
      id: employeesTable.id,
      jobTitleId: employeesTable.jobTitleId,
      jobTitle: employeesTable.jobTitle,
    })
    .from(employeesTable)
    .where(
      and(
        eq(employeesTable.companyId, companyId),
        eq(employeesTable.status, "active")
      )
    );

  return titles.map((t) => {
    const memberCount = employees.filter(
      (e) => e.jobTitleId === t.id || (e.jobTitle && e.jobTitle.toLowerCase() === t.name.toLowerCase())
    ).length;
    return { ...t, memberCount };
  });
}
