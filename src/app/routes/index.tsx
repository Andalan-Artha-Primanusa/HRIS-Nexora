import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy } from "react";
import { getRoleBasedDashboardPathFromStorage } from "@/features/auth/utils/roleRedirect";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuthSession } from "./useAuthSession";
import LoginPage from "../../pages/auth/login/LoginPage";
import GoogleCallbackPage from "../../pages/auth/login/GoogleCallbackPage";
import RegisterPage from "../../pages/auth/register/RegisterPage";
import DashboardLayout from "../layouts/DashboardLayout";

// Lazy Pages
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
const MyTrainingsPage = lazy(() => import("../../pages/ess/MyTrainingsPage"));
const MyCompetenciesPage = lazy(() => import("../../pages/ess/MyCompetenciesPage"));

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
const TrainingFormPage = lazy(() => import("../../pages/admin/TrainingFormPage"));
const BiometricDeviceFormPage = lazy(() => import("../../pages/admin/BiometricDeviceFormPage"));
const HolidayFormPage = lazy(() => import("../../pages/admin/HolidayFormPage"));
const OvertimeRuleFormPage = lazy(() => import("../../pages/admin/OvertimeRuleFormPage"));
const CalibrationFormPage = lazy(() => import("../../pages/admin/CalibrationFormPage"));
const HrRequestFormPage = lazy(() => import("../../pages/admin/HrRequestFormPage"));
const SlaPage = lazy(() => import("../../pages/admin/SlaPage"));
const AssetAssignmentsPage = lazy(() => import("../../pages/admin/AssetAssignmentsPage"));
const AssignmentLettersPage = lazy(() => import("../../pages/admin/AssignmentLettersPage"));
const MyAssetsPage = lazy(() => import("../../pages/ess/MyAssetsPage"));
const MyAssignmentLettersPage = lazy(() => import("../../pages/ess/MyAssignmentLettersPage"));
const MyDocumentsPage = lazy(() => import("../../pages/ess/MyDocumentsPage"));
const ShiftSwapFormPage = lazy(() => import("../../pages/admin/ShiftSwapFormPage"));

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
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // Dashboard
          { path: "/dashboard", element: <OverviewPage /> },
          { path: "/hr-summary", element: <SectionPage /> },
          { path: "/analytics", element: <SectionPage /> },
          
          // Attendance
          { path: "/attendance", element: <AttendanceOverviewPage /> },
          { path: "/attendance/check-in", element: <AttendanceCheckInPage /> },
          { path: "/attendance/check-out", element: <AttendanceCheckOutPage /> },
          { path: "/attendance/history", element: <AttendanceHistoryPage /> },
          { path: "/attendance/today", element: <AttendanceTodayPage /> },
          { path: "/attendance/daily", element: <AttendanceAdminPage /> },
          { path: "/attendance/timesheet", element: <TimesheetPage /> },
          { path: "/attendance/overtime", element: <OvertimePage /> },
          { path: "/attendance/reports", element: <AttendanceReportsPage /> },

          // KPI
          { path: "/kpis", element: <KpiListPage /> },
          { path: "/kpis/create", element: <KpiFormPage /> },
          { path: "/kpis/edit/:id", element: <KpiFormPage /> },
          { path: "/my/kpi", element: <MyKpiPage /> },

          // ESS (Employee Self Service)
          { path: "/my/reimbursements", element: <MyReimbursementsPage /> },
          { path: "/my/assets", element: <MyAssetsPage /> },
          { path: "/my/assignment-letters", element: <MyAssignmentLettersPage /> },
          { path: "/my/documents", element: <MyDocumentsPage /> },
          { path: "/my/payroll", element: <MyPayrollPage /> },
          { path: "/my/trainings", element: <MyTrainingsPage /> },
          { path: "/my/competencies", element: <MyCompetenciesPage /> },
          { path: "/my/requests", element: <SectionPage /> },

          // Expense / Reimbursements
          { path: "/reimbursements", element: <AdminReimbursementsPage /> },
          { path: "/expense/submit", element: <MyReimbursementsPage /> },
          { path: "/expense/list", element: <AdminReimbursementsPage /> },
          { path: "/expense/approval", element: <AdminReimbursementsPage /> },
          { path: "/expense/categories", element: <ExpenseCategoryPage /> },
          { path: "/expense/reports", element: <SectionPage /> },

          // Leave
          { path: "/leave/my-leave", element: <MyLeavesPage /> },
          { path: "/leave/balance", element: <MyLeavesPage /> },
          { path: "/leave/requests", element: <LeaveRequestsPage /> },
          { path: "/leave/requests/create", element: <CreateLeavePage /> },
          { path: "/leave/requests/edit/:id", element: <UpdateLeavePage /> },
          { path: "/leave/requests/view/:id", element: <UpdateLeavePage /> },
          { path: "/leave/calendar", element: <LeaveCalendarPage /> },
          { path: "/leave/approval", element: <LeaveApprovalPage /> },
          { path: "/leave/policy", element: <LeavePolicyPage /> },
          { path: "/leave/policy/create", element: <LeavePolicyFormPage /> },
          { path: "/leave/policy/edit/:id", element: <LeavePolicyFormPage /> },
          { path: "/leave/type", element: <LeaveTypePage /> },
          { path: "/leave/type/create", element: <LeaveTypeFormPage /> },
          { path: "/leave/type/edit/:id", element: <LeaveTypeFormPage /> },

          // Profiles
          { path: "/profiles", element: <ProfilesPage /> },
          { path: "/profiles/add", element: <ProfilesPage /> },
          { path: "/profiles/view/:id", element: <ProfilesPage /> },
          { path: "/profiles/update/:id", element: <ProfilesPage /> },

          // Locations & Schedules
          { path: "/locations", element: <LocationsPage /> },
          { path: "/locations/create", element: <CreateLocationPage /> },
          { path: "/locations/edit/:id", element: <EditLocationPage /> },
          { path: "/work-schedules", element: <WorkSchedulesPage /> },
          { path: "/work-schedules/add", element: <WorkScheduleCreatePage /> },
          { path: "/work-schedules/edit/:id", element: <WorkScheduleEditPage /> },

          // Admin
          { path: "/admin/users", element: <AdminUsersPage /> },
          { path: "/admin/roles", element: <AdminRolesPage /> },
          { path: "/admin/users/assign-roles", element: <AdminUserAssignRolesPage /> },
          { path: "/admin/roles/assign-permissions", element: <AdminRoleAssignPermissionsPage /> },
          { path: "/admin/permissions", element: <AdminPermissionsPage /> },
          { path: "/admin/notifications", element: <AdminNotificationsPage /> },
          { path: "/admin/email-notifications", element: <AdminEmailNotificationsPage /> },
          { path: "/admin/audit-logs", element: <AdminAuditLogsPage /> },
          { path: "/admin/import", element: <AdminImportPage /> },
          { path: "/admin/biometric-devices", element: <AdminBiometricDevicesPage /> },
          { path: "/admin/biometric-devices/create", element: <BiometricDeviceFormPage /> },
          { path: "/admin/biometric-devices/edit/:id", element: <BiometricDeviceFormPage /> },
          { path: "/admin/assignment-letters", element: <AssignmentLettersPage /> },

          // Recruitment
          { path: "/recruitment/openings", element: <JobOpeningsPage /> },
          { path: "/recruitment/openings/create", element: <JobOpeningFormPage /> },
          { path: "/recruitment/openings/edit/:id", element: <JobOpeningFormPage /> },
          { path: "/recruitment/candidates", element: <CandidatePipelinePage /> },
          { path: "/recruitment/talent-pool", element: <TalentPoolPage /> },

          // Performance & Career
          { path: "/performance", element: <SectionPage /> },
          { path: "/performance/summary", element: <SectionPage /> },
          { path: "/performance/cycles", element: <SectionPage /> },
          { path: "/performance/okrs", element: <OkrManagementPage /> },
          { path: "/performance/okrs/create", element: <OkrFormPage /> },
          { path: "/performance/okrs/edit/:id", element: <OkrFormPage /> },
          { path: "/performance/reviews", element: <Review360Page /> },
          { path: "/performance/360-reviews", element: <SectionPage /> },
          { path: "/performance/calibration", element: <CalibrationPage /> },
          { path: "/performance/calibration/create", element: <CalibrationFormPage /> },
          { path: "/performance/calibration/edit/:id", element: <CalibrationFormPage /> },
          { path: "/career/idps", element: <IdpPage /> },
          { path: "/career/succession", element: <SuccessionMatrixPage /> },

          // Engagement
          { path: "/engagement/surveys", element: <EngagementSurveysPage /> },
          { path: "/engagement/surveys/create", element: <SurveyFormPage /> },
          { path: "/engagement/surveys/edit/:id", element: <SurveyFormPage /> },
          { path: "/engagement/analytics", element: <EngagementAnalyticsPage /> },
          { path: "/engagement/analytics/:id", element: <EngagementAnalyticsPage /> },

          // Legal & Compliance
          { path: "/legal/severance", element: <SeveranceCalculatorPage /> },
          { path: "/legal/letters", element: <EmploymentLettersPage /> },
          { path: "/legal/tax", element: <ProgressiveTaxPage /> },
          { path: "/compliance/overview", element: <ComplianceDashboardPage /> },
          { path: "/compliance/settings", element: <ComplianceSettingsPage /> },
          { path: "/compliance/audit-summary", element: <SectionPage /> },
          { path: "/compliance/expiring-documents", element: <SectionPage /> },

          // Organization
          { path: "/organization/chart", element: <OrgChartPage /> },
          { path: "/organization/directory", element: <SectionPage /> },
          { path: "/organization/summary", element: <SectionPage /> },
          { path: "/organization/team", element: <SectionPage /> },
          { path: "/organization/master-data", element: <MasterDataPage /> },

          // HR Requests
          { path: "/hr-requests", element: <HrRequestsPage /> },
          { path: "/hr-requests/respond/:id", element: <HrRequestFormPage /> },
          { path: "/hr-requests/sla", element: <SlaPage /> },

          // Workforce
          { path: "/workforce/holidays", element: <HolidayCalendarPage /> },
          { path: "/workforce/holidays/create", element: <HolidayFormPage /> },
          { path: "/workforce/holidays/edit/:id", element: <HolidayFormPage /> },
          { path: "/workforce/shift-swaps", element: <ShiftSwapsPage /> },
          { path: "/workforce/shift-swaps/create", element: <ShiftSwapFormPage /> },
          { path: "/workforce/shift-swaps/edit/:id", element: <ShiftSwapFormPage /> },
          { path: "/workforce/overtime-rules", element: <OvertimeRulesPage /> },
          { path: "/workforce/overtime-rules/create", element: <OvertimeRuleFormPage /> },
          { path: "/workforce/overtime-rules/edit/:id", element: <OvertimeRuleFormPage /> },

          // Training & Competencies
          { path: "/training/programs", element: <TrainingProgramsPage /> },
          { path: "/training/programs/create", element: <TrainingFormPage /> },
          { path: "/training/programs/edit/:id", element: <TrainingFormPage /> },
          { path: "/training/enrollments", element: <TrainingEnrollmentsPage /> },
          { path: "/competencies", element: <CompetencyMatrixPage /> },

          // Assets Inventory
          { path: "/inventory/assets", element: <AssetInventoryPage /> },
          { path: "/assets", element: <AssetInventoryPage /> },
          { path: "/assets/assignments", element: <AssetAssignmentsPage /> },
          { path: "/inventory/assets/create", element: <AssetFormPage /> },
          { path: "/inventory/assets/edit/:id", element: <AssetFormPage /> },

          // Compensation & Benefits
          { path: "/enterprise/compensation", element: <CompensationPage /> },
          { path: "/compensation/benefits", element: <BenefitManagementPage /> },
          { path: "/compensation/benefits/create", element: <BenefitFormPage /> },
          { path: "/compensation/benefits/edit/:id", element: <BenefitFormPage /> },

          // Settings
          { path: "/settings/company", element: <CompanySettingsPage /> },
          { path: "/settings/notification", element: <NotificationSettingsPage /> },
          { path: "/settings/master-data/expense-category", element: <ExpenseCategoryPage /> },
          { path: "/settings/user-role", element: <SectionPage /> },
          { path: "/settings/permissions", element: <SectionPage /> },

          // Notifications & Reports
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/reports/dashboard-summary", element: <ReportsDashboardPage /> },
          { path: "/reports/attendance", element: <ReportsAttendancePage /> },
          { path: "/reports/leave", element: <ReportsLeavePage /> },
          { path: "/reports/payroll", element: <ReportsPayrollPage /> },
          { path: "/reports/assets", element: <ReportsAssetsPage /> },
          { path: "/reports/employee", element: <ReportsEmployeePage /> },
          { path: "/reports/competency", element: <SectionPage /> },
          { path: "/reports/employee-lifecycle", element: <SectionPage /> },
          { path: "/reports/custom", element: <SectionPage /> },

          // Payroll Admin
          { path: "/payroll", element: <PayrollDashboard /> },
          { path: "/payroll/run", element: <PayrollManagementPage /> },
          { path: "/payroll/list", element: <PayrollListPage /> },
          { path: "/payroll/crud", element: <PayrollCrudPage /> },
          { path: "/payroll/approve", element: <PayrollApprovePage /> },
          { path: "/payroll/payment", element: <PayrollPaymentPage /> },
          { path: "/payroll/generate", element: <PayrollGeneratePage /> },
          { path: "/payroll/component/allowance", element: <PayrollDetailsPage /> },
          { path: "/payroll/component/deduction", element: <PayrollDetailsPage /> },
          { path: "/payroll/tax", element: <PayrollTaxBPJSPage /> },
          { path: "/payroll/reports", element: <PayrollReportsDetailedPage /> },

          // Other
          { path: "/approval-flows", element: <ApprovalFlowPage /> },
          { path: "/documents/review", element: <SectionPage /> },
          { path: "/documents/expiring", element: <SectionPage /> },
          { path: "/enterprise/notification-rules", element: <NotificationRulesPage /> },
          { path: "/analytics/people-detailed", element: <DetailedPeopleAnalyticsPage /> },
          { path: "/insights/people/detailed", element: <SectionPage /> },
        ],
      },
      // Restricted access routes
      {
        element: <DashboardLayout />,
        children: [
          {
            element: <ProtectedRoute role={["super_admin", "admin", "hr", "manager"]} />,
            children: [
              { path: "/employees", element: <EmployeesPage /> },
              { path: "/employees/add", element: <EmployeeCreatePage /> },
              { path: "/employees/update/:id", element: <EmployeeEditPage /> },
            ],
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
