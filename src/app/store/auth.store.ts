import { create } from 'zustand';
import type { AuthUser, Role, Permission } from '@/shared/types/rbac.types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  allowedMenuKeys: string[];
  menuKeysLoaded: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
  setAllowedMenuKeys: (keys: string[]) => void;
  setMenuKeysLoaded: (loaded: boolean) => void;
}

const getStoredUser = (): AuthUser | null => {
  const rawUser = sessionStorage.getItem("user");

  if (!rawUser) return null;

  try {
    const parsed = JSON.parse(rawUser) as Record<string, unknown>;
    
    const roles: Role[] = Array.isArray(parsed.roles) ? (parsed.roles as Role[]) : [];

    let fallbackRoleName: string | null = null;
    if (typeof parsed.role_name === "string") {
      fallbackRoleName = parsed.role_name.trim().toLowerCase();
    } else if (typeof parsed.role === "string") {
      fallbackRoleName = parsed.role.trim().toLowerCase();
    } else if (typeof parsed.position === "string") {
      fallbackRoleName = parsed.position.trim().toLowerCase();
    }

    const normalizedRoles: Role[] =
      roles.length > 0
        ? roles
        : fallbackRoleName
          ? [{ id: 0, name: fallbackRoleName, display_name: fallbackRoleName }]
          : [];
    
    let permissions: Permission[] = Array.isArray(parsed.permissions) ? (parsed.permissions as Permission[]) : [];
    if (permissions.length === 0 && normalizedRoles.length > 0) {
      const permMap = new Map<string, Permission>();
      for (const role of normalizedRoles) {
        if (Array.isArray(role.permissions)) {
          for (const perm of role.permissions as Permission[]) {
            if (perm.name && !permMap.has(perm.name)) {
              permMap.set(perm.name, perm);
            }
          }
        }
      }
      permissions = Array.from(permMap.values());
    }
    
    return {
      ...(parsed as unknown as AuthUser),
      id: typeof parsed.id === 'number' ? parsed.id : 0,
      name: typeof parsed.name === 'string' ? parsed.name : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      roles: normalizedRoles,
      permissions,
    };
  } catch {
    return null;
  }
};

const getStoredToken = (): string | null => sessionStorage.getItem("token");

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: Boolean(getStoredToken()),
  allowedMenuKeys: [],
  menuKeysLoaded: false,
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
  setAllowedMenuKeys: (keys: string[]) => {
    sessionStorage.setItem("allowedMenuKeys", JSON.stringify(keys));
    set({ allowedMenuKeys: keys });
  },
  setMenuKeysLoaded: (loaded: boolean) => {
    set({ menuKeysLoaded: loaded });
  },
  logout: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("allowedMenuKeys");
    set({ user: null, token: null, isAuthenticated: false, allowedMenuKeys: [], menuKeysLoaded: false });
  },
}));
