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
const KpiListPage = lazy(() => import("../../pages/admin/AdminKpiPage"));
const KpiFormPage = lazy(() => import("../../pages/admin/KpiFormPage"));
const MyKpiPage = lazy(() => import("../../pages/ess/MyKpiPage"));
const SectionPage = lazy(() => import("../../pages/dashboard/SectionPage"));
const ProfilesPage = lazy(() => import("../../pages/profiles/ProfilesPage"));
const EmployeesPage = lazy(() => import("../../pages/employee/EmployeesPage"));
const EmployeeCreatePage = lazy(() => import("../../pages/employee/EmployeeCreatePage"));
const EmployeeEditPage = lazy(() => import("../../pages/employee/EmployeeEditPage"));
const MyReimbursementsPage = lazy(() => import("../../pages/ess/MyReimbursementsPage"));
const AdminReimbursementsPage = lazy(() => import("../../pages/admin/AdminReimbursementsPage"));
const MyPayrollPage = lazy(() => import("../../pages/ess/MyPayrollPage"));
const MyLeavesPage = lazy(() => import("../../pages/ess/MyLeavesPage"));

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
const ReportsDashboardPage = lazy(() => import("../../pages/reports/ReportsDashboardPage"));
const ReportsAttendancePage = lazy(() => import("../../pages/reports/ReportsAttendancePage"));
const ReportsLeavePage = lazy(() => import("../../pages/reports/ReportsLeavePage"));
const ReportsPayrollPage = lazy(() => import("../../pages/reports/ReportsPayrollPage"));
const ReportsAssetsPage = lazy(() => import("../../pages/reports/ReportsAssetsPage"));
const ReportsEmployeePage = lazy(() => import("../../pages/reports/ReportsEmployeePage"));
const WorkSchedulesPage = lazy(() => import("../../pages/work-schedule/WorkSchedulesPage"));
const WorkScheduleCreatePage = lazy(() => import("../../pages/work-schedule/WorkScheduleCreatePage"));
const WorkScheduleEditPage = lazy(() => import("../../pages/work-schedule/WorkScheduleEditPage"));
const JobOpeningsPage = lazy(() => import("../../pages/admin/JobOpeningsPage.tsx"));
const CandidatePipelinePage = lazy(() => import("../../pages/admin/CandidatePipelinePage.tsx"));
const TalentPoolPage = lazy(() => import("../../pages/admin/TalentPoolPage.tsx"));
const OkrManagementPage = lazy(() => import("../../pages/admin/OkrManagementPage.tsx"));
const EngagementSurveysPage = lazy(() => import("../../pages/admin/EngagementSurveysPage.tsx"));
const EngagementAnalyticsPage = lazy(() => import("../../pages/admin/EngagementAnalyticsPage.tsx"));
const SeveranceCalculatorPage = lazy(() => import("../../pages/admin/SeveranceCalculatorPage.tsx"));
const EmploymentLettersPage = lazy(() => import("../../pages/admin/EmploymentLettersPage.tsx"));
const OrgChartPage = lazy(() => import("../../pages/admin/OrgChartPage.tsx"));
const HrRequestsPage = lazy(() => import("../../pages/admin/HrRequestsPage.tsx"));
const ComplianceDashboardPage = lazy(() => import("../../pages/admin/ComplianceDashboardPage.tsx"));
const HolidayCalendarPage = lazy(() => import("../../pages/admin/HolidayCalendarPage.tsx"));
const TrainingProgramsPage = lazy(() => import("../../pages/admin/TrainingProgramsPage.tsx"));
const CompetencyMatrixPage = lazy(() => import("../../pages/admin/CompetencyMatrixPage.tsx"));
const ApprovalFlowPage = lazy(() => import("../../pages/admin/ApprovalFlowPage.tsx"));
const ProgressiveTaxPage = lazy(() => import("../../pages/admin/ProgressiveTaxPage.tsx"));
const SuccessionMatrixPage = lazy(() => import("../../pages/admin/SuccessionMatrixPage.tsx"));
const IdpPage = lazy(() => import("../../pages/admin/IdpPage.tsx"));
const CalibrationPage = lazy(() => import("../../pages/admin/CalibrationPage.tsx"));
const Review360Page = lazy(() => import("../../pages/admin/Review360Page.tsx"));
const ShiftSwapsPage = lazy(() => import("../../pages/admin/ShiftSwapsPage.tsx"));
const OvertimeRulesPage = lazy(() => import("../../pages/admin/OvertimeRulesPage.tsx"));
const BiometricDevicesPage = lazy(() => import("../../pages/admin/BiometricDevicesPage.tsx"));
const CompensationPage = lazy(() => import("../../pages/admin/CompensationPage.tsx"));
const ComplianceSettingsPage = lazy(() => import("../../pages/admin/ComplianceSettingsPage.tsx"));
const AssetInventoryPage = lazy(() => import("../../pages/admin/AssetInventoryPage.tsx"));
const BenefitManagementPage = lazy(() => import("../../pages/admin/BenefitManagementPage.tsx"));
const DetailedPeopleAnalyticsPage = lazy(() => import("../../pages/admin/DetailedPeopleAnalyticsPage.tsx"));
const NotificationRulesPage = lazy(() => import("../../pages/admin/NotificationRulesPage.tsx"));
const JobOpeningFormPage = lazy(() => import("../../pages/admin/JobOpeningFormPage.tsx"));
const AssetFormPage = lazy(() => import("../../pages/admin/AssetFormPage.tsx"));
const OkrFormPage = lazy(() => import("../../pages/admin/OkrFormPage.tsx"));
const SurveyFormPage = lazy(() => import("../../pages/admin/SurveyFormPage.tsx"));
const BenefitFormPage = lazy(() => import("../../pages/admin/BenefitFormPage.tsx"));
const TrainingFormPage = lazy(() => import("../../pages/admin/TrainingFormPage.tsx"));
const BiometricDeviceFormPage = lazy(() => import("../../pages/admin/BiometricDeviceFormPage.tsx"));
const HolidayFormPage = lazy(() => import("../../pages/admin/HolidayFormPage.tsx"));
const OvertimeRuleFormPage = lazy(() => import("../../pages/admin/OvertimeRuleFormPage.tsx"));
const CalibrationFormPage = lazy(() => import("../../pages/admin/CalibrationFormPage.tsx"));
const HrRequestFormPage = lazy(() => import("../../pages/admin/HrRequestFormPage.tsx"));
const SlaPage = lazy(() => import("../../pages/admin/SlaPage.tsx"));

























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

  { path: "/reports/competency" },
  { path: "/reports/employee-lifecycle" },
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
          {
            path: "create",
            element: <KpiFormPage />,
          },
          {
            path: "edit/:id",
            element: <KpiFormPage />,
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
        path: "/my/reimbursements",
        element: <DashboardLayout />,
        children: [{ index: true, element: <MyReimbursementsPage /> }],
      },
      {
        path: "/reimbursements",
        element: <DashboardLayout />,
        children: [{ index: true, element: <AdminReimbursementsPage /> }],
      },
      {
        path: "/expense/submit",
        element: <DashboardLayout />,
        children: [{ index: true, element: <MyReimbursementsPage /> }],
      },
      {
        path: "/expense/list",
        element: <DashboardLayout />,
        children: [{ index: true, element: <AdminReimbursementsPage /> }],
      },
      {
        path: "/expense/approval",
        element: <DashboardLayout />,
        children: [{ index: true, element: <AdminReimbursementsPage /> }],
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
        path: "/work-schedules",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <WorkSchedulesPage />,
          },
        ],
      },
      {
        path: "/work-schedules/add",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <WorkScheduleCreatePage />,
          },
        ],
      },
      {
        path: "/work-schedules/edit/:id",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <WorkScheduleEditPage />,
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
        element: <DashboardLayout />,
        children: [
          { path: "/admin/import", element: <AdminImportPage /> },
          { path: "/admin/biometric-devices", element: <AdminBiometricDevicesPage /> },
          { path: "/admin/biometric-devices/create", element: <BiometricDeviceFormPage /> },
          { path: "/admin/biometric-devices/edit/:id", element: <BiometricDeviceFormPage /> },

          { path: "/recruitment/openings", element: <JobOpeningsPage /> },
          { path: "/recruitment/openings/create", element: <JobOpeningFormPage /> },
          { path: "/recruitment/openings/edit/:id", element: <JobOpeningFormPage /> },
          { path: "/recruitment/candidates", element: <CandidatePipelinePage /> },
          { path: "/recruitment/talent-pool", element: <TalentPoolPage /> },
          
          { path: "/performance/okrs", element: <OkrManagementPage /> },
          { path: "/performance/okrs/create", element: <OkrFormPage /> },
          { path: "/performance/okrs/edit/:id", element: <OkrFormPage /> },
          
          { path: "/engagement/surveys", element: <EngagementSurveysPage /> },
          { path: "/engagement/surveys/create", element: <SurveyFormPage /> },
          { path: "/engagement/surveys/edit/:id", element: <SurveyFormPage /> },
          { path: "/engagement/analytics", element: <EngagementAnalyticsPage /> },
          { path: "/engagement/analytics/:id", element: <EngagementAnalyticsPage /> },

          { path: "/legal/severance", element: <SeveranceCalculatorPage /> },
          { path: "/legal/letters", element: <EmploymentLettersPage /> },
          { path: "/legal/tax", element: <ProgressiveTaxPage /> },
          
          { path: "/organization/chart", element: <OrgChartPage /> },
          { path: "/hr-requests", element: <HrRequestsPage /> },
          { path: "/hr-requests/respond/:id", element: <HrRequestFormPage /> },
          { path: "/hr-requests/sla", element: <SlaPage /> },
          
          { path: "/compliance/overview", element: <ComplianceDashboardPage /> },
          { path: "/compliance/settings", element: <ComplianceSettingsPage /> },
          
          { path: "/workforce/holidays", element: <HolidayCalendarPage /> },
          { path: "/workforce/holidays/create", element: <HolidayFormPage /> },
          { path: "/workforce/holidays/edit/:id", element: <HolidayFormPage /> },

          { path: "/training/programs", element: <TrainingProgramsPage /> },
          { path: "/training/programs/create", element: <TrainingFormPage /> },
          { path: "/training/programs/edit/:id", element: <TrainingFormPage /> },

          { path: "/competencies", element: <CompetencyMatrixPage /> },
          { path: "/approval-flows", element: <ApprovalFlowPage /> },
          { path: "/career/succession", element: <SuccessionMatrixPage /> },
          { path: "/career/idps", element: <IdpPage /> },

          { path: "/performance/calibration", element: <CalibrationPage /> },
          { path: "/performance/calibration/create", element: <CalibrationFormPage /> },
          { path: "/performance/calibration/edit/:id", element: <CalibrationFormPage /> },
          { path: "/performance/reviews", element: <Review360Page /> },
          
          { path: "/workforce/shift-swaps", element: <ShiftSwapsPage /> },
          { path: "/workforce/overtime-rules", element: <OvertimeRulesPage /> },
          { path: "/workforce/overtime-rules/create", element: <OvertimeRuleFormPage /> },
          { path: "/workforce/overtime-rules/edit/:id", element: <OvertimeRuleFormPage /> },

          { path: "/biometric/devices", element: <BiometricDevicesPage /> },
          { path: "/enterprise/compensation", element: <CompensationPage /> },
          { path: "/inventory/assets", element: <AssetInventoryPage /> },
          { path: "/inventory/assets/create", element: <AssetFormPage /> },
          { path: "/inventory/assets/edit/:id", element: <AssetFormPage /> },
          { path: "/compensation/benefits", element: <BenefitManagementPage /> },
          { path: "/compensation/benefits/create", element: <BenefitFormPage /> },
          { path: "/compensation/benefits/edit/:id", element: <BenefitFormPage /> },

          { path: "/analytics/people-detailed", element: <DetailedPeopleAnalyticsPage /> },
          { path: "/enterprise/notification-rules", element: <NotificationRulesPage /> },
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
      {
        path: "/reports/dashboard-summary",
        element: <DashboardLayout />,
        children: [{ index: true, element: <ReportsDashboardPage /> }],
      },
      {
        path: "/reports/attendance",
        element: <DashboardLayout />,
        children: [{ index: true, element: <ReportsAttendancePage /> }],
      },
      {
        path: "/reports/leave",
        element: <DashboardLayout />,
        children: [{ index: true, element: <ReportsLeavePage /> }],
      },
      {
        path: "/reports/payroll",
        element: <DashboardLayout />,
        children: [{ index: true, element: <ReportsPayrollPage /> }],
      },
      {
        path: "/reports/assets",
        element: <DashboardLayout />,
        children: [{ index: true, element: <ReportsAssetsPage /> }],
      },
      {
        path: "/reports/employee",
        element: <DashboardLayout />,
        children: [{ index: true, element: <ReportsEmployeePage /> }],
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

