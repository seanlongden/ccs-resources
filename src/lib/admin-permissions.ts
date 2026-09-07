import type { AdminRecord, AdminPermissions } from './admin-auth';

/** Throws FORBIDDEN if the admin doesn't have the given permission. Super admins always pass. */
export function assertPermission(admin: AdminRecord, flag: keyof AdminPermissions): void {
  if (admin.role === 'super_admin') return;
  if (!admin.permissions[flag]) {
    const err = new Error('FORBIDDEN');
    (err as Error & { permission?: string }).permission = flag;
    throw err;
  }
}
