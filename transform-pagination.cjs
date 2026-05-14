const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, 'src', 'pages');
const FEATURES_DIR = path.join(__dirname, 'src', 'features');

// ============================================================
// 1. TRANSFORM SERVICE FILES
// ============================================================
// Modifies service functions to accept page/perPage params

function transformService(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const rel = path.relative(__dirname, filePath);
  let changed = false;

  // enrollment.service.ts - getEnrollments
  if (rel.includes('enrollment.service')) {
    // getEnrollments(page = 1, perPage = 10) signature
    const old1 = `async getEnrollments() {`;
    if (content.includes(old1)) {
      content = content.replace(
        old1,
        `async getEnrollments(page = 1, perPage = 10) {`
      );
      // Add params to the api call
      content = content.replace(
        /(api\.get\(['"`]\S+['"`]\))/,
        `$1, { params: { page, per_page: perPage } }`
      );
      changed = true;
      console.log(`  ✓ Modified: ${rel}`);
    }
  }

  // training.service.ts - getEnrollments, getPrograms, getMyTrainings, getAvailableTrainings
  if (rel.includes('training.service')) {
    if (content.includes(`async getEnrollments(`) && !content.includes(`async getEnrollments(page`)) {
      content = content.replace(
        `async getEnrollments()`,
        `async getEnrollments(page = 1, perPage = 10)`
      );
      content = content.replace(
        /(get\(['"`]\S+['"`]\))/,
        `$1, { params: { page, per_page: perPage } }`
      );
      changed = true;
    }
    if (content.includes(`async getPrograms(params?)`) || content.includes(`async getPrograms(params?:`)) {
      // Already supports params, just use page/perPage within params
      // No change needed
    }
    if (content.includes(`async getMyTrainings()`) && !content.includes(`async getMyTrainings(page`)) {
      content = content.replace(
        `async getMyTrainings()`,
        `async getMyTrainings(page = 1, perPage = 10)`
      );
      content = content.replace(
        /(get\(['"`]\S+['"`]\))/,
        `$1, { params: { page, per_page: perPage } }`
      );
      changed = true;
    }
    if (content.includes(`async getAvailableTrainings()`) && !content.includes(`async getAvailableTrainings(page`)) {
      content = content.replace(
        `async getAvailableTrainings()`,
        `async getAvailableTrainings(page = 1, perPage = 10)`
      );
      content = content.replace(
        /(get\(['"`]\S+['"`]\))/,
        `$1, { params: { page, per_page: perPage } }`
      );
      changed = true;
    }
    if (changed) console.log(`  ✓ Modified: ${rel}`);
  }

  // asset.service.ts - getAssets, getAssignments
  if (rel.includes('asset.service')) {
    let assetChanged = false;
    if (content.includes(`async getAssets()`) && !content.includes(`async getAssets(page`)) {
      content = content.replace(
        `async getAssets()`,
        `async getAssets(page = 1, perPage = 10)`
      );
      content = content.replace(
        /(get\(['"`]\S+['"`]\))/,
        `$1, { params: { page, per_page: perPage } }`
      );
      assetChanged = true;
    }
    if (content.includes(`async getAssignments()`) && !content.includes(`async getAssignments(page`)) {
      content = content.replace(
        `async getAssignments()`,
        `async getAssignments(page = 1, perPage = 10)`
      );
      content = content.replace(
        /(get\(['"`]\S+['"`]\))/,
        `$1, { params: { page, per_page: perPage } }`
      );
      assetChanged = true;
    }
    if (assetChanged) {
      changed = true;
      console.log(`  ✓ Modified: ${rel}`);
    }
  }

  // promotion.service.ts - getPromotions, getMyPromotions
  if (rel.includes('promotion.service')) {
    if (content.includes(`async getPromotions(?)`)) {
      // Already has params, no change needed
    }
    if (content.includes(`async getMyPromotions()`) && !content.includes(`async getMyPromotions(page`)) {
      content = content.replace(
        `async getMyPromotions()`,
        `async getMyPromotions(page = 1, perPage = 10)`
      );
      content = content.replace(
        /(get\(['"`]\S+['"`]\))/,
        `$1, { params: { page, per_page: perPage } }`
      );
      changed = true;
      console.log(`  ✓ Modified: ${rel}`);
    }
  }

  // document.service.ts - getMyDocuments
  if (rel.includes('document.service')) {
    if (content.includes(`async getMyDocuments()`) && !content.includes(`async getMyDocuments(page`)) {
      content = content.replace(
        `async getMyDocuments()`,
        `async getMyDocuments(page = 1, perPage = 10)`
      );
      content = content.replace(
        /(get\(['"`]\S+['"`]\))/,
        `$1, { params: { page, per_page: perPage } }`
      );
      changed = true;
      console.log(`  ✓ Modified: ${rel}`);
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

// ============================================================
// 2. TRANSFORM PAGE FILES
// ============================================================

function transformPage(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const rel = path.relative(__dirname, filePath);
  let changes = 0;

  // ---- Step A: Replace totalPages client-side calculation with server-side ----
  // Pattern: const totalPages = Math.ceil(...)
  // We replace with a placeholder that will use the server value
  const totalPagesRegex = /const\s+(?:totalPages|_totalPages)\s*=\s*(?:Math\.max\(\s*1,\s*)?Math\.ceil\((\w+)\.length\s*\/\s*(\w+)\)\s*\)?;?\s*/g;
  
  // We'll handle this by first checking if the file already gets the data from the server
  // For now, let's just look at the patterns

  // ---- Step B: Replace paginated items (remove slice) ----
  // Pattern 1: simple slice assignment
  // const paginatedXxx = xxx.slice((currentPage-1)*pageSize, currentPage*pageSize);
  const simpleSliceRegex = /const\s+(paginated\w+)\s*=\s*(\w+)\.slice\(\(\s*(?:currentPage|page)\s*-\s*1\s*\)\s*\*\s*(\w+)\s*,\s*\(\s*(?:currentPage|page)\s*-\s*1\s*\)\s*\*\s*\3\s*\+\s*\3\s*\);/g;
  content = content.replace(simpleSliceRegex, 'const $1 = $2;');
  
  // Pattern 2: useMemo with slice
  // const paginatedXxx = useMemo(() => { ... return filtered.slice(...) }, [...])
  const useMemoSliceRegex = /const\s+(paginated\w+)\s*=\s*useMemo\(\(\)\s*=>\s*\{[^}]*?return\s+(\w+)\.slice\(\(\s*(?:currentPage|page)\s*-\s*1\s*\)\s*\*\s*(\w+)\s*,\s*(?:\k<3>|\k<3>\s*\*\s*(?:currentPage|page))[^}]*?;\s*\},\s*\[[^\]]+\]\);/g;
  // This is too complex for regex, let me handle it differently
  
  // Simpler: direct slice assignment in useMemo
  // const paginatedXxx = useMemo(() => xxx.slice(...), [...]);
  const useMemoDirectSliceRegex = /const\s+(paginated\w+)\s*=\s*useMemo\(\(\)\s*=>\s*(\w+)\.slice\(\(\s*(?:currentPage|page)\s*-\s*1\s*\)\s*\*\s*(\w+)\s*,\s*(?:\k<3>|\k<3>\s*\*\s*(?:currentPage|page))\)\s*,\s*\[[^\]]+\]\);/g;
  
  let match;
  // More robust: just find all useMemo with slice patterns and replace them

  // Let me try a multi-line approach  
  while ((match = useMemoDirectSliceRegex.exec(content)) !== null) {
    const replacement = `const ${match[1]} = ${match[2]};`;
    content = content.slice(0, match.index) + replacement + content.slice(match.index + match[0].length);
    changes++;
    useMemoDirectSliceRegex.lastIndex = match.index + replacement.length;
  }

  // Pattern 3: multi-line useMemo with slice
  // const paginatedXxx = useMemo(() => {
  //   const start = ...
  //   return xxx.slice(...);
  // }, [...]);
  const multiLineUseMemoRegex = /const\s+(paginated\w+)\s*=\s*useMemo\(\(\)\s*=>\s*\{[\s\S]*?return\s+(\w+)\.slice\([\s\S]*?;\s*\},\s*\[[^\]]+\]\);/g;
  content = content.replace(multiLineUseMemoRegex, (match, p1, p2) => {
    changes++;
    return `const ${p1} = ${p2};`;
  });

  // Pattern 4: multi-line useMemo that starts with const start = ...
  const multiLineUseMemoWithCalcRegex = /const\s+(paginated\w+)\s*=\s*useMemo\(\(\)\s*=>\s*\{[\s\S]*?(?:const\s+\w+\s*=\s*\([^)]+\))[\s\S]*?return\s+(\w+)\.slice\([\s\S]*?;\s*\},\s*\[[^\]]+\]\);/g;
  content = content.replace(multiLineUseMemoWithCalcRegex, (match, p1, p2) => {
    changes++;
    return `const ${p1} = ${p2};`;
  });

  // Pattern 5: useMemo with internal filtered then sliced
  const multiStepUseMemoRegex = /const\s+(paginated\w+)\s*=\s*useMemo\(\(\)\s*=>\s*\{[\s\S]*?const\s+\w+\s*=\s*\w+\.filter\([\s\S]*?const\s+\w+\s*=\s*\w+\.filter\([\s\S]*?return\s+(\w+)\.slice\([\s\S]*?;\s*\},\s*\[[^\]]+\]\);/g;
  content = content.replace(multiStepUseMemoRegex, (match, p1, p2) => {
    changes++;
    return `const ${p1} = ${p2};`;
  });

  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✓ ${rel} (${changes} changes)`);
    return true;
  }
  return false;
}

// ============================================================
// MAIN
// ============================================================

console.log('=== Phase 1: Transform Services ===');
const serviceFiles = [
  'C:\\Users\\raulm\\Downloads\\hris-frontend\\src\\features\\training\\api\\training.service.ts',
  'C:\\Users\\raulm\\Downloads\\hris-frontend\\src\\features\\assets\\api\\asset.service.ts',
  'C:\\Users\\raulm\\Downloads\\hris-frontend\\src\\features\\organization\\api\\promotion.service.ts',
  'C:\\Users\\raulm\\Downloads\\hris-frontend\\src\\features\\employee\\api\\document.service.ts',
];

for (const sf of serviceFiles) {
  if (fs.existsSync(sf)) {
    transformService(sf);
  }
}

// Also handle enrollment service
const enrollmentService = 'C:\\Users\\raulm\\Downloads\\hris-frontend\\src\\features\\training\\api\\enrollment.service.ts';
if (fs.existsSync(enrollmentService)) {
  transformService(enrollmentService);
}

console.log('\n=== Phase 2: Transform Pages ===');

// Process all page files with paginated patterns
const pagesDir = 'C:\\Users\\raulm\\Downloads\\hris-frontend\\src\\pages';
function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      // Only process files with pagination patterns
      if (content.includes('paginated') || content.includes('totalPages')) {
        transformPage(fullPath);
      }
    }
  }
}

processDir(pagesDir);

console.log('\nDone!');
