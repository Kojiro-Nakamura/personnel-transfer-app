const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// Find the start and end of addPlanSheet
const startIdx = code.indexOf('export const addPlanSheet = ');
const endIdx = code.indexOf('export const addSimplePlanSheet = ');

let planCode = code.substring(startIdx, endIdx);

// Now we transform planCode into simplePlanCode

// 1. Rename
planCode = planCode.replace('export const addPlanSheet = ', 'export const addSimplePlanSheet = ');

// 2. Remove History
planCode = planCode.replace(/const allHistoryYears = new Set\(\);\n[\s\S]*?const historyYears = Array\.from\(allHistoryYears\)\.sort\(\(a, b\) => a - b\);\n/, "");
planCode = planCode.replace(/historyYears/g, "[]"); // This will break if it uses historyYears.length, so let's be careful.

// We don't want to use Regex for complex replacements. I will write a custom string replacement script.
