const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// I will insert addSimplePlanSheet right before exportPlanToExcel
const addSimplePlanSheetStr = \
export const addSimplePlanSheet = (workbook, sheetName, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {
  const ws = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', xSplit: 3, ySplit: 5 }] });
  
  // Define styles
  const fillSlate = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } };
  const fillAmber = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE68A' } };
  const fillBlue = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFDBFE' } };

  // Write title & headers
  ws.getRow(1).values = [fileName];
  ws.getRow(1).font = { bold: true, size: 12, color: { argb: 'FF1E293B' } };
  
  const curCounts = getCounts(currMap, employees);
  ws.getRow(2).values = [\【全体集計（今年度 \(R\)）】 \\];
  ws.getRow(2).font = { size: 9, color: { argb: 'FF0284C7' } };
  
  const nextCounts = getCounts(nextMap, employees);
  ws.getRow(3).values = [\【全体集計（来年度 \(R\)）】 \\];
  ws.getRow(3).font = { size: 9, color: { argb: 'FF0284C7' } };

  const r4 = ws.getRow(4);
  const r4Vals = ['部署名', '配属希望', '特殊事情', \今年度（\(R\)）\, '', '', '', \来年度（\(R\)）\, '', '', '', ''];
  r4.values = r4Vals;
  r4.height = 20;

  const r5 = ws.getRow(5);
  const r5Vals = ['', '', '', '職名', '氏名', '在籍', '年齢', '職名', '氏名', '在籍', '年齢', '備考'];
  r5.values = r5Vals;
  r5.height = 20;

  ws.mergeCells('A4:A5');
  ws.mergeCells('B4:B5');
  ws.mergeCells('C4:C5');
  ws.mergeCells('D4:G4'); // 今年度
  ws.mergeCells('H4:L4'); // 来年度

  for (let rn = 4; rn <= 5; rn++) {
    const row = ws.getRow(rn);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { size: 9, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = getCellBorders(true, true, true, true, true);
      let argb = 'FFCBD5E1';
      if (colNumber === 2 || colNumber === 3) argb = 'FF86EFAC';
      else if (colNumber >= 4 && colNumber <= 7) argb = 'FFFDE68A';
      else if (colNumber >= 8) argb = 'FFBFDBFE';
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
    });
  }
  
  // Set widths
  ws.getColumn(1).width = 20; // 部署名
  ws.getColumn(2).width = 10; // 配属希望
  ws.getColumn(3).width = 10; // 特殊事情
  ws.getColumn(4).width = 12; // 職名
  ws.getColumn(5).width = 18; // 氏名
  ws.getColumn(6).width = 10; // 在籍
  ws.getColumn(7).width = 8;  // 年齢
  ws.getColumn(8).width = 12; // 職名
  ws.getColumn(9).width = 18; // 氏名
  ws.getColumn(10).width = 10; // 在籍
  ws.getColumn(11).width = 8;  // 年齢
  ws.getColumn(12).width = 25; // 備考

  // We need to iterate over nodes just like addPlanSheet
  let flatNodes = [];
  traverseOrgTree(departments, flatNodes);
  flatNodes = flatNodes.filter(n => n.type === 'dept' || n.type === 'group' || n.type === 'post');

  for (const node of flatNodes) {
    if (node.type === 'dept') {
       const counts = filterLevel === 9 ? {} : getCounts(currMap, employees, node.id);
       const nCount = filterLevel === 9 ? {} : getCounts(nextMap, employees, node.id);
       let curTot = counts['合計'] || 0;
       let nxTot = nCount['合計'] || 0;
       let displayStr = node.name;
       if (showCount) displayStr += \ \→\\;
       
       const tr = ws.addRow([displayStr, '', '', '', '', '', '', '', '', '', '', '']);
       tr.getCell(1).font = { size: 10, bold: true, color: { argb: 'FF1E293B' } };
       for(let c=1; c<=12; c++){
          tr.getCell(c).border = getCellBorders(true, true, c===12, true, true);
       }
    } else if (node.type === 'group') {
       const counts = filterLevel === 9 ? {} : getCounts(currMap, employees, null, node.id);
       const nCount = filterLevel === 9 ? {} : getCounts(nextMap, employees, null, node.id);
       let curTot = counts['合計'] || 0;
       let nxTot = nCount['合計'] || 0;
       let displayStr = node.name;
       if (showCount) displayStr += \ \→\\;
       
       const tr = ws.addRow([displayStr, '', '', '', '', '', '', '', '', '', '', '']);
       tr.getCell(1).font = { size: 10, bold: true, color: { argb: 'FF1E293B' } };
       for(let c=1; c<=12; c++){
          tr.getCell(c).border = getCellBorders(true, true, c===12, true, true);
       }
    } else if (node.type === 'post') {
       const cList = currMap[node.id] || [];
       const nList = nextMap[node.id] || [];
       const maxCount = Math.max(cList.length, nList.length, 1);
       
       let displayStr = node.name;
       if (node.isAbolished) displayStr = \【廃止】\\;
       if (node.isNew) displayStr = \【新設】\\;
       
       for (let pIdx = 0; pIdx < maxCount; pIdx++) {
         const currEmpId = pIdx < cList.length ? cList[pIdx] : null;
         const nextEmpId = pIdx < nList.length ? nList[pIdx] : null;
         let currEmp = currEmpId ? employees.find(e => e.id === currEmpId) : null;
         let nextEmp = nextEmpId ? employees.find(e => e.id === nextEmpId) : null;
         
         const isAbolishedPost = node.isAbolished;
         const isRetained = currEmp && nextEmp && currEmp.id === nextEmp.id;
         
         let noteStr = notes[node.id] || '';
         
         let rowVals = [
           '', // 部署名
           '', // 配属希望
           '', // 特殊事情
           currEmp ? currEmp.currentTitle : '',
           currEmp ? getFormattedNameForPlan(currEmp, false) : '',
           getYearsStr(currEmp, false),
           getAgeStr(currEmp, false),
           nextEmp ? nextEmp.nextTitle : '',
           nextEmp ? getFormattedNameForPlan(nextEmp, true) : '',
           getYearsStr(nextEmp, true),
           getAgeStr(nextEmp, true),
           noteStr
         ];
         
         if (isAbolishedPost) {
           rowVals[7] = '';
           rowVals[8] = '後任なし';
           rowVals[9] = '';
           rowVals[10] = '';
         } else if (isRetained) {
           rowVals[7] = nextEmp.nextTitle;
           rowVals[8] = '';
           rowVals[9] = '';
           rowVals[10] = '';
         }
         
         if (currEmp && pIdx === 0) {
            rowVals[1] = currEmp.desiredAssignment || '';
            rowVals[2] = currEmp.specialCircumstances || '';
         } else if (nextEmp && pIdx === 0) {
            rowVals[1] = nextEmp.desiredAssignment || '';
            rowVals[2] = nextEmp.specialCircumstances || '';
         }
         
         const tr = ws.addRow(rowVals);
         
         for(let c=1; c<=12; c++){
            const cell = tr.getCell(c);
            cell.alignment = { vertical: 'middle', horizontal: c >= 6 && c !== 12 ? 'center' : 'left' };
            cell.font = { size: 9 };
            cell.border = getCellBorders(true, true, true, true, true);
            
            // Current year light blue if transferred OUT
            if (currEmp && !isRetained && c >= 4 && c <= 7) {
               cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6EAF8' } };
            }
            // Next year yellow/color if promoted
            if (nextEmp && !isRetained && c >= 8 && c <= 11) {
               if (getGradeLevel(nextEmp.nextGrade) > getGradeLevel(nextEmp.currentGrade)) {
                   const colorCode = getPromotedBgColorCode(nextEmp.nextGrade).replace('#', '').toUpperCase();
                   cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorCode } };
               }
            }
         }
       }
    }
  }
};
\;

code = code.replace(
  'export const exportPlanToExcel = async (fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {',
  addSimplePlanSheetStr + '\nexport const exportPlanToExcel = async (fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {'
);

code = code.replace(
  "addListSheet(workbook, '職員一覧', fileName, targetYear, employees, departments);",
  "addSimplePlanSheet(workbook, '人事異動案（シンプル）', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);\n  addListSheet(workbook, '職員一覧', fileName, targetYear, employees, departments);"
);

fs.writeFileSync('src/utils/exportExcel.js', code);
