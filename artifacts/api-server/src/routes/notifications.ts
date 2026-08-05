import { Router } from "express";
import { db, notificationPreferencesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getCompanyAccess, sendHttpError } from "../lib/access";
import { renderEmailTemplate, TemplateNotificationType } from "../lib/emailTemplateEngine";

const router = Router();

// GET /api/notifications/preferences — Learner notification preferences
router.get("/preferences", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.companyId || !access.employee) {
      res.status(403).json({ error: "Company membership required" });
      return;
    }

    const [pref] = await db
      .select()
      .from(notificationPreferencesTable)
      .where(and(eq(notificationPreferencesTable.companyId, access.companyId), eq(notificationPreferencesTable.employeeId, access.employee.id)))
      .limit(1);

    res.json({
      companyId: access.companyId,
      employeeId: access.employee.id,
      optionalEngagementReminders: pref?.optionalEngagementReminders ?? true,
      operationalNotifications: true, // Always true (cannot opt out)
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load notification preferences" });
    }
  }
});

// PATCH /api/notifications/preferences — Update learner notification preferences
router.patch("/preferences", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.companyId || !access.employee) {
      res.status(403).json({ error: "Company membership required" });
      return;
    }

    const { optionalEngagementReminders } = req.body;
    if (typeof optionalEngagementReminders !== "boolean") {
      res.status(400).json({ error: "optionalEngagementReminders boolean is required" });
      return;
    }

    const [existing] = await db
      .select()
      .from(notificationPreferencesTable)
      .where(and(eq(notificationPreferencesTable.companyId, access.companyId), eq(notificationPreferencesTable.employeeId, access.employee.id)))
      .limit(1);

    let updated;
    if (existing) {
      [updated] = await db
        .update(notificationPreferencesTable)
        .set({ optionalEngagementReminders })
        .where(eq(notificationPreferencesTable.id, existing.id))
        .returning();
    } else {
      [updated] = await db
        .insert(notificationPreferencesTable)
        .values({
          companyId: access.companyId,
          employeeId: access.employee.id,
          userId: access.userId,
          optionalEngagementReminders,
        })
        .returning();
    }

    res.json({
      message: "Notification preferences updated successfully",
      preferences: {
        optionalEngagementReminders: updated.optionalEngagementReminders,
        operationalNotifications: true,
      },
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to update notification preferences" });
    }
  }
});

// GET /api/notifications/preview — Platform-admin email template preview endpoint
router.get("/preview", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Platform administrator access required to preview templates" });
      return;
    }

    const type = (req.query.type as TemplateNotificationType) || "course_assigned";
    const sampleData = {
      companyName: (req.query.companyName as string) || "Acme Sustainable Energy Ltd",
      recipientName: (req.query.recipientName as string) || "Sharon Lennon",
      courseTitle: (req.query.courseTitle as string) || "Carbon Footprint Awareness & Reduction",
      courseCode: (req.query.courseCode as string) || "ELH-07",
      dueDate: "2026-08-18",
      actionUrl: "https://app.elevio.mu/learn/carbon-footprint",
      overdueCount: 3,
      inProgressCount: 5,
      activationRatePct: 88,
      completedCount: 42,
    };

    const rendered = renderEmailTemplate(type, sampleData);

    if (req.query.format === "text") {
      res.type("text/plain").send(rendered.text);
      return;
    }

    res.type("text/html").send(rendered.html);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to preview email template" });
    }
  }
});

export default router;
