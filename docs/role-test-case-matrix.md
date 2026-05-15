# Role Test Case Matrix — HRIS

Dokumen ini adalah turunan langsung dari `role-flow-matrix.md`.

Tujuan:
- Menjadi checklist QA manual lintas role.
- Memastikan menu, halaman, tombol, dan aksi bisnis tampil sesuai role.
- Menemukan gap antara:
  - yang seharusnya boleh,
  - yang terlihat di frontend,
  - dan yang benar-benar diizinkan backend.

## Role akun yang perlu disiapkan

| Kode | Role |
|---|---|
| R1 | Employee |
| R2 | Manager |
| R3 | HR |
| R4 | Admin |
| R5 | Super Admin |

## Prioritas test

| Prioritas | Makna |
|---|---|
| P0 | Wajib lulus sebelum production |
| P1 | Sangat penting |
| P2 | Penting tetapi tidak memblokir release inti |

---

# 1. Test Case Dasar Autentikasi

| ID | Role | Skenario | Expected Result | Prioritas |
|---|---|---|---|---|
| AUTH-01 | Semua | Login valid | Berhasil masuk, diarahkan ke dashboard yang sesuai | P0 |
| AUTH-02 | Semua | Login invalid | Muncul error, tidak masuk aplikasi | P0 |
| AUTH-03 | Semua | Logout | Session hilang, diarahkan ke login | P0 |
| AUTH-04 | Guest | Buka route protected langsung | Redirect ke `/login` | P0 |
| AUTH-05 | Semua | Refresh halaman setelah login | Session tetap valid sesuai desain saat ini | P1 |
| AUTH-06 | Guest | Forgot password | Request reset berhasil terkirim bila email valid | P1 |
| AUTH-07 | Guest | Reset password dengan token valid | Password berhasil diubah | P1 |
| AUTH-08 | Semua | Google SSO | Login berhasil dan role/menu termuat sesuai user | P1 |

---

# 2. Test Case Menu Visibility

## Employee

| ID | Menu | Expected Result | Prioritas |
|---|---|---|---|
| MENU-E-01 | Dashboard Saya | Tampil | P0 |
| MENU-E-02 | ESS group | Tampil | P0 |
| MENU-E-03 | Manajemen Karyawan | Tidak tampil | P0 |
| MENU-E-04 | Penggajian admin | Tidak tampil | P0 |
| MENU-E-05 | Alat Administrator | Tidak tampil | P0 |
| MENU-E-06 | Laporan & Analitik admin | Tidak tampil kecuali memang diberi permission | P1 |

## Manager

| ID | Menu | Expected Result | Prioritas |
|---|---|---|---|
| MENU-M-01 | Manajemen Karyawan | Tampil bila permission `employee.view` aktif | P1 |
| MENU-M-02 | Persetujuan Cuti | Tampil | P0 |
| MENU-M-03 | Penggantian Biaya | Tampil | P0 |
| MENU-M-04 | Absensi & Waktu / laporan | Tampil | P1 |
| MENU-M-05 | Alat Administrator | Tidak tampil kecuali memang ditugaskan secara eksplisit | P0 |

## HR

| ID | Menu | Expected Result | Prioritas |
|---|---|---|---|
| MENU-HR-01 | Manajemen Karyawan | Tampil | P0 |
| MENU-HR-02 | Penggajian | Tampil | P0 |
| MENU-HR-03 | Pelatihan & Kompetensi | Tampil | P1 |
| MENU-HR-04 | Aset & Inventaris | Tampil | P1 |
| MENU-HR-05 | Alur Persetujuan | Tampil bila diberi `admin.approval_flow.manage` | P1 |

## Admin / Super Admin

| ID | Menu | Expected Result | Prioritas |
|---|---|---|---|
| MENU-A-01 | Alat Administrator | Tampil | P0 |
| MENU-A-02 | Pengguna / Peran / Izin / Akses Menu | Tampil | P0 |
| MENU-A-03 | Audit Log | Tampil bila punya permission terkait | P1 |
| MENU-SA-01 | Semua menu | Super admin melihat seluruh menu yang ditentukan sistem | P0 |

---

# 3. Test Case Direct URL Access

Tujuan bagian ini: memastikan user tidak hanya dibatasi lewat menu, tetapi juga ketika mengetik URL manual.

| ID | Role | URL | Expected Result | Prioritas |
|---|---|---|---|---|
| URL-01 | Employee | `/admin/users` | Ditolak frontend/backend | P0 |
| URL-02 | Employee | `/employees` | Ditolak jika tidak punya permission/menu | P0 |
| URL-03 | Employee | `/payroll/process` | Ditolak | P0 |
| URL-04 | Employee | `/approval-flows` | Ditolak | P0 |
| URL-05 | Employee | `/workforce/shift-swaps` | Ditolak bila bukan hak employee | P1 |
| URL-06 | Employee | `/performance/calibration` | Ditolak bila modul bukan hak employee | P1 |
| URL-07 | Manager | `/admin/roles` | Ditolak kecuali memang diberi akses | P0 |
| URL-08 | HR | `/admin/menu-permissions` | Ditolak bila bukan admin/super admin | P0 |
| URL-09 | Admin | `/admin/users` | Berhasil | P0 |
| URL-10 | Super Admin | Semua route admin | Berhasil | P0 |

Catatan:
- Saat ini banyak route frontend masih hanya `Authenticated`.
- Maka test ini sangat penting untuk menemukan gap UX/access walaupun backend mungkin tetap memblokir.

---

# 4. Test Case ESS / Employee Flow

| ID | Role | Flow | Langkah Uji | Expected Result | Prioritas |
|---|---|---|---|---|---|
| ESS-01 | Employee | Leave request | Buat pengajuan cuti | Berhasil tersimpan sebagai milik user login | P0 |
| ESS-02 | Employee | Leave edit/delete | Edit/hapus pengajuan milik sendiri yang masih boleh diubah | Berhasil sesuai rule | P1 |
| ESS-03 | Employee | Payroll self | Buka slip gaji sendiri | Hanya melihat payroll sendiri | P0 |
| ESS-04 | Employee | Reimbursement | Buat reimbursement dan submit | Berhasil masuk pending/review | P0 |
| ESS-05 | Employee | My assets | Lihat aset sendiri | Hanya data user sendiri | P0 |
| ESS-06 | Employee | Return asset | Ajukan pengembalian aset sendiri | Berhasil | P1 |
| ESS-07 | Employee | My promotions | Lihat promosi sendiri | Hanya data sendiri | P1 |
| ESS-08 | Employee | Promotion report | Submit laporan setelah promosi approved | Berhasil dan status berubah | P1 |
| ESS-09 | Employee | My documents | Upload dokumen | Berhasil | P0 |
| ESS-10 | Employee | My documents | Download dokumen | Berhasil; endpoint valid | P0 |
| ESS-11 | Employee | My trainings | Self-enroll training | Berhasil bila program tersedia | P1 |
| ESS-12 | Employee | My assignment letters | Lihat surat tugas sendiri | Tidak melihat milik user lain | P0 |

---

# 5. Test Case Approval Flow

## Leave

| ID | Role | Skenario | Expected Result | Prioritas |
|---|---|---|---|---|
| APP-L-01 | Manager | Approve leave pending | Berhasil | P0 |
| APP-L-02 | HR | Reject leave pending | Berhasil | P0 |
| APP-L-03 | Employee | Coba approve leave | Ditolak | P0 |

## Reimbursement

| ID | Role | Skenario | Expected Result | Prioritas |
|---|---|---|---|---|
| APP-R-01 | Manager | Approve reimbursement | Berhasil | P0 |
| APP-R-02 | HR | Reject reimbursement | Berhasil | P0 |
| APP-R-03 | Employee | Coba approve reimbursement | Ditolak | P0 |

## Overtime

| ID | Role | Skenario | Expected Result | Prioritas |
|---|---|---|---|---|
| APP-O-01 | Employee | Buat/request lembur | Berhasil sesuai endpoint resmi | P0 |
| APP-O-02 | Manager | Approve overtime | Berhasil | P0 |
| APP-O-03 | HR | Reject overtime | Berhasil | P0 |
| APP-O-04 | Manager/HR | Approve evidence | Berhasil | P0 |
| APP-O-05 | Employee | Coba approve overtime | Ditolak | P0 |

## Payroll

| ID | Role | Skenario | Expected Result | Prioritas |
|---|---|---|---|---|
| APP-P-01 | Manager | Manager approve payroll | Berhasil bila memang official step 1 | P0 |
| APP-P-02 | HR | HR approve payroll setelah manager approval | Berhasil | P0 |
| APP-P-03 | Employee | Coba approve payroll | Ditolak | P0 |
| APP-P-04 | Role lain | Coba melompati approval stage | Ditolak / tidak tersedia | P0 |

## Assets

| ID | Role | Skenario | Expected Result | Prioritas |
|---|---|---|---|---|
| APP-A-01 | Manager/HR/Admin | Approve asset assignment | Berhasil | P1 |
| APP-A-02 | Employee | Coba approve asset assignment | Ditolak | P1 |

## Promotions

| ID | Role | Skenario | Expected Result | Prioritas |
|---|---|---|---|---|
| APP-PR-01 | HR/Admin | Approve promotion | Berhasil | P1 |
| APP-PR-02 | Employee | Coba approve promotion | Seharusnya ditolak — perlu verifikasi backend | P0 |
| APP-PR-03 | HR/Admin | Approve promotion report | Berhasil | P1 |

## Training

| ID | Role | Skenario | Expected Result | Prioritas |
|---|---|---|---|---|
| APP-T-01 | Manager/HR/Admin | Approve enrollment | Berhasil | P1 |
| APP-T-02 | Employee | Coba approve enrollment | Ditolak | P1 |

## Shift Swap

| ID | Role | Skenario | Expected Result | Prioritas |
|---|---|---|---|---|
| APP-S-01 | Manager/HR/Admin | Approve shift swap | Berhasil | P1 |
| APP-S-02 | Employee | Coba approve shift swap | Ditolak | P1 |

## Assignment Letter

| ID | Role | Skenario | Expected Result | Prioritas |
|---|---|---|---|---|
| APP-AL-01 | Employee | Submit assignment letter | Berhasil jika memang rule bisnis mengizinkan | P1 |
| APP-AL-02 | Manager/HR/Admin | Approve assignment letter | Harus sesuai keputusan bisnis | P0 |
| APP-AL-03 | Employee | Coba approve assignment letter | Seharusnya ditolak bila approval bukan hak employee | P0 |

---

# 6. Test Case Master Data & Admin

| ID | Role | Flow | Expected Result | Prioritas |
|---|---|---|---|---|
| ADM-01 | Admin | CRUD users/roles/menu permissions | Berhasil | P0 |
| ADM-02 | Super Admin | Semua CRUD RBAC | Berhasil | P0 |
| ADM-03 | HR | Akses `/admin/menu-permissions` | Ditolak bila hanya admin/super admin | P0 |
| ADM-04 | Employee | Akses locations/work schedules | Ditolak | P1 |
| ADM-05 | Admin/HR/Manager | Locations CRUD | Berhasil bila memang rule sekarang diterima PM | P1 |
| ADM-06 | Admin/HR/Manager | Departments/positions/company/schedules CRUD | Berhasil sesuai backend | P1 |
| ADM-07 | Admin/HR/Manager | Admin notifications | Berhasil | P1 |
| ADM-08 | Employee | Audit log | Ditolak | P0 |
| ADM-09 | HR/Admin/Super Admin | Approval flow config | Berhasil | P1 |
| ADM-10 | Manager | Approval flow config | Seharusnya ditolak menurut backend | P1 |

---

# 7. Test Case Performance & Modul Belum Matang

| ID | Role | Flow | Expected Result | Prioritas |
|---|---|---|---|---|
| PERF-01 | Employee | Akses performance admin pages | Seharusnya ditolak bila bukan scope employee | P1 |
| PERF-02 | Admin/HR/Manager | Buat OKR | Berhasil bila modul masuk release | P1 |
| PERF-03 | Admin/HR/Manager | Start 360 review | Saat ini belum valid karena flow belum benar-benar aktif | P0 |
| PERF-04 | Admin/HR/Manager | Simpan calibration | Saat ini gagal memenuhi expected karena masih mock | P0 |
| PERF-05 | Admin/HR/Manager | View calibration report | Harus sesuai endpoint backend bila modul dipertahankan | P1 |

---

# 8. Test Case Data Isolation

| ID | Role | Skenario | Expected Result | Prioritas |
|---|---|---|---|---|
| ISO-01 | Employee A | Buka payroll milik Employee B via URL/API | Ditolak | P0 |
| ISO-02 | Employee A | Buka dokumen Employee B | Ditolak | P0 |
| ISO-03 | Employee A | Buka aset Employee B | Ditolak | P0 |
| ISO-04 | Employee A | Buka assignment letter Employee B | Ditolak | P0 |
| ISO-05 | Manager A | Buka data team di luar cakupan jika rule hanya own team | Sesuai kebijakan bisnis | P1 |

---

# 9. Defect Discovery Checklist Saat Eksekusi Test

Untuk setiap test case, catat:

| Item yang dicatat | Contoh |
|---|---|
| Apakah menu terlihat? | Ya / Tidak |
| Apakah URL langsung bisa dibuka? | Ya / Tidak |
| Apakah tombol tampil? | Ya / Tidak |
| Apakah API dipanggil? | Endpoint + method |
| Apakah backend mengizinkan/menolak? | 200 / 403 / 404 / 422 |
| Apakah UI memberi feedback benar? | Toast / field error / redirect |
| Apakah data berubah? | Status / list / history |
| Apakah ada data user lain bocor? | Ya / Tidak |

---

# 10. Urutan Eksekusi Test yang Disarankan

## Gelombang test 1 — P0
1. Auth
2. Direct URL access
3. Leave approval
4. Payroll approval
5. Overtime create + approval
6. My documents download
7. Employee lifecycle
8. Shift swap edit
9. Assignment letter approval boundary
10. Performance mock flows

## Gelombang test 2 — P1
1. Menu visibility lengkap
2. Assets
3. Promotions
4. Training
5. Admin utilities
6. Data isolation

## Gelombang test 3 — P2
1. Copy polish
2. Pagination nuance
3. Toast behavior
4. Route duplication / legacy screens

---

# 11. Output yang Diharapkan Setelah Test Ini Dijalankan

Setelah dokumen ini dipakai untuk QA manual, hasil berikut harus dihasilkan:

1. **Pass/Fail Role Matrix**
2. **Daftar bug berdasarkan role**
3. **Daftar route yang harus diberi guard**
4. **Daftar backend route yang perlu diketatkan**
5. **Daftar fitur yang sebaiknya disembunyikan dulu bila belum siap**

