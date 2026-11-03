import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "views: [{ state: 'frozen', xSplit: 9, ySplit: 5, showGridLines: false }]" in line and i > 2000:
        lines[i] = line.replace("xSplit: 9", "xSplit: 5")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.writelines(lines)