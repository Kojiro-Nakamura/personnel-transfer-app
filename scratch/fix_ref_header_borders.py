import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

target = """  ws.getCell('R4').border = { left: { style: 'thin' }, right: { style: 'thin' } };
  ws.getCell('R5').border = { left: { style: 'thin' }, right: { style: 'thin' } };
  ws.getCell('S4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'medium' }, right: { style: 'thin' } };
  ws.getCell('S5').border = { left: { style: 'medium' }, right: { style: 'thin' } };
  ws.getCell('T4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
  ws.getCell('T5').border = { left: { style: 'thin' }, right: { style: 'thin' } };
  ws.getCell('U4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'medium' } };
  ws.getCell('U5').border = { left: { style: 'thin' }, right: { style: 'medium' } };"""

replacement = """  ws.getCell('R4').border = { left: { style: 'thin' }, right: { style: 'thin' } };
  ws.getCell('R5').border = { left: { style: 'thin' }, right: { style: 'thin' } };
  
  // Custom borders for Reference Section
  for (let c = 19; c <= totalCols; c++) {
     let topStyle = 'medium';
     let bottomStyle = 'medium';
     let leftStyle = 'thin';
     let rightStyle = 'thin';
     
     // Left edges of groups
     if ([19, 22, 30, 40].includes(c)) leftStyle = 'medium';
     // Right edges of groups
     if ([21, 29, 39, totalCols].includes(c)) rightStyle = 'medium';
     
     ws.getCell(4, c).border = { top: { style: topStyle }, bottom: { style: 'thin' }, left: { style: leftStyle }, right: { style: rightStyle } };
     ws.getCell(5, c).border = { top: { style: 'thin' }, bottom: { style: bottomStyle }, left: { style: leftStyle }, right: { style: rightStyle } };
  }"""

if target in code:
    code = code.replace(target, replacement)
    print("Replaced reference header borders successfully!")
else:
    print("Reference header borders target not found!")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)