import {
  db,
  companiesTable,
  employeesTable,
  employeeInvitationsTable,
  companySubscriptionsTable,
  employeeBandsTable,
  subscriptionPlansTable,
  companyPilotPassesTable,
} from "@workspace/db";
import { eq, and, sql, gt } from "drizzle-orm";
import { HttpError } from "./access";

export interface SeatUsageSummary {
  companyId: number;
  companyName: string;
  activeEmployees: number;
  pendingInvitations: number;
  reservedSeats: number;
  maxSeats: number;
  remainingSeats: number;
  subscriptionStatus: string;
  subscriptionPlanCode: string | null;
  subscriptionPlanName: string | null;
  bandCode: string | null;
  bandLabel: string | null;
  canInvite: boolean;
  reason: string | null;
}

export function getBandMaxSeats(bandCode: string | null, contractualLimit?: number | null): number {
  if (contractualLimit !== undefined && contractualLimit !== null && contractualLimit > 0) {
    if (bandCode === "OVER_120") return contractualLimit;
    if (!bandCode) return contractualLimit;
    const standardLimit =
      bandCode === "UP_TO_25" ? 25 :
      bandCode === "FROM_26_TO_50" ? 50 :
      bandCode === "FROM_51_TO_80" ? 80 :
      bandCode === "FROM_81_TO_120" ? 120 : 25;
    return Math.min(standardLimit, contractualLimit);
  }

  switch (bandCode) {
    case "UP_TO_25":
      return 25;
    case "FROM_26_TO_50":
      return 50;
    case "FROM_51_TO_80":
      return 80;
    case "FROM_81_TO_120":
      return 120;
    case "OVER_120":
      return 250;
    default:
      return 25;
  }
}

export async function getCompanySeatUsage(companyId: number): Promise<SeatUsageSummary> {
  const [company] = await db
    .select({
      id: companiesTable.id,
      name: companiesTable.name,
      slug: companiesTable.slug,
      maxEmployees: companiesTable.maxEmployees,
    })
    .from(companiesTable)
    .where(eq(companiesTable.id, companyId))
    .limit(1);

  if (!company) {
    throw new HttpError(404, "Company not found");
  }

  // Get active subscription info
  const [sub] = await db
    .select({
      id: companySubscriptionsTable.id,
      status: companySubscriptionsTable.status,
      planCode: subscriptionPlansTable.code,
      planName: subscriptionPlansTable.name,
      bandCode: employeeBandsTable.code,
      bandLabel: employeeBandsTable.label,
      bandMax: employeeBandsTable.maximumEmployees,
    })
    .from(companySubscriptionsTable)
    .leftJoin(subscriptionPlansTable, eq(companySubscriptionsTable.subscriptionPlanId, subscriptionPlansTable.id))
    .leftJoin(employeeBandsTable, eq(companySubscriptionsTable.employeeBandId, employeeBandsTable.id))
    .where(eq(companySubscriptionsTable.companyId, companyId))
    .limit(1);

  const subscriptionStatus = sub?.status ?? "NONE";
  let isSubscriptionActive = subscriptionStatus === "ACTIVE";

  // Check if company is Infracare (Complimentary test bypass)
  const isInfracare =
    company.name?.toLowerCase().includes("infracare") ||
    Boolean(company.slug && company.slug.toLowerCase().includes("infracare"));

  if (isInfracare) {
    isSubscriptionActive = true;
  }

  // Check if company has a pilot pass
  const [pilotPass] = await db
    .select()
    .from(companyPilotPassesTable)
    .where(eq(companyPilotPassesTable.companyId, companyId))
    .limit(1);

  let pilotExpired = false;
  let pilotRevoked = false;
  let pilotActive = false;

  if (pilotPass && pilotPass.status !== "converted") {
    pilotActive = true;
    const now = new Date();
    pilotExpired = pilotPass.status === "expired" || (pilotPass.expiresAt ? now.getTime() > new Date(pilotPass.expiresAt).getTime() : false);
    pilotRevoked = pilotPass.status === "revoked";
    if (pilotExpired || pilotRevoked) {
      isSubscriptionActive = isInfracare ? true : false;
    } else {
      isSubscriptionActive = true;
    }
  }

  // Derive seat limit
  let maxSeats = getBandMaxSeats(sub?.bandCode ?? null, company.maxEmployees ?? sub?.bandMax);
  if (pilotActive && pilotPass) {
    maxSeats = pilotPass.learnerSeatLimit + pilotPass.administratorSeatLimit;
  }
  if (isInfracare) {
    maxSeats = Math.max(maxSeats, 250);
  }

  // Count active employees (only 'active' status consumes a seat)
  const [activeEmpCountRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(employeesTable)
    .where(and(eq(employeesTable.companyId, companyId), eq(employeesTable.status, "active")));
  const activeEmployees = activeEmpCountRes?.count ?? 0;

  // Count valid pending invitations (pending and not expired)
  const now = new Date();
  const [pendingInvCountRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(employeeInvitationsTable)
    .where(
      and(
        eq(employeeInvitationsTable.companyId, companyId),
        eq(employeeInvitationsTable.status, "pending"),
        gt(employeeInvitationsTable.expiresAt, now)
      )
    );
  const pendingInvitations = pendingInvCountRes?.count ?? 0;

  const reservedSeats = activeEmployees + pendingInvitations;
  const remainingSeats = Math.max(0, maxSeats - reservedSeats);

  let canInvite = true;
  let reason: string | null = null;

  if (isInfracare) {
    canInvite = true;
    reason = null;
  } else if (!isSubscriptionActive) {
    canInvite = false;
    if (pilotActive && pilotRevoked) {
      reason = "Company pilot pass has been revoked.";
    } else if (pilotActive && pilotExpired) {
      reason = "Company pilot pass has expired. Upgrade to a paid subscription to invite team members.";
    } else if (subscriptionStatus === "PENDING") {
      reason = "Subscription payment confirmation is pending. Complete payment to invite team members.";
    } else {
      reason = "An active paid subscription is required to issue employee invitations.";
    }
  } else if (reservedSeats >= maxSeats) {
    canInvite = false;
    reason = pilotActive
      ? `Pilot learner seat limit reached (${reservedSeats} of ${maxSeats} seats reserved). Upgrade to a paid subscription to invite more team members.`
      : `Employee seat limit reached (${reservedSeats} of ${maxSeats} seats reserved). Upgrade your subscription band to invite more team members.`;
  }

  const finalSubStatus = isInfracare
    ? "ACTIVE"
    : (!isSubscriptionActive && pilotActive)
    ? (pilotExpired ? "EXPIRED" : pilotRevoked ? "CANCELLED" : "INACTIVE")
    : subscriptionStatus;

  return {
    companyId: company.id,
    companyName: company.name,
    activeEmployees,
    pendingInvitations,
    reservedSeats,
    maxSeats,
    remainingSeats,
    subscriptionStatus: finalSubStatus,
    subscriptionPlanCode: isInfracare ? (sub?.planCode || "COMPLETE") : (sub?.planCode ?? null),
    subscriptionPlanName: isInfracare ? (sub?.planName || "Complete (Test Account)") : (sub?.planName ?? null),
    bandCode: isInfracare ? (sub?.bandCode || "OVER_120") : (sub?.bandCode ?? null),
    bandLabel: isInfracare ? (sub?.bandLabel || "121+ employees") : (sub?.bandLabel ?? null),
    canInvite,
    reason,
  };
}

export async function verifyCanInvite(companyId: number): Promise<SeatUsageSummary> {
  const usage = await getCompanySeatUsage(companyId);

  if (!usage.canInvite) {
    if (usage.reservedSeats >= usage.maxSeats) {
      throw new HttpError(
        403,
        JSON.stringify({
          code: "SEAT_LIMIT_REACHED",
          message: usage.reason || "Seat limit reached for current subscription band.",
          reservedSeats: usage.reservedSeats,
          maxSeats: usage.maxSeats,
        })
      );
    }

    throw new HttpError(
      402,
      JSON.stringify({
        code: "SUBSCRIPTION_INACTIVE",
        message: usage.reason || "Active paid subscription is required.",
      })
    );
  }

  return usage;
}
