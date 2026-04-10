import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { getRoleBasedDashboardPathFromStorage } from "@/features/auth/utils/roleRedirect";
import LoginPage from "../../pages/auth/login/LoginPage";
import GoogleCallbackPage from "../../pages/auth/login/GoogleCallbackPage";
import RegisterPage from "../../pages/auth/register/RegisterPage";
import DashboardLayout from "../layouts/DashboardLayout";
import OverviewPage from "../../pages/dashboard/overview/OverviewPage";
import AttendanceOverviewPage from "../../pages/attendance/AttendanceOverviewPage";
import AttendanceCheckInPage from "../../pages/attendance/AttendanceCheckInPage";
import AttendanceCheckOutPage from "../../pages/attendance/AttendanceCheckOutPage";
import AttendanceHistoryPage from "../../pages/attendance/AttendanceHistoryPage";
import AttendanceTodayPage from "../../pages/attendance/AttendanceTodayPage";
import AttendanceAdminPage from "../../pages/attendance/AttendanceAdminPage";
import PayrollPage from "../../pages/dashboard/payroll/PayrollPage";
import KpiPage from "../../pages/dashboard/kpi/KpiPage";
import SectionPage from "../../pages/dashboard/SectionPage";
import ProfilesPage from "../../pages/profiles/ProfilesPage";
import EmployeesPage from "../../pages/employee/EmployeesPage";
import MyReimbursementsPage from "../../pages/ess/MyReimbursementsPage";
import MyPayrollPage from "../../pages/ess/MyPayrollPage";
import MyLeavesPage from "../../pages/ess/MyLeavesPage";
import ReimbursementsManagementPage from "../../pages/reimbursements/ReimbursementsManagementPage";
import LocationsPage from "../../pages/locations/LocationsPage";
import CreateLocationPage from "../../pages/locations/CreateLocationPage";
import EditLocationPage from "../../pages/locations/EditLocationPage";
import AdminUsersPage from "../../pages/admin/AdminUsersPage";
import AdminRolesPage from "../../pages/admin/AdminRolesPage";
import AdminPermissionsPage from "../../pages/admin/AdminPermissionsPage";
import LeaveRequestsPage from "../../pages/leave/LeaveRequestsPage";
import LeaveCalendarPage from "../../pages/leave/LeaveCalendarPage";
import LeaveApprovalPage from "../../pages/leave/LeaveApprovalPage";
import PayrollManagementPage from "../../pages/payroll/PayrollManagementPage";
import PayrollDetailsPage from "../../pages/payroll/PayrollDetailsPage";

const hasToken = () => {
  const token = localStorage.getItem("token");
  return Boolean(token && token !== "null" && token !== "undefined");
};

const sectionRoutes = [
  { path: "/hr-summary" },
  { path: "/analytics" },
  { path: "/organization/department" },
  { path: "/organization/position" },
  { path: "/employment/status" },
  { path: "/employment/salary-history" },
  { path: "/documents/ktp" },
  { path: "/documents/contract" },
  { path: "/documents/others" },
  { path: "/attendance/timesheet" },
  { path: "/attendance/shifts" },
  { path: "/attendance/overtime" },
  { path: "/attendance/reports" },
  { path: "/leave/type" },
  { path: "/leave/policy" },
  { path: "/payroll/tax" },
  { path: "/payroll/reports" },
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
  const dashboardPath = getRoleBasedDashboardPathFromStorage();

  return hasToken() ? (
    <Navigate to={dashboardPath} replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

const ProtectedRoute = () => {
  return hasToken() ? <Outlet /> : <Navigate to="/login" replace />;
};

const GuestRoute = () => {
  const dashboardPath = getRoleBasedDashboardPathFromStorage();
  return hasToken() ? <Navigate to={dashboardPath} replace /> : <Outlet />;
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
        path: "/auth/google/callback",
        element: <GoogleCallbackPage />,
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
        path: "/my/reimbursements",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <MyReimbursementsPage />,
          },
        ],
      },
      {
        path: "/my/payroll",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <MyPayrollPage />,
          },
        ],
      },
      {
        path: "/leave/my-leave",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <MyLeavesPage />,
          },
        ],
      },
      {
        path: "/leave/balance",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <MyLeavesPage />,
          },
        ],
      },
      {
        path: "/leave/requests",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <LeaveRequestsPage />,
          },
        ],
      },
      {
        path: "/leave/calendar",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <LeaveCalendarPage />,
          },
        ],
      },
      {
        path: "/leave/approval",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <LeaveApprovalPage />,
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
      {
        path: "/profiles",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <ProfilesPage />,
          },
        ],
      },
      {
        path: "/profiles/add",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <ProfilesPage />,
          },
        ],
      },
      {
        path: "/profiles/view/:id",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <ProfilesPage />,
          },
        ],
      },
      {
        path: "/profiles/update/:id",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <ProfilesPage />,
          },
        ],
      },
      {
        path: "/reimbursements",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <ReimbursementsManagementPage />,
          },
        ],
      },
      {
        path: "/expense/submit",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <ReimbursementsManagementPage />,
          },
        ],
      },
      {
        path: "/expense/list",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <ReimbursementsManagementPage />,
          },
        ],
      },
      {
        path: "/expense/approval",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <ReimbursementsManagementPage />,
          },
        ],
      },
      {
        path: "/locations",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <LocationsPage />,
          },
        ],
      },
      {
        path: "/locations/create",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <CreateLocationPage />,
          },
        ],
      },
      {
        path: "/locations/edit/:id",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <EditLocationPage />,
          },
        ],
      },
      {
        path: "/admin/users",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AdminUsersPage />,
          },
        ],
      },
      {
        path: "/admin/roles",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AdminRolesPage />,
          },
        ],
      },
      {
        path: "/admin/permissions",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AdminPermissionsPage />,
          },
        ],
      },
      {
        path: "/employees",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <EmployeesPage />,
          },
        ],
      },
      {
        path: "/employees/add",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <EmployeesPage />,
          },
        ],
      },
      {
        path: "/employees/update/:id",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <EmployeesPage />,
          },
        ],
      },
      {
        path: "/attendance/daily",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AttendanceAdminPage />,
          },
        ],
      },
      {
        path: "/payroll/run",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <PayrollManagementPage />,
          },
        ],
      },
      {
        path: "/payroll/component/allowance",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <PayrollDetailsPage />,
          },
        ],
      },
      {
        path: "/payroll/component/deduction",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <PayrollDetailsPage />,
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
            element: <SectionPage />,
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

