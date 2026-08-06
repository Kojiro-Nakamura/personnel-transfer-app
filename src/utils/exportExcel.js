import ExcelJS from 'exceljs';
import { getGradeLevel, getEraFormattedYear, calculateAge, getPromotedBgColorCode, traverseOrgTree, getCounts, formatCountText, generateGradeSummary, isPromotedGrade } from './helpers.js';
import { GRADE_LEVELS, GRADE_OPTIONS } from '../constants/config.js';

// 基本のフォント設定
const defaultFont = { name: 'BIZ UDPGothic', size: 10 };
const headerFont = { name: 'BIZ UDPGothic', size: 10, bold: true };
const borderStyle = { style: 'thin', color: { argb: 'FF94A3B8' } };
const thickBorderStyle = { style: 'medium', color: { argb: 'FF475569' } };

const getCellBorders = (top = false, bottom = false, left = false, right = false) => {
  const b = {};
  if (top) b.top = top === 'thick' ? thickBorderStyle : borderStyle;
  if (bottom) b.bottom = bottom === 'thick' ? thickBorderStyle : borderStyle;
  if (left) b.left = left === 'thick' ? thickBorderStyle : borderStyle;
  if (right) b.right = right === 'thick' ? thickBorderStyle : borderStyle;
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
export const exportPlanToExcel = async (fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel) => {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('人事異動案', {
    views: [{ state: 'frozen', xSplit: 3, ySplit: 5 }],
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.1, footer: 0.1 } }
  });

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
    { width: 25 }  // メモ
  ];

  const currSummaryStr = generateGradeSummary(employees, false);
  const nextSummaryStr = generateGradeSummary(employees, true);

  const r1 = ws.getRow(1);
  r1.values = [`${targetYear}年度(R${targetYear - 2018})人事異動案 【${fileName.replace(/\.xlsx$/, '')}】`];
  r1.font = { name: 'BIZ UDPGothic', size: 14, bold: true };
  r1.height = 24;

  const r2 = ws.getRow(2);
  r2.values = [`【全体集計（今年度 ${targetYear - 1}(R${targetYear - 2019})）】 ${currSummaryStr}`];
  r2.font = { name: 'BIZ UDPGothic', size: 10, bold: true, color: { argb: 'FF0369A1' } };
  r2.height = 18;

  const r3 = ws.getRow(3);
  r3.values = [`【全体集計（来年度 ${targetYear}(R${targetYear - 2018})）】 ${nextSummaryStr}`];
  r3.font = { name: 'BIZ UDPGothic', size: 10, bold: true, color: { argb: 'FF0369A1' } };
  r3.height = 18;

  const r4 = ws.getRow(4);
  r4.values = ['部署名', '班・グループ', 'ポスト', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', '', '', 'メモ'];
  r4.height = 20;

  const r5 = ws.getRow(5);
  r5.values = ['', '', '', '職名', '氏名', '級', '年齢', '在籍', '備考', '職名', '氏名', '級', '年齢', '在籍', '備考', ''];
  r5.height = 20;

  ws.mergeCells('A4:A5');
  ws.mergeCells('B4:B5');
  ws.mergeCells('C4:C5');
  ws.mergeCells('D4:I4');
  ws.mergeCells('J4:O4');
  ws.mergeCells('P4:P5');

  ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P'].forEach((col, i) => {
    [4, 5].forEach(rn => {
      const cell = ws.getCell(`${col}${rn}`);
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      let argb = 'FFCBD5E1'; 
      if (i >= 9 && i <= 14) argb = 'FFBFDBFE'; 
      if (i === 15) argb = 'FFF0F0F0';
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
      const isLeftEdge = col === 'A' || col === 'D' || col === 'J' || col === 'P';
      cell.border = getCellBorders(rn === 4, rn === 5, isLeftEdge ? 'thick' : true, true);
    });
  });

  const getYearsStr = (emp, isNext) => { 
    if (!emp) return ''; 
    const years = isNext ? emp.nextYears : emp.currentYears;
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

  traverseOrgTree(departments, deptMap, currMap, nextMap, 0, (dept, group, postName, currEmp, nextEmp, rowType, i, post) => {
    const deptName = dept.nextName && dept.nextName !== dept.name ? `${dept.name} / ${dept.nextName}` : dept.name;
    const groupName = group ? (group.nextName && group.nextName !== group.name ? `${group.name} / ${group.nextName}` : group.name) : '';
    let formattedPostName = postName;
    if (post && post.nextName && post.nextName !== post.name) {
      formattedPostName = `${post.name} / ${post.nextName}`;
    }

    const isNewDept = deptName !== lastDept;
    const isNewGroup = isNewDept || groupName !== lastGroup;
    const displayPost = (isNewGroup || formattedPostName !== lastPost) ? formattedPostName : '';
    
    lastDept = deptName; lastGroup = groupName; lastPost = formattedPostName;

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
        displayDeptStr = `${deptName}\n（今:${formatCountText(cCounts)} / 来:${formatCountText(nCounts)}）`;
      } else {
        displayDeptStr = deptName;
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
        displayGroupStr = `${groupName}\n（今:${formatCountText(gCCounts)} / 来:${formatCountText(gNCounts)}）`;
      } else {
        displayGroupStr = groupName;
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
       if (dNote && dNote.text) displayDeptStr += `\n[メモ] ${dNote.text}`;
    }
    if (isNewGroup && group && group.id) {
       const gNote = notes.find(n => n.targetId === `groupHeader-${dept.id}-${group.id}`);
       if (gNote && gNote.text) displayGroupStr += `\n[メモ] ${gNote.text}`;
    }

    const row = ws.getRow(rowIndex);
    row.values = [
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

    const isPostCell = formattedPostName !== '' && formattedPostName !== '班員';
    const isDeptPost = isPostCell && groupName === ''; 
    const isGroupPost = isPostCell && groupName !== '';
    const isDeptLevelHighlight = (isNewDept || isDeptPost);
    const isGroupLevelHighlight = (isDeptLevelHighlight || isNewGroup || isGroupPost);
    const isPostLevelHighlight = (isGroupLevelHighlight || isPostCell);

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = defaultFont;
      cell.alignment = { vertical: 'middle', wrapText: true };
      
      if (colNumber >= 4 && colNumber <= 15 && colNumber !== 5 && colNumber !== 11) {
        cell.alignment = { ...cell.alignment, horizontal: 'center' };
      }
      
      const isLeftEdge = colNumber === 1 || colNumber === 4 || colNumber === 10 || colNumber === 16;
      let topBorder = true;
      if (isNewDept) topBorder = 'thick';
      else if (isNewGroup) topBorder = true;
      else if (colNumber <= 3 && !isPostLevelHighlight) topBorder = false; 

      cell.border = getCellBorders(topBorder, false, isLeftEdge ? 'thick' : true, true);

      let argb = 'FFFFFFFF'; 
      if (colNumber === 1 && isDeptLevelHighlight) argb = 'FFE0F2FE'; 
      else if (colNumber === 2 && isGroupLevelHighlight) argb = 'FFE0F2FE';
      else if (colNumber === 3 && isPostLevelHighlight) argb = 'FFE0F2FE';
      else if (colNumber >= 4 && colNumber <= 9 && isPostLevelHighlight) argb = 'FFE0F2FE';
      else if (colNumber >= 10 && colNumber <= 15 && isPostLevelHighlight) argb = 'FFE0F2FE';
      
      if (nextEmp && isPromotedGrade(nextEmp.currentGrade, nextEmp.nextGrade)) {
        const promoColor = getPromotedBgColorCode(nextEmp.nextGrade); 
        if (promoColor && (colNumber === 11 || colNumber === 12)) {
          argb = 'FF' + promoColor.replace('#', '').toUpperCase();
        }
      }
      
      if (colNumber === 16 && noteStr) cell.font = { ...defaultFont, color: { argb: 'FF0369A1' } };
      if (argb !== 'FFFFFFFF') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
      }
    });

    rowIndex++;
  });

  if (rowIndex > 6) {
    const lastRow = ws.getRow(rowIndex - 1);
    lastRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = { ...cell.border, bottom: thickBorderStyle };
    });
  }

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
  
  const formatWithEra = (dateStr) => {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})[-/]/);
    if (match) {
      const year = parseInt(match[1], 10);
      let era = '';
      if (year >= 2019) era = `(R${year - 2018})`;
      else if (year >= 1989) era = `(H${year - 1988})`;
      else if (year >= 1926) era = `(S${year - 1925})`;
      else if (year >= 1912) era = `(T${year - 1911})`;
      return era ? `${era}${dateStr}` : dateStr;
    }
    return dateStr;
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
    views: [{ state: 'frozen', xSplit: 2, ySplit: 5 }], // 氏名・年齢まで固定
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.1, footer: 0.1 } }
  });

  const columns = [
    { width: 16 }, // 氏名
    { width: 8 }, // 年齢
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
  r1.height = 24;

  const r2 = ws.getRow(2);
  r2.values = [`【全体集計（今年度 ${targetYear - 1}(R${targetYear - 2019})）】 ${currSummaryStr}`];
  r2.font = { name: 'BIZ UDPGothic', size: 8, bold: true, color: { argb: 'FF0369A1' } };
  r2.height = 18;

  const r3 = ws.getRow(3);
  r3.values = [`【全体集計（来年度 ${targetYear}(R${targetYear - 2018})）】 ${nextSummaryStr}`];
  r3.font = { name: 'BIZ UDPGothic', size: 8, bold: true, color: { argb: 'FF0369A1' } };
  r3.height = 18;

  [1, 2, 3].forEach(rn => {
    ws.getRow(rn).getCell(1).alignment = { vertical: 'middle' };
  });

  const r4 = ws.getRow(4);
  r4.height = 20;
  const headersR4 = ['', '', '基本情報', '', '', '', '', '', `今年度（現行）${getEraFormattedYear(targetYear - 1)}`, '', '', '', '', '', '', `来年度（新組織）${getEraFormattedYear(targetYear)}`, '', '', '', '', '', '', '昇進年度', '', '', '', '', '', '', '', '', ''];
  historyYears.forEach((y, i) => {
    if (i === 0) headersR4.push('履歴');
    else headersR4.push('');
  });
  r4.values = headersR4;

  const r5 = ws.getRow(5);
  r5.height = 30;
  const headersR5 = ['氏名', `${currentEraShort}年齢`, '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '配置先', '職名', '級', '年数', '詳細', '備考', 'カウント除外', '配置先', '職名', '級', '年数', '詳細', '備考', 'カウント除外', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III', '課長級', '所属長級', '次長級', '部長級', `来年度\n${getEraFormattedYear(targetYear)}`];
  historyYears.forEach(y => headersR5.push(getEraFormattedYear(y)));
  r5.values = headersR5;

  ws.mergeCells('C4:H4');
  ws.mergeCells('I4:O4');
  ws.mergeCells('P4:V4');
  ws.mergeCells('W4:AF4');
  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(32 + historyYears.length).letter;
    ws.mergeCells(`AG4:${endColCode}4`);
  }

  // Header coloring
  const fillSlate = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } };
  const fillBlue = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFDBFE' } };
  const fillFuchsia = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5D0FE' } };
  const fillEmerald = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA7F3D0' } };
  
  // Specific promo headers colors
  const promoColors = {
    24: getPromotedBgColorCode('係長級(主査)'),
    25: getPromotedBgColorCode('補佐級I(主任)'),
    26: getPromotedBgColorCode('補佐級II(班長)'),
    27: getPromotedBgColorCode('補佐級III(補佐兼班長)'),
    28: getPromotedBgColorCode('課長級'),
    29: getPromotedBgColorCode('所属長級'),
    30: getPromotedBgColorCode('次長級'),
    31: getPromotedBgColorCode('部長級'),
  };

  [4, 5].forEach(rn => {
    const row = ws.getRow(rn);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = listHeaderFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = getCellBorders(true, true, true, true);
      
      if (colNumber <= 15) cell.fill = fillSlate;
      else if (colNumber <= 22) cell.fill = fillBlue;
      else if (colNumber <= 32) {
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
              const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
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
    const valYears = isNextPromoted ? 1 : (emp.nextYears || '');

    const vals = [
      emp.name || '',
      emp.birthDate ? calculateAge(emp.birthDate, targetYear - 1) : '',
      emp.employeeNumber || '',
      emp.gender || '',
      formatWithEra(emp.birthDate),
      emp.education || '',
      formatWithEra(emp.hireDate),
      emp.note || '',
      cDeptName,
      emp.currentTitle || '',
      emp.currentGrade || '',
      emp.currentYears || '',
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

    // 昇進年度の計算 (hireDate, then keys)
    const hireYear = emp.hireDate ? emp.hireDate.substring(0,4) : '';
    let hireStr = hireYear;
    if (hireYear) {
      const suffix = getEraSuffixLocal(hireYear);
      if (suffix) hireStr += `(${suffix})`;
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
         cellVal = String(targetYear);
      }
      
      let prevY = NaN;
      for (let i = idx - 1; i >= 0; i--) {
        let pVal = pKeys[i] === 'hireDate' ? (emp.hireDate ? emp.hireDate.substring(0,4) : '') : (emp[pKeys[i]] || '');
        if (getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade) && gradeToPromoKey[emp.nextGrade] === pKeys[i]) {
            pVal = String(targetYear);
        }
        const y = parseInt(pVal || 'NaN');
        if (!isNaN(y)) { prevY = y; break; }
      }
      
      const currentY = parseInt(cellVal || 'NaN');
      const diff = (!isNaN(prevY) && !isNaN(currentY) && currentY >= prevY) ? currentY - prevY : null;
      
      let cellStr = '';
      if (diff !== null) cellStr += `${diff + 1}年目> `;
      else cellStr += `> `;
      
      cellStr += cellVal;
      if (cellVal) {
        const suffix = getEraSuffixLocal(cellVal);
        if (suffix) cellStr += `(${suffix})`;
      }
      vals.push(cellStr);
    }
    
    // 来年度差分
    let finalDiff = null;
    if (getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade)) {
      finalDiff = 1;
    } else {
      let prevY = NaN;
      for (let i = pKeys.length - 1; i >= 0; i--) {
        const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
        if (!isNaN(y)) { prevY = y; break; }
      }
      finalDiff = (!isNaN(prevY)) ? targetYear - prevY + 1 : null;
    }
    vals.push(`> ${finalDiff !== null ? (finalDiff >= 0 ? finalDiff : 0) + '年目' : ''}`);

    // 履歴
    const promoYearMap = {};
    if (emp.promoYearChief) promoYearMap[emp.promoYearChief] = "係長級(主査)";
    if (emp.promoYearAssistant1) promoYearMap[emp.promoYearAssistant1] = "補佐級I(主任)";
    if (emp.promoYearAssistant2) promoYearMap[emp.promoYearAssistant2] = "補佐級II(班長)";
    if (emp.promoYearAssistant3) promoYearMap[emp.promoYearAssistant3] = "補佐級III(補佐兼班長)";
    if (emp.promoYearSecHead) promoYearMap[emp.promoYearSecHead] = "課長級";
    if (emp.promoYearDivHead) promoYearMap[emp.promoYearDivHead] = "所属長級";
    if (emp.promoYearDeputyHead) promoYearMap[emp.promoYearDeputyHead] = "次長級";
    if (emp.promoYearDeptHead) promoYearMap[emp.promoYearDeptHead] = "部長級";

    const histBorderColors = [];
    historyYears.forEach(year => {
      let hStr = '';
      if (year === targetYear) {
        hStr = nDeptName;
      } else {
        const hist = (emp.history || []).find(h => h.year === year);
        hStr = hist ? hist.department : '';
      }
      vals.push(hStr);
      histBorderColors.push(promoYearMap[year] ? getBorderHexColor(promoYearMap[year]) : null);
    });

    const row = ws.getRow(rowIndex);
    row.values = vals;
    
    const nextPromoColor = isNextPromoted ? getPromotedBgColorCode(emp.nextGrade) : null;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = listDefaultFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = getCellBorders(true, true, true, true);
      
      let argb = 'FFFFFFFF'; 
      if (colNumber <= 2) {
         argb = 'FFE2E8F0';
         if (nextPromoColor) argb = 'FF' + nextPromoColor.replace('#', '').toUpperCase();
      }
      else if (colNumber <= 15) argb = 'FFF8FAFC';
      else if (colNumber <= 22) {
         argb = 'FFEFF6FF';
         if (nextPromoColor && (colNumber === 16 || colNumber === 17 || colNumber === 18)) argb = 'FF' + nextPromoColor.replace('#', '').toUpperCase();
      }
      else if (colNumber <= 32) argb = 'FFFDF4FF';
      else argb = 'FFECFDF5';
      
      // 昇進ハイライト (昇進年度の枠)
      if (colNumber >= 24 && colNumber <= 31) {
         const pKeysOffset = colNumber - 23;
         const key = pKeys[pKeysOffset];
         if (getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade) && gradeToPromoKey[emp.nextGrade] === key) {
             const pc = getPromotedBgColorCode(emp.nextGrade);
             if (pc) argb = 'FF' + pc.replace('#', '').toUpperCase();
         }
      }

      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };

      // 履歴セルの枠線色 (太枠)
      if (colNumber > 32) {
         const hc = histBorderColors[colNumber - 33];
         if (hc) {
            const hBorder = { style: 'medium', color: { argb: hc } };
            cell.border = { top: hBorder, bottom: hBorder, left: hBorder, right: hBorder };
         }
      }
    });

    rowIndex++;
  });

  const lastColLetter = ws.getColumn(32 + historyYears.length).letter;
  ws.autoFilter = `A5:${lastColLetter}${rowIndex - 1}`;

  await saveWorkbook(workbook, fileName);
};
