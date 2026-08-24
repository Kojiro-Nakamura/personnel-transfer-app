const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const regex = /if \(currEmp && isCurrTransferred && c >= 4 && c <= 7\) \{\s*cell\.fill = \{ type: 'pattern', pattern: 'solid', fgColor: \{ argb: 'FF86EFAC' \} \};\s*\}/;

const newCode = `if (dept && dept.name === '【退職】') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
      } else if (currEmp && isCurrTransferred && c >= 4 && c <= 7) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
      }`;

if (regex.test(code)) {
  code = code.replace(regex, newCode);
  fs.writeFileSync('src/utils/exportExcel.js', code);
  console.log('done');
} else {
  console.log('regex not matched');
}
