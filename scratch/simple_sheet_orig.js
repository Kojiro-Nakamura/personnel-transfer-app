export const addSimplePlanSheet = (workbook, sheetName, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {
  const allHistoryYears = new Set();
  allHistoryYears.add(targetYear);
  employees.forEach(e => {
    if (e.history) e.history.forEach(h => allHistoryYears.add(h.year));
  });
  const historyYears = Array.from(allHistoryYears).sort((a, b) => a - b);

  const getEraSuffixLocal = (yearStr) => {
    return (yearStr >= 2019) ? 'R' : 'H';
  };
  const formatPromoDateWithEra = (dateStr) => {
    if (!dateStr || String(dateStr).trim() === '') return '';
    const match = String(dateStr).match(/^(\d{4})[-/]/);
    if (!match) return dateStr;
    const year = parseInt(match[1], 10);
    const m = dateStr.length >= 7 ? parseInt(dateStr.substring(5,7), 10) : 4;
    const isEarly = m >= 1 && m <= 3;
    const fiscalYear = isEarly ? year - 1 : year;
    let era = getEraSuffixLocal(fiscalYear);
    let ey = fiscalYear >= 2019 ? fiscalYear - 2018 : (fiscalYear >= 1989 ? fiscalYear - 1988 : fiscalYear - 1925);
    let eraStr = era + ey;
    if (era === 'R' && ey === 1) eraStr = 'R元';
    if (era === 'H' && ey === 1) eraStr = 'H元';
    return eraStr + '(' + year + ')';
  };
  const formatWithEra = (dateStr, birthDateStr = null) => {
    let res = formatPromoDateWithEra(String(dateStr));
    if (birthDateStr && dateStr) {
      const match = String(dateStr).match(/^(\d{4})[-/]/);
      if (match) {
         const year = parseInt(match[1], 10);
         const ageDiff = year - parseInt(String(birthDateStr).substring(0,4));
         res += '(' + ageDiff + '歳)';
      }
    }
    return res;
  };
  const formatDateForDisplay = formatPromoDateWithEra;

  const ws = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', xSplit: 9, ySplit: 5, showGridLines: false }],
    pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.1, footer: 0.1 } }
  });
  ws.pageSetup.printTitlesRow = '1:5';

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

  ws.mergeCells('A2:L2');
  ws.getCell('A2').alignment = { shrinkToFit: true, vertical: 'middle' };
  ws.mergeCells('A3:L3');
  ws.getCell('A3').alignment = { shrinkToFit: true, vertical: 'middle' };


  ws.getRow(3).getCell(14).value = '＜参考＞';
  ws.getRow(3).getCell(14).font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };

  const currYearIndex = Math.max(0, historyYears.indexOf(targetYear - 1));
  const legendEndCol = 35 + currYearIndex;
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

  const r4 = ws.getRow(4);
  const r4Vals = ['部署名', '配属希望', '特殊事情', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', '', ''];
  const currentEraShort = `R${targetYear - 2019}`;
  r4Vals.push('氏名', `${currentEraShort}年齢`, 'フリガナ', '基本情報', '', '', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', '');
  historyYears.forEach((y, i) => {
    if (i === 0) r4Vals.push('履歴');
    else r4Vals.push('');
  });
  r4.values = r4Vals;
  r4.height = 20;

  const r5 = ws.getRow(5);
  const r5Vals = ['', '', '', '職名', '氏名', '在籍', '年齢', '職名', '氏名', '在籍', '年齢', '備考', ''];
  r5Vals.push('氏名', '年齢', 'フリガナ', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '〇配属希望', '●特殊事情', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度');
  historyYears.forEach(y => r5Vals.push(`R${y-2018}(${y})`));
  r5.values = r5Vals;
  r5.height = 20;

  ws.mergeCells('A4:A5');
  ws.mergeCells('B4:B5');
  ws.mergeCells('C4:C5');
  ws.mergeCells('D4:G4');
  ws.mergeCells('H4:L4');
  
  ws.mergeCells('N4:N5');
  ws.mergeCells('O4:O5');
  ws.mergeCells('P4:P5');
  ws.mergeCells('Q4:X4');
  ws.mergeCells('Y4:AH4');
  
  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(34 + historyYears.length).letter;
    const startColCode = ws.getColumn(35).letter;
    ws.mergeCells(`${startColCode}4:${endColCode}4`);
  }


  const totalCols = 34 + historyYears.length;
  for (let rn = 4; rn <= 5; rn++) {
    const row = ws.getRow(rn);
    for (let c = 1; c <= totalCols; c++) {
      if (c === 13) continue;
      const cell = row.getCell(c);
      cell.font = { name: 'BIZ UDPゴシック', size: (c === 2 || c === 3) ? 8 : 9, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true };
      if (c === 2 || c === 3) {
        cell.alignment = { ...cell.alignment, textRotation: 'vertical' };
      }
      
      let topStyle = rn === 4 ? 'medium' : 'hair';
      let bottomStyle = rn === 5 ? 'medium' : 'hair';
      let leftStyle = (c === 1 || c === 2 || c === 8) ? 'medium' : 'thin';
      let rightStyle = (c === 12 || c === 1 || c === 7) ? 'medium' : 'thin';
      
      // 縦にセル結合されている列(1, 2, 3)は、5行目の処理で上罫線が細線で上書きされるのを防ぐため、明示的に上下を太線にする
      if (c === 1 || c === 2 || c === 3) {
         topStyle = 'medium';
         bottomStyle = 'medium';
      }
      

      if (c >= 14) {
        let argb = 'FFCBD5E1';
        if (c >= 14 && c <= 16) argb = 'FFCBD5E1'; 
        if (c >= 17 && c <= 24) argb = 'FFBFDBFE'; 
        if (c >= 25 && c <= 34) {
           const promoColors = {
              26: getPromotedBgColorCode('係長級(主査)'),
              27: getPromotedBgColorCode('補佐級I(主任)'),
              28: getPromotedBgColorCode('補佐級II(班長)'),
              29: getPromotedBgColorCode('補佐級III(補佐兼班長)'),
              30: getPromotedBgColorCode('課長級'),
              31: getPromotedBgColorCode('所属長級'),
              32: getPromotedBgColorCode('次長級'),
              33: getPromotedBgColorCode('部長級'),
           };
           if (rn === 5 && promoColors[c]) {
              argb = 'FF' + promoColors[c].replace('#', '').toUpperCase();
           } else {
              argb = 'FFF5D0FE'; 
           }
        }
        if (c >= 35) argb = 'FFA7F3D0'; 
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
      }

      if (c >= 14) {
        let topB = rn === 4 ? 'thick' : false;
        if (rn === 5 && [14, 15, 16].includes(c)) topB = 'thick';
        let bottomB = rn === 5 ? 'thick' : false;
        if (rn === 4) bottomB = true; 
        
        const leftB = [14, 17, 25, 35].includes(c) ? 'thick' : true;
        const rightB = [16, 24, 34, totalCols].includes(c) ? 'thick' : true;
        
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

      if (c <= 12) {
        let argb = 'FFCBD5E1';
        if (c === 2 || c === 3) argb = 'FFFDBA74'; // Orange 300
        else if (c >= 4 && c <= 7) argb = 'FFFEF3C7'; // Amber 100
        else if (c >= 8 && c <= 12) argb = 'FFDBEAFE'; // Blue 100
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
      }
    }
  }

  ws.getColumn(1).width = 20;
  ws.getColumn(2).width = 1.98;
  ws.getColumn(3).width = 1.98;
  ws.getColumn(4).width = 12;
  ws.getColumn(8).width = 12;
  ws.getColumn(22).width = 20;
  ws.getColumn(23).width = 20;
  ws.getColumn(24).width = 20;

  let rowIndex = 6;
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
      '', '', '', '', '', '', '', '', '', '', ''
    ];

    if (currEmp) {
      rowVals[3] = currEmp.currentTitle || '';
      rowVals[4] = getFormattedNameForPlan(currEmp, false) || '';
      rowVals[5] = cYearsStr;
      rowVals[6] = cAgeVal !== '' ? Number(cAgeVal) : '';
      rowVals[1] = currEmp.desiredAssignment ? '〇' + currEmp.desiredAssignment : '';
      rowVals[2] = currEmp.specialCircumstances ? '●' + currEmp.specialCircumstances : '';
    }
    
    if (nextEmp) {
      rowVals[7] = nextEmp.nextTitle || '';
      rowVals[8] = getFormattedNameForPlan(nextEmp, true) || '';
      rowVals[9] = nYearsStr;
      rowVals[10] = nAgeVal !== '' ? Number(nAgeVal) : '';
    }

    const isRetained = currEmp && nextEmp && currEmp.id === nextEmp.id;
    if (post && post.isAbolished) {
      rowVals[7] = ''; rowVals[8] = '後任なし'; rowVals[9] = ''; rowVals[10] = '';
    }
    
    const extEmp = nextEmp;
    let curPromoColors = {};
    if (extEmp) {
      rowVals[12] = '';
      rowVals[13] = getFormattedNameForPlan(extEmp, true);
      rowVals[14] = extEmp.birthDate ? calculateAge(extEmp.birthDate, targetYear - 1) + '歳' : '';
      rowVals[15] = extEmp.furigana || '';
      rowVals[16] = extEmp.employeeNumber || '';
      rowVals[17] = extEmp.gender || '';
      rowVals[18] = formatWithEra(extEmp.birthDate);
      rowVals[19] = extEmp.education || '';
      rowVals[20] = formatWithEra(extEmp.hireDate, extEmp.birthDate);
      rowVals[21] = extEmp.note || '';
      rowVals[22] = extEmp.desiredAssignment ? '〇' + extEmp.desiredAssignment : '';
      rowVals[23] = extEmp.specialCircumstances ? '●' + extEmp.specialCircumstances : '';
      
      let hireStr = '';
      if (extEmp.hireDate) {
        hireStr = formatDateForDisplay(extEmp.hireDate);
        const y = parseInt(String(extEmp.hireDate).split('-')[0], 10);
        if (extEmp.birthDate && !isNaN(y)) {
           const ag = calculateAge(extEmp.birthDate, y);
           if (ag) hireStr += `(${ag}歳)`;
        }
      }
      rowVals[24] = hireStr;
      
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
        rowVals[24 + idx] = cellStr;
        if (isNextPromo) {
           curPromoColors[24 + idx + 1] = getPromotedBgColorCode(extEmp.nextGrade); // +1 because rowVals is 0-indexed, excel columns are 1-indexed
        }
      }
      
      if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade)) {
         const c = getPromotedBgColorCode(extEmp.nextGrade);
         if (c) {
             curPromoColors[14] = c; // 氏名
             curPromoColors[15] = c; // 年齢
             curPromoColors[34] = c; // 来年度
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
      rowVals[33] = nYearStr;
      
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
        rowVals[34 + i] = historyStr;
        if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade) && y === targetYear) {
           const c = getPromotedBgColorCode(extEmp.nextGrade);
           if (c) curPromoColors[34 + i + 1] = c;
        } else if (promoYearMap[y]) {
           const c = getPromotedBgColorCode(promoYearMap[y]);
           if (c) curPromoColors[34 + i + 1] = c;
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
    rowVals[11] = remarkStr;

    const tr = ws.addRow(rowVals);

    for (let c = 1; c <= totalCols; c++) {
      if (c === 13) continue;
      const cell = tr.getCell(c);
      const isLeft = (c === 1 || c === 12 || c === 2 || c === 3 || (c >= 22 && c <= 24) || c >= 35);
      const shouldShrink = (c !== 2 && c !== 3 && !(c >= 22 && c <= 24));
      cell.alignment = { vertical: 'middle', horizontal: isLeft ? 'left' : 'center', shrinkToFit: shouldShrink, wrapText: false };
      cell.font = { name: 'BIZ UDPゴシック', size: 9 };
      
      let topStyle = 'hair';
      if (rowIndex === 6) topStyle = 'medium';
      else if (isNewDept) topStyle = 'medium';
      else if (isNewGroup) topStyle = 'mediumDashed';
      
      const leftStyle = (c === 1 || c === 2 || c === 8) ? 'medium' : 'thin';
      const rightStyle = (c === 12 || c === 1 || c === 7) ? 'medium' : 'thin';
      
      if (c >= 14) {
        let topBorder = false;
        let bottomBorder = false;
        if (isNewDept) topBorder = 'thick';
        else if (extEmp) topBorder = true;
        
        if (extEmp) bottomBorder = true;
        
        const isLeftEdge = [14, 17, 25, 35].includes(c);
        const isRightEdge = [16, 24, 34, totalCols].includes(c);
        
        cell.border = getCellBorders(topBorder, bottomBorder, isLeftEdge ? 'thick' : true, isRightEdge ? 'thick' : true);
      } else if (c === 1) {
        let c1Top = undefined;
        if (rowIndex === 6) c1Top = 'medium';
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
      } else if (currEmp && isCurrTransferred && c >= 4 && c <= 7) {
        if (isCurrRetiring) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
        }
      }
      if (nextEmp && isNextTransferred && c >= 8 && c <= 11) {
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
  if (lastRow >= 6) {
    const row = ws.getRow(lastRow);
    for (let c = 1; c <= 12; c++) {
      const cell = row.getCell(c);
      cell.border = {
        ...cell.border,
        bottom: { style: 'medium', color: { argb: 'FF000000' } }
      };
    }
  }

  const fitCols = [5, 6, 7, 9, 10, 11, 12];
  for (let c = 14; c <= totalCols; c++) {
    if (c !== 22 && c !== 23 && c !== 24) fitCols.push(c);
  }
  fitCols.forEach(colIndex => {
    let maxLength = 0;
    const col = ws.getColumn(colIndex);
    col.eachCell({ includeEmpty: true }, cell => {
      if (cell.row <= 4) return;
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
      if (colIndex === 12 && maxLength > 40) maxLength = 40;
      col.width = maxLength + 1.5;
    }
  });

  const lastRowToPrint = rowIndex > 6 ? rowIndex - 1 : 6;
  ws.pageSetup.printArea = `A1:L${lastRowToPrint}`;
  ws.pageSetup.paperSize = 9; // A4
  ws.pageSetup.orientation = 'portrait';
  ws.pageSetup.fitToPage = true;
  ws.pageSetup.fitToWidth = 1;
  ws.pageSetup.fitToHeight = 0;
  ws.pageSetup.horizontalCentered = true;
  ws.pageSetup.margins = { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };
};

﻿const getBirthFiscalYear = (dateStr) => {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})/);
  if (!match) return null;
  let year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (month < 4 || (month === 4 && day === 1)) {
    year -= 1;
  }
  return year;
};

const getHireFiscalYearShort = (dateStr) => {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})/);
  if (!match) return '';
  let year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (month < 4) year -= 1;
  if (year >= 2019) return 'R' + (year - 2018);
  if (year >= 1989) return 'H' + (year - 1988);
  if (year >= 1926) return 'S' + (year - 1925);
  if (year >= 1912) return 'T' + (year - 1911);
  return year.toString();
};

const getEraYearOnly = (year) => {
  if (year >= 2019) return 'R' + (year - 2018);
  if (year >= 1989) return 'H' + (year - 1988);
  if (year >= 1926) return 'S' + (year - 1925);
  if (year >= 1912) return 'T' + (year - 1911);
  return year.toString();
};

export const addBirthYearSheet = (workbook, sheetName, targetYear, employees, departments, isNextYear = false) => {
  const ws = workbook.addWorksheet(sheetName, {
    pageSetup: { paperSize: 9, orientation: 'landscape', horizontalCentered: true, fitToPage: true, fitToWidth: 1, fitToHeight: 1, margins: { left: 0.2, right: 0.2, top: 0.8, bottom: 0.3, header: 0.1, footer: 0.1 } },
    views: [{ showGridLines: false }],
    views: [{ showGridLines: false }]
  });

  const deptMap = new Map();
  if (departments) {
    departments.forEach(d => deptMap.set(d.id, d));
  }

  // Filter employees
  const activeEmps = employees.filter(emp => {
    if (emp.isArchived) return false;
    const dId = isNextYear ? emp.departmentId : emp.currentDeptId;
      if (!dId || dId === 'unassigned' || dId === 'retired') return false;
    const isTemp = /臨任|臨時/.test(emp.currentEmploymentType || '') || /臨任|臨時/.test(emp.note || '');
    if (isTemp) return false;
    return true;
  });

  const parsedEmps = activeEmps.map(emp => {
    const bYear = getBirthFiscalYear(emp.birthDate);
    const hYearShort = getHireFiscalYearShort(emp.hireDate);
    const dId = isNextYear ? emp.departmentId : emp.currentDeptId;
      const dept = deptMap.get(dId);
    const isShinkokyoku = dept ? (dept.name || '').includes('振興局') : false;
    return { ...emp, bYear, hYearShort, isShinkokyoku };
  }).filter(emp => emp.bYear !== null);

  // Group by bYear
  const grouped = {};
  let minYear = 9999;
  let maxYear = 0;
  parsedEmps.forEach(emp => {
    if (!grouped[emp.bYear]) grouped[emp.bYear] = [];
    grouped[emp.bYear].push(emp);
    if (emp.bYear < minYear) minYear = emp.bYear;
    if (emp.bYear > maxYear) maxYear = emp.bYear;
  });

  if (minYear === 9999) return; // No data

  // Sort each group
  Object.values(grouped).forEach(arr => {
    arr.sort((a, b) => {
      if (a.hireDate !== b.hireDate) return (a.hireDate || '') > (b.hireDate || '') ? 1 : -1;
      return (a.birthDate || '') > (b.birthDate || '') ? 1 : -1;
    });
  });

  const totalEmps = parsedEmps.length;
  let currentCumulative = totalEmps;
  const cumulativeMap = {};
  for (let y = minYear; y <= maxYear; y++) {
    cumulativeMap[y] = currentCumulative;
    if (grouped[y]) {
      currentCumulative -= grouped[y].length;
    }
  }

  const defaultFont = { name: 'BIZ UDPゴシック', size: 9 };
  const boldFont = { name: 'BIZ UDPゴシック', size: 9, bold: true };
  const titleFont = { name: 'BIZ UDPゴシック', size: 14, bold: true };

  const yearsPerBlock = 20;
  let currentRowIndex = 1;

  
  const yearOffset = isNextYear ? 2018 : 2019;
    ws.getCell(currentRowIndex, 1).value = '令和' + (targetYear - yearOffset) + '年度林学職生年別一覧';
  ws.getCell(currentRowIndex, 1).font = titleFont;
  
  // Legend
  const legendLabels = [
    '部長級', '次長級', '所属長級', '課長級', '補佐級III(補佐兼班長)', '補佐級II(班長)', '補佐級I(主任)', '係長級(主査)'
  ];
  let legendCol = 42 - (legendLabels.length * 2);
  
  // "凡例" text
  const hanreiCol = legendCol - 2;
  for (let c = 0; c < 2; c++) {
    ws.getCell(2, hanreiCol + c).border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
  }
  const hanreiCell = ws.getCell(2, hanreiCol);
  hanreiCell.value = '凡例';
  hanreiCell.font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };
  hanreiCell.alignment = { horizontal: 'center', vertical: 'middle', shrinkToFit: true };
  ws.mergeCells(2, hanreiCol, 2, hanreiCol + 1);

  for (let i = 0; i < legendLabels.length; i++) {
    for (let c = 0; c < 2; c++) {
      const cCell = ws.getCell(2, legendCol + c);
      cCell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
    }
    const cell = ws.getCell(2, legendCol);
    cell.value = legendLabels[i];
    cell.font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };
    const colorHex = getPromotedBgColorCode(legendLabels[i])?.replace('#', '')?.toUpperCase() || 'FFFFFF';
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorHex } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', shrinkToFit: true };
    ws.mergeCells(2, legendCol, 2, legendCol + 1);
    legendCol += 2;
  }

  currentRowIndex += 3;

  let currentBlockStartYear = minYear;

  while (currentBlockStartYear <= maxYear) {
    const blockEndYear = Math.min(currentBlockStartYear + yearsPerBlock - 1, maxYear);
    const yearsInBlock = [];
    for (let y = currentBlockStartYear; y <= blockEndYear; y++) {
      yearsInBlock.push(y);
    }
    
    let maxEmpCount = 10;
    yearsInBlock.forEach(y => {
      if (grouped[y] && grouped[y].length > maxEmpCount) maxEmpCount = grouped[y].length;
    });

    const ageRow = ws.getRow(currentRowIndex);
    const birthYearRow = ws.getRow(currentRowIndex + 1);
    
    ageRow.getCell(1).value = '年齢';
    birthYearRow.getCell(1).value = '生年';
    
    ws.getColumn(1).width = 9.51;
    
    let cIdx = 2;
    yearsInBlock.forEach(y => {
      ws.getColumn(cIdx).width = 4;
      ws.getColumn(cIdx + 1).width = 8;
      
      const ageOffset = isNextYear ? 1 : 2;
          const age = (targetYear - ageOffset) - y;
      ageRow.getCell(cIdx).value = age;
      ws.mergeCells(currentRowIndex, cIdx, currentRowIndex, cIdx + 1);
      
      const eraYearStr = getEraYearOnly(y) + '組';
      birthYearRow.getCell(cIdx).value = eraYearStr;
      ws.mergeCells(currentRowIndex + 1, cIdx, currentRowIndex + 1, cIdx + 1);
      
      cIdx += 2;
    });

    for(let r = currentRowIndex; r <= currentRowIndex + 1; r++) {
      const row = ws.getRow(r);
      for(let c = 1; c < cIdx; c++) {
        const cell = row.getCell(c);
        cell.font = boldFont;
        cell.alignment = { horizontal: 'center', vertical: 'middle', shrinkToFit: true };
        cell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
      }
    }
    
    currentRowIndex += 2;

    for (let r = 0; r < maxEmpCount; r++) {
      const row = ws.getRow(currentRowIndex + r);
      row.height = 13.20;
      row.getCell(1).value = r + 1;
      row.getCell(1).font = defaultFont;
      row.getCell(1).border = { top: {style:'hair'}, bottom: {style:'hair'}, left: {style:'thin'}, right: {style:'thin'} };
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', shrinkToFit: true };
      
      let cIdx = 2;
      yearsInBlock.forEach(y => {
        const emps = grouped[y] || [];
        const emp = emps[r];
        
        const cell1 = row.getCell(cIdx);
        const cell2 = row.getCell(cIdx + 1);
        
        cell1.font = { name: 'BIZ UDPゴシック', size: 8 };
        cell2.font = defaultFont;
        
        cell1.alignment = { horizontal: 'center', vertical: 'middle', shrinkToFit: true };
        cell2.alignment = { horizontal: 'left', vertical: 'middle', shrinkToFit: true };
        
        cell1.border = { top: {style:'hair'}, bottom: {style:'hair'}, left: {style:'thin'} };
        cell2.border = { top: {style:'hair'}, bottom: {style:'hair'}, right: {style:'thin'} };
        
        if (emp) {
          cell1.value = emp.hYearShort;
          cell2.value = emp.name;
          
          const ageOffset = isNextYear ? 1 : 2;
          const age = (targetYear - ageOffset) - y;
          let bgRaw = null;
          if (isNextYear && age >= 60) {
            // 来年度60歳以上になる人は役職定年などで級が外れるため色なし
            bgRaw = ''; 
          } else {
            const grade = isNextYear ? (emp.nextGrade !== undefined && emp.nextGrade !== null ? emp.nextGrade : emp.currentGrade) : emp.currentGrade;
            bgRaw = getPromotedBgColorCode(grade);
          }
          if (bgRaw) {
             const bgArgb = 'FF' + bgRaw.replace('#', '').toUpperCase();
             cell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
             cell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
          }
        }
        cIdx += 2;
      });
    }
    
    currentRowIndex += maxEmpCount;
    
    const summaryRows = [
      { label: '計', valFn: (y) => (grouped[y] || []).length },
      { label: '累計', valFn: (y) => cumulativeMap[y] }
    ];
    
    summaryRows.forEach(sr => {
      const row = ws.getRow(currentRowIndex);
      row.height = 13.20;
      row.getCell(1).value = sr.label;
      row.getCell(1).font = defaultFont;
      row.getCell(1).border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', shrinkToFit: true };
      
      let cIdx = 2;
      yearsInBlock.forEach(y => {
        row.getCell(cIdx).value = sr.valFn(y) || 0;
        ws.mergeCells(currentRowIndex, cIdx, currentRowIndex, cIdx + 1);
        const mergedCell = row.getCell(cIdx);
        mergedCell.font = defaultFont;
        mergedCell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
        mergedCell.alignment = { horizontal: 'right', vertical: 'middle', shrinkToFit: true };
        cIdx += 2;
      });
      currentRowIndex++;
    });
    
    currentRowIndex += 2; 
    currentBlockStartYear += yearsPerBlock;
  }
};
