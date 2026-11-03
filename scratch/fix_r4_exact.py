import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const r4Vals =" in line and "targetYear - 1" in line and "addCurrentBasePlanSheet" in "".join(lines[i-50:i]):
        # Replace the 6 empty strings with 5 empty strings
        lines[i] = line.replace("' ', '', '', '', '', ''", "' ', '', '', '', ''")
        # Alternatively, just replace the exact part
        lines[i] = line.replace("'', '', '', '', '', ''", "'', '', '', '', ''")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.writelines(lines)