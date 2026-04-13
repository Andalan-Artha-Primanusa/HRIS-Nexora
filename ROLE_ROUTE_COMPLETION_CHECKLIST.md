# HRIS Role Route Completion Checklist

Status checklist untuk memastikan implementasi route non-auth sudah siap production dan selaras dengan workflow di dokumentasi.

Legend:
- DONE: route punya list/action endpoint operasional di UI.
- PARTIAL: route sudah ada dan bisa monitor/refresh, tapi belum punya aksi domain lengkap.
- N/A: ditangani oleh page khusus (bukan SectionPage).

## Employee (ESS)
- DONE: /attendance/check-in -> POST /attendance/check-in
- DONE: /attendance/check-out -> POST /attendance/check-out
- DONE: /attendance/history -> GET /attendance/history
- DONE: /attendance/today -> GET /attendance/today
- DONE: /leave/my-leave -> GET /leaves/my
- DONE: /leave/requests -> GET /leaves, POST /leaves, PUT /leaves/{id}, DELETE /leaves/{id}
- DONE: /my/reimbursements -> GET /my/reimbursements, POST /my/reimbursements, POST /my/reimbursements/{id}/submit
- DONE: /my/payroll -> GET /my/payroll, GET /my/payroll/{id}/slip, GET /my/payroll/{id}/export, GET /my/payroll/{id}/export-pdf
- DONE: /my/kpi -> GET /my/kpi, POST /my/kpi/{id}/submit
- DONE: /my/documents -> GET /my/documents, POST /my/documents (multipart)
- DONE: /my/assets -> GET /my/assets
- DONE: /my/trainings -> GET /my/trainings
- DONE: /my/competencies -> GET /my/competencies
- DONE: /my/requests -> GET /my/requests, GET /my/requests/{id}, POST /my/requests, POST /my/requests/{id}/comments
- PARTIAL: /ess/profile, /ess/attendance, /ess/leave, /ess/payslip, /ess/requests (masih wrapper/alias)

## Manager
- DONE: /leave/approval -> GET /leaves/pending, PUT /leaves/{id}/approve, PUT /leaves/{id}/reject
- DONE: /requests, /requests/assign, /requests/status -> GET /requests, GET /requests/{id}, PUT assign/status
- DONE: /training/programs, /training/enrollments -> GET/POST enroll/complete
- DONE: /competencies -> GET /competencies, POST /competencies, POST /competencies/{id}/assign
- DONE: /insights/people/detailed -> GET /insights/people/detailed
- DONE: /reports/attendance, /reports/leave, /reports/payroll, /reports/custom -> GET with filter params

## HR
- DONE: /employees -> GET /employees + onboarding/offboarding actions
- DONE: /leave/type, /leave/policy -> GET/POST/PUT/DELETE /leave-policies
- DONE: /documents/review -> GET /documents?status=pending, PUT /documents/{id}/review
- DONE: /documents/expiring -> GET /documents/expiring
- DONE: /reimbursements, /expense/approval -> approve/reject/mark-paid actions
- DONE: /payroll -> generate/approve/pay actions
- PARTIAL: /organization/department, /organization/position, /employment/status, /employment/salary-history (monitor via current aggregated data)

## Admin
- DONE: /admin/users -> GET /admin/users, assign role
- DONE: /admin/roles -> GET /admin/roles, assign permission
- DONE: /admin/permissions -> GET /admin/permissions
- DONE: /locations -> GET /locations, POST /locations
- DONE: /notifications -> GET /notifications, GET /notifications/unread-count, mark read / read-all
- PARTIAL: /settings/* master data routes masih memakai endpoint agregat (belum endpoint CRUD domain terpisah)

## Route Mapping Coverage (sectionRoutes)
- DONE: Attendance extension routes (/attendance/timesheet|shifts|overtime|reports) sudah terhubung endpoint operasional.
- DONE: Assets/training/competency/requests/documents/notifications/report routes sudah punya mapping endpoint.
- DONE: Enforced route->action matrix dan required field guard di SectionPage (fail-fast untuk mismatch action/path).
- PARTIAL: Beberapa route berbasis struktur organisasi dan settings level enterprise masih menunggu endpoint backend khusus.

## Remaining For 100%
- Finalisasi payload exact 1:1 dari hasil UAT backend (hapus semua fallback multi-key jika schema backend sudah final).
- Tambah endpoint CRUD domain khusus untuk organization/employment/settings bila backend sudah expose contract resminya.
- Tambah automated integration test per role-route (Employee, Manager, HR, Admin) menggunakan token role nyata.
