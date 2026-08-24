const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// Replace the color logic in addBirthYearSheet
const target = `const grade = isNextYear ? (emp.nextGrade || emp.currentGrade) : emp.currentGrade;
            const bgRaw = getPromotedBgColorCode(grade);`;

const replacement = `let bgRaw = null;
          const ageOffset = isNextYear ? 1 : 2;
          const age = (targetYear - ageOffset) - y;
          if (age >= 60) {
            bgRaw = '#d9d9d9'; // 退職（60歳以上）はグレー
          } else {
            const grade = isNextYear ? (emp.nextGrade !== undefined && emp.nextGrade !== null && emp.nextGrade !== "" ? emp.nextGrade : emp.currentGrade) : emp.currentGrade;
            bgRaw = getPromotedBgColorCode(grade);
          }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/utils/exportExcel.js', code, 'utf8');
  console.log("Replaced successfully.");
} else {
  console.log("Target string not found!");
}