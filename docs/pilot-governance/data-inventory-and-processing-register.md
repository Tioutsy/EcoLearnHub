# Data Inventory & Processing Register (Sprint 10B)

## Executive Summary
This register documents all personal, company, learning, workplace action, and technical data fields captured across Elevio Skills.

---

## Data Category Processing Register

| Data category | Specific field | Source | Storage location | Purpose | Who can access | Retention proposal | Exportable | Correctable | Deletable | Legal review required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **3.1 Organisation** | Company Name | Admin input | `companies.name` | Tenant identification | Platform Admin, Company Admin | Duration of account + 7 yrs | Yes | Yes | Yes | Yes |
| **3.1 Organisation** | Sector / Industry | Admin input | `companies.industry` | Benchmarking | Platform Admin, Company Admin | Duration of account | Yes | Yes | Yes | No |
| **3.1 Organisation** | Employee Band | Subscription | `companies.max_employees` | Limit enforcement | Platform Admin, Company Admin | Duration of account | Yes | No | No | No |
| **3.2 Employee** | Full Name | Admin input | `employees.name` | Learner roster & certs | Company Admin, Manager, Self | Active employment + 5 yrs | Yes | Yes | Pseudonymisable | Yes |
| **3.2 Employee** | Email Address | Admin input | `employees.email` | Auth & notifications | Company Admin, Self | Active employment + 5 yrs | Yes | Yes | Yes | Yes |
| **3.2 Employee** | Role / Dept | Admin input | `employees.role` / `dept` | Access control & filtering | Company Admin, Manager, Self | Active employment | Yes | Yes | Yes | No |
| **3.2 Employee** | Clerk User ID | Clerk Auth | `employees.clerk_user_id` | Authentication binding | System / Platform Admin | Active employment | Yes | No | Yes | No |
| **3.3 Learning** | Enrolment & Progress | System | `enrollments` | Progress tracking | Company Admin, Manager, Self | 7 years (Audit compliance) | Yes | No | Pseudonymisable | Yes |
| **3.3 Learning** | Quiz Scores & Attempts | Assessment | `quiz_attempts` | Evaluation & scoring | Company Admin, Manager, Self | 7 years (Audit compliance) | Yes | No | Pseudonymisable | Yes |
| **3.3 Learning** | Certificate Details | Generator | `certificates` | Verification & credentials | Public (with code), Admin, Self | Permanent verification | Yes | Correctable | Pseudonymisable | Yes |
| **3.4 Action / Evidence** | Commitment Text | Learner input | `learner_commitments` | Workplace action tracking | Company Admin, Manager, Self | 3 years | Yes | Yes | Yes | No |
| **3.4 Action / Evidence** | Evidence File Uploads | Learner upload | Disk / Storage | Proof of workplace action | Company Admin, Manager, Self | 3 years | Yes | No | Yes | Yes |
| **3.5 Technical** | Audit Logs | System | `audit_logs` | Security & traceability | Platform Admin, Company Admin | 1 year | Yes | No | No | No |
