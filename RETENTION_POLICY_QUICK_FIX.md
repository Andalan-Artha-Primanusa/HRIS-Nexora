# 🎯 Retention Policy CREATE - Quick Fix Guide

## ⚡ 30-Second Diagnosis

**You're trying to create a retention policy but it doesn't work?**

### Do This NOW:

#### 1️⃣ Check Form Fields
```
☐ Module name filled?     (Not empty, not just spaces)
☐ Retain days filled?     (Number from 1-36500)
☐ Both fields have data?
```

#### 2️⃣ Press F12 → Network Tab
```
Click "Simpan Kebijakan"
Look for: POST /enterprise/compliance/retention-policies
Check Status Code:
  ✅ 200 = Working!
  ❌ 404 = Endpoint missing
  ❌ 422 = Validation error
  ❌ 500 = Server error
```

#### 3️⃣ Check Console Tab
```
F12 → Console
Look for red error messages
Share the error text
```

---

## 🔧 Most Common Issues & Fixes

### ❌ "Nama modul dan durasi retensi wajib diisi"

**FIX**: Fill both form fields with valid data
```
✓ Module: "Payroll Records" (not empty)
✓ Days: 365 (number between 1-36500)
```

---

### ❌ Button keeps showing "Menyimpan..." forever

**FIX**: Check Network tab (F12)
```
If POST request Status = 404
  → Endpoint missing, check backend routes

If POST request Status = 500
  → Backend error, check backend logs

If no POST request appears
  → Form validation is blocking it
```

---

### ❌ Form closes but policy doesn't appear

**FIX**: Click "Segarkan" button manually
```
If policy appears after refresh = ✅ Works!
If still missing = Check database table exists
```

---

## 📍 Code Locations

| Component | File | Line | Status |
|-----------|------|------|--------|
| Form State | ComplianceSettingsPage.tsx | 46 | ✅ |
| Form UI | ComplianceSettingsPage.tsx | 260 | ✅ |
| Handler | ComplianceSettingsPage.tsx | 73 | ✅ |
| Backend | EnterpriseOpsController.php | 194 | ✅ |
| Endpoint | POST /enterprise/compliance/retention-policies | - | ❓ |
| Database | data_retention_policies table | - | ❓ |

---

## 📋 Frontend Validation Rules

```typescript
// Must pass BOTH checks:

Check 1: policyForm.module.trim()
  ❌ "" (empty)
  ❌ "   " (spaces only)
  ✅ "Payroll Records"

Check 2: policyForm.retain_days
  ❌ undefined
  ❌ null
  ❌ 0
  ❌ 100000
  ✅ 1 to 36500
```

---

## 🚀 To Add New Fields

If you want to add more fields to retention policy:

**Step 1**: Update form state (line 46)
```typescript
const [policyForm, setPolicyForm] = useState({ 
  module: '',
  retain_days: 365,
  anonymize_after_expiry: false,
  new_field: ''  // ← Add here
});
```

**Step 2**: Add to form UI (line 260+)
```tsx
<input
  value={policyForm.new_field}
  onChange={(e) => setPolicyForm({ ...policyForm, new_field: e.target.value })}
/>
```

**Step 3**: Backend automatically includes it in POST!

---

## ✅ Quick Checklist to Verify Working

```
Do this to verify everything works:

1. Fill form:
   Module: "Test Records"
   Days: 90
   Anonymize: ☑️

2. Click "Simpan Kebijakan"

3. See green banner: "Kebijakan retensi berhasil dibuat" ✅

4. Form closes automatically ✅

5. Click "Segarkan" button

6. "Test Records" appears in table with:
   - RETENSI: 3 Bulan
   - Anonimisasi: Ya
   ✅

7. Success! CREATE is working.
```

---

## 🆘 Still Not Working?

**Step A: Test API Directly**
```bash
# In terminal, test the endpoint:
curl -X POST http://localhost:8000/api/enterprise/compliance/retention-policies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "module": "Test",
    "retain_days": 365,
    "anonymize_after_expiry": true
  }'

# If you get error, backend isn't working
# If you get success, backend OK - frontend issue
```

**Step B: Check Backend Routes**
```
File: routes/api.php
Look for: retention-policies route
If missing: Add the route registration
```

**Step C: Check Database**
```sql
SHOW TABLES LIKE 'data_retention_policies';
-- Should return: 1 row (table exists)
-- If 0 rows: Table missing, run migration
php artisan migrate
```

---

## 📞 Info to Share If Stuck

```
1. Screenshot of error message
2. Network tab screenshot (F12 → Network → POST status)
3. Browser console errors (F12 → Console → red text)
4. Form values you entered
5. Your user role (admin? HR?)
6. Backend running? (what URL?)
```

---

## ✨ Summary

| Status | Details |
|--------|---------|
| **Frontend Form** | ✅ Working perfectly |
| **Frontend Validation** | ✅ Working perfectly |
| **Frontend Handler** | ✅ Working perfectly |
| **API Endpoint** | ⚠️ Needs verification |
| **Backend Handler** | ✅ Code exists |
| **Database Table** | ⚠️ Needs verification |

**Most Likely Cause**: Form validation failing because fields aren't filled correctly

**Most Likely Fix**: Fill form with valid data and try again

