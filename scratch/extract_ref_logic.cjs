const fs = require('fs');
const code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// I need to find the logic that populates the legend in addPlanSheet
const startLegend = code.indexOf(`r3.getCell(18).value = '＜参考＞';`);
const endLegend = code.indexOf(`const r4Vals = [`, startLegend);
console.log(code.substring(startLegend, endLegend));

const startR4 = code.indexOf(`r4Vals.push('氏名',`, endLegend);
const endR4 = code.indexOf(`const r5Vals = [`, startR4);
console.log(code.substring(startR4, endR4));

const startR5 = code.indexOf(`r5Vals.push('氏名',`, endR4);
const endR5 = code.indexOf(`ws.mergeCells('A4:A5');`, startR5);
console.log(code.substring(startR5, endR5));