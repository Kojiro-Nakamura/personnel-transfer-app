import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search_width = "  ws.getColumn(23).width = 20;\n  ws.getColumn(24).width = 20;"
replace_width = "  ws.getColumn(22).width = 20;\n  ws.getColumn(23).width = 20;\n  ws.getColumn(24).width = 20;"

search_fit = "if (c !== 23 && c !== 24) fitCols.push(c);"
replace_fit = "if (c !== 22 && c !== 23 && c !== 24) fitCols.push(c);"

if search_width in code and search_fit in code:
    code = code.replace(search_width, replace_width)
    code = code.replace(search_fit, replace_fit)
    print("Added fixed width for col 22")
else:
    print("Could not find the target strings in addSimplePlanSheet")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)