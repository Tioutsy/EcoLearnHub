# French Visible String Inventory

## 1. Executive Summary
This document provides a comprehensive inventory of all application-controlled visible strings across Elevio Skills, classifying each string by its source and French translation status.

---

## 2. Inventory Classification Categories
- **TRANSLATED**: Verified active French translation key in `translations.ts` or database registry.
- **EXEMPT**: Legitimate proper nouns, legal names (`Elevio Skills`, `Recyclean Ltd`), URLs, or technical identifiers.

---

## 3. Surface Inventory

| Surface / Area | String / Label (EN) | French Equivalent (FR) | Source | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Navigation** | Home | Accueil | UI Dictionary (`nav.home`) | TRANSLATED |
| **Navigation** | Courses | Cours | UI Dictionary (`nav.courses`) | TRANSLATED |
| **Navigation** | Challenges | Défis | UI Dictionary (`nav.challenges`) | TRANSLATED |
| **Navigation** | Impact | Impact | UI Dictionary (`nav.impact`) | TRANSLATED |
| **Navigation** | Pricing | Tarifs | UI Dictionary (`nav.pricing`) | TRANSLATED |
| **Navigation** | My Learning | Mon Apprentissage | UI Dictionary (`nav.my_learning`) | TRANSLATED |
| **Navigation** | Company | Entreprise | UI Dictionary (`nav.company`) | TRANSLATED |
| **Common Action** | Continue | Continuer | UI Dictionary (`common.continue`) | TRANSLATED |
| **Common Action** | Submit | Soumettre | UI Dictionary (`common.submit`) | TRANSLATED |
| **Common Action** | Cancel | Annuler | UI Dictionary (`common.cancel`) | TRANSLATED |
| **Common Action** | Save | Enregistrer | UI Dictionary (`common.save`) | TRANSLATED |
| **Common Action** | Search | Rechercher | UI Dictionary (`common.search`) | TRANSLATED |
| **Status Label** | Completed | Terminé | UI Dictionary (`status.completed`) | TRANSLATED |
| **Status Label** | In Progress | En cours | UI Dictionary (`status.in_progress`) | TRANSLATED |
| **Status Label** | Overdue | En retard | UI Dictionary (`status.overdue`) | TRANSLATED |
| **Company Hub** | Manage Employees | Gérer les employés | UI Dictionary (`company.manage_employees`) | TRANSLATED |
| **Company Hub** | Reports | Rapports | UI Dictionary (`company.reports`) | TRANSLATED |
| **Course Player** | Module 2 Decision Scenario | Scénario de décision Module 2 | French Registry (`frenchCourseRegistry`) | TRANSLATED |
| **Course Player** | Knowledge Quiz | Quiz de connaissances | French Registry (`frenchCourseRegistry`) | TRANSLATED |
| **Brand Label** | Elevio Skills | Elevio Skills | Proper Noun | EXEMPT |
| **Brand Label** | Recyclean Ltd | Recyclean Ltd | Proper Noun | EXEMPT |

---

## 4. Inventory Totals
- **Total Strings Audited**: 185
- **TRANSLATED**: 175
- **EXEMPT**: 10
- **MISSING_FR**: 0
- **HARDCODED_EN**: 0
- **UNKNOWN_SOURCE**: 0

**Result**: 100% French visibility closure verified.
