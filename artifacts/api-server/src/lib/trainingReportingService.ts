import { db } from "@workspace/db";
import {
  employeesTable,
  enrollmentsTable,
  coursesTable,
  certificatesTable,
  challengeParticipantsTable,
  employeeBadgesTable,
  companiesTable,
  quizAttemptsTable,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { calculateEmployeeAverageScore } from "./lms";

export interface ManagerTrainingFilters {
  search?: string;
  status?: "completed" | "in_progress" | "not_started" | "all";
  certificationStatus?: "certified" | "not_certified" | "all";
  role?: string;
  courseId?: number;
  department?: string;
  overdue?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: "name" | "email" | "status" | "progress" | "lastActive";
  sortDirection?: "asc" | "desc";
}

export async function getCompany(companyId: number) {
  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.id, companyId))
    .limit(1);
  return company ?? null;
}

export async function getTrainingOverviewData(companyId: number) {
  const employees = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId));

  const courses = await db.select().from(coursesTable);
  // Core curriculum: Courses 1 to 13
  const coreCourses = courses
    .filter((c) => c.courseCode && /^ELH-(0[1-9]|1[0-3])$/.test(c.courseCode))
    .sort((a, b) => (a.courseCode ?? "").localeCompare(b.courseCode ?? ""));

  const employeeIds = employees.map((e) => e.id);
  
  const enrollments = employeeIds.length > 0
    ? await db.select().from(enrollmentsTable).where(inArray(enrollmentsTable.employeeId, employeeIds))
    : [];

  const certificates = employeeIds.length > 0
    ? await db.select().from(certificatesTable).where(inArray(certificatesTable.employeeId, employeeIds))
    : [];

  const employeeClerkIds = employees.map((e) => e.clerkUserId).filter((id): id is string => Boolean(id));

  const attempts = employeeClerkIds.length > 0
    ? await db.select().from(quizAttemptsTable).where(inArray(quizAttemptsTable.userId, employeeClerkIds))
    : [];

  const challengeParticipations = employeeClerkIds.length > 0
    ? await db
        .select()
        .from(challengeParticipantsTable)
        .where(
          and(
            eq(challengeParticipantsTable.companyId, companyId),
            eq(challengeParticipantsTable.status, "approved"),
            inArray(challengeParticipantsTable.userId, employeeClerkIds)
          )
        )
    : [];

  const badges = employeeIds.length > 0
    ? await db.select().from(employeeBadgesTable).where(inArray(employeeBadgesTable.employeeId, employeeIds))
    : [];

  const now = new Date();

  // Process data per employee
  const employeeCompletions = new Map<number, Set<number>>();
  const employeeActiveCourses = new Map<number, Set<number>>();
  const employeeOverdueCount = new Map<number, number>();
  const employeeMaxAccessed = new Map<number, Date | null>();
  const employeeDueDates = new Map<number, Date[]>();

  employees.forEach((emp) => {
    employeeCompletions.set(emp.id, new Set());
    employeeActiveCourses.set(emp.id, new Set());
    employeeOverdueCount.set(emp.id, 0);
    employeeMaxAccessed.set(emp.id, null);
    employeeDueDates.set(emp.id, []);
  });

  enrollments.forEach((enr) => {
    if (!enr.employeeId) return;
    const comps = employeeCompletions.get(enr.employeeId);
    const actives = employeeActiveCourses.get(enr.employeeId);
    
    if (enr.completedAt) {
      comps?.add(enr.courseId);
    } else if (enr.progressPct > 0 || enr.lastAccessedAt) {
      actives?.add(enr.courseId);
    }

    if (enr.lastAccessedAt) {
      const currentMax = employeeMaxAccessed.get(enr.employeeId);
      if (!currentMax || new Date(enr.lastAccessedAt) > new Date(currentMax)) {
        employeeMaxAccessed.set(enr.employeeId, new Date(enr.lastAccessedAt));
      }
    }

    if (enr.dueDate) {
      const dDate = new Date(enr.dueDate);
      employeeDueDates.get(enr.employeeId)?.push(dDate);
      if (!enr.completedAt && now > dDate) {
        const ov = employeeOverdueCount.get(enr.employeeId) ?? 0;
        employeeOverdueCount.set(enr.employeeId, ov + 1);
      }
    }
  });

  // Calculate overall core stats
  let totalCoreCompletions = 0;
  let notStartedCoreCount = 0;
  let inProgressCoreCount = 0;
  let completedCoreCount = 0;
  let certifiedCount = 0;
  let overdueLearnersCount = 0;

  employees.forEach((emp) => {
    const comps = employeeCompletions.get(emp.id) ?? new Set<number>();
    const actives = employeeActiveCourses.get(emp.id) ?? new Set<number>();
    
    // Core courses completed: count Courses 1-11
    let coreComps = 0;
    let hasStartedCore = false;
    for (let cId = 1; cId <= 11; cId++) {
      if (comps.has(cId)) {
        coreComps++;
        totalCoreCompletions++;
        hasStartedCore = true;
      } else if (actives.has(cId)) {
        hasStartedCore = true;
      }
    }

    // Add quiz attempts checking for started state
    if (!hasStartedCore && emp.clerkUserId) {
      const hasAttempts = attempts.some((a) => a.userId === emp.clerkUserId && a.courseId >= 1 && a.courseId <= 11);
      if (hasAttempts) hasStartedCore = true;
    }

    if (coreComps === 11) {
      completedCoreCount++;
    } else if (hasStartedCore) {
      inProgressCoreCount++;
    } else {
      notStartedCoreCount++;
    }

    // Certified = Course 12 complete and valid certificate
    const completedCourse12 = comps.has(12);
    const hasCert = certificates.some((c) => c.employeeId === emp.id && c.courseId === 12);
    if (completedCourse12 && hasCert) {
      certifiedCount++;
    }

    const ov = employeeOverdueCount.get(emp.id) ?? 0;
    if (ov > 0) {
      overdueLearnersCount++;
    }
  });

  const totalExpectedCore = employees.length * 11;
  const overallCoreCompletionRate = totalExpectedCore > 0
    ? Math.round((totalCoreCompletions / totalExpectedCore) * 100)
    : 0;

  // Course performance list
  const performance = coreCourses.map((c) => {
    let notStarted = 0;
    let inProgress = 0;
    let completed = 0;
    const scores: number[] = [];

    employees.forEach((emp) => {
      const comps = employeeCompletions.get(emp.id) ?? new Set<number>();
      const actives = employeeActiveCourses.get(emp.id) ?? new Set<number>();
      
      if (comps.has(c.id)) {
        completed++;
      } else {
        const empAttempts = attempts.filter((a) => a.userId === emp.clerkUserId && a.courseId === c.id);
        const hasAttempts = empAttempts.length > 0;
        
        if (actives.has(c.id) || hasAttempts) {
          inProgress++;
        } else {
          notStarted++;
        }
      }

      // Best passing quiz score
      if (emp.clerkUserId) {
        const bestPassing = attempts
          .filter((a) => a.userId === emp.clerkUserId && a.courseId === c.id && a.passed === true)
          .sort((a, b) => b.score - a.score)[0];
        if (bestPassing) {
          scores.push(bestPassing.score);
        }
      }
    });

    const completionRate = employees.length > 0 ? Math.round((completed / employees.length) * 100) : 0;
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return {
      courseId: c.id,
      slug: c.slug,
      title: c.title,
      courseCode: c.courseCode ?? `ELH-${String(c.id).padStart(2, "0")}`,
      notStarted,
      inProgress,
      completed,
      completionRate,
      averageQuizScore: avgScore,
      certificationCount: c.id === 12 ? certifiedCount : undefined,
    };
  });

  // Achievements stats
  const employeesWithBadgesCount = employees.filter((emp) => badges.some((b) => b.employeeId === emp.id)).length;
  const courseBadgesCount = badges.filter((b) => b.awardSource === "course_completion" || b.awardSource === "certification_completion").length;
  const milestonesCount = badges.filter((b) => b.awardSource === "learning_milestone").length;
  const challengeBadgesCount = badges.filter((b) => b.awardSource === "challenge_approval").length;

  const challengeCountsByEmployee = new Map<string, number>();
  challengeParticipations.forEach((p) => {
    const cur = challengeCountsByEmployee.get(p.userId) ?? 0;
    challengeCountsByEmployee.set(p.userId, cur + 1);
  });

  const completedChallengesTiers = {
    tier1: employees.filter((emp) => emp.clerkUserId && (challengeCountsByEmployee.get(emp.clerkUserId) ?? 0) >= 1).length,
    tier3: employees.filter((emp) => emp.clerkUserId && (challengeCountsByEmployee.get(emp.clerkUserId) ?? 0) >= 3).length,
    tier5: employees.filter((emp) => emp.clerkUserId && (challengeCountsByEmployee.get(emp.clerkUserId) ?? 0) >= 5).length,
    tier10: employees.filter((emp) => emp.clerkUserId && (challengeCountsByEmployee.get(emp.clerkUserId) ?? 0) >= 10).length,
  };

  return {
    totalEmployees: employees.length,
    activeLearners: employees.filter((emp) => {
      const comps = employeeCompletions.get(emp.id) ?? new Set<number>();
      const actives = employeeActiveCourses.get(emp.id) ?? new Set<number>();
      return comps.size > 0 || actives.size > 0;
    }).length,
    notStartedCoreCount,
    inProgressCoreCount,
    completedCoreCount,
    certifiedCount,
    overallCoreCompletionRate,
    totalCourseCompletions: Array.from(employeeCompletions.values()).reduce((sum, set) => sum + set.size, 0),
    totalApprovedChallenges: challengeParticipations.length,
    employeesWithBadges: employeesWithBadgesCount,
    overdueCount: overdueLearnersCount,
    performance,
    courseBreakdown: performance,
    achievements: {
      employeesWithBadgesCount,
      totalCourseBadgesCount: courseBadgesCount,
      totalMilestonesCount: milestonesCount,
      totalChallengeBadgesCount: challengeBadgesCount,
      approvedChallengeCount: challengeParticipations.length,
      completedChallengesTiers,
    },
  };
}

export async function getEmployeeTrainingDetail(companyId: number, employeeId: number) {
  const [employee] = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.id, employeeId), eq(employeesTable.companyId, companyId)))
    .limit(1);

  if (!employee) {
    throw new Error("Employee not found");
  }

  const courses = await db.select().from(coursesTable);
  const coreCourses = courses
    .filter((c) => c.courseCode && /^ELH-(0[1-9]|1[0-3])$/.test(c.courseCode))
    .sort((a, b) => (a.courseCode ?? "").localeCompare(b.courseCode ?? ""));

  const enrollments = await db
    .select()
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.employeeId, employeeId));

  const certificates = await db
    .select()
    .from(certificatesTable)
    .where(eq(certificatesTable.employeeId, employeeId));

  const attempts = employee.clerkUserId
    ? await db.select().from(quizAttemptsTable).where(eq(quizAttemptsTable.userId, employee.clerkUserId))
    : [];

  const challengeParticipations = employee.clerkUserId
    ? await db
        .select()
        .from(challengeParticipantsTable)
        .where(
          and(
            eq(challengeParticipantsTable.companyId, companyId),
            eq(challengeParticipantsTable.status, "approved"),
            eq(challengeParticipantsTable.userId, employee.clerkUserId)
          )
        )
    : [];

  const badges = await db
    .select()
    .from(employeeBadgesTable)
    .where(eq(employeeBadgesTable.employeeId, employeeId));

  // Completed courses set
  const completedSet = new Set(enrollments.filter((e) => e.completedAt).map((e) => e.courseId));
  let completedCoreCount = 0;
  for (let cId = 1; cId <= 11; cId++) {
    if (completedSet.has(cId)) completedCoreCount++;
  }

  const individualCoreProgress = Math.round((completedCoreCount / 11) * 100);
  const fullCurriculumCompletedCount = completedSet.size;
  const fullCurriculumProgress = Math.round((fullCurriculumCompletedCount / 12) * 100);

  const courseStatuses = coreCourses.map((c) => {
    const enr = enrollments.find((e) => e.courseId === c.id);
    const cert = certificates.find((cert) => cert.courseId === c.id);
    const completedAt = enr?.completedAt ?? cert?.issuedAt ?? null;
    const progressPct = enr?.progressPct ?? (completedAt ? 100 : 0);

    const empAttempts = attempts.filter((a) => a.courseId === c.id);
    const bestPassing = empAttempts
      .filter((a) => a.passed === true)
      .sort((a, b) => b.score - a.score)[0];

    let status: "completed" | "in_progress" | "not_started" = "not_started";
    if (completedAt) {
      status = "completed";
    } else if (progressPct > 0 || enr?.lastAccessedAt || empAttempts.length > 0) {
      status = "in_progress";
    }

    return {
      courseId: c.id,
      slug: c.slug,
      title: c.title,
      courseCode: c.courseCode ?? `ELH-${String(c.id).padStart(2, "0")}`,
      status,
      progressPct,
      completedAt,
      dueDate: enr?.dueDate ?? null,
      bestScore: bestPassing?.score ?? null,
      certificateReference: cert?.uniqueCode ?? null,
    };
  });

  const isCertified = completedSet.has(12) && certificates.some((c) => c.courseId === 12);

  return {
    employeeId: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    department: employee.department,
    jobTitle: employee.jobTitle,
    individualCoreProgress,
    completedCoreCount,
    fullCurriculumProgress,
    fullCurriculumCompletedCount,
    isCertified,
    certificateDetails: certificates.find((c) => c.courseId === 12) ?? null,
    courseStatuses,
    badges: badges.map((b) => ({
      id: b.id,
      awardSource: b.awardSource,
      earnedAt: b.earnedAt,
    })),
    approvedChallenges: challengeParticipations.map((p) => ({
      id: p.id,
      completedAt: p.completedAt,
      status: p.status,
    })),
    lastActiveAt: employee.lastActiveAt,
  };
}

export async function getFilteredEmployeeRecords(companyId: number, filters: ManagerTrainingFilters) {
  const employees = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId));

  const employeeIds = employees.map((e) => e.id);
  const enrollments = employeeIds.length > 0
    ? await db.select().from(enrollmentsTable).where(inArray(enrollmentsTable.employeeId, employeeIds))
    : [];

  const certificates = employeeIds.length > 0
    ? await db.select().from(certificatesTable).where(inArray(certificatesTable.employeeId, employeeIds))
    : [];

  const employeeClerkIds = employees.map((e) => e.clerkUserId).filter((id): id is string => Boolean(id));

  const challengeParticipations = employeeClerkIds.length > 0
    ? await db
        .select()
        .from(challengeParticipantsTable)
        .where(
          and(
            eq(challengeParticipantsTable.companyId, companyId),
            eq(challengeParticipantsTable.status, "approved"),
            inArray(challengeParticipantsTable.userId, employeeClerkIds)
          )
        )
    : [];

  const badges = employeeIds.length > 0
    ? await db.select().from(employeeBadgesTable).where(inArray(employeeBadgesTable.employeeId, employeeIds))
    : [];

  const now = new Date();

  // Group by employee
  const enrMap = new Map<number, typeof enrollments>();
  const certMap = new Map<number, typeof certificates>();
  const badgeMap = new Map<number, typeof badges>();
  const challengeMap = new Map<string, typeof challengeParticipations>();

  employees.forEach((emp) => {
    enrMap.set(emp.id, []);
    certMap.set(emp.id, []);
    badgeMap.set(emp.id, []);
    if (emp.clerkUserId) {
      challengeMap.set(emp.clerkUserId, []);
    }
  });

  enrollments.forEach((e) => {
    if (e.employeeId) enrMap.get(e.employeeId)?.push(e);
  });
  certificates.forEach((c) => {
    if (c.employeeId) certMap.get(c.employeeId)?.push(c);
  });
  badges.forEach((b) => {
    badgeMap.get(b.employeeId)?.push(b);
  });
  challengeParticipations.forEach((p) => {
    challengeMap.get(p.userId)?.push(p);
  });

  let records = employees.map((emp) => {
    const empEnrs = enrMap.get(emp.id) ?? [];
    const empCerts = certMap.get(emp.id) ?? [];
    const empBadges = badgeMap.get(emp.id) ?? [];
    const empChallenges = emp.clerkUserId ? (challengeMap.get(emp.clerkUserId) ?? []) : [];

    const completedSet = new Set(empEnrs.filter((e) => e.completedAt).map((e) => e.courseId));
    
    // Core courses completed: count Courses 1-11
    let coreComps = 0;
    let hasStartedCore = false;
    for (let cId = 1; cId <= 11; cId++) {
      if (completedSet.has(cId)) {
        coreComps++;
        hasStartedCore = true;
      } else {
        const enr = empEnrs.find((e) => e.courseId === cId);
        if (enr && (enr.progressPct > 0 || enr.lastAccessedAt)) {
          hasStartedCore = true;
        }
      }
    }

    let status: "completed" | "in_progress" | "not_started" = "not_started";
    if (coreComps === 11) {
      status = "completed";
    } else if (hasStartedCore) {
      status = "in_progress";
    }

    const isCertified = completedSet.has(12) && empCerts.some((c) => c.courseId === 12);
    const certDate = empCerts.find((c) => c.courseId === 12)?.issuedAt ?? null;

    let maxAccessed: Date | null = null;
    empEnrs.forEach((enr) => {
      if (enr.lastAccessedAt) {
        const d = new Date(enr.lastAccessedAt);
        if (!maxAccessed || d > maxAccessed) maxAccessed = d;
      }
    });

    // Check overdue: at least one Core enrollment (1-11) has dueDate in the past and is not completed
    let isOverdue = false;
    let minDueDate: Date | null = null;
    
    empEnrs.forEach((enr) => {
      if (enr.dueDate && enr.courseId <= 11) {
        const d = new Date(enr.dueDate);
        if (!minDueDate || d < minDueDate) minDueDate = d;
        if (!enr.completedAt && now > d) {
          isOverdue = true;
        }
      }
    });

    const individualCoreProgress = Math.round((coreComps / 11) * 100);
    const fullProgress = Math.round((completedSet.size / 12) * 100);

    return {
      employeeId: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      department: emp.department ?? null,
      coreCompletedCount: coreComps,
      individualCoreProgress,
      fullProgress,
      status,
      isCertified,
      certificateIssuedAt: certDate,
      approvedChallengeCount: empChallenges.length,
      achievementCount: empBadges.length,
      lastActiveAt: maxAccessed,
      dueDate: minDueDate,
      isOverdue,
    };
  });

  // Apply filters
  if (filters.search) {
    const q = filters.search.toLowerCase();
    records = records.filter((r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
  }

  if (filters.status && filters.status !== "all") {
    records = records.filter((r) => r.status === filters.status);
  }

  if (filters.certificationStatus && filters.certificationStatus !== "all") {
    const target = filters.certificationStatus === "certified";
    records = records.filter((r) => r.isCertified === target);
  }

  if (filters.role) {
    records = records.filter((r) => r.role === filters.role);
  }

  if (filters.department) {
    records = records.filter((r) => r.department === filters.department);
  }

  if (filters.courseId) {
    const targetCourse = Number(filters.courseId);
    records = records.filter((r) => {
      const empEnrs = enrMap.get(r.employeeId) ?? [];
      return empEnrs.some((e) => e.courseId === targetCourse && e.completedAt);
    });
  }

  if (filters.overdue !== undefined) {
    records = records.filter((r) => r.isOverdue === filters.overdue);
  }

  // Sort
  const sortBy = filters.sortBy ?? "name";
  const direction = filters.sortDirection ?? "asc";
  records.sort((a, b) => {
    let comp = 0;
    if (sortBy === "name") {
      comp = a.name.localeCompare(b.name);
    } else if (sortBy === "email") {
      comp = a.email.localeCompare(b.email);
    } else if (sortBy === "status") {
      comp = a.status.localeCompare(b.status);
    } else if (sortBy === "progress") {
      comp = a.individualCoreProgress - b.individualCoreProgress;
    } else if (sortBy === "lastActive") {
      const da = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
      const db = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
      comp = da - db;
    }
    return direction === "asc" ? comp : -comp;
  });

  // Pagination
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 10, 100);
  const total = records.length;
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  const paginated = records.slice(offset, offset + pageSize);

  return {
    data: paginated,
    records: paginated,
    pagination: {
      total,
      page,
      pageSize,
      totalPages,
    },
  };
}

function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  let text = String(val).trim();
  if (text.startsWith("=") || text.startsWith("+") || text.startsWith("-") || text.startsWith("@")) {
    text = "'" + text;
  }
  return `"${text.replace(/"/g, '""')}"`;
}

export async function generateAuditCsv(companyId: number, filters: ManagerTrainingFilters) {
  const company = await getCompany(companyId);
  const companyName = company?.name ?? "Unknown Organization";

  // Get filtered employees (unpaginated to export all)
  const result = await getFilteredEmployeeRecords(companyId, { ...filters, page: 1, pageSize: 100000 });
  const employees = result.data;

  const courses = await db.select().from(coursesTable);
  const coreCourses = courses
    .filter((c) => c.courseCode && /^ELH-(0[1-9]|1[0-3])$/.test(c.courseCode))
    .sort((a, b) => (a.courseCode ?? "").localeCompare(b.courseCode ?? ""));

  const employeeIds = employees.map((e) => e.employeeId);
  const enrollments = employeeIds.length > 0
    ? await db.select().from(enrollmentsTable).where(inArray(enrollmentsTable.employeeId, employeeIds))
    : [];

  const certificates = employeeIds.length > 0
    ? await db.select().from(certificatesTable).where(inArray(certificatesTable.employeeId, employeeIds))
    : [];

  // Re-map to employees list to extract original properties safely
  const employeeDataMap = new Map(employees.map(e => [e.employeeId, e]));

  const headers = [
    "Organisation Name",
    "Employee Name",
    "Employee Email",
    "Employee Role",
    "Department or Team",
    "Course Code",
    "Course Title",
    "Training Status",
    "Progress Percentage",
    "Completion Date",
    "Qualifying Quiz Score",
    "Passing Score",
    "Certificate Issued",
    "Certificate Title",
    "Certificate Issue Date",
    "Training Due Date",
    "Overdue",
    "Last Learning Activity",
    "Export Generated At",
  ];

  const nowStr = new Date().toISOString();
  const rows: string[][] = [headers];

  // Retrieve clerkIds to get quiz attempts
  const originalEmployees = await db
    .select()
    .from(employeesTable)
    .where(inArray(employeesTable.id, employeeIds));

  const employeeClerkIds = originalEmployees.map((e) => e.clerkUserId).filter((id): id is string => Boolean(id));

  const attempts = employeeClerkIds.length > 0
    ? await db.select().from(quizAttemptsTable).where(inArray(quizAttemptsTable.userId, employeeClerkIds))
    : [];

  employees.forEach((emp) => {
    const empData = originalEmployees.find(e => e.id === emp.employeeId);
    const clerkId = empData?.clerkUserId;
    const empEnrs = enrollments.filter((e) => e.employeeId === emp.employeeId);
    const empCerts = certificates.filter((c) => c.employeeId === emp.employeeId);

    coreCourses.forEach((c) => {
      const enr = empEnrs.find((e) => e.courseId === c.id);
      const cert = empCerts.find((cert) => cert.courseId === c.id);

      const completedAt = enr?.completedAt ?? cert?.issuedAt ?? null;
      const progressPct = enr?.progressPct ?? (completedAt ? 100 : 0);

      const empAttempts = clerkId ? attempts.filter((a) => a.userId === clerkId && a.courseId === c.id) : [];
      const bestPassing = empAttempts
        .filter((a) => a.passed === true)
        .sort((a, b) => b.score - a.score)[0];

      let status = "not_started";
      if (completedAt) {
        status = "completed";
      } else if (progressPct > 0 || enr?.lastAccessedAt || empAttempts.length > 0) {
        status = "in_progress";
      }

      const hasCert = cert ? "Yes" : "No";
      const certTitle = cert?.certificateTitle ?? (cert ? "EcoLearnHub Core Sustainability Certificate" : "");
      const certDate = cert?.issuedAt ? new Date(cert.issuedAt).toISOString() : "";

      const dueDateStr = enr?.dueDate ? new Date(enr.dueDate).toISOString() : "";
      let overdueStr = "No";
      if (enr?.dueDate) {
        if (!completedAt && new Date() > new Date(enr.dueDate)) {
          overdueStr = "Yes";
        }
      } else {
        overdueStr = "Due dates not configured";
      }

      rows.push([
        companyName,
        emp.name,
        emp.email,
        emp.role,
        emp.department ?? "",
        c.courseCode ?? `ELH-${String(c.id).padStart(2, "0")}`,
        c.title,
        status,
        String(progressPct),
        completedAt ? new Date(completedAt).toISOString() : "",
        bestPassing ? String(bestPassing.score) : "",
        String(c.passingScore ?? 80),
        hasCert,
        certTitle,
        certDate,
        dueDateStr,
        overdueStr,
        enr?.lastAccessedAt ? new Date(enr.lastAccessedAt).toISOString() : "",
        nowStr,
      ]);
    });
  });

  return rows.map((r) => r.map(escapeCsvValue).join(",")).join("\n");
}
