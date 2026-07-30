import {
  db,
  employeesTable,
  courseAssignmentsTable,
  enrollmentsTable,
  notificationDeliveryLogsTable,
  notificationPreferencesTable,
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { sendNotification } from "./notificationService";
import { defaultTrainingReminderPolicy, ReminderCategory } from "./trainingReminderPolicy";
import { logAuditEvent } from "./auditLogService";

export interface ProcessRemindersOptions {
  companyId?: number;
  policyWindowPeriod?: string; // e.g. "2026-W30"
}

export interface ReminderProcessSummary {
  candidatesEvaluated: number;
  dispatchedCount: number;
  skippedCount: number;
  failedCount: number;
}

export async function processTrainingReminders(
  options: ProcessRemindersOptions = {}
): Promise<ReminderProcessSummary> {
  const policyPeriod = options.policyWindowPeriod ?? new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const now = new Date();

  // 1. Query candidate active employees
  let empQuery = db.select().from(employeesTable).where(eq(employeesTable.status, "active"));
  if (options.companyId) {
    empQuery = db
      .select()
      .from(employeesTable)
      .where(and(eq(employeesTable.companyId, options.companyId), eq(employeesTable.status, "active")));
  }

  const activeEmployees = await empQuery;

  // 2. Fetch assignments & enrollments
  const assignments = await db.select().from(courseAssignmentsTable);
  const enrollments = await db.select().from(enrollmentsTable);
  const preferences = await db.select().from(notificationPreferencesTable);

  let candidatesEvaluated = 0;
  let dispatchedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const emp of activeEmployees) {
    // Check notification preferences for optional reminders
    const userPref = preferences.find((p) => p.employeeId === emp.id);
    const allowOptional = userPref?.optionalEngagementReminders ?? true;

    // Check Pending Invitation Reminder
    if (emp.invitationStatus === "invited" && emp.invitationSentAt) {
      candidatesEvaluated++;
      const daysSinceSent = Math.floor(
        (now.getTime() - new Date(emp.invitationSentAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceSent >= 3) {
        const category: ReminderCategory = "invitation_pending";
        const dedupKey = `comp_${emp.companyId}_emp_${emp.id}_type_${category}_period_${policyPeriod}`;

        const dispatched = await tryDispatchReminder({
          companyId: emp.companyId,
          employeeId: emp.id,
          recipientEmail: emp.email,
          recipientName: emp.name,
          category,
          dedupKey,
          title: "Reminder: Activate Your EcoLearnHub Corporate Access",
          message: `Hello ${emp.name}, your corporate learning account is ready to activate.`,
        });

        if (dispatched.status === "delivered") dispatchedCount++;
        else if (dispatched.status === "skipped") skippedCount++;
        else failedCount++;
      }
    }

    // Check Course Assignment Reminders
    const empAssignments = assignments.filter((a) => a.employeeId === emp.id && a.companyId === emp.companyId);

    for (const asgn of empAssignments) {
      candidatesEvaluated++;
      const enr = enrollments.find((e) => e.employeeId === emp.id && e.courseId === asgn.courseId);

      // Skip completed assignments
      if (asgn.completedAt || (enr && (enr.status === "completed" || enr.completedAt))) {
        continue;
      }

      const dueDate = asgn.dueDate ?? enr?.dueDate;
      if (!dueDate) continue;

      const daysUntilDue = Math.ceil(
        (new Date(dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      let categoryToTrigger: ReminderCategory | null = null;
      let title = "";
      let message = "";

      if (daysUntilDue < 0) {
        categoryToTrigger = "overdue";
        title = "Action Required: Overdue Sustainability Course Assignment";
        message = `Your course assignment is overdue. Please log in to complete your training.`;
      } else if (daysUntilDue <= 7 && daysUntilDue >= 0) {
        categoryToTrigger = "due_soon";
        title = `Reminder: Course Assignment Due in ${daysUntilDue} Day(s)`;
        message = `Your assigned sustainability training is due on ${new Date(dueDate).toLocaleDateString()}.`;
      }

      if (categoryToTrigger) {
        const rule = defaultTrainingReminderPolicy.rules[categoryToTrigger];
        if (rule.isOptional && !allowOptional) {
          skippedCount++;
          continue;
        }

        const dedupKey = `comp_${emp.companyId}_emp_${emp.id}_asgn_${asgn.id}_type_${categoryToTrigger}_period_${policyPeriod}`;

        const dispatched = await tryDispatchReminder({
          companyId: emp.companyId,
          employeeId: emp.id,
          userId: emp.clerkUserId ?? undefined,
          assignmentId: asgn.id,
          recipientEmail: emp.email,
          recipientName: emp.name,
          category: categoryToTrigger,
          dedupKey,
          title,
          message,
        });

        if (dispatched.status === "delivered") dispatchedCount++;
        else if (dispatched.status === "skipped") skippedCount++;
        else failedCount++;
      }
    }
  }

  return {
    candidatesEvaluated,
    dispatchedCount,
    skippedCount,
    failedCount,
  };
}

async function tryDispatchReminder(params: {
  companyId: number;
  employeeId: number;
  userId?: string;
  assignmentId?: number;
  recipientEmail: string;
  recipientName: string;
  category: ReminderCategory;
  dedupKey: string;
  title: string;
  message: string;
}): Promise<{ status: "delivered" | "skipped" | "failed" }> {
  // Check if deduplication log already exists
  const [existing] = await db
    .select()
    .from(notificationDeliveryLogsTable)
    .where(eq(notificationDeliveryLogsTable.deduplicationKey, params.dedupKey))
    .limit(1);

  if (existing) {
    return { status: "skipped" };
  }

  // Insert log idempotently
  let logEntry;
  try {
    const [inserted] = await db
      .insert(notificationDeliveryLogsTable)
      .values({
        companyId: params.companyId,
        employeeId: params.employeeId,
        userId: params.userId ?? null,
        assignmentId: params.assignmentId ?? null,
        notificationType: params.category,
        channel: "email",
        recipient: params.recipientEmail,
        deduplicationKey: params.dedupKey,
        attemptedAt: new Date(),
        status: "processing",
      })
      .onConflictDoNothing()
      .returning();

    logEntry = inserted;
  } catch {
    return { status: "skipped" };
  }

  if (!logEntry) {
    return { status: "skipped" };
  }

  // Dispatch through notification service
  const res = await sendNotification({
    companyId: params.companyId,
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    type: "course_assigned",
    title: params.title,
    message: params.message,
  });

  if (res.delivered) {
    await db
      .update(notificationDeliveryLogsTable)
      .set({
        status: "delivered",
        deliveredAt: new Date(),
        providerMessageId: res.logId ?? `msg_${Date.now()}`,
      })
      .where(eq(notificationDeliveryLogsTable.id, logEntry.id));

    await logAuditEvent({
      companyId: params.companyId,
      actorUserId: "scheduler_system",
      actorRole: "system",
      action: "reminder.dispatched",
      targetType: "notification_delivery_log",
      targetId: logEntry.id,
      metadata: { category: params.category, recipient: params.recipientEmail },
    });

    return { status: "delivered" };
  } else {
    await db
      .update(notificationDeliveryLogsTable)
      .set({
        status: "failed",
        failureCode: "DISPATCH_FAILED",
        failureMessage: "Notification service failed delivery",
      })
      .where(eq(notificationDeliveryLogsTable.id, logEntry.id));

    return { status: "failed" };
  }
}
