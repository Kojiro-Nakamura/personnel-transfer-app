const ExcelJS = require('exceljs');

async function run() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Test');
  
  const row = ws.addRow(['A', 'B', 'C']);
  
  // Set fill on col 2
  row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
  
  // Now do eachCell
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    let argb = 'FFFFFFFF';
    if (colNumber === 1) argb = 'FF00FF00';
    
    if (argb !== 'FFFFFFFF') {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
    }
  });
  
  await wb.xlsx.writeFile('test.xlsx');
  console.log('Done');
}
run();