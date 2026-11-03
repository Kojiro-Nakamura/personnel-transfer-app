import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

t = """          if (((c >= 11 && c <= 17) || c === 19 || c === 39) && !isRetired && !isUnassigned) {"""
r = """          if (((c >= 11 && c <= 17) || c === 4 || c === 5 || c === 19 || c === 39) && !isRetired && !isUnassigned) {"""
code = code.replace(t, r)

t2 = """        if (((c >= 11 && c <= 17) || c === 19 || c === 39) && !isRetired && !isUnassigned) {"""
r2 = """        if (((c >= 11 && c <= 17) || c === 4 || c === 5 || c === 19 || c === 39) && !isRetired && !isUnassigned) {"""
code = code.replace(t2, r2)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)