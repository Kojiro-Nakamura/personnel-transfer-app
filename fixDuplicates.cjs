const fs = require('fs');
let content = fs.readFileSync('src/components/modals/Modals.jsx', 'utf8');

// Fix importData property names in historyYears
content = content.replace('importData.adds', 'importData.additions');
content = content.replace('importData.adds', 'importData.additions'); // In case there are multiple, but replace only does first. We'll do it twice to be safe, or just use string replace properly.

const targetMemo = `    if (importData) {
      if (importData.adds) allEmps.push(...importData.adds);
      if (importData.updates) allEmps.push(...importData.updates);
    }`;
const repMemo = `    if (importData) {
      if (importData.additions) allEmps.push(...importData.additions);
      if (importData.updates) allEmps.push(...importData.updates);
    }`;
content = content.replace(targetMemo, repMemo);

// Now fix the duplicate headers.
// The headers are:
// {historyYears.length > 0 && <th colSpan={historyYears.length} className="px-2 py-1 border-b border-l text-center bg-emerald-100/50 text-emerald-900">履歴</th>}
// {historyYears.length > 0 && <th colSpan={historyYears.length} className="px-2 py-1 border-b border-l text-center bg-emerald-100/50 text-emerald-900">履歴</th>}

const dupHeader1 = `{historyYears.length > 0 && <th colSpan={historyYears.length} className="px-2 py-1 border-b border-l text-center bg-emerald-100/50 text-emerald-900">履歴</th>}\n                {historyYears.length > 0 && <th colSpan={historyYears.length} className="px-2 py-1 border-b border-l text-center bg-emerald-100/50 text-emerald-900">履歴</th>}`;
content = content.split(dupHeader1).join(`{historyYears.length > 0 && <th colSpan={historyYears.length} className="px-2 py-1 border-b border-l text-center bg-emerald-100/50 text-emerald-900">履歴</th>}`);

const dupHeader2 = `{historyYears.length > 0 && historyYears.map(year => (
                  <Th key={\`hist-h-\${year}\`} label={getEraFormattedYear(year)} sortKey={\`hist_\${year}\`} className="bg-emerald-50/50 border-l" />
                ))}
                {historyYears.length > 0 && historyYears.map(year => (
                  <Th key={\`hist-h-\${year}\`} label={getEraFormattedYear(year)} sortKey={\`hist_\${year}\`} className="bg-emerald-50/50 border-l" />
                ))}`;
content = content.split(dupHeader2).join(`{historyYears.length > 0 && historyYears.map(year => (
                  <Th key={\`hist-h-\${year}\`} label={getEraFormattedYear(year)} sortKey={\`hist_\${year}\`} className="bg-emerald-50/50 border-l" />
                ))}`);

fs.writeFileSync('src/components/modals/Modals.jsx', content, 'utf8');
console.log("Fixed additions and duplicates.");
