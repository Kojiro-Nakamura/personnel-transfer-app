import ExcelJS from 'exceljs';
import { getGradeLevel, getEraFormattedYear, calculateAge, getPromotedBgColorCode, traverseOrgTree, getCounts, formatCountText, generateGradeSummary, isPromotedGrade, getEmpCurrentYears, calculateServiceYears, formatPromoDateWithEra, getEraSuffix, getEraSuffixForDate, formatServiceYearsText, formatDateForDisplay, getFormattedNameForPlan, shouldOmitEmployeeNumber } from './helpers.js';
import { addReasonSheet } from './exportReasonSheet.js';
import { GRADE_LEVELS, GRADE_OPTIONS } from '../constants/config.js';

// 基本のフォント設定
const defaultFont = { name: 'BIZ UDPゴシック', size: 8 };
const headerFont = { name: 'BIZ UDPゴシック', size: 8, bold: true };
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

export const saveWorkbook = async (workbook, fileName) => {
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
    views: [{ state: 'frozen', xSplit: 3, ySplit: 5, showGridLines: false }],
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


  ws.getRow(3).getCell(14).value = '＜参考＞';
  ws.getRow(3).getCell(14).font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };

  const currYearIndex = Math.max(0, historyYears.indexOf(targetYear - 1));
  const legendEndCol = 31 + currYearIndex;
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
  const r4Vals = ['部署名', '〇配属希望', '●特殊事情', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', '', ''];
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
      if (extEmp.hireDate) hireStr = formatDateForDisplay(extEmp.hireDate);
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
export const exportPlanToExcel = async (fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {
  const workbook = new ExcelJS.Workbook();
  addPlanSheet(workbook, '人事異動案', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);
  addSimplePlanSheet(workbook, '人事異動案（シンプル）', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);
  addListSheet(workbook, '職員一覧', fileName, targetYear, employees, departments);
    addBirthYearSheet(workbook, '生年別一覧（今年度）', targetYear, employees, departments, false);
    addBirthYearSheet(workbook, '生年別一覧（来年度）', targetYear, employees, departments, true);
  await saveWorkbook(workbook, fileName);
};

// --- 職員一覧（Excel）出力 ---
export const addListSheet = (workbook, sheetName, fileName, targetYear, employees, departments) => {
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
    return `${str}(${era})`;
  };
  
  const formatWithEra = (dateStr, birthDateStr = null) => {
    if (!dateStr) return '';
    let cleanStr = String(dateStr);
    if (cleanStr.endsWith('-04-01')) {
      cleanStr = cleanStr.substring(0, 4);
    }
    const match = String(dateStr).match(/^(\d{4})[-/]/);
    if (match) {
      const year = parseInt(match[1], 10);
      let era = '';
      if (year >= 2019) era = `(R${year - 2018})`;
      else if (year >= 1989) era = `(H${year - 1988})`;
      else if (year >= 1926) era = `(S${year - 1925})`;
      else if (year >= 1912) era = `(T${year - 1911})`;
      
      let result = era ? `${cleanStr}${era}` : cleanStr;
      if (birthDateStr) {
         const ag = calculateAge(birthDateStr, year);
         if (ag) result += `(${ag}歳)`;
      }
      return result;
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

  const listDefaultFont = { name: 'BIZ UDPゴシック', size: 8 };
  const listHeaderFont = { name: 'BIZ UDPゴシック', size: 8, bold: true };

  const ws = workbook.addWorksheet(sheetName, {
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
  r1.font = { name: 'BIZ UDPゴシック', size: 8, bold: true };
    r1.height = 13;

  const r2 = ws.getRow(2);
  r2.getCell(1).value = `【全体集計（今年度 ${targetYear - 1}(R${targetYear - 2019})）】 ${currSummaryStr}`;
  r2.font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF0369A1' } };
  r2.height = 13;

  const currYearIndex = Math.max(0, historyYears.indexOf(targetYear - 1));
  const legendEndCol = 36 + currYearIndex;
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
        cell.font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };
      } else {
        const colorHex = getPromotedBgColorCode(legendLabels[i])?.replace('#', '')?.toUpperCase() || 'FFFFFF';
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorHex } };
        cell.font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };
      }
    }
  }

  const r3 = ws.getRow(3);
  r3.values = [`【全体集計（来年度 ${targetYear}(R${targetYear - 2018})）】 ${nextSummaryStr}`];
  r3.font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF0369A1' } };
  r3.height = 13;

  [1, 2, 3].forEach(rn => {
    ws.getRow(rn).getCell(1).alignment = { vertical: 'middle' };
  });

  const r4 = ws.getRow(4);
  r4.height = 13;
  const headersR4 = ['氏名', `${currentEraShort}年齢`, 'フリガナ', '基本情報', '', '', '', '', '', '', '', `今年度（現行）${getEraFormattedYear(targetYear - 1)}`, '', '', '', '', '', '', `来年度（新組織）${getEraFormattedYear(targetYear)}`, '', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', ''];
  historyYears.forEach((y, i) => {
    if (i === 0) headersR4.push('履歴');
    else headersR4.push('');
  });
  r4.values = headersR4;

  const r5 = ws.getRow(5);
  r5.height = 13;
  const headersR5 = ['', '', '', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '〇配属希望', '●特殊事情', '配置先', '職名', '級', '年数', '詳細', '備考', 'カウント除外', '配置先', '職名', '級', '年数', '詳細', '備考', 'カウント除外', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度'];
  historyYears.forEach(y => headersR5.push(getEraFormattedYear(y)));
  r5.values = headersR5;

  ws.mergeCells('A4:A5');
  ws.mergeCells('B4:B5');
  ws.mergeCells('C4:C5');
  ws.mergeCells('D4:K4');
  ws.mergeCells('L4:R4');
  ws.mergeCells('S4:Y4');
  ws.mergeCells('Z4:AI4');
  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(35 + historyYears.length).letter;
    ws.mergeCells(`AJ4:${endColCode}4`);
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
      
      if (colNumber <= 11) cell.fill = fillSlate;
      else if (colNumber <= 18) cell.fill = fillAmber;
      else if (colNumber <= 25) cell.fill = fillBlue;
      else if (colNumber <= 35) {
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
    const valYears = getEmpCurrentYears(emp, targetYear, true);

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
      formatWithEra(emp.hireDate, emp.birthDate),
      emp.note || '',
      emp.desiredAssignment ? '〇' + emp.desiredAssignment : '',
      emp.specialCircumstances ? '●' + emp.specialCircumstances : '',
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
    let hireStr = '';
    if (emp.hireDate) {
      hireStr = formatDateForDisplay(emp.hireDate);
      const y = parseInt(String(emp.hireDate).split('-')[0], 10);
      if (emp.birthDate && !isNaN(y)) {
         const ag = calculateAge(emp.birthDate, y);
         if (ag) hireStr += `(${ag}歳)`;
      }
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
      
      const diff = (prevDate && cellVal) ? calculateServiceYears(prevDate, cellVal, true) : null;
      
      let cellStr = '';
      if (diff !== null) cellStr += `${formatServiceYearsText(diff)}> `;
      else cellStr += `> `;
      
      if (cellVal) {
        cellStr += formatDateForDisplayLocal(cellVal);
        const y = parseInt(String(cellVal).split('-')[0], 10);
        if (emp.birthDate && !isNaN(y)) {
           const ag = calculateAge(emp.birthDate, y);
           if (ag) cellStr += `(${ag}歳)`;
        }
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
      finalDiff = prevDate ? calculateServiceYears(prevDate, targetYear, true) : null;
    }
    let nYearStr = `> ${finalDiff !== null ? formatServiceYearsText(finalDiff) : ''}`;
    if (finalDiff !== null && emp.birthDate) {
      const ag = calculateAge(emp.birthDate, targetYear);
      if (ag) nYearStr += `(${ag}歳)`;
    }
    vals.push(nYearStr);

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
      let currentFont = listDefaultFont;
      if (typeof cell.value === 'string') {
        const match = cell.value.match(/\d{4}-\d{2}-\d{2}/);
        if (match && !cell.value.includes('-04-01')) {
          currentFont = { ...listDefaultFont, color: { argb: 'FFE11D48' } };
        }
      }
      cell.font = currentFont;
      const isNoShrink = (colNumber >= 9 && colNumber <= 11);
      const align = isNoShrink ? 'left' : 'center';
      cell.alignment = { vertical: 'middle', horizontal: align, shrinkToFit: !isNoShrink, wrapText: false };
      cell.border = getCellBorders(true, true, true, true, true);
      
      if (colNumber === 4 && cell.value && cell.value.toString().trim() !== '') {
        const num = Number(cell.value);
        if (!isNaN(num)) {
          cell.value = num;
          cell.numFmt = '[$-411]000000';
        }
      }

      let argb = 'FFFFFFFF'; 
      if (colNumber <= 2) {
         argb = 'FFE2E8F0';
         if (nextPromoColor) argb = 'FF' + nextPromoColor.replace('#', '').toUpperCase();
      }
      else if (colNumber <= 18) argb = 'FFF8FAFC';
      else if (colNumber <= 25) {
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

  const lastColLetter = ws.getColumn(36 + historyYears.length).letter;
  ws.autoFilter = `A5:${lastColLetter}${rowIndex - 1}`;

  ws.columns.forEach((col, i) => {
    const isHistory = i >= 35;
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
       if (i === 4 || i === 6 || (i >= 24 && i <= 32)) {
           padding = 4.0;
       } else if (i === 12 || i === 19) { // 詳細列
           padding = 5.0;
       }
       if (isHistory) padding = 0.5;
       col.width = maxLength + padding;
    }
  });
};

export const exportListToExcel = async (fileName, targetYear, employees, departments) => {
    const workbook = new ExcelJS.Workbook();
    addListSheet(workbook, '職員一覧', fileName, targetYear, employees, departments);
    addBirthYearSheet(workbook, '生年別一覧（今年度）', targetYear, employees, departments, false);
    addBirthYearSheet(workbook, '生年別一覧（来年度）', targetYear, employees, departments, true);
  await saveWorkbook(workbook, fileName);
};

export const exportUnifiedExcel = async (fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, showCount = true) => {
  const workbook = new ExcelJS.Workbook();
  
  // 1. 指定職人事異動 (filterLevel = 9)
  addPlanSheet(workbook, '指定職人事異動', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, 9, showCount);
  
  // 2. 異動案リスト (filterLevel = 0)
  addPlanSheet(workbook, '異動案リスト', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, 0, showCount);
  
  // 3. 増減理由
  addReasonSheet(workbook, '増減理由', targetYear, departments, deptMap, currMap, nextMap, employees, notes);
  
  // 4. つなぎ表 (職員一覧)
  addListSheet(workbook, 'つなぎ表', fileName, targetYear, employees, departments);
    addBirthYearSheet(workbook, '生年別一覧（今年度）', targetYear, employees, departments, false);
    addBirthYearSheet(workbook, '生年別一覧（来年度）', targetYear, employees, departments, true);
  
  await saveWorkbook(workbook, fileName);
};
