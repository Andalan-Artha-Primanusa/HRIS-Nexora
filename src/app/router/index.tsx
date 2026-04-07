import { createBrowserRouter } from "react-router-dom";
import LoginPage from "@/modules/auth/pages/LoginPage";
import RegisterPage from "@/modules/auth/pages/RegisterPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
    {
    path: "/register",
    element: <RegisterPage/>,
  },
]);