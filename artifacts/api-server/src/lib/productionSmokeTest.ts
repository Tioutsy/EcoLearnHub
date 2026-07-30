import { db, coursesTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { runNotificationDeliveryDiagnostics } from "./notificationDeliveryDiagnostics";
import { runTrainingAnalyticsDiagnostics } from "./trainingAnalyticsDiagnostics";

export interface SmokeTestResult {
  passed: boolean;
  databaseCheck: boolean;
  coursesCount: number;
  diagnosticsCheck: boolean;
  timestamp: string;
  error?: string;
}

export async function runProductionSmokeTest(): Promise<SmokeTestResult> {
  try {
    // 1. Check DB query
    await db.execute(sql`SELECT 1`);
    const dbOk = true;

    // 2. Query published courses
    const courses = await db.select().from(coursesTable);
    const coursesCount = courses.length;

    // 3. Diagnostics check
    const notifDiag = await runNotificationDeliveryDiagnostics();
    const analyticsDiag = await runTrainingAnalyticsDiagnostics();
    const diagOk = notifDiag.criticalIssuesCount === 0 && analyticsDiag.criticalIssuesCount === 0;

    return {
      passed: dbOk && coursesCount > 0 && diagOk,
      databaseCheck: dbOk,
      coursesCount,
      diagnosticsCheck: diagOk,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      passed: false,
      databaseCheck: false,
      coursesCount: 0,
      diagnosticsCheck: false,
      timestamp: new Date().toISOString(),
      error: err.message || "Smoke test execution failed",
    };
  }
}
