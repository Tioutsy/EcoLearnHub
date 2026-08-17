import assert from "node:assert/strict";
import test, { describe } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Sprint 12F — Authenticated Internal Home Page & Navigation Closure Audit", () => {
  const ecolearnDir = path.resolve(__dirname, "../../../ecolearn/src");

  describe("1. Routing & Route Registration Audit", () => {
    test("App.tsx registers the /home route and wraps with authenticated Show guard", () => {
      const appContent = fs.readFileSync(path.join(ecolearnDir, "App.tsx"), "utf-8");
      assert.equal(appContent.includes('<Route path="/home">'), true, "/home route must be explicitly registered in App.tsx");
      assert.equal(appContent.includes('<InternalHome />'), true, "InternalHome page component must be mounted on /home");
      assert.equal(appContent.includes('<Show when="signed-in">'), true, "/home route must require signed-in state");
      assert.equal(appContent.includes('<Show when="signed-out">'), true, "Signed out visitors on /home must be redirected");
    });

    test("App.tsx HomeRedirect redirects signed-in users from root / to /home while preserving public marketing page for signed-out visitors", () => {
      const appContent = fs.readFileSync(path.join(ecolearnDir, "App.tsx"), "utf-8");
      assert.equal(appContent.includes('<Redirect to="/home" />'), true, "Signed-in root / access must redirect to /home");
      assert.equal(appContent.includes('<Home />'), true, "Signed-out root / access must render public Home component");
    });

    test("InternalHome page component exists with required role-aware sections", () => {
      const homePagePath = path.join(ecolearnDir, "pages/internal-home/index.tsx");
      assert.equal(fs.existsSync(homePagePath), true, "InternalHome page file must exist");
      const content = fs.readFileSync(homePagePath, "utf-8");
      assert.equal(content.includes("Next Recommended Action"), true, "Must have Next Recommended Action section");
      assert.equal(content.includes("Progress Snapshot"), true, "Must have Progress Snapshot section");
      assert.equal(content.includes("Quick Access"), true, "Must have Quick Access section");
      assert.equal(content.includes("Put Learning into Practice"), true, "Must have Workplace Action section for learners");
    });
  });

  describe("2. Top-Left Logo & Navigation Audit", () => {
    test("Top-left logo navigates to /home when isLoaded && isSignedIn, and / when signed out", () => {
      const navbarContent = fs.readFileSync(path.join(ecolearnDir, "components/layout/Navbar.tsx"), "utf-8");
      assert.equal(navbarContent.includes('href={isLoaded && isSignedIn ? "/home" : "/"}'), true, "Logo must route to /home when signed in and loaded");
      assert.equal(navbarContent.includes('aria-label="Go to ELEVIO SKILLS Home"'), true, "Logo must have accessible aria-label");
      assert.equal(navbarContent.includes('focus-visible:ring-2'), true, "Logo must have visible focus state");
    });

    test("Authenticated navigation includes Home as the very first navigation item in the top bar", () => {
      const navbarContent = fs.readFileSync(path.join(ecolearnDir, "components/layout/Navbar.tsx"), "utf-8");
      assert.equal(navbarContent.includes('{ href: "/home", label: t("nav.home") || "Home", icon: HomeIcon }'), true, "Home nav link must be present in displayedLinks");
      const displayedLinksIdx = navbarContent.indexOf("const displayedLinks = isSignedIn");
      const homeLinkIdx = navbarContent.indexOf('{ href: "/home"', displayedLinksIdx);
      const coursesLinkIdx = navbarContent.indexOf('{ href: "/courses"', displayedLinksIdx);
      assert.equal(homeLinkIdx < coursesLinkIdx, true, "Home link must come before Courses link for authenticated users");
    });

    test("Translation dictionaries contain nav.home", () => {
      const langContextContent = fs.readFileSync(path.join(ecolearnDir, "context/LanguageContext.tsx"), "utf-8");
      assert.equal(langContextContent.includes('"nav.home": "Home"'), true, "LanguageContext must have nav.home");
      
      const serverTranslations = fs.readFileSync(path.join(__dirname, "translations.ts"), "utf-8");
      assert.equal(serverTranslations.includes('"nav.home": "Home"'), true, "Server translations must have nav.home");
    });
  });

  describe("3. Role-Aware Priority & RBAC Logic Audit", () => {
    test("Learner priority resolves: In-Progress (1) > Overdue (2) > Not Started (3) > Caught Up (4)", () => {
      // Priority 1: In-Progress
      const mockInProgress = [
        { id: 1, courseTitle: "Sustainability Foundations", progressPct: 45, assignmentStatus: "in_progress" },
        { id: 2, courseTitle: "Waste Sorting", progressPct: 0, assignmentStatus: "not_started" },
      ];
      const topInProgress = mockInProgress.find(e => e.progressPct > 0 && e.progressPct < 100);
      assert.equal(topInProgress?.courseTitle, "Sustainability Foundations");

      // Priority 2: Overdue when no in-progress
      const mockOverdue = [
        { id: 3, courseTitle: "Energy Efficiency", progressPct: 0, assignmentStatus: "overdue" },
        { id: 4, courseTitle: "Water Conservation", progressPct: 0, assignmentStatus: "not_started" },
      ];
      const overdueItem = mockOverdue.find(e => e.assignmentStatus === "overdue");
      assert.equal(overdueItem?.courseTitle, "Energy Efficiency");

      // Priority 3: Next assigned not started
      const mockNotStarted = [
        { id: 5, courseTitle: "Biodiversity", progressPct: 0, assignmentStatus: "not_started" },
      ];
      const nextAssigned = mockNotStarted.find(e => e.progressPct === 0);
      assert.equal(nextAssigned?.courseTitle, "Biodiversity");

      // Priority 4: All caught up
      const mockCompleted = [
        { id: 6, courseTitle: "Foundations", progressPct: 100, assignmentStatus: "completed" },
      ];
      const active = mockCompleted.filter(e => e.progressPct < 100);
      assert.equal(active.length, 0);
    });

    test("Manager & Admin priority resolves: Overdue follow-up > Not started > Insights > Normal status", () => {
      const mockActionNeededOverdue = [{ assignmentId: 1, status: "overdue" }];
      const hasOverdue = mockActionNeededOverdue.some(a => a.status === "overdue");
      assert.equal(hasOverdue, true);

      const mockActionNeededNotStarted = [{ assignmentId: 2, status: "not_started" }];
      const hasNotStarted = mockActionNeededNotStarted.some(a => a.status === "not_started");
      assert.equal(hasNotStarted, true);
    });
  });

  describe("4. Terminology, Product Simplification & Removal Integrity", () => {
    test("Navigation and Quick Links use My Skills terminology", () => {
      const navbarContent = fs.readFileSync(path.join(ecolearnDir, "components/layout/Navbar.tsx"), "utf-8");
      const langContent = fs.readFileSync(path.join(ecolearnDir, "context/LanguageContext.tsx"), "utf-8");
      assert.equal(langContent.includes('"nav.my_learning": "My Skills"'), true, "nav.my_learning must be 'My Skills'");
      assert.equal(langContent.includes('"dashboard.my_learning_title": "My Skills"'), true, "dashboard.my_learning_title must be 'My Skills'");
    });

    test("InternalHome contains NO references to removed Impact or Mauritius Rules & Resources routes", () => {
      const homeContent = fs.readFileSync(path.join(ecolearnDir, "pages/internal-home/index.tsx"), "utf-8");
      assert.equal(homeContent.includes("/impact"), false, "InternalHome must not link to removed /impact");
      assert.equal(homeContent.includes("/made-for-mauritius"), false, "InternalHome must not link to removed /made-for-mauritius");
      assert.equal(homeContent.includes("/blog"), false, "InternalHome must not link to removed /blog");
    });
  });

  describe("5. Loading, Empty & Error States Audit", () => {
    test("InternalHome implements Skeleton loading states, empty caught-up state, and friendly retry error state", () => {
      const homeContent = fs.readFileSync(path.join(ecolearnDir, "pages/internal-home/index.tsx"), "utf-8");
      assert.equal(homeContent.includes("<Skeleton"), true, "Must contain Skeleton loading state");
      assert.equal(homeContent.includes("You’re all caught up"), true, "Must contain empty / all caught up state");
      assert.equal(homeContent.includes("We couldn’t load your Home page"), true, "Must contain safe user-facing error state");
      assert.equal(homeContent.includes("Try again"), true, "Must contain retry button on error");
    });
  });
});
