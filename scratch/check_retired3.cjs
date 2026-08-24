const fs = require('fs');
const code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');
const lines = code.split('\n');
let addPlanStart = -1;
let simplePlanStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const addPlanSheet')) addPlanStart = i;
  if (lines[i].includes('export const addSimplePlanSheet')) simplePlanStart = i;
}
console.log(`addPlan: ${addPlanStart}, simplePlan: ${simplePlanStart}`);
for (let i = addPlanStart; i < simplePlanStart; i++) {
  if (lines[i].includes('fill')) {
    console.log(lines[i].trim());
  }
}