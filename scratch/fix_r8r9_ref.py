import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. Row 3: '＜参考＞' and merge fix
r3_target = """  ws.mergeCells(`A3:${endTitleCol}3`);
  ws.getCell('A3').alignment = { shrinkToFit: true, vertical: 'middle' };"""

r3_replacement = """  ws.mergeCells(`A3:Q3`);
  ws.getCell('A3').alignment = { shrinkToFit: true, vertical: 'middle' };
  const r3 = ws.getRow(3);
  r3.getCell(19).value = '＜参考＞';
  r3.getCell(19).font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };"""
code = code.replace(r3_target, r3_replacement)

# 2. Row 4 Titles
r4_target = """  const r4Vals = ['部署', '班・グループ', 'ポスト', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', '', '', ''];
  r4Vals.push('', '＜参考＞', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');
  historyYears.forEach(() => r4Vals.push(''));"""

r4_replacement = """  const r4Vals = ['部署', '班・グループ', 'ポスト', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', '', '', ''];
  const currentEraShort = getEraFormattedYear(targetYear - 1).split('(')[1].replace(')', '');
  r4Vals.push('', '氏名', `${currentEraShort}年齢`, 'フリガナ', '基本情報', '', '', '', '', '', '', '', '昇任年等', '', '', '', '', '', '', '', '', '');
  historyYears.forEach((y, i) => {
    if (i === 0) r4Vals.push('経歴');
    else r4Vals.push('');
  });"""
code = code.replace(r4_target, r4_replacement)

# 3. Merges for Row 4/5
merges_target = """  ws.mergeCells('R4:R5');
  ws.mergeCells('S4:AM4');
  if (historyYears.length > 0) {"""

merges_replacement = """  ws.mergeCells('R4:R5');
  ws.mergeCells('S4:S5');
  ws.mergeCells('T4:T5');
  ws.mergeCells('U4:U5');
  ws.mergeCells('V4:AC4');
  ws.mergeCells('AD4:AM4');
  if (historyYears.length > 0) {"""
code = code.replace(merges_target, merges_replacement)

# 4. Remove horizontal borders for Col 18
border_target = """             bottomStyle = null;
          }

          const isLeftEdge"""
border_replacement = """             bottomStyle = null;
          } else if (c === 18) {
             topStyle = null;
             bottomStyle = null;
          }

          const isLeftEdge"""
code = code.replace(border_target, border_replacement)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)
print("Applied successfully.")