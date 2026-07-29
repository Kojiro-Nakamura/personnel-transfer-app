const fs = require('fs');
const { parseCSVRow, parseJapaneseDate, calculateAge, getEraFormattedYear, extractYearFromHeader } = require('./src/utils/helpers.js');

const buffer = fs.readFileSync('C:/Users/gyrom/.gemini/antigravity/brain/6d803aee-cb97-45dd-8cf9-5ce09ab6e882/.user_uploaded/media__1785284180843.csv');
let text = new TextDecoder('utf-8').decode(buffer);
const lines = text.replace(/^\uFEFF/, '').split(/\r\n|\n/).filter(line => line.trim() !== '');

const headerCols = parseCSVRow(lines[0]);
const colMap = new Map();
headerCols.forEach((col, i) => colMap.set(col.trim(), i));

const isVerticalFormat = colMap.has('年度') && colMap.has('配属先');
console.log("Is Vertical Format?", isVerticalFormat);

const empGroups = new Map();
for (let i = 1; i < lines.length; i++) {
  const cols = parseCSVRow(lines[i]);
  if (cols.length < 2) continue;
  
  const getVal = (key) => {
    const idx = colMap.get(key);
    return idx !== undefined && idx < cols.length ? cols[idx] : undefined;
  };

  const empNum = getVal('職員番号');
  const empName = getVal('氏名');
  if (!empNum && !empName) continue;
  
  const key = empNum || empName;
  if (!empGroups.has(key)) {
    empGroups.set(key, {
      employeeNumber: empNum,
      name: empName,
      birthDate: getVal('生年月日'),
      hireDate: getVal('採用年月日'),
      history: []
    });
  }
  
  const yearStr = getVal('年度');
  const deptName = getVal('配属先');
  if (yearStr && deptName) {
    const y = parseInt(yearStr, 10);
    if (!isNaN(y)) {
      empGroups.get(key).history.push({
        year: y,
        department: deptName
      });
    }
  }
}

console.log("Extracted Groups:", empGroups.size);
if (empGroups.size > 0) {
  const first = Array.from(empGroups.values())[0];
  console.log("First Employee:", first.name, "History Count:", first.history.length);
}
