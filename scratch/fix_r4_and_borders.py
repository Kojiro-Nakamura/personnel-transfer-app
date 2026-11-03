import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# Fix Row 4 Titles
r4_target = """  const r4Vals = ['部署名', '班・グループ', 'ポスト', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', '', '', ''];
  r4Vals.push('', '＜参考＞', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '');
  historyYears.forEach(() => r4Vals.push(''));"""

r4_replacement = """  const r4Vals = ['部署名', '班・グループ', 'ポスト', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`, '', '', '', '', '', ''];
  const currentEraShort = getEraFormattedYear(targetYear - 1).split('(')[1].replace(')', '');
  r4Vals.push('', '氏名', `${currentEraShort}年齢`, 'フリガナ', '基本情報', '', '', '', '', '', '', '', '昇任年等', '', '', '', '', '', '', '', '', '');
  historyYears.forEach((y, i) => {
    if (i === 0) r4Vals.push('経歴');
    else r4Vals.push('');
  });"""

if r4_target in code:
    code = code.replace(r4_target, r4_replacement)
    print("Row 4 titles replaced!")
else:
    print("Row 4 titles target not found!")


# Fix S4 border
border_target = """  ws.getCell('S4').border = { top: { style: 'medium' }, bottom: { style: 'thin' }, left: { style: 'medium' }, right: { style: 'medium' } };"""
border_replacement = """  ws.getCell('S4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'medium' }, right: { style: 'thin' } };
  ws.getCell('S5').border = { left: { style: 'medium' }, right: { style: 'thin' } };
  ws.getCell('T4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
  ws.getCell('T5').border = { left: { style: 'thin' }, right: { style: 'thin' } };
  ws.getCell('U4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'medium' } };
  ws.getCell('U5').border = { left: { style: 'thin' }, right: { style: 'medium' } };"""

if border_target in code:
    code = code.replace(border_target, border_replacement)
    print("S4 border replaced!")
else:
    print("S4 border target not found!")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)