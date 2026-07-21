import { Router } from "express";
import { requireCompanyAdmin, sendHttpError, HttpError } from "../lib/access";
import {
  getTrainingOverviewData,
  getFilteredEmployeeRecords,
  getEmployeeTrainingDetail,
  generateAuditCsv,
  getCompany,
  type ManagerTrainingFilters,
} from "../lib/trainingReportingService";

const router = Router();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// GET /api/manager/training/overview
router.get("/overview", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    // Support platform admin fallback to primary company if context is 0
    let companyId = access.companyId;
    if (companyId === 0) {
      companyId = 1; // Default to primary company
    }
    const overview = await getTrainingOverviewData(companyId);
    res.json(overview);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load manager training overview" });
    }
  }
});

// GET /api/manager/training/employees
router.get("/employees", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    let companyId = access.companyId;
    if (companyId === 0) {
      companyId = 1;
    }

    const {
      search,
      status,
      certificationStatus,
      role,
      courseId,
      department,
      overdue,
      page,
      pageSize,
      sortBy,
      sortDirection,
    } = req.query;

    const filters: ManagerTrainingFilters = {};

    if (typeof search === "string" && search.trim()) {
      filters.search = search.trim();
    }

    if (status === "completed" || status === "in_progress" || status === "not_started" || status === "all") {
      filters.status = status;
    }

    if (certificationStatus === "certified" || certificationStatus === "not_certified" || certificationStatus === "all") {
      filters.certificationStatus = certificationStatus;
    }

    if (typeof role === "string" && role.trim()) {
      filters.role = role.trim();
    }

    if (courseId) {
      const cId = Number(courseId);
      if (!Number.isNaN(cId)) {
        filters.courseId = cId;
      }
    }

    if (typeof department === "string" && department.trim()) {
      filters.department = department.trim();
    }

    if (overdue === "true" || overdue === "false") {
      filters.overdue = overdue === "true";
    }

    const pageNum = Number(page);
    filters.page = !Number.isNaN(pageNum) && pageNum > 0 ? pageNum : 1;

    const sizeNum = Number(pageSize);
    filters.pageSize = !Number.isNaN(sizeNum) && sizeNum > 0 ? Math.min(sizeNum, 100) : 10;

    const validSorts = ["name", "email", "status", "progress", "lastActive"];
    if (typeof sortBy === "string" && validSorts.includes(sortBy)) {
      filters.sortBy = sortBy as any;
    }

    if (sortDirection === "asc" || sortDirection === "desc") {
      filters.sortDirection = sortDirection;
    }

    const records = await getFilteredEmployeeRecords(companyId, filters);
    res.json(records);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to query manager training employees" });
    }
  }
});

// GET /api/manager/training/employees/:employeeId
router.get("/employees/:employeeId", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    let companyId = access.companyId;
    if (companyId === 0) {
      companyId = 1;
    }

    const empId = Number(req.params.employeeId);
    if (Number.isNaN(empId)) {
      res.status(400).json({ error: "Invalid employee ID" });
      return;
    }

    try {
      const detail = await getEmployeeTrainingDetail(companyId, empId);
      res.json(detail);
    } catch (e: any) {
      if (e.message === "Employee not found") {
        throw new HttpError(404, "Employee not found");
      }
      throw e;
    }
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load employee training details" });
    }
  }
});

// GET /api/manager/training/export.csv
router.get("/export.csv", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    let companyId = access.companyId;
    if (companyId === 0) {
      companyId = 1;
    }

    const company = await getCompany(companyId);
    const orgName = company?.name ?? "organization";
    const dateStr = new Date().toISOString().slice(0, 10);

    const {
      search,
      status,
      certificationStatus,
      role,
      courseId,
      department,
      overdue,
    } = req.query;

    const filters: ManagerTrainingFilters = {};

    if (typeof search === "string" && search.trim()) {
      filters.search = search.trim();
    }
    if (status === "completed" || status === "in_progress" || status === "not_started" || status === "all") {
      filters.status = status;
    }
    if (certificationStatus === "certified" || certificationStatus === "not_certified" || certificationStatus === "all") {
      filters.certificationStatus = certificationStatus;
    }
    if (typeof role === "string" && role.trim()) {
      filters.role = role.trim();
    }
    if (courseId) {
      const cId = Number(courseId);
      if (!Number.isNaN(cId)) {
        filters.courseId = cId;
      }
    }
    if (typeof department === "string" && department.trim()) {
      filters.department = department.trim();
    }
    if (overdue === "true" || overdue === "false") {
      filters.overdue = overdue === "true";
    }

    const csvContent = await generateAuditCsv(companyId, filters);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ecolearnhub-training-records-${slugify(orgName)}-${dateStr}.csv`
    );
    res.send(csvContent);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to generate CSV export" });
    }
  }
});

export default router;
