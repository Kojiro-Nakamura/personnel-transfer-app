import { getGradeLevel, getEraFormattedYear, calculateAge, getPromotedBgColorCode, traverseOrgTree, getCounts, formatCountText, formatCountTransition, generateGradeSummary, isPromotedGrade, getEmpCurrentYears, calculateServiceYears, formatPromoDateWithEra, getEraSuffix, getEraSuffixForDate, formatServiceYearsText, formatDateForDisplay, getFormattedNameForPlan, shouldOmitEmployeeNumber, sortEmployeeList } from '../helpers.js';
import { GRADE_LEVELS, GRADE_OPTIONS } from '../../constants/config.js';
import { defaultFont, headerFont, borderStyle, thickBorderStyle, grayBorderStyle, grayThickBorderStyle, getCellBorders, getBirthFiscalYear, getHireFiscalYearShort, getEraYearOnly } from './excelHelpers.js';

// --- 人事異動案（Excel）出力 ---
export const addPlanSheet = (workbook, sheetName, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {
  const allHistoryYears = new Set();
  allHistoryYears.add(targetYear);
  employees.forEach(e => {
    if (e.history) e.history.forEach(h => allHistoryYears.add(h.year));
  });
  const historyYears = Array.from(allHistoryYears).sort((a, b) => a - b);

  const getEraSuffixLocal = (yearStr) => {
    return getEraSuffix(yearStr);
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

  const getStandardYears = (gradeName) => {
    if (gradeName === '係長級(主査)') return 5;
    if (gradeName === '補佐級I(主任)') return 3;
    if (gradeName === '補佐級II(班長)') return 3;
    if (gradeName === '補佐級III(補佐兼班長)') return 3;
    if (gradeName === '課長級') return 3;
    if (gradeName === '所属長級') return 3;
    if (gradeName === '次長級') return 2;
    if (gradeName === '部長級') return 2;
    return 0;
  };
  
  const getFastBgColorCode = () => '#fecaca'; // rose-200


  const ws = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 5, showGridLines: false, style: 'normal', zoomScale: 100 }],
    pageSetup: { paperSize: 8, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true, margins: { left: 0.3, right: 0.3, top: 0.984, bottom: 0.4, header: 0.1, footer: 0.1 } }
  });
  ws.pageSetup.printTitlesRow = '1:5';

  
  const extraCols = [
    { width: 7.40 },  // 空白列 (Q)
    { width: 14 }, // 氏名 (R)
    { width: 8 },  // 年齢 (S)
    { width: 16 }, // フリガナ (T)
    { width: 12 }, // 職員番号 (U)
    { width: 6 },  // 性別 (V)
    { width: 14 }, // 生年月日 (W)
    { width: 12 }, // 最終学歴 (X)
    { width: 14 }, // 採用年月日 (Y)
    { width: 20 }, // 特記事項 (Z)
    { width: 8 },  // 採用 (AA)
    { width: 8 },  // 係長級 (AB)
    { width: 8 },  // 補佐I (AC)
    { width: 15 },  // 補佐II (AD)
    { width: 15 },  // 補佐III (AE)
    { width: 15 },  // 課長級 (AF)
    { width: 15 },  // 所属長級 (AG)
    { width: 15 },  // 次長級 (AH)
    { width: 15 },  // 部長級 (AI)
    { width: 15 }, // 来年度 (AJ)
  ];
  historyYears.forEach(() => extraCols.push({ width: 14 }));
  ws.columns = [
    { width: 18 }, // 部署名
    { width: 18 }, // 班・グループ
    { width: 8 },  // ポスト
    { width: 12 }, // [今年度] 職名
    { width: 14 }, // [今年度] 氏名
    { width: 16 }, // [今年度] 級
    { width: 6 },  // [今年度] 年齢
    { width: 12 }, // [今年度] 在籍
    { width: 12 }, // [今年度] 備考
    { width: 12 }, // [来年度] 職名
    { width: 14 }, // [来年度] 氏名
    { width: 16 }, // [来年度] 級
    { width: 6 },  // [来年度] 年齢
    { width: 12 }, // [来年度] 在籍
    { width: 12 }, // [来年度] 備考
    { width: 25 },  // メモ
    ...extraCols
  ];


  const currSummaryStr = generateGradeSummary(employees, false);
  const nextSummaryStr = generateGradeSummary(employees, true);

  const filterName = Object.keys(GRADE_LEVELS).find(key => GRADE_LEVELS[key] === filterLevel);
  const filterSuffix = filterLevel > 0 && filterName ? `(${filterName}以上)` : '';
  const cleanFileName = fileName.replace(/\.xlsx$/, '');
  const displayFileName = filterSuffix && cleanFileName.endsWith(filterSuffix) 
    ? cleanFileName 
    : cleanFileName + filterSuffix;

  const r1 = ws.getRow(1);
  r1.values = [`${targetYear}年度(R${targetYear - 2018})人事異動案 【${displayFileName}】`];
  r1.font = { name: 'BIZ UDPゴシック', size: 8, bold: true };
  r1.height = 13;

  const r2 = ws.getRow(2);
  r2.values = [`【全体集計（今年度 ${targetYear - 1}(R${targetYear - 2019})）】 ${currSummaryStr}`];
  r2.font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF0369A1' } };
  r2.height = 13;

  const r3 = ws.getRow(3);
  r3.values = [`【全体集計（来年度 ${targetYear}(R${targetYear - 2018})）】 ${nextSummaryStr}`];
  r3.font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF0369A1' } };
  r3.height = 13;
  r3.getCell(18).value = '＜参考＞';
  r3.getCell(18).font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };

  [1, 2, 3].forEach(rn => {
    ws.getRow(rn).getCell(1).alignment = { vertical: 'middle', wrapText: false };
  });

  
  const targetYearIndex = Math.max(0, historyYears.indexOf(targetYear));
  const legendEndCol = 36 + targetYearIndex;
  const legendLabels = ["凡例", "係長級(主査)", "補佐級I(主任)", "補佐級II(班長)", "補佐級III(補佐兼班長)", "課長級", "所属長級", "次長級", "部長級"];
  const legendStartCol = legendEndCol - 8;

  for (let i = 0; i < legendLabels.length; i++) {
    const colNumber = legendStartCol + i;
    if (colNumber > 1) { 
      const cell = r2.getCell(colNumber);
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
  const currentEraShort = getEraFormattedYear(targetYear - 1).split('(')[1].replace(')', '');
  const r4Vals = ['部署名', '班・グループ', 'ポスト', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', '', '', 'メモ', ''];
  r4Vals.push('氏名', `${currentEraShort}年齢`, 'フリガナ', '基本情報', '', '', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', '');
  historyYears.forEach((y, i) => {
    if (i === 0) r4Vals.push('履歴');
    else r4Vals.push('');
  });
  r4.values = r4Vals;
  r4.height = 20;

  const r5 = ws.getRow(5);
  const r5Vals = ['', '', '', '職名', '氏名', '級', '年齢', '在籍', '備考', '職名', '氏名', '級', '年齢', '在籍', '備考', '', ''];
  r5Vals.push('氏名', '年齢', 'フリガナ', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '〇配属希望', '●特殊事情', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度');
  historyYears.forEach(y => r5Vals.push(getEraFormattedYear(y)));
  r5.values = r5Vals;
  r5.height = 20;

  ws.mergeCells('A4:A5');
  ws.mergeCells('B4:B5');
  ws.mergeCells('C4:C5');
  ws.mergeCells('D4:I4');
  ws.mergeCells('J4:O4');
  ws.mergeCells('P4:P5');
  ws.mergeCells('Q4:Q5');
  ws.mergeCells('R4:R5');
  ws.mergeCells('S4:S5');
  ws.mergeCells('T4:T5');
  ws.mergeCells('U4:AB4');
  ws.mergeCells('AC4:AL4');
  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(38 + historyYears.length).letter;
    const startColCode = ws.getColumn(39).letter;
    ws.mergeCells(`${startColCode}4:${endColCode}4`);
  }


  
  const totalCols = 38 + historyYears.length;
  for (let i = 1; i <= totalCols; i++) {
    const col = ws.getColumn(i).letter;
    [4, 5].forEach(rn => {
      const cell = ws.getCell(`${col}${rn}`);
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      if (i >= 37) { // 履歴列
         cell.alignment = { ...cell.alignment, shrinkToFit: true, wrapText: false };
      }
      let argb = 'FFCBD5E1'; // slate-300
      if (i >= 4 && i <= 9) argb = 'FFFEF3C7'; // 今年度
      if (i >= 10 && i <= 15) argb = 'FFDBEAFE'; // 来年度
      if (i === 16) argb = 'FFF1F5F9'; // メモ
      if (i === 17) argb = 'FFFFFFFF'; // 空白列
      if (i >= 18 && i <= 20) argb = 'FFCBD5E1'; // 氏名,年齢,フリガナ (same as 部署名)
      if (i >= 21 && i <= 28) argb = 'FFBFDBFE'; // 基本情報 (Blue)
      if (i >= 29 && i <= 38) {
         const promoColors = {
            30: getPromotedBgColorCode('係長級(主査)'),
            31: getPromotedBgColorCode('補佐級I(主任)'),
            32: getPromotedBgColorCode('補佐級II(班長)'),
            33: getPromotedBgColorCode('補佐級III(補佐兼班長)'),
            34: getPromotedBgColorCode('課長級'),
            35: getPromotedBgColorCode('所属長級'),
            36: getPromotedBgColorCode('次長級'),
            37: getPromotedBgColorCode('部長級'),
         };
         if (rn === 5 && promoColors[i]) {
            argb = 'FF' + promoColors[i].replace('#', '').toUpperCase();
         } else {
            argb = 'FFF5D0FE'; // Fuchsia
         }
      }
      if (i >= 39) argb = 'FFA7F3D0'; // Emerald (History)
      
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
      
      let topB = rn === 4 && i !== 17 ? 'thick' : false;
      if (rn === 5 && [16, 18, 19, 20].includes(i)) topB = 'thick';
      let bottomB = rn === 5 && i !== 17 ? 'thick' : false;
      if (rn === 4 && i >= 4 && i <= 15) bottomB = true; 
      if (rn === 4 && i >= 21 && i <= 26) bottomB = true;
      if (rn === 4 && i >= 27 && i <= 36) bottomB = true;
      if (rn === 4 && i >= 37) bottomB = true;
      
      const leftB = [1, 4, 10, 16, 18, 21, 29, 39].includes(i) ? 'thick' : true;
      const rightB = [3, 9, 15, 16, 20, 28, 38, totalCols].includes(i) ? 'thick' : true;
      
      const newBorder = getCellBorders(topB, bottomB, leftB, rightB);
      cell.border = { ...(cell.border || {}), ...newBorder };
    });
  }


  const getYearsStr = (emp, isNext) => { 
    if (!emp) return ''; 
    const years = getEmpCurrentYears(emp, isNext ? targetYear : targetYear - 1, isNext);
    const skills = isNext ? emp.nextSkills : emp.currentSkills; 
    return skills?.length ? `${years}年(${skills.join('、')})` : `${years}年`; 
  };
  const getNoteStr = (emp, isNext) => emp ? (isNext ? emp.nextEmploymentType : emp.currentEmploymentType) : '';
  const getAgeStr = (emp, isNext) => {
    if (!emp || !emp.birthDate) return '';
    const age = calculateAge(emp.birthDate, isNext ? targetYear : targetYear - 1);
    return (age !== '' && age !== null && !isNaN(age)) ? Number(age) : '';
  };

  let rowIndex = 6;
  let lastDept = null;
  let lastGroup = null;
  let lastPost = null;
  let prevRowColors = {};

  traverseOrgTree(departments, deptMap, currMap, nextMap, filterLevel, (dept, group, postName, currEmp, nextEmp, rowType, i, post) => {
    const deptName = dept.nextName && dept.nextName !== dept.name ? `${dept.name} / ${dept.nextName}` : dept.name;
    const groupName = group ? (group.nextName && group.nextName !== group.name ? `${group.name} / ${group.nextName}` : group.name) : '';
    let formattedPostName = postName;
    if (post && post.nextName && post.nextName !== post.name) {
      formattedPostName = `${post.name} / ${post.nextName}`;
    }

    if (filterLevel > 0) {
      const currLvl = currEmp ? getGradeLevel(currEmp.currentGrade) : 0;
      const nextLvl = nextEmp ? getGradeLevel(nextEmp.nextGrade) : 0;
      const hasEmp = currEmp || nextEmp;
      if (formattedPostName !== '班員' && formattedPostName !== '') {
        if (hasEmp && currLvl < filterLevel && nextLvl < filterLevel) return; 
      } else {
        if (currLvl < filterLevel && nextLvl < filterLevel) return; 
      }
    }

    const isNewDept = deptName !== lastDept;
    const isNewGroup = isNewDept || groupName !== lastGroup;
    const isNewPost = isNewGroup || formattedPostName !== lastPost;
    let displayPost = isNewPost ? formattedPostName : '';
    if (displayPost === '班員') displayPost = '';
    
    lastDept = deptName; lastGroup = groupName; lastPost = formattedPostName;

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
          displayDeptStr = `${deptName} ${formatCountTransition(cCounts, nCounts)}`;
        } else {
          displayDeptStr = deptName;
        }
      } else {
        displayDeptStr = '';
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
          displayGroupStr = `${groupName} ${formatCountTransition(gCCounts, gNCounts)}`;
        } else {
          displayGroupStr = groupName;
        }
      } else {
        displayGroupStr = '';
      }
    }

    let targetId = '';
    if (rowType === 'post') targetId = `postRow-${dept.id}-${post.id}-${i}`;
    else if (rowType === 'groupPost') targetId = `groupPostRow-${dept.id}-${group.id}-${post.id}-${i}`;
    else if (rowType === 'direct') targetId = `directRow-${dept.id}-${group.id}-${i}`;
    else if (rowType === 'deptDirect') targetId = `deptDirectRow-${dept.id}-${i}`;
    else if (rowType === 'system') targetId = `side-${nextEmp ? nextEmp.id : currEmp?.id}`;
    
    let noteStr = '';
    const rowNote = notes.find(n => n.targetId === targetId);
    if (rowNote && rowNote.text) noteStr += rowNote.text;

    if (isNewDept && dept.id) {
       const dNote = notes.find(n => n.targetId === `dept-${dept.id}`);
       if (dNote && dNote.text) {
         if (noteStr) noteStr += ' / ';
         noteStr += `[部署メモ] ${dNote.text}`;
       }
    }
    if (isNewGroup && group && group.id) {
       const gNote = notes.find(n => n.targetId === `groupHeader-${dept.id}-${group.id}`);
       if (gNote && gNote.text) {
         if (noteStr) noteStr += ' / ';
         noteStr += `[班メモ] ${gNote.text}`;
       }
    }

    const row = ws.getRow(rowIndex);

    const rowVals = [
      displayDeptStr, displayGroupStr, displayPost,
      currEmp ? currEmp.currentTitle : '',
      currEmp ? getFormattedNameForPlan(currEmp, false) : '',
      currEmp ? currEmp.currentGrade : '',
      getAgeStr(currEmp, false),
      getYearsStr(currEmp, false),
      getNoteStr(currEmp, false),
      nextEmp ? nextEmp.nextTitle : '',
      nextEmp ? getFormattedNameForPlan(nextEmp, true) : '',
      nextEmp ? nextEmp.nextGrade : '',
      getAgeStr(nextEmp, true),
      getYearsStr(nextEmp, true),
      getNoteStr(nextEmp, true),
      noteStr
    ];
    
    const extEmp = nextEmp;
    let curFontStyles = {};
    let curPromoColors = {};
    if (extEmp) {
      rowVals.push(''); // Blank spacer Q
      rowVals.push(getFormattedNameForPlan(extEmp, true));
      rowVals.push(getAgeStr(extEmp, false));
      rowVals.push(extEmp.furigana || '');
      rowVals.push(shouldOmitEmployeeNumber(extEmp, true) ? '' : (extEmp.employeeNumber || ''));
      rowVals.push(extEmp.gender || '');
      rowVals.push(formatWithEra(extEmp.birthDate));
      rowVals.push(extEmp.education || '');
      rowVals.push(formatWithEra(extEmp.hireDate, extEmp.birthDate));
      rowVals.push(extEmp.note || '');
      rowVals.push(extEmp.desiredAssignment ? '〇' + extEmp.desiredAssignment : '');
      rowVals.push(extEmp.specialCircumstances ? '●' + extEmp.specialCircumstances : '');

      let hireStr = '';
      if (extEmp.hireDate) {
        hireStr = formatDateForDisplay(extEmp.hireDate);
        const y = parseInt(String(extEmp.hireDate).split('-')[0], 10);
        if (extEmp.birthDate && !isNaN(y)) {
           const ag = calculateAge(extEmp.birthDate, y);
           if (ag) hireStr += `(${ag}歳)`;
        }
      }
      rowVals.push(hireStr);

      const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
      const gradeList = ['', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級'];
      const gradeToPromoKey = { "部長級": "promoYearDeptHead", "次長級": "promoYearDeputyHead", "所属長級": "promoYearDivHead", "課長級": "promoYearSecHead", "補佐級III(補佐兼班長)": "promoYearAssistant3", "補佐級II(班長)": "promoYearAssistant2", "補佐級I(主任)": "promoYearAssistant1", "係長級(主査)": "promoYearChief" };
      
      const promoYearMap = {};
      if (extEmp) {
         if (extEmp.promoYearChief) promoYearMap[parseInt(extEmp.promoYearChief)] = "係長級(主査)";
         if (extEmp.promoYearAssistant1) promoYearMap[parseInt(extEmp.promoYearAssistant1)] = "補佐級I(主任)";
         if (extEmp.promoYearAssistant2) promoYearMap[parseInt(extEmp.promoYearAssistant2)] = "補佐級II(班長)";
         if (extEmp.promoYearAssistant3) promoYearMap[parseInt(extEmp.promoYearAssistant3)] = "補佐級III(補佐兼班長)";
         if (extEmp.promoYearSecHead) promoYearMap[parseInt(extEmp.promoYearSecHead)] = "課長級";
         if (extEmp.promoYearDivHead) promoYearMap[parseInt(extEmp.promoYearDivHead)] = "所属長級";
         if (extEmp.promoYearDeputyHead) promoYearMap[parseInt(extEmp.promoYearDeputyHead)] = "次長級";
         if (extEmp.promoYearDeptHead) promoYearMap[parseInt(extEmp.promoYearDeptHead)] = "部長級";
      }

      for (let idx = 1; idx < pKeys.length; idx++) {
        const key = pKeys[idx];
        let cellVal = extEmp[key] || '';
        let isNextPromo = false;
        
        if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade) && gradeToPromoKey[extEmp.nextGrade] === key) {
           isNextPromo = true;
           cellVal = `${targetYear}-04-01`;
        }
        
        if (cellVal) {
          let prefix = '';
          if (cellVal.includes && cellVal.includes('(追及)')) prefix = '追及:';
          else if (cellVal.includes && cellVal.includes('(免除)')) prefix = '免除:';
          
          let pStr = formatDateForDisplay(cellVal);
          const y = parseInt(String(cellVal).split('-')[0], 10);
          if (extEmp.birthDate && !isNaN(y)) {
             const ag = calculateAge(extEmp.birthDate, y);
             if (ag) pStr += `(${ag}歳)`;
          }
          
          let prevDate = '';
          for (let j = idx - 1; j >= 0; j--) {
             let prevVal = extEmp[pKeys[j]] || '';
             if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade) && gradeToPromoKey[extEmp.nextGrade] === pKeys[j]) {
                 prevVal = `${targetYear}-04-01`;
             }
             if (prevVal) {
               prevDate = prevVal;
               break;
             }
          }
          
          if (prevDate) {
             const diffStr = calculateServiceYears(prevDate, cellVal, true);
             if (diffStr !== '') {
               pStr = `${formatServiceYearsText(diffStr)}> ${pStr}`;
             } else {
               pStr = `> ${pStr}`;
             }
          } else {
             pStr = `> ${pStr}`;
          }
          
          if (isNextPromo) {
           curPromoColors[29 + idx] = getPromotedBgColorCode(extEmp.nextGrade);
          }
          
          rowVals.push(prefix ? `${prefix}${pStr}` : pStr);
        } else {
          rowVals.push('');
        }
      }
      
      // Next year difference
      let finalDiff = null;
      if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade)) {
        finalDiff = 1;
      } else {
        let prevY = NaN;
        for (let i = pKeys.length - 1; i >= 0; i--) {
          const y = pKeys[i] === 'hireDate' ? (extEmp.hireDate ? parseInt(String(extEmp.hireDate).substring(0,4)) : NaN) : parseInt(extEmp[pKeys[i]] || 'NaN');
          if (!isNaN(y)) { prevY = y; break; }
        }
        finalDiff = (!isNaN(prevY)) ? targetYear - prevY + 1 : null;
      }
      let nYearStr = `> ${finalDiff !== null ? formatServiceYearsText(finalDiff) : ''}`;
      if (finalDiff !== null && extEmp.birthDate) {
        const ag = calculateAge(extEmp.birthDate, targetYear);
        if (ag) nYearStr += `(${ag}歳)`;
      }
      rowVals.push(nYearStr);
      
      if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade)) {
           const c = getPromotedBgColorCode(extEmp.nextGrade);
           if (c) {
               curPromoColors[18] = c;
               curPromoColors[19] = c;
               curPromoColors[38] = c;
           }
      }

      // History
      let nDeptName = '';
      if (extEmp) {
        if (extEmp.departmentId === 'retired') {
           nDeptName = '退職';
        } else if (!extEmp.departmentId || extEmp.departmentId === 'unassigned') {
           nDeptName = '未配置';
        } else {
           const nDept = departments.find(d => d.id === extEmp.departmentId);
           const nGroup = nDept && extEmp.groupId ? (nDept.groups || []).find(g => g.id === extEmp.groupId) : null;
           let d = nDept ? (nDept.nextName || nDept.name) : '';
           let g = nGroup ? (nGroup.nextName || nGroup.name) : '';
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
      }

      let lastValidHStr = '-';
      historyYears.forEach((y, i) => {
        let hStr = '';
        if (y === targetYear) {
           hStr = nDeptName;
        } else {
           const hist = (extEmp.history || []).find(h => h.year === y);
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
        if (hStr && hStr !== ' / 課直轄' && hStr !== '未配置' && hStr !== '-') {
          const histAge = (extEmp.birthDate && !isNaN(y)) ? calculateAge(extEmp.birthDate, y) : null;
          if (histAge !== null && !isNaN(histAge)) {
            displayStr = `${hStr} (${histAge}歳)`;
          }
        }
        
        rowVals.push(displayStr);
        if (isChange) {
           curFontStyles[41 + i] = 'change'; 
        }
        if (promoYearMap[y]) {
           const c = getPromotedBgColorCode(promoYearMap[y]);
           if (c) curPromoColors[39 + i] = c;
        }
      });
      

      
      row.values = rowVals;
      
      // apply colors and styles
      Object.keys(curPromoColors).forEach(cIdx => {
         const cell = row.getCell(parseInt(cIdx));
         cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + curPromoColors[cIdx].replace('#', '').toUpperCase() } };
      });

    } else {
      row.values = rowVals;
    }


    const isPostCell = formattedPostName !== '' && formattedPostName !== '班員';
    const isDeptPost = isPostCell && groupName === ''; 
    const isGroupPost = isPostCell && groupName !== '';
    const structDeptHighlight = isNewDept || isDeptPost;
      const structGroupHighlight = structDeptHighlight || isNewGroup || isGroupPost;
      const structPostHighlight = structGroupHighlight || isPostCell;

      const isDeptLevelHighlight = structDeptHighlight && filterLevel === 0;
      const isGroupLevelHighlight = structGroupHighlight && filterLevel === 0;
      const isPostLevelHighlight = structPostHighlight && filterLevel === 0;
  
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        let currentFont = defaultFont;
        if (curFontStyles && curFontStyles[colNumber] === 'change') {
            currentFont = { ...defaultFont, bold: true, italic: true };
        }
        if (typeof cell.value === 'string') {
          const match = cell.value.match(/\d{4}-\d{2}-\d{2}/);
          if (match && !cell.value.includes('-04-01')) {
            currentFont = { ...currentFont, color: { argb: 'FFE11D48' } };
          }
        }
        cell.font = currentFont;
        const isNoShrink = (colNumber >= 26 && colNumber <= 28);
        cell.alignment = { vertical: 'middle', shrinkToFit: !isNoShrink, wrapText: false };
        if (colNumber >= 3) {
          const align = isNoShrink ? 'left' : 'center';
          cell.alignment = { ...cell.alignment, horizontal: align };
        }
        if (colNumber === 21 && cell.value && cell.value.toString().trim() !== '') {
          const num = Number(cell.value);
          if (!isNaN(num)) {
            cell.value = num;
            cell.numFmt = '[$-411]000000';
          }
        }


        
        const isLeftEdge = [1, 4, 10, 16, 18, 21, 29, 39].includes(colNumber);
        const isRightEdge = [3, 9, 15, 16, 20, 28, 38, totalCols].includes(colNumber);
        
        let topBorder = true;
        let bottomBorder = false;

        if (colNumber === 1) {
          if (isNewDept) topBorder = 'thick';
          else topBorder = false;
          
          if (structDeptHighlight) bottomBorder = true;
        } else if (colNumber === 2) {
          if (isNewDept) topBorder = 'thick';
          else topBorder = false;
          
          if (structGroupHighlight) bottomBorder = true;
        } else if (colNumber === 3) {
          if (isNewDept) topBorder = 'thick';
          else topBorder = false;
          
          if (structPostHighlight) bottomBorder = true;
        } else if (colNumber === 17) {
          topBorder = false;
          bottomBorder = false;
        } else if (colNumber >= 18) {
          if (isNewDept) topBorder = 'thick';
          else if (extEmp) topBorder = true;
          else topBorder = false;
          
          if (extEmp) bottomBorder = true;
        } else {
          if (isNewDept) topBorder = 'thick';
          else topBorder = true;
        }
  
        cell.border = getCellBorders(topBorder, bottomBorder, isLeftEdge ? 'thick' : true, isRightEdge ? 'thick' : true);

      let argb = 'FFFFFFFF'; 
      if (colNumber === 1 && isDeptLevelHighlight) argb = 'FFE0F2FE'; 
      else if (colNumber === 2 && isGroupLevelHighlight) argb = 'FFE0F2FE';
      else if (colNumber === 3 && isPostLevelHighlight) argb = 'FFE0F2FE';
      else if (colNumber >= 4 && colNumber <= 9 && isPostLevelHighlight) argb = 'FFE0F2FE';
      else if (colNumber >= 10 && colNumber <= 15 && isPostLevelHighlight) argb = 'FFE0F2FE';
      
      if (nextEmp && isPromotedGrade(nextEmp.currentGrade, nextEmp.nextGrade)) {
        const promoColor = getPromotedBgColorCode(nextEmp.nextGrade); 
        if (promoColor && (colNumber >= 10 && colNumber <= 15)) {
          argb = 'FF' + promoColor.replace('#', '').toUpperCase();
        }
      }
      
      if (colNumber === 16 && noteStr) cell.font = { ...defaultFont, color: { argb: 'FF0369A1' } };
      if (argb !== 'FFFFFFFF') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
      }
      
      if ((colNumber === 1 || colNumber === 2 || colNumber === 3) && argb === prevRowColors[colNumber]) {
         const cellText = rowVals[colNumber - 1];
         let shouldMerge = (!cellText || cellText === '');
         if (colNumber === 3 && isNewPost) shouldMerge = false;
         
         if (shouldMerge) {
            if (cell.border && cell.border.top && cell.border.top.style === 'thin') {
               cell.border = { ...cell.border, top: undefined };
            }
            if (rowIndex > 6) {
               const prevCell = ws.getRow(rowIndex - 1).getCell(colNumber);
               if (prevCell.border && prevCell.border.bottom && prevCell.border.bottom.style === 'thin') {
                  prevCell.border = { ...prevCell.border, bottom: undefined };
               }
            }
         } else {
            if (!isNewDept && cell.border && !cell.border.top) {
                cell.border = { ...cell.border, top: { style: 'thin' } };
            }
         }
      } else if (colNumber === 1 || colNumber === 2 || colNumber === 3) {
         if (!isNewDept) {
            cell.border = { ...cell.border, top: { style: 'thin' } };
            if (rowIndex > 6) {
               const prevCell = ws.getRow(rowIndex - 1).getCell(colNumber);
               if (prevCell.border && !prevCell.border.bottom) {
                  prevCell.border = { ...prevCell.border, bottom: { style: 'thin' } };
               }
            }
         }
      }
      prevRowColors[colNumber] = argb;
    });

    rowIndex++;
  });

  if (rowIndex > 6) {
    const lastRow = ws.getRow(rowIndex - 1);
    lastRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
       if (colNumber === 17) return;
       if (cell.border) {
         cell.border = { ...cell.border, bottom: thickBorderStyle };
       } else {
         cell.border = { bottom: thickBorderStyle };
       }
    });
  }
  
  ws.pageSetup.printArea = `A1:P${rowIndex > 6 ? rowIndex - 1 : 6}`;


  ws.columns.forEach((col, i) => {
    if (i === 25 || i === 26 || i === 27) {
       col.width = 20;
       return;
    }
    if (i >= 17) { // 'R' (氏名) 以降
       const isHistory = i >= 36;
       let maxLength = 0;
       col.eachCell({ includeEmpty: true }, cell => {
         if (cell.row <= 4) return; // include row 5 headers
         const v = cell.value ? cell.value.toString() : '';
         if (v) {
            const lines = v.split('\n');
            for (let l of lines) {
               let lw = 0;
               for (let c of l) {
                   if (isHistory) {
                       lw += c.charCodeAt(0) > 255 ? 1.3 : 0.7;
                   } else {
                       lw += c.charCodeAt(0) > 255 ? 1.6 : 0.9;
                   }
               }
               if (lw > maxLength) maxLength = lw;
            }
         }
       });
       if (maxLength > 40) maxLength = 40; // cap maximum width
       if (maxLength > 0) {
          let padding = isHistory ? 0.5 : 1.5;
          col.width = maxLength + padding;
       }
    }
  });
};
