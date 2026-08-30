import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. addPlanSheet
search1 = """        const isNoShrink = (colNumber === 27 || colNumber === 28);
        cell.alignment = { vertical: 'middle', shrinkToFit: !isNoShrink, wrapText: false };"""

replace1 = """        const isNoShrink = (colNumber >= 26 && colNumber <= 28);
        cell.alignment = { vertical: 'middle', shrinkToFit: !isNoShrink, wrapText: false };"""

# 2. addSimplePlanSheet
search2 = """      const isLeft = (c === 1 || c === 12 || c === 2 || c === 3 || (c >= 14 && c <= 24) || c >= 35);
      const shouldShrink = (c !== 2 && c !== 3);
      cell.alignment = { vertical: 'middle', horizontal: isLeft ? 'left' : 'center', shrinkToFit: shouldShrink, wrapText: false };"""

replace2 = """      const isLeft = (c === 1 || c === 12 || c === 2 || c === 3 || (c >= 14 && c <= 16) || (c >= 22 && c <= 24) || c >= 35);
      const shouldShrink = (c !== 2 && c !== 3 && !(c >= 22 && c <= 24));
      cell.alignment = { vertical: 'middle', horizontal: isLeft ? 'left' : 'center', shrinkToFit: shouldShrink, wrapText: false };"""

# 3. addListSheet
search3 = """      const isNoShrink = (colNumber === 10 || colNumber === 11);
      const align = isNoShrink ? 'left' : 'center';
      cell.alignment = { vertical: 'middle', horizontal: align, shrinkToFit: !isNoShrink, wrapText: false };"""

replace3 = """      const isNoShrink = (colNumber >= 9 && colNumber <= 11);
      const align = isNoShrink ? 'left' : 'center';
      cell.alignment = { vertical: 'middle', horizontal: align, shrinkToFit: !isNoShrink, wrapText: false };"""

if search1 in code:
    code = code.replace(search1, replace1)
    print("Replaced addPlanSheet")
else:
    print("Could not find addPlanSheet search block")

if search2 in code:
    code = code.replace(search2, replace2)
    print("Replaced addSimplePlanSheet")
else:
    print("Could not find addSimplePlanSheet search block")

if search3 in code:
    code = code.replace(search3, replace3)
    print("Replaced addListSheet")
else:
    print("Could not find addListSheet search block")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)

print("Done")