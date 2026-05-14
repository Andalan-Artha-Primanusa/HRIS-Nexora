import type { AuthUser } from '@/shared/types/rbac.types';
import type { MenuItem } from './menu';
import { api } from '@/shared/api/httpClient';

let cachedAllowedKeys: string[] | null = null;
let cachePromise: Promise<string[]> | null = null;

const stripAdminKeys = (keys: string[], user: AuthUser | null): string[] => {
  if (!user) return keys;
  const isSuperAdmin = user.roles?.some((r: any) => r.name === 'super_admin');
  if (isSuperAdmin) return keys;
  return keys.filter(k => !k.startsWith('alat-admin'));
};

const isRole = (user: AuthUser, name: string): boolean =>
  user.roles?.some((r: any) => r.name === name);

const computeFromAssignments = (items: { key: string; assigned_role_ids: number[] }[], user: AuthUser): string[] | null => {
  if (!items.length) return null;
  const userRoleIds = new Set(user.roles.map((r: any) => r.id));
  const keys = items
    .filter(m => m.assigned_role_ids.some((rid: number) => userRoleIds.has(rid)))
    .map(m => m.key);
  return keys.length ? keys : null;
};

export const fetchAllowedMenuKeys = async (user: AuthUser | null = null): Promise<string[]> => {
  if (cachedAllowedKeys) return cachedAllowedKeys;
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    if (!user?.roles?.length) {
      cachedAllowedKeys = [];
      return [];
    }

    const isEmployee = isRole(user, 'employee');

    if (isEmployee) {
      try {
        const res = await api.get('/user/menus');
        const data = res.data?.data ?? [];
        cachedAllowedKeys = stripAdminKeys(Array.isArray(data) ? data : [], user);
        return cachedAllowedKeys!;
      } catch {
        cachedAllowedKeys = [];
        return [];
      }
    }

    // admin / hr / manager / super_admin → /admin/menus with role-ID computation
    try {
      const adminRes = await api.get('/admin/menus', { validateStatus: () => true });
      if (adminRes.status === 200) {
        const items: { key: string; assigned_role_ids: number[] }[] = adminRes.data?.data?.items ?? [];
        const computed = computeFromAssignments(items, user);
        if (computed) {
          cachedAllowedKeys = stripAdminKeys(computed, user);
          return cachedAllowedKeys!;
        }
      }
    } catch {
      /* /admin/menus failed */
    }

    // fallback
    try {
      const res = await api.get('/user/menus');
      const data = res.data?.data ?? [];
      cachedAllowedKeys = stripAdminKeys(Array.isArray(data) ? data : [], user);
      return cachedAllowedKeys!;
    } catch {
      cachedAllowedKeys = [];
      return [];
    }
  })();

  return cachePromise;
};

export const clearMenuCache = () => {
  cachedAllowedKeys = null;
  cachePromise = null;
};

const collectKeys = (items: MenuItem[]): Set<string> => {
  const keys = new Set<string>();
  const walk = (list: MenuItem[]) => {
    for (const item of list) {
      if (item.menuKey) keys.add(item.menuKey);
      if (item.subItems) walk(item.subItems);
    }
  };
  walk(items);
  return keys;
};

const filterByKeys = (items: MenuItem[], allowedKeys: Set<string>): MenuItem[] => {
  return items
    .filter((item) => !item.menuKey || allowedKeys.has(item.menuKey))
    .map((item) => ({
      ...item,
      subItems: item.subItems ? filterByKeys(item.subItems, allowedKeys) : undefined,
    }))
    .filter((item) => !item.subItems || item.subItems.length > 0);
};

export const filterMenuItems = (
  user: AuthUser | null,
  items: MenuItem[],
  allowedKeys?: string[]
): MenuItem[] => {
  if (!user) return [];

  const keys = allowedKeys
    ? new Set(allowedKeys)
    : collectKeys(items);

  // Pastikan menu Persetujuan Cuti selalu diizinkan bagi pengguna dengan peran Approver agar tidak tersaring oleh cache lama
  const isApprover = user.roles?.some((r: any) => ['super_admin', 'admin', 'hr', 'manager'].includes(r.name?.toLowerCase()));
  if (isApprover) {
    keys.add('manajemen-cuti.persetujuan');
  }

  return filterByKeys(items, keys);
};
