# Audit Flow Gelombang 4 — Modul Sisa & Deep Dive Lanjutan

Ruang lingkup audit gelombang ini mencakup modul yang sebelumnya hanya disapuan cepat di Wave 3, serta modul yang belum diaudit sama sekali:

1. Attendance (deep dive — sebelumnya hanya overtime di Wave 1)
2. Dashboard & KPI
3. Recruitment (deep dive)
4. Organization & Location (deep dive)
5. Reporting & Analytics
6. Engagement, Compliance, Benefits/Compensation
7. HR Requests, Biometric, Tasks, Enterprise, Profile
8. Career / Succession / IDP

**Prinsip audit:** Sama seperti gelombang sebelumnya — menilai apakah flow benar-benar hidup dari UI aktif → service → backend, bukan hanya apakah endpoint ada.

---

## Ringkasan Eksekutif

| Modul | Status Umum | Skor | Temuan Paling Penting |
|---|---|---|---|
| Attendance | Berjalan sebagian | 5/10 | Pagination palsu di HistoryPage, absent selalu 0, raw data dump di TodayPage |
| Dashboard & KPI | Sebagian besar semu | 4/10 | Semua statistik dari page-1 doang, charts menyesatkan, KPI submit button broken |
| Recruitment | Skeleton/belum jadi | 3/10 | 7+ tombol mati, drag-drop tidak implementasi, data mock di detail, tanpa menu sidebar |
| Organization & Location | Fungsional dengan gap | 6/10 | GPS failure blokir CreateLocation, OrgChart tanpa error state, dead buttons |
| Reporting | Service mati total | 3/10 | `reporting.service.ts` tidak dipanggil siapa pun, 5 sub-page unreachable |
| Engagement | Banyak mock data | 3/10 | Analytics page mock total, Succession hardcoded, IDP hardcoded |
| Compliance | Cukup rapi | 7/10 | Pagination semu, 1 dead button |
| Benefits/Compensation | Sebagian | 4/10 | 4 dead buttons, 5 service methods unused, month hardcoded |
| HR Requests | Sebagian | 5/10 | Missing `GET /requests/{id}`, textarea tidak wired, create/assign unused |
| Biometric | Sebagian | 4/10 | 3/4 tombol dead, duplicate method, menu link broken |
| Tasks | Terbaik | 9/10 | Real pagination, proper states, hanya minor error handling |
| Enterprise | Banyak mati | 3/10 | 3/4 tombol dead, 5/6 service methods unused |
| Profile | Terbaik kedua | 8/10 | Proper types, error handling terbaik, extraction robust |
| Career/IDP/Succession | Mock override | 3/10 | Data real di-fetch tapi mock dirender, 4+ dead buttons |

---

## 1. ATTENDANCE — Deep Dive

### File inventory
- `src/features/attendance/api/attendance.service.ts`, `attendance-admin.service.ts`, `overtime.service.ts`
- `src/features/attendance/components/AttendanceDetailModal.tsx`, `AttendanceSummary.tsx`, `AttendanceTable.tsx`
- `src/pages/attendance/` — 7 pages: CheckIn, CheckOut, History, Today, Overview, Reports, Overtime

### Sub-flow audit

| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity |
|---|---|---|---|---|
| Check-in | GPS + location select | `POST /attendance/check-in` | Tidak ada fallback jika GPS ditolak; user tetap bisa klik Check-In tanpa koordinat | 🟡 |
| Check-out | Submit | `POST /attendance/check-out` | **Tidak mengirim `location_id`** — asimetris dengan check-in | 🔴 |
| History | Load list | `GET /attendance/history` | **Pagination PALSU**: `paginatedHistory = sortedHistory` — semua record dirender sekali | 🔴 Critical |
| History | — | — | `console.log('Attendance history response:', result)` — bocor data ke console | 🟡 |
| Today | Load hari ini | `GET /attendance/today` | **Raw data dump**: `Object.entries(today).map(...)` — field name backend bocor ke user | 🔴 Critical |
| Overview | Statistik | `GET /employees`, `GET /attendance/today`, dll | Duplikasi helper functions 70+ baris yang sudah ada di `shared/api/pagination.ts` | 🟡 |
| Reports | Load all | `GET /attendance/all` | `absent = 0` — **hardcoded, selalu 0** | 🔴 Critical |
| Reports | Export CSV | Client-side | Button label salah "Ekspor Data Karyawan" | 🟢 |
| Overtime | Load + merge | `GET /attendance/overtime` + `GET /my/overtime` | Merge logic 2 API via Map reconciliation — 565 baris, sangat kompleks dan rapuh | 🟡 |
| Overtime | Approve evidence | `PUT /overtime/evidences/{id}/approve\|reject` | **Dead code**: endpoint di service tapi tidak dipanggil halaman mana pun | 🟡 |

### Route & menu gap
- `/attendance` (Overview) — **tidak ada di menu**, hanya sub-paths
- `/attendance/today` — **tidak ada di menu**

### Endpoint tidak bisa diverifikasi
Tidak ada `routes/api.php` di repo — 20+ endpoint tidak bisa divalidasi backend alignment-nya.

---

## 2. DASHBOARD & KPI

### File inventory
- `src/features/dashboard/` — kpi service, KpiCards component
- `src/pages/dashboard/` — OverviewPage, EmployeeDashboardPage, SectionPage (~2500 baris)
- `src/pages/dashboard/kpi/` — 7 pages: KpiPage, KpiListPage, KpiCreatePage, KpiUpdatePage, KpiDetailPage, KpiApprovePage, MyKpiPage

### Sub-flow audit

| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity |
|---|---|---|---|---|
| Admin Dashboard | Load metrics | `GET /employees`, `GET /attendance/today`, `GET /leaves/pending`, `GET /reimbursements/pending`, `GET /kpis` | **STATISTIK DARI PAGE-1 DOANG** — semua API tanpa pagination params, Laravel default page=1 | 🔴 Critical |
| Admin Dashboard | Charts | `GET /attendance/all`, `GET /employees`, `GET /leaves` | Attendance trend chart menggabungkan multi-week ke satu grafik — **menyesatkan** | 🔴 Critical |
| Admin Dashboard | Non-admin section | (tidak ada API) | **SEMUA HARDCODED**: "12 Hari", "3 tasks", "Hadir", "8/10" — tidak pernah fetch data | 🔴 Critical |
| KpiCards | Load 5 metrics | `Promise.allSettled(...)` | **Tidak ada loading state** — initial "Memuat..." tidak pernah berubah | 🔴 Critical |
| KpiListPage | Submit KPI | (tidak ada) | **Submit button BROKEN**: `console.log('submit', id)` — tidak panggil API | 🔴 Critical |
| KpiPage vs KpiListPage | — | — | **90% DUPLIKASI KODE** — dua file hampir identik | 🟡 |
| KpiDetailPage | Load detail | `GET /kpis/{id}` | Error hanya `console.error` — user lihat spinner forever | 🟡 |
| OverviewPage | Navigasi | — | Link ke `/admin/analytics/people` — **route tidak terdaftar** | 🟡 |

### KPI Service
- `getAllKpis()`, `getMyKpis()` — **tanpa pagination params**
- Summary cards dihitung dari `items.length` — halaman 1 saja

---

## 3. RECRUITMENT — Deep Dive

### File inventory
- `src/features/recruitment/` — service, types, 3 components
- `src/pages/admin/` — JobOpeningsPage, JobOpeningFormPage, CandidatePipelinePage, TalentPoolPage

### Sub-flow audit

| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity |
|---|---|---|---|---|
| Job Openings | List | `GET /recruitment/openings` | `onView={() => {}}` — **View button kosong** | 🔴 Critical |
| Job Openings | Search | Client-side | Tidak ada search params ke backend | 🟡 |
| Candidate Pipeline | Load | `GET /recruitment/candidates` | **Drag-and-drop TIDAK IMPLEMENTASI** — card cuma `cursor: grab` saja | 🔴 Critical |
| Candidate Pipeline | Schedule interview | — | `onScheduleInterview={() => {}}` — **dead button** | 🔴 Critical |
| Candidate Pipeline | Make offer | — | `onMakeOffer={() => {}}` — **dead button** | 🔴 Critical |
| Candidate Pipeline | Send message | — | **Tidak ada onClick handler sama sekali** | 🔴 Critical |
| Candidate Detail | Tampil | — | **Data MOCK hardcoded**: "5 years of experience in React and Node.js", "Resume_CV.pdf" | 🔴 Critical |
| Talent Pool | List | `GET /recruitment/talent-pool` | **View button tanpa onClick** | 🔴 Critical |
| Talent Pool | — | — | "Archived Date" pakai `created_at` — field salah | 🟡 |
| Menu | — | — | **TIDAK ADA menu item recruitment di sidebar** | 🔴 Critical |
| Route guard | — | — | **TIDAK ADA `MenuRouteGuard`** di semua route recruitment | 🔴 Critical |
| Error handling | Semua | — | Hanya `console.error()` — **tidak ada feedback ke user** | 🔴 Critical |
| JobOpeningModal | — | — | **Dead component** — di-export tapi tidak pernah di-import | 🟡 |
| Service methods | 7 methods | — | **Unused**: `getCandidate`, `createCandidate`, `deleteCandidate`, `scheduleInterview`, `evaluateInterview`, `createOffer`, `updateOfferStatus` | 🟡 |

---

## 4. ORGANIZATION & LOCATION — Deep Dive

### File inventory
- `src/features/organization/` — organization.service, promotion.service, OrgChartNode, PromotionModal, ApprovalFlowModal
- `src/features/location/` — location.service, types
- `src/pages/locations/` — LocationsPage, CreateLocationPage, EditLocationPage
- `src/pages/admin/` — OrgChartPage, ApprovalFlowPage, MasterDataPage

### Sub-flow audit

| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity |
|---|---|---|---|---|
| Create Location | GPS gagal | `POST /locations` | **GPS failure block form** — input lat/lng disabled, user tidak bisa manual entry | 🔴 Critical |
| Create Location | Load departments | `GET /organization/master-data` | `console.error` jika gagal — tidak ada feedback ke user | 🟡 |
| Org Chart | Load | `GET /organization/chart` | **Tidak ada error state** — API failure diam-diam jadi "Data tidak ditemukan." | 🔴 Critical |
| Org Chart | Cari / Export PDF | — | **Tombol dekoratif** — tidak ada `onClick` handler | 🟡 |
| Promotions | Summary cards | `GET /promotions` | Statistik dari `items.length` (halaman aktif saja) — **menyesatkan** | 🔴 |
| Promotions | Load employees for modal | `getAllEmployees()` — page ALL | Bisa fetch 50+ request — tidak ada loading state di dropdown | 🟡 |
| My Promotions | Submit report | `POST /my/promotions/{id}/report/submit` | Gagal hanya `console.error` — **tidak ada toast error** | 🔴 Critical |
| Approval Flow Modal | Load users | `GET /admin/users?role=...` | `console.error` multiple — tidak ada feedback user | 🟡 |
| Locations | Department filter | Client-side | Filter hanya dari current page — department di page 3 tidak muncul | 🔴 |
| Service methods | 6 methods | — | **Unused**: `getDirectory`, `getTeamMembers`, `getComplianceOverview`, `getExpiringDocuments`, `getAllLocations`, `getActiveLocations` | 🟡 |

### Route guard gap
- `/organization/chart`, `/organization/master-data`, `/promotions`, `/my/promotions`, `/approval-flows` — **tanpa `MenuRouteGuard`**

---

## 5. REPORTING & ANALYTICS

### File inventory
- `src/features/reporting/api/reporting.service.ts` — 3 methods
- `src/pages/dashboard/` — ReportsDashboardPage + 5 sub-pages

### Sub-flow audit

| Sub-flow | Step | API Dipanggil | Issue Ditemukan | Severity |
|---|---|---|---|---|
| **Semua** | — | `api.get('/employees')`, `/attendance/all`, `/leaves`, `/payroll`, `/assets`, `/assets/assignments` | **Service layer TIDAK DIPAKAI** — `reporting.service.ts` ada tapi dipanggil 0 kali | 🔴 Critical |
| Reports Dashboard | Load | `api.get(...)` langsung | Semua data di-load client-side, di-aggregate via `useMemo` — **break dengan dataset besar** | 🟡 |
| Sub-pages attendance/leave/payroll/etc | Route | — | **REDIRECT ke dashboard** — 5 sub-page exist tapi unreachable | 🔴 Critical |
| Extract helpers | — | — | **Duplikasi** — `extractArr`, `getStr`, `toRec` copy-paste di 6 file | 🟡 |

**Service methods defined tapi tidak pernah dipanggil:**
- `reportingService.getDashboardSummary()`
- `reportingService.getHeadcountTrend()`
- `reportingService.getTurnoverStats()`

---

## 6. ENGAGEMENT, COMPLIANCE, BENEFITS/COMPENSATION

### 6A. Engagement

| Sub-flow | Step | Issue Ditemukan | Severity |
|---|---|---|---|
| Engagement Analytics | Load | **Mock total** — eNPS=72, Participation=86%, Satisfaction=4.2/5, chart placeholder `[ Sentiment Bar Chart ]` | 🔴 Critical |
| Survey Form | Add Question | **No onClick handler** — questions tidak bisa ditambah | 🔴 Critical |
| Survey Form | Send Invitations | **Dead button** — tidak ada handler saat status Active | 🔴 Critical |
| Succession Matrix | 9-box Grid | **Hardcoded** — grid dengan avatar kosong, tidak pakai data API | 🔴 Critical |
| Succession Matrix | Export/Review/Join | **3 dead buttons** | 🔴 Critical |
| IDP Page | Semua konten | **Hardcoded mock** — 3 goals statis, API data di-fetch tapi tidak dipakai | 🔴 Critical |
| IDP Page | New Goal / View Steps / Update Progress | **3 dead buttons** | 🔴 Critical |
| Engagement Surveys | Load | `GET /engagement/surveys` | Tanpa pagination, error hanya `console.error` | 🟡 |
| `getSurveyAnalytics` | — | — | **Unused** — method di service tidak dipanggil | 🟡 |

### 6B. Compliance

| Sub-flow | Step | Issue Ditemukan | Severity |
|---|---|---|---|
| Dashboard | Pagination | **Palsu** — `totalPages` state di-init 1 dan tidak pernah di-update dari backend; backend support real pagination | 🔴 Critical |
| Settings | Proses button | **Dead button** — privacy request "Proses" tanpa onClick | 🔴 Critical |
| Settings | Delete policy | **Tanpa confirm dialog** — langsung hapus | 🟡 |
| Compliance endpoint duplikasi | — | `/compliance/overview` vs `/workforce/compliance/stats`, `/compliance/expiring-documents` vs `/workforce/compliance/documents` — endpoint kembar | 🟡 |

**Positif**: ComplianceDashboardPage dan ComplianceSettingsPage adalah contoh terbaik pattern `DataStateDisplay` — punya `LoadingState`, `ErrorState`, `EmptyState`, dan user-facing error messages. Ini yang seharusnya ditiru modul lain.

### 6C. Benefits/Compensation

| Sub-flow | Step | Issue Ditemukan | Severity |
|---|---|---|---|
| Benefit list | Assign Now | **Dead button** — `assignBenefit` service ada tapi tidak tersambung | 🔴 Critical |
| Compensation | Export Bank File | **Dead button** | 🔴 Critical |
| Compensation | Add Adjustment | **Dead button** | 🔴 Critical |
| Compensation | Fix Issues | **Dead button** | 🔴 Critical |
| Compensation | Month filter | **Hardcoded "2026-04"** — tidak ada date picker | 🔴 Critical |
| Benefit cards | Loading/pagination | Tidak ada pagination | 🟡 |

**Unused service methods:**
- `benefitService.getEmployeeBenefits()`
- `benefitService.assignBenefit()`
- `benefitService.approveBenefitAssignment()`
- `benefitService.rejectBenefitAssignment()`
- `enterpriseService.upsertCompProfile()`
- `enterpriseService.addRetroAdjustment()`

---

## 7. HR REQUESTS, BIOMETRIC, TASKS, ENTERPRISE, PROFILE

### 7A. HR Requests

| Sub-flow | Step | Issue Ditemukan | Severity |
|---|---|---|---|
| View/Respond | — | **Missing `GET /requests/{id}`** — harus fetch ALL lalu `.find()` client-side | 🔴 Critical |
| Respond form | Textarea admin | **Tidak ada onChange handler** — catatan admin tidak pernah terkirim | 🔴 Critical |
| SLA page | Route `/hr-requests/sla` | **Falls through ke SectionPage** — `SlaPage` di-import tapi tidak di-route | 🟡 |
| `createRequest()` | — | **Unused** — tidak dipanggil halaman mana pun | 🟡 |
| `assignRequest()` | — | **Unused** | 🟡 |

### 7B. Biometric

| Sub-flow | Step | Issue Ditemukan | Severity |
|---|---|---|---|
| Register Device | — | **Dead button** — tanpa onClick | 🔴 Critical |
| Configure Device | — | **Dead button** | 🔴 Critical |
| Unregister Device | — | **Dead button** | 🔴 Critical |
| Menu link | — | **Broken** — menu指向 `/admin/biometric-devices`, route aktual `/biometric/devices` | 🔴 Critical |
| `registerDevice()` vs `createDevice()` | — | **Duplikasi** — method identik (`POST /biometric/devices`) | 🟡 |
| `deleteDevice()` | — | **Missing** — service tidak punya method delete | 🟡 |

### 7C. Tasks — ★ MODUL TERBAIK

| Sub-flow | Step | Issue Ditemukan | Severity |
|---|---|---|---|
| List | `GET /tasks?page=&per_page=` | **REAL pagination** via `parsePaginatedResponse` | ✅ |
| CRUD | All | **Proper states**: `LoadingState`, `ErrorState`, `EmptyState` | ✅ |
| Create/Update | `handleSave` | **Tidak ada try/catch** — jika gagal, modal tutup tanpa feedback | 🟡 |
| Filter + Pagination | — | Filter client-side setelah pagination server — **inkonsisten** | 🟡 |

### 7D. Enterprise

| Sub-flow | Step | Issue Ditemukan | Severity |
|---|---|---|---|
| Compensation | — | 3/4 tombol dead (lihat 6C) | 🔴 Critical |
| Service methods | 5/6 | **Unused**: `upsertCompProfile`, `addRetroAdjustment`, `createNotificationTemplate`, `createRetentionPolicy`, `createComplianceTask` | 🟡 |

### 7E. Profile — ★ MODUL TERBAIK KEDUA

| Aspek | Temuan |
|---|---|
| Types | ✅ Well-defined: `ProfilePayload`, `Profile`, `UserProfile`, `EmployeeProfile`, dll |
| Error handling | ✅ **Terbaik** — custom `getErrorMessage` traverse nested Laravel errors, Indonesian fallback, komentar "SECURITY: Don't log sensitive error details" |
| Extraction | ✅ Mencoba 7+ response shapes (`data`, `items`, `rows`, `profiles`, `profile`, `user`, `result`) |
| Console log | ✅ **Tidak ada** sama sekali |
| Pagination | ❌ `getProfiles()` tanpa pagination — load semua profile |

---

## 8. CAREER / SUCCESSION / IDP

### File inventory
- `src/features/engagement/api/engagement.service.ts` — `getIdps()`, `getSuccessionMatrix()`
- `src/pages/admin/SuccessionMatrixPage.tsx`
- `src/pages/admin/IdpPage.tsx`

### Temuan paling memprihatinkan

| Sub-flow | Issue Ditemukan | Severity |
|---|---|---|
| IDP Page | **Data real di-fetch, tapi mock yang dirender.** API `getIdps()` dipanggil, state di-set, tapi UI menampilkan 3 goal hardcoded ("Master Advanced React Patterns", "Public Speaking & Presentation", "AWS Solutions Architect") | 🔴 Critical |
| Succession Matrix | **9-box grid hardcoded.** Data API hanya dipakai di sidebar list; grid utama adalah div kosong dengan label statis | 🔴 Critical |
| Dead buttons | 4+ tombol mati: "New Goal", "View Steps", "Update Progress", "Export Matrix", "Review Sessions", "Join Session" | 🔴 Critical |
| Dual implementation | Dedicated pages (mock) + SectionPage (generic tapi API real) — dua implementasi untuk satu domain | 🟡 |

---

## 9. Cross-Cutting Issues

| Area | Temuan | Severitas | Modul Terkena |
|---|---|---|---|
| **Pagination palsu** | `totalPages` state ada tapi tidak dipakai, data dirender semua | 🔴 | Attendance History, Compliance Dashboard |
| **Statistik dari page-1** | Summary cards dihitung dari `items.length` halaman aktif | 🔴 | Dashboard, Promotions, KPI |
| **Dead buttons** | Tombol dengan `onClick={() => {}}` atau tanpa handler sama sekali | 🔴 | Recruitment, Succession, IDP, Biometric, Enterprise, Benefits, Engagement |
| **Mock/hardcoded override** | API data di-fetch tapi mock yang ditampilkan | 🔴 | Engagement Analytics, Succession, IDP, Dashboard non-admin, Candidate Detail |
| **`console.error` only** | Error handling hanya log, tidak ada feedback user | 🟡 | 12 dari 14 modul |
| **Service layer bypassed** | `api.get()` langsung dipanggil, service tidak dipakai | 🔴 | Reporting (full), SectionPage |
| **Unused service methods** | Method di-export tapi tidak dipanggil | 🟡 | Reporting (3), Enterprise (5), Benefits (4), Recruitment (7), Biometric (1) |
| **Menu item missing** | Route exist tapi tidak ada di sidebar | 🟡 | Recruitment (all), /attendance, /attendance/today, /compensation/benefits, /enterprise/compensation, /engagement/surveys, /career/*, /profiles, /hr-requests |
| **Route guard missing** | Tanpa `MenuRouteGuard` | 🟡 | Organization, Promotions, Recruitment, ApprovalFlows |
| **Menu link broken** | Menu指向 route yang tidak terdaftar | 🔴 | Biometric (`/admin/biometric-devices` vs `/biometric/devices`) |
| **Sub-page unreachable** | Route redirect ke halaman lain | 🔴 | 5 report sub-pages |
| **Duplikasi kode** | Helper functions copy-paste | 🟡 | Attendance Overview, Reporting (6 files), Dashboard |
| **No backend route file** | `routes/api.php` tidak ada di repo | ℹ️ | — |

---

## 10. Modul Terbaik vs Terburuk

### ★ Peringkat Terbaik
1. **Tasks Module (A-)** — Real pagination, proper LoadingState/ErrorState/EmptyState, UX matang
2. **Profile Module (B+)** — Proper TypeScript types, error handling terbaik, 0 console.log
3. **Compliance Settings (B)** — Pattern `DataStateDisplay` diterapkan konsisten

### ★ Peringkat Terburuk
1. **Engagement Analytics (D)** — Mock total, 3+ dead buttons, survey ID ignored
2. **Succession Matrix & IDP (D)** — Fetch API real tapi render mock — paling menipu
3. **Reporting (D)** — Service layer mati total, 5 sub-page unreachable
4. **Recruitment (D)** — 7+ dead buttons, tanpa menu, tanpa guard, mock data

---

## 11. Prioritas Perbaikan

### 🔴 P0 — Blocker (wajib dibenahi sebelum production)

| # | Temuan | Modul |
|---|---|---|
| 1 | Dashboard statistik dari page-1 — semua angka bisa salah | Dashboard |
| 2 | KPI submit button `console.log` doang — tidak bekerja | KPI |
| 3 | Absent selalu 0 di Reports | Attendance |
| 4 | Pagination palsu di HistoryPage (semua record dirender) | Attendance |
| 5 | TodayPage raw data dump — field backend bocor | Attendance |
| 6 | Recruitment: 7+ tombol mati, tanpa menu, tanpa guard | Recruitment |
| 7 | Engagement Analytics mock total — fitur tidak nyata | Engagement |
| 8 | Succession Matrix 9-box grid hardcoded | Career |
| 9 | IDP Page: fetch real tapi render mock | Career |
| 10 | GPS failure blokir CreateLocation | Location |
| 11 | Reporting service layer mati — sub-pages unreachable | Reporting |
| 12 | HR Requests: textarea tidak wired, missing endpoint | Requests |
| 13 | Biometric: 3/4 tombol mati, menu link broken | Biometric |
| 14 | Compensation: month hardcoded, 3/4 tombol mati | Enterprise |

### 🟡 P1 — Sangat disarankan

| # | Temuan |
|---|---|
| 1 | Standardisasi error handling: `console.error` → user-facing toast/ErrorState |
| 2 | Tambah `MenuRouteGuard` ke semua route sensitif |
| 3 | Tambah menu item untuk modul yang tidak accessible dari sidebar |
| 4 | Bersihkan unused service methods (20+ total) |
| 5 | Fix broken menu link biometric |
| 6 | Implementasi pagination real di modul yang masih palsu |
| 7 | Rapikan dashboard charts yang menyesatkan (attendance trend multi-week) |
| 8 | Tambah server-side pagination params ke semua list endpoint |
| 9 | Konsolidasi endpoint compliance yang duplikat |

### 🟢 P2 — Peningkatan kualitas

| # | Temuan |
|---|---|
| 1 | Bersihkan console.log production |
| 2 | Rapikan duplikasi kode helper functions |
| 3 | Tambah TypeScript types ke modul yang masih `any` |
| 4 | Standardisasi pattern `DataStateDisplay` di semua halaman |
| 5 | Hapus dead code (unused component, unused route, dead button) |
| 6 | Perbaiki i18n konsistensi (campur Indonesia-Inggris) |
| 7 | Hapus emoji dari heading aksesibilitas |

---

## 12. Rekomendasi Modul per Modul

| Modul | Rekomendasi |
|---|---|
| Attendance | Fix pagination History, absent count, raw dump TodayPage, standardisasi service |
| Dashboard | Buat endpoint aggregate `/dashboard/stats`, hapus hardcoded, fix KPI submit |
| Recruitment | Sambung semua tombol, implementasi DnD, tambah menu & guard, hapus mock data |
| Organization | Fix GPS block OrgChart, sambung dead buttons, tambah guard & menu |
| Reporting | Hidupkan sub-pages, pakai service layer, hapus redirect |
| Engagement | Ganti mock dengan API real, sambung dead buttons |
| Compliance | Fix pagination, sambung tombol Proses |
| Benefits | Sambung dead buttons, pakai service methods yang ada |
| Tasks | Tambah error handling handleSave, fix filter+pagination interaction |
| Enterprise | Sambung dead buttons, pakai service methods |
| Profile | Tambah pagination, sisanya sudah baik |
| Career/IDP | Ganti mock dengan data real dari API |
