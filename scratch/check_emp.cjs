const fs = require('fs');
const code = fs.readFileSync('src/utils/helpers.js', 'utf8');
const lines = code.split('\n');
for (let i = 0; i < 500; i++) {
  if (lines[i].includes('retired')) {
    console.log(`Line ${i}: ${lines[i].trim()}`);
  }
}