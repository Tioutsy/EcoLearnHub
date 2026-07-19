import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { and, eq, or, sql } from "drizzle-orm";
import {
  companiesTable,
  db,
  employeesTable,
  type Company,
  type Employee,
} from "@workspace/db";

export type AccessRole = "platform_admin" | "company_admin" | "employee";

export interface CompanyAccess {
  userId: string;
  email: string | null;
  companyId: number;
  role: AccessRole;
  employee: Employee | null;
  isDemo: boolean;
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  return null;
}

function getNestedClaim(
  claims: Record<string, unknown>,
  keys: string[],
): unknown {
  let cursor: unknown = claims;
  for (const key of keys) {
    if (!cursor || typeof cursor !== "object") return null;
    cursor = (cursor as Record<string, unknown>)[key];
  }
  return cursor;
}

function getClaimRole(claims: Record<string, unknown>): string | null {
  return (
    readString(getNestedClaim(claims, ["publicMetadata", "role"])) ??
    readString(getNestedClaim(claims, ["metadata", "role"])) ??
    readString(claims["role"])
  );
}

function getClaimCompanyId(claims: Record<string, unknown>): number | null {
  return (
    readNumber(getNestedClaim(claims, ["publicMetadata", "companyId"])) ??
    readNumber(getNestedClaim(claims, ["metadata", "companyId"])) ??
    readNumber(claims["companyId"])
  );
}

function getClaimEmail(claims: Record<string, unknown>): string | null {
  return (
    readString(claims["email"]) ??
    readString(claims["email_address"]) ??
    readString(claims["primary_email_address"]) ??
    readString(getNestedClaim(claims, ["emailAddresses", "0", "emailAddress"]))
  );
}

function isPlatformRole(role: string | null): boolean {
  return role === "super_admin" || role === "platform_admin";
}

function isCompanyAdminRole(role: string | null): boolean {
  return role === "company_admin" || role === "admin" || role === "manager";
}

export async function getPrimaryCompany(): Promise<Company | null> {
  const [company] = await db.select().from(companiesTable).limit(1);
  return company ?? null;
}

async function findEmployeeForUser(
  userId: string,
  email: string | null,
): Promise<Employee | null> {
  const clauses = [eq(employeesTable.clerkUserId, userId)];
  if (email) {
    clauses.push(sql`lower(${employeesTable.email}) = ${email.toLowerCase()}`);
  }

  const [employee] = await db
    .select()
    .from(employeesTable)
    .where(or(...clauses))
    .limit(1);

  if (employee && !employee.clerkUserId) {
    const [linked] = await db
      .update(employeesTable)
      .set({
        clerkUserId: userId,
        invitationStatus:
          employee.invitationStatus === "accepted"
            ? employee.invitationStatus
            : "accepted",
        invitationAcceptedAt: employee.invitationAcceptedAt ?? new Date(),
      })
      .where(eq(employeesTable.id, employee.id))
      .returning();
    return linked ?? employee;
  }

  return employee ?? null;
}

function getAuthContext(req: Request): { userId?: string | null; sessionClaims?: Record<string, unknown> } {
  try {
    return getAuth(req) as any;
  } catch (e) {
    return (req as any).auth || {};
  }
}

export async function getCompanyAccess(req: Request): Promise<CompanyAccess> {
  const auth = getAuthContext(req);
  const fallbackAuth = (req as unknown as { auth?: { userId?: string } }).auth;
  
  const userId = auth.userId ?? fallbackAuth?.userId ?? null;
  const claims = auth.sessionClaims ?? {};

  const claimRole = getClaimRole(claims);
  const claimCompanyId = getClaimCompanyId(claims);
  const email = getClaimEmail(claims);
  const primaryCompany = await getPrimaryCompany();

  if (!userId) {
    if (!primaryCompany) throw new HttpError(404, "No company found");
    return {
      userId: "demo-user",
      email: null,
      companyId: primaryCompany.id,
      role: "company_admin",
      employee: null,
      isDemo: true,
    };
  }

  const employee = await findEmployeeForUser(userId, email);
  const companyId =
    claimCompanyId ??
    employee?.companyId ??
    primaryCompany?.id ??
    (isPlatformRole(claimRole) ? 0 : null);
  if (!companyId) throw new HttpError(404, "No company found");

  let role: AccessRole = "employee";
  if (isPlatformRole(claimRole)) role = "platform_admin";
  else if (
    isCompanyAdminRole(claimRole) ||
    employee?.role === "admin" ||
    employee?.role === "manager"
  ) {
    role = "company_admin";
  }

  return {
    userId,
    email,
    companyId,
    role,
    employee,
    isDemo: false,
  };
}

export async function requireCompanyAdmin(req: Request): Promise<CompanyAccess> {
  const access = await getCompanyAccess(req);
  if (access.role === "employee") {
    throw new HttpError(403, "Company administrator access required");
  }
  return access;
}

export async function requirePlatformAdmin(req: Request): Promise<CompanyAccess> {
  const auth = getAuthContext(req);
  const fallbackAuth = (req as unknown as { auth?: { userId?: string } }).auth;
  const userId = auth.userId ?? fallbackAuth?.userId ?? null;
  const claims = auth.sessionClaims ?? {};
  const claimRole = getClaimRole(claims);
  const email = getClaimEmail(claims);

  if (!userId) {
    throw new HttpError(401, "Authentication required");
  }

  if (!isPlatformRole(claimRole)) {
    throw new HttpError(403, "Platform administrator access required");
  }

  return {
    userId,
    email,
    companyId: 0, // No company record is required for platform operations
    role: "platform_admin",
    employee: null,
    isDemo: false,
  };
}

export async function requireSameCompanyEmployee(
  req: Request,
  employeeId: number,
): Promise<{ access: CompanyAccess; employee: Employee }> {
  const access = await getCompanyAccess(req);
  const [employee] = await db
    .select()
    .from(employeesTable)
    .where(
      and(
        eq(employeesTable.id, employeeId),
        eq(employeesTable.companyId, access.companyId),
      ),
    )
    .limit(1);
  if (!employee) throw new HttpError(404, "Employee not found");
  if (access.role === "employee" && access.employee?.id !== employee.id) {
    throw new HttpError(403, "You can only access your own employee record");
  }
  return { access, employee };
}

export function sendHttpError(res: Response, err: unknown): boolean {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return true;
  }
  
  // Fallback for non-HttpError (e.g. ReferenceError, DB Error) to prevent hanging
  res.status(500).json({ error: (err as Error).message || "Internal Server Error" });
  return false;
}
