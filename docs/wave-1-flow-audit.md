# Audit Flow Gelombang 1

Modul:
1. Admin / RBAC
2. Leave
3. Payroll
4. Reimbursement
5. Overtime

Sumber:
- Frontend: router, pages, API services, auth store, RBAC helper
- Backend: `routes/api.php` yang diberikan user

## Ringkasan eksekutif

| Modul | Status umum | Risiko utama |
|---|---|---|
| Admin / RBAC | Berjalan, tetapi pagar frontend belum konsisten | Akses halaman sensitif masih banyak bergantung pada backend; ada frontend API call ke endpoint user detail yang tidak tersedia di backend |
| Leave | Flow inti tersedia | Approval bekerja, tetapi validasi backend belum dipetakan per-field; filtering statistik hanya berdasarkan halaman aktif |
| Payroll | Flow backend kaya, tetapi flow frontend aktif belum menyatu | Halaman approval yang benar ada tetapi tidak diroute aktif; halaman aktif memakai approval generik/backward-compatible sehingga alur manager→HR tidak terekspos |
| Reimbursement | Flow inti tersedia | Ada tiga implementasi UI berbeda untuk domain yang sama; sebagian route aktif memakai halaman admin sederhana, sementara halaman approval/ledger lain tidak diroute |
| Overtime | Flow inti tersedia | Terdapat dua UI approval berbeda; employee create request bergantung pada endpoint yang backend-nya hanya tersedia sebagai `PUT reason`, belum ada `POST /my/overtime` pada `api.php` |

---

# 1. Admin / RBAC

## Flow aktual

### A. List users
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Users list | Load `/admin/users` | `GET /admin/users?page=&per_page=` | Cocok dengan backend. Ada loading, empty, retry, pagination. | 🟢 | Pertahankan |
| Users list | Search/filter | Tidak ada API tambahan | Search/filter hanya pada data halaman aktif, bukan seluruh dataset | 🟡 | Jika ingin filter global, kirim query ke backend |

### B. Assign role to user
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Assign role | Load page `/admin/users/assign-roles` | `GET /admin/users`, `GET /admin/roles` | Cocok dengan backend | 🟢 | Pertahankan |
| Assign role | Submit selected roles | `POST /admin/users/{id}/assign-role` payload `{ role_ids }` | Cocok dengan backend. Button disabled saat assigning. | 🟢 | Pertahankan |
| Assign role | Error handling | umum via toast | Tidak ada handling spesifik 422/403; semua error jadi toast generik | 🟡 | Mapping 422 per field, 403 jadi pesan akses |

### C. Role CRUD + assign permission
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Roles list | Load `/admin/roles` | `GET /admin/roles` | Cocok dengan backend | 🟢 | Pertahankan |
| Role create/edit/delete | Submit form / delete | `POST /admin/roles`, `PUT /admin/roles/{id}`, `DELETE /admin/roles/{id}` | Cocok dengan backend | 🟢 | Pertahankan |
| Assign permission | Page `/admin/roles/assign-permissions` | `POST /admin/roles/{id}/assign-permission`, `DELETE /admin/roles/{id}/remove-permission/{permissionId}` | Cocok dengan backend | 🟢 | Pertahankan |
| Role safety | Delete role | UI mencegah hapus `admin` / `super_admin` | UI guard ada, backend tetap sumber utama | 🟢 | Pertahankan |

### D. Permissions list
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Permissions | Load `/admin/permissions` | `GET /admin/permissions` | Cocok dengan backend. Hanya read-only dari frontend. | 🟢 | Pertahankan |

### E. Menu permission assignment
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Menu access | Load `/admin/menu-permissions` | `GET /admin/menus` | Cocok dengan backend | 🟢 | Pertahankan |
| Menu access | Toggle checkbox | `POST /admin/menus/assign-role` atau `DELETE /admin/menus/{menuKey}/roles/{roleId}` | Cocok dengan backend; cache menu dibersihkan | 🟢 | Pertahankan |
| Menu access | UX | Saat toggle, `saving` berbasis `menuKey`, jadi seluruh role checkbox pada satu baris ikut spinner | Minor UX only | 🟢 | Bisa dibuat per `menuKey-roleId` bila ingin lebih presisi |

## Edge case
| Edge case | Temuan |
|---|---|
| Empty state | Ada |
| 1 record | Pagination tetap aman |
| 100+ records | Backend pagination ada |
| Direct URL | Route terlindungi `MenuRouteGuard`, tetapi tidak semua halaman admin sensitif di aplikasi memakai guard setara |

## Kesesuaian backend
| API frontend | Backend `api.php` | Status |
|---|---|---|
| `GET /admin/users` | Ada | Cocok |
| `GET /admin/users/{id}` | **Tidak ada** | 🔴 Frontend service `getUserById()` mengarah ke endpoint yang tidak tersedia |
| `POST /admin/users/{id}/assign-role` | Ada | Cocok |
| `DELETE /admin/users/{id}/remove-role/{roleId}` | Ada | Cocok |
| `GET/POST/PUT/DELETE /admin/roles...` | Ada | Cocok |
| `GET /admin/permissions...` | Ada | Cocok |
| `GET/POST/DELETE /admin/menus...` | Ada | Cocok |

## Temuan penting
1. `ProtectedRoute` mendukung prop role, tetapi router saat ini praktis tidak memakainya.
2. Banyak kontrol akses frontend bergantung pada `MenuRouteGuard`; namun mayoritas route bisnis sensitif di luar admin tidak memakai guard setara.
3. `getUserById()` di service admin adalah dead/broken path terhadap backend saat ini.

---

# 2. Leave

## Flow aktual

### A. Create leave
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Create | Entry `/leave/requests/create` atau `/leave/request` | `GET /leave-types` | Cocok dengan backend; dropdown terisi | 🟢 | Pertahankan |
| Create | Submit form | `POST /leaves` payload `{ leave_type_id, start_date, end_date, total_days, reason }` | Cocok dengan backend | 🟢 | Pertahankan |
| Create | Validasi frontend | cek required, date order, reason | Tidak ada mapping 422 per-field; backend error hanya toast global | 🟡 | Tampilkan error field-level |
| Create | Success | toast lalu redirect sesudah 1.5 detik | Ada jeda buatan; tidak salah, tetapi agak lambat | 🟢 | Opsional redirect langsung |

### B. List / manage
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| List | Load `/leave/requests` | `GET /leaves?page=&per_page=` | Cocok backend | 🟢 | Pertahankan |
| List | Filter/search | local only | Statistik dan filter hanya dari halaman aktif, bukan keseluruhan data | 🟡 | Pindahkan filtering/statistik ke backend bila perlu akurat global |
| List | Delete | `DELETE /leaves/{id}` | Cocok backend | 🟢 | Pertahankan |

### C. Detail / edit
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Detail/edit | Load `/leave/requests/edit/:id`, `/view/:id`, `/leave/request/:id` | `GET /leaves/{id}` | Cocok backend | 🟢 | Pertahankan |
| Edit | Submit | `PUT /leaves/{id}` | Cocok backend | 🟢 | Pertahankan |
| Direct invalid ID | Load nonexistent ID | Mengandalkan error toast/halaman tetap terbuka | Tidak ada 404-specific fallback seperti NotFound / kembali otomatis | 🟡 | Tambah empty/error state khusus detail hilang |

### D. Approve / reject
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Approval | Dari `/leave/requests` detail/table dan `/leave/approval` | `PUT /leaves/{id}/approve`, `PUT /leaves/{id}/reject` | Cocok backend | 🟢 | Pertahankan |
| Approval | Authorization | UI mendeteksi `leave.approve` | Ada fallback allowedMenuKeys lama `cuti.persetujuan` / `leave.approval` yang tidak sejalan dengan menuKey baru | 🟡 | Rapikan fallback ke key resmi `manajemen-cuti.persetujuan` |
| Approval | Error handling | toast umum | 403/422/500 tidak dibedakan | 🟡 | Handler spesifik |

### E. Balance / calendar
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Balance | Load `/leave/balance` | `GET /leaves/balance` | Cocok backend | 🟢 | Pertahankan |
| Calendar | Load `/leave/calendar` | `GET /leaves/calendar` | Cocok backend | 🟢 | Pertahankan |
| Calendar | Initial month | Hardcoded April 2026 | UI tidak mulai dari bulan saat ini | 🟡 | Gunakan `new Date()` |

## Edge case
| Edge case | Temuan |
|---|---|
| Empty state | Ada |
| 1 record | Aman |
| 100+ records | Backend pagination ada |
| Direct URL ID tidak ada | Belum ada UX khusus 404 |

## Endpoint backend ada tapi belum tampak dipakai frontend
- `GET /leaves/pending` dipakai oleh approval page? perlu konsolidasi; halaman utama mengambil semua leaves.

---

# 3. Payroll

## Flow aktual

### A. Dashboard / list
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Dashboard | Load `/payroll` | `GET /payroll` | Cocok backend | 🟢 | Pertahankan |
| List | Load `/payroll/list` | `GET /payroll` | Cocok backend | 🟢 | Pertahankan |

### B. Create / generate / update / delete
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Create | Aktif di `PayrollManagementPage` | `POST /payroll` | Cocok backend | 🟢 | Pertahankan |
| Generate monthly | Aktif di `PayrollManagementPage` / dashboard | `POST /payroll/generate/monthly` | Cocok backend | 🟢 | Pertahankan |
| Update | Submit edit | `PUT /payroll/{id}` | Cocok backend | 🟢 | Pertahankan |
| Delete | Submit delete | `DELETE /payroll/{id}` | Cocok backend | 🟢 | Pertahankan |

### C. Approval / payment
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Approval active route | `/payroll/process` | memakai `POST /payroll/{id}/approve` generik | Flow backend mendukung manager approval lalu HR approval, tetapi route aktif utama tidak menampilkan alur dua tahap itu | 🟡 | Jadikan workflow manager→HR sebagai flow resmi yang terlihat |
| Dedicated approval page | `PayrollApprovePage.tsx` | `POST /manager-approve`, `POST /hr-approve`, `POST /reject` | Halaman implementasinya ada, tetapi tidak diroute aktif | 🔴 | Route-kan atau integrasikan ke `/payroll/process` |
| Payment | active | `POST /payroll/{id}/pay`, `POST /payroll/bulk-pay` | Endpoint ada dan cocok | 🟢 | Pertahankan |

### D. Export
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Slip export | ESS/admin | `GET /payroll/{id}/export`, `GET /payroll/{id}/export-pdf`, `GET /my/payroll/{id}/export`, `GET /my/payroll/{id}/export-pdf` | Cocok backend | 🟢 | Pertahankan |
| Report export | UI lama / report page | `GET /payroll/export/bca-klikpay`, `GET /payroll/export/summary` | Cocok backend | 🟢 | Pertahankan |

## Edge case
| Edge case | Temuan |
|---|---|
| Empty state | Umumnya ada |
| 1 record | Aman |
| 100+ records | Pagination ada |
| Direct URL | Banyak halaman detail lama ada di file system tetapi tidak menjadi route aktif |

## Temuan penting
1. Modul payroll punya **dua generasi UI**:
   - route aktif baru: dashboard/list/process/reports/component
   - halaman lama tapi lebih kaya flow: `PayrollApprovePage`, `PayrollCrudPage`, `PayrollGeneratePage`, `PayrollPaymentPage`, `PayrollTaxPage`
2. Backend workflow sudah maju (`manager-approve`, `hr-approve`, `reject`), tetapi frontend aktif belum sepenuhnya memaparkannya.

---

# 4. Reimbursement

## Flow aktual

### A. ESS create/update/delete/submit
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| My list | Load `/my/reimbursements` | `GET /my/reimbursements` | Cocok backend | 🟢 | Pertahankan |
| Create | Modal submit | `POST /my/reimbursements` | Cocok backend | 🟢 | Pertahankan |
| Update | Modal submit | `PUT /my/reimbursements/{id}` | Cocok backend | 🟢 | Pertahankan |
| Delete | Confirm | `DELETE /reimbursements/{id}` | Backend frontend sama-sama sengaja pakai shared route | 🟢 | Pertahankan |
| Submit | Klik ajukan | `POST /my/reimbursements/{id}/submit` | Cocok backend | 🟢 | Pertahankan |
| Validation/error | save | field required dicek sebagian | 422 belum dipetakan per field; load gagal hanya console error tanpa UI feedback | 🟡 | Tambah field errors + load error UI |

### B. Admin approval
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Admin list active | `/reimbursements` | `GET /reimbursements`, `GET /reimbursements/statistics` | Cocok backend | 🟢 | Pertahankan |
| Approve/reject/delete | buttons/modal | `PUT /reimbursements/{id}/approve`, `PUT /reimbursements/{id}/reject`, `DELETE /reimbursements/{id}` | Cocok backend | 🟢 | Pertahankan |
| Mark paid | backend ada | `PUT /reimbursements/{id}/mark-paid` | Ada di service dan alternate page, tetapi halaman aktif `AdminReimbursementsPage` tidak terlihat memakai mark-paid | 🟡 | Tentukan apakah mark paid perlu masuk flow aktif |

### C. Duplicate UI
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Legacy / alternate pages | `ReimbursementsManagementPage`, `ReimbursementApprovalPage` | service sama | Ada tiga representasi UI untuk satu domain; hanya sebagian yang diroute aktif | 🟡 | Konsolidasikan agar satu sumber flow |

## Edge case
| Edge case | Temuan |
|---|---|
| Empty state | Ada |
| 1 record | Aman |
| 100+ records | Pagination ada |
| Direct URL | Tidak ada detail route berbasis ID khusus |

---

# 5. Overtime

## Flow aktual

### A. Employee / self-service
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| My overtime | Load `/my/overtime` | `GET /attendance/overtime`, `GET /my/overtime` | Keduanya ada di backend | 🟢 | Pertahankan |
| Add reason | Submit | `PUT /my/overtime/{id}/reason` | Cocok backend | 🟢 | Pertahankan |
| Upload evidence | jika belum ada request | `POST /my/overtime` lalu `POST /my/overtime/{id}/evidence` | **Backend `api.php` tidak memiliki `POST /my/overtime`** | 🔴 | Tambahkan backend route/controller atau ubah frontend agar memakai flow request yang benar |
| View evidence | `GET /my/overtime/{id}/evidences` | Cocok backend | 🟢 | Pertahankan |

### B. Manager / HR approval
| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Approval load | `/attendance/overtime` untuk user berizin, dan halaman lain `OvertimeApprovalPage` | `GET /overtime/requests` | Cocok backend | 🟢 | Pertahankan |
| Approve/reject request | Buttons | `PUT /overtime/requests/{id}/approve`, `PUT /overtime/requests/{id}/reject` | Cocok backend | 🟢 | Pertahankan |
| Evidence approve/reject | Modal | `PUT /overtime/evidences/{id}/approve`, `PUT /overtime/evidences/{id}/reject` | Cocok backend | 🟢 | Pertahankan |
| Duplicate UI | `OvertimePage` + `OvertimeApprovalPage` | sama domain | Dua implementasi berbeda untuk flow approval yang sama | 🟡 | Konsolidasikan |

## Edge case
| Edge case | Temuan |
|---|---|
| Empty state | Ada |
| 1 record | Aman |
| 100+ records | Pagination ada |
| Direct URL | Tidak ada detail URL khusus |

## Temuan penting
1. `POST /my/overtime` adalah mismatch paling jelas di Gelombang 1.
2. Employee side melakukan merge dari ringkasan attendance dan request overtime secara manual; ini cukup rapuh jika relasi `attendance_id`/tanggal tidak konsisten.

---

# Prioritas temuan lintas-modul

| Temuan | Severity |
|---|---|
| Frontend overtime memanggil `POST /my/overtime`, tetapi backend `api.php` tidak menyediakan endpoint itu | 🔴 Critical |
| Flow approval payroll dua tahap tersedia di backend dan file frontend, tetapi belum aktif di route utama | 🔴 Critical |
| Service admin memanggil `GET /admin/users/{id}` yang tidak ada di backend | 🔴 Critical |
| Banyak error 422/403 hanya menjadi toast generik, bukan feedback kontekstual | 🟡 Warning |
| Banyak modul menghitung statistik/filter dari halaman aktif, bukan dataset global | 🟡 Warning |
| Terdapat UI ganda / legacy untuk payroll, reimbursement, overtime | 🟡 Warning |
| Sebagian besar route sensitif hanya `Authenticated` dari sisi frontend | 🟡 Warning |

