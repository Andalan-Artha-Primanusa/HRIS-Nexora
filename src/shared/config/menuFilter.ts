import type { AuthUser } from "@/shared/types/rbac.types";
import type { MenuItem } from "./menu";
import { api } from "@/shared/api/httpClient";
import { useAuthStore } from "@/app/store/auth.store";
import { RBACUtils } from "@/shared/hooks/rbac";

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

const addIf = (keys: Set<string>, condition: boolean, menuKeys: string[]) => {
  if (!condition) return;
  menuKeys.forEach((key) => keys.add(key));
};

const defaultMenuKeysForUser = (user: AuthUser): string[] => {
  const keys = new Set<string>();

  addIf(keys, RBACUtils.hasPermission(user, "reporting.dashboard"), [
    "dashboard",
    "laporan-analitik",
  ]);

  addIf(keys, RBACUtils.hasPermission(user, "employee.view"), ["employees"]);

  addIf(keys, RBACUtils.hasPermission(user, ["leave.view", "leave.create", "leave.approve"]), [
    "manajemen-cuti",
    "manajemen-cuti.permohonan",
    "manajemen-cuti.kalender",
    "manajemen-cuti.saldo",
  ]);

  addIf(keys, RBACUtils.hasPermission(user, "leave.approve"), [
    "manajemen-cuti",
    "manajemen-cuti.persetujuan",
  ]);

  addIf(keys, RBACUtils.hasPermission(user, ["reimbursement.view", "reimbursement.approve", "reimbursement.pay"]), [
    "reimbursements",
  ]);

  addIf(keys, RBACUtils.hasPermission(user, "payroll.view"), [
    "penggajian",
    "penggajian.ringkasan",
    "penggajian.daftar",
    "penggajian.proses",
    "penggajian.laporan",
  ]);

  addIf(keys, RBACUtils.hasPermission(user, "attendance.view_all"), [
    "absensi-waktu",
    "absensi-waktu.reports",
  ]);

  addIf(keys, RBACUtils.hasPermission(user, "kpi.view"), ["kpi-kinerja"]);
  addIf(keys, RBACUtils.hasPermission(user, "asset.view"), ["assets"]);
  addIf(keys, RBACUtils.hasPermission(user, "training.view"), [
    "pelatihan-kompetensi",
    "pelatihan-kompetensi.pelatihan",
  ]);
  addIf(keys, RBACUtils.hasPermission(user, "admin.import.execute"), ["master-data", "master-data.pusat-impor"]);
  addIf(keys, RBACUtils.hasPermission(user, "admin.approval_flow.manage"), [
    "alat-admin",
    "alat-admin.sistem",
    "alat-admin.sistem.alur-persetujuan",
  ]);

  return Array.from(keys);
};

const mergeWithDefaultKeys = (keys: string[], user: AuthUser): string[] => {
  return Array.from(new Set([...keys, ...defaultMenuKeysForUser(user)]));
};

/**
 * Mengambil allowedMenuKeys terpusat dan memastikan sinkronisasi absolut dengan auth.store
 */
export const fetchAllowedMenuKeys = async (user: AuthUser | null = null): Promise<string[]> => {
  const storeKeys = useAuthStore.getState().allowedMenuKeys;
  if (storeKeys.length > 0) {
    if (!user) return storeKeys;
    const mergedKeys = mergeWithDefaultKeys(storeKeys, user);
    if (mergedKeys.length !== storeKeys.length) {
      useAuthStore.getState().setAllowedMenuKeys(mergedKeys);
    }
    return mergedKeys;
  }
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    if (!user?.roles?.length) {
      useAuthStore.getState().setAllowedMenuKeys([]);
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
          const finalKeys = mergeWithDefaultKeys(stripAdminKeys(computed, user), user);
          useAuthStore.getState().setAllowedMenuKeys(finalKeys);
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
      const finalKeys = mergeWithDefaultKeys(stripAdminKeys(Array.isArray(data) ? data : [], user), user);
      useAuthStore.getState().setAllowedMenuKeys(finalKeys);
      return finalKeys;
    } catch {
      useAuthStore.getState().setAllowedMenuKeys([]);
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

/**
 * Menyaring menu item secara dinamis menggunakan Single Source of Truth dari auth.store
 */
export const filterMenuItems = (
  user: AuthUser | null,
  items: MenuItem[],
  allowedKeys?: string[]
): MenuItem[] => {
  if (!user) return [];

  // Gunakan state terpusat jika allowedKeys opsional kosong
  const effectiveKeys = allowedKeys && allowedKeys.length > 0 
    ? allowedKeys 
    : useAuthStore.getState().allowedMenuKeys;

  const keys = effectiveKeys && effectiveKeys.length > 0
    ? new Set(mergeWithDefaultKeys(effectiveKeys, user))
    : collectKeys(items);

  return filterByKeys(items, keys);
};
