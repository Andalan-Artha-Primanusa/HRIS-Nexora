import type { AuthUser } from '@/shared/types/rbac.types';
import type { MenuItem } from './menu';
import { api } from '@/shared/api/httpClient';

let cachedAllowedKeys: string[] | null = null;
let cachePromise: Promise<string[]> | null = null;

export const fetchAllowedMenuKeys = async (): Promise<string[]> => {
  if (cachedAllowedKeys) return cachedAllowedKeys;
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    try {
      const res = await api.get('/user/menus');
      const data = res.data?.data ?? [];
      cachedAllowedKeys = Array.isArray(data) ? data : [];
      return cachedAllowedKeys!;
    } catch {
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

  return filterByKeys(items, keys);
};
