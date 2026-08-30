import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search1 = """      Object.keys(curPromoColors).forEach(cIdx => {
         const cell = row.getCell(parseInt(cIdx));
         cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + curPromoColors[cIdx].replace('#', '').toUpperCase() } };
      });
      
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {"""

replace1 = """      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {"""

search2 = """            if (!isNewGroup && cell.border && !cell.border.top) {
                cell.border = { ...cell.border, top: { style: 'thin' } };
            }
         }
      }
    });"""

replace2 = """            if (!isNewGroup && cell.border && !cell.border.top) {
                cell.border = { ...cell.border, top: { style: 'thin' } };
            }
         }
      }
    });
    
    Object.keys(curPromoColors).forEach(cIdx => {
       const cell = row.getCell(parseInt(cIdx));
       cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + curPromoColors[cIdx].replace('#', '').toUpperCase() } };
    });"""

if search1 in code:
    code = code.replace(search1, replace1)
    print("Found search1")
if search2 in code:
    code = code.replace(search2, replace2)
    print("Found search2")

search3 = """    if (extEmp && typeof curPromoColors !== 'undefined') {
      Object.keys(curPromoColors).forEach(cIdx => {
         const cell = tr.getCell(parseInt(cIdx));
         const color = curPromoColors[cIdx].replace('#', '').toUpperCase();
         cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + color } };
      });
    }

    for (let c = 1; c <= totalCols; c++) {"""

replace3 = """    for (let c = 1; c <= totalCols; c++) {"""

search4 = """      if (nextEmp && isNextTransferred && c >= 8 && c <= 11) {
        if (getGradeLevel(nextEmp.nextGrade) > getGradeLevel(nextEmp.currentGrade)) {
          const rawColor = getPromotedBgColorCode(nextEmp.nextGrade);
          if (rawColor) {
             const colorCode = rawColor.replace('#', '').toUpperCase();
             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorCode } };
          }
        }
      }
    }"""

replace4 = """      if (nextEmp && isNextTransferred && c >= 8 && c <= 11) {
        if (getGradeLevel(nextEmp.nextGrade) > getGradeLevel(nextEmp.currentGrade)) {
          const rawColor = getPromotedBgColorCode(nextEmp.nextGrade);
          if (rawColor) {
             const colorCode = rawColor.replace('#', '').toUpperCase();
             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorCode } };
          }
        }
      }
    }
    
    if (extEmp && typeof curPromoColors !== 'undefined') {
      Object.keys(curPromoColors).forEach(cIdx => {
         const cell = tr.getCell(parseInt(cIdx));
         const color = curPromoColors[cIdx].replace('#', '').toUpperCase();
         cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + color } };
      });
    }"""

if search3 in code:
    code = code.replace(search3, replace3)
    print("Found search3")
if search4 in code:
    code = code.replace(search4, replace4)
    print("Found search4")

search5 = """      if (isPromotedThisYear) {
         const c = getPromotedBgColorCode(extEmp.nextGrade);
         if (c) {
             curPromoColors[14] = c; // 氏名
             curPromoColors[15] = c; // 年齢
             curPromoColors[34] = c; // 来年度
         }
      }"""

replace5 = """      if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade)) {
         const c = getPromotedBgColorCode(extEmp.nextGrade);
         if (c) {
             curPromoColors[14] = c; // 氏名
             curPromoColors[15] = c; // 年齢
             curPromoColors[34] = c; // 来年度
         }
      }"""

if search5 in code:
    code = code.replace(search5, replace5)
    print("Found search5")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)

print("Done")