const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// 1. ws.views
code = code.replace(
    const ws = workbook.addWorksheet(sheetName, {\n    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 1, margins: { left: 0.2, right: 0.2, top: 0.3, bottom: 0.3, header: 0.1, footer: 0.1 } }\n  });,
    const ws = workbook.addWorksheet(sheetName, {\n    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 1, margins: { left: 0.2, right: 0.2, top: 0.3, bottom: 0.3, header: 0.1, footer: 0.1 } },\n    views: [{ showGridLines: false }]\n  });
);

// 2. A列 width 9.51
code = code.replace(
      ws.getColumn(1).width = 4;,
      ws.getColumn(1).width = 9.51;
);

// 3. row.height = 13.20 for data rows
code = code.replace(
        const row = ws.getRow(currentRowIndex + r);\n      row.getCell(1).value = r + 1;,
        const row = ws.getRow(currentRowIndex + r);\n      row.height = 13.20;\n      row.getCell(1).value = r + 1;
);

// row.height = 13.20 for summary rows as well
code = code.replace(
      summaryRows.forEach(sr => {\n      const row = ws.getRow(currentRowIndex);\n      row.getCell(1).value = sr.label;,
      summaryRows.forEach(sr => {\n      const row = ws.getRow(currentRowIndex);\n      row.height = 13.20;\n      row.getCell(1).value = sr.label;
);

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');