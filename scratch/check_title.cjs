const fs = require('fs');
const code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');
const lines = code.split('\n');
let start = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const addBirthYearSheet')) {
    start = i;
    break;
  }
}
for (let i = start; i < start + 100; i++) {
  if (lines[i].includes('targetYear')) {
    console.log(`Line ${i}: ${lines[i].trim()}`);
  }
}