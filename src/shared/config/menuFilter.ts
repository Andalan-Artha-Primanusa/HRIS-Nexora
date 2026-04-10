/**
 * Menu Filtering Utility
 * Filter menu items berdasarkan user permissions
 */

import type { AuthUser } from '@/shared/types/rbac.types';
import { RBACUtils } from '@/shared/hooks/rbac';
import type { MenuItem } from './menu';

/**
 * Check if user can access menu item
 */
export const canAccessMenuItem = (user: AuthUser | null, item: MenuItem): boolean => {
  if (!user) return false;

  // If no access requirements, everyone can access
  if (!item.requiredChecker) {
    return true;
  }

  // Use the requiredChecker function
  return item.requiredChecker(user);
};

/**
 * Filter menu items based on user permissions and roles
 */
export const filterMenuItems = (
  user: AuthUser | null,
  items: MenuItem[]
): MenuItem[] => {
  if (!user) return [];

  return items
    .filter((item) => canAccessMenuItem(user, item))
    .map((item) => ({
      ...item,
      subItems: item.subItems 
        ? filterMenuItems(user, item.subItems)
        : undefined,
    }))
    .filter((item) => !item.subItems || item.subItems.length > 0);
};

/**
 * Check if user is admin or above
 */
export const isAdminOrAbove = (user: AuthUser | null): boolean => {
  return RBACUtils.isAdmin(user);
};

/**
 * Check if user is HR or above
 */
export const isHROrAbove = (user: AuthUser | null): boolean => {
  return RBACUtils.hasRole(user, ['hr', 'admin', 'super_admin'] as any);
};

/**
 * Check if user is employee only
 */
export const isEmployeeOnly = (user: AuthUser | null): boolean => {
  return user ? user.roles?.some((r: any) => r.name === 'employee') : false;
};
