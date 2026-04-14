import { Navigate, Outlet } from "react-router-dom";
import { useAuthSession } from "./useAuthSession";

/**
 * ProtectedRoute Component
 *
 * Protects routes by checking if user has a valid authentication token
 * from Zustand auth store (synced with localStorage).
 */
export const ProtectedRoute = () => {
  const authStatus = useAuthSession();

  if (authStatus === "checking") {
    return null;
  }

  if (authStatus !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
