import { Router, type IRouter } from "express";
import healthRouter from "./health";
import coursesRouter from "./courses";
import categoriesRouter from "./categories";
import enrollmentsRouter from "./enrollments";
import quizzesRouter from "./quizzes";
import certificatesRouter from "./certificates";
import companiesRouter from "./companies";
import plansRouter from "./plans";
import dashboardRouter from "./dashboard";
import impactRouter from "./impact";
import blogRouter from "./blog";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/courses", coursesRouter);
router.use("/categories", categoriesRouter);
router.use("/enrollments", enrollmentsRouter);
router.use("/progress", enrollmentsRouter);
router.use("/courses", quizzesRouter);
router.use("/certificates", certificatesRouter);
router.use("/company", companiesRouter);
router.use("/companies", companiesRouter);
router.use("/plans", plansRouter);
router.use("/subscriptions", plansRouter);
router.use("/dashboard", dashboardRouter);
router.use("/impact", impactRouter);
router.use(blogRouter);

export default router;
