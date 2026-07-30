import { Router } from "express";
import { getCompanyAccess, sendHttpError } from "../lib/access";
import { runNotificationDeliveryDiagnostics } from "../lib/notificationDeliveryDiagnostics";
import { runTrainingAnalyticsDiagnostics } from "../lib/trainingAnalyticsDiagnostics";
import { validateProductionEnvironment } from "../lib/productionEnvironmentValidator";

const router = Router();

// GET /api/platform-admin/health-details — Platform-admin operational status & health details
router.get("/health-details", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Platform administrator access required" });
      return;
    }

    const envVal = validateProductionEnvironment();
    const notifDiag = await runNotificationDeliveryDiagnostics();
    const analyticsDiag = await runTrainingAnalyticsDiagnostics();

    res.json({
      timestamp: new Date().toISOString(),
      environment: envVal.mode,
      environmentValid: envVal.valid,
      environmentBlockers: envVal.blockers,
      environmentWarnings: envVal.warnings,
      diagnostics: {
        notificationDelivery: {
          totalAudited: notifDiag.totalLogsAudited,
          criticalCount: notifDiag.criticalIssuesCount,
          highCount: notifDiag.highIssuesCount,
          valid: notifDiag.valid,
        },
        trainingAnalytics: {
          totalEnrollmentsAudited: analyticsDiag.totalEnrollmentsAudited,
          totalCommitmentsAudited: analyticsDiag.totalCommitmentsAudited,
          criticalCount: analyticsDiag.criticalIssuesCount,
          highCount: analyticsDiag.highIssuesCount,
          valid: analyticsDiag.valid,
        },
      },
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load platform health details" });
    }
  }
});

export default router;
