import { useLanguage, Language } from "@/context/LanguageContext";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function LanguageSelector({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("inline-flex items-center gap-1 bg-muted/60 p-1 rounded-lg border text-xs font-medium", className)}>
      <Globe className="h-3.5 w-3.5 text-muted-foreground ml-1 mr-0.5 shrink-0" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-label="Switch interface language to English"
        className={cn(
          "px-2 py-0.5 rounded-md transition-all font-semibold",
          language === "en"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage("fr")}
        aria-label="Changer la langue de l'interface en Français"
        className={cn(
          "px-2 py-0.5 rounded-md transition-all font-semibold",
          language === "fr"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Français
      </button>
    </div>
  );
}
