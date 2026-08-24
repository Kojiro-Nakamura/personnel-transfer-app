const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

code = code.replace(
  /views: \[\{ showGridLines: false \}\],\n\s*views: \[\{ showGridLines: false \}\]/,
  "views: [{ showGridLines: false }]"
);

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');