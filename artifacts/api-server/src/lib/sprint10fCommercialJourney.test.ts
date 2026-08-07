import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10F — Commercial Journey & Green Brand Alignment Tests", () => {

  describe("1. Public Brand & Navigation Elements Audit", () => {
    test("Footer component no longer exposes 'Verify Certificate' link", async () => {
      const fs = await import("node:fs");
      const footerContent = fs.readFileSync("../ecolearn/src/components/layout/Footer.tsx", "utf-8");
      assert.equal(footerContent.includes("/certificates/verify"), false, "Verify Certificate link must be removed from footer");
      assert.equal(footerContent.includes("t(\"footer.verify_certificate\")"), false, "Verify Certificate translation token must be removed from footer");
    });

    test("Home page CTA section uses green background styling and no longer contains 'Request a Proposal'", async () => {
      const fs = await import("node:fs");
      const homeContent = fs.readFileSync("../ecolearn/src/pages/home.tsx", "utf-8");
      assert.equal(homeContent.includes("Ready to build practical sustainability skills?"), true, "Home CTA title must be updated");
      assert.equal(homeContent.includes("Request a Proposal"), false, "Request a Proposal CTA must be removed from Home page");
      assert.equal(homeContent.includes("bg-gradient-to-br from-emerald-950"), true, "Home CTA background must use green palette");
    });

    test("Footer component uses green background styling and font-serif title typography for ELEVIO SKILLS", async () => {
      const fs = await import("node:fs");
      const footerContent = fs.readFileSync("../ecolearn/src/components/layout/Footer.tsx", "utf-8");
      assert.equal(footerContent.includes("bg-emerald-950"), true, "Footer must use deep green background");
      assert.equal(footerContent.includes("font-serif uppercase"), true, "Footer ELEVIO SKILLS brand wordmark must use font-serif title typography");
    });

    test("Navbar component uses font-serif title typography for ELEVIO SKILLS wordmark", async () => {
      const fs = await import("node:fs");
      const navbarContent = fs.readFileSync("../ecolearn/src/components/layout/Navbar.tsx", "utf-8");
      assert.equal(navbarContent.includes("font-serif uppercase"), true, "Navbar ELEVIO SKILLS brand wordmark must use font-serif title typography");
    });
  });

  describe("2. Corporate Pricing & CTAs Audit", () => {
    test("Pricing cards for standard ≤120 tiers use 'Get Started' action labels", async () => {
      const fs = await import("node:fs");
      const pricingContent = fs.readFileSync("../ecolearn/src/pages/pricing.tsx", "utf-8");
      assert.equal(pricingContent.includes("Get Started — Essential"), true, "Plan 1 CTA must be Get Started — Essential");
      assert.equal(pricingContent.includes("Get Started — Professional"), true, "Plan 2 CTA must be Get Started — Professional");
      assert.equal(pricingContent.includes("Get Started — Complete"), true, "Plan 3 CTA must be Get Started — Complete");
    });

    test("Over-120 employee tier remains isolated for tailored quote request", async () => {
      const fs = await import("node:fs");
      const pricingContent = fs.readFileSync("../ecolearn/src/pages/pricing.tsx", "utf-8");
      assert.equal(pricingContent.includes("Contact us for an organisation plan"), true, "Over 120 tier must retain contact action");
    });
  });

  describe("3. Certificate Verification Route Preservation", () => {
    test("Underlying certificate verification page file exists for QR codes and certificate links", async () => {
      const fs = await import("node:fs");
      assert.equal(fs.existsSync("../ecolearn/src/pages/certificates/verify.tsx"), true, "Certificate verify page must be preserved");
    });
  });

});
