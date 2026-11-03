import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

t2 = """        if (c >= 11 && c <= 17 && !isRetired && !isUnassigned) {"""
r2 = """        if (((c >= 11 && c <= 17) || c === 19 || c === 39) && !isRetired && !isUnassigned) {"""

if t2 in code:
    code = code.replace(t2, r2)
    print("Fixed data colors in loop 2")
else:
    print("t2 not found")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)