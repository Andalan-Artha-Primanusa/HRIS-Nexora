# Gap Analysis Penambahan Fitur HRIS

Dokumen ini membandingkan business process penambahan fitur dengan kondisi frontend `hris-frontend` dan backend `API-Backend` saat ini.

## Ringkasan

| Fitur dari business process | Frontend saat ini | Backend saat ini | Status |
|---|---|---|---|
| Create banyak company | Hanya `/settings/company` untuk setting satu company. | Ada tabel `companies`, tetapi `POST /company` menolak jika sudah ada company pertama. | Belum dibuat end-to-end |
| HO lihat seluruh company | Tidak ada role/scope HO, tidak ada selector All Companies. | Tidak ada role `ho`, tidak ada permission `company.view_all`, tidak ada user-company access. | Belum dibuat |
| Company scope di semua modul | Tidak ada filter company global di UI. | Hampir semua tabel inti belum punya `company_id`; hanya dynamic approval flow mulai punya `company_id`. | Belum dibuat |
| QR attendance pakai kamera | Check-in/check-out masih GPS dan tombol submit; tidak ada scanner kamera. | `POST /attendance/check-in` hanya validasi latitude/longitude; tidak ada QR token/signature/expiry. | Belum dibuat |
| Generate QR attendance | Tidak ada halaman generate/display QR. | Tidak ada tabel/API QR attendance token. | Belum dibuat |
| Custom dashboard | Dashboard/report sudah ada, tetapi layout/widget belum bisa disimpan user. | Ada dashboard summary dan people insight, tetapi tidak ada dashboard config/widget API. | Belum dibuat |
| Dashboard HO consolidated | Tidak ada tampilan All Companies/drill-down. | Report belum company-scoped karena data inti belum punya company_id. | Belum dibuat |

## Detail Gap

### 1. Company Management Multi Company

Yang sudah ada:

- Backend punya migration `companies`.
- Backend punya endpoint:
  - `GET /company`
  - `POST /company`
  - `PUT /company/{id}`
  - `POST /company/{id}/logo`
  - `DELETE /company/{id}/logo`
- Frontend punya halaman `CompanySettingsPage`.

Yang belum ada:

- List company.
- Create company kedua, ketiga, dan seterusnya.
- Deactivate/reactivate company.
- Assign user/admin/HR ke company.
- Parent company atau struktur HO.
- Company selector global.
- Permission khusus:
  - `company.view`
  - `company.create`
  - `company.update`
  - `company.deactivate`
  - `company.view_all`
  - `company.assign_user`

Catatan penting: backend `CompanyController::store()` memakai `Company::first()` dan mengembalikan error jika company sudah ada. Artinya implementasi sekarang masih single-company setting.

### 2. HO / Head Office Multi-Company Access

Yang sudah ada:

- Role `super_admin`, `admin`, `hr`, `manager`, `employee`.

Yang belum ada:

- Role `ho` atau `head_office`.
- Permission `company.view_all`.
- Tabel penghubung user ke banyak company, misalnya `user_company_access`.
- Scope `All Companies`.
- Drill-down company dari dashboard/report.
- Rule approval lintas company khusus HO.

### 3. Company Scope di Modul Inti

Yang sudah ada:

- Dynamic approval flow sudah mulai punya `company_id`.

Yang belum ada:

- `company_id` pada data inti seperti:
  - employees
  - departments
  - positions
  - locations
  - work schedules
  - attendances
  - leaves
  - payrolls
  - reimbursements
  - assets
  - documents
  - KPI/training/competency
- Query list/report belum otomatis membatasi data berdasarkan company user.
- Export belum mencantumkan dan memfilter company.

### 4. QR Attendance dan Kamera

Yang sudah ada:

- Check-in/check-out berbasis GPS.
- Backend validasi geofence berdasarkan lokasi employee.
- Backend auto-create overtime saat check-out melewati jadwal.

Yang belum ada:

- Scanner kamera di frontend.
- Library/komponen QR scanner.
- Payload QR.
- Generate QR oleh HR/admin.
- QR dynamic expiry.
- QR signature/hash.
- Tabel `qr_attendance_tokens`.
- Endpoint seperti:
  - `POST /attendance/qr/generate`
  - `POST /attendance/qr/validate`
  - `POST /attendance/check-in/qr`
  - `POST /attendance/check-out/qr`
- Audit invalid QR scan.
- Validasi QR company/location/shift.

Catatan penting: request check-in backend saat ini hanya menerima `latitude` dan `longitude`; `location_id` yang dikirim frontend belum menjadi validasi request utama.

### 5. Custom Dashboard

Yang sudah ada:

- Admin dashboard.
- Employee dashboard.
- Reports dashboard summary.
- People insight dashboard.

Yang belum ada:

- Dashboard builder.
- Pilih/tambah/hapus widget.
- Drag/drop atau pengaturan layout.
- Save dashboard per user.
- Default dashboard per role/company.
- Widget registry dengan permission.
- Filter dashboard tersimpan.
- API dashboard config, misalnya:
  - `GET /dashboard/config`
  - `POST /dashboard/config`
  - `PUT /dashboard/config/{id}`
  - `GET /dashboard/widgets`
  - `POST /dashboard/default`

### 6. Reports HO Consolidated

Yang sudah ada:

- Reports dashboard summary.
- Attendance, leave, payroll, assets, employee reports di frontend sebagian ada.

Yang belum ada:

- Filter company global.
- Summary per company.
- Consolidated all company.
- Drill-down dari consolidated ke company.
- Export konsolidasi multi-company.
- Company-aware reporting service.

## Prioritas Backlog

1. Implement multi-company foundation: company CRUD list, `company_id`, user-company access, role HO.
2. Terapkan company scope ke employee, master data, attendance, leave, payroll, reimbursement, asset, document, report.
3. Implement QR attendance: QR token table, generate/validate API, scanner kamera frontend.
4. Implement custom dashboard: widget registry, dashboard config, save layout, permission widget.
5. Implement HO dashboard/report: All Companies, drill-down, export consolidated.

