# Elevio Role Model Standard

## 1. Overview
This standard defines the 4 canonical user roles operating within Elevio Skills by Recyclean.

---

## 2. Canonical Role Specification

### 1. `PLATFORM_ADMIN` (`platform_admin` / `super_admin`)
- **Purpose**: Global platform administration and customer operations.
- **Scope**: Multi-tenant platform-wide.
- **Data Access**: Universal read/write across all company organisations and global course catalogues.
- **Role Badge**: `Platform Administrator`

### 2. `COMPANY_ADMIN` (`company_admin` / `admin`)
- **Purpose**: Full organisation administrator for a specific enterprise client.
- **Scope**: Strict single-tenant (`companyId`).
- **Data Access**: Full management of company employees, departments, training assignments, compliance reports, subscription details, and org settings.
- **Role Badge**: `Company Administrator`

### 3. `MANAGER` (`manager`)
- **Purpose**: Supervisor leading a specific team or department.
- **Scope**: Single-tenant (`companyId`) restricted to assigned team/department scope.
- **Data Access**: Team progress reports, team course assignments, team challenge/action reviews, and team export packs. Cannot create/remove employees or modify company subscriptions.
- **Role Badge**: `Manager`

### 4. `LEARNER` (`employee` / `learner`)
- **Purpose**: Enterprise employee taking assigned sustainability training.
- **Scope**: Individual self-scope (`employeeId`).
- **Data Access**: Personal learning dashboard, course player, quiz attempts, workplace commitments, and personal certificate downloads.
- **Role Badge**: `Learner`
