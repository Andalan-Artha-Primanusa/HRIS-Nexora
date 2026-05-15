# Peta Flow Frontend HRIS

Sumber utama:
- `src/app/routes/index.tsx`
- `src/app/routes/ProtectedRoute.tsx`
- `src/app/routes/MenuRouteGuard.tsx`
- `src/shared/config/menu.ts`
- `src/features/**/api/*.service.ts`

## Model akses frontend

1. Route publik / guest:
   - `/login`
   - `/auth/google/callback`
   - `/register`
   - `/forgot-password`
   - `/reset-password`

2. Route protected:
   - Mayoritas route berada di bawah `<ProtectedRoute />`, artinya hanya butuh sesi login valid dari sisi frontend.
   - `ProtectedRoute` mendukung prop `role`, tetapi pada router saat ini tidak ada route yang benar-benar memasang `role={[...]}`.

3. Route dengan guard tambahan berbasis menu:
   - `/employees*` → `employees`
   - `/locations*` → `alat-admin.master.lokasi`
   - `/work-schedules*` → `alat-admin.master.jadwal-kerja`
   - `/admin/users*` → `alat-admin.manajemen-akses.pengguna`
   - `/admin/roles*` → `alat-admin.manajemen-akses.peran`
   - `/admin/permissions` → `alat-admin.manajemen-akses.izin`
   - `/admin/menu-permissions` → `alat-admin.manajemen-akses.menu`
   - `/admin/notifications*` → submenu notifikasi admin
   - `/admin/audit-logs` → `alat-admin.sistem.log-audit`
   - `/admin/import` → `master-data.pusat-impor`
   - `/admin/biometric-devices` → `alat-admin.sistem.biometrik`

Catatan:
- Dari sudut frontend, istilah “role yang boleh akses” lebih akurat dibaca sebagai `public`, `authenticated`, atau `menuKey guarded`.
- Role bisnis seperti `admin`, `hr`, `manager`, `super_admin` lebih banyak ditegakkan di backend.

## Inventaris route aktif

| Modul | Path | Komponen / halaman | Akses frontend |
|---|---|---|---|
| Root | `/` | `RootRedirect` | Public redirect |
| Auth | `/login` | `LoginPage` | Guest only |
| Auth | `/auth/google/callback` | `GoogleCallbackPage` | Guest only |
| Auth | `/register` | `RegisterPage` | Guest only |
| Auth | `/forgot-password` | `ForgotPasswordPage` | Guest only |
| Auth | `/reset-password` | `ResetPasswordPage` | Guest only |
| Dashboard | `/dashboard` | `OverviewPage` | Authenticated |
| Dashboard | `/employee-dashboard` | `EmployeeDashboardPage` | Authenticated |
| Approval Flow | `/approval-flows` | `ApprovalFlowPage` | Authenticated |
| Attendance | `/attendance` | `AttendanceOverviewPage` | Authenticated |
| Attendance | `/attendance/check-in` | `AttendanceCheckInPage` | Authenticated |
| Attendance | `/attendance/check-out` | `AttendanceCheckOutPage` | Authenticated |
| Attendance | `/attendance/history` | `AttendanceHistoryPage` | Authenticated |
| Attendance | `/attendance/today` | `AttendanceTodayPage` | Authenticated |
| Attendance / Overtime | `/attendance/overtime` | `OvertimePage` | Authenticated |
| Attendance / Reports | `/attendance/reports` | `AttendanceReportsPage` | Authenticated |
| KPI | `/kpis` | `AdminKpiPage` | Authenticated |
| KPI | `/kpis/create` | `KpiFormPage` | Authenticated |
| KPI | `/kpis/edit/:id` | `KpiFormPage` | Authenticated |
| ESS KPI | `/my/kpi` | `MyKpiPage` | Authenticated |
| ESS | `/my/reimbursements` | `MyReimbursementsPage` | Authenticated |
| ESS | `/my/assets` | `MyAssetsPage` | Authenticated |
| ESS | `/my/assignment-letters` | `MyAssignmentLettersPage` | Authenticated |
| ESS | `/my/tasks` | `MyTasksPage` | Authenticated |
| ESS | `/my/promotions` | `MyPromotionsPage` | Authenticated |
| ESS | `/my/overtime` | `OvertimePage` | Authenticated |
| ESS | `/my/documents` | `MyDocumentsPage` | Authenticated |
| ESS | `/my/payroll` | `MyPayrollPage` | Authenticated |
| ESS | `/my/trainings` | `MyTrainingsPage` | Authenticated |
| ESS | `/my/competencies` | `MyCompetenciesPage` | Authenticated |
| Leave | `/leave/my-leave` | `MyLeavesPage` | Authenticated |
| Leave | `/leave/balance` | `LeaveBalancePage` | Authenticated |
| Leave | `/leave/requests` | `LeaveRequestsPage` | Authenticated |
| Leave | `/leave/requests/create` | `CreateLeavePage` | Authenticated |
| Leave | `/leave/request` | `CreateLeavePage` | Authenticated |
| Leave | `/leave/requests/edit/:id` | `UpdateLeavePage` | Authenticated |
| Leave | `/leave/requests/view/:id` | `UpdateLeavePage` | Authenticated |
| Leave | `/leave/request/:id` | `UpdateLeavePage` | Authenticated |
| Leave | `/leave/approval` | `LeaveApprovalPage` | Authenticated |
| Leave | `/leave/calendar` | `LeaveCalendarPage` | Authenticated |
| Leave master | `/leave/policy` | `LeavePolicyPage` | Authenticated |
| Leave master | `/leave/policy/create` | `LeavePolicyFormPage` | Authenticated |
| Leave master | `/leave/policy/edit/:id` | `LeavePolicyFormPage` | Authenticated |
| Leave master | `/leave/type` | `LeaveTypePage` | Authenticated |
| Leave master | `/leave/type/create` | `LeaveTypeFormPage` | Authenticated |
| Leave master | `/leave/type/edit/:id` | `LeaveTypeFormPage` | Authenticated |
| Profile | `/profiles` | `ProfilesPage` | Authenticated |
| Profile | `/profiles/add` | `ProfilesPage` | Authenticated |
| Profile | `/profiles/view/:id` | `ProfilesPage` | Authenticated |
| Profile | `/profiles/update/:id` | `ProfilesPage` | Authenticated |
| Reimbursement | `/reimbursements` | `AdminReimbursementsPage` | Authenticated |
| Reimbursement legacy | `/expense/submit` | `MyReimbursementsPage` | Authenticated |
| Reimbursement legacy | `/expense/list` | `AdminReimbursementsPage` | Authenticated |
| Reimbursement legacy | `/expense/approval` | `AdminReimbursementsPage` | Authenticated |
| Employee | `/employees` | `EmployeesPage` | Menu guarded |
| Employee | `/employees/add` | `EmployeeCreatePage` | Menu guarded |
| Employee | `/employees/update/:id` | `EmployeeEditPage` | Menu guarded |
| Location | `/locations` | `LocationsPage` | Menu guarded |
| Location | `/locations/create` | `CreateLocationPage` | Menu guarded |
| Location | `/locations/edit/:id` | `EditLocationPage` | Menu guarded |
| Work schedule | `/work-schedules` | `WorkSchedulesPage` | Menu guarded |
| Work schedule | `/work-schedules/add` | `WorkScheduleCreatePage` | Menu guarded |
| Work schedule | `/work-schedules/edit/:id` | `WorkScheduleEditPage` | Menu guarded |
| Admin access | `/admin/users` | `AdminUsersPage` | Menu guarded |
| Admin access | `/admin/users/assign-roles` | `AdminUserAssignRolesPage` | Menu guarded |
| Admin access | `/admin/roles` | `AdminRolesPage` | Menu guarded |
| Admin access | `/admin/roles/create` | `AdminRoleFormPage` | Menu guarded |
| Admin access | `/admin/roles/edit/:id` | `AdminRoleFormPage` | Menu guarded |
| Admin access | `/admin/roles/assign-permissions` | `AdminRoleAssignPermissionsPage` | Menu guarded |
| Admin access | `/admin/permissions` | `AdminPermissionsPage` | Menu guarded |
| Admin access | `/admin/menu-permissions` | `MenuPermissionsPage` | Menu guarded |
| Admin notifications | `/admin/notifications` | `AdminNotificationsPage` | Menu guarded |
| Admin notifications | `/admin/notifications/email-send` | `AdminEmailSendPage` | Menu guarded |
| Admin notifications | `/admin/notifications/email-logs` | `AdminEmailNotificationsPage` | Menu guarded |
| Admin system | `/admin/audit-logs` | `AdminAuditLogsPage` | Menu guarded |
| Admin system | `/admin/import` | `AdminImportPage` | Menu guarded |
| Admin system | `/admin/biometric-devices` | `AdminBiometricDevicesPage` | Menu guarded |
| Recruitment | `/recruitment/openings` | `JobOpeningsPage` | Authenticated |
| Recruitment | `/recruitment/openings/create` | `JobOpeningFormPage` | Authenticated |
| Recruitment | `/recruitment/openings/edit/:id` | `JobOpeningFormPage` | Authenticated |
| Recruitment | `/recruitment/candidates` | `CandidatePipelinePage` | Authenticated |
| Recruitment | `/recruitment/talent-pool` | `TalentPoolPage` | Authenticated |
| Performance | `/performance/okrs` | `OkrManagementPage` | Authenticated |
| Performance | `/performance/okrs/create` | `OkrFormPage` | Authenticated |
| Performance | `/performance/okrs/edit/:id` | `OkrFormPage` | Authenticated |
| Performance | `/performance/calibration` | `CalibrationPage` | Authenticated |
| Performance | `/performance/calibration/create` | `CalibrationFormPage` | Authenticated |
| Performance | `/performance/calibration/edit/:id` | `CalibrationFormPage` | Authenticated |
| Performance | `/performance/reviews` | `Review360Page` | Authenticated |
| Engagement | `/engagement/surveys` | `EngagementSurveysPage` | Authenticated |
| Engagement | `/engagement/surveys/create` | `SurveyFormPage` | Authenticated |
| Engagement | `/engagement/surveys/edit/:id` | `SurveyFormPage` | Authenticated |
| Engagement | `/engagement/analytics` | `EngagementAnalyticsPage` | Authenticated |
| Engagement | `/engagement/analytics/:id` | `EngagementAnalyticsPage` | Authenticated |
| Legal | `/legal/severance` | `SeveranceCalculatorPage` | Authenticated |
| Legal | `/legal/letters` | `EmploymentLettersPage` | Authenticated |
| Legal | `/legal/tax` | `ProgressiveTaxPage` | Authenticated |
| Legal | `/admin/assignment-letters` | `AssignmentLettersPage` | Authenticated |
| Organization | `/organization/chart` | `OrgChartPage` | Authenticated |
| Organization | `/organization/master-data` | `MasterDataPage` | Authenticated |
| HR Requests | `/hr-requests` | `HrRequestsPage` | Authenticated |
| HR Requests | `/hr-requests/respond/:id` | `HrRequestFormPage` | Authenticated |
| HR Requests | `/hr-requests/sla` | `SlaPage` | Authenticated |
| Compliance | `/compliance/overview` | `ComplianceDashboardPage` | Authenticated |
| Compliance | `/compliance/settings` | `ComplianceSettingsPage` | Authenticated |
| Workforce | `/workforce/holidays` | `HolidayCalendarPage` | Authenticated |
| Workforce | `/workforce/holidays/create` | `HolidayFormPage` | Authenticated |
| Workforce | `/workforce/holidays/edit/:id` | `HolidayFormPage` | Authenticated |
| Workforce | `/workforce/shift-swaps` | `ShiftSwapsPage` | Authenticated |
| Workforce | `/workforce/shift-swaps/create` | `ShiftSwapFormPage` | Authenticated |
| Workforce | `/workforce/shift-swaps/edit/:id` | `ShiftSwapFormPage` | Authenticated |
| Workforce | `/workforce/overtime-rules` | `OvertimeRulesPage` | Authenticated |
| Workforce | `/workforce/overtime-rules/create` | `OvertimeRuleFormPage` | Authenticated |
| Workforce | `/workforce/overtime-rules/edit/:id` | `OvertimeRuleFormPage` | Authenticated |
| Training | `/training/programs` | `TrainingManagementPage` | Authenticated |
| Training | `/training/programs/create` | `TrainingFormPage` | Authenticated |
| Training | `/training/programs/edit/:id` | `TrainingFormPage` | Authenticated |
| Competency | `/competencies` | `CompetencyMatrixPage` | Authenticated |
| Career | `/career/succession` | `SuccessionMatrixPage` | Authenticated |
| Career | `/career/idps` | `IdpPage` | Authenticated |
| Biometric | `/biometric/devices` | `BiometricDevicesPage` | Authenticated |
| Compensation | `/enterprise/compensation` | `CompensationPage` | Authenticated |
| Asset | `/inventory/assets` | `AssetManagementPage` | Authenticated |
| Asset | `/assets` | `AssetManagementPage` | Authenticated |
| Asset | `/inventory/assets/create` | `AssetFormPage` | Authenticated |
| Asset | `/inventory/assets/edit/:id` | `AssetFormPage` | Authenticated |
| Task | `/tasks` | `TaskManagementPage` | Authenticated |
| Promotion | `/promotions` | `PromotionPage` | Authenticated |
| Benefits | `/compensation/benefits` | `BenefitManagementPage` | Authenticated |
| Benefits | `/compensation/benefits/create` | `BenefitFormPage` | Authenticated |
| Benefits | `/compensation/benefits/edit/:id` | `BenefitFormPage` | Authenticated |
| Analytics | `/analytics/people-detailed` | `DetailedPeopleAnalyticsPage` | Authenticated |
| Enterprise notifications | `/enterprise/notification-rules` | `NotificationRulesPage` | Authenticated |
| Settings | `/settings/company` | `CompanySettingsPage` | Authenticated |
| Settings | `/settings/notification` | `NotificationSettingsPage` | Authenticated |
| Settings | `/settings/notifications` | `NotificationSettingsPage` | Authenticated |
| Notifications | `/notifications` | `NotificationsPage` | Authenticated |
| Payroll | `/payroll` | `PayrollDashboard` | Authenticated |
| Payroll | `/payroll/run` | `PayrollManagementPage` | Authenticated |
| Payroll | `/payroll/list` | `PayrollListPage` | Authenticated |
| Payroll | `/payroll/process` | `PayrollProcessPage` | Authenticated |
| Payroll | `/payroll/reports` | `PayrollReportsPage` | Authenticated |
| Payroll | `/payroll/component` | `PayrollDetailsPage` | Authenticated |
| Reports | `/reports/dashboard-summary` | `ReportsDashboardPage` | Authenticated |

## Generic / placeholder route

Route berikut diarahkan ke `SectionPage`, bukan halaman khusus:

- `/hr-summary`
- `/analytics`
- `/insights/people/detailed`
- `/organization/directory`
- `/organization/summary`
- `/organization/team`
- `/documents/review`
- `/documents/expiring`
- `/attendance/timesheet`
- `/my/requests`
- `/requests`
- `/requests/assign`
- `/requests/status`
- `/compliance/audit-summary`
- `/compliance/expiring-documents`
- `/expense/categories`
- `/expense/reports`
- `/performance`
- `/performance/summary`
- `/performance/cycles`
- `/performance/reviews`
- `/performance/360-reviews`
- `/career/idps`
- `/career/succession`
- `/engagement/surveys`
- `/recruitment/openings`
- `/reports/competency`
- `/reports/employee-lifecycle`
- `/reports/custom`
- `/settings/user-role`
- `/settings/permissions`
- fallback `*`

## Ringkasan modul

| Modul | Jumlah Halaman | File utama | Sub-flow | Ada approval? | Prioritas audit |
|---|---:|---|---|---|---|
| Auth | 5 | `src/pages/auth/**` | login, register, forgot, reset, Google callback | ➖ | Tinggi |
| Dashboard | 2 | `src/pages/dashboard/overview/OverviewPage.tsx`, `src/pages/dashboard/EmployeeDashboardPage.tsx` | ringkasan admin, ringkasan karyawan | ➖ | Sedang |
| Employee Management | 3 | `src/pages/employee/**` | list, create, update, delete, onboarding, offboarding | ➖ | Tinggi |
| Attendance | 6 | `src/pages/attendance/**` | overview, check-in, check-out, history, today, admin report | ➖ | Tinggi |
| Overtime | 2 | `src/pages/attendance/OvertimePage.tsx`, `src/pages/admin/OvertimeApprovalPage.tsx` | request, reason, evidence upload, approve/reject evidence | ✅ | Kritis |
| Leave | 8 | `src/pages/leave/**` | create, list, detail, update, delete, approve, reject, balance, calendar | ✅ | Kritis |
| Leave Master Data | 6 | `src/pages/admin/LeavePolicy*.tsx`, `src/pages/admin/LeaveType*.tsx` | CRUD policy, CRUD type | ➖ | Sedang |
| Payroll | 6 route aktif | `src/pages/payroll/**` | list, create, generate monthly, update, approve manager/HR, reject, pay, export CSV/PDF, component CRUD | ✅ | Kritis |
| Reimbursement | 4 route tampak / 2 halaman utama | `src/pages/ess/MyReimbursementsPage.tsx`, `src/pages/admin/AdminReimbursementsPage.tsx` | create, update, delete, submit, approve, reject, mark paid | ✅ | Kritis |
| KPI | 4 | `src/pages/admin/AdminKpiPage.tsx`, `src/pages/admin/KpiFormPage.tsx`, `src/pages/ess/MyKpiPage.tsx` | create, update, submit, approve, progress | ✅ | Tinggi |
| Recruitment | 5 | `src/pages/admin/JobOpeningsPage.tsx`, `CandidatePipelinePage.tsx`, `TalentPoolPage.tsx` | CRUD opening, CRUD candidate, stage move, interview, offer | ➖ | Tinggi |
| Training & Competency | 5 | `src/pages/admin/TrainingManagementPage.tsx`, `src/pages/admin/TrainingFormPage.tsx`, `src/pages/admin/CompetencyMatrixPage.tsx`, `src/pages/ess/MyTrainingsPage.tsx`, `src/pages/ess/MyCompetenciesPage.tsx` | CRUD program, enroll, complete, self-enroll, approve/reject enrollment, assign/assess competency | ✅ | Tinggi |
| Assets | 4 | `src/pages/admin/AssetManagementPage.tsx`, `src/pages/admin/AssetFormPage.tsx`, `src/pages/ess/MyAssetsPage.tsx` | CRUD asset, assign, return, approve/reject assignment | ✅ | Tinggi |
| Tasks | 2 | `src/pages/admin/TaskManagementPage.tsx`, `src/pages/ess/MyTasksPage.tsx` | CRUD task, my task list | ➖ | Sedang |
| Promotions | 2 | `src/pages/admin/PromotionPage.tsx`, `src/pages/ess/MyPromotionsPage.tsx` | create, approve/reject promotion, submit report, approve/reject report | ✅ | Tinggi |
| Legal & Documents | 5 | `src/pages/admin/EmploymentLettersPage.tsx`, `AssignmentLettersPage.tsx`, `SeveranceCalculatorPage.tsx`, `ProgressiveTaxPage.tsx`, `src/pages/ess/MyAssignmentLettersPage.tsx` | generate letters, assignment letter CRUD-ish, approve/reject, PDF, severance calc, progressive tax | ✅ | Tinggi |
| Notifications | 5 | `src/pages/notifications/NotificationsPage.tsx`, `src/pages/admin/AdminNotificationsPage.tsx`, `AdminEmailSendPage.tsx`, `AdminEmailNotificationsPage.tsx`, `NotificationSettingsPage.tsx` | read, mark read, delete, broadcast, email send/logs/templates, settings | ➖ | Tinggi |
| Admin / RBAC | 9 | `src/pages/admin/AdminUsersPage.tsx`, `AdminRolesPage.tsx`, `AdminPermissionsPage.tsx`, `MenuPermissionsPage.tsx`, related forms | user-role assignment, role CRUD, permission assignment, menu permission assignment | ➖ | Kritis |
| System / Master Data | 10 | `src/pages/locations/**`, `src/pages/work-schedule/**`, `src/pages/admin/MasterDataPage.tsx`, `AdminImportPage.tsx`, `AdminAuditLogsPage.tsx`, `AdminBiometricDevicesPage.tsx`, `src/pages/admin/ApprovalFlowPage.tsx` | location CRUD, schedule CRUD, import, audit logs, biometric, approval flow CRUD | ➖ / approval config | Tinggi |
| Workforce & Compliance | 10 | `src/pages/admin/ComplianceDashboardPage.tsx`, `ComplianceSettingsPage.tsx`, `HolidayCalendarPage.tsx`, `HolidayFormPage.tsx`, `ShiftSwapsPage.tsx`, `ShiftSwapFormPage.tsx`, `OvertimeRulesPage.tsx`, `OvertimeRuleFormPage.tsx` | holidays CRUD, shift swap create/approve/reject, overtime rule CRUD, compliance overview/settings | ✅ | Tinggi |
| Performance | 7 | `src/pages/admin/OkrManagementPage.tsx`, `OkrFormPage.tsx`, `CalibrationPage.tsx`, `CalibrationFormPage.tsx`, `Review360Page.tsx` | OKR CRUD/progress, 360 review, calibration | ✅ | Tinggi |
| Engagement & Career | 7 | `src/pages/admin/EngagementSurveysPage.tsx`, `SurveyFormPage.tsx`, `EngagementAnalyticsPage.tsx`, `IdpPage.tsx`, `SuccessionMatrixPage.tsx` | survey CRUD, analytics, IDP, succession | ➖ | Sedang |
| Benefits & Compensation | 4 | `src/pages/admin/BenefitManagementPage.tsx`, `BenefitFormPage.tsx`, `CompensationPage.tsx` | benefit CRUD, assign, approve/reject assignment, compensation update, retro adjustment | ✅ | Tinggi |
| Organization | 2 | `src/pages/admin/OrgChartPage.tsx`, `src/pages/admin/MasterDataPage.tsx` | org chart, department/position master view | ➖ | Sedang |
| HR Requests | 3 | `src/pages/admin/HrRequestsPage.tsx`, `HrRequestFormPage.tsx`, `SlaPage.tsx` | list, assign, status update, SLA | ➖ | Sedang |
| Reports & Analytics | 2 dedicated + redirects | `src/pages/reports/ReportsDashboardPage.tsx`, `src/pages/admin/DetailedPeopleAnalyticsPage.tsx` | dashboard summary, people analytics | ➖ | Sedang |
| Profile | 4 aliases / 1 page | `src/pages/profiles/ProfilesPage.tsx` | list, add, view, update | ➖ | Sedang |
| ESS / My | 12+ | `src/pages/ess/**` | my KPI, payroll, reimbursement, training, competencies, assets, documents, tasks, promotions, overtime, leaves | mixed | Tinggi |

## Temuan struktur awal yang relevan untuk audit lanjutan

1. Duplikasi route:
   - `/my/reimbursements`
   - `/admin/assignment-letters`
   - `/admin/biometric-devices`

2. Banyak route bisnis sensitif hanya `Authenticated` di frontend tanpa guard menu eksplisit:
   - contoh: payroll, recruitment, benefits, promotions, shift swaps, assets.
   - Ini belum tentu bug karena backend bisa tetap menolak, tetapi dari perspektif UX dan hardening frontend, perlu diaudit.

3. Ada sejumlah route placeholder menuju `SectionPage`; sebagian path tampak mewakili fitur nyata tetapi belum menjadi halaman khusus.

4. Ada halaman yang tersedia di folder tetapi tidak menjadi route aktif langsung:
   - `PayrollApprovePage`
   - `PayrollGeneratePage`
   - `PayrollPaymentPage`
   - `PayrollTaxPage`
   - `ReimbursementApprovalPage`
   - `TrainingEnrollmentsPage`
   - `AssetAssignmentsPage`
   - dan beberapa halaman dashboard lama.

5. Pemetaan menu dan pemetaan route belum sepenuhnya sejajar:
   - menu memakai istilah/struktur tertentu,
   - router masih menyimpan alias lama, redirect, dan halaman tersembunyi.
