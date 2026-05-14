const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\raulm\\Downloads\\hris-frontend';
const PAGES = path.join(BASE, 'src', 'pages');

// Pre-built modifications for every file that needs pagination params + setTotalPages
const modifications = [
  // === LEAVE PAGES ===
  {
    file: 'leave/LeaveApprovalPage.tsx',
    oldCall: `const result = await getPendingLeaves();`,
    newCall: `const result = await getPendingLeaves(currentPage, pageSize);`,
    afterLine: `setLeaves(result.items);`,
    insertLine: `      setTotalPages(result.totalPages);`,
    deps: null,
  },
  {
    file: 'leave/LeaveRequestsPage.tsx',
    oldCall: `const result = await getAllLeaves();`,
    newCall: `const result = await getAllLeaves(currentPage, perPage);`,
    afterLine: `setLeaves(result.items);`,
    insertLine: `      setTotalPages(result.totalPages);`,
    deps: null,
  },

  // === REIMBURSEMENT PAGES ===
  {
    file: 'reimbursements/ReimbursementsManagementPage.tsx',
    oldCall: `const result = await getAllReimbursements();`,
    newCall: `const result = await getAllReimbursements({ page: currentPage, per_page: pageSize });`,
    afterLine: `setItems(result.items);`,
    insertLine: `      setTotalPages(result.totalPages);`,
    deps: null,
  },
  {
    file: 'reimbursements/ReimbursementApprovalPage.tsx',
    oldCall: `const result = await getAllReimbursements();`,
    newCall: `const result = await getAllReimbursements({ page: currentPage, per_page: pageSize });`,
    afterLine: `setItems(result.items);`,
    insertLine: `      setTotalPages(result.totalPages);`,
    deps: null,
  },
  {
    file: 'admin/AdminReimbursementsPage.tsx',
    oldCall: `getAllReimbursements({}),`,
    newCall: `getAllReimbursements({ page: currentPage, per_page: pageSize }),`,
    afterLine: `setItems(deptResult.items);`,
    insertLine: `      setTotalPages(deptResult.totalPages);`,
    deps: null,
  },

  // === ESS PAGES ===
  {
    file: 'ess/MyReimbursementsPage.tsx',
    oldCall: `const reimbData = await getMyReimbursements();`,
    newCall: `const reimbData = await getMyReimbursements('', currentPage, pageSize);`,
    afterLine: `setItems(reimbData.items);`,
    insertLine: `        setTotalPages(reimbData.totalPages);`,
    deps: null,
  },
  {
    file: 'ess/MyPayrollPage.tsx',
    oldCall: `const result = await getMyPayroll();`,
    newCall: `const result = await getMyPayroll(currentPage, pageSize);`,
    afterLine: `setItems(result.items);`,
    insertLine: `      setTotalPages(result.totalPages);`,
    deps: null,
  },
  {
    file: 'ess/MyKpiPage.tsx',
    oldCall: `const response = await getMyKpiPeriods();`,
    newCall: `const response = await getMyKpiPeriods(currentPage, pageSize);`,
    afterLine: `setPeriods(response.items);`,
    insertLine: `      setTotalPages(response.totalPages);`,
    deps: null,
  },

  // === PAYROLL PAGES ===
  {
    file: 'payroll/PayrollManagementPage.tsx',
    oldCall: `const result = await getAllPayroll();`,
    newCall: `const result = await getAllPayroll({ page: currentPage, per_page: pageSize });`,
    afterLine: `setItems(toSafeArray(result));`,
    insertLine: `      setTotalPages(result?.data?.last_page ?? 1);`,
    deps: null,
  },
  {
    file: 'payroll/PayrollGeneratePage.tsx',
    oldCall: `const result = await getAllPayroll();`,
    newCall: `const result = await getAllPayroll({ page: currentPage, per_page: itemsPerPage });`,
    afterLine: `setItems(toSafeArray(result));`,
    insertLine: `      setTotalPages(result?.data?.last_page ?? 1);`,
    deps: null,
  },
];

// Apply modifications
console.log('=== Applying page data-fetch modifications ===');
let count = 0;
for (const mod of modifications) {
  const fullPath = path.join(PAGES, mod.file);
  if (!fs.existsSync(fullPath)) {
    console.log(`  ✗ Not found: ${mod.file}`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf-8');
  let changed = false;

  // 1. Update function call
  if (content.includes(mod.oldCall)) {
    if (!content.includes(mod.newCall)) {
      content = content.replace(mod.oldCall, mod.newCall);
      changed = true;
      count++;
    }
  } else {
    console.log(`  ⚠ Old call not found in ${mod.file}`);
    continue;
  }

  // 2. Insert setTotalPages right after the designated line
  if (mod.insertLine && !content.includes(mod.insertLine)) {
    const afterIndex = content.indexOf(mod.afterLine);
    if (afterIndex !== -1) {
      const insertPos = afterIndex + mod.afterLine.length;
      content = content.slice(0, insertPos) + '\n' + mod.insertLine + content.slice(insertPos);
      changed = true;
      count++;
    }
  }

  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`  ✓ ${mod.file}`);
  } else {
    console.log(`  ~ ${mod.file} (no changes)`);
  }
}
console.log(`\nTotal modifications: ${count}`);

// ===================================================================
// PHASE 2: Handle services that return response.data (not {items,totalPages})
// These need: setTotalPages(response.data?.data?.last_page ?? 1)
// ===================================================================
console.log('\n=== Phase 2: Services returning response.data ===');

const responseDataMods = [
  // assetService.getAssets() → response.data = { success, data: { data: [...], last_page } }
  {
    file: 'admin/AssetManagementPage.tsx',
    target: 'assetService.getAssets', 
    afterSet: 'setAssets(data?.data?.data || []);',
    insertLine: `      setTotalPages(data?.data?.last_page ?? 1);`,
  },
  {
    file: 'admin/AssetInventoryPage.tsx',
    target: 'assetService.getAssets',
    afterSet: 'setAssets(data?.data?.data || []);',
    insertLine: `      setTotalPages(data?.data?.last_page ?? 1);`,
  },
  // assetService.getAssignments() → response.data = { success, data: { data: [...], last_page } }
  {
    file: 'admin/AssetManagementPage.tsx',
    target: 'assetService.getAssignments',
    afterSet: 'setAssignments(data?.data?.data || []);',
    insertLine: `      setTotalPages(data?.data?.last_page ?? 1);`,
  },
  {
    file: 'admin/AssetAssignmentsPage.tsx',
    target: 'assetService.getAssignments',
    afterSet: 'setAssignments(data?.data?.data || []);',
    insertLine: `      setTotalPages(data?.data?.last_page ?? 1);`,
  },
  // trainingService.getEnrollments() → response.data
  {
    file: 'admin/TrainingEnrollmentsPage.tsx',
    target: 'trainingService.getEnrollments',
    afterSet: 'setEnrollments(data?.data?.data || []);',
    insertLine: `      setTotalPages(data?.data?.last_page ?? 1);`,
  },
  {
    file: 'ess/MyTrainingsPage.tsx',
    target: 'trainingService.getMyTrainings',
    afterSet: 'setItems(data?.data?.data || []);',
    insertLine: `      setTotalPages(data?.data?.last_page ?? 1);`,
  },
  // promotionService.getPromotions() → axios response (response.data = { success, data: { data: [...], last_page } })
  {
    file: 'admin/PromotionPage.tsx',
    target: 'promotionService.getPromotions',
    afterSet: 'setItems(response.data?.data?.data || []);',
    insertLine: `      setTotalPages(response.data?.data?.last_page ?? 1);`,
  },
  {
    file: 'ess/MyPromotionsPage.tsx',
    target: 'promotionService.getMyPromotions',
    afterSet: 'setItems(response.data?.data?.data || []);',
    insertLine: `      setTotalPages(response.data?.data?.last_page ?? 1);`,
  },
  // documentService.getMyDocuments() → response.data
  {
    file: 'ess/MyDocumentsPage.tsx',
    target: 'documentService.getMyDocuments',
    afterSet: 'setItems(response.data?.data?.data || []);',
    insertLine: `      setTotalPages(response.data?.data?.last_page ?? 1);`,
  },
  // payrollService.getPayrollList() → response.data
  {
    file: 'payroll/PayrollListPage.tsx',
    target: 'payrollService.getPayrollList',
    afterSet: 'setItems(data?.data?.data || []);',
    insertLine: `      setTotalPages(data?.data?.last_page ?? 1);`,
  },
  {
    file: 'payroll/PayrollProcessPage.tsx',
    target: 'payrollService.getPayrollList',
    afterSet: 'setItems(toSafeArray(await payrollService.getPayrollList()));',
    insertLine: `      const payrollResp = await payrollService.getPayrollList({ page: currentPage, per_page: pageSize });`,
    extraBefore: null,
  },
  {
    file: 'payroll/PayrollCrudPage.tsx',
    target: 'payrollService.getPayrollList',
    afterSet: 'setPayrolls(data?.data?.data || []);',
    insertLine: `      setTotalPages(data?.data?.last_page ?? 1);`,
  },
  {
    file: 'payroll/PayrollPaymentPage.tsx',
    target: 'payrollService.getPayrollList',
    afterSet: 'setPayrolls(data?.data?.data || []);',
    insertLine: `      setTotalPages(data?.data?.last_page ?? 1);`,
  },
  {
    file: 'payroll/PayrollTaxPage.tsx',
    target: 'payrollService.getPayrollList',
    afterSet: 'setItems(data?.data?.data || []);',
    insertLine: `      setTotalPages(data?.data?.last_page ?? 1);`,
  },
  {
    file: 'payroll/PayrollReportsPage.tsx',
    target: 'payrollService.getPayrollList',
    afterSet: 'setItems(data?.data?.data || []);',
    insertLine: `      setTotalPages(data?.data?.last_page ?? 1);`,
  },
  {
    file: 'payroll/PayrollReportsDetailedPage.tsx',
    target: 'payrollService.getPayrollList',
    afterSet: 'setItems(data?.data?.data || []);',
    insertLine: `      setTotalPages(data?.data?.last_page ?? 1);`,
  },
  // attendanceService.getHistory() → { items, totalPages, raw }
  {
    file: 'attendance/AttendanceHistoryPage.tsx',
    target: 'attendanceService.getHistory',
    afterSet: 'setItems(result.items);',
    insertLine: `      setTotalPages(result.totalPages);`,
  },
  // workforceService.getShiftSwaps() → { items, totalPages, raw }
  {
    file: 'admin/ShiftSwapsPage.tsx',
    target: 'workforceService.getShiftSwaps',
    afterSet: 'setSwaps(data.items);',
    insertLine: `      setTotalPages(data.totalPages);`,
  },
  // workforceService.getHolidays() → { items, totalPages, raw }
  {
    file: 'admin/HolidayCalendarPage.tsx',
    target: 'workforceService.getHolidays',
    afterSet: 'setHolidays(data.items);',
    insertLine: `      setTotalPages(data.totalPages);`,
  },
  // workforceService.getOvertimeRules() → { items, totalPages, raw }
  {
    file: 'admin/OvertimeRulesPage.tsx',
    target: 'workforceService.getOvertimeRules',
    afterSet: 'setRules(data.items);',
    insertLine: `      setTotalPages(data.totalPages);`,
  },
  // workforceService.getComplianceDocuments() → { items, totalPages, raw }
  {
    file: 'admin/ComplianceDashboardPage.tsx',
    target: 'workforceService.getComplianceDocuments',
    afterSet: 'setDocuments(docsData.items);',
    insertLine: `      setTotalPages(docsData.totalPages);`,
  },
  // admin.service getAllUsers() → { items, totalPages, raw }
  {
    file: 'admin/AdminUsersPage.tsx',
    target: 'getAllUsers(',
    afterSet: 'setUsers(result.items);',
    insertLine: `      setTotalPages(result.totalPages);`,
  },
  {
    file: 'admin/AdminRolesPage.tsx',
    target: 'getAllRoles(',
    afterSet: 'setRoles(result.items);',
    insertLine: `      setTotalPages(result.totalPages);`,
  },
  {
    file: 'admin/AdminPermissionsPage.tsx',
    target: 'getAllPermissions(',
    afterSet: 'setPermissions(result.items);',
    insertLine: `      setTotalPages(result.totalPages);`,
  },
];

for (const mod of responseDataMods) {
  const fullPath = path.join(PAGES, mod.file);
  if (!fs.existsSync(fullPath)) {
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf-8');
  if (content.includes(mod.insertLine)) {
    continue;
  }
  const afterIndex = content.indexOf(mod.afterSet);
  if (afterIndex !== -1) {
    const insertPos = afterIndex + mod.afterSet.length;
    content = content.slice(0, insertPos) + '\n' + mod.insertLine + content.slice(insertPos);
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`  ✓ ${mod.file} + totalPages`);
    count++;
  } else {
    console.log(`  ⚠ afterSet not found in ${mod.file}: "${mod.afterSet.substring(0, 50)}..."`);
  }
}

console.log(`\nTotal modifications: ${count}`);
