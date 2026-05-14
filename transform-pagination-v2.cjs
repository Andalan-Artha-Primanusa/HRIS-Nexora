const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\raulm\\Downloads\\hris-frontend';

// ================================================================
// SERVICE MODIFICATIONS
// ================================================================

const serviceChanges = [
  // leave.service.ts — getAllLeaves, getPendingLeaves, getLeaveRequests
  {
    file: 'src/features/leave/api/leave.service.ts',
    changes: [
      {
        old: `export const getAllLeaves = async () => {
  const response = await api.get("/leaves");
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};`,
        new: `export const getAllLeaves = async (page = 1, perPage = 10) => {
  const response = await api.get("/leaves", { params: { page, per_page: perPage } });
  const raw = response.data;
  return {
    items: extractArrayPayload(raw),
    totalPages: raw?.data?.last_page ?? 1,
    raw,
  };
};`
      },
      {
        old: `export const getPendingLeaves = async () => {
  const response = await api.get("/leaves/pending");
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};`,
        new: `export const getPendingLeaves = async (page = 1, perPage = 10) => {
  const response = await api.get("/leaves/pending", { params: { page, per_page: perPage } });
  const raw = response.data;
  return {
    items: extractArrayPayload(raw),
    totalPages: raw?.data?.last_page ?? 1,
    raw,
  };
};`
      },
      {
        old: `export const getLeaveRequests = async (params?: { status?: string }) => {
  const query = params?.status ? ` + "`?status=${params.status}`" + ` : "";
  const response = await api.get(` + "`/leaves${query}`" + `);
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};`,
        new: `export const getLeaveRequests = async (params?: { status?: string; page?: number; per_page?: number }) => {
  const response = await api.get("/leaves", { params });
  const raw = response.data;
  return {
    items: extractArrayPayload(raw),
    totalPages: raw?.data?.last_page ?? 1,
    raw,
  };
};`
      },
    ]
  },
  // attendance.service.ts — getHistory
  {
    file: 'src/features/attendance/api/attendance.service.ts',
    changes: [
      {
        old: `  getHistory: async () => {
    const response = await api.get('/attendance/history');
    return {
      items: extractArrayPayload(response.data),
      raw: response.data,
    };`,
        new: `  getHistory: async (page = 1, perPage = 10) => {
    const response = await api.get('/attendance/history', { params: { page, per_page: perPage } });
    const raw = response.data;
    return {
      items: extractArrayPayload(raw),
      totalPages: raw?.data?.last_page ?? 1,
      raw,`
      },
    ]
  },
  // ess.service.ts — getMyKpi, getMyKpiPeriods, getMyReimbursements, getMyPayroll
  {
    file: 'src/features/ess/api/ess.service.ts',
    changes: [
      {
        old: `export const getMyKpi = async () => {
  const token = sessionStorage.getItem("token");
  
  const response = await api.get("/my/kpi", {
    headers: {
      'Accept': 'application/json',
      'Authorization': ` + "`Bearer ${token}`" + `
    },
    validateStatus: (status) => (status >= 200 && status < 300) || status === 500
  });
  
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};`,
        new: `export const getMyKpi = async (page = 1, perPage = 10) => {
  const token = sessionStorage.getItem("token");
  
  const response = await api.get("/my/kpi", {
    params: { page, per_page: perPage },
    headers: {
      'Accept': 'application/json',
      'Authorization': ` + "`Bearer ${token}`" + `
    },
    validateStatus: (status) => (status >= 200 && status < 300) || status === 500
  });
  
  const raw = response.data;
  return {
    items: extractArrayPayload(raw),
    totalPages: raw?.data?.last_page ?? 1,
    raw,
  };
};`
      },
      {
        old: `export const getMyKpiPeriods = async () => {
  const token = sessionStorage.getItem("token");

  const response = await api.get("/my/kpi-periods", {
    headers: {
      'Accept': 'application/json',
      'Authorization': ` + "`Bearer ${token}`" + `
    },
    validateStatus: (status) => (status >= 200 && status < 300) || status === 500
  });

  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};`,
        new: `export const getMyKpiPeriods = async (page = 1, perPage = 10) => {
  const token = sessionStorage.getItem("token");

  const response = await api.get("/my/kpi-periods", {
    params: { page, per_page: perPage },
    headers: {
      'Accept': 'application/json',
      'Authorization': ` + "`Bearer ${token}`" + `
    },
    validateStatus: (status) => (status >= 200 && status < 300) || status === 500
  });

  const raw = response.data;
  return {
    items: extractArrayPayload(raw),
    totalPages: raw?.data?.last_page ?? 1,
    raw,
  };
};`
      },
      {
        old: `export const getMyReimbursements = async (status?: string) => {
  const response = await api.get("/my/reimbursements", {
    params: status ? { status } : undefined,
  });

  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};`,
        new: `export const getMyReimbursements = async (status?: string, page = 1, perPage = 10) => {
  const response = await api.get("/my/reimbursements", {
    params: { ...(status ? { status } : {}), page, per_page: perPage },
  });

  const raw = response.data;
  return {
    items: extractArrayPayload(raw),
    totalPages: raw?.data?.last_page ?? 1,
    raw,
  };
};`
      },
      {
        old: `export const getMyPayroll = async () => {
  const response = await api.get("/my/payroll");
  // API returns { success, message, data: [...] }
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};`,
        new: `export const getMyPayroll = async (page = 1, perPage = 10) => {
  const response = await api.get("/my/payroll", { params: { page, per_page: perPage } });
  const raw = response.data;
  // API returns { success, message, data: [...] }
  return {
    items: extractArrayPayload(raw),
    totalPages: raw?.data?.last_page ?? 1,
    raw,
  };
};`
      },
    ]
  },
  // workforce.service.ts — getShiftSwaps, getComplianceDocuments, getOvertimeRules
  {
    file: 'src/features/workforce/api/workforce.service.ts',
    changes: [
      {
        old: `  getShiftSwaps: async () => {
    const response = await api.get('/workforce/shift-swaps');
    return {
      items: extractArrayPayload(response.data),
      raw: response.data,
    };`,
        new: `  getShiftSwaps: async (page = 1, perPage = 10) => {
    const response = await api.get('/workforce/shift-swaps', { params: { page, per_page: perPage } });
    const raw = response.data;
    return {
      items: extractArrayPayload(raw),
      totalPages: raw?.data?.last_page ?? 1,
      raw,`
      },
      {
        old: `  getComplianceDocuments: async () => {
    const response = await api.get('/workforce/compliance/documents');
    return {
      items: extractArrayPayload(response.data),
      raw: response.data,
    };`,
        new: `  getComplianceDocuments: async (page = 1, perPage = 10) => {
    const response = await api.get('/workforce/compliance/documents', { params: { page, per_page: perPage } });
    const raw = response.data;
    return {
      items: extractArrayPayload(raw),
      totalPages: raw?.data?.last_page ?? 1,
      raw,`
      },
      {
        old: `  getOvertimeRules: async () => {
    const response = await api.get('/workforce/overtime-rules');
    return {
      items: extractArrayPayload(response.data),
      raw: response.data,
    };`,
        new: `  getOvertimeRules: async (page = 1, perPage = 10) => {
    const response = await api.get('/workforce/overtime-rules', { params: { page, per_page: perPage } });
    const raw = response.data;
    return {
      items: extractArrayPayload(raw),
      totalPages: raw?.data?.last_page ?? 1,
      raw,`
      },
      {
        old: `  getHolidays: async () => {
    const response = await api.get('/workforce/holidays');
    return {
      items: extractArrayPayload(response.data),
      raw: response.data,
    };`,
        new: `  getHolidays: async (page = 1, perPage = 10) => {
    const response = await api.get('/workforce/holidays', { params: { page, per_page: perPage } });
    const raw = response.data;
    return {
      items: extractArrayPayload(raw),
      totalPages: raw?.data?.last_page ?? 1,
      raw,`
      },
    ]
  },
  // training.service.ts — getEnrollments, getMyTrainings, getAvailableTrainings
  {
    file: 'src/features/training/api/training.service.ts',
    changes: [
      {
        old: `  getEnrollments: async () => {
    const response = await api.get('/training/enrollments');
    return response.data;`,
        new: `  getEnrollments: async (page = 1, perPage = 10) => {
    const response = await api.get('/training/enrollments', { params: { page, per_page: perPage } });
    return response.data;`
      },
      {
        old: `  getMyTrainings: async () => {
    const response = await api.get('/my/trainings');
    return response.data;`,
        new: `  getMyTrainings: async (page = 1, perPage = 10) => {
    const response = await api.get('/my/trainings', { params: { page, per_page: perPage } });
    return response.data;`
      },
      {
        old: `  getAvailableTrainings: async (params?: { search?: string; per_page?: number }) => {
    const response = await api.get('/my/trainings/available', { params });
    return response.data;`,
        new: `  getAvailableTrainings: async (params?: { search?: string; page?: number; per_page?: number }) => {
    const response = await api.get('/my/trainings/available', { params });
    return response.data;`
      },
    ]
  },
  // asset.service.ts — getAssets, getAssignments
  {
    file: 'src/features/assets/api/asset.service.ts',
    changes: [
      {
        old: `  getAssets: async (params?: { status?: string; search?: string }) => {
    const response = await api.get('/assets', { params });
    return response.data;`,
        new: `  getAssets: async (params?: { status?: string; search?: string; page?: number; per_page?: number }) => {
    const response = await api.get('/assets', { params });
    return response.data;`
      },
      {
        old: `  getAssignments: async () => {
    const response = await api.get('/assets/assignments');
    return response.data;`,
        new: `  getAssignments: async (page = 1, perPage = 10) => {
    const response = await api.get('/assets/assignments', { params: { page, per_page: perPage } });
    return response.data;`
      },
    ]
  },
  // promotion.service.ts — getPromotions, getMyPromotions
  {
    file: 'src/features/organization/api/promotion.service.ts',
    changes: [
      {
        old: `  getPromotions: (params?: Record<string, string>) => {
    return api.get('/promotions', { params });
  },`,
        new: `  getPromotions: (params?: Record<string, string | number>) => {
    return api.get('/promotions', { params });
  },`
      },
      {
        old: `  getMyPromotions: (params?: Record<string, string>) => {
    return api.get('/my/promotions', { params });
  },`,
        new: `  getMyPromotions: (params?: Record<string, string | number>) => {
    return api.get('/my/promotions', { params });
  },`
      },
    ]
  },
  // reimbursement.service.ts — getAllReimbursements, getPendingReimbursements
  {
    file: 'src/features/reimbursement/api/reimbursement.service.ts',
    changes: [
      {
        old: `export const getAllReimbursements = async (filters?: ReimbursementFilters) => {
  const response = await api.get("/reimbursements", { params: filters });
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};`,
        new: `export const getAllReimbursements = async (filters?: ReimbursementFilters) => {
  const response = await api.get("/reimbursements", { params: filters });
  const raw = response.data;
  return {
    items: extractArrayPayload(raw),
    totalPages: raw?.data?.last_page ?? 1,
    raw,
  };
};`
      },
      {
        old: `export const getPendingReimbursements = async () => {
  const response = await api.get("/reimbursements/pending");
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};`,
        new: `export const getPendingReimbursements = async (page = 1, perPage = 10) => {
  const response = await api.get("/reimbursements/pending", { params: { page, per_page: perPage } });
  const raw = response.data;
  return {
    items: extractArrayPayload(raw),
    totalPages: raw?.data?.last_page ?? 1,
    raw,
  };
};`
      },
      {
        old: `export const getMyReimbursements = async (status?: string) => {
  const response = await api.get("/my/reimbursements", {
    params: status ? { status } : undefined,
  });
  return {
    items: extractArrayPayload(response.data),
    raw: response.data,
  };
};`,
        new: `export const getMyReimbursements = async (status?: string, page = 1, perPage = 10) => {
  const response = await api.get("/my/reimbursements", {
    params: { ...(status ? { status } : {}), page, per_page: perPage },
  });
  const raw = response.data;
  return {
    items: extractArrayPayload(raw),
    totalPages: raw?.data?.last_page ?? 1,
    raw,
  };
};`
      },
    ]
  },
  // admin.service.ts — getAllUsers (already has page/perPage, just add lastPage)
  {
    file: 'src/features/admin/api/admin.service.ts',
    changes: [
      {
        old: `export const getAllUsers = async (page = 1, perPage = 50) => {
  const response = await api.get("/admin/users", {
    params: { page, per_page: perPage }
  });
  return {
    items: extractArrayPayload(response.data) as unknown as AdminUser[],
    raw: response.data,
    total: toRecord(response.data).total,
    page,
    perPage,
  };
};`,
        new: `export const getAllUsers = async (page = 1, perPage = 50) => {
  const response = await api.get("/admin/users", {
    params: { page, per_page: perPage }
  });
  const raw = response.data;
  return {
    items: extractArrayPayload(raw) as unknown as AdminUser[],
    totalPages: raw?.data?.last_page ?? 1,
    raw,
    total: toRecord(raw).total,
    page,
    perPage,
  };
};`
      },
      {
        old: `export const getAllRoles = async (page = 1, perPage = 50) => {
  const response = await api.get("/admin/roles", {
    params: { page, per_page: perPage }
  });
  return {
    items: extractArrayPayload(response.data) as unknown as AdminRole[],
    raw: response.data,
    total: toRecord(response.data).total,
    page,
    perPage,
  };
};`,
        new: `export const getAllRoles = async (page = 1, perPage = 50) => {
  const response = await api.get("/admin/roles", {
    params: { page, per_page: perPage }
  });
  const raw = response.data;
  return {
    items: extractArrayPayload(raw) as unknown as AdminRole[],
    totalPages: raw?.data?.last_page ?? 1,
    raw,
    total: toRecord(raw).total,
    page,
    perPage,
  };
};`
      },
      {
        old: `export const getAllPermissions = async (page = 1, perPage = 50) => {
  const response = await api.get("/admin/permissions", {
    params: { page, per_page: perPage }
  });
  return {
    items: extractArrayPayload(response.data) as unknown as AdminPermission[],
    raw: response.data,
    total: toRecord(response.data).total,
    page,
    perPage,
  };
};`,
        new: `export const getAllPermissions = async (page = 1, perPage = 50) => {
  const response = await api.get("/admin/permissions", {
    params: { page, per_page: perPage }
  });
  const raw = response.data;
  return {
    items: extractArrayPayload(raw) as unknown as AdminPermission[],
    totalPages: raw?.data?.last_page ?? 1,
    raw,
    total: toRecord(raw).total,
    page,
    perPage,
  };
};`
      },
    ]
  },
];

// ================================================================
// PAGE MODIFICATIONS
// ================================================================

const pageChanges = {
  // Replace Math.ceil with a server-based totalPages
  replaceTotalPages: [
    // Pattern: const totalPages = Math.ceil(sorted.length / pageSize)
    { old: /const\s+(totalPages\w*)\s*=\s*(?:Math\.max\(\s*1\s*,\s*)?Math\.ceil\((\w+)\.length\s*\/\s*(\w+)\)\s*\)?;/g, new: 'let $1 = 1; // $1 will be set from server response' },
    { old: /const\s+(_totalPages)\s*=\s*(?:Math\.max\(\s*1\s*,\s*)?Math\.ceil\((\w+)\.length\s*\/\s*(\w+)\)\s*\)?;/g, new: 'let $1 = 1; // $1 will be set from server response' },
  ],
};

function applyServiceChanges() {
  console.log('=== Phase 1: Modifying Service Files ===');
  let count = 0;
  for (const svc of serviceChanges) {
    const fullPath = path.join(BASE, svc.file);
    if (!fs.existsSync(fullPath)) {
      console.log(`  ✗ Not found: ${svc.file}`);
      continue;
    }
    let content = fs.readFileSync(fullPath, 'utf-8');
    for (const change of svc.changes) {
      if (content.includes(change.new)) {
        continue;
      }
      if (content.includes(change.old)) {
        content = content.replace(change.old, change.new);
        count++;
        console.log(`  ✓ ${svc.file} — applied change`);
      } else {
        console.log(`  ⚠ ${svc.file} — old pattern not found`);
      }
    }
    fs.writeFileSync(fullPath, content, 'utf-8');
  }
  console.log(`  Total service changes: ${count}`);
}

function applyPageMathCeilReplacements() {
  console.log('\n=== Phase 2: Replacing Math.ceil with server-based totalPages ===');
  let count = 0;
  const pagesDir = path.join(BASE, 'src', 'pages');
  
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.tsx')) {
        let content = fs.readFileSync(fullPath, 'utf-8');
        let changed = false;
        for (const rule of pageChanges.replaceTotalPages) {
          const newContent = content.replace(rule.old, rule.new);
          if (newContent !== content) {
            content = newContent;
            changed = true;
            count++;
          }
        }
        if (changed) {
          fs.writeFileSync(fullPath, content, 'utf-8');
          console.log(`  ✓ ${path.relative(BASE, fullPath)}`);
        }
      }
    }
  }
  walk(pagesDir);
  console.log(`  Total files with Math.ceil replaced: ${count}`);
}

function fixRemainingSlicePatterns() {
  console.log('\n=== Phase 3: Fixing remaining slice patterns ===');
  
  // Manually fix specific remaining files with .slice() patterns
  const fixes = [
    // PayrollGeneratePage
    {
      file: 'src/pages/payroll/PayrollGeneratePage.tsx',
      old: `  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage
  );`,
      new: `  const paginatedItems = filteredItems;`
    },
    // PayrollListPage
    {
      file: 'src/pages/payroll/PayrollListPage.tsx',
      old: `  const paginatedItems = sortedItems.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize);`,
      new: `  const paginatedItems = sortedItems;`
    },
    // PayrollCrudPage
    {
      file: 'src/pages/payroll/PayrollCrudPage.tsx',
      old: `  const paginatedPayrolls = filteredPayrolls.slice((currentPage - 1) * itemsPerPage, (currentPage - 1) * itemsPerPage + itemsPerPage);`,
      new: `  const paginatedPayrolls = filteredPayrolls;`
    },
    // PayrollDetailsPage
    {
      file: 'src/pages/payroll/PayrollDetailsPage.tsx',
      old: `  const paginatedOverview = filteredOverviewItems.slice(
    (currentPageOverview - 1) * pageSizeOverview,
    (currentPageOverview - 1) * pageSizeOverview + pageSizeOverview
  );`,
      new: `  const paginatedOverview = filteredOverviewItems;`
    },
    // PayrollPaymentPage
    {
      file: 'src/pages/payroll/PayrollPaymentPage.tsx',
      old: `  const recentPayrolls = filteredPayrolls.slice((currentPageRecent - 1) * itemsPerPageRecent, (currentPageRecent - 1) * itemsPerPageRecent + itemsPerPageRecent);`,
      new: `  const recentPayrolls = filteredPayrolls;`
    },
    // PayrollProcessPage — paginated
    {
      file: 'src/pages/payroll/PayrollProcessPage.tsx',
      old: `  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);`,
      new: `  const paginated = filtered;`
    },
    // PayrollProcessPage — paginatedPending
    {
      file: 'src/pages/payroll/PayrollProcessPage.tsx',
      old: `  const paginatedPending = pendingPayrolls.slice((currentPagePending - 1) * pageSizePending, currentPagePending * pageSizePending);`,
      new: `  const paginatedPending = pendingPayrolls;`
    },
    // PayrollProcessPage — recentPayrolls
    {
      file: 'src/pages/payroll/PayrollProcessPage.tsx',
      old: `  const recentPayrolls = filteredPayrolls.slice((currentPageRecent - 1) * pageSizeRecent, currentPageRecent * pageSizeRecent);`,
      new: `  const recentPayrolls = filteredPayrolls;`
    },
    // MyTrainingsPage — paginated
    {
      file: 'src/pages/ess/MyTrainingsPage.tsx',
      old: `  const paginated = useMemo(() => sorted.slice((page - 1) * pageSize, page * pageSize), [sorted, page, pageSize]);`,
      new: `  const paginated = sorted;`
    },
    // TrainingManagementPage — paginated (line 76)
    {
      file: 'src/pages/admin/TrainingManagementPage.tsx',
      old: `  const paginated = useMemo(() => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize), [sorted, currentPage, pageSize]);`,
      new: `  const paginated = sorted;`
    },
    // TrainingManagementPage — paginated (line 364, in EnrollmentsTab)
    {
      file: 'src/pages/admin/TrainingManagementPage.tsx',
      old: `  const paginated = useMemo(() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filtered, currentPage, pageSize]);`,
      new: `  const paginated = filtered;`
    },
    // MyKpiPage — paginatedPeriods
    {
      file: 'src/pages/ess/MyKpiPage.tsx',
      old: `    () => filteredPeriods.slice((currentPage - 1) * pageSize, currentPage * pageSize),`,
      new: `    () => filteredPeriods,`
    },
    // PayrollApprovePage — paginate function usage (the function definition)
    {
      file: 'src/pages/payroll/PayrollApprovePage.tsx',
      old: `    arr.slice((page - 1) * size, (page - 1) * size + size);`,
      new: `    arr;`
    },
  ];

  let fixCount = 0;
  for (const fix of fixes) {
    const fullPath = path.join(BASE, fix.file);
    if (!fs.existsSync(fullPath)) {
      console.log(`  ✗ Not found: ${fix.file}`);
      continue;
    }
    let content = fs.readFileSync(fullPath, 'utf-8');
    if (content.includes(fix.new)) {
      console.log(`  ~ Already fixed: ${fix.file}`);
      continue;
    }
    if (content.includes(fix.old)) {
      content = content.replace(fix.old, fix.new);
      fs.writeFileSync(fullPath, content, 'utf-8');
      fixCount++;
      console.log(`  ✓ ${fix.file}`);
    } else {
      console.log(`  ⚠ Pattern not found in ${fix.file}`);
    }
  }
  console.log(`  Total slice pattern fixes: ${fixCount}`);
}

// ================================================================
// MAIN
// ================================================================

applyServiceChanges();
applyPageMathCeilReplacements();
fixRemainingSlicePatterns();

console.log('\nDone!');
