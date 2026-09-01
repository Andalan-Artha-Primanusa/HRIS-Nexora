import type { AuthUser } from "@/shared/types/rbac.types";
import type { ApiMenuNode, MenuItem } from "./menu";
import { mapApiMenuTree } from "./menu";
import { api } from "@/shared/api/httpClient";
import { useAuthStore } from "@/app/store/auth.store";
import { RBACUtils } from "@/shared/hooks/rbac";

let cachePromise: Promise<string[]> | null = null;
let treeCachePromise: Promise<MenuItem[]> | null = null;

const stripAdminKeys = (keys: string[]): string[] => {
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

    // Sumber kebenaran = backend. /user/menus mengembalikan menu yang
    // sudah difilter permission (MenuController::userMenus → canAccessMenuKey),
    // sehingga sidebar tidak menampilkan menu yang user tidak boleh akses.
    // /admin/menus dipakai sebagai batasan tambahan (role assignment gate).
    let permissionKeys: string[] = [];
    try {
      const res = await api.get<{ data?: string[] }>("/user/menus");
      permissionKeys = stripAdminKeys(Array.isArray(res.data?.data) ? res.data!.data : []);
    } catch {
      permissionKeys = [];
    }

    // Batasan tambahan: hanya menu yang di-assign ke role user.
    let assignmentKeys: string[] | null = null;
    try {
      const adminRes = await api.get<{ data?: { items?: { key: string; assigned_role_ids: number[] }[] } }>(
        "/admin/menus",
        { validateStatus: () => true }
      );
      if (adminRes.status === 200) {
        assignmentKeys = computeFromAssignments(adminRes.data?.data?.items ?? [], user);
      }
    } catch {
      assignmentKeys = null;
    }

    // intersection: menu harus lolos permission filter (backend) DAN role assignment (bila ada).
    const effectiveKeys =
      assignmentKeys === null
        ? permissionKeys
        : permissionKeys.filter((key) => assignmentKeys!.includes(key));

    useAuthStore.getState().setAllowedMenuKeys(effectiveKeys);
    useAuthStore.getState().setMenuKeysLoaded(true);
    return effectiveKeys;
  })();

  try {
    return await cachePromise;
  } finally {
    cachePromise = null;
  }
};

export const clearMenuCache = () => {
  cachePromise = null;
  treeCachePromise = null;
  useAuthStore.getState().setAllowedMenuKeys([]);
  useAuthStore.getState().setMenuKeysLoaded(false);
};

export const fetchUserMenuTree = async (user: AuthUser | null = null): Promise<MenuItem[]> => {
  if (!user?.roles?.length) return [];
  if (treeCachePromise) return treeCachePromise;

  treeCachePromise = (async () => {
    const res = await api.get<{ data?: ApiMenuNode[] }>("/user/menu-tree");
    return mapApiMenuTree(Array.isArray(res.data?.data) ? res.data.data : []);
  })();

  try {
    return await treeCachePromise;
  } finally {
    treeCachePromise = null;
  }
};

const filterByKeys = (items: MenuItem[], allowedKeys: Set<string>, user: AuthUser): MenuItem[] => {
  const isSuperAdmin = RBACUtils.isSuperAdmin(user);
  return items
    .filter((item) => isSuperAdmin || !item.menuKey || allowedKeys.has(item.menuKey))
    .map((item) => ({
      ...item,
      subItems: item.subItems ? filterByKeys(item.subItems, allowedKeys, user) : undefined,
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

  return filterByKeys(items, new Set(effectiveKeys), user);
};
