import {
  db,
  pilotCompaniesTable,
  pilotFeedbackResponsesTable,
  pilotIssuesTable,
  companiesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { getCompanyTrainingAnalytics } from "./trainingAnalyticsService";
import { HttpError } from "./access";

export interface PilotOutcomeReport {
  pilotCompanyId: number;
  companyId: number;
  companyName: string;
  pilotStatus: string;
  pilotStage: string;
  approvedLearnerLimit: number;
  analytics: any;
  feedbackSummary: {
    totalResponses: number;
    averageOverallRating: number;
    averageEaseOfUse: number;
    averageContentRelevance: number;
  };
  issueSummary: {
    totalIssues: number;
    openIssues: number;
    resolvedIssues: number;
    criticalIssues: number;
  };
  generatedAt: string;
}

export async function generatePilotOutcomeReport(pilotId: number): Promise<PilotOutcomeReport> {
  const [pilot] = await db.select().from(pilotCompaniesTable).where(eq(pilotCompaniesTable.id, pilotId));
  if (!pilot) {
    throw new HttpError(404, `Pilot ID ${pilotId} not found.`);
  }

  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, pilot.companyId));
  const companyName = company ? company.name : `Company #${pilot.companyId}`;

  const analytics = await getCompanyTrainingAnalytics(pilot.companyId, "platform_admin");

  const feedback = await db.select().from(pilotFeedbackResponsesTable).where(eq(pilotFeedbackResponsesTable.companyId, pilot.companyId));
  const issues = await db.select().from(pilotIssuesTable).where(eq(pilotIssuesTable.companyId, pilot.companyId));

  const totalResponses = feedback.length;
  const avgOverall = totalResponses > 0 ? Number((feedback.reduce((acc, f) => acc + f.overallRating, 0) / totalResponses).toFixed(1)) : 0;
  const avgEase = totalResponses > 0 ? Number((feedback.reduce((acc, f) => acc + f.easeOfUseRating, 0) / totalResponses).toFixed(1)) : 0;
  const avgContent = totalResponses > 0 ? Number((feedback.reduce((acc, f) => acc + f.contentRelevanceRating, 0) / totalResponses).toFixed(1)) : 0;

  const totalIssues = issues.length;
  const openIssues = issues.filter((i) => i.status !== "resolved" && i.status !== "closed").length;
  const resolvedIssues = issues.filter((i) => i.status === "resolved" || i.status === "closed").length;
  const criticalIssues = issues.filter((i) => i.severity === "critical").length;

  return {
    pilotCompanyId: pilot.id,
    companyId: pilot.companyId,
    companyName,
    pilotStatus: pilot.pilotStatus,
    pilotStage: pilot.pilotStage,
    approvedLearnerLimit: pilot.approvedLearnerLimit,
    analytics,
    feedbackSummary: {
      totalResponses,
      averageOverallRating: avgOverall,
      averageEaseOfUse: avgEase,
      averageContentRelevance: avgContent,
    },
    issueSummary: {
      totalIssues,
      openIssues,
      resolvedIssues,
      criticalIssues,
    },
    generatedAt: new Date().toISOString(),
  };
}
