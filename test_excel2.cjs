const ExcelJS = require('exceljs');

async function test() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Test');
  
  ws.getCell('A1').value = 12345;
  ws.getCell('A1').numFmt = '000000';
  
  ws.getCell('A2').value = 12345;
  ws.getCell('A2').numFmt = '000000_ ';
  
  ws.getCell('A3').value = 12345;
  ws.getCell('A3').numFmt = '000000;@';
  
  ws.getCell('A4').value = 12345;
  ws.getCell('A4').numFmt = '000000_);';
  
  await wb.xlsx.writeFile('test2.xlsx');
  console.log('Saved test2.xlsx');
}
test();
