# Elevio Skills Official Role & Permission Matrix (Sprint 10K)

## Executive Summary
This document specifies the official role and capability matrix across **Platform Administrator**, **Company Administrator**, **Manager**, and **Learner**.

---

## 1. Official Role Definitions

- **Platform Administrator (`platform_admin`)**: Internal Elevio Skills platform team. Manages catalog, overall platform operations, and cross-organisation diagnostics.
- **Company Administrator (`company_admin`)**: Authorised administrator for a subscribing organisation. Manages company employees, assignments, company-wide reports, and organisation settings.
- **Manager (`manager`)**: Department or team supervisor. Views assigned team progress, reviews workplace challenges, and monitors team completion.
- **Learner (`employee`)**: Individual learner. Completes assigned training, takes quizzes, views personal progress, and downloads certificates.

---

## 2. Capability Matrix

| Capability | Description | Platform Admin | Company Admin | Manager | Learner |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `employees.view` | View company employee list | **YES** | **YES** | Team Only | Self Only |
| `employees.create` | Add / invite new employees | **YES** | **YES** | NO | NO |
| `employees.edit` | Edit employee details & roles | **YES** | **YES** | NO | NO |
| `employees.deactivate` | Deactivate / remove employee | **YES** | **YES** | NO | NO |
| `courses.assign` | Assign courses to employees | **YES** | **YES** | Team Only | NO |
| `reports.organisation` | View company-wide reports | **YES** | **YES** | NO | NO |
| `reports.team` | View team progress reports | **YES** | **YES** | **YES** | NO |
| `settings.organisation`| Manage company settings | **YES** | **YES** | NO | NO |
| `certificates.download` | Download certificates | **YES** | **YES** | Team Only | Self Only |
| `platform.admin` | Access platform dashboard | **YES** | NO | NO | NO |
