const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// I will extract addPlanSheet body, change the name, change the headers, columns, and rowVals logic, then replace addSimplePlanSheet

const exportPlanStr = code.substring(
  code.indexOf('export const addPlanSheet ='),
  code.indexOf('export const exportPlanToExcel =')
);

// We need to parse addPlanSheet and replace everything inside to make it simple plan sheet.
// It's probably easier to just write a script that replaces the specific parts of addPlanSheet to create addSimplePlanSheet.

let newFunc = exportPlanStr.replace('export const addPlanSheet =', 'export const addSimplePlanSheet =');

// 1. Remove the "historyYears" logic from headers
newFunc = newFunc.replace(/const r4Vals = \[.*\];/g, "const r4Vals = ['部署名', '配属希望', '特殊事情', \今年度（\(R\)）\, '', '', '', \来年度（\(R\)）\, '', '', '', ''];");
newFunc = newFunc.replace(/r4Vals\.push\('氏名', \年齢.*?;\n/g, "");
newFunc = newFunc.replace(/historyYears\.forEach\(\(y, i\) => \{[\s\S]*?\}\);\n/g, "");

newFunc = newFunc.replace(/const r5Vals = \[.*\];/g, "const r5Vals = ['', '', '', '職名', '氏名', '在籍', '年齢', '職名', '氏名', '在籍', '年齢', '備考'];");
newFunc = newFunc.replace(/r5Vals\.push\('氏名', '年齢'.*?;\n/g, "");
newFunc = newFunc.replace(/historyYears\.forEach\(y => r5Vals\.push.*?;\n/g, "");

// 2. Fix merges
newFunc = newFunc.replace(/ws\.mergeCells\('A4:A5'\);\n[\s\S]*?ws\.mergeCells\(AJ4:\4\);\n  \}/m, "ws.mergeCells('A4:A5');\n  ws.mergeCells('B4:B5');\n  ws.mergeCells('C4:C5');\n  ws.mergeCells('D4:G4');\n  ws.mergeCells('H4:L4');");

// 3. Fix Header coloring loop
newFunc = newFunc.replace(/for \(let rn = 4; rn <= 5; rn\+\+\) \{[\s\S]*?\}\n    \}\n  \}/m, \or (let rn = 4; rn <= 5; rn++) {
    const row = ws.getRow(rn);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { size: 9, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = getCellBorders(true, true, true, true, true);
      let argb = 'FFCBD5E1';
      if (colNumber === 2 || colNumber === 3) argb = 'FF86EFAC';
      else if (colNumber >= 4 && colNumber <= 7) argb = 'FFFDE68A';
      else if (colNumber >= 8) argb = 'FFBFDBFE';
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
    });
  }\);

// 4. Set widths
newFunc = newFunc.replace(/for \(let i = 1; i <= 38 \+ historyYears\.length; i\+\+\) \{[\s\S]*?\}\n  \}\)/m, \ws.getColumn(1).width = 20;
  ws.getColumn(2).width = 10;
  ws.getColumn(3).width = 10;
  ws.getColumn(4).width = 12;
  ws.getColumn(5).width = 18;
  ws.getColumn(6).width = 10;
  ws.getColumn(7).width = 8;
  ws.getColumn(8).width = 12;
  ws.getColumn(9).width = 18;
  ws.getColumn(10).width = 10;
  ws.getColumn(11).width = 8;
  ws.getColumn(12).width = 25;\);

// 5. Fix displayDeptStr and displayGroupStr 
newFunc = newFunc.replace(/displayDeptStr = \\ （今:\ \/ 来:\）\;/g, "displayDeptStr = \\ \→\\;");
newFunc = newFunc.replace(/displayGroupStr = \\ （今:\ \/ 来:\）\;/g, "displayGroupStr = \\ \→\\;");

// 6. Fix the rowVals push
newFunc = newFunc.replace(/const rowVals = \[\s*displayDeptStr, displayGroupStr, displayPost,[\s\S]*?rowVals\.push\(nYearStr\);\s*/m, \let rowVals = [
      displayDeptStr || displayGroupStr, 
      currEmp && !extEmp ? (currEmp.desiredAssignment || '') : (extEmp ? extEmp.desiredAssignment || '' : ''), 
      currEmp && !extEmp ? (currEmp.specialCircumstances || '') : (extEmp ? extEmp.specialCircumstances || '' : ''), 
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
    
    if (isAbolishedPost) {
       rowVals[7] = ''; rowVals[8] = '後任なし'; rowVals[9] = ''; rowVals[10] = '';
    } else if (currEmp && nextEmp && currEmp.id === nextEmp.id) {
       rowVals[7] = nextEmp.nextTitle; rowVals[8] = ''; rowVals[9] = ''; rowVals[10] = '';
    }
    \);
    
// 7. Fix cell formatting loop (it used to be for(let i=1; i<=rowVals.length; i++))
newFunc = newFunc.replace(/const tr = ws\.addRow\(rowVals\);\n[\s\S]*?\}\);\n    \}\n  \}\n\};\n/m, \const tr = ws.addRow(rowVals);
      
      const isRetained = currEmp && nextEmp && currEmp.id === nextEmp.id;
      for(let c=1; c<=12; c++){
         const cell = tr.getCell(c);
         cell.alignment = { vertical: 'middle', horizontal: c >= 6 && c !== 12 ? 'center' : 'left' };
         cell.font = { size: 9 };
         if (c === 5 || c === 9) cell.font.bold = true;
         cell.border = getCellBorders(true, true, true, true, true);
         
         if (currEmp && !isRetained && c >= 4 && c <= 7) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBAE6FD' } };
         }
         if (nextEmp && !isRetained && c >= 8 && c <= 11) {
            if (getGradeLevel(nextEmp.nextGrade) > getGradeLevel(nextEmp.currentGrade)) {
                const colorCode = getPromotedBgColorCode(nextEmp.nextGrade).replace('#', '').toUpperCase();
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorCode } };
            }
         }
      }
    }
  });
};
\);

// Now replace the old addSimplePlanSheet with the new one
const startIdx = code.indexOf('export const addSimplePlanSheet =');
const endIdx = code.indexOf('export const exportPlanToExcel =');
code = code.substring(0, startIdx) + newFunc + '\n' + code.substring(endIdx);

fs.writeFileSync('src/utils/exportExcel.js', code);
