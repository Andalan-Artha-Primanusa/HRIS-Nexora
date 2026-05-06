# 🔒 Right to be Forgotten (Permintaan Privasi Aktif) - Flow & API Analysis

## 📍 Overview

**Location**: `/compliance/settings`  
**Feature**: "Permintaan Privasi Aktif (Right to be Forgotten)"  
**Purpose**: GDPR & Data Privacy Compliance - Manage employee data deletion, access, anonymization requests

---

## 🎯 Current Implementation Status

### ✅ Frontend (Complete)
- [ComplianceSettingsPage.tsx](src/pages/admin/ComplianceSettingsPage.tsx#L1) - UI for managing privacy requests
- Dual tabs: "Kebijakan Retensi" (Retention Policies) + "Permintaan Privasi" (Privacy Requests)
- Manual request submission form + request tracking table

### ⚠️ Backend (Incomplete - Only CRUD, No Processing)
- **Endpoints Created**: 
  - `GET /enterprise/compliance/privacy-requests` - List requests
  - `POST /enterprise/compliance/privacy-requests` - Submit request
- **Missing**: Processing endpoint (no handler to execute delete/anonymize actions)

---

## 📊 Privacy Request Types & Flow

```
Request Type → Triggered → Affects Modules → Data Action
──────────────────────────────────────────────────────────
1. access      → Manual   → All modules     → Export data dump
2. delete      → Manual   → Payroll,        → Permanent deletion
               (RTF)       Attendance,        (irreversible)
                          Assets,Profile
3. anonymize   → Policy   → Historical      → Replace PII with
               (Auto)      records          hashed values
4. update      → Manual   → Profile only    → Correct errors
5. export      → Manual   → All modules     → CSV/PDF export
```

### Status Flow
```
submitted → in_progress → completed  ✓
                      ↓
                    rejected ✗
```

---

## 🔗 Module Dependencies

### Privacy Request touches these systems:

#### 1️⃣ **Payroll Module** ⚡ HIGH IMPACT
- **Tables Affected**:
  - `payrolls` - Delete all records for employee
  - `payroll_details` - Sub-items (allowances, deductions)
  - `payroll_retro_adjustments` - Retroactive corrections
  - `employee_compensation_profiles` - Bank details, tax info
  
- **Risk**: 
  - ⚠️ Cannot reconstruct payroll history
  - ⚠️ Audit trail lost
  - ⚠️ Bank reconciliation broken
  
- **Related APIs**:
  - `DELETE /payroll/{id}` - Single deletion
  - `GET /my/payroll` - Employee view
  - `GET /payroll/{id}/slip` - Payroll slips

---

#### 2️⃣ **Attendance Module** ⚡ HIGH IMPACT
- **Tables Affected**:
  - `attendances` - All clock in/out records
  - `attendance_logs` - Detailed tracking
  - `biometric_records` - Fingerprint/facial data
  
- **Risk**:
  - ⚠️ Cannot verify work hours
  - ⚠️ Leave balance calculations affected
  - ⚠️ Performance metrics lost
  
- **Related APIs**:
  - `DELETE /attendance/{id}` - Delete record
  - `GET /attendance/all` - Admin view

---

#### 3️⃣ **Asset Management** 🔴 CRITICAL
- **Tables Affected**:
  - `assets` - Equipment registry
  - `asset_assignments` - Who has what
  - `asset_history` - Maintenance logs
  
- **Risk**:
  - ⚠️ Asset tracking broken
  - ⚠️ Cannot verify return/receipt
  - ⚠️ Inventory discrepancies
  
- **Related APIs**:
  - `POST /assets/{id}/assign`
  - `PUT /assets/assignments/{id}/return`

---

#### 4️⃣ **Employee Profile** ⚡ HIGH IMPACT
- **Tables Affected**:
  - `employees` - Core identity
  - `users` - Login credentials
  - `employee_documents` - Certifications, IDs
  - `employee_compensation_profiles` - Compensation data
  
- **Risk**:
  - ⚠️ Complete employee record erasure
  - ⚠️ User account orphaned
  - ⚠️ Department/reporting structure broken

---

#### 5️⃣ **Leave Management** 💛 MEDIUM IMPACT
- **Tables Affected**:
  - `leaves` - Leave requests
  - `leave_balances` - Current allocations
  - `leave_policies` - Historical assignments
  
- **Risk**:
  - ⚠️ Cannot audit leave usage
  - ⚠️ Team schedule affected
  - 🟢 Lower business impact than payroll

---

#### 6️⃣ **Other Modules** (Potentially Affected)
- **Performance Reviews** - Evaluation history lost
- **Training Records** - Compliance certifications erased
- **Recruitment History** - Candidate tracking gone
- **Reimbursements** - Expense audit trail lost
- **Tasks & Assignments** - Work history deleted
- **Biometric Data** - Facial/fingerprint records

---

## 🔄 API Endpoints Overview

### Current Endpoints (Frontend Consumes)

```
GET  /enterprise/compliance/retention-policies
└─ Returns: List of data retention rules
   Response:
   {
     data: [
       {
         id, module, retain_days, anonymize_after_expiry,
         active, created_at, updated_at
       }
     ]
   }

POST /enterprise/compliance/retention-policies
└─ Creates: New retention policy
   Payload:
   {
     module: "Payroll Records",
     retain_days: 365,
     anonymize_after_expiry: false
   }

DELETE /enterprise/compliance/retention-policies/{module}
└─ Deactivates: Retention policy

GET /enterprise/compliance/privacy-requests
└─ Returns: List of privacy requests
   Response:
   {
     data: [
       {
         id, request_type, status, description,
         created_at, updated_at,
         requester_name, employee_code, department
       }
     ]
   }

POST /enterprise/compliance/privacy-requests
└─ Creates: New privacy request (status="submitted")
   Payload:
   {
     request_type: "delete|access|update|anonymize|export",
     description: "Optional reason"
   }
```

### ❌ Missing Endpoints (NOT YET IMPLEMENTED)

```
PUT /enterprise/compliance/privacy-requests/{id}/process
└─ Would execute: Process the privacy request
   Payload:
   {
     status: "in_progress" | "completed" | "rejected",
     action_log: "..."
   }
   
   Missing Implementation:
   - No endpoint exists
   - No worker/job handler
   - No audit logging
   - No data deletion logic

POST /enterprise/compliance/privacy-requests/{id}/execute
└─ Would execute: Bulk delete/anonymize operations
   (Also missing)

GET /enterprise/compliance/privacy-requests/{id}/status
└─ Would check: Request processing progress
   (Also missing)
```

---

## 🚨 Feature Interaction Matrix

| Module | Retention Policy | Delete Request | Anonymize | Export | Access Req |
|--------|------------------|----------------|-----------|--------|-----------|
| Payroll | ✅ Auto-purge | ✅ Manual delete | ✅ Hash values | ✅ Export CSV | ⚠️ Needs impl |
| Attendance | ✅ Auto-purge | ✅ Manual delete | ✅ Hash values | ✅ Export CSV | ⚠️ Needs impl |
| Assets | ✅ Auto-purge | ✅ Manual delete | ✅ Hash values | ✅ Export CSV | ⚠️ Needs impl |
| Leave | ✅ Auto-purge | ✅ Manual delete | ✅ Hash values | ✅ Export CSV | ⚠️ Needs impl |
| Employee | ✅ Auto-purge | ✅ Manual delete | ⚠️ Partial | ✅ Export CSV | ⚠️ Needs impl |
| Performance | ✅ Auto-purge | ✅ Manual delete | ✅ Hash values | ⚠️ Limited | ⚠️ Needs impl |
| Training | ✅ Auto-purge | ✅ Manual delete | ✅ Hash values | ✅ Export CSV | ⚠️ Needs impl |

---

## ⚠️ Safety Warning (From UI)

**Warning from ComplianceSettingsPage.tsx (Line 388-398)**:
```
"Memproses permintaan penghapusan data akan menghapus seluruh catatan 
karyawan secara permanen dari seluruh modul sistem (Payroll, Attendance, 
Asset). Tindakan ini tidak dapat dibatalkan."

Translation:
"Processing data deletion requests will permanently delete employee 
records from ALL system modules (Payroll, Attendance, Asset). 
This action cannot be undone."
```

---

## 📋 Implementation Checklist

### Currently Implemented ✅
- [x] Frontend form to submit privacy requests
- [x] Database tables: `privacy_requests`, `data_retention_policies`
- [x] API endpoints to create/list requests
- [x] Request type validation (delete, access, update, anonymize, export)
- [x] Status tracking (submitted, in_progress, completed, rejected)

### Missing / Todo ⚠️
- [ ] **Processing endpoint**: `PUT /enterprise/compliance/privacy-requests/{id}`
- [ ] **Batch deletion handler**: Delete across Payroll, Attendance, Assets
- [ ] **Anonymization logic**: Replace PII with hashed/masked values
- [ ] **Audit logging**: Track who deleted what, when, why
- [ ] **Export functionality**: Generate data dump for employee
- [ ] **Notification system**: Alert employee when request is processed
- [ ] **Verification workflow**: Require manager/HR approval before executing
- [ ] **Rollback mechanism**: Backup data before deletion (optional but recommended)
- [ ] **Compliance report**: Generate GDPR compliance documentation

---

## 🔍 Data Relationships

```
privacy_requests (id, request_type, status, requester_user_id, ...)
        ↓ references
users (id, name, email, ...)
        ↓ references
employees (id, user_id, employee_code, department, ...)
        ↓ 1-to-many
├─ payrolls (employee_id, ...)
├─ attendances (employee_id, ...)
├─ asset_assignments (employee_id, ...)
├─ leaves (employee_id, ...)
├─ employee_documents (employee_id, ...)
└─ performance_reviews (employee_id, ...)
```

---

## 💡 Recommendations

### Priority 1 (Critical - Do First)
1. ✅ **Implement privacy request processor**
   - Add endpoint: `PUT /enterprise/compliance/privacy-requests/{id}`
   - Check approval workflow before executing
   - Log all changes to audit table
   
2. ✅ **Create backup before deletion**
   - Snapshot employee data to archive table
   - Keep audit trail for 7 years (GDPR requirement)

3. ✅ **Add frontend "Process" button**
   - Currently table shows "Proses" button but no handler
   - Add confirmation modal with affected modules list

### Priority 2 (High - Do Soon)
4. ✅ **Implement anonymization**
   - Create anonymize_employee() function
   - Replace: names → "Employee_[ID]", emails → "[ID]@deleted.local"
   - Preserve structure for historical analysis

5. ✅ **Add notification system**
   - Notify employee when request is processed
   - Alert managers about missing data

### Priority 3 (Medium - Consider)
6. ⚠️ **Request approval workflow**
   - Require HR manager sign-off before delete
   - Add staging environment for testing

7. ⚠️ **Data export functionality**
   - Generate employee data dump (request_type="export")
   - Support request_type="access" for GDPR Article 15

---

## 📝 Table Schema Reference

```sql
-- privacy_requests table
CREATE TABLE privacy_requests (
  id INT PRIMARY KEY,
  requester_user_id INT,  -- Who requested (FK: users.id)
  request_type ENUM('access', 'update', 'delete', 'anonymize', 'export'),
  status ENUM('submitted', 'in_progress', 'completed', 'rejected'),
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- data_retention_policies table
CREATE TABLE data_retention_policies (
  id INT PRIMARY KEY,
  module VARCHAR(100),  -- 'Payroll Records', 'Attendance Logs', etc
  retain_days INT,
  anonymize_after_expiry BOOLEAN,
  active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🎬 Next Steps

1. **Review** this analysis with backend team
2. **Decide** on processing strategy:
   - Synchronous (immediate deletion)
   - Asynchronous (queued job)
   - Manual (HR verification first)
3. **Implement** missing endpoints
4. **Test** with employee sandbox account
5. **Document** GDPR compliance procedures

