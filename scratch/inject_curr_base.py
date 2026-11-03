import os

with open("scratch/addCurrentBasePlanSheet.js", "r", encoding="utf8") as f:
    curr_base_code = f.read()

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# Add the function at the very end
code += "\n" + curr_base_code + "\n"

# Call it in exportPlanToExcel
search = """  addSimplePlanSheet(workbook, '人事異動案（シンプル）', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);
  addPlanSheet(workbook, '人事異動案', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);"""

replace = """  addSimplePlanSheet(workbook, '人事異動案（シンプル）', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);
  addPlanSheet(workbook, '人事異動案', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);
  addCurrentBasePlanSheet(workbook, '人事異動案（今年度ベース）', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);"""

if search in code:
    code = code.replace(search, replace)
    print("Replaced exportPlanToExcel successfully")
else:
    print("Failed to replace exportPlanToExcel")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)