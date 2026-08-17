import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { and, eq, or, sql } from "drizzle-orm";
import {
  companiesTable,
  companySubscriptionsTable,
  db,
  employeesTable,
  type Company,
  type Employee,
} from "@workspace/db";

export type AccessRole = "platform_admin" | "company_admin" | "manager" | "employee";

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
    readString(getNestedClaim(claims, ["public_metadata", "role"])) ??
    readString(claims["role"])
  );
}

function getClaimCompanyId(claims: Record<string, unknown>): number | null {
  return (
    readNumber(getNestedClaim(claims, ["publicMetadata", "companyId"])) ??
    readNumber(getNestedClaim(claims, ["metadata", "companyId"])) ??
    readNumber(getNestedClaim(claims, ["public_metadata", "companyId"])) ??
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
  return role === "company_admin" || role === "admin";
}

function isManagerRole(role: string | null): boolean {
  return role === "manager";
}

export function hasCapability(role: AccessRole, capability: string): boolean {
  if (role === "platform_admin") return true;
  if (role === "company_admin") return true;
  if (role === "manager") {
    return [
      "employees.view",
      "reports.team",
      "certificates.download",
      "courses.assign",
      "challenges.review",
    ].includes(capability);
  }
  if (role === "employee") {
    return ["certificates.download"].includes(capability);
  }
  return false;
}

export async function getPrimaryCompany(): Promise<Company | null> {
  const [company] = await db.select().from(companiesTable).orderBy(companiesTable.id).limit(1);
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

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadJson = Buffer.from(parts[1]!, "base64url").toString("utf-8");
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

function getAuthContext(req: Request): { userId?: string | null; sessionClaims?: Record<string, unknown> } {
  try {
    const clerkAuth = getAuth(req) as any;
    if (clerkAuth && clerkAuth.userId) {
      return clerkAuth;
    }
  } catch (e) {
    // Fallback to manual bearer token inspection below
  }

  const fallbackAuth = (req as unknown as { auth?: { userId?: string; sessionClaims?: Record<string, unknown> } }).auth;
  if (fallbackAuth?.userId) {
    return fallbackAuth;
  }

  // Extract from Bearer token if present
  const authHeader = req.headers?.authorization;
  if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    const payload = parseJwtPayload(token);
    if (payload) {
      const extractedUserId = (payload.sub || payload.userId || payload.user_id) as string | undefined;
      if (extractedUserId) {
        return {
          userId: extractedUserId,
          sessionClaims: payload,
        };
      }
    }
  }

  return {};
}

export async function getCompanyAccess(req: Request): Promise<CompanyAccess> {
  const auth = getAuthContext(req);
  const fallbackAuth = (req as unknown as { auth?: { userId?: string } }).auth;
  
  const userId = auth.userId ?? fallbackAuth?.userId ?? null;
  const claims = auth.sessionClaims ?? {};

  if (!userId) {
    throw new HttpError(401, "Unauthenticated: Authentication required");
  }

  const claimRole = getClaimRole(claims);
  const claimCompanyId = getClaimCompanyId(claims);
  const email = getClaimEmail(claims);
  const primaryCompany = await getPrimaryCompany();

  const bootstrapEmail = (process.env.PLATFORM_ADMIN_BOOTSTRAP_EMAIL ?? "slennon2206@gmail.com").toLowerCase();
  const isPlatformAdmin = isPlatformRole(claimRole) || (email && email.toLowerCase() === bootstrapEmail);

  if (isPlatformAdmin) {
    const companyId = claimCompanyId ?? primaryCompany?.id ?? 0;
    const employee = await findEmployeeForUser(userId, email);
    return {
      userId,
      email,
      companyId: employee?.companyId ?? companyId,
      role: "platform_admin",
      employee,
      isDemo: false,
    };
  }

  const employee = await findEmployeeForUser(userId, email);

  if (!employee) {
    throw new HttpError(403, "Access denied: No explicit company membership record found for account");
  }

  if (employee.status !== "active") {
    throw new HttpError(403, "Access denied: Company membership is inactive");
  }

  if (!employee.companyId) {
    throw new HttpError(403, "Access denied: No company associated with employee record");
  }

  let role: AccessRole = "employee";
  if (employee.role === "admin") {
    role = "company_admin";
  } else if (employee.role === "manager") {
    role = "manager";
  }

  return {
    userId,
    email,
    companyId: employee.companyId,
    role,
    employee,
    isDemo: false,
  };
}

export async function requireActiveCompanySubscription(req: Request): Promise<CompanyAccess> {
  const access = await getCompanyAccess(req);
  if (access.role === "platform_admin") return access;
  if (!access.companyId) throw new HttpError(403, "Subscription required: No company associated with user account");

  const [sub] = await db
    .select()
    .from(companySubscriptionsTable)
    .where(eq(companySubscriptionsTable.companyId, access.companyId))
    .limit(1);

  if (!sub || sub.status !== "ACTIVE") {
    throw new HttpError(402, "Subscription payment pending: Complete subscription payment to unlock LMS training and administration.");
  }
  return access;
}

export async function requireCompanyAdmin(req: Request): Promise<CompanyAccess> {
  const access = await getCompanyAccess(req);
  if (access.role !== "company_admin" && access.role !== "platform_admin") {
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
    companyId: 0,
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
  return false;
}
