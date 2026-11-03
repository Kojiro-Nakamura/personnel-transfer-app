import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

old_block = """      if (filteredEmps.length === 0) {
        if (filterLevel > 0) return;
        const row = ws.getRow(currentRowIndex);"""

new_block = """      if (filteredEmps.length === 0) {
        return; // 不要な空白行を挿入しない
        const row = ws.getRow(currentRowIndex);"""

if old_block in code:
    code = code.replace(old_block, new_block)
else:
    print("Could not find the block to replace")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)