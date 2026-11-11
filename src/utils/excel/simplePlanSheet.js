import { getGradeLevel, getEraFormattedYear, calculateAge, getPromotedBgColorCode, traverseOrgTree, getCounts, formatCountText, generateGradeSummary, isPromotedGrade, getEmpCurrentYears, calculateServiceYears, formatPromoDateWithEra, getEraSuffix, getEraSuffixForDate, formatServiceYearsText, formatDateForDisplay, getFormattedNameForPlan, shouldOmitEmployeeNumber, sortEmployeeList } from '../helpers.js';
import { GRADE_LEVELS, GRADE_OPTIONS } from '../../constants/config.js';
import { defaultFont, headerFont, borderStyle, thickBorderStyle, grayBorderStyle, grayThickBorderStyle, getCellBorders, getBirthFiscalYear, getHireFiscalYearShort, getEraYearOnly } from './excelHelpers.js';

export const addSimplePlanSheet = (workbook, sheetName, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {
  const allHistoryYears = new Set();
  allHistoryYears.add(targetYear);
  employees.forEach(e => {
    if (e.history) e.history.forEach(h => allHistoryYears.add(h.year));
  });
  const historyYears = Array.from(allHistoryYears).sort((a, b) => a - b);

  const formatWithEra = (dateStr, birthDateStr = null) => {
    if (!dateStr) return '';
    let res = formatPromoDateWithEra(String(dateStr));
    if (birthDateStr && dateStr) {
      const match = String(dateStr).match(/^(\d{4})[-/]/);
      if (match) {
         const year = parseInt(match[1], 10);
         const ag = calculateAge(birthDateStr, year);
         if (ag) res += '(' + ag + '歳)';
      }
    }
    return res;
  };

  const getShortGrade = (grade) => {
    if (!grade) return '';
    const g = String(grade);
    if (g.includes('部長級')) return '部';
    if (g.includes('次長級')) return '次';
    if (g.includes('所属長級')) return '所';
    if (g.includes('課長級')) return '課';
    if (g.includes('補佐級III') || g.includes('補佐級Ⅲ')) return 'Ⅲ';
    if (g.includes('補佐級II') || g.includes('補佐級Ⅱ')) return 'Ⅱ';
    if (g.includes('補佐級I') || g.includes('補佐級Ⅰ')) return 'Ⅰ';
    if (g.includes('係長級')) return '係';
    return '';
  };

  const ws = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', xSplit: 11, ySplit: 6, showGridLines: false }],
    pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.1, footer: 0.1 } }
  });
  ws.pageSetup.printTitlesRow = '1:6';

  const fillSlate = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } };
  const fillAmber = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE68A' } };
  const fillBlue = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFDBFE' } };

  ws.getRow(1).values = [fileName];
  ws.getRow(1).font = { name: 'BIZ UDPゴシック', bold: true, size: 12, color: { argb: 'FF1E293B' } };
  
  const curSummary = generateGradeSummary(employees, false);
  ws.getRow(2).values = [`【全体集計（今年度 ${targetYear - 1}(R${targetYear - 2019})）】 ${curSummary}`];
  ws.getRow(2).font = { name: 'BIZ UDPゴシック', size: 9, color: { argb: 'FF0284C7' } };
  
  const nextSummary = generateGradeSummary(employees, true);
  ws.getRow(3).values = [`【全体集計（来年度 ${targetYear}(R${targetYear - 2018})）】 ${nextSummary}`];
  ws.getRow(3).font = { name: 'BIZ UDPゴシック', size: 9, color: { argb: 'FF0284C7' } };

  ws.getRow(4).values = ['級凡例：部：部長級　次：次長級　所：所属長級　課：課長級　Ⅲ：補佐級Ⅲ（補佐兼班長）　Ⅱ：補佐級Ⅱ（班長）　Ⅰ：補佐級Ⅰ（主任）　係：係長級（主査）'];
  ws.getRow(4).font = { name: 'BIZ UDPゴシック', size: 9, color: { argb: 'FF1E293B' } };

  ws.mergeCells('A2:N2');
  ws.getCell('A2').alignment = { shrinkToFit: true, vertical: 'middle' };
  ws.mergeCells('A3:N3');
  ws.getCell('A3').alignment = { shrinkToFit: true, vertical: 'middle' };
  ws.mergeCells('A4:N4');
  ws.getCell('A4').alignment = { shrinkToFit: true, vertical: 'middle' };


  ws.getRow(4).getCell(16).value = '＜参考＞';
  ws.getRow(4).getCell(16).font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };

  const targetYearIndex = Math.max(0, historyYears.indexOf(targetYear));
  const legendEndCol = 36 + targetYearIndex;
  const legendLabels = ["凡例", "係長級(主査)", "補佐級I(主任)", "補佐級II(班長)", "補佐級III(補佐兼班長)", "課長級", "所属長級", "次長級", "部長級"];
  const legendStartCol = legendEndCol - 8;

  for (let i = 0; i < legendLabels.length; i++) {
    const colNumber = legendStartCol + i;
    if (colNumber > 1) { 
      const cell = ws.getRow(2).getCell(colNumber);
      cell.value = legendLabels[i];
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      if (i === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        cell.font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };
      } else {
        cell.font = { name: 'BIZ UDPゴシック', size: 8, bold: false, color: { argb: 'FF000000' } };
        const c = getPromotedBgColorCode(legendLabels[i]);
        if (c) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + c.replace('#', '').toUpperCase() } };
      }
    }
  }

  const r5 = ws.getRow(5);
  const r5Vals = ['部署名', '配属希望', '特殊事情', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', '', '', ''];
  const currentEraShort = `R${targetYear - 2019}`;
  r5Vals.push('氏名', `${currentEraShort}年齢`, 'フリガナ', '基本情報', '', '', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', '');
  historyYears.forEach((y, i) => {
    if (i === 0) r5Vals.push('履歴');
    else r5Vals.push('');
  });
  r5.values = r5Vals;
  r5.height = 20;

  const r6 = ws.getRow(6);
  const r6Vals = ['', '', '', '職名', '氏名', '級', '在籍', '年齢', '職名', '氏名', '級', '在籍', '年齢', '備考', ''];
  r6Vals.push('氏名', '年齢', 'フリガナ', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '〇配属希望', '●特殊事情', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度');
  historyYears.forEach(y => r6Vals.push(`R${y-2018}(${y})`));
  r6.values = r6Vals;
  r6.height = 20;

  ws.mergeCells('A5:A6');
  ws.mergeCells('B5:B6');
  ws.mergeCells('C5:C6');
  ws.mergeCells('D5:H5');
  ws.mergeCells('I5:N5');
  
  ws.mergeCells('P5:P6');
  ws.mergeCells('Q5:Q6');
  ws.mergeCells('R5:R6');
  ws.mergeCells('S5:Z5');
  ws.mergeCells('AA5:AJ5');
  
  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(36 + historyYears.length).letter;
    const startColCode = ws.getColumn(37).letter;
    ws.mergeCells(`${startColCode}5:${endColCode}5`);
  }


  const totalCols = 36 + historyYears.length;
  for (let rn = 5; rn <= 6; rn++) {
    const row = ws.getRow(rn);
    for (let c = 1; c <= totalCols; c++) {
      if (c === 15) continue;
      const cell = row.getCell(c);
      cell.font = { name: 'BIZ UDPゴシック', size: (c === 2 || c === 3) ? 8 : 9, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true };
      if (c === 2 || c === 3) {
        cell.alignment = { ...cell.alignment, textRotation: 'vertical' };
      }
      
      let topStyle = rn === 5 ? 'medium' : 'hair';
      let bottomStyle = rn === 6 ? 'medium' : 'hair';
      let leftStyle = (c === 1 || c === 2 || c === 9) ? 'medium' : 'thin';
      let rightStyle = (c === 14 || c === 1 || c === 8) ? 'medium' : 'thin';
      
      // 縦にセル結合されている列(1, 2, 3)は、6行目の処理で上罫線が細線で上書きされるのを防ぐため、明示的に上下を太線にする
      if (c === 1 || c === 2 || c === 3) {
         topStyle = 'medium';
         bottomStyle = 'medium';
      }
      

      if (c >= 16) {
        let argb = 'FFCBD5E1';
        if (c >= 16 && c <= 18) argb = 'FFCBD5E1'; 
        if (c >= 19 && c <= 26) argb = 'FFBFDBFE'; 
        if (c >= 27 && c <= 36) {
           const promoColors = {
              28: getPromotedBgColorCode('係長級(主査)'),
              29: getPromotedBgColorCode('補佐級I(主任)'),
              30: getPromotedBgColorCode('補佐級II(班長)'),
              31: getPromotedBgColorCode('補佐級III(補佐兼班長)'),
              32: getPromotedBgColorCode('課長級'),
              33: getPromotedBgColorCode('所属長級'),
              34: getPromotedBgColorCode('次長級'),
              35: getPromotedBgColorCode('部長級'),
           };
           if (rn === 6 && promoColors[c]) {
              argb = 'FF' + promoColors[c].replace('#', '').toUpperCase();
           } else {
              argb = 'FFF5D0FE'; 
           }
        }
        if (c >= 37) argb = 'FFA7F3D0'; 
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
      }

      if (c >= 16) {
        let topB = rn === 5 ? 'thick' : false;
        if (rn === 6 && [16, 17, 18].includes(c)) topB = 'thick';
        let bottomB = rn === 6 ? 'thick' : false;
        if (rn === 5) bottomB = true; 
        
        const leftB = [16, 19, 27, 37].includes(c) ? 'thick' : true;
        const rightB = [18, 26, 36, totalCols].includes(c) ? 'thick' : true;
        
        const newBorder = getCellBorders(topB, bottomB, leftB, rightB);
        cell.border = newBorder;
      } else {
        cell.border = {
          top: { style: topStyle, color: { argb: 'FF000000' } },
          bottom: { style: bottomStyle, color: { argb: 'FF000000' } },
          left: { style: leftStyle, color: { argb: 'FF000000' } },
          right: { style: rightStyle, color: { argb: 'FF000000' } }
        };
      }

      if (c <= 14) {
        let argb = 'FFCBD5E1';
        if (c === 2 || c === 3) argb = 'FFFDBA74'; // Orange 300
        else if (c >= 4 && c <= 8) argb = 'FFFEF3C7'; // Amber 100
        else if (c >= 9 && c <= 14) argb = 'FFDBEAFE'; // Blue 100
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
      }
    }
  }

  ws.getColumn(1).width = 20;
  ws.getColumn(2).width = 1.98;
  ws.getColumn(3).width = 1.98;
  ws.getColumn(4).width = 12;
  ws.getColumn(9).width = 12;
  ws.getColumn(24).width = 20;
  ws.getColumn(25).width = 20;
  ws.getColumn(26).width = 20;

  let rowIndex = 7;
  let lastDept = null;
  let lastGroup = null;

  const getYearsStr = (emp, isNext) => {
    if (!emp) return '';
    const years = getEmpCurrentYears(emp, isNext ? targetYear : targetYear - 1, isNext);
    const skills = isNext ? emp.nextSkills : emp.currentSkills;
    return skills?.length ? `${years}(${skills.join('+')})` : `${years}`;
  };

  traverseOrgTree(departments, deptMap, currMap, nextMap, filterLevel, (dept, group, postName, currEmp, nextEmp, rowType, i, post) => {
    const isNewDept = lastDept !== dept.id;
    const isNewGroup = isNewDept || (group && lastGroup !== group.id);
    const deptName = dept.nextName && dept.nextName !== dept.name ? `${dept.name} / ${dept.nextName}` : dept.name;
    const groupName = group ? (group.nextName && group.nextName !== group.name ? `${group.name} / ${group.nextName}` : group.name) : '';

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
          displayDeptStr = `${deptName} ${cCounts.main || 0}→${nCounts.main || 0}`;
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
          displayGroupStr = `${groupName} ${gCCounts.main || 0}→${gNCounts.main || 0}`;
        } else {
          displayGroupStr = groupName;
        }
      }
    }

    const cYearsStr = getYearsStr(currEmp, false);
    const nYearsStr = getYearsStr(nextEmp, true);

    const cAgeVal = currEmp && currEmp.birthDate ? calculateAge(currEmp.birthDate, targetYear - 1) : '';
    const nAgeVal = nextEmp && nextEmp.birthDate ? calculateAge(nextEmp.birthDate, targetYear) : '';

    let rowVals = [
      displayDeptStr || displayGroupStr,
      '', '', '', '', '', '', '', '', '', '', '', '', ''
    ];

    if (currEmp) {
      rowVals[3] = currEmp.currentTitle || '';
      rowVals[4] = getFormattedNameForPlan(currEmp, false) || '';
      rowVals[5] = getShortGrade(currEmp.currentGrade);
      rowVals[6] = cYearsStr;
      rowVals[7] = cAgeVal !== '' ? Number(cAgeVal) : '';
      rowVals[1] = currEmp.desiredAssignment ? '〇' + currEmp.desiredAssignment : '';
      rowVals[2] = currEmp.specialCircumstances ? '●' + currEmp.specialCircumstances : '';
    }
    
    if (nextEmp) {
      rowVals[8] = nextEmp.nextTitle || '';
      rowVals[9] = getFormattedNameForPlan(nextEmp, true) || '';
      rowVals[10] = getShortGrade(nextEmp.nextGrade);
      rowVals[11] = nYearsStr;
      rowVals[12] = nAgeVal !== '' ? Number(nAgeVal) : '';
    }

    const isRetained = currEmp && nextEmp && currEmp.id === nextEmp.id;
    if (post && post.isAbolished) {
      rowVals[8] = ''; rowVals[9] = '後任なし'; rowVals[10] = ''; rowVals[11] = ''; rowVals[12] = '';
    }
    
    const extEmp = nextEmp;
    let curPromoColors = {};
    if (extEmp) {
      rowVals[14] = '';
      rowVals[15] = getFormattedNameForPlan(extEmp, true);
      rowVals[16] = (extEmp.birthDate && calculateAge(extEmp.birthDate, targetYear - 1) !== '') ? Number(calculateAge(extEmp.birthDate, targetYear - 1)) : '';
      rowVals[17] = extEmp.furigana || '';
      rowVals[18] = extEmp.employeeNumber || '';
      rowVals[19] = extEmp.gender || '';
      rowVals[20] = formatWithEra(extEmp.birthDate);
      rowVals[21] = extEmp.education || '';
      rowVals[22] = formatWithEra(extEmp.hireDate, extEmp.birthDate);
      rowVals[23] = extEmp.note || '';
      rowVals[24] = extEmp.desiredAssignment ? '〇' + extEmp.desiredAssignment : '';
      rowVals[25] = extEmp.specialCircumstances ? '●' + extEmp.specialCircumstances : '';
      
      let hireStr = '';
      if (extEmp.hireDate) {
        hireStr = formatDateForDisplay(extEmp.hireDate);
        const y = parseInt(String(extEmp.hireDate).split('-')[0], 10);
        if (extEmp.birthDate && !isNaN(y)) {
           const ag = calculateAge(extEmp.birthDate, y);
           if (ag) hireStr += `(${ag}歳)`;
        }
      }
      rowVals[26] = hireStr;
      
      const pKeys = ['promoYearHire', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
      const gradeToPromoKey = { '係長級(主査)': 'promoYearChief', '補佐級I(主任)': 'promoYearAssistant1', '補佐級II(班長)': 'promoYearAssistant2', '補佐級III(補佐兼班長)': 'promoYearAssistant3', '課長級': 'promoYearSecHead', '所属長級': 'promoYearDivHead', '次長級': 'promoYearDeputyHead', '部長級': 'promoYearDeptHead' };

      const promoYearMap = {};
      if (extEmp.promoYearChief) promoYearMap[parseInt(extEmp.promoYearChief)] = "係長級(主査)";
      if (extEmp.promoYearAssistant1) promoYearMap[parseInt(extEmp.promoYearAssistant1)] = "補佐級I(主任)";
      if (extEmp.promoYearAssistant2) promoYearMap[parseInt(extEmp.promoYearAssistant2)] = "補佐級II(班長)";
      if (extEmp.promoYearAssistant3) promoYearMap[parseInt(extEmp.promoYearAssistant3)] = "補佐級III(補佐兼班長)";
      if (extEmp.promoYearSecHead) promoYearMap[parseInt(extEmp.promoYearSecHead)] = "課長級";
      if (extEmp.promoYearDivHead) promoYearMap[parseInt(extEmp.promoYearDivHead)] = "所属長級";
      if (extEmp.promoYearDeputyHead) promoYearMap[parseInt(extEmp.promoYearDeputyHead)] = "次長級";
      if (extEmp.promoYearDeptHead) promoYearMap[parseInt(extEmp.promoYearDeptHead)] = "部長級";

      let isPromotedThisYear = false;
      for (let idx = 1; idx < pKeys.length; idx++) {
        const key = pKeys[idx];
        let cellVal = extEmp[key] || '';
        let isNextPromo = false;
        if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade) && gradeToPromoKey[extEmp.nextGrade] === key) {
           isNextPromo = true;
           isPromotedThisYear = true;
           cellVal = targetYear + '-04-01';
        }
        
        let prevDate = '';
        if (cellVal) {
           for (let i = idx - 1; i >= 0; i--) {
             let pVal = pKeys[i] === 'promoYearHire' ? extEmp.hireDate : (extEmp[pKeys[i]] || '');
             if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade) && gradeToPromoKey[extEmp.nextGrade] === pKeys[i]) {
                 pVal = `${targetYear}-04-01`;
             }
             if (pVal) { prevDate = pVal; break; }
           }
        }
        
        const diff = (prevDate && cellVal) ? calculateServiceYears(prevDate, cellVal, true) : null;
        let cellStr = '';
        if (cellVal) {
           if (diff !== null) cellStr += `${formatServiceYearsText(diff)}> `;
           else cellStr += `> `;
           
           cellStr += formatDateForDisplay(cellVal);
           const y = parseInt(String(cellVal).split('-')[0], 10);
           if (extEmp.birthDate && !isNaN(y)) {
              const ag = calculateAge(extEmp.birthDate, y);
              if (ag) cellStr += `(${ag}歳)`;
           }
        }
        rowVals[26 + idx] = cellStr;
        if (isNextPromo) {
           curPromoColors[26 + idx + 1] = getPromotedBgColorCode(extEmp.nextGrade); // +1 because rowVals is 0-indexed, excel columns are 1-indexed
        }
      }
      
      if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade)) {
         const c = getPromotedBgColorCode(extEmp.nextGrade);
         if (c) {
             curPromoColors[16] = c; // 氏名
             curPromoColors[17] = c; // 年齢
             curPromoColors[36] = c; // 来年度
         }
      }
      
      let finalDiff = null;
      if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade)) {
        finalDiff = 1;
      } else {
        let prevY = NaN;
        for (let i = pKeys.length - 1; i >= 0; i--) {
          const y = pKeys[i] === 'promoYearHire' ? (extEmp.hireDate ? parseInt(String(extEmp.hireDate).substring(0,4)) : NaN) : parseInt(extEmp[pKeys[i]] || 'NaN');
          if (!isNaN(y)) { prevY = y; break; }
        }
        finalDiff = (!isNaN(prevY)) ? targetYear - prevY + 1 : null;
      }
      let nYearStr = `> ${finalDiff !== null ? formatServiceYearsText(finalDiff) : ''}`;
      if (finalDiff !== null && extEmp.birthDate) {
        const ag = calculateAge(extEmp.birthDate, targetYear);
        if (ag) nYearStr += `(${ag}歳)`;
      }
      rowVals[35] = nYearStr;
      
      historyYears.forEach((y, i) => {
        let historyStr = '';
        if (y === targetYear) {
           let nDeptName = '';
           if (extEmp.departmentId === 'retired') {
              nDeptName = '退職';
           } else if (!extEmp.departmentId || extEmp.departmentId === 'unassigned') {
              nDeptName = '未配置';
           } else {
              const nDept = departments.find(d => d.id === extEmp.departmentId);
              const nGroup = nDept && extEmp.groupId ? (nDept.groups || []).find(g => g.id === extEmp.groupId) : null;
              const d = nDept ? (nDept.nextName || nDept.name) : '';
              const g = nGroup ? (nGroup.nextName || nGroup.name) : '';
              let pStr = '';
              if (extEmp.postId && nDept) {
                  const p = (nDept.posts || []).find(x => x.id === extEmp.postId);
                  if (p) pStr = '（' + (p.nextName || p.name) + '）';
              } else if (extEmp.groupPostId && nGroup) {
                  const gp = (nGroup.posts || []).find(x => x.id === extEmp.groupPostId);
                  if (gp) pStr = '（' + (gp.nextName || gp.name) + '）';
              }
              if (d === 'システム用外枠') nDeptName = '未配置';
              else if (d && !g) nDeptName = `${d}${pStr}`;
              else nDeptName = `${d} ${g}${pStr}`;
           }
           historyStr = nDeptName;
        } else {
           if (extEmp.history) {
             const h = extEmp.history.find(x => x.year === y);
             if (h) historyStr = h.department ? h.department + (h.title ? ' / ' + h.title : '') : (h.title || '');
           }
        }
        if (historyStr && historyStr !== ' / 課直轄' && historyStr !== '未配置' && historyStr !== '-') {
           const histAge = (extEmp.birthDate && !isNaN(y)) ? calculateAge(extEmp.birthDate, y) : null;
           if (histAge !== null && !isNaN(histAge)) {
              historyStr = `${historyStr} (${histAge}歳)`;
           }
        }
        rowVals[36 + i] = historyStr;
        if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade) && y === targetYear) {
           const c = getPromotedBgColorCode(extEmp.nextGrade);
           if (c) curPromoColors[36 + i + 1] = c;
        } else if (promoYearMap[y]) {
           const c = getPromotedBgColorCode(promoYearMap[y]);
           if (c) curPromoColors[36 + i + 1] = c;
        }
      });

    }

    const isCurrTransferred = currEmp ? (
      currEmp.departmentId !== currEmp.currentDeptId ||
      currEmp.groupId !== currEmp.currentGroupId ||
      currEmp.postId !== currEmp.currentPostId ||
      currEmp.groupPostId !== currEmp.currentGroupPostId
    ) : false;

    const isNextTransferred = nextEmp ? (
      nextEmp.departmentId !== nextEmp.currentDeptId ||
      nextEmp.groupId !== nextEmp.currentGroupId ||
      nextEmp.postId !== nextEmp.currentPostId ||
      nextEmp.groupPostId !== nextEmp.currentGroupPostId
    ) : false;

    let remarkStr = nextEmp ? (nextEmp.nextEmploymentType || '') : '';

    let targetId = '';
    if (rowType === 'post') targetId = `postRow-${dept.id}-${post.id}-${i}`;
    else if (rowType === 'groupPost') targetId = `groupPostRow-${dept.id}-${group.id}-${post.id}-${i}`;
    else if (rowType === 'direct') targetId = `directRow-${dept.id}-${group.id}-${i}`;
    else if (rowType === 'deptDirect') targetId = `deptDirectRow-${dept.id}-${i}`;
    else if (rowType === 'system') targetId = `side-${nextEmp ? nextEmp.id : currEmp?.id}`;

    if (Array.isArray(notes)) {
      const rowNote = notes.find(n => n.targetId === targetId);
      if (rowNote && rowNote.text) {
        if (remarkStr) remarkStr += ' / ';
        remarkStr += rowNote.text;
      }
    }
    rowVals[13] = remarkStr;

    const tr = ws.addRow(rowVals);

    for (let c = 1; c <= totalCols; c++) {
      if (c === 15) continue;
      const cell = tr.getCell(c);
      const isLeft = (c === 1 || c === 14 || c === 2 || c === 3 || (c >= 24 && c <= 26) || c >= 37);
      const shouldShrink = (c !== 2 && c !== 3 && !(c >= 24 && c <= 26));
      cell.alignment = { vertical: 'middle', horizontal: isLeft ? 'left' : 'center', shrinkToFit: shouldShrink, wrapText: false };
      cell.font = { name: 'BIZ UDPゴシック', size: 9 };
      if (c === 19 && cell.value !== null && cell.value !== undefined && cell.value.toString().trim() !== '') {
        const num = Number(cell.value);
        if (!isNaN(num)) {
          cell.value = num;
          cell.numFmt = '[$-411]000000';
        }
      }
      
      let topStyle = 'hair';
      if (rowIndex === 7) topStyle = 'medium';
      else if (isNewDept) topStyle = 'medium';
      else if (isNewGroup) topStyle = 'mediumDashed';
      
      const leftStyle = (c === 1 || c === 2 || c === 9) ? 'medium' : 'thin';
      const rightStyle = (c === 14 || c === 1 || c === 8) ? 'medium' : 'thin';
      
      if (c >= 16) {
        let topBorder = false;
        let bottomBorder = false;
        if (isNewDept) topBorder = 'thick';
        else if (extEmp) topBorder = true;
        
        if (extEmp) bottomBorder = true;
        
        const isLeftEdge = [16, 19, 27, 37].includes(c);
        const isRightEdge = [18, 26, 36, totalCols].includes(c);
        
        cell.border = getCellBorders(topBorder, bottomBorder, isLeftEdge ? 'thick' : true, isRightEdge ? 'thick' : true);
      } else if (c === 1) {
        let c1Top = undefined;
        if (rowIndex === 7) c1Top = 'medium';
        else if (isNewDept) c1Top = 'medium';
        else if (isNewGroup && rowVals[0] !== '') c1Top = 'mediumDashed';

        const b = {
          left: { style: leftStyle, color: { argb: 'FF000000' } },
          right: { style: rightStyle, color: { argb: 'FF000000' } }
        };
        if (c1Top) b.top = { style: c1Top, color: { argb: 'FF000000' } };
        cell.border = b;
      } else {
        cell.border = {
          top: { style: topStyle, color: { argb: 'FF000000' } },
          left: { style: leftStyle, color: { argb: 'FF000000' } },
          right: { style: rightStyle, color: { argb: 'FF000000' } }
        };
      }
      
      const isCurrRetiring = currEmp && currEmp.departmentId === 'retired';
      if (dept && dept.name === '【退職】') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
      } else if (currEmp && isCurrTransferred && c >= 4 && c <= 8) {
        if (isCurrRetiring) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
        }
      }
      if (nextEmp && c >= 9 && c <= 13) {
        if (getGradeLevel(nextEmp.nextGrade) > getGradeLevel(nextEmp.currentGrade)) {
          const rawColor = getPromotedBgColorCode(nextEmp.nextGrade);
          if (rawColor) {
             const colorCode = rawColor.replace('#', '').toUpperCase();
             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorCode } };
          }
        }
      }
    }
    
    if (extEmp) {
      Object.keys(curPromoColors).forEach(cIdx => {
         const cell = tr.getCell(parseInt(cIdx));
         const color = curPromoColors[cIdx].replace('#', '').toUpperCase();
         cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + color } };
      });
    }

    lastDept = dept.id;
    lastGroup = group ? group.id : null;
    rowIndex++;
  });

  const lastRow = rowIndex - 1;
  if (lastRow >= 7) {
    const row = ws.getRow(lastRow);
    for (let c = 1; c <= 14; c++) {
      const cell = row.getCell(c);
      cell.border = {
        ...cell.border,
        bottom: { style: 'medium', color: { argb: 'FF000000' } }
      };
    }
  }

  const fitCols = [5, 6, 7, 8, 10, 11, 12, 13, 14];
  for (let c = 16; c <= totalCols; c++) {
    if (c !== 24 && c !== 25 && c !== 26) fitCols.push(c);
  }
  fitCols.forEach(colIndex => {
    let maxLength = 0;
    const col = ws.getColumn(colIndex);
    col.eachCell({ includeEmpty: true }, cell => {
      if (cell.row <= 5) return;
      const v = cell.value ? cell.value.toString() : '';
      if (v) {
        const lines = v.split('\n');
        for (let l of lines) {
          let lw = 0;
          for (let c of l) {
            lw += c.charCodeAt(0) > 255 ? 1.6 : 0.9;
          }
          if (lw > maxLength) maxLength = lw;
        }
      }
    });
    if (maxLength > 0) {
      if (colIndex === 14 && maxLength > 40) maxLength = 40;
      col.width = maxLength + 1.5;
    }
  });

  const lastRowToPrint = rowIndex > 7 ? rowIndex - 1 : 7;
  ws.pageSetup.printArea = `A1:N${lastRowToPrint}`;
  ws.pageSetup.paperSize = 9; // A4
  ws.pageSetup.orientation = 'portrait';
  ws.pageSetup.fitToPage = true;
  ws.pageSetup.fitToWidth = 1;
  ws.pageSetup.fitToHeight = 0;
  ws.pageSetup.horizontalCentered = true;
  ws.pageSetup.margins = { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };
  return ws;
};
