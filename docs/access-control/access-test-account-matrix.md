# Access Test Account Matrix

## 1. Executive Summary
This document specifies the synthetic non-production test accounts used for automated and manual access control testing.

---

## 2. Test Account Register

| Identity Alias | System Role | Company Context | Purpose |
| :--- | :--- | :--- | :--- |
| `platform-admin-test` | `PLATFORM_ADMIN` | Global | Multi-tenant audit and global catalogue verification |
| `company-alpha-admin` | `COMPANY_ADMIN` | Test Company Alpha (`101`) | Admin workflow, employee management, org settings |
| `company-alpha-manager`| `MANAGER` | Test Company Alpha (`101`) | Team progress monitoring, team course assignment |
| `company-alpha-learner`| `LEARNER` | Test Company Alpha (`101`) | Individual learning player, personal certificates |
| `company-beta-admin` | `COMPANY_ADMIN` | Test Company Beta (`102`) | Cross-tenant security isolation verification |
| `company-beta-manager` | `MANAGER` | Test Company Beta (`102`) | Cross-tenant team scope isolation verification |
| `company-beta-learner` | `LEARNER` | Test Company Beta (`102`) | Cross-tenant learner record isolation verification |
