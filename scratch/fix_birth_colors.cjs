const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const oldStr = `        if (emp) {
          cell1.value = emp.hYearShort;
          cell2.value = emp.name;
          
          if (emp.hYearShort && emp.hYearShort.includes('H')) {
             cell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF3FC' } };
             cell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF3FC' } };
          }
        } else {
          // background colors for empty cells like the image
          if (y >= 1989) { // H era
             cell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF3FC' } };
             cell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF3FC' } };
          }
        }`;

const newStr = `        if (emp) {
          cell1.value = emp.hYearShort;
          cell2.value = emp.name;
          
          const bgRaw = getPromotedBgColorCode(emp.currentGrade);
          if (bgRaw) {
             const bgArgb = 'FF' + bgRaw.replace('#', '').toUpperCase();
             cell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
             cell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
          }
        }`;

if (code.includes(oldStr)) {
  code = code.replace(oldStr, newStr);
  fs.writeFileSync('src/utils/exportExcel.js', code);
  console.log('done');
} else {
  console.log('Old string not found!');
}