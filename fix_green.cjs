const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const target1 = "      if (currEmp && isCurrTransferred && c >= 4 && c <= 7) {\r\n        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };\r\n      }";
const replace1 = "      if (currEmp && isCurrTransferred && c >= 4 && c <= 7) {\r\n        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } };\r\n      }";
code = code.replace(target1, replace1);

const target2 = "          if (rawColor) {\r\n             const colorCode = rawColor.replace('#', '').toUpperCase();\r\n             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorCode } };\r\n          }\r\n        } else {\r\n          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };\r\n        }\r\n      }";
const replace2 = "          if (rawColor) {\r\n             const colorCode = rawColor.replace('#', '').toUpperCase();\r\n             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorCode } };\r\n          }\r\n        }\r\n      }";
code = code.replace(target2, replace2);

// Check LF
const target1LF = "      if (currEmp && isCurrTransferred && c >= 4 && c <= 7) {\n        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };\n      }";
const replace1LF = "      if (currEmp && isCurrTransferred && c >= 4 && c <= 7) {\n        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } };\n      }";
code = code.replace(target1LF, replace1LF);

const target2LF = "          if (rawColor) {\n             const colorCode = rawColor.replace('#', '').toUpperCase();\n             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorCode } };\n          }\n        } else {\n          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };\n        }\n      }";
const replace2LF = "          if (rawColor) {\n             const colorCode = rawColor.replace('#', '').toUpperCase();\n             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorCode } };\n          }\n        }\n      }";
code = code.replace(target2LF, replace2LF);

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');
