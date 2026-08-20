import {
  db,
  companiesTable,
  employeesTable,
  departmentsTable,
  jobTitlesTable,
} from "@workspace/db";
import { eq, and, or, sql } from "drizzle-orm";
import { HttpError } from "./access";
import { logAuditEvent } from "./auditLogService";
import { listCompanyDepartments, listCompanyJobTitles } from "./companyListService";

export interface EmployeeProfileSummary {
  employeeId: number;
  companyId: number;
  companyName: string;
  firstName: string;
  surname: string;
  email: string;
  departmentId: number | null;
  departmentName: string | null;
  jobTitleId: number | null;
  jobTitleName: string | null;
  profileCompleted: boolean;
  activeDepartments: { id: number; name: string }[];
  activeJobTitles: { id: number; name: string }[];
  isConfigurationMissing: boolean;
  configurationWarning?: string | null;
}

export interface CompleteProfileInput {
  firstName: string;
  surname: string;
  departmentId: number;
  jobTitleId: number;
}

/**
 * Resolves the authenticated employee's onboarding profile state and company options.
 */
export async function getEmployeeOnboardingProfile(
  userId: string,
  sessionEmail?: string | null
): Promise<EmployeeProfileSummary> {
  const clauses = [eq(employeesTable.clerkUserId, userId)];
  if (sessionEmail && sessionEmail.trim()) {
    clauses.push(sql`lower(${employeesTable.email}) = ${sessionEmail.trim().toLowerCase()}`);
  }

  const [employee] = await db
    .select()
    .from(employeesTable)
    .where(or(...clauses))
    .limit(1);

  if (!employee) {
    throw new HttpError(404, "Employee record not found for your account.");
  }

  const [company] = await db
    .select({ name: companiesTable.name })
    .from(companiesTable)
    .where(eq(companiesTable.id, employee.companyId))
    .limit(1);

  const activeDepts = await listCompanyDepartments(employee.companyId, false);
  const activeTitles = await listCompanyJobTitles(employee.companyId, false);

  const isConfigurationMissing = activeDepts.length === 0 || activeTitles.length === 0;
  let configurationWarning: string | null = null;
  if (isConfigurationMissing) {
    if (activeDepts.length === 0 && activeTitles.length === 0) {
      configurationWarning = "Your company administrator has not yet configured departments and job titles. Please notify your administrator to complete company settings.";
    } else if (activeDepts.length === 0) {
      configurationWarning = "Your company administrator has not yet added departments. Please contact your administrator.";
    } else {
      configurationWarning = "Your company administrator has not yet added job titles. Please contact your administrator.";
    }
  }

  // Parse name into first and last
  const nameParts = (employee.name || "").trim().split(" ");
  const firstName = nameParts[0] || "";
  const surname = nameParts.slice(1).join(" ") || "";

  return {
    employeeId: employee.id,
    companyId: employee.companyId,
    companyName: company?.name || "Elevio Corporate",
    firstName,
    surname,
    email: employee.email,
    departmentId: employee.departmentId,
    departmentName: employee.department,
    jobTitleId: employee.jobTitleId,
    jobTitleName: employee.jobTitle,
    profileCompleted: employee.profileCompleted,
    activeDepartments: activeDepts.map((d) => ({ id: d.id, name: d.name })),
    activeJobTitles: activeTitles.map((t) => ({ id: t.id, name: t.name })),
    isConfigurationMissing,
    configurationWarning,
  };
}

/**
 * Atomically saves completed employee profile with validated company department and job title.
 */
export async function completeEmployeeProfile(
  userId: string,
  input: CompleteProfileInput,
  sessionEmail?: string | null
): Promise<{ success: boolean; redirectUrl: string; employeeId: number }> {
  const firstName = (input.firstName || "").trim();
  const surname = (input.surname || "").trim();

  if (!firstName) {
    throw new HttpError(400, "First name is required.");
  }
  if (!surname) {
    throw new HttpError(400, "Surname is required.");
  }
  if (!input.departmentId || !Number.isInteger(input.departmentId)) {
    throw new HttpError(400, "Please select an active department from your company list.");
  }
  if (!input.jobTitleId || !Number.isInteger(input.jobTitleId)) {
    throw new HttpError(400, "Please select an active job title from your company list.");
  }

  return await db.transaction(async (tx) => {
    const clauses = [eq(employeesTable.clerkUserId, userId)];
    if (sessionEmail && sessionEmail.trim()) {
      clauses.push(sql`lower(${employeesTable.email}) = ${sessionEmail.trim().toLowerCase()}`);
    }

    const [employee] = await tx
      .select()
      .from(employeesTable)
      .where(or(...clauses))
      .limit(1);

    if (!employee) {
      throw new HttpError(404, "Employee record not found for authenticated user.");
    }

    // Verify department belongs to this company and is active
    const [department] = await tx
      .select()
      .from(departmentsTable)
      .where(
        and(
          eq(departmentsTable.id, input.departmentId),
          eq(departmentsTable.companyId, employee.companyId),
          eq(departmentsTable.status, "active")
        )
      )
      .limit(1);

    if (!department) {
      throw new HttpError(400, "The selected department is not active or does not belong to your company.");
    }

    // Verify job title belongs to this company and is active
    const [jobTitle] = await tx
      .select()
      .from(jobTitlesTable)
      .where(
        and(
          eq(jobTitlesTable.id, input.jobTitleId),
          eq(jobTitlesTable.companyId, employee.companyId),
          eq(jobTitlesTable.status, "active")
        )
      )
      .limit(1);

    if (!jobTitle) {
      throw new HttpError(400, "The selected job title is not active or does not belong to your company.");
    }

    const fullName = `${firstName} ${surname}`.trim();

    // Update employee profile transactionally
    const [updated] = await tx
      .update(employeesTable)
      .set({
        clerkUserId: userId,
        name: fullName,
        department: department.name,
        jobTitle: jobTitle.name,
        departmentId: department.id,
        jobTitleId: jobTitle.id,
        profileCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(employeesTable.id, employee.id))
      .returning();

    // Audit profile completion
    await logAuditEvent({
      companyId: employee.companyId,
      actorUserId: userId,
      actorRole: employee.role,
      action: "employee.profile_completed",
      targetType: "employee",
      targetId: updated.id,
      metadata: {
        departmentId: department.id,
        departmentName: department.name,
        jobTitleId: jobTitle.id,
        jobTitleName: jobTitle.name,
      },
    });

    return {
      success: true,
      redirectUrl: "/internal-home",
      employeeId: updated.id,
    };
  });
}
