import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "if (row.changeIndexes && row.changeIndexes.includes(c - 1)) {" in line:
        new_lines.append("             const targetRow = typeof row !== 'undefined' ? row : (typeof r !== 'undefined' ? r : null);\n")
        new_lines.append("             if (targetRow && targetRow.changeIndexes && targetRow.changeIndexes.includes(c - 1)) {\n")
    else:
        new_lines.append(line)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.writelines(new_lines)