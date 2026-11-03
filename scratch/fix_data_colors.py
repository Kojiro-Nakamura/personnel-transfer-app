import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

t1 = """          if (c >= 11 && c <= 17 && !isRetired && !isUnassigned) {"""
r1 = """          if (((c >= 11 && c <= 17) || c === 19 || c === 39) && !isRetired && !isUnassigned) {"""

if t1 in code:
    code = code.replace(t1, r1)
    print("Fixed data colors in loops")
else:
    print("t1 not found")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)