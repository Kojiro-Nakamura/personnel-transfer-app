const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const oldSummaryRows = `    const summaryRows = [
      { label: '振興局外', valFn: (y) => (grouped[y] || []).filter(e => !e.isShinkokyoku).length },
      { label: '振興局', valFn: (y) => (grouped[y] || []).filter(e => e.isShinkokyoku).length },
      { label: '計', valFn: (y) => (grouped[y] || []).length },
      { label: '累計', valFn: (y) => cumulativeMap[y] }
    ];`;

const newSummaryRows = `    const summaryRows = [
      { label: '計', valFn: (y) => (grouped[y] || []).length },
      { label: '累計', valFn: (y) => cumulativeMap[y] }
    ];`;

code = code.replace(oldSummaryRows, newSummaryRows);

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');