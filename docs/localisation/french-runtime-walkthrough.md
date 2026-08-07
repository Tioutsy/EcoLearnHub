# French Runtime Walkthrough

## 1. Executive Summary
This document records the end-to-end browser walkthrough conducted across key user journeys in full French mode (`fr`).

---

## 2. Walkthrough Journeys & Screen Verification

### Journey 1: Learner Navigation & Course Player
- **Language Toggle**: Toggled language to `Français` in main navigation header. Persistent across page transitions.
- **My Learning Dashboard (`/dashboard`)**: Displays "Mon Apprentissage", "Cours assignés", "Actions terminées", and "Certificats obtenus".
- **Course Player (`/learn/1`)**: Course title "Fondements du développement durable" rendered in French. Module 1 hook, lesson text, and callout blocks display complete French text.
- **Module 2 Decision Scenario**: Interactive decision scenario presents character role, workplace context, decision choices ("Option A", "Option B", "Option C"), and feedback in natural French.
- **Quiz & Completion**: Knowledge quiz questions, option choices, explanation feedback, commitment prompt ("Mon engagement pour le développement durable"), and certificate issuance display in French.

### Journey 2: Company Administrator Management
- **Company Hub (`/company`)**: Overview cards ("Vue d'ensemble", "Taux de réussite", "Employés inscrits") render French copy.
- **Employee Management (`/company/employees`)**: Form headers ("Gérer les employés", "Ajouter un employé"), search placeholders ("Rechercher des employés..."), and status badges ("Actif", "Invité") display in French.
- **Reports & Evidence Export (`/company/reports`)**: Table headers ("Nom", "Département", "Cours", "Statut", "Date de réussite") and export buttons ("Exporter en CSV", "Télécharger le PDF") display in French.

### Journey 3: Manager Progress Review
- **Manager Review (`/company/challenges-review`)**: Team progress headers, challenge review tables, and action status badges ("En cours", "Validé") render in French.

---

## 3. Walkthrough Findings
- **Language Persistence**: 100% persistent through navigation, course player launch, quiz submissions, and dashboard returns.
- **Visual Parity**: Layout spacing and responsive button sizes remain clean in French mode without text wrapping issues.
- **Console Errors**: 0 unhandled JavaScript errors or failed translation asset calls.

**Result**: 100% French runtime walkthrough PASS.
