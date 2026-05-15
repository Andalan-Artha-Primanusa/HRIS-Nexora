import type { AuthUser } from "@/shared/types/rbac.types";
import type { MenuItem } from "./menu";
import { api } from "@/shared/api/httpClient";
import { useAuthStore } from "@/app/store/auth.store";

let cachePromise: Promise<string[]> | null = null;

const stripAdminKeys = (keys: string[], _user: AuthUser | null): string[] => {
  return keys;
};

const computeFromAssignments = (
  items: { key: string; assigned_role_ids: number[] }[],
  user: AuthUser
): string[] | null => {
  if (!items.length) return null;
  const userRoleIds = new Set(user.roles.map((r) => r.id));
  const keys = items
    .filter((m) => m.assigned_role_ids.some((rid: number) => userRoleIds.has(rid)))
    .map((m) => m.key);
  return keys.length ? keys : null;
};

/**
 * Mengambil allowedMenuKeys terpusat dan memastikan sinkronisasi absolut dengan auth.store
 */
export const fetchAllowedMenuKeys = async (user: AuthUser | null = null): Promise<string[]> => {
  const storeKeys = useAuthStore.getState().allowedMenuKeys;
  if (storeKeys.length > 0) {
    useAuthStore.getState().setMenuKeysLoaded(true);
    return storeKeys;
  }
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    if (!user?.roles?.length) {
      useAuthStore.getState().setAllowedMenuKeys([]);
      useAuthStore.getState().setMenuKeysLoaded(true);
      return [];
    }

    // Verifikasi menu assignment dari backend; fallback ke /user/menus bila endpoint admin tidak tersedia.
    try {
      const adminRes = await api.get<{ data?: { items?: { key: string; assigned_role_ids: number[] }[] } }>(
        "/admin/menus",
        { validateStatus: () => true }
      );
      if (adminRes.status === 200) {
        const items = adminRes.data?.data?.items ?? [];
        const computed = computeFromAssignments(items, user);
        if (computed) {
          const finalKeys = stripAdminKeys(computed, user);
          useAuthStore.getState().setAllowedMenuKeys(finalKeys);
          useAuthStore.getState().setMenuKeysLoaded(true);
          return finalKeys;
        }
      }
    } catch {
      // Abaikan dan lanjutkan ke fallback
    }

    // Fallback utama
    try {
      const res = await api.get<{ data?: string[] }>("/user/menus");
      const data = res.data?.data ?? [];
      const finalKeys = stripAdminKeys(Array.isArray(data) ? data : [], user);
      useAuthStore.getState().setAllowedMenuKeys(finalKeys);
      useAuthStore.getState().setMenuKeysLoaded(true);
      return finalKeys;
    } catch {
      useAuthStore.getState().setAllowedMenuKeys([]);
      useAuthStore.getState().setMenuKeysLoaded(true);
      return [];
    }
  })();

  try {
    return await cachePromise;
  } finally {
    cachePromise = null;
  }
};

export const clearMenuCache = () => {
  cachePromise = null;
  useAuthStore.getState().setAllowedMenuKeys([]);
  useAuthStore.getState().setMenuKeysLoaded(false);
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

/**
 * Menyaring menu item secara dinamis menggunakan Single Source of Truth dari auth.store
 */
export const filterMenuItems = (
  user: AuthUser | null,
  items: MenuItem[],
  allowedKeys?: string[]
): MenuItem[] => {
  if (!user) return [];

  const effectiveKeys = allowedKeys !== undefined
    ? allowedKeys
    : useAuthStore.getState().allowedMenuKeys;

  if (effectiveKeys.length === 0) return [];

  return filterByKeys(items, new Set(effectiveKeys));
};
