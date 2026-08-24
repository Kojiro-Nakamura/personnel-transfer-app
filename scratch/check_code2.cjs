const fs = require('fs');
const code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');
const lines = code.split('\n');
for (let i = 1320; i < 1345; i++) {
  console.log(lines[i]);
}