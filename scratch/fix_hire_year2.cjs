const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

code = code.replace(
  /const day = parseInt\(match\[3\], 10\);\n\s*if \(month < 4 \|\| \(month === 4 && day === 1\)\) year -= 1;\n\s*if \(year >= 2019\)/,
  "const day = parseInt(match[3], 10);\n  if (month < 4) year -= 1;\n  if (year >= 2019)"
);

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');