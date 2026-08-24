const ExcelJS = require('exceljs');

async function run() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Test');
  
  ws.mergeCells('A4:A5');
  ws.mergeCells('B4:B5');
  ws.mergeCells('C4:C5');
  ws.mergeCells('D4:G4');
  ws.mergeCells('H4:K4');
  ws.mergeCells('L4:L5');

  for (let rn = 4; rn <= 5; rn++) {
    const row = ws.getRow(rn);
    for (let c = 1; c <= 12; c++) {
      const cell = row.getCell(c);
      
      let topStyle = rn === 4 ? 'medium' : 'thin';
      let bottomStyle = rn === 5 ? 'medium' : 'thin';
      let leftStyle = c === 1 ? 'medium' : 'thin';
      let rightStyle = c === 12 ? 'medium' : 'thin';
      
      if (rn === 4 && (c === 1 || c === 2 || c === 3 || c === 12)) {
         bottomStyle = 'medium';
      }
      
      cell.border = {
        top: { style: topStyle, color: { argb: 'FF000000' } },
        bottom: { style: bottomStyle, color: { argb: 'FF000000' } },
        left: { style: leftStyle, color: { argb: 'FF000000' } },
        right: { style: rightStyle, color: { argb: 'FF000000' } }
      };
      
      cell.value = rn + ',' + c;
    }
  }
  await wb.xlsx.writeFile('borders.xlsx');
  console.log('Saved borders.xlsx');
}
run();
