import {
  db,
  employeesTable,
  courseAssignmentsTable,
  enrollmentsTable,
  trainingInterventionsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { sendNotification } from "./notificationService";
import { logAuditEvent } from "./auditLogService";

export interface InterventionQueueItem {
  id: string;
  companyId: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  department: string | null;
  assignmentId?: number;
  courseTitle?: string;
  type: "unactivated" | "unstarted" | "due_soon" | "overdue" | "inactive" | "quiz_retry" | "commitment_followup";
  priorityReason: string;
  dueDate?: string;
  recommendedAction: string;
}

export async function getManagerInterventionQueue(
  companyId: number,
  requesterRole: "platform_admin" | "company_admin" | "manager",
  managerDepartment?: string
): Promise<InterventionQueueItem[]> {
  const queue: InterventionQueueItem[] = [];

  let employees = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.companyId, companyId), eq(employeesTable.status, "active")));

  if (requesterRole === "manager" && managerDepartment) {
    employees = employees.filter((e) => e.department === managerDepartment);
  }

  const assignments = await db
    .select()
    .from(courseAssignmentsTable)
    .where(eq(courseAssignmentsTable.companyId, companyId));

  const enrollments = await db
    .select()
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.companyId, companyId));

  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const emp of employees) {
    // 1. Pending Activation > 3 Days
    if (emp.invitationStatus === "invited" && emp.invitationSentAt && new Date(emp.invitationSentAt) < threeDaysAgo) {
      queue.push({
        id: `unact_${emp.id}`,
        companyId,
        employeeId: emp.id,
        employeeName: emp.name,
        employeeEmail: emp.email,
        department: emp.department,
        type: "unactivated",
        priorityReason: `Invitation sent over 3 days ago on ${new Date(emp.invitationSentAt).toLocaleDateString()}`,
        recommendedAction: "Resend invitation link",
      });
    }

    // 2. Course Assignments
    const empAssignments = assignments.filter((a) => a.employeeId === emp.id);
    for (const asgn of empAssignments) {
      const enr = enrollments.find((e) => e.employeeId === emp.id && e.courseId === asgn.courseId);
      const isCompleted = asgn.completedAt || (enr && (enr.status === "completed" || enr.completedAt));

      if (isCompleted) continue; // Skip completed assignments

      const dueDate = asgn.dueDate ?? enr?.dueDate;

      if (dueDate && new Date(dueDate) < now) {
        queue.push({
          id: `overdue_${asgn.id}`,
          companyId,
          employeeId: emp.id,
          employeeName: emp.name,
          employeeEmail: emp.email,
          department: emp.department,
          assignmentId: asgn.id,
          type: "overdue",
          priorityReason: `Course assignment past due date of ${new Date(dueDate).toLocaleDateString()}`,
          dueDate: new Date(dueDate).toISOString(),
          recommendedAction: "Send training reminder or extend due date",
        });
      } else if (enr && enr.progressPct > 0 && enr.updatedAt && new Date(enr.updatedAt) < sevenDaysAgo) {
        queue.push({
          id: `inactive_${asgn.id}`,
          companyId,
          employeeId: emp.id,
          employeeName: emp.name,
          employeeEmail: emp.email,
          department: emp.department,
          assignmentId: asgn.id,
          type: "inactive",
          priorityReason: `No course progress recorded in over 7 days (${enr.progressPct}% complete)`,
          recommendedAction: "Schedule 1-on-1 check-in or send encouragement",
        });
      }
    }
  }

  return queue;
}

export interface BulkInterventionOptions {
  companyId: number;
  actorUserId: string;
  actorRole: "platform_admin" | "company_admin" | "manager";
  managerDepartment?: string;
  employeeIds: number[];
  interventionType: "reminder_sent" | "due_date_extended" | "manager_check_in";
  newDueDate?: Date;
  internalNote?: string;
}

export async function executeBulkManagerInterventions(
  opts: BulkInterventionOptions
): Promise<{ processed: number; succeeded: number; failed: number; skipped: number }> {
  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  for (const empId of opts.employeeIds) {
    processed++;
    const [emp] = await db
      .select()
      .from(employeesTable)
      .where(and(eq(employeesTable.id, empId), eq(employeesTable.companyId, opts.companyId)))
      .limit(1);

    if (!emp || emp.status === "deactivated") {
      skipped++;
      continue;
    }

    if (opts.actorRole === "manager" && opts.managerDepartment && emp.department !== opts.managerDepartment) {
      skipped++;
      continue; // Tenant / department scope protection
    }

    try {
      const [intervention] = await db
        .insert(trainingInterventionsTable)
        .values({
          companyId: opts.companyId,
          employeeId: emp.id,
          interventionType: opts.interventionType,
          status: "completed",
          initiatedByUserId: opts.actorUserId,
          dueAt: opts.newDueDate ?? null,
          internalNote: opts.internalNote ?? "Bulk manager intervention execution",
          completedAt: new Date(),
        })
        .returning();

      if (opts.interventionType === "reminder_sent") {
        await sendNotification({
          companyId: opts.companyId,
          recipientEmail: emp.email,
          recipientName: emp.name,
          type: "course_assigned",
          title: "Manager Reminder: Sustainability Training Update",
          message: `Hello ${emp.name}, your manager requested a reminder regarding your training.`,
        });
      }

      await logAuditEvent({
        companyId: opts.companyId,
        actorUserId: opts.actorUserId,
        actorRole: opts.actorRole,
        action: "manager.bulk_intervention",
        targetType: "employee",
        targetId: emp.id,
        metadata: { interventionType: opts.interventionType, interventionId: intervention.id },
      });

      succeeded++;
    } catch {
      failed++;
    }
  }

  return { processed, succeeded, failed, skipped };
}
