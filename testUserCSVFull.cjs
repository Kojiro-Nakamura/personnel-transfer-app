const fs = require('fs');
const { parseCSVRow, parseJapaneseDate, calculateAge, getEraFormattedYear, extractYearFromHeader } = require('./src/utils/helpers.js');

const buffer = fs.readFileSync('C:/Users/gyrom/.gemini/antigravity/brain/6d803aee-cb97-45dd-8cf9-5ce09ab6e882/.user_uploaded/media__1785284180812.csv');
let text = new TextDecoder('shift_jis').decode(buffer);

const lines = text.replace(/^\uFEFF/, '').split(/\r\n|\n/).filter(line => line.trim() !== '');
const headerCols = parseCSVRow(lines[0]);
const colMap = new Map();
headerCols.forEach((col, i) => colMap.set(col.trim(), i));

const csvYearsMap = new Map();
for (let k = 0; k < headerCols.length; k++) {
  const year = extractYearFromHeader(headerCols[k]);
  if (year && year >= 1900 && year <= 2100) csvYearsMap.set(k, year);
}

const cols = parseCSVRow(lines[1]);
const getVal = (key) => {
  const idx = colMap.get(key);
  return idx !== undefined && idx < cols.length ? cols[idx] : undefined;
};

const newEmpData = {
  employeeNumber: getVal('職員番号'), 
  name: getVal('氏名'),
  birthDate: parseJapaneseDate(getVal('生年月日')),
};

let newHistory = [];
for (let [k, year] of csvYearsMap.entries()) {
  if (k < cols.length) {
    const deptName = cols[k] || '';
    if (deptName) {
      newHistory.push({ year, department: deptName });
    }
  }
}
newHistory.sort((a, b) => a.year - b.year);
newEmpData.history = newHistory;
console.log(newEmpData);
