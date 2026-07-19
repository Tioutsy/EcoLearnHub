export type AssignmentStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "overdue";

export interface AssignmentStatusInput {
  progressPct?: number | null;
  completedAt?: Date | string | null;
  dueDate?: Date | string | null;
}

export interface EmployeeTrainingRollupInput {
  status: AssignmentStatus;
  progressPct?: number | null;
}

export type EmployeeTrainingStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export function asDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getAssignmentStatus(
  input: AssignmentStatusInput,
  now = new Date(),
): AssignmentStatus {
  const completedAt = asDate(input.completedAt);
  if (completedAt) return "completed";

  const dueDate = asDate(input.dueDate);
  if (dueDate && now > dueDate) return "overdue";

  const progressPct = Math.max(0, Math.min(100, input.progressPct ?? 0));
  if (progressPct > 0) return "in_progress";

  return "not_started";
}

export function getEmployeeTrainingStatus(
  rows: EmployeeTrainingRollupInput[],
): EmployeeTrainingStatus {
  if (rows.length === 0) return "not_started";
  if (rows.every((row) => row.status === "completed")) return "completed";
  if (
    rows.some(
      (row) =>
        row.status === "in_progress" ||
        row.status === "completed" ||
        (row.progressPct ?? 0) > 0,
    )
  ) {
    return "in_progress";
  }
  return "not_started";
}

export function getCompletionRate(completed: number, assigned: number): number {
  if (assigned <= 0) return 0;
  return Math.round((completed / assigned) * 100);
}

export function isActionNeeded(
  input: AssignmentStatusInput,
  now = new Date(),
  dueSoonDays = 7,
): boolean {
  const status = getAssignmentStatus(input, now);
  if (status === "completed") return false;
  if (status === "overdue") return true;

  const dueDate = asDate(input.dueDate);
  if (!dueDate) return status === "not_started";

  const soon = new Date(now);
  soon.setDate(soon.getDate() + dueSoonDays);
  return dueDate <= soon;
}

export function calculateEmployeeAverageScore(
  attempts: { courseId: number; score: number; passed: boolean }[]
): number {
  const passingAttempts = attempts.filter((a) => a.passed === true);
  if (passingAttempts.length === 0) return 0;

  const bestScoresByCourse = new Map<number, number>();
  for (const a of passingAttempts) {
    const currentBest = bestScoresByCourse.get(a.courseId) ?? 0;
    if (a.score > currentBest) {
      bestScoresByCourse.set(a.courseId, a.score);
    }
  }

  const courseScores = Array.from(bestScoresByCourse.values());
  if (courseScores.length === 0) return 0;

  return Math.round(
    courseScores.reduce((total, score) => total + score, 0) / courseScores.length
  );
}
