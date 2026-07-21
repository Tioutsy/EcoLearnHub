import { Router } from "express";
import { getCompanyAccess, sendHttpError } from "../lib/access";
import { getEmployeeAchievementProgress } from "../lib/achievementsService";

const router = Router();

router.get("/", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.employee) {
      res.status(404).json({ error: "Employee record not found" });
      return;
    }
    const progress = await getEmployeeAchievementProgress(access.employee);
    res.json(progress);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load achievements" });
    }
  }
});

export default router;
