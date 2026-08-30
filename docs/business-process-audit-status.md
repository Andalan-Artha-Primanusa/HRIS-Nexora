# Audit Status Business Process HRIS

Tanggal audit: 2026-08-28

Dokumen ini merangkum hasil audit implementasi frontend `hris-frontend` dan backend `API-Backend` untuk fitur HRIS utama, khususnya penambahan multi-company, HO, QR attendance, patrol satpam, custom dashboard, payroll, RBAC, dan koneksi proses antar fitur.

## Ringkasan Aman/Tidak

| Area | Status | Catatan |
|---|---|---|
| RBAC backend | Aman | Permission registry sinkron dengan `config/rbac.php`. Test RBAC 56 passed. |
| Menu/sidebar RBAC frontend | Aman untuk fitur utama | Menu difilter dari backend dan route penting dibungkus `MenuRouteGuard`. Payroll sudah ditambah fallback permission. |
| Company + HO | Aman untuk akses dasar | HO bisa akses company list; employee diblok dari company admin. |
| Attendance QR | Aman untuk akses dasar | Employee hanya scan check-in/out; HR/Admin generate QR. |
| Patrol satpam | Aman untuk akses dasar | Employee/satpam bisa scan; HR/Admin monitor dan manage checkpoint. |
| Custom dashboard | Aman untuk akses dasar | Widget difilter permission; konfigurasi scope all companies butuh permission HO. |
| Payroll | Aman setelah patch | Update/delete payroll dan payroll detail sudah ditambah permission check. |
| Reimbursement + payroll | Terhubung | Reimbursement approved bisa ikut payroll dan otomatis jadi paid saat payroll paid. |
| Build frontend | Aman | `npm run build` sukses. |
| Full backend tests | Aman | `php artisan test` sukses, 56 passed. |
| Frontend lint | Belum bersih global | `npm run lint` masih gagal 986 issue lama di banyak file; build/runtime tetap sukses. |

## Business Process per Fitur

### 1. Company Management

Alur:

1. Super Admin/HO membuat company.
2. Assign HR/Admin ke company.
3. HR/Admin membuat master data company: department, position, location, schedule.
4. HR/Admin membuat employee pada company terkait.
5. Company menjadi scope untuk attendance, payroll, reimbursement, reports, dan dashboard.

Koneksi:

- Employee wajib terkait company.
- HO memakai permission `company.view_all` untuk melihat seluruh company.
- HR/Admin company memakai `company.view` dan assignment company untuk scope operasional.

Role yang diaudit:

- `ho` bisa akses `GET /api/companies`.
- `admin` bisa akses `GET /api/companies`.
- `employee` diblok dari `GET /api/companies`.

### 2. Employee Management

Alur:

1. HR/Admin membuat employee dan user account.
2. Employee mendapat department, position, manager, location, schedule, dan company.
3. Employee bisa memakai ESS: attendance, leave, reimbursement, payroll slip, KPI, training, asset.
4. Manager/HR memakai data employee untuk approval dan payroll.

Koneksi:

- Attendance memakai employee aktif.
- Payroll generate mengambil employee aktif.
- Leave/overtime/reimbursement memakai user/employee sebagai pemilik request.
- Dashboard/report mengambil agregasi employee.

Role yang diaudit:

- `admin` dan `hr` bisa akses `GET /api/employees`.

### 3. QR Attendance

Alur employee:

1. Employee buka QR Check In atau QR Check Out.
2. Kamera membaca QR.
3. Backend validasi token QR, expiry, company/location, dan status attendance.
4. Sistem menyimpan check-in/check-out.

Alur HR/Admin:

1. HR/Admin buka QR Generator.
2. Generate QR untuk kebutuhan absen.
3. Employee scan QR tersebut dari kamera perangkat.

Koneksi:

- Attendance menghasilkan data untuk reports, payroll late deduction, dashboard, dan monitoring HR/HO.
- QR generator butuh `attendance.qr.generate`.
- Scan employee butuh permission check-in/check-out.

Role yang diaudit:

- `hr` bisa reach `POST /api/attendance/qr/generate`.
- `employee` bisa reach `POST /api/attendance/qr/check-in` dan `POST /api/attendance/qr/check-out`.
- `employee` diblok dari generate QR.

### 4. Patrol Satpam

Alur:

1. HR/Admin membuat checkpoint ruangan dan QR checkpoint.
2. Satpam setelah jam patrol membuka Patrol Scan.
3. Satpam scan QR ruangan sebagai bukti sudah keliling.
4. Sistem menyimpan checkpoint, waktu scan, user, dan catatan.
5. HR/Admin/HO monitor hasil patrol.

Koneksi:

- Patrol bukan pengganti clock-in/clock-out umum.
- Untuk satpam: clock-in/out tetap attendance kerja, patrol scan adalah bukti ronde setelah jam tertentu.
- Patrol report bisa dipakai HR/HO untuk audit keamanan.

Role yang diaudit:

- `employee` bisa reach `POST /api/patrol/scan`.
- `hr` bisa reach `GET /api/patrol/checkpoints` dan `GET /api/patrol/scans`.
- `employee` diblok dari manage checkpoint dan monitor scans.

### 5. Custom Dashboard

Alur:

1. User membuka Custom Dashboard.
2. Sistem menampilkan widget sesuai permission role.
3. User menyusun widget dan menyimpan konfigurasi.
4. Untuk scope all companies, user harus punya permission dashboard lintas company.

Koneksi:

- Dashboard membaca data dari attendance, payroll, leave, reimbursement, employee, KPI, asset, dan company.
- Widget yang tidak sesuai permission tidak ditampilkan.

Role yang diaudit:

- `employee` bisa reach `GET /api/dashboard/widgets` dan validasi save config.
- `hr` bisa reach `GET /api/dashboard/widgets`.

### 6. Payroll

Alur:

1. HR/Admin cek komponen gaji dan data employee.
2. HR/Admin generate payroll bulanan.
3. Payroll berstatus `draft`.
4. Manager approve, status menjadi `pending_hr`.
5. HR final approve, status menjadi `approved`.
6. Finance/HR/Admin menandai payment, status menjadi `paid`.
7. Slip/export/report bisa diunduh sesuai permission.

Koneksi:

- Attendance masuk perhitungan late/overtime.
- Paid leave masuk payroll.
- Reimbursement approved bisa ikut payroll.
- Saat payroll paid, reimbursement linked ikut menjadi paid.
- Payroll masuk reports dan custom dashboard.

Role yang diaudit:

- `hr` bisa reach list, create validation, generate validation, payroll detail validation.
- `ho` bisa view payroll dan export/report, tapi diblok dari generate/pay.
- `employee` diblok dari admin payroll dan generate payroll.

Patch keamanan:

- `PayrollController@update` dan `destroy` sekarang butuh `payroll.create` atau `payroll.generate`.
- `PayrollDetailController` sekarang punya permission check untuk index/store/update/bulkUpdate/destroy.

### 7. Reimbursement

Alur:

1. Employee membuat reimbursement.
2. Employee submit reimbursement.
3. Manager/HR approve atau reject.
4. Finance/HR mark paid, atau reimbursement approved masuk payroll.

Koneksi:

- Reimbursement linked ke payroll dapat berubah paid saat payroll dibayar.
- Reimbursement statistics masuk dashboard/report.

Role yang diaudit:

- `hr` bisa reach `GET /api/reimbursements`.

### 8. Leave

Alur:

1. Employee membuat leave request.
2. Manager/HR approve atau reject.
3. Leave approved mempengaruhi attendance/payroll jika leave berbayar.
4. HR/HO melihat report leave.

Koneksi:

- Paid leave amount masuk payroll.
- Leave balance dan calendar tampil ke ESS/HR dashboard.

Role yang diaudit:

- `hr` bisa reach `GET /api/leaves/pending`.

## Test Matrix yang Ditambahkan

File test: `API-Backend/tests/Feature/Rbac/BusinessProcessAccessTest.php`

Coverage:

- Role allowed tidak boleh mendapat 401/403/500 pada route bisnis yang memang boleh diakses.
- Role forbidden harus mendapat 403 pada route yang tidak boleh diakses.
- Area yang dites: employee, company, payroll, payroll detail, reimbursement, leave, dashboard custom, QR attendance, patrol.

Hasil:

- `php artisan test --filter=BusinessProcessAccessTest`: 30 passed.
- `php artisan test --filter=Rbac`: 54 passed / 504 assertions.
- `php artisan test`: 56 passed / 506 assertions.

## Catatan Residual

Frontend `npm run lint` belum bersih secara global karena banyak issue lama di luar patch ini:

- Banyak `@typescript-eslint/no-explicit-any`.
- Banyak unused imports/variables.
- Rule `react-refresh/only-export-components` pada route lazy import.
- Beberapa warning hooks lama.

Namun:

- `npm run build` sukses.
- Tidak ada syntax/build error untuk fitur baru.
- Backend route, permission, dan test role matrix sudah hijau.
