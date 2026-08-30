import os

with open('src/utils/exportExcel.js', 'r', encoding='utf8') as f:
    code = f.read()

search1 = "export const addSimplePlanSheet = (workbook, sheetName, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {\n  const ws = workbook.addWorksheet"
replace1 = """export const addSimplePlanSheet = (workbook, sheetName, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {
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
    const match = String(dateStr).match(/^(\\d{4})[-/]/);
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
      const match = String(dateStr).match(/^(\\d{4})[-/]/);
      if (match) {
         const year = parseInt(match[1], 10);
         const ageDiff = year - parseInt(String(birthDateStr).substring(0,4));
         res += '(' + ageDiff + '歳)';
      }
    }
    return res;
  };
  const formatDateForDisplay = formatPromoDateWithEra;

  const ws = workbook.addWorksheet"""

code = code.replace(search1, replace1)

search2 = """  const r4 = ws.getRow(4);
  r4.values = ['部署名', '配属希望', '特殊事情', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', ''];
  r4.height = 20;

  const r5 = ws.getRow(5);
  r5.values = ['', '', '', '職名', '氏名', '在籍', '年齢', '職名', '氏名', '在籍', '年齢', '備考'];
  r5.height = 20;

  ws.mergeCells('A4:A5');
  ws.mergeCells('B4:B5');
  ws.mergeCells('C4:C5');
  ws.mergeCells('D4:G4');
  ws.mergeCells('H4:L4');"""

replace2 = """
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
  const r4Vals = ['部署名', '配属希望', '特殊事情', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', '', ''];
  const currentEraShort = `R${targetYear - 2019}`;
  r4Vals.push('氏名', `${currentEraShort}年齢`, 'フリガナ', '基本情報', '', '', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', '', '');
  historyYears.forEach((y, i) => {
    if (i === 0) r4Vals.push('履歴');
    else r4Vals.push('');
  });
  r4.values = r4Vals;
  r4.height = 20;

  const r5 = ws.getRow(5);
  const r5Vals = ['', '', '', '職名', '氏名', '在籍', '年齢', '職名', '氏名', '在籍', '年齢', '備考', ''];
  r5Vals.push('氏名', '年齢', 'フリガナ', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '配属希望', '特殊事情', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度');
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
    if (startColCode !== endColCode) ws.mergeCells(`${startColCode}4:${endColCode}4`);
  }
"""

code = code.replace(search2, replace2)

search3 = """for (let rn = 4; rn <= 5; rn++) {
    const row = ws.getRow(rn);
    for (let c = 1; c <= 12; c++) {"""
replace3 = """const totalCols = 34 + historyYears.length;
  for (let rn = 4; rn <= 5; rn++) {
    const row = ws.getRow(rn);
    for (let c = 1; c <= totalCols; c++) {
      if (c === 13) continue;"""

code = code.replace(search3, replace3)

search4 = """      cell.border = {
        top: { style: topStyle, color: { argb: 'FF000000' } },
        bottom: { style: bottomStyle, color: { argb: 'FF000000' } },
        left: { style: leftStyle, color: { argb: 'FF000000' } },
        right: { style: rightStyle, color: { argb: 'FF000000' } }
      };"""
replace4 = """
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

      cell.border = {
        top: { style: topStyle, color: { argb: 'FF000000' } },
        bottom: { style: bottomStyle, color: { argb: 'FF000000' } },
        left: { style: leftStyle, color: { argb: 'FF000000' } },
        right: { style: rightStyle, color: { argb: 'FF000000' } }
      };"""

code = code.replace(search4, replace4)

search5 = """    for (let c = 1; c <= 12; c++) {
      const cell = tr.getCell(c);
      const isLeft = (c === 1 || c === 12 || c === 2 || c === 3);"""
replace5 = """    for (let c = 1; c <= totalCols; c++) {
      if (c === 13) continue;
      const cell = tr.getCell(c);
      const isLeft = (c === 1 || c === 12 || c === 2 || c === 3 || (c >= 14 && c <= 24) || c >= 35);"""

code = code.replace(search5, replace5)

search6 = """    if (post && post.isAbolished) {
      rowVals[7] = ''; rowVals[8] = '後任なし'; rowVals[9] = ''; rowVals[10] = '';
    }"""
replace6 = """    if (post && post.isAbolished) {
      rowVals[7] = ''; rowVals[8] = '後任なし'; rowVals[9] = ''; rowVals[10] = '';
    }
    
    const extEmp = nextEmp || currEmp;
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
      rowVals[22] = extEmp.desiredAssignment ? '・ ' + extEmp.desiredAssignment : '';
      rowVals[23] = extEmp.specialCircumstances ? '※ ' + extEmp.specialCircumstances : '';
      
      let hireStr = '';
      if (extEmp.hireDate) hireStr = formatDateForDisplay(extEmp.hireDate);
      rowVals[24] = hireStr;
      
      const pKeys = ['promoYearHire', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
      const gradeToPromoKey = { '係長級(主査)': 'promoYearChief', '補佐級I(主任)': 'promoYearAssistant1', '補佐級II(班長)': 'promoYearAssistant2', '補佐級III(補佐兼班長)': 'promoYearAssistant3', '課長級': 'promoYearSecHead', '所属長級': 'promoYearDivHead', '次長級': 'promoYearDeputyHead', '部長級': 'promoYearDeptHead' };
      
      for (let idx = 1; idx < pKeys.length; idx++) {
        const key = pKeys[idx];
        let cellVal = extEmp[key] || '';
        if (extEmp.nextGrade && gradeToPromoKey[extEmp.nextGrade] === key) {
           cellVal = targetYear + '-04-01';
        }
        rowVals[24 + idx] = cellVal ? formatDateForDisplay(cellVal) : '';
      }
      rowVals[33] = extEmp.nextEmploymentType || '';
      
      historyYears.forEach((y, i) => {
        let historyStr = '';
        if (extEmp.history) {
          const h = extEmp.history.find(x => x.year === y);
          if (h) historyStr = h.deptName ? h.deptName + ' / ' + h.title : h.title;
        }
        rowVals[34 + i] = historyStr;
      });
    }"""

code = code.replace(search6, replace6)

search7 = """  for (let c = 1; c <= 12; c++) {
    const cell = lastRow.getCell(c);"""
replace7 = """  for (let c = 1; c <= totalCols; c++) {
    if (c === 13) continue;
    const cell = lastRow.getCell(c);"""

code = code.replace(search7, replace7)

with open('src/utils/exportExcel.js', 'w', encoding='utf8') as f:
    f.write(code)

print("Patched exportExcel.js via Python string replace")