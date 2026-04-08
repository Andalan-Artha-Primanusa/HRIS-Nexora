import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "@/modules/auth/pages/LoginPage";
import RegisterPage from "@/modules/auth/pages/RegisterPage";
import OverviewPage from "@/modules/dashboard/pages/OverviewPage";
import ProtectedRoute from "./ProtectedRoute";
import { useAuthStore } from "@/store/auth.store";

// ❗ helper redirect (tanpa hook)
const RootRedirect = () => {
  const token = localStorage.getItem("auth-storage");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />, // ✅ smart redirect
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <OverviewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
]);