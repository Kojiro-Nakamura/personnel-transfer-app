const fs = require('fs');

let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const start = code.indexOf('export const addCurrentBasePlanSheet');
if (start !== -1) {
    let pre = code.substring(0, start);
    let func = code.substring(start);
    
    // 1. Remove the unreachable empty row block
    // Since my previous replace failed because it didn't match perfectly, let's fix it properly.
    // In exportExcel.js it currently has:
    //      if (filteredEmps.length === 0) {
    //        return; // 不要な空白行を挿入しない
    //        const row = ws.getRow(currentRowIndex);
    //        ...
    //        currentRowIndex++;
    //      }
    const emptyRowRegex = /if \(filteredEmps\.length === 0\) \{\s*return; \/\/ 不要な空白行を挿入しない[\s\S]*?currentRowIndex\+\+;\s*\}/;
    func = func.replace(emptyRowRegex, 'if (filteredEmps.length === 0) {\n        return;\n      }');

    // 2. Change ⇒ back to →
    func = func.replace(/vals\[8\] = '⇒';/g, "vals[8] = '→';");
    func = func.replace(/v\[8\] = '⇒';/g, "v[8] = '→';");

    // 3. Update the loops to use the new border logic
    const newBorderLogic = `
          const isNewDeptRow = (cell.row.getCell(1).value !== '' && cell.row.getCell(1).value !== null);
          const isNewGroupRow = (cell.row.getCell(2).value !== '' && cell.row.getCell(2).value !== null);
          
          let topStyle = isNewDeptRow ? 'thick' : 'thin';
          let bottomStyle = 'thin';

          if (c === 1) {
             if (!isNewDeptRow) topStyle = null;
             bottomStyle = isNewDeptRow ? 'thin' : null;
          } else if (c === 2) {
             if (!isNewDeptRow) topStyle = null;
             bottomStyle = (isNewDeptRow || isNewGroupRow) ? 'thin' : null;
          }

          let cBorder = { left: { style: 'thin' }, right: { style: 'thin' } };
          if (topStyle) cBorder.top = { style: topStyle };
          if (bottomStyle) cBorder.bottom = { style: bottomStyle };
          cell.border = cBorder;
`;

    func = func.replace(/let cBorder = \{ left: \{ style: 'thin' \}[\s\S]*?cell\.border = cBorder;/g, newBorderLogic.trim());

    code = pre + func;
    fs.writeFileSync('src/utils/exportExcel.js', code, 'utf8');
}