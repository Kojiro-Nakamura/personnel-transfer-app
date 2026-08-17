import ExcelJS from 'exceljs';
import { getGradeLevel, getEraFormattedYear, calculateAge, getPromotedBgColorCode, traverseOrgTree, getCounts, formatCountText, generateGradeSummary, isPromotedGrade, getEmpCurrentYears, calculateServiceYears, formatPromoDateWithEra, getEraSuffix, getEraSuffixForDate, formatServiceYearsText, formatDateForDisplay } from './helpers.js';
import { GRADE_LEVELS, GRADE_OPTIONS } from '../constants/config.js';

// 基本のフォント設定
const defaultFont = { name: 'BIZ UDPGothic', size: 8 };
const headerFont = { name: 'BIZ UDPGothic', size: 8, bold: true };
const borderStyle = { style: 'thin', color: { argb: 'FF000000' } };
const thickBorderStyle = { style: 'medium', color: { argb: 'FF000000' } };

const grayBorderStyle = { style: 'thin', color: { argb: 'FF94A3B8' } };
const grayThickBorderStyle = { style: 'medium', color: { argb: 'FF475569' } };

const getCellBorders = (top = false, bottom = false, left = false, right = false, isGray = false) => {
  const b = {};
  const thinStyle = isGray ? grayBorderStyle : borderStyle;
  const thickStyle = isGray ? grayThickBorderStyle : thickBorderStyle;

  if (top) b.top = top === 'thick' ? thickStyle : thinStyle;
  if (bottom) b.bottom = bottom === 'thick' ? thickStyle : thinStyle;
  if (left) b.left = left === 'thick' ? thickStyle : thinStyle;
  if (right) b.right = right === 'thick' ? thickStyle : thinStyle;
  return b;
};

const saveWorkbook = async (workbook, fileName) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith('.xlsx') ? fileName : fileName + '.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// --- 人事異動案（Excel）出力 ---
export const exportPlanToExcel = async (fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {
  const allHistoryYears = new Set();
  allHistoryYears.add(targetYear);
  employees.forEach(e => {
    if (e.history) e.history.forEach(h => allHistoryYears.add(h.year));
  });
  const historyYears = Array.from(allHistoryYears).sort((a, b) => a - b);

  const getEraSuffixLocal = (yearStr) => {
    return getEraSuffix(yearStr);
  };
  
  const formatWithEra = (dateStr) => {
    return formatPromoDateWithEra(String(dateStr));
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


  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('人事異動案', {
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
    { width: 8 },  // 補佐II (AD)
    { width: 8 },  // 補佐III (AE)
    { width: 8 },  // 課長級 (AF)
    { width: 8 },  // 所属長級 (AG)
    { width: 8 },  // 次長級 (AH)
    { width: 8 },  // 部長級 (AI)
    { width: 14 }, // 来年度 (AJ)
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
  r1.font = { name: 'BIZ UDPGothic', size: 8, bold: true };
  r1.height = 13;

  const r2 = ws.getRow(2);
  r2.values = [`【全体集計（今年度 ${targetYear - 1}(R${targetYear - 2019})）】 ${currSummaryStr}`];
  r2.font = { name: 'BIZ UDPGothic', size: 8, bold: true, color: { argb: 'FF0369A1' } };
  r2.height = 13;

  const r3 = ws.getRow(3);
  r3.values = [`【全体集計（来年度 ${targetYear}(R${targetYear - 2018})）】 ${nextSummaryStr}`];
  r3.font = { name: 'BIZ UDPGothic', size: 8, bold: true, color: { argb: 'FF0369A1' } };
  r3.height = 13;
  r3.getCell(18).value = '＜参考＞';
  r3.getCell(18).font = { name: 'BIZ UDPGothic', size: 8, bold: true, color: { argb: 'FF000000' } };

  [1, 2, 3].forEach(rn => {
    ws.getRow(rn).getCell(1).alignment = { vertical: 'middle', wrapText: false };
  });

  
  const currYearIndex = Math.max(0, historyYears.indexOf(targetYear - 1));
  const legendEndCol = 35 + currYearIndex;
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
        cell.font = { name: 'BIZ UDPGothic', size: 8, bold: true, color: { argb: 'FF000000' } };
      } else {
        cell.font = { name: 'BIZ UDPGothic', size: 8, bold: false, color: { argb: 'FF000000' } };
        const c = getPromotedBgColorCode(legendLabels[i]);
        if (c) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + c.replace('#', '').toUpperCase() } };
      }
    }
  }

  const r4 = ws.getRow(4);
  const currentEraShort = getEraFormattedYear(targetYear - 1).split('(')[1].replace(')', '');
  const r4Vals = ['部署名', '班・グループ', 'ポスト', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', '', '', 'メモ', ''];
  r4Vals.push('氏名', `${currentEraShort}年齢`, 'フリガナ', '基本情報', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', '', '');
  historyYears.forEach((y, i) => {
    if (i === 0) r4Vals.push('履歴');
    else r4Vals.push('');
  });
  r4.values = r4Vals;
  r4.height = 20;

  const r5 = ws.getRow(5);
  const r5Vals = ['', '', '', '職名', '氏名', '級', '年齢', '在籍', '備考', '職名', '氏名', '級', '年齢', '在籍', '備考', '', ''];
  r5Vals.push('氏名', '年齢', 'フリガナ', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度');
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
  ws.mergeCells('U4:Z4');
  ws.mergeCells('AA4:AJ4');
  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(36 + historyYears.length).letter;
    const startColCode = ws.getColumn(37).letter;
    if (startColCode !== endColCode) ws.mergeCells(`${startColCode}4:${endColCode}4`);
  }


  
  const totalCols = 36 + historyYears.length;
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
      if (i >= 21 && i <= 26) argb = 'FFBFDBFE'; // 基本情報 (Blue)
      if (i >= 27 && i <= 36) {
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
         if (rn === 5 && promoColors[i]) {
            argb = 'FF' + promoColors[i].replace('#', '').toUpperCase();
         } else {
            argb = 'FFF5D0FE'; // Fuchsia
         }
      }
      if (i >= 37) argb = 'FFA7F3D0'; // Emerald (History)
      
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
      
      const topB = rn === 4 && i !== 17 ? 'thick' : false;
      let bottomB = rn === 5 && i !== 17 ? 'thick' : false;
      if (rn === 4 && i >= 4 && i <= 15) bottomB = true; 
      if (rn === 4 && i >= 21 && i <= 26) bottomB = true;
      if (rn === 4 && i >= 27 && i <= 36) bottomB = true;
      if (rn === 4 && i >= 37) bottomB = true;
      
      const leftB = [1, 4, 10, 16, 17, 18, 19, 20, 21, 27, 37].includes(i) ? 'thick' : true;
      const rightB = [3, 9, 15, 16, 17, 18, 19, 20, 26, 36, totalCols].includes(i) ? 'thick' : true;
      
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
    return age !== '' ? `${age}歳` : '';
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
          displayDeptStr = `${deptName} （今:${formatCountText(cCounts)} / 来:${formatCountText(nCounts)}）`;
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
          displayGroupStr = `${groupName} （今:${formatCountText(gCCounts)} / 来:${formatCountText(gNCounts)}）`;
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
      currEmp ? currEmp.name : '',
      currEmp ? currEmp.currentGrade : '',
      getAgeStr(currEmp, false),
      getYearsStr(currEmp, false),
      getNoteStr(currEmp, false),
      nextEmp ? nextEmp.nextTitle : '',
      nextEmp ? nextEmp.name : '',
      nextEmp ? nextEmp.nextGrade : '',
      getAgeStr(nextEmp, true),
      getYearsStr(nextEmp, true),
      getNoteStr(nextEmp, true),
      noteStr
    ];
    
    const extEmp = nextEmp;
    let curFontStyles = {};
    if (extEmp) {
      rowVals.push(''); // Blank spacer Q
      rowVals.push(extEmp.name || '');
      rowVals.push(getAgeStr(extEmp, false));
      rowVals.push(extEmp.furigana || '');
      rowVals.push(extEmp.employeeNumber || '');
      rowVals.push(extEmp.gender || '');
      rowVals.push(formatWithEra(extEmp.birthDate));
      rowVals.push(extEmp.education || '');
      rowVals.push(formatWithEra(extEmp.hireDate));
      rowVals.push(extEmp.note || '');

      const hireYear = extEmp.hireDate ? String(extEmp.hireDate).substring(0,4) : '';
      let hireStr = hireYear;
      if (hireYear) {
        const suffix = getEraSuffixLocal(hireYear);
        if (suffix) hireStr += `(${suffix})`;
      }
      rowVals.push(hireStr);

      const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
      const gradeList = ['', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級'];
      const gradeToPromoKey = { "部長級": "promoYearDeptHead", "次長級": "promoYearDeputyHead", "所属長級": "promoYearDivHead", "課長級": "promoYearSecHead", "補佐級III(補佐兼班長)": "promoYearAssistant3", "補佐級II(班長)": "promoYearAssistant2", "補佐級I(主任)": "promoYearAssistant1", "係長級(主査)": "promoYearChief" };
      
      const curPromoColors = {}; // cell colors for promo
      
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
          
          let pStr = cellVal;
          const suffix = getEraSuffixForDate(cellVal);
          if (suffix) pStr += `(${suffix})`;
          
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
             const diffStr = calculateServiceYears(prevDate, cellVal);
             if (diffStr !== '') {
               pStr = `${formatServiceYearsText(diffStr)}> ${pStr}`;
             } else {
               pStr = `> ${pStr}`;
             }
          } else {
             pStr = `> ${pStr}`;
          }
          
          if (isNextPromo) {
           curPromoColors[27 + idx] = getPromotedBgColorCode(extEmp.nextGrade);
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
      rowVals.push(`> ${finalDiff !== null ? formatServiceYearsText(finalDiff) : ''}`);
      
      if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade)) {
           const c = getPromotedBgColorCode(extEmp.nextGrade);
           if (c) {
               curPromoColors[18] = c;
               curPromoColors[19] = c;
               curPromoColors[36] = c;
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
           curFontStyles[37 + i] = 'change'; 
        }
        if (promoYearMap[y]) {
           const c = getPromotedBgColorCode(promoYearMap[y]);
           if (c) curPromoColors[37 + i] = c;
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
        if (curFontStyles && curFontStyles[colNumber] === 'change') {
            cell.font = { ...defaultFont, bold: true, italic: true };
        } else {
            cell.font = defaultFont;
        }
        cell.alignment = { vertical: 'middle', shrinkToFit: true, wrapText: false };
        if (colNumber >= 3) {
          cell.alignment = { ...cell.alignment, horizontal: 'center' };
        }


        
        const isLeftEdge = colNumber === 1 || colNumber === 4 || colNumber === 10 || colNumber === 16;
        const isRightEdge = colNumber === 3 || colNumber === 9 || colNumber === 15 || colNumber === 16;
        
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

  await saveWorkbook(workbook, fileName);
};

// --- 職員一覧（Excel）出力 ---
export const exportListToExcel = async (fileName, targetYear, employees, departments) => {
  const currentEraShort = getEraFormattedYear(targetYear - 1).split('(')[1].replace(')', '');
  const targetEraShort = getEraFormattedYear(targetYear).split('(')[1].replace(')', '');
  const yearsSet = new Set();
  yearsSet.add(targetYear);
  employees.forEach(e => {
    if (e.history) e.history.forEach(h => yearsSet.add(h.year));
  });
  const historyYears = Array.from(yearsSet).sort((a, b) => a - b);

  const getEraSuffixLocal = (y) => {
    const eraStr = getEraFormattedYear(y);
    const match = eraStr.match(/([RSHM])(\d+)/);
    return match ? `${match[1]}${match[2]}` : String(y).substring(2);
  };
  
  const formatDateForDisplayLocal = (dateStr) => {
    if (!dateStr) return '';
    const str = String(dateStr);
    const parts = str.split('-');
    const y = parts[0];
    const era = getEraSuffixLocal(y);
    if (parts.length >= 3) {
      if (parts[1] === '04' && parts[2] === '01') {
        return `${y}(${era})`;
      }
      return `${str}(${era})`;
    }
    return `${y}(${era})`;
  };
  
  const formatWithEra = (dateStr) => {
    if (!dateStr) return '';
    const match = String(dateStr).match(/^(\d{4})[-/]/);
    if (match) {
      const year = parseInt(match[1], 10);
      let era = '';
      if (year >= 2019) era = `(R${year - 2018})`;
      else if (year >= 1989) era = `(H${year - 1988})`;
      else if (year >= 1926) era = `(S${year - 1925})`;
      else if (year >= 1912) era = `(T${year - 1911})`;
      return era ? `${dateStr}${era}` : String(dateStr);
    }
    return String(dateStr);
  };

  const gradeToPromoKey = { "部長級": "promoYearDeptHead", "次長級": "promoYearDeputyHead", "所属長級": "promoYearDivHead", "課長級": "promoYearSecHead", "補佐級III(補佐兼班長)": "promoYearAssistant3", "補佐級II(班長)": "promoYearAssistant2", "補佐級I(主任)": "promoYearAssistant1", "係長級(主査)": "promoYearChief" };
  const getBorderHexColor = (grade) => {
    switch (grade) {
      case "部長級": return "FFC084FC";
      case "次長級": return "FFF87171";
      case "所属長級": return "FFFB923C";
      case "課長級": return "FFFACC15";
      case "補佐級III(補佐兼班長)": return "FF38BDF8";
      case "補佐級II(班長)": return "FF34D399";
      case "補佐級I(主任)": return "FFF472B6";
      case "係長級(主査)": return "FF94A3B8";
      case "一般": return "FFA5B4FC";
      default: return "FFCBD5E1";
    }
  };

  const listDefaultFont = { name: 'BIZ UDPGothic', size: 8 };
  const listHeaderFont = { name: 'BIZ UDPGothic', size: 8, bold: true };

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('職員一覧', {
    views: [{ state: 'frozen', xSplit: 2, ySplit: 5, showGridLines: false, style: 'normal', zoomScale: 100 }], // 氏名・年齢まで固定
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.1, footer: 0.1 } }
  });

  const columns = [
    { width: 16 }, // 氏名
    { width: 8 }, // 年齢
    { width: 16 }, // フリガナ
    { width: 12 }, // 職員番号
    { width: 6 }, // 性別
    { width: 14 }, // 生年月日
    { width: 12 }, // 最終学歴
    { width: 14 }, // 採用年月日
    { width: 16 }, // 特記事項
    { width: 20 }, // [今年度] 配置先
    { width: 12 }, // 職名
    { width: 16 }, // 級
    { width: 8 },  // 年数
    { width: 14 }, // 詳細
    { width: 12 }, // 備考
    { width: 12 }, // カウント除外
    { width: 20 }, // [来年度] 配置先
    { width: 12 }, // 職名
    { width: 16 }, // 級
    { width: 8 },  // 年数
    { width: 14 }, // 詳細
    { width: 12 }, // 備考
    { width: 12 }, // カウント除外
    { width: 8 },  // 採用
    { width: 12 }, // 係長級
    { width: 12 }, // 補佐I
    { width: 12 }, // 補佐II
    { width: 12 }, // 補佐III
    { width: 12 }, // 課長級
    { width: 12 }, // 所属長級
    { width: 12 }, // 次長級
    { width: 12 }, // 部長級
    { width: 8 },  // 来年度
  ];

  historyYears.forEach(() => {
    columns.push({ width: 12 });
  });

  ws.columns = columns;

  const currSummaryStr = generateGradeSummary(employees, false);
  const nextSummaryStr = generateGradeSummary(employees, true);

  const r1 = ws.getRow(1);
  r1.values = [`${targetYear}年度(R${targetYear - 2018})人事異動案 【${fileName.replace(/\.xlsx$/, '')}】`];
  r1.font = { name: 'BIZ UDPGothic', size: 8, bold: true };
    r1.height = 13;

  const r2 = ws.getRow(2);
  r2.getCell(1).value = `【全体集計（今年度 ${targetYear - 1}(R${targetYear - 2019})）】 ${currSummaryStr}`;
  r2.font = { name: 'BIZ UDPGothic', size: 8, bold: true, color: { argb: 'FF0369A1' } };
  r2.height = 13;

  const currYearIndex = Math.max(0, historyYears.indexOf(targetYear - 1));
  const legendEndCol = 34 + currYearIndex;
  const legendLabels = ["凡例", "係長級(主査)", "補佐級I(主任)", "補佐級II(班長)", "補佐級III(補佐兼班長)", "課長級", "所属長級", "次長級", "部長級"];
  const legendStartCol = legendEndCol - 8;

  for (let i = 0; i < legendLabels.length; i++) {
    const colNumber = legendStartCol + i;
    if (colNumber > 1) { 
      const cell = r2.getCell(colNumber);
      cell.value = legendLabels[i];
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = getCellBorders(true, true, true, true, true);
      if (i === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        cell.font = { name: 'BIZ UDPGothic', size: 8, bold: true, color: { argb: 'FF000000' } };
      } else {
        const colorHex = getPromotedBgColorCode(legendLabels[i])?.replace('#', '')?.toUpperCase() || 'FFFFFF';
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorHex } };
        cell.font = { name: 'BIZ UDPGothic', size: 8, bold: true, color: { argb: 'FF000000' } };
      }
    }
  }

  const r3 = ws.getRow(3);
  r3.values = [`【全体集計（来年度 ${targetYear}(R${targetYear - 2018})）】 ${nextSummaryStr}`];
  r3.font = { name: 'BIZ UDPGothic', size: 8, bold: true, color: { argb: 'FF0369A1' } };
  r3.height = 13;

  [1, 2, 3].forEach(rn => {
    ws.getRow(rn).getCell(1).alignment = { vertical: 'middle' };
  });

  const r4 = ws.getRow(4);
  r4.height = 13;
  const headersR4 = ['氏名', `${currentEraShort}年齢`, 'フリガナ', '基本情報', '', '', '', '', '', `今年度（現行）${getEraFormattedYear(targetYear - 1)}`, '', '', '', '', '', '', `来年度（新組織）${getEraFormattedYear(targetYear)}`, '', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', ''];
  historyYears.forEach((y, i) => {
    if (i === 0) headersR4.push('履歴');
    else headersR4.push('');
  });
  r4.values = headersR4;

  const r5 = ws.getRow(5);
  r5.height = 13;
  const headersR5 = ['', '', '', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '配置先', '職名', '級', '年数', '詳細', '備考', 'カウント除外', '配置先', '職名', '級', '年数', '詳細', '備考', 'カウント除外', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度'];
  historyYears.forEach(y => headersR5.push(getEraFormattedYear(y)));
  r5.values = headersR5;

  ws.mergeCells('A4:A5');
  ws.mergeCells('B4:B5');
  ws.mergeCells('C4:C5');
  ws.mergeCells('D4:I4');
  ws.mergeCells('J4:P4');
  ws.mergeCells('Q4:W4');
  ws.mergeCells('X4:AG4');
  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(33 + historyYears.length).letter;
    ws.mergeCells(`AH4:${endColCode}4`);
  }

  // Header coloring
  const fillSlate = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } };
  const fillAmber = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
  const fillBlue = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFDBFE' } };
  const fillFuchsia = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5D0FE' } };
  const fillEmerald = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA7F3D0' } };
  
  // Specific promo headers colors
  const promoColors = {
    25: getPromotedBgColorCode('係長級(主査)'),
    26: getPromotedBgColorCode('補佐級I(主任)'),
    27: getPromotedBgColorCode('補佐級II(班長)'),
    28: getPromotedBgColorCode('補佐級III(補佐兼班長)'),
    29: getPromotedBgColorCode('課長級'),
    30: getPromotedBgColorCode('所属長級'),
    31: getPromotedBgColorCode('次長級'),
    32: getPromotedBgColorCode('部長級'),
  };

  [4, 5].forEach(rn => {
    const row = ws.getRow(rn);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = listHeaderFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      if (colNumber >= 34) { // 履歴列
         cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };
      }
      cell.border = getCellBorders(true, true, true, true, true);
      
      if (colNumber <= 9) cell.fill = fillSlate;
      else if (colNumber <= 16) cell.fill = fillAmber;
      else if (colNumber <= 23) cell.fill = fillBlue;
      else if (colNumber <= 33) {
        if (rn === 5 && promoColors[colNumber]) {
           cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + promoColors[colNumber].replace('#', '').toUpperCase() } };
        } else {
           cell.fill = fillFuchsia;
        }
      }
      else cell.fill = fillEmerald;
    });
  });

  const dMap = new Map(departments.map(d => [d.id, d]));
  const sortedEmployees = [...employees].sort((a, b) => {
      const gradeA = getGradeLevel(a.currentGrade);
      const gradeB = getGradeLevel(b.currentGrade);
      if (gradeA !== gradeB) return gradeB - gradeA;
      const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
      const getYear = (emp) => {
          for (let i = pKeys.length - 1; i >= 0; i--) {
              const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(String(emp.hireDate).substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
              if (!isNaN(y)) return y;
          }
          return NaN;
      };
      const yA = getYear(a);
      const yB = getYear(b);
      if (!isNaN(yA) && !isNaN(yB)) return yA - yB;
      else if (!isNaN(yA)) return -1;
      else if (!isNaN(yB)) return 1;
      return 0;
  });

  let rowIndex = 6;
  sortedEmployees.forEach(emp => {
    const getDeptName = (deptId, postId, groupId, groupPostId, isNext) => {
      if (!deptId || deptId === 'unassigned' || deptId === 'retired') return '';
      const dept = dMap.get(deptId);
      if (!dept) return '';
      let str = isNext ? (dept.nextName || dept.name) : dept.name;
      if (postId) {
        const p = (dept.posts || []).find(p => p.id === postId);
        if (p) str += '（' + (isNext ? (p.nextName || p.name) : p.name) + '）';
      } else if (groupId) {
        const g = (dept.groups || []).find(g => g.id === groupId);
        if (g) {
          str += ' ' + (isNext ? (g.nextName || g.name) : g.name);
          if (groupPostId) {
            const gp = (g.posts || []).find(p => p.id === groupPostId);
            if (gp) str += '（' + (isNext ? (gp.nextName || gp.name) : gp.name) + '）';
          }
        }
      }
      return str;
    };

    const cDeptName = getDeptName(emp.currentDeptId, emp.currentPostId, emp.currentGroupId, emp.currentGroupPostId, false);
    const nDeptName = getDeptName(emp.departmentId, emp.postId, emp.groupId, emp.groupPostId, true);
    
    const isNextRetired = emp.departmentId === 'retired';
    const isNextPromoted = getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade);
    const valYears = formatServiceYearsText(getEmpCurrentYears(emp, targetYear, true));

    const vals = [
      emp.name || '',
      (() => {
        if (!emp.birthDate) return '';
        const a = calculateAge(emp.birthDate, targetYear - 1);
        return (a !== null && !isNaN(a)) ? a + '歳' : '';
      })(),
      emp.furigana || '',
      emp.employeeNumber || '',
      emp.gender || '',
      formatWithEra(emp.birthDate),
      emp.education || '',
      formatWithEra(emp.hireDate),
      emp.note || '',
      cDeptName,
      emp.currentTitle || '',
      emp.currentGrade || '',
      getEmpCurrentYears(emp, targetYear - 1, false),
      (emp.currentSkills || []).join('、'),
      emp.currentEmploymentType || '',
      emp.currentExclude || '',
      nDeptName,
      isNextRetired ? '' : (emp.nextTitle || ''),
      isNextRetired ? '' : (emp.nextGrade || ''),
      isNextRetired ? '' : valYears,
      isNextRetired ? '' : (emp.nextSkills || []).join('、'),
      isNextRetired ? '' : (emp.nextEmploymentType || ''),
      isNextRetired ? '' : (emp.nextExclude || '')
    ];

    // 昇級年度の計算 (hireDate, then keys)
    const hireYear = emp.hireDate ? String(emp.hireDate).substring(0,4) : '';
    let hireStr = hireYear;
    if (emp.hireDate) {
      hireStr = formatDateForDisplay(emp.hireDate);
    }
    vals.push(hireStr);

    const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
    const gradeList = ['', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級'];
    
    for (let idx = 1; idx < pKeys.length; idx++) {
      const key = pKeys[idx];
      let cellVal = emp[key] || '';
      let isNextPromo = false;
      if (getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade) && gradeToPromoKey[emp.nextGrade] === key) {
         isNextPromo = true;
         cellVal = `${targetYear}-04-01`;
      }
      
      let prevDate = '';
      for (let i = idx - 1; i >= 0; i--) {
        let pVal = pKeys[i] === 'hireDate' ? emp.hireDate : (emp[pKeys[i]] || '');
        if (getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade) && gradeToPromoKey[emp.nextGrade] === pKeys[i]) {
            pVal = `${targetYear}-04-01`;
        }
        if (pVal) { prevDate = pVal; break; }
      }
      
      const diff = (prevDate && cellVal) ? calculateServiceYears(prevDate, cellVal) : null;
      
      let cellStr = '';
      if (diff !== null) cellStr += `${formatServiceYearsText(diff)}> `;
      else cellStr += `> `;
      
      if (cellVal) {
        cellStr += formatDateForDisplayLocal(cellVal);
      }
      vals.push(cellStr);
    }
    
    // 来年度差分
    let finalDiff = null;
    if (getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade)) {
      finalDiff = '1';
    } else {
      let prevDate = '';
      for (let i = pKeys.length - 1; i >= 0; i--) {
        const val = pKeys[i] === 'hireDate' ? emp.hireDate : (emp[pKeys[i]] || '');
        if (val) { prevDate = val; break; }
      }
      finalDiff = prevDate ? calculateServiceYears(prevDate, targetYear) : null;
    }
    vals.push(`> ${finalDiff !== null ? formatServiceYearsText(finalDiff) : ''}`);

    // 履歴
    const promoYearMap = {};
    if (emp.promoYearChief) promoYearMap[parseInt(String(emp.promoYearChief).split('-')[0])] = "係長級(主査)";
    if (emp.promoYearAssistant1) promoYearMap[parseInt(String(emp.promoYearAssistant1).split('-')[0])] = "補佐級I(主任)";
    if (emp.promoYearAssistant2) promoYearMap[parseInt(String(emp.promoYearAssistant2).split('-')[0])] = "補佐級II(班長)";
    if (emp.promoYearAssistant3) promoYearMap[parseInt(String(emp.promoYearAssistant3).split('-')[0])] = "補佐級III(補佐兼班長)";
    if (emp.promoYearSecHead) promoYearMap[parseInt(String(emp.promoYearSecHead).split('-')[0])] = "課長級";
    if (emp.promoYearDivHead) promoYearMap[parseInt(String(emp.promoYearDivHead).split('-')[0])] = "所属長級";
    if (emp.promoYearDeputyHead) promoYearMap[parseInt(String(emp.promoYearDeputyHead).split('-')[0])] = "次長級";
    if (emp.promoYearDeptHead) promoYearMap[parseInt(String(emp.promoYearDeptHead).split('-')[0])] = "部長級";

    const histBgColors = [];
    const histIsChange = [];
    
    const hStrs = historyYears.map(year => {
      if (year === targetYear) {
        return nDeptName;
      } else {
        const hist = (emp.history || []).find(h => h.year === year);
        return hist ? hist.department : '';
      }
    });

    historyYears.forEach((year, i) => {
      const hStr = hStrs[i];
      let isChange = false;
      if (hStr !== '' && hStr !== '-') {
         const prevHStr = i > 0 ? hStrs[i-1] : '-';
         if (hStr !== (prevHStr || '-')) {
            isChange = true;
         }
      }
      
      let displayStr = hStr;
      if (hStr && hStr !== ' / 課直轄' && hStr !== '未配置' && hStr !== '-') {
        const histAge = (emp.birthDate && !isNaN(year)) ? calculateAge(emp.birthDate, year) : null;
        if (histAge !== null && !isNaN(histAge)) {
          displayStr = `${hStr} (${histAge}歳)`;
        }
      }
      vals.push(displayStr);
      histBgColors.push(promoYearMap[year] ? getPromotedBgColorCode(promoYearMap[year]) : null);
      histIsChange.push(isChange);
    });

    const row = ws.getRow(rowIndex);
    row.height = 13;
    row.values = vals;
    
    const nextPromoColor = isNextPromoted ? getPromotedBgColorCode(emp.nextGrade) : null;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = listDefaultFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };
      cell.border = getCellBorders(true, true, true, true, true);
      
      let argb = 'FFFFFFFF'; 
      if (colNumber <= 2) {
         argb = 'FFE2E8F0';
         if (nextPromoColor) argb = 'FF' + nextPromoColor.replace('#', '').toUpperCase();
      }
      else if (colNumber <= 16) argb = 'FFF8FAFC';
      else if (colNumber <= 23) {
         argb = 'FFEFF6FF';
         if (nextPromoColor) argb = 'FF' + nextPromoColor.replace('#', '').toUpperCase();
      }
      else if (colNumber <= 33) {
         argb = 'FFFDF4FF';
         if (colNumber === 33 && nextPromoColor) {
             argb = 'FF' + nextPromoColor.replace('#', '').toUpperCase();
         }
      }
      else {
         argb = 'FFECFDF5';
         if (colNumber === 33 + historyYears.length && nextPromoColor) {
             argb = 'FF' + nextPromoColor.replace('#', '').toUpperCase();
         }
      }
      
      // 昇進ハイライト (昇級年度の枠)
      if (colNumber >= 25 && colNumber <= 32) {
         const pKeysOffset = colNumber - 24;
         const key = pKeys[pKeysOffset];
         if (getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade) && gradeToPromoKey[emp.nextGrade] === key) {
             const pc = getPromotedBgColorCode(emp.nextGrade);
             if (pc) argb = 'FF' + pc.replace('#', '').toUpperCase();
         }
      }

      // 履歴セルの着色と変更検知
      if (colNumber > 33) {
         const hcOffset = colNumber - 34;
         const hc = histBgColors[hcOffset];
         if (hc) {
            argb = 'FF' + hc.replace('#', '').toUpperCase();
         }
         if (histIsChange[hcOffset]) {
            cell.font = { ...listDefaultFont, bold: true, italic: true };
         }
      }

      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
    });

    rowIndex++;
  });

  const lastColLetter = ws.getColumn(34 + historyYears.length).letter;
  ws.autoFilter = `A5:${lastColLetter}${rowIndex - 1}`;

  ws.columns.forEach((col, i) => {
    const isHistory = i >= 33;
    let maxLength = 0;
    col.eachCell({ includeEmpty: true }, cell => {
      if (cell.row <= 4) return; 
      const v = cell.value ? cell.value.toString() : '';
      if (v) {
        const lines = v.split('\n');
        for (let l of lines) {
           let lw = 0;
           for(let c of l) {
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
       let padding = 1.5;
       if (i === 4 || i === 6 || (i >= 22 && i <= 30)) {
           padding = 4.0;
       } else if (i === 12 || i === 19) { // 詳細列
           padding = 5.0;
       }
       if (isHistory) padding = 0.5;
       col.width = maxLength + padding;
    }
  });

  await saveWorkbook(workbook, fileName);
};
