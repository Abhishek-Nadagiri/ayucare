import { PermissionName, RoleName, Role } from '@/types';

export const ROLE_DEFINITIONS: Record<RoleName, Role> = {
  Doctor: {
    id: 'role-doctor',
    name: 'Doctor',
    description: 'Creates and manages patient cases, clinical documentation, and follow-ups.',
    permissions: [
      'patient:create',
      'patient:read',
      'patient:update',
      'case:create',
      'case:read',
      'case:update',
      'case:assign',
      'case:status_update',
      'note:create',
      'note:read',
      'followup:create',
      'followup:read',
      'followup:update',
      'report:read',
      'report:export',
    ],
    createdAt: '2026-01-01T00:00:00Z',
  },
  Nurse: {
    id: 'role-nurse',
    name: 'Nurse',
    description: 'Records patient observations, care notes, and updates assigned follow-ups.',
    permissions: [
      'patient:read',
      'patient:update',
      'case:read',
      'note:create',
      'note:read',
      'followup:read',
      'followup:update',
    ],
    createdAt: '2026-01-01T00:00:00Z',
  },
  Administrator: {
    id: 'role-admin',
    name: 'Administrator',
    description: 'System-level oversight, user/role management, and audit log inspection.',
    permissions: [
      'patient:read',
      'patient:archive',
      'case:read',
      'report:read',
      'report:export',
      'user:manage',
      'audit:read',
    ],
    createdAt: '2026-01-01T00:00:00Z',
  },
  Student: {
    id: 'role-student',
    name: 'Student',
    description: 'Simulated case reviews and training documentation under supervision.',
    permissions: [
      'patient:read',
      'case:read',
      'note:create',
      'note:read',
      'report:read',
    ],
    createdAt: '2026-01-01T00:00:00Z',
  },
};

export function hasPermission(roleName: RoleName | undefined, permission: PermissionName): boolean {
  if (!roleName) return false;
  const role = ROLE_DEFINITIONS[roleName];
  if (!role) return false;
  return role.permissions.includes(permission);
}

export function getRolePermissions(roleName: RoleName): PermissionName[] {
  return ROLE_DEFINITIONS[roleName]?.permissions || [];
}
