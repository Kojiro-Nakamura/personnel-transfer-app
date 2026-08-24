const fs = require('fs');
const targetPath = 'C:\\Users\\gyrom\\Documents\\Antigravity\\人事異動案作成アプリ\\src\\utils\\exportExcel.js';
let code = fs.readFileSync(targetPath, 'utf8');

const startIdx = code.indexOf('export const addSimplePlanSheet =');
const endIdx = code.indexOf('export const exportPlanToExcel =');

const newFunc = \export const addSimplePlanSheet = (workbook, sheetName, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {
  const ws = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', xSplit: 3, ySplit: 5, showGridLines: false }],
    pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5 } }
  });
  ws.pageSetup.printTitlesRow = '1:5';

  const fillSlate = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } };
  const fillAmber = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE68A' } };
  const fillBlue = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFDBFE' } };

  ws.getRow(1).values = [fileName];
  ws.getRow(1).font = { bold: true, size: 12, color: { argb: 'FF1E293B' } };
  
  const curSummary = generateGradeSummary(employees, false);
  ws.getRow(2).values = [\\\【全体集計（今年度 \\\(R\\\)）】 \\\\\\];
  ws.getRow(2).font = { size: 9, color: { argb: 'FF0284C7' } };
  
  const nextSummary = generateGradeSummary(employees, true);
  ws.getRow(3).values = [\\\【全体集計（来年度 \\\(R\\\)）】 \\\\\\];
  ws.getRow(3).font = { size: 9, color: { argb: 'FF0284C7' } };

  const r4 = ws.getRow(4);
  r4.values = ['部署名', '配属希望', '特殊事情', \\\今年度（\\\(R\\\)）\\\, '', '', '', \\\来年度（\\\(R\\\)）\\\, '', '', '', '備考'];
  r4.height = 20;

  const r5 = ws.getRow(5);
  r5.values = ['', '', '', '職名', '氏名', '在籍', '年齢', '職名', '氏名', '在籍', '年齢', ''];
  r5.height = 20;

  ws.mergeCells('A4:A5');
  ws.mergeCells('B4:B5');
  ws.mergeCells('C4:C5');
  ws.mergeCells('D4:G4');
  ws.mergeCells('H4:K4');
  ws.mergeCells('L4:L5');

  for (let rn = 4; rn <= 5; rn++) {
    const row = ws.getRow(rn);
    for (let c = 1; c <= 12; c++) {
      const cell = row.getCell(c);
      cell.font = { size: 9, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = getCellBorders(true, true, true, true, true);
      let argb = 'FFCBD5E1';
      if (c === 2 || c === 3) argb = 'FF86EFAC';
      else if (c >= 4 && c <= 7) argb = 'FFFDE68A';
      else if (c >= 8 && c <= 11) argb = 'FFBFDBFE';
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
    }
  }

  ws.getColumn(1).width = 20;
  ws.getColumn(2).width = 10;
  ws.getColumn(3).width = 10;
  ws.getColumn(4).width = 12;
  ws.getColumn(5).width = 18;
  ws.getColumn(6).width = 10;
  ws.getColumn(7).width = 8;
  ws.getColumn(8).width = 12;
  ws.getColumn(9).width = 18;
  ws.getColumn(10).width = 10;
  ws.getColumn(11).width = 8;
  ws.getColumn(12).width = 25;

  let rowIndex = 6;
  let lastDept = null;
  let lastGroup = null;

  traverseOrgTree(departments, deptMap, currMap, nextMap, filterLevel, (dept, group, postName, currEmp, nextEmp, rowType, i, post) => {
    const isNewDept = lastDept !== dept.id;
    const isNewGroup = isNewDept || (group && lastGroup !== group.id);
    const deptName = dept.nextName && dept.nextName !== dept.name ? \\\\\\ / \\\\\\ : dept.name;
    const groupName = group ? (group.nextName && group.nextName !== group.name ? \\\\\\ / \\\\\\ : group.name) : '';

    if (filterLevel > 0) {
      const currLvl = currEmp ? getGradeLevel(currEmp.currentGrade) : 0;
      const nextLvl = nextEmp ? getGradeLevel(nextEmp.nextGrade) : 0;
      const hasEmp = currEmp || nextEmp;
      if (postName !== '班員' && postName !== '') {
        if (hasEmp && currLvl < filterLevel && nextLvl < filterLevel) return; 
      } else {
        if (currLvl < filterLevel && nextLvl < filterLevel) return; 
      }
    }

    let displayDeptStr = '';
    if (isNewDept) {
      if (dept.id && deptMap[dept.id]) {
        const dm = deptMap[dept.id];
        const deptCurrEmps = [...dm.direct.current];
        const deptNextEmps = [...dm.direct.next];
        Object.values(dm.posts).forEach(p => { deptCurrEmps.push(...p.current); deptNextEmps.push(...p.next); });
        Object.values(dm.groups).forEach(g => {
          deptCurrEmps.push(...g.direct.current); deptNextEmps.push(...g.direct.next);
          Object.values(g.posts).forEach(gp => { deptCurrEmps.push(...gp.current); deptNextEmps.push(...gp.next); });
        });
        const cCounts = getCounts(deptCurrEmps, false);
        const nCounts = getCounts(deptNextEmps, true);
        if (showCount) {
          displayDeptStr = \\\\\\ \\\→\\\\\\;
        } else {
          displayDeptStr = deptName;
        }
      }
    }

    let displayGroupStr = '';
    if (isNewGroup && groupName !== '') {
      if (dept.id && group && group.id && deptMap[dept.id].groups[group.id]) {
        const gm = deptMap[dept.id].groups[group.id];
        const grpCurrEmps = [...gm.direct.current];
        const grpNextEmps = [...gm.direct.next];
        Object.values(gm.posts).forEach(gp => { grpCurrEmps.push(...gp.current); grpNextEmps.push(...gp.next); });
        const gCCounts = getCounts(grpCurrEmps, false);
        const gNCounts = getCounts(grpNextEmps, true);
        if (showCount) {
          displayGroupStr = \\\\\\ \\\→\\\\\\;
        } else {
          displayGroupStr = groupName;
        }
      }
    }

    const cYearsStr = currEmp ? getEmpCurrentYears(currEmp, targetYear - 1, false) : '';
    const nYearsStr = nextEmp ? getEmpCurrentYears(nextEmp, targetYear, true) : '';

    const cAgeStr = currEmp && currEmp.birthDate ? \\\\\\\\\ : '';
    const nAgeStr = nextEmp && nextEmp.birthDate ? \\\\\\\\\ : '';

    let rowVals = [
      displayDeptStr || displayGroupStr,
      '', '', '', '', '', '', '', '', '', '', ''
    ];

    if (currEmp) {
      rowVals[3] = currEmp.currentTitle || '';
      rowVals[4] = getFormattedNameForPlan(currEmp, false) || '';
      rowVals[5] = cYearsStr;
      rowVals[6] = cAgeStr !== 'null' ? cAgeStr : '';
      if (i === 0) {
        rowVals[1] = currEmp.desiredAssignment || '';
        rowVals[2] = currEmp.specialCircumstances || '';
      }
    }
    
    if (nextEmp) {
      rowVals[7] = nextEmp.nextTitle || '';
      rowVals[8] = getFormattedNameForPlan(nextEmp, true) || '';
      rowVals[9] = nYearsStr;
      rowVals[10] = nAgeStr !== 'null' ? nAgeStr : '';
      if (i === 0 && !currEmp) {
        rowVals[1] = nextEmp.desiredAssignment || '';
        rowVals[2] = nextEmp.specialCircumstances || '';
      }
    }

    const isRetained = currEmp && nextEmp && currEmp.id === nextEmp.id;
    if (post && post.isAbolished) {
      rowVals[7] = ''; rowVals[8] = '後任なし'; rowVals[9] = ''; rowVals[10] = '';
    } else if (isRetained) {
      rowVals[7] = nextEmp.nextTitle || ''; rowVals[8] = ''; rowVals[9] = ''; rowVals[10] = '';
    }

    if (post && notes) {
      const noteObj = notes.find(n => n.targetId === post.id);
      rowVals[11] = noteObj ? noteObj.text || '' : '';
    }

    const tr = ws.addRow(rowVals);

    for (let c = 1; c <= 12; c++) {
      const cell = tr.getCell(c);
      cell.alignment = { vertical: 'middle', horizontal: c >= 6 && c !== 12 ? 'center' : 'left' };
      cell.font = { size: 9 };
      cell.border = getCellBorders(true, true, true, true, true);
      
      if (currEmp && !isRetained && c >= 4 && c <= 7) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBAE6FD' } };
      }
      if (nextEmp && !isRetained && c >= 8 && c <= 11) {
        if (getGradeLevel(nextEmp.nextGrade) > getGradeLevel(nextEmp.currentGrade)) {
          const rawColor = getPromotedBgColorCode(nextEmp.nextGrade);
          if (rawColor) {
             const colorCode = rawColor.replace('#', '').toUpperCase();
             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorCode } };
          }
        }
      }
    }

    lastDept = dept.id;
    lastGroup = group ? group.id : null;
    rowIndex++;
  });
};
\;

code = code.substring(0, startIdx) + newFunc + '\n' + code.substring(endIdx);
fs.writeFileSync(targetPath, code);
console.log("Patched addSimplePlanSheet successfully.");
