import type { RoleSelection } from '../../contexts/RoleContext';

/**
 * RBAC Permissions Map
 * 
 * Defines which routes each role can access.
 * Routes not listed for a role are completely hidden from that role's navigation
 * and will redirect to /dashboard if accessed directly via URL.
 */

export type RoutePath = 
  | 'dashboard'
  | 'mps'
  | 'projects'
  | 'risk-analysis'
  | 'alerts'
  | 'compliance'
  | 'analytics'
  | 'financial'
  | 'project-execution'
  | 'districts'
  | 'agencies'
  | 'geographic'
  | 'assistant'
  | 'reports'
  | 'audit';

const ROLE_PERMISSIONS: Record<RoleSelection, RoutePath[]> = {
  'Administrator': [
    'dashboard', 'mps', 'projects', 'risk-analysis', 'alerts', 'compliance',
    'analytics', 'financial', 'project-execution', 'districts', 'agencies',
    'geographic', 'assistant', 'reports', 'audit'
  ],
  'Ministry': [
    'dashboard', 'mps', 'projects', 'risk-analysis', 'alerts', 'compliance',
    'analytics', 'financial', 'project-execution', 'districts', 'agencies',
    'geographic', 'assistant', 'reports', 'audit'
  ],
  'State Nodal Authority': [
    'dashboard', 'mps', 'projects', 'alerts',
    'analytics', 'financial', 'project-execution', 'districts', 'agencies',
    'geographic', 'reports'
  ],
  'District Authority': [
    'dashboard', 'projects', 'alerts',
    'project-execution', 'districts', 'reports',
    'analytics', 'financial', 'geographic'
  ],
  'Member of Parliament': [
    'dashboard', 'projects', 'reports'
  ]
};

export function hasAccess(role: RoleSelection, route: RoutePath): boolean {
  return ROLE_PERMISSIONS[role]?.includes(route) ?? false;
}

export function getAllowedRoutes(role: RoleSelection): RoutePath[] {
  return ROLE_PERMISSIONS[role] || [];
}
