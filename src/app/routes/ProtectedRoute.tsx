import { Navigate, Outlet } from "react-router-dom";
import { useAuthSession } from "./useAuthSession";
import { useAuthStore } from "@/app/store/auth.store";

interface ProtectedRouteProps {
  role?: string[];
}

/**
 * ProtectedRoute Component
 *
 * Protects routes by checking if user has a valid authentication token
 * and optionally verifying their role.
 */
export const ProtectedRoute = ({ role }: ProtectedRouteProps) => {
  const authStatus = useAuthSession();
  const user = useAuthStore((state) => state.user);

  if (authStatus === "checking") {
    return null;
  }

  if (authStatus !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  // Role check if provided
  if (role && role.length > 0) {
    const userRoles = user?.roles?.map((r: any) => r.name) || [];
    const hasRole = role.some((r) => userRoles.includes(r));

    if (!hasRole) {
      // Redirect to home or an unauthorized page
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
