import type { AuthUser } from '@/shared/types/rbac.types';
import type { MenuItem } from './menu';
import { api } from '@/shared/api/httpClient';

let cachedAllowedKeys: string[] | null = null;
let cachePromise: Promise<string[]> | null = null;
let cachedAssignments: { key: string; assigned_role_ids: number[] }[] | null = null;

const stripAdminKeys = (keys: string[], user: AuthUser | null): string[] => {
  if (!user) return keys;
  const isSuperAdmin = user.roles?.some((r: any) => r.name === 'super_admin');
  if (isSuperAdmin) return keys;
  return keys.filter(k => !k.startsWith('alat-admin'));
};

const computeFromAssignments = (items: { key: string; assigned_role_ids: number[] }[], user: AuthUser): string[] | null => {
  if (!items.length) return null;
  const userRoleIds = new Set(user.roles.map((r: any) => r.id));
  const keys = items
    .filter(m => m.assigned_role_ids.some(rid => userRoleIds.has(rid)))
    .map(m => m.key);
  return keys;
};

const loadFromLocalStorage = (user: AuthUser): string[] | null => {
  try {
    const raw = localStorage.getItem('menuAssignments');
    if (!raw) return null;
    const { items } = JSON.parse(raw);
    if (!Array.isArray(items) || !items.length) return null;
    const keys = computeFromAssignments(items, user);
    return keys;
  } catch {
    return null;
  }
};

export const fetchAllowedMenuKeys = async (user?: AuthUser | null): Promise<string[]> => {
  if (cachedAllowedKeys) return cachedAllowedKeys;
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    // 1) Try localStorage cache (populated by super admin via MenuPermissionsPage)
    if (user?.roles?.length) {
      const localKeys = loadFromLocalStorage(user);
      if (localKeys) {
        cachedAllowedKeys = stripAdminKeys(localKeys, user);
        return cachedAllowedKeys!;
      }
    }

    // 2) Try /admin/menus with role-ID computation
    if (user?.roles?.length) {
      try {
        const adminRes = await api.get('/admin/menus', {
          validateStatus: () => true,
        });
        if (adminRes.status === 200) {
          const items: { key: string; assigned_role_ids: number[] }[] = adminRes.data?.data?.items ?? [];
          if (items.length > 0) {
            cachedAssignments = items;
            const computed = computeFromAssignments(items, user);
            if (computed) {
              cachedAllowedKeys = stripAdminKeys(computed, user);
              return cachedAllowedKeys!;
            }
          }
        }
      } catch {
        /* /admin/menus failed */
      }
    }

    // 3) Fallback: try /user/menus
    try {
      const res = await api.get('/user/menus');
      const data = res.data?.data ?? [];
      cachedAllowedKeys = Array.isArray(data) ? data : [];
      cachedAllowedKeys = stripAdminKeys(cachedAllowedKeys, user);
      return cachedAllowedKeys!;
    } catch {
      /* both endpoints failed */
    }

    cachedAllowedKeys = [];
    return [];
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

  return filterByKeys(items, keys);
};
