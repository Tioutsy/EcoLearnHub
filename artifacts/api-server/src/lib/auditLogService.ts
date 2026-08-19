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

function sanitizeAuditMetadata(meta: any): string | null {
  if (!meta) return null;

  if (typeof meta === "object") {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(meta)) {
      const lower = key.toLowerCase();
      if (
        lower.includes("secret") ||
        lower.includes("password") ||
        lower.includes("token") ||
        lower.includes("cookie") ||
        lower.includes("codehash") ||
        lower.includes("rawcode")
      ) {
        clean[key] = "[REDACTED]";
      } else if (typeof value === "string") {
        clean[key] = value.slice(0, 500); // bound string length
      } else {
        clean[key] = value;
      }
    }
    return JSON.stringify(clean).slice(0, 4000);
  }

  if (typeof meta === "string") {
    return meta.slice(0, 4000);
  }

  return String(meta).slice(0, 4000);
}

export async function logAuditEvent(params: LogAuditEventParams): Promise<any> {
  const metadataString = sanitizeAuditMetadata(params.metadata);

  const [entry] = await db
    .insert(auditLogsTable)
    .values({
      companyId: params.companyId,
      actorUserId: params.actorUserId,
      actorRole: params.actorRole,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId !== undefined && params.targetId !== null ? String(params.targetId).slice(0, 255) : null,
      metadata: metadataString,
    })
    .returning();

  return entry;
}
