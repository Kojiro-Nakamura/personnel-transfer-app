const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const regex = /const summaryRows = \[\s*\{ label: '振興局外'[\s\S]*?\{ label: '計'/;
if (regex.test(code)) {
  code = code.replace(regex, "const summaryRows = [\n      { label: '計'");
  fs.writeFileSync('src/utils/exportExcel.js', code);
  console.log('done');
} else {
  console.log('not matched');
}