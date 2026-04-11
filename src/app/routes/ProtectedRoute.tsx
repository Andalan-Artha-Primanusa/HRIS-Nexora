import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";

/**
 * ProtectedRoute Component
 *
 * Protects routes by checking if user has a valid authentication token
 * from Zustand auth store (synced with localStorage).
 */
export const ProtectedRoute = () => {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
