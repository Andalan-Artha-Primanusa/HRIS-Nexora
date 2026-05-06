# API Requirements — endpoints expected by frontend (derived from src/features/*/api)

Catatan: saya tidak memiliki akses ke folder backend `C:\Users\raulm\Downloads\API-Backend`. Dokumen ini dibuat dari kode frontend dan berfungsi sebagai checklist untuk dicocokkan dengan implementasi backend.

Cara pakai: bandingkan daftar endpoint di bawah dengan routes/controllers di backend. Tandai apakah ada endpoint yang lengkap, beda path/method, atau belum tersedia.

---

## Auth
- POST /login
- POST /register
- GET /auth/google
- GET /auth/google/callback
- POST /logout
- GET /me

## Benefits
- GET /benefits
- GET /benefits/employee/{employeeId}
- POST /benefits
- POST /benefits/{benefitId}/assign
- GET /benefits/{id}
- PUT /benefits/{id}

## Biometric
- GET /biometric/devices
- GET /biometric/devices/{id}
- POST /biometric/devices
- PUT /biometric/devices/{id}
- POST /biometric/sync-attendance

## KPI / Dashboard
- GET /kpis
- POST /kpis
- GET /kpis/{id}
- PUT /kpis/{id}
- DELETE /kpis/{id}
- GET /kpis/employee/{employeeId}
- PUT /kpis/{id}/approve
- GET /my/kpi
- POST /my/kpi/{id}/submit

## Employee
- GET /employees (pagination support `/employees?page=...`)
- GET /employees/{id}
- POST /employees
- PUT /employees/{id}
- DELETE /employees/{id}
- PUT /employees/{id}/onboarding/start
- PUT /employees/{id}/onboarding/complete
- PUT /employees/{id}/offboarding/start
- PUT /employees/{id}/offboarding/complete

## Employee Documents
- GET /my/documents
- POST /documents (multipart/form-data)
- GET /documents/{id}

## ESS (My) endpoints
- GET /my/kpi
- POST /my/kpi/{id}/submit
- GET /my/reimbursements
- POST /my/reimbursements
- POST /reimbursements/{id}/submit
- GET /my/payroll
- GET /my/payroll/{id}
- GET /my/payroll/{id}/slip
- GET /my/payroll/{id}/export
- GET /my/payroll/{id}/export-pdf
- GET /leaves/my
- GET /leaves/balance
- POST /attendance/check-in
- POST /attendance/check-out
- GET /attendance/history
- GET /attendance/today

## Leave
- GET /leaves
- POST /leaves
- GET /leaves/calendar
- GET /leaves/{id}
- PUT /leaves/{id}
- DELETE /leaves/{id}
- GET /leaves/pending
- GET /leaves?status={status}
- PUT /leaves/{id}/approve
- PUT /leaves/{id}/reject
- GET /leaves/balance

## Location
- GET /locations
- GET /attendance/locations
- POST /locations
- GET /locations/{id}
- PUT /locations/{id}
- DELETE /locations/{id}

## Organization & Approval Flows
- GET /organization/chart
- GET /organization/directory
- GET /organization/team/{managerId}
- GET /compliance/overview
- GET /compliance/expiring-documents
- GET /approval-flows
- POST /approval-flows

## Promotions (Career)
- GET /promotions
- GET /my/promotions
- POST /promotions
- POST /promotions/{id}/approve
- POST /promotions/{id}/reject
- DELETE /promotions/{id}
- POST /my/promotions/{id}/report/submit
- POST /promotions/{id}/report/approve
- POST /promotions/{id}/report/reject

## Payroll
- GET /payroll
- POST /payroll
- POST /payroll/generate/monthly
- GET /payroll/{id}
- GET /payroll/{id}/slip
- PUT /payroll/{id}
- DELETE /payroll/{id}
- POST /payroll/{id}/approve
- POST /payroll/{id}/pay
- POST /payroll/{id}/reject
- GET /payroll/{id}/export
- GET /payroll/{id}/export-pdf
- GET /payroll-details/{payrollId}
- POST /payroll-details
- PUT /payroll-details/{id}
- DELETE /payroll-details/{id}
- GET /my/payroll
- GET /my/payroll/{id}/slip
- GET /my/payroll/{id}/export
- GET /my/payroll/{id}/export-pdf

## Profile
- GET /profiles
- POST /profiles
- GET /profiles/{id}
- PUT /profiles/{id}
- DELETE /profiles/{id}

## Reimbursement
- GET /reimbursements
- POST /reimbursements
- GET /reimbursements/{id}
- PUT /reimbursements/{id}
- DELETE /reimbursements/{id}
- PUT /reimbursements/{id}/approve
- PUT /reimbursements/{id}/reject
- PUT /reimbursements/{id}/mark-paid
- GET /reimbursements/pending
- GET /reimbursements/employee/{employeeId}
- GET /reimbursements/statistics
- GET /my/reimbursements
- POST /my/reimbursements
- POST /reimbursements/{id}/submit

## Requests (HR service requests)
- GET /requests
- GET /my/requests
- POST /requests
- GET /requests/sla-summary
- PUT /requests/{id}/status
- PUT /requests/{id}/assign

## Workforce (holidays, shift swaps, overtime rules, compliance)
- GET /workforce/holidays
- POST /workforce/holidays
- GET /workforce/holidays/{id}
- PUT /workforce/holidays/{id}
- DELETE /workforce/holidays/{id}
- GET /workforce/shift-swaps
- POST /workforce/shift-swaps
- PUT /workforce/shift-swaps/{id}
- GET /workforce/overtime-rules
- GET /workforce/overtime-rules/{id}
- POST /workforce/overtime-rules
- PUT /workforce/overtime-rules/{id}
- DELETE /workforce/overtime-rules/{id}
- GET /workforce/compliance/stats
- GET /workforce/compliance/documents

## Work Schedules
- GET /work-schedules
- GET /work-schedules/{id}
- POST /work-schedules
- PUT /work-schedules/{id}
- DELETE /work-schedules/{id}

## Other endpoints referenced in frontend (examples)
- GET /benefits/..., /assets, /assets/assignments
- Biometric device endpoints (see above)
- Admin endpoints: /admin/users, /admin/roles, /admin/permissions, /admin/audit-logs, /admin/biometric-devices
- Notification admin endpoints: /admin/notifications, /admin/notifications/email-send, /admin/notifications/email-logs
- Master import: /admin/import

---

## Rekomendasi pemeriksaan di backend
1. Cocokkan setiap path dan method di atas dengan route list di backend (routes/web.php, routes/api.php, atau router files).  
2. Periksa parameter dan response shape (frontend mengharapkan `data`, `items`, atau `data.items` pada beberapa endpoint).  
3. Periksa auth/permission middleware: beberapa endpoint dipakai hanya untuk admin/hr/manager (sesuaikan RBAC).  
4. Jika ada perbedaan path/metode, buat mapping alias di backend atau update frontend service untuk menyesuaikan.  

Jika mau, saya bisa:
- Bandingkan lebih mendalam jika Anda upload atau beri akses folder `API-Backend` (atau kirim file route utama).  
- Hasilkan checklist CSV/Excel dari daftar ini agar backend dev bisa menandai status implementasi.  

