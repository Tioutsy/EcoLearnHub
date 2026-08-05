import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useUser } from "@clerk/react";
import { translations, Language } from "@/config/translations";

export type { Language };
export { translations };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const STORAGE_KEY = "elevio_language_preference";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [language, setLanguageState] = useState<Language>(() => {
    // Resolution order:
    // 1. Authenticated Clerk metadata preference
    // 2. Stored localStorage preference
    // 3. Browser language
    // 4. Default 'en'
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "fr") return stored;

    const navLang = navigator.language?.toLowerCase() || "";
    if (navLang.startsWith("fr")) return "fr";

    return "en";
  });

  // Sync user preference from Clerk metadata if signed in
  useEffect(() => {
    const userPref = user?.publicMetadata?.preferredLanguage as string | undefined;
    if (userPref === "en" || userPref === "fr") {
      setLanguageState(userPref);
      localStorage.setItem(STORAGE_KEY, userPref);
    }
  }, [user]);

  // Update document lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);

    // Save to Clerk metadata if signed in
    if (user) {
      user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          preferredLanguage: newLang,
        },
      }).catch(() => {
        // Safe fallback if metadata update fails
      });
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.en;
    let template = langDict[key] || translations.en[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        template = template.replace(new RegExp(`{\\s*${paramKey}\\s*}`, "g"), String(value));
      });
    }

    return template;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
