import { createHash, randomBytes } from "crypto";
import {
  db,
  companiesTable,
  employeesTable,
  employeeInvitationsTable,
  companySubscriptionsTable,
  employeeBandsTable,
  subscriptionPlansTable,
  type EmployeeInvitation,
} from "@workspace/db";
import { eq, and, sql, or } from "drizzle-orm";
import { HttpError } from "./access";
import { getCompanySeatUsage, getBandMaxSeats } from "./seatEnforcementService";
import { dispatchNotificationDelivery } from "./notificationDeliveryService";
import { logger } from "./logger";

export interface CreateInvitationInput {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  department?: string | null;
  intendedRole?: "employee" | "manager" | "admin";
}

export interface InvitationResponse {
  id: number;
  companyId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  department: string | null;
  intendedRole: string;
  displayCode: string; // Complete ELH-XXXX-XXXX on create/resend; masked ELH-••••-XXXX on list
  status: string;
  expiresAt: Date;
  invitationLink?: string;
  rawToken?: string;
  emailSent?: boolean;
  message?: string;
  createdAt: Date;
  acceptedAt?: Date | null;
}

export interface InvitationResult {
  employeeId: number;
  email: string;
  token: string;
  invitationStatus: string;
  sentAt: Date;
}

// ─── Cryptographic & Normalization Utilities ──────────────────────────────────

export function hashToken(token: string): string {
  return createHash("sha256").update(token.trim()).digest("hex");
}

export function generateSecureToken(): { rawToken: string; tokenHash: string } {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

/**
 * Normalizes user-supplied access codes to canonical format `ELH-XXXX-XXXX`.
 * Tolerates lowercase, whitespace, missing dashes, and prefixes.
 */
export function normalizeDisplayCode(input: string): {
  canonicalCode: string;
  lastFour: string;
  isValidFormat: boolean;
} {
  const cleaned = input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  let core = cleaned;
  if (core.startsWith("ELH")) {
    core = core.slice(3);
  }

  if (core.length !== 8) {
    return {
      canonicalCode: input.trim().toUpperCase(),
      lastFour: core.slice(-4),
      isValidFormat: false,
    };
  }

  const part1 = core.slice(0, 4);
  const part2 = core.slice(4, 8);
  const canonicalCode = `ELH-${part1}-${part2}`;
  const lastFour = part2;

  return {
    canonicalCode,
    lastFour,
    isValidFormat: true,
  };
}

export function hashDisplayCode(canonicalCode: string): string {
  return createHash("sha256").update(canonicalCode.trim().toUpperCase()).digest("hex");
}

export function generateDisplayCode(): {
  displayCode: string;
  displayCodeHash: string;
  displayCodeLastFour: string;
} {
  // Crockford Base32 charset without ambiguous characters (I, L, O, 0, 1)
  const charset = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += charset[bytes[i] % charset.length];
  }
  const part1 = code.slice(0, 4);
  const part2 = code.slice(4, 8);
  const displayCode = `ELH-${part1}-${part2}`;
  const displayCodeHash = hashDisplayCode(displayCode);
  const displayCodeLastFour = part2;

  return { displayCode, displayCodeHash, displayCodeLastFour };
}

export function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [user, domain] = parts;
  if (user.length <= 2) {
    return `${user[0]}*@${domain}`;
  }
  return `${user[0]}${"*".repeat(Math.min(user.length - 2, 4))}${user[user.length - 1]}@${domain}`;
}

export function maskDisplayCode(lastFour: string): string {
  return `ELH-••••-${lastFour}`;
}

// ─── Lookup Helper ────────────────────────────────────────────────────────────

export async function findInvitationBySecret(
  tokenOrCode: string,
  tx: any = db
): Promise<EmployeeInvitation | null> {
  const trimmed = tokenOrCode.trim();
  if (!trimmed) return null;

  // 1. Check if input is a display code (or code variation)
  const norm = normalizeDisplayCode(trimmed);
  if (norm.isValidFormat) {
    const codeHash = hashDisplayCode(norm.canonicalCode);
    const [invByCode] = await tx
      .select()
      .from(employeeInvitationsTable)
      .where(eq(employeeInvitationsTable.displayCodeHash, codeHash))
      .limit(1);
    if (invByCode) return invByCode;
  }

  // 2. Lookup by token hash
  const rawTokenHash = hashToken(trimmed);
  const [invByToken] = await tx
    .select()
    .from(employeeInvitationsTable)
    .where(eq(employeeInvitationsTable.tokenHash, rawTokenHash))
    .limit(1);

  if (invByToken) return invByToken;

  return null;
}

// ─── Invitation Management Operations ─────────────────────────────────────────

export async function createEmployeeInvitation(
  companyId: number,
  adminUserId: string,
  input: CreateInvitationInput,
  originBaseUrl?: string
): Promise<InvitationResponse> {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new HttpError(400, "A valid email address is required");
  }

  // 1. Intended role validation
  const intendedRole = input.intendedRole || "employee";
  if (!["employee", "manager", "admin"].includes(intendedRole)) {
    throw new HttpError(
      400,
      JSON.stringify({
        code: "FORBIDDEN_ROLE_ASSIGNMENT",
        message: "Invalid intended role. Must be employee, manager, or admin.",
      })
    );
  }

  // 2. Generate cryptographic token and secure hashed access code
  const { rawToken, tokenHash } = generateSecureToken();
  const { displayCode, displayCodeHash, displayCodeLastFour } = generateDisplayCode();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7-day validity

  // 3. Atomically check capacity & insert invitation with company row-level lock
  const { invitation, companyName } = await db.transaction(async (tx) => {
    // Acquire PostgreSQL row lock on company to prevent concurrent creation oversubscription
    await tx.execute(
      sql`SELECT id, max_employees FROM companies WHERE id = ${companyId} FOR UPDATE`
    );

    const [company] = await tx
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.id, companyId))
      .limit(1);

    if (!company) {
      throw new HttpError(404, "Company not found");
    }

    const [sub] = await tx
      .select({
        status: companySubscriptionsTable.status,
        bandCode: employeeBandsTable.code,
        bandMax: employeeBandsTable.maximumEmployees,
      })
      .from(companySubscriptionsTable)
      .leftJoin(employeeBandsTable, eq(companySubscriptionsTable.employeeBandId, employeeBandsTable.id))
      .where(eq(companySubscriptionsTable.companyId, companyId))
      .limit(1);

    if (!sub || sub.status !== "ACTIVE") {
      throw new HttpError(
        402,
        JSON.stringify({
          code: "SUBSCRIPTION_INACTIVE",
          message: "An active paid subscription is required to issue employee invitations.",
        })
      );
    }

    const maxSeats = getBandMaxSeats(sub.bandCode, company.maxEmployees ?? sub.bandMax);

    // Count active employees
    const [activeRes] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(employeesTable)
      .where(and(eq(employeesTable.companyId, companyId), eq(employeesTable.status, "active")));
    const activeCount = activeRes?.count ?? 0;

    // Count valid pending invitations
    const now = new Date();
    const [pendingRes] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(employeeInvitationsTable)
      .where(
        and(
          eq(employeeInvitationsTable.companyId, companyId),
          eq(employeeInvitationsTable.status, "pending"),
          sql`${employeeInvitationsTable.expiresAt} > ${now}`
        )
      );
    const pendingCount = pendingRes?.count ?? 0;

    if (activeCount + pendingCount >= maxSeats) {
      throw new HttpError(
        403,
        JSON.stringify({
          code: "SEAT_LIMIT_REACHED",
          message: `Employee seat limit reached (${activeCount + pendingCount} of ${maxSeats} seats reserved). Upgrade subscription band to invite more team members.`,
        })
      );
    }

    // Check for active employee with this email
    const [existingEmployee] = await tx
      .select()
      .from(employeesTable)
      .where(and(eq(employeesTable.companyId, companyId), sql`lower(${employeesTable.email}) = ${email}`))
      .limit(1);

    if (existingEmployee && existingEmployee.status === "active") {
      throw new HttpError(409, `An active employee with email '${email}' already exists in your company.`);
    }

    // Invalidate any existing pending invitation for this email in this company
    await tx
      .update(employeeInvitationsTable)
      .set({ status: "revoked", updatedAt: new Date() })
      .where(
        and(
          eq(employeeInvitationsTable.companyId, companyId),
          eq(employeeInvitationsTable.email, email),
          eq(employeeInvitationsTable.status, "pending")
        )
      );

    // Insert new invitation record
    const [inserted] = await tx
      .insert(employeeInvitationsTable)
      .values({
        companyId,
        email,
        firstName: input.firstName || null,
        lastName: input.lastName || null,
        department: input.department || null,
        intendedRole,
        tokenHash,
        displayCodeHash,
        displayCodeLastFour,
        status: "pending",
        invitedBy: adminUserId,
        expiresAt,
      })
      .returning();

    return { invitation: inserted, companyName: company.name };
  });

  const baseUrl =
    (originBaseUrl && !originBaseUrl.includes("localhost") ? originBaseUrl : null) ||
    process.env.PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    originBaseUrl ||
    "http://localhost:5173";
  const invitationLink = `${baseUrl}/join?token=${encodeURIComponent(rawToken)}`;

  // 4. Dispatch email delivery only after transaction commits successfully
  let emailSent = false;
  try {
    const delivery = await dispatchNotificationDelivery({
      notificationType: "invitation",
      recipientEmail: email,
      recipientName: [input.firstName, input.lastName].filter(Boolean).join(" ") || email.split("@")[0],
      companyId,
      deduplicationKey: `invite_${invitation.id}_${invitation.tokenHash.substring(0, 10)}`,
      templateData: {
        companyName,
        actionUrl: invitationLink,
        invitationLink,
        accessCode: displayCode,
        intendedRole,
        expiresAt,
      },
    });
    emailSent = delivery.delivered;
  } catch (err: any) {
    logger.warn({ err: err?.message }, `Notification dispatch failed for ${email}`);
    emailSent = false;
  }

  return {
    id: invitation.id,
    companyId: invitation.companyId,
    email: invitation.email,
    firstName: invitation.firstName,
    lastName: invitation.lastName,
    department: invitation.department,
    intendedRole: invitation.intendedRole,
    displayCode, // Complete code returned ONCE at creation
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    invitationLink,
    rawToken,
    emailSent,
    message: emailSent
      ? `Invitation email successfully dispatched to ${email}.`
      : `Invitation generated for ${email}. Email delivery not configured; share access code or link directly.`,
    createdAt: invitation.createdAt,
  };
}

export async function resendEmployeeInvitation(
  companyId: number,
  invitationId: number,
  originBaseUrl?: string
): Promise<InvitationResponse> {
  const { rawToken, tokenHash } = generateSecureToken();
  const { displayCode, displayCodeHash, displayCodeLastFour } = generateDisplayCode();
  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + 7);

  const { updated, companyName } = await db.transaction(async (tx) => {
    // Row-level lock on company
    await tx.execute(
      sql`SELECT id, max_employees FROM companies WHERE id = ${companyId} FOR UPDATE`
    );

    const [existing] = await tx
      .select()
      .from(employeeInvitationsTable)
      .where(and(eq(employeeInvitationsTable.id, invitationId), eq(employeeInvitationsTable.companyId, companyId)))
      .limit(1);

    if (!existing) {
      throw new HttpError(404, "Invitation not found");
    }

    if (existing.status === "accepted") {
      throw new HttpError(400, "Cannot resend an invitation that has already been accepted.");
    }

    // Authoritative subscription check
    const [sub] = await tx
      .select({ status: companySubscriptionsTable.status })
      .from(companySubscriptionsTable)
      .where(eq(companySubscriptionsTable.companyId, companyId))
      .limit(1);

    if (!sub || sub.status !== "ACTIVE") {
      throw new HttpError(402, "Active subscription required to resend invitations");
    }

    const [company] = await tx.select().from(companiesTable).where(eq(companiesTable.id, companyId)).limit(1);

    const [resendUpdated] = await tx
      .update(employeeInvitationsTable)
      .set({
        tokenHash,
        displayCodeHash,
        displayCodeLastFour,
        status: "pending",
        expiresAt: newExpiry,
        updatedAt: new Date(),
      })
      .where(eq(employeeInvitationsTable.id, invitationId))
      .returning();

    return { updated: resendUpdated, companyName: company?.name ?? "Elevio Member" };
  });

  const baseUrl =
    (originBaseUrl && !originBaseUrl.includes("localhost") ? originBaseUrl : null) ||
    process.env.PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    originBaseUrl ||
    "http://localhost:5173";
  const invitationLink = `${baseUrl}/join?token=${encodeURIComponent(rawToken)}`;

  let emailSent = false;
  try {
    const delivery = await dispatchNotificationDelivery({
      notificationType: "invitation",
      recipientEmail: updated.email,
      recipientName: [updated.firstName, updated.lastName].filter(Boolean).join(" ") || updated.email.split("@")[0],
      companyId,
      deduplicationKey: `invite_resend_${updated.id}_${updated.tokenHash.substring(0, 10)}`,
      templateData: {
        companyName,
        actionUrl: invitationLink,
        invitationLink,
        accessCode: displayCode,
        intendedRole: updated.intendedRole,
        expiresAt: newExpiry,
      },
    });
    emailSent = delivery.delivered;
  } catch (err: any) {
    emailSent = false;
  }

  return {
    id: updated.id,
    companyId: updated.companyId,
    email: updated.email,
    firstName: updated.firstName,
    lastName: updated.lastName,
    department: updated.department,
    intendedRole: updated.intendedRole,
    displayCode, // Fresh complete code returned on resend
    status: updated.status,
    expiresAt: updated.expiresAt,
    invitationLink,
    rawToken,
    emailSent,
    message: emailSent
      ? `Refreshed invitation sent to ${updated.email}.`
      : `New secure link and code generated for ${updated.email}.`,
    createdAt: updated.createdAt,
  };
}

export async function revokeEmployeeInvitation(
  companyId: number,
  invitationId: number
): Promise<{ success: boolean; message: string }> {
  return await db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT id, max_employees FROM companies WHERE id = ${companyId} FOR UPDATE`
    );

    const [updated] = await tx
      .update(employeeInvitationsTable)
      .set({
        status: "revoked",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(employeeInvitationsTable.id, invitationId),
          eq(employeeInvitationsTable.companyId, companyId)
        )
      )
      .returning();

    if (!updated) {
      throw new HttpError(404, "Invitation not found");
    }

    return {
      success: true,
      message: "Invitation has been revoked. The reserved seat has been released.",
    };
  });
}

export async function listCompanyInvitations(companyId: number): Promise<InvitationResponse[]> {
  const rows = await db
    .select()
    .from(employeeInvitationsTable)
    .where(eq(employeeInvitationsTable.companyId, companyId))
    .orderBy(sql`${employeeInvitationsTable.createdAt} DESC`);

  const now = new Date();

  return rows.map((inv) => {
    let computedStatus = inv.status;
    if (inv.status === "pending" && new Date(inv.expiresAt) < now) {
      computedStatus = "expired";
    }

    return {
      id: inv.id,
      companyId: inv.companyId,
      email: inv.email,
      firstName: inv.firstName,
      lastName: inv.lastName,
      department: inv.department,
      intendedRole: inv.intendedRole,
      displayCode: maskDisplayCode(inv.displayCodeLastFour), // Always return masked code in list
      status: computedStatus,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
      acceptedAt: inv.acceptedAt,
    };
  });
}

// ─── Public Safe Pre-Validation ───────────────────────────────────────────────

export async function validateInvitation(tokenOrCode: string): Promise<{
  valid: boolean;
  companyId: number;
  companyName: string;
  logoUrl: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  department: string | null;
  intendedRole: string;
  expiresAt: Date;
  status: string;
}> {
  const inv = await findInvitationBySecret(tokenOrCode);
  if (!inv) {
    throw new HttpError(
      404,
      JSON.stringify({
        code: "INVITATION_INVALID",
        message: "Invalid or expired invitation token or access code.",
      })
    );
  }

  if (inv.status === "revoked") {
    throw new HttpError(
      403,
      JSON.stringify({
        code: "INVITATION_REVOKED",
        message: "This invitation has been revoked by your company administrator.",
      })
    );
  }

  if (inv.status === "accepted") {
    throw new HttpError(
      400,
      JSON.stringify({
        code: "INVITATION_ALREADY_USED",
        message: "This invitation has already been accepted.",
      })
    );
  }

  if (new Date(inv.expiresAt) < new Date()) {
    throw new HttpError(
      400,
      JSON.stringify({
        code: "INVITATION_EXPIRED",
        message: "This invitation has expired. Please contact your company administrator.",
      })
    );
  }

  // Check company subscription status
  const seatUsage = await getCompanySeatUsage(inv.companyId);
  if (seatUsage.subscriptionStatus !== "ACTIVE") {
    throw new HttpError(
      402,
      JSON.stringify({
        code: "SUBSCRIPTION_INACTIVE",
        message: "The company's subscription is not active. Please contact your company administrator.",
      })
    );
  }

  const [company] = await db
    .select({ name: companiesTable.name, logoUrl: companiesTable.logoUrl })
    .from(companiesTable)
    .where(eq(companiesTable.id, inv.companyId))
    .limit(1);

  return {
    valid: true,
    companyId: inv.companyId,
    companyName: company?.name ?? "Elevio Corporate Member",
    logoUrl: company?.logoUrl ?? null,
    email: maskEmail(inv.email), // Masked email for privacy
    firstName: inv.firstName,
    lastName: inv.lastName,
    department: inv.department,
    intendedRole: inv.intendedRole,
    expiresAt: inv.expiresAt,
    status: inv.status,
  };
}

// ─── Concurrency-Safe Atomic Acceptance ───────────────────────────────────────

export async function acceptEmployeeInvitation(
  tokenOrCode: string,
  clerkUserId: string,
  sessionEmail?: string | null
): Promise<{
  success: boolean;
  companyId: number;
  companyName: string;
  employeeId: number;
  role: string;
  redirectUrl: string;
}> {
  if (!clerkUserId) {
    throw new HttpError(401, "Authentication required to accept invitation");
  }

  return await db.transaction(async (tx) => {
    const inv = await findInvitationBySecret(tokenOrCode, tx);
    if (!inv) {
      throw new HttpError(
        404,
        JSON.stringify({
          code: "INVITATION_INVALID",
          message: "Invalid or expired invitation token or access code.",
        })
      );
    }

    // 1. Row-level lock on companiesTable to prevent concurrent seat oversubscription
    await tx.execute(
      sql`SELECT id, max_employees FROM companies WHERE id = ${inv.companyId} FOR UPDATE`
    );

    if (inv.status === "revoked") {
      throw new HttpError(
        403,
        JSON.stringify({
          code: "INVITATION_REVOKED",
          message: "This invitation has been revoked by your company administrator.",
        })
      );
    }

    // Idempotency: check if this user already accepted this invitation or is an active member
    const [existingUserEmp] = await tx
      .select()
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.companyId, inv.companyId),
          eq(employeesTable.clerkUserId, clerkUserId)
        )
      )
      .limit(1);

    if (existingUserEmp && existingUserEmp.status === "active") {
      const [comp] = await tx
        .select({ name: companiesTable.name })
        .from(companiesTable)
        .where(eq(companiesTable.id, inv.companyId))
        .limit(1);

      if (inv.status !== "accepted") {
        await tx
          .update(employeeInvitationsTable)
          .set({
            status: "accepted",
            acceptedBy: clerkUserId,
            acceptedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(employeeInvitationsTable.id, inv.id));
      }

      return {
        success: true,
        companyId: inv.companyId,
        companyName: comp?.name ?? "Elevio Member",
        employeeId: existingUserEmp.id,
        role: existingUserEmp.role,
        redirectUrl: "/dashboard",
      };
    }

    if (inv.status === "accepted") {
      throw new HttpError(
        400,
        JSON.stringify({
          code: "INVITATION_ALREADY_USED",
          message: "This invitation has already been accepted by another user.",
        })
      );
    }

    if (new Date(inv.expiresAt) < new Date()) {
      throw new HttpError(
        400,
        JSON.stringify({
          code: "INVITATION_EXPIRED",
          message: "This invitation has expired. Please contact your company administrator.",
        })
      );
    }

    // 2. Strict server-side email verification matching
    if (sessionEmail && sessionEmail.trim()) {
      if (sessionEmail.trim().toLowerCase() !== inv.email.toLowerCase()) {
        throw new HttpError(
          400,
          JSON.stringify({
            code: "EMAIL_MISMATCH",
            message: `This invitation was issued to ${inv.email}, but you are signed in as ${sessionEmail}. Please sign in with the invited email address.`,
          })
        );
      }
    }

    // 3. Authoritative subscription & seat capacity check inside locked transaction
    const [sub] = await tx
      .select({
        status: companySubscriptionsTable.status,
        bandCode: employeeBandsTable.code,
        bandMax: employeeBandsTable.maximumEmployees,
      })
      .from(companySubscriptionsTable)
      .leftJoin(employeeBandsTable, eq(companySubscriptionsTable.employeeBandId, employeeBandsTable.id))
      .where(eq(companySubscriptionsTable.companyId, inv.companyId))
      .limit(1);

    if (!sub || sub.status !== "ACTIVE") {
      throw new HttpError(
        402,
        JSON.stringify({
          code: "SUBSCRIPTION_INACTIVE",
          message: "Company subscription is not active. Please contact your company administrator.",
        })
      );
    }

    const [company] = await tx
      .select({ id: companiesTable.id, name: companiesTable.name, maxEmployees: companiesTable.maxEmployees })
      .from(companiesTable)
      .where(eq(companiesTable.id, inv.companyId))
      .limit(1);

    const maxSeats = getBandMaxSeats(sub.bandCode, company?.maxEmployees ?? sub.bandMax);

    const [activeCountRes] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(employeesTable)
      .where(and(eq(employeesTable.companyId, inv.companyId), eq(employeesTable.status, "active")));
    const activeCount = activeCountRes?.count ?? 0;

    if (activeCount >= maxSeats) {
      throw new HttpError(
        409,
        JSON.stringify({
          code: "SEAT_LIMIT_REACHED",
          message: "Your company has reached its subscription seat capacity. Please contact your administrator.",
        })
      );
    }

    const acceptedAt = new Date();
    const name = [inv.firstName, inv.lastName].filter(Boolean).join(" ") || inv.email.split("@")[0];

    // 4. Atomically insert or link employee record
    let employeeId: number;
    let employeeRole = inv.intendedRole;

    const [existingEmailEmp] = await tx
      .select()
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.companyId, inv.companyId),
          sql`lower(${employeesTable.email}) = ${inv.email.toLowerCase()}`
        )
      )
      .limit(1);

    if (existingEmailEmp) {
      const [linked] = await tx
        .update(employeesTable)
        .set({
          clerkUserId,
          name: existingEmailEmp.name || name,
          department: existingEmailEmp.department || inv.department,
          role: existingEmailEmp.role || inv.intendedRole,
          status: "active",
          invitationStatus: "accepted",
          invitationAcceptedAt: acceptedAt,
          invitationToken: null,
          updatedAt: acceptedAt,
        })
        .where(eq(employeesTable.id, existingEmailEmp.id))
        .returning();
      employeeId = linked.id;
      employeeRole = linked.role;
    } else {
      const [createdEmp] = await tx
        .insert(employeesTable)
        .values({
          companyId: inv.companyId,
          clerkUserId,
          email: inv.email.toLowerCase(),
          name,
          department: inv.department,
          role: inv.intendedRole,
          status: "active",
          invitationStatus: "accepted",
          invitationAcceptedAt: acceptedAt,
        })
        .returning();
      employeeId = createdEmp.id;
      employeeRole = createdEmp.role;
    }

    // 5. Mark invitation record accepted
    await tx
      .update(employeeInvitationsTable)
      .set({
        status: "accepted",
        acceptedBy: clerkUserId,
        acceptedAt,
        updatedAt: acceptedAt,
      })
      .where(eq(employeeInvitationsTable.id, inv.id));

    return {
      success: true,
      companyId: inv.companyId,
      companyName: company?.name ?? "Elevio Member",
      employeeId,
      role: employeeRole,
      redirectUrl: "/dashboard",
    };
  });
}

// ─── Legacy Backward Compatibility Helpers ────────────────────────────────────

export async function createOrRefreshInvitation(
  companyId: number,
  employeeId: number
): Promise<InvitationResult> {
  const [emp] = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.id, employeeId), eq(employeesTable.companyId, companyId)))
    .limit(1);

  if (!emp) {
    throw new HttpError(404, "Employee not found");
  }

  const { rawToken } = generateSecureToken();
  const sentAt = new Date();

  await db
    .update(employeesTable)
    .set({
      invitationToken: rawToken,
      invitationStatus: "invited",
      invitationSentAt: sentAt,
    })
    .where(eq(employeesTable.id, employeeId));

  return {
    employeeId: emp.id,
    email: emp.email,
    token: rawToken,
    invitationStatus: "invited",
    sentAt,
  };
}

export async function revokeInvitation(
  companyId: number,
  employeeId: number
): Promise<{ employeeId: number; invitationStatus: string }> {
  const [updated] = await db
    .update(employeesTable)
    .set({
      invitationStatus: "revoked",
    })
    .where(and(eq(employeesTable.id, employeeId), eq(employeesTable.companyId, companyId)))
    .returning();

  if (!updated) {
    throw new HttpError(404, "Employee not found");
  }

  return {
    employeeId: updated.id,
    invitationStatus: updated.invitationStatus,
  };
}

export async function acceptInvitation(
  token: string,
  clerkUserId: string
): Promise<{ employee: any; company: any }> {
  const cleanToken = token.trim();
  const [legacyEmp] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.invitationToken, cleanToken))
    .limit(1);

  if (legacyEmp) {
    if (legacyEmp.invitationStatus === "revoked") {
      throw new HttpError(400, "Invitation has been revoked by your administrator");
    }
    if (legacyEmp.invitationStatus === "accepted") {
      throw new HttpError(400, "Invalid or expired invitation token");
    }

    const [updated] = await db
      .update(employeesTable)
      .set({
        clerkUserId,
        invitationStatus: "accepted",
        invitationAcceptedAt: new Date(),
        invitationToken: null,
      })
      .where(eq(employeesTable.id, legacyEmp.id))
      .returning();

    const [company] = await db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.id, legacyEmp.companyId))
      .limit(1);

    return { employee: updated, company };
  }

  const result = await acceptEmployeeInvitation(token, clerkUserId);
  const [employee] = await db.select().from(employeesTable).where(eq(employeesTable.id, result.employeeId)).limit(1);
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, result.companyId)).limit(1);
  return { employee, company };
}
