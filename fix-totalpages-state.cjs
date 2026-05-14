const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\raulm\\Downloads\\hris-frontend';
const PAGES = path.join(BASE, 'src', 'pages');

// Convert let totalPages = 1; // comment to state
function convertToStateAndAddPagination() {
  const pagesDir = PAGES;

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.tsx')) {
        let content = fs.readFileSync(fullPath, 'utf-8');
        const rel = path.relative(BASE, fullPath);
        let changed = false;

        // Convert: let totalPages<OptionalSuffix> = 1; // comment
        // To: const [totalPages<OptionalSuffix>, setTotalPages<OptionalSuffix>] = useState(1);
        const stateRegex = /let\s+(totalPages\w*)\s*=\s*1;\s*\/\/\s*\1 will be set from server response/g;
        content = content.replace(stateRegex, (match, name) => {
          changed = true;
          const setName = `set${name.charAt(0).toUpperCase() + name.slice(1)}`;
          return `const [${name}, ${setName}] = useState(1);`;
        });

        // Also handle _totalPages
        const stateRegex2 = /let\s+(_totalPages)\s*=\s*1;\s*\/\/\s*\1 will be set from server response/g;
        content = content.replace(stateRegex2, (match, name) => {
          changed = true;
          return `const [${name}, setTotalPages] = useState(1);`;
        });

        if (changed) {
          fs.writeFileSync(fullPath, content, 'utf-8');
          console.log(`  ✓ ${rel}`);
        }
      }
    }
  }
  walk(pagesDir);
}

convertToStateAndAddPagination();
console.log('\nDone converting totalPages to state.');
