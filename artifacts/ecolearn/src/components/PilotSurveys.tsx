import React, { useState } from "react";

export interface PilotSurveyProps {
  stage: "entry" | "completion" | "manager" | "admin";
  onSubmitted?: () => void;
}

export function PilotSurveys({ stage, onSubmitted }: PilotSurveyProps) {
  const [locale, setLocale] = useState<"en" | "fr">("en");
  const [submitted, setSubmitted] = useState(false);
  const [overallRating, setOverallRating] = useState(5);
  const [easeRating, setEaseRating] = useState(5);
  const [relevanceRating, setRelevanceRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (onSubmitted) onSubmitted();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-xl mx-auto">
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {stage === "entry" && (locale === "fr" ? "Sondage d'Entrée Apprenant" : "Learner Entry Survey")}
            {stage === "completion" && (locale === "fr" ? "Sondage de Fin de Parcours" : "Learner Completion Survey")}
            {stage === "manager" && (locale === "fr" ? "Évaluation Responsable / Manager" : "Manager Feedback Survey")}
            {stage === "admin" && (locale === "fr" ? "Évaluation Administrateur Pilote" : "Administrator Pilot Survey")}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Elevio Skills Controlled Pilot Feedback</p>
        </div>
        <button
          onClick={() => setLocale(locale === "en" ? "fr" : "en")}
          className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100"
        >
          {locale === "en" ? "Français" : "English"}
        </button>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center text-emerald-900 text-sm">
          <strong>{locale === "fr" ? "Merci pour votre retour !" : "Thank you for your feedback!"}</strong>
          <p className="mt-1 text-xs">{locale === "fr" ? "Vos réponses aident à améliorer Elevio Skills." : "Your responses help improve Elevio Skills."}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {locale === "fr" ? "Pertinence du contenu (1 à 5)" : "Content Relevance (1 to 5)"}
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRelevanceRating(num)}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                    relevanceRating === num ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {locale === "fr" ? "Facilité d'utilisation de la plateforme (1 à 5)" : "Platform Ease of Use (1 to 5)"}
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setEaseRating(num)}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                    easeRating === num ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {locale === "fr" ? "Commentaires & Suggestions" : "Comments & Suggestions"}
            </label>
            <textarea
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder={locale === "fr" ? "Partagez votre avis ou suggestions..." : "Share your feedback or suggestions..."}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500">
            <strong>Warning:</strong> Please do not submit medical, financial, or confidential company secrets.
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors"
          >
            {locale === "fr" ? "Soumettre l'évaluation" : "Submit Evaluation"}
          </button>
        </form>
      )}
    </div>
  );
}

export default PilotSurveys;
