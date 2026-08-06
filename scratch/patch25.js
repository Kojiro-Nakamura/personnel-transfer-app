import fs from 'fs';
let content = fs.readFileSync('src/utils/exportHtml.js', 'utf8');

const t = `          if (histAge !== null && !isNaN(histAge)) {
            displayStr = \`\${hStr}<span style="font-size: 0.85em;">(\${histAge}歳)</span>\`;
          }`;
const r = `          if (histAge !== null && !isNaN(histAge)) {
            displayStr = \`\${hStr} <span style="font-size: 0.85em;">(\${histAge}歳)</span>\`;
          }`;

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
console.log('Added half-width space before age');
