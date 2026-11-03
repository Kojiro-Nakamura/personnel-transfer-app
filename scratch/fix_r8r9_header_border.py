import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

target = "ws.getCell('R4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };"
replacement = "ws.getCell('R4').border = { left: { style: 'thin' }, right: { style: 'thin' } };"

if target in code:
    code = code.replace(target, replacement)
    print("Replaced R4 border successfully")
    with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
        f.write(code)
else:
    print("Target not found.")