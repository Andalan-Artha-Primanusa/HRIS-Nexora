# HRIS Frontend Flow Audit — Documentation Index

Dokumen di folder ini adalah hasil audit flow frontend HRIS sebelum masuk tahap perbaikan.  
Tujuannya bukan hanya mencatat halaman yang ada, tetapi membantu tim memahami:

- flow aplikasi yang sudah berjalan,
- role mana yang boleh melakukan apa,
- bagian mana yang sudah sesuai,
- bagian mana yang masih perlu diputuskan atau diperbaiki sebelum production.

---

## Mulai dari mana?

Jika Anda baru membuka folder ini, baca dalam urutan berikut:

| Urutan | Dokumen | Untuk Apa |
|---|---|---|
| 1 | [`master-production-readiness-summary.md`](./master-production-readiness-summary.md) | Ringkasan paling cepat untuk melihat kondisi aplikasi secara umum, temuan utama, dan prioritas besar sebelum production. |
| 2 | [`frontend-flow-map.md`](./frontend-flow-map.md) | Peta seluruh modul frontend: route, halaman, sub-flow, service API, dan modul yang punya approval. |
| 3 | [`role-flow-matrix.md`](./role-flow-matrix.md) | Matriks hak akses per role: employee, manager, HR, admin, super admin. |
| 4 | [`critical-business-flows-e2e-audit.md`](./critical-business-flows-e2e-audit.md) | Audit mendalam 5 flow bisnis paling kritis secara end-to-end berdasarkan role. |
| 5 | [`role-test-case-matrix.md`](./role-test-case-matrix.md) | Checklist QA untuk menguji flow berdasarkan role dan akses langsung via URL. |

Setelah lima dokumen utama di atas dibaca, lanjutkan ke audit detail per gelombang bila dibutuhkan.

---

## Dokumen utama

### 1. Ringkasan untuk PM / Lead

#### [`master-production-readiness-summary.md`](./master-production-readiness-summary.md)

Gunakan dokumen ini untuk:

- melihat status readiness aplikasi secara umum,
- mengetahui blocker production,
- memahami modul mana yang paling berisiko,
- menentukan prioritas pembahasan bersama tim.

Ini adalah dokumen terbaik untuk dibaca pertama kali oleh:

- PM,
- tech lead,
- product owner,
- stakeholder non-teknis yang ingin melihat gambaran besar.

---

### 2. Peta flow seluruh frontend

#### [`frontend-flow-map.md`](./frontend-flow-map.md)

Berisi:

- daftar route frontend,
- halaman yang dirender,
- pengelompokan modul HRIS,
- jumlah halaman per modul,
- file utama,
- sub-flow,
- apakah modul punya approval flow atau tidak.

Dokumen ini berguna untuk:

- memahami bentuk aplikasi secara keseluruhan,
- onboarding anggota tim baru,
- memastikan tidak ada modul yang terlewat saat audit.

---

### 3. Matriks role dan akses

#### [`role-flow-matrix.md`](./role-flow-matrix.md)

Berisi:

- role apa saja yang ada,
- modul mana yang bisa diakses tiap role,
- flow approval berdasarkan role,
- gap antara akses frontend dan akses backend,
- pertanyaan kebijakan yang perlu diputuskan tim.

Dokumen ini penting untuk:

- PM,
- QA,
- backend,
- frontend,
- siapa pun yang ingin memastikan aplikasi tidak hanya “bisa dibuka”, tetapi juga “dibuka oleh orang yang benar”.

---

### 4. Audit 5 flow bisnis paling kritis

#### [`critical-business-flows-e2e-audit.md`](./critical-business-flows-e2e-audit.md)

Mengaudit secara end-to-end:

1. Leave
2. Payroll
3. Overtime
4. Reimbursement
5. Employee Lifecycle

Dokumen ini menjawab:

- role siapa masuk dari mana,
- API apa yang dipanggil di tiap tahap,
- apakah rantai flow sudah tersambung,
- flow mana yang sudah layak,
- flow mana yang masih patah.

Ini adalah dokumen paling penting untuk diskusi teknis lintas FE, BE, QA, dan PM.

---

### 5. Matriks test case berdasarkan role

#### [`role-test-case-matrix.md`](./role-test-case-matrix.md)

Berisi checklist untuk:

- employee,
- manager,
- HR,
- admin,
- super admin,
- akses langsung via URL,
- validasi approval,
- isolasi data antar role.

Gunakan ini saat mulai masuk ke:

- QA manual,
- UAT internal,
- regression test,
- validasi setelah fix.

---

## Audit detail per gelombang

### Gelombang 1 — modul paling kritis

#### [`wave-1-flow-audit.md`](./wave-1-flow-audit.md)

Mencakup:

1. Admin / RBAC
2. Leave
3. Payroll
4. Reimbursement
5. Overtime

#### [`wave-1-fix-priority.md`](./wave-1-fix-priority.md)

Berisi prioritas perbaikan dari temuan Gelombang 1:

- mana yang blocker,
- mana yang warning,
- mana yang bisa ditunda.

---

### Gelombang 2 — approval & lifecycle

#### [`wave-2-flow-audit.md`](./wave-2-flow-audit.md)

Mencakup:

1. Employee Management
2. Assets
3. Promotions
4. Training & Competency
5. Workforce / Shift Swap

---

### Gelombang 3 — modul pendukung

#### [`wave-3-flow-audit.md`](./wave-3-flow-audit.md)

Mencakup:

1. Auth
2. Notifications
3. Legal & Documents
4. Performance
5. ESS / My
6. Modul pendukung lain yang tersisa

---

## Rekomendasi pembagian baca per peran

| Peran | Dokumen yang paling perlu dibaca |
|---|---|
| PM / Product Owner | `master-production-readiness-summary.md`, `critical-business-flows-e2e-audit.md`, `role-flow-matrix.md` |
| Frontend Engineer | `frontend-flow-map.md`, semua `wave-*-flow-audit.md`, `critical-business-flows-e2e-audit.md` |
| Backend Engineer | `role-flow-matrix.md`, `critical-business-flows-e2e-audit.md`, temuan mismatch API di audit gelombang |
| QA | `role-test-case-matrix.md`, `critical-business-flows-e2e-audit.md`, semua audit gelombang |
| Tech Lead | Semua dokumen, dimulai dari summary lalu role matrix |

---

## Temuan paling penting saat ini

Berikut beberapa temuan yang paling perlu diperhatikan tim sebelum production:

1. **Overtime belum utuh**
   - Frontend memanggil `POST /my/overtime`
   - Endpoint tersebut tidak ada pada backend `routes/api.php` yang diaudit

2. **Employee Lifecycle belum benar-benar berjalan**
   - API onboarding/offboarding sudah ada
   - UI lifecycle saat ini belum memanggil API tersebut secara nyata

3. **Payroll sudah punya flow manager → HR**
   - tetapi frontend route guard / boundary role masih perlu diperjelas

4. **Beberapa halaman sensitif hanya berada di bawah autentikasi umum**
   - backend mungkin tetap menolak,
   - tetapi frontend belum selalu membatasi akses seketat modul admin/RBAC

5. **Banyak ringkasan dashboard masih dihitung dari data page aktif**
   - ini bisa membuat angka statistik terasa benar padahal belum mewakili seluruh data.

---

## Cara menggunakan folder ini dalam diskusi tim

### Saat meeting pertama

Gunakan urutan ini:

1. buka `master-production-readiness-summary.md`
2. sepakati blocker utama
3. buka `role-flow-matrix.md`
4. pastikan kebijakan akses tiap role memang sesuai ekspektasi bisnis
5. buka `critical-business-flows-e2e-audit.md`
6. putuskan flow mana yang harus dibenahi dulu

### Saat mulai QA manual

Gunakan:

1. `role-test-case-matrix.md`
2. `critical-business-flows-e2e-audit.md`
3. audit gelombang terkait modul yang sedang diuji

### Saat mulai fixing

Gunakan:

1. `wave-1-fix-priority.md`
2. blocker di `master-production-readiness-summary.md`
3. mismatch teknis pada audit detail per modul

---

## Status dokumen

Seluruh dokumen di folder ini adalah hasil **audit awal berbasis pembacaan kode frontend dan pencocokan dengan backend route yang tersedia**.  
Sebelum dianggap final production sign-off, masih perlu:

1. uji manual per role,
2. konfirmasi kebijakan bisnis bersama PM / owner,
3. verifikasi live API,
4. retest setelah perbaikan dilakukan.

Dengan begitu, folder ini bukan hanya arsip catatan, tetapi menjadi peta bersama untuk membawa aplikasi dari “sudah dibangun” menuju “sudah layak dipercaya”.
