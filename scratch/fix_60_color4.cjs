const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const target = `const grade = isNextYear ? (emp.nextGrade !== undefined && emp.nextGrade !== null ? emp.nextGrade : emp.currentGrade) : emp.currentGrade;
          const bgRaw = getPromotedBgColorCode(grade);`;

const replacement = `const ageOffset = isNextYear ? 1 : 2;
          const age = (targetYear - ageOffset) - y;
          let bgRaw = null;
          if (isNextYear && age >= 60) {
            // 来年度60歳以上になる人は役職定年などで級が外れるため色なし
            bgRaw = ''; 
          } else {
            const grade = isNextYear ? (emp.nextGrade !== undefined && emp.nextGrade !== null ? emp.nextGrade : emp.currentGrade) : emp.currentGrade;
            bgRaw = getPromotedBgColorCode(grade);
          }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/utils/exportExcel.js', code, 'utf8');
  console.log("Replaced successfully.");
} else {
  console.log("Target string not found!");
}