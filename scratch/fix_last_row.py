import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

old_last = """  const lastRow = ws.getRow(currentRowIndex - 1);
  if (lastRow) {
    const c1 = lastRow.getCell(1);
    const c2 = lastRow.getCell(2);
    if (c1.border) c1.border = { ...c1.border, bottom: { style: 'thin' } };
    if (c2.border) c2.border = { ...c2.border, bottom: { style: 'thin' } };
  }"""

new_last = """  const lastRow = ws.getRow(currentRowIndex - 1);
  if (lastRow && (currentRowIndex - 1) >= 6) {
    for (let c = 1; c <= 17; c++) {
      const cell = lastRow.getCell(c);
      if (cell.border) {
         cell.border = { ...cell.border, bottom: { style: 'medium' } };
      }
    }
  }"""

code = code.replace(old_last, new_last)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)