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

import { verifyDatabaseIntegrity } from "../lib/verifyDatabaseIntegrity";

async function main() {
  console.log("Checking database schema integrity...");
  try {
    const report = await verifyDatabaseIntegrity();
    
    if (report.issues.length === 0) {
      console.log("\nDatabase schema is fully compliant. No issues found.");
      process.exit(0);
    }

    console.log(`\nFound ${report.issues.length} issue(s):`);
    for (const issue of report.issues) {
      const typeStr = issue.type.toUpperCase();
      console.log(`[${typeStr}] ${issue.message}`);
      if (issue.details) {
        console.log("Details:", JSON.stringify(issue.details, null, 2));
      }
    }

    if (!report.valid) {
      console.error("\nDatabase schema verification failed. Critical errors present.");
      process.exit(1);
    } else {
      console.log("\nDatabase schema verification passed with warnings/info.");
      process.exit(0);
    }
  } catch (err: any) {
    console.error("\nVerifier failed with unexpected error:", err.message);
    process.exit(1);
  }
}

main();
