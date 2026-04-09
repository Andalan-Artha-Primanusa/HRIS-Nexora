import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import LoginPage from "../../pages/auth/login/LoginPage";
import RegisterPage from "../../pages/auth/register/RegisterPage";
import DashboardLayout from "../layouts/DashboardLayout";
import OverviewPage from "../../pages/dashboard/overview/OverviewPage";
import AttendanceOverviewPage from "../../pages/attendance/AttendanceOverviewPage";
import AttendanceCheckInPage from "../../pages/attendance/AttendanceCheckInPage";
import AttendanceCheckOutPage from "../../pages/attendance/AttendanceCheckOutPage";
import AttendanceHistoryPage from "../../pages/attendance/AttendanceHistoryPage";
import AttendanceTodayPage from "../../pages/attendance/AttendanceTodayPage";
import PayrollPage from "../../pages/dashboard/payroll/PayrollPage";
import KpiPage from "../../pages/dashboard/kpi/KpiPage";
import SectionPage from "../../pages/dashboard/SectionPage";
import PlaceholderPage from "../../pages/dashboard/PlaceholderPage";

const hasToken = () => {
  const token = localStorage.getItem("token");
  return Boolean(token && token !== "null" && token !== "undefined");
};

const sectionRoutes = [
  { path: "/hr-summary" },
  { path: "/analytics" },
  { path: "/employees" },
  { path: "/employees/add" },
  { path: "/organization/department" },
  { path: "/organization/position" },
  { path: "/employment/status" },
  { path: "/employment/salary-history" },
  { path: "/documents/ktp" },
  { path: "/documents/contract" },
  { path: "/documents/others" },
  { path: "/profiles" },
  { path: "/reimbursements" },
  { path: "/locations" },
  { path: "/admin/users" },
  { path: "/admin/roles" },
  { path: "/admin/permissions" },
  { path: "/my/reimbursements" },
  { path: "/my/payroll" },
  { path: "/attendance/daily" },
  { path: "/attendance/timesheet" },
  { path: "/attendance/shifts" },
  { path: "/attendance/overtime" },
  { path: "/attendance/reports" },
  { path: "/leave/requests" },
  { path: "/leave/my-leave" },
  { path: "/leave/approval" },
  { path: "/leave/calendar" },
  { path: "/leave/balance" },
  { path: "/leave/type" },
  { path: "/leave/policy" },
  { path: "/payroll/run" },
  { path: "/payroll/payslip" },
  { path: "/payroll/component/allowance" },
  { path: "/payroll/component/deduction" },
  { path: "/payroll/tax" },
  { path: "/payroll/reports" },
  { path: "/expense/submit" },
  { path: "/expense/list" },
  { path: "/expense/approval" },
  { path: "/expense/categories" },
  { path: "/expense/reports" },
  { path: "/performance" },
  { path: "/performance/goals" },
  { path: "/performance/review" },
  { path: "/performance/appraisal" },
  { path: "/performance/feedback" },
  { path: "/ess/profile" },
  { path: "/ess/attendance" },
  { path: "/ess/leave" },
  { path: "/ess/payslip" },
  { path: "/ess/requests" },
  { path: "/reports/employee" },
  { path: "/reports/attendance" },
  { path: "/reports/leave" },
  { path: "/reports/payroll" },
  { path: "/reports/custom" },
  { path: "/settings/company" },
  { path: "/settings/user-role" },
  { path: "/settings/permissions" },
  { path: "/settings/master-data/department" },
  { path: "/settings/master-data/position" },
  { path: "/settings/master-data/leave-type" },
  { path: "/settings/master-data/expense-category" },
  { path: "/settings/notification" },
  { path: "/settings/logs" },
];

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
        ],
      },
      {
        path: "/attendance",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AttendanceOverviewPage />,
          },
        ],
      },
      {
        path: "/attendance/check-in",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AttendanceCheckInPage />,
          },
        ],
      },
      {
        path: "/attendance/check-out",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AttendanceCheckOutPage />,
          },
        ],
      },
      {
        path: "/attendance/history",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AttendanceHistoryPage />,
          },
        ],
      },
      {
        path: "/attendance/today",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AttendanceTodayPage />,
          },
        ],
      },
      {
        path: "/kpis",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <KpiPage />,
          },
        ],
      },
      {
        path: "/my/kpi",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <KpiPage />,
          },
        ],
      },
      {
        path: "/payroll",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <PayrollPage />,
          },
        ],
      },
      ...sectionRoutes.map((route) => ({
        path: route.path,
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <SectionPage />,
          },
        ],
      })),
      {
        path: "*",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <PlaceholderPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

