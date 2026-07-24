import test from "node:test";
import assert from "node:assert/strict";
import { ensureInsightsMigrated } from "./lib/ensureInsightsMigrated";
import { db, blogPostsTable, mauritiusResourcesTable } from "@workspace/db";
import { count } from "drizzle-orm";

test("ensureInsightsMigrated Seeder Idempotency Test", async () => {
  console.log("Running seeder first time...");
  await ensureInsightsMigrated();

  const [articlesCount1] = await db.select({ val: count() }).from(blogPostsTable);
  const [resourcesCount1] = await db.select({ val: count() }).from(mauritiusResourcesTable);

  console.log(`First run counts: Articles=${articlesCount1?.val}, Resources=${resourcesCount1?.val}`);
  assert.ok(articlesCount1 && articlesCount1.val >= 12, "Should seed at least 12 articles");
  assert.ok(resourcesCount1 && resourcesCount1.val >= 40, "Should seed at least 40 resources");

  console.log("Running seeder second time...");
  await ensureInsightsMigrated();

  const [articlesCount2] = await db.select({ val: count() }).from(blogPostsTable);
  const [resourcesCount2] = await db.select({ val: count() }).from(mauritiusResourcesTable);

  console.log(`Second run counts: Articles=${articlesCount2?.val}, Resources=${resourcesCount2?.val}`);
  assert.equal(articlesCount2?.val, articlesCount1?.val, "No duplicate articles should be created on second run");
  assert.equal(resourcesCount2?.val, resourcesCount1?.val, "No duplicate resources should be created on second run");
});
