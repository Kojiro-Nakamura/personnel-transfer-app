import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

old_headers = """  const r4 = ws.getRow(4);
  const currentEraShort = getEraFormattedYear(targetYear - 1).split('(')[1].replace(')', '');
  r4.values = ['部署名', '班・グループ', 'ポスト', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`];
  
  ws.mergeCells('A4:A5');
  ws.mergeCells('B4:B5');
  ws.mergeCells('C4:C5');
  ws.mergeCells('D4:I4');
  ws.mergeCells('J4:J5');
  ws.mergeCells('K4:Q4');

  const r5 = ws.getRow(5);
  r5.values = ['部署名', '班・グループ', 'ポスト', '職名', '氏名', '級', '年齢', '在籍', '備考', '→', '部署名', '班・グループ', '職名', '級', '年齢', '在籍', '備考'];"""

new_headers = """  const r4 = ws.getRow(4);
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
  }
"""

code = code.replace(old_headers, new_headers)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)