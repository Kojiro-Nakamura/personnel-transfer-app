const fs = require('fs');
const code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');
const lines = code.split('\n');
for (let i = 801; i < 1364; i++) {
  if (lines[i].includes('fill')) {
    console.log(`Line ${i}: ${lines[i].trim()}`);
  }
}