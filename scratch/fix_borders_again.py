import os
import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# Fix freeze pane
code = code.replace(
    "ws.views = [{ state: 'frozen', xSplit: 9, ySplit: 5, showGridLines: false }];",
    "ws.views = [{ state: 'frozen', xSplit: 5, ySplit: 5, showGridLines: false }];"
)

# Fix double group name in `processEmps`
# Right now, `groupName` is printed if `idx === 0 && groupName`.
# But `processEmps` is called multiple times per group.
# We need to track `lastPrintedGroup` at the dept level.
old_dept_forEach = """  departments.forEach((dept) => {
    if (dept.id === 'unassigned' || dept.id === 'retired') return;
    let dNamePrinted = false;
    const currD = deptMap[dept.id] || { groups: {} };"""

new_dept_forEach = """  departments.forEach((dept) => {
    if (dept.id === 'unassigned' || dept.id === 'retired') return;
    let dNamePrinted = false;
    let lastPrintedGroup = '';
    const currD = deptMap[dept.id] || { groups: {} };"""

code = code.replace(old_dept_forEach, new_dept_forEach)

old_group_print = "vals[1] = (idx === 0 && groupName) ? groupName : '';"
new_group_print = """        if (idx === 0 && groupName && groupName !== lastPrintedGroup) {
          vals[1] = groupName;
          lastPrintedGroup = groupName;
        } else {
          vals[1] = '';
        }"""
code = code.replace(old_group_print, new_group_print)


# Update border logic in ALL 4 loops
old_border = """          const isNewDeptRow = (ws.getCell(cell.row, 1).value !== '' && ws.getCell(cell.row, 1).value !== null);
          const isNewGroupRow = (ws.getCell(cell.row, 2).value !== '' && ws.getCell(cell.row, 2).value !== null);
          
          let topStyle = isNewDeptRow ? 'thick' : 'thin';
          let bottomStyle = 'thin';

          if (c === 1) {
             if (!isNewDeptRow) topStyle = null;
             bottomStyle = isNewDeptRow ? 'thin' : null;
          } else if (c === 2) {
             if (!isNewDeptRow) topStyle = null;
             bottomStyle = (isNewDeptRow || isNewGroupRow) ? 'thin' : null;
          }

          let cBorder = { left: { style: 'thin' }, right: { style: 'thin' } };
          if (topStyle) cBorder.top = { style: topStyle };
          if (bottomStyle) cBorder.bottom = { style: bottomStyle };
          cell.border = cBorder;"""

new_border = """          const isNewDeptRow = (ws.getCell(cell.row, 1).value !== '' && ws.getCell(cell.row, 1).value !== null);
          const isNewGroupRow = (ws.getCell(cell.row, 2).value !== '' && ws.getCell(cell.row, 2).value !== null);
          
          let structDeptHighlight = isNewDeptRow;
          let structGroupHighlight = isNewDeptRow || isNewGroupRow;
          
          if (typeof idx !== 'undefined' && typeof groupName !== 'undefined' && typeof postName !== 'undefined') {
             const isPostRow = (idx === 0 && !!postName);
             const isDeptPost = isPostRow && !groupName;
             const isGroupPost = isPostRow && !!groupName;
             structDeptHighlight = isNewDeptRow || isDeptPost;
             structGroupHighlight = structDeptHighlight || isNewGroupRow || isGroupPost;
          }

          let topStyle = isNewDeptRow ? 'thick' : 'thin';
          let bottomStyle = 'thin';

          if (c === 1) {
             if (!isNewDeptRow) topStyle = null;
             bottomStyle = structDeptHighlight ? 'thin' : null;
          } else if (c === 2) {
             if (!isNewDeptRow) topStyle = null;
             bottomStyle = structGroupHighlight ? 'thin' : null;
          }

          let cBorder = { left: { style: 'thin' }, right: { style: 'thin' } };
          if (topStyle) cBorder.top = { style: topStyle };
          if (bottomStyle) cBorder.bottom = { style: bottomStyle };
          cell.border = cBorder;"""

code = code.replace(old_border, new_border)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)