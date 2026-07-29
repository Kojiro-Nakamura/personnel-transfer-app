const fs = require('fs');
const { parseCSVRow, parseJapaneseDate, calculateAge, getEraFormattedYear, extractYearFromHeader } = require('./src/utils/helpers.js');

const buffer = fs.readFileSync('C:/Users/gyrom/.gemini/antigravity/brain/6d803aee-cb97-45dd-8cf9-5ce09ab6e882/.user_uploaded/media__1785284180812.csv');
let text;
try { 
  text = new TextDecoder('utf-8', { fatal: true }).decode(buffer); 
} catch { 
  text = new TextDecoder('shift_jis').decode(buffer); 
}

const lines = text.replace(/^\uFEFF/, '').split(/\r\n|\n/).filter(line => line.trim() !== '');
const headerCols = parseCSVRow(lines[0]);

const colMap = new Map();
headerCols.forEach((col, i) => {
  colMap.set(col.trim(), i);
});

console.log("ColMap keys:", Array.from(colMap.keys()).join(', '));
const empNumKey = Array.from(colMap.keys())[0];
console.log("Is 職員番号 exactly?", empNumKey === '職員番号', "Chars:", [...empNumKey].map(c => c.charCodeAt(0)));

const csvYearsMap = new Map();
for (let k = 0; k < headerCols.length; k++) {
  const year = extractYearFromHeader(headerCols[k]);
  if (year && year >= 1900 && year <= 2100) {
    csvYearsMap.set(k, year);
  }
}
console.log("csvYearsMap size:", csvYearsMap.size);

const cols = parseCSVRow(lines[1]);
const getVal = (key) => {
  const idx = colMap.get(key);
  return idx !== undefined && idx < cols.length ? cols[idx] : undefined;
};

const empNum = getVal('職員番号');
const empName = getVal('氏名');
console.log("empNum:", empNum, "empName:", empName);
