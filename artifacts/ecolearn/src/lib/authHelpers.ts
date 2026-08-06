export type UserRole = "platform_admin" | "company_admin" | "manager" | "employee";

export function getRawRole(user: any): string | null {
  return (
    user?.publicMetadata?.role ??
    user?.metadata?.role ??
    user?.role ??
    null
  );
}

export function isPlatformAdmin(user: any): boolean {
  const role = getRawRole(user);
  return role === "platform_admin" || role === "super_admin";
}

export function isCompanyAdmin(user: any): boolean {
  const role = getRawRole(user);
  return role === "company_admin" || role === "admin";
}

export function isManager(user: any): boolean {
  const role = getRawRole(user);
  return role === "manager";
}

export function isLearner(user: any): boolean {
  const role = getRawRole(user);
  return role === "employee" || role === "learner" || (!isPlatformAdmin(user) && !isCompanyAdmin(user) && !isManager(user));
}

export function getUserRoleLabel(user: any): string {
  if (isPlatformAdmin(user)) return "Platform Administrator";
  if (isCompanyAdmin(user)) return "Company Administrator";
  if (isManager(user)) return "Manager";
  return "Learner";
}

export function hasCapability(user: any, capability: string): boolean {
  if (isPlatformAdmin(user)) return true;
  if (isCompanyAdmin(user)) return true;
  if (isManager(user)) {
    return [
      "employees.view",
      "reports.team",
      "certificates.download",
      "courses.assign",
      "challenges.review",
    ].includes(capability);
  }
  return ["certificates.download"].includes(capability);
}
