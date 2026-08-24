const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// Replace header borders
const headerBorderRegex = /let leftStyle = c === 1 \? 'medium' : 'thin';\s*let rightStyle = c === 12 \? 'medium' : 'thin';/g;

code = code.replace(headerBorderRegex, `let leftStyle = (c === 1 || c === 2 || c === 8) ? 'medium' : 'thin';
      let rightStyle = (c === 12 || c === 1 || c === 7) ? 'medium' : 'thin';`);

// Replace body borders
const bodyBorderRegex = /const leftStyle = c === 1 \? 'medium' : 'thin';\s*const rightStyle = c === 12 \? 'medium' : 'thin';/g;

code = code.replace(bodyBorderRegex, `const leftStyle = (c === 1 || c === 2 || c === 8) ? 'medium' : 'thin';
      const rightStyle = (c === 12 || c === 1 || c === 7) ? 'medium' : 'thin';`);

fs.writeFileSync('src/utils/exportExcel.js', code, 'utf8');
console.log("Replaced borders.");