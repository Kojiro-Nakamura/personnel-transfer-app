const fs = require("fs");
let code = fs.readFileSync("src/utils/exportExcel.js", "utf8");

const search1 = `      if (isPromotedThisYear) {
         const c = getPromotedBgColorCode(extEmp.nextGrade);
         if (c) {
             curPromoColors[14] = c; // 氏名
             curPromoColors[15] = c; // 年齢
             curPromoColors[34] = c; // 来年度
         }
      }`;

const replace1 = `      if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade)) {
         const c = getPromotedBgColorCode(extEmp.nextGrade);
         if (c) {
             curPromoColors[14] = c; // 氏名
             curPromoColors[15] = c; // 年齢
             curPromoColors[34] = c; // 来年度
         }
      }`;

code = code.replace(search1, replace1);

fs.writeFileSync("src/utils/exportExcel.js", code, "utf8");
console.log("Done");