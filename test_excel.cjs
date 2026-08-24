const ExcelJS = require('exceljs');

async function test() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Test');
  
  // 1. Text format
  ws.getCell('A1').value = '012345';
  ws.getCell('A1').numFmt = '@';
  
  // 2. Apostrophe string
  ws.getCell('A2').value = \"'012345\";
  
  // 3. Number with format
  ws.getCell('A3').value = 12345;
  ws.getCell('A3').numFmt = '000000';
  
  // 4. Object formula for apostrophe ? No, just string
  
  await wb.xlsx.writeFile('test.xlsx');
  console.log('Saved test.xlsx');
}
test();
