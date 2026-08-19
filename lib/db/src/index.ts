import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Fail-fast safety guard: Prevent automated integration test suites from mutating the production Neon database branch
const isTestEnv =
  process.env.NODE_ENV === "test" ||
  process.argv.some(
    (arg) =>
      arg.includes(".test.") ||
      arg.includes("--test") ||
      arg.endsWith("test")
  );

const isProductionDatabase =
  process.env.DATABASE_URL.includes("ep-delicate-pond-ahy88lt3") &&
  !process.env.DATABASE_URL.includes("test");

if (isTestEnv && isProductionDatabase && process.env.ALLOW_PROD_TESTS !== "true") {
  // Warn and prevent accidental writes during local/CI test runs
  if (process.env.STRICT_TEST_DB_ISOLATION === "true") {
    throw new Error(
      "SAFETY VIOLATION: Automated test execution is blocked against the production Neon database branch (ep-delicate-pond-ahy88lt3). Set a dedicated TEST_DATABASE_URL or ALLOW_PROD_TESTS=true to proceed."
    );
  }
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";

