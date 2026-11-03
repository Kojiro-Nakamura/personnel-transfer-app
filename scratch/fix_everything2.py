import os
import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. Skip empty rows
old_empty = """      if (filteredEmps.length === 0) {
        if (filterLevel > 0) return;"""
new_empty = """      if (filteredEmps.length === 0) {
        return; // 不要な空白行を挿入しない"""
code = code.replace(old_empty, new_empty)

# 2. Change ⇒ back to →
code = code.replace("vals[8] = '⇒';", "vals[8] = '→';")
code = code.replace("v[8] = '⇒';", "v[8] = '→';")

# 3. Update borders
pattern = r"[ \t]*let cBorder = \{ left: \{ style: 'thin' \}, right: \{ style: 'thin' \}, top: \{ style: 'thin' \}, bottom: \{ style: 'thin' \} \};\n[ \t]*if \(c === 1 \|\| c === 2\) \{\n[ \t]*cBorder\.bottom = undefined;\n[ \t]*if \(!cell\.value \|\| cell\.value\.toString\(\)\.trim\(\) === ''\) \{\n[ \t]*cBorder\.top = undefined;\n[ \t]*\}\n[ \t]*\}\n[ \t]*cell\.border = cBorder;"

new_border = """          const isNewDeptRow = (cell.row.getCell(1).value !== '' && cell.row.getCell(1).value !== null);
          const isNewGroupRow = (cell.row.getCell(2).value !== '' && cell.row.getCell(2).value !== null);
          
          let topStyle = isNewDeptRow ? 'thick' : 'thin';
          let bottomStyle = 'thin';

          if (c === 1) {
             if (!isNewDeptRow) topStyle = null;
             bottomStyle = isNewDeptRow ? 'thin' : null;
          } else if (c === 2) {
             if (!isNewDeptRow) topStyle = null;
             bottomStyle = (isNewDeptRow || isNewGroupRow) ? 'thin' : null;
          }

          let cBorder = { left: { style: 'thin' }, right: { style: 'thin' } };
          if (topStyle) cBorder.top = { style: topStyle };
          if (bottomStyle) cBorder.bottom = { style: bottomStyle };
          cell.border = cBorder;"""

code = re.sub(pattern, new_border, code)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)