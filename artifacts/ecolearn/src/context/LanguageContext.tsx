import React from "react";

const englishTranslations: Record<string, string> = {
  // Navigation
  "nav.courses": "Courses",
  "nav.challenges": "Challenges",
  "nav.mauritius_resources": "Mauritius Rules & Resources",
  "nav.impact": "Impact",
  "nav.pricing": "Pricing",
  "nav.my_learning": "My Learning",
  "nav.company": "Company",
  "nav.employee_reviews": "Employee Challenge Reviews",
  "nav.admin": "Admin",
  "nav.platform_admin": "Platform Admin",
  "nav.sign_in": "Sign In",
  "nav.get_started": "Get Started",
  "nav.sign_out": "Sign Out",

  // Common
  "common.back": "Back",
  "common.continue": "Continue",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.search": "Search",
  "common.filter": "Filter",
  "common.download": "Download",
  "common.view_details": "View details",
  "common.loading": "Loading...",
  "common.try_again": "Try again",
  "common.all": "All",
  "common.completed": "Completed",
  "common.browse_courses": "Browse Courses",
  "common.back_to_dashboard": "Back to Dashboard",
  "common.view_certificates": "View Certificates",
  "common.export_csv": "Export CSV",
  "common.export_pdf": "Export PDF",
  "common.actions": "Actions",

  // Footer
  "footer.tagline": "Short, practical workplace learning that helps employees learn, apply and improve.",
  "footer.operator": "Elevio is operated by Recyclean Ltd.",
  "footer.platform": "Platform",
  "footer.company": "Company",
  "footer.course_catalog": "Course Catalog",
  "footer.impact_dashboard": "Impact Dashboard",
  "footer.corporate_plans": "Corporate Plans",
  "footer.verify_certificate": "Verify Certificate",
  "footer.about_us": "About Us",
  "footer.blog": "Sustainability Blog",
  "footer.contact_support": "Contact Support",
  "footer.all_rights_reserved": "All rights reserved.",

  // Auth Shell
  "auth.sign_in_title": "Sign in to Elevio Skills",
  "auth.sign_up_title": "Create your Elevio Skills Account",
  "auth.forgot_password": "Forgot password?",
  "auth.accept_invitation": "Accept Invitation",
  "auth.session_expired": "Your session has expired. Please sign in again.",
  "auth.unauthorized": "You are not authorized to view this page.",

  // Home Page
  "home.hero_tag": "Short, Practical Workplace Learning for Mauritius",
  "home.hero_title": "Elevio Skills — Learn. Apply. Improve.",
  "home.hero_sub": "Short, practical workplace learning that helps employees learn, apply and improve. Build practical sustainability capabilities across your organization with self-paced courses tailored for Mauritian teams.",
  "home.explore_courses": "Explore Courses",
  "home.view_corporate_plans": "View Corporate Plans",
  "home.value_props_title": "Built for measurable ESG results",
  "home.value_props_sub": "Drive employee engagement, track measurable results, and turn training hours into board-ready ESG reporting and compliance evidence.",
  "home.vp1_title": "Employee engagement",
  "home.vp1_desc": "Keep teams learning with challenges, leaderboards, and badges. Substantive, practical sustainability tailored to the Mauritian context, never greenwashing.",
  "home.vp2_title": "Measurable results & reporting",
  "home.vp2_desc": "Track progress in real time and turn learning hours into ESG KPIs. Export board-ready ESG training reports whenever you need them.",
  "home.vp3_title": "ESG readiness & compliance support",
  "home.vp3_desc": "Stay audit-ready with mandatory training tracking, expiry reminders, and verifiable employee certificates that demonstrate your ESG commitment.",
  "home.strategic_title": "Strategic Training Programs",
  "home.strategic_sub": "Expert-led courses designed for immediate organizational application.",
  "home.view_all_catalog": "View All Catalog",

  // Pricing Shell
  "pricing.title": "Choose the level of sustainability learning your organisation needs",
  "pricing.subtitle": "Select a commercial plan for your required course coverage, with transparent monthly pricing based on your total employee category.",
  "pricing.step1": "Step 1: Select your total employee category",
  "pricing.plan_essential": "Essential",
  "pricing.plan_professional": "Professional",
  "pricing.plan_complete": "Complete",
  "pricing.contact_us": "Contact us for a quote",
  "pricing.per_month": "per month",

  // Errors
  "error.page_not_found": "Page Not Found",
  "error.something_went_wrong": "Did you take a wrong turn? The page you are looking for does not exist.",
};

export function useLanguage() {
  return {
    language: "en" as const,
    setLanguage: () => {},
    t: (key: string) => englishTranslations[key] || key,
  };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
