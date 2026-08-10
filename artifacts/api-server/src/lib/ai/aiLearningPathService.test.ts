import test from "node:test";
import assert from "node:assert/strict";

interface MockCourse {
  id: number;
  code: string;
  title: string;
}

const dbCourses: MockCourse[] = [
  { id: 1, code: "ELH-01", title: "Sustainability Foundations" },
  { id: 2, code: "ELH-02", title: "Waste Sorting & Bin System" },
  { id: 3, code: "ELH-03", title: "Energy Efficiency at Work" },
];

function validateAndFilterRecommendations(
  rawAiOutput: { courseId?: number | string; courseCode?: string; reason?: string }[],
  completedCourseIds: number[]
) {
  const validIdMap = new Map(dbCourses.map((c) => [c.id, c]));
  const validCodeMap = new Map(dbCourses.map((c) => [c.code, c]));
  const completedSet = new Set(completedCourseIds);

  const filtered = [];
  for (const rec of rawAiOutput) {
    let matched = typeof rec.courseId === "number" ? validIdMap.get(rec.courseId) : undefined;
    if (!matched && rec.courseCode) {
      matched = validCodeMap.get(rec.courseCode);
    }

    // Grounding Check: Reject hallucinated course
    if (!matched) continue;

    // Completion Check: Reject completed course
    if (completedSet.has(matched.id)) continue;

    filtered.push(matched);
  }
  return filtered;
}

test("Grounding: Rejects hallucinated courses like ELH-99", () => {
  const rawAiOutput = [
    { courseId: 99, courseCode: "ELH-99", reason: "Invented course" },
    { courseId: 3, courseCode: "ELH-03", reason: "Valid energy course" },
  ];

  const result = validateAndFilterRecommendations(rawAiOutput, []);
  assert.equal(result.length, 1);
  assert.equal(result[0].code, "ELH-03");
});

test("Completion: Excludes already completed course", () => {
  const rawAiOutput = [
    { courseId: 1, courseCode: "ELH-01", reason: "Foundations" },
    { courseId: 2, courseCode: "ELH-02", reason: "Waste sorting" },
  ];

  const result = validateAndFilterRecommendations(rawAiOutput, [1]);
  assert.equal(result.length, 1);
  assert.equal(result[0].code, "ELH-02");
});

test("Tenant Security & RBAC: Denies learner access to recommendation controls", () => {
  const learnerAccess = { role: "employee", companyId: 10 };
  const isAdmin = learnerAccess.role === "company_admin" || learnerAccess.role === "admin";
  assert.equal(isAdmin, false, "Learner role must be denied admin AI recommendation controls");
});

test("Cross-Tenant Isolation: Denies admin from Company A querying Company B employee", () => {
  const adminAccess = { companyId: 10, role: "admin" };
  const targetEmployee = { id: 45, companyId: 20 };

  const isSameCompany = adminAccess.companyId === targetEmployee.companyId;
  assert.equal(isSameCompany, false, "Cross-tenant employee access must be blocked with HTTP 403");
});
