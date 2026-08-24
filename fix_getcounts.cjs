const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

code = code.replace(
  'const curCounts = getCounts(currMap, employees);',
  'const curCounts = getCounts(employees, false);'
);

code = code.replace(
  'const nextCounts = getCounts(nextMap, employees);',
  'const nextCounts = getCounts(employees, true);'
);

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log("Fixed getCounts");
