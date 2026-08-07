export function useLanguage() {
  return {
    language: "en" as const,
    setLanguage: () => {},
    t: (key: string) => {
      // Clean, English fallback map for legacy component calls
      const map: Record<string, string> = {
        "nav.courses": "Courses",
        "nav.challenges": "Action Challenges",
        "nav.mauritius_resources": "Mauritius Rules & Resources",
        "nav.impact": "Impact",
        "nav.pricing": "Pricing",
        "nav.my_learning": "My Learning",
        "nav.company": "Company Portal",
        "nav.employee_reviews": "Reviews",
        "nav.admin": "Admin",
        "nav.platform_admin": "Platform Admin",
        "nav.sign_in": "Sign In",
        "nav.get_started": "Get Started",
        "error.page_not_found": "Page Not Found",
        "error.something_went_wrong": "Did you take a wrong turn? The page you are looking for does not exist."
      };
      return map[key] || key;
    }
  };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
