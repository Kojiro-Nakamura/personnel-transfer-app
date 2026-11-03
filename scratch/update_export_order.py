import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search = """export const exportPlanToExcel = async (fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {
  const workbook = new ExcelJS.Workbook();
  addPlanSheet(workbook, '人事異動案', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);
  addSimplePlanSheet(workbook, '人事異動案（シンプル）', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);
  addListSheet(workbook, '職員一覧', fileName, targetYear, employees, departments);
    addBirthYearSheet(workbook, '生年別一覧（今年度）', targetYear, employees, departments, false);
    addBirthYearSheet(workbook, '生年別一覧（来年度）', targetYear, employees, departments, true);
  await saveWorkbook(workbook, fileName);
};"""

replace = """export const exportPlanToExcel = async (fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {
  const workbook = new ExcelJS.Workbook();
  addSimplePlanSheet(workbook, '人事異動案（シンプル）', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);
  addPlanSheet(workbook, '人事異動案', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);
  addListSheet(workbook, '職員一覧', fileName, targetYear, employees, departments);
    addBirthYearSheet(workbook, '生年別一覧（今年度）', targetYear, employees, departments, false);
    addBirthYearSheet(workbook, '生年別一覧（来年度）', targetYear, employees, departments, true);
  await saveWorkbook(workbook, fileName);
};"""

if search in code:
    code = code.replace(search, replace)
    print("Replaced export order successfully")
else:
    print("Failed to replace export order")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)