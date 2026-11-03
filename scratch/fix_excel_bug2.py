import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# Loop 1 & 2 (they both use `vals`)
code = code.replace(
    "const isNewDeptRow = (ws.getCell(cell.row, 1).value !== '' && ws.getCell(cell.row, 1).value !== null);",
    "const isNewDeptRow = (vals[0] !== '' && vals[0] !== null);"
)
code = code.replace(
    "const isNewGroupRow = (ws.getCell(cell.row, 2).value !== '' && ws.getCell(cell.row, 2).value !== null);",
    "const isNewGroupRow = (vals[1] !== '' && vals[1] !== null);"
)

# Wait, loop 4 uses `v`, not `vals`.
# So let's revert and do it carefully.