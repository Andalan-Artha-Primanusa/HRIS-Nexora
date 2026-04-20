import { useAuthStore } from "@/app/store/auth.store";
import { showToast } from "@/shared/ui/toast";

export const forceLogout = (message: string = "Logout Berhasil") => {
  useAuthStore.getState().logout();
  showToast(message, "success");
  
  // Berikan jeda agar toast terlihat sebelum halaman direfresh/diarahkan
  setTimeout(() => {
    window.location.href = "/login";
  }, 1000);
};