const ADMIN_USER_IDS = [839339769];

export function isAdminUser(id: number | null | undefined): boolean {
  if (id == null) return false;
  return ADMIN_USER_IDS.includes(id);
}
