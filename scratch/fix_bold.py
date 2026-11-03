import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# Replace c === 9 with c === 10 in the formatting for processEmps
old_format = """          if (c === 9) {
             cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };
             cell.font = { name: 'BIZ UDPゴシック', size: 9, bold: true };
          }"""

new_format = """          if (c === 10) {
             cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };
             cell.font = { name: 'BIZ UDPゴシック', size: 9, bold: true };
          }"""

code = code.replace(old_format, new_format)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)