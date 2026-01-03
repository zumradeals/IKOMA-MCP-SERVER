import { Role } from './types.js';

const ROLE_HIERARCHY: Record<Role, number> = {
  observer: 1,
  operator: 2,
  builder: 3,
  admin: 4,
};

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function validateRole(role: string): role is Role {
  return ['observer', 'operator', 'builder', 'admin'].includes(role);
}

export function getRoleLevel(role: Role): number {
  return ROLE_HIERARCHY[role];
}