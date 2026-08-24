const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const legendMatch = code.match(/\/\/ Legend[\s\S]*?currentRowIndex \+= 2;/);

if (legendMatch) {
  const newLegendBlock = `// Legend
  const legendLabels = [
    '部長級', '次長級', '所属長級', '課長級', '補佐級III(補佐兼班長)', '補佐級II(班長)', '補佐級I(主任)', '係長級(主査)'
  ];
  let legendCol = 42 - (legendLabels.length * 2);
  
  // "凡例" text
  const hanreiCol = legendCol - 2;
  for (let c = 0; c < 2; c++) {
    ws.getCell(2, hanreiCol + c).border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
  }
  const hanreiCell = ws.getCell(2, hanreiCol);
  hanreiCell.value = '凡例';
  hanreiCell.font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };
  hanreiCell.alignment = { horizontal: 'center', vertical: 'middle', shrinkToFit: true };
  ws.mergeCells(2, hanreiCol, 2, hanreiCol + 1);

  for (let i = 0; i < legendLabels.length; i++) {
    for (let c = 0; c < 2; c++) {
      const cCell = ws.getCell(2, legendCol + c);
      cCell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
    }
    const cell = ws.getCell(2, legendCol);
    cell.value = legendLabels[i];
    cell.font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };
    const colorHex = getPromotedBgColorCode(legendLabels[i])?.replace('#', '')?.toUpperCase() || 'FFFFFF';
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorHex } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', shrinkToFit: true };
    ws.mergeCells(2, legendCol, 2, legendCol + 1);
    legendCol += 2;
  }

  currentRowIndex += 3;`;

  code = code.replace(legendMatch[0], newLegendBlock);
  fs.writeFileSync('src/utils/exportExcel.js', code);
  console.log('done');
} else {
  console.log('not found');
}
