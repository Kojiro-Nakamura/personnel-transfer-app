const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

code = code.replace(
  /if \(colNumber === 21 && cell\.value\) \{/g,
  'if (colNumber === 21 && cell.value && cell.value.toString().trim() !== \\'\\') {'
);

code = code.replace(
  /if \(colNumber === 4 && cell\.value\) \{/g,
  'if (colNumber === 4 && cell.value && cell.value.toString().trim() !== \\'\\') {'
);

fs.writeFileSync('src/utils/exportExcel.js', code);
