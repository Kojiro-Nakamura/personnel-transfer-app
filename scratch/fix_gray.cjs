const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const regex = /if \(dept && dept\.name === '【退職】'\) \{\s*cell\.fill = \{ type: 'pattern', pattern: 'solid', fgColor: \{ argb: 'FFD9D9D9' \} \};\s*\} else if \(currEmp && isCurrTransferred && c >= 4 && c <= 7\) \{\s*cell\.fill = \{ type: 'pattern', pattern: 'solid', fgColor: \{ argb: 'FFE2EFDA' \} \};\s*\}/;

const newCode = `const isNextRetired = nextEmp && nextEmp.departmentId === 'retired';
      if (dept && dept.name === '【退職】') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
      } else if (currEmp && isCurrTransferred && c >= 4 && c <= 7) {
        if (isNextRetired) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
        }
      }`;

if (regex.test(code)) {
  code = code.replace(regex, newCode);
  fs.writeFileSync('src/utils/exportExcel.js', code);
  console.log('done');
} else {
  console.log('not matched');
}