import assert from "node:assert/strict";
import test from "node:test";
import {
  getAssignmentStatus,
  getCompletionRate,
  getEmployeeTrainingStatus,
  isActionNeeded,
} from "./lms";

const now = new Date("2026-07-04T08:00:00.000Z");

test("assignment status is completed when a completion date exists", () => {
  assert.equal(
    getAssignmentStatus(
      {
        progressPct: 30,
        dueDate: "2026-07-01T00:00:00.000Z",
        completedAt: "2026-07-02T00:00:00.000Z",
      },
      now,
    ),
    "completed",
  );
});

test("assignment status separates overdue, in-progress and not-started rows", () => {
  assert.equal(
    getAssignmentStatus({ progressPct: 0, dueDate: "2026-07-01" }, now),
    "overdue",
  );
  assert.equal(getAssignmentStatus({ progressPct: 45 }, now), "in_progress");
  assert.equal(getAssignmentStatus({ progressPct: 0 }, now), "not_started");
});

test("employee rollup favours completed only when all assigned courses are done", () => {
  assert.equal(
    getEmployeeTrainingStatus([
      { status: "completed", progressPct: 100 },
      { status: "completed", progressPct: 100 },
    ]),
    "completed",
  );
  assert.equal(
    getEmployeeTrainingStatus([
      { status: "completed", progressPct: 100 },
      { status: "not_started", progressPct: 0 },
    ]),
    "in_progress",
  );
});

test("action-needed catches overdue, due-soon and untouched assignments", () => {
  assert.equal(
    isActionNeeded({ progressPct: 0, dueDate: "2026-07-03" }, now),
    true,
  );
  assert.equal(
    isActionNeeded({ progressPct: 20, dueDate: "2026-07-08" }, now),
    true,
  );
  assert.equal(isActionNeeded({ progressPct: 0 }, now), true);
  assert.equal(
    isActionNeeded(
      { progressPct: 100, completedAt: "2026-07-04T07:00:00.000Z" },
      now,
    ),
    false,
  );
});

test("completion rates are rounded and zero-safe", () => {
  assert.equal(getCompletionRate(2, 3), 67);
  assert.equal(getCompletionRate(0, 0), 0);
});
