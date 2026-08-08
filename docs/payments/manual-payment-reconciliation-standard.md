# Manual Payment Reconciliation Standard

## 1. Governance Rules
Manual payment reconciliation is restricted to authorized **Platform Administrators** (`platform_admin`).
- **Use Case**: Offline bank transfers (MCB Juice / interbank Wire).
- **Audit Fields Required**: `subscriptionId`, `companyId`, `agreedMonthlyAmount`, `paymentReference`, `reconciledBy`, `reconciledAt`.
- **Replay Protection**: Duplicate references are rejected.
