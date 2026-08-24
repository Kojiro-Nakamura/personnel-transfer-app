const fs = require('fs');
const code = fs.readFileSync('src/utils/helpers.js', 'utf8');
const lines = code.split('\n');
for (let i = 500; i < 600; i++) {
  if (lines[i].includes('export const traverseOrgTree')) {
    for (let j = i; j < i + 80; j++) {
      console.log(lines[j]);
    }
    break;
  }
}