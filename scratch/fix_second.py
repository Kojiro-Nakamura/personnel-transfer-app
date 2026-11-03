import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

old_c9_font_2 = """        if (c === 7 || c === 8 || c === 9 || c === 14 || c === 15) cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };"""

new_c9_font_2 = """        if (c === 7 || c === 8 || c === 9 || c === 14 || c === 15) cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };
        if (c === 9) cell.font = { name: 'BIZ UDPゴシック', size: 9, bold: true };"""

code = code.replace(old_c9_font_2, new_c9_font_2)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)