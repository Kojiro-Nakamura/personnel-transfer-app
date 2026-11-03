import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search = "  ws.columns.forEach((col, i) => {\n    if (i >= 17) { // 'R' ("
replace = "  ws.columns.forEach((col, i) => {\n    if (i === 25 || i === 26 || i === 27) {\n       col.width = 20;\n       return;\n    }\n    if (i >= 17) { // 'R' ("

if search in code:
    code = code.replace(search, replace)
    print("Fixed column widths for Z, AA, AB in addPlanSheet")
else:
    print("Could not find ws.columns.forEach in addPlanSheet")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)