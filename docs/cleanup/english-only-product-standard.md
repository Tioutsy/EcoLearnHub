# English-Only Product Standard

## 1. Overview
This standard establishes **English** as the single canonical language for Elevio Skills by Recyclean across all runtime interfaces, API responses, course contents, and generated evidence documents.

---

## 2. Product Copy Principles
1. **Single Source of Truth**: All UI components, navigation links, forms, buttons, dialogs, toasts, error messages, and table column headers utilize direct, clean English text.
2. **Zero Multilingual Overhead**: No translation lookup functions (`t("key")`), locale context providers (`LanguageProvider`), or runtime language switching calculations are performed during rendering.
3. **Course Content Integrity**: All 29 courses (ELH-01 through ELH-29) render canonical English metadata, lesson bodies, Module 2 decision scenarios, knowledge quizzes, and completion certificates.
