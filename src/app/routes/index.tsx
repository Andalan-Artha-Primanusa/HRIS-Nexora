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
const TimesheetPage = lazy(() => import("../../pages/attendance/TimesheetPage"));
const OvertimePage = lazy(() => import("../../pages/attendance/OvertimePage"));
const AttendanceReportsPage = lazy(() => import("../../pages/attendance/AttendanceReportsPage"));
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
const LeaveBalancePage = lazy(() => import("../../pages/leave/LeaveBalancePage"));
const EmployeeDashboardPage = lazy(() => import("../../pages/dashboard/EmployeeDashboardPage"));
const MyTrainingsPage = lazy(() => import("../../pages/ess/MyTrainingsPage"));
const MyCompetenciesPage = lazy(() => import("../../pages/ess/MyCompetenciesPage"));
const MyDocumentsPage = lazy(() => import("../../pages/ess/MyDocumentsPage"));
const LocationsPage = lazy(() => import("../../pages/locations/LocationsPage"));
const CreateLocationPage = lazy(() => import("../../pages/locations/CreateLocationPage"));
const EditLocationPage = lazy(() => import("../../pages/locations/EditLocationPage"));
const AdminUsersPage = lazy(() => import("../../pages/admin/AdminUsersPage"));
const AdminRolesPage = lazy(() => import("../../pages/admin/AdminRolesPage"));
const AdminPermissionsPage = lazy(() => import("../../pages/admin/AdminPermissionsPage"));
const AdminUserAssignRolesPage = lazy(() => import("../../pages/admin/AdminUserAssignRolesPage"));
const AdminRoleAssignPermissionsPage = lazy(() => import("../../pages/admin/AdminRoleAssignPermissionsPage"));
const AdminNotificationsPage = lazy(() => import("../../pages/admin/AdminNotificationsPage"));
const AdminEmailSendPage = lazy(() => import("../../pages/admin/AdminEmailSendPage"));
const AdminEmailNotificationsPage = lazy(() => import("../../pages/admin/AdminEmailNotificationsPage"));
const AdminAuditLogsPage = lazy(() => import("../../pages/admin/AdminAuditLogsPage"));
const AdminImportPage = lazy(() => import("../../pages/admin/AdminImportPage"));
const AdminRoleFormPage = lazy(() => import("../../pages/admin/AdminRoleFormPage"));
const AdminBiometricDevicesPage = lazy(() => import("../../pages/admin/AdminBiometricDevicesPage"));
const LeaveRequestsPage = lazy(() => import("../../pages/leave/LeaveRequestsPage"));
const CreateLeavePage = lazy(() => import("../../pages/leave/CreateLeavePage"));
const UpdateLeavePage = lazy(() => import("../../pages/leave/UpdateLeavePage"));
const LeaveCalendarPage = lazy(() => import("../../pages/leave/LeaveCalendarPage"));
const LeaveApprovalPage = lazy(() => import("../../pages/leave/LeaveApprovalPage"));
const PayrollManagementPage = lazy(() => import("../../pages/payroll/PayrollManagementPage"));
const PayrollDetailsPage = lazy(() => import("../../pages/payroll/PayrollDetailsPage"));
const PayrollListPage = lazy(() => import("../../pages/payroll/PayrollListPage"));
const PayrollCrudPage = lazy(() => import("../../pages/payroll/PayrollCrudPage"));
const PayrollApprovePage = lazy(() => import("../../pages/payroll/PayrollApprovePage"));
const PayrollPaymentPage = lazy(() => import("../../pages/payroll/PayrollPaymentPage"));
const PayrollGeneratePage = lazy(() => import("../../pages/payroll/PayrollGeneratePage"));
const PayrollDashboard = lazy(() => import("../../pages/payroll/PayrollDashboard"));
const NotificationsPage = lazy(() => import("../../pages/notifications/NotificationsPage"));
const ReportsDashboardPage = lazy(() => import("../../pages/reports/ReportsDashboardPage"));
const ReportsAttendancePage = lazy(() => import("../../pages/reports/ReportsAttendancePage"));
const ReportsLeavePage = lazy(() => import("../../pages/reports/ReportsLeavePage"));
const ReportsPayrollPage = lazy(() => import("../../pages/reports/ReportsPayrollPage"));
const PayrollTaxBPJSPage = lazy(() => import("../../pages/payroll/PayrollTaxPage"));
const PayrollReportsDetailedPage = lazy(() => import("../../pages/payroll/PayrollReportsDetailedPage"));
const ReportsAssetsPage = lazy(() => import("../../pages/reports/ReportsAssetsPage"));
const ReportsEmployeePage = lazy(() => import("../../pages/reports/ReportsEmployeePage"));
const WorkSchedulesPage = lazy(() => import("../../pages/work-schedule/WorkSchedulesPage"));
const WorkScheduleCreatePage = lazy(() => import("../../pages/work-schedule/WorkScheduleCreatePage"));
const WorkScheduleEditPage = lazy(() => import("../../pages/work-schedule/WorkScheduleEditPage"));
const JobOpeningsPage = lazy(() => import("../../pages/admin/JobOpeningsPage"));
const CandidatePipelinePage = lazy(() => import("../../pages/admin/CandidatePipelinePage"));
const TalentPoolPage = lazy(() => import("../../pages/admin/TalentPoolPage"));
const OkrManagementPage = lazy(() => import("../../pages/admin/OkrManagementPage"));
const EngagementSurveysPage = lazy(() => import("../../pages/admin/EngagementSurveysPage"));
const EngagementAnalyticsPage = lazy(() => import("../../pages/admin/EngagementAnalyticsPage"));
const SeveranceCalculatorPage = lazy(() => import("../../pages/admin/SeveranceCalculatorPage"));
const EmploymentLettersPage = lazy(() => import("../../pages/admin/EmploymentLettersPage"));
const OrgChartPage = lazy(() => import("../../pages/admin/OrgChartPage"));
const HrRequestsPage = lazy(() => import("../../pages/admin/HrRequestsPage"));
const ComplianceDashboardPage = lazy(() => import("../../pages/admin/ComplianceDashboardPage"));
const HolidayCalendarPage = lazy(() => import("../../pages/admin/HolidayCalendarPage"));
const TrainingProgramsPage = lazy(() => import("../../pages/admin/TrainingProgramsPage"));
const TrainingEnrollmentsPage = lazy(() => import("../../pages/admin/TrainingEnrollmentsPage"));
const CompetencyMatrixPage = lazy(() => import("../../pages/admin/CompetencyMatrixPage"));
const ApprovalFlowPage = lazy(() => import("../../pages/admin/ApprovalFlowPage"));
const ProgressiveTaxPage = lazy(() => import("../../pages/admin/ProgressiveTaxPage"));
const SuccessionMatrixPage = lazy(() => import("../../pages/admin/SuccessionMatrixPage"));
const IdpPage = lazy(() => import("../../pages/admin/IdpPage"));
const CalibrationPage = lazy(() => import("../../pages/admin/CalibrationPage"));
const Review360Page = lazy(() => import("../../pages/admin/Review360Page"));
const ShiftSwapsPage = lazy(() => import("../../pages/admin/ShiftSwapsPage"));
const OvertimeRulesPage = lazy(() => import("../../pages/admin/OvertimeRulesPage"));
const BiometricDevicesPage = lazy(() => import("../../pages/admin/BiometricDevicesPage"));
const CompensationPage = lazy(() => import("../../pages/admin/CompensationPage"));
const ComplianceSettingsPage = lazy(() => import("../../pages/admin/ComplianceSettingsPage"));
const AssetInventoryPage = lazy(() => import("../../pages/admin/AssetInventoryPage"));
const BenefitManagementPage = lazy(() => import("../../pages/admin/BenefitManagementPage"));
const DetailedPeopleAnalyticsPage = lazy(() => import("../../pages/admin/DetailedPeopleAnalyticsPage"));
const NotificationRulesPage = lazy(() => import("../../pages/admin/NotificationRulesPage"));
const JobOpeningFormPage = lazy(() => import("../../pages/admin/JobOpeningFormPage"));
const AssetFormPage = lazy(() => import("../../pages/admin/AssetFormPage"));
const OkrFormPage = lazy(() => import("../../pages/admin/OkrFormPage"));
const SurveyFormPage = lazy(() => import("../../pages/admin/SurveyFormPage"));
const BenefitFormPage = lazy(() => import("../../pages/admin/BenefitFormPage"));
const ExpenseCategoryPage = lazy(() => import("../../pages/admin/ExpenseCategoryPage"));
const MasterDataPage = lazy(() => import("../../pages/admin/MasterDataPage"));
const CompanySettingsPage = lazy(() => import("../../pages/admin/CompanySettingsPage"));
const NotificationSettingsPage = lazy(() => import("../../pages/admin/NotificationSettingsPage"));
const LeaveTypePage = lazy(() => import("../../pages/admin/LeaveTypePage"));
const LeavePolicyPage = lazy(() => import("../../pages/admin/LeavePolicyPage"));
const LeaveTypeFormPage = lazy(() => import("../../pages/admin/LeaveTypeFormPage"));
const LeavePolicyFormPage = lazy(() => import("../../pages/admin/LeavePolicyFormPage"));
const TrainingFormPage = lazy(() => import("../../pages/admin/TrainingFormPage.tsx"));
const BiometricDeviceFormPage = lazy(() => import("../../pages/admin/BiometricDeviceFormPage.tsx"));
const HolidayFormPage = lazy(() => import("../../pages/admin/HolidayFormPage.tsx"));
const OvertimeRuleFormPage = lazy(() => import("../../pages/admin/OvertimeRuleFormPage.tsx"));
const CalibrationFormPage = lazy(() => import("../../pages/admin/CalibrationFormPage.tsx"));
const HrRequestFormPage = lazy(() => import("../../pages/admin/HrRequestFormPage.tsx"));
const SlaPage = lazy(() => import("../../pages/admin/SlaPage.tsx"));
const AssetAssignmentsPage = lazy(() => import("../../pages/admin/AssetAssignmentsPage.tsx"));
const AssignmentLettersPage = lazy(() => import("../../pages/admin/AssignmentLettersPage.tsx"));
const MyAssetsPage = lazy(() => import("../../pages/ess/MyAssetsPage.tsx"));
const MyAssignmentLettersPage = lazy(() => import("../../pages/ess/MyAssignmentLettersPage.tsx"));
// const MyDocumentsPage = lazy(() => import("../../pages/ess/MyDocumentsPage.tsx"));
const ShiftSwapFormPage = lazy(() => import("../../pages/admin/ShiftSwapFormPage.tsx"));
const OvertimeApprovalPage = lazy(() => import("../../pages/admin/OvertimeApprovalPage.tsx"));


























const sectionRoutes = [
  { path: "/hr-summary" },
  { path: "/analytics" },
  { path: "/insights/people/detailed" },
  { path: "/organization/directory" },
  { path: "/organization/summary" },
  { path: "/organization/chart" },
  { path: "/organization/team" },
  { path: "/documents/review" },
  { path: "/documents/expiring" },
  { path: "/notifications" },
  { path: "/attendance/timesheet" },
  { path: "/attendance/overtime" },
  { path: "/attendance/reports" },
  { path: "/my/assets" },
  { path: "/my/trainings" },
  { path: "/my/competencies" },
  { path: "/my/requests" },
  { path: "/requests" },
  { path: "/requests/assign" },
  { path: "/requests/status" },
  { path: "/compliance/audit-summary" },
  { path: "/compliance/expiring-documents" },
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

  { path: "/reports/competency" },
  { path: "/reports/employee-lifecycle" },
  { path: "/reports/custom" },
  { path: "/settings/user-role" },
  { path: "/settings/permissions" },
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
        path: "/approval-flows",
        element: <DashboardLayout />,
        children: [{ index: true, element: <ApprovalFlowPage /> }],
      },
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
        path: "/employee-dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <EmployeeDashboardPage />,
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
        path: "/my/assets",
        element: <DashboardLayout />,
        children: [{ index: true, element: <MyAssetsPage /> }],
      },
      {
        path: "/my/assignment-letters",
        element: <DashboardLayout />,
        children: [{ index: true, element: <MyAssignmentLettersPage /> }],
      },
      {
        path: "/my/documents",
        element: <DashboardLayout />,
        children: [{ index: true, element: <MyDocumentsPage /> }],
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
        path: "/my/trainings",
        element: <DashboardLayout />,
        children: [{ index: true, element: <MyTrainingsPage /> }],
      },
      {
        path: "/my/competencies",
        element: <DashboardLayout />,
        children: [{ index: true, element: <MyCompetenciesPage /> }],
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
            element: <LeaveBalancePage />,
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
        path: "/leave/policy",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <LeavePolicyPage /> },
          { path: "create", element: <LeavePolicyFormPage /> },
          { path: "edit/:id", element: <LeavePolicyFormPage /> },
          { path: "manage", element: <SectionPage /> },
        ],
      },
      {
        path: "/leave/type",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <LeaveTypePage /> },
          { path: "create", element: <LeaveTypeFormPage /> },
          { path: "edit/:id", element: <LeaveTypeFormPage /> },
          { path: "manage", element: <SectionPage /> },
        ],
      },
      {
        path: "/settings/master-data/leave-type",
        element: <Navigate to="/leave/type" replace />,
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
        path: "/admin",
        element: <DashboardLayout />,
        children: [
          { path: "users", element: <AdminUsersPage /> },
          { path: "users/assign-roles", element: <AdminUserAssignRolesPage /> },
          { path: "roles", element: <AdminRolesPage /> },
          { path: "roles/create", element: <AdminRoleFormPage /> },
          { path: "roles/edit/:id", element: <AdminRoleFormPage /> },
          { path: "roles/assign-permissions", element: <AdminRoleAssignPermissionsPage /> },
          { path: "permissions", element: <AdminPermissionsPage /> },
          { path: "notifications", element: <AdminNotificationsPage /> },
          { path: "notifications/email-send", element: <AdminEmailSendPage /> },
          { path: "notifications/email-logs", element: <AdminEmailNotificationsPage /> },
          { path: "audit-logs", element: <AdminAuditLogsPage /> },
          { path: "import", element: <AdminImportPage /> },
          { path: "biometric-devices", element: <AdminBiometricDevicesPage /> },
        ],
      },
      {
        element: <DashboardLayout />,
        children: [
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
          { path: "/training/enrollments", element: <TrainingEnrollmentsPage /> },

          { path: "/competencies", element: <CompetencyMatrixPage /> },
          { path: "/career/succession", element: <SuccessionMatrixPage /> },
          { path: "/career/idps", element: <IdpPage /> },

          { path: "/performance/calibration", element: <CalibrationPage /> },
          { path: "/performance/calibration/create", element: <CalibrationFormPage /> },
          { path: "/performance/calibration/edit/:id", element: <CalibrationFormPage /> },
          { path: "/performance/reviews", element: <Review360Page /> },
          
          { path: "/workforce/shift-swaps", element: <ShiftSwapsPage /> },
          { path: "/workforce/shift-swaps/create", element: <ShiftSwapFormPage /> },
          { path: "/workforce/shift-swaps/edit/:id", element: <ShiftSwapFormPage /> },
          { path: "/workforce/overtime-rules", element: <OvertimeRulesPage /> },

          { path: "/workforce/overtime-rules/create", element: <OvertimeRuleFormPage /> },
          { path: "/workforce/overtime-rules/edit/:id", element: <OvertimeRuleFormPage /> },

          { path: "/biometric/devices", element: <BiometricDevicesPage /> },
          { path: "/enterprise/compensation", element: <CompensationPage /> },
          { path: "/overtime/approval", element: <OvertimeApprovalPage /> },
          { path: "/inventory/assets", element: <AssetInventoryPage /> },
          { path: "/assets", element: <AssetInventoryPage /> },
          { path: "/assets/assignments", element: <AssetAssignmentsPage /> },
          { path: "/inventory/assets/create", element: <AssetFormPage /> },
          { path: "/inventory/assets/edit/:id", element: <AssetFormPage /> },
          { path: "/compensation/benefits", element: <BenefitManagementPage /> },
          { path: "/compensation/benefits/create", element: <BenefitFormPage /> },
          { path: "/compensation/benefits/edit/:id", element: <BenefitFormPage /> },

          { path: "/analytics/people-detailed", element: <DetailedPeopleAnalyticsPage /> },
          { path: "/enterprise/notification-rules", element: <NotificationRulesPage /> },

          {
            path: "/settings",
            children: [
              { path: "company", element: <CompanySettingsPage /> },
              { path: "notification", element: <NotificationSettingsPage /> },
              { path: "notifications", element: <NotificationSettingsPage /> },
            ]
          },
          { path: "/organization/master-data", element: <MasterDataPage /> },
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
        path: "/payroll/tax",
        element: <DashboardLayout />,
        children: [{ index: true, element: <PayrollTaxBPJSPage /> }],
      },
      {
        path: "/payroll/reports",
        element: <DashboardLayout />,
        children: [{ index: true, element: <PayrollReportsDetailedPage /> }],
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
      {
        path: "/attendance/timesheet",
        element: <DashboardLayout />,
        children: [{ index: true, element: <TimesheetPage /> }],
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

