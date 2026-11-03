import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

code = code.replace("cell.row.getCell(1).value", "ws.getCell(cell.row, 1).value")
code = code.replace("cell.row.getCell(2).value", "ws.getCell(cell.row, 2).value")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)