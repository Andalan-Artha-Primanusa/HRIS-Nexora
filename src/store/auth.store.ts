import { create } from 'zustand';
import type { AuthUser } from '@/shared/types/rbac.types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const getStoredUser = (): AuthUser | null => {
  const rawUser = sessionStorage.getItem("user");

  if (!rawUser) return null;

  try {
    const user = JSON.parse(rawUser) as Partial<AuthUser>;
    return {
      id: typeof user.id === "number" ? user.id : 0,
      name: typeof user.name === "string" ? user.name : "",
      email: typeof user.email === "string" ? user.email : "",
      roles: Array.isArray(user.roles) ? user.roles : [],
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
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
  setAuth: (user, token) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
