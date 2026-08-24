const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const regex = /if \(emp\) \{\s*cell1\.value = emp\.hYearShort;\s*cell2\.value = emp\.name;\s*if \(emp\.hYearShort && emp\.hYearShort\.includes\('H'\)\) \{\s*cell1\.fill = \{ type: 'pattern', pattern: 'solid', fgColor: \{ argb: 'FFEBF3FC' \} \};\s*cell2\.fill = \{ type: 'pattern', pattern: 'solid', fgColor: \{ argb: 'FFEBF3FC' \} \};\s*\}\s*\} else \{\s*\/\/ background colors for empty cells like the image\s*if \(y >= 1989\) \{\s*\/\/ H era\s*cell1\.fill = \{ type: 'pattern', pattern: 'solid', fgColor: \{ argb: 'FFEBF3FC' \} \};\s*cell2\.fill = \{ type: 'pattern', pattern: 'solid', fgColor: \{ argb: 'FFEBF3FC' \} \};\s*\}\s*\}/;

const newStr = `if (emp) {
          cell1.value = emp.hYearShort;
          cell2.value = emp.name;
          
          const bgRaw = getPromotedBgColorCode(emp.currentGrade);
          if (bgRaw) {
             const bgArgb = 'FF' + bgRaw.replace('#', '').toUpperCase();
             cell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
             cell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
          }
        }`;

if (regex.test(code)) {
  code = code.replace(regex, newStr);
  fs.writeFileSync('src/utils/exportExcel.js', code);
  console.log('done');
} else {
  console.log('Old string not found!');
}