const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

code = code.replace(
  /const age = \(targetYear - 1\) - y;/g,
  "const age = (targetYear - 2) - y;"
);

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');