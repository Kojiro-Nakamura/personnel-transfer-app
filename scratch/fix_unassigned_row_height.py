import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

code = code.replace("r.height = 24;", "r.height = 13.20;")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)