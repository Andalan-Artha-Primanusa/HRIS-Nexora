import { toast } from "react-hot-toast";

/**
 * Global Toast Helper
 * Use this to trigger toasts from anywhere (components, services, interceptors)
 */
export const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
  switch (type) {
    case "success":
      return toast.success(message);
    case "error":
      return toast.error(message);
    default:
      return toast(message);
  }
};
