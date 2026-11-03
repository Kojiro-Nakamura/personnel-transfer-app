import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. Add `let firstGroupPrinted = false;` to the department loop
old_dept_init = """    if (dept.id === 'unassigned' || dept.id === 'retired') return;
    let dNamePrinted = false;
    let lastPrintedGroup = '';
    const currD = deptMap[dept.id] || { groups: {} };"""

new_dept_init = """    if (dept.id === 'unassigned' || dept.id === 'retired') return;
    let dNamePrinted = false;
    let lastPrintedGroup = '';
    let firstGroupPrinted = false;
    const currD = deptMap[dept.id] || { groups: {} };"""

code = code.replace(old_dept_init, new_dept_init)

# 2. Add `let isFirstGroupOfDept = false;` logic when setting `vals[1] = groupName;`
old_group_print = """        if (idx === 0 && groupName && groupName !== lastPrintedGroup) {
          vals[1] = groupName;
          lastPrintedGroup = groupName;
        } else {
          vals[1] = '';
        }"""

new_group_print = """        let isFirstGroupOfDept = false;
        if (idx === 0 && groupName && groupName !== lastPrintedGroup) {
          vals[1] = groupName;
          lastPrintedGroup = groupName;
          if (!firstGroupPrinted) {
             isFirstGroupOfDept = true;
             firstGroupPrinted = true;
          }
        } else {
          vals[1] = '';
        }"""
code = code.replace(old_group_print, new_group_print)

# 3. Modify the border logic in the 4 loops to use `isFirstGroupOfDept` for Col A
old_border = """          if (c === 1 || c === 2) {
             if (isNewDeptRow) {
                 topStyle = 'thick';
             } else if (isNewGroupRow) {
                 topStyle = 'thin';
             } else {
                 topStyle = null;
             }
             bottomStyle = null;
          }"""

new_border = """          if (c === 1) {
             if (isNewDeptRow) {
                 topStyle = 'thick';
             } else if (isNewGroupRow && typeof isFirstGroupOfDept !== 'undefined' && isFirstGroupOfDept) {
                 topStyle = 'thin';
             } else {
                 topStyle = null;
             }
             bottomStyle = null;
          } else if (c === 2) {
             if (isNewDeptRow) {
                 topStyle = 'thick';
             } else if (isNewGroupRow) {
                 topStyle = 'thin';
             } else {
                 topStyle = null;
             }
             bottomStyle = null;
          }"""

code = code.replace(old_border, new_border)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)