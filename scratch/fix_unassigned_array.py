import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

code = code.replace("const v = new Array(17).fill('');", "const v = new Array(16).fill('');")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)