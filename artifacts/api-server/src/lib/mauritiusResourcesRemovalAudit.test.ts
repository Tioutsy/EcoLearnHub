import assert from "node:assert/strict";
import test, { describe } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../../../");

describe("Product Simplification — Mauritius Rules & Resources Removal & Safety Verification", () => {
  const navbarPath = path.join(rootDir, "artifacts/ecolearn/src/components/layout/Navbar.tsx");
  const appPath = path.join(rootDir, "artifacts/ecolearn/src/App.tsx");
  const homePath = path.join(rootDir, "artifacts/ecolearn/src/pages/home.tsx");
  const recyclingSectionPath = path.join(rootDir, "artifacts/ecolearn/src/components/recycling/RecyclingImpactSection.tsx");
  const routesIndexPath = path.join(rootDir, "artifacts/api-server/src/routes/index.ts");
  const resourcesListPagePath = path.join(rootDir, "artifacts/ecolearn/src/pages/Insights/mauritius-resources.tsx");
  const resourcesDetailPagePath = path.join(rootDir, "artifacts/ecolearn/src/pages/Insights/mauritius-resource-detail.tsx");
  const blogRoutePath = path.join(rootDir, "artifacts/api-server/src/routes/blog.ts");

  test("1. Mauritius Rules & Resources is absent from active Navbar links", () => {
    const navbarContent = fs.readFileSync(navbarPath, "utf-8");
    const navLinksMatch = navbarContent.match(/const navLinks = \[\s*([\s\S]*?)\s*\];/);
    assert.ok(navLinksMatch, "navLinks definition should exist");
    assert.ok(
      !navLinksMatch[1].includes('{ href: "/mauritius-rules-resources"'),
      "navLinks must not contain active { href: '/mauritius-rules-resources' }"
    );
  });

  test("2. The former /mauritius-rules-resources routes safely redirect to /courses", () => {
    const appContent = fs.readFileSync(appPath, "utf-8");
    assert.ok(
      appContent.includes('<Route path="/mauritius-rules-resources"><Redirect to="/courses" /></Route>'),
      "/mauritius-rules-resources route must redirect to /courses"
    );
    assert.ok(
      appContent.includes('<Route path="/mauritius-rules-resources/:slug"><Redirect to="/courses" /></Route>'),
      "/mauritius-rules-resources/:slug route must redirect to /courses"
    );
    assert.ok(
      !appContent.includes('<Route path="/mauritius-rules-resources" component={MauritiusResourcesList} />'),
      "/mauritius-rules-resources must not render component directly"
    );
  });

  test("3. Legacy content aliases (/made-for-mauritius, /blog, /insights) safely redirect to /courses", () => {
    const appContent = fs.readFileSync(appPath, "utf-8");
    assert.ok(
      appContent.includes('<Route path="/made-for-mauritius"><Redirect to="/courses" /></Route>'),
      "/made-for-mauritius must redirect to /courses"
    );
    assert.ok(
      appContent.includes('<Route path="/blog"><Redirect to="/courses" /></Route>'),
      "/blog must redirect to /courses"
    );
    assert.ok(
      appContent.includes('<Route path="/insights"><Redirect to="/courses" /></Route>'),
      "/insights must redirect to /courses"
    );
  });

  test("4. Landing page CTAs no longer link to removed resources page", () => {
    const homeContent = fs.readFileSync(homePath, "utf-8");
    assert.ok(
      !homeContent.includes('href="/mauritius-rules-resources"'),
      "home.tsx must not link to /mauritius-rules-resources"
    );
  });

  test("5. Recycling section CTA links cleanly to courses", () => {
    const recyclingContent = fs.readFileSync(recyclingSectionPath, "utf-8");
    assert.ok(
      !recyclingContent.includes('href="/mauritius-rules-resources"'),
      "RecyclingImpactSection must not link to /mauritius-rules-resources"
    );
  });

  test("6. Public blog/resources route is disabled in active API router", () => {
    const routesContent = fs.readFileSync(routesIndexPath, "utf-8");
    assert.ok(
      !routesContent.includes('router.use(blogRouter);'),
      "routes/index.ts must not mount blogRouter as active router"
    );
  });

  test("7. Underlying frontend and backend files are preserved dormant for future recovery", () => {
    assert.ok(fs.existsSync(resourcesListPagePath), "mauritius-resources.tsx must be preserved");
    assert.ok(fs.existsSync(resourcesDetailPagePath), "mauritius-resource-detail.tsx must be preserved");
    assert.ok(fs.existsSync(blogRoutePath), "routes/blog.ts must be preserved");
  });
});
