import { useAuthStore } from "@/app/store/auth.store";

export const forceLogout = () => {
  useAuthStore.getState().logout();
  window.location.href = "/login";
};