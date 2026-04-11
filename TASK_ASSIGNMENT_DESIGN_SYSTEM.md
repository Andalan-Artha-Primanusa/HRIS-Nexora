# 🎯 SENIOR FRONTEND ENGINEER - TASK ASSIGNMENT
## HRIS Unified Design System Implementation

**Assigned to**: Senior Frontend Engineer (10+ years experience)  
**Project**: Unified White + Blue Clean Design System  
**Timeline**: 4 weeks (30 days)  
**Priority**: CRITICAL  
**Date**: April 11, 2026

---

## 📌 PROJECT CONTEXT

We are implementing a **unified design system** across the entire HRIS application. The goal is to make all UI elements synchronized, professional, and maintainable with:
- Single source of truth for colors (#2563eb primary blue)
- Reusable component library
- Consistent spacing (8px grid)
- Professional white backgrounds with blue accents
- Mobile-responsive design
- Zero technical debt

---

## ✅ COMPLETED WORK (Phase 1 - DONE)

The following deliverables are **READY** in the codebase:

### 1. **Design Tokens File**
- **File**: `src/shared/styles/design-tokens.css`
- **Status**: ✓ Production Ready
- **Contains**: 
  - 50+ CSS variables for colors, spacing, shadows
  - Typography system (sizes, weights, line-heights)
  - Component-specific tokens (button, input, table, etc.)
  - Responsive breakpoints
  - Z-index scale
  - Accessibility features

### 2. **Global Styles File**
- **File**: `src/shared/styles/global.css`
- **Status**: ✓ Production Ready
- **Contains**:
  - Base resets using design tokens
  - Typography hierarchy (h1-h6, body, small)
  - Form styles (inputs, buttons, labels)
  - Table styles with design token values
  - Utility classes
  - Responsive adjustments
  - Print styles
  - Accessibility enhancements

### 3. **Integration**
- **File**: `src/index.css`
- **Status**: ✓ Imports configured
- **Already imported**: design-tokens.css, global.css

**👉 START HERE - Task 1**

---

## 📋 PHASE 2: REUSABLE COMPONENT LIBRARY

### TASK 1: Create Table Component
**File**: `src/shared/ui/Table/` (new)  
**Priority**: CRITICAL (used in 15+ pages)  
**Complexity**: Medium  
**Time Estimate**: 4 hours

**Acceptance Criteria**:
- [ ] Export `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>`
- [ ] Header uses `var(--table-header-bg)` (#2563eb) with white text
- [ ] Row height: 48px (using `var(--table-row-height)`)
- [ ] Hover state: Light blue background (#f0f9ff)
- [ ] Borders from design tokens
- [ ] TypeScript strict mode (Props interface)
- [ ] Sortable column support (click → arrow icon change)
- [ ] Selection checkboxes (optional)
- [ ] Responsive (horizontal scroll on mobile < 768px)
- [ ] Export from `src/shared/ui/index.ts`

**Usage Pattern**:
```tsx
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/shared/ui';

<Table>
  <TableHeader>
    <TableRow>
      <TableCell>Name</TableCell>
      <TableCell>Email</TableCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Reference Files**:
- `src/pages/payroll/PayrollListPage.tsx` - Has existing table structure
- `src/pages/admin/AdminUsersPage.tsx` - Another table implementation

---

### TASK 2: Create Card Component
**File**: `src/shared/ui/Card/` (new)  
**Priority**: HIGH (used in dashboards)  
**Complexity**: Easy  
**Time Estimate**: 1 hour

**Acceptance Criteria**:
- [ ] Export `<Card>`, `<CardHeader>`, `<CardBody>`, `<CardFooter>`
- [ ] Background: white from `var(--color-white)`
- [ ] Border: use `var(--card-border)`
- [ ] Shadow: use `var(--card-shadow)` with hover effect
- [ ] Border-radius: `var(--radius-md)` (8px)
- [ ] Padding: `var(--card-padding)` (16px)
- [ ] TypeScript props interface
- [ ] Optional className override

**Usage Pattern**:
```tsx
import { Card, CardHeader, CardBody } from '@/shared/ui';

<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardBody>
    <p>Content here</p>
  </CardBody>
</Card>
```

---

### TASK 3: Create Badge Component
**File**: `src/shared/ui/Badge/` (new)  
**Priority**: MEDIUM (status indicators)  
**Complexity**: Easy  
**Time Estimate**: 1 hour

**Acceptance Criteria**:
- [ ] Props: `variant` ('success' | 'error' | 'warning' | 'info' | 'primary')
- [ ] Props: `size` ('sm' | 'md' | 'lg')
- [ ] Colors aligned to design tokens
- [ ] Padding: `--space-1` vertical, `--space-2` horizontal
- [ ] Font-size: `var(--font-size-xs)`
- [ ] Border-radius: `var(--radius-sm)` (4px)

**Usage Pattern**:
```tsx
<Badge variant="success">Approved</Badge>
<Badge variant="error">Rejected</Badge>
<Badge variant="warning">Pending</Badge>
```

---

### TASK 4: Create Pagination Component
**File**: `src/shared/ui/Pagination/` (new)  
**Priority**: HIGH (all list pages)  
**Complexity**: Medium  
**Time Estimate**: 2 hours

**Acceptance Criteria**:
- [ ] Props: `currentPage`, `totalPages`, `onPageChange`
- [ ] Display: "1 2 3 ... 10" (with ellipsis for large ranges)
- [ ] Active button: blue background `var(--color-primary)`
- [ ] Prev/Next buttons with disabled states
- [ ] Responsive (hide page numbers on mobile, show prev/next)
- [ ] Show "Page X of Y" on mobile

---

### TASK 5: Create Dropdown/Select Component
**File**: `src/shared/ui/Dropdown/` (new)  
**Priority**: HIGH (filters, selections)  
**Complexity**: Medium  
**Time Estimate**: 2 hours

**Acceptance Criteria**:
- [ ] Props: `options`, `value`, `onChange`, `placeholder`
- [ ] Styled input with chevron icon from design tokens
- [ ] Dropdown options with hover state (light blue)
- [ ] Keyboard navigation (arrow keys, enter)
- [ ] Click outside → close
- [ ] Accessible (proper ARIA labels, roles)

---

### TASK 6: Create Alert Component
**File**: `src/shared/ui/Alert/` (new)  
**Priority**: MEDIUM (error messages)  
**Complexity**: Easy  
**Time Estimate**: 1 hour

**Acceptance Criteria**:
- [ ] Props: `type` ('success' | 'error' | 'warning' | 'info')
- [ ] Colored bg from design tokens
- [ ] Icon before text (use lucide-react)
- [ ] Optional close button
- [ ] Padding, border-radius from design tokens

---

### TASK 7: Create Skeleton Component
**File**: `src/shared/ui/Skeleton/` (new)  
**Priority**: LOW (loading states)  
**Complexity**: Easy  
**Time Estimate**: 1 hour

**Acceptance Criteria**:
- [ ] Gray background with pulse animation
- [ ] Props: `width`, `height`, `className`
- [ ] Reduced motion preference respect (disable animation)

---

## 📋 PHASE 3: PAGE STANDARDIZATION

### TASK 8: Create Page Layout Template
**File**: `src/shared/layouts/PageLayout.tsx` (new)  
**Priority**: HIGH  
**Complexity**: Medium  
**Time Estimate**: 2 hours

**Template Structure**:
```tsx
<PageLayout
  title="Page Title"
  breadcrumbs={[...]}
  actions={<CreateButton />}
>
  <PageContent>
    {/* Table or Grid */}
  </PageContent>
  <PageFooter>
    {/* Pagination */}
  </PageFooter>
</PageLayout>
```

**Components to Create**:
- `<PageLayout>` - Container
- `<PageHeader>` - Title + Breadcrumb
- `<PageActions>` - Buttons area
- `<PageContent>` - Main content
- `<PageFooter>` - Pagination area

---

### TASK 9: Standardize Button Styling
**File**: `src/shared/ui/Button/` (refactor)  
**Priority**: CRITICAL  
**Complexity**: Medium  
**Time Estimate**: 3 hours

**Current Issue**: Buttons have hardcoded styles scattered across files

**Acceptance Criteria**:
- [ ] Create unified `<Button>` component (if not exists)
- [ ] Props: `variant` ('primary' | 'secondary' | 'success' | 'error' | 'warning')
- [ ] Props: `size` ('sm' | 'md' | 'lg')
- [ ] Props: `loading` (boolean - shows spinner)
- [ ] Props: `disabled` (boolean)
- [ ] All colors from design tokens
- [ ] All sizes from `var(--button-height-*)`
- [ ] Check existing usage in 20+ files:
  - `src/pages/admin/*.tsx`
  - `src/pages/payroll/*.tsx`
  - `src/pages/leave/*.tsx`
- [ ] Replace hardcoded `style={{}}` with `<Button variant="primary">`

**Reference Files**:
- Search for: `className="btn"`, `onClick={`, `<button style`

---

## 📋 PHASE 4: MIGRATE EXISTING PAGES

### TASK 10: Audit Current Colors
**Priority**: HIGH  
**Effort**: 2 hours

**Steps**:
1. Search all `.tsx` files for color values
   - Regex: `#[0-9a-f]{6}|#[0-9a-f]{3}|rgb\(`
2. Create spreadsheet: `COLOR_AUDIT.csv`
   - Format: File | Color | Should Be | Component
3. Find duplicates and non-spec colors
4. **Report findings before proceeding Phase 4**

---

### TASK 11-15: Migrate Admin Pages
**Target Files**: 5 pages in `src/pages/admin/`
- [ ] `AdminUsersPage.tsx`
- [ ] `AdminRolesPage.tsx`
- [ ] `AdminPermissionsPage.tsx`
- [ ] `AdminUserAssignRolesPage.tsx`
- [ ] `AdminRoleAssignPermissionsPage.tsx`

**For Each Page**:
1. Replace table with `<Table>` component
2. Replace buttons with `<Button>` component
3. Update all colors to use `var(--color-*)`
4. Update modal styling to use design tokens
5. Test on mobile (480px) and desktop (1024px)
6. Screenshot before/after for QA

**Time Estimate**: 1 hour per page

---

### TASK 16-20: Migrate Payroll Pages
**Target Files**: 5-7 pages in `src/pages/payroll/`
- [ ] `PayrollListPage.tsx` (priority - complex table)
- [ ] `PayrollDashboard.tsx` (charts)
- [ ] `PayrollCrudPage.tsx`
- [ ] `PayrollApprovePage.tsx`
- [ ] Others as needed

**Time Estimate**: 2 hours per page (more complex)

---

### TASK 21-25: Migrate Leave Pages
**Target Files**: 4-5 pages in `src/pages/leave/`
- [ ] `LeaveRequestsPage.tsx`
- [ ] `LeaveApprovalPage.tsx`
- [ ] `LeaveCalendarPage.tsx`
- Others

**Time Estimate**: 1.5 hours per page

---

## 📋 PHASE 5: CHARTS & VISUALIZATIONS

### TASK 26: Audit Chart Colors
**Files to Check**:
- `src/pages/dashboard/kpi/KpiPage.tsx`
- `src/pages/payroll/PayrollDashboard.tsx`
- Any Recharts implementations

**Acceptance Criteria**:
- [ ] All primary series: `var(--color-primary)` (#2563eb)
- [ ] Grid lines: `#e5e7eb` (very light)
- [ ] Legend: `var(--color-text-primary)`
- [ ] Tooltips: Dark bg with white text
- [ ] Consistent with design spec

**Time Estimate**: 1 hour

---

## 📋 PHASE 6: QA & POLISH

### TASK 27: Visual Regression Testing
**Tools**: Screenshot comparison, manual inspection

**Checklist**:
- [ ] All blues are #2563eb (no variations)
- [ ] All whites are #ffffff
- [ ] All spacing uses 8px grid (measure)
- [ ] All text sizes match spec
- [ ] All shadows match design system
- [ ] Responsive breaks: 480px, 768px, 1024px
- [ ] Color contrast ≥ 4.5:1 (use WebAIM checker)
- [ ] No console errors/warnings

**Time Estimate**: 4 hours

---

### TASK 28: Performance Check
**Items**:
- [ ] CSS bundle size (should not increase > 10%)
- [ ] Page load time < 2s
- [ ] No jank on scroll (60 fps)
- [ ] Mobile performance on real devices

---

### TASK 29: Documentation
**Deliverables**:
- [ ] `DESIGN_SYSTEM.md` (guidelines for future engineers)
- [ ] Component library storybook (optional: vite-plugin-storybook)
- [ ] Color spec document
- [ ] Migration checklist (for other modules)

---

### TASK 30: Final Review
- [ ] Code review by PM/Designer
- [ ] QA sign-off
- [ ] Deploy to staging
- [ ] Final polish based on feedback

---

## 🎓 IMPLEMENTATION PATTERNS

### Pattern 1: Use CSS Variables
❌ **WRONG**:
```tsx
<div style={{ color: '#2563eb', padding: '16px' }}>
```

✅ **CORRECT**:
```tsx
<div style={{ 
  color: 'var(--color-primary)',
  padding: 'var(--padding-md)'
}}>
```

Or in CSS:
```css
.my-class {
  color: var(--color-primary);
  padding: var(--padding-md);
}
```

---

### Pattern 2: Component Imports
❌ **WRONG**:
```tsx
<table>
  <thead>
    <tr>
      <th style={{ backgroundColor: '#2563eb' }}>Header</th>
    </tr>
  </thead>
</table>
```

✅ **CORRECT**:
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableCell>Header</TableCell>
    </TableRow>
  </TableHeader>
</Table>
```

Export from: `src/shared/ui/`

---

### Pattern 3: Spacing Grid
Every spacing should be multiple of 8px:
```
✅ 4px, 8px, 12px, 16px, 20px, 24px, 32px
❌ 5px, 10px, 15px, 17px, 22px
```

Use: `var(--space-1)`, `var(--space-2)`, etc.

---

## 📊 TRACKING & PROGRESS

### Daily Standup (15 min)
- What I completed
- What I'm working on today
- Blockers

### Weekly Review (1 hour)
- Visual inspection
- Code review
- Identify risks

### Metrics
- [ ] Lines of duplicate CSS (target: -50%)
- [ ] Pages migrated (target: 100%)
- [ ] Color spec compliance (target: 100%)
- [ ] Console errors (target: 0)

---

## 🚨 CRITICAL MUST-KNOW

1. **NO HARDCODED COLORS** - Every color must use CSS variable
2. **NO SCATTERING** - Components go in `/shared/ui/`, not in features/pages
3. **TEST MOBILE** - Use real device: 320px, 480px, not just Chrome DevTools
4. **GET FEEDBACK** - Show screenshots after each major page migration
5. **DOCUMENT AS YOU GO** - Future engineers need to understand decisions

---

## 🎯 SUCCESS DEFINITION

### Visual
- ✓ All UI looks professional and clean
- ✓ Consistent blue (#2563eb) throughout
- ✓ Consistent spacing and sizing
- ✓ Beautiful on mobile, tablet, desktop

### Code
- ✓ Reusable components in /shared/ui/
- ✓ Zero hardcoded colors or sizes
- ✓ TypeScript: no `any` types
- ✓ Zero duplicate code

### Testing
- ✓ Works on Chrome, Firefox, Safari
- ✓ Responsive at breakpoints: 320px, 480px, 768px, 1024px
- ✓ Accessibility: WCAG AA (4.5:1 contrast)
- ✓ Performance: <2s page load

### Documentation
- ✓ Design System guidelines written
- ✓ Component library documented
- ✓ Migration checklist completed
- ✓ Future engineer can follow same pattern

---

## 💬 QUESTIONS FOR ENGINEER

Before starting, please clarify:

1. **Scope**: Should we migrate ALL pages or MVP subset?
2. **Testing**: Do we have visual regression test setup?
3. **Breakpoints**: Are these responsive targets sufficient (480px, 768px, 1024px)?
4. **Icons**: Should we use Lucide React for all icons?
5. **Animations**: Any specific animation guidelines?
6. **Dark Mode**: Required or future work?
7. **Storybook**: Should we create component library showcase?
8. **Dependencies**: OK to add packages? (e.g., react-table for complex tables)

---

## 📞 ESCALATION

**Minor Issues** (color tweaks, spacing adjustments):  
→ Slack message to PM

**Design Issues** (component behavior unclear):  
→ Design review meeting (30 min)

**Scope Changes** (new requirements):  
→ Project manager approval required

**Blockers** (dependencies, environment):  
→ Immediate escalation to team lead

---

**Next Steps**:
1. ✅ Review this document
2. ✅ Ask clarifying questions (bullet point above)
3. Ask PM for timeline preferences
4. Start with TASK 1 (Table Component)
5. Daily progress updates

**Approved by**: PM (April 11, 2026)  
**Expected Completion**: May 11, 2026 (30 days)

Good luck! 🚀
