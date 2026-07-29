const fs = require('fs');
const file = 'src/utils/helpers.js';
let content = fs.readFileSync(file, 'utf8');

const oldFuncRegex = /export const parseJapaneseDate = \(str\) => \{[\s\S]*?\n\};\n/;

const newFunc = `export const parseJapaneseDate = (str) => {
  if (!str) return '';
  str = String(str).trim();

  // Try standard YYYY-MM-DD or YYYY/MM/DD or YYYY年MM月DD日
  const adMatch = str.match(/^(\\d{4})[-\\/\\.年](\\d{1,2})[-\\/\\.月](\\d{1,2})日?$/);
  if (adMatch) {
    const [, y, m, d] = adMatch;
    return \`\${y}-\${m.padStart(2, '0')}-\${d.padStart(2, '0')}\`;
  }

  // Try Japanese Era matching: e.g. S60.1.1, S60/01/01, S60-1-1, 昭和60年1月1日
  const eraMatch = str.match(/^(M|T|S|H|R|明治|大正|昭和|平成|令和)(\\d+|元)[-\\/\\.年](\\d{1,2})[-\\/\\.月](\\d{1,2})日?$/i);
  if (eraMatch) {
    let [, era, yearStr, monthStr, dayStr] = eraMatch;
    let year = yearStr === '元' ? 1 : parseInt(yearStr, 10);
    
    if (era === '明治' || era.toUpperCase() === 'M') year += 1867;
    else if (era === '大正' || era.toUpperCase() === 'T') year += 1911;
    else if (era === '昭和' || era.toUpperCase() === 'S') year += 1925;
    else if (era === '平成' || era.toUpperCase() === 'H') year += 1988;
    else if (era === '令和' || era.toUpperCase() === 'R') year += 2018;
    
    return \`\${year}-\${monthStr.padStart(2, '0')}-\${dayStr.padStart(2, '0')}\`;
  }

  // Try standard Date parsing as fallback
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return \`\${y}-\${m}-\${d}\`;
  }

  return str;
};
`;

content = content.replace(oldFuncRegex, newFunc);
fs.writeFileSync(file, content, 'utf8');
