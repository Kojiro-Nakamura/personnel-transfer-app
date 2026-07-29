const fs = require('fs');
const file = 'src/components/modals/Modals.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('extractYearFromHeader')) {
  content = content.replace(
    /getEraFormattedYear,/,
    'getEraFormattedYear, extractYearFromHeader,'
  );
}

const oldRegex = /const m = headerCols\[k\] \? headerCols\[k\]\.match\(\/\^\\(\\\\d\{4\}\\)\/\) : null;\s*if \(m\) \{\s*csvYearsMap\.set\(k, parseInt\(m\[1\], 10\)\);\s*\}/;
const oldLogic = `const m = headerCols[k] ? headerCols[k].match(/^(\\d{4})/) : null;
        if (m) {
          csvYearsMap.set(k, parseInt(m[1], 10));
        }`;
const newLogic = `const year = extractYearFromHeader(headerCols[k]);
        if (year) {
          csvYearsMap.set(k, year);
        }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(file, content, 'utf8');
