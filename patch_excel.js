const fs = require('fs');
const file = 'src/utils/exportExcel.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add historyYears and helpers
const helperInjection = `
  const allHistoryYears = new Set();
  employees.forEach(e => {
    if (e.history) Object.keys(e.history).forEach(y => allHistoryYears.add(parseInt(y)));
  });
  const historyYears = Array.from(allHistoryYears).sort((a, b) => b - a).filter(y => y < targetYear - 1);

  const getEraSuffixLocal = (yearStr) => {
    if (!yearStr) return '';
    const y = parseInt(yearStr);
    if (isNaN(y)) return '';
    if (y >= 2019) {
      const r = y - 2018;
      return r === 1 ? 'R元' : 'R' + r;
    } else if (y >= 1989) {
      const h = y - 1988;
      return h === 1 ? 'H元' : 'H' + h;
    } else if (y >= 1926) {
      const s = y - 1925;
      return s === 1 ? 'S元' : 'S' + s;
    }
    return '';
  };
  
  const formatWithEra = (dateStr) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    const y = dateStr.substring(0, 4);
    const m = dateStr.substring(4, 6);
    const d = dateStr.substring(6, 8);
    const era = getEraSuffixLocal(y);
    if (era) return \`\${y}(\${era})/\${m}/\${d}\`;
    return \`\${y}/\${m}/\${d}\`;
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
  const getPromotedBgColorCode = (gradeName) => {
    if (gradeName === '係長級(主査)') return '#fef9c3'; // yellow-100
    if (gradeName === '補佐級I(主任)') return '#fef08a'; // yellow-200
    if (gradeName === '補佐級II(班長)') return '#fde047'; // yellow-300
    if (gradeName === '補佐級III(補佐兼班長)') return '#facc15'; // yellow-400
    if (gradeName === '課長級') return '#fed7aa'; // orange-200
    if (gradeName === '所属長級') return '#fdba74'; // orange-300
    if (gradeName === '次長級') return '#fb923c'; // orange-400
    if (gradeName === '部長級') return '#f97316'; // orange-500
    return '#ffffff';
  };
`;

content = content.replace(
  /export const exportPlanToExcel = async \(fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel\) => \{/,
  `export const exportPlanToExcel = async (fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel) => {${helperInjection}`
);

// 2. Add extra columns
const columnsInjection = `
  const extraCols = [
    { width: 16 }, // フリガナ (Q)
    { width: 12 }, // 職員番号 (R)
    { width: 6 },  // 性別 (S)
    { width: 14 }, // 生年月日 (T)
    { width: 12 }, // 最終学歴 (U)
    { width: 14 }, // 採用年月日 (V)
    { width: 20 }, // 特記事項 (W)
    { width: 8 },  // 採用 (X)
    { width: 8 },  // 係長級 (Y)
    { width: 8 },  // 補佐I (Z)
    { width: 8 },  // 補佐II (AA)
    { width: 8 },  // 補佐III (AB)
    { width: 8 },  // 課長級 (AC)
    { width: 8 },  // 所属長級 (AD)
    { width: 8 },  // 次長級 (AE)
    { width: 8 },  // 部長級 (AF)
    { width: 14 }  // 来年度 (AG)
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
`;

content = content.replace(/ws\.columns = \[\s*\{ width: 18 \},[\s\S]*?\{ width: 25 \}\s*\/\/\s*メモ\s*\];/, columnsInjection);

// 3. Setup print area
content = content.replace(
  /ws\.pageSetup\.printTitlesRow = '1:5';/,
  "ws.pageSetup.printTitlesRow = '1:5';\n  ws.pageSetup.printArea = 'A1:P10000';"
);

// 4. Update r4, r5 headers and merges
const headerLogic = `
  const r4 = ws.getRow(4);
  const r4Vals = ['部署名', '班・グループ', 'ポスト', \`今年度（\${targetYear - 1}(R\${targetYear - 2019})）\`, '', '', '', '', '', \`来年度（\${targetYear}(R\${targetYear - 2018})）\`, '', '', '', '', '', 'メモ'];
  r4Vals.push('フリガナ', '基本情報', '', '', '', '', '', '昇進年度', '', '', '', '', '', '', '', '', '履歴');
  historyYears.forEach(() => r4Vals.push(''));
  r4.values = r4Vals;
  r4.height = 20;

  const r5 = ws.getRow(5);
  const r5Vals = ['', '', '', '職名', '氏名', '級', '年齢', '在籍', '備考', '職名', '氏名', '級', '年齢', '在籍', '備考', ''];
  r5Vals.push('', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', \`来年度 \${getEraFormattedYear(targetYear)}\`);
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
  ws.mergeCells('R4:W4');
  ws.mergeCells('X4:AF4');
  const endColCode = ws.getColumn(33 + historyYears.length).letter;
  ws.mergeCells(\`AG4:\${endColCode}4\`);
`;

content = content.replace(
  /const r4 = ws\.getRow\(4\);[\s\S]*?ws\.mergeCells\('P4:P5'\);/,
  headerLogic
);

// 5. Update header coloring
const coloringLogic = `
  const totalCols = 33 + historyYears.length;
  for (let i = 1; i <= totalCols; i++) {
    const col = ws.getColumn(i).letter;
    [4, 5].forEach(rn => {
      const cell = ws.getCell(\`\${col}\${rn}\`);
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      let argb = 'FFCBD5E1'; // slate-300
      if (i >= 4 && i <= 9) argb = 'FFFEF3C7'; // 今年度
      if (i >= 10 && i <= 15) argb = 'FFDBEAFE'; // 来年度
      if (i === 16) argb = 'FFF1F5F9'; // メモ
      if (i === 17) argb = 'FFFEF3C7'; // フリガナ (Amber)
      if (i >= 18 && i <= 23) argb = 'FFBFDBFE'; // 基本情報 (Blue)
      if (i >= 24 && i <= 32) {
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
         if (rn === 5 && promoColors[i]) {
            argb = 'FF' + promoColors[i].replace('#', '').toUpperCase();
         } else {
            argb = 'FFF5D0FE'; // Fuchsia
         }
      }
      if (i >= 33) argb = 'FFA7F3D0'; // Emerald (History)
      
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
      
      const topB = rn === 4 ? 'thick' : false;
      let bottomB = rn === 5 ? 'thick' : false;
      if (rn === 4 && i >= 4 && i <= 15) bottomB = true; 
      if (rn === 4 && i >= 18 && i <= 23) bottomB = true;
      if (rn === 4 && i >= 24 && i <= 32) bottomB = true;
      if (rn === 4 && i >= 33) bottomB = true;
      
      const leftB = (i === 1 || i === 4 || i === 10 || i === 16 || i === 17 || i === 18 || i === 24 || i === 33) ? 'thick' : true;
      const rightB = (i === 3 || i === 9 || i === 15 || i === 16 || i === 17 || i === 23 || i === 32 || i === totalCols) ? 'thick' : true;
      
      const newBorder = getCellBorders(topB, bottomB, leftB, rightB);
      cell.border = { ...(cell.border || {}), ...newBorder };
    });
  }
`;

content = content.replace(
  /\['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P'\]\.forEach\(\(col, i\) => \{[\s\S]*?\}\);/,
  coloringLogic
);

// 6. Append row values
const dataAppendLogic = `
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
    
    const extEmp = nextEmp || currEmp;
    if (extEmp) {
      rowVals.push(extEmp.furigana || '');
      rowVals.push(extEmp.employeeNumber || '');
      rowVals.push(extEmp.gender || '');
      rowVals.push(formatWithEra(extEmp.birthDate));
      rowVals.push(extEmp.education || '');
      rowVals.push(formatWithEra(extEmp.hireDate));
      rowVals.push(extEmp.note || ''); // 特記事項

      const hireYear = extEmp.hireDate ? extEmp.hireDate.substring(0,4) : '';
      let hireStr = hireYear;
      if (hireYear) {
        const suffix = getEraSuffixLocal(hireYear);
        if (suffix) hireStr += \`(\${suffix})\`;
      }
      rowVals.push(hireStr);

      const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
      const gradeList = ['', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級'];
      
      const curPromoColors = {}; // cell colors for promo
      
      for (let idx = 1; idx < pKeys.length; idx++) {
        const key = pKeys[idx];
        let cellVal = extEmp[key] || '';
        if (cellVal) {
          const yNum = parseInt(cellVal);
          let prefix = '';
          if (cellVal.includes('(追及)')) prefix = '追及:';
          else if (cellVal.includes('(免除)')) prefix = '免除:';
          
          let pStr = \`\${yNum}\`;
          const suffix = getEraSuffixLocal(yNum.toString());
          if (suffix) pStr += \`(\${suffix})\`;
          
          let prevNum = NaN;
          for (let j = idx - 1; j >= 0; j--) {
             const prevVal = extEmp[pKeys[j]] || '';
             if (prevVal) {
               prevNum = parseInt(prevVal);
               if (!isNaN(prevNum)) break;
             }
          }
          
          if (!isNaN(prevNum) && !isNaN(yNum) && prevNum > 0) {
             const diff = yNum - prevNum;
             pStr += \` Δ\${diff}\`;
             
             const stdYears = getStandardYears(gradeList[idx]);
             if (stdYears > 0 && diff < stdYears && !prefix) {
                curPromoColors[24 + idx] = getFastBgColorCode();
             }
          }
          
          rowVals.push(prefix ? \`\${prefix}\${pStr}\` : pStr);
        } else {
          rowVals.push('');
        }
      }
      
      // History
      rowVals.push(extEmp.history && extEmp.history[targetYear] ? extEmp.history[targetYear] : '');
      historyYears.forEach(y => {
        rowVals.push(extEmp.history && extEmp.history[y] ? extEmp.history[y] : '');
      });
      
      row.values = rowVals;
      
      // apply colors for promo
      Object.keys(curPromoColors).forEach(cIdx => {
         const cell = row.getCell(parseInt(cIdx));
         cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + curPromoColors[cIdx].replace('#', '').toUpperCase() } };
      });
    } else {
      row.values = rowVals;
    }
`;

content = content.replace(
  /const row = ws\.getRow\(rowIndex\);\s*row\.values = \[[^\]]*\];/,
  "const row = ws.getRow(rowIndex);\n" + dataAppendLogic
);

fs.writeFileSync(file, content);
console.log('Patched');
