# Audit Flow Gelombang 3 — Modul Pendukung & Sisa

Ruang lingkup:
1. Auth
2. Notifications
3. Legal & Documents
4. Performance
5. ESS / My
6. Modul sisa

## Ringkasan Eksekutif

| Modul | Status Umum | Temuan Paling Penting |
|---|---|---|
| Auth | Cukup stabil | Flow login/reset hidup; perlu review copy/error consistency dan jejak debug SSO |
| Notifications | Sedang | User/admin notification hidup; pagination semu dan fallback default settings dapat menutupi kegagalan backend |
| Legal & Documents | Campuran | Assignment letter flow hidup; `MyDocuments` memakai endpoint download yang tidak ada di backend acuan |
| Performance | Belum matang | OKR dasar hidup, tetapi 360 review dan calibration banyak yang masih shell/mock |
| ESS / My | Campuran | Banyak flow ESS aktif, namun ada duplikasi route dan beberapa halaman memakai endpoint generik yang belum tentu benar-benar “my” |
| Modul sisa | Bervariasi | Recruitment cukup hidup; beberapa halaman analytics/compliance/engagement masih lebih dekat ke scaffold daripada produk matang |

---

## 1. Auth

### Flow yang ditemukan

| Sub-flow | Entry point | API | Status |
|---|---|---|---|
| Login | `/login` | `POST /login` | Aktif |
| Google SSO | `/login` → Google | `GET /auth/google`, `GET /auth/google/callback` | Aktif |
| Forgot password | `/forgot-password` | `POST /forgot-password` | Aktif |
| Reset password | `/reset-password` | `POST /reset-password` | Aktif |
| Logout | store/header action | `POST /logout` | Aktif |
| Refresh current user | app bootstrap | `GET /me`, `GET /user/menus` | Aktif |

### Laporan rinci

| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| Login | Validasi frontend | `POST /login` | Pesan invalid email berbunyi `Invalid email is and now invalid`, tampak seperti copy rusak | 🟢 Info | Perbaiki copy sebelum production |
| Login | Setelah sukses | `POST /login`, `GET /user/menus` | Flow role redirect dan sinkronisasi menu berjalan | 🟢 Info | Pertahankan |
| Google SSO | Callback | `GET /auth/google/callback` | Masih ada beberapa `console.log` debug pada callback flow | 🟡 Warning | Bersihkan log sensitif/berisik untuk production |
| Reset password | Sukses | `POST /reset-password` | Redirect otomatis setelah 1,4 detik; UX masih baik, tetapi error field backend dipadatkan jadi satu form error saja | 🟡 Warning | Tampilkan field mapping jika backend mengirim banyak error |
| Session | Penyimpanan token | - | Token disimpan di `sessionStorage`; ini keputusan arsitektur sah, namun perlu dipastikan sesuai threat model aplikasi | 🟢 Info | Dokumentasikan pilihan keamanan session |

### Kesesuaian backend
- Semua endpoint auth cocok dengan `api.php`.
- Tidak ada mismatch endpoint kritis yang terlihat pada auth.

---

## 2. Notifications

### Flow yang ditemukan

| Sub-flow | Entry point | API | Status |
|---|---|---|---|
| User list notifications | `/notifications` | `GET /notifications`, `GET /notifications/unread-count` | Aktif |
| Mark read / read all | user notification center | `PUT /notifications/{id}/read`, `PUT /notifications/read-all` | Aktif |
| Admin summary | `/admin/notifications` | `GET /admin/notifications/summary` | Aktif |
| Direct notification | admin page | `POST /admin/notifications` | Aktif |
| Broadcast | admin page | `POST /admin/notifications/broadcast` | Aktif |
| Email logs/templates | admin email pages | `/admin/email-notifications/*`, `/admin/email-templates/*` | Aktif |
| Settings | settings page | `GET /notification-settings`, `PUT /notification-settings/{category}` | Aktif |

### Laporan rinci

| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| User notifications | List | `GET /notifications` | Pagination state ada, tetapi `paginatedItems = items`; total pages tidak benar-benar dipakai | 🟡 Warning | Terapkan pagination backend/real client slicing |
| User notifications | Initial load | `GET /notifications` | Setiap refresh sukses memunculkan toast “Notifikasi berhasil dimuat”, berpotensi noisy | 🟢 Info | Pertimbangkan toast hanya untuk aksi user eksplisit |
| Notification settings | Fetch gagal | `GET /notification-settings` | Saat gagal, halaman diam-diam memakai `defaultSettings`; ini bisa menutupi outage/config gagal load | 🟡 Warning | Bedakan state fallback demo vs konfigurasi riil gagal dimuat |
| Notification settings | Save/toggle | `PUT /notification-settings/{category}` | Optimistic update sudah baik, tetapi jika gagal hanya revert tanpa toast ke user | 🟡 Warning | Tampilkan feedback kegagalan |

### Kesesuaian backend
- Endpoint yang dipakai sesuai dengan backend.
- Masalah utamanya bukan mismatch endpoint, tetapi reliabilitas UI dan truthfulness state.

---

## 3. Legal & Documents

### Flow yang ditemukan

| Sub-flow | Entry point | API | Status |
|---|---|---|---|
| Generate employment/experience letter | `/legal/letters` | `POST /employees/{employee}/employment-letter`, `POST /employees/{employee}/experience-letter` | Aktif |
| Assignment letter admin | `/admin/assignment-letters` | `GET/POST /assignment-letters`, approve/reject, PDF | Aktif |
| Assignment letter ESS | `/my/assignment-letters` | `GET/POST /assignment-letters` | Aktif, tetapi endpoint bukan khusus `my` |
| Severance calculator | `/legal/severance` | `GET /employees/{employee}/severance/calculate` | Aktif |
| Tax calculator | `/legal/tax` | `POST /tax/progressive/calculate` | Aktif |
| My documents | `/my/documents` | `GET/POST /my/documents` | Aktif |

### Laporan rinci

| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| My documents | Download | `GET /documents/{id}/download` | Endpoint ini **tidak ada** pada `api.php` yang diberikan; backend punya public `GET /documents/{filename}` dan admin `GET /documents/{id}` | 🔴 Critical | Samakan mekanisme download frontend dengan backend sebenarnya |
| My documents | View detail | - | Tombol “Lihat Detail” masih `onClick={() => {}}` | 🟡 Warning | Implementasikan atau hilangkan aksi kosong |
| My documents | Pagination | `GET /my/documents` | Pagination state ada tetapi render tetap seluruh list lokal | 🟡 Warning | Terapkan pagination nyata |
| Assignment letter ESS | List | `GET /assignment-letters` | Halaman “Surat Tugas Saya” memakai endpoint umum yang sama dengan admin; dari `api.php` tidak terlihat endpoint `/my/assignment-letters` | 🟡 Warning | Verifikasi apakah backend memang memfilter by current user; jika tidak, flow ESS salah secara konsep |
| Assignment letter ESS | Download PDF | - | Halaman ESS memakai `window.print()` alih-alih endpoint PDF yang tersedia | 🟡 Warning | Gunakan flow PDF nyata atau ubah label aksi |
| Assignment letter decision | Approve/reject | Frontend mencoba `PUT`, lalu fallback ke `POST` | Backend acuan memakai `POST`; fallback membuat flow tetap jalan, tetapi menyembunyikan ketidakkonsistenan kontrak | 🟡 Warning | Standardisasi method resmi |
| Employment letters | Generate | `POST /employees/{id}/...-letter` | Setelah sukses hanya toast; tidak terlihat retrieval/download artifact hasil generate | 🟡 Warning | Pastikan user menerima file atau akses hasilnya secara jelas |

### Kesesuaian backend
- Assignment letter, severance, dan tax sesuai backend.
- `MyDocuments` adalah mismatch backend paling keras pada Gelombang 3.

---

## 4. Performance

### Flow yang ditemukan

| Sub-flow | Entry point | API | Status |
|---|---|---|---|
| OKR list/create/edit | `/performance/okrs*` | `GET/POST/PUT /performance/okrs...` | Aktif sebagian |
| 360 review list | `/performance/reviews` | `GET /performance/360-reviews` | Aktif sebagian |
| Calibration list | `/performance/calibration` | `GET /performance/calibration` | Aktif sebagian |
| Calibration create/edit | form routes | Tidak benar-benar submit ke API | Belum aktif |

### Laporan rinci

| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|---|---|
| OKR | Create/edit | `POST/PUT /performance/okrs` | Form key results masih placeholder “Coming soon”; backend punya lifecycle OKR lebih kaya (`submit`, `approve`, `start`, `complete`) tetapi UI belum mengeksposnya | 🟡 Warning | Audit desain OKR vs backend capability |
| 360 review | UI actions | Hanya `GET /performance/360-reviews` aktif | Tombol `Start New Cycle`, `Feeders`, `Remind`, `Report` belum memanggil API | 🔴 Critical | Jangan tampilkan action button yang belum bekerja |
| 360 review | Backend coverage | Backend punya assign feeders, submit self/manager, complete, submit-review, approve | Sebagian besar endpoint backend belum dipakai frontend | 🟡 Warning | Susun flow 360 end-to-end sebelum production |
| Calibration | Create/edit | Tidak ada request simpan; hanya `console.log` + `setTimeout(navigate)` | Form calibration adalah mock flow | 🔴 Critical | Implementasikan API nyata atau keluarkan modul dari scope production |
| Calibration | View report | Tombol `View Report` tidak terhubung | Ada endpoint `GET /performance/calibration/{id}/report`, belum dipakai | 🟡 Warning | Sambungkan bila modul dipertahankan |

### Kesesuaian backend
- Backend performance jauh lebih lengkap daripada frontend.
- Di modul ini gap utamanya adalah **backend tersedia, frontend belum benar-benar menghidupkan flow**.

---

## 5. ESS / My

### Halaman ESS aktif yang ditemukan

- `/my/kpi`
- `/my/reimbursements`
- `/my/assets`
- `/my/assignment-letters`
- `/my/tasks`
- `/my/promotions`
- `/my/overtime`
- `/my/documents`
- `/my/payroll`
- `/my/trainings`
- `/my/competencies`

### Laporan rinci

| Area | Issue Ditemukan | Severity | Rekomendasi |
|---|---|---|---|
| Routing | `/my/reimbursements` muncul dua kali di router | 🟡 Warning | Rapikan duplikasi route |
| Scope | Tidak semua halaman “My” memakai endpoint khusus user; `MyAssignmentLettersPage` memakai `GET /assignment-letters` umum | 🟡 Warning | Pastikan semantic `my` benar-benar dibatasi current user |
| Consistency | Sebagian ESS memakai feedback error baik, sebagian hanya `console.error` | 🟡 Warning | Seragamkan pola UX |
| Audit trail | Banyak ESS page sudah punya approval history modal | 🟢 Info | Ini konsisten dan bernilai |

---

## 6. Modul Sisa — Sapuan Cepat

| Modul | Status Cepat | Catatan |
|---|---|---|
| Recruitment | Cukup hidup | CRUD opening, candidate pipeline, talent pool memakai service nyata |
| Engagement | Sedang | Survey CRUD ada; analytics tampak lebih presentasional |
| Compliance | Sedang | Overview/settings tersambung ke backend; masih perlu audit khusus jika masuk scope legal/regulatory |
| Benefits / Compensation | Sedang | Ada form dan preview, belum terlihat kedalaman approval/lifecycle penuh |
| Organization / Org Chart | Cukup hidup | Endpoint organisasi tersedia dan page ada |
| Reports / Analytics | Campuran | Banyak bagian tampak aktif, tetapi perlu audit khusus terhadap akurasi metrik |
| HR Requests | Cukup hidup | Ada list/respond/SLA, tetapi SLA page tampak mengandung nilai statis |
| Career / Succession / IDP | Campuran | Beberapa flow aktif, namun ada elemen presentasional/statis |

---

## Temuan Lintas Modul Gelombang 3

| Area | Temuan | Severity |
|---|---|---|
| Truthfulness UI | Masih ada tombol/halaman yang terlihat selesai tetapi belum melakukan kerja nyata (`360 review`, `calibration`, detail dokumen) | 🔴 Critical |
| Backend/frontend drift | Beberapa backend capability belum hidup di frontend; sebagian frontend memakai endpoint yang tidak tersedia (`documents/{id}/download`) | 🔴 Critical |
| Pagination | Masalah pagination semu masih muncul berulang | 🟡 Warning |
| Error handling | Banyak flow masih belum membedakan 422/403/500 secara jelas | 🟡 Warning |
| Scope semantics | Label “My” belum selalu menjamin endpoint user-scoped | 🟡 Warning |

## Prioritas Audit Lanjutan yang Disarankan

1. **P0**
   - `MyDocuments` download mismatch
   - Performance 360 actions palsu
   - Calibration mock save
2. **P1**
   - Verifikasi scope `MyAssignmentLetters`
   - Pagination nyata
   - Error handling konsisten
3. **P2**
   - Bersihkan debug log/copy
   - Rapikan route duplikat
   - Audit modul sisa satu per satu bila masuk production scope penuh

