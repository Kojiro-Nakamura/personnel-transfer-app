import os
import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# Replace the complicated structDeptHighlight logic with the simple topStyle logic
old_border_pattern = r"[ \t]*let structDeptHighlight = isNewDeptRow;[\s\S]*?cell\.border = cBorder;"

new_border = """          let topStyle = isNewDeptRow ? 'thick' : 'thin';
          let bottomStyle = 'thin';

          if (c === 1 || c === 2) {
             if (isNewDeptRow) {
                 topStyle = 'thick';
             } else if (isNewGroupRow) {
                 topStyle = 'thin';
             } else {
                 topStyle = null;
             }
             bottomStyle = null;
          }

          let cBorder = { left: { style: 'thin' }, right: { style: 'thin' } };
          if (topStyle) cBorder.top = { style: topStyle };
          if (bottomStyle) cBorder.bottom = { style: bottomStyle };
          cell.border = cBorder;"""

code = re.sub(old_border_pattern, new_border, code)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)