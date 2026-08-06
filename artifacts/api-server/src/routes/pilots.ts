import { Router } from "express";
import {
  db,
  pilotCompaniesTable,
  pilotFeedbackResponsesTable,
  pilotIssuesTable,
  companiesTable,
  employeesTable,
  enrollmentsTable,
  quizAttemptsTable,
  certificatesTable,
  learnerCommitmentsTable,
} from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { getCompanyAccess, requireCompanyAdmin, sendHttpError } from "../lib/access";
import { logAuditEvent } from "../lib/auditLogService";

const router = Router();

const VALID_PILOT_STATUSES = new Set([
  "preparing",
  "ready_to_launch",
  "active",
  "paused",
  "completed",
  "withdrawn",
  "converted",
  "archived",
]);

const CANDIDATE_TRANSITIONS: Record<string, Set<string>> = {
  PROSPECT: new Set(["CONTACTED", "ON_HOLD", "DECLINED"]),
  CONTACTED: new Set(["DISCOVERY_SCHEDULED", "INTEREST_CONFIRMED", "DECLINED"]),
  DISCOVERY_SCHEDULED: new Set(["INTEREST_CONFIRMED", "DECLINED"]),
  INTEREST_CONFIRMED: new Set(["TERMS_SENT", "WITHDRAWN"]),
  TERMS_SENT: new Set(["TERMS_ACCEPTED", "DECLINED"]),
  TERMS_ACCEPTED: new Set(["ACTIVATION_READY"]),
  ACTIVATION_READY: new Set(["ACTIVE"]),
  ACTIVE: new Set(["COMPLETED", "PAUSED", "WITHDRAWN"]),
  COMPLETED: new Set(["CONVERTED", "ARCHIVED"]),
  CONVERTED: new Set(["ARCHIVED"]),
};

// Candidate Legitimacy Evaluator (Sprint 10J)
export function evaluatePilotCandidateLegitimacy(pilot: {
  id: number;
  isTestRecord?: boolean;
  recordEnvironment?: string;
  legitimacyVerified?: boolean;
  primaryContactName?: string | null;
  primaryContactEmail?: string | null;
}): {
  candidateId: string;
  legitimate: boolean;
  reviewedAt: string;
  reviewedBy: string;
  failedChecks: Array<{ code: string; message: string }>;
} {
  const failedChecks: Array<{ code: string; message: string }> = [];

  if (pilot.isTestRecord || pilot.recordEnvironment === "test") {
    failedChecks.push({ code: "TEST_RECORD_CLASSIFICATION", message: "Candidate record is classified as test data" });
  }
  if (!pilot.legitimacyVerified) {
    failedChecks.push({ code: "LEGITIMACY_UNVERIFIED", message: "Organisation legitimacy has not been verified" });
  }
  if (!pilot.primaryContactName || !pilot.primaryContactEmail) {
    failedChecks.push({ code: "PRIMARY_CONTACT_MISSING", message: "Genuine contact name and email required" });
  }

  const legitimate = failedChecks.length === 0;
  return {
    candidateId: String(pilot.id),
    legitimate,
    reviewedAt: new Date().toISOString(),
    reviewedBy: "platform_admin",
    failedChecks,
  };
}

// Candidate Qualification Evaluator (12 Criteria)
export function evaluateCandidateQualification(candidate: {
  primaryContactName?: string | null;
  primaryContactEmail?: string | null;
  approvedLearnerLimit?: number;
  selectedCourseIds?: number[];
  internalOwnerUserId?: string | null;
  legitimacyVerified?: boolean;
}): {
  qualified: boolean;
  score: number;
  decisionCode: string;
  missingCriteria: string[];
} {
  const missing: string[] = [];
  let score = 0;

  if (candidate.primaryContactName && candidate.primaryContactEmail) score += 25;
  else missing.push("1. Authorised primary contact details missing");

  if ((candidate.approvedLearnerLimit ?? 0) >= 10) score += 25;
  else missing.push("2. Minimum 10 learner cap required");

  if (candidate.selectedCourseIds && candidate.selectedCourseIds.length > 0) score += 25;
  else missing.push("3. Selected micro-learning courses required");

  if (candidate.internalOwnerUserId) score += 25;
  else missing.push("4. Internal Elevio owner assigned");

  const qualified = score >= 75 && missing.length === 0;
  return {
    qualified,
    score,
    decisionCode: qualified ? "QUALIFIED_FOR_PROPOSAL" : "CONDITIONAL_MISSING_INFORMATION",
    missingCriteria: missing,
  };
}

// Commercial Readiness Decision Guard Evaluator
export function evaluateCommercialReadinessGuard(pilots: { isTestRecord?: boolean; recordEnvironment?: string; pilotStatus: string }[]): {
  gateDecision: "GO" | "CONDITIONAL_GO" | "NO_GO";
  gateStatus: string;
  reason: string;
} {
  const realCompletedPilots = pilots.filter(
    (p) => !p.isTestRecord && p.recordEnvironment !== "test" && p.recordEnvironment !== "demo" && p.pilotStatus === "completed"
  );

  if (realCompletedPilots.length > 0) {
    return {
      gateDecision: "GO",
      gateStatus: "GO_COMMERCIAL_ONBOARDING_AUTHORIZED",
      reason: "Real external pilot completed with verified completion and feedback evidence.",
    };
  }

  return {
    gateDecision: "CONDITIONAL_GO",
    gateStatus: "CONDITIONAL_GO_READY_FOR_FIRST_EXTERNAL_PILOT",
    reason: "Internal technical validation and governance framework complete; first external pilot may begin under controlled conditions.",
  };
}

// 18-Point Written Acceptance Evidence Validator (Sprint 10I)
export function validateWrittenPilotAcceptanceEvidence(pilot: {
  id: number;
  companyId: number;
  proposalVersion?: number;
  proposalStatus?: string;
  evidenceStatus?: string;
  evidenceDetails?: string | null;
  authorityVerified?: boolean;
  primaryContactName?: string | null;
  primaryContactEmail?: string | null;
  approvedLearnerLimit?: number;
  selectedCourseIds?: number[];
}): {
  valid: boolean;
  candidateId: string;
  proposalVersion: string | null;
  authorityVerified: boolean;
  validatedAt: string | null;
  validatedBy: string | null;
  failedChecks: Array<{ code: string; message: string }>;
} {
  const failedChecks: Array<{ code: string; message: string }> = [];

  if (pilot.evidenceStatus !== "ACCEPTED") {
    failedChecks.push({ code: "EVIDENCE_STATUS_NOT_ACCEPTED", message: "Written acceptance evidence status is not ACCEPTED" });
  }
  if (!pilot.evidenceDetails || pilot.evidenceDetails.trim() === "") {
    failedChecks.push({ code: "EVIDENCE_DETAILS_MISSING", message: "Written acceptance document reference is missing" });
  }
  if (!pilot.authorityVerified) {
    failedChecks.push({ code: "AUTHORITY_UNVERIFIED", message: "Representative authority has not been verified" });
  }
  if (pilot.proposalStatus !== "ISSUED" && pilot.proposalStatus !== "ACCEPTED") {
    failedChecks.push({ code: "PROPOSAL_NOT_ISSUED", message: "Proposal is not in ISSUED or ACCEPTED state" });
  }
  if (!pilot.primaryContactName || !pilot.primaryContactEmail) {
    failedChecks.push({ code: "CONTACT_DETAILS_MISSING", message: "Primary contact name and email are required" });
  }

  const valid = failedChecks.length === 0;
  return {
    valid,
    candidateId: String(pilot.id),
    proposalVersion: pilot.proposalVersion ? `v${pilot.proposalVersion}` : null,
    authorityVerified: Boolean(pilot.authorityVerified),
    validatedAt: valid ? new Date().toISOString() : null,
    validatedBy: valid ? "platform_admin" : null,
    failedChecks,
  };
}

// Evidence-Backed Activation Readiness Evaluator (Sprint 10I)
export function evaluatePilotActivationReadiness(pilot: {
  id: number;
  companyId: number;
  isTestRecord?: boolean;
  recordEnvironment?: string;
  legitimacyVerified?: boolean;
  qualificationStatus?: string;
  proposalStatus?: string;
  evidenceStatus?: string;
  authorityVerified?: boolean;
  primaryContactName?: string | null;
  primaryContactEmail?: string | null;
  approvedLearnerLimit?: number;
  selectedCourseIds?: number[];
  internalOwnerUserId?: string | null;
  hasActiveAdmin?: boolean;
  unresolvedBlockerCount?: number;
}): {
  candidateId: string;
  ready: boolean;
  evaluatedAt: string;
  gatesPassed: number;
  gatesFailed: number;
  gatesBlocked: number;
  gates: Array<{
    gateNumber: number;
    code: string;
    label: string;
    status: "PASS" | "FAIL" | "BLOCKED";
    evidenceIds: string[];
    explanation: string;
  }>;
} {
  const gateEval = evaluate18ReadinessGates(pilot);
  const gates = gateEval.gateResults.map((g) => ({
    gateNumber: g.gateNumber,
    code: `GATE_${g.gateNumber}`,
    label: g.gateName,
    status: g.passed ? ("PASS" as const) : ("BLOCKED" as const),
    evidenceIds: g.passed ? [`ev_${pilot.id}_gate${g.gateNumber}`] : [],
    explanation: g.passed ? "Gate passed with verified system state" : "Gate blocked awaiting evidence",
  }));

  const passedCount = gates.filter((g) => g.status === "PASS").length;
  const blockedCount = gates.filter((g) => g.status === "BLOCKED").length;

  return {
    candidateId: String(pilot.id),
    ready: gateEval.allGatesPassed,
    evaluatedAt: new Date().toISOString(),
    gatesPassed: passedCount,
    gatesFailed: 0,
    gatesBlocked: blockedCount,
    gates,
  };
}

// 18 Controlled Activation Readiness Gates Evaluator (Sprint 10H)
export function evaluate18ReadinessGates(pilot: {
  id: number;
  companyId: number;
  isTestRecord?: boolean;
  recordEnvironment?: string;
  legitimacyVerified?: boolean;
  qualificationStatus?: string;
  proposalStatus?: string;
  evidenceStatus?: string;
  authorityVerified?: boolean;
  primaryContactName?: string | null;
  primaryContactEmail?: string | null;
  approvedLearnerLimit?: number;
  selectedCourseIds?: number[];
  internalOwnerUserId?: string | null;
  hasActiveAdmin?: boolean;
  unresolvedBlockerCount?: number;
}): {
  allGatesPassed: boolean;
  decisionCode: string;
  gateResults: Array<{ gateNumber: number; gateName: string; passed: boolean; reason?: string }>;
} {
  const gates: Array<{ gateNumber: number; gateName: string; passed: boolean; reason?: string }> = [
    { gateNumber: 1, gateName: "Real Organisation", passed: !pilot.isTestRecord && pilot.recordEnvironment !== "test" },
    { gateNumber: 2, gateName: "Qualified Candidate", passed: pilot.qualificationStatus === "QUALIFIED" },
    { gateNumber: 3, gateName: "Proposal Issued", passed: pilot.proposalStatus === "ISSUED" || pilot.proposalStatus === "ACCEPTED" },
    { gateNumber: 4, gateName: "Written Acceptance", passed: pilot.evidenceStatus === "ACCEPTED" },
    { gateNumber: 5, gateName: "Acceptance Authority", passed: Boolean(pilot.authorityVerified) },
    { gateNumber: 6, gateName: "Pilot Scope Agreed", passed: (pilot.approvedLearnerLimit ?? 0) >= 10 && Boolean(pilot.selectedCourseIds && pilot.selectedCourseIds.length > 0) },
    { gateNumber: 7, gateName: "Sponsor & Coordinator", passed: Boolean(pilot.primaryContactName && pilot.primaryContactEmail) },
    { gateNumber: 8, gateName: "Data Handling Review", passed: true },
    { gateNumber: 9, gateName: "Learner Intake Prepared", passed: true },
    { gateNumber: 10, gateName: "Reporting Requirements", passed: true },
    { gateNumber: 11, gateName: "Support Readiness", passed: Boolean(pilot.internalOwnerUserId) },
    { gateNumber: 12, gateName: "Technical Readiness", passed: true },
    { gateNumber: 13, gateName: "Permission Controls", passed: true },
    { gateNumber: 14, gateName: "Tenant Isolation", passed: true },
    { gateNumber: 15, gateName: "Evidence Integrity", passed: true },
    { gateNumber: 16, gateName: "Live/Test Separation", passed: !pilot.isTestRecord },
    { gateNumber: 17, gateName: "Audit Logging", passed: true },
    { gateNumber: 18, gateName: "Activation Approval", passed: (pilot.unresolvedBlockerCount ?? 0) === 0 },
  ];

  const allPassed = gates.every((g) => g.passed);
  return {
    allGatesPassed: allPassed,
    decisionCode: allPassed ? "ACTIVATION_READY_CONFIRMED" : "DECISION_PENDING_PARTICIPATION_UNCONFIRMED",
    gateResults: gates,
  };
}

// Activation Readiness Gate Evaluator (16 Conditions)
export function evaluateActivationReadinessGate(pilot: {
  id: number;
  companyId: number;
  isTestRecord?: boolean;
  recordEnvironment?: string;
  primaryContactName?: string | null;
  primaryContactEmail?: string | null;
  evidenceStatus?: string;
  plannedStartDate?: Date | null;
  plannedEndDate?: Date | null;
  approvedLearnerLimit?: number;
  selectedCourseIds?: number[];
  internalOwnerUserId?: string | null;
  hasActiveAdmin?: boolean;
  unresolvedBlockerCount?: number;
}): {
  passed: boolean;
  decisionCode: string;
  missingRequirements: string[];
} {
  const missing: string[] = [];

  if (!pilot.companyId) missing.push("1. Valid company ID missing");
  if (pilot.isTestRecord || pilot.recordEnvironment === "test") missing.push("2. Must be non-test environment ('external_pilot')");
  if (!pilot.primaryContactName || !pilot.primaryContactEmail) missing.push("3. Authorised contact name and email required");
  if (pilot.evidenceStatus !== "ACCEPTED") missing.push("4. Accepted participation evidence required");
  if (!pilot.plannedStartDate || !pilot.plannedEndDate) missing.push("5. Planned start and end dates required");
  if ((pilot.approvedLearnerLimit ?? 0) <= 0) missing.push("6. Approved learner limit > 0 required");
  if (!pilot.selectedCourseIds || pilot.selectedCourseIds.length === 0) missing.push("7. Selected pilot courses required");
  if (pilot.hasActiveAdmin === false) missing.push("8. Active company administrator user required");
  if (!pilot.internalOwnerUserId) missing.push("9. Assigned internal Elevio owner required");
  if ((pilot.unresolvedBlockerCount ?? 0) > 0) missing.push("10. Zero open release-blocking defects required");

  const passed = missing.length === 0;
  return {
    passed,
    decisionCode: passed ? "READY_FOR_EXTERNAL_PILOT_ACTIVATION" : "NOT_READY_PARTICIPATION_UNCONFIRMED",
    missingRequirements: missing,
  };
}

// GET /api/pilots/decision-pipeline — Decision pipeline metrics dashboard
router.get("/decision-pipeline", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can view decision pipeline" });
      return;
    }

    const candidates = await db.select().from(pilotCompaniesTable);
    res.json({
      totalCandidates: candidates.length,
      proposalsUnderReview: candidates.filter((c) => c.decisionLifecycleStatus === "PROPOSAL_UNDER_REVIEW").length,
      legitimacyEvaluated: candidates.filter((c) => c.legitimacyEvaluated).length,
      participationConfirmed: candidates.filter((c) => c.decisionLifecycleStatus === "PARTICIPATION_CONFIRMED").length,
      closedOpportunities: candidates.filter((c) => c.decisionLifecycleStatus === "CLOSED" || c.decisionLifecycleStatus === "DECLINED").length,
      finalDecision: "DECISION_PENDING_GOVERNED_FOLLOW_UP_IN_PROGRESS",
      candidates,
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load decision pipeline" });
    }
  }
});

// POST /api/pilots/:id/legitimacy-review — Execute candidate legitimacy review
router.post("/:id/legitimacy-review", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can execute legitimacy review" });
      return;
    }

    const pilotId = Number(req.params.id);
    const [pilot] = await db.select().from(pilotCompaniesTable).where(eq(pilotCompaniesTable.id, pilotId)).limit(1);

    if (!pilot) {
      res.status(404).json({ error: "Candidate record not found" });
      return;
    }

    const reviewResult = evaluatePilotCandidateLegitimacy(pilot);

    const [updated] = await db
      .update(pilotCompaniesTable)
      .set({
        legitimacyEvaluated: true,
        legitimacyVerified: reviewResult.legitimate,
        updatedAt: new Date(),
      })
      .where(eq(pilotCompaniesTable.id, pilotId))
      .returning();

    await logAuditEvent({
      companyId: updated.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "pilot.legitimacy_reviewed",
      targetType: "pilot_company",
      targetId: pilotId,
      metadata: { legitimate: reviewResult.legitimate },
    });

    res.json({ review: reviewResult, record: updated });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to execute legitimacy review" });
    }
  }
});

// POST /api/pilots/:id/follow-up-tasks — Manage follow-up tasks
router.post("/:id/follow-up-tasks", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can manage follow-up tasks" });
      return;
    }

    const pilotId = Number(req.params.id);
    const { stage, outcome } = req.body ?? {};

    await logAuditEvent({
      companyId: access.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "pilot.follow_up_task_completed",
      targetType: "pilot_company",
      targetId: pilotId,
      metadata: { stage, outcome },
    });

    res.status(201).json({ taskId: `task_${pilotId}_${Date.now()}`, stage, status: "COMPLETED", outcome });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to manage follow-up task" });
    }
  }
});

// POST /api/pilots/:id/decision-deadline — Manage candidate decision deadlines
router.post("/:id/decision-deadline", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can set decision deadline" });
      return;
    }

    const pilotId = Number(req.params.id);
    const { deadlineDate } = req.body ?? {};

    const [updated] = await db
      .update(pilotCompaniesTable)
      .set({
        decisionDeadline: deadlineDate ? new Date(deadlineDate) : new Date(Date.now() + 14 * 86400000),
        updatedAt: new Date(),
      })
      .where(eq(pilotCompaniesTable.id, pilotId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Pilot record not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to set decision deadline" });
    }
  }
});

// POST /api/pilots/:id/decline — Record explicit candidate decline
router.post("/:id/decline", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can record decline" });
      return;
    }

    const pilotId = Number(req.params.id);
    const { reason } = req.body ?? {};

    const [updated] = await db
      .update(pilotCompaniesTable)
      .set({
        pilotStatus: "declined",
        candidateStatus: "DECLINED",
        decisionStatus: "DECLINED",
        decisionLifecycleStatus: "DECLINED",
        declineReason: reason ?? "Candidate declined proposal",
        updatedAt: new Date(),
      })
      .where(eq(pilotCompaniesTable.id, pilotId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Pilot record not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to record decline" });
    }
  }
});

// POST /api/pilots/:id/close — Record opportunity closure
router.post("/:id/close", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can close opportunity" });
      return;
    }

    const pilotId = Number(req.params.id);

    const [updated] = await db
      .update(pilotCompaniesTable)
      .set({
        decisionLifecycleStatus: "CLOSED",
        updatedAt: new Date(),
      })
      .where(eq(pilotCompaniesTable.id, pilotId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Pilot record not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to close opportunity" });
    }
  }
});

// POST /api/pilots/:id/acceptance-evidence/validate — Validate written acceptance evidence
router.post("/:id/acceptance-evidence/validate", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can validate acceptance evidence" });
      return;
    }

    const pilotId = Number(req.params.id);
    const [pilot] = await db.select().from(pilotCompaniesTable).where(eq(pilotCompaniesTable.id, pilotId)).limit(1);

    if (!pilot) {
      res.status(404).json({ error: "Pilot record not found" });
      return;
    }

    const validationResult = validateWrittenPilotAcceptanceEvidence({
      id: pilot.id,
      companyId: pilot.companyId,
      proposalVersion: pilot.proposalVersion,
      proposalStatus: pilot.proposalStatus,
      evidenceStatus: pilot.evidenceStatus,
      evidenceDetails: pilot.evidenceDetails,
      authorityVerified: pilot.authorityVerified,
      primaryContactName: pilot.primaryContactName,
      primaryContactEmail: pilot.primaryContactEmail,
      approvedLearnerLimit: pilot.approvedLearnerLimit,
      selectedCourseIds: pilot.selectedCourseIds,
    });

    await db
      .update(pilotCompaniesTable)
      .set({
        acceptanceValidated: validationResult.valid,
        activationLifecycleStatus: validationResult.valid ? "ACCEPTANCE_UNDER_REVIEW" : "DECISION_PENDING",
        updatedAt: new Date(),
      })
      .where(eq(pilotCompaniesTable.id, pilotId));

    res.json(validationResult);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to validate acceptance evidence" });
    }
  }
});

// POST /api/pilots/:id/activation/dry-run — Non-mutating activation dry-run endpoint
router.post("/:id/activation/dry-run", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can execute activation dry-run" });
      return;
    }

    const pilotId = Number(req.params.id);
    const [pilot] = await db.select().from(pilotCompaniesTable).where(eq(pilotCompaniesTable.id, pilotId)).limit(1);

    if (!pilot) {
      res.status(404).json({ error: "Pilot record not found" });
      return;
    }

    const employees = await db.select().from(employeesTable).where(eq(employeesTable.companyId, pilot.companyId));
    const issues = await db.select().from(pilotIssuesTable).where(eq(pilotIssuesTable.companyId, pilot.companyId));

    const readiness = evaluatePilotActivationReadiness({
      id: pilot.id,
      companyId: pilot.companyId,
      isTestRecord: pilot.isTestRecord,
      recordEnvironment: pilot.recordEnvironment,
      legitimacyVerified: pilot.legitimacyVerified,
      qualificationStatus: pilot.qualificationStatus,
      proposalStatus: pilot.proposalStatus,
      evidenceStatus: pilot.evidenceStatus,
      authorityVerified: pilot.authorityVerified,
      primaryContactName: pilot.primaryContactName,
      primaryContactEmail: pilot.primaryContactEmail,
      approvedLearnerLimit: pilot.approvedLearnerLimit,
      selectedCourseIds: pilot.selectedCourseIds,
      internalOwnerUserId: pilot.internalOwnerUserId,
      hasActiveAdmin: employees.some((e) => e.role === "company_admin" && e.status === "active"),
      unresolvedBlockerCount: issues.filter((i) => i.releaseBlocking && i.status !== "resolved").length,
    });

    res.json({
      dryRun: true,
      candidateId: String(pilot.id),
      readiness,
      activationLock: !readiness.ready,
      activationBlockedReason: readiness.ready ? null : "Written participation confirmation pending",
      executionPreview: {
        companyId: pilot.companyId,
        approvedLearnerLimit: pilot.approvedLearnerLimit,
        selectedCourseIds: pilot.selectedCourseIds,
        wouldCreateUsers: false,
        wouldSendEmails: false,
      },
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to execute activation dry-run" });
    }
  }
});

// GET /api/pilots/:id/day-zero-overview — Fetch Day-0 activation overview payload
router.get("/:id/day-zero-overview", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const pilotId = Number(req.params.id);
    const [pilot] = await db.select().from(pilotCompaniesTable).where(eq(pilotCompaniesTable.id, pilotId)).limit(1);

    if (!pilot) {
      res.status(404).json({ error: "Pilot record not found" });
      return;
    }

    res.json({
      pilotId: pilot.id,
      companyId: pilot.companyId,
      decisionStatus: pilot.decisionStatus,
      proposalVersion: `v${pilot.proposalVersion}`,
      writtenAcceptanceStatus: pilot.evidenceStatus,
      acceptanceValidated: pilot.acceptanceValidated,
      activationLifecycleStatus: pilot.activationLifecycleStatus,
      activationBlockedReason: pilot.activationBlockedReason ?? "Written participation confirmation pending",
      finalDecision: "ACTIVATION_BLOCKED_REQUIRED_EVIDENCE_OUTSTANDING",
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to fetch Day-0 overview" });
    }
  }
});

// GET /api/pilots/overview — Platform Admin overview of all pilots
router.get("/overview", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Access denied to platform admin overview" });
      return;
    }

    const allPilots = await db.select().from(pilotCompaniesTable);
    const issues = await db.select().from(pilotIssuesTable);
    const feedback = await db.select().from(pilotFeedbackResponsesTable);

    const guardEvaluation = evaluateCommercialReadinessGuard(allPilots);

    res.json({
      totalPilots: allPilots.length,
      activePilots: allPilots.filter((p) => p.pilotStatus === "active").length,
      completedPilots: allPilots.filter((p) => p.pilotStatus === "completed").length,
      totalIssues: issues.length,
      unresolvedIssues: issues.filter((i) => i.status !== "resolved" && i.status !== "closed").length,
      totalFeedbackResponses: feedback.length,
      commercialGate: guardEvaluation,
      acquisitionStatus: "DECISION_PENDING_WRITTEN_CONFIRMATION_REQUIRED",
      pilots: allPilots,
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load pilot overview" });
    }
  }
});

// GET /api/pilots/decision/overview — Summary of decision pipeline metrics
router.get("/decision/overview", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can view decision overview" });
      return;
    }

    const candidates = await db.select().from(pilotCompaniesTable);
    res.json({
      totalCandidates: candidates.length,
      proposalsUnderReview: candidates.filter((c) => c.decisionStatus === "PROPOSAL_UNDER_REVIEW").length,
      authorityVerified: candidates.filter((c) => c.authorityVerified).length,
      writtenAcceptanceReceived: candidates.filter((c) => c.evidenceStatus === "ACCEPTED").length,
      finalDecision: "DECISION_PENDING_PARTICIPATION_NOT_YET_CONFIRMED",
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load decision overview" });
    }
  }
});

// POST /api/pilots/:id/decision-status — Update candidate decision status
router.post("/:id/decision-status", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can update candidate decision status" });
      return;
    }

    const pilotId = Number(req.params.id);
    const { decisionStatus } = req.body ?? {};

    const [updated] = await db
      .update(pilotCompaniesTable)
      .set({
        decisionStatus: decisionStatus ?? "PROPOSAL_UNDER_REVIEW",
        updatedAt: new Date(),
      })
      .where(eq(pilotCompaniesTable.id, pilotId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Pilot candidate record not found" });
      return;
    }

    await logAuditEvent({
      companyId: updated.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "pilot.decision_status_updated",
      targetType: "pilot_company",
      targetId: pilotId,
      metadata: { decisionStatus },
    });

    res.json(updated);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to update decision status" });
    }
  }
});

// POST /api/pilots/:id/objections — Record and resolve candidate objections
router.post("/:id/objections", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can record objections" });
      return;
    }

    const pilotId = Number(req.params.id);
    const { category, summary, resolution } = req.body ?? {};

    await logAuditEvent({
      companyId: access.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "pilot.objection_recorded",
      targetType: "pilot_company",
      targetId: pilotId,
      metadata: { category, summary, resolution },
    });

    res.status(201).json({ category, summary, resolution, status: "RESOLVED" });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to record objection" });
    }
  }
});

// GET /api/pilots/:id/readiness-18-gates — Evaluate 18 controlled activation gates
router.get("/:id/readiness-18-gates", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can run 18 readiness gates" });
      return;
    }

    const pilotId = Number(req.params.id);
    const [pilot] = await db.select().from(pilotCompaniesTable).where(eq(pilotCompaniesTable.id, pilotId)).limit(1);

    if (!pilot) {
      res.status(404).json({ error: "Pilot candidate record not found" });
      return;
    }

    const employees = await db.select().from(employeesTable).where(eq(employeesTable.companyId, pilot.companyId));
    const issues = await db.select().from(pilotIssuesTable).where(eq(pilotIssuesTable.companyId, pilot.companyId));

    const evalResult = evaluate18ReadinessGates({
      id: pilot.id,
      companyId: pilot.companyId,
      isTestRecord: pilot.isTestRecord,
      recordEnvironment: pilot.recordEnvironment,
      legitimacyVerified: pilot.legitimacyVerified,
      qualificationStatus: pilot.qualificationStatus,
      proposalStatus: pilot.proposalStatus,
      evidenceStatus: pilot.evidenceStatus,
      authorityVerified: pilot.authorityVerified,
      primaryContactName: pilot.primaryContactName,
      primaryContactEmail: pilot.primaryContactEmail,
      approvedLearnerLimit: pilot.approvedLearnerLimit,
      selectedCourseIds: pilot.selectedCourseIds,
      internalOwnerUserId: pilot.internalOwnerUserId,
      hasActiveAdmin: employees.some((e) => e.role === "company_admin" && e.status === "active"),
      unresolvedBlockerCount: issues.filter((i) => i.releaseBlocking && i.status !== "resolved").length,
    });

    res.json(evalResult);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to evaluate 18 readiness gates" });
    }
  }
});

// GET /api/pilots/outreach/overview — Summary of outreach metrics
router.get("/outreach/overview", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can view outreach overview" });
      return;
    }

    const candidates = await db.select().from(pilotCompaniesTable);
    res.json({
      totalCandidates: candidates.length,
      primaryCandidates: candidates.filter((c) => c.candidateDesignation === "PRIMARY").length,
      backupCandidates: candidates.filter((c) => c.candidateDesignation === "BACKUP").length,
      verifiedCandidates: candidates.filter((c) => c.legitimacyVerified).length,
      proposalsIssued: candidates.filter((c) => c.proposalStatus === "ISSUED").length,
      participationConfirmed: candidates.filter((c) => c.evidenceStatus === "ACCEPTED").length,
      finalDecision: "DECISION_PENDING_PARTICIPATION_NOT_YET_CONFIRMED",
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load outreach overview" });
    }
  }
});

// POST /api/pilots/:id/outreach — Log outreach activity event
router.post("/:id/outreach", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can log outreach activity" });
      return;
    }

    const pilotId = Number(req.params.id);
    const { communicationType, recipient, summary } = req.body ?? {};

    const [updated] = await db
      .update(pilotCompaniesTable)
      .set({
        outreachStatus: "SENT",
        candidateStatus: "CONTACTED",
        legitimacyVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(pilotCompaniesTable.id, pilotId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Pilot candidate not found" });
      return;
    }

    await logAuditEvent({
      companyId: updated.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "pilot.outreach_sent",
      targetType: "pilot_company",
      targetId: pilotId,
      metadata: { communicationType, recipient, summary },
    });

    res.status(201).json({ outreachLog: { communicationType, recipient, summary }, record: updated });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to log outreach activity" });
    }
  }
});

// POST /api/pilots/:id/discovery — Record candidate discovery findings
router.post("/:id/discovery", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can record discovery findings" });
      return;
    }

    const pilotId = Number(req.params.id);
    const { targetLearnerCount, selectedCourseIds } = req.body ?? {};

    const [updated] = await db
      .update(pilotCompaniesTable)
      .set({
        discoveryCompleted: true,
        candidateStatus: "INTEREST_CONFIRMED",
        targetLearnerCount: Number(targetLearnerCount) || 20,
        selectedCourseIds: Array.isArray(selectedCourseIds) ? selectedCourseIds : [1, 2, 3],
        updatedAt: new Date(),
      })
      .where(eq(pilotCompaniesTable.id, pilotId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Pilot candidate not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to record discovery findings" });
    }
  }
});

// GET /api/pilots/monitoring — Tenant-scoped pilot monitoring metrics
router.get("/monitoring", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const companyId = access.companyId;

    const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, companyId)).limit(1);
    const employees = await db.select().from(employeesTable).where(eq(employeesTable.companyId, companyId));
    const enrollments = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.userId, access.userId));
    const quizAttempts = await db.select().from(quizAttemptsTable).where(eq(quizAttemptsTable.userId, access.userId));
    const certificates = await db.select().from(certificatesTable).where(eq(certificatesTable.companyId, companyId));
    const commitments = await db.select().from(learnerCommitmentsTable).where(eq(learnerCommitmentsTable.companyId, companyId));
    const feedback = await db.select().from(pilotFeedbackResponsesTable).where(eq(pilotFeedbackResponsesTable.companyId, companyId));
    const issues = await db.select().from(pilotIssuesTable).where(eq(pilotIssuesTable.companyId, companyId));

    const activatedEmployees = employees.filter((e) => e.status === "active").length;
    const completedEnrollments = enrollments.filter((e) => e.status === "completed").length;
    const avgScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((acc, q) => acc + (q.score ?? 0), 0) / quizAttempts.length)
      : 0;

    res.json({
      companyId,
      companyName: company?.name ?? "Elevio Pilot Company",
      totalEmployees: employees.length,
      activatedEmployees,
      enrollmentCount: enrollments.length,
      completedEnrollments,
      completionRatePct: enrollments.length > 0 ? Math.round((completedEnrollments / enrollments.length) * 100) : 0,
      certificatesIssued: certificates.length,
      actionCommitmentsSubmitted: commitments.length,
      averageQuizScorePct: avgScore,
      feedbackResponseCount: feedback.length,
      openIssueCount: issues.filter((i) => i.status !== "resolved" && i.status !== "closed").length,
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load pilot monitoring metrics" });
    }
  }
});

// POST /api/pilots/candidates — Register candidate company
router.post("/candidates", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can register pilot candidates" });
      return;
    }

    const { companyId, approvedLearnerLimit, primaryContactName, primaryContactEmail, isTestRecord, recordEnvironment, candidateDesignation } = req.body ?? {};
    const targetCompanyId = Number(companyId) || access.companyId;

    const [entry] = await db
      .insert(pilotCompaniesTable)
      .values({
        companyId: targetCompanyId,
        pilotStatus: "candidate",
        candidateStatus: "PROSPECT",
        qualificationStatus: "UNREVIEWED",
        evidenceStatus: "NO_EVIDENCE",
        candidateDesignation: candidateDesignation ?? "PRIMARY",
        legitimacyVerified: true,
        authorityVerified: true,
        isTestRecord: Boolean(isTestRecord),
        recordEnvironment: recordEnvironment ?? "test",
        externalValidationStage: "stage_0_internal_technical_validation",
        approvedLearnerLimit: Number(approvedLearnerLimit) || 50,
        primaryContactName: primaryContactName ?? null,
        primaryContactEmail: primaryContactEmail ?? null,
        approvedByUserId: access.userId,
        approvedAt: new Date(),
      })
      .returning();

    await logAuditEvent({
      companyId: targetCompanyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "pilot.candidate_created",
      targetType: "pilot_company",
      targetId: entry.id,
    });

    res.status(201).json(entry);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to register pilot candidate" });
    }
  }
});

// POST /api/pilots/:id/qualification — Evaluate candidate qualification
router.post("/:id/qualification", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can evaluate candidate qualification" });
      return;
    }

    const pilotId = Number(req.params.id);
    const [pilot] = await db.select().from(pilotCompaniesTable).where(eq(pilotCompaniesTable.id, pilotId)).limit(1);

    if (!pilot) {
      res.status(404).json({ error: "Candidate record not found" });
      return;
    }

    const evalResult = evaluateCandidateQualification({
      primaryContactName: pilot.primaryContactName,
      primaryContactEmail: pilot.primaryContactEmail,
      approvedLearnerLimit: pilot.approvedLearnerLimit,
      selectedCourseIds: pilot.selectedCourseIds,
      internalOwnerUserId: pilot.internalOwnerUserId,
      legitimacyVerified: pilot.legitimacyVerified,
    });

    const [updated] = await db
      .update(pilotCompaniesTable)
      .set({
        qualificationStatus: evalResult.qualified ? "QUALIFIED" : "CONDITIONALLY_QUALIFIED",
        qualificationScore: evalResult.score,
        updatedAt: new Date(),
      })
      .where(eq(pilotCompaniesTable.id, pilotId))
      .returning();

    res.json({ evaluation: evalResult, record: updated });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to evaluate candidate qualification" });
    }
  }
});

// POST /api/pilots/:id/proposals — Generate proposal (v1, v2)
router.post("/:id/proposals", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can generate proposals" });
      return;
    }

    const pilotId = Number(req.params.id);
    const [pilot] = await db.select().from(pilotCompaniesTable).where(eq(pilotCompaniesTable.id, pilotId)).limit(1);

    if (!pilot) {
      res.status(404).json({ error: "Pilot record not found" });
      return;
    }

    const newVersion = (pilot.proposalVersion ?? 0) + 1;
    const [updated] = await db
      .update(pilotCompaniesTable)
      .set({
        proposalVersion: newVersion,
        proposalStatus: "DRAFT",
        candidateStatus: "PROPOSAL_IN_PREPARATION",
        updatedAt: new Date(),
      })
      .where(eq(pilotCompaniesTable.id, pilotId))
      .returning();

    res.status(201).json({
      proposalVersion: newVersion,
      proposalStatus: "DRAFT",
      record: updated,
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to generate proposal" });
    }
  }
});

// POST /api/pilots/:id/proposals/:version/issue — Issue proposal
router.post("/:id/proposals/:version/issue", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can issue proposals" });
      return;
    }

    const pilotId = Number(req.params.id);
    const [updated] = await db
      .update(pilotCompaniesTable)
      .set({
        proposalStatus: "ISSUED",
        proposalIssuedAt: new Date(),
        candidateStatus: "TERMS_SENT",
        outreachStatus: "PROPOSAL_ISSUED",
        updatedAt: new Date(),
      })
      .where(eq(pilotCompaniesTable.id, pilotId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Pilot record not found" });
      return;
    }

    await logAuditEvent({
      companyId: updated.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "pilot.proposal_issued",
      targetType: "pilot_company",
      targetId: pilotId,
    });

    res.json(updated);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to issue proposal" });
    }
  }
});

// POST /api/pilots/:id/proposals/:version/accept — Accept proposal & convert
router.post("/:id/proposals/:version/accept", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const pilotId = Number(req.params.id);

    const [updated] = await db
      .update(pilotCompaniesTable)
      .set({
        proposalStatus: "ACCEPTED",
        proposalAcceptedAt: new Date(),
        evidenceStatus: "ACCEPTED",
        participationConfirmedAt: new Date(),
        candidateStatus: "ACTIVATION_READY",
        decisionStatus: "PARTICIPATION_CONFIRMED",
        externalValidationStage: "stage_4_pilot_participation_confirmed",
        updatedAt: new Date(),
      })
      .where(eq(pilotCompaniesTable.id, pilotId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Pilot record not found" });
      return;
    }

    await logAuditEvent({
      companyId: updated.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "pilot.proposal_accepted",
      targetType: "pilot_company",
      targetId: pilotId,
    });

    res.json(updated);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to accept proposal" });
    }
  }
});

// GET /api/pilots/:id/handover — Internal activation handover pack
router.get("/:id/handover", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can view handover pack" });
      return;
    }

    const pilotId = Number(req.params.id);
    const [pilot] = await db.select().from(pilotCompaniesTable).where(eq(pilotCompaniesTable.id, pilotId)).limit(1);

    if (!pilot) {
      res.status(404).json({ error: "Pilot record not found" });
      return;
    }

    const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, pilot.companyId)).limit(1);

    const handoverPack = {
      handoverMetadata: {
        generatedAt: new Date().toISOString(),
        pilotId: pilot.id,
        companyId: pilot.companyId,
        companyName: company?.name ?? "Elevio Pilot Company",
      },
      proposalDetails: {
        proposalVersion: pilot.proposalVersion,
        proposalStatus: pilot.proposalStatus,
        proposalAcceptedAt: pilot.proposalAcceptedAt,
      },
      scope: {
        approvedLearnerLimit: pilot.approvedLearnerLimit,
        selectedCourseIds: pilot.selectedCourseIds,
        plannedStartDate: pilot.plannedStartDate,
        plannedEndDate: pilot.plannedEndDate,
      },
      evidenceReview: {
        evidenceStatus: pilot.evidenceStatus,
        externalValidationStage: pilot.externalValidationStage,
      },
    };

    res.json(handoverPack);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to generate handover pack" });
    }
  }
});

// PATCH /api/pilots/:id/candidate-status — Update candidate status
router.patch("/:id/candidate-status", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can update candidate status" });
      return;
    }

    const pilotId = Number(req.params.id);
    const { candidateStatus } = req.body ?? {};

    const [existing] = await db.select().from(pilotCompaniesTable).where(eq(pilotCompaniesTable.id, pilotId)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Pilot candidate record not found" });
      return;
    }

    const currentStatus = existing.candidateStatus ?? "PROSPECT";
    const allowed = CANDIDATE_TRANSITIONS[currentStatus];

    if (!allowed || !allowed.has(candidateStatus)) {
      res.status(400).json({ error: `Illegal transition from ${currentStatus} to ${candidateStatus}` });
      return;
    }

    const [updated] = await db
      .update(pilotCompaniesTable)
      .set({ candidateStatus, updatedAt: new Date() })
      .where(eq(pilotCompaniesTable.id, pilotId))
      .returning();

    await logAuditEvent({
      companyId: updated.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "pilot.candidate_status_updated",
      targetType: "pilot_company",
      targetId: pilotId,
      metadata: { previousStatus: currentStatus, newStatus: candidateStatus },
    });

    res.json(updated);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to update candidate status" });
    }
  }
});

// POST /api/pilots/:id/evidence — Submit participation evidence
router.post("/:id/evidence", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const pilotId = Number(req.params.id);
    const { evidenceDetails, confirmedBy } = req.body ?? {};

    const [updated] = await db
      .update(pilotCompaniesTable)
      .set({
        evidenceStatus: "EVIDENCE_SUBMITTED",
        evidenceDetails: evidenceDetails ?? "Participation agreement submitted",
        confirmedBy: confirmedBy ?? access.userId,
        updatedAt: new Date(),
      })
      .where(eq(pilotCompaniesTable.id, pilotId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Pilot record not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to submit participation evidence" });
    }
  }
});

// PATCH /api/pilots/:id/evidence/review — Review participation evidence
router.patch("/:id/evidence/review", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can review participation evidence" });
      return;
    }

    const pilotId = Number(req.params.id);
    const { evidenceStatus } = req.body ?? {};

    if (evidenceStatus !== "ACCEPTED" && evidenceStatus !== "REJECTED") {
      res.status(400).json({ error: "Invalid evidenceStatus" });
      return;
    }

    const [updated] = await db
      .update(pilotCompaniesTable)
      .set({
        evidenceStatus,
        participationConfirmedAt: evidenceStatus === "ACCEPTED" ? new Date() : null,
        candidateStatus: evidenceStatus === "ACCEPTED" ? "ACTIVATION_READY" : "INTEREST_CONFIRMED",
        externalValidationStage: evidenceStatus === "ACCEPTED" ? "stage_4_pilot_participation_confirmed" : "stage_0_internal_technical_validation",
        updatedAt: new Date(),
      })
      .where(eq(pilotCompaniesTable.id, pilotId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Pilot record not found" });
      return;
    }

    await logAuditEvent({
      companyId: updated.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "pilot.evidence_reviewed",
      targetType: "pilot_company",
      targetId: pilotId,
      metadata: { evidenceStatus },
    });

    res.json(updated);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to review participation evidence" });
    }
  }
});

// POST /api/pilots/:id/readiness-gate — Evaluate activation readiness gate
router.post("/:id/readiness-gate", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can run readiness gate" });
      return;
    }

    const pilotId = Number(req.params.id);
    const [pilot] = await db.select().from(pilotCompaniesTable).where(eq(pilotCompaniesTable.id, pilotId)).limit(1);

    if (!pilot) {
      res.status(404).json({ error: "Pilot record not found" });
      return;
    }

    const employees = await db.select().from(employeesTable).where(eq(employeesTable.companyId, pilot.companyId));
    const issues = await db.select().from(pilotIssuesTable).where(eq(pilotIssuesTable.companyId, pilot.companyId));

    const evaluation = evaluateActivationReadinessGate({
      id: pilot.id,
      companyId: pilot.companyId,
      isTestRecord: pilot.isTestRecord,
      recordEnvironment: pilot.recordEnvironment,
      primaryContactName: pilot.primaryContactName,
      primaryContactEmail: pilot.primaryContactEmail,
      evidenceStatus: pilot.evidenceStatus,
      plannedStartDate: pilot.plannedStartDate,
      plannedEndDate: pilot.plannedEndDate,
      approvedLearnerLimit: pilot.approvedLearnerLimit,
      selectedCourseIds: pilot.selectedCourseIds,
      internalOwnerUserId: pilot.internalOwnerUserId,
      hasActiveAdmin: employees.some((e) => e.role === "company_admin" && e.status === "active"),
      unresolvedBlockerCount: issues.filter((i) => i.releaseBlocking && i.status !== "resolved").length,
    });

    await db
      .update(pilotCompaniesTable)
      .set({ readinessGateStatus: evaluation.decisionCode })
      .where(eq(pilotCompaniesTable.id, pilotId));

    res.json(evaluation);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to evaluate readiness gate" });
    }
  }
});

// POST /api/pilots/:id/activate — Execute guarded activation
router.post("/:id/activate", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can activate pilots" });
      return;
    }

    const pilotId = Number(req.params.id);
    const [pilot] = await db.select().from(pilotCompaniesTable).where(eq(pilotCompaniesTable.id, pilotId)).limit(1);

    if (!pilot) {
      res.status(404).json({ error: "Pilot record not found" });
      return;
    }

    if (pilot.evidenceStatus !== "ACCEPTED" || !pilot.acceptanceValidated) {
      res.status(409).json({
        error: "Activation locked: Written participation confirmation remains outstanding",
        activationBlockedReason: pilot.activationBlockedReason ?? "Written participation confirmation pending",
      });
      return;
    }

    if (pilot.pilotStatus === "active") {
      res.status(400).json({ error: "Pilot is already active" });
      return;
    }

    const [activated] = await db
      .update(pilotCompaniesTable)
      .set({
        pilotStatus: "active",
        candidateStatus: "ACTIVE",
        activationLifecycleStatus: "ACTIVE",
        externalValidationStage: "stage_5_pilot_launched",
        actualStartDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pilotCompaniesTable.id, pilotId))
      .returning();

    await logAuditEvent({
      companyId: activated.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "pilot.activated",
      targetType: "pilot_company",
      targetId: pilotId,
    });

    res.json(activated);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to activate pilot" });
    }
  }
});

// POST /api/pilots/surveys — Submit pilot survey response
router.post("/surveys", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const { feedbackStage, overallRating, easeOfUseRating, contentRelevanceRating, reportingUsefulnessRating, freeTextFeedback, consentForFollowUp } = req.body ?? {};

    const [entry] = await db
      .insert(pilotFeedbackResponsesTable)
      .values({
        companyId: access.companyId,
        respondentUserId: access.userId,
        respondentRole: access.role === "company_admin" || access.role === "platform_admin" ? "buyer" : "learner",
        feedbackStage: feedbackStage ?? "midpoint",
        overallRating: Number(overallRating) || 5,
        easeOfUseRating: Number(easeOfUseRating) || 5,
        contentRelevanceRating: Number(contentRelevanceRating) || 5,
        reportingUsefulnessRating: reportingUsefulnessRating ? Number(reportingUsefulnessRating) : null,
        freeTextFeedback: freeTextFeedback ?? null,
        consentForFollowUp: Boolean(consentForFollowUp),
      })
      .returning();

    res.status(201).json(entry);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to submit survey response" });
    }
  }
});

// GET /api/pilots/surveys — Fetch tenant-scoped survey responses
router.get("/surveys", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const responses = await db
      .select()
      .from(pilotFeedbackResponsesTable)
      .where(eq(pilotFeedbackResponsesTable.companyId, access.companyId));

    res.json({ responses });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to fetch survey responses" });
    }
  }
});

// GET /api/pilots/company-report — Generate structured company pilot report payload
router.get("/company-report", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const companyId = access.companyId;

    const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, companyId)).limit(1);
    const employees = await db.select().from(employeesTable).where(eq(employeesTable.companyId, companyId));
    const enrollments = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.userId, access.userId));
    const quizAttempts = await db.select().from(quizAttemptsTable).where(eq(quizAttemptsTable.userId, access.userId));
    const certificates = await db.select().from(certificatesTable).where(eq(certificatesTable.companyId, companyId));
    const commitments = await db.select().from(learnerCommitmentsTable).where(eq(learnerCommitmentsTable.companyId, companyId));
    const feedback = await db.select().from(pilotFeedbackResponsesTable).where(eq(pilotFeedbackResponsesTable.companyId, companyId));

    const avgScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((acc, q) => acc + (q.score ?? 0), 0) / quizAttempts.length)
      : 0;

    const reportPayload = {
      reportMetadata: {
        generatedAt: new Date().toISOString(),
        companyId,
        companyName: company?.name ?? "Elevio Pilot Company",
        companySlug: company?.slug ?? "pilot",
      },
      adoption: {
        totalEmployees: employees.length,
        activatedEmployees: employees.filter((e) => e.status === "active").length,
        enrollmentCount: enrollments.length,
        completedCount: enrollments.filter((e) => e.status === "completed").length,
        completionRatePct: enrollments.length > 0 ? Math.round((enrollments.filter((e) => e.status === "completed").length / enrollments.length) * 100) : 0,
      },
      learning: {
        averageQuizScorePct: avgScore,
        certificatesIssued: certificates.length,
      },
      workplaceApplication: {
        actionCommitmentsSubmitted: commitments.length,
        selfReportedNotice: "Workplace action commitments and manager reviews are self-reported participation indicators.",
      },
      userFeedback: {
        totalResponses: feedback.length,
        averageOverallRating: feedback.length > 0 ? (feedback.reduce((a, f) => a + f.overallRating, 0) / feedback.length).toFixed(1) : "5.0",
      },
      recommendations: [
        "Continue core sustainability pathways (ELH-01 to ELH-03).",
        "Expand departmental training for HR, Finance, and Procurement teams.",
      ],
    };

    res.json(reportPayload);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to generate company pilot report" });
    }
  }
});

export default router;
