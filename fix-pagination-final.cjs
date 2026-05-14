const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\raulm\\Downloads\\hris-frontend';
const PAGES = path.join(BASE, 'src', 'pages');

// Check current state of totalPages variables
function checkState() {
  const pagesDir = PAGES;
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.tsx')) {
        let content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('useState(1);') && 
            (content.includes('setTotalPages') || content.includes('set_totalPages') || content.includes('setTotalPages'))) {
          const rel = path.relative(BASE, fullPath);
          // Check if setTotalPages is called in data fetching
          if (!content.includes('setTotalPages(') || content.match(/setTotalPages\(/g)?.length <= 1) {
            console.log(`${rel}: totalPages state defined but only in useState init`);
          }
        }
      }
    }
  }
  walk(pagesDir);
}

console.log('=== Checking files that need setTotalPages in data fetch ===');
checkState();
console.log('\n=== Now adding pagination params to API calls ===');

// Process files by category
const fileMap = {
  // Pattern: const result = await getXxx(); setXxx(result.items);
  'leave/LeaveApprovalPage.tsx': {
    calls: [
      { old: `const result = await getPendingLeaves();`, new: `const result = await getPendingLeaves(currentPage, pageSize);` }
    ],
    setTotal: { after: `setLeaves(result.items);`, line: `    setTotalPages(result.totalPages);` }
  },
  'leave/LeaveRequestsPage.tsx': {
    calls: [
      { old: `const result = await getAllLeaves();`, new: `const result = await getAllLeaves(currentPage, perPage);` }
    ],
    setTotal: { after: `setLeaves(result.items);`, line: `    setTotalPages(result.totalPages);` }
  },
  'ess/MyReimbursementsPage.tsx': {
    calls: [
      { old: `const reimbData = await getMyReimbursements();`, new: `const reimbData = await getMyReimbursements('', currentPage, pageSize);` }
    ],
    setTotal: { after: `setItems(reimbData.items);`, line: `        setTotalPages(reimbData.totalPages);` }
  },
  'ess/MyPayrollPage.tsx': {
    calls: [
      { old: `const result = await getMyPayroll();`, new: `const result = await getMyPayroll(currentPage, pageSize);` }
    ],
    setTotal: { after: `setItems(result.items);`, line: `      setTotalPages(result.totalPages);` }
  },
  'ess/MyKpiPage.tsx': {
    calls: [
      { old: `const response = await getMyKpiPeriods();`, new: `const response = await getMyKpiPeriods(currentPage, pageSize);` }
    ],
    setTotal: { after: `setPeriods(response.items);`, line: `      setTotalPages(response.totalPages);` }
  },
  'reimbursements/ReimbursementsManagementPage.tsx': {
    calls: [
      { old: `const result = await getAllReimbursements();`, new: `const result = await getAllReimbursements({ page: currentPage, per_page: pageSize });` }
    ],
    setTotal: { after: `setItems(result.items);`, line: `      setTotalPages(result.totalPages);` }
  },
  'reimbursements/ReimbursementApprovalPage.tsx': {
    calls: [
      { old: `const result = await getAllReimbursements();`, new: `const result = await getAllReimbursements({ page: currentPage, per_page: pageSize });` }
    ],
    setTotal: { after: `setItems(result.items);`, line: `      setTotalPages(result.totalPages);` }
  },
  'payroll/PayrollManagementPage.tsx': {
    calls: [
      { old: `const result = await getAllPayroll();`, new: `const result = await getAllPayroll({ page: currentPage, per_page: pageSize });` }
    ],
    setTotal: { after: `setItems(toSafeArray(result));`, line: `      setTotalPages(result?.data?.last_page ?? 1);` }
  },
};

let totalMods = 0;
for (const [relPath, mods] of Object.entries(fileMap)) {
  const fullPath = path.join(BASE, 'src', 'pages', relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`  ✗ Not found: ${relPath}`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf-8');
  let fileChanged = false;

  // Apply function call changes
  for (const call of mods.calls) {
    if (content.includes(call.old) && !content.includes(call.new)) {
      content = content.replace(call.old, call.new);
      fileChanged = true;
      totalMods++;
    }
  }

  // Apply setTotalPages insertion
  if (mods.setTotal) {
    const insertAfter = mods.setTotal.after;
    const insertLine = mods.setTotal.line;
    if (content.includes(insertAfter) && !content.includes(insertLine)) {
      content = content.replace(insertAfter, insertAfter + '\n' + insertLine);
      fileChanged = true;
      totalMods++;
    }
  }

  if (fileChanged) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`  ✓ ${relPath}`);
  } else {
    console.log(`  ~ ${relPath} (no changes needed)`);
  }
}

console.log(`\nTotal modifications: ${totalMods}`);
console.log('\nDone. Files that still need manual attention can be checked with tsc.');
