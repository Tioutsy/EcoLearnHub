# Final Production Route Inventory

## 1. Active Application Routes

| Route | Access Type | Intended Role | Primary Purpose | CTA / Link | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Public | Visitor | Platform introduction | Pricing / Courses | **ACTIVE** |
| `/pricing` | Public | Buyer | Employee band pricing selection | Subscribe / Contact | **ACTIVE** |
| `/courses` | Public / Auth | Visitor / Learner | Workplace course catalogue | View details | **ACTIVE** |
| `/courses/:id` | Public / Auth | Visitor / Learner | Course curriculum view | Enroll / Start | **ACTIVE** |
| `/company/subscribe` | Auth | Company Admin | Company setup & subscription request | Confirm | **ACTIVE** |
| `/company` | Protected | Company Admin | Company dashboard & subscription status | Manage Employees | **ACTIVE** |
| `/company/employees` | Protected | Company Admin | Employee provisioning & invites | Add Employee | **ACTIVE** |
| `/company/reports` | Protected | Company Admin | Corporate LMS reporting & ESG download | Download PDF | **ACTIVE** |
| `/learn/:enrollmentId` | Protected | Learner | Course player & lesson interface | Next / Quiz | **ACTIVE** |
| `/certificates` | Protected | Learner | Awarded certificates | Download | **ACTIVE** |
| `/platform-admin` | Protected | Platform Admin | System overview & organisations | Manage | **ACTIVE** |
