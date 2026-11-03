import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

target = """  // Custom borders for Reference Section
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

replacement = """  // Custom borders for Reference Section
  for (let c = 19; c <= totalCols; c++) {
     let leftStyle = 'thin';
     let rightStyle = 'thin';
     
     if ([19, 22, 30, 40].includes(c)) leftStyle = 'medium';
     if ([21, 29, 39, totalCols].includes(c)) rightStyle = 'medium';
     
     if (c >= 19 && c <= 21) {
        // Vertically merged (S4:S5, T4:T5, U4:U5)
        ws.getCell(4, c).border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: leftStyle }, right: { style: rightStyle } };
     } else {
        // Horizontally merged in row 4, individual in row 5
        ws.getCell(4, c).border = { top: { style: 'medium' }, bottom: { style: 'thin' }, left: { style: leftStyle }, right: { style: rightStyle } };
        ws.getCell(5, c).border = { top: { style: 'thin' }, bottom: { style: 'medium' }, left: { style: leftStyle }, right: { style: rightStyle } };
     }
  }"""

if target in code:
    code = code.replace(target, replacement)
    print("Replaced with precise borders!")
else:
    print("Precise borders target not found!")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)