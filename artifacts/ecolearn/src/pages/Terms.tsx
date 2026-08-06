import React, { useState } from "react";

export function TermsPage() {
  const [locale, setLocale] = useState<"en" | "fr">("en");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex justify-between items-center pb-6 mb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {locale === "fr" ? "Conditions d'Utilisation du Pilote" : "Pilot Terms of Service"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Elevio Skills by Recyclean Ltd. — Version 1.0 (Pilot Controlled Release)
            </p>
          </div>
          <button
            onClick={() => setLocale(locale === "en" ? "fr" : "en")}
            className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            {locale === "en" ? "Français" : "English"}
          </button>
        </div>

        <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
          {locale === "en" ? (
            <>
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Controlled External Pilot Scope</h2>
                <p>
                  These Terms govern participation in the controlled external pilot of Elevio Skills by Recyclean Ltd. Access is granted to authorized pilot companies and their enrolled employees for evaluation purposes.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Organization & Enrolment Responsibility</h2>
                <p>
                  Pilot company administrators are responsible for ensuring that enrolled employees are authorized roster members and that company contact information remains accurate.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Acceptable Use & Content Submission</h2>
                <p>
                  Users must not submit confidential medical, financial, customer, or unnecessary personal data in workplace action free-text submissions or evidence file uploads.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Disclaimers & Limitations</h2>
                <p>
                  Elevio Skills provides workplace sustainability training materials. The platform does not guarantee statutory ESG compliance, carbon refund eligibility, or HRDC accreditation during the pilot phase.
                </p>
              </section>

              <section className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900">
                <strong>Legal Notice:</strong> Final contractual terms require legal review by a qualified Mauritian legal professional. Contact: <em>support@recyclean.mu</em>.
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Portée du Pilote Externe Contrôlé</h2>
                <p>
                  Ces conditions régissent la participation au pilote externe contrôlé d'Elevio Skills par Recyclean Ltd. L'accès est accordé aux entreprises pilotes autorisées et à leurs employés.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Responsabilité de l'Organisation</h2>
                <p>
                  Les administrateurs des entreprises pilotes doivent s'assurer que les employés inscrits sont membres autorisés du personnel.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Utilisation Acceptable et Soumission de Contenu</h2>
                <p>
                  Les utilisateurs ne doivent pas soumettre de données médicales, financières ou confidentielles inutiles dans les commentaires ou fichiers de preuve.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Avertissements et Limitations</h2>
                <p>
                  Elevio Skills fournit des contenus de formation sur le développement durable. La plateforme ne garantit pas la conformité ESG statutaire ou le remboursement HRDC durant la phase pilote.
                </p>
              </section>

              <section className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900">
                <strong>Avis Légal :</strong> Les conditions contractuelles finales nécessitent l'examen par un professionnel du droit mauricien qualifié. Contact : <em>support@recyclean.mu</em>.
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
