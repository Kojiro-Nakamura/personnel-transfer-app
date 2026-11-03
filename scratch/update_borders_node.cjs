const fs = require('fs');

let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const start = code.indexOf('export const addCurrentBasePlanSheet');
if (start !== -1) {
    let pre = code.substring(0, start);
    let func = code.substring(start);
    
    const newCellLogic = `
          let cBorder = { left: { style: 'thin' }, right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } };
          if (c === 1 || c === 2) {
             cBorder.bottom = undefined;
             if (!cell.value || cell.value.toString().trim() === '') {
                 cBorder.top = undefined;
             }
          }
          cell.border = cBorder;
          cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };
`;

    func = func.replace(
        /cell\.border = borderStyle;\s+cell\.alignment = \{ vertical: 'middle', shrinkToFit: true, wrapText: false \};/g,
        newCellLogic.trim()
    );

    const endStr = `ws.views = [{ state: 'frozen', xSplit: 9, ySplit: 5 }];`;
    const finishLine = `
  const lastRow = ws.getRow(currentRowIndex - 1);
  if (lastRow) {
    const c1 = lastRow.getCell(1);
    const c2 = lastRow.getCell(2);
    if (c1.border) c1.border = { ...c1.border, bottom: { style: 'thin' } };
    if (c2.border) c2.border = { ...c2.border, bottom: { style: 'thin' } };
  }
  ` + endStr;
    
    func = func.replace(endStr, finishLine);

    code = pre + func;
    fs.writeFileSync('src/utils/exportExcel.js', code, 'utf8');
}