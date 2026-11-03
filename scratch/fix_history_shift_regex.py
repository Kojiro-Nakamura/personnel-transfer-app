with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "vals[39] = ny;" in line:
        lines[i] = line.replace("vals[39] = ny;", "vals[38] = ny;")
    if "v[39] = ny;" in line:
        lines[i] = line.replace("v[39] = ny;", "v[38] = ny;")
    if "40 + idx" in line:
        lines[i] = line.replace("40 + idx", "39 + idx")
    if "ws.mergeCells(`${startColCode}5:${endColCode}5`);" in line:
        # We need to remove the whole block:
        # if (historyYears.length > 0) {
        #   const endColCode = ...
        #   const startColCode = ...
        #   ws.mergeCells(5)
        # }
        pass

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.writelines(lines)