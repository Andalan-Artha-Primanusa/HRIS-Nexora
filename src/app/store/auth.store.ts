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
  const rawUser = localStorage.getItem("user");

  if (!rawUser) return null;

  try {
    const parsed = JSON.parse(rawUser) as AuthUser;
    // Ensure roles and permissions are arrays
    return {
      ...parsed,
      roles: parsed.roles ?? [],
      permissions: parsed.permissions ?? [],
    };
  } catch {
    return null;
  }
};

const getStoredToken = () => localStorage.getItem("token");

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
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(authUser));
    set({ user: authUser, token, isAuthenticated: true });
  },
  updateUser: (user: AuthUser) => {
    const authUser: AuthUser = {
      ...user,
      roles: user.roles ?? [],
      permissions: user.permissions ?? [],
    };
    localStorage.setItem("user", JSON.stringify(authUser));
    set({ user: authUser });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
