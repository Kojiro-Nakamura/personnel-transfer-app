import fs from 'fs';
let content = fs.readFileSync('src/utils/exportHtml.js', 'utf8');

const t = `        let displayStr = hStr;
        if (hStr && hStr !== ' / 課直属' && hStr !== '未配置' && hStr !== '-') {
          if (year === targetYear) {
            histStyleCss += \`color: #000; font-weight: bold; \`;
          } else if (prevDept !== null && hStr !== prevDept) {
            histStyleCss += \`color: #2563eb; font-weight: bold; \`;
          }
          prevDept = hStr;`;

const r = `        let displayStr = hStr;
        if (hStr && hStr !== ' / 課直属' && hStr !== '未配置' && hStr !== '-') {
          if (year === targetYear || prevDept === null || hStr !== prevDept) {
            histStyleCss += \`color: #000; font-weight: bold; \`;
          }
          prevDept = hStr;`;

const t_crlf = t.replace(/\n/g, '\r\n');
const r_crlf = r.replace(/\n/g, '\r\n');

if (content.includes(t)) {
  content = content.replace(t, r);
} else if (content.includes(t_crlf)) {
  content = content.replace(t_crlf, r_crlf);
} else {
  console.log('Target string not found');
  process.exit(1);
}

fs.writeFileSync('src/utils/exportHtml.js', content);
console.log('Updated history coloring to bold black for transfers and initial placement');
