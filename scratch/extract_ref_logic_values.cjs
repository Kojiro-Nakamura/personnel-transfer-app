const fs = require('fs');
const code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const startRef = code.indexOf(`const extEmp = currEmp || nextEmp;`);
const endRef = code.indexOf(`const tr = ws.getRow(rowIndex);`);
console.log(code.substring(startRef, endRef));