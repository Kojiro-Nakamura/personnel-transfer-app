const fs = require('fs');
const file = 'src/utils/helpers.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('extractYearFromHeader')) {
  content += `\nexport const extractYearFromHeader = (str) => {
  if (!str) return null;
  const adMatch = str.match(/(\\d{4})/);
  if (adMatch) return parseInt(adMatch[1], 10);
  
  const eraMatch = str.match(/(M|T|S|H|R|明治|大正|昭和|平成|令和)(\\d+|元)/i);
  if (eraMatch) {
    let [, era, yearStr] = eraMatch;
    let year = yearStr === '元' ? 1 : parseInt(yearStr, 10);
    
    if (era === '明治' || era.toUpperCase() === 'M') year += 1867;
    else if (era === '大正' || era.toUpperCase() === 'T') year += 1911;
    else if (era === '昭和' || era.toUpperCase() === 'S') year += 1925;
    else if (era === '平成' || era.toUpperCase() === 'H') year += 1988;
    else if (era === '令和' || era.toUpperCase() === 'R') year += 2018;
    return year;
  }
  
  return null;
};\n`;
  fs.writeFileSync(file, content, 'utf8');
}
