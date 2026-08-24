const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const target1 = "  ws.getColumn(2).width = 10;\r\n  ws.getColumn(3).width = 10;";
const replace1 = "  ws.getColumn(2).width = 3;\r\n  ws.getColumn(3).width = 3;";
code = code.replace(target1, replace1);

const target1LF = "  ws.getColumn(2).width = 10;\n  ws.getColumn(3).width = 10;";
const replace1LF = "  ws.getColumn(2).width = 3;\n  ws.getColumn(3).width = 3;";
code = code.replace(target1LF, replace1LF);

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');
