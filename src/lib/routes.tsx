import { createBrowserRouter } from "react-router-dom";
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";
import DashboardLayout from "@/app/(dashboard)/layout";
import OverviewPage from "@/app/(dashboard)/dashboard/overview/page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        path: "/",
        element: <OverviewPage />,
      },
      // You can add more dashboard routes here
    ]
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage/>,
  },
]);
