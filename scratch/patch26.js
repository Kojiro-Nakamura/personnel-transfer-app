import fs from 'fs';
let content = fs.readFileSync('src/utils/exportHtml.js', 'utf8');

const t1 = `  const getEraSuffixLocal = (y) => {
    const eraStr = getEraFormattedYear(y);
    const match = eraStr.match(/([RSHM])(\\d+)/);
    return match ? \`\${match[1]}\${match[2]}\` : String(y).substring(2);
  };`;

const r1 = `  const getEraSuffixLocal = (y) => {
    const eraStr = getEraFormattedYear(y);
    const match = eraStr.match(/([RSHM])(\\d+)/);
    return match ? \`\${match[1]}\${match[2]}\` : String(y).substring(2);
  };

  const formatWithEra = (dateStr) => {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\\d{4})[-/]/);
    if (match) {
      const year = parseInt(match[1], 10);
      let era = '';
      if (year >= 2019) era = \`(R\${year - 2018})\`;
      else if (year >= 1989) era = \`(H\${year - 1988})\`;
      else if (year >= 1926) era = \`(S\${year - 1925})\`;
      else if (year >= 1912) era = \`(T\${year - 1911})\`;
      return era ? \`\${era}\${dateStr}\` : dateStr;
    }
    return dateStr;
  };`;

const t2 = `      <td class="bg-slate" data-val="\${emp.employeeNumber||''}">\${emp.employeeNumber||''}</td>
      <td class="bg-slate" data-val="\${emp.birthDate||''}">\${emp.birthDate||''}</td>
      <td class="bg-slate" data-val="\${emp.education||''}">\${emp.education||''}</td>
      <td class="bg-slate" data-val="\${emp.hireDate||''}">\${emp.hireDate||''}</td>`;

const r2 = `      <td class="bg-slate" data-val="\${emp.employeeNumber||''}">\${emp.employeeNumber||''}</td>
      <td class="bg-slate" data-val="\${emp.birthDate||''}">\${formatWithEra(emp.birthDate)}</td>
      <td class="bg-slate" data-val="\${emp.education||''}">\${emp.education||''}</td>
      <td class="bg-slate" data-val="\${emp.hireDate||''}">\${formatWithEra(emp.hireDate)}</td>`;

const t1_crlf = t1.replace(/\n/g, '\r\n');
const r1_crlf = r1.replace(/\n/g, '\r\n');
const t2_crlf = t2.replace(/\n/g, '\r\n');
const r2_crlf = r2.replace(/\n/g, '\r\n');

if (content.includes(t1)) {
  content = content.replace(t1, r1);
} else if (content.includes(t1_crlf)) {
  content = content.replace(t1_crlf, r1_crlf);
} else {
  console.log('Target string 1 not found');
  process.exit(1);
}

if (content.includes(t2)) {
  content = content.replace(t2, r2);
} else if (content.includes(t2_crlf)) {
  content = content.replace(t2_crlf, r2_crlf);
} else {
  console.log('Target string 2 not found');
  process.exit(1);
}

fs.writeFileSync('src/utils/exportHtml.js', content);
console.log('Added Japanese era format to birthDate and hireDate');
