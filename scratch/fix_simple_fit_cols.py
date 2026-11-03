import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search_fit = "const fitCols = [5, 6, 7, 9, 10, 11, 12];"
replace_fit = "const fitCols = [5, 6, 7, 9, 10, 11, 12];\n  for (let c = 14; c <= totalCols; c++) fitCols.push(c);"

if search_fit in code:
    code = code.replace(search_fit, replace_fit)
    print("Fixed fitCols in addSimplePlanSheet")
else:
    print("Could not find fitCols string in addSimplePlanSheet")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)