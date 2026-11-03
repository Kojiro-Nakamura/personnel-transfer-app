import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

t = """  const endTitleCol = ws.getColumn(17 + extraCols.length).letter;
  ws.mergeCells(`A2:${endTitleCol}2`);
  ws.getCell('A2').alignment = { shrinkToFit: true, vertical: 'middle' };
  ws.mergeCells(`A3:Q3`);
  ws.getCell('A3').alignment = { shrinkToFit: true, vertical: 'middle' };"""

r = """  // Changed merge from endTitleCol to Q2 so legend can be placed
  ws.mergeCells(`A2:Q2`);
  ws.getCell('A2').alignment = { shrinkToFit: true, vertical: 'middle' };
  ws.mergeCells(`A3:Q3`);
  ws.getCell('A3').alignment = { shrinkToFit: true, vertical: 'middle' };
  
  // Add legend
  const currYearIndex = Math.max(0, historyYears.indexOf(targetYear - 1));
  const legendEndCol = 39 + currYearIndex;
  const legendLabels = ["凡例", "係長級(主査)", "補佐級I(主任)", "補佐級II(班長)", "補佐級III(補佐兼班長)", "課長級", "所属長級", "次長級", "部長級"];
  const legendStartCol = legendEndCol - 8;
  
  for (let i = 0; i < legendLabels.length; i++) {
    const colNumber = legendStartCol + i;
    if (colNumber > 17) { // Ensure we don't overlap with A2:Q2
      const cell = ws.getRow(2).getCell(colNumber);
      cell.value = legendLabels[i];
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      if (i === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        cell.font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };
      } else {
        const colorHex = getPromotedBgColorCode(legendLabels[i])?.replace('#', '')?.toUpperCase() || 'FFFFFF';
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorHex } };
        cell.font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };
      }
    }
  }"""

code = code.replace(t, r)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)