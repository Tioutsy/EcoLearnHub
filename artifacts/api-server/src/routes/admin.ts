import { Router } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db } from "@workspace/db";
import {
  companiesTable,
  employeesTable,
  enrollmentsTable,
  coursesTable,
  plansTable,
  leadsTable,
} from "@workspace/db";
import { eq, count, sum, sql, desc } from "drizzle-orm";

const router = Router();

// Platform-wide analytics for the super admin dashboard.
// Contains aggregated business data, so it is restricted to super admins.
router.get("/analytics", async (req, res): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Platform-wide business data is restricted to super admins.
    const user = await clerkClient.users.getUser(userId);
    if (user.publicMetadata?.role !== "super_admin") {
      res.status(403).json({ error: "Super admin access required" });
      return;
    }

    // Companies and booked annual revenue (companies on a paid plan)
    const [companyAgg] = await db
      .select({
        companiesRegistered: count(),
        annualRevenue: sql<number>`coalesce(sum(${plansTable.priceAnnual}), 0)`,
      })
      .from(companiesTable)
      .leftJoin(plansTable, eq(companiesTable.planId, plansTable.id));

    // Active companies = at least one engaged employee
    const [activeCompanyAgg] = await db
      .select({
        activeCompanies: sql<number>`count(distinct ${employeesTable.companyId})`,
      })
      .from(employeesTable)
      .where(sql`${employeesTable.enrolledCourses} > 0`);

    // Employee engagement
    const [employeeAgg] = await db
      .select({
        totalEmployees: count(),
        activeEmployees: sql<number>`count(*) filter (where ${employeesTable.enrolledCourses} > 0)`,
        certificatesIssued: sql<number>`coalesce(sum(${employeesTable.certificates}), 0)`,
      })
      .from(employeesTable);

    // Enrollments and completion
    const [enrollAgg] = await db
      .select({
        totalEnrollments: count(),
        completedEnrollments: sql<number>`count(*) filter (where ${enrollmentsTable.completedAt} is not null)`,
      })
      .from(enrollmentsTable);

    // Lead funnel and trial conversions
    const leadRows = await db
      .select({
        interest: leadsTable.interest,
        status: leadsTable.status,
        total: count(),
      })
      .from(leadsTable)
      .groupBy(leadsTable.interest, leadsTable.status);

    let trialSignups = 0;
    let convertedTrials = 0;
    const leadsByInterest = { trial: 0, demo: 0, proposal: 0 };
    for (const row of leadRows) {
      const n = Number(row.total ?? 0);
      if (row.interest === "trial") {
        trialSignups += n;
        if (row.status === "converted") convertedTrials += n;
      }
      if (row.interest === "trial") leadsByInterest.trial += n;
      else if (row.interest === "demo") leadsByInterest.demo += n;
      else if (row.interest === "proposal") leadsByInterest.proposal += n;
    }

    // Most popular courses (live enrollments)
    const popularRows = await db
      .select({
        courseId: enrollmentsTable.courseId,
        title: coursesTable.title,
        enrollments: count(),
        completed: sql<number>`count(*) filter (where ${enrollmentsTable.completedAt} is not null)`,
      })
      .from(enrollmentsTable)
      .leftJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
      .groupBy(enrollmentsTable.courseId, coursesTable.title)
      .orderBy(desc(count()))
      .limit(5);

    const totalEmployees = Number(employeeAgg?.totalEmployees ?? 0);
    const activeEmployees = Number(employeeAgg?.activeEmployees ?? 0);
    const totalEnrollments = Number(enrollAgg?.totalEnrollments ?? 0);
    const completedEnrollments = Number(enrollAgg?.completedEnrollments ?? 0);

    res.json({
      companiesRegistered: Number(companyAgg?.companiesRegistered ?? 0),
      activeCompanies: Number(activeCompanyAgg?.activeCompanies ?? 0),
      annualRevenue: Number(companyAgg?.annualRevenue ?? 0),
      currency: "Rs",
      trialSignups,
      convertedTrials,
      trialConversionRate:
        trialSignups > 0
          ? Math.round((convertedTrials / trialSignups) * 100)
          : 0,
      leadsByInterest,
      totalEmployees,
      activeEmployees,
      engagementRate:
        totalEmployees > 0
          ? Math.round((activeEmployees / totalEmployees) * 100)
          : 0,
      certificatesIssued: Number(employeeAgg?.certificatesIssued ?? 0),
      totalEnrollments,
      completedEnrollments,
      overallCompletionRate:
        totalEnrollments > 0
          ? Math.round((completedEnrollments / totalEnrollments) * 100)
          : 0,
      popularCourses: popularRows.map((r) => {
        const enrollments = Number(r.enrollments ?? 0);
        const completed = Number(r.completed ?? 0);
        return {
          courseId: r.courseId,
          title: r.title ?? "Untitled course",
          enrollments,
          completionRate:
            enrollments > 0 ? Math.round((completed / enrollments) * 100) : 0,
        };
      }),
    });
  } catch (err) {
    console.error("Failed to load admin analytics:", err);
    res.status(500).json({ error: "Failed to load admin analytics" });
  }
});

export default router;
