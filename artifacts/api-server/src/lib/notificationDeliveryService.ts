import {
  db,
  employeesTable,
  notificationDeliveryLogsTable,
  notificationPreferencesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getActiveNotificationProvider } from "./notificationProvider";
import { renderEmailTemplate, TemplateNotificationType } from "./emailTemplateEngine";
import { logAuditEvent } from "./auditLogService";
import { logger } from "./logger";

export interface NotificationDeliveryRequest {
  companyId: number;
  recipientEmployeeId?: number;
  recipientUserId?: string;
  recipientEmail: string;
  recipientName?: string;
  notificationType: TemplateNotificationType;
  templateData?: Record<string, unknown>;
  deduplicationKey: string;
  relatedAssignmentId?: number;
  relatedEnrollmentId?: number;
  relatedCourseId?: number;
  relatedPathwayId?: number;
  isOperational?: boolean;
}

export interface DeliveryResultSummary {
  delivered: boolean;
  status: "delivered" | "skipped" | "failed";
  logId?: number;
  providerMessageId?: string;
  reason?: string;
}

const OPERATIONAL_TYPES: Set<TemplateNotificationType> = new Set([
  "invitation",
  "invitation_expiry",
  "course_assigned",
  "course_completed",
]);

export async function dispatchNotificationDelivery(
  req: NotificationDeliveryRequest
): Promise<DeliveryResultSummary> {
  const isOperational = req.isOperational ?? OPERATIONAL_TYPES.has(req.notificationType);

  // 1. Check deduplication key
  const [existingLog] = await db
    .select()
    .from(notificationDeliveryLogsTable)
    .where(eq(notificationDeliveryLogsTable.deduplicationKey, req.deduplicationKey))
    .limit(1);

  if (existingLog) {
    return {
      delivered: existingLog.status === "delivered",
      status: "skipped",
      logId: existingLog.id,
      reason: "Duplicate deduplication key already processed",
    };
  }

  // 2. Validate recipient employee company scope if employeeId provided
  if (req.recipientEmployeeId) {
    const [emp] = await db
      .select()
      .from(employeesTable)
      .where(and(eq(employeesTable.id, req.recipientEmployeeId), eq(employeesTable.companyId, req.companyId)))
      .limit(1);

    if (!emp) {
      return {
        delivered: false,
        status: "skipped",
        reason: "Recipient employee does not belong to specified company",
      };
    }

    if (emp.status === "deactivated") {
      return {
        delivered: false,
        status: "skipped",
        reason: "Recipient employee account is deactivated",
      };
    }

    // Check optional engagement notification preferences if non-operational
    if (!isOperational) {
      const [pref] = await db
        .select()
        .from(notificationPreferencesTable)
        .where(and(eq(notificationPreferencesTable.companyId, req.companyId), eq(notificationPreferencesTable.employeeId, req.recipientEmployeeId)))
        .limit(1);

      if (pref && !pref.optionalEngagementReminders) {
        return {
          delivered: false,
          status: "skipped",
          reason: "Recipient opted out of optional engagement notifications",
        };
      }
    }
  }

  // 3. Create initial delivery log (Status: processing)
  let logRecord;
  try {
    const [inserted] = await db
      .insert(notificationDeliveryLogsTable)
      .values({
        companyId: req.companyId,
        employeeId: req.recipientEmployeeId ?? null,
        userId: req.recipientUserId ?? null,
        assignmentId: req.relatedAssignmentId ?? null,
        notificationType: req.notificationType,
        channel: "email",
        recipient: req.recipientEmail,
        deduplicationKey: req.deduplicationKey,
        attemptedAt: new Date(),
        status: "processing",
        retryCount: 0,
      })
      .onConflictDoNothing()
      .returning();

    logRecord = inserted;
  } catch (err: any) {
    logger.error({ err, key: req.deduplicationKey }, "Deduplication constraint conflict during log insertion");
    return { delivered: false, status: "skipped", reason: "Concurrent duplicate dispatch blocked" };
  }

  if (!logRecord) {
    return { delivered: false, status: "skipped", reason: "Log record insertion skipped due to deduplication conflict" };
  }

  // 4. Render Email Template
  const templateData = {
    companyName: `Company #${req.companyId}`,
    recipientName: req.recipientName || "Team Member",
    ...req.templateData,
  };
  const rendered = renderEmailTemplate(req.notificationType, templateData);

  // 5. Dispatch via Active Notification Provider
  const provider = getActiveNotificationProvider();
  const providerRes = await provider.sendEmail({
    to: req.recipientEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });

  // 6. Update Delivery Log Record
  if (providerRes.success) {
    const [updated] = await db
      .update(notificationDeliveryLogsTable)
      .set({
        status: "delivered",
        deliveredAt: new Date(),
        providerMessageId: providerRes.providerMessageId,
      })
      .where(eq(notificationDeliveryLogsTable.id, logRecord.id))
      .returning();

    await logAuditEvent({
      companyId: req.companyId,
      actorUserId: "system_notification",
      actorRole: "system",
      action: "notification.delivered",
      targetType: "notification_delivery_log",
      targetId: logRecord.id,
      metadata: {
        notificationType: req.notificationType,
        recipient: req.recipientEmail,
        provider: providerRes.providerName,
      },
    });

    return {
      delivered: true,
      status: "delivered",
      logId: logRecord.id,
      providerMessageId: providerRes.providerMessageId,
    };
  } else {
    await db
      .update(notificationDeliveryLogsTable)
      .set({
        status: "failed",
        retryCount: 1,
        failureCode: providerRes.errorCode || "DISPATCH_FAILED",
        failureMessage: providerRes.errorMessage || "Provider rejected delivery request",
      })
      .where(eq(notificationDeliveryLogsTable.id, logRecord.id));

    return {
      delivered: false,
      status: "failed",
      logId: logRecord.id,
      reason: providerRes.errorMessage || "Provider dispatch failed",
    };
  }
}
