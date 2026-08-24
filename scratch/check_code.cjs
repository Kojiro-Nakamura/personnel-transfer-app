const fs = require('fs');
const code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');
const lines = code.split('\n');
for (let i = 1140; i < 1180; i++) {
  console.log(lines[i]);
}