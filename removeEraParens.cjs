const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldGetEra = `const getEraSuffix = (year) => {
  const y = parseInt(year);
  if (isNaN(y)) return '';
  if (y >= 2019) return \`(R\${y - 2018})\`;
  if (y >= 1989) return \`(H\${y - 1988})\`;
  if (y >= 1926) return \`(S\${y - 1925})\`;
  return '';
};`;

const newGetEra = `const getEraSuffix = (year) => {
  const y = parseInt(year);
  if (isNaN(y)) return '';
  if (y >= 2019) return \`R\${y - 2018}\`;
  if (y >= 1989) return \`H\${y - 1988}\`;
  if (y >= 1926) return \`S\${y - 1925}\`;
  return '';
};`;

content = content.replace(oldGetEra, newGetEra);
fs.writeFileSync(file, content, 'utf8');
