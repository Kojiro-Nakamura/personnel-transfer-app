import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search = """  const nextSummary = generateGradeSummary(employees, true);
  ws.getRow(3).values = [`【全体の集計（来年度 ${targetYear}(R${targetYear - 2018})）】 ${nextSummary}`];
  ws.getRow(3).font = { name: 'BIZ UDPゴシック', size: 9, color: { argb: 'FF0284C7' } };"""

replace = """  const nextSummary = generateGradeSummary(employees, true);
  ws.getRow(3).values = [`【全体の集計（来年度 ${targetYear}(R${targetYear - 2018})）】 ${nextSummary}`];
  ws.getRow(3).font = { name: 'BIZ UDPゴシック', size: 9, color: { argb: 'FF0284C7' } };
  
  ws.mergeCells('A2:L2');
  ws.getCell('A2').alignment = { shrinkToFit: true, vertical: 'middle' };
  ws.mergeCells('A3:L3');
  ws.getCell('A3').alignment = { shrinkToFit: true, vertical: 'middle' };"""

if search in code:
    code = code.replace(search, replace)
    print("Replaced rows 2-3 settings successfully")
else:
    print("Failed to replace rows 2-3 settings")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)