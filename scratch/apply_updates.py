import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. Sheet name in exportPlanToExcel
code = code.replace(
    "addCurrentBasePlanSheet(workbook, '人事異動案（今年度ベース）', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);",
    "addCurrentBasePlanSheet(workbook, `R${targetYear - 2019}→R${targetYear - 2018}`, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);"
)

# 2. Colors in addCurrentBasePlanSheet
# old:
#   const currFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
#   const nextFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F9FF' } };
# new:
#   const currFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
#   const nextFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };

code = code.replace(
    "const currFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };",
    "const currFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };"
)
code = code.replace(
    "const nextFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F9FF' } };",
    "const nextFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };"
)

# 3. I4:I5 uncolored (c === 9)
old_fill_logic = """    if (c >= 4 && c <= 9) {
      c4.fill = currFill;
      c5.fill = currFill;
    } else if (c >= 11 && c <= 17) {
      c4.fill = nextFill;
      c5.fill = nextFill;
    } else {
      c4.fill = headerFill;
      c5.fill = headerFill;
    }"""

new_fill_logic = """    if (c >= 4 && c <= 8) {
      c4.fill = currFill;
      c5.fill = currFill;
    } else if (c >= 10 && c <= 16) {
      c4.fill = nextFill;
      c5.fill = nextFill;
    } else if (c !== 9) {
      c4.fill = headerFill;
      c5.fill = headerFill;
    }"""

code = code.replace(old_fill_logic, new_fill_logic)

# 4. Arrow '→' to '⇒' and Bold
code = code.replace("vals[8] = '→';", "vals[8] = '⇒';")
code = code.replace("v[8] = '→';", "v[8] = '⇒';")

old_c9_font_1 = """          if (c === 9) {
             cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };
          }"""
new_c9_font_1 = """          if (c === 9) {
             cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };
             cell.font = { name: 'BIZ UDPゴシック', size: 9, bold: true };
          }"""
code = code.replace(old_c9_font_1, new_c9_font_1)

# 5. Freeze Pane: F6 -> xSplit: 5, ySplit: 5
code = code.replace(
    "ws.views = [{ state: 'frozen', xSplit: 9, ySplit: 5 }];",
    "ws.views = [{ state: 'frozen', xSplit: 5, ySplit: 5 }];"
)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)