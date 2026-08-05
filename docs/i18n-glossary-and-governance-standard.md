# Elevio Internationalisation (i18n) Terminology Glossary & Governance Standard

## Overview
This document establishes the official English and French translation governance standards for the Elevio B2B workplace learning platform. All future bilingual sprints (dashboards, reports, certificates, emails, and course content) must adhere to these terms.

---

## Central Terminology Glossary

| English Term | Standard French Translation | Mauritian Workplace Context Notes |
| :--- | :--- | :--- |
| **Course** | Cours | Short, self-paced practical workplace module. |
| **Learning pathway** | Parcours d'apprentissage | Structured sequence of courses leading to a certification. |
| **Prerequisite** | Prérequis | Required course completion prior to enrollment. |
| **Completion** | Achèvement / Fin de cours | Verified completion of all modules and quiz requirements. |
| **Certificate** | Certificat | Formal verifiable training credential. |
| **Digital Badge** | Badge numérique | Verifiable digital achievement badge. |
| **Challenge** | Défi | Workplace action task submitted for manager review. |
| **Under review** | En cours de vérification | Challenge submission awaiting manager/admin decision. |
| **Employee** | Employé | Learner enrolled in company training. |
| **Manager** | Manager / Responsable | Team manager reviewing employee challenges and commitments. |
| **Company administrator** | Administrateur entreprise | Admin managing corporate subscription and employee assignments. |
| **Sustainability** | Développement durable | Core corporate focus (avoid academic or vague translations). |
| **Environmental compliance** | Conformité environnementale | Legal and regulatory environmental standards. |
| **ESG** | ESG (Environnement, Social, Gouvernance) | Standard acronym widely understood in Mauritian B2B context. |
| **Report** | Rapport | Exportable compliance and training progress report. |
| **Training record** | Registre de formation | HRDC / compliance training evidence record. |
| **Awaiting Review** | En attente de revue | Challenge submission awaiting manager review. |
| **Approved** | Approuvé | Challenge submission approved by manager. |
| **Returned** | Retourné | Challenge submission returned for refinement. |
| **Audit-Ready** | Prêt pour audit | Formal training records suitable for HRDC or compliance audit. |

---

## Unchangeable Brand Touchpoints
- **Brand Name**: `Elevio` (Always preserved, never localized).
- **Brand Attribution**: `Elevio by Recyclean` / `operated by Recyclean Ltd.` (Preserved across all locales).
- **Slogan**: `Learn. Apply. Improve.` (Official English slogan preserved unless a French slogan is explicitly approved by instruction).
- **Currency**: `MUR` / `Rs` (Mauritian Rupees remain the sole currency; pricing values are fixed and never converted).

---

## Technical Locale Standards
- **English Locale Code**: `en`
- **French Locale Code**: `fr`
- **Fallback Rule**: Safe fallback to `en` if a French translation key is absent.
- **Resolution Order**:
  1. Authenticated User Profile Metadata (`preferredLanguage`)
  2. Unauthenticated LocalStorage (`elevio_language_preference`)
  3. Browser Language (`navigator.language`)
  4. English Default (`en`)
