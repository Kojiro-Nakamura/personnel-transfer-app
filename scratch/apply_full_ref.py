import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. Update columns array to include extraCols
old_cols = """  ws.columns = [
    { width: 14 }, // A 部署名
    { width: 14 }, // B 班・グループ
    { width: 12 }, // C ポスト
    { width: 12 }, // D [今年] 職名
    { width: 14 }, // E [今年] 氏名
    { width: 8 },  // F [今年] 級
    { width: 8 },  // G [今年] 年齢
    { width: 12 }, // H [今年] 在籍
    { width: 12 }, // I [今年] 備考
    { width: 4 },  // J 矢印
    { width: 14 }, // K [来年] 部署名
    { width: 14 }, // L [来年] 班・グループ
    { width: 12 }, // M [来年] 職名
    { width: 8 },  // N [来年] 級
    { width: 8 },  // O [来年] 年齢
    { width: 12 }, // P [来年] 在籍
    { width: 12 }, // Q [来年] 備考
  ];"""

new_cols = """  const extraCols = [
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
    { width: 8 },  // 配属 (AB)
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
    { width: 12 }, // C ポスト
    { width: 12 }, // D [今年] 職名
    { width: 14 }, // E [今年] 氏名
    { width: 8 },  // F [今年] 級
    { width: 8 },  // G [今年] 年齢
    { width: 12 }, // H [今年] 在籍
    { width: 12 }, // I [今年] 備考
    { width: 4 },  // J 矢印
    { width: 14 }, // K [来年] 部署名
    { width: 14 }, // L [来年] 班・グループ
    { width: 12 }, // M [来年] 職名
    { width: 8 },  // N [来年] 級
    { width: 8 },  // O [来年] 年齢
    { width: 12 }, // P [来年] 在籍
    { width: 12 }, // Q [来年] 備考
    ...extraCols
  ];"""

code = code.replace(old_cols, new_cols)

# 2. Update Headers (r4, r5) and styling loops
old_headers = """  const r4 = ws.getRow(4);
  const currentEraShort = getEraFormattedYear(targetYear - 1).split('(')[1].replace(')', '');
  const r4Vals = ['部署名', '班・グループ', 'ポスト', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', '', '', ''];
  r4Vals.push('', '＜参考＞', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');
  historyYears.forEach((y, i) => r4Vals.push(''));
  r4.values = r4Vals;
  
  ws.mergeCells('A4:A5');
  ws.mergeCells('B4:B5');
  ws.mergeCells('C4:C5');
  ws.mergeCells('D4:I4');
  ws.mergeCells('J4:J5');
  ws.mergeCells('K4:Q4');
  
  // Reference section merges
  ws.mergeCells('R4:R5'); // 空白列
  ws.mergeCells('S4:AM4'); // ＜参考＞ headers
  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(39 + historyYears.length).letter;
    const startColCode = ws.getColumn(40).letter;
    ws.mergeCells(`${startColCode}4:${endColCode}4`);
  }

  const r5 = ws.getRow(5);
  const r5Vals = ['部署名', '班・グループ', 'ポスト', '職名', '氏名', '級', '年齢', '在籍', '備考', '→', '部署名', '班・グループ', '職名', '級', '年齢', '在籍', '備考'];
  r5Vals.push('', '氏名', `${currentEraShort}年齢`, 'フリガナ', '本籍', '', '', '', '', '', '', '異動歴', '', '', '', '', '', '', '', '', '');
  historyYears.forEach((y, i) => {
    if (i === 0) r5Vals.push('過去の履歴');
    else r5Vals.push('');
  });
  r5.values = r5Vals;
  
  ws.mergeCells('W5:X5'); // 性別, 生年月日
  ws.mergeCells('AB5:AC5'); // 配属, 特事
  ws.mergeCells('AD5:AM5'); // 昇格年
  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(39 + historyYears.length).letter;
    const startColCode = ws.getColumn(40).letter;
    ws.mergeCells(`${startColCode}5:${endColCode}5`);
  }"""

new_headers = """  const r4 = ws.getRow(4);
  const currentEraShort = getEraFormattedYear(targetYear - 1).split('(')[1].replace(')', '');
  const r4Vals = ['部署名', '班・グループ', 'ポスト', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', '', '', ''];
  r4Vals.push('', '氏名', `${currentEraShort}年齢`, 'フリガナ', '本籍', '', '', '', '', '', '', '異動歴', '', '', '', '', '', '', '', '', '');
  historyYears.forEach((y, i) => {
    if (i === 0) r4Vals.push('過去の履歴');
    else r4Vals.push('');
  });
  r4.values = r4Vals;
  r4.height = 20;
  
  ws.mergeCells('A4:A5');
  ws.mergeCells('B4:B5');
  ws.mergeCells('C4:C5');
  ws.mergeCells('D4:I4');
  ws.mergeCells('J4:J5');
  ws.mergeCells('K4:Q4');
  
  // Reference section merges
  ws.mergeCells('R4:R5');
  ws.mergeCells('S4:S5');
  ws.mergeCells('T4:T5');
  ws.mergeCells('U4:U5');
  ws.mergeCells('V4:AC4'); // 本籍 (V to AC)
  ws.mergeCells('AD4:AM4'); // 異動歴 (AD to AM)
  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(39 + historyYears.length).letter;
    const startColCode = ws.getColumn(40).letter;
    ws.mergeCells(`${startColCode}4:${endColCode}4`);
  }

  const r5 = ws.getRow(5);
  const r5Vals = ['部署名', '班・グループ', 'ポスト', '職名', '氏名', '級', '年齢', '在籍', '備考', '→', '部署名', '班・グループ', '職名', '級', '年齢', '在籍', '備考'];
  r5Vals.push('', '氏名', '年齢', 'フリガナ', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '備考', '配属希望', '特事', '採用', '係長(主査)', '補佐I(主任)', '補佐II(班長)', '補佐III(補佐兼班長)', '課長', '所属長', '次長', '部長', '採用年');
  historyYears.forEach(y => r5Vals.push(getEraFormattedYear(y)));
  r5.values = r5Vals;
  r5.height = 20;"""

code = code.replace(old_headers, new_headers)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)