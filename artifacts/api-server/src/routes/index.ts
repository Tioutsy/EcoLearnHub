import { Router, type IRouter } from "express";
import healthRouter from "./health";
import coursesRouter from "./courses";
import categoriesRouter from "./categories";
import enrollmentsRouter from "./enrollments";
import progressRouter from "./progress";
import quizzesRouter from "./quizzes";
import commitmentsRouter from "./commitments";
import progressionRouter from "./progression";
import certificatesRouter from "./certificates";
import companiesRouter from "./companies";
import plansRouter from "./plans";
import dashboardRouter from "./dashboard";
// import impactRouter from "./impact"; // Intentionally disabled — Sprint product simplification. Implementation preserved for future premium feature recovery.
import esgRouter from "./esg";
import learningPathsRouter from "./learningPaths";
import badgesRouter from "./badges";
import meAchievementsRouter from "./meAchievements";
import leaderboardsRouter from "./leaderboards";
import challengesRouter from "./challenges";
import complianceRouter from "./compliance";
import leadsRouter from "./leads";
import adminRouter from "./admin";
// import blogRouter from "./blog"; // Intentionally disabled — Mauritius Rules & Resources unmounted for product simplification.
import recyclingRouter from "./recycling";
import platformAdminRouter from "./platformAdmin";
import platformAdminHealthRouter from "./platformAdminHealth";
import pilotsRouter from "./pilots";
import managerTrainingRouter from "./managerTraining";
import subscriptionsRouter from "./subscriptions";
import invitationsRouter from "./invitations";
import remindersRouter from "./reminders";
import notificationsRouter from "./notifications";
import analyticsRouter from "./analytics";
import governanceRouter from "./governance";
import trainingActionsRouter from "./trainingActions";
import workplaceActionsRouter from "./workplaceActions";
import onboardingRouter from "./onboarding";

const router: IRouter = Router();

router.use("/onboarding", onboardingRouter);

router.use(healthRouter);
router.use(workplaceActionsRouter);
router.use("/company/training-actions", trainingActionsRouter);
router.use("/governance", governanceRouter);
router.use("/courses", coursesRouter);
router.use("/categories", categoriesRouter);
router.use("/enrollments", enrollmentsRouter);
router.use("/progress", progressRouter);
router.use("/courses", quizzesRouter);
router.use("/courses", commitmentsRouter);
router.use("/progression", progressionRouter);
router.use("/certificates", certificatesRouter);
router.use("/company", companiesRouter);
router.use("/companies", companiesRouter);
router.use("/invitations", invitationsRouter);
router.use("/reminders", remindersRouter);
router.use("/notifications", notificationsRouter);
router.use("/analytics", analyticsRouter);
router.use("/plans", plansRouter);
router.use("/subscriptions", subscriptionsRouter);
router.use("/dashboard", dashboardRouter);
// Impact router intentionally unmounted for product simplification. Preserved in routes/impact.ts.
router.use("/esg", esgRouter);
router.use("/learning-paths", learningPathsRouter);
router.use("/badges", badgesRouter);
router.use("/me/achievements", meAchievementsRouter);
router.use("/leaderboards", leaderboardsRouter);
router.use("/challenges", challengesRouter);
router.use("/compliance", complianceRouter);
router.use("/leads", leadsRouter);
router.use("/admin", adminRouter);
router.use("/recycling", recyclingRouter);
router.use("/platform-admin", platformAdminRouter);
router.use("/platform-admin", platformAdminHealthRouter);
router.use("/platform-admin/pilots", pilotsRouter);
router.use("/pilots", pilotsRouter);
router.use("/manager/training", managerTrainingRouter);
// blogRouter intentionally unmounted for product simplification. Preserved in routes/blog.ts.

export default router;
