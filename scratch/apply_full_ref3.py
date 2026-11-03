import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]

    # 1. ws.columns array replacement
    if line.strip() == "ws.columns = [" and "width: 14" in lines[i+1]:
        new_lines.append("""  const extraCols = [
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
  
""")
        new_lines.append(line)
        while True:
            i += 1
            if "];" in lines[i]:
                new_lines.append("    ...extraCols\n")
                new_lines.append(lines[i])
                break
            else:
                new_lines.append(lines[i])
        i += 1
        continue

    # 2. ws.mergeCells('A2:Q2') to AL2 or whatever end col
    if line.strip() == "ws.mergeCells('A2:Q2');":
        new_lines.append("  const endTitleCol = ws.getColumn(17 + extraCols.length).letter;\n")
        new_lines.append("  ws.mergeCells(`A2:${endTitleCol}2`);\n")
        i += 1
        continue
    if line.strip() == "ws.mergeCells('A3:Q3');":
        new_lines.append("  ws.mergeCells(`A3:${endTitleCol}3`);\n")
        i += 1
        continue
        
    # 3. r4.values
    if line.strip() == "const r4Vals = ['部署名', '班・グループ', 'ポスト', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`];":
        new_lines.append("  const r4Vals = ['部署名', '班・グループ', 'ポスト', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', '', '', ''];\n")
        new_lines.append("  r4Vals.push('', '＜参考＞', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');\n")
        new_lines.append("  historyYears.forEach(() => r4Vals.push(''));\n")
        i += 1
        continue

    # 4. ws.mergeCells after r4
    if line.strip() == "ws.mergeCells('K4:Q4');":
        new_lines.append(line)
        new_lines.append("""
  ws.mergeCells('R4:R5');
  ws.mergeCells('S4:AM4');
  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(39 + historyYears.length).letter;
    const startColCode = ws.getColumn(40).letter;
    ws.mergeCells(`${startColCode}4:${endColCode}4`);
  }
""")
        i += 1
        continue

    # 5. r5.values
    if line.strip() == "const r5Vals = ['部署名', '班・グループ', 'ポスト', '職名', '氏名', '級', '年齢', '在籍', '備考', '→', '部署名', '班・グループ', '職名', '級', '年齢', '在籍', '備考'];":
        new_lines.append("  const currentEraShort = getEraFormattedYear(targetYear - 1).split('(')[1].replace(')', '');\n")
        new_lines.append(line)
        new_lines.append("  r5Vals.push('', '氏名', `${currentEraShort}年齢`, 'フリガナ', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '備考', '配属希望', '特事', '採用', '係長(主査)', '補佐I(主任)', '補佐II(班長)', '補佐III(補佐兼班長)', '課長', '所属長', '次長', '部長', '採用年');\n")
        new_lines.append("  historyYears.forEach((y, idx) => { if (idx === 0) r5Vals.push('過去の履歴'); else r5Vals.push(''); });\n")
        i += 1
        continue

    if line.strip() == "r5.height = 20;":
        new_lines.append(line)
        new_lines.append("""
  ws.mergeCells('W5:X5');
  ws.mergeCells('AB5:AC5');
  ws.mergeCells('AD5:AM5');
  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(39 + historyYears.length).letter;
    const startColCode = ws.getColumn(40).letter;
    ws.mergeCells(`${startColCode}5:${endColCode}5`);
  }
""")
        i += 1
        continue

    # 6. header styling loop `for (let c = 1; c <= 17; c++) {`
    if line.strip() == "for (let c = 1; c <= 17; c++) {":
        new_lines.append("  const totalCols = 17 + extraCols.length;\n")
        new_lines.append("  for (let c = 1; c <= totalCols; c++) {\n")
        i += 1
        continue

    # 7. c4 border in header loop
    if "const isRightEdge = [3, 9, 17].includes(c);" in line:
        new_lines.append("    const isRightEdge = [3, 9, 17, totalCols].includes(c);\n")
        i += 1
        continue
    
    # 8. color fills in header loop
    if line.strip() == "} else if (c >= 11 && c <= 17) {":
        new_lines.append(line)
        i += 1
        continue
    
    if line.strip() == "c4.fill = nextFill;" and "c5.fill = nextFill;" in lines[i+1]:
        new_lines.append(line)
        new_lines.append(lines[i+1])
        new_lines.append("""    } else if (c === 18) {
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
      c5.fill = c4.fill;""")
        i += 2
        continue

    # 9. Fixed borders
    if line.strip() == "ws.getCell('K4').border = { top: { style: 'medium' }, bottom: { style: 'thin' }, left: { style: 'medium' }, right: { style: 'medium' } };":
        new_lines.append(line)
        new_lines.append("  ws.getCell('R4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };\n")
        new_lines.append("  ws.getCell('S4').border = { top: { style: 'medium' }, bottom: { style: 'thin' }, left: { style: 'medium' }, right: { style: 'medium' } };\n")
        i += 1
        continue
        
    # 10. processEmps `const vals = new Array(17).fill('');`
    if line.strip() == "const vals = new Array(17).fill('');":
        new_lines.append("        const vals = new Array(totalCols).fill('');\n")
        i += 1
        continue

    # 11. processEmps for loop `for (let c = 1; c <= 17; c++) {`
    if line.strip() == "for (let c = 1; c <= 17; c++) {":
        new_lines.append("""
        // === Reference values ===
        const extEmp = emp; // emp in addCurrentBasePlanSheet has everything
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
        const pKeys = ['promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
        pKeys.forEach((key, idx) => {
           vals[30 + idx] = extEmp[key] || '';
        });
        vals[38] = extEmp.hireYear || '';
        historyYears.forEach((hy, idx) => {
           vals[39 + idx] = getHistorySummaryForPlan(extEmp.history, hy);
        });
        row.values = vals;
""")
        new_lines.append("        for (let c = 1; c <= totalCols; c++) {\n")
        i += 1
        continue
        
    # 12. processEmps right edge logic
    if "const isRightEdge = [3, 9, 17].includes(c);" in line:
        new_lines.append("          const isRightEdge = [3, 9, 17, totalCols].includes(c);\n")
        i += 1
        continue
    
    if line.strip() == "if (c >= 11 && c <= 17 && !isRetired && !isUnassigned) {":
        new_lines.append("          if (c >= 39) {\n")
        new_lines.append("             const histIdx = c - 39;\n")
        new_lines.append("             const hy = historyYears[histIdx];\n")
        new_lines.append("             const [hBg, hChange] = getHistoryColors(extEmp.history, hy);\n")
        new_lines.append("             if (hBg) {\n")
        new_lines.append("                 cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + hBg.replace('#', '').toUpperCase() } };\n")
        new_lines.append("             }\n")
        new_lines.append("             if (hChange) cell.font = { name: 'BIZ UDPゴシック', size: 9, bold: true, italic: true };\n")
        new_lines.append("          }\n")
        new_lines.append(line)
        i += 1
        continue

    # 13. unassigned setup `const v = new Array(17).fill('');`
    if line.strip() == "const v = new Array(17).fill('');":
        new_lines.append("      const v = new Array(totalCols).fill('');\n")
        i += 1
        continue

    # 14. unassigned `for (let c = 1; c <= 17; c++) {`
    if line.strip() == "for (let c = 1; c <= 17; c++) {":
        new_lines.append("""
      const extEmp = emp;
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
      const pKeys = ['promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
      pKeys.forEach((key, idx) => {
         v[30 + idx] = extEmp[key] || '';
      });
      v[38] = extEmp.hireYear || '';
      historyYears.forEach((hy, idx) => {
         v[39 + idx] = getHistorySummaryForPlan(extEmp.history, hy);
      });
      r.values = v;
""")
        new_lines.append("      for (let c = 1; c <= totalCols; c++) {\n")
        i += 1
        continue

    if line.strip() == "if (c >= 11 && c <= 17 && !isRetired && !isUnassigned) {":
        new_lines.append("        if (c >= 39) {\n")
        new_lines.append("           const histIdx = c - 39;\n")
        new_lines.append("           const hy = historyYears[histIdx];\n")
        new_lines.append("           const [hBg, hChange] = getHistoryColors(extEmp.history, hy);\n")
        new_lines.append("           if (hBg) {\n")
        new_lines.append("               cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + hBg.replace('#', '').toUpperCase() } };\n")
        new_lines.append("           }\n")
        new_lines.append("           if (hChange) cell.font = { name: 'BIZ UDPゴシック', size: 9, bold: true, italic: true };\n")
        new_lines.append("        }\n")
        new_lines.append(line)
        i += 1
        continue

    # 15. bottom border loop `for (let c = 1; c <= 17; c++) {`
    if line.strip() == "for (let c = 1; c <= 17; c++) {":
        new_lines.append("    for (let c = 1; c <= totalCols; c++) {\n")
        i += 1
        continue

    new_lines.append(line)
    i += 1

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.writelines(new_lines)