import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search_width = "  ws.getColumn(8).width = 12;"
replace_width = "  ws.getColumn(8).width = 12;\n  ws.getColumn(23).width = 20;\n  ws.getColumn(24).width = 20;"

if search_width in code:
    code = code.replace(search_width, replace_width)
    print("Added fixed widths for cols 23 and 24")
else:
    print("Could not find ws.getColumn(8).width in addSimplePlanSheet")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)