const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const helperCode = \
  const getYearsStr = (emp, isNext) => { 
    if (!emp) return ''; 
    const years = getEmpCurrentYears(emp, isNext ? targetYear : targetYear - 1, isNext);
    const skills = isNext ? emp.nextSkills : emp.currentSkills; 
    return skills?.length ? \\\\(\\\)\\\ : \\\\\\\; 
  };
  const getAgeStr = (emp, isNext) => {
    if (!emp || !emp.birthDate) return '';
    const age = calculateAge(emp.birthDate, isNext ? targetYear : targetYear - 1);
    return age !== '' ? \\\\\\\ : '';
  };
\;

code = code.replace(
  "export const addSimplePlanSheet = (workbook, sheetName, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {",
  "export const addSimplePlanSheet = (workbook, sheetName, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {" + helperCode
);

fs.writeFileSync('src/utils/exportExcel.js', code);
