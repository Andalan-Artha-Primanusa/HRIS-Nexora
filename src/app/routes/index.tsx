import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy } from "react";
import { getRoleBasedDashboardPathFromStorage } from "@/features/auth/utils/roleRedirect";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuthSession } from "./useAuthSession";
import LoginPage from "../../pages/auth/login/LoginPage";
import GoogleCallbackPage from "../../pages/auth/login/GoogleCallbackPage";
import RegisterPage from "../../pages/auth/register/RegisterPage";
import DashboardLayout from "../layouts/DashboardLayout";
const OverviewPage = lazy(() => import("../../pages/dashboard/overview/OverviewPage"));
const AttendanceOverviewPage = lazy(() => import("../../pages/attendance/AttendanceOverviewPage"));
const AttendanceCheckInPage = lazy(() => import("../../pages/attendance/AttendanceCheckInPage"));
const AttendanceCheckOutPage = lazy(() => import("../../pages/attendance/AttendanceCheckOutPage"));
const AttendanceHistoryPage = lazy(() => import("../../pages/attendance/AttendanceHistoryPage"));
const AttendanceTodayPage = lazy(() => import("../../pages/attendance/AttendanceTodayPage"));
const AttendanceAdminPage = lazy(() => import("../../pages/attendance/AttendanceAdminPage"));
const KpiListPage = lazy(() => import("../../pages/dashboard/kpi/KpiListPage"));
const KpiCreatePage = lazy(() => import("../../pages/dashboard/kpi/KpiCreatePage"));
const KpiDetailPage = lazy(() => import("../../pages/dashboard/kpi/KpiDetailPage"));
const KpiUpdatePage = lazy(() => import("../../pages/dashboard/kpi/KpiUpdatePage"));
const KpiApprovePage = lazy(() => import("../../pages/dashboard/kpi/KpiApprovePage"));
const MyKpiPage = lazy(() => import("../../pages/dashboard/kpi/MyKpiPage"));
const SectionPage = lazy(() => import("../../pages/dashboard/SectionPage"));
const ProfilesPage = lazy(() => import("../../pages/profiles/ProfilesPage"));
const EmployeesPage = lazy(() => import("../../pages/employee/EmployeesPage"));
const EmployeeCreatePage = lazy(() => import("../../pages/employee/EmployeeCreatePage"));
const EmployeeEditPage = lazy(() => import("../../pages/employee/EmployeeEditPage"));
const MyReimbursementsPage = lazy(() => import("../../pages/ess/MyReimbursementsPage"));
const MyPayrollPage = lazy(() => import("../../pages/ess/MyPayrollPage"));
const MyLeavesPage = lazy(() => import("../../pages/ess/MyLeavesPage"));
const ReimbursementsManagementPage = lazy(() => import("../../pages/reimbursements/ReimbursementsManagementPage"));
const LocationsPage = lazy(() => import("../../pages/locations/LocationsPage"));
const CreateLocationPage = lazy(() => import("../../pages/locations/CreateLocationPage"));
const EditLocationPage = lazy(() => import("../../pages/locations/EditLocationPage"));
const AdminUsersPage = lazy(() => import("../../pages/admin/AdminUsersPage"));
const AdminRolesPage = lazy(() => import("../../pages/admin/AdminRolesPage"));
const AdminPermissionsPage = lazy(() => import("../../pages/admin/AdminPermissionsPage"));
const AdminUserAssignRolesPage = lazy(() => import("../../pages/admin/AdminUserAssignRolesPage"));
const AdminRoleAssignPermissionsPage = lazy(() => import("../../pages/admin/AdminRoleAssignPermissionsPage"));
const AdminNotificationsPage = lazy(() => import("../../pages/admin/AdminNotificationsPage"));
const AdminEmailNotificationsPage = lazy(() => import("../../pages/admin/AdminEmailNotificationsPage"));
const AdminAuditLogsPage = lazy(() => import("../../pages/admin/AdminAuditLogsPage"));
const AdminImportPage = lazy(() => import("../../pages/admin/AdminImportPage"));
const AdminBiometricDevicesPage = lazy(() => import("../../pages/admin/AdminBiometricDevicesPage"));
const LeaveRequestsPage = lazy(() => import("../../pages/leave/LeaveRequestsPage"));
const CreateLeavePage = lazy(() => import("../../pages/leave/CreateLeavePage"));
const UpdateLeavePage = lazy(() => import("../../pages/leave/UpdateLeavePage"));
const LeaveCalendarPage = lazy(() => import("../../pages/leave/LeaveCalendarPage"));
const LeaveApprovalPage = lazy(() => import("../../pages/leave/LeaveApprovalPage"));
const PayrollManagementPage = lazy(() => import("../../pages/payroll/PayrollManagementPage"));
const PayrollDetailsPage = lazy(() => import("../../pages/payroll/PayrollDetailsPage"));
const PayrollListPage = lazy(() => import("../../pages/payroll/PayrollListPage"));
const PayrollCrudPage = lazy(() => import("../../pages/payroll/PayrollCrudPage.tsx"));
const PayrollApprovePage = lazy(() => import("../../pages/payroll/PayrollApprovePage"));
const PayrollPaymentPage = lazy(() => import("../../pages/payroll/PayrollPaymentPage.tsx"));
const PayrollGeneratePage = lazy(() => import("../../pages/payroll/PayrollGeneratePage"));
const PayrollDashboard = lazy(() => import("../../pages/payroll/PayrollDashboard"));
const NotificationsPage = lazy(() => import("../../pages/notifications/NotificationsPage"));

const sectionRoutes = [
  { path: "/hr-summary" },
  { path: "/analytics" },
  { path: "/insights/people/detailed" },
  { path: "/organization/directory" },
  { path: "/organization/summary" },
  { path: "/organization/chart" },
  { path: "/organization/team" },
  { path: "/organization/master-data" },
  { path: "/documents/review" },
  { path: "/documents/expiring" },
  { path: "/my/documents" },
  { path: "/notifications" },
  { path: "/attendance/timesheet" },
  { path: "/attendance/overtime" },
  { path: "/attendance/reports" },
  { path: "/leave/type/create" },
  { path: "/leave/type/manage" },
  { path: "/leave/policy/create" },
  { path: "/leave/policy/manage" },
  { path: "/assets" },
  { path: "/assets/assignments" },
  { path: "/my/assets" },
  { path: "/training/programs" },
  { path: "/training/enrollments" },
  { path: "/competencies" },
  { path: "/my/trainings" },
  { path: "/my/competencies" },
  { path: "/my/requests" },
  { path: "/requests" },
  { path: "/requests/assign" },
  { path: "/requests/status" },
  { path: "/approval-flows" },
  { path: "/compliance/overview" },
  { path: "/compliance/audit-summary" },
  { path: "/compliance/expiring-documents" },
  { path: "/payroll/tax" },
  { path: "/payroll/reports" },
  { path: "/expense/categories" },
  { path: "/expense/reports" },
  { path: "/performance" },
  { path: "/performance/summary" },
  { path: "/performance/cycles" },
  { path: "/performance/reviews" },
  { path: "/performance/okrs" },
  { path: "/performance/360-reviews" },
  { path: "/performance/calibration" },
  { path: "/career/idps" },
  { path: "/career/succession" },
  { path: "/engagement/surveys" },
  { path: "/recruitment/openings" },
  { path: "/workforce/holidays" },
  { path: "/workforce/shift-swaps" },
  { path: "/workforce/overtime-rules" },
  { path: "/reports/dashboard-summary" },
  { path: "/reports/attendance" },
  { path: "/reports/leave" },
  { path: "/reports/payroll" },
  { path: "/reports/competency" },
  { path: "/reports/employee-lifecycle" },
  { path: "/reports/assets" },
  { path: "/reports/custom" },
  { path: "/settings/company" },
  { path: "/settings/user-role" },
  { path: "/settings/permissions" },
  { path: "/settings/master-data/leave-type" },
  { path: "/settings/master-data/expense-category" },
  { path: "/settings/notification" },
];

const RootRedirect = () => {
  const authStatus = useAuthSession();
  const dashboardPath = getRoleBasedDashboardPathFromStorage();

  if (authStatus === "checking") {
    return null;
  }

  return authStatus === "authenticated" ? (
    <Navigate to={dashboardPath} replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

const GuestRoute = () => {
  const authStatus = useAuthSession();
  const dashboardPath = getRoleBasedDashboardPathFromStorage();

  if (authStatus === "checking") {
    return null;
  }

  return authStatus === "authenticated" ? <Navigate to={dashboardPath} replace /> : <Outlet />;
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
            element: <KpiListPage />,
          },
        ],
      },
      {
        path: "/kpis/add",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <KpiCreatePage />,
          },
        ],
      },
      {
        path: "/kpi/view/:id",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <KpiDetailPage />,
          },
        ],
      },
      {
        path: "/kpi/update/:id",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <KpiUpdatePage />,
          },
        ],
      },
      {
        path: "/kpi/approve/:id",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <KpiApprovePage />,
          },
        ],
      },
      {
        path: "/my/kpi",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <MyKpiPage />,
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
        path: "/leave/requests/create",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <CreateLeavePage />,
          },
        ],
      },
      {
        path: "/leave/requests/edit/:id",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <UpdateLeavePage />,
          },
        ],
      },
      {
        path: "/leave/requests/view/:id",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <UpdateLeavePage />,
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
        path: "/leave/type",
        element: <Navigate to="/leave/type/manage" replace />,
      },
      {
        path: "/leave/policy",
        element: <Navigate to="/leave/policy/manage" replace />,
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
        path: "/admin/users/assign-roles",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AdminUserAssignRolesPage />,
          },
        ],
      },
      {
        path: "/admin/roles/assign-permissions",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AdminRoleAssignPermissionsPage />,
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
        path: "/admin/notifications",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AdminNotificationsPage />,
          },
        ],
      },
      {
        path: "/admin/email-notifications",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AdminEmailNotificationsPage />,
          },
        ],
      },
      {
        path: "/admin/audit-logs",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AdminAuditLogsPage />,
          },
        ],
      },
      {
        path: "/admin/import",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AdminImportPage />,
          },
        ],
      },
      {
        path: "/admin/biometric-devices",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AdminBiometricDevicesPage />,
          },
        ],
      },
      {
        path: "/notifications",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <NotificationsPage />,
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
        path: "/payroll",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <PayrollDashboard />,
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
        path: "/payroll/list",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <PayrollListPage />,
          },
        ],
      },
      {
        path: "/payroll/crud",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <PayrollCrudPage />,
          },
        ],
      },
      {
        path: "/payroll/approve",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <PayrollApprovePage />,
          },
        ],
      },
      {
        path: "/payroll/payment",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <PayrollPaymentPage />,
          },
        ],
      },
      {
        path: "/payroll/generate",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <PayrollGeneratePage />,
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
    element: <ProtectedRoute role={["super_admin", "admin", "hr", "manager"]} />,
    children: [
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
            element: <EmployeeCreatePage />,
          },
        ],
      },
      {
        path: "/employees/update/:id",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <EmployeeEditPage />,
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

