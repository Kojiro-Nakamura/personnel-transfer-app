import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

const t = `import { cx, getGradeLevel, isPromotedGrade, getPromotedBgClass, getPromotedBgColorCode, calculateAge, parseJapaneseDate, parseCSVRow, getPairs, getCounts, formatCountText, generateGradeSummary, filterDirects, calcNextSkills, calcOrder, clearPlacement, createMoveProps, downloadFile, traverseOrgTree, getPlacementName, getEraFormattedYear } from '../../utils/helpers.js';`;
const r = `import { cx, getGradeLevel, isPromotedGrade, getPromotedBgClass, getPromotedBorderClass, getPromotedBgColorCode, calculateAge, parseJapaneseDate, parseCSVRow, getPairs, getCounts, formatCountText, generateGradeSummary, filterDirects, calcNextSkills, calcOrder, clearPlacement, createMoveProps, downloadFile, traverseOrgTree, getPlacementName, getEraFormattedYear } from '../../utils/helpers.js';`;

let replaced = false;
if (content.includes(t)) {
  content = content.replace(t, r);
  replaced = true;
} else if (content.includes(t.replace(/\n/g, '\r\n'))) {
  content = content.replace(t.replace(/\n/g, '\r\n'), r.replace(/\n/g, '\r\n'));
  replaced = true;
}

if (!replaced) {
  console.log('Failed to patch EmployeeComponents.jsx imports');
  process.exit(1);
}

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
console.log('Successfully patched EmployeeComponents.jsx imports');
