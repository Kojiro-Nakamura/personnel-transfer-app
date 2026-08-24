const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// We want to change the fallback from `(emp.nextGrade || emp.currentGrade)`
// to `(emp.nextGrade !== undefined && emp.nextGrade !== null ? emp.nextGrade : emp.currentGrade)`
// and explicitly color people turning 60 as gray if the user desires it.

code = code.replace(
  /const grade = isNextYear \? \(emp\.nextGrade \|\| emp\.currentGrade\) : emp\.currentGrade;/,
  `const grade = isNextYear ? (emp.nextGrade !== undefined && emp.nextGrade !== null && emp.nextGrade !== "" ? emp.nextGrade : emp.currentGrade) : emp.currentGrade;`
);

fs.writeFileSync('src/utils/exportExcel.js', code, 'utf8');