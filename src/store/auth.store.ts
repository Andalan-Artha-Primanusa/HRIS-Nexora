import { create } from 'zustand';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: any, token: string) => void;
  logout: () => void;
}

const getStoredUser = () => {
  const rawUser = sessionStorage.getItem("user");

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

const getStoredToken = () => sessionStorage.getItem("token");

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
