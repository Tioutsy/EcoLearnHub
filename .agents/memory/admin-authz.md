---
name: Super admin authorization
description: How privileged platform-wide endpoints are gated in EcoLearn
---

# Super admin authorization

Privileged endpoints that expose platform-wide business data or contact PII
(e.g. `GET /api/admin/analytics`, `GET /api/leads`) are gated by Clerk role,
not just authentication.

**Rule:** after `getAuth(req)` 401 check, fetch the user with
`clerkClient.users.getUser(userId)` and return 403 unless
`user.publicMetadata?.role === "super_admin"`. Frontend mirrors this with
`useUser()` + `user?.publicMetadata?.role === "super_admin"` to gate nav links
and page rendering, and disables the data query (`enabled`) for non-admins.

**Why:** architect flagged that authn-only gating let any signed-in user read
revenue/cross-company analytics and lead PII. Authz must be enforced
server-side, not just hidden in the UI.

**How to apply:** to provision an admin, set `publicMetadata.role` to
`super_admin` on the user in the Clerk dashboard. No employees in the DB carry
a `clerk_user_id`, so DB `employees.role` is NOT a reliable source for
app-user authorization.
