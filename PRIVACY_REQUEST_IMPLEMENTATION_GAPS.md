# 🛠️ Right to be Forgotten (RTF) - Implementation Gaps & TODOs

## Current Status: ⚠️ PARTIALLY IMPLEMENTED (50% Complete)

The feature is **submission-ready** but **processing chain is incomplete**.

---

## ✅ What's Already Done

| Component | Status | Location |
|-----------|--------|----------|
| **Frontend Form** | ✅ Complete | [ComplianceSettingsPage.tsx](src/pages/admin/ComplianceSettingsPage.tsx#L295-L340) |
| **Request Storage** | ✅ Complete | `privacy_requests` table |
| **Request Submission API** | ✅ Complete | `POST /enterprise/compliance/privacy-requests` |
| **Request Listing API** | ✅ Complete | `GET /enterprise/compliance/privacy-requests` |
| **Retention Policies CRUD** | ✅ Complete | `data_retention_policies` table + endpoints |
| **Request Type Validation** | ✅ Complete | Supports: delete, access, update, anonymize, export |
| **Status Tracking** | ✅ Complete | submitted → in_progress → completed/rejected |

---

## ❌ What's MISSING (Critical Gaps)

### 1. 🚀 Backend Processing Endpoint

**Current State**: Request stored but never processed  
**Missing**: Endpoint to execute the privacy request

```php
// ❌ DOESN'T EXIST - NEEDS TO BE CREATED

// File: app/Http/Controllers/Api/EnterpriseOpsController.php
// New method needed:

public function processPrivacyRequest(Request $request, int $requestId): JsonResponse
{
    // Validate request exists and is "submitted"
    // Check user has permission (admin/HR role)
    // Get employee_id from privacy_request.requester_user_id
    
    // Based on request_type:
    // - "delete"     → Call deleteEmployeeData()
    // - "anonymize"  → Call anonymizeEmployeeData()
    // - "export"     → Call exportEmployeeData()
    // - "access"     → Call generateDataExport()
    // - "update"     → Call updateEmployeeData()
    
    // Update status to "in_progress" then "completed"
    // Log action to audit table
    // Notify employee
}
```

**Frontend Impact**: Line 363 in [ComplianceSettingsPage.tsx](src/pages/admin/ComplianceSettingsPage.tsx#L363)
```tsx
<Button variant="primary" size="sm">Proses</Button>  // Button exists but has NO onClick handler
```

---

### 2. 🗑️ Data Deletion Logic

**Missing Components**:

```php
// Function: deleteEmployeeData()
// Location: App\Services\Privacy\EmployeeDataDeleteService

public function deleteEmployeeData(int $employeeId): void
{
    // Delete from Payroll
    DB::table('payrolls')->where('employee_id', $employeeId)->delete();
    DB::table('payroll_details')->where('payroll_id', 'IN' /* subquery */)->delete();
    DB::table('payroll_retro_adjustments')->where('employee_id', $employeeId)->delete();
    DB::table('employee_compensation_profiles')->where('employee_id', $employeeId)->delete();
    
    // Delete from Attendance
    DB::table('attendances')->where('employee_id', $employeeId)->delete();
    DB::table('attendance_logs')->where('employee_id', $employeeId)->delete();
    DB::table('biometric_records')->where('employee_id', $employeeId)->delete();
    
    // Delete from Assets
    DB::table('asset_assignments')->where('employee_id', $employeeId)->delete();
    
    // Delete from Leave
    DB::table('leaves')->where('employee_id', $employeeId)->delete();
    DB::table('leave_balances')->where('employee_id', $employeeId)->delete();
    
    // Delete Documents
    DB::table('employee_documents')->where('employee_id', $employeeId)->delete();
    
    // Delete Employee Record
    DB::table('employees')->where('id', $employeeId)->delete();
    
    // Optionally: Delete User account
    // DB::table('users')->where('id', $employee->user_id)->delete();
}
```

---

### 3. 🔒 Anonymization Logic

**Missing Component**: Replace PII with masked/hashed values

```php
// Function: anonymizeEmployeeData()
// Location: App\Services\Privacy\EmployeeDataAnonymizeService

public function anonymizeEmployeeData(int $employeeId): void
{
    $hash = hash('sha256', 'employee_' . $employeeId . '_' . now());
    $shortHash = substr($hash, 0, 8);
    
    // Anonymize Employee Profile
    DB::table('employees')
        ->where('id', $employeeId)
        ->update([
            'first_name' => 'Employee_' . $shortHash,
            'last_name' => 'Deleted',
            'email' => $shortHash . '@anonymized.local',
            'phone' => '*'.str_repeat('*', 8).'*',
            'date_of_birth' => null,
        ]);
    
    // Anonymize Payroll History (keep structure)
    DB::table('payrolls')
        ->where('employee_id', $employeeId)
        ->update([
            'notes' => 'ANONYMIZED',
        ]);
    
    // Anonymize Attendance Records
    DB::table('attendances')
        ->where('employee_id', $employeeId)
        ->update([
            'notes' => 'ANONYMIZED',
        ]);
    
    // Anonymize Documents
    DB::table('employee_documents')
        ->where('employee_id', $employeeId)
        ->update([
            'notes' => 'ANONYMIZED',
        ]);
}
```

---

### 4. 📤 Data Export Logic

**Missing Component**: Generate employee data dump

```php
// Function: exportEmployeeData()
// Location: App\Services\Privacy\EmployeeDataExportService

public function exportEmployeeData(int $employeeId): array
{
    $employee = DB::table('employees')->find($employeeId);
    
    $export = [
        'profile' => DB::table('employees')->where('id', $employeeId)->first(),
        'payroll' => DB::table('payrolls')->where('employee_id', $employeeId)->get(),
        'attendance' => DB::table('attendances')->where('employee_id', $employeeId)->get(),
        'assets' => DB::table('asset_assignments')->where('employee_id', $employeeId)->get(),
        'leaves' => DB::table('leaves')->where('employee_id', $employeeId)->get(),
        'documents' => DB::table('employee_documents')->where('employee_id', $employeeId)->get(),
        'training' => DB::table('training_enrollments')->where('employee_id', $employeeId)->get(),
    ];
    
    return $export;
    
    // Return as CSV/JSON/PDF
}
```

---

### 5. 📋 Audit Logging

**Missing Component**: Log all privacy request actions

```php
// Table: privacy_request_logs
// Captures: Who processed what, when, with what outcome

CREATE TABLE privacy_request_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    privacy_request_id INT,
    processed_by_user_id INT,  -- HR/Admin who clicked "Proses"
    action VARCHAR(255),       -- 'delete', 'anonymize', 'export', 'rejected'
    rows_affected INT,
    error_message TEXT,
    processed_at TIMESTAMP,
    FOREIGN KEY (privacy_request_id) REFERENCES privacy_requests(id),
    FOREIGN KEY (processed_by_user_id) REFERENCES users(id)
);
```

---

### 6. 🔔 Notification System

**Missing Component**: Notify employee when request is processed

```php
// Frontend needs to trigger notification when status changes

// Notification template needed:
// event_key: 'privacy_request_completed'
// message: "Your data deletion request has been processed"
// 
// OR
//
// event_key: 'privacy_request_exported'
// message: "Your data export is ready for download"
```

---

### 7. ✅ Approval/Verification Workflow (Optional but Recommended)

**Question**: Should requests auto-process or require approval?

**Current Flow**:
```
Employee submits → Status = "submitted" → Admin clicks "Proses" → Execute
```

**Recommended Flow**:
```
Employee submits 
  → Status = "submitted"
  → Requires: Manager + HR approval
  → Status = "approved"
  → Admin clicks "Execute"
  → Data backup created
  → Status = "in_progress"
  → Deletion runs
  → Status = "completed"
  → Audit log + notification
```

---

### 8. 💾 Data Backup/Archive

**Missing Component**: Backup data before deletion (GDPR best practice)

```php
// Before executing delete, snapshot to archive table:

public function backupEmployeeDataBeforeDeletion(int $employeeId): void
{
    // Archive to: employee_data_archive table
    // Retain for: 7 years (GDPR requirement)
    
    $employee = DB::table('employees')->find($employeeId);
    
    DB::table('employee_data_archive')->insert([
        'archived_by' => Auth::user()->id,
        'reason' => 'Privacy request - deletion',
        'employee_id' => $employeeId,
        'archived_data' => json_encode([
            'employee' => $employee,
            'payroll' => DB::table('payrolls')->where('employee_id', $employeeId)->get(),
            'attendance' => DB::table('attendances')->where('employee_id', $employeeId)->get(),
            // ... all related data
        ]),
        'archived_at' => now(),
    ]);
}
```

---

## 📊 Implementation Priority

### Phase 1: MVP (Week 1-2) ⚡ Critical
- [ ] Create `processPrivacyRequest()` endpoint
- [ ] Implement `deleteEmployeeData()` function
- [ ] Add audit logging to `privacy_request_logs`
- [ ] Add "onClick" handler to "Proses" button
- [ ] Test with sandbox employee account

### Phase 2: Enhanced (Week 3) 🎯 Important
- [ ] Implement anonymization logic
- [ ] Add data export functionality
- [ ] Create notification system
- [ ] Data backup before deletion

### Phase 3: Compliance (Week 4) 📋 Optional
- [ ] Add approval workflow
- [ ] Generate GDPR compliance reports
- [ ] Create deletion verification checklist

---

## 🧪 Testing Checklist

- [ ] Submit privacy request (request_type="delete")
- [ ] Verify request appears in admin table
- [ ] Click "Proses" button
- [ ] Verify status changes to "in_progress" then "completed"
- [ ] Verify employee record deleted from employees table
- [ ] Verify payroll records deleted
- [ ] Verify attendance records deleted
- [ ] Verify audit log created
- [ ] Test with request_type="anonymize"
- [ ] Test with request_type="export"
- [ ] Verify no orphaned records remain

---

## 🚨 Safety Considerations

1. **Irreversible Action**: Once deleted, data cannot be recovered
2. **Cascading Deletes**: Must handle FK constraints
3. **Audit Trail**: MUST log all changes (GDPR Article 5.1)
4. **Backup**: Recommend 7-year retention in archive table
5. **Permissions**: Only admin/HR should process requests
6. **Verification**: Double-check employee_id before executing

---

## 📝 Related Files

| File | Purpose | Status |
|------|---------|--------|
| [ComplianceSettingsPage.tsx](src/pages/admin/ComplianceSettingsPage.tsx) | Frontend UI | ✅ Done |
| [EnterpriseOpsController.php](../API-Backend/app/Http/Controllers/Api/EnterpriseOpsController.php) | API endpoints | ⚠️ Partial |
| `PRIVACY_REQUEST_ANALYSIS.md` | This analysis | ✅ Created |
| `PrivacyRequestHandler.php` (TO CREATE) | Processing logic | ❌ Missing |

---

## 🎯 Summary

**Current Situation**: You can submit privacy requests but they sit in the database indefinitely.

**What's Needed**: Backend service to actually process them (delete, anonymize, export).

**Estimated Effort**: 3-4 days for Phase 1 (MVP)

**Risk Level**: 🔴 HIGH - Data deletion is irreversible, requires careful implementation

