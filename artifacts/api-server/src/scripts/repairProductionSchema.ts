import fs from "fs";
import path from "path";

// Load local .env if DATABASE_URL is not set (e.g. CLI usage without --env-file)
if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    const match = envFile.match(/DATABASE_URL=["']?(.*?)["']?(\s|$)/m);
    if (match) {
      process.env.DATABASE_URL = match[1].trim();
    }
  }
}

import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { verifyDatabaseIntegrity } from "../lib/verifyDatabaseIntegrity";

const args = process.argv.slice(2);
const isApply = args.includes("--apply");
const isDryRun = args.includes("--dry-run") || !isApply;

async function main() {
  console.log("=== EcoLearnHub Database Repair Tool ===");
  if (isDryRun) {
    console.log("Mode: DRY-RUN (No modifications will be made)\n");
  } else {
    console.log("Mode: APPLY (Corrective changes will be executed)\n");
  }

  try {
    // 1. Initial Verification Scan
    console.log("Scanning database for inconsistencies...");
    const initialReport = await verifyDatabaseIntegrity();
    
    if (initialReport.issues.length === 0) {
      console.log("Database schema is already healthy. No repairs required.");
      process.exit(0);
    }

    console.log(`Scan found ${initialReport.issues.length} issue(s).`);
    const criticalCount = initialReport.issues.filter(i => i.type === "critical").length;
    console.log(`- Critical issues: ${criticalCount}`);
    console.log(`- Warnings/Info: ${initialReport.issues.length - criticalCount}`);

    if (isDryRun) {
      console.log("\nSummary of detected issues:");
      initialReport.issues.forEach(i => {
        console.log(`[${i.type.toUpperCase()}] ${i.message}`);
      });
      console.log("\nTo apply these repairs safely, run:");
      console.log("  pnpm run db:repair -- --apply");
      process.exit(criticalCount > 0 ? 1 : 0);
    }

    // 2. Apply Repairs
    console.log("\nApplying corrective migration and data repairs...");
    const migrationPath = path.resolve(process.cwd(), "../../drizzle/0011_repair_constraints_and_schema_integrity.sql");
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Repair migration file not found at: ${migrationPath}`);
    }

    const migrationSql = fs.readFileSync(migrationPath, "utf8");

    // Execute in transaction
    await db.transaction(async (tx) => {
      await tx.execute(sql.raw(migrationSql));
    });
    console.log("Corrective migration executed successfully.");

    // 3. Post-Repair Verification Scan
    console.log("\nVerifying database health after repair...");
    const postReport = await verifyDatabaseIntegrity();
    
    if (postReport.issues.length === 0) {
      console.log("\nDatabase schema is now fully compliant and verified!");
      process.exit(0);
    }

    console.log(`\nPost-repair scan found ${postReport.issues.length} issue(s) remaining:`);
    postReport.issues.forEach(i => {
      console.log(`[${i.type.toUpperCase()}] ${i.message}`);
    });

    const postCriticalCount = postReport.issues.filter(i => i.type === "critical").length;
    if (postCriticalCount > 0) {
      console.error("\nCritical database inconsistencies remain unresolved.");
      process.exit(1);
    } else {
      console.log("\nDatabase schema repaired successfully with non-critical warnings.");
      process.exit(0);
    }

  } catch (err: any) {
    console.error("\nRepair failed with unexpected error:", err.message);
    process.exit(1);
  }
}

main();
