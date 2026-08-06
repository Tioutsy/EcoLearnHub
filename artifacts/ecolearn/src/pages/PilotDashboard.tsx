import React, { useState } from "react";

export function PilotDashboardPage() {
  const [locale, setLocale] = useState<"en" | "fr">("en");

  // Mock Pilot Metrics
  const metrics = {
    companyName: "Lux Resorts Mauritius (Pilot Slot 1)",
    status: "active",
    totalEmployees: 80,
    activatedEmployees: 68,
    completionRatePct: 88,
    averageQuizScorePct: 87,
    certificatesIssued: 62,
    actionsSubmitted: 60,
    feedbackCount: 45,
    openIssues: 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
              Controlled External Pilot Dashboard
            </span>
            <h1 className="text-3xl font-bold text-slate-900">{metrics.companyName}</h1>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setLocale(locale === "en" ? "fr" : "en")}
              className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              {locale === "en" ? "Français" : "English"}
            </button>
            <span className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider">
              {metrics.status}
            </span>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500">{locale === "fr" ? "Apprenants Activés" : "Activated Learners"}</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.activatedEmployees} / {metrics.totalEmployees}</p>
            <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">85% Activation Rate</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500">{locale === "fr" ? "Taux de Complétion" : "Completion Rate"}</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.completionRatePct}%</p>
            <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">Exceeds 70% Target</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500">{locale === "fr" ? "Score Moyen Quiz" : "Average Quiz Score"}</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.averageQuizScorePct}%</p>
            <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">80%+ Pass Mark Target</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500">{locale === "fr" ? "Certificats Délivrés" : "Certificates Issued"}</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.certificatesIssued}</p>
            <span className="text-xs text-slate-500 mt-1 inline-block">Verified PDF Badges</span>
          </div>
        </div>

        {/* Workplace Action & Survey Feedback Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {locale === "fr" ? "Engagement sur le Lieu de Travail" : "Workplace Action Commitments"}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">{locale === "fr" ? "Engagements Soumis" : "Submitted Commitments"}</span>
                <span className="font-bold text-slate-900">{metrics.actionsSubmitted}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">{locale === "fr" ? "Approbations Responsables" : "Manager Approvals"}</span>
                <span className="font-bold text-emerald-600">55 Approved (91.6%)</span>
              </div>
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                Notice: All workplace action submissions and manager reviews represent self-reported participation metrics.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {locale === "fr" ? "Évaluations & Retours Pilote" : "Pilot Feedback & Satisfaction"}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">{locale === "fr" ? "Nombre d'Évaluations" : "Total Survey Responses"}</span>
                <span className="font-bold text-slate-900">{metrics.feedbackCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">{locale === "fr" ? "Note Moyenne Pertinence" : "Average Content Relevance"}</span>
                <span className="font-bold text-emerald-600">4.7 / 5.0</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">{locale === "fr" ? "Incidents / Tickets Ouverts" : "Open Issues"}</span>
                <span className="font-bold text-slate-900">{metrics.openIssues} Open</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PilotDashboardPage;
