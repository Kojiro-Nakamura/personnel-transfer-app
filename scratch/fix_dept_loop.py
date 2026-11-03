import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

old_loop = """  departments.forEach((dept) => {
    let dNamePrinted = false;
    const currD = deptMap[dept.id] || { groups: {} };"""

new_loop = """  departments.forEach((dept) => {
    if (dept.id === 'unassigned' || dept.id === 'retired') return;
    let dNamePrinted = false;
    const currD = deptMap[dept.id] || { groups: {} };"""

code = code.replace(old_loop, new_loop)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)