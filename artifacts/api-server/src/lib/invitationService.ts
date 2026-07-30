import { randomUUID } from "crypto";
import { db, employeesTable, companiesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export interface InvitationResult {
  employeeId: number;
  email: string;
  token: string;
  invitationStatus: string;
  sentAt: Date;
}

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
    throw new Error("Employee not found");
  }

  const token = randomUUID();
  const sentAt = new Date();

  const [updated] = await db
    .update(employeesTable)
    .set({
      invitationToken: token,
      invitationStatus: "invited",
      invitationSentAt: sentAt,
    })
    .where(eq(employeesTable.id, employeeId))
    .returning();

  return {
    employeeId: updated.id,
    email: updated.email,
    token,
    invitationStatus: updated.invitationStatus,
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
    throw new Error("Employee not found");
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
  const [emp] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.invitationToken, token))
    .limit(1);

  if (!emp) {
    throw new Error("Invalid or expired invitation token");
  }

  if (emp.invitationStatus === "revoked") {
    throw new Error("This invitation has been revoked");
  }

  const acceptedAt = new Date();

  const [updated] = await db
    .update(employeesTable)
    .set({
      clerkUserId,
      invitationStatus: "accepted",
      invitationAcceptedAt: acceptedAt,
      invitationToken: null, // Single-use token invalidated
    })
    .where(eq(employeesTable.id, emp.id))
    .returning();

  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.id, updated.companyId))
    .limit(1);

  return {
    employee: updated,
    company,
  };
}
