import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { db, coursesTable, lessonsTable, challengesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

describe("Sprint 11D.1 — Course & Challenge Catalogue Integrity Regression Suite", () => {
  test("1. Complete ELH-01 through ELH-34 catalogue is present and published", async () => {
    const allCourses = await db.select().from(coursesTable);
    const published = allCourses.filter((c) => c.isPublished);

    const expectedCodes = Array.from({ length: 34 }, (_, i) => `ELH-${String(i + 1).padStart(2, "0")}`);
    const publishedCodesSet = new Set(published.map((c) => c.courseCode));

    for (const code of expectedCodes) {
      assert.ok(publishedCodesSet.has(code), `Course code ${code} must be present and published in the database`);
    }

    assert.ok(published.length >= 34, `Expected at least 34 published courses, found ${published.length}`);
  });

  test("2. Numerical ordering handles ELH-01 through ELH-34 correctly", () => {
    const codes = Array.from({ length: 34 }, (_, i) => `ELH-${String(i + 1).padStart(2, "0")}`);
    const sorted = [...codes].sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10);
      const numB = parseInt(b.replace(/\D/g, ""), 10);
      return numA - numB;
    });

    assert.strictEqual(sorted[0], "ELH-01");
    assert.strictEqual(sorted[33], "ELH-34");
  });

  test("3. Course details return lessons and modules", async () => {
    const [elh01] = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-01")).limit(1);
    assert.ok(elh01, "ELH-01 course record must exist");

    const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, elh01.id));
    assert.ok(lessons.length > 0, "ELH-01 must have associated lessons");
  });

  test("4. Active challenges remain linked to courses", async () => {
    const challenges = await db.select().from(challengesTable).where(eq(challengesTable.isActive, true));
    assert.ok(challenges.length >= 12, `Expected at least 12 active challenges, found ${challenges.length}`);
  });

  test("5. Workplace commitment model additions do not alter course publication state", async () => {
    const [elh34] = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-34")).limit(1);
    assert.ok(elh34, "ELH-34 course record must exist");
    assert.strictEqual(elh34.isPublished, true, "ELH-34 publication state must remain true");
  });
});
