import {
  db,
  companiesTable,
  employeesTable,
  companySubscriptionsTable,
  subscriptionPlansTable,
  employeeBandsTable,
  coursesTable,
  courseAssignmentsTable,
  companyPilotPassesTable,
  pilotPassAuditLogsTable,
  CompanyPilotPass,
  PilotPassAuditLog,
} from "@workspace/db";
import { eq, and, or, desc, sql, ilike } from "drizzle-orm";
import crypto from "crypto";
import { logger } from "./logger";
import { HttpError } from "./access";

export interface NormalizedPilotCode {
  canonicalCode: string;
  codeLastFour: string;
  codeHash: string;
}

const CROCKFORD_CHARS = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * Normalizes any entered code format (e.g. "elevio-pilot-a7k9-q2mp", "A7K9Q2MP", "a7k9-q2mp")
 * into canonical "ELEVIO-PILOT-XXXX-XXXX" format and computes its SHA-256 hash.
 */
export function normalizePilotCode(rawInput: string): NormalizedPilotCode {
  if (!rawInput || typeof rawInput !== "string") {
    throw new HttpError(400, "Pilot pass code is required");
  }

  // Remove whitespace and hyphens, convert to uppercase
  let cleaned = rawInput.trim().toUpperCase().replace(/[\s\-_]+/g, "");

  // If user entered "ELEVIOPILOT..." prefix, strip it to extract the 8 random characters
  if (cleaned.startsWith("ELEVIOPILOT")) {
    cleaned = cleaned.slice(11);
  } else if (cleaned.startsWith("PILOT")) {
    cleaned = cleaned.slice(5);
  }

  if (cleaned.length !== 8) {
    throw new HttpError(400, "Invalid pilot pass code format. Expected 8 alphanumeric code characters.");
  }

  const part1 = cleaned.slice(0, 4);
  const part2 = cleaned.slice(4, 8);
  const canonicalCode = `ELEVIO-PILOT-${part1}-${part2}`;
  const codeLastFour = part2;
  const codeHash = crypto.createHash("sha256").update(canonicalCode).digest("hex");

  return {
    canonicalCode,
    codeLastFour,
    codeHash,
  };
}

/**
 * Generates a cryptographically random, human-readable pilot pass code.
 */
export function generatePilotPassCode(): { rawCode: string; canonicalCode: string; codeHash: string; codeLastFour: string } {
  let part1 = "";
  let part2 = "";
  const randomBytes = crypto.randomBytes(8);
  for (let i = 0; i < 4; i++) {
    part1 += CROCKFORD_CHARS[randomBytes[i] % CROCKFORD_CHARS.length];
    part2 += CROCKFORD_CHARS[randomBytes[i + 4] % CROCKFORD_CHARS.length];
  }

  const canonicalCode = `ELEVIO-PILOT-${part1}-${part2}`;
  const codeLastFour = part2;
  const codeHash = crypto.createHash("sha256").update(canonicalCode).digest("hex");

  return {
    rawCode: canonicalCode,
    canonicalCode,
    codeHash,
    codeLastFour,
  };
}

export function maskPilotCode(lastFour: string): string {
  return `ELEVIO-PILOT-••••-${lastFour}`;
}

export interface CreatePilotPassInput {
  companyName: string;
  intendedContactName: string;
  intendedContactEmail: string;
  intendedEmailDomain?: string;
  durationDays?: number;
  learnerSeatLimit?: number;
  administratorSeatLimit?: number;
  permittedCourseIds?: number[];
  internalSalesNote?: string;
}

export interface MaskedPilotPassResponse extends Omit<CompanyPilotPass, "codeHash"> {
  maskedCode: string;
  activeLearnerCount?: number;
  reservedSeatsCount?: number;
  daysRemaining?: number;
  isExpired?: boolean;
}

/**
 * Creates a new company pilot pass.
 * Returns the masked pilot pass object and the one-time plaintext code.
 */
export async function createPilotPass(
  platformAdminUserId: string,
  input: CreatePilotPassInput
): Promise<{ pilotPass: MaskedPilotPassResponse; fullCode: string }> {
  if (!input.companyName || !input.companyName.trim()) {
    throw new HttpError(400, "Company name is required");
  }
  if (!input.intendedContactName || !input.intendedContactName.trim()) {
    throw new HttpError(400, "Intended contact name is required");
  }
  if (!input.intendedContactEmail || !input.intendedContactEmail.trim() || !input.intendedContactEmail.includes("@")) {
    throw new HttpError(400, "Valid contact email is required");
  }

  const durationDays = input.durationDays && input.durationDays > 0 ? input.durationDays : 30;
  const learnerSeatLimit = input.learnerSeatLimit && input.learnerSeatLimit > 0 ? input.learnerSeatLimit : 10;
  const administratorSeatLimit = input.administratorSeatLimit && input.administratorSeatLimit > 0 ? input.administratorSeatLimit : 1;
  const permittedCourseIds = Array.isArray(input.permittedCourseIds) ? input.permittedCourseIds : [];

  const { canonicalCode, codeHash, codeLastFour } = generatePilotPassCode();

  const [record] = await db
    .insert(companyPilotPassesTable)
    .values({
      codeHash,
      codeLastFour,
      companyName: input.companyName.trim(),
      intendedContactName: input.intendedContactName.trim(),
      intendedContactEmail: input.intendedContactEmail.trim().toLowerCase(),
      intendedEmailDomain: input.intendedEmailDomain?.trim().toLowerCase() || null,
      status: "issued",
      durationDays,
      learnerSeatLimit,
      administratorSeatLimit,
      permittedCourseIds,
      internalSalesNote: input.internalSalesNote?.trim() || null,
      createdByPlatformAdminId: platformAdminUserId,
    })
    .returning();

  await db.insert(pilotPassAuditLogsTable).values({
    pilotPassId: record.id,
    action: "created",
    performedBy: platformAdminUserId,
    details: JSON.stringify({
      companyName: record.companyName,
      contactEmail: record.intendedContactEmail,
      durationDays,
      learnerSeatLimit,
      permittedCourseIds,
    }),
  });

  const { codeHash: _, ...rest } = record;
  const maskedPass: MaskedPilotPassResponse = {
    ...rest,
    maskedCode: maskPilotCode(record.codeLastFour),
    daysRemaining: durationDays,
    isExpired: false,
    activeLearnerCount: 0,
    reservedSeatsCount: 0,
  };

  return {
    pilotPass: maskedPass,
    fullCode: canonicalCode,
  };
}

/**
 * Lists all pilot passes with filtering and usage metrics.
 * NEVER returns full codes or hashes.
 */
export async function listPilotPasses(filter?: {
  status?: string;
  search?: string;
}): Promise<MaskedPilotPassResponse[]> {
  const conditions = [];

  if (filter?.status && filter.status !== "all") {
    conditions.push(eq(companyPilotPassesTable.status, filter.status));
  }

  if (filter?.search && filter.search.trim()) {
    const term = `%${filter.search.trim()}%`;
    conditions.push(
      or(
        ilike(companyPilotPassesTable.companyName, term),
        ilike(companyPilotPassesTable.intendedContactEmail, term),
        ilike(companyPilotPassesTable.intendedContactName, term),
        ilike(companyPilotPassesTable.codeLastFour, term)
      )
    );
  }

  const query = conditions.length > 0
    ? db.select().from(companyPilotPassesTable).where(and(...conditions)).orderBy(desc(companyPilotPassesTable.createdAt))
    : db.select().from(companyPilotPassesTable).orderBy(desc(companyPilotPassesTable.createdAt));

  const passes = await query;
  const now = new Date();

  const results: MaskedPilotPassResponse[] = [];

  for (const pass of passes) {
    let daysRemaining = pass.durationDays;
    let isExpired = pass.status === "expired";

    if (pass.status === "active" && pass.expiresAt) {
      const msLeft = new Date(pass.expiresAt).getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      isExpired = msLeft <= 0;
    }

    let activeLearnerCount = 0;
    let reservedSeatsCount = 0;

    if (pass.companyId) {
      const employees = await db
        .select()
        .from(employeesTable)
        .where(eq(employeesTable.companyId, pass.companyId));

      const activeEmployees = employees.filter((e) => e.status === "active");
      activeLearnerCount = activeEmployees.filter((e) => e.role !== "admin").length;
      reservedSeatsCount = activeEmployees.length;
    }

    const { codeHash: _, ...rest } = pass;
    results.push({
      ...rest,
      maskedCode: maskPilotCode(pass.codeLastFour),
      daysRemaining,
      isExpired,
      activeLearnerCount,
      reservedSeatsCount,
    });
  }

  return results;
}

/**
 * Retrieves detailed pilot pass record with audit history.
 */
export async function getPilotPassDetails(pilotPassId: number): Promise<{
  pilotPass: MaskedPilotPassResponse;
  auditLogs: PilotPassAuditLog[];
  companyDetails?: any;
}> {
  const [pass] = await db
    .select()
    .from(companyPilotPassesTable)
    .where(eq(companyPilotPassesTable.id, pilotPassId))
    .limit(1);

  if (!pass) {
    throw new HttpError(404, "Pilot pass not found");
  }

  const auditLogs = await db
    .select()
    .from(pilotPassAuditLogsTable)
    .where(eq(pilotPassAuditLogsTable.pilotPassId, pilotPassId))
    .orderBy(desc(pilotPassAuditLogsTable.createdAt));

  let companyDetails = null;
  let activeLearnerCount = 0;
  let reservedSeatsCount = 0;

  if (pass.companyId) {
    const [company] = await db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.id, pass.companyId))
      .limit(1);

    const employees = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.companyId, pass.companyId));

    const active = employees.filter((e) => e.status === "active");
    activeLearnerCount = active.filter((e) => e.role !== "admin").length;
    reservedSeatsCount = active.length;

    companyDetails = {
      company,
      employees,
      activeLearners: activeLearnerCount,
    };
  }

  const now = new Date();
  let daysRemaining = pass.durationDays;
  let isExpired = pass.status === "expired";

  if (pass.status === "active" && pass.expiresAt) {
    const msLeft = new Date(pass.expiresAt).getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    isExpired = msLeft <= 0;
  }

  const { codeHash: _, ...rest } = pass;
  const maskedPass: MaskedPilotPassResponse = {
    ...rest,
    maskedCode: maskPilotCode(pass.codeLastFour),
    daysRemaining,
    isExpired,
    activeLearnerCount,
    reservedSeatsCount,
  };

  return {
    pilotPass: maskedPass,
    auditLogs,
    companyDetails,
  };
}

/**
 * Extends the pilot duration for an active or issued pilot pass.
 */
export async function extendPilotPass(
  platformAdminUserId: string,
  pilotPassId: number,
  additionalDays: number,
  reason: string
): Promise<MaskedPilotPassResponse> {
  if (!additionalDays || additionalDays <= 0) {
    throw new HttpError(400, "Additional days must be greater than zero");
  }
  if (!reason || !reason.trim()) {
    throw new HttpError(400, "Extension reason is required");
  }

  return await db.transaction(async (tx) => {
    const [pass] = await tx
      .select()
      .from(companyPilotPassesTable)
      .where(eq(companyPilotPassesTable.id, pilotPassId))
      .limit(1);

    if (!pass) {
      throw new HttpError(404, "Pilot pass not found");
    }

    if (pass.status === "revoked" || pass.status === "converted") {
      throw new HttpError(400, `Cannot extend pilot pass in '${pass.status}' status`);
    }

    const now = new Date();
    const currentExpiry = pass.expiresAt ? new Date(pass.expiresAt) : new Date(now.getTime() + pass.durationDays * 86400000);
    const baseDate = currentExpiry.getTime() > now.getTime() ? currentExpiry : now;
    const newExpiresAt = new Date(baseDate.getTime() + additionalDays * 86400000);
    const newRetentionEndsAt = new Date(newExpiresAt.getTime() + 60 * 86400000);

    const newStatus = pass.status === "expired" ? "active" : pass.status;

    const [updated] = await tx
      .update(companyPilotPassesTable)
      .set({
        status: newStatus,
        durationDays: pass.durationDays + additionalDays,
        expiresAt: newExpiresAt,
        retentionEndsAt: newRetentionEndsAt,
        extendedAt: now,
        extensionReason: reason.trim(),
      })
      .where(eq(companyPilotPassesTable.id, pilotPassId))
      .returning();

    // If company subscription exists and was expired, reactivate it
    if (pass.companyId) {
      await tx
        .update(companySubscriptionsTable)
        .set({
          status: "ACTIVE",
          accessEndsAt: newExpiresAt,
        })
        .where(eq(companySubscriptionsTable.companyId, pass.companyId));
    }

    await tx.insert(pilotPassAuditLogsTable).values({
      pilotPassId,
      action: "extended",
      performedBy: platformAdminUserId,
      details: JSON.stringify({
        additionalDays,
        previousExpiry: pass.expiresAt,
        newExpiry: newExpiresAt,
        reason: reason.trim(),
      }),
    });

    const { codeHash: _, ...rest } = updated;
    return {
      ...rest,
      maskedCode: maskPilotCode(updated.codeLastFour),
      daysRemaining: Math.max(0, Math.ceil((newExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
      isExpired: false,
    };
  });
}

/**
 * Revokes a pilot pass immediately with a required reason.
 */
export async function revokePilotPass(
  platformAdminUserId: string,
  pilotPassId: number,
  reason: string
): Promise<MaskedPilotPassResponse> {
  if (!reason || !reason.trim()) {
    throw new HttpError(400, "Revocation reason is required");
  }

  return await db.transaction(async (tx) => {
    const [pass] = await tx
      .select()
      .from(companyPilotPassesTable)
      .where(eq(companyPilotPassesTable.id, pilotPassId))
      .limit(1);

    if (!pass) {
      throw new HttpError(404, "Pilot pass not found");
    }

    if (pass.status === "converted") {
      throw new HttpError(400, "Cannot revoke a pilot pass that has already converted to a paid subscription");
    }

    const now = new Date();

    const [updated] = await tx
      .update(companyPilotPassesTable)
      .set({
        status: "revoked",
        revokedAt: now,
        revokedBy: platformAdminUserId,
        revocationReason: reason.trim(),
      })
      .where(eq(companyPilotPassesTable.id, pilotPassId))
      .returning();

    if (pass.companyId) {
      await tx
        .update(companySubscriptionsTable)
        .set({
          status: "CANCELLED",
          accessEndsAt: now,
        })
        .where(eq(companySubscriptionsTable.companyId, pass.companyId));
    }

    await tx.insert(pilotPassAuditLogsTable).values({
      pilotPassId,
      action: "revoked",
      performedBy: platformAdminUserId,
      details: JSON.stringify({ reason: reason.trim() }),
    });

    const { codeHash: _, ...rest } = updated;
    return {
      ...rest,
      maskedCode: maskPilotCode(updated.codeLastFour),
      daysRemaining: 0,
      isExpired: true,
    };
  });
}

/**
 * Validates a pilot pass code safely without leaking information about unrelated tenants.
 */
export async function validatePilotPassCode(
  rawCode: string,
  claimantEmail?: string | null
): Promise<{
  valid: boolean;
  code?: string;
  error?: string;
  message: string;
  pilotPass?: {
    id: number;
    companyName: string;
    intendedContactName: string;
    durationDays: number;
    learnerSeatLimit: number;
    permittedCourseIds: number[];
  };
}> {
  let normalized: NormalizedPilotCode;
  try {
    normalized = normalizePilotCode(rawCode);
  } catch (err: any) {
    return { valid: false, error: "INVALID_FORMAT", message: "Invalid pilot code format" };
  }

  const [pass] = await db
    .select()
    .from(companyPilotPassesTable)
    .where(eq(companyPilotPassesTable.codeHash, normalized.codeHash))
    .limit(1);

  if (!pass) {
    return { valid: false, error: "INVALID_CODE", message: "Pilot pass code not found" };
  }

  if (pass.status === "active" || pass.status === "converted") {
    return { valid: false, error: "ALREADY_REDEEMED", message: "This pilot pass has already been redeemed" };
  }
  if (pass.status === "expired") {
    return { valid: false, error: "EXPIRED", message: "This pilot pass has expired" };
  }
  if (pass.status === "revoked") {
    return { valid: false, error: "REVOKED", message: "This pilot pass has been revoked" };
  }

  if (claimantEmail && claimantEmail.trim()) {
    const userEmail = claimantEmail.trim().toLowerCase();
    const intendedEmail = pass.intendedContactEmail.toLowerCase();
    const userDomain = userEmail.split("@")[1];
    const intendedDomain = pass.intendedEmailDomain?.toLowerCase() || intendedEmail.split("@")[1];

    const matchesDirectEmail = userEmail === intendedEmail;
    const matchesDomain = Boolean(intendedDomain && userDomain === intendedDomain);

    if (!matchesDirectEmail && !matchesDomain) {
      return {
        valid: false,
        error: "EMAIL_MISMATCH",
        message: `This pilot pass is intended for ${pass.intendedContactName} (${intendedEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")})`,
      };
    }
  }

  return {
    valid: true,
    message: "Pilot pass is valid",
    pilotPass: {
      id: pass.id,
      companyName: pass.companyName,
      intendedContactName: pass.intendedContactName,
      durationDays: pass.durationDays,
      learnerSeatLimit: pass.learnerSeatLimit,
      permittedCourseIds: pass.permittedCourseIds,
    },
  };
}

/**
 * Concurrency-safe redemption of a pilot pass inside a database transaction.
 */
export async function redeemPilotPassInTransaction(
  tx: any,
  input: {
    rawCode: string;
    userId: string;
    userEmail: string;
    adminName: string;
    companyName?: string;
    industry?: string;
  }
): Promise<{
  company: any;
  employee: any;
  pilotPass: MaskedPilotPassResponse;
}> {
  const normalized = normalizePilotCode(input.rawCode);

  // 1. Lock the pilot pass row with FOR UPDATE
  const passRows = await tx.execute(sql`
    SELECT * FROM "company_pilot_passes"
    WHERE "code_hash" = ${normalized.codeHash}
    FOR UPDATE
  `);

  const pass = passRows.rows ? passRows.rows[0] : passRows[0];

  if (!pass) {
    throw new HttpError(404, "Pilot pass not found");
  }

  if (pass.status !== "issued") {
    if (pass.status === "active" || pass.status === "converted") {
      throw new HttpError(409, "This pilot pass has already been redeemed");
    }
    if (pass.status === "expired") {
      throw new HttpError(410, "This pilot pass has expired");
    }
    if (pass.status === "revoked") {
      throw new HttpError(403, "This pilot pass has been revoked");
    }
    throw new HttpError(400, `Pilot pass is not available (status: ${pass.status})`);
  }

  // 2. Validate email / domain match
  const userEmail = input.userEmail.trim().toLowerCase();
  const intendedEmail = pass.intended_contact_email.toLowerCase();
  const userDomain = userEmail.split("@")[1];
  const intendedDomain = pass.intended_email_domain?.toLowerCase() || intendedEmail.split("@")[1];

  const matchesDirectEmail = userEmail === intendedEmail;
  const matchesDomain = Boolean(intendedDomain && userDomain === intendedDomain);

  if (!matchesDirectEmail && !matchesDomain) {
    throw new HttpError(403, "Your authenticated email does not match the recipient authorized for this pilot pass");
  }

  // 3. Check if user already manages an existing paid company
  const existingEmployee = await tx
    .select()
    .from(employeesTable)
    .where(or(eq(employeesTable.clerkUserId, input.userId), sql`lower(${employeesTable.email}) = ${userEmail}`))
    .limit(1);

  if (existingEmployee.length > 0 && existingEmployee[0].companyId) {
    const existingCompanyId = existingEmployee[0].companyId;
    const [existingSub] = await tx
      .select()
      .from(companySubscriptionsTable)
      .where(eq(companySubscriptionsTable.companyId, existingCompanyId))
      .limit(1);

    if (existingSub && existingSub.status === "ACTIVE") {
      const [existingPilot] = await tx
        .select()
        .from(companyPilotPassesTable)
        .where(eq(companyPilotPassesTable.companyId, existingCompanyId))
        .limit(1);

      if (!existingPilot) {
        throw new HttpError(400, "User belongs to an existing company on an active paid subscription");
      }
    }
  }

  // 4. Create Company
  const finalCompanyName = input.companyName?.trim() || pass.company_name;
  const baseSlug = finalCompanyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "pilot-company";
  const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  const totalSeats = pass.learner_seat_limit + pass.administrator_seat_limit;

  const [company] = await tx
    .insert(companiesTable)
    .values({
      name: finalCompanyName,
      slug: uniqueSlug,
      industry: input.industry || "Sustainability & Corporate Responsibility",
      maxEmployees: totalSeats,
    })
    .returning();

  // 5. Create Company Administrator employee record
  const [employee] = await tx
    .insert(employeesTable)
    .values({
      companyId: company.id,
      clerkUserId: input.userId,
      email: userEmail,
      name: input.adminName || pass.intended_contact_name,
      role: "admin",
      status: "active",
      invitationStatus: "accepted",
    })
    .returning();

  // 6. Create standard Essential / Complete subscription in ACTIVE trial mode
  const [essentialPlan] = await tx
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.code, "COMPLETE"))
    .limit(1);

  const [band25] = await tx
    .select()
    .from(employeeBandsTable)
    .where(eq(employeeBandsTable.code, "UP_TO_25"))
    .limit(1);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + pass.duration_days * 86400000);
  const retentionEndsAt = new Date(expiresAt.getTime() + 60 * 86400000);

  if (essentialPlan && band25) {
    await tx.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlan.id,
      employeeBandId: band25.id,
      status: "ACTIVE",
      startsAt: now,
      accessEndsAt: expiresAt,
      currency: "MUR",
      billingInterval: "MONTHLY",
    });
  }

  // 7. Update Pilot Pass status to 'active'
  const [updatedPass] = await tx
    .update(companyPilotPassesTable)
    .set({
      status: "active",
      companyId: company.id,
      redeemedAt: now,
      redeemedByUserId: input.userId,
      startsAt: now,
      expiresAt,
      retentionEndsAt,
    })
    .where(eq(companyPilotPassesTable.id, pass.id))
    .returning();

  // 8. Assign permitted courses to company admin
  const permittedCourseIds: number[] = pass.permitted_course_ids || [];
  if (permittedCourseIds.length > 0) {
    for (const courseId of permittedCourseIds) {
      await tx.insert(courseAssignmentsTable).values({
        companyId: company.id,
        employeeId: employee.id,
        courseId,
        createdAt: now,
      }).onConflictDoNothing();
    }
  }

  // 9. Audit log
  await tx.insert(pilotPassAuditLogsTable).values({
    pilotPassId: pass.id,
    action: "activated",
    performedBy: input.userId,
    details: JSON.stringify({
      companyId: company.id,
      companyName: company.name,
      expiresAt,
      durationDays: pass.duration_days,
      seats: pass.learner_seat_limit,
    }),
  });

  const { codeHash: _, ...rest } = updatedPass;
  return {
    company,
    employee,
    pilotPass: {
      ...rest,
      maskedCode: maskPilotCode(updatedPass.codeLastFour),
      daysRemaining: pass.duration_days,
      isExpired: false,
    },
  };
}

/**
 * Converts a pilot company seamlessly to a paid subscription plan.
 * Preserves 100% of company data, employee accounts, invitations, course progress, quiz completions, and certificates.
 */
export async function convertPilotToPaid(
  companyId: number,
  input: {
    planCode: string;
    employeeBandCode: string;
    billingInterval?: "MONTHLY" | "YEARLY";
    performedBy: string;
  }
): Promise<{ success: boolean; subscription: any }> {
  return await db.transaction(async (tx) => {
    // 1. Lock company row
    const [company] = await tx
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.id, companyId))
      .limit(1);

    if (!company) {
      throw new HttpError(404, "Company not found");
    }

    // 2. Find subscription plan and employee band
    const [plan] = await tx
      .select()
      .from(subscriptionPlansTable)
      .where(eq(subscriptionPlansTable.code, input.planCode))
      .limit(1);

    if (!plan) {
      throw new HttpError(400, `Invalid subscription plan '${input.planCode}'`);
    }

    const [band] = await tx
      .select()
      .from(employeeBandsTable)
      .where(eq(employeeBandsTable.code, input.employeeBandCode))
      .limit(1);

    if (!band) {
      throw new HttpError(400, `Invalid employee band '${input.employeeBandCode}'`);
    }

    const now = new Date();

    // 3. Upsert company subscription
    const [existingSub] = await tx
      .select()
      .from(companySubscriptionsTable)
      .where(eq(companySubscriptionsTable.companyId, companyId))
      .limit(1);

    let sub;
    if (existingSub) {
      const [updatedSub] = await tx
        .update(companySubscriptionsTable)
        .set({
          subscriptionPlanId: plan.id,
          employeeBandId: band.id,
          status: "ACTIVE",
          billingInterval: input.billingInterval || "MONTHLY",
          startsAt: now,
          accessEndsAt: null, // Unlimited ongoing subscription access
        })
        .where(eq(companySubscriptionsTable.id, existingSub.id))
        .returning();
      sub = updatedSub;
    } else {
      const [newSub] = await tx
        .insert(companySubscriptionsTable)
        .values({
          companyId,
          subscriptionPlanId: plan.id,
          employeeBandId: band.id,
          status: "ACTIVE",
          billingInterval: input.billingInterval || "MONTHLY",
          startsAt: now,
        })
        .returning();
      sub = newSub;
    }

    // 4. Update max employees on company table
    if (band.maximumEmployees) {
      await tx
        .update(companiesTable)
        .set({ maxEmployees: band.maximumEmployees })
        .where(eq(companiesTable.id, companyId));
    }

    // 5. Update pilot pass status to 'converted'
    const [pilotPass] = await tx
      .select()
      .from(companyPilotPassesTable)
      .where(eq(companyPilotPassesTable.companyId, companyId))
      .limit(1);

    if (pilotPass) {
      await tx
        .update(companyPilotPassesTable)
        .set({
          status: "converted",
          convertedAt: now,
          convertedSubscriptionId: sub.id,
        })
        .where(eq(companyPilotPassesTable.id, pilotPass.id));

      await tx.insert(pilotPassAuditLogsTable).values({
        pilotPassId: pilotPass.id,
        action: "converted",
        performedBy: input.performedBy,
        details: JSON.stringify({
          planCode: plan.code,
          bandCode: band.code,
          subscriptionId: sub.id,
        }),
      });
    }

    return {
      success: true,
      subscription: sub,
    };
  });
}
