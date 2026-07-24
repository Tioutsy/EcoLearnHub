import assert from "node:assert/strict";
import test from "node:test";
import { spawn, ChildProcess } from "node:child_process";
import { db, blogPostsTable, mauritiusResourcesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const API_BASE = "http://localhost:8089/api";

const REGULAR_HEADERS = {
  "x-test-user-id": "test_regular_user",
  "x-test-user-email": "regular@ecolearn.mu",
  "Content-Type": "application/json",
};

const ADMIN_HEADERS = {
  "x-test-user-id": "test_admin_user",
  "x-test-user-email": "admin@ecolearn.mu",
  "x-test-user-role": "platform_admin",
  "Content-Type": "application/json",
};

test("Insights and Mauritius Rules Library E2E Integration and Access Control", async () => {
  let devServer: ChildProcess | undefined;

  try {
    console.log("Spawning E2E test server on port 8089...");
    devServer = spawn(process.execPath, ["./dist/index.mjs"], {
      env: {
        ...process.env,
        NODE_ENV: "development",
        ENABLE_TEST_AUTH_BYPASS: "true",
        PORT: "8089",
      },
      cwd: process.cwd(),
    });

    devServer.stdout?.on("data", (data) => {
      console.log(`[TEST SERVER STDOUT] ${data.toString().trim()}`);
    });
    devServer.stderr?.on("data", (data) => {
      console.error(`[TEST SERVER STDERR] ${data.toString().trim()}`);
    });

    // Wait for server to become ready
    let ready = false;
    for (let attempt = 1; attempt <= 240; attempt++) {
      try {
        const res = await fetch(`${API_BASE}/insights/articles`, { headers: REGULAR_HEADERS });
        if (res.status === 200) {
          ready = true;
          break;
        }
      } catch {
        // Wait 1s
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    if (!ready) {
      throw new Error("Server failed to start on port 8089");
    }

    console.log("Server is ready, executing tests...");

    // 1. Verify Public Articles list
    const articlesRes = await fetch(`${API_BASE}/insights/articles`, { headers: REGULAR_HEADERS });
    assert.equal(articlesRes.status, 200);
    const articles = await articlesRes.json() as any[];
    assert.ok(articles.length >= 12, "Should return seeded articles");
    
    // Check fields on article
    const firstArticle = articles.find(a => a.slug === "mauritius-bin-system-guide");
    assert.ok(firstArticle, "bin system article should exist");
    assert.ok(Array.isArray(firstArticle.linkedResourceSlugs), "linkedResourceSlugs must be an array");
    assert.ok(firstArticle.lastVerifiedAt, "lastVerifiedAt must be present");

    // 2. Verify Single Public Article detail
    const singleArticleRes = await fetch(`${API_BASE}/insights/articles/mauritius-bin-system-guide`, { headers: REGULAR_HEADERS });
    assert.equal(singleArticleRes.status, 200);
    const articleDetail = await singleArticleRes.json() as any;
    assert.equal(articleDetail.slug, "mauritius-bin-system-guide");

    // 3. Verify Public Resources directory listing
    const resourcesRes = await fetch(`${API_BASE}/insights/mauritius-resources`, { headers: REGULAR_HEADERS });
    assert.equal(resourcesRes.status, 200);
    const resources = await resourcesRes.json() as any[];
    assert.ok(resources.length >= 40, "Should return at least 40 resources");

    const firstResource = resources.find(r => r.slug === "environment-act-2024");
    assert.ok(firstResource, "Environment Act 2024 resource should exist");
    assert.equal(firstResource.legalStatus, "active", "Environment Act 2024 should have legal status 'active'");

    // 4. Verify Access Control (Regular user is forbidden from admin endpoints)
    const unauthorizedDashboardRes = await fetch(`${API_BASE}/platform-admin/insights/review-dashboard`, { headers: REGULAR_HEADERS });
    assert.ok(unauthorizedDashboardRes.status === 401 || unauthorizedDashboardRes.status === 403, "Regular user should be unauthorized for dashboard");

    const unauthorizedPostRes = await fetch(`${API_BASE}/platform-admin/insights/mauritius-resources`, {
      method: "POST",
      headers: REGULAR_HEADERS,
      body: JSON.stringify({
        title: "Test Forbidden Resource",
        slug: "test-forbidden-resource",
        resourceType: "Act",
        shortSummary: "Forbidden summary",
        mainExplanation: "Forbidden explanation",
      }),
    });
    assert.ok(unauthorizedPostRes.status === 401 || unauthorizedPostRes.status === 403, "Regular user should be forbidden from creating resources");

    // 5. Platform Admin Access (Review Dashboard)
    const adminDashboardRes = await fetch(`${API_BASE}/platform-admin/insights/review-dashboard`, { headers: ADMIN_HEADERS });
    assert.equal(adminDashboardRes.status, 200, "Admin should access dashboard successfully");
    const dashboardData = await adminDashboardRes.json() as any;
    assert.ok(Array.isArray(dashboardData.overdueArticles), "dashboard should return overdueArticles array");
    assert.ok(Array.isArray(dashboardData.overdueResources), "dashboard should return overdueResources array");
    assert.ok(Array.isArray(dashboardData.brokenLinks), "dashboard should return brokenLinks array");
    assert.ok(Array.isArray(dashboardData.unsourcedArticles), "dashboard should return unsourcedArticles array");

    // 6. Platform Admin Create and Update resource
    const newResourceSlug = "e2e-test-resource-custom";
    const postRes = await fetch(`${API_BASE}/platform-admin/insights/mauritius-resources`, {
      method: "POST",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({
        title: "E2E Test Resource Custom",
        slug: newResourceSlug,
        resourceType: "Regulation",
        shortSummary: "E2E test short summary",
        mainExplanation: "E2E test explanation",
        legalStatus: "active",
        lastVerifiedAt: new Date().toISOString(),
        nextReviewAt: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
    assert.equal(postRes.status, 201, "Admin should create resource successfully");
    const createdResource = await postRes.json() as any;
    assert.equal(createdResource.slug, newResourceSlug);

    // Patch resource legal status to superseded
    const patchRes = await fetch(`${API_BASE}/platform-admin/insights/mauritius-resources/${createdResource.id}`, {
      method: "PATCH",
      headers: ADMIN_HEADERS,
      body: JSON.stringify({
        legalStatus: "superseded",
      }),
    });
    assert.equal(patchRes.status, 200, "Admin should patch resource successfully");
    const patchedResource = await patchRes.json() as any;
    assert.equal(patchedResource.legalStatus, "superseded");

    // Cleanup E2E custom resource
    await db.delete(mauritiusResourcesTable).where(eq(mauritiusResourcesTable.slug, newResourceSlug));
    console.log("E2E tests completed successfully!");

  } finally {
    if (devServer) {
      console.log("Killing dev test server process...");
      devServer.kill("SIGTERM");
    }
  }
});
