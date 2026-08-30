const fs = require('fs');
const code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const startRow = code.indexOf(`const extEmp = currEmp || nextEmp;`);
const endRow = code.indexOf(`if (showCount) {`, startRow);
console.log(code.substring(startRow, endRow));