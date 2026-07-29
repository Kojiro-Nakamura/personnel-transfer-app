const fs = require('fs');
const file = 'src/components/modals/Modals.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the old static historyYears
content = content.replace(/const historyYears = Array\.from\([^;]+;\s*/, '');

// 2. Add dynamic historyYears inside BulkEditModal
const bulkEditStart = 'export const BulkEditModal = ({ isOpen, onClose, onSave, employees, departments }) => {';
const dynamicHistory = `export const BulkEditModal = ({ isOpen, onClose, onSave, employees, departments }) => {
  const historyYears = useMemo(() => {
    let min = new Date().getFullYear();
    let max = min + 1;
    let hasHistory = false;
    
    (employees || []).forEach(emp => {
      if (emp.history && emp.history.length > 0) {
        hasHistory = true;
        emp.history.forEach(h => {
          if (h.year < min) min = h.year;
          if (h.year > max) max = h.year;
        });
      }
    });
    
    if (!hasHistory) {
      min = new Date().getFullYear() - 5;
    }
    
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }, [employees]);
`;

content = content.replace(bulkEditStart, dynamicHistory);

// 3. Update handleImportCSV to parse headers
const importLinesRegex = /const lines = text\.replace\(\/\^\\uFEFF\/, ''\)\.split\(\/\\r\\n\|\\n\/\)\.filter\(line => line\.trim\(\) !== ''\);\s*if \(lines\.length <= 1\) \{[\s\S]*?return;\s*\}/;
const newImportLines = `const lines = text.replace(/^\\uFEFF/, '').split(/\\r\\n|\\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) { 
        setAlertMessage('データが空です。'); 
        return; 
      }
      
      const headerCols = parseCSVRow(lines[0]);
      const csvYearsMap = new Map();
      for (let k = 32; k < headerCols.length; k++) {
        const m = headerCols[k] ? headerCols[k].match(/^(\\d{4})/) : null;
        if (m) {
          csvYearsMap.set(k, parseInt(m[1], 10));
        }
      }`;

content = content.replace(importLinesRegex, newImportLines);

// 4. Update the history parsing inside the loop in handleImportCSV
const oldHistLogic = `if (cols.length > 32) {
          let newHistory = [];
          for (let k = 0; k < historyYears.length; k++) {
            if (32 + k < cols.length) {
              const year = historyYears[k];
              const deptName = cols[32 + k] || '';
              if (deptName) {
                const age = calculateAge(parseJapaneseDate(bStr), year);
                newHistory.push({
                  year,
                  japaneseYear: getEraFormattedYear(year),
                  age,
                  department: deptName
                });
              }
            }
          }
          newEmpData.history = newHistory;
        }`;

const newHistLogic = `if (csvYearsMap.size > 0) {
          let newHistory = [];
          for (let [k, year] of csvYearsMap.entries()) {
            if (k < cols.length) {
              const deptName = cols[k] || '';
              if (deptName) {
                const age = calculateAge(parseJapaneseDate(bStr), year);
                newHistory.push({
                  year,
                  japaneseYear: getEraFormattedYear(year),
                  age,
                  department: deptName
                });
              }
            }
          }
          newHistory.sort((a, b) => a.year - b.year);
          newEmpData.history = newHistory;
        }`;

content = content.replace(oldHistLogic, newHistLogic);

fs.writeFileSync(file, content, 'utf8');
