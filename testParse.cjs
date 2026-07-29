const { parseCSVRow, parseJapaneseDate, calculateAge, getEraFormattedYear, extractYearFromHeader } = require('./src/utils/helpers.js');

const csvLines = [
  "職員番号,氏名,生年月日,最終学歴,採用年月日,特記事項,【今年度】部署名,【今年度】ポスト・役職名,【今年度】内部ポスト名,【今年度】職名,【今年度】級,【今年度】年数,【今年度】詳細,【今年度】人,【今年度】カウント外,【来年度】部署名,【来年度】ポスト・役職名,【来年度】内部ポスト名,【来年度】職名,【来年度】級,【来年度】年数,【来年度】詳細,【来年度】人,【来年度】カウント外,【昇進年度】係長級(主査),【昇進年度】補佐級I(主任),【昇進年度】補佐級II(班長),【昇進年度】補佐級III,【昇進年度】課長級,【昇進年度】所属長級,【昇進年度】次長級,【昇進年度】部長級,1985(S60),1986(S61)",
  "000001,山田 太郎,1980-01-01,,2000-04-01,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,部署A,部署B"
];

const headerCols = parseCSVRow(csvLines[0]);
const csvYearsMap = new Map();
for (let k = 32; k < headerCols.length; k++) {
  const year = extractYearFromHeader(headerCols[k]);
  if (year) {
    csvYearsMap.set(k, year);
  }
}

console.log("csvYearsMap:", csvYearsMap);

const cols = parseCSVRow(csvLines[1]);
let newHistory = [];
for (let [k, year] of csvYearsMap.entries()) {
  if (k < cols.length) {
    const deptName = cols[k] || '';
    if (deptName) {
      newHistory.push({
        year,
        department: deptName
      });
    }
  }
}
console.log("newHistory:", newHistory);
