const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// 1. Margins
code = code.replace(
  /margins: \{ left: 0\.2, right: 0\.2, top: 0\.3, bottom: 0\.3, header: 0\.1, footer: 0\.1 \}/,
  "margins: { left: 0.2, right: 0.2, top: 0.8, bottom: 0.3, header: 0.1, footer: 0.1 }"
);

// 2. Insert Legend
const legendInsertion = `
  ws.getCell(currentRowIndex, 1).value = '令和' + (targetYear - 2019) + '年度林学職生年別一覧';
  ws.getCell(currentRowIndex, 1).font = titleFont;
  
  // Legend
  const legendLabels = [
    '部長級', '次長級', '所属長級', '課長級', '補佐級III(補佐兼班長)', '補佐級II(班長)', '補佐級I(主任)', '係長級(主査)'
  ];
  let legendCol = 42 - (legendLabels.length * 2);
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
`;

code = code.replace(
  /ws\.getCell\(currentRowIndex, 1\)\.value = '令和' \+ \(targetYear - 2019\) \+ '年度林学職生年別一覧';\n\s*ws\.getCell\(currentRowIndex, 1\)\.font = titleFont;/,
  legendInsertion
);

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');