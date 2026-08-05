# Full Platform Content Internationalisation (i18n) Architecture

## Overview & Vision
This document outlines the architecture for Elevio's full database-driven bilingual (English/French) platform delivery. Rather than wrapping components in ad-hoc translations or leaving dynamic course data in English when French is selected, Elevio provides structured locale objects (`LocalizedText = { en: string; fr: string }`) across static interface keys, course catalogue metadata, lesson player content blocks, quiz questions, certificates, reports, and transactional emails.

---

## 1. Multilingual Content Structure

### 1.1 Localized Content Model
The platform adopts the structured `en` / `fr` schema contract for dynamic content:

```typescript
export type LocalizedText = {
  en: string;
  fr: string;
};

export type LocalizedCourseContent = {
  en: {
    title: string;
    description: string;
    learningObjectives: string[];
    lessons: LocalizedLesson[];
    quiz: LocalizedQuizQuestion[];
    completionMessage: string;
  };
  fr: {
    title: string;
    description: string;
    learningObjectives: string[];
    lessons: LocalizedLesson[];
    quiz: LocalizedQuizQuestion[];
    completionMessage: string;
  };
};
```

---

## 2. API Locale Resolution Contract

### 2.1 Request Resolution Order
The backend resolves the request locale in the following order:
1. `locale` query parameter (e.g. `GET /api/courses/ELH-01?locale=fr`)
2. `Accept-Language` HTTP request header
3. Authenticated User Profile Metadata (`preferredLanguage`)
4. System Default (`en`)

---

## 3. System Safeguards & Assessment Integrity
1. **Course Code Stability**: Course codes (`ELH-01` through `ELH-29`), IDs, and database relations remain strictly language-neutral.
2. **Assessment Integrity**: Quiz option indexing, correct answer keys, pass thresholds (80%), and attempt limits are identical across `en` and `fr` to ensure identical scoring outcomes.
3. **Safe Fallback**: If a French string is absent during content resolution, the platform gracefully falls back to `en` and logs the event without crashing.
