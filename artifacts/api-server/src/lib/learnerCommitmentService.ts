import {
  db,
  employeesTable,
  learnerCommitmentsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logAuditEvent } from "./auditLogService";

export interface CreateCommitmentInput {
  companyId: number;
  employeeId: number;
  courseId: number;
  courseVersion?: number;
  enrollmentId?: number;
  commitmentType?: "suggested" | "custom";
  commitmentText: string;
  targetDate?: Date;
}

export async function createLearnerCommitment(input: CreateCommitmentInput) {
  if (!input.commitmentText || input.commitmentText.trim().length === 0) {
    throw new Error("Commitment text is required");
  }

  const [commitment] = await db
    .insert(learnerCommitmentsTable)
    .values({
      companyId: input.companyId,
      employeeId: input.employeeId,
      courseId: input.courseId,
      courseVersion: input.courseVersion ?? 1,
      enrollmentId: input.enrollmentId ?? null,
      commitmentType: input.commitmentType ?? "suggested",
      commitmentText: input.commitmentText.trim().slice(0, 500),
      targetDate: input.targetDate ?? null,
      status: "planned",
    })
    .returning();

  await logAuditEvent({
    companyId: input.companyId,
    actorUserId: `emp_${input.employeeId}`,
    actorRole: "employee",
    action: "commitment.created",
    targetType: "learner_commitment",
    targetId: commitment.id,
    metadata: { courseId: input.courseId, commitmentText: commitment.commitmentText },
  });

  return commitment;
}

export async function completeLearnerCommitment(
  commitmentId: number,
  companyId: number,
  employeeId: number,
  reflection?: string
) {
  const [existing] = await db
    .select()
    .from(learnerCommitmentsTable)
    .where(and(eq(learnerCommitmentsTable.id, commitmentId), eq(learnerCommitmentsTable.companyId, companyId)))
    .limit(1);

  if (!existing) {
    throw new Error("Commitment not found");
  }

  if (existing.employeeId !== employeeId) {
    throw new Error("Cannot complete another learner's commitment");
  }

  const [updated] = await db
    .update(learnerCommitmentsTable)
    .set({
      status: "completed_self_reported",
      completedAt: new Date(),
      learnerReflection: reflection ? reflection.trim().slice(0, 1000) : null,
    })
    .where(eq(learnerCommitmentsTable.id, commitmentId))
    .returning();

  await logAuditEvent({
    companyId,
    actorUserId: `emp_${employeeId}`,
    actorRole: "employee",
    action: "commitment.completed_self_reported",
    targetType: "learner_commitment",
    targetId: commitmentId,
    metadata: { reflection: updated.learnerReflection },
  });

  return updated;
}

export async function confirmLearnerCommitmentByManager(
  commitmentId: number,
  companyId: number,
  managerUserId: string,
  managerDepartment?: string
) {
  const [existing] = await db
    .select()
    .from(learnerCommitmentsTable)
    .where(and(eq(learnerCommitmentsTable.id, commitmentId), eq(learnerCommitmentsTable.companyId, companyId)))
    .limit(1);

  if (!existing) {
    throw new Error("Commitment not found");
  }

  // Manager department scope validation
  if (managerDepartment) {
    const [emp] = await db
      .select()
      .from(employeesTable)
      .where(and(eq(employeesTable.id, existing.employeeId), eq(employeesTable.companyId, companyId)))
      .limit(1);

    if (!emp || emp.department !== managerDepartment) {
      throw new Error("Cannot confirm commitment outside manager department scope");
    }
  }

  const [updated] = await db
    .update(learnerCommitmentsTable)
    .set({
      status: "completed_manager_confirmed",
      managerConfirmationStatus: "confirmed",
      managerConfirmedByUserId: managerUserId,
      managerConfirmedAt: new Date(),
    })
    .where(eq(learnerCommitmentsTable.id, commitmentId))
    .returning();

  await logAuditEvent({
    companyId,
    actorUserId: managerUserId,
    actorRole: "manager",
    action: "commitment.manager_confirmed",
    targetType: "learner_commitment",
    targetId: commitmentId,
    metadata: { employeeId: existing.employeeId },
  });

  return updated;
}
