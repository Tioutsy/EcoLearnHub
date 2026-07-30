import { db, departmentsTable, employeesTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";

export interface CreateDepartmentParams {
  companyId: number;
  name: string;
  code?: string | null;
  managerEmployeeId?: number | null;
}

export interface UpdateDepartmentParams {
  companyId: number;
  id: number;
  name?: string;
  code?: string | null;
  managerEmployeeId?: number | null;
  status?: "active" | "archived";
}

export async function createDepartment(params: CreateDepartmentParams): Promise<any> {
  const [existing] = await db
    .select()
    .from(departmentsTable)
    .where(and(eq(departmentsTable.companyId, params.companyId), eq(departmentsTable.name, params.name)))
    .limit(1);

  if (existing) {
    throw new Error(`Department with name '${params.name}' already exists in company`);
  }

  if (params.managerEmployeeId) {
    const [manager] = await db
      .select()
      .from(employeesTable)
      .where(and(eq(employeesTable.id, params.managerEmployeeId), eq(employeesTable.companyId, params.companyId)))
      .limit(1);

    if (!manager) {
      throw new Error("Designated manager does not belong to your company");
    }
  }

  const [dept] = await db
    .insert(departmentsTable)
    .values({
      companyId: params.companyId,
      name: params.name.trim(),
      code: params.code?.trim() ?? null,
      managerEmployeeId: params.managerEmployeeId ?? null,
      status: "active",
    })
    .returning();

  return dept;
}

export async function updateDepartment(params: UpdateDepartmentParams): Promise<any> {
  const updates: Record<string, any> = {};
  if (params.name) updates.name = params.name.trim();
  if (params.code !== undefined) updates.code = params.code?.trim() ?? null;
  if (params.status) updates.status = params.status;

  if (params.managerEmployeeId !== undefined) {
    if (params.managerEmployeeId !== null) {
      const [manager] = await db
        .select()
        .from(employeesTable)
        .where(and(eq(employeesTable.id, params.managerEmployeeId), eq(employeesTable.companyId, params.companyId)))
        .limit(1);

      if (!manager) {
        throw new Error("Designated manager does not belong to your company");
      }
    }
    updates.managerEmployeeId = params.managerEmployeeId;
  }

  const [updated] = await db
    .update(departmentsTable)
    .set(updates)
    .where(and(eq(departmentsTable.id, params.id), eq(departmentsTable.companyId, params.companyId)))
    .returning();

  if (!updated) {
    throw new Error("Department not found");
  }

  return updated;
}

export async function getCompanyDepartments(companyId: number): Promise<any[]> {
  const depts = await db
    .select()
    .from(departmentsTable)
    .where(eq(departmentsTable.companyId, companyId));

  const employees = await db
    .select({ id: employeesTable.id, department: employeesTable.department })
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId));

  return depts.map((d) => {
    const memberCount = employees.filter((e) => e.department === d.name).length;
    return {
      ...d,
      memberCount,
    };
  });
}
