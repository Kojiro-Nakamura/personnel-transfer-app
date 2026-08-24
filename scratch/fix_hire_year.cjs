const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const oldStr = const getHireFiscalYearShort = (dateStr) => {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\\d{4})[-\\/\\.](\\d{1,2})[-\\/\\.](\\d{1,2})/);
  if (!match) return '';
  let year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (month < 4 || (month === 4 && day === 1)) year -= 1;;

const newStr = const getHireFiscalYearShort = (dateStr) => {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\\d{4})[-\\/\\.](\\d{1,2})[-\\/\\.](\\d{1,2})/);
  if (!match) return '';
  let year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (month < 4) year -= 1;;

code = code.replace(oldStr, newStr);

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');