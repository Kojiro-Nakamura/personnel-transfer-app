import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

code = code.replace("const currD = deptMap.current[dept.id] || { groups: {} };", "const currD = deptMap[dept.id] || { groups: {} };")
code = code.replace("const uObj = deptMap.current['unassigned'];", "const uObj = deptMap['unassigned'];")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)