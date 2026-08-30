const fs = require("fs");
let code = fs.readFileSync("src/utils/exportExcel.js", "utf8");

// Fix addPlanSheet
const search1 = `      Object.keys(curPromoColors).forEach(cIdx => {
         const cell = row.getCell(parseInt(cIdx));
         cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + curPromoColors[cIdx].replace('#', '').toUpperCase() } };
      });
      
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {`;

const replace1 = `      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {`;

const search2 = `      if (!isNewGroup && cell.border && !cell.border.top) {
                cell.border = { ...cell.border, top: { style: 'thin' } };
            }
         }
      }
    });`;

const replace2 = `      if (!isNewGroup && cell.border && !cell.border.top) {
                cell.border = { ...cell.border, top: { style: 'thin' } };
            }
         }
      }
    });
    
    Object.keys(curPromoColors).forEach(cIdx => {
       const cell = row.getCell(parseInt(cIdx));
       cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + curPromoColors[cIdx].replace('#', '').toUpperCase() } };
    });`;

code = code.replace(search1, replace1);
code = code.replace(search2, replace2);

// Fix addSimplePlanSheet
const search3 = `    if (extEmp && typeof curPromoColors !== 'undefined') {
      Object.keys(curPromoColors).forEach(cIdx => {
         const cell = tr.getCell(parseInt(cIdx));
         const color = curPromoColors[cIdx].replace('#', '').toUpperCase();
         cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + color } };
      });
    }

    for (let c = 1; c <= totalCols; c++) {`;

const replace3 = `    for (let c = 1; c <= totalCols; c++) {`;

const search4 = `      if (nextEmp && isNextTransferred && c >= 8 && c <= 11) {
        if (getGradeLevel(nextEmp.nextGrade) > getGradeLevel(nextEmp.currentGrade)) {
          const rawColor = getPromotedBgColorCode(nextEmp.nextGrade);
          if (rawColor) {
             const colorCode = rawColor.replace('#', '').toUpperCase();
             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorCode } };
          }
        }
      }
    }`;

const replace4 = `      if (nextEmp && isNextTransferred && c >= 8 && c <= 11) {
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
    }`;

code = code.replace(search3, replace3);
code = code.replace(search4, replace4);

fs.writeFileSync("src/utils/exportExcel.js", code, "utf8");
console.log("Done");