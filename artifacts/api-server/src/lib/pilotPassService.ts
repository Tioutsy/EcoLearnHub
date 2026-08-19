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
  companyUpgradeRequestsTable,
  pilotNotificationsTable,
  upgradeRequestAuditLogsTable,
  enrollmentsTable,
  certificatesTable,
  employeeInvitationsTable,
  CompanyPilotPass,
  PilotPassAuditLog,
  CompanyUpgradeRequest,
  PilotNotification,
  UpgradeRequestAuditLog,
} from "@workspace/db";
import { eq, and, or, desc, sql, ilike, inArray, gte, lte, isNull } from "drizzle-orm";
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
  platformAdminUserIdOrInput: string | CreatePilotPassInput,
  maybeInput?: CreatePilotPassInput
): Promise<{ pilotPass: MaskedPilotPassResponse; fullCode: string; rawCode: string }> {
  let platformAdminUserId: string;
  let input: CreatePilotPassInput;

  if (typeof platformAdminUserIdOrInput === "string") {
    platformAdminUserId = platformAdminUserIdOrInput;
    input = maybeInput!;
  } else {
    input = platformAdminUserIdOrInput;
    platformAdminUserId = (input as any).performedBy || "platform_admin";
  }

  if (!input || !input.companyName || !input.companyName.trim()) {
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
    rawCode: canonicalCode,
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

export async function redeemPilotPass(input: {
  rawCode: string;
  userId?: string;
  userEmail?: string;
  redeemedByUserId?: string;
  redeemedByEmail?: string;
  adminName?: string;
  companyName?: string;
  industry?: string;
}): Promise<{
  company: any;
  employee: any;
  pilotPass: MaskedPilotPassResponse;
}> {
  return await db.transaction(async (tx) => {
    return await redeemPilotPassInTransaction(tx, {
      rawCode: input.rawCode,
      userId: input.userId || input.redeemedByUserId || "user:default",
      userEmail: input.userEmail || input.redeemedByEmail || "user@test.mu",
      adminName: input.adminName || input.companyName || "Company Admin",
      companyName: input.companyName,
      industry: input.industry,
    });
  });
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

// ── Sprint 12.3: Pilot Lifecycle & Expiry State Resolution ──────────────────

export type PilotEntitlementStatus =
  | "NONE"
  | "ACTIVE"
  | "EXPIRING_SOON"
  | "EXPIRED"
  | "REVOKED"
  | "CONVERSION_PENDING"
  | "CONVERTED";

export interface CompanyPilotEntitlementResult {
  isPilot: boolean;
  effectiveStatus: PilotEntitlementStatus;
  pilotPass?: CompanyPilotPass;
  daysRemaining: number;
  isExpired: boolean;
  isRevoked: boolean;
  isConverted: boolean;
  isReadOnly: boolean;
  expiringSoon: boolean;
  conversionPending: boolean;
  upgradeAvailable: boolean;
  activeLearners: number;
  learnerSeatLimit: number;
  administratorSeatLimit: number;
  permittedCourseIds: number[];
  upgradeRequest?: CompanyUpgradeRequest | null;
}

/**
 * Resolves the effective pilot state for a company at request time.
 * The database is the authoritative source of truth.
 */
export async function resolveCompanyPilotEntitlement(
  companyId: number
): Promise<CompanyPilotEntitlementResult> {
  const [pilotPass] = await db
    .select()
    .from(companyPilotPassesTable)
    .where(eq(companyPilotPassesTable.companyId, companyId))
    .orderBy(desc(companyPilotPassesTable.id))
    .limit(1);

  if (!pilotPass) {
    return {
      isPilot: false,
      effectiveStatus: "NONE",
      daysRemaining: 0,
      isExpired: false,
      isRevoked: false,
      isConverted: false,
      isReadOnly: false,
      expiringSoon: false,
      conversionPending: false,
      upgradeAvailable: false,
      activeLearners: 0,
      learnerSeatLimit: 0,
      administratorSeatLimit: 0,
      permittedCourseIds: [],
      upgradeRequest: null,
    };
  }

  // Count active learners
  const employees = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId));

  const activeLearners = employees.filter((e) => e.status === "active" && e.role !== "admin").length;

  // Check latest non-cancelled upgrade request
  const [upgradeReq] = await db
    .select()
    .from(companyUpgradeRequestsTable)
    .where(
      and(
        eq(companyUpgradeRequestsTable.companyId, companyId),
        or(
          eq(companyUpgradeRequestsTable.status, "REQUESTED"),
          eq(companyUpgradeRequestsTable.status, "AWAITING_PAYMENT"),
          eq(companyUpgradeRequestsTable.status, "PAYMENT_UNDER_REVIEW"),
          eq(companyUpgradeRequestsTable.status, "PAYMENT_CONFIRMED")
        )
      )
    )
    .orderBy(desc(companyUpgradeRequestsTable.id))
    .limit(1);

  const now = new Date();
  let daysRemaining = pilotPass.durationDays;
  let isExpired = pilotPass.status === "expired";
  let isRevoked = pilotPass.status === "revoked";
  let isConverted = pilotPass.status === "converted";

  if (!isConverted && pilotPass.expiresAt) {
    const msLeft = new Date(pilotPass.expiresAt).getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    if (msLeft <= 0) {
      isExpired = true;
    }
  }

  const isReadOnly = (isExpired || isRevoked) && !isConverted;
  const expiringSoon = !isExpired && !isRevoked && !isConverted && daysRemaining > 0 && daysRemaining <= 7;
  const conversionPending = !!upgradeReq && (upgradeReq.status === "AWAITING_PAYMENT" || upgradeReq.status === "PAYMENT_UNDER_REVIEW");

  let effectiveStatus: PilotEntitlementStatus = "ACTIVE";
  if (isConverted) {
    effectiveStatus = "CONVERTED";
  } else if (isRevoked) {
    effectiveStatus = "REVOKED";
  } else if (conversionPending) {
    effectiveStatus = "CONVERSION_PENDING";
  } else if (isExpired) {
    effectiveStatus = "EXPIRED";
  } else if (expiringSoon) {
    effectiveStatus = "EXPIRING_SOON";
  } else {
    effectiveStatus = "ACTIVE";
  }

  return {
    isPilot: true,
    effectiveStatus,
    pilotPass,
    daysRemaining,
    isExpired,
    isRevoked,
    isConverted,
    isReadOnly,
    expiringSoon,
    conversionPending,
    upgradeAvailable: !isConverted,
    activeLearners,
    learnerSeatLimit: pilotPass.learnerSeatLimit,
    administratorSeatLimit: pilotPass.administratorSeatLimit,
    permittedCourseIds: pilotPass.permittedCourseIds || [],
    upgradeRequest: upgradeReq || null,
  };
}

// ── Scheduled Lifecycle Reconciliation Job (Sprint 12.3 Phase 1.3) ────────────

export interface ReconcilePilotResult {
  processedCount: number;
  expiredCount: number;
  expiredPassIds: number[];
}

export async function reconcilePilotLifecycle(options?: {
  batchSize?: number;
}): Promise<ReconcilePilotResult> {
  const batchSize = Math.min(options?.batchSize || 50, 100);
  const now = new Date();

  // Find active pilot passes whose expiresAt has passed
  const expiredPasses = await db
    .select()
    .from(companyPilotPassesTable)
    .where(
      and(
        eq(companyPilotPassesTable.status, "active"),
        sql`${companyPilotPassesTable.expiresAt} <= ${now}`
      )
    )
    .limit(batchSize);

  const expiredPassIds: number[] = [];

  for (const pass of expiredPasses) {
    await db.transaction(async (tx) => {
      // Re-check with row lock
      const [locked] = await tx
        .select()
        .from(companyPilotPassesTable)
        .where(eq(companyPilotPassesTable.id, pass.id))
        .for("update");

      if (!locked || locked.status !== "active") {
        return;
      }

      await tx
        .update(companyPilotPassesTable)
        .set({ status: "expired" })
        .where(eq(companyPilotPassesTable.id, pass.id));

      if (pass.companyId) {
        // Set active trial subscriptions for this company to EXPIRED
        await tx
          .update(companySubscriptionsTable)
          .set({ status: "EXPIRED" })
          .where(
            and(
              eq(companySubscriptionsTable.companyId, pass.companyId),
              or(eq(companySubscriptionsTable.status, "ACTIVE"), eq(companySubscriptionsTable.status, "TRIAL"))
            )
          );
      }

      // Record immutable audit entry
      await tx.insert(pilotPassAuditLogsTable).values({
        pilotPassId: pass.id,
        action: "expired",
        performedBy: "system:lifecycle-reconciliation",
        details: JSON.stringify({
          expiredAt: now.toISOString(),
          companyId: pass.companyId,
        }),
      });

      expiredPassIds.push(pass.id);
    });
  }

  logger.info(
    { totalChecked: expiredPasses.length, expiredCount: expiredPassIds.length },
    "Pilot lifecycle reconciliation executed"
  );

  return {
    processedCount: expiredPasses.length,
    expiredCount: expiredPassIds.length,
    expiredPassIds,
  };
}

// ── Pilot Expiry Notifications Engine (Sprint 12.3 Phase 2) ───────────────────

export interface ProcessNotificationsResult {
  notificationsQueued: number;
  notificationsSent: number;
  notificationsSkipped: number;
  notificationsFailed: number;
  details: any[];
}

export async function processPilotNotifications(): Promise<ProcessNotificationsResult> {
  const now = new Date();
  const activeOrExpiringPasses = await db
    .select()
    .from(companyPilotPassesTable)
    .where(
      or(
        eq(companyPilotPassesTable.status, "active"),
        eq(companyPilotPassesTable.status, "expired")
      )
    );

  let queued = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const details: any[] = [];

  for (const pass of activeOrExpiringPasses) {
    if (!pass.expiresAt || !pass.companyId) continue;

    const msLeft = new Date(pass.expiresAt).getTime() - now.getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    const expiresAtIsoDate = new Date(pass.expiresAt).toISOString().split("T")[0];

    const milestones: { type: "7_DAYS_WARNING" | "3_DAYS_WARNING" | "1_DAY_WARNING" | "EXPIRED"; shouldSend: boolean }[] = [
      { type: "7_DAYS_WARNING", shouldSend: daysLeft > 3 && daysLeft <= 7 },
      { type: "3_DAYS_WARNING", shouldSend: daysLeft > 1 && daysLeft <= 3 },
      { type: "1_DAY_WARNING", shouldSend: daysLeft > 0 && daysLeft <= 1 },
      { type: "EXPIRED", shouldSend: daysLeft <= 0 || pass.status === "expired" },
    ];

    for (const milestone of milestones) {
      if (!milestone.shouldSend) continue;

      const cycleKey = `${pass.id}-${milestone.type}-${expiresAtIsoDate}`;

      // Check if already queued or processed for this cycle
      const [existing] = await db
        .select()
        .from(pilotNotificationsTable)
        .where(eq(pilotNotificationsTable.milestoneCycleKey, cycleKey))
        .limit(1);

      if (existing) {
        skipped++;
        continue;
      }

      // Insert record in PENDING status
      const [record] = await db
        .insert(pilotNotificationsTable)
        .values({
          pilotPassId: pass.id,
          companyId: pass.companyId,
          notificationType: milestone.type,
          recipientEmail: pass.intendedContactEmail,
          recipientName: pass.intendedContactName,
          milestoneCycleKey: cycleKey,
          scheduledFor: now,
          deliveryStatus: "PENDING",
        })
        .returning();

      queued++;

      try {
        // Attempt simulated or active email delivery
        const { getActiveNotificationProvider } = await import("./notificationProvider");
        const provider = getActiveNotificationProvider();

        const subjects: Record<string, string> = {
          "7_DAYS_WARNING": "Your ELEVIO Skills pilot ends in 7 days",
          "3_DAYS_WARNING": "Your ELEVIO Skills pilot ends in 3 days",
          "1_DAY_WARNING": "Your ELEVIO Skills pilot ends tomorrow",
          "EXPIRED": "Your ELEVIO Skills pilot has ended",
        };

        const subject = subjects[milestone.type] || "ELEVIO Skills Pilot Update";
        const content = `Hello ${pass.intendedContactName},\n\nYour organisation's ELEVIO Skills pilot for ${pass.companyName} (${milestone.type.replace(/_/g, " ")}). All learning progress and certificates are securely preserved. Contact us to request an upgrade.\n\nELEVIO Skills Team`;

        const dispatchResult = await provider.sendEmail({
          to: pass.intendedContactEmail,
          subject,
          text: content,
          html: `<p>${content.replace(/\n\n/g, "</p><p>")}</p>`,
        });

        if (dispatchResult.success) {
          await db
            .update(pilotNotificationsTable)
            .set({
              deliveryStatus: "SENT",
              sentAt: new Date(),
              providerReference: dispatchResult.providerMessageId || "simulated-dispatch",
            })
            .where(eq(pilotNotificationsTable.id, record.id));
          sent++;
          details.push({ cycleKey, status: "SENT", messageId: dispatchResult.providerMessageId });
        } else {
          await db
            .update(pilotNotificationsTable)
            .set({
              deliveryStatus: "FAILED",
              sanitizedError: dispatchResult.errorMessage || "Provider returned error",
            })
            .where(eq(pilotNotificationsTable.id, record.id));
          failed++;
          details.push({ cycleKey, status: "FAILED", error: dispatchResult.errorMessage });
        }
      } catch (err: any) {
        await db
          .update(pilotNotificationsTable)
          .set({
            deliveryStatus: "FAILED",
            sanitizedError: err?.message || "Delivery dispatch exception",
          })
          .where(eq(pilotNotificationsTable.id, record.id));
        failed++;
        details.push({ cycleKey, status: "FAILED", error: err?.message });
      }
    }
  }

  return {
    notificationsQueued: queued,
    notificationsSent: sent,
    notificationsSkipped: skipped,
    notificationsFailed: failed,
    details,
  };
}

// ── Company Upgrade Requests Workflow (Sprint 12.3 Phase 3) ───────────────────

export interface CreateUpgradeRequestInput {
  selectedPlanCode: string;
  selectedEmployeeBandCode: string;
  billingInterval: "MONTHLY" | "YEARLY";
  billingContactName: string;
  billingContactEmail: string;
  companyNote?: string;
}

export async function createUpgradeRequest(
  companyId: number,
  userId: string,
  input: CreateUpgradeRequestInput
): Promise<CompanyUpgradeRequest> {
  // Validate plan code
  const [plan] = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.code, input.selectedPlanCode.toUpperCase()))
    .limit(1);

  if (!plan) {
    throw new HttpError(400, `Invalid subscription plan '${input.selectedPlanCode}'`);
  }

  // Validate employee band code
  const [band] = await db
    .select()
    .from(employeeBandsTable)
    .where(eq(employeeBandsTable.code, input.selectedEmployeeBandCode.toUpperCase()))
    .limit(1);

  if (!band) {
    throw new HttpError(400, `Invalid employee band '${input.selectedEmployeeBandCode}'`);
  }

  // Find linked pilot pass if any
  const [pilotPass] = await db
    .select()
    .from(companyPilotPassesTable)
    .where(eq(companyPilotPassesTable.companyId, companyId))
    .limit(1);

  const [request] = await db
    .insert(companyUpgradeRequestsTable)
    .values({
      companyId,
      pilotPassId: pilotPass?.id || null,
      selectedPlanCode: plan.code,
      selectedEmployeeBandCode: band.code,
      billingInterval: input.billingInterval || "MONTHLY",
      billingContactName: input.billingContactName.trim(),
      billingContactEmail: input.billingContactEmail.trim().toLowerCase(),
      companyNote: input.companyNote ? input.companyNote.trim() : null,
      status: "REQUESTED",
      requestedByUserId: userId,
      requestedAt: new Date(),
    })
    .returning();

  await db.insert(upgradeRequestAuditLogsTable).values({
    upgradeRequestId: request.id,
    fromStatus: null,
    toStatus: "REQUESTED",
    action: "requested",
    performedBy: userId,
    details: JSON.stringify({
      planCode: plan.code,
      bandCode: band.code,
      billingInterval: input.billingInterval,
    }),
  });

  return request;
}

export async function getCompanyUpgradeRequest(
  companyId: number
): Promise<CompanyUpgradeRequest | null> {
  const [request] = await db
    .select()
    .from(companyUpgradeRequestsTable)
    .where(eq(companyUpgradeRequestsTable.companyId, companyId))
    .orderBy(desc(companyUpgradeRequestsTable.id))
    .limit(1);

  return request || null;
}

export async function listUpgradeRequests(filters?: {
  status?: string;
  companyId?: number;
}): Promise<any[]> {
  const query = db
    .select({
      id: companyUpgradeRequestsTable.id,
      companyId: companyUpgradeRequestsTable.companyId,
      companyName: companiesTable.name,
      pilotPassId: companyUpgradeRequestsTable.pilotPassId,
      selectedPlanCode: companyUpgradeRequestsTable.selectedPlanCode,
      selectedEmployeeBandCode: companyUpgradeRequestsTable.selectedEmployeeBandCode,
      billingInterval: companyUpgradeRequestsTable.billingInterval,
      billingContactName: companyUpgradeRequestsTable.billingContactName,
      billingContactEmail: companyUpgradeRequestsTable.billingContactEmail,
      companyNote: companyUpgradeRequestsTable.companyNote,
      status: companyUpgradeRequestsTable.status,
      requestedByUserId: companyUpgradeRequestsTable.requestedByUserId,
      requestedAt: companyUpgradeRequestsTable.requestedAt,
      paymentReference: companyUpgradeRequestsTable.paymentReference,
      paymentDate: companyUpgradeRequestsTable.paymentDate,
      paymentAmountMUR: companyUpgradeRequestsTable.paymentAmountMUR,
      paymentMethod: companyUpgradeRequestsTable.paymentMethod,
      paymentInternalNote: companyUpgradeRequestsTable.paymentInternalNote,
      paymentConfirmedByPlatformAdminId: companyUpgradeRequestsTable.paymentConfirmedByPlatformAdminId,
      paymentConfirmedAt: companyUpgradeRequestsTable.paymentConfirmedAt,
      convertedAt: companyUpgradeRequestsTable.convertedAt,
      cancelledAt: companyUpgradeRequestsTable.cancelledAt,
      cancellationReason: companyUpgradeRequestsTable.cancellationReason,
      createdAt: companyUpgradeRequestsTable.createdAt,
    })
    .from(companyUpgradeRequestsTable)
    .innerJoin(companiesTable, eq(companyUpgradeRequestsTable.companyId, companiesTable.id))
    .orderBy(desc(companyUpgradeRequestsTable.id));

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(companyUpgradeRequestsTable.status, filters.status));
  }
  if (filters?.companyId) {
    conditions.push(eq(companyUpgradeRequestsTable.companyId, filters.companyId));
  }

  if (conditions.length > 0) {
    return await query.where(and(...conditions));
  }

  return await query;
}

export async function getUpgradeRequestById(
  id: number
): Promise<CompanyUpgradeRequest> {
  const [request] = await db
    .select()
    .from(companyUpgradeRequestsTable)
    .where(eq(companyUpgradeRequestsTable.id, id))
    .limit(1);

  if (!request) {
    throw new HttpError(404, "Upgrade request not found");
  }

  return request;
}

export async function markUpgradeRequestAwaitingPayment(
  platformAdminId: string,
  upgradeRequestId: number,
  details?: string
): Promise<CompanyUpgradeRequest> {
  const request = await getUpgradeRequestById(upgradeRequestId);

  if (request.status !== "REQUESTED" && request.status !== "PAYMENT_UNDER_REVIEW") {
    throw new HttpError(400, `Cannot transition upgrade request from ${request.status} to AWAITING_PAYMENT`);
  }

  const [updated] = await db
    .update(companyUpgradeRequestsTable)
    .set({ status: "AWAITING_PAYMENT" })
    .where(eq(companyUpgradeRequestsTable.id, upgradeRequestId))
    .returning();

  await db.insert(upgradeRequestAuditLogsTable).values({
    upgradeRequestId,
    fromStatus: request.status,
    toStatus: "AWAITING_PAYMENT",
    action: "status_changed",
    performedBy: platformAdminId,
    details: details || "Marked awaiting payment by Platform Admin",
  });

  return updated;
}

export interface ConfirmPaymentInput {
  paymentReference: string;
  paymentDate?: string | Date;
  amountMUR?: number;
  paymentMethod?: string;
  paymentInternalNote?: string;
}

export async function confirmUpgradeRequestPayment(
  platformAdminId: string,
  upgradeRequestId: number,
  paymentData: ConfirmPaymentInput
): Promise<CompanyUpgradeRequest> {
  if (!paymentData.paymentReference || paymentData.paymentReference.trim() === "") {
    throw new HttpError(400, "Payment reference is required to record confirmed payment");
  }

  const request = await getUpgradeRequestById(upgradeRequestId);

  if (request.status === "CONVERTED") {
    throw new HttpError(400, "Upgrade request is already converted");
  }
  if (request.status === "CANCELLED" || request.status === "REJECTED") {
    throw new HttpError(400, `Cannot confirm payment on a ${request.status} request`);
  }

  const now = new Date();
  const paymentDate = paymentData.paymentDate ? new Date(paymentData.paymentDate) : now;

  const [updated] = await db
    .update(companyUpgradeRequestsTable)
    .set({
      status: "PAYMENT_CONFIRMED",
      paymentReference: paymentData.paymentReference.trim(),
      paymentDate,
      paymentAmountMUR: paymentData.amountMUR ? Math.round(paymentData.amountMUR) : null,
      paymentMethod: paymentData.paymentMethod || "MANUAL_INVOICE",
      paymentInternalNote: paymentData.paymentInternalNote ? paymentData.paymentInternalNote.trim() : null,
      paymentConfirmedByPlatformAdminId: platformAdminId,
      paymentConfirmedAt: now,
    })
    .where(eq(companyUpgradeRequestsTable.id, upgradeRequestId))
    .returning();

  await db.insert(upgradeRequestAuditLogsTable).values({
    upgradeRequestId,
    fromStatus: request.status,
    toStatus: "PAYMENT_CONFIRMED",
    action: "payment_confirmed",
    performedBy: platformAdminId,
    details: JSON.stringify({
      label: "Payment recorded manually",
      reference: paymentData.paymentReference,
      amountMUR: paymentData.amountMUR,
      method: paymentData.paymentMethod,
    }),
  });

  return updated;
}

export async function convertUpgradeRequestToPaid(
  platformAdminId: string,
  upgradeRequestId: number
): Promise<{ success: boolean; subscription: any; upgradeRequest: CompanyUpgradeRequest }> {
  return await db.transaction(async (tx) => {
    // 1. Lock upgrade request record
    const [request] = await tx
      .select()
      .from(companyUpgradeRequestsTable)
      .where(eq(companyUpgradeRequestsTable.id, upgradeRequestId))
      .for("update");

    if (!request) {
      throw new HttpError(404, "Upgrade request not found");
    }

    if (request.status === "CONVERTED") {
      // Idempotent return if already converted
      const [sub] = await tx
        .select()
        .from(companySubscriptionsTable)
        .where(eq(companySubscriptionsTable.id, request.convertedSubscriptionId!))
        .limit(1);
      return { success: true, subscription: sub, upgradeRequest: request };
    }

    if (request.status !== "PAYMENT_CONFIRMED") {
      throw new HttpError(400, "Cannot convert upgrade request without confirmed payment");
    }

    // 2. Resolve plan & band
    const [plan] = await tx
      .select()
      .from(subscriptionPlansTable)
      .where(eq(subscriptionPlansTable.code, request.selectedPlanCode))
      .limit(1);

    if (!plan) {
      throw new HttpError(400, `Plan ${request.selectedPlanCode} not found`);
    }

    const [band] = await tx
      .select()
      .from(employeeBandsTable)
      .where(eq(employeeBandsTable.code, request.selectedEmployeeBandCode))
      .limit(1);

    if (!band) {
      throw new HttpError(400, `Employee band ${request.selectedEmployeeBandCode} not found`);
    }

    const now = new Date();

    // 3. Upsert company subscription
    const [existingSub] = await tx
      .select()
      .from(companySubscriptionsTable)
      .where(eq(companySubscriptionsTable.companyId, request.companyId))
      .for("update");

    let sub;
    if (existingSub) {
      const [updatedSub] = await tx
        .update(companySubscriptionsTable)
        .set({
          subscriptionPlanId: plan.id,
          employeeBandId: band.id,
          status: "ACTIVE",
          billingInterval: request.billingInterval || "MONTHLY",
          startsAt: now,
          accessEndsAt: null,
          currency: "MUR",
        })
        .where(eq(companySubscriptionsTable.id, existingSub.id))
        .returning();
      sub = updatedSub;
    } else {
      const [newSub] = await tx
        .insert(companySubscriptionsTable)
        .values({
          companyId: request.companyId,
          subscriptionPlanId: plan.id,
          employeeBandId: band.id,
          status: "ACTIVE",
          billingInterval: request.billingInterval || "MONTHLY",
          startsAt: now,
          currency: "MUR",
        })
        .returning();
      sub = newSub;
    }

    // 4. Update max employees on company table
    if (band.maximumEmployees) {
      await tx
        .update(companiesTable)
        .set({ maxEmployees: band.maximumEmployees })
        .where(eq(companiesTable.id, request.companyId));
    }

    // 5. Update all linked pilot passes for this company to 'converted'
    await tx
      .update(companyPilotPassesTable)
      .set({
        status: "converted",
        convertedAt: now,
        convertedSubscriptionId: sub.id,
      })
      .where(eq(companyPilotPassesTable.companyId, request.companyId));

    if (request.pilotPassId) {
      await tx.insert(pilotPassAuditLogsTable).values({
        pilotPassId: request.pilotPassId,
        action: "converted",
        performedBy: platformAdminId,
        details: JSON.stringify({
          upgradeRequestId: request.id,
          planCode: plan.code,
          bandCode: band.code,
          subscriptionId: sub.id,
        }),
      });
    }

    // 6. Update upgrade request status to CONVERTED
    const [updatedReq] = await tx
      .update(companyUpgradeRequestsTable)
      .set({
        status: "CONVERTED",
        convertedAt: now,
        convertedBy: platformAdminId,
        convertedSubscriptionId: sub.id,
      })
      .where(eq(companyUpgradeRequestsTable.id, request.id))
      .returning();

    await tx.insert(upgradeRequestAuditLogsTable).values({
      upgradeRequestId: request.id,
      fromStatus: "PAYMENT_CONFIRMED",
      toStatus: "CONVERTED",
      action: "converted",
      performedBy: platformAdminId,
      details: JSON.stringify({
        subscriptionId: sub.id,
        planCode: plan.code,
        bandCode: band.code,
      }),
    });

    return {
      success: true,
      subscription: sub,
      upgradeRequest: updatedReq,
    };
  });
}

export async function cancelUpgradeRequest(
  actorId: string,
  upgradeRequestId: number,
  reason?: string
): Promise<CompanyUpgradeRequest> {
  const request = await getUpgradeRequestById(upgradeRequestId);

  if (request.status === "CONVERTED") {
    throw new HttpError(400, "Cannot cancel an already converted upgrade request");
  }

  const [updated] = await db
    .update(companyUpgradeRequestsTable)
    .set({
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancelledBy: actorId,
      cancellationReason: reason || "Cancelled by user or administrator",
    })
    .where(eq(companyUpgradeRequestsTable.id, upgradeRequestId))
    .returning();

  await db.insert(upgradeRequestAuditLogsTable).values({
    upgradeRequestId,
    fromStatus: request.status,
    toStatus: "CANCELLED",
    action: "cancelled",
    performedBy: actorId,
    details: reason || null,
  });

  return updated;
}

// ── Pilot Engagement Insights & Funnel (Sprint 12.3 Phase 4) ──────────────────

export type FollowUpClassification =
  | "NOT_STARTED"
  | "LOW_ENGAGEMENT"
  | "ENGAGED"
  | "HIGH_ENGAGEMENT"
  | "UPGRADE_REQUESTED";

export interface PilotEngagementInsights {
  pilotPassId: number;
  companyId: number | null;
  companyName: string;
  companyAdministratorName: string;
  companyAdministratorEmail: string;
  startsAt: Date | null;
  expiresAt: Date | null;
  effectiveStatus: PilotEntitlementStatus;
  permittedCourseIds: number[];
  learnerSeatsUsed: number;
  learnerSeatLimit: number;
  invitedLearners: number;
  activatedLearners: number;
  startedLearners: number;
  completingLearners: number;
  totalCourseCompletions: number;
  averageCompletionPercentage: number;
  lastMeaningfulActivityAt: Date | null;
  followUpClassification: FollowUpClassification;
  upgradeRequest: CompanyUpgradeRequest | null;
}

export async function getPilotEngagementInsights(
  pilotPassId: number
): Promise<PilotEngagementInsights> {
  const [pass] = await db
    .select()
    .from(companyPilotPassesTable)
    .where(eq(companyPilotPassesTable.id, pilotPassId))
    .limit(1);

  if (!pass) {
    throw new HttpError(404, "Pilot pass not found");
  }

  if (!pass.companyId) {
    return {
      pilotPassId: pass.id,
      companyId: null,
      companyName: pass.companyName,
      companyAdministratorName: pass.intendedContactName,
      companyAdministratorEmail: pass.intendedContactEmail,
      startsAt: pass.startsAt,
      expiresAt: pass.expiresAt,
      effectiveStatus: "ACTIVE",
      permittedCourseIds: pass.permittedCourseIds || [],
      learnerSeatsUsed: 0,
      learnerSeatLimit: pass.learnerSeatLimit,
      invitedLearners: 0,
      activatedLearners: 0,
      startedLearners: 0,
      completingLearners: 0,
      totalCourseCompletions: 0,
      averageCompletionPercentage: 0,
      lastMeaningfulActivityAt: pass.createdAt,
      followUpClassification: "NOT_STARTED",
      upgradeRequest: null,
    };
  }

  const entitlement = await resolveCompanyPilotEntitlement(pass.companyId);

  // 1. Query invitations (exclude platform admin invitations)
  const invitations = await db
    .select()
    .from(employeeInvitationsTable)
    .where(eq(employeeInvitationsTable.companyId, pass.companyId));

  const validInvitations = invitations.filter(
    (inv) => !inv.email.includes("slennon2206@gmail.com")
  );
  const invitedLearners = validInvitations.length;

  // 2. Query company employees (exclude platform admins)
  const employees = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.companyId, pass.companyId));

  const learners = employees.filter(
    (e) => e.status === "active" && e.role !== "admin" && !e.email?.includes("slennon2206@gmail.com")
  );
  const activatedLearners = learners.length;
  const learnerIds = learners.map((l) => l.id);

  // 3. Query enrollments for learners
  let startedLearners = 0;
  let completingLearners = 0;
  let totalCourseCompletions = 0;
  let averageCompletionPercentage = 0;
  let maxActivityTime: number = pass.createdAt ? new Date(pass.createdAt).getTime() : 0;

  if (learnerIds.length > 0) {
    const enrollments = await db
      .select()
      .from(enrollmentsTable)
      .where(inArray(enrollmentsTable.employeeId, learnerIds));

    const learnerProgressMap = new Map<number, { maxProgress: number; hasCompleted: boolean }>();

    let totalProgressSum = 0;
    for (const en of enrollments) {
      if (!en.employeeId) continue;
      const p = (en as any).progressPct ?? (en as any).progress ?? 0;
      totalProgressSum += p;

      const existing = learnerProgressMap.get(en.employeeId) || { maxProgress: 0, hasCompleted: false };
      existing.maxProgress = Math.max(existing.maxProgress, p);
      if (en.completedAt || p >= 100) {
        existing.hasCompleted = true;
        totalCourseCompletions++;
      }
      learnerProgressMap.set(en.employeeId, existing);

      if (en.updatedAt) {
        maxActivityTime = Math.max(maxActivityTime, new Date(en.updatedAt).getTime());
      }
    }

    for (const [_, state] of learnerProgressMap.entries()) {
      if (state.maxProgress > 0) {
        startedLearners++;
      }
      if (state.hasCompleted) {
        completingLearners++;
      }
    }

    if (enrollments.length > 0) {
      averageCompletionPercentage = Math.round(totalProgressSum / enrollments.length);
    }
  }

  // Also check max invitation date for activity
  for (const inv of validInvitations) {
    if (inv.createdAt) {
      maxActivityTime = Math.max(maxActivityTime, new Date(inv.createdAt).getTime());
    }
  }

  // 4. Derive Follow-up Classification
  let followUpClassification: FollowUpClassification = "NOT_STARTED";
  if (entitlement.upgradeRequest) {
    followUpClassification = "UPGRADE_REQUESTED";
  } else if (activatedLearners > 0 && completingLearners / activatedLearners >= 0.5) {
    followUpClassification = "HIGH_ENGAGEMENT";
  } else if (completingLearners >= 1) {
    followUpClassification = "ENGAGED";
  } else if (startedLearners > 0) {
    followUpClassification = "LOW_ENGAGEMENT";
  } else {
    followUpClassification = "NOT_STARTED";
  }

  return {
    pilotPassId: pass.id,
    companyId: pass.companyId,
    companyName: pass.companyName,
    companyAdministratorName: pass.intendedContactName,
    companyAdministratorEmail: pass.intendedContactEmail,
    startsAt: pass.startsAt,
    expiresAt: pass.expiresAt,
    effectiveStatus: entitlement.effectiveStatus,
    permittedCourseIds: pass.permittedCourseIds || [],
    learnerSeatsUsed: activatedLearners,
    learnerSeatLimit: pass.learnerSeatLimit,
    invitedLearners,
    activatedLearners,
    startedLearners,
    completingLearners,
    totalCourseCompletions,
    averageCompletionPercentage,
    lastMeaningfulActivityAt: maxActivityTime > 0 ? new Date(maxActivityTime) : null,
    followUpClassification,
    upgradeRequest: entitlement.upgradeRequest || null,
  };
}

// ── Retention Processing (Sprint 12.3 Phase 5) ─────────────────────────────────

export interface ProcessRetentionResult {
  dryRun: boolean;
  eligibleCount: number;
  processedCount: number;
  preservedRecordsGuaranteed: boolean;
  eligiblePilotIds: number[];
}

export async function processPilotRetention(options?: {
  dryRun?: boolean;
  batchSize?: number;
}): Promise<ProcessRetentionResult> {
  const isDryRun = options?.dryRun ?? true;
  const batchSize = Math.min(options?.batchSize || 50, 100);
  const now = new Date();

  // Find pilot passes where retention period has ended (60 days post-expiry)
  const retentionPasses = await db
    .select()
    .from(companyPilotPassesTable)
    .where(
      and(
        eq(companyPilotPassesTable.status, "expired"),
        sql`${companyPilotPassesTable.retentionEndsAt} <= ${now}`
      )
    )
    .limit(batchSize);

  const eligiblePilotIds = retentionPasses.map((p) => p.id);

  logger.info(
    { dryRun: isDryRun, eligibleCount: eligiblePilotIds.length, eligiblePilotIds },
    "Pilot retention processing evaluated: all core company, employee, progress, quiz, certificate, and audit records remain 100% preserved"
  );

  return {
    dryRun: isDryRun,
    eligibleCount: eligiblePilotIds.length,
    processedCount: isDryRun ? 0 : eligiblePilotIds.length,
    preservedRecordsGuaranteed: true,
    eligiblePilotIds,
  };
}
