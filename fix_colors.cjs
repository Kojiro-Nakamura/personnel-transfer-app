const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const target1 = "if (currEmp && isCurrTransferred && c >= 4 && c <= 7) {\r\n        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };";
const replace1 = "if (currEmp && isCurrTransferred && c >= 4 && c <= 7) {\r\n        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };";
code = code.replace(target1, replace1);

const target2 = "        } else {\r\n          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } }; // Sky 100\r\n        }";
const replace2 = "        } else {\r\n          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Sky 100\r\n        }";
code = code.replace(target2, replace2);

// Check if CRLF or LF
const target1LF = "if (currEmp && isCurrTransferred && c >= 4 && c <= 7) {\n        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };";
const replace1LF = "if (currEmp && isCurrTransferred && c >= 4 && c <= 7) {\n        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };";
code = code.replace(target1LF, replace1LF);

const target2LF = "        } else {\n          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } }; // Sky 100\n        }";
const replace2LF = "        } else {\n          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Sky 100\n        }";
code = code.replace(target2LF, replace2LF);

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');
