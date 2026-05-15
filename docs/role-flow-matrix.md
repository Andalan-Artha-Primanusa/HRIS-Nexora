# Role Flow Matrix — HRIS

Dokumen ini memetakan siapa seharusnya boleh melakukan apa pada aplikasi HRIS, berdasarkan:
- `routes/api.php` backend yang diberikan
- `src/app/routes/index.tsx`
- `src/shared/config/menu.ts`
- `src/shared/config/menuFilter.ts`
- `src/app/routes/MenuRouteGuard.tsx`
- `src/shared/hooks/rbac.ts`

## Prinsip penting

1. **Backend adalah sumber kebenaran keamanan**
   - Jika backend melarang, frontend tidak boleh dianggap sebagai lapisan keamanan utama.

2. **Frontend saat ini baru sebagian menegakkan flow role**
   - `ProtectedRoute` mendukung `role`, tetapi router hampir tidak menggunakan prop `role`.
   - Hanya sebagian route yang memakai `MenuRouteGuard`.
   - Banyak modul sensitif secara frontend masih hanya `authenticated`.

3. **Role utama yang ditemukan**

| Role | Makna praktis |
|---|---|
| `employee` | User biasa / ESS |
| `manager` | Approver operasional / atasan |
| `hr` | HR operator dan approver |
| `admin` | Admin sistem / operasional luas |
| `super_admin` | Akses tertinggi |

---

# 1. Matriks Level Tinggi per Modul

Legenda:
- `V` = view
- `C` = create
- `U` = update
- `D` = delete
- `A` = approve / reject
- `S` = self-service
- `—` = tidak seharusnya akses

| Modul | Employee | Manager | HR | Admin | Super Admin | Catatan |
|---|---|---|---|---|---|---|
| Auth | Login/logout | Login/logout | Login/logout | Login/logout | Login/logout | Public/authenticated |
| Dashboard | S | V | V | V | V | Bergantung permission dashboard |
| Employee Management | — | V | V/C/U/D | V/C/U/D | V/C/U/D | Backend employee CRUD: admin/manager/hr/super_admin |
| Attendance ESS | S | S | S | S | S | Check-in/out/history/today untuk auth user |
| Attendance Admin | — | V/A admin scope | V/A admin scope | V/A admin scope | V/A admin scope | `/attendance/all`, detail, delete |
| Leave ESS | S/C/U/D | S/C/U/D | S/C/U/D | S/C/U/D | S/C/U/D | Authenticated |
| Leave Approval | — | A | A | A | A | Backend role group admin/manager/hr/super_admin |
| Leave Master Data | kemungkinan terbuka di frontend | kemungkinan terbuka di frontend | backend tidak dibatasi khusus pada file yang diberikan | backend tidak dibatasi khusus | backend tidak dibatasi khusus | Perlu verifikasi rule bisnis karena route auth-only |
| Payroll ESS | S | S | S | S | S | `my/payroll` untuk auth user |
| Payroll Admin | — | V/A terbatas | V/A | V/A | V/A | Backend role group admin/hr/manager/super_admin |
| Reimbursement ESS | S/C/U/submit | S/C/U/submit | S/C/U/submit | S/C/U/submit | S/C/U/submit | Authenticated |
| Reimbursement Admin | — | V/A | V/A | V/A | V/A | Backend admin/manager/hr/super_admin |
| Overtime ESS | S | S | S | S | S | Authenticated |
| Overtime Approval | — | A | A | A | A | Backend admin/manager/hr/super_admin |
| KPI ESS | S | S | S | S | S | Authenticated |
| KPI Admin | — | V/A | V/A | V/A | V/A | Backend admin/manager/hr/super_admin |
| Promotions ESS | S | S | S | S | S | `my/promotions` |
| Promotions Admin | — | sebagian A untuk report only? | C/A | C/A | C/A | create/approve base route auth; report approve limited admin/manager/hr/super_admin |
| Assets ESS | S | S | S | S | S | `my/assets` |
| Assets Admin | — | V/C/U/D/A | V/C/U/D/A | V/C/U/D/A | V/C/U/D/A | Backend admin/manager/hr/super_admin |
| Training ESS | S | S | S | S | S | `my/trainings` |
| Training Admin | — | V/C/U/D/A | V/C/U/D/A | V/C/U/D/A | V/C/U/D/A | Backend admin/manager/hr/super_admin |
| Competency ESS | S | S | S | S | S | `my/competencies` |
| Competency Admin | — | V/C/U/D/assign/assess | V/C/U/D/assign/assess | V/C/U/D/assign/assess | V/C/U/D/assign/assess | Backend admin/manager/hr/super_admin |
| Assignment Letters ESS | S/C | S/C | S/C | S/C | S/C | Backend route auth-only |
| Assignment Letters Approval | route auth-only di backend acuan | route auth-only di backend acuan | route auth-only di backend acuan | route auth-only di backend acuan | route auth-only di backend acuan | Perlu klarifikasi rule bisnis, karena approval belum role-gated di backend file |
| Documents ESS | S/upload | S/upload | S/upload | S/upload | S/upload | `my/documents` |
| Documents Admin | — | V/review/A | V/review/A | V/review/A | V/review/A | Backend admin/manager/hr/super_admin |
| Notifications user | S | S | S | S | S | Authenticated |
| Notifications admin | — | V/C | V/C | V/C | V/C | Backend admin/manager/hr/super_admin |
| RBAC / Menus | — | — | — | V/C/U/D | V/C/U/D | `/admin/menus` hanya admin/super_admin |
| Locations / Departments / Positions / Schedules | — | V/C/U/D | V/C/U/D | V/C/U/D | V/C/U/D | Backend admin/manager/hr/super_admin |
| Approval Flow config | — | — | V/C/U/D | V/C/U/D | V/C/U/D | Backend admin/hr/super_admin |
| Audit Logs | — | V | V | V | V | Backend route group admin/manager/hr/super_admin |
| Compliance | — | V | V | V | V | Backend admin/manager/hr/super_admin |
| Recruitment | — | V/C/U/D | V/C/U/D | V/C/U/D | V/C/U/D | Backend admin/manager/hr/super_admin |
| Benefits | — | V/C/U/D/A | V/C/U/D/A | V/C/U/D/A | V/C/U/D/A | Backend admin/manager/hr/super_admin |
| Performance Reviews / OKR / 360 / Calibration | — | V/C/U/A | V/C/U/A | V/C/U/A | V/C/U/A | Backend admin/manager/hr/super_admin |
| Career / Engagement | — | V/C/U | V/C/U | V/C/U | V/C/U | Backend admin/manager/hr/super_admin |
| Workforce / Shift Swap | — | V/C/A | V/C/A | V/C/A | V/C/A | Backend admin/manager/hr/super_admin |
| Company / Biometric / Notification Settings | — | V/C/U | V/C/U | V/C/U | V/C/U | Backend admin/manager/hr/super_admin |

---

# 2. Role Flow yang Seharusnya Terjadi per Role

## Employee

### Seharusnya bisa
- Login/logout
- Melihat dashboard pribadi
- Check-in/check-out dan riwayat absensi sendiri
- Mengajukan cuti, melihat saldo cuti, kalender, riwayat sendiri
- Melihat payroll sendiri dan slip sendiri
- Mengajukan reimbursement sendiri
- Melihat lembur sendiri / upload bukti jika flow memang diizinkan
- Melihat training tersedia dan self-enroll
- Melihat kompetensi sendiri
- Melihat aset sendiri dan mengajukan return
- Melihat promosi sendiri dan submit report bila sudah approved
- Upload/lihat dokumen sendiri
- Membuat surat tugas sendiri bila memang rule bisnis mengizinkan
- Melihat notifikasi sendiri

### Seharusnya tidak bisa
- Approval modul
- Master data
- Payroll admin
- RBAC
- Audit log
- Manajemen organisasi lintas perusahaan

## Manager

### Seharusnya bisa
- Semua hak employee
- Approve leave, overtime, reimbursement, training enrollment
- Akses employee list / attendance all / beberapa laporan
- Ikut flow payroll jika memang rule bisnis menetapkan manager approval
- Mengelola beberapa modul operasional seperti assets, workforce, performance

### Hal yang perlu diputuskan PM
- Apakah manager benar boleh:
  - payroll admin penuh?
  - master data update?
  - recruitment CRUD?
  - notification admin?

Backend saat ini sering memasukkan `manager` bersama admin/hr/super_admin pada group luas. Itu artinya **secara implementasi sekarang manager sangat powerful**.

## HR

### Seharusnya bisa
- Semua fungsi operasional HR
- Approval modul HR
- Payroll admin
- Employee lifecycle
- Recruitment
- Documents
- Benefits
- Training
- Workforce policy
- Approval flow config

## Admin

### Seharusnya bisa
- Sistem dan operasional luas
- Manage users/roles/menus jika diberi hak
- Notifications admin
- Import
- Audit
- Master/system settings

## Super Admin

### Seharusnya bisa
- Semua akses

---

# 3. Matriks Approval Flow

| Flow | Employee | Manager | HR | Admin | Super Admin | Backend saat ini |
|---|---|---|---|---|---|---|
| Leave approve/reject | — | ✅ | ✅ | ✅ | ✅ | Sesuai |
| Overtime request approve/reject | — | ✅ | ✅ | ✅ | ✅ | Sesuai |
| Overtime evidence approve/reject | — | ✅ | ✅ | ✅ | ✅ | Sesuai |
| Reimbursement approve/reject | — | ✅ | ✅ | ✅ | ✅ | Sesuai |
| Reimbursement mark paid | — | ✅? | ✅ | ✅ | ✅ | Backend mengizinkan group luas |
| Payroll manager approve | — | ✅ | ✅? | ✅? | ✅ | Endpoint ada; rule bisnis perlu ditegaskan |
| Payroll HR approve | — | — | ✅ | ✅? | ✅ | Backend route group luas, UI belum jelas |
| Promotions approve/reject | route auth-only pada base route | route auth-only pada base route | route auth-only pada base route | route auth-only pada base route | route auth-only pada base route | Perlu diketatkan/ditinjau |
| Promotion report approve/reject | — | ✅ | ✅ | ✅ | ✅ | Sesuai backend |
| Asset assignment approve/reject | — | ✅ | ✅ | ✅ | ✅ | Sesuai |
| Training enrollment approve/reject | — | ✅ | ✅ | ✅ | ✅ | Sesuai |
| Benefit assignment approve/reject | — | ✅ | ✅ | ✅ | ✅ | Sesuai |
| Shift swap approve/reject | — | ✅ | ✅ | ✅ | ✅ | Sesuai |
| Assignment letter approve/reject | route auth-only | route auth-only | route auth-only | route auth-only | route auth-only | Perlu klarifikasi/pengetatan |
| Document approve/reject | — | ✅ | ✅ | ✅ | ✅ | Sesuai |
| Performance review approve | — | ✅ | ✅ | ✅ | ✅ | Sesuai |
| OKR approve | — | ✅ | ✅ | ✅ | ✅ | Sesuai |

---

# 4. Matriks Route Frontend vs Backend

## Sudah cukup sejajar

| Area | Catatan |
|---|---|
| Admin/RBAC utama | Route menu dijaga `MenuRouteGuard` dan backend juga role-gated |
| Employees | Menu guarded di frontend; backend role-gated |
| Leave approval | Backend role-gated; UI juga cek permission |
| Overtime approval | Backend role-gated; UI juga cek permission |
| Admin email/import/audit | Beberapa page melakukan permission check tambahan |

## Belum sejajar / perlu perhatian

| Area | Backend | Frontend saat ini | Risiko |
|---|---|---|---|
| Banyak route sensitif non-admin | role-gated di backend | hanya `Authenticated` di router | User bisa masuk halaman lewat URL lalu baru ditolak backend |
| Promotions base flow | route auth-only | page admin terlihat seperti flow approver | Bisa terlalu longgar bila backend controller tidak memfilter |
| Assignment letters approval | route auth-only | halaman admin menyediakan approve/reject | Rule akses perlu diperjelas |
| Approval flow config | backend hanya admin/hr/super_admin | frontend path `/approval-flows` hanya authenticated | UX tidak sejajar dengan backend |
| Legal pages | backend beberapa endpoint sangat sensitif | frontend route hanya authenticated | UX belum mencerminkan role flow |
| Performance pages | backend role-gated | frontend hanya authenticated | Employee bisa masuk route yang seharusnya admin-operational |

---

# 5. Gap Role Flow yang Harus Dibahas dengan PM

Ini bagian paling penting sebelum lanjut ke tahap fix.

## Pertanyaan bisnis yang perlu diputuskan

1. **Seberapa luas hak `manager`?**
   - Backend saat ini memberi manager akses sangat luas ke banyak grup admin.

2. **Siapa yang boleh approve promotion utama?**
   - Backend route dasar promotion tidak dibatasi role di `api.php`.

3. **Siapa yang boleh approve assignment letter?**
   - Backend route assignment letter juga auth-only.

4. **Apakah `my/assignment-letters` harus benar-benar user-scoped?**
   - Frontend memakai endpoint umum.

5. **Apakah master data leave type/policy boleh diakses semua user authenticated?**
   - Route backend tampak auth-only.

6. **Apakah approval flow config harus tersembunyi dari manager?**
   - Backend bilang hanya admin/hr/super_admin.

7. **Untuk payroll, siapa melakukan approval tahap pertama dan kedua secara resmi?**
   - Backend punya endpoint berbeda, tetapi frontend flow belum tegas.

---

# 6. Rekomendasi Role Flow Ideal

## Minimum ideal sebelum production

| Role | Harus punya |
|---|---|
| Employee | ESS only |
| Manager | ESS + team approval + sebagian team view |
| HR | HR operations + approvals + lifecycle |
| Admin | system/admin + master data + support ops |
| Super Admin | semua |

## Yang sebaiknya tidak dibiarkan kabur

| Area | Sebaiknya diputuskan eksplisit |
|---|---|
| Payroll approval | Manager tahap 1, HR tahap 2 |
| Promotions | HR/Admin yang memulai dan menyetujui |
| Assignment letters | Employee submit, manager/HR approve |
| Master data | Bukan semua authenticated user |
| Performance admin | Bukan employee biasa |

---

# 7. Rekomendasi Tahap Setelah Dokumen Ini

## Tahap berikutnya yang disarankan

1. **Review role matrix ini bersama PM**
2. Tandai setiap baris menjadi:
   - `Sudah benar`
   - `Perlu diubah`
   - `Belum diputuskan`
3. Setelah rule bisnis disepakati, baru lakukan:
   - audit role flow di browser dengan akun nyata per role
   - validasi direct URL access
   - fix mismatch frontend/backend

## Output berikutnya yang sebaiknya dibuat

1. **Role Test Case Matrix**
   - akun employee, manager, hr, admin, super_admin
   - menu yang terlihat
   - halaman yang boleh diakses
   - aksi yang boleh dilakukan

2. **Role Gap Backlog**
   - route yang harus diberi guard
   - backend route yang perlu diperketat
   - flow bisnis yang perlu diputuskan PM

