import { db, auditLogsTable } from "@workspace/db";

export interface LogAuditEventParams {
  companyId: number;
  actorUserId: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string | number | null;
  metadata?: Record<string, unknown> | string | null;
}

export async function logAuditEvent(params: LogAuditEventParams): Promise<any> {
  const metadataString =
    typeof params.metadata === "object" && params.metadata !== null
      ? JSON.stringify(params.metadata)
      : params.metadata ?? null;

  const [entry] = await db
    .insert(auditLogsTable)
    .values({
      companyId: params.companyId,
      actorUserId: params.actorUserId,
      actorRole: params.actorRole,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId !== undefined && params.targetId !== null ? String(params.targetId) : null,
      metadata: metadataString,
    })
    .returning();

  return entry;
}
