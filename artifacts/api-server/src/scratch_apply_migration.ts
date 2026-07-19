import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import fs from "fs";

async function apply() {
  const sqlContent = fs.readFileSync("../../drizzle/0006_curious_absorbing_man.sql", "utf-8");
  const statements = sqlContent.split("--> statement-breakpoint");
  for (let stmt of statements) {
    stmt = stmt.trim();
    if (stmt) {
      console.log("Executing:", stmt);
      try {
        await db.execute(sql.raw(stmt));
        console.log("Success.");
      } catch (e: any) {
        if (e.message.includes("already exists")) {
          console.log("Already exists, skipping.");
        } else {
          console.error("Error:", e.message);
        }
      }
    }
  }
}
apply().catch(console.error).then(() => process.exit(0));
