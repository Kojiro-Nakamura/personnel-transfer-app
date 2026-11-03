import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

code = code.replace("const g = d.groups.find(x => x.id === gId);", "const g = (d.groups || []).find(x => x.id === gId);")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)