import { logger } from "./logger";

export interface EnvironmentValidationResult {
  valid: boolean;
  warnings: string[];
  blockers: string[];
  mode: "production" | "development" | "test";
}

export function validateProductionEnvironment(): EnvironmentValidationResult {
  const mode = (process.env.NODE_ENV as "production" | "development" | "test") || "development";
  const warnings: string[] = [];
  const blockers: string[] = [];

  // Mandatory Production Checks
  if (mode === "production") {
    if (!process.env.DATABASE_URL) {
      blockers.push("DATABASE_URL is missing in production environment");
    }
    if (!process.env.CLERK_SECRET_KEY) {
      blockers.push("CLERK_SECRET_KEY is missing in production environment");
    }
    if (!process.env.SCHEDULER_SECRET) {
      warnings.push("SCHEDULER_SECRET is not set; scheduled reminder endpoint will rely on admin authentication fallback.");
    }
  }

  // Development / General Warnings
  if (!process.env.RESEND_API_KEY) {
    warnings.push("RESEND_API_KEY is not set. Email delivery will use DevLogProvider (simulated logging mode).");
  }

  const valid = blockers.length === 0;

  if (!valid) {
    logger.error({ blockers }, "[ProductionEnvironmentValidator] Server configuration contains launch blockers!");
  } else if (warnings.length > 0) {
    logger.warn({ warnings }, "[ProductionEnvironmentValidator] Server configuration contains operational warnings.");
  } else {
    logger.info({ mode }, "[ProductionEnvironmentValidator] Environment validation completed successfully.");
  }

  return {
    valid,
    warnings,
    blockers,
    mode,
  };
}
