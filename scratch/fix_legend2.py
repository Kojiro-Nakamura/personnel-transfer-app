import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

t = "const legendEndCol = 39 + currYearIndex;"
r = "const legendEndCol = 42 + currYearIndex;"

code = code.replace(t, r)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)