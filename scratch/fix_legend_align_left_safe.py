import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const legendEndCol =" in line and "targetYearIndex" in line:
        # Extract the number
        match = re.search(r'const legendEndCol = (\d+) \+ targetYearIndex;', line)
        if match:
            num = int(match.group(1))
            new_num = num - 1
            lines[i] = line.replace(f"{num} + targetYearIndex", f"{new_num} + targetYearIndex")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.writelines(lines)