const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

let newCode = code;

const search1 = "export const addSimplePlanSheet = (workbook, sheetName, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {\n  const ws = workbook.addWorksheet";
const replace1 = "export const addSimplePlanSheet = (workbook, sheetName, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {\n" +
  "  const allHistoryYears = new Set();\n" +
  "  allHistoryYears.add(targetYear);\n" +
  "  employees.forEach(e => {\n" +
  "    if (e.history) e.history.forEach(h => allHistoryYears.add(h.year));\n" +
  "  });\n" +
  "  const historyYears = Array.from(allHistoryYears).sort((a, b) => a - b);\n" +
  "\n" +
  "  const getEraSuffixLocal = (yearStr) => {\n" +
  "    return (yearStr >= 2019) ? 'R' : 'H';\n" +
  "  };\n" +
  "  const formatPromoDateWithEra = (dateStr) => {\n" +
  "    if (!dateStr || String(dateStr).trim() === '') return '';\n" +
  "    const match = String(dateStr).match(/^(\\d{4})[-/]/);\n" +
  "    if (!match) return dateStr;\n" +
  "    const year = parseInt(match[1], 10);\n" +
  "    const m = dateStr.length >= 7 ? parseInt(dateStr.substring(5,7), 10) : 4;\n" +
  "    const isEarly = m >= 1 && m <= 3;\n" +
  "    const fiscalYear = isEarly ? year - 1 : year;\n" +
  "    let era = getEraSuffixLocal(fiscalYear);\n" +
  "    let ey = fiscalYear >= 2019 ? fiscalYear - 2018 : (fiscalYear >= 1989 ? fiscalYear - 1988 : fiscalYear - 1925);\n" +
  "    let eraStr = era + ey;\n" +
  "    if (era === 'R' && ey === 1) eraStr = 'R元';\n" +
  "    if (era === 'H' && ey === 1) eraStr = 'H元';\n" +
  "    return eraStr + '(' + year + ')';\n" +
  "  };\n" +
  "  const formatWithEra = (dateStr, birthDateStr = null) => {\n" +
  "    let res = formatPromoDateWithEra(String(dateStr));\n" +
  "    if (birthDateStr && dateStr) {\n" +
  "      const match = String(dateStr).match(/^(\\d{4})[-/]/);\n" +
  "      if (match) {\n" +
  "         const year = parseInt(match[1], 10);\n" +
  "         const ageDiff = year - parseInt(String(birthDateStr).substring(0,4));\n" +
  "         res += '(' + ageDiff + '歳)';\n" +
  "      }\n" +
  "    }\n" +
  "    return res;\n" +
  "  };\n" +
  "  const formatDateForDisplay = formatPromoDateWithEra;\n\n" +
  "  const ws = workbook.addWorksheet";

newCode = newCode.replace(search1, replace1);

const search2 = "  const r4 = ws.getRow(4);\n" +
  "  r4.values = ['部署名', '配置希望', '特記事項', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', ''];\n" +
  "  r4.height = 20;\n\n" +
  "  const r5 = ws.getRow(5);\n" +
  "  r5.values = ['', '', '', '職名', '氏名', '在籍', '年齢', '職名', '氏名', '在籍', '年齢', '備考'];\n" +
  "  r5.height = 20;\n\n" +
  "  ws.mergeCells('A4:A5');\n" +
  "  ws.mergeCells('B4:B5');\n" +
  "  ws.mergeCells('C4:C5');\n" +
  "  ws.mergeCells('D4:G4');\n" +
  "  ws.mergeCells('H4:L4');";

const replace2 = "  ws.getRow(3).getCell(14).value = '＜参考＞';\n" +
  "  ws.getRow(3).getCell(14).font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };\n" +
  "\n" +
  "  const currYearIndex = Math.max(0, historyYears.indexOf(targetYear - 1));\n" +
  "  const legendEndCol = 31 + currYearIndex;\n" +
  "  const legendLabels = [\"凡例\", \"係長級(主査)\", \"補佐級I(主任)\", \"補佐級II(班長)\", \"補佐級III(補佐兼班長)\", \"課長級\", \"所属長級\", \"次長級\", \"部長級\"];\n" +
  "  const legendStartCol = legendEndCol - 8;\n" +
  "\n" +
  "  for (let i = 0; i < legendLabels.length; i++) {\n" +
  "    const colNumber = legendStartCol + i;\n" +
  "    if (colNumber > 1) { \n" +
  "      const cell = ws.getRow(2).getCell(colNumber);\n" +
  "      cell.value = legendLabels[i];\n" +
  "      cell.alignment = { vertical: 'middle', horizontal: 'center' };\n" +
  "      cell.border = {\n" +
  "        top: { style: 'thin', color: { argb: 'FF000000' } },\n" +
  "        left: { style: 'thin', color: { argb: 'FF000000' } },\n" +
  "        bottom: { style: 'thin', color: { argb: 'FF000000' } },\n" +
  "        right: { style: 'thin', color: { argb: 'FF000000' } }\n" +
  "      };\n" +
  "      if (i === 0) {\n" +
  "        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };\n" +
  "        cell.font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };\n" +
  "      } else {\n" +
  "        cell.font = { name: 'BIZ UDPゴシック', size: 8, bold: false, color: { argb: 'FF000000' } };\n" +
  "        const c = getPromotedBgColorCode(legendLabels[i]);\n" +
  "        if (c) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + c.replace('#', '').toUpperCase() } };\n" +
  "      }\n" +
  "    }\n" +
  "  }\n" +
  "\n" +
  "  const r4 = ws.getRow(4);\n" +
  "  const r4Vals = ['部署名', '配置希望', '特記事項', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', '', ''];\n" +
  "  const currentEraShort = 'R' + (targetYear - 2019);\n" +
  "  r4Vals.push('氏名', currentEraShort + '年齢', 'フリガナ', '基本情報', '', '', '', '', '', '', '', '昇級年度', '', '', '', '', '', '', '', '', '', '');\n" +
  "  historyYears.forEach((y, i) => {\n" +
  "    if (i === 0) r4Vals.push('履歴');\n" +
  "    else r4Vals.push('');\n" +
  "  });\n" +
  "  r4.values = r4Vals;\n" +
  "  r4.height = 20;\n" +
  "\n" +
  "  const r5 = ws.getRow(5);\n" +
  "  const r5Vals = ['', '', '', '職名', '氏名', '在籍', '年齢', '職名', '氏名', '在籍', '年齢', '備考', ''];\n" +
  "  r5Vals.push('氏名', '年齢', 'フリガナ', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '配属希望', '特殊事情', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度');\n" +
  "  historyYears.forEach(y => r5Vals.push('R' + (y-2018) + '(' + y + ')'));\n" +
  "  r5.values = r5Vals;\n" +
  "  r5.height = 20;\n" +
  "\n" +
  "  ws.mergeCells('A4:A5');\n" +
  "  ws.mergeCells('B4:B5');\n" +
  "  ws.mergeCells('C4:C5');\n" +
  "  ws.mergeCells('D4:G4');\n" +
  "  ws.mergeCells('H4:L4');\n" +
  "  \n" +
  "  ws.mergeCells('N4:N5');\n" +
  "  ws.mergeCells('O4:O5');\n" +
  "  ws.mergeCells('P4:P5');\n" +
  "  ws.mergeCells('Q4:X4');\n" +
  "  ws.mergeCells('Y4:AH4');\n" +
  "  \n" +
  "  if (historyYears.length > 0) {\n" +
  "    const endColCode = ws.getColumn(34 + historyYears.length).letter;\n" +
  "    const startColCode = ws.getColumn(35).letter;\n" +
  "    if (startColCode !== endColCode) ws.mergeCells(startColCode + '4:' + endColCode + '4');\n" +
  "  }";

newCode = newCode.replace(search2, replace2);

const search3 = "  for (let rn = 4; rn <= 5; rn++) {\n" +
  "    const row = ws.getRow(rn);\n" +
  "    for (let c = 1; c <= 12; c++) {";

const replace3 = "  const totalCols = 34 + historyYears.length;\n" +
  "  for (let rn = 4; rn <= 5; rn++) {\n" +
  "    const row = ws.getRow(rn);\n" +
  "    for (let c = 1; c <= totalCols; c++) {\n" +
  "      if (c === 13) continue;";

newCode = newCode.replace(search3, replace3);

const search4 = "      cell.border = {\n" +
  "        top: { style: topStyle, color: { argb: 'FF000000' } },\n" +
  "        bottom: { style: bottomStyle, color: { argb: 'FF000000' } },\n" +
  "        left: { style: leftStyle, color: { argb: 'FF000000' } },\n" +
  "        right: { style: rightStyle, color: { argb: 'FF000000' } }\n" +
  "      };";

const replace4 = "      if (c >= 14) {\n" +
  "        let argb = 'FFCBD5E1';\n" +
  "        if (c >= 14 && c <= 16) argb = 'FFCBD5E1'; \n" +
  "        if (c >= 17 && c <= 24) argb = 'FFBFDBFE'; \n" +
  "        if (c >= 25 && c <= 34) {\n" +
  "           const promoColors = {\n" +
  "              26: getPromotedBgColorCode('係長級(主査)'),\n" +
  "              27: getPromotedBgColorCode('補佐級I(主任)'),\n" +
  "              28: getPromotedBgColorCode('補佐級II(班長)'),\n" +
  "              29: getPromotedBgColorCode('補佐級III(補佐兼班長)'),\n" +
  "              30: getPromotedBgColorCode('課長級'),\n" +
  "              31: getPromotedBgColorCode('所属長級'),\n" +
  "              32: getPromotedBgColorCode('次長級'),\n" +
  "              33: getPromotedBgColorCode('部長級'),\n" +
  "           };\n" +
  "           if (rn === 5 && promoColors[c]) {\n" +
  "              argb = 'FF' + promoColors[c].replace('#', '').toUpperCase();\n" +
  "           } else {\n" +
  "              argb = 'FFF5D0FE'; \n" +
  "           }\n" +
  "        }\n" +
  "        if (c >= 35) argb = 'FFA7F3D0'; \n" +
  "        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };\n" +
  "      }\n\n" +
  "      cell.border = {\n" +
  "        top: { style: topStyle, color: { argb: 'FF000000' } },\n" +
  "        bottom: { style: bottomStyle, color: { argb: 'FF000000' } },\n" +
  "        left: { style: leftStyle, color: { argb: 'FF000000' } },\n" +
  "        right: { style: rightStyle, color: { argb: 'FF000000' } }\n" +
  "      };";

newCode = newCode.replace(search4, replace4);

const search5 = "    for (let c = 1; c <= 12; c++) {\n" +
  "      const cell = tr.getCell(c);\n" +
  "      const isLeft = (c === 1 || c === 12 || c === 2 || c === 3);";

const replace5 = "    for (let c = 1; c <= totalCols; c++) {\n" +
  "      if (c === 13) continue;\n" +
  "      const cell = tr.getCell(c);\n" +
  "      const isLeft = (c === 1 || c === 12 || c === 2 || c === 3 || (c >= 14 && c <= 24) || c >= 35);";

newCode = newCode.replace(search5, replace5);

const search6 = "    if (post && post.isAbolished) {\n" +
  "      rowVals[7] = ''; rowVals[8] = '後任なし'; rowVals[9] = ''; rowVals[10] = '';\n" +
  "    }";

const replace6 = "    if (post && post.isAbolished) {\n" +
  "      rowVals[7] = ''; rowVals[8] = '後任なし'; rowVals[9] = ''; rowVals[10] = '';\n" +
  "    }\n" +
  "    \n" +
  "    const extEmp = nextEmp || currEmp;\n" +
  "    if (extEmp) {\n" +
  "      rowVals[12] = '';\n" +
  "      rowVals[13] = getFormattedNameForPlan(extEmp, true);\n" +
  "      rowVals[14] = extEmp.birthDate ? calculateAge(extEmp.birthDate, targetYear - 1) + '歳' : '';\n" +
  "      rowVals[15] = extEmp.furigana || '';\n" +
  "      rowVals[16] = extEmp.employeeNumber || '';\n" +
  "      rowVals[17] = extEmp.gender || '';\n" +
  "      rowVals[18] = formatWithEra(extEmp.birthDate);\n" +
  "      rowVals[19] = extEmp.education || '';\n" +
  "      rowVals[20] = formatWithEra(extEmp.hireDate, extEmp.birthDate);\n" +
  "      rowVals[21] = extEmp.note || '';\n" +
  "      rowVals[22] = extEmp.desiredAssignment ? '・ ' + extEmp.desiredAssignment : '';\n" +
  "      rowVals[23] = extEmp.specialCircumstances ? '※ ' + extEmp.specialCircumstances : '';\n" +
  "      \n" +
  "      let hireStr = '';\n" +
  "      if (extEmp.hireDate) hireStr = formatDateForDisplay(extEmp.hireDate);\n" +
  "      rowVals[24] = hireStr;\n" +
  "      \n" +
  "      const pKeys = ['promoYearHire', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];\n" +
  "      const gradeToPromoKey = { '係長級(主査)': 'promoYearChief', '補佐級I(主任)': 'promoYearAssistant1', '補佐級II(班長)': 'promoYearAssistant2', '補佐級III(補佐兼班長)': 'promoYearAssistant3', '課長級': 'promoYearSecHead', '所属長級': 'promoYearDivHead', '次長級': 'promoYearDeputyHead', '部長級': 'promoYearDeptHead' };\n" +
  "      \n" +
  "      for (let idx = 1; idx < pKeys.length; idx++) {\n" +
  "        const key = pKeys[idx];\n" +
  "        let cellVal = extEmp[key] || '';\n" +
  "        if (extEmp.nextGrade && gradeToPromoKey[extEmp.nextGrade] === key) {\n" +
  "           cellVal = targetYear + '-04-01';\n" +
  "        }\n" +
  "        rowVals[24 + idx] = cellVal ? formatDateForDisplay(cellVal) : '';\n" +
  "      }\n" +
  "      rowVals[33] = extEmp.nextEmploymentType || '';\n" +
  "      \n" +
  "      historyYears.forEach((y, i) => {\n" +
  "        let historyStr = '';\n" +
  "        if (extEmp.history) {\n" +
  "          const h = extEmp.history.find(x => x.year === y);\n" +
  "          if (h) historyStr = h.deptName ? h.deptName + ' / ' + h.title : h.title;\n" +
  "        }\n" +
  "        rowVals[34 + i] = historyStr;\n" +
  "      });\n" +
  "    }";

newCode = newCode.replace(search6, replace6);

const search7 = "  for (let c = 1; c <= 12; c++) {\n" +
  "    const cell = lastRow.getCell(c);";

const replace7 = "  for (let c = 1; c <= totalCols; c++) {\n" +
  "    if (c === 13) continue;\n" +
  "    const cell = lastRow.getCell(c);";

newCode = newCode.replace(search7, replace7);

if (code === newCode) {
    console.log("NO CHANGES MADE");
} else {
    fs.writeFileSync('src/utils/exportExcel.js', newCode, 'utf8');
    console.log("Patched exportExcel.js successfully");
}