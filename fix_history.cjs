const fs = require('fs');
const file = 'src/utils/exportExcel.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix historyYears generation
const oldHistoryYearsGen = `  const allHistoryYears = new Set();
  employees.forEach(e => {
    if (e.history) e.history.forEach(h => allHistoryYears.add(h.year));
  });
  const historyYears = Array.from(allHistoryYears).sort((a, b) => a - b).filter(y => y < targetYear - 1);`;

const newHistoryYearsGen = `  const allHistoryYears = new Set();
  allHistoryYears.add(targetYear);
  employees.forEach(e => {
    if (e.history) e.history.forEach(h => allHistoryYears.add(h.year));
  });
  const historyYears = Array.from(allHistoryYears).sort((a, b) => a - b);`;

content = content.replace(oldHistoryYearsGen, newHistoryYearsGen);

// 2. Fix the loop that fetches history in exportPlanToExcel
const oldLoop = `      let lastValidHStr = '-';
      historyYears.forEach((y, i) => {
        const hist = (extEmp.history || []).find(h => h.year === y);
        let hStr = hist ? hist.department : '';
        
        let isChange = false;
        if (hStr !== '' && hStr !== '-') {
           if (hStr !== lastValidHStr) {
              isChange = true;
           }
           lastValidHStr = hStr;
        }`;

const newLoop = `      let lastValidHStr = '-';
      historyYears.forEach((y, i) => {
        let hStr = '';
        if (y === targetYear) {
           hStr = nDeptName;
        } else {
           const hist = (extEmp.history || []).find(h => h.year === y);
           hStr = hist ? hist.department : '';
        }
        
        let isChange = false;
        if (hStr !== '' && hStr !== '-') {
           if (hStr !== lastValidHStr) {
              isChange = true;
           }
           lastValidHStr = hStr;
        }`;
        
content = content.replace(oldLoop, newLoop);

// 3. Remove the manual pushing of nextYearDisplay
const oldNextYear = `      let nextYearDisplay = nDeptName;
      let isNextChange = false;
      if (nextYearDisplay && nextYearDisplay !== '-') {
        if (nextYearDisplay !== lastValidHStr) {
           isNextChange = true;
        }
      }
      rowVals.push(nextYearDisplay);
      if (isNextChange) curFontStyles[35 + historyYears.length] = 'change';
      if (promoYearMap[targetYear]) {
         const c = getPromotedBgColorCode(promoYearMap[targetYear]);
         if (c) curPromoColors[35 + historyYears.length] = c;
      }`;
      
content = content.replace(oldNextYear, '');

fs.writeFileSync(file, content);
console.log('Fixed history logic in exportPlanToExcel');
