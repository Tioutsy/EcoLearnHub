import React, { useState } from "react";

export interface NoticeModalProps {
  isOpen: boolean;
  noticeType: "company_pilot_notice" | "learner_privacy_notice" | "evidence_upload_notice";
  onAcknowledge: (noticeType: string, locale: "en" | "fr") => void;
}

export function NoticeModal({ isOpen, noticeType, onAcknowledge }: NoticeModalProps) {
  const [locale, setLocale] = useState<"en" | "fr">("en");

  if (!isOpen) return null;

  const isCompanyNotice = noticeType === "company_pilot_notice";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {isCompanyNotice
              ? (locale === "fr" ? "Notice Pilote Administrateur" : "Company Administrator Pilot Notice")
              : (locale === "fr" ? "Notice de Confidentialité Apprenant" : "Learner Privacy & Visibility Notice")}
          </h2>
          <button
            onClick={() => setLocale(locale === "en" ? "fr" : "en")}
            className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100"
          >
            {locale === "en" ? "Français" : "English"}
          </button>
        </div>

        <div className="text-slate-600 text-sm space-y-3 mb-6 max-h-80 overflow-y-auto pr-2">
          {isCompanyNotice ? (
            locale === "en" ? (
              <>
                <p>Welcome to the Elevio Skills controlled external company pilot.</p>
                <p><strong>Roster Management:</strong> As Company Administrator, you are responsible for enrolling authorized company employees and ensuring accurate department data.</p>
                <p><strong>Reporting Visibility:</strong> Your company dashboard provides aggregate and employee-level course completion and quiz score reports.</p>
                <p><strong>Support Channel:</strong> You can submit support requests or data export inquiries via the Support page at any time.</p>
              </>
            ) : (
              <>
                <p>Bienvenue dans le projet pilote contrôlé d'Elevio Skills.</p>
                <p><strong>Gestion du Personnel :</strong> En tant qu'administrateur, vous êtes responsable de l'inscription des employés autorisés.</p>
                <p><strong>Visibilité des Rapports :</strong> Votre tableau de bord fournit des rapports d'achèvement et de scores aux quiz.</p>
                <p><strong>Canal de Support :</strong> Vous pouvez soumettre vos demandes de support via la page de support à tout moment.</p>
              </>
            )
          ) : (
            locale === "en" ? (
              <>
                <p>Before starting your training, please review how your learning records are processed.</p>
                <p><strong>Company Visibility:</strong> Your company administrators and department managers can view your course progress, quiz completion, earned badges, and certificates.</p>
                <p><strong>Workplace Evidence:</strong> Please do not submit medical, financial, or confidential personal information in free-text comments or evidence uploads.</p>
                <p><strong>Certificates:</strong> Verified course certificates are issued in your name upon achieving an 80% pass mark.</p>
              </>
            ) : (
              <>
                <p>Avant de commencer votre formation, veuillez consulter la manière dont vos dossiers sont traités.</p>
                <p><strong>Visibilité Entreprise :</strong> Vos administrateurs et responsables peuvent consulter votre progression, vos résultats et vos certificats.</p>
                <p><strong>Éléments Justificatifs :</strong> Ne soumettez aucune information médicale, financière ou confidentielle inutile dans les commentaires ou fichiers.</p>
                <p><strong>Certificats :</strong> Des certificats vérifiés sont délivrés à votre nom avec une note minimale de 80%.</p>
              </>
            )
          )}
        </div>

        <button
          onClick={() => onAcknowledge(noticeType, locale)}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
        >
          {locale === "fr" ? "J'accepte et je continue" : "I Acknowledge & Continue"}
        </button>
      </div>
    </div>
  );
}

export default NoticeModal;
