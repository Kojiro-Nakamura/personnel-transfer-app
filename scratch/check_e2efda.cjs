const fs = require('fs');
const code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('E2EFDA')) {
    console.log(`Line ${i}: ${lines[i].trim()}`);
  }
}