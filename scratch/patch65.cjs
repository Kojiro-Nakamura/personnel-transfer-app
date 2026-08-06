const fs = require('fs');
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

// 1. generateGradeSummary outputs
content = content.replace('【全体集計（今年度）】', '【全体集計（今年度 ${targetYear - 1}(R${targetYear - 2019})）】');
content = content.replace('【全体集計（来年度）】', '【全体集計（来年度 ${targetYear}(R${targetYear - 2018})）】');

// 2. HTML table headers
const oldHtmlCurr = '<th colspan="6" style="background-color: #cbd5e1;">今年度</th>';
const newHtmlCurr = '<th colspan="6" style="background-color: #cbd5e1;">今年度（${targetYear - 1}(R${targetYear - 2019})）</th>';
content = content.replace(oldHtmlCurr, newHtmlCurr);

const oldHtmlNext = '<th colspan="6" style="background-color: #bfdbfe;">来年度</th>';
const newHtmlNext = '<th colspan="6" style="background-color: #bfdbfe;">来年度（${targetYear}(R${targetYear - 2018})）</th>';
content = content.replace(oldHtmlNext, newHtmlNext);

fs.writeFileSync('src/hooks/useExportActions.js', content);
console.log('Done');
