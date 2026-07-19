export function isPlatformAdmin(user: any): boolean {
  const role = user?.publicMetadata?.role;
  return role === "platform_admin" || role === "super_admin";
}

export function isCompanyAdmin(user: any): boolean {
  const role = user?.publicMetadata?.role;
  return role === "company_admin" || role === "admin" || role === "manager";
}
