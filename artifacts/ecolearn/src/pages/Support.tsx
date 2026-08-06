import React, { useState } from "react";

export function SupportPage() {
  const [locale, setLocale] = useState<"en" | "fr">("en");
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState("login");
  const [severity, setSeverity] = useState("medium");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex justify-between items-center pb-6 mb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {locale === "fr" ? "Support Pilote & Assistance Data" : "Pilot Support & Incident Request"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Elevio Skills by Recyclean Ltd.
            </p>
          </div>
          <button
            onClick={() => setLocale(locale === "en" ? "fr" : "en")}
            className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            {locale === "en" ? "Français" : "English"}
          </button>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-emerald-900">
            <h2 className="text-lg font-semibold mb-2">
              {locale === "fr" ? "Demande envoyée avec succès !" : "Support Request Submitted Successfully!"}
            </h2>
            <p className="text-sm">
              {locale === "fr"
                ? "Notre équipe de support étudiera votre demande et vous répondra dans les plus brefs délais."
                : "Our pilot support team has received your ticket and will respond shortly."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {locale === "fr" ? "Catégorie de la demande" : "Support Category"}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="login">{locale === "fr" ? "Problème de connexion ou d'invitation" : "Login or Invitation Issue"}</option>
                <option value="access">{locale === "fr" ? "Accès aux cours & progression" : "Course Access or Progress Saving"}</option>
                <option value="certificate">{locale === "fr" ? "Téléchargement de certificat" : "Certificate Issue"}</option>
                <option value="privacy">{locale === "fr" ? "Demande de données / Confidentialité" : "Data Correction or Privacy Request"}</option>
                <option value="security">{locale === "fr" ? "Signalement de sécurité / Incident" : "Security Issue or Suspected Data Exposure"}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {locale === "fr" ? "Niveau de sévérité" : "Severity Level"}
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="low">Low — Minor suggestion / copy tweak</option>
                <option value="medium">Medium — Significant issue with workaround</option>
                <option value="high">High — Pilot blocking issue for multiple users</option>
                <option value="critical">Critical — Security or data access concern</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {locale === "fr" ? "Description du problème" : "Description of Issue"}
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={locale === "fr" ? "Décrivez votre problème en détail..." : "Describe the issue or request in detail..."}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg text-xs text-slate-600">
              <strong>Notice:</strong> Please do not include passwords, credit card numbers, medical data, or confidential company secrets in support messages.
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 text-white font-medium bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
            >
              {locale === "fr" ? "Envoyer la demande" : "Submit Support Ticket"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default SupportPage;
