const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const injectionPoint = 'export const addBirthYearSheet';
const sheetCodeStartIndex = code.indexOf(injectionPoint);

if (sheetCodeStartIndex !== -1) {
  let sheetCode = code.substring(sheetCodeStartIndex);
  
  sheetCode = sheetCode.replace(
    /pageSetup: \{ paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 1, margins: \{ left: 0\.2, right: 0\.2, top: 0\.3, bottom: 0\.3, header: 0\.1, footer: 0\.1 \} \}/,
    "pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 1, margins: { left: 0.2, right: 0.2, top: 0.3, bottom: 0.3, header: 0.1, footer: 0.1 } },\n    views: [{ showGridLines: false }]"
  );
  
  sheetCode = sheetCode.replace(
    /ws\.getColumn\(1\)\.width = 4;/,
    "ws.getColumn(1).width = 9.51;"
  );
  
  sheetCode = sheetCode.replace(
    /const row = ws\.getRow\(currentRowIndex \+ r\);\n\s*row\.getCell\(1\)\.value = r \+ 1;/g,
    "const row = ws.getRow(currentRowIndex + r);\n      row.height = 13.20;\n      row.getCell(1).value = r + 1;"
  );
  
  sheetCode = sheetCode.replace(
    /summaryRows\.forEach\(sr => \{\n\s*const row = ws\.getRow\(currentRowIndex\);\n\s*row\.getCell\(1\)\.value = sr\.label;/g,
    "summaryRows.forEach(sr => {\n      const row = ws.getRow(currentRowIndex);\n      row.height = 13.20;\n      row.getCell(1).value = sr.label;"
  );
  
  code = code.substring(0, sheetCodeStartIndex) + sheetCode;
  fs.writeFileSync('src/utils/exportExcel.js', code);
  console.log('done');
}