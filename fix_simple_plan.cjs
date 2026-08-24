const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// We need to replace the flatNodes loop in addSimplePlanSheet

const badLoopRegex = /for \(const node of flatNodes\) \{[\s\S]*?\}\n    \}\n  \}\n\};\n/m;
const badLoopMatch = code.match(badLoopRegex);

if (badLoopMatch) {
  const newLoopStr = \
  let displayDeptStr = '';
  
  for (const node of flatNodes) {
    if (node.type === 'dept' || node.type === 'group') {
       const counts = filterLevel === 9 ? {} : getCounts(currMap, employees, node.type === 'dept' ? node.id : null, node.type === 'group' ? node.id : null);
       const nCount = filterLevel === 9 ? {} : getCounts(nextMap, employees, node.type === 'dept' ? node.id : null, node.type === 'group' ? node.id : null);
       let curTot = counts['çáåv'] || 0;
       let nxTot = nCount['çáåv'] || 0;
       let displayStr = node.name;
       if (showCount) displayStr += \\\ \Å®\\\\;
       displayDeptStr = displayStr;
    } else if (node.type === 'post') {
       const cList = currMap[node.id] || [];
       const nList = nextMap[node.id] || [];
       const maxCount = Math.max(cList.length, nList.length, 1);
       
       for (let pIdx = 0; pIdx < maxCount; pIdx++) {
         const currEmpId = pIdx < cList.length ? cList[pIdx] : null;
         const nextEmpId = pIdx < nList.length ? nList[pIdx] : null;
         let currEmp = currEmpId ? employees.find(e => e.id === currEmpId) : null;
         let nextEmp = nextEmpId ? employees.find(e => e.id === nextEmpId) : null;
         
         const isAbolishedPost = node.isAbolished;
         const isRetained = currEmp && nextEmp && currEmp.id === nextEmp.id;
         
         let noteStr = notes[node.id] || '';
         
         let rowVals = [
           displayDeptStr, // ïîèêñº
           '', // îzëÆäÛñ]
           '', // ì¡éÍéñèÓ
           currEmp ? currEmp.currentTitle : '',
           currEmp ? getFormattedNameForPlan(currEmp, false) : '',
           getYearsStr(currEmp, false),
           getAgeStr(currEmp, false),
           nextEmp ? nextEmp.nextTitle : '',
           nextEmp ? getFormattedNameForPlan(nextEmp, true) : '',
           getYearsStr(nextEmp, true),
           getAgeStr(nextEmp, true),
           noteStr
         ];
         displayDeptStr = ''; // Clear it after printing once
         
         if (isAbolishedPost) {
           rowVals[7] = '';
           rowVals[8] = 'å„îCÇ»Çµ';
           rowVals[9] = '';
           rowVals[10] = '';
         } else if (isRetained) {
           rowVals[7] = nextEmp.nextTitle;
           rowVals[8] = '';
           rowVals[9] = '';
           rowVals[10] = '';
         }
         
         if (currEmp && pIdx === 0) {
            rowVals[1] = currEmp.desiredAssignment || '';
            rowVals[2] = currEmp.specialCircumstances || '';
         } else if (nextEmp && pIdx === 0) {
            rowVals[1] = nextEmp.desiredAssignment || '';
            rowVals[2] = nextEmp.specialCircumstances || '';
         }
         
         const tr = ws.addRow(rowVals);
         
         for(let c=1; c<=12; c++){
            const cell = tr.getCell(c);
            cell.alignment = { vertical: 'middle', horizontal: c >= 6 && c !== 12 ? 'center' : 'left' };
            cell.font = { size: 9 };
            cell.border = getCellBorders(true, true, true, true, true);
            
            // Current year light blue if transferred OUT
            if (currEmp && !isRetained && c >= 4 && c <= 7) {
               cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6EAF8' } };
            }
            // Next year yellow/color if promoted
            if (nextEmp && !isRetained && c >= 8 && c <= 11) {
               if (getGradeLevel(nextEmp.nextGrade) > getGradeLevel(nextEmp.currentGrade)) {
                   const colorCode = getPromotedBgColorCode(nextEmp.nextGrade).replace('#', '').toUpperCase();
                   cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorCode } };
               }
            }
         }
       }
    }
  }
};
\;

  code = code.replace(badLoopMatch[0], newLoopStr);
  fs.writeFileSync('src/utils/exportExcel.js', code);
  console.log('Fixed!');
} else {
  console.log('Not found!');
}
