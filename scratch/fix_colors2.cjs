const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');
code = code.replace(/argb: 'FFD1FAE5'/g, "argb: 'FFE2EFDA'");
fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');