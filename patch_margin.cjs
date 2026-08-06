const fs = require('fs');
let text = fs.readFileSync('src/components/modals/Modals.jsx', 'utf8');

// 1. Remove body margin
const targetCss = 'margin: 20px;';
const replCss = 'margin: 0;';
if (text.includes(targetCss)) {
  text = text.replace(targetCss, replCss);
  console.log('Body margin replaced');
} else {
  console.log('Body margin not found');
}

// 2. Add space before age
const targetTd = 'const nameWithAge = nameVal + ageStr;';
const replTd = "const nameWithAge = nameVal + (ageStr ? ' ' + ageStr : '');";
if (text.includes(targetTd)) {
  text = text.replace(targetTd, replTd);
  console.log('Age space added');
} else {
  console.log('Age space logic not found');
}

fs.writeFileSync('src/components/modals/Modals.jsx', text, 'utf8');
