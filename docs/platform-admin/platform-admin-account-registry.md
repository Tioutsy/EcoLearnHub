# Platform Admin Account Registry

## 1. Account & Organisation Establishment Workflow

### A. User Registration & Identity Binding
1. Users authenticate via Clerk (`@clerk/react`).
2. Upon API access, `getCompanyAccess(req)` resolves the user identity:
   - Primary check: Match Clerk `userId` in `employeesTable`.
   - Secondary check: Match authenticated `email` in `employeesTable`.
   - Admin bootstrap check: Email `slennon2206@gmail.com` resolves as `PLATFORM_ADMIN`.

### B. Organisation Creation & Membership
1. Company creation provisions a record in `companiesTable` with initial employee capacity band (e.g. Up to 25, 26-50, 51-80, 81-120, >120).
2. The initial registrant is assigned as `COMPANY_ADMIN` (`role = 'admin'` in `employeesTable`).
3. Additional employees joined or imported via CSV are bound to the company tenant (`companyId`).

### C. Account Health & Warnings Resolution
The platform automatically scans for operational anomalies:
- **Orphaned User**: User authenticated in Clerk without an assigned company record.
- **Missing Company Admin**: Active organisation without a designated `COMPANY_ADMIN`.
- **Incomplete Onboarding**: Organisation setup flag incomplete.
