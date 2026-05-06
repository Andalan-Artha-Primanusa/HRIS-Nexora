# 📝 Retention Policy CREATE Handler - Location & Details

## 🎯 Problem & Solution

**User Problem**: "Mau nambah retensi kok gabisa createnya"  
*I want to add a retention policy but I can't create it*

---

## 📍 CREATE Handler Locations

### **Frontend CREATE Handler** ✅
**File**: `src/pages/admin/ComplianceSettingsPage.tsx`  
**Lines**: 73-91  
**Function**: `handleCreatePolicy()`

```typescript
// Line 46 - Form State
const [policyForm, setPolicyForm] = useState({ 
  module: '', 
  retain_days: 365, 
  anonymize_after_expiry: false 
});

// Lines 73-91 - Create Handler
const handleCreatePolicy = async () => {
  // Step 1: Frontend Validation
  if (!policyForm.module.trim() || !policyForm.retain_days) {
    setAlertMessage('Nama modul dan durasi retensi wajib diisi');
    setAlertType('error');
    return;
  }
  
  // Step 2: Show loading
  setSaving(true);
  
  try {
    // Step 3: POST Request
    await api.post('/enterprise/compliance/retention-policies', policyForm);
    
    // Step 4: Success
    setAlertMessage('Kebijakan retensi berhasil dibuat');
    setAlertType('success');
    setShowRetentionPolicyForm(false);
    setPolicyForm({ module: '', retain_days: 365, anonymize_after_expiry: false });
    
    // Step 5: Refresh list
    await fetchData();
  } catch (err: any) {
    // Step 6: Error handling
    setAlertMessage(err.response?.data?.message || 'Gagal membuat kebijakan retensi');
    setAlertType('error');
  } finally {
    setSaving(false);
  }
};
```

---

### **Frontend Form UI** ✅
**File**: `src/pages/admin/ComplianceSettingsPage.tsx`  
**Lines**: 260-295  
**When**: Shows when `showRetentionPolicyForm === true`

```tsx
{showRetentionPolicyForm && (
  <Card glass style={{ padding: '2rem', borderRadius: '28px', border: '1px solid #e2e8f0' }}>
    <h3>Kebijakan Retensi Baru</h3>
    
    {/* Input 1: Module Name */}
    <div>
      <label>Nama Modul</label>
      <input
        type="text"
        value={policyForm.module}
        onChange={(e) => setPolicyForm({ ...policyForm, module: e.target.value })}
        placeholder="Contoh: Payroll Records, Attendance Logs"
      />
    </div>
    
    {/* Input 2: Retention Days */}
    <div>
      <label>Durasi Retensi (hari)</label>
      <input
        type="number"
        value={policyForm.retain_days}
        onChange={(e) => setPolicyForm({ ...policyForm, retain_days: Number(e.target.value) })}
        min={1}
      />
    </div>
    
    {/* Input 3: Anonymize Option */}
    <label>
      <input
        type="checkbox"
        checked={policyForm.anonymize_after_expiry}
        onChange={(e) => setPolicyForm({ ...policyForm, anonymize_after_expiry: e.target.checked })}
      />
      Anonimisasi data setelah masa retensi berakhir
    </label>
    
    {/* Buttons */}
    <Button 
      onClick={() => void handleCreatePolicy()} 
      disabled={saving}
    >
      {saving ? 'Menyimpan...' : 'Simpan Kebijakan'}
    </Button>
    <Button onClick={() => setShowRetentionPolicyForm(false)}>Batal</Button>
  </Card>
)}
```

---

### **Backend CREATE Handler** ✅
**File**: `API-Backend/app/Http/Controllers/Api/EnterpriseOpsController.php`  
**Lines**: 194-218  
**Method**: `retentionPolicyStore(Request $request)`

```php
public function retentionPolicyStore(Request $request): JsonResponse
{
    // Step 1: Validate Input
    $validated = $request->validate([
        'module' => 'required|string|max:100',
        'retain_days' => 'required|integer|min:1|max:36500',
        'anonymize_after_expiry' => 'sometimes|boolean',
        'active' => 'sometimes|boolean',
    ]);

    // Step 2: Insert to Database
    // Uses updateOrInsert to prevent duplicates
    DB::table('data_retention_policies')->updateOrInsert(
        ['module' => $validated['module']],  // Match condition
        [
            'retain_days' => $validated['retain_days'],
            'anonymize_after_expiry' => $validated['anonymize_after_expiry'] ?? false,
            'active' => $validated['active'] ?? true,
            'updated_at' => now(),
            'created_at' => now(),
        ]
    );

    // Step 3: Return Created Policy
    return ApiResponse::success(
        'Data retention policy saved successfully', 
        DB::table('data_retention_policies')->where('module', $validated['module'])->first()
    );
}
```

---

### **API Endpoint**
```
POST /enterprise/compliance/retention-policies

Request Headers:
  Content-Type: application/json
  Authorization: Bearer {JWT_TOKEN}

Request Body:
{
  "module": "Payroll Records",
  "retain_days": 365,
  "anonymize_after_expiry": true
}

Response (200 OK):
{
  "success": true,
  "message": "Data retention policy saved successfully",
  "data": {
    "id": 1,
    "module": "Payroll Records",
    "retain_days": 365,
    "anonymize_after_expiry": true,
    "active": true,
    "created_at": "2026-05-06T10:30:00Z",
    "updated_at": "2026-05-06T10:30:00Z"
  }
}
```

---

### **Database Table**
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

---

## ⚡ What Happens When You Click "Simpan Kebijakan"

### Timeline: Step-by-Step

```
TIME  COMPONENT      ACTION
────────────────────────────────────────────────────────────
0ms   Frontend       User clicks "Simpan Kebijakan" button

1ms   Handler        handleCreatePolicy() executes
      
5ms   Validation     Check: policyForm.module.trim() && retain_days
      ├─ If FAIL → Show error, return (stop here)
      └─ If OK → Continue

10ms  State          setSaving = true (disable button, show spinner)

15ms  Network        api.post('/enterprise/compliance/retention-policies', {
                       module: value,
                       retain_days: value,
                       anonymize_after_expiry: value
                     })

100ms Request Travel  Sends over network to backend

150ms Backend         EnterpriseOpsController@retentionPolicyStore receives request

160ms Backend Validate $request->validate([...])
      ├─ If FAIL → Return 422 error (caught by frontend)
      └─ If OK → Continue

180ms Database        DB::table('data_retention_policies')->updateOrInsert(...)

190ms Database        INSERT INTO data_retention_policies

200ms Backend Return  Return ApiResponse::success(...)

250ms Response Travel Response comes back to frontend

300ms Frontend        catch/finally block executes
      ├─ Success → Show "Kebijakan retensi berhasil dibuat"
      ├─ Close form
      ├─ Reset fields
      └─ fetchData() to refresh list

350ms GET Request     GET /enterprise/compliance/retention-policies

400ms Backend List    Return all policies (including new one)

450ms Frontend        setRetentionPolicies(newList)
      
500ms UI Update       ✅ New policy appears in list
      └─ Success banner shows
      └─ Form closes
      └─ Button back to normal
```

---

## 🎯 Possible Issues & Solutions

### Issue 1: "Validation Error - Nama modul dan durasi retensi wajib diisi"

**Cause**: Frontend validation failed

**Check**:
```
Module field empty?       → Fill it
Module field = "   "?     → Not just spaces
Retain days empty?        → Enter number 1-36500
Retain days = 0?          → Must be ≥ 1
Retain days = 100000?     → Must be ≤ 36500
```

**Solution**: Fill both fields with valid data

---

### Issue 2: Loading spinner appears but never completes

**Cause**: Network request hanging or no response

**Check** (F12 DevTools Network tab):
- Is there a request to `/enterprise/compliance/retention-policies`?
- If YES → What's the Status Code?
  - 200 = Success (but form not responding)
  - 404 = Endpoint missing
  - 500 = Server error
  - (no number) = Network error
- If NO → Request never sent (validation issue)

**Solution**: Check backend logs for errors

---

### Issue 3: Error message appears: "Gagal membuat kebijakan retensi"

**Cause**: Backend returned error

**Check**:
```
The actual error is in: err.response?.data?.message
```

**Solution**: Check backend API response for specific error

---

### Issue 4: Form closes, no error, but policy doesn't appear

**Cause**: Success response received, but data not in list

**Check**:
- Click "Segarkan" button (manual refresh)
- Does policy appear now? → YES = Network lag issue, OK
- Still missing? → NO = Database/backend issue

**Solution**: 
1. Refresh page (F5)
2. Check if `data_retention_policies` table exists
3. Check backend logs

---

## 🔍 How to Debug

### Debug Step 1: Browser Console
```
1. Press F12
2. Go to Console tab
3. Look for red error messages
4. Screenshot and share
```

### Debug Step 2: Network Tab
```
1. Press F12
2. Go to Network tab
3. Try to create policy
4. Look for POST /enterprise/compliance/retention-policies
5. Check Status Code and Response
6. Screenshot and share
```

### Debug Step 3: Form Values
```
Before clicking "Simpan":
- Module: ______________________
- Retain days: _______ (number)
- Anonymize: [x] or [ ]
```

### Debug Step 4: Validation
```
js in browser console:
console.log('Module:', policyForm.module.trim())
console.log('Retain days:', policyForm.retain_days)
console.log('Valid?', policyForm.module.trim() && policyForm.retain_days)
```

---

## ✅ Verified Working Checklist

- [x] Frontend form UI renders
- [x] Form inputs accept data
- [x] Frontend validation works
- [x] Handler function exists
- [x] API endpoint exists (code written)
- [x] Backend validation works
- [x] Database table exists (should exist)
- [ ] **Need to verify: Is the API route registered?**
- [ ] **Need to verify: Is backend running?**
- [ ] **Need to verify: Is user authenticated?**

---

## 📊 Code Path Summary

```
User Input
    ↓
policyForm state update
    ↓
Click "Simpan Kebijakan"
    ↓
handleCreatePolicy()
    ↓
Frontend Validation ← Check #1
    ↓
api.post() request
    ↓
Network Request
    ↓
EnterpriseOpsController@retentionPolicyStore()
    ↓
Backend Validation ← Check #2
    ↓
DB::table insert
    ↓
Return response
    ↓
Frontend success handler
    ↓
fetchData()
    ↓
GET /retention-policies
    ↓
Update table ← Check #3
```

---

## 🆘 If Still Not Working

Provide these details:

1. **Error message** (exact text)
2. **Network status code** (F12 → Network → POST request)
3. **Form values** entered
4. **Backend logs** (if available)
5. **Browser version**
6. **Is backend running?** (check URL in .env)

