import { getGradeLevel, getEraFormattedYear, calculateAge, getPromotedBgColorCode, traverseOrgTree, getCounts, formatCountText, generateGradeSummary, isPromotedGrade, getEmpCurrentYears, calculateServiceYears, formatPromoDateWithEra, getEraSuffix, getEraSuffixForDate, formatServiceYearsText, formatDateForDisplay, getFormattedNameForPlan, shouldOmitEmployeeNumber, sortEmployeeList } from '../helpers.js';
import { GRADE_LEVELS, GRADE_OPTIONS } from '../../constants/config.js';
import { defaultFont, headerFont, borderStyle, thickBorderStyle, grayBorderStyle, grayThickBorderStyle, getCellBorders, getBirthFiscalYear, getHireFiscalYearShort, getEraYearOnly } from './excelHelpers.js';

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

  const targetYearIndex = Math.max(0, historyYears.indexOf(targetYear));
  const legendEndCol = 33 + targetYearIndex;
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
  const sortedEmployees = sortEmployeeList(employees, targetYear);

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
        return (a !== null && !isNaN(a) && a !== '') ? Number(a) : '';
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
      else if (colNumber <= 35) {
         argb = 'FFFDF4FF';
         if (colNumber === 35 && nextPromoColor) {
             argb = 'FF' + nextPromoColor.replace('#', '').toUpperCase();
         }
      }
      else {
         argb = 'FFECFDF5';
      }
      
      // 昇進ハイライト (昇級年度の枠)
      if (colNumber >= 27 && colNumber <= 34) {
         const pKeysOffset = colNumber - 26;
         const key = pKeys[pKeysOffset];
         if (getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade) && gradeToPromoKey[emp.nextGrade] === key) {
             const pc = getPromotedBgColorCode(emp.nextGrade);
             if (pc) argb = 'FF' + pc.replace('#', '').toUpperCase();
         }
      }

      // 履歴セルの着色と変更検知
      if (colNumber > 35) {
         const hcOffset = colNumber - 36;
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
