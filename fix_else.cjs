const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');
const target = "          if (rawColor) {\r\n             const colorCode = rawColor.replace('#', '').toUpperCase();\r\n             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorCode } };\r\n          }\r\n        }\r\n      }";
const replace = "          if (rawColor) {\r\n             const colorCode = rawColor.replace('#', '').toUpperCase();\r\n             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorCode } };\r\n          }\r\n        } else {\r\n          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };\r\n        }\r\n      }";
code = code.replace(target, replace);

const targetLF = "          if (rawColor) {\n             const colorCode = rawColor.replace('#', '').toUpperCase();\n             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorCode } };\n          }\n        }\n      }";
const replaceLF = "          if (rawColor) {\n             const colorCode = rawColor.replace('#', '').toUpperCase();\n             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorCode } };\n          }\n        } else {\n          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };\n        }\n      }";
code = code.replace(targetLF, replaceLF);

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');
