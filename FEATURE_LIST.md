# FEATURE_LIST — urutan menu (referensi: src/shared/config/menu.ts)

Daftar fitur bernomor sesuai urutan menu utama di `src/shared/config/menu.ts`. Setiap item: label menu, path (jika ada), file/komponen utama, dan flow singkat.

1. Dashboard
   - Path: `/dashboard`
   - File / komponen: [src/features/dashboard/api/kpi.service.ts](src/features/dashboard/api/kpi.service.ts#L1), [src/pages/dashboard/overview/OverviewPage.tsx](src/pages/dashboard/overview/OverviewPage.tsx#L1)
   - Flow singkat: fetch KPI → tampilkan kartu/summary → user klik navigasi.

2. Dashboard Saya
   - Path: `/employee-dashboard`
   - File: [src/pages/dashboard/EmployeeDashboardPage.tsx](src/pages/dashboard/EmployeeDashboardPage.tsx#L1)
   - Flow: load data user-specific → render widget ESS (KPI, payroll ringkasan).

3. Manajemen Karyawan
   - Path: `/employees`
   - File: [src/pages/employee/EmployeesPage.tsx](src/pages/employee/EmployeesPage.tsx#L1), [src/features/employee/api/employee.service.ts](src/features/employee/api/employee.service.ts#L1)
   - Flow: list employees → create/edit melalui form → panggil API → update UI.

4. Absensi & Waktu
   - Sub-paths: `/attendance/daily`, `/attendance/timesheet`, `/attendance/overtime`, dll.
   - File: [src/pages/attendance/AttendanceCheckInPage.tsx](src/pages/attendance/AttendanceCheckInPage.tsx#L1), [src/features/attendance/api/attendance-admin.service.ts](src/features/attendance/api/attendance-admin.service.ts#L1)
   - Flow: check-in/out oleh employee → API simpan timestamp → admin lihat/approve/correct.

5. Manajemen Cuti
   - Sub-paths: `/leave/requests`, `/leave/approval`, `/leave/calendar`, `/leave/balance`
   - File: [src/features/leave/api/leave.service.ts](src/features/leave/api/leave.service.ts#L1), [src/pages/leave/LeaveRequestsPage.tsx](src/pages/leave/LeaveRequestsPage.tsx#L1)
   - Flow: employee submit request → approver lihat di approval list → approve/reject → update balance.

6. Penggajian & Slip Gaji
   - Path group: `/payroll`, `/payroll/list`, `/payroll/generate`, `/payroll/approve`, `/payroll/payment`
   - File: [src/features/payroll/api/payroll.service.ts](src/features/payroll/api/payroll.service.ts#L1), [src/pages/payroll/PayrollGeneratePage.tsx](src/pages/payroll/PayrollGeneratePage.tsx#L1)
   - Flow: generate batch oleh payroll admin → preview → approve → trigger payment/export.

7. Aset & Inventaris
   - Path: `/assets`, `/assets/assignments`
   - File: [src/features/assets/api/asset.service.ts](src/features/assets/api/asset.service.ts#L1), [src/features/assets/components/AssignAssetModal.tsx](src/features/assets/components/AssignAssetModal.tsx#L1)
   - Flow: CRUD aset → assign ke karyawan → track status pengembalian.

8. Task Management
   - Path: `/tasks`
   - File: [src/features/tasks/api/task.service.ts](src/features/tasks/api/task.service.ts#L1), [src/features/tasks/components/TaskModal.tsx](src/features/tasks/components/TaskModal.tsx#L1)
   - Flow: buat/assign task → notifikasi → update status.

9. Legal & Dokumen
   - File: [src/features/legal/api/legal.service.ts](src/features/legal/api/legal.service.ts#L1), [src/features/legal/components/AssignmentLetterModal.tsx](src/features/legal/components/AssignmentLetterModal.tsx#L1)
   - Flow: generate dokumen/legal tools → simpan/unduh → approval jika perlu.

10. Manajemen Reimburse
    - Path: `/reimbursements`
    - File: [src/features/reimbursement/api/reimbursement.service.ts](src/features/reimbursement/api/reimbursement.service.ts#L1), [src/pages/reimbursements/ReimbursementsManagementPage.tsx](src/pages/reimbursements/ReimbursementsManagementPage.tsx#L1)
    - Flow: submit klaim oleh employee → review oleh finance/manager → approve → pembayaran.

11. Pelatihan & Kompetensi
    - File: [src/features/training/api/training.service.ts](src/features/training/api/training.service.ts#L1), [src/features/training/components/TrainingCard.tsx](src/features/training/components/TrainingCard.tsx#L1)
    - Flow: buat program → enroll employee → track completion/assessments.

12. Karir & Promosi
    - Path: `/promotions`
    - File: [src/pages/admin/PromotionPage.tsx](src/pages/admin/PromotionPage.tsx#L1), [src/features/organization/components/PromotionModal.tsx](src/features/organization/components/PromotionModal.tsx#L1)
    - Flow: inisiasi promosi → approval flow → update employee record.

13. KPI & Kinerja
    - Path: `/kpis`
    - File: [src/features/dashboard/components/KpiCards.tsx](src/features/dashboard/components/KpiCards.tsx#L1), [src/pages/dashboard/kpi/KpiPage.tsx](src/pages/dashboard/kpi/KpiPage.tsx#L1)
    - Flow: manager/employee set KPI → submit/approve → report.

14. Employee Self Service (ESS)
    - Group paths: `/my/*` (payroll, reimbursements, kpi, trainings, attendance)
    - Files: [src/pages/ess/MyPayrollPage.tsx](src/pages/ess/MyPayrollPage.tsx#L1), [src/pages/ess/MyLeavesPage.tsx](src/pages/ess/MyLeavesPage.tsx#L1)
    - Flow: user melihat/submit request pribadi → API khusus user → notifikasi.

15. Laporan & Analitik
    - Path group: `/reports/*`
    - File: [src/pages/reports/ReportsDashboardPage.tsx](src/pages/reports/ReportsDashboardPage.tsx#L1), [src/features/reporting/api/reporting.service.ts](src/features/reporting/api/reporting.service.ts#L1)
    - Flow: aggregate data → generate report → export.

16. Kepatuhan & Kebijakan
    - Files: [src/pages/admin/ComplianceSettingsPage.tsx](src/pages/admin/ComplianceSettingsPage.tsx#L1), [src/pages/admin/HolidayCalendarPage.tsx](src/pages/admin/HolidayCalendarPage.tsx#L1)
    - Flow: manage rules/policies → apply to schedules/leave calculations.

17. Master Data
    - Sub-paths: `/organization/master-data`, `/leave/type`, `/leave/policy`, `/admin/import`
    - File: [src/pages/admin/MasterDataPage.tsx](src/pages/admin/MasterDataPage.tsx#L1)
    - Flow: CRUD master data → used across modules (leave types, departments).

18. Alat Admin (Users / Roles / Permissions / Logs / Devices / Approval Flows)
    - Files: [src/pages/admin/AdminUsersPage.tsx](src/pages/admin/AdminUsersPage.tsx#L1), [src/pages/admin/AdminRolesPage.tsx](src/pages/admin/AdminRolesPage.tsx#L1), [src/pages/admin/AdminAuditLogsPage.tsx](src/pages/admin/AdminAuditLogsPage.tsx#L1)
    - Flow: manage access/roles → assign permissions → audit/logging.

---

Catatan:
- Saya mengikuti urutan `menuItems` dari [src/shared/config/menu.ts](src/shared/config/menu.ts#L1-L300).
- Mau saya lengkapi tiap nomor dengan daftar komponen/halaman penuh (semua file terkait), atau langsung tambahkan flow lebih detail untuk tiap fitur? Balas: `lengkap` atau `detail` (atau sebutkan nomor fitur yang mau diperdalam).