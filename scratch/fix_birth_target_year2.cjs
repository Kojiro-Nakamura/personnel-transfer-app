const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const injectionPoint = 'export const addBirthYearSheet';
const sheetCodeStartIndex = code.indexOf(injectionPoint);

if (sheetCodeStartIndex !== -1) {
  let sheetCode = code.substring(sheetCodeStartIndex);
  
  sheetCode = sheetCode.replace(
    /ws\.getCell\(currentRowIndex, 1\)\.value = '令和' \+ \(targetYear - 2018\) \+ '年度林学職生年別一覧';/g,
    "ws.getCell(currentRowIndex, 1).value = '令和' + (targetYear - 2019) + '年度林学職生年別一覧';"
  );
  
  sheetCode = sheetCode.replace(
    /const age = targetYear - y;/g,
    "const age = (targetYear - 1) - y;"
  );
  
  sheetCode = sheetCode.replace(
    /alignment = \{ horizontal: '([^']+)', vertical: '([^']+)' \};/g,
    "alignment = { horizontal: '$1', vertical: '$2', shrinkToFit: true };"
  );
  
  code = code.substring(0, sheetCodeStartIndex) + sheetCode;
  fs.writeFileSync('src/utils/exportExcel.js', code);
  console.log('done');
}