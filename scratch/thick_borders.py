import os
import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. Update header borders
old_header_border = """  const borderStyle = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

  for (let c = 1; c <= 17; c++) {
    const c4 = ws.getCell(4, c);
    const c5 = ws.getCell(5, c);
    c4.border = borderStyle;
    c5.border = borderStyle;"""

new_header_border = """  for (let c = 1; c <= 17; c++) {
    const c4 = ws.getCell(4, c);
    const c5 = ws.getCell(5, c);
    const isLeftEdge = [1, 4, 11].includes(c);
    const isRightEdge = [3, 9, 17].includes(c);
    
    c4.border = {
       top: { style: 'medium' },
       bottom: { style: 'thin' },
       left: { style: isLeftEdge ? 'medium' : 'thin' },
       right: { style: isRightEdge ? 'medium' : 'thin' }
    };
    c5.border = {
       top: { style: 'thin' },
       bottom: { style: 'medium' },
       left: { style: isLeftEdge ? 'medium' : 'thin' },
       right: { style: isRightEdge ? 'medium' : 'thin' }
    };"""

code = code.replace(old_header_border, new_header_border)

# 2. Update data rows borders
# We need to replace `let cBorder = { left: { style: 'thin' }, right: { style: 'thin' } };` with `isLeftEdge` logic in all 4 loops.
old_cBorder = """          let cBorder = { left: { style: 'thin' }, right: { style: 'thin' } };"""
new_cBorder = """          const isLeftEdge = [1, 4, 11].includes(c);
          const isRightEdge = [3, 9, 17].includes(c);
          let cBorder = { left: { style: isLeftEdge ? 'medium' : 'thin' }, right: { style: isRightEdge ? 'medium' : 'thin' } };"""

code = code.replace(old_cBorder, new_cBorder)

# Also we should change `topStyle = isNewDeptRow ? 'thick' : 'thin';` to `medium` so it matches the thick border style.
code = code.replace("topStyle = isNewDeptRow ? 'thick' : 'thin';", "topStyle = isNewDeptRow ? 'medium' : 'thin';")
code = code.replace("topStyle = 'thick';", "topStyle = 'medium';")

# 3. Add bottom border to the very last row
bottom_border_code = """  const lastDataRow = currentRowIndex - 1;
  if (lastDataRow >= 6) {
    for (let c = 1; c <= 17; c++) {
      const cell = ws.getCell(lastDataRow, c);
      if (cell.border) cell.border.bottom = { style: 'medium' };
    }
  }

  // Freeze panes..."""

code = code.replace("  // === ウィンドウ枠の固定 ===", bottom_border_code + "\n  // === ウィンドウ枠の固定 ===")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)