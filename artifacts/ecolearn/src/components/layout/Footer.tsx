import { Link } from "wouter";
import { Leaf, Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="h-5 w-5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold font-serif">Elevio</span>
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">by Recyclean</span>
              </div>
            </div>
            <p className="text-secondary-foreground/80 text-sm leading-relaxed">
              {t("footer.tagline")}
            </p>
            <p className="text-xs text-secondary-foreground/60">
              {t("footer.operator")}
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">{t("footer.platform")}</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li><Link href="/courses" className="hover:text-white transition-colors">{t("footer.course_catalog")}</Link></li>
              <li><Link href="/impact" className="hover:text-white transition-colors">{t("footer.impact_dashboard")}</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">{t("footer.corporate_plans")}</Link></li>
              <li><Link href="/certificates/verify" className="hover:text-white transition-colors">{t("footer.verify_certificate")}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">{t("footer.company")}</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li><Link href="/about" className="hover:text-white transition-colors">{t("footer.about_us")}</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">{t("footer.blog")}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">{t("footer.contact_support")}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact</h4>
            <ul className="space-y-3 text-sm text-secondary-foreground/80">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Black River, Mauritius</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:support@elevio.mu" className="hover:text-white transition-colors">support@elevio.mu</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+230 5743 4349</span>
              </li>
            </ul>
          </div>
          
        </div>
        
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-secondary-foreground/60">
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