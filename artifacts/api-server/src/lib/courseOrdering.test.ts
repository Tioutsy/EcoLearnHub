import { test, describe } from "node:test";
import assert from "node:assert/strict";

/**
 * Shared course code sorting function logic test for backend/frontend
 */
function sortCoursesByCode<T extends { courseCode?: string | null; title?: string | null }>(
  courses: T[]
): T[] {
  if (!courses || !Array.isArray(courses)) return [];

  return [...courses].sort((a, b) => {
    const codeA = a.courseCode?.trim().toUpperCase() ?? "";
    const codeB = b.courseCode?.trim().toUpperCase() ?? "";

    if (!codeA && !codeB) {
      return (a.title ?? "").localeCompare(b.title ?? "");
    }
    if (!codeA) return 1;
    if (!codeB) return -1;

    const matchA = codeA.match(/^ELH-(\d+)$/);
    const matchB = codeB.match(/^ELH-(\d+)$/);

    if (matchA && matchB) {
      const numA = parseInt(matchA[1], 10);
      const numB = parseInt(matchB[1], 10);
      return numA - numB;
    }

    if (matchA) return -1;
    if (matchB) return 1;

    return codeA.localeCompare(codeB);
  });
}

describe("Course Ordering Tests (Sprint 9R Workstream E)", () => {
  test("1. ELH-01 appears before ELH-02", () => {
    const input = [{ courseCode: "ELH-02" }, { courseCode: "ELH-01" }];
    const sorted = sortCoursesByCode(input);
    assert.equal(sorted[0].courseCode, "ELH-01");
    assert.equal(sorted[1].courseCode, "ELH-02");
  });

  test("2. ELH-09 appears before ELH-10", () => {
    const input = [{ courseCode: "ELH-10" }, { courseCode: "ELH-09" }];
    const sorted = sortCoursesByCode(input);
    assert.equal(sorted[0].courseCode, "ELH-09");
    assert.equal(sorted[1].courseCode, "ELH-10");
  });

  test("3. ELH-26 appears before ELH-27", () => {
    const input = [{ courseCode: "ELH-27" }, { courseCode: "ELH-26" }];
    const sorted = sortCoursesByCode(input);
    assert.equal(sorted[0].courseCode, "ELH-26");
    assert.equal(sorted[1].courseCode, "ELH-27");
  });

  test("4. ELH-30 appears after ELH-29, ELH-31 appears after ELH-30, ELH-32 appears after ELH-31, ELH-33 appears after ELH-32, and ELH-34 appears after ELH-33", () => {
    const input = [{ courseCode: "ELH-34" }, { courseCode: "ELH-33" }, { courseCode: "ELH-32" }, { courseCode: "ELH-31" }, { courseCode: "ELH-30" }, { courseCode: "ELH-29" }];
    const sorted = sortCoursesByCode(input);
    assert.equal(sorted[0].courseCode, "ELH-29");
    assert.equal(sorted[1].courseCode, "ELH-30");
    assert.equal(sorted[2].courseCode, "ELH-31");
    assert.equal(sorted[3].courseCode, "ELH-32");
    assert.equal(sorted[4].courseCode, "ELH-33");
    assert.equal(sorted[5].courseCode, "ELH-34");
  });

  test("5. A shuffled list returns ELH-01 through ELH-34 in exact numerical order", () => {
    const fullList = Array.from({ length: 34 }, (_, i) => ({
      courseCode: `ELH-${(i + 1).toString().padStart(2, "0")}`,
    }));
    // Shuffled copy
    const shuffled = [...fullList].sort(() => Math.random() - 0.5);
    const sorted = sortCoursesByCode(shuffled);

    for (let i = 0; i < 34; i++) {
      const expectedCode = `ELH-${(i + 1).toString().padStart(2, "0")}`;
      assert.equal(
        sorted[i].courseCode,
        expectedCode,
        `Index ${i} should be ${expectedCode}`
      );
    }
  });

  test("6. Lowercase or mixed-case course codes are handled safely", () => {
    const input = [{ courseCode: "elh-10" }, { courseCode: "ElH-02" }, { courseCode: "ELH-01" }];
    const sorted = sortCoursesByCode(input);
    assert.equal(sorted[0].courseCode, "ELH-01");
    assert.equal(sorted[1].courseCode, "ElH-02");
    assert.equal(sorted[2].courseCode, "elh-10");
  });

  test("7. Missing or malformed codes do not crash sorting and are placed at the end", () => {
    const input = [
      { courseCode: null, title: "Z Course" },
      { courseCode: "CUSTOM-01" },
      { courseCode: "ELH-05" },
      { courseCode: undefined, title: "A Course" },
      { courseCode: "ELH-01" },
    ];
    const sorted = sortCoursesByCode(input);
    assert.equal(sorted[0].courseCode, "ELH-01");
    assert.equal(sorted[1].courseCode, "ELH-05");
    assert.equal(sorted[2].courseCode, "CUSTOM-01");
    assert.equal(sorted[3].title, "A Course");
    assert.equal(sorted[4].title, "Z Course");
  });
});
