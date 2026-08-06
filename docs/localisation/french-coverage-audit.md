# Elevio Skills French Coverage Audit & Inventory

## Overview
This audit matrix tracks visible user-facing interface copy, static pages, course content, certificates, reports, and emails across Elevio Skills.

---

## 1. Localisation Inventory Matrix

| Area | Page / Component | English Strings Status | French Coverage Status | Source Type | Priority | Action Taken / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Public** | Home Page | Verified | Complete (100%) | Translation Keys / JSX | P1 | Translated hero, stats, & CTA sections |
| **Public** | Pricing | Verified | Complete (100%) | Translation Keys | P1 | Preserved MUR tier prices with French labels |
| **Public** | Course Catalogue Preview | Verified | Complete (100%) | Translation Keys / API | P1 | Locale-aware API resolution |
| **Authentication** | Sign In / Up Shell | Verified | Complete (100%) | Translation Keys | P1 | Shell translated (Clerk widget vendor-controlled) |
| **Learner** | Dashboard | Verified | Complete (100%) | Translation Keys / API | P1 | Overview metrics, overdue alerts, & CTAs |
| **Learner** | Course Catalogue | Verified | Complete (100%) | Translation Keys / API | P1 | Category filters & course card metadata |
| **Learner** | Course Details | Verified | Complete (100%) | Translation Keys / API | P1 | Objectives, level, duration, & prerequisites |
| **Learner** | Course Player | Verified | Complete (100%) | Translation Keys / API | P1 | Module nav, lesson controls, & commitment prompts |
| **Learner** | Quiz Shell & Results | Verified | Complete (100%) | Translation Keys / API | P1 | Question counters, score screens, & feedback |
| **Learner** | Completion & Certificates | Verified | Complete (100%) | Translation Keys / PDF | P1 | PDF generator supports `fr` & `en` locales |
| **Admin** | Company Overview | Verified | Complete (100%) | Translation Keys | P1 | Summary cards & completion rate metrics |
| **Admin** | Employee Management | Verified | Complete (100%) | Translation Keys | P1 | Roster table, modals, & status tags |
| **Admin** | Course Assignments | Verified | Complete (100%) | Translation Keys | P1 | Assignment modals & due-date pickers |
| **Admin** | Reports & Exports | Verified | Complete (100%) | Translation Keys / CSV | P1 | Localized headers & PDF evidence export |
| **Admin** | Challenge Reviews | Verified | Complete (100%) | Translation Keys | P1 | Review drawer, status filters, & evidence notes |
| **Manager** | Team Progress | Verified | Complete (100%) | Translation Keys | P1 | Team metrics & employee progress tables |
| **Shared** | Navbar & Mobile Nav | Verified | Complete (100%) | Translation Keys | P1 | ELEVIO SKILLS By Recyclean lockup & links |
| **Shared** | Footer | Verified | Complete (100%) | Translation Keys | P1 | Operator notice & link list |
| **Shared** | Modals & Dialogs | Verified | Complete (100%) | Translation Keys | P1 | Title, body text, & action buttons |
| **Shared** | Toasts & Alerts | Verified | Complete (100%) | Translation Keys | P1 | Toast notifications & validation alerts |
| **Shared** | Empty States | Verified | Complete (100%) | Translation Keys | P1 | Icon captions & primary actions |
| **Shared** | Validation Messages | Verified | Complete (100%) | Translation Keys | P1 | Form field requirement notices |

---

## 2. Course Content Localisation Status (ELH-01 to ELH-29)
- **Option A Implemented**: Course metadata, learning objectives, lesson content, scenarios, and quiz questions are served in French when `fr` is requested via query parameter (`?locale=fr`) or `Accept-Language` header.
- **Pilot Courses Verified**: `ELH-01` (Foundations), `ELH-02` (Waste Sorting), and `ELH-03` (Energy Efficiency) fully tested in French.
