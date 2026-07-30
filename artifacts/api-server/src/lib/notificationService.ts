import { logger } from "./logger";
import { dispatchNotificationDelivery } from "./notificationDeliveryService";
import { TemplateNotificationType } from "./emailTemplateEngine";

export type NotificationType =
  | "invitation"
  | "invitation_resend"
  | "course_assigned"
  | "due_date_upcoming"
  | "course_overdue"
  | "course_completed";

export interface SendNotificationOptions {
  companyId: number;
  recipientEmail: string;
  recipientName: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export async function sendNotification(options: SendNotificationOptions): Promise<{ delivered: boolean; logId?: string }> {
  try {
    const mappedType: TemplateNotificationType = options.type === "due_date_upcoming" ? "due_soon" : (options.type as TemplateNotificationType);
    const dedupKey = options.metadata?.dedupKey ? String(options.metadata.dedupKey) : `legacy_notif_${options.companyId}_${options.recipientEmail}_${options.type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const res = await dispatchNotificationDelivery({
      companyId: options.companyId,
      recipientEmail: options.recipientEmail,
      recipientName: options.recipientName,
      notificationType: mappedType,
      deduplicationKey: dedupKey,
      templateData: { title: options.title, message: options.message, ...options.metadata },
    });

    return { delivered: res.delivered, logId: res.logId ? String(res.logId) : undefined };
  } catch (err: any) {
    logger.error({ err, recipientEmail: options.recipientEmail }, "Failed to send notification email (isolated failure)");
    return { delivered: false };
  }
}
