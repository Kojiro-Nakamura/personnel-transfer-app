const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const regex = /addBirthYearSheet\(workbook, '生年別一覧', targetYear, employees, departments\);/g;
const replacement = `addBirthYearSheet(workbook, '生年別一覧（今年度）', targetYear, employees, departments, false);
    addBirthYearSheet(workbook, '生年別一覧（来年度）', targetYear, employees, departments, true);`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/utils/exportExcel.js', code);
  console.log('done');
} else {
  console.log('not matched');
}