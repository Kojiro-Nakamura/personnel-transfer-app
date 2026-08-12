import fs from 'fs';

let content = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const target1 = `  [1, 2, 3].forEach(rn => {
    ws.getRow(rn).getCell(1).alignment = { vertical: 'middle' };
  });`;
const rep1 = `  [1, 2, 3].forEach(rn => {
    ws.getRow(rn).getCell(1).alignment = { vertical: 'middle', wrapText: false };
  });`;

content = content.replace(target1, rep1);
content = content.replace(target1.replace(/\n/g, '\r\n'), rep1.replace(/\n/g, '\r\n'));

fs.writeFileSync('src/utils/exportExcel.js', content, 'utf8');
console.log('Replaced wrapText for header rows');
