# Audit 5 Business Flow Paling Kritis — End-to-End Berdasarkan Role

Tanggal audit: 15 Mei 2026  
Ruang lingkup: audit berbasis kode frontend saat ini + pencocokan dengan `routes/api.php` backend yang diberikan.  
Catatan: ini belum menggantikan uji manual browser/live API; dokumen ini memetakan apakah rantai bisnis sudah tersusun benar di level implementasi.

## Ringkasan Eksekutif

| Flow | Rantai Role Ideal | Status Saat Ini | Blocker Utama | Verdict Production |
|---|---|---:|---|---|
| Leave | Employee → Manager/HR → Employee | Hampir utuh | Beberapa route sensitif belum digate jelas di router; ringkasan hanya berdasar page aktif | Layak diuji lanjut |
| Payroll | Admin/HR create → Manager approve → HR approve → HR pay → Employee view slip | Secara fungsi tersedia | Boundary role belum tegas di frontend route; halaman legacy masih ada | Perlu hardening sebelum production |
| Overtime | Employee request/evidence → Manager/HR approve → Employee lihat status | Belum utuh | Frontend memanggil `POST /my/overtime`, backend route tidak ada | Belum layak production |
| Reimbursement | Employee draft → submit → Manager/HR approve/reject → HR mark paid | Hampir utuh | UI admin belum expose `mark-paid`; statistik/list hanya page aktif | Layak dengan catatan |
| Employee Lifecycle | HR/Admin create → onboarding → active → offboarding → complete | Belum utuh | UI lifecycle belum benar-benar memanggil API lifecycle | Belum layak production |

---

# 1. Leave Flow

## Intended role flow

```text
Employee
  ├─ lihat saldo cuti
  ├─ buat pengajuan
  └─ lihat status pengajuan

Manager / HR / Admin / Super Admin
  ├─ lihat pending approval
  ├─ approve / reject
  └─ lihat riwayat approval
```

## Current frontend trace

| Tahap | Role | Halaman | API | Temuan |
|---|---|---|---|---|
| Lihat saldo | Employee | `/leave/balance` → `LeaveBalancePage` | `GET /leaves/balance` | Cocok dengan backend. |
| Buat pengajuan | Employee / admin yang diberi akses | `/leave/request` atau `/leave/requests/create` → `CreateLeavePage` | saat load `GET /leave-types`; submit `POST /leaves` | Validasi FE ada: tipe, tanggal, urutan tanggal, alasan. Setelah sukses redirect. |
| Lihat daftar | Employee / approver | `/leave/my-leave`, `/leave/requests` | `GET /leaves` | Flow tersedia, tetapi `/leave/requests` dapat tampil untuk user yang bukan approver; aksi approve disembunyikan via permission, bukan route-level guard. |
| Approval | Manager / HR / Admin / Super Admin | `/leave/approval` → `LeaveApprovalPage` | `GET /leaves/pending`, `PUT /leaves/{id}/approve`, `PUT /leaves/{id}/reject` | Cocok dengan backend dan sudah ada `can_act`. |
| Riwayat approval | Approver | modal history | `GET /approval-history/leave/{id}` | Cocok dengan backend. |

## Temuan penting

| Issue | Severity | Dampak |
|---|---|---|
| Route frontend `/leave/approval` tidak dibungkus `MenuRouteGuard` atau role guard khusus di router | 🟡 Warning | Backend masih melindungi approval, tetapi UX dan kontrol akses frontend tidak seketat modul admin lain. |
| `LeaveRequestsPage` menampilkan statistik dari page aktif, bukan total dataset | 🟡 Warning | Dashboard bisa menyesatkan saat data banyak. |
| `paginatedItems = filteredItems`; filter dilakukan terhadap data page aktif | 🟡 Warning | Pencarian/filter terasa seolah global padahal hanya halaman saat ini. |
| Error 422/403/500 masih generik via toast | 🟡 Warning | Flow tetap jalan, tetapi QA belum bisa menyebut handling-nya matang. |

## Verdict

Flow bisnis leave sudah tersambung dari employee sampai approver. Ini flow paling siap dari lima flow kritis, tetapi masih perlu pengujian role langsung dan pembenahan kualitas UX data besar.

---

# 2. Payroll Flow

## Intended role flow

```text
Admin / HR
  └─ create atau generate payroll

Manager
  └─ approve tahap 1: draft → pending_hr

HR
  └─ approve tahap 2: pending_hr → approved

HR / Finance
  └─ process payment: approved → paid

Employee
  └─ lihat payroll sendiri + slip + export
```

## Current frontend trace

| Tahap | Role | Halaman | API | Temuan |
|---|---|---|---|---|
| Generate / CRUD payroll | Admin/HR/Manager menurut backend | `/payroll/run` → `PayrollManagementPage` | `GET /payroll`, `POST /payroll`, `POST /payroll/generate/monthly`, `PUT /payroll/{id}`, `DELETE /payroll/{id}` | Berfungsi, tetapi halaman ini masih gaya CRUD teknis/legacy. |
| Approval workflow | Manager lalu HR | `/payroll/process` → `PayrollProcessPage` | `POST /payroll/{id}/manager-approve`, `POST /payroll/{id}/hr-approve`, `POST /payroll/{id}/reject` | Ternyata jalur manager → HR **sudah ada** di halaman proses. |
| Payment | HR / Admin | `/payroll/process` | `POST /payroll/{id}/pay`, `POST /payroll/bulk-pay` | Sudah ada. |
| Employee view | Employee | `/my/payroll` → `MyPayrollPage` | `GET /my/payroll`, `GET /my/payroll/{id}/slip`, export CSV/PDF | Cocok dengan backend. |

## Temuan penting

| Issue | Severity | Dampak |
|---|---|---|
| Router payroll belum memakai guard berbasis role/menu; seluruh page berada di bawah `ProtectedRoute` umum | 🟡 Warning | Backend mungkin menolak, tetapi frontend masih membuka halaman payroll sensitif ke user yang hanya login. |
| Ada dua wajah payroll: `PayrollManagementPage` legacy dan `PayrollProcessPage` workflow resmi | 🟡 Warning | Risiko kebingungan PM/user dan duplikasi aksi approve. |
| `PayrollApprovePage` masih ada sebagai file terpisah tetapi route `/payroll/approve` diarahkan ke `/payroll/process` | 🟢 Info | Menandakan migrasi belum sepenuhnya dibersihkan. |
| Statistik list cenderung dihitung dari data termuat, bukan keseluruhan dataset | 🟡 Warning | Ringkasan bisa tidak representatif. |

## Verdict

Secara proses bisnis inti, payroll ternyata sudah lebih lengkap daripada kesan awal: create → manager approve → HR approve → pay → employee slip sudah ada. Yang belum matang adalah **pengamanan role di frontend dan penyederhanaan bentuk flow** agar tidak ada dua jalur yang terasa bersaing.

---

# 3. Overtime Flow

## Intended role flow

```text
Employee
  ├─ punya record lembur dari attendance
  ├─ buat request lembur bila belum ada
  ├─ isi alasan
  └─ upload evidence

Manager / HR / Admin
  ├─ lihat request
  ├─ approve / reject request
  └─ approve / reject evidence

Employee
  └─ lihat status + bukti
```

## Current frontend trace

| Tahap | Role | Halaman | API | Temuan |
|---|---|---|---|---|
| Employee lihat lembur | Employee | `/my/overtime` → `OvertimePage` | `GET /attendance/overtime`, `GET /my/overtime` | Cocok dengan backend. |
| Buat request jika belum ada | Employee | tombol upload evidence di `OvertimePage` | `POST /my/overtime` | **Tidak ada di backend `routes/api.php` yang diberikan.** |
| Isi alasan | Employee | `OvertimePage` | `PUT /my/overtime/{id}/reason` | Cocok dengan backend. |
| Upload evidence | Employee | `OvertimePage` | `POST /my/overtime/{id}/evidence` | Cocok dengan backend. |
| Approval request | Manager/HR/Admin | `/attendance/overtime` atau page approval admin | `GET /overtime/requests`, `PUT /overtime/requests/{id}/approve`, `PUT /overtime/requests/{id}/reject` | Cocok dengan backend. |
| Review evidence | Manager/HR/Admin | `OvertimeApprovalPage` | `GET /overtime/evidences/request/{id}`, `PUT /overtime/evidences/{id}/approve`, `PUT /overtime/evidences/{id}/reject` | Cocok dengan backend. |

## Temuan penting

| Issue | Severity | Dampak |
|---|---|---|
| Frontend memakai `POST /my/overtime`, tetapi backend yang diberikan tidak punya endpoint itu | 🔴 Critical | Employee tidak bisa membentuk request lembur baru dari record attendance yang belum punya request. |
| Halaman yang sama (`OvertimePage`) berubah perilaku berdasarkan permission `overtime.view` / `attendance.view_all` | 🟡 Warning | Bisa bekerja, tetapi model mental user dan QA jadi lebih rumit. |
| Error saat load hanya `console.error` tanpa toast/fallback jelas | 🟡 Warning | User bisa melihat halaman kosong tanpa tahu penyebabnya. |
| Summary card dihitung dari data yang sedang dimuat | 🟡 Warning | Angka bisa hanya mewakili page aktif. |

## Verdict

Flow overtime **belum utuh**. Selama gap `POST /my/overtime` belum diputuskan—backend ditambah atau frontend diubah agar tidak butuh create request—alur employee → approval belum bisa dianggap aman masuk production.

---

# 4. Reimbursement Flow

## Intended role flow

```text
Employee
  ├─ create draft
  ├─ edit / delete saat draft
  └─ submit

Manager / HR / Admin
  ├─ review submitted claim
  ├─ approve / reject
  └─ mark paid

Employee
  └─ pantau status dan riwayat
```

## Current frontend trace

| Tahap | Role | Halaman | API | Temuan |
|---|---|---|---|---|
| Draft & submit | Employee | `/my/reimbursements` → `MyReimbursementsPage` | `GET /my/reimbursements`, `POST /my/reimbursements`, `PUT /my/reimbursements/{id}`, `DELETE /reimbursements/{id}`, `POST /my/reimbursements/{id}/submit` | Selaras dengan backend. |
| Review | Manager/HR/Admin | `/reimbursements` → `AdminReimbursementsPage` | `GET /reimbursements`, `GET /reimbursements/statistics` | Selaras dengan backend. |
| Approve / reject | Manager/HR/Admin | `AdminReimbursementsPage` | `PUT /reimbursements/{id}/approve`, `PUT /reimbursements/{id}/reject` | Selaras dengan backend. |
| Mark paid | HR/Admin | Backend tersedia | `PUT /reimbursements/{id}/mark-paid` | Service tersedia, tetapi dari potongan halaman admin yang dibaca belum tampak dipakai di UI utama. |
| History | Semua aktor terkait | modal history | `GET /approval-history/reimbursement/{id}` | Cocok. |

## Temuan penting

| Issue | Severity | Dampak |
|---|---|---|
| `mark-paid` ada di backend dan service, tetapi belum tampak di flow UI admin aktif | 🟡 Warning | Claim bisa disetujui tetapi tahap pembayaran tidak terlihat selesai dari UI. |
| Summary dan filter dihitung dari item yang sedang dimuat | 🟡 Warning | Bisa bias pada data besar. |
| `fetchData()` di `MyReimbursementsPage` hanya dipanggil awal mount, bukan tergantung `currentPage` | 🟡 Warning | Pagination page berubah tetapi data berpotensi tidak ikut reload. |
| Handling 403 disamarkan menjadi fallback message biasa | 🟢 Info | Tidak memblokir flow, tetapi kurang jelas bagi user/QA. |

## Verdict

Flow reimbursement secara bisnis hampir lengkap dan jauh lebih siap daripada overtime/lifecycle. Bagian yang paling perlu dikonfirmasi bersama PM adalah: apakah “paid” memang wajib menjadi tahap akhir operasional di frontend, dan role siapa yang boleh menekan aksi itu.

---

# 5. Employee Lifecycle Flow

## Intended role flow

```text
HR / Admin
  ├─ create employee
  ├─ start onboarding
  ├─ complete onboarding
  ├─ start offboarding
  └─ complete offboarding
```

## Current frontend trace

| Tahap | Role | Halaman | API | Temuan |
|---|---|---|---|---|
| Create employee | HR/Admin/Manager menurut backend | `/employees/add` → `EmployeeCreatePage` | `POST /employees` | Berjalan; metadata memuat lokasi, user, jadwal kerja, departemen. |
| Update employee | HR/Admin/Manager | `/employees/update/:id` → `EmployeeEditPage` | `GET /employees/{id}`, `PUT /employees/{id}` | Berjalan. |
| Start onboarding | HR/Admin/Manager | modal sudah ada | backend: `PUT /employees/{id}/onboarding/start` | Service tersedia, tetapi `EmployeesPage.handleLifecycleAction()` masih stub dan tidak memanggil API. |
| Complete onboarding | HR/Admin/Manager | modal type sudah didefinisikan | backend: `PUT /employees/{id}/onboarding/complete` | Belum tersambung ke UI aktif. |
| Start offboarding | HR/Admin/Manager | modal sudah ada | backend: `PUT /employees/{id}/offboarding/start` | Service tersedia, tetapi UI belum memanggilnya. |
| Complete offboarding | HR/Admin/Manager | modal type sudah didefinisikan | backend: `PUT /employees/{id}/offboarding/complete` | Belum tersambung ke UI aktif. |

## Temuan penting

| Issue | Severity | Dampak |
|---|---|---|
| `handleLifecycleAction()` hanya menutup modal dan reload list; tidak memanggil API lifecycle sama sekali | 🔴 Critical | Onboarding/offboarding terlihat ada di UI, tetapi secara bisnis belum benar-benar terjadi. |
| Di tabel employee yang aktif, tidak terlihat action button untuk memicu modal lifecycle | 🔴 Critical | Bahkan stub flow tadi tampaknya belum benar-benar dapat dimulai user dari layar utama. |
| Status employee dapat diubah langsung dari edit form | 🟡 Warning | Bisa memotong alur lifecycle yang semestinya punya jejak proses. |
| Router employee sudah memakai `MenuRouteGuard`, ini lebih baik daripada modul payroll/leave | 🟢 Info | Boundary akses relatif lebih rapi di frontend. |

## Verdict

Flow employee lifecycle **belum siap production**. Create/edit employee sudah jalan, tetapi lifecycle yang seharusnya menjadi alur bisnis utama masih berupa kulit antarmuka.

---

# Prioritas QA Setelah Audit Kode Ini

## P0 — wajib diverifikasi / diputuskan sebelum production

1. **Overtime**
   - Putuskan sumber kebenaran pembuatan request:
     - backend menambah `POST /my/overtime`, atau
     - frontend diubah agar request terbentuk lewat proses lain yang memang ada.
2. **Employee Lifecycle**
   - Sambungkan onboarding/offboarding ke API sungguhan dan pastikan tombol pemicunya tersedia.
3. **Payroll role boundary**
   - Pastikan manager tidak bisa melakukan aksi HR, HR tidak tersesat di page legacy, dan employee tidak bisa membuka page payroll admin hanya karena login.

## P1 — perlu diuji sesudah P0

1. Leave approval by role
2. Reimbursement full chain sampai `paid`
3. Direct URL access untuk semua page kritis
4. 422 / 403 / 500 handling
5. Data besar dan pagination

---

# Rekomendasi Urutan Langkah Berikutnya

```text
1. Validasi manual 5 flow ini memakai akun per role
2. Catat mismatch aktual antara frontend role, backend role, dan ekspektasi bisnis PM
3. Baru susun backlog fix:
   - blocker production
   - policy clarification
   - UX/data correctness
```

## Kesimpulan QA

Kalau pertanyaannya, “apakah lima flow kritis ini sudah aman dianggap sesuai?” jawabannya:

- **Sudah relatif sesuai:** Leave, Reimbursement
- **Sudah ada bentuk bisnisnya tetapi perlu hardening akses/arsitektur:** Payroll
- **Masih belum sesuai / belum utuh:** Overtime, Employee Lifecycle

Dengan kata lain, aplikasi ini sudah punya banyak tulang yang benar, tetapi dua sendi pentingnya—**overtime request creation** dan **employee lifecycle execution**—masih belum bergerak sungguhan.
