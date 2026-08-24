const fs = require('fs');
const code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');
const lines = code.split('\n');
for (let i = 40; i < 800; i++) {
  if (lines[i].includes('retired') || lines[i].includes('退職')) {
    console.log(`Line ${i}: ${lines[i].trim()}`);
  }
}