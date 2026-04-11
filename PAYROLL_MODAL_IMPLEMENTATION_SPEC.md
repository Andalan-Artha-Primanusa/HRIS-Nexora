# Payroll Module - Modal Implementation Specification
**Product Owner**: Internal  
**Target Audience**: Senior Frontend Engineer (10+ years TypeScript/React)  
**Priority**: High  
**Scope**: Implement consistent error/success modal system across all payroll pages  
**Status**: In Progress

---

## 1. OVERVIEW

Standardize error handling and user feedback across the Payroll module using a consistent Modal pattern. All payroll pages must implement:
- **Error Modal**: API errors, validation errors, warnings
- **Success Banner**: Inline green alert (no modal needed for success)
- **Status Validation**: Prevent invalid operations before API calls

---

## 2. IMPLEMENTATION PATTERN

### 2.1 Modal Component (Already Available)
**Location**: `src/shared/ui/Modal.tsx`

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

**Usage**:
```typescript
<Modal
  isOpen={errorModal.isOpen}
  onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
  title={errorModal.title}
  size="md"
>
  <div style={{ padding: "16px 0", whiteSpace: "pre-wrap" }}>
    <p style={{ margin: 0, lineHeight: "1.6", color: "#374151" }}>
      {errorModal.message}
    </p>
  </div>
</Modal>
```

### 2.2 State Management Pattern

```typescript
const [errorModal, setErrorModal] = useState({
  isOpen: boolean,
  title: string,      // e.g., "❌ Error", "⚠️ Warning", "Validasi"
  message: string     // Main error/warning message
});

const [successMessage, setSuccessMessage] = useState<{ 
  type: "success" | "error"; 
  text: string 
} | null>(null);

// Helper function
const showErrorModal = (title: string, message: string) => {
  setErrorModal({ isOpen: true, title, message });
};
```

### 2.3 Modal Titles Reference

| Title | Use Case | Icon |
|-------|----------|------|
| `Validasi` | Form validation errors | - |
| `⚠️ [Entity] Sudah Ada` | Duplicate detection | ⚠️ |
| `⚠️ Status Invalid` | Invalid operation for current status | ⚠️ |
| `❌ Error [Action]` | API error (create/update/delete/approve/etc) | ❌ |
| `Error` | Generic/unknown error | ❌ |

---

## 3. PAGES REQUIRING MODAL IMPLEMENTATION

### 3.1 PayrollCrudPage.tsx ✅ DONE
- Lines: ~380 total
- Status: **COMPLETE**
- Features:
  - Error modal for validation, duplicate detection, API errors
  - Success inline banner
  - Modal titles: "Validasi", "⚠️ Payroll Sudah Ada", "❌ Error Membuat Payroll", etc.

**Reference**: See implemented code for pattern

### 3.2 PayrollApprovePage.tsx ✅ DONE  
- Lines: ~380 total
- Status: **COMPLETE**
- Features:
  - Error modal for validation, status checks, API errors
  - Success inline banner
  - Modal titles: "Validasi", "⚠️ Sudah Disetujui", "⚠️ Ditolak", "❌ Error Approve"

**Reference**: See implemented code for pattern

### 3.3 PayrollPaymentPage.tsx 🔄 TODO
- Lines: ~280 total
- Status: **NEEDS MODAL**
- Required Modals:
  - `showErrorModal("Validasi", "Masukkan Payroll ID terlebih dahulu")`
  - `showErrorModal("⚠️ Sudah Dibayar", "Payroll ini sudah ditandai sebagai dibayar pada [date]")`
  - `showErrorModal("❌ Error Tandai Dibayar", errorText)`

**Implementation Notes**:
- Replace inline error card alerts with modals
- Keep success banner inline
- Validate payroll selection before API call

### 3.4 PayrollGeneratePage.tsx 🔄 TODO
- Lines: ~200 total
- Status: **NEEDS MODAL**
- Required Modals:
  - `showErrorModal("Validasi", "Pilih periode terlebih dahulu")`
  - `showErrorModal("⚠️ Generate Konfirmasi", "Kami akan generate payroll untuk X karyawan di periode [period]. Lanjutkan?")`
  - `showErrorModal("❌ Error Generate", errorText)`

**Implementation Notes**:
- Add confirmation modal before generate (since it affects multiple records)
- Show progress feedback if API takes > 2 seconds
- Show summary: "Generated payroll for 15 employees"

### 3.5 PayrollDetailsPage.tsx 🔄 TODO
- Lines: ~240 total
- Status: **NEEDS MODAL**
- Required Modals:
  - `showErrorModal("Validasi", "Masukkan Payroll ID terlebih dahulu")`
  - `showErrorModal("❌ Error Tambah Detail", errorText)`
  - `showErrorModal("❌ Error Update Detail", errorText)`
  - `showErrorModal("❌ Error Hapus Detail", errorText)`

**Implementation Notes**:
- Add delete confirmation modal: "Apakah Anda yakin ingin menghapus detail ini?"
- Show error details for bulk operations

### 3.6 PayrollManagementPage.tsx 🔄 TODO
- Lines: ~160 total
- Status: **NEEDS MODAL**
- Required Modals:
  - `showErrorModal("❌ Error Load Data", errorText)`
  - `showErrorModal("⚠️ Filter Error", "Pilih periode atau status terlebih dahulu")`

**Implementation Notes**:
- Minimal modal needed - mostly dashboard display
- Focus on data load errors only

### 3.7 PayrollListPage.tsx 🔄 TODO
- Lines: ~480 total
- Status: **NEEDS MODAL**
- Required Modals:
  - `showErrorModal("❌ Error Load Data", errorText)`
  - Optional: Click-to-detail modal with full payroll breakdown

**Implementation Notes**:
- Keep minimal - mostly list display
- Error modal only for data load issues
- Success: inline banner after any actions

### 3.8 PayrollDashboard.tsx 🔄 TODO
- Lines: ~320 total
- Status: **NEEDS MODAL**
- Required Modals:
  - `showErrorModal("❌ Error Load Dashboard", errorText)`

**Implementation Notes**:
- Minimal modal usage
- Focus on data load errors
- Dashboard should gracefully handle partial load failures

---

## 4. IMPLEMENTATION CHECKLIST

### For Each Page:

- [ ] Import Modal component: `import { Modal } from "@/shared/ui/Modal";`
- [ ] Add error modal state:
  ```typescript
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: "",
    message: ""
  });
  ```
- [ ] Add helper function:
  ```typescript
  const showErrorModal = (title: string, message: string) => {
    setErrorModal({ isOpen: true, title, message });
  };
  ```
- [ ] Add Modal component to JSX (before main content):
  ```typescript
  <Modal
    isOpen={errorModal.isOpen}
    onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
    title={errorModal.title}
    size="md"
  >
    <div style={{ padding: "16px 0", whiteSpace: "pre-wrap" }}>
      <p style={{ margin: 0, lineHeight: "1.6", color: "#374151" }}>
        {errorModal.message}
      </p>
    </div>
  </Modal>
  ```
- [ ] Replace all `setMessage({ type: "error", ... })` with `showErrorModal(title, message)`
- [ ] Remove inline error alert cards (keep success inline)
- [ ] Test modal display with various error messages
- [ ] Verify TypeScript types are correct
- [ ] Check no console errors

---

## 5. KEY PATTERNS TO FOLLOW

### 5.1 Validation Errors
```typescript
if (!selectedPayroll) {
  showErrorModal("Validasi", "Pilih payroll terlebih dahulu");
  return;
}
```

### 5.2 Status Validation Errors
```typescript
if (selectedPayroll.status === "paid") {
  showErrorModal(
    "⚠️ Sudah Dibayar",
    `Payroll ini sudah dibayarkan pada ${selectedPayroll.paid_at}.\nTidak perlu ditandai lagi.`
  );
  return;
}
```

### 5.3 API Error Handling
```typescript
try {
  await approvePayroll(id);
  setMessage({ type: "success", text: "✓ Berhasil disetujui" });
} catch (error) {
  const errorText = error instanceof Error ? error.message : "Error tidak diketahui";
  showErrorModal("❌ Error Approve", errorText);
}
```

### 5.4 Confirmation Modal (Optional)
```typescript
if (!window.confirm("Apakah Anda yakin?")) {
  return; // Keep native confirm for now, can replace with custom modal later
}
```

---

## 6. STYLING GUIDELINES

### Modal Content Formatting
```typescript
<div style={{ padding: "16px 0", whiteSpace: "pre-wrap" }}>
  <p style={{ margin: 0, lineHeight: "1.6", color: "#374151" }}>
    {errorModal.message}
  </p>
</div>
```

**Use `whiteSpace: "pre-wrap"` to preserve line breaks in messages**

### Success Banner (Keep Inline)
```typescript
{message?.type === "success" && (
  <Card glass style={{ backgroundColor: "#dbeafe", borderLeft: "4px solid #0284c7" }}>
    <p style={{ color: "#0c4a6e", margin: 0 }}>{message.text}</p>
  </Card>
)}
```

---

## 7. ERROR MESSAGE GUIDELINES

**Clear & Actionable**:
```
// BAD
"Error occurred"

// GOOD
"Payroll untuk periode 2026-04 sudah ada (ID: 1). Silakan edit atau gunakan periode berbeda."
```

**Include Context**:
```typescript
showErrorModal(
  "⚠️ Payroll Sudah Ada",
  `Payroll untuk periode ${existingPayroll.period} sudah ada.\n\nGaji Pokok: Rp ${Number(existingPayroll.basic_salary).toLocaleString("id-ID")}\nStatus: ${existingPayroll.status}\n\nKlik Edit di tabel atau pilih periode berbeda.`
);
```

**Multi-line with Newlines**:
```typescript
showErrorModal(
  "⚠️ Status Invalid",
  `Payroll ini memiliki status "rejected".\n\nHubungi admin untuk reset status sebelum approve.`
);
```

---

## 8. TESTING CHECKLIST

- [ ] Modal displays correctly (not cut off, centered)
- [ ] Close button works (X icon)
- [ ] Clicking overlay closes modal
- [ ] Multi-line messages display properly (no truncation)
- [ ] Title icon/emoji displays correctly
- [ ] Modal size=md is appropriate for all messages
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Success banner still appears inline
- [ ] Form remains populated after modal close

---

## 9. PRIORITY EXECUTION ORDER

1. **Phase 1 (DONE)**:
   - [x] PayrollCrudPage.tsx
   - [x] PayrollApprovePage.tsx

2. **Phase 2 (TODO)**:
   - [ ] PayrollPaymentPage.tsx
   - [ ] PayrollGeneratePage.tsx
   - [ ] PayrollDetailsPage.tsx

3. **Phase 3 (TODO)**:
   - [ ] PayrollManagementPage.tsx
   - [ ] PayrollListPage.tsx
   - [ ] PayrollDashboard.tsx

**Estimated Time**: 
- Phase 2: 2-3 hours
- Phase 3: 1-2 hours

---

## 10. FILES TO MODIFY

```
src/pages/payroll/
├── PayrollCrudPage.tsx ✅
├── PayrollApprovePage.tsx ✅
├── PayrollPaymentPage.tsx 🔄
├── PayrollGeneratePage.tsx 🔄
├── PayrollDetailsPage.tsx 🔄
├── PayrollManagementPage.tsx 🔄
├── PayrollListPage.tsx 🔄
└── PayrollDashboard.tsx 🔄
```

---

## 11. REFERENCE IMPLEMENTATIONS

### Complete Pattern (PayrollCrudPage.tsx)
See lines 1-50 for imports and state setup
See lines 60-80 for `showErrorModal` function
See lines 100-150 for Modal component JSX
See lines 200+ for error handling usage

---

## 12. NOTES FOR ENGINEER

- This is straightforward refactoring - replace error cards with modals
- No complex logic changes, purely UI/UX improvement
- All TypeScript types are already defined
- No new dependencies needed
- Each page should take 15-30 minutes
- Use find-replace efficiently: replace all `setMessage({ type: "error"` with `showErrorModal(`
- Test incrementally - one page at a time
- Run TypeScript check after each page: `npm run build`

---

**Prepared by**: Product Owner  
**Date**: April 11, 2026  
**Version**: 1.0
