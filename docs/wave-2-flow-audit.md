# Audit Flow Gelombang 2 — Approval & Lifecycle

Ruang lingkup:
1. Employee Management
2. Assets
3. Promotions
4. Training & Competency
5. Workforce / Shift Swap

Prinsip audit:
- Yang dinilai bukan hanya apakah endpoint ada, tetapi apakah flow benar-benar hidup dari UI aktif → service → backend → refresh state.
- Backend acuan adalah `routes/api.php` yang diberikan sebelumnya.

## Ringkasan Eksekutif

| Modul | Status Umum | Temuan Paling Penting |
|---|---|---|
| Employee Management | Belum utuh | Service lifecycle tersedia, tetapi flow lifecycle aktif di halaman utama belum benar-benar memanggil API |
| Assets | Cukup matang | CRUD, assignment, return, approval, history sudah tersambung; masih ada isu pagination/filter semu |
| Promotions | Cukup matang | Flow approval + report pasca-promosi sudah hidup; metrik masih page-local |
| Training & Competency | Sedang | Enrollment approval hidup, competency CRUD/assign hidup; form dan error handling belum kuat |
| Workforce / Shift Swap | Sedang | Approval hidup, tetapi approval path bercabang dan edit route tampak belum benar-benar diimplementasikan |

---

## 1. Employee Management

### Flow yang ditemukan

| Sub-flow | Entry point | API | Status |
|---|---|---|---|
| List karyawan | `/employees` → `EmployeesPage` | `GET /employees` | Aktif |
| Create | `/employees/add` → `EmployeeCreatePage` | `POST /employees` | Aktif |
| Edit | `/employees/update/:id` → `EmployeeEditPage` | `GET /employees/{id}`, `PUT /employees/{id}` | Aktif |
| Delete | tombol hapus di list | `DELETE /employees/{id}` | Aktif |
| Start onboarding | modal lifecycle + service | `PUT /employees/{id}/onboarding/start` | Backend/service ada, flow aktif belum tersambung |
| Complete onboarding | service | `PUT /employees/{id}/onboarding/complete` | Backend/service ada, flow aktif belum tersambung |
| Start offboarding | modal lifecycle + service | `PUT /employees/{id}/offboarding/start` | Backend/service ada, flow aktif belum tersambung |
| Complete offboarding | service | `PUT /employees/{id}/offboarding/complete` | Backend/service ada, flow aktif belum tersambung |

### Laporan rinci

| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Lifecycle | User membuka modal onboarding/offboarding | Belum ada API dari halaman aktif | `EmployeesPage.handleLifecycleAction()` hanya menutup modal dan reload list; tidak memanggil `startOnboarding`, `completeOnboarding`, `startOffboarding`, atau `completeOffboarding` | 🔴 Critical | Sambungkan aksi lifecycle ke service yang sudah ada dan tentukan trigger UI per karyawan |
| Lifecycle | Akses tindakan dari UI | - | Di tabel aktif hanya ada edit/hapus; tidak terlihat tombol untuk membuka modal lifecycle dari row karyawan | 🔴 Critical | Sediakan entry point nyata untuk lifecycle action atau keluarkan modal mati dari UI |
| List | Filter jabatan | `GET /employees` | `selectedPosition` ada di UI, tetapi tidak pernah dikirim ke request | 🟡 Warning | Kirim parameter position ke backend atau hapus filter yang belum berfungsi |
| List | Summary cards | `GET /employees` | Statistik aktif/departemen/jabatan dihitung dari page saat ini, sementara total karyawan berasal dari total backend | 🟡 Warning | Ambil aggregate dari backend atau beri label jelas bahwa itu hanya data halaman ini |
| Error handling | Create/update/lifecycle | `POST/PUT /employees...` | Penanganan error cenderung generik; belum terlihat mapping field-level untuk 422, fallback khusus 403/500 | 🟡 Warning | Tambahkan error mapping per field dan state forbidden/system failure yang eksplisit |

### Kesesuaian backend
- Semua endpoint CRUD employee cocok dengan backend.
- Endpoint lifecycle backend **sudah tersedia** dan service frontend juga sudah tersedia.
- Masalah utama bukan mismatch endpoint, melainkan **flow UI aktif belum menggunakannya**.

---

## 2. Assets

### Flow yang ditemukan

| Sub-flow | Entry point | API | Status |
|---|---|---|---|
| Inventory list | `/inventory/assets` atau `/assets` → `AssetManagementPage` | `GET /assets` | Aktif |
| Create/edit/delete asset | form + tombol row | `POST /assets`, `GET /assets/{id}`, `PUT /assets/{id}`, `DELETE /assets/{id}` | Aktif |
| Assign asset | modal assign | `POST /assets/{id}/assign` | Aktif |
| Return asset oleh admin | assignments tab | `PUT /assets/assignments/{assignmentId}/return` | Aktif |
| Approval assignment | assignments tab | `PUT /assets/assignments/{id}/approve`, `PUT /assets/assignments/{id}/reject` | Aktif |
| ESS my assets | `/my/assets` | `GET /my/assets` | Aktif |
| Return asset oleh employee | `/my/assets` | `PUT /my/assets/return/{assignmentId}` | Aktif |

### Laporan rinci

| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Inventory list | Load page | `GET /assets` | Pagination state ada, tetapi `paginatedAssets = sortedAssets`; `totalPages` tidak benar-benar diisi dari backend | 🟡 Warning | Terapkan pagination nyata atau hapus kontrol pagination semu |
| Assign asset | Setelah sukses | `POST /assets/{id}/assign` | Pada inventory tab, assign sukses hanya menutup modal dan toast; list aset tidak terlihat direfresh di tab itu | 🟡 Warning | Refresh inventory setelah assign agar status asset langsung berubah |
| Return asset | Setelah sukses | `PUT /assets/assignments/{id}/return` | Flow assignment tab refresh, namun inventory tab lain bisa tertinggal jika user berpindah tab setelah aksi | 🟡 Warning | Sinkronkan state assets/assignments antar tab |
| Approval assignment | Approve/reject | `PUT /assets/assignments/{id}/approve|reject` | Flow tersambung dan refresh berjalan; ini salah satu flow approval yang relatif paling lengkap | 🟢 Info | Jadikan pola referensi untuk modul approval lain |
| ESS return | Submit return | `PUT /my/assets/return/{id}` | Saat gagal, hanya `console.error`; tidak ada toast/error state ke user | 🟡 Warning | Tambahkan umpan balik error terlihat |

### Kesesuaian backend
- Semua endpoint utama asset cocok dengan backend.
- Approval assignment frontend menggunakan endpoint yang memang tersedia.
- Modul ini sudah punya riwayat approval (`asset_assignment`) yang tersambung.

---

## 3. Promotions

### Flow yang ditemukan

| Sub-flow | Entry point | API | Status |
|---|---|---|---|
| List/admin | `/promotions` → `PromotionPage` | `GET /promotions` | Aktif |
| Create promotion | modal create | `POST /promotions` | Aktif |
| Approve/reject promotion | aksi row | `POST /promotions/{id}/approve`, `POST /promotions/{id}/reject` | Aktif |
| Delete promotion | aksi row | `DELETE /promotions/{id}` | Aktif |
| ESS my promotions | `/my/promotions` | `GET /my/promotions` | Aktif |
| Submit activity report | modal ESS | `POST /my/promotions/{id}/report/submit` | Aktif |
| Approve/reject report | admin table/modal | `POST /promotions/{id}/report/approve`, `POST /promotions/{id}/report/reject` | Aktif |

### Laporan rinci

| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Promotion approval | Approve/reject | `POST /promotions/{id}/approve|reject` | Alur sesuai backend dan refresh list berjalan | 🟢 Info | Flow sudah layak dijadikan baseline approval lifecycle |
| Post-approval report | Employee submit report | `POST /my/promotions/{id}/report/submit` | Saat gagal submit report, user hanya mendapat `console.error`; tidak ada toast visible | 🟡 Warning | Tambahkan feedback error ke UI |
| Report review | Admin approve/reject report | `POST /promotions/{id}/report/approve|reject` | Alur sesuai backend, tetapi modal reject hanya validasi string kosong di frontend | 🟡 Warning | Tambahkan validasi lebih jelas dan field-level error 422 |
| Metrics | Summary cards | `GET /promotions` | Beberapa summary dihitung dari `items` halaman saat ini walau total utama memakai total backend | 🟡 Warning | Gunakan aggregate backend atau labelkan sebagai current page |

### Kesesuaian backend
- Semua endpoint promotion yang dipakai frontend cocok dengan backend.
- Modul ini punya rangkaian approval paling lengkap:
  1. create promotion
  2. approve/reject promotion
  3. employee submit report
  4. approve/reject report
  5. history modal

---

## 4. Training & Competency

### Flow yang ditemukan

| Sub-flow | Entry point | API | Status |
|---|---|---|---|
| Program list | `/training/programs` | `GET /training/programs` | Aktif |
| Create/edit/delete program | form/list | `POST /training/programs`, `GET /training/programs/{id}`, `PUT /training/programs/{id}`, `DELETE /training/programs/{id}` | Aktif |
| Admin enroll employee | modal enroll | `POST /training/programs/{id}/enroll` | Aktif |
| Enrollment approval | enrollment tab | `PUT /training/enrollments/{id}/approve`, `PUT /training/enrollments/{id}/reject` | Aktif |
| Complete training | enrollment tab | `PUT /training/enrollments/{id}/complete` | Aktif |
| ESS my trainings | `/my/trainings` | `GET /my/trainings`, `GET /my/trainings/available`, `POST /my/trainings/{id}/enroll` | Aktif |
| Competency CRUD | `/competencies` | `GET/POST/PUT/DELETE /competencies` | Aktif |
| Assign competency | modal assign | `POST /competencies/{id}/assign` | Aktif |
| Assess competency | service tersedia | `POST /competencies/assignment/{id}/assess` | Belum terlihat aktif di halaman yang diaudit |
| ESS my competencies | `/my/competencies` | `GET /my/competencies` | Aktif |

### Laporan rinci

| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Program form | Submit create/edit | `POST/PUT /training/programs...` | Jika 422, hanya `console.error`; tidak ada feedback jelas ke user | 🟡 Warning | Tampilkan validasi field dan pesan visible |
| Enrollment approval | Approve/reject | `PUT /training/enrollments/{id}/approve|reject` | Alur sesuai backend dan aktif di UI | 🟢 Info | Pertahankan |
| Completion | Tandai selesai | `PUT /training/enrollments/{id}/complete` | Flow aktif, tetapi input `certificate_path` berupa path manual; berpotensi tidak cocok dengan flow upload riil jika nanti dibutuhkan | 🟡 Warning | Validasi kebutuhan produk: path manual vs upload file nyata |
| Competency assess | Penilaian kompetensi | `POST /competencies/assignment/{id}/assess` | Service ada, tetapi tidak terlihat entry point aktif dari halaman `CompetencyMatrixPage` atau `MyCompetenciesPage` yang dibaca | 🟡 Warning | Pastikan assess memang punya UI aktif atau tandai endpoint sebagai belum diekspos |
| List pages | Pagination | Beberapa list hanya mengatur state `totalPages` tetapi item tetap seluruh array lokal | 🟡 Warning | Seragamkan pagination nyata |

### Kesesuaian backend
- Semua endpoint training utama cocok dengan backend.
- Kompetensi juga cocok.
- Kesenjangan utama ada di **kelengkapan UI flow**, bukan endpoint mismatch.

---

## 5. Workforce / Shift Swap

### Flow yang ditemukan

| Sub-flow | Entry point | API | Status |
|---|---|---|---|
| List shift swaps | `/workforce/shift-swaps` | `GET /workforce/shift-swaps` | Aktif |
| Create request | `/workforce/shift-swaps/create` | `POST /workforce/shift-swaps` | Aktif |
| Approve basic | tombol approve saat `approval_flow_id` kosong | `PUT /workforce/shift-swaps/{id}` payload `{ status: "approved" }` | Aktif |
| Approve via flow | tombol approve saat `approval_flow_id` ada | `PUT /workforce/shift-swaps/{id}/approve` | Aktif |
| Reject | tombol reject | `PUT /workforce/shift-swaps/{id}/reject` | Aktif |
| Edit page | `/workforce/shift-swaps/edit/:id` | Tidak terlihat load/update | Route ada, flow belum nyata |

### Laporan rinci

| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Create | Submit form | `POST /workforce/shift-swaps` | Payload memakai `swap_date`, sementara tampilan list membaca `shift_date`; perlu diverifikasi kontrak backend datanya | 🟡 Warning | Konfirmasi field backend yang canonical dan seragamkan istilah |
| Approve | Approve pending swap | `PUT /workforce/shift-swaps/{id}` atau `/approve` | Ada dua jalur approve berbeda tergantung `approval_flow_id`; ini sah menurut backend, tetapi kompleks dan rentan inkonsistensi state | 🟡 Warning | Dokumentasikan rule bisnis kapan tiap jalur dipakai; idealnya satu pola approval |
| Reject | Reject pending swap | `PUT /workforce/shift-swaps/{id}/reject` | Sesuai backend | 🟢 Info | Pertahankan |
| Edit | Akses `/workforce/shift-swaps/edit/:id` | Tidak terlihat `GET detail` atau `PUT update` dari form | Route edit ada, tetapi form selalu memanggil create; `isEdit` hanya mengubah judul | 🔴 Critical | Hapus route edit atau implementasikan benar-benar load + update |
| Approval dependency | Approve via flow | `/approve` | UI sendiri mengakui approve bisa gagal jika approval flow belum dikonfigurasi | 🟡 Warning | Tambahkan pre-check/empty configuration state sebelum user mencoba approve |
| Pagination | List | `GET /workforce/shift-swaps` | Service mendukung pagination, tetapi page memanggil tanpa current page dan merender seluruh array lokal | 🟡 Warning | Gunakan pagination backend secara nyata |

### Kesesuaian backend
- Endpoint shift swap yang dipakai frontend semuanya tersedia di backend.
- Masalah terbesar adalah **route edit yang tampak palsu** dan **dua mode approval** yang menambah risiko perilaku bercabang.

---

## Temuan Lintas Modul

| Area | Temuan | Severity |
|---|---|---|
| Guard frontend | Banyak route sensitif Gelombang 2 (`/training/*`, `/competencies`, `/workforce/*`, `/inventory/assets`, `/promotions`) hanya berada di bawah `ProtectedRoute`, belum memakai `MenuRouteGuard` seperti employee/admin tertentu | 🟡 Warning |
| Pagination | Banyak halaman memiliki `currentPage`, `pageSize`, `totalPages`, tetapi data yang dirender tetap seluruh array hasil lokal | 🟡 Warning |
| Error handling | 422/403/500 umumnya belum dibedakan dengan baik; banyak flow masih toast generik atau hanya `console.error` | 🟡 Warning |
| Approval consistency | Assets dan Promotions lebih rapi; Employee lifecycle dan Shift Swap menunjukkan gap antara backend capability dan flow UI aktif | 🟡 Warning |
| UI truthfulness | Beberapa route/form tersedia secara visual tetapi belum benar-benar menyelesaikan kerja nyata, khususnya employee lifecycle dan shift swap edit | 🔴 Critical |

## Prioritas Audit Lanjutan yang Disarankan

1. **P0**
   - Employee lifecycle aktif di UI
   - Shift swap edit route
2. **P1**
   - Frontend guard konsisten untuk modul sensitif
   - Error handling 422/403/500
   - Pagination nyata vs pagination semu
3. **P2**
   - Standardisasi metric cards
   - Cleanup flow ganda / route yang hanya historis

