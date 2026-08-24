const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const target1 = "      if (c === 2 || c === 3) argb = 'FF86EFAC';";
const replace1 = "      if (c === 2 || c === 3) argb = 'FFFCE7F3'; // Pink 100";
code = code.replace(target1, replace1);

const target1LF = "      if (c === 2 || c === 3) argb = 'FF86EFAC';";
const replace1LF = "      if (c === 2 || c === 3) argb = 'FFFCE7F3'; // Pink 100";
code = code.replace(target1LF, replace1LF);

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');
