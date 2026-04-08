import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import LoginPage from "@/pages/auth/login/LoginPage";
import RegisterPage from "@/pages/auth/register/RegisterPage";
import DashboardLayout from "@/app/layouts/DashboardLayout";
import OverviewPage from "@/pages/dashboard/overview/OverviewPage";

const hasToken = () => Boolean(localStorage.getItem("token"));

const RootRedirect = () => {
  return hasToken() ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

const ProtectedRoute = () => {
  return hasToken() ? <Outlet /> : <Navigate to="/login" replace />;
};

const GuestRoute = () => {
  return hasToken() ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    element: <GuestRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <OverviewPage />,
          },
          // You can add more dashboard routes here
        ],
      },
    ],
  },
]);

