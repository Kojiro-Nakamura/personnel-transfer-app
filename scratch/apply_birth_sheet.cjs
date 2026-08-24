const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');
const newFunction = fs.readFileSync('scratch/birth_sheet.js', 'utf8');

const injectionPoint = 'export const exportPlanToExcel =';
code = code.replace(injectionPoint, newFunction + '\n' + injectionPoint);

code = code.replace(
  /export const exportListToExcel = async \(fileName, targetYear, employees, departments\) => \{\s*const workbook = new ExcelJS\.Workbook\(\);\s*addListSheet\(workbook, '職員一覧', fileName, targetYear, employees, departments\);/g,
  "export const exportListToExcel = async (fileName, targetYear, employees, departments) => {\n    const workbook = new ExcelJS.Workbook();\n    addListSheet(workbook, '職員一覧', fileName, targetYear, employees, departments);\n    addBirthYearSheet(workbook, '生年別一覧', targetYear, employees, departments);"
);

code = code.replace(
  /addListSheet\(workbook, '職員一覧', fileName, targetYear, employees, departments\);/,
  "addListSheet(workbook, '職員一覧', fileName, targetYear, employees, departments);\n    addBirthYearSheet(workbook, '生年別一覧', targetYear, employees, departments);"
);

code = code.replace(
  /addListSheet\(workbook, 'つなぎ表', fileName, targetYear, employees, departments\);/,
  "addListSheet(workbook, 'つなぎ表', fileName, targetYear, employees, departments);\n    addBirthYearSheet(workbook, '生年別一覧', targetYear, employees, departments);"
);

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');