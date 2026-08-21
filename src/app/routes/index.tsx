import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy } from "react";
const NotFoundPage = lazy(() => import("../../pages/error/NotFoundPage"));
import { getRoleBasedDashboardPathFromStorage } from "@/features/auth/utils/roleRedirect";
import { ProtectedRoute } from "./ProtectedRoute";
import { MenuRouteGuard } from "./MenuRouteGuard";
import { useAuthSession } from "./useAuthSession";
import LoginPage from "../../pages/auth/login/LoginPage";
import GoogleCallbackPage from "../../pages/auth/login/GoogleCallbackPage";
import ForgotPasswordPage from "../../pages/auth/login/ForgotPasswordPage";
import ResetPasswordPage from "../../pages/auth/login/ResetPasswordPage";
import DashboardLayout from "../layouts/DashboardLayout";

const OverviewPage = lazy(() => import("../../pages/dashboard/overview/OverviewPage"));
const EmployeeDashboardPage = lazy(() => import("../../pages/dashboard/EmployeeDashboardPage"));
const EmployeesPage = lazy(() => import("../../pages/employee/EmployeesPage"));
const EmployeeCreatePage = lazy(() => import("../../pages/employee/EmployeeCreatePage"));
const EmployeeEditPage = lazy(() => import("../../pages/employee/EmployeeEditPage"));
const AttendanceOverviewPage = lazy(() => import("../../pages/attendance/AttendanceOverviewPage"));
const AttendanceCheckInPage = lazy(() => import("../../pages/attendance/AttendanceCheckInPage"));
const AttendanceCheckOutPage = lazy(() => import("../../pages/attendance/AttendanceCheckOutPage"));
const AttendanceHistoryPage = lazy(() => import("../../pages/attendance/AttendanceHistoryPage"));
const AttendanceTodayPage = lazy(() => import("../../pages/attendance/AttendanceTodayPage"));
const OvertimePage = lazy(() => import("../../pages/attendance/OvertimePage"));
const AttendanceReportsPage = lazy(() => import("../../pages/attendance/AttendanceReportsPage"));
const LeaveRequestsPage = lazy(() => import("../../pages/leave/LeaveRequestsPage"));
const CreateLeavePage = lazy(() => import("../../pages/leave/CreateLeavePage"));
const UpdateLeavePage = lazy(() => import("../../pages/leave/UpdateLeavePage"));
const LeaveBalancePage = lazy(() => import("../../pages/leave/LeaveBalancePage"));
const LeaveCalendarPage = lazy(() => import("../../pages/leave/LeaveCalendarPage"));
const LeaveApprovalPage = lazy(() => import("../../pages/leave/LeaveApprovalPage"));
const LeavePolicyPage = lazy(() => import("../../pages/admin/LeavePolicyPage"));
const LeavePolicyFormPage = lazy(() => import("../../pages/admin/LeavePolicyFormPage"));
const LeaveTypePage = lazy(() => import("../../pages/admin/LeaveTypePage"));
const LeaveTypeFormPage = lazy(() => import("../../pages/admin/LeaveTypeFormPage"));
const PayrollDashboard = lazy(() => import("../../pages/payroll/PayrollDashboard"));
const PayrollManagementPage = lazy(() => import("../../pages/payroll/PayrollManagementPage"));
const PayrollListPage = lazy(() => import("../../pages/payroll/PayrollListPage"));
const PayrollProcessPage = lazy(() => import("../../pages/payroll/PayrollProcessPage"));
const PayrollDetailsPage = lazy(() => import("../../pages/payroll/PayrollDetailsPage"));
const PayrollReportsPage = lazy(() => import("../../pages/payroll/PayrollReportsPage"));
const AdminReimbursementsPage = lazy(() => import("../../pages/admin/AdminReimbursementsPage"));
const MyReimbursementsPage = lazy(() => import("../../pages/ess/MyReimbursementsPage"));
const MyPayrollPage = lazy(() => import("../../pages/ess/MyPayrollPage"));
const MyLeavesPage = lazy(() => import("../../pages/ess/MyLeavesPage"));
const MyKpiPage = lazy(() => import("../../pages/ess/MyKpiPage"));
const MyTrainingsPage = lazy(() => import("../../pages/ess/MyTrainingsPage"));
const MyCompetenciesPage = lazy(() => import("../../pages/ess/MyCompetenciesPage"));
const MyDocumentsPage = lazy(() => import("../../pages/ess/MyDocumentsPage"));
const MyAssetsPage = lazy(() => import("../../pages/ess/MyAssetsPage.tsx"));
const KpiListPage = lazy(() => import("../../pages/admin/AdminKpiPage"));
const KpiFormPage = lazy(() => import("../../pages/admin/KpiFormPage"));
const CalibrationPage = lazy(() => import("../../pages/admin/CalibrationPage"));
const CalibrationFormPage = lazy(() => import("../../pages/admin/CalibrationFormPage"));
const TrainingManagementPage = lazy(() => import("../../pages/admin/TrainingManagementPage"));
const TrainingFormPage = lazy(() => import("../../pages/admin/TrainingFormPage.tsx"));
const CompetencyMatrixPage = lazy(() => import("../../pages/admin/CompetencyMatrixPage"));
const AssetManagementPage = lazy(() => import("../../pages/admin/AssetManagementPage"));
const AssetFormPage = lazy(() => import("../../pages/admin/AssetFormPage"));
const ApprovalFlowPage = lazy(() => import("../../pages/admin/ApprovalFlowPage"));
const OrgChartPage = lazy(() => import("../../pages/admin/OrgChartPage"));
const LocationsPage = lazy(() => import("../../pages/locations/LocationsPage"));
const CreateLocationPage = lazy(() => import("../../pages/locations/CreateLocationPage"));
const EditLocationPage = lazy(() => import("../../pages/locations/EditLocationPage"));
const WorkSchedulesPage = lazy(() => import("../../pages/work-schedule/WorkSchedulesPage"));
const WorkScheduleCreatePage = lazy(() => import("../../pages/work-schedule/WorkScheduleCreatePage"));
const WorkScheduleEditPage = lazy(() => import("../../pages/work-schedule/WorkScheduleEditPage"));
const AdminUsersPage = lazy(() => import("../../pages/admin/AdminUsersPage"));
const AdminRolesPage = lazy(() => import("../../pages/admin/AdminRolesPage"));
const AdminPermissionsPage = lazy(() => import("../../pages/admin/AdminPermissionsPage"));
const MenuPermissionsPage = lazy(() => import("../../pages/admin/MenuPermissionsPage"));
const AdminUserAssignRolesPage = lazy(() => import("../../pages/admin/AdminUserAssignRolesPage"));
const AdminRoleAssignPermissionsPage = lazy(() => import("../../pages/admin/AdminRoleAssignPermissionsPage"));
const AdminRoleFormPage = lazy(() => import("../../pages/admin/AdminRoleFormPage"));
const AdminNotificationsPage = lazy(() => import("../../pages/admin/AdminNotificationsPage"));
const AdminEmailSendPage = lazy(() => import("../../pages/admin/AdminEmailSendPage"));
const AdminEmailNotificationsPage = lazy(() => import("../../pages/admin/AdminEmailNotificationsPage"));
const AdminAuditLogsPage = lazy(() => import("../../pages/admin/AdminAuditLogsPage"));
const AdminImportPage = lazy(() => import("../../pages/admin/AdminImportPage"));
const NotificationsPage = lazy(() => import("../../pages/notifications/NotificationsPage"));
const MasterDataPage = lazy(() => import("../../pages/admin/MasterDataPage.tsx"));
const CompanySettingsPage = lazy(() => import("../../pages/admin/CompanySettingsPage.tsx"));
const NotificationSettingsPage = lazy(() => import("../../pages/admin/NotificationSettingsPage.tsx"));
const ProfilesPage = lazy(() => import("../../pages/profiles/ProfilesPage"));
const ReportsDashboardPage = lazy(() => import("../../pages/reports/ReportsDashboardPage"));

const RootRedirect = () => {
  const authStatus = useAuthSession();
  const dashboardPath = getRoleBasedDashboardPathFromStorage();
  if (authStatus === "checking") return null;
  return authStatus === "authenticated" ? (
    <Navigate to={dashboardPath} replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

const GuestRoute = () => {
  const authStatus = useAuthSession();
  const dashboardPath = getRoleBasedDashboardPathFromStorage();
  if (authStatus === "checking") return null;
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
      { path: "/login", element: <LoginPage /> },
      { path: "/auth/google/callback", element: <GoogleCallbackPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [{ index: true, element: <OverviewPage /> }],
      },
      {
        path: "/employee-dashboard",
        element: <DashboardLayout />,
        children: [{ index: true, element: <EmployeeDashboardPage /> }],
      },
      {
        path: "/employees",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="employees"><EmployeesPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/employees/add",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="employees"><EmployeeCreatePage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/employees/update/:id",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="employees"><EmployeeEditPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/profiles",
        element: <DashboardLayout />,
        children: [{ index: true, element: <ProfilesPage /> }],
      },
      {
        path: "/profiles/view/:id",
        element: <DashboardLayout />,
        children: [{ index: true, element: <ProfilesPage /> }],
      },
      {
        path: "/attendance",
        element: <DashboardLayout />,
        children: [{ index: true, element: <AttendanceOverviewPage /> }],
      },
      {
        path: "/attendance/check-in",
        element: <DashboardLayout />,
        children: [{ index: true, element: <AttendanceCheckInPage /> }],
      },
      {
        path: "/attendance/check-out",
        element: <DashboardLayout />,
        children: [{ index: true, element: <AttendanceCheckOutPage /> }],
      },
      {
        path: "/attendance/history",
        element: <DashboardLayout />,
        children: [{ index: true, element: <AttendanceHistoryPage /> }],
      },
      {
        path: "/attendance/today",
        element: <DashboardLayout />,
        children: [{ index: true, element: <AttendanceTodayPage /> }],
      },
      {
        path: "/attendance/overtime",
        element: <DashboardLayout />,
        children: [{ index: true, element: <OvertimePage /> }],
      },
      {
        path: "/attendance/reports",
        element: <DashboardLayout />,
        children: [{ index: true, element: <AttendanceReportsPage /> }],
      },
      {
        path: "/my/overtime",
        element: <DashboardLayout />,
        children: [{ index: true, element: <OvertimePage /> }],
      },
      {
        path: "/leave/requests",
        element: <DashboardLayout />,
        children: [{ index: true, element: <LeaveRequestsPage /> }],
      },
      {
        path: "/leave/requests/create",
        element: <DashboardLayout />,
        children: [{ index: true, element: <CreateLeavePage /> }],
      },
      {
        path: "/leave/request",
        element: <DashboardLayout />,
        children: [{ index: true, element: <CreateLeavePage /> }],
      },
      {
        path: "/leave/requests/edit/:id",
        element: <DashboardLayout />,
        children: [{ index: true, element: <UpdateLeavePage /> }],
      },
      {
        path: "/leave/requests/view/:id",
        element: <DashboardLayout />,
        children: [{ index: true, element: <UpdateLeavePage /> }],
      },
      {
        path: "/leave/request/:id",
        element: <DashboardLayout />,
        children: [{ index: true, element: <UpdateLeavePage /> }],
      },
      {
        path: "/leave/approval",
        element: <DashboardLayout />,
        children: [{ index: true, element: <LeaveApprovalPage /> }],
      },
      {
        path: "/leave/calendar",
        element: <DashboardLayout />,
        children: [{ index: true, element: <LeaveCalendarPage /> }],
      },
      {
        path: "/leave/balance",
        element: <DashboardLayout />,
        children: [{ index: true, element: <LeaveBalancePage /> }],
      },
      {
        path: "/leave/my-leave",
        element: <DashboardLayout />,
        children: [{ index: true, element: <MyLeavesPage /> }],
      },
      {
        path: "/leave/policy",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <LeavePolicyPage /> },
          { path: "create", element: <LeavePolicyFormPage /> },
          { path: "edit/:id", element: <LeavePolicyFormPage /> },
        ],
      },
      {
        path: "/leave/type",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <LeaveTypePage /> },
          { path: "create", element: <LeaveTypeFormPage /> },
          { path: "edit/:id", element: <LeaveTypeFormPage /> },
        ],
      },
      {
        path: "/payroll",
        element: <DashboardLayout />,
        children: [{ index: true, element: <PayrollDashboard /> }],
      },
      {
        path: "/payroll/list",
        element: <DashboardLayout />,
        children: [{ index: true, element: <PayrollListPage /> }],
      },
      {
        path: "/payroll/process",
        element: <DashboardLayout />,
        children: [{ index: true, element: <PayrollProcessPage /> }],
      },
      {
        path: "/payroll/run",
        element: <DashboardLayout />,
        children: [{ index: true, element: <PayrollManagementPage /> }],
      },
      {
        path: "/payroll/component",
        element: <DashboardLayout />,
        children: [{ index: true, element: <PayrollDetailsPage /> }],
      },
      {
        path: "/payroll/reports",
        element: <DashboardLayout />,
        children: [{ index: true, element: <PayrollReportsPage /> }],
      },
      {
        path: "/my/payroll",
        element: <DashboardLayout />,
        children: [{ index: true, element: <MyPayrollPage /> }],
      },
      {
        path: "/reimbursements",
        element: <DashboardLayout />,
        children: [{ index: true, element: <AdminReimbursementsPage /> }],
      },
      {
        path: "/my/reimbursements",
        element: <DashboardLayout />,
        children: [{ index: true, element: <MyReimbursementsPage /> }],
      },
      {
        path: "/kpis",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <KpiListPage /> },
          { path: "create", element: <KpiFormPage /> },
          { path: "edit/:id", element: <KpiFormPage /> },
        ],
      },
      {
        path: "/my/kpi",
        element: <DashboardLayout />,
        children: [{ index: true, element: <MyKpiPage /> }],
      },
      {
        path: "/performance/calibration",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <CalibrationPage /> },
          { path: "create", element: <CalibrationFormPage /> },
          { path: "edit/:id", element: <CalibrationFormPage /> },
        ],
      },
      {
        path: "/training",
        element: <DashboardLayout />,
        children: [{ index: true, element: <Navigate to="/training/programs" replace /> }],
      },
      {
        path: "/training/programs",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="pelatihan-kompetensi.pelatihan"><TrainingManagementPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/training/programs/create",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="pelatihan-kompetensi.pelatihan"><TrainingFormPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/training/programs/edit/:id",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="pelatihan-kompetensi.pelatihan"><TrainingFormPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/my/trainings",
        element: <DashboardLayout />,
        children: [{ index: true, element: <MyTrainingsPage /> }],
      },
      {
        path: "/competencies",
        element: <DashboardLayout />,
        children: [{ index: true, element: <CompetencyMatrixPage /> }],
      },
      {
        path: "/my/competencies",
        element: <DashboardLayout />,
        children: [{ index: true, element: <MyCompetenciesPage /> }],
      },
      {
        path: "/assets",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="assets"><AssetManagementPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/assets/create",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="assets"><AssetFormPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/assets/edit/:id",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="assets"><AssetFormPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/my/assets",
        element: <DashboardLayout />,
        children: [{ index: true, element: <MyAssetsPage /> }],
      },
      {
        path: "/my/documents",
        element: <DashboardLayout />,
        children: [{ index: true, element: <MyDocumentsPage /> }],
      },
      {
        path: "/approval-flows",
        element: <DashboardLayout />,
        children: [{ index: true, element: <ApprovalFlowPage /> }],
      },
      {
        path: "/organization/chart",
        element: <DashboardLayout />,
        children: [{ index: true, element: <OrgChartPage /> }],
      },
      {
        path: "/locations",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.master.lokasi"><LocationsPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/locations/create",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.master.lokasi"><CreateLocationPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/locations/edit/:id",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.master.lokasi"><EditLocationPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/work-schedules",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.master.jadwal-kerja"><WorkSchedulesPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/work-schedules/add",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.master.jadwal-kerja"><WorkScheduleCreatePage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/work-schedules/edit/:id",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.master.jadwal-kerja"><WorkScheduleEditPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/notifications",
        element: <DashboardLayout />,
        children: [{ index: true, element: <NotificationsPage /> }],
      },
      {
        path: "/reports",
        element: <DashboardLayout />,
        children: [{ index: true, element: <Navigate to="/reports/dashboard-summary" replace /> }],
      },
      {
        path: "/reports/dashboard-summary",
        element: <DashboardLayout />,
        children: [{ index: true, element: <ReportsDashboardPage /> }],
      },
      {
        path: "/admin/users",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.manajemen-akses.pengguna"><AdminUsersPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/admin/users/assign-roles",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.manajemen-akses.pengguna"><AdminUserAssignRolesPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/admin/roles",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.manajemen-akses.peran"><AdminRolesPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/admin/roles/create",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.manajemen-akses.peran"><AdminRoleFormPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/admin/roles/edit/:id",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.manajemen-akses.peran"><AdminRoleFormPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/admin/roles/assign-permissions",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.manajemen-akses.peran"><AdminRoleAssignPermissionsPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/admin/permissions",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.manajemen-akses.izin"><AdminPermissionsPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/admin/menu-permissions",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.manajemen-akses.menu"><MenuPermissionsPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/admin/notifications",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.notifikasi.admin"><AdminNotificationsPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/admin/notifications/email-send",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.notifikasi.kirim-email"><AdminEmailSendPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/admin/notifications/email-logs",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.notifikasi.log-email"><AdminEmailNotificationsPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/admin/audit-logs",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="alat-admin.sistem.log-audit"><AdminAuditLogsPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/admin/import",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="master-data.pusat-impor"><AdminImportPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/organization/master-data",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <MenuRouteGuard menuKey="master-data"><MasterDataPage /></MenuRouteGuard> },
        ],
      },
      {
        path: "/settings/company",
        element: <DashboardLayout />,
        children: [{ index: true, element: <CompanySettingsPage /> }],
      },
      {
        path: "/settings/notifications",
        element: <DashboardLayout />,
        children: [{ index: true, element: <NotificationSettingsPage /> }],
      },
      {
        path: "/settings/master-data/leave-type",
        element: <Navigate to="/leave/type" replace />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
