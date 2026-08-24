const ExcelJS = require('exceljs');

async function run() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Test');
  
  ws.mergeCells('A4:A5');

  for (let rn = 4; rn <= 5; rn++) {
    const row = ws.getRow(rn);
    for (let c = 1; c <= 1; c++) {
      const cell = row.getCell(c);
      
      let topStyle = rn === 4 ? 'medium' : 'thin';
      let bottomStyle = rn === 5 ? 'medium' : 'thin';
      let leftStyle = c === 1 ? 'medium' : 'thin';
      let rightStyle = c === 12 ? 'medium' : 'thin';
      
      if (c === 1 || c === 2 || c === 3 || c === 12) {
         topStyle = 'medium';
         bottomStyle = 'medium';
      }
      
      cell.border = {
        top: { style: topStyle, color: { argb: 'FF000000' } },
        bottom: { style: bottomStyle, color: { argb: 'FF000000' } },
        left: { style: leftStyle, color: { argb: 'FF000000' } },
        right: { style: rightStyle, color: { argb: 'FF000000' } }
      };
    }
  }
  
  const cellA4 = ws.getCell('A4');
  console.log('top:', cellA4.border.top.style);
  console.log('bottom:', cellA4.border.bottom.style);
}
run();
