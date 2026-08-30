import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search = """      let argb = 'FFCBD5E1';
      if (c === 2 || c === 3) argb = 'FFFDBA74'; // Orange 300
      else if (c >= 4 && c <= 7) argb = 'FFFEF3C7'; // Amber 100
      else if (c >= 8 && c <= 12) argb = 'FFDBEAFE'; // Blue 100
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };"""

replace = """      if (c <= 12) {
        let argb = 'FFCBD5E1';
        if (c === 2 || c === 3) argb = 'FFFDBA74'; // Orange 300
        else if (c >= 4 && c <= 7) argb = 'FFFEF3C7'; // Amber 100
        else if (c >= 8 && c <= 12) argb = 'FFDBEAFE'; // Blue 100
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
      }"""

code = code.replace(search, replace)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)

print("Applied fix for header coloring overwrite in simple plan")