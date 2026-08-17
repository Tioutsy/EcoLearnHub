import assert from "node:assert/strict";
import test, { describe } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../../../");

describe("Product Simplification — Impact Page Removal & Safety Verification", () => {
  const navbarPath = path.join(rootDir, "artifacts/ecolearn/src/components/layout/Navbar.tsx");
  const footerPath = path.join(rootDir, "artifacts/ecolearn/src/components/layout/Footer.tsx");
  const appPath = path.join(rootDir, "artifacts/ecolearn/src/App.tsx");
  const routesIndexPath = path.join(rootDir, "artifacts/api-server/src/routes/index.ts");
  const companyDashboardPath = path.join(rootDir, "artifacts/ecolearn/src/pages/company/index.tsx");
  const impactPagePath = path.join(rootDir, "artifacts/ecolearn/src/pages/impact/index.tsx");
  const impactRoutePath = path.join(rootDir, "artifacts/api-server/src/routes/impact.ts");

  test("1. Impact is absent from active Navbar navigation links", () => {
    const navbarContent = fs.readFileSync(navbarPath, "utf-8");
    // Ensure active navLinks array does not contain an active /impact link
    const navLinksMatch = navbarContent.match(/const navLinks = \[\s*([\s\S]*?)\s*\];/);
    assert.ok(navLinksMatch, "navLinks definition should exist");
    assert.ok(
      !navLinksMatch[1].includes('{ href: "/impact"'),
      "navLinks must not contain active { href: '/impact' }"
    );
  });

  test("2. Impact is absent from active Footer navigation links", () => {
    const footerContent = fs.readFileSync(footerPath, "utf-8");
    assert.ok(
      !footerContent.includes('<li><Link href="/impact"'),
      "Footer must not contain active link to /impact"
    );
  });

  test("3. Impact is absent across all role-based navigation extensions", () => {
    const navbarContent = fs.readFileSync(navbarPath, "utf-8");
    const authLinksMatch = navbarContent.match(/const authLinks = isSignedIn\s*\?\s*\[([\s\S]*?)\]\s*:\s*\[\];/);
    assert.ok(authLinksMatch, "authLinks definition should exist");
    assert.ok(
      !authLinksMatch[1].includes('href: "/impact"'),
      "authLinks must not contain /impact for any authenticated role"
    );
  });

  test("4. The former /impact route safely redirects to /dashboard", () => {
    const appContent = fs.readFileSync(appPath, "utf-8");
    assert.ok(
      appContent.includes('<Route path="/impact"><Redirect to="/dashboard" /></Route>'),
      "/impact route must redirect to /dashboard"
    );
    assert.ok(
      !appContent.includes('<Route path="/impact" component={ImpactDashboard} />'),
      "/impact route must not render ImpactDashboard directly"
    );
  });

  test("5. Company dashboard has no link to the standalone Impact page", () => {
    const dashboardContent = fs.readFileSync(companyDashboardPath, "utf-8");
    assert.ok(
      !dashboardContent.includes('href="/impact"'),
      "Company dashboard must not link to /impact"
    );
    assert.ok(
      dashboardContent.includes("ESG Readiness"),
      "Company dashboard should frame sustainability metrics as ESG Readiness"
    );
  });

  test("6. Expensive /api/impact route is disabled in active API router", () => {
    const routesContent = fs.readFileSync(routesIndexPath, "utf-8");
    assert.ok(
      !routesContent.includes('router.use("/impact", impactRouter);'),
      "routes/index.ts must not mount impactRouter as active router"
    );
  });

  test("7. Underlying frontend and backend Impact files are preserved dormant for future recovery", () => {
    assert.ok(fs.existsSync(impactPagePath), "pages/impact/index.tsx must be preserved for future recovery");
    assert.ok(fs.existsSync(impactRoutePath), "routes/impact.ts must be preserved for future recovery");
  });

  test("8. Internal company learning, progress, and workplace actions are preserved", () => {
    const dashboardContent = fs.readFileSync(companyDashboardPath, "utf-8");
    assert.ok(dashboardContent.includes("Manage Employees"), "Manage Employees must remain accessible");
    assert.ok(dashboardContent.includes("Training Priorities"), "Training priorities must remain accessible");
    assert.ok(dashboardContent.includes("ESG Training Report"), "ESG report export must remain accessible");
    assert.ok(dashboardContent.includes("Total Employees"), "Total Employees KPI must remain intact");
    assert.ok(dashboardContent.includes("Active Learners"), "Active Learners KPI must remain intact");
  });
});
