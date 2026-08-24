const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

code = code.replace(
  /if \(month < 4 \|\| \(month === 4 && day === 1\)\) year -= 1;/,
  "if (month < 4) year -= 1;"
);

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');