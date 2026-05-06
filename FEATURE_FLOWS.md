# Feature Flows & Role Functions — HRIS Frontend

Dokumen ini merangkum alur (flow) untuk fitur-fitur utama di workspace dan mapping role/permission yang relevan. Semua penjelasan dalam bahasa Indonesia.

**Ringkasan Roles & Permission (didefinisikan di kode)**
- Role: `super_admin`, `admin`, `hr`, `manager`, `employee`
- Permissions (pilihan utama):
  - `employee.view`, `employee.create`, `employee.update`, `employee.delete`
  - `leave.view`, `leave.create`, `leave.approve`
  - `attendance.view_all`, `attendance.delete`, `attendance.check_in`, `attendance.check_out`, `attendance.view_own`
  - `location.view`, `location.create`, `location.update`, `location.delete`
  - `profile.view_all`, `profile.update`, `profile.delete`
  - `user.view`, `user.assign_role`, `role.view`, `role.assign_permission`, `permission.view`

Referensi implementasi types: [src/shared/types/rbac.types.ts](src/shared/types/rbac.types.ts#L1-L200)

---

## Cara baca dokumen
- Setiap fitur: tujuan singkat, halaman/komponen utama (link ke file), alur data (user → UI → API → store → backend), dan mapping role/permission.

---

## 1. Autentikasi & sesi (Auth)
- Tujuan: login, register, refresh token, redirect berdasarkan role.
- File inti: [src/features/auth/api/auth.service.ts](src/features/auth/api/auth.service.ts#L1), [src/features/auth/hooks/useAuth.ts](src/features/auth/hooks/useAuth.ts#L1), [src/pages/auth/login/LoginPage.tsx](src/pages/auth/login/LoginPage.tsx#L1)
- Flow:
  1. User input credentials di `LoginPage`.
  2. `auth.service` panggil endpoint auth backend, dapatkan token + user.
  3. Token disimpan di store/session; `useAuth` dan `useRefreshUser` memperbarui `AuthUser` di store.
  4. `roleRedirect` menentukan halaman tujuan berdasarkan role (lihat [src/features/auth/utils/roleRedirect.ts](src/features/auth/utils/roleRedirect.ts#L1)).
- Peran & izin: akses halaman login/public; pengelolaan pengguna (assign roles) membutuhkan `user.assign_role` (admin/super_admin).

## 2. Admin (User, Role, Permission, Settings)
- Tujuan: manajemen user, role, permission, imp/eks data, audit.
- Halaman & file: [src/pages/admin/AdminUsersPage.tsx](src/pages/admin/AdminUsersPage.tsx#L1), [src/pages/admin/AdminRolesPage.tsx](src/pages/admin/AdminRolesPage.tsx#L1), [src/features/admin/api/admin.service.ts](src/features/admin/api/admin.service.ts#L1)
- Flow:
  1. Admin buka halaman daftar user/role.
  2. UI fetch daftar via `admin.service` → store atau local state.
  3. Tindakan: create/edit/delete user, assign role, assign permission → panggil API `assignRoles`/`assignPermissions`.
  4. Backend respons diperbarui di UI, audit log disimpan.
- Peran & izin:
  - `user.view` — menampilkan user (admin/hr/manager sesuai kebijakan)
  - `user.assign_role` — hanya `admin`/`super_admin`
  - `role.assign_permission` / `role.view` — `admin`/`super_admin`

## 3. Employee (Master data karyawan)
- Tujuan: CRUD data employee, dokumen, lifecycle.
- File: [src/pages/employee/EmployeesPage.tsx](src/pages/employee/EmployeesPage.tsx#L1), [src/features/employee/api/employee.service.ts](src/features/employee/api/employee.service.ts#L1)
- Flow:
  1. List fetch `employee.service`.
  2. Create/Edit melalui `EmployeeForm` → validasi → POST/PUT.
  3. Setelah sukses, update UI dan notifikasi.
- Peran:
  - `employee.view` — melihat daftar
  - `employee.create/update/delete` — HR / Admin (sesuai konfigurasi role)

## 4. Leave (Cuti)
- Tujuan: permintaan cuti, approval, kalender, saldo.
- File: [src/features/leave/api/leave.service.ts](src/features/leave/api/leave.service.ts#L1), [src/pages/leave/LeaveRequestsPage.tsx](src/pages/leave/LeaveRequestsPage.tsx#L1), [src/pages/leave/LeaveApprovalPage.tsx](src/pages/leave/LeaveApprovalPage.tsx#L1)
- Flow:
  1. Employee buat request cuti di `CreateLeavePage` → panggil `leave.service.create`.
  2. Request masuk ke list approval manager/HR (`LeaveApprovalPage`).
  3. Approver melihat detail (`LeaveDetailModal`) → approve/reject via API.
  4. Setelah approve: update leave balance, notifikasi ke employee.
- Peran & izin:
  - `leave.create` — employee
  - `leave.view` — approver/HR
  - `leave.approve` — manager/HR

## 5. Attendance (Absensi & Overtime)
- Tujuan: check-in/out, riwayat, laporan, approval overtime.
- File: [src/features/attendance/api/attendance-admin.service.ts](src/features/attendance/api/attendance-admin.service.ts#L1), [src/pages/attendance/AttendanceCheckInPage.tsx](src/pages/attendance/AttendanceCheckInPage.tsx#L1), [src/features/attendance/api/overtime.service.ts](src/features/attendance/api/overtime.service.ts#L1)
- Flow:
  1. Employee check-in/out via halaman mobile/desktop.
  2. UI panggil API check_in/check_out; backend simpan timestamp dan lokasi (jika ada).
  3. Admin/HR dapat melihat `attendance.admin` list untuk koreksi atau hapus (jika punya `attendance.delete`).
- Peran & izin:
  - `attendance.check_in` / `attendance.check_out` — employee
  - `attendance.view_own` — employee melihat riwayat sendiri
  - `attendance.view_all` / `attendance.delete` — HR/Admin

## 6. Payroll
- Tujuan: generate payroll, slip, pembayaran, approval.
- File: [src/features/payroll/api/payroll.service.ts](src/features/payroll/api/payroll.service.ts#L1), [src/pages/payroll/PayrollGeneratePage.tsx](src/pages/payroll/PayrollGeneratePage.tsx#L1)
- Flow:
  1. Payroll admin generate payroll batch → `payroll.service.generate` menghitung gaji (server).
  2. Hasil: preview payroll → approve → trigger payment / export.
  3. Employee dapat melihat slip di `MyPayrollPage`.
- Peran:
  - Akses manajemen payroll biasanya diberikan ke `admin` / `finance` (jika ada). Jika permission spesifik tidak didefinisikan di `rbac.types`, akses dikontrol via role `admin`/`super_admin`.

## 7. Reimbursement (Penggantian biaya)
- Tujuan: submit klaim, verifikasi, approval, pembayaran.
- File: [src/features/reimbursement/api/reimbursement.service.ts](src/features/reimbursement/api/reimbursement.service.ts#L1), [src/pages/reimbursements/ReimbursementsManagementPage.tsx](src/pages/reimbursements/ReimbursementsManagementPage.tsx#L1)
- Flow:
  1. Employee submit klaim dengan bukti (modal/form).
  2. Approver/Finance meninjau di `ReimbursementApprovalPage` → approve/reject.
  3. Jika approve → pindah ke status pembayaran.
- Peran: submit oleh employee; review/approve oleh manager/finance/admin.

## 8. Recruitment
- Tujuan: manage job openings, pipeline kandidat, wawancara.
- File: [src/features/recruitment/api/recruitment.service.ts](src/features/recruitment/api/recruitment.service.ts#L1), [src/features/recruitment/components/CandidateKanban.tsx](src/features/recruitment/components/CandidateKanban.tsx#L1)
- Flow:
  1. HR/Recruiter membuat job opening.
  2. Kandidat dipindah di pipeline (kanban) → tiap stage trigger actions (assign interviewer, schedule).
  3. Hire → create employee record.
- Peran: HR / Recruiter / Admin.

## 9. Profile (Employee Self-Service)
- Tujuan: profil karyawan, dokumen, update data pribadi.
- File: [src/features/profile/api/profile.service.ts](src/features/profile/api/profile.service.ts#L1), [src/pages/ess/MyDocumentsPage.tsx](src/pages/ess/MyDocumentsPage.tsx#L1)
- Flow:
  1. Employee update profile via UI → panggil `profile.service.update`.
  2. Jika perubahan sensitif (role, salary) mungkin diperlukan approval.
- Peran:
  - `profile.update` untuk owner; `profile.view_all` untuk HR/admin.

## 10. Organization & Approval Flows
- Tujuan: struktur organisasi, promotion, approval flow configurator.
- File: [src/features/organization/components/ApprovalFlowModal.tsx](src/features/organization/components/ApprovalFlowModal.tsx#L1), [src/pages/admin/ApprovalFlowPage.tsx](src/pages/admin/ApprovalFlowPage.tsx#L1)
- Flow:
  1. Admin configure approval flow (multi-level) untuk entitas (cuti, reimbursement, overtime).
  2. Saat request dibuat, engine approval meneruskan notifikasi ke approver sesuai konfigurasi.
- Peran: konfigurasi oleh Admin/HR.

## 11. Assets, Location, Training, Tasks, Performance, Legal, Engagement, Reporting, Requests, Work-schedule, Workforce
- Ringkasan umum (alur serupa):
  - UI list/detail → service API → modal form untuk create/edit → approval jika diperlukan → update state.
  - Contoh file:
    - Assets API: [src/features/assets/api/asset.service.ts](src/features/assets/api/asset.service.ts#L1)
    - Location: [src/features/location/api/location.service.ts](src/features/location/api/location.service.ts#L1)
    - Training: [src/features/training/api/training.service.ts](src/features/training/api/training.service.ts#L1)
    - Tasks: [src/features/tasks/api/task.service.ts](src/features/tasks/api/task.service.ts#L1)
    - Performance: [src/features/performance/api/performance.service.ts](src/features/performance/api/performance.service.ts#L1)
    - Legal: [src/features/legal/api/legal.service.ts](src/features/legal/api/legal.service.ts#L1)
    - Reporting: [src/features/reporting/api/reporting.service.ts](src/features/reporting/api/reporting.service.ts#L1)
- Peran: biasanya `admin`/`hr` untuk manajemen, `employee` untuk request/submit, `manager` untuk approval.

---

## Role Functions — detail per role
- `super_admin`:
  - Fungsi: kontrol penuh sistem, assign role & permission, akses audit, konfigurasi global.
  - Permission: semua permission inti (`user.assign_role`, `role.assign_permission`, `permission.view`, dll.).
- `admin`:
  - Fungsi: manajemen pengguna, konfigurasi fitur, pengaturan company-level, payroll/reimbursement management (jika diatur demikian).
  - Permission: `user.view`, `user.assign_role`, `role.view`, `role.assign_permission`, `permission.view`.
- `hr`:
  - Fungsi: kelola data karyawan, cuti, attendance oversight, onboarding/offboarding.
  - Permission: sebagian besar `user.view`, `role.view`, `permission.view`, akses employee CRUD.
- `manager`:
  - Fungsi: approval cuti, reimbursement, review performa tim.
  - Permission: `user.view` (terhadap tim), bisa mempunyai `leave.approve` tergantung konfigurasi.
- `employee`:
  - Fungsi: self-service (profile, request cuti, attendance check-in/out, submit reimbursement).
  - Permission: create request (leave/reimbursement), `attendance.check_in` / `attendance.check_out`, `attendance.view_own`.

Referensi mapping default: [src/shared/types/rbac.types.ts](src/shared/types/rbac.types.ts#L1-L200)

---

## Catatan & rekomendasi
- Untuk fitur baru atau granular permission, tambahkan PermissionType di `src/shared/types/rbac.types.ts` dan update `ROLE_PERMISSIONS`.
- Approval flow configurable tersentral: pastikan `ApprovalFlow` menyimpan metadata role/level sehingga mapping ke user/manager lebih mudah.
- Dokumentasi API endpoints (backend) akan membantu mengisi diagram sequence yang lebih teknis.

---

Jika Anda mau, saya bisa:
- Menghasilkan diagram alur visual (mermaid) untuk fitur tertentu.
- Membuat tabel mapping lengkap permission → komponen/endpoint.
- Ekstrak daftar komponen halaman lengkap per fitur ke file terpisah.

Sebutkan pilihan Anda selanjutnya.
