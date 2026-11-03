import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if i > 2470 and line.strip() == "const totalCols = 17 + extraCols.length;":
        # Skip this line!
        continue
    new_lines.append(line)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.writelines(new_lines)