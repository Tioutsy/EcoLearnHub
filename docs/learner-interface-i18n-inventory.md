# Elevio Learner Interface Internationalisation (i18n) Inventory

## Overview
This document details the learner-facing interface audit conducted during **Sprint 9W**. It accounts for all learner-visible routes, shared layout elements, and components, explicitly categorizing interface copy vs. educational course content and third-party hosted elements.

---

## Learner-Facing Route & Component Inventory Matrix

| Route / Component | Learner-Visible Strings Found | Translation Status | Excluded Content | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Navbar (`Navbar.tsx`)** | Courses, Challenges, Mauritius Resources, Impact, Pricing, My Learning, Company, Sign In, Get Started | **Translated (Sprint 9V & 9W)** | N/A | Features desktop & mobile `LanguageSelector` |
| **Footer (`Footer.tsx`)** | Tagline, Operator Notice (*Elevio by Recyclean*), Column Headers, Copyright | **Translated (Sprint 9V & 9W)** | N/A | Preserves legal operator notice |
| **Sign-In / Sign-Up (`App.tsx`)** | Application wrappers, redirect links, auth headers | **Translated** | Clerk-hosted widget text | Third-party Clerk hosted widget text is preserved; app wrapper labels translated |
| **Learner Dashboard (`dashboard/index.tsx`)** | My Sustainability Learning, Active Courses, Certificates Earned, Avg. Progress, Recommended Next Course, Continue Learning | **Translated (Sprint 9W)** | Course titles, dynamic employee names | Uses parameter interpolation `{name}`, `{date}` |
| **Course Catalogue (`courses/index.tsx`)** | Search placeholder, Filter buttons, Ready to start, Prerequisites required, Available in English | **Translated (Sprint 9V & 9W)** | Course titles, descriptions | Preserves English course notice badge |
| **Course Details (`courses/detail.tsx`)** | Course overview headings, Duration, Level, Category, Prerequisites, Start Course button | **Translated (Sprint 9W)** | Course learning objectives body text | Interface controls translated |
| **Lesson Player (`learn/index.tsx` & `DatabaseCoursePlayer.tsx`)** | Module counter, Next/Previous buttons, Progress % complete, Exit Course, Autosaved notice | **Translated (Sprint 9W)** | Educational lesson text, scenarios, narration | Audio/text lesson bodies remain in English by design |
| **Quiz Shell (`quiz/index.tsx`)** | Final Knowledge Check, Question counter, Submit Quiz, Retry Assessment, Score summary, Congratulations! | **Translated (Sprint 9W)** | Quiz question stems, multiple-choice options, feedback text | Interface controls & score messages translated |
| **Certificates (`certificates/index.tsx`)** | My Certificates, View & Download qualifications, Issued date, Verify Code, Download PDF button | **Translated (Sprint 9W)** | Course titles on certificates | Preserves `Elevio by Recyclean` PDF header lockup |
| **404 & Error States (`not-found.tsx`)** | 404 Page Not Found, Network error, Something went wrong, Try again | **Translated (Sprint 9V & 9W)** | Technical stack traces | Friendly translated error fallback screens |

---

## Content Scope Classification Summary

1. **Interface Text**: 100% translated into English and French.
2. **Educational Course Content (`ELH-01` to `ELH-29`)**: Excluded from Sprint 9W by design (remains in English, clearly labeled with `Course available in English` / `Cours disponible en anglais`).
3. **Third-Party Hosted Text (Clerk Auth Widget)**: Preserved under vendor control.
4. **Dynamic Database Values**: (Employee names, course codes, completion timestamps) rendered dynamically via interpolation.
