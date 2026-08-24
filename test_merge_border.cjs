const ExcelJS = require('exceljs');

async function run() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Test');
  
  ws.mergeCells('A4:A5');

  const cellA4 = ws.getCell('A4');
  cellA4.border = { top: { style: 'medium', color: { argb: 'FF000000' } } };
  
  const cellA5 = ws.getCell('A5');
  cellA5.border = { top: { style: 'thin', color: { argb: 'FF000000' } } };
  
  console.log(cellA4.border.top.style);
  console.log(cellA4 === cellA5);
}
run();
