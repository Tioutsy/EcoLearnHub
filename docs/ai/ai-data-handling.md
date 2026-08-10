# AI Data Handling & Privacy Standard — Sprint AI-01

## 1. Overview & Data Minimisation Principle
ELEVIO SKILLS uses an AI Recommendation Engine to assist Company Administrators in selecting relevant sustainability training for employees based on workplace roles and corporate learning priorities.

In compliance with strict data privacy guidelines, **no Personally Identifiable Information (PII) is ever transmitted to external AI service providers.**

---

## 2. Data Transmission Matrix

| Data Item | Transmitted to AI Provider? | Format / Detail | Reason / Purpose |
| :--- | :---: | :--- | :--- |
| **Employee Full Name** | ❌ **NO** | Never sent | Privacy protection |
| **Employee Email Address** | ❌ **NO** | Never sent | Privacy protection |
| **Employee ID / DB Record Keys** | ❌ **NO** | Never sent | Privacy protection |
| **Authentication Tokens / Secrets** | ❌ **NO** | Never sent | Security enforcement |
| **Organization Internal Notes** | ❌ **NO** | Never sent | Data confidentiality |
| **Company Industry / Sector** | ✅ YES | Generic string (e.g. `Hospitality`) | Industry relevance |
| **Company Employee Capacity Band** | ✅ YES | Generic label (e.g. `1-25`) | Organization scale context |
| **Company Training Priorities** | ✅ YES | Selected topics (e.g. `energy_efficiency`, `water_conservation`) | Contextual alignment |
| **Employee Department** | ✅ YES | Generic department name (e.g. `Facilities`) | Role relevance |
| **Employee Broad Role Category** | ✅ YES | Generic category (e.g. `Operations`) | Role relevance |
| **Completed Course Codes** | ✅ YES | Array of course codes (e.g. `["ELH-01"]`) | Exclude duplicate training |
| **Active Catalogue Metadata** | ✅ YES | ID, Code, Title, Description, Level, Prerequisites | Grounding recommendations in real database courses |

---

## 3. AI Provider & Security Configuration

* **Provider**: Google Gemini API (`gemini-1.5-flash` / `gemini-2.5-flash`).
* **API Credentials**: Managed strictly server-side via `GEMINI_API_KEY` environment variable. Never exposed to browser or client bundles.
* **Data Retention Assumptions**: Requests sent via API are zero-retention / non-training standard requests per AI provider enterprise policies.
* **System Prompt Scope Guard**: The system prompt strictly limits response scope to recommending existing ELEVIO SKILLS catalogue courses, prohibiting course creation, legal advice, ESG compliance claims, or autonomous execution.

---

## 4. Fallback & Failure Behaviour
* **API Key Missing / Provider Down / Timeout**: The application seamlessly falls back to a deterministic rule-based recommendation algorithm operating entirely inside the local server process.
* **Service Availability Guarantee**: AI service unavailability will **never** interrupt or block training assignments, company onboarding, or learner access.
