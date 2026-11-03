with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()

# We only want to revert the FIRST occurrence, which is in addPlanSheet
for i, line in enumerate(lines):
    if "legendEndCol = 42" in line:
        lines[i] = line.replace("42", "39")
        break

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.writelines(lines)