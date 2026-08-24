const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// 1. Signature
code = code.replace(
  /export const addBirthYearSheet = \(workbook, sheetName, targetYear, employees, departments\) => \{/,
  "export const addBirthYearSheet = (workbook, sheetName, targetYear, employees, departments, isNextYear = false) => {"
);

// 2. Filter
code = code.replace(
  /if \(!emp\.currentDeptId\) return false;/,
  `const dId = isNextYear ? emp.departmentId : emp.currentDeptId;
      if (!dId || dId === 'unassigned' || dId === 'retired') return false;`
);

// 3. parsedEmps mapping
code = code.replace(
  /const dept = deptMap\.get\(emp\.currentDeptId\);/,
  `const dId = isNextYear ? emp.departmentId : emp.currentDeptId;
      const dept = deptMap.get(dId);`
);

// 4. Title
code = code.replace(
  /ws\.getCell\(currentRowIndex, 1\)\.value = '令和' \+ \(targetYear - 2019\) \+ '年度林学職生年別一覧';/,
  `const yearOffset = isNextYear ? 2018 : 2019;
    ws.getCell(currentRowIndex, 1).value = '令和' + (targetYear - yearOffset) + '年度林学職生年別一覧';`
);

// 5. Age calculation
code = code.replace(
  /const age = \(targetYear - 2\) - y;/,
  `const ageOffset = isNextYear ? 1 : 2;
          const age = (targetYear - ageOffset) - y;`
);

// 6. Color
code = code.replace(
  /const bgRaw = getPromotedBgColorCode\(emp\.currentGrade\);/,
  `const grade = isNextYear ? (emp.nextGrade || emp.currentGrade) : emp.currentGrade;
            const bgRaw = getPromotedBgColorCode(grade);`
);

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');