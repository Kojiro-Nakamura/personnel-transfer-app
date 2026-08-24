const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const injectionPoint = 'export const addBirthYearSheet';
const sheetCodeStartIndex = code.indexOf(injectionPoint);

if (sheetCodeStartIndex !== -1) {
  let sheetCode = code.substring(sheetCodeStartIndex);
  
  // 1. Title year
  sheetCode = sheetCode.replace(
    /ws\.getCell\(currentRowIndex, 1\)\.value = '令和' \+ \(targetYear - 2018\) \+ '年度林学職生年別一覧';/g,
    "ws.getCell(currentRowIndex, 1).value = '令和' + (targetYear - 2019) + '年度林学職生年別一覧';"
  );
  
  // 2. Age calculation
  sheetCode = sheetCode.replace(
    /const age = targetYear - y;/g,
    "const age = (targetYear - 1) - y;"
  );
  
  // 3. Shrink to fit
  sheetCode = sheetCode.replace(
    /alignment = \{ horizontal: '([^']+)', vertical: '([^']+)' \};/g,
    "alignment = { horizontal: '', vertical: '', shrinkToFit: true };"
  );
  
  // Make sure we didn't add shrinkToFit to Title by accident
  // The title cell doesn't set alignment explicitly in the code currently. Let's check:
  // "ws.getCell(currentRowIndex, 1).font = titleFont;"
  // So it's safe.
  
  code = code.substring(0, sheetCodeStartIndex) + sheetCode;
  fs.writeFileSync('src/utils/exportExcel.js', code);
  console.log('done');
} else {
  console.log('could not find addBirthYearSheet');
}