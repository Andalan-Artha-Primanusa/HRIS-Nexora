const { Project, ScriptKind } = require('ts-morph');
const path = require('path');
const fs = require('fs');

const BASE = 'C:\\Users\\raulm\\Downloads\\hris-frontend';
const PAGES = path.join(BASE, 'src', 'pages');

const project = new Project({
  tsConfigFilePath: path.join(BASE, 'tsconfig.json'),
  skipAddingFilesFromTsConfig: true,
});

let modifiedCount = 0;
let skippedCount = 0;

function processFile(filePath) {
  const rel = path.relative(BASE, filePath);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Check if already has setTotalPages call (not just useState)
  if (content.match(/setTotalPages\([^)]+\)\s*;/)) {
    return;
  }

  // Skip files without totalPages state
  if (!content.includes('setTotalPages] = useState(1)') && !content.includes('setTotalPages] = useState(1)')) {
    return;
  }

  let modified = false;

  // Pattern 1: const result = await someFunc(); setItems(result.items);
  // Add: setTotalPages(result.totalPages);
  let match;
  const awaitPattern = /const\s+(\w+)\s*=\s*await\s+(\w+(?:\.\w+)?)\(([^)]*)\);/g;
  while ((match = awaitPattern.exec(content)) !== null) {
    const [fullMatch, resultVar, funcName, args] = match;
    
    // Skip if args already contain 'page' or 'per_page'
    if (args.includes('page') || args.includes('per_page')) continue;

    // Find the setXxx call using resultVar.items or response.data
    const setItemsPattern = new RegExp(`set\\w+\\(${resultVar}\\.items`, '');
    const setDataPattern = new RegExp(`set\\w+\\(${resultVar}\\.data`, '');
    const setResponsePattern = new RegExp(`set\\w+\\(${resultVar}\\.data\\.data`, '');

    let insertLine = '';
    let afterLine = '';

    if (content.match(setResponsePattern)) {
      // const response = await X(); setItems(response.data.data);
      afterLine = content.match(setResponsePattern)[0];
      insertLine = `      setTotalPages(${resultVar}?.data?.data?.last_page ?? 1);`;
    } else if (content.match(setDataPattern)) {
      // const result = await X(); setItems(result.data);
      afterLine = content.match(setDataPattern)[0];
      insertLine = `      setTotalPages(${resultVar}?.data?.last_page ?? 1);`;
    } else if (content.match(setItemsPattern)) {
      // const result = await X(); setItems(result.items);
      afterLine = content.match(setItemsPattern)[0];
      insertLine = `      setTotalPages(${resultVar}.totalPages);`;
    } else {
      // Look for any setXxx after the await
      const afterMatch = content.slice(match.index + fullMatch.length).match(/set\w+\(/);
      if (afterMatch) {
        const setStart = match.index + fullMatch.length + afterMatch.index;
        const setEnd = content.indexOf(');', setStart) + 2;
        afterLine = content.slice(setStart, setEnd);
        insertLine = `      setTotalPages(${resultVar}?.totalPages ?? ${resultVar}?.data?.last_page ?? 1);`;
      }
    }

    if (afterLine && insertLine && !content.includes(insertLine.trim())) {
      const insertPos = content.indexOf(afterLine) + afterLine.length;
      content = content.slice(0, insertPos) + '\n' + insertLine + content.slice(insertPos);
      modified = true;
      
      // Also add pagination params to the function call
      const oldCall = fullMatch;
      const pageVar = content.includes('currentPage,') || content.includes('currentPage ') ? 
        'currentPage' : 'page';
      const sizeVar = content.includes('pageSize') ? 'pageSize' : 
                      content.includes('perPage') ? 'perPage' : 
                      content.includes('itemsPerPage') ? 'itemsPerPage' : 'pageSize';
      
      const newCall = fullMatch.replace(
        /^(const\s+\w+\s*=\s*await\s+\w+(?:\.\w+)?\()([^)]*)\)/,
        `$1${args ? args + ', ' : ''}${pageVar}, ${sizeVar})`
      );
      
      if (newCall !== oldCall && !content.includes(newCall)) {
        content = content.replace(oldCall, newCall);
      }
      
      break;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    modifiedCount++;
    if (modifiedCount <= 10) {
      console.log(`  ✓ ${rel}`);
    } else if (modifiedCount === 11) {
      console.log(`  ... (more files modified)`);
    }
  } else {
    skippedCount++;
  }
}

console.log('=== Processing remaining paginated files ===');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith('.tsx') && !entry.name.includes('.d.ts')) {
      processFile(fullPath);
    }
  }
}

walk(PAGES);

console.log(`\nModified: ${modifiedCount}, Skipped/done: ${skippedCount}`);
console.log('Done.');
