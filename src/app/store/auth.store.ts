import { create } from 'zustand';
import type { AuthUser } from '@/shared/types/rbac.types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

const getStoredUser = (): AuthUser | null => {
  const rawUser = sessionStorage.getItem("user");

  if (!rawUser) return null;

  try {
    const parsed = JSON.parse(rawUser) as AuthUser;
    
    // Ensure roles is an array
    const roles = parsed.roles ?? [];

    const fallbackRoleName =
      typeof (parsed as any).role_name === "string"
        ? (parsed as any).role_name.trim().toLowerCase()
        : typeof (parsed as any).role === "string"
          ? (parsed as any).role.trim().toLowerCase()
          : typeof (parsed as any).position === "string"
            ? (parsed as any).position.trim().toLowerCase()
            : null;

    const normalizedRoles =
      roles.length > 0
        ? roles
        : fallbackRoleName
          ? [{ id: 0, name: fallbackRoleName, display_name: fallbackRoleName } as any]
          : [];
    
    // If permissions are missing or empty, extract from roles
    let permissions = parsed.permissions ?? [];
    if (permissions.length === 0 && normalizedRoles.length > 0) {
      const permMap = new Map<string, any>();
      for (const role of normalizedRoles) {
        if (Array.isArray(role.permissions)) {
          for (const perm of role.permissions) {
            if (perm.name && !permMap.has(perm.name)) {
              permMap.set(perm.name, perm);
            }
          }
        }
      }
      permissions = Array.from(permMap.values());
    }
    
    return {
      ...parsed,
      roles: normalizedRoles,
      permissions,
    };
  } catch {
    return null;
  }
};

const getStoredToken = () => sessionStorage.getItem("token");

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: Boolean(getStoredToken()),
  setAuth: (user: AuthUser, token: string) => {
    const authUser: AuthUser = {
      ...user,
      roles: user.roles ?? [],
      permissions: user.permissions ?? [],
    };
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(authUser));
    set({ user: authUser, token, isAuthenticated: true });
  },
  updateUser: (user: AuthUser) => {
    const authUser: AuthUser = {
      ...user,
      roles: user.roles ?? [],
      permissions: user.permissions ?? [],
    };
    sessionStorage.setItem("user", JSON.stringify(authUser));
    set({ user: authUser });
  },
  logout: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
