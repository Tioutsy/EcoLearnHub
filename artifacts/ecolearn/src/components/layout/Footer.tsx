import { Link } from "wouter";
import { Leaf, Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-emerald-950 text-emerald-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                <Leaf className="h-5 w-5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-wider text-white font-serif uppercase">
                  ELEVIO SKILLS
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 tracking-tight mt-0.5">
                  By Recyclean
                </span>
              </div>
            </div>
            <p className="text-emerald-200/80 text-sm leading-relaxed">
              {t("footer.tagline")}
            </p>
            <p className="text-xs text-emerald-300/60">
              {t("footer.operator")}
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-white">{t("footer.platform")}</h4>
            <ul className="space-y-2 text-sm text-emerald-200/80">
              <li><Link href="/courses" className="hover:text-white transition-colors">{t("footer.course_catalog")}</Link></li>
              <li><Link href="/impact" className="hover:text-white transition-colors">{t("footer.impact_dashboard")}</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">{t("footer.corporate_plans")}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-white">{t("footer.company")}</h4>
            <ul className="space-y-2 text-sm text-emerald-200/80">
              <li><Link href="/about" className="hover:text-white transition-colors">{t("footer.about_us")}</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">{t("footer.blog")}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">{t("footer.contact_support")}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-white">Contact</h4>
            <ul className="space-y-3 text-sm text-emerald-200/80">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-emerald-400" />
                <span>Black River, Mauritius</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-emerald-400" />
                <a href="mailto:support@elevio.mu" className="hover:text-white transition-colors">support@elevio.mu</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>+230 5743 4349</span>
              </li>
            </ul>
          </div>
          
        </div>
        
        <div className="mt-12 pt-8 border-t border-emerald-800/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-emerald-300/70">
          <p>© {new Date().getFullYear()} Elevio. All rights reserved. Elevio is operated by Recyclean Ltd.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}