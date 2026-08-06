import React, { useState } from "react";

export function PrivacyPage() {
  const [locale, setLocale] = useState<"en" | "fr">("en");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex justify-between items-center pb-6 mb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {locale === "fr" ? "Politique de Confidentialité" : "Privacy Policy"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Elevio Skills by Recyclean Ltd. — Version 1.0 (Pilot Release)
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
                <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Overview & Platform Operator</h2>
                <p>
                  Elevio Skills is operated by <strong>Recyclean Ltd.</strong> ("we", "us", "our"). This Privacy Notice explains how personal data, learning records, and evidence submissions are processed during our controlled company pilot.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Information We Collect</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Account & Roster Data:</strong> Full name, corporate email address, department, job title, and assigned role.</li>
                  <li><strong>Learning Progress & Assessment Data:</strong> Course enrolments, lesson completion status, quiz scores, attempt counts, and earned certificates.</li>
                  <li><strong>Workplace Action Submissions:</strong> Selected commitments, free-text implementation comments, and manager review notes.</li>
                  <li><strong>Technical & Access Metadata:</strong> Timestamped login events, language preferences, and server-side notice acknowledgements.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">3. How Your Information Is Used</h2>
                <p>
                  Your information is processed to deliver workplace sustainability training, verify course completion, generate certificates, and provide authorized company administrators with training progress reports.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Data Access & Tenant Isolation</h2>
                <p>
                  Elevio Skills enforces strict multi-tenant data isolation. Authorized company administrators and department managers can only view training records for employees within their own organization.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Data Retention & Employee Departure</h2>
                <p>
                  When an employee account is deactivated, login access is revoked immediately, while historical course completions and certificate records are retained for audit and compliance reporting.
                </p>
              </section>

              <section className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900">
                <strong>Mauritian Legal Disclaimer:</strong> While Elevio Skills follows standard data privacy guidelines, final formal contractual and regulatory compliance requires review by a qualified Mauritian legal professional. Registered office details: <em>[Insert registered office address before public launch]</em>.
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Aperçu et Opérateur de la Plateforme</h2>
                <p>
                  Elevio Skills est exploité par <strong>Recyclean Ltd.</strong> (« nous »). Cette politique de confidentialité explique comment les données personnelles, les dossiers d'apprentissage et les éléments justificatifs sont traités pendant notre projet pilote d'entreprise.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Informations Collectées</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Données de Compte et Roster :</strong> Nom complet, adresse e-mail professionnelle, département, titre de poste et rôle attribué.</li>
                  <li><strong>Données de Progrès et d'Évaluation :</strong> Inscriptions aux cours, statut de complétion, scores aux quiz, nombre de tentatives et certificats obtenus.</li>
                  <li><strong>Soumissions d'Actions en Entreprise :</strong> Engagements sélectionnés, commentaires d'application et remarques des responsables.</li>
                  <li><strong>Métadonnées Techniques :</strong> Événements de connexion horodatés, préférences linguistiques et confirmations de notices.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Utilisation de Vos Informations</h2>
                <p>
                  Vos informations sont traitées pour dispenser les formations sur le développement durable, vérifier la réussite des cours, générer des certificats et fournir aux administrateurs autorisés des rapports de formation.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Accès aux Données et Isolation des Entreprises</h2>
                <p>
                  Elevio Skills applique une isolation stricte des données entre les entreprises. Les administrateurs et responsables autorisés ne peuvent consulter que les dossiers des employés de leur propre organisation.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Conservation des Données et Départ d'un Employé</h2>
                <p>
                  Lorsqu'un compte employé est désactivé, l'accès à la connexion est immédiatement révoqué, tandis que l'historique des cours suivis et des certificats est conservé à des fins d'audit et de conformité.
                </p>
              </section>

              <section className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900">
                <strong>Avertissement Légal Mauricien :</strong> Bien qu'Elevio Skills suive les normes de confidentialité des données, la conformité réglementaire finale nécessite l'examen par un professionnel du droit mauricien qualifié. Adresse du siège social : <em>[Insert registered office address before public launch]</em>.
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
