# 🔧 Troubleshooting: Retention Policy CREATE Not Working

## 🎯 Problem: "Mau nambah retensi kok gabisa createnya"
*"I want to add a retention policy but I can't create it"*

---

## 🚨 Quick Diagnosis Checklist

### Step 1: Check What Error You See
```
When you click "Simpan Kebijakan" button:

❌ Nothing happens (button disabled/not responding)?
   └─ CHECK #1: Validation Error

❌ Loading spinner appears but then stops?
   └─ CHECK #2: Network Error

❌ See error message in red banner?
   └─ CHECK #3: API Error

❌ Form closes but no new policy appears?
   └─ CHECK #4: Data Not Refreshing
```

---

## 📋 CHECK #1: Validation Error

**Form Validation Rules**:
```
Field: Nama Modul (module)
  ├─ Required: YES
  ├─ Type: String
  └─ Max length: 100 characters
  
Field: Durasi Retensi (retain_days)
  ├─ Required: YES
  ├─ Type: Number/Integer
  ├─ Min: 1 day
  └─ Max: 36500 days (100 years)

Field: Anonimisasi (anonymize_after_expiry)
  ├─ Required: NO (optional)
  └─ Type: Boolean (checkbox)
```

**Frontend Validation Code** (Line 73-77):
```typescript
if (!policyForm.module.trim() || !policyForm.retain_days) {
  setAlertMessage('Nama modul dan durasi retensi wajib diisi');
  setAlertType('error');
  return;
}
```

### ✅ How to Fix:
Make sure:
- [x] Module name is NOT empty
- [x] Module name has at least 1 character (no spaces only)
- [x] Retain days is NOT empty
- [x] Retain days is a valid number (1-36500)

**Example Valid Input**:
```
Nama Modul: "Payroll Records"
Durasi Retensi: 365
Anonimisasi: Checked ✓
```

---

## 📡 CHECK #2: Network/API Error

**Frontend makes POST request to**:
```
POST /enterprise/compliance/retention-policies

Payload sent:
{
  "module": "Payroll Records",
  "retain_days": 365,
  "anonymize_after_expiry": true
}
```

### Common Network Issues:

**Issue A: API Endpoint Not Registered**
```php
// Backend route file (routes/api.php)
// ❌ Missing:
Route::post('/enterprise/compliance/retention-policies', 
  [EnterpriseOpsController::class, 'retentionPolicyStore']
);

// ✅ Should be added if missing
```

**Issue B: Authentication/Authorization**
```
- Must be logged in as ADMIN or HR role
- Check: Is your user account admin role?
- Check: Do you have permission to modify compliance settings?
```

**Issue C: Backend Not Running**
```
- Is Laravel backend running on correct port?
- Check: frontend/.env - what's VITE_API_URL?
- Check: Does the domain resolve correctly?
```

### ✅ How to Diagnose:

**Step 1**: Open browser DevTools (F12)
```
Press: F12 key
→ Go to: Network tab
→ Keep tab open
→ Try to create policy again
→ Look for the POST request
```

**Step 2**: Check the request
```
Look for: POST /enterprise/compliance/retention-policies

If you see it:
  ✅ Request was sent
  
  Click it to see:
    - Status code 200 = ✅ Success
    - Status code 422 = ❌ Validation error
    - Status code 401 = ❌ Not authenticated
    - Status code 403 = ❌ Not authorized
    - Status code 404 = ❌ Endpoint missing
    - Status code 500 = ❌ Server error
    
If you DON'T see it:
  ❌ Request never sent (validation blocked it)
```

---

## 🚨 CHECK #3: API Error Response

**Backend Validation** (EnterpriseOpsController.php line 197-200):
```php
$validated = $request->validate([
    'module' => 'required|string|max:100',
    'retain_days' => 'required|integer|min:1|max:36500',
    'anonymize_after_expiry' => 'sometimes|boolean',
]);
```

**Common API Errors**:

### Error: "Nama modul dan durasi retensi wajib diisi"
**Cause**: Frontend validation failed  
**Solution**: 
- Enter valid module name (not empty)
- Enter valid retain_days number (1-36500)

### Error: 422 Unprocessable Entity
**Cause**: Backend validation failed  
**Solution**: Check payload matches schema:
```json
{
  "module": "string (required, max 100 chars)",
  "retain_days": "integer (required, 1-36500)",
  "anonymize_after_expiry": "boolean (optional)"
}
```

### Error: 404 Not Found
**Cause**: API endpoint doesn't exist  
**Solution**: 
1. Check backend route is registered
2. Check URL path is correct
3. Restart backend server

### Error: 401 Unauthorized
**Cause**: Not authenticated  
**Solution**:
1. Check you're logged in
2. JWT token expired? Try logging in again
3. Check Authorization header in request

### Error: 500 Internal Server Error
**Cause**: Backend crash or database error  
**Solution**:
1. Check backend logs for errors
2. Check if `data_retention_policies` table exists
3. Check database connection

---

## 💾 CHECK #4: Database Issues

**Required Table**: `data_retention_policies`

```sql
CREATE TABLE data_retention_policies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  module VARCHAR(100) NOT NULL UNIQUE,
  retain_days INT NOT NULL,
  anonymize_after_expiry BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX(active)
);
```

### Check if Table Exists:
```sql
-- In MySQL/Database client:
SHOW TABLES LIKE 'data_retention_policies';

-- If table exists:
SELECT * FROM data_retention_policies;

-- If table doesn't exist:
-- Run migration to create it
php artisan migrate
```

### Issue: Duplicate Module Name
```
If you try to create policy with module name that already exists:
- ❌ First attempt: Creates successfully
- ❌ Second attempt: Might fail if not using updateOrInsert()

Check the backend code (line 207-208):
DB::table('data_retention_policies')->updateOrInsert(
    ['module' => $validated['module']],  // ← Match condition
    [...]
);
```

---

## 🔍 Complete Troubleshooting Flow

```
Try to Create Policy
  ↓
┌─────────────────────────────┐
│ Can you fill the form?      │
│ (No validation error?)      │
└─────────────────────────────┘
    ├─ NO → CHECK #1: Validation
    │        Fix: Fill form with valid data
    └─ YES → Click "Simpan Kebijakan"
                   ↓
            ┌─────────────────────────────┐
            │ Button shows "Menyimpan..."? │
            └─────────────────────────────┘
                ├─ NO → CHECK #1: Validation (again)
                └─ YES → Loading... wait
                         ↓
            ┌─────────────────────────────┐
            │ Button back to normal?      │
            │ Error message shown?        │
            └─────────────────────────────┘
                ├─ YES (Error shown)
                │   └─ CHECK #3: API Error
                │       Solution: See error message details
                │
                └─ YES (No error, but form closed)
                    ↓
            ┌─────────────────────────────┐
            │ New policy appears in list? │
            └─────────────────────────────┘
                ├─ YES ✅ SUCCESS
                └─ NO → CHECK #4: Refresh
                       Solution: Refresh page (F5)
                       If still missing, CHECK #2: Network
```

---

## 📊 Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Form UI** | ✅ Works | Lines 260-295 |
| **Form State** | ✅ Works | Line 46 |
| **Frontend Validation** | ✅ Works | Lines 73-77 |
| **Frontend Handler** | ✅ Works | Lines 73-91 |
| **API POST Call** | ✅ Works | Line 82 |
| **API Endpoint** | ⚠️ CHECK | `/enterprise/compliance/retention-policies` |
| **Backend Handler** | ✅ Code exists | `retentionPolicyStore()` line 194 |
| **Database Table** | ⚠️ CHECK | `data_retention_policies` |
| **GET/List** | ✅ Works | Line 60 |

---

## 🛠️ Step-by-Step Debug Process

### Step 1: Check Console for Errors
```
1. Press F12 → DevTools opens
2. Go to "Console" tab
3. Check for any red error messages
4. Share the error message
```

### Step 2: Check Network Request
```
1. Press F12 → DevTools opens
2. Go to "Network" tab
3. Try to create policy again
4. Look for POST request to /enterprise/compliance/retention-policies
5. Check Status Code:
   - 200 = ✅ Backend received it
   - 422 = ❌ Validation failed
   - 404 = ❌ Endpoint missing
   - 500 = ❌ Server error
```

### Step 3: Check Response
```
1. Click on the request in Network tab
2. Go to "Response" tab
3. See what the backend returned
4. Share the response JSON
```

### Step 4: Verify Form Values
```
Before clicking "Simpan Kebijakan":
- Module name: _______________  (should not be empty)
- Retain days: _______________  (should be number 1-36500)
- Anonymize: [x] or [ ]  (optional)
```

---

## 📞 If Still Broken: Provide These Details

To help fix the issue, provide:

1. **Error Message** (exact text from red banner)
2. **Browser Console Error** (F12 → Console → copy red text)
3. **Network Status Code** (F12 → Network → POST request status)
4. **Form Values You Entered**:
   - Module name: ________
   - Retain days: ________
5. **Your User Role**: [ ] Admin [ ] HR [ ] Other: ____
6. **Backend URL** (from frontend .env):
   - VITE_API_URL = ________

---

## ✅ Verified Working

If you follow these steps and:
- [x] Form validates (no error on submit)
- [x] Network shows 200 status
- [x] Response shows success
- [x] Then click "Segarkan" button
- [x] New policy should appear

**If this workflow works**: ✅ CREATE is working fine!

**If it fails**: One of the 4 checks above has the issue.

