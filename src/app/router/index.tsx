import { createBrowserRouter } from "react-router-dom";
import LoginPage from "@/modules/auth/pages/LoginPage";
import RegisterPage from "@/modules/auth/pages/RegisterPage";
import OverviewPage from "@/modules/dashboard/pages/OverviewPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <OverviewPage />,
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