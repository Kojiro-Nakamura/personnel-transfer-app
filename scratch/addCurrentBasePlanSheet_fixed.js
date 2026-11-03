export const addCurrentBasePlanSheet = (workbook, sheetName, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {
  const allHistoryYears = new Set();
  employees.forEach(emp => {
    (emp.history || []).forEach(h => {
      if (h.year >= targetYear - 10 && h.year <= targetYear) {
         allHistoryYears.add(h.year);
      }
    });
  });
  const historyYears = Array.from(allHistoryYears).sort((a, b) => a - b);
  const getAgeStr = (emp, isNext) => {
    if (!emp || !emp.birthDate) return '';
    const age = calculateAge(emp.birthDate, isNext ? targetYear : targetYear - 1);
    return age !== '' ? `${age}歳` : '';
  };
  const formatWithEra = (dateStr, birthDateStr = null) => {
    let res = formatPromoDateWithEra(String(dateStr));
    if (birthDateStr && dateStr) {
      const match = String(dateStr).match(/^(\d{4})[-/]/);
      if (match) {
         const year = parseInt(match[1], 10);
         const ag = calculateAge(birthDateStr, year);
         if (ag) res += `(${ag}歳)`;
      }
    }
    return res;
  };

  const getEraSuffixLocal = (yearStr) => {
    const y = parseInt(yearStr);
    if (isNaN(y)) return '';
    return `(R${y - 2018})`;
  };

  const ws = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', xSplit: 5, ySplit: 5, showGridLines: false }],
    pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.1, footer: 0.1 } }
  });
  ws.pageSetup.printTitlesRow = '1:5';

  const extraCols = [
    { width: 7.40 },  // 空白列 (R)
    { width: 14 }, // 氏名 (S)
    { width: 8 },  // 年齢 (T)
    { width: 16 }, // フリガナ (U)
    { width: 12 }, // 職員番号 (V)
    { width: 6 },  // 性別 (W)
    { width: 14 }, // 生年月日 (X)
    { width: 12 }, // 最終学歴 (Y)
    { width: 14 }, // 採用年月日 (Z)
    { width: 20 }, // 備考 (AA)
    { width: 8 },  // 配属希望 (AB)
    { width: 8 },  // 特事 (AC)
    { width: 8 },  // 採用 (AD)
    { width: 8 },  // 係長(主査) (AE)
    { width: 8 },  // 補佐I(主任) (AF)
    { width: 8 },  // 補佐II(班長) (AG)
    { width: 8 },  // 補佐III(補佐兼班長) (AH)
    { width: 8 },  // 課長 (AI)
    { width: 8 },  // 所属長 (AJ)
    { width: 8 },  // 次長 (AK)
    { width: 8 },  // 部長 (AL)
    { width: 14 }, // 採用年 (AM)
  ];
  historyYears.forEach(() => extraCols.push({ width: 14 }));
  
  ws.columns = [
    { width: 14 }, // A 部署名
    { width: 14 }, // B 班・グループ
    { width: 10 }, // C ポスト
    { width: 12 }, // D [今年] 職名
    { width: 16 }, // E [今年] 氏名
    { width: 16 }, // F [今年] 級
    { width: 6 },  // G [今年] 年齢
    { width: 12 }, // H [今年] 在籍
    { width: 12 }, // I [今年] 備考
    { width: 4 },  // J 矢印
    { width: 14 }, // K [来年] 部署名
    { width: 14 }, // L [来年] 班・グループ
    { width: 12 }, // M [来年] 職名
    { width: 16 }, // N [来年] 級
    { width: 6 },  // O [来年] 年齢
    { width: 12 }, // P [来年] 在籍
    { width: 12 }, // Q [来年] 備考
    ...extraCols
  ];

  ws.getRow(1).values = [fileName];
  ws.getRow(1).font = { name: 'BIZ UDPゴシック', bold: true, size: 12, color: { argb: 'FF1E293B' } };

  const curSummary = generateGradeSummary(employees, false);
  ws.getRow(2).values = [`【全体集計（今年度 ${targetYear - 1}(R${targetYear - 2019})）】 ${curSummary}`];
  ws.getRow(2).font = { name: 'BIZ UDPゴシック', size: 9, color: { argb: 'FF0284C7' } };

  const nextSummary = generateGradeSummary(employees, true);
  ws.getRow(3).values = [`【全体集計（来年度 ${targetYear}(R${targetYear - 2018})）】 ${nextSummary}`];
  ws.getRow(3).font = { name: 'BIZ UDPゴシック', size: 9, color: { argb: 'FF0284C7' } };

  const endTitleCol = ws.getColumn(17 + extraCols.length).letter;
  ws.mergeCells(`A2:${endTitleCol}2`);
  ws.getCell('A2').alignment = { shrinkToFit: true, vertical: 'middle' };
  ws.mergeCells(`A3:${endTitleCol}3`);
  ws.getCell('A3').alignment = { shrinkToFit: true, vertical: 'middle' };

  const r4 = ws.getRow(4);
  const r4Vals = ['部署名', '班・グループ', 'ポスト', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', '', '', ''];
  r4Vals.push('', '＜参考＞', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');
  historyYears.forEach(() => r4Vals.push(''));
  r4.values = r4Vals;
  r4.height = 20;

  const r5 = ws.getRow(5);
  const r5Vals = ['', '', '', '職名', '氏名', '級', '年齢', '在籍', '備考', '', '部署名', '班・グループ', '職名', '級', '年齢', '在籍', '備考'];
  r5Vals.push('', '氏名', '年齢', 'フリガナ', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '〇配属希望', '●特殊事情', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度');
  historyYears.forEach(y => r5Vals.push(getEraFormattedYear(y)));
  r5.values = r5Vals;
  r5.height = 20;

  ws.mergeCells('W5:X5');
  ws.mergeCells('AB5:AC5');
  ws.mergeCells('AD5:AM5');
  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(39 + historyYears.length).letter;
    const startColCode = ws.getColumn(40).letter;
    ws.mergeCells(`${startColCode}5:${endColCode}5`);
  }

  ws.mergeCells('A4:A5');
  ws.mergeCells('B4:B5');
  ws.mergeCells('C4:C5');
  ws.mergeCells('D4:I4');
  ws.mergeCells('J4:J5');
  ws.mergeCells('K4:Q4');

  ws.mergeCells('R4:R5');
  ws.mergeCells('S4:AM4');
  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(39 + historyYears.length).letter;
    const startColCode = ws.getColumn(40).letter;
    ws.mergeCells(`${startColCode}4:${endColCode}4`);
  }

  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } };
  const currFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
  const nextFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
  const totalCols = 17 + extraCols.length;
  for (let c = 1; c <= totalCols; c++) {
    const c4 = ws.getCell(4, c);
    const c5 = ws.getCell(5, c);
    const isLeftEdge = [1, 4, 11, 19, 22, 30, 40].includes(c);
    const isRightEdge = [3, 9, 17, 21, 29, 39, totalCols].includes(c);
    
    c4.border = {
       top: { style: 'medium' },
       bottom: { style: 'thin' },
       left: { style: isLeftEdge ? 'medium' : 'thin' },
       right: { style: isRightEdge ? 'medium' : 'thin' }
    };
    c5.border = {
       top: { style: 'thin' },
       bottom: { style: 'medium' },
       left: { style: isLeftEdge ? 'medium' : 'thin' },
       right: { style: isRightEdge ? 'medium' : 'thin' }
    };
    c4.alignment = { horizontal: 'center', vertical: 'middle' };
    c5.alignment = { horizontal: 'center', vertical: 'middle' };
    c4.font = { name: 'BIZ UDPゴシック', size: 9, bold: true };
    c5.font = { name: 'BIZ UDPゴシック', size: 9, bold: true };

    if (c >= 4 && c <= 9) {
      c4.fill = currFill;
      c5.fill = currFill;
    } else if (c >= 11 && c <= 17) {
      c4.fill = nextFill;
      c5.fill = nextFill;
    } else if (c === 18) {
      c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      c5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    } else if (c >= 19 && c <= 21) {
      c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } };
      c5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } };
    } else if (c >= 22 && c <= 29) {
      c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFDBFE' } };
      c5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFDBFE' } };
    } else if (c >= 30 && c <= 39) {
      const promoColors = {
        30: getPromotedBgColorCode('係長(主査)'),
        31: getPromotedBgColorCode('補佐I(主任)'),
        32: getPromotedBgColorCode('補佐II(班長)'),
        33: getPromotedBgColorCode('補佐III(補佐兼班長)'),
        34: getPromotedBgColorCode('課長'),
        35: getPromotedBgColorCode('所属長'),
        36: getPromotedBgColorCode('次長'),
        37: getPromotedBgColorCode('部長')
      };
      const pColor = promoColors[c] || getPromotedBgColorCode('');
      c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + pColor.replace('#', '').toUpperCase() } };
      c5.fill = c4.fill;
    } else if (c >= 40) {
      c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
      c5.fill = c4.fill;    } else if (c !== 10) {
      c4.fill = headerFill;
      c5.fill = headerFill;
    }
  }

  // Fix borders for merged cells
  ws.getCell('A4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'medium' }, right: { style: 'thin' } };
  ws.getCell('B4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
  ws.getCell('C4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'medium' } };
  ws.getCell('J4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
  ws.getCell('D4').border = { top: { style: 'medium' }, bottom: { style: 'thin' }, left: { style: 'medium' }, right: { style: 'medium' } };
  ws.getCell('K4').border = { top: { style: 'medium' }, bottom: { style: 'thin' }, left: { style: 'medium' }, right: { style: 'medium' } };
  ws.getCell('R4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
  ws.getCell('S4').border = { top: { style: 'medium' }, bottom: { style: 'thin' }, left: { style: 'medium' }, right: { style: 'medium' } };


  let currentRowIndex = 6;

  departments.forEach((dept) => {
    if (dept.id === 'unassigned' || dept.id === 'retired') return;
    let dNamePrinted = false;
    let lastPrintedGroup = '';
    let firstGroupPrinted = false;
    const currD = deptMap[dept.id] || { groups: {} };

    const getEmpIdsForPost = (groupObj, postId) => {
      if (!groupObj || !groupObj.posts || !groupObj.posts[postId]) return [];
      return groupObj.posts[postId].current;
    };

    const getDirectEmpIds = (groupObj) => {
      if (!groupObj || !groupObj.direct) return [];
      return groupObj.direct.current;
    };

    const processEmps = (emps, groupName, postName, isPost, currentGroupId) => {
      let filteredEmps = emps;
      if (filterLevel > 0) {
        filteredEmps = emps.filter(emp => {
          if (!emp) return false;
          const cLvl = getGradeLevel(emp.currentGrade);
          const nLvl = getGradeLevel(emp.nextGrade);
          return cLvl >= filterLevel || nLvl >= filterLevel;
        });
      }

      if (filteredEmps.length === 0) {
        return; // 不要な空白行を挿入しない
        const row = ws.getRow(currentRowIndex);
        row.height = 13.20;
        const vals = new Array(totalCols).fill('');
        vals[0] = (!dNamePrinted) ? dept.name : ''; dNamePrinted = true;
        vals[1] = groupName || '';
        vals[2] = postName || '';
        row.values = vals;
        
  for (let c = 1; c <= totalCols; c++) {
          const cell = row.getCell(c);
          const isNewDeptRow = (ws.getCell(cell.row, 1).value !== '' && ws.getCell(cell.row, 1).value !== null);
          const isNewGroupRow = (ws.getCell(cell.row, 2).value !== '' && ws.getCell(cell.row, 2).value !== null);
          
          let topStyle = isNewDeptRow ? 'medium' : 'thin';
          let bottomStyle = 'thin';

          if (c === 1) {
             if (isNewDeptRow) {
                 topStyle = 'medium';
             } else if (isNewGroupRow && typeof isFirstGroupOfDept !== 'undefined' && isFirstGroupOfDept) {
                 topStyle = 'thin';
             } else {
                 topStyle = null;
             }
             bottomStyle = null;
          } else if (c === 2) {
             if (isNewDeptRow) {
                 topStyle = 'medium';
             } else if (isNewGroupRow) {
                 topStyle = 'thin';
             } else {
                 topStyle = null;
             }
             bottomStyle = null;
          }

          const isLeftEdge = [1, 4, 11, 19, 22, 30, 40].includes(c);
    const isRightEdge = [3, 9, 17, 21, 29, 39, totalCols].includes(c);
          let cBorder = { left: { style: isLeftEdge ? 'medium' : 'thin' }, right: { style: isRightEdge ? 'medium' : 'thin' } };
          if (topStyle) cBorder.top = { style: topStyle };
          if (bottomStyle) cBorder.bottom = { style: bottomStyle };
          cell.border = cBorder;
          cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };
          cell.font = { name: 'BIZ UDPゴシック', size: 9 };
        }
        currentRowIndex++;
        return;
      }

      filteredEmps.forEach((emp, idx) => {
        if (!emp) return;

        const row = ws.getRow(currentRowIndex);
        row.height = 13.20;
        const vals = new Array(totalCols).fill('');

        vals[0] = (!dNamePrinted) ? dept.name : ''; dNamePrinted = true;
                let isFirstGroupOfDept = false;
        if (idx === 0 && groupName && groupName !== lastPrintedGroup) {
          vals[1] = groupName;
          lastPrintedGroup = groupName;
          if (!firstGroupPrinted) {
             isFirstGroupOfDept = true;
             firstGroupPrinted = true;
          }
        } else {
          vals[1] = '';
        }
        vals[2] = (idx === 0 && postName) ? postName : '';
        
        vals[3] = emp.currentTitle || '';
        vals[4] = emp.name || '';
        vals[5] = emp.currentGrade || '';
        vals[6] = calculateAge(emp.birthDate, targetYear - 1);
        const cy = emp.currentYears || 0;
        const cs = (emp.currentSkills || []).join('＋');
        vals[7] = cs ? `${cy}(${cs})` : `${cy}`;
        

        vals[8] = emp.currentEmploymentType || '';
        vals[9] = '→';

        const getDeptNameStr = (dId) => {
           if (dId === 'unassigned') return '未配置';
           if (dId === 'retired') return '退職';
           const d = departments.find(x => x.id === dId);
           return d ? (d.nextName || d.name) : '';
        };
        const getGroupNameStr = (dId, gId) => {
           const d = departments.find(x => x.id === dId);
           if (!d) return '';
           const g = (d.groups || []).find(x => x.id === gId);
           return g ? (g.nextName || g.name) : '';
        };

        const isUnassigned = emp.departmentId === 'unassigned';
        const isRetired = emp.departmentId === 'retired';

        if (isRetired) {
          vals[10] = '退職';
          vals[14] = calculateAge(emp.birthDate, targetYear);
        } else if (isUnassigned) {
          vals[10] = '未配置';
          vals[14] = calculateAge(emp.birthDate, targetYear);
          vals[16] = emp.nextEmploymentType || '';
        } else {
          vals[10] = getDeptNameStr(emp.departmentId);
          vals[11] = getGroupNameStr(emp.departmentId, emp.groupId);
          vals[12] = emp.nextTitle || '';
          vals[13] = emp.nextGrade || '';
          vals[14] = calculateAge(emp.birthDate, targetYear);
          const ny = emp.nextYears || 0;
          const ns = (emp.nextSkills || []).join('＋');
          vals[15] = ns ? `${ny}(${ns})` : `${ny}`;
          vals[16] = emp.nextEmploymentType || '';
        }

        const extEmp = emp;
        if (extEmp) {
          vals[18] = getFormattedNameForPlan(extEmp, true);
          vals[19] = getAgeStr(extEmp, false);
          vals[20] = extEmp.furigana || '';
          vals[21] = shouldOmitEmployeeNumber(extEmp, true) ? '' : (extEmp.employeeNumber || '');
          vals[22] = extEmp.gender || '';
          vals[23] = formatWithEra(extEmp.birthDate);
          vals[24] = extEmp.education || '';
          vals[25] = formatWithEra(extEmp.hireDate, extEmp.birthDate);
          vals[26] = extEmp.note || '';
          vals[27] = extEmp.desiredAssignment ? '〇' + extEmp.desiredAssignment : '';
          vals[28] = extEmp.specialCircumstances ? '●' + extEmp.specialCircumstances : '';
          
          let hireStr = '';
          if (extEmp.hireDate) {
            hireStr = formatDateForDisplay(extEmp.hireDate);
            const y = parseInt(String(extEmp.hireDate).split('-')[0], 10);
            if (extEmp.birthDate && !isNaN(y)) {
               const ag = calculateAge(extEmp.birthDate, y);
               if (ag) hireStr += `(${ag}歳)`;
            }
          }
          vals[29] = hireStr;
          
          const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
          const gradeList = ['', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級'];
          for (let pi = 1; pi < pKeys.length; pi++) {
            let pStr = '';
            const key = pKeys[pi];
            if (extEmp[key]) {
               pStr = formatDateForDisplay(extEmp[key]);
               const y = parseInt(String(extEmp[key]).split('-')[0], 10);
               if (extEmp.birthDate && !isNaN(y)) {
                 const ag = calculateAge(extEmp.birthDate, y);
                 if (ag) pStr += `(${ag}歳)`;
               }
            }
            vals[29 + pi] = pStr;
          }
          
          let ny = '';
          if (extEmp.nextGrade && extEmp.nextGrade !== '-' && extEmp.nextGrade !== '') {
            if (extEmp.nextGrade === '10' && extEmp.nextEmploymentType) {
              ny = extEmp.nextEmploymentType;
            } else {
              const gl = parseInt(extEmp.nextGrade, 10);
              if (!isNaN(gl) && gl >= 1 && gl <= 8) {
                ny = gradeList[gl];
              }
            }
          }
          vals[39] = ny;
          
          const changeIndexes = [];
          let lastValidHStr = '-';
          historyYears.forEach((hy, idx) => {
             let hStr = '';
             if (hy === targetYear) {
                const nDept = departments.find(d => d.id === extEmp.departmentId);
                const nGroup = nDept && extEmp.groupId ? (nDept.groups || []).find(g => g.id === extEmp.groupId) : null;
                const p = extEmp.postId ? (nDept?.posts?.find(x => x.id === extEmp.postId) || nGroup?.posts?.find(x => x.id === extEmp.postId)) : null;
                const d = nDept ? (nDept.nextName || nDept.name) : '';
                const g = nGroup ? (nGroup.nextName || nGroup.name) : '';
                const pStr = p ? (p.nextName || p.name) : '';
                if (extEmp.departmentId === 'unassigned') hStr = '未配置';
                else if (extEmp.departmentId === 'retired') hStr = '退職';
                else if (d === 'システム用部署') hStr = '未配置';
                else hStr = `${d} ${g}${pStr}`;
             } else {
                const hist = (extEmp.history || []).find(h => h.year === hy);
                hStr = hist ? hist.department : '';
             }
             
             let isChange = false;
             if (hStr !== '' && hStr !== '-') {
                if (hStr !== lastValidHStr) {
                   isChange = true;
                }
                lastValidHStr = hStr;
             }
             
             let displayStr = hStr;
             if (hStr && hStr !== ' / 退職' && hStr !== '未配置' && hStr !== '-') {
               const histAge = (extEmp.birthDate && !isNaN(hy)) ? calculateAge(extEmp.birthDate, hy) : null;
               if (histAge) displayStr += ` (${histAge}歳)`;
             }
             
             vals[40 + idx] = displayStr;
             if (isChange) {
                changeIndexes.push(40 + idx);
             }
          });
          row.changeIndexes = changeIndexes;
        }

        row.values = vals;

  for (let c = 1; c <= totalCols; c++) {
          const cell = row.getCell(c);
          const isNewDeptRow = (ws.getCell(cell.row, 1).value !== '' && ws.getCell(cell.row, 1).value !== null);
          const isNewGroupRow = (ws.getCell(cell.row, 2).value !== '' && ws.getCell(cell.row, 2).value !== null);
          
          let topStyle = isNewDeptRow ? 'medium' : 'thin';
          let bottomStyle = 'thin';

          if (c === 1) {
             if (isNewDeptRow) {
                 topStyle = 'medium';
             } else if (isNewGroupRow && typeof isFirstGroupOfDept !== 'undefined' && isFirstGroupOfDept) {
                 topStyle = 'thin';
             } else {
                 topStyle = null;
             }
             bottomStyle = null;
          } else if (c === 2) {
             if (isNewDeptRow) {
                 topStyle = 'medium';
             } else if (isNewGroupRow) {
                 topStyle = 'thin';
             } else {
                 topStyle = null;
             }
             bottomStyle = null;
          }

          const isLeftEdge = [1, 4, 11, 19, 22, 30, 40].includes(c);
    const isRightEdge = [3, 9, 17, 21, 29, 39, totalCols].includes(c);
          let cBorder = { left: { style: isLeftEdge ? 'medium' : 'thin' }, right: { style: isRightEdge ? 'medium' : 'thin' } };
          if (topStyle) cBorder.top = { style: topStyle };
          if (bottomStyle) cBorder.bottom = { style: bottomStyle };
          cell.border = cBorder;
          cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };
          cell.font = { name: 'BIZ UDPゴシック', size: 9 };
          
          if (c === 5) {
             cell.font = { name: 'BIZ UDPゴシック', size: 10, bold: true };
          }
          if (c === 7 || c === 8 || c === 14 || c === 15) {
             cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };
          }
          if (c === 10) {
             cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };
             cell.font = { name: 'BIZ UDPゴシック', size: 9, bold: true };
          }

          if (c >= 40) {
             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA7F3D0' } }; // Emerald (History)
             const targetRow = typeof row !== 'undefined' ? row : (typeof r !== 'undefined' ? r : null);
             if (targetRow && targetRow.changeIndexes && targetRow.changeIndexes.includes(c - 1)) {
                 cell.font = { name: 'BIZ UDPゴシック', size: 9, bold: true, italic: true };
             }
          }
          if (c >= 11 && c <= 17 && !isRetired && !isUnassigned) {
             const isNextPromoted = getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade);
             const nextPromoColor = isNextPromoted ? getPromotedBgColorCode(emp.nextGrade) : null;
             if (nextPromoColor) {
                 cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + nextPromoColor.replace('#', '').toUpperCase() } };
             }
          }
        }
        
        currentRowIndex++;
      });
    };

    dept.posts.forEach(p => {
      const emps = getEmpIdsForPost(currD, p.id);
      processEmps(emps, null, p.name, true, null);
    });

    const directEmps = getDirectEmpIds(currD);
    processEmps(directEmps, null, null, false, null);

    dept.groups.forEach(grp => {
      const gObj = currD.groups[grp.id] || { posts: {}, direct: { current: [] } };
      
      grp.posts.forEach(p => {
        const emps = getEmpIdsForPost(gObj, p.id);
        processEmps(emps, grp.name, p.name, true, grp.id);
      });
      
      const gDirect = getDirectEmpIds(gObj);
      processEmps(gDirect, grp.name, null, false, grp.id);
    });
  });

  const uObj = deptMap['unassigned'];
  if (uObj && uObj.direct && uObj.direct.current && uObj.direct.current.length > 0) {
    const row = ws.getRow(currentRowIndex);
    row.height = 13.20;
        const vals = new Array(totalCols).fill('');
    vals[0] = '未配置';
    row.values = vals;
  for (let c = 1; c <= totalCols; c++) {
      const cell = row.getCell(c);
          const isNewDeptRow = (ws.getCell(cell.row, 1).value !== '' && ws.getCell(cell.row, 1).value !== null);
          const isNewGroupRow = (ws.getCell(cell.row, 2).value !== '' && ws.getCell(cell.row, 2).value !== null);
          
          let topStyle = isNewDeptRow ? 'medium' : 'thin';
          let bottomStyle = 'thin';

          if (c === 1) {
             if (isNewDeptRow) {
                 topStyle = 'medium';
             } else if (isNewGroupRow && typeof isFirstGroupOfDept !== 'undefined' && isFirstGroupOfDept) {
                 topStyle = 'thin';
             } else {
                 topStyle = null;
             }
             bottomStyle = null;
          } else if (c === 2) {
             if (isNewDeptRow) {
                 topStyle = 'medium';
             } else if (isNewGroupRow) {
                 topStyle = 'thin';
             } else {
                 topStyle = null;
             }
             bottomStyle = null;
          }

          const isLeftEdge = [1, 4, 11, 19, 22, 30, 40].includes(c);
    const isRightEdge = [3, 9, 17, 21, 29, 39, totalCols].includes(c);
          let cBorder = { left: { style: isLeftEdge ? 'medium' : 'thin' }, right: { style: isRightEdge ? 'medium' : 'thin' } };
          if (topStyle) cBorder.top = { style: topStyle };
          if (bottomStyle) cBorder.bottom = { style: bottomStyle };
          cell.border = cBorder;
          cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };
      cell.font = { name: 'BIZ UDPゴシック', size: 9 };
    }
    currentRowIndex++;
    
    // We can't reuse processEmps because it captures `dept`, but we can just inline or recreate a similar loop.
    uObj.direct.current.forEach(emp => {
      if (!emp) return;
      if (filterLevel > 0) {
        const cLvl = getGradeLevel(emp.currentGrade);
        const nLvl = getGradeLevel(emp.nextGrade);
        if (cLvl < filterLevel && nLvl < filterLevel) return;
      }
      const r = ws.getRow(currentRowIndex);
      r.height = 13.20;
      const v = new Array(totalCols).fill('');
      v[3] = emp.currentTitle || '';
      v[4] = emp.name || '';
      v[5] = emp.currentGrade || '';
      v[6] = calculateAge(emp.birthDate, targetYear - 1);
      const cy = emp.currentYears || 0;
      const cs = (emp.currentSkills || []).join('＋');
      v[7] = cs ? `${cy}(${cs})` : `${cy}`;
      v[8] = emp.currentEmploymentType || '';
      v[9] = '→';

      const getDeptNameStr = (dId) => {
         if (dId === 'unassigned') return '未配置';
         if (dId === 'retired') return '退職';
         const d = departments.find(x => x.id === dId);
         return d ? (d.nextName || d.name) : '';
      };
      const getGroupNameStr = (dId, gId) => {
         const d = departments.find(x => x.id === dId);
         if (!d) return '';
         const g = (d.groups || []).find(x => x.id === gId);
         return g ? (g.nextName || g.name) : '';
      };

      const isUnassigned = emp.departmentId === 'unassigned';
      const isRetired = emp.departmentId === 'retired';

      if (isRetired) {
        v[10] = '退職';
        v[14] = calculateAge(emp.birthDate, targetYear);
      } else if (isUnassigned) {
        v[10] = '未配置';
        v[14] = calculateAge(emp.birthDate, targetYear);
        v[16] = emp.nextEmploymentType || '';
      } else {
        v[10] = getDeptNameStr(emp.departmentId);
        v[11] = getGroupNameStr(emp.departmentId, emp.groupId);
        v[12] = emp.nextTitle || '';
        v[13] = emp.nextGrade || '';
        v[14] = calculateAge(emp.birthDate, targetYear);
        const ny = emp.nextYears || 0;
        const ns = (emp.nextSkills || []).join('＋');
        v[15] = ns ? `${ny}(${ns})` : `${ny}`;
          v[16] = emp.nextEmploymentType || '';
        }

        const extEmp = emp;
        if (extEmp) {
          v[18] = getFormattedNameForPlan(extEmp, true);
          v[19] = getAgeStr(extEmp, false);
          v[20] = extEmp.furigana || '';
          v[21] = shouldOmitEmployeeNumber(extEmp, true) ? '' : (extEmp.employeeNumber || '');
          v[22] = extEmp.gender || '';
          v[23] = formatWithEra(extEmp.birthDate);
          v[24] = extEmp.education || '';
          v[25] = formatWithEra(extEmp.hireDate, extEmp.birthDate);
          v[26] = extEmp.note || '';
          v[27] = extEmp.desiredAssignment ? '〇' + extEmp.desiredAssignment : '';
          v[28] = extEmp.specialCircumstances ? '●' + extEmp.specialCircumstances : '';
          
          let hireStr = '';
          if (extEmp.hireDate) {
            hireStr = formatDateForDisplay(extEmp.hireDate);
            const y = parseInt(String(extEmp.hireDate).split('-')[0], 10);
            if (extEmp.birthDate && !isNaN(y)) {
               const ag = calculateAge(extEmp.birthDate, y);
               if (ag) hireStr += `(${ag}歳)`;
            }
          }
          v[29] = hireStr;
          
          const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
          const gradeList = ['', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級'];
          for (let pi = 1; pi < pKeys.length; pi++) {
            let pStr = '';
            const key = pKeys[pi];
            if (extEmp[key]) {
               pStr = formatDateForDisplay(extEmp[key]);
               const y = parseInt(String(extEmp[key]).split('-')[0], 10);
               if (extEmp.birthDate && !isNaN(y)) {
                 const ag = calculateAge(extEmp.birthDate, y);
                 if (ag) pStr += `(${ag}歳)`;
               }
            }
            v[29 + pi] = pStr;
          }
          
          let ny = '';
          if (extEmp.nextGrade && extEmp.nextGrade !== '-' && extEmp.nextGrade !== '') {
            if (extEmp.nextGrade === '10' && extEmp.nextEmploymentType) {
              ny = extEmp.nextEmploymentType;
            } else {
              const gl = parseInt(extEmp.nextGrade, 10);
              if (!isNaN(gl) && gl >= 1 && gl <= 8) {
                ny = gradeList[gl];
              }
            }
          }
          v[39] = ny;
          
          const changeIndexes = [];
          let lastValidHStr = '-';
          historyYears.forEach((hy, idx) => {
             let hStr = '';
             if (hy === targetYear) {
                const nDept = departments.find(d => d.id === extEmp.departmentId);
                const nGroup = nDept && extEmp.groupId ? (nDept.groups || []).find(g => g.id === extEmp.groupId) : null;
                const p = extEmp.postId ? (nDept?.posts?.find(x => x.id === extEmp.postId) || nGroup?.posts?.find(x => x.id === extEmp.postId)) : null;
                const d = nDept ? (nDept.nextName || nDept.name) : '';
                const g = nGroup ? (nGroup.nextName || nGroup.name) : '';
                const pStr = p ? (p.nextName || p.name) : '';
                if (extEmp.departmentId === 'unassigned') hStr = '未配置';
                else if (extEmp.departmentId === 'retired') hStr = '退職';
                else if (d === 'システム用部署') hStr = '未配置';
                else hStr = `${d} ${g}${pStr}`;
             } else {
                const hist = (extEmp.history || []).find(h => h.year === hy);
                hStr = hist ? hist.department : '';
             }
             
             let isChange = false;
             if (hStr !== '' && hStr !== '-') {
                if (hStr !== lastValidHStr) {
                   isChange = true;
                }
                lastValidHStr = hStr;
             }
             
             let displayStr = hStr;
             if (hStr && hStr !== ' / 退職' && hStr !== '未配置' && hStr !== '-') {
               const histAge = (extEmp.birthDate && !isNaN(hy)) ? calculateAge(extEmp.birthDate, hy) : null;
               if (histAge) displayStr += ` (${histAge}歳)`;
             }
             
             v[40 + idx] = displayStr;
             if (isChange) {
                changeIndexes.push(40 + idx);
             }
          });
          r.changeIndexes = changeIndexes;
        }

        r.values = vals;
  for (let c = 1; c <= totalCols; c++) {
        const cell = r.getCell(c);
          const isNewDeptRow = (ws.getCell(cell.row, 1).value !== '' && ws.getCell(cell.row, 1).value !== null);
          const isNewGroupRow = (ws.getCell(cell.row, 2).value !== '' && ws.getCell(cell.row, 2).value !== null);
          
          let topStyle = isNewDeptRow ? 'medium' : 'thin';
          let bottomStyle = 'thin';

          if (c === 1) {
             if (isNewDeptRow) {
                 topStyle = 'medium';
             } else if (isNewGroupRow && typeof isFirstGroupOfDept !== 'undefined' && isFirstGroupOfDept) {
                 topStyle = 'thin';
             } else {
                 topStyle = null;
             }
             bottomStyle = null;
          } else if (c === 2) {
             if (isNewDeptRow) {
                 topStyle = 'medium';
             } else if (isNewGroupRow) {
                 topStyle = 'thin';
             } else {
                 topStyle = null;
             }
             bottomStyle = null;
          }

          const isLeftEdge = [1, 4, 11, 19, 22, 30, 40].includes(c);
    const isRightEdge = [3, 9, 17, 21, 29, 39, totalCols].includes(c);
          let cBorder = { left: { style: isLeftEdge ? 'medium' : 'thin' }, right: { style: isRightEdge ? 'medium' : 'thin' } };
          if (topStyle) cBorder.top = { style: topStyle };
          if (bottomStyle) cBorder.bottom = { style: bottomStyle };
          cell.border = cBorder;
          cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };
        cell.font = { name: 'BIZ UDPゴシック', size: 9 };
        if (c === 5) cell.font = { name: 'BIZ UDPゴシック', size: 10, bold: true };
        if (c === 7 || c === 8 || c === 10 || c === 15 || c === 16) cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };
        if (c === 10) cell.font = { name: 'BIZ UDPゴシック', size: 9, bold: true };
        
          if (c >= 40) {
             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA7F3D0' } }; // Emerald (History)
             const targetRow = typeof row !== 'undefined' ? row : (typeof r !== 'undefined' ? r : null);
             if (targetRow && targetRow.changeIndexes && targetRow.changeIndexes.includes(c - 1)) {
                 cell.font = { name: 'BIZ UDPゴシック', size: 9, bold: true, italic: true };
             }
          }
        if (c >= 11 && c <= 17 && !isRetired && !isUnassigned) {
           const isNextPromoted = getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade);
           const nextPromoColor = isNextPromoted ? getPromotedBgColorCode(emp.nextGrade) : null;
           if (nextPromoColor) {
               cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + nextPromoColor.replace('#', '').toUpperCase() } };
           }
        }
      }
      currentRowIndex++;
    });
  }
  
  const lastRow = ws.getRow(currentRowIndex - 1);
  if (lastRow && (currentRowIndex - 1) >= 6) {
  for (let c = 1; c <= totalCols; c++) {
      const cell = lastRow.getCell(c);
      if (cell.border) {
         cell.border = { ...cell.border, bottom: { style: 'medium' } };
      }
    }
  }
};
