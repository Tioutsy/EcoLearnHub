import {
  db,
  pilotCompaniesTable,
  pilotLearningPlansTable,
  pilotFeedbackResponsesTable,
  pilotIssuesTable,
  companiesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { HttpError } from "./access";

export async function createPilotCompany(data: {
  companyId: number;
  targetLearnerCount?: number;
  approvedLearnerLimit?: number;
  selectedCourseIds?: number[];
  primaryContactName?: string;
  primaryContactEmail?: string;
}) {
  const [existingComp] = await db.select().from(companiesTable).where(eq(companiesTable.id, data.companyId));
  if (!existingComp) {
    throw new HttpError(404, `Company ID ${data.companyId} not found.`);
  }

  const [pilot] = await db
    .insert(pilotCompaniesTable)
    .values({
      companyId: data.companyId,
      pilotStatus: "candidate",
      pilotStage: "initial_contact",
      targetLearnerCount: data.targetLearnerCount || 20,
      approvedLearnerLimit: data.approvedLearnerLimit || 50,
      selectedCourseIds: data.selectedCourseIds || [1],
      primaryContactName: data.primaryContactName,
      primaryContactEmail: data.primaryContactEmail,
    })
    .returning();

  return pilot;
}

export async function approvePilotCompany(pilotId: number, approvedByUserId: string, learnerLimit: number) {
  const [existing] = await db.select().from(pilotCompaniesTable).where(eq(pilotCompaniesTable.id, pilotId));
  if (!existing) {
    throw new HttpError(404, `Pilot record ID ${pilotId} not found.`);
  }

  const [approved] = await db
    .update(pilotCompaniesTable)
    .set({
      pilotStatus: "approved",
      pilotStage: "configuration",
      approvedByUserId,
      approvedAt: new Date(),
      approvedLearnerLimit: learnerLimit,
      updatedAt: new Date(),
    })
    .where(eq(pilotCompaniesTable.id, pilotId))
    .returning();

  return approved;
}

export async function submitPilotFeedback(data: {
  pilotCompanyId?: number;
  companyId: number;
  respondentUserId: string;
  respondentRole: "learner" | "manager" | "buyer";
  overallRating: number;
  easeOfUseRating: number;
  contentRelevanceRating: number;
  reportingUsefulnessRating?: number;
  freeTextFeedback?: string;
  consentForFollowUp?: boolean;
}) {
  const [feedback] = await db
    .insert(pilotFeedbackResponsesTable)
    .values({
      pilotCompanyId: data.pilotCompanyId,
      companyId: data.companyId,
      respondentUserId: data.respondentUserId,
      respondentRole: data.respondentRole,
      overallRating: Math.min(5, Math.max(1, data.overallRating)),
      easeOfUseRating: Math.min(5, Math.max(1, data.easeOfUseRating)),
      contentRelevanceRating: Math.min(5, Math.max(1, data.contentRelevanceRating)),
      reportingUsefulnessRating: data.reportingUsefulnessRating ? Math.min(5, Math.max(1, data.reportingUsefulnessRating)) : undefined,
      freeTextFeedback: data.freeTextFeedback ? data.freeTextFeedback.slice(0, 2000) : undefined,
      consentForFollowUp: !!data.consentForFollowUp,
    })
    .returning();

  return feedback;
}

export async function logPilotIssue(data: {
  pilotCompanyId?: number;
  companyId: number;
  reportedByUserId: string;
  issueType: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description?: string;
  affectedCourseId?: number;
}) {
  const [issue] = await db
    .insert(pilotIssuesTable)
    .values({
      pilotCompanyId: data.pilotCompanyId,
      companyId: data.companyId,
      reportedByUserId: data.reportedByUserId,
      issueType: data.issueType || "content",
      severity: data.severity || "medium",
      status: "new",
      title: data.title.slice(0, 255),
      description: data.description ? data.description.slice(0, 4000) : undefined,
      affectedCourseId: data.affectedCourseId,
      releaseBlocking: data.severity === "critical" || data.severity === "high",
    })
    .returning();

  return issue;
}
