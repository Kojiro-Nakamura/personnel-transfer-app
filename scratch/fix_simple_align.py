import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search_align = "const isLeft = (c === 1 || c === 12 || c === 2 || c === 3 || (c >= 14 && c <= 16) || (c >= 22 && c <= 24) || c >= 35);"
replace_align = "const isLeft = (c === 1 || c === 12 || c === 2 || c === 3 || (c >= 22 && c <= 24) || c >= 35);"

if search_align in code:
    code = code.replace(search_align, replace_align)
    print("Fixed alignment in addSimplePlanSheet")
else:
    print("Could not find alignment string in addSimplePlanSheet")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)